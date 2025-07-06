import mongoose, { Document, Schema } from 'mongoose';

// Interfaces
export interface ISymptomContext {
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
    stress: number; // 1-10 scale
    anxiety: number; // 1-10 scale
    happiness: number; // 1-10 scale
    energy: number; // 1-10 scale
  };
  lifestyle?: {
    sleepHours?: number;
    mealsToday?: number;
    waterIntake?: number; // in ml
    exerciseMinutes?: number;
    medicationTaken?: boolean;
  };
}

export interface ISymptomAnalysis {
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
}

export interface ISymptomLog extends Document {
  // Basic Information
  userId: mongoose.Types.ObjectId;
  symptomName: string;
  category: 'physical' | 'mental' | 'emotional' | 'cognitive' | 'sleep' | 'digestive' | 'other';
  
  // Severity and Impact
  severity: number; // 1-10 scale
  impact: {
    daily_activities: number; // 1-10 scale
    work_productivity: number; // 1-10 scale
    social_interactions: number; // 1-10 scale
    sleep_quality: number; // 1-10 scale
  };
  
  // Duration and Frequency
  duration: number; // in minutes
  frequency: 'first-time' | 'rarely' | 'sometimes' | 'often' | 'daily' | 'constant';
  onset: 'sudden' | 'gradual' | 'unknown';
  
  // Detailed Description
  description: string;
  notes?: string;
  attachments?: string[]; // URLs to images, audio recordings, etc.
  
  // Context and Environment
  context: ISymptomContext;
  
  // AI Analysis
  analysis: ISymptomAnalysis;
  
  // Tracking and Management
  tags: string[];
  linkedSymptoms: mongoose.Types.ObjectId[]; // Related symptoms logged together
  followUpRequired: boolean;
  resolved: boolean;
  resolvedAt?: Date;
  
  // Metadata
  loggedAt: Date;
  updatedAt: Date;
  source: 'manual' | 'voice' | 'automated' | 'import';
  deviceInfo?: {
    platform: string;
    version: string;
    userAgent?: string;
  };
}

// Context Schema
const SymptomContextSchema = new Schema<ISymptomContext>({
  weather: {
    temperature: { type: Number },
    humidity: { type: Number },
    pressure: { type: Number },
    conditions: { type: String }
  },
  location: {
    type: {
      type: String,
      enum: ['home', 'work', 'outdoor', 'travel', 'other']
    },
    coordinates: {
      latitude: { type: Number },
      longitude: { type: Number }
    }
  },
  activity: {
    type: {
      type: String,
      enum: ['resting', 'working', 'exercising', 'eating', 'sleeping', 'other']
    },
    intensity: {
      type: String,
      enum: ['low', 'moderate', 'high']
    }
  },
  mood: {
    stress: { type: Number, min: 1, max: 10 },
    anxiety: { type: Number, min: 1, max: 10 },
    happiness: { type: Number, min: 1, max: 10 },
    energy: { type: Number, min: 1, max: 10 }
  },
  lifestyle: {
    sleepHours: { type: Number, min: 0, max: 24 },
    mealsToday: { type: Number, min: 0, max: 10 },
    waterIntake: { type: Number, min: 0 },
    exerciseMinutes: { type: Number, min: 0 },
    medicationTaken: { type: Boolean }
  }
}, { _id: false });

// Analysis Schema
const SymptomAnalysisSchema = new Schema<ISymptomAnalysis>({
  aiSuggestions: [{ type: String }],
  patternRecognition: {
    frequency: {
      type: String,
      enum: ['rare', 'occasional', 'frequent', 'chronic']
    },
    triggers: [{ type: String }],
    correlations: [{ type: String }],
    recommendations: [{ type: String }]
  },
  severity_trend: {
    type: String,
    enum: ['improving', 'stable', 'worsening', 'unknown']
  },
  riskLevel: {
    type: String,
    enum: ['low', 'moderate', 'high', 'urgent']
  },
  lastAnalyzed: { type: Date }
}, { _id: false });

// Impact Schema
const ImpactSchema = new Schema({
  daily_activities: { type: Number, required: true, min: 1, max: 10 },
  work_productivity: { type: Number, required: true, min: 1, max: 10 },
  social_interactions: { type: Number, required: true, min: 1, max: 10 },
  sleep_quality: { type: Number, required: true, min: 1, max: 10 }
}, { _id: false });

// Device Info Schema
const DeviceInfoSchema = new Schema({
  platform: { type: String, required: true },
  version: { type: String, required: true },
  userAgent: { type: String }
}, { _id: false });

// Main Symptom Log Schema
const SymptomLogSchema = new Schema<ISymptomLog>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  symptomName: {
    type: String,
    required: [true, 'Symptom name is required'],
    trim: true,
    maxlength: [100, 'Symptom name cannot be more than 100 characters']
  },
  category: {
    type: String,
    required: [true, 'Symptom category is required'],
    enum: ['physical', 'mental', 'emotional', 'cognitive', 'sleep', 'digestive', 'other'],
    default: 'physical'
  },
  severity: {
    type: Number,
    required: [true, 'Severity is required'],
    min: [1, 'Severity must be between 1 and 10'],
    max: [10, 'Severity must be between 1 and 10']
  },
  impact: {
    type: ImpactSchema,
    required: true
  },
  duration: {
    type: Number,
    required: [true, 'Duration is required'],
    min: [0, 'Duration must be positive']
  },
  frequency: {
    type: String,
    required: [true, 'Frequency is required'],
    enum: ['first-time', 'rarely', 'sometimes', 'often', 'daily', 'constant']
  },
  onset: {
    type: String,
    enum: ['sudden', 'gradual', 'unknown'],
    default: 'unknown'
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot be more than 500 characters']
  },
  attachments: [{ type: String }],
  context: {
    type: SymptomContextSchema,
    default: () => ({})
  },
  analysis: {
    type: SymptomAnalysisSchema,
    default: () => ({})
  },
  tags: [{ 
    type: String,
    trim: true,
    lowercase: true
  }],
  linkedSymptoms: [{
    type: Schema.Types.ObjectId,
    ref: 'SymptomLog'
  }],
  followUpRequired: {
    type: Boolean,
    default: false
  },
  resolved: {
    type: Boolean,
    default: false
  },
  resolvedAt: {
    type: Date
  },
  loggedAt: {
    type: Date,
    default: Date.now
  },
  source: {
    type: String,
    enum: ['manual', 'voice', 'automated', 'import'],
    default: 'manual'
  },
  deviceInfo: {
    type: DeviceInfoSchema
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Middleware to automatically resolve symptoms based on duration
SymptomLogSchema.pre('save', function(next) {
  if (this.resolved && !this.resolvedAt) {
    this.resolvedAt = new Date();
  }
  next();
});

// Virtual for age of symptom log
SymptomLogSchema.virtual('ageInDays').get(function() {
  return Math.floor((Date.now() - this.loggedAt.getTime()) / (1000 * 60 * 60 * 24));
});

// Virtual for overall impact score
SymptomLogSchema.virtual('overallImpact').get(function() {
  const { daily_activities, work_productivity, social_interactions, sleep_quality } = this.impact;
  return Math.round((daily_activities + work_productivity + social_interactions + sleep_quality) / 4);
});

// Static method to get symptoms by severity range
SymptomLogSchema.statics.getBySeverityRange = function(userId: string, minSeverity: number, maxSeverity: number) {
  return this.find({
    userId,
    severity: { $gte: minSeverity, $lte: maxSeverity }
  }).sort({ loggedAt: -1 });
};

// Static method to get trending symptoms
SymptomLogSchema.statics.getTrendingSymptoms = function(userId: string, days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
    {
      $match: {
        userId: mongoose.Types.ObjectId(userId),
        loggedAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$symptomName',
        count: { $sum: 1 },
        avgSeverity: { $avg: '$severity' },
        lastOccurrence: { $max: '$loggedAt' }
      }
    },
    {
      $sort: { count: -1, avgSeverity: -1 }
    },
    {
      $limit: 10
    }
  ]);
};

// Indexes for performance
SymptomLogSchema.index({ userId: 1, loggedAt: -1 });
SymptomLogSchema.index({ userId: 1, symptomName: 1 });
SymptomLogSchema.index({ userId: 1, severity: -1 });
SymptomLogSchema.index({ userId: 1, category: 1 });
SymptomLogSchema.index({ tags: 1 });
SymptomLogSchema.index({ 'analysis.riskLevel': 1 });

export default mongoose.model<ISymptomLog>('SymptomLog', SymptomLogSchema);