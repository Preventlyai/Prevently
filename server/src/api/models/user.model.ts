import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../../config/config';

// Interfaces
export interface IHealthProfile {
  height?: number; // in cm
  weight?: number; // in kg
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  bloodType?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  allergies?: string[];
  medications?: string[];
  chronicConditions?: string[];
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
    email?: string;
  };
}

export interface IUserPreferences {
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    reminderTimes: string[];
  };
  privacy: {
    shareWithFamily: boolean;
    shareWithDoctors: boolean;
    dataExport: boolean;
  };
  accessibility: {
    darkMode: boolean;
    reducedMotion: boolean;
    fontSize: 'small' | 'medium' | 'large';
    highContrast: boolean;
  };
  ai: {
    personalizedTips: boolean;
    voiceInteraction: boolean;
    predictiveAnalytics: boolean;
  };
}

export interface IGameification {
  level: number;
  xp: number;
  totalXp: number;
  streaks: {
    current: number;
    longest: number;
    lastActivity: Date;
  };
  achievements: string[];
  badges: string[];
}

export interface IUser extends Document {
  // Basic Information
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  
  // Health Profile
  healthProfile: IHealthProfile;
  
  // User Preferences
  preferences: IUserPreferences;
  
  // Gamification
  gamification: IGameification;
  
  // Family & Social
  familyMembers: mongoose.Types.ObjectId[];
  familyRole: 'parent' | 'child' | 'spouse' | 'guardian' | 'other';
  
  // Account Management
  isActive: boolean;
  isVerified: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Premium Features
  subscriptionStatus: 'free' | 'premium' | 'family';
  subscriptionExpiry?: Date;
  
  // Methods
  matchPassword(enteredPassword: string): Promise<boolean>;
  getSignedJwtToken(): string;
  calculateAge(): number | null;
  getBMI(): number | null;
  addXP(points: number): void;
}

// Health Profile Schema
const HealthProfileSchema = new Schema<IHealthProfile>({
  height: { type: Number, min: 50, max: 300 },
  weight: { type: Number, min: 1, max: 1000 },
  dateOfBirth: { type: Date },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer-not-to-say']
  },
  bloodType: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  allergies: [{ type: String }],
  medications: [{ type: String }],
  chronicConditions: [{ type: String }],
  emergencyContact: {
    name: { type: String },
    relationship: { type: String },
    phone: { type: String },
    email: { type: String }
  }
}, { _id: false });

// User Preferences Schema
const UserPreferencesSchema = new Schema<IUserPreferences>({
  notifications: {
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
    sms: { type: Boolean, default: false },
    reminderTimes: [{ type: String, default: ['09:00', '13:00', '18:00'] }]
  },
  privacy: {
    shareWithFamily: { type: Boolean, default: true },
    shareWithDoctors: { type: Boolean, default: false },
    dataExport: { type: Boolean, default: true }
  },
  accessibility: {
    darkMode: { type: Boolean, default: false },
    reducedMotion: { type: Boolean, default: false },
    fontSize: { type: String, enum: ['small', 'medium', 'large'], default: 'medium' },
    highContrast: { type: Boolean, default: false }
  },
  ai: {
    personalizedTips: { type: Boolean, default: true },
    voiceInteraction: { type: Boolean, default: false },
    predictiveAnalytics: { type: Boolean, default: true }
  }
}, { _id: false });

// Gamification Schema
const GamificationSchema = new Schema<IGameification>({
  level: { type: Number, default: 1 },
  xp: { type: Number, default: 0 },
  totalXp: { type: Number, default: 0 },
  streaks: {
    current: { type: Number, default: 0 },
    longest: { type: Number, default: 0 },
    lastActivity: { type: Date, default: Date.now }
  },
  achievements: [{ type: String }],
  badges: [{ type: String }]
}, { _id: false });

// Main User Schema
const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  passwordHash: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false
  },
  firstName: {
    type: String,
    required: [true, 'Please add a first name'],
    maxlength: [50, 'First name can not be more than 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Please add a last name'],
    maxlength: [50, 'Last name can not be more than 50 characters']
  },
  avatar: {
    type: String,
    default: ''
  },
  healthProfile: {
    type: HealthProfileSchema,
    default: () => ({})
  },
  preferences: {
    type: UserPreferencesSchema,
    default: () => ({})
  },
  gamification: {
    type: GamificationSchema,
    default: () => ({})
  },
  familyMembers: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  familyRole: {
    type: String,
    enum: ['parent', 'child', 'spouse', 'guardian', 'other'],
    default: 'other'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date
  },
  subscriptionStatus: {
    type: String,
    enum: ['free', 'premium', 'family'],
    default: 'free'
  },
  subscriptionExpiry: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Encrypt password using bcrypt
UserSchema.pre('save', async function(next) {
  if (!this.isModified('passwordHash')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function(): string {
  return jwt.sign({ id: this._id }, config.jwtSecret, {
    expiresIn: config.jwtExpire
  });
};

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function(enteredPassword: string): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

// Calculate age from date of birth
UserSchema.methods.calculateAge = function(): number | null {
  if (!this.healthProfile.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.healthProfile.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

// Calculate BMI
UserSchema.methods.getBMI = function(): number | null {
  const { height, weight } = this.healthProfile;
  if (!height || !weight) return null;
  const heightInM = height / 100;
  return Math.round((weight / (heightInM * heightInM)) * 10) / 10;
};

// Add XP and handle level progression
UserSchema.methods.addXP = function(points: number): void {
  this.gamification.xp += points;
  this.gamification.totalXp += points;
  
  // Simple level calculation (every 1000 XP = 1 level)
  const newLevel = Math.floor(this.gamification.totalXp / 1000) + 1;
  if (newLevel > this.gamification.level) {
    this.gamification.level = newLevel;
    // Could trigger level up achievements here
  }
};

// Virtual for full name
UserSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Index for performance
UserSchema.index({ email: 1 });
UserSchema.index({ familyMembers: 1 });
UserSchema.index({ 'gamification.level': -1 });

export default mongoose.model<IUser>('User', UserSchema);