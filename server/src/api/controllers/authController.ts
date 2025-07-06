import { Request, Response, NextFunction } from 'express';
import User, { IUser } from '../models/user.model';
import { config } from '../../config/config';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Interfaces
interface AuthRequest extends Request {
  user?: IUser;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  healthProfile?: {
    dateOfBirth?: Date;
    gender?: string;
    height?: number;
    weight?: number;
  };
}

interface LoginData {
  email: string;
  password: string;
}

// Helper function to send token response
const sendTokenResponse = (user: IUser, statusCode: number, res: Response): void => {
  // Create token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(Date.now() + config.jwtCookieExpire * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: 'lax' as const
  };

  // Remove password from output
  const userObj = user.toObject();
  delete userObj.passwordHash;

  res.status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      data: {
        user: userObj
      }
    });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      healthProfile
    }: RegisterData = req.body;

    // Validation
    if (!firstName || !lastName || !email || !password) {
      res.status(400).json({
        success: false,
        error: 'Please provide all required fields'
      });
      return;
    }

    if (password !== confirmPassword) {
      res.status(400).json({
        success: false,
        error: 'Passwords do not match'
      });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters'
      });
      return;
    }

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(400).json({
        success: false,
        error: 'User already exists with this email'
      });
      return;
    }

    // Create user
    const user = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      passwordHash: password,
      healthProfile: healthProfile || {},
      lastLogin: new Date()
    });

    // Award registration XP
    user.addXP(100);
    await user.save();

    sendTokenResponse(user, 201, res);
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during registration'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password }: LoginData = req.body;

    // Validate email & password
    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: 'Please provide an email and password'
      });
      return;
    }

    // Check for user (include password for comparison)
    const user = await User.findOne({ email: email.toLowerCase() })
      .select('+passwordHash')
      .populate('familyMembers', 'firstName lastName avatar healthProfile.dateOfBirth');

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
      return;
    }

    if (!user.isActive) {
      res.status(401).json({
        success: false,
        error: 'Account is deactivated. Please contact support.'
      });
      return;
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
      return;
    }

    // Update last login
    user.lastLogin = new Date();
    
    // Award daily login XP (if not already logged in today)
    const today = new Date();
    const lastLogin = user.lastLogin || new Date(0);
    const isFirstLoginToday = today.toDateString() !== lastLogin.toDateString();
    
    if (isFirstLoginToday) {
      user.addXP(10);
    }

    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during login'
    });
  }
};

// @desc    Log user out / clear cookie
// @route   GET /api/auth/logout
// @access  Private
export const logoutUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    data: 'User logged out successfully'
  });
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id)
      .populate('familyMembers', 'firstName lastName avatar healthProfile.dateOfBirth gamification.level');

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching user'
    });
  }
};

// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
export const updateDetails = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const fieldsToUpdate: Partial<IUser> = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      healthProfile: req.body.healthProfile,
      preferences: req.body.preferences
    };

    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(key => {
      if (fieldsToUpdate[key as keyof typeof fieldsToUpdate] === undefined) {
        delete fieldsToUpdate[key as keyof typeof fieldsToUpdate];
      }
    });

    const user = await User.findByIdAndUpdate(req.user?.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error updating user'
    });
  }
};

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
export const updatePassword = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      res.status(400).json({
        success: false,
        error: 'Please provide current password, new password, and confirmation'
      });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      res.status(400).json({
        success: false,
        error: 'New passwords do not match'
      });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({
        success: false,
        error: 'New password must be at least 6 characters'
      });
      return;
    }

    const user = await User.findById(req.user?.id).select('+passwordHash');

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      });
      return;
    }

    // Check current password
    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) {
      res.status(400).json({
        success: false,
        error: 'Current password is incorrect'
      });
      return;
    }

    user.passwordHash = newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error updating password'
    });
  }
};

// @desc    Delete account
// @route   DELETE /api/auth/deleteaccount
// @access  Private
export const deleteAccount = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { password } = req.body;

    if (!password) {
      res.status(400).json({
        success: false,
        error: 'Please provide your password to confirm account deletion'
      });
      return;
    }

    const user = await User.findById(req.user?.id).select('+passwordHash');

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      });
      return;
    }

    // Verify password
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      res.status(400).json({
        success: false,
        error: 'Password is incorrect'
      });
      return;
    }

    // Soft delete - just deactivate the account
    user.isActive = false;
    await user.save();

    res.status(200).json({
      success: true,
      data: 'Account has been deactivated successfully'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error deleting account'
    });
  }
};

// @desc    Add family member
// @route   POST /api/auth/family/add
// @access  Private
export const addFamilyMember = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({
        success: false,
        error: 'Please provide family member email'
      });
      return;
    }

    const user = await User.findById(req.user?.id);
    const familyMember = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      });
      return;
    }

    if (!familyMember) {
      res.status(404).json({
        success: false,
        error: 'Family member not found'
      });
      return;
    }

    if (user._id.equals(familyMember._id)) {
      res.status(400).json({
        success: false,
        error: 'Cannot add yourself as a family member'
      });
      return;
    }

    if (user.familyMembers.includes(familyMember._id)) {
      res.status(400).json({
        success: false,
        error: 'User is already a family member'
      });
      return;
    }

    // Add both ways
    user.familyMembers.push(familyMember._id);
    familyMember.familyMembers.push(user._id);

    await Promise.all([user.save(), familyMember.save()]);

    res.status(200).json({
      success: true,
      data: 'Family member added successfully'
    });
  } catch (error) {
    console.error('Add family member error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error adding family member'
    });
  }
};