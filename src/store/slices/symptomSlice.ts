import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { symptomsAPI } from '../../services/api';

// Types
export interface SymptomLog {
  _id: string;
  userId: string;
  symptomName: string;
  category: 'physical' | 'mental' | 'emotional' | 'cognitive' | 'sleep' | 'digestive' | 'other';
  severity: number;
  impact: {
    daily_activities: number;
    work_productivity: number;
    social_interactions: number;
    sleep_quality: number;
  };
  duration: number;
  frequency: 'first-time' | 'rarely' | 'sometimes' | 'often' | 'daily' | 'constant';
  onset: 'sudden' | 'gradual' | 'unknown';
  description: string;
  notes?: string;
  attachments?: string[];
  context: {
    weather?: {
      temperature: number;
      humidity: number;
      pressure: number;
      conditions: string;
    };
    location?: {
      type: 'home' | 'work' | 'outdoor' | 'travel' | 'other';
      coordinates?: {
        latitude: number;
        longitude: number;
      };
    };
    activity?: {
      type: 'resting' | 'working' | 'exercising' | 'eating' | 'sleeping' | 'other';
      intensity?: 'low' | 'moderate' | 'high';
    };
    mood?: {
      stress: number;
      anxiety: number;
      happiness: number;
      energy: number;
    };
    lifestyle?: {
      sleepHours?: number;
      mealsToday?: number;
      waterIntake?: number;
      exerciseMinutes?: number;
      medicationTaken?: boolean;
    };
  };
  analysis: {
    aiSuggestions?: string[];
    patternRecognition?: {
      frequency: 'rare' | 'occasional' | 'frequent' | 'chronic';
      triggers: string[];
      correlations: string[];
      recommendations: string[];
    };
    severity_trend?: 'improving' | 'stable' | 'worsening' | 'unknown';
    riskLevel?: 'low' | 'moderate' | 'high' | 'urgent';
    lastAnalyzed?: Date;
  };
  tags: string[];
  linkedSymptoms: string[];
  followUpRequired: boolean;
  resolved: boolean;
  resolvedAt?: Date;
  loggedAt: Date;
  updatedAt: Date;
  source: 'manual' | 'voice' | 'automated' | 'import';
  deviceInfo?: {
    platform: string;
    version: string;
    userAgent?: string;
  };
}

export interface SymptomAnalytics {
  totalLogs: number;
  averageSeverity: number;
  categoryBreakdown: Record<string, number>;
  severityDistribution: {
    mild: number;
    moderate: number;
    severe: number;
  };
  frequencyAnalysis: Record<string, number>;
  trendData: Array<{
    date: string;
    count: number;
    averageSeverity: number;
  }>;
  mostCommonSymptoms: Array<{
    name: string;
    count: number;
  }>;
  riskAssessment: {
    low: number;
    moderate: number;
    high: number;
    urgent: number;
  };
}

export interface SymptomInsights {
  patterns: string[];
  recommendations: string[];
  alerts: string[];
  trends: {
    improving: string[];
    worsening: string[];
    stable: string[];
  };
}

export interface SymptomState {
  symptoms: SymptomLog[];
  currentSymptom: SymptomLog | null;
  analytics: SymptomAnalytics | null;
  insights: SymptomInsights | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  message: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: {
    category?: string;
    severity?: number;
    dateFrom?: Date;
    dateTo?: Date;
    resolved?: boolean;
    search?: string;
  };
}

export interface CreateSymptomData {
  symptomName: string;
  category: string;
  severity: number;
  impact: {
    daily_activities: number;
    work_productivity: number;
    social_interactions: number;
    sleep_quality: number;
  };
  duration: number;
  frequency: string;
  onset?: string;
  description: string;
  notes?: string;
  context?: any;
  tags?: string[];
  source?: string;
}

// Initial state
const initialState: SymptomState = {
  symptoms: [],
  currentSymptom: null,
  analytics: null,
  insights: null,
  isLoading: false,
  isSubmitting: false,
  error: null,
  message: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
    hasNext: false,
    hasPrev: false,
  },
  filters: {},
};

// Async thunks
export const createSymptom = createAsyncThunk(
  'symptoms/create',
  async (symptomData: CreateSymptomData, { rejectWithValue }) => {
    try {
      const response = await symptomsAPI.create(symptomData);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || error.message || 'Failed to create symptom';
      return rejectWithValue(message);
    }
  }
);

export const getSymptoms = createAsyncThunk(
  'symptoms/getAll',
  async (params: { page?: number; limit?: number; [key: string]: any } = {}, { rejectWithValue }) => {
    try {
      const response = await symptomsAPI.getAll(params);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || error.message || 'Failed to fetch symptoms';
      return rejectWithValue(message);
    }
  }
);

export const getSymptomById = createAsyncThunk(
  'symptoms/getById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await symptomsAPI.getById(id);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || error.message || 'Failed to fetch symptom';
      return rejectWithValue(message);
    }
  }
);

export const updateSymptom = createAsyncThunk(
  'symptoms/update',
  async ({ id, symptomData }: { id: string; symptomData: Partial<SymptomLog> }, { rejectWithValue }) => {
    try {
      const response = await symptomsAPI.update(id, symptomData);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || error.message || 'Failed to update symptom';
      return rejectWithValue(message);
    }
  }
);

export const deleteSymptom = createAsyncThunk(
  'symptoms/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await symptomsAPI.delete(id);
      return id;
    } catch (error: any) {
      const message = error.response?.data?.error || error.message || 'Failed to delete symptom';
      return rejectWithValue(message);
    }
  }
);

export const getSymptomAnalytics = createAsyncThunk(
  'symptoms/analytics',
  async (period: string = '30', { rejectWithValue }) => {
    try {
      const response = await symptomsAPI.getAnalytics(period);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || error.message || 'Failed to fetch analytics';
      return rejectWithValue(message);
    }
  }
);

export const getSymptomInsights = createAsyncThunk(
  'symptoms/insights',
  async (_, { rejectWithValue }) => {
    try {
      const response = await symptomsAPI.getInsights();
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || error.message || 'Failed to fetch insights';
      return rejectWithValue(message);
    }
  }
);

// Symptom slice
const symptomSlice = createSlice({
  name: 'symptoms',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearMessage: (state) => {
      state.message = null;
    },
    setCurrentSymptom: (state, action: PayloadAction<SymptomLog | null>) => {
      state.currentSymptom = action.payload;
    },
    updateFilters: (state, action: PayloadAction<Partial<SymptomState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    markSymptomResolved: (state, action: PayloadAction<string>) => {
      const symptom = state.symptoms.find(s => s._id === action.payload);
      if (symptom) {
        symptom.resolved = true;
        symptom.resolvedAt = new Date();
      }
    },
    addTag: (state, action: PayloadAction<{ symptomId: string; tag: string }>) => {
      const symptom = state.symptoms.find(s => s._id === action.payload.symptomId);
      if (symptom && !symptom.tags.includes(action.payload.tag)) {
        symptom.tags.push(action.payload.tag);
      }
    },
    removeTag: (state, action: PayloadAction<{ symptomId: string; tag: string }>) => {
      const symptom = state.symptoms.find(s => s._id === action.payload.symptomId);
      if (symptom) {
        symptom.tags = symptom.tags.filter(tag => tag !== action.payload.tag);
      }
    },
  },
  extraReducers: (builder) => {
    // Create symptom
    builder
      .addCase(createSymptom.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
        state.message = null;
      })
      .addCase(createSymptom.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.symptoms.unshift(action.payload.data.symptomLog);
        state.message = 'Symptom logged successfully!';
      })
      .addCase(createSymptom.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      });

    // Get symptoms
    builder
      .addCase(getSymptoms.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getSymptoms.fulfilled, (state, action) => {
        state.isLoading = false;
        state.symptoms = action.payload.data.symptoms;
        state.pagination = action.payload.pagination;
      })
      .addCase(getSymptoms.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Get symptom by ID
    builder
      .addCase(getSymptomById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getSymptomById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentSymptom = action.payload.data.symptom;
      })
      .addCase(getSymptomById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update symptom
    builder
      .addCase(updateSymptom.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(updateSymptom.fulfilled, (state, action) => {
        state.isSubmitting = false;
        const index = state.symptoms.findIndex(s => s._id === action.payload.data.symptom._id);
        if (index !== -1) {
          state.symptoms[index] = action.payload.data.symptom;
        }
        if (state.currentSymptom?._id === action.payload.data.symptom._id) {
          state.currentSymptom = action.payload.data.symptom;
        }
        state.message = 'Symptom updated successfully!';
      })
      .addCase(updateSymptom.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      });

    // Delete symptom
    builder
      .addCase(deleteSymptom.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(deleteSymptom.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.symptoms = state.symptoms.filter(s => s._id !== action.payload);
        if (state.currentSymptom?._id === action.payload) {
          state.currentSymptom = null;
        }
        state.message = 'Symptom deleted successfully!';
      })
      .addCase(deleteSymptom.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      });

    // Get analytics
    builder
      .addCase(getSymptomAnalytics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getSymptomAnalytics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.analytics = action.payload.data.analytics;
      })
      .addCase(getSymptomAnalytics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Get insights
    builder
      .addCase(getSymptomInsights.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getSymptomInsights.fulfilled, (state, action) => {
        state.isLoading = false;
        state.insights = action.payload.data.insights;
      })
      .addCase(getSymptomInsights.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearError,
  clearMessage,
  setCurrentSymptom,
  updateFilters,
  clearFilters,
  markSymptomResolved,
  addTag,
  removeTag,
} = symptomSlice.actions;

export default symptomSlice.reducer;