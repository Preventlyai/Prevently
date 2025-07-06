import { Request, Response, NextFunction } from 'express';
import SymptomLog, { ISymptomLog } from '../models/symptomLog.model';
import User, { IUser } from '../models/user.model';
import moment from 'moment';

// Interfaces
interface AuthRequest extends Request {
  user?: IUser;
}

interface CreateSymptomData {
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

// AI Analysis helper function
const analyzeSymptom = async (symptom: ISymptomLog, userHistory: ISymptomLog[]): Promise<any> => {
  // This would integrate with OpenAI or other AI services
  // For now, we'll provide basic pattern recognition
  
  const similarSymptoms = userHistory.filter(log => 
    log.symptomName.toLowerCase() === symptom.symptomName.toLowerCase()
  );

  const analysis = {
    aiSuggestions: [],
    patternRecognition: {
      frequency: 'rare' as const,
      triggers: [] as string[],
      correlations: [] as string[],
      recommendations: [] as string[]
    },
    severity_trend: 'unknown' as const,
    riskLevel: 'low' as const,
    lastAnalyzed: new Date()
  };

  // Basic pattern recognition
  if (similarSymptoms.length > 0) {
    const recentSymptoms = similarSymptoms.filter(log => 
      moment(log.loggedAt).isAfter(moment().subtract(30, 'days'))
    );

    if (recentSymptoms.length >= 10) {
      analysis.patternRecognition.frequency = 'frequent';
    } else if (recentSymptoms.length >= 5) {
      analysis.patternRecognition.frequency = 'occasional';
    }

    // Severity trend analysis
    if (similarSymptoms.length >= 3) {
      const recentAvg = recentSymptoms.slice(0, 3).reduce((sum, s) => sum + s.severity, 0) / 3;
      const olderAvg = similarSymptoms.slice(3, 6).reduce((sum, s) => sum + s.severity, 0) / Math.max(1, similarSymptoms.slice(3, 6).length);
      
      if (recentAvg > olderAvg + 1) {
        analysis.severity_trend = 'worsening';
      } else if (recentAvg < olderAvg - 1) {
        analysis.severity_trend = 'improving';
      } else {
        analysis.severity_trend = 'stable';
      }
    }
  }

  // Risk level assessment
  if (symptom.severity >= 8) {
    analysis.riskLevel = 'high';
  } else if (symptom.severity >= 6) {
    analysis.riskLevel = 'moderate';
  }

  // Generate AI suggestions based on pattern
  if (analysis.patternRecognition.frequency === 'frequent') {
    analysis.aiSuggestions.push('Consider tracking environmental factors that might be triggering this symptom');
    analysis.aiSuggestions.push('Schedule a consultation with your healthcare provider to discuss recurring symptoms');
  }

  if (analysis.severity_trend === 'worsening') {
    analysis.aiSuggestions.push('Your symptoms appear to be getting worse. Consider seeking medical advice');
    analysis.riskLevel = 'moderate';
  }

  if (symptom.category === 'mental' && symptom.severity >= 7) {
    analysis.aiSuggestions.push('Consider mindfulness exercises or speaking with a mental health professional');
  }

  return analysis;
};

// @desc    Create new symptom log
// @route   POST /api/symptoms
// @access  Private
export const createSymptomLog = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const symptomData: CreateSymptomData = req.body;

    // Validation
    if (!symptomData.symptomName || !symptomData.severity || !symptomData.description) {
      res.status(400).json({
        success: false,
        error: 'Please provide symptom name, severity, and description'
      });
      return;
    }

    if (symptomData.severity < 1 || symptomData.severity > 10) {
      res.status(400).json({
        success: false,
        error: 'Severity must be between 1 and 10'
      });
      return;
    }

    // Get user's symptom history for AI analysis
    const userHistory = await SymptomLog.find({ userId })
      .sort({ loggedAt: -1 })
      .limit(50);

    // Create symptom log
    const symptomLog = await SymptomLog.create({
      ...symptomData,
      userId,
      deviceInfo: {
        platform: req.headers['user-agent'] || 'unknown',
        version: '1.0.0',
        userAgent: req.headers['user-agent']
      }
    });

    // Perform AI analysis
    const analysis = await analyzeSymptom(symptomLog, userHistory);
    symptomLog.analysis = analysis;
    await symptomLog.save();

    // Award XP to user for logging symptoms
    const user = await User.findById(userId);
    if (user) {
      user.addXP(25);
      await user.save();
    }

    await symptomLog.populate('linkedSymptoms');

    res.status(201).json({
      success: true,
      data: {
        symptomLog
      }
    });
  } catch (error) {
    console.error('Create symptom error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error creating symptom log'
    });
  }
};

// @desc    Get all symptom logs for user
// @route   GET /api/symptoms
// @access  Private
export const getSymptomLogsForUser = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const {
      page = 1,
      limit = 20,
      category,
      severity,
      dateFrom,
      dateTo,
      resolved,
      search
    } = req.query;

    // Build query
    const query: any = { userId };

    if (category) {
      query.category = category;
    }

    if (severity) {
      const severityNum = parseInt(severity as string);
      if (!isNaN(severityNum)) {
        query.severity = { $gte: severityNum };
      }
    }

    if (dateFrom || dateTo) {
      query.loggedAt = {};
      if (dateFrom) {
        query.loggedAt.$gte = new Date(dateFrom as string);
      }
      if (dateTo) {
        query.loggedAt.$lte = new Date(dateTo as string);
      }
    }

    if (resolved !== undefined) {
      query.resolved = resolved === 'true';
    }

    if (search) {
      query.$or = [
        { symptomName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } }
      ];
    }

    // Execute query with pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [symptoms, total] = await Promise.all([
      SymptomLog.find(query)
        .sort({ loggedAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('linkedSymptoms', 'symptomName severity loggedAt'),
      SymptomLog.countDocuments(query)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.status(200).json({
      success: true,
      count: symptoms.length,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: totalPages,
        hasNext: hasNextPage,
        hasPrev: hasPrevPage
      },
      data: {
        symptoms
      }
    });
  } catch (error) {
    console.error('Get symptoms error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching symptoms'
    });
  }
};

// @desc    Get single symptom log
// @route   GET /api/symptoms/:id
// @access  Private
export const getSymptomLogById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const symptom = await SymptomLog.findOne({ _id: id, userId })
      .populate('linkedSymptoms', 'symptomName severity loggedAt category');

    if (!symptom) {
      res.status(404).json({
        success: false,
        error: 'Symptom log not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        symptom
      }
    });
  } catch (error) {
    console.error('Get symptom error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching symptom'
    });
  }
};

// @desc    Update symptom log
// @route   PUT /api/symptoms/:id
// @access  Private
export const updateSymptomLog = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    let symptom = await SymptomLog.findOne({ _id: id, userId });

    if (!symptom) {
      res.status(404).json({
        success: false,
        error: 'Symptom log not found'
      });
      return;
    }

    // Update fields
    const allowedFields = [
      'symptomName', 'category', 'severity', 'impact', 'duration',
      'frequency', 'onset', 'description', 'notes', 'context',
      'tags', 'resolved', 'followUpRequired'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        (symptom as any)[field] = req.body[field];
      }
    });

    await symptom.save();

    res.status(200).json({
      success: true,
      data: {
        symptom
      }
    });
  } catch (error) {
    console.error('Update symptom error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error updating symptom'
    });
  }
};

// @desc    Delete symptom log
// @route   DELETE /api/symptoms/:id
// @access  Private
export const deleteSymptomLog = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const symptom = await SymptomLog.findOne({ _id: id, userId });

    if (!symptom) {
      res.status(404).json({
        success: false,
        error: 'Symptom log not found'
      });
      return;
    }

    await symptom.deleteOne();

    res.status(200).json({
      success: true,
      data: 'Symptom log deleted successfully'
    });
  } catch (error) {
    console.error('Delete symptom error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error deleting symptom'
    });
  }
};

// @desc    Get symptom analytics
// @route   GET /api/symptoms/analytics
// @access  Private
export const getSymptomAnalytics = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { period = '30' } = req.query;

    const periodDays = parseInt(period as string);
    const startDate = moment().subtract(periodDays, 'days').toDate();

    // Get symptoms for the period
    const symptoms = await SymptomLog.find({
      userId,
      loggedAt: { $gte: startDate }
    }).sort({ loggedAt: -1 });

    // Calculate analytics
    const analytics = {
      totalLogs: symptoms.length,
      averageSeverity: symptoms.length > 0 
        ? Math.round((symptoms.reduce((sum, s) => sum + s.severity, 0) / symptoms.length) * 10) / 10
        : 0,
      categoryBreakdown: {} as Record<string, number>,
      severityDistribution: {
        mild: 0,    // 1-3
        moderate: 0, // 4-6
        severe: 0   // 7-10
      },
      frequencyAnalysis: {} as Record<string, number>,
      trendData: [] as any[],
      mostCommonSymptoms: [] as any[],
      riskAssessment: {
        low: 0,
        moderate: 0,
        high: 0,
        urgent: 0
      }
    };

    // Category breakdown
    symptoms.forEach(symptom => {
      analytics.categoryBreakdown[symptom.category] = 
        (analytics.categoryBreakdown[symptom.category] || 0) + 1;

      // Severity distribution
      if (symptom.severity <= 3) {
        analytics.severityDistribution.mild++;
      } else if (symptom.severity <= 6) {
        analytics.severityDistribution.moderate++;
      } else {
        analytics.severityDistribution.severe++;
      }

      // Frequency analysis
      analytics.frequencyAnalysis[symptom.frequency] = 
        (analytics.frequencyAnalysis[symptom.frequency] || 0) + 1;

      // Risk assessment
      const riskLevel = symptom.analysis?.riskLevel || 'low';
      analytics.riskAssessment[riskLevel as keyof typeof analytics.riskAssessment]++;
    });

    // Trend data (daily averages)
    const dailyData = {} as Record<string, { total: number; count: number; severity: number }>;
    
    symptoms.forEach(symptom => {
      const day = moment(symptom.loggedAt).format('YYYY-MM-DD');
      if (!dailyData[day]) {
        dailyData[day] = { total: 0, count: 0, severity: 0 };
      }
      dailyData[day].total++;
      dailyData[day].severity += symptom.severity;
    });

    analytics.trendData = Object.entries(dailyData)
      .map(([date, data]) => ({
        date,
        count: data.total,
        averageSeverity: Math.round((data.severity / data.total) * 10) / 10
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Most common symptoms
    const symptomCounts = {} as Record<string, number>;
    symptoms.forEach(symptom => {
      symptomCounts[symptom.symptomName] = 
        (symptomCounts[symptom.symptomName] || 0) + 1;
    });

    analytics.mostCommonSymptoms = Object.entries(symptomCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    res.status(200).json({
      success: true,
      data: {
        analytics,
        period: periodDays
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching analytics'
    });
  }
};

// @desc    Get AI insights
// @route   GET /api/symptoms/insights
// @access  Private
export const getAIInsights = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;

    // Get recent symptoms for analysis
    const recentSymptoms = await SymptomLog.find({ userId })
      .sort({ loggedAt: -1 })
      .limit(100);

    const insights = {
      patterns: [] as string[],
      recommendations: [] as string[],
      alerts: [] as string[],
      trends: {
        improving: [] as string[],
        worsening: [] as string[],
        stable: [] as string[]
      }
    };

    // Pattern analysis
    const symptomGroups = {} as Record<string, ISymptomLog[]>;
    recentSymptoms.forEach(symptom => {
      if (!symptomGroups[symptom.symptomName]) {
        symptomGroups[symptom.symptomName] = [];
      }
      symptomGroups[symptom.symptomName].push(symptom);
    });

    // Analyze each symptom group
    Object.entries(symptomGroups).forEach(([symptomName, logs]) => {
      if (logs.length >= 3) {
        const recent = logs.slice(0, Math.floor(logs.length / 2));
        const older = logs.slice(Math.floor(logs.length / 2));

        const recentAvg = recent.reduce((sum, s) => sum + s.severity, 0) / recent.length;
        const olderAvg = older.reduce((sum, s) => sum + s.severity, 0) / older.length;

        if (recentAvg > olderAvg + 1) {
          insights.trends.worsening.push(symptomName);
          insights.alerts.push(`${symptomName} severity is increasing - consider medical consultation`);
        } else if (recentAvg < olderAvg - 1) {
          insights.trends.improving.push(symptomName);
        } else {
          insights.trends.stable.push(symptomName);
        }

        // Frequency patterns
        if (logs.length >= 5) {
          insights.patterns.push(`${symptomName} occurs frequently - logged ${logs.length} times recently`);
        }
      }
    });

    // General recommendations
    const totalSymptoms = recentSymptoms.length;
    const highSeverityCount = recentSymptoms.filter(s => s.severity >= 7).length;

    if (highSeverityCount > totalSymptoms * 0.3) {
      insights.recommendations.push('Consider consulting with a healthcare provider about your high-severity symptoms');
    }

    if (totalSymptoms > 20) {
      insights.recommendations.push('Great job consistently tracking your symptoms! This data will help identify patterns');
    }

    insights.recommendations.push('Try to log contextual information like mood, weather, and activities for better insights');

    res.status(200).json({
      success: true,
      data: {
        insights
      }
    });
  } catch (error) {
    console.error('Get insights error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching insights'
    });
  }
};