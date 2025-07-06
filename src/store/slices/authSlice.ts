import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiService } from '../../services/api';

// Types
export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  healthProfile: {
    height?: number;
    weight?: number;
    dateOfBirth?: Date;
    gender?: string;
    bloodType?: string;
    allergies?: string[];
    medications?: string[];
    chronicConditions?: string[];
    emergencyContact?: {
      name: string;
      relationship: string;
      phone: string;
      email?: string;
    };
  };
  preferences: {
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
      fontSize: string;
      highContrast: boolean;
    };
    ai: {
      personalizedTips: boolean;
      voiceInteraction: boolean;
      predictiveAnalytics: boolean;
    };
  };
  gamification: {
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
  };
  familyMembers: User[];
  familyRole: string;
  subscriptionStatus: 'free' | 'premium' | 'family';
  subscriptionExpiry?: Date;
  isActive: boolean;
  isVerified: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  message: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
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

// Initial state
const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  isLoading: false,
  isAuthenticated: false,
  error: null,
  message: null,
};

// Async thunks
export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData: RegisterData, { rejectWithValue }) => {
    try {
      const response = await apiService.post('/auth/register', userData);
      
      // Store token in localStorage
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || error.message || 'Registration failed';
      return rejectWithValue(message);
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await apiService.post('/auth/login', credentials);
      
      // Store token in localStorage
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || error.message || 'Login failed';
      return rejectWithValue(message);
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.get('/auth/me');
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || error.message || 'Failed to get user data';
      return rejectWithValue(message);
    }
  }
);

export const updateUserDetails = createAsyncThunk(
  'auth/updateDetails',
  async (userData: Partial<User>, { rejectWithValue }) => {
    try {
      const response = await apiService.put('/auth/updatedetails', userData);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || error.message || 'Update failed';
      return rejectWithValue(message);
    }
  }
);

export const updatePassword = createAsyncThunk(
  'auth/updatePassword',
  async (passwordData: { currentPassword: string; newPassword: string; confirmNewPassword: string }, { rejectWithValue }) => {
    try {
      const response = await apiService.put('/auth/updatepassword', passwordData);
      
      // Update token in localStorage
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || error.message || 'Password update failed';
      return rejectWithValue(message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await apiService.get('/auth/logout');
      localStorage.removeItem('token');
      return null;
    } catch (error: any) {
      // Even if the API call fails, we still want to logout locally
      localStorage.removeItem('token');
      return null;
    }
  }
);

export const addFamilyMember = createAsyncThunk(
  'auth/addFamilyMember',
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await apiService.post('/auth/family/add', { email });
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || error.message || 'Failed to add family member';
      return rejectWithValue(message);
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearMessage: (state) => {
      state.message = null;
    },
    setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.error = null;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      state.message = null;
      localStorage.removeItem('token');
    },
    updateUserProfile: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.data.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.message = 'Registration successful! Welcome to Prevently!';
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      });

    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.data.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.message = 'Login successful! Welcome back!';
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      });

    // Get current user
    builder
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.data.user;
        state.isAuthenticated = true;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        localStorage.removeItem('token');
      });

    // Update user details
    builder
      .addCase(updateUserDetails.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.data.user;
        state.message = 'Profile updated successfully!';
      })
      .addCase(updateUserDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update password
    builder
      .addCase(updatePassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updatePassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.token;
        state.message = 'Password updated successfully!';
      })
      .addCase(updatePassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Logout
    builder
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
        state.message = 'Logged out successfully';
        state.isLoading = false;
      });

    // Add family member
    builder
      .addCase(addFamilyMember.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addFamilyMember.fulfilled, (state, action) => {
        state.isLoading = false;
        state.message = 'Family member added successfully!';
      })
      .addCase(addFamilyMember.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { 
  clearError, 
  clearMessage, 
  setCredentials, 
  logout, 
  updateUserProfile 
} = authSlice.actions;

export default authSlice.reducer;