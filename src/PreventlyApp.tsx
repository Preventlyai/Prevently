import React, { useState, useEffect, useCallback } from 'react';
import { Heart, Activity, Users, Settings, Bell, Camera, Mic, Calendar, AlertTriangle, CheckCircle, TrendingUp, Sun, Moon, Droplets, Brain, Shield, Award, Zap, Target, Sparkles, ChevronRight, Play, Pause, RotateCcw, MessageCircle, Share2, Gift, Trophy, Flame, Star, ArrowUp, ArrowDown, Plus, X, Send, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './PreventlyApp.css';

interface User {
  id: string;
  name: string;
  email: string;
  streak: number;
  healthScore: number;
  dailyTipCompleted: boolean;
  level: number;
  xp: number;
  achievements: Achievement[];
  preferences: UserPreferences;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  date?: Date;
}

interface UserPreferences {
  notifications: boolean;
  darkMode: boolean;
  language: string;
  units: 'metric' | 'imperial';
  privacy: {
    shareData: boolean;
    anonymousMode: boolean;
  };
}

interface HealthData {
  steps: number;
  heartRate: number;
  sleep: number;
  hydration: number;
  mood: number;
  bloodPressure: { systolic: number; diastolic: number };
  weight: number;
  temperature: number;
  oxygenSaturation: number;
  trends: {
    steps: number[];
    heartRate: number[];
    sleep: number[];
    mood: number[];
  };
}

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  time: string;
  taken: boolean;
  streak: number;
  reminders: boolean;
}

interface AITip {
  id: string;
  title: string;
  content: string;
  reason: string;
  action: string;
  category: 'nutrition' | 'exercise' | 'sleep' | 'mental' | 'preventive';
  priority: 'low' | 'medium' | 'high';
  personalizationScore: number;
  completed: boolean;
  feedback?: 'helpful' | 'not_helpful';
}

interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  age: number;
  healthScore: number;
  status: 'excellent' | 'good' | 'needs_attention' | 'concerning';
  lastUpdate: Date;
  permissions: {
    canView: boolean;
    canShare: boolean;
    emergencyContact: boolean;
  };
}

const PreventlyApp: React.FC = () => {
  // Enhanced State Management
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [user, setUser] = useState<User>({
    id: '1',
    name: 'Alex Johnson',
    email: 'alex@example.com',
    streak: 12,
    healthScore: 87,
    dailyTipCompleted: false,
    level: 3,
    xp: 2850,
    achievements: [
      { id: '1', name: 'First Steps', description: 'Complete your first health check', icon: '🎯', unlocked: true, date: new Date('2024-01-15') },
      { id: '2', name: 'Week Warrior', description: 'Maintain 7-day streak', icon: '🔥', unlocked: true, date: new Date('2024-01-20') },
      { id: '3', name: 'Health Hero', description: 'Reach 85% health score', icon: '🏆', unlocked: true, date: new Date('2024-01-22') }
    ],
    preferences: {
      notifications: true,
      darkMode: false,
      language: 'en',
      units: 'metric',
      privacy: {
        shareData: true,
        anonymousMode: false
      }
    }
  });

  const [healthData, setHealthData] = useState<HealthData>({
    steps: 8542,
    heartRate: 72,
    sleep: 7.5,
    hydration: 6,
    mood: 4,
    bloodPressure: { systolic: 120, diastolic: 80 },
    weight: 70,
    temperature: 36.5,
    oxygenSaturation: 98,
    trends: {
      steps: [8200, 8500, 7800, 9200, 8542],
      heartRate: [68, 72, 70, 74, 72],
      sleep: [7.2, 7.5, 6.8, 8.1, 7.5],
      mood: [3, 4, 3, 5, 4]
    }
  });

  const [medications, setMedications] = useState<Medication[]>([
    { id: '1', name: 'Vitamin D3', dosage: '2000 IU', frequency: 'daily', time: '09:00', taken: true, streak: 5, reminders: true },
    { id: '2', name: 'Omega-3', dosage: '1000mg', frequency: 'daily', time: '18:00', taken: false, streak: 3, reminders: true },
    { id: '3', name: 'Magnesium', dosage: '400mg', frequency: 'daily', time: '21:00', taken: false, streak: 2, reminders: true }
  ]);

  const [aiTips, setAiTips] = useState<AITip[]>([
    {
      id: '1',
      title: 'Optimize Your Sleep Window',
      content: 'Your sleep data shows you\'re going to bed 30 minutes later than optimal. Try setting a wind-down routine starting at 9:30 PM.',
      reason: 'Analysis of your sleep patterns and heart rate variability suggests better recovery with earlier bedtime.',
      action: 'Set a bedtime reminder for 10:00 PM tonight',
      category: 'sleep',
      priority: 'high',
      personalizationScore: 0.92,
      completed: false
    },
    {
      id: '2',
      title: 'Hydration Boost Strategy',
      content: 'Based on your activity levels and today\'s weather, aim for 8-10 glasses of water. Your morning routine shows low hydration.',
      reason: 'Your digital twin indicates dehydration risk based on activity patterns and environmental factors.',
      action: 'Drink 2 glasses of water now and set hourly reminders',
      category: 'nutrition',
      priority: 'medium',
      personalizationScore: 0.85,
      completed: false
    }
  ]);

  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([
    {
      id: '1',
      name: 'Emma Johnson',
      relation: 'Daughter',
      age: 12,
      healthScore: 94,
      status: 'excellent',
      lastUpdate: new Date(),
      permissions: { canView: true, canShare: true, emergencyContact: true }
    },
    {
      id: '2',
      name: 'Michael Johnson',
      relation: 'Son',
      age: 8,
      healthScore: 89,
      status: 'good',
      lastUpdate: new Date(),
      permissions: { canView: true, canShare: true, emergencyContact: true }
    },
    {
      id: '3',
      name: 'Sarah Johnson',
      relation: 'Partner',
      age: 35,
      healthScore: 82,
      status: 'good',
      lastUpdate: new Date(),
      permissions: { canView: true, canShare: true, emergencyContact: true }
    }
  ]);

  const [voiceMode, setVoiceMode] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showAchievement, setShowAchievement] = useState<Achievement | null>(null);

  // AI Integration Functions
  const generatePersonalizedTip = useCallback(async () => {
    // Simulate AI tip generation based on user data
    const tips = [
      {
        title: 'Movement Snack Alert',
        content: 'You\'ve been sitting for 2 hours. Try a 5-minute walk or desk stretches.',
        reason: 'Your heart rate variability shows signs of prolonged inactivity.',
        action: 'Take a 5-minute movement break now',
        category: 'exercise' as const,
        priority: 'medium' as const
      },
      {
        title: 'Nutrition Optimization',
        content: 'Your energy levels dip around 3 PM. Consider a protein-rich snack at 2:30 PM.',
        reason: 'Pattern analysis shows consistent energy drops based on your meal timing.',
        action: 'Prepare a healthy afternoon snack',
        category: 'nutrition' as const,
        priority: 'low' as const
      },
      {
        title: 'Stress Management',
        content: 'Your heart rate pattern suggests elevated stress. Try a 10-minute meditation.',
        reason: 'Your HRV indicates stress response activation.',
        action: 'Practice deep breathing for 10 minutes',
        category: 'mental' as const,
        priority: 'high' as const
      }
    ];

    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    const newTip: AITip = {
      id: Date.now().toString(),
      ...randomTip,
      personalizationScore: 0.85 + Math.random() * 0.15,
      completed: false
    };

    setAiTips(prev => [newTip, ...prev.slice(0, 4)]);
  }, []);

  // Voice Interaction
  const startVoiceInteraction = useCallback(() => {
    setIsListening(true);
    setVoiceMode(true);
    
    // Simulate voice recognition
    setTimeout(() => {
      setIsListening(false);
      // Process voice command here
      console.log('Voice command processed');
    }, 3000);
  }, []);

  // Gamification Functions
  const addXP = useCallback((amount: number) => {
    setUser(prev => {
      const newXP = prev.xp + amount;
      const newLevel = Math.floor(newXP / 1000) + 1;
      
      if (newLevel > prev.level) {
        setShowAchievement({
          id: 'level_up',
          name: `Level ${newLevel}`,
          description: `Congratulations! You've reached level ${newLevel}`,
          icon: '🎉',
          unlocked: true
        });
      }
      
      return { ...prev, xp: newXP, level: newLevel };
    });
  }, []);

  const completeTip = useCallback((tipId: string) => {
    setAiTips(prev => prev.map(tip => 
      tip.id === tipId ? { ...tip, completed: true } : tip
    ));
    addXP(50);
  }, [addXP]);

  const takeMedication = useCallback((medicationId: string) => {
    setMedications(prev => prev.map(med => 
      med.id === medicationId ? { ...med, taken: true, streak: med.streak + 1 } : med
    ));
    addXP(25);
  }, [addXP]);

  // Effects
  useEffect(() => {
    // Generate initial AI tips
    generatePersonalizedTip();
    
    // Set up periodic health data updates
    const interval = setInterval(() => {
      setHealthData(prev => ({
        ...prev,
        steps: prev.steps + Math.floor(Math.random() * 50),
        heartRate: 68 + Math.floor(Math.random() * 12),
        hydration: Math.min(8, prev.hydration + 0.1)
      }));
    }, 30000);

    return () => clearInterval(interval);
  }, [generatePersonalizedTip]);

  return (
    <div className="prevently-app">
      <div className="app-container">
        {/* Achievement Modal */}
        <AnimatePresence>
          {showAchievement && (
            <motion.div
              className="achievement-modal"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onAnimationComplete={() => setTimeout(() => setShowAchievement(null), 3000)}
            >
              <div className="achievement-content">
                <div className="achievement-icon">{showAchievement.icon}</div>
                <h3>{showAchievement.name}</h3>
                <p>{showAchievement.description}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="main-content">
          {renderCurrentView()}
        </div>

        {/* Enhanced Navigation */}
        <motion.div 
          className="navigation-bar"
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          {[
            { id: 'dashboard', icon: Heart, label: 'Home', color: '#ff6b6b' },
            { id: 'health', icon: Activity, label: 'Health', color: '#4ecdc4' },
            { id: 'ai', icon: Brain, label: 'AI Coach', color: '#45b7d1' },
            { id: 'family', icon: Users, label: 'Family', color: '#96ceb4' },
            { id: 'settings', icon: Settings, label: 'Settings', color: '#ffeaa7' }
          ].map(({ id, icon: Icon, label, color }) => (
            <motion.button
              key={id}
              className={`nav-button ${currentView === id ? 'active' : ''}`}
              onClick={() => setCurrentView(id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{ '--accent-color': color } as any}
            >
              <Icon size={20} />
              <span>{label}</span>
            </motion.button>
          ))}
        </motion.div>

        {/* Voice Assistant Floating Button */}
        <motion.button
          className={`voice-assistant-button ${voiceMode ? 'active' : ''}`}
          onClick={startVoiceInteraction}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          animate={isListening ? { scale: [1, 1.2, 1] } : {}}
          transition={{ repeat: isListening ? Infinity : 0, duration: 1 }}
        >
          <Mic size={24} />
          {isListening && <span className="listening-indicator">Listening...</span>}
        </motion.button>
      </div>
    </div>
  );

  // View Rendering Functions
  function renderCurrentView() {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView />;
      case 'health':
        return <HealthView />;
      case 'ai':
        return <AICoachView />;
      case 'family':
        return <FamilyView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  }

  function DashboardView() {
    return (
      <motion.div 
        className="dashboard-view"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="dashboard-header">
          <div className="greeting">
            <h1>Good morning, {user.name}! 🌅</h1>
            <div className="streak-info">
              <Flame size={16} />
              <span>{user.streak} day streak</span>
            </div>
          </div>
          <div className="user-stats">
            <div className="health-score">
              <div className="score-circle">
                <span>{user.healthScore}%</span>
              </div>
              <label>Health Score</label>
            </div>
            <div className="level-info">
              <div className="level-badge">
                <Trophy size={16} />
                <span>Level {user.level}</span>
              </div>
              <div className="xp-progress">
                <div 
                  className="xp-bar" 
                  style={{ width: `${(user.xp % 1000) / 10}%` }}
                />
                <span>{user.xp % 1000}/1000 XP</span>
              </div>
            </div>
          </div>
        </div>

        {/* Today's AI Tip */}
        <motion.div 
          className="ai-tip-card featured"
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <div className="tip-header">
            <div className="tip-icon">
              <Sparkles size={24} />
            </div>
            <div className="tip-meta">
              <h3>Your AI Health Coach</h3>
              <span className="personalization-score">
                {Math.round(aiTips[0]?.personalizationScore * 100)}% personalized
              </span>
            </div>
          </div>
          
          {aiTips[0] && (
            <div className="tip-content">
              <h4>{aiTips[0].title}</h4>
              <p>{aiTips[0].content}</p>
              <div className="tip-reason">
                <Brain size={16} />
                <span>{aiTips[0].reason}</span>
              </div>
              <motion.button
                className={`tip-action ${aiTips[0].completed ? 'completed' : ''}`}
                onClick={() => completeTip(aiTips[0].id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {aiTips[0].completed ? (
                  <>
                    <CheckCircle size={16} />
                    <span>Completed! +50 XP</span>
                  </>
                ) : (
                  <>
                    <Target size={16} />
                    <span>{aiTips[0].action}</span>
                  </>
                )}
              </motion.button>
            </div>
          )}
        </motion.div>

        {/* Quick Health Metrics */}
        <div className="health-metrics-grid">
          {[
            { 
              label: 'Steps', 
              value: healthData.steps.toLocaleString(), 
              icon: Activity, 
              color: '#4ecdc4',
              trend: healthData.trends.steps[4] > healthData.trends.steps[3] ? 'up' : 'down',
              target: '10,000'
            },
            { 
              label: 'Heart Rate', 
              value: `${healthData.heartRate} bpm`, 
              icon: Heart, 
              color: '#ff6b6b',
              trend: healthData.trends.heartRate[4] > healthData.trends.heartRate[3] ? 'up' : 'down',
              target: '60-100'
            },
            { 
              label: 'Sleep', 
              value: `${healthData.sleep}h`, 
              icon: Moon, 
              color: '#a29bfe',
              trend: healthData.trends.sleep[4] > healthData.trends.sleep[3] ? 'up' : 'down',
              target: '8h'
            },
            { 
              label: 'Hydration', 
              value: `${healthData.hydration}/8`, 
              icon: Droplets, 
              color: '#74b9ff',
              trend: 'up',
              target: '8 glasses'
            }
          ].map(({ label, value, icon: Icon, color, trend, target }) => (
            <motion.div
              key={label}
              className="metric-card"
              whileHover={{ scale: 1.05 }}
              style={{ '--metric-color': color } as any}
            >
              <div className="metric-header">
                <Icon size={20} />
                <div className="metric-trend">
                  {trend === 'up' ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                </div>
              </div>
              <div className="metric-value">{value}</div>
              <div className="metric-label">{label}</div>
              <div className="metric-target">Target: {target}</div>
            </motion.div>
          ))}
        </div>

        {/* Medication Reminders */}
        <div className="medication-section">
          <h3>Today's Medications</h3>
          <div className="medication-list">
            {medications.map((med) => (
              <motion.div
                key={med.id}
                className={`medication-card ${med.taken ? 'taken' : ''}`}
                whileHover={{ scale: 1.02 }}
              >
                <div className="med-info">
                  <div className="med-name">{med.name}</div>
                  <div className="med-details">{med.dosage} • {med.time}</div>
                  <div className="med-streak">
                    <Flame size={12} />
                    <span>{med.streak} day streak</span>
                  </div>
                </div>
                <motion.button
                  className={`med-action ${med.taken ? 'taken' : ''}`}
                  onClick={() => takeMedication(med.id)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  disabled={med.taken}
                >
                  {med.taken ? <CheckCircle size={20} /> : <Plus size={20} />}
                </motion.button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <motion.button
            className="quick-action-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Camera size={20} />
            <span>Log Meal</span>
          </motion.button>
          <motion.button
            className="quick-action-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Activity size={20} />
            <span>Start Workout</span>
          </motion.button>
          <motion.button
            className="quick-action-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Droplets size={20} />
            <span>Log Water</span>
          </motion.button>
        </div>
      </motion.div>
    );
  }

  function HealthView() {
    return (
      <motion.div 
        className="health-view"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="health-header">
          <h2>Your Health Dashboard</h2>
          <div className="health-summary">
            <div className="digital-twin-status">
              <Brain size={20} />
              <span>Digital Twin: Active & Learning</span>
            </div>
          </div>
        </div>

        {/* Comprehensive Health Metrics */}
        <div className="comprehensive-metrics">
          <motion.div className="metric-card large" whileHover={{ scale: 1.02 }}>
            <div className="metric-header">
              <Activity size={24} />
              <h3>Physical Activity</h3>
            </div>
            <div className="metric-details">
              <div className="primary-value">{healthData.steps.toLocaleString()}</div>
              <div className="metric-label">Steps Today</div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${(healthData.steps / 10000) * 100}%` }}></div>
              </div>
              <div className="metric-insights">
                <p>You're {healthData.steps > 10000 ? 'exceeding' : 'behind'} your daily goal</p>
                <span className="ai-suggestion">
                  <Sparkles size={14} />
                  AI suggests: {healthData.steps < 8000 ? 'Take a 10-minute walk' : 'Great job! Keep it up'}
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div className="metric-card large" whileHover={{ scale: 1.02 }}>
            <div className="metric-header">
              <Heart size={24} />
              <h3>Cardiovascular Health</h3>
            </div>
            <div className="metric-details">
              <div className="dual-metrics">
                <div className="sub-metric">
                  <div className="primary-value">{healthData.heartRate}</div>
                  <div className="metric-label">Heart Rate (BPM)</div>
                </div>
                <div className="sub-metric">
                  <div className="primary-value">{healthData.bloodPressure.systolic}/{healthData.bloodPressure.diastolic}</div>
                  <div className="metric-label">Blood Pressure</div>
                </div>
              </div>
              <div className="health-status excellent">
                <CheckCircle size={16} />
                <span>Excellent cardiovascular health</span>
              </div>
            </div>
          </motion.div>

          <motion.div className="metric-card large" whileHover={{ scale: 1.02 }}>
            <div className="metric-header">
              <Moon size={24} />
              <h3>Sleep Quality</h3>
            </div>
            <div className="metric-details">
              <div className="primary-value">{healthData.sleep}h</div>
              <div className="metric-label">Last Night</div>
              <div className="sleep-phases">
                <div className="phase deep">Deep: 2.1h</div>
                <div className="phase rem">REM: 1.8h</div>
                <div className="phase light">Light: 3.6h</div>
              </div>
              <div className="metric-insights">
                <span className="ai-suggestion">
                  <Sparkles size={14} />
                  Your sleep efficiency is 89% - try going to bed 30 minutes earlier
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Health Trends */}
        <motion.div className="health-trends-section" whileHover={{ scale: 1.01 }}>
          <h3>7-Day Health Trends</h3>
          <div className="trends-grid">
            {[
              { label: 'Steps', data: healthData.trends.steps, color: '#4ecdc4', unit: '' },
              { label: 'Heart Rate', data: healthData.trends.heartRate, color: '#ff6b6b', unit: 'bpm' },
              { label: 'Sleep', data: healthData.trends.sleep, color: '#a29bfe', unit: 'h' },
              { label: 'Mood', data: healthData.trends.mood, color: '#ffd93d', unit: '/5' }
            ].map(({ label, data, color, unit }) => (
              <div key={label} className="trend-card">
                <div className="trend-header">
                  <span className="trend-label">{label}</span>
                  <span className="trend-value">{data[data.length - 1]}{unit}</span>
                </div>
                <div className="trend-chart">
                  <svg width="100%" height="60" viewBox="0 0 100 60">
                    <polyline
                      points={data.map((value, index) => `${index * 25},${60 - ((value / Math.max(...data)) * 50)}`).join(' ')}
                      stroke={color}
                      strokeWidth="2"
                      fill="none"
                    />
                  </svg>
                </div>
                <div className="trend-change">
                  {data[data.length - 1] > data[data.length - 2] ? (
                    <span className="positive">
                      <ArrowUp size={12} />
                      {Math.abs(data[data.length - 1] - data[data.length - 2]).toFixed(1)}
                    </span>
                  ) : (
                    <span className="negative">
                      <ArrowDown size={12} />
                      {Math.abs(data[data.length - 1] - data[data.length - 2]).toFixed(1)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Health Insights */}
        <motion.div className="health-insights" whileHover={{ scale: 1.01 }}>
          <h3>AI Health Insights</h3>
          <div className="insights-list">
            <div className="insight-card">
              <div className="insight-icon">
                <TrendingUp size={20} />
              </div>
              <div className="insight-content">
                <h4>Improving Trend</h4>
                <p>Your sleep quality has improved by 15% this week compared to last week.</p>
              </div>
            </div>
            <div className="insight-card">
              <div className="insight-icon">
                <AlertTriangle size={20} />
              </div>
              <div className="insight-content">
                <h4>Attention Needed</h4>
                <p>Your hydration levels are consistently below optimal. Consider setting hourly reminders.</p>
              </div>
            </div>
            <div className="insight-card">
              <div className="insight-icon">
                <Target size={20} />
              </div>
              <div className="insight-content">
                <h4>Goal Achievement</h4>
                <p>You've hit your step goal 5 out of 7 days this week. Excellent consistency!</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <div className="health-actions">
          <motion.button className="action-button primary" whileHover={{ scale: 1.05 }}>
            <Plus size={20} />
            <span>Log Health Data</span>
          </motion.button>
          <motion.button className="action-button secondary" whileHover={{ scale: 1.05 }}>
            <Camera size={20} />
            <span>Upload Lab Results</span>
          </motion.button>
          <motion.button className="action-button secondary" whileHover={{ scale: 1.05 }}>
            <Share2 size={20} />
            <span>Share with Doctor</span>
          </motion.button>
        </div>
      </motion.div>
    );
  }

  function AICoachView() {
    const [chatMessages, setChatMessages] = useState([
      { id: '1', type: 'ai', content: 'Hello! I\'m your AI Health Coach. How can I help you today?', timestamp: new Date() },
      { id: '2', type: 'ai', content: 'I\'ve analyzed your recent health data and noticed some interesting patterns. Would you like me to share my insights?', timestamp: new Date() }
    ]);
    const [inputMessage, setInputMessage] = useState('');

    const sendMessage = () => {
      if (!inputMessage.trim()) return;
      
      const newMessage = {
        id: Date.now().toString(),
        type: 'user',
        content: inputMessage,
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, newMessage]);
      setInputMessage('');
      
      // Simulate AI response
      setTimeout(() => {
        const aiResponse = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: generateAIResponse(inputMessage),
          timestamp: new Date()
        };
        setChatMessages(prev => [...prev, aiResponse]);
      }, 1000);
    };

    const generateAIResponse = (userMessage: string) => {
      const responses = [
        "Based on your recent sleep patterns, I recommend establishing a consistent bedtime routine. Would you like me to create a personalized sleep optimization plan?",
        "Your step count has been great this week! I notice you're most active in the mornings. How about we set up some afternoon movement reminders?",
        "I see you've been consistent with your medications. That's excellent! Your health score has improved by 8% this month as a result.",
        "Your heart rate variability suggests you might benefit from stress management techniques. Would you like me to recommend some personalized meditation exercises?"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    };

    return (
      <motion.div 
        className="ai-coach-view"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="ai-coach-header">
          <div className="coach-avatar">
            <Brain size={32} />
          </div>
          <div className="coach-info">
            <h2>AI Health Coach</h2>
            <p>Your personalized health assistant</p>
            <div className="coach-status">
              <div className="status-indicator active"></div>
              <span>Online & Ready</span>
            </div>
          </div>
        </div>

        {/* Today's Personalized Tips */}
        <div className="personalized-tips">
          <h3>Today's Personalized Recommendations</h3>
          <div className="tips-grid">
            {aiTips.map((tip, index) => (
              <motion.div 
                key={tip.id}
                className="tip-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="tip-priority-badge">{tip.priority}</div>
                <div className="tip-category">{tip.category}</div>
                <h4>{tip.title}</h4>
                <p>{tip.content}</p>
                <div className="tip-reasoning">
                  <Brain size={14} />
                  <span>{tip.reason}</span>
                </div>
                <div className="tip-actions">
                  <motion.button
                    className={`tip-button ${tip.completed ? 'completed' : ''}`}
                    onClick={() => completeTip(tip.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {tip.completed ? 'Completed' : 'Start Now'}
                  </motion.button>
                  <button className="tip-button-secondary">Learn More</button>
                </div>
                <div className="personalization-score">
                  <Star size={14} />
                  <span>{Math.round(tip.personalizationScore * 100)}% Match</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* AI Chat Interface */}
        <div className="ai-chat-interface">
          <h3>Chat with Your AI Coach</h3>
          <div className="chat-container">
            <div className="chat-messages">
              {chatMessages.map((message) => (
                <motion.div
                  key={message.id}
                  className={`message ${message.type}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="message-content">
                    {message.content}
                  </div>
                  <div className="message-time">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="chat-input">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask your AI coach anything..."
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              />
              <motion.button
                onClick={sendMessage}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Send size={20} />
              </motion.button>
            </div>
          </div>
        </div>

        {/* AI Coaching Programs */}
        <div className="coaching-programs">
          <h3>Personalized Coaching Programs</h3>
          <div className="programs-grid">
            <motion.div className="program-card" whileHover={{ scale: 1.03 }}>
              <div className="program-icon">
                <Target size={24} />
              </div>
              <h4>Weight Management</h4>
              <p>Personalized plan based on your metabolism and lifestyle</p>
              <div className="program-progress">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '35%' }}></div>
                </div>
                <span>35% Complete</span>
              </div>
              <button className="program-button">Continue Program</button>
            </motion.div>

            <motion.div className="program-card" whileHover={{ scale: 1.03 }}>
              <div className="program-icon">
                <Activity size={24} />
              </div>
              <h4>Fitness Optimization</h4>
              <p>AI-designed workouts adapted to your fitness level</p>
              <div className="program-progress">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '67%' }}></div>
                </div>
                <span>67% Complete</span>
              </div>
              <button className="program-button">Continue Program</button>
            </motion.div>

            <motion.div className="program-card" whileHover={{ scale: 1.03 }}>
              <div className="program-icon">
                <Moon size={24} />
              </div>
              <h4>Sleep Optimization</h4>
              <p>Improve your sleep quality with personalized strategies</p>
              <div className="program-progress">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '12%' }}></div>
                </div>
                <span>12% Complete</span>
              </div>
              <button className="program-button">Start Program</button>
            </motion.div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="coach-actions">
          <motion.button className="action-button primary" whileHover={{ scale: 1.05 }}>
            <Zap size={20} />
            <span>Get Instant Advice</span>
          </motion.button>
          <motion.button className="action-button secondary" whileHover={{ scale: 1.05 }}>
            <Calendar size={20} />
            <span>Schedule Check-in</span>
          </motion.button>
          <motion.button className="action-button secondary" whileHover={{ scale: 1.05 }}>
            <Gift size={20} />
            <span>Unlock Premium Features</span>
          </motion.button>
        </div>
      </motion.div>
    );
  }

  function FamilyView() {
    return (
      <motion.div 
        className="family-view"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="family-header">
          <h2>Family Health Hub</h2>
          <p>Monitor and manage your family's health together</p>
          <motion.button className="add-member-btn" whileHover={{ scale: 1.05 }}>
            <Plus size={16} />
            <span>Add Family Member</span>
          </motion.button>
        </div>

        {/* Family Overview */}
        <div className="family-overview">
          <div className="overview-card">
            <div className="overview-icon">
              <Users size={24} />
            </div>
            <div className="overview-content">
              <div className="overview-value">{familyMembers.length}</div>
              <div className="overview-label">Family Members</div>
            </div>
          </div>
          <div className="overview-card">
            <div className="overview-icon">
              <Heart size={24} />
            </div>
            <div className="overview-content">
              <div className="overview-value">{Math.round(familyMembers.reduce((sum, member) => sum + member.healthScore, 0) / familyMembers.length)}%</div>
              <div className="overview-label">Avg Health Score</div>
            </div>
          </div>
          <div className="overview-card">
            <div className="overview-icon">
              <Shield size={24} />
            </div>
            <div className="overview-content">
              <div className="overview-value">{familyMembers.filter(m => m.status === 'excellent').length}</div>
              <div className="overview-label">Excellent Health</div>
            </div>
          </div>
        </div>

        {/* Family Members Grid */}
        <div className="family-members-grid">
          {familyMembers.map((member, index) => (
            <motion.div
              key={member.id}
              className="family-member-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="member-header">
                <div className="member-avatar">
                  <span>{member.name.charAt(0)}</span>
                </div>
                <div className="member-info">
                  <h3>{member.name}</h3>
                  <p>{member.relation} • {member.age} years old</p>
                  <div className="last-update">
                    Last updated: {member.lastUpdate.toLocaleDateString()}
                  </div>
                </div>
                <div className={`health-status ${member.status}`}>
                  <div className="status-dot"></div>
                  <span>{member.status.replace('_', ' ')}</span>
                </div>
              </div>

              <div className="member-health-score">
                <div className="score-circle-mini">
                  <div className="score-fill" style={{ '--score': member.healthScore } as any}></div>
                  <span>{member.healthScore}%</span>
                </div>
                <div className="score-label">Health Score</div>
              </div>

              <div className="member-quick-stats">
                <div className="quick-stat">
                  <Activity size={16} />
                  <span>Active</span>
                </div>
                <div className="quick-stat">
                  <Heart size={16} />
                  <span>Normal</span>
                </div>
                <div className="quick-stat">
                  <Moon size={16} />
                  <span>Good Sleep</span>
                </div>
              </div>

              <div className="member-actions">
                <motion.button 
                  className="action-btn primary"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  View Details
                </motion.button>
                <motion.button 
                  className="action-btn secondary"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Message
                </motion.button>
              </div>

              <div className="member-permissions">
                <div className="permission-item">
                  <CheckCircle size={14} />
                  <span>Can view health data</span>
                </div>
                <div className="permission-item">
                  <CheckCircle size={14} />
                  <span>Emergency contact</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Family Challenges */}
        <div className="family-challenges">
          <h3>Family Health Challenges</h3>
          <div className="challenges-grid">
            <motion.div className="challenge-card active" whileHover={{ scale: 1.02 }}>
              <div className="challenge-icon">
                <Trophy size={24} />
              </div>
              <h4>10,000 Steps Challenge</h4>
              <p>Family goal: Everyone walks 10,000 steps daily</p>
              <div className="challenge-progress">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '78%' }}></div>
                </div>
                <span>78% Complete</span>
              </div>
              <div className="challenge-participants">
                <div className="participants-avatars">
                  {familyMembers.map((member, index) => (
                    <div key={member.id} className="participant-avatar" style={{ zIndex: familyMembers.length - index }}>
                      {member.name.charAt(0)}
                    </div>
                  ))}
                </div>
                <span>{familyMembers.length} participants</span>
              </div>
            </motion.div>

            <motion.div className="challenge-card" whileHover={{ scale: 1.02 }}>
              <div className="challenge-icon">
                <Moon size={24} />
              </div>
              <h4>Better Sleep Week</h4>
              <p>Improve family sleep quality together</p>
              <div className="challenge-progress">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '45%' }}></div>
                </div>
                <span>45% Complete</span>
              </div>
              <div className="challenge-participants">
                <div className="participants-avatars">
                  {familyMembers.slice(0, 2).map((member, index) => (
                    <div key={member.id} className="participant-avatar" style={{ zIndex: 2 - index }}>
                      {member.name.charAt(0)}
                    </div>
                  ))}
                </div>
                <span>2 participants</span>
              </div>
            </motion.div>

            <motion.div className="challenge-card new" whileHover={{ scale: 1.02 }}>
              <div className="challenge-icon">
                <Plus size={24} />
              </div>
              <h4>Create New Challenge</h4>
              <p>Start a custom health challenge for your family</p>
              <motion.button 
                className="create-challenge-btn"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Create Challenge
              </motion.button>
            </motion.div>
          </div>
        </div>

        {/* Family Health Insights */}
        <div className="family-insights">
          <h3>Family Health Insights</h3>
          <div className="insights-grid">
            <div className="insight-card">
              <div className="insight-icon positive">
                <TrendingUp size={20} />
              </div>
              <div className="insight-content">
                <h4>Improving Together</h4>
                <p>Your family's average health score has improved by 12% this month!</p>
              </div>
            </div>
            <div className="insight-card">
              <div className="insight-icon info">
                <Target size={20} />
              </div>
              <div className="insight-content">
                <h4>Goal Achievement</h4>
                <p>Emma is leading the family in step count - great motivation for everyone!</p>
              </div>
            </div>
            <div className="insight-card">
              <div className="insight-icon warning">
                <AlertTriangle size={20} />
              </div>
              <div className="insight-content">
                <h4>Health Reminder</h4>
                <p>Michael's screen time has increased. Consider setting family device limits.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Contacts */}
        <div className="emergency-section">
          <h3>Emergency Contacts</h3>
          <div className="emergency-grid">
            <div className="emergency-card">
              <div className="emergency-icon">
                <Phone size={20} />
              </div>
              <div className="emergency-info">
                <h4>Dr. Sarah Wilson</h4>
                <p>Family Doctor</p>
                <span>+1 (555) 123-4567</span>
              </div>
              <motion.button 
                className="call-btn"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Call
              </motion.button>
            </div>
            <div className="emergency-card">
              <div className="emergency-icon">
                <Phone size={20} />
              </div>
              <div className="emergency-info">
                <h4>Emergency Services</h4>
                <p>911</p>
                <span>Emergency Only</span>
              </div>
              <motion.button 
                className="call-btn emergency"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Call 911
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  function SettingsView() {
    return (
      <motion.div 
        className="settings-view"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="settings-header">
          <h2>Settings</h2>
          <p>Customize your Prevently experience</p>
        </div>

        {/* Account Settings */}
        <div className="settings-section">
          <h3>Account & Profile</h3>
          <div className="settings-cards">
            <div className="setting-card">
              <div className="setting-icon">
                <Users size={24} />
              </div>
              <div className="setting-content">
                <h4>Personal Information</h4>
                <p>Update your profile, contact details, and preferences</p>
              </div>
              <motion.button 
                className="setting-button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ChevronRight size={16} />
              </motion.button>
            </div>

            <div className="setting-card">
              <div className="setting-icon">
                <Shield size={24} />
              </div>
              <div className="setting-content">
                <h4>Privacy & Security</h4>
                <p>Control your data sharing and security settings</p>
              </div>
              <motion.button 
                className="setting-button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ChevronRight size={16} />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Health Settings */}
        <div className="settings-section">
          <h3>Health & Tracking</h3>
          <div className="settings-cards">
            <div className="setting-card">
              <div className="setting-icon">
                <Activity size={24} />
              </div>
              <div className="setting-content">
                <h4>Health Goals</h4>
                <p>Set and adjust your daily health targets</p>
              </div>
              <motion.button 
                className="setting-button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ChevronRight size={16} />
              </motion.button>
            </div>

            <div className="setting-card">
              <div className="setting-icon">
                <Brain size={24} />
              </div>
              <div className="setting-content">
                <h4>AI Coach Settings</h4>
                <p>Customize your AI coaching experience</p>
              </div>
              <motion.button 
                className="setting-button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ChevronRight size={16} />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="settings-section">
          <h3>Notifications</h3>
          <div className="settings-toggles">
            <div className="toggle-item">
              <div className="toggle-info">
                <h4>Health Reminders</h4>
                <p>Medication, exercise, and hydration reminders</p>
              </div>
              <div className="toggle-switch">
                <input type="checkbox" id="health-reminders" defaultChecked />
                <label htmlFor="health-reminders"></label>
              </div>
            </div>

            <div className="toggle-item">
              <div className="toggle-info">
                <h4>AI Coaching Tips</h4>
                <p>Personalized health insights and recommendations</p>
              </div>
              <div className="toggle-switch">
                <input type="checkbox" id="ai-tips" defaultChecked />
                <label htmlFor="ai-tips"></label>
              </div>
            </div>

            <div className="toggle-item">
              <div className="toggle-info">
                <h4>Family Updates</h4>
                <p>Notifications about family members' health</p>
              </div>
              <div className="toggle-switch">
                <input type="checkbox" id="family-updates" defaultChecked />
                <label htmlFor="family-updates"></label>
              </div>
            </div>

            <div className="toggle-item">
              <div className="toggle-info">
                <h4>Achievement Alerts</h4>
                <p>Celebrate your health milestones</p>
              </div>
              <div className="toggle-switch">
                <input type="checkbox" id="achievements" defaultChecked />
                <label htmlFor="achievements"></label>
              </div>
            </div>
          </div>
        </div>

        {/* Display Settings */}
        <div className="settings-section">
          <h3>Display & Appearance</h3>
          <div className="settings-toggles">
            <div className="toggle-item">
              <div className="toggle-info">
                <h4>Dark Mode</h4>
                <p>Use dark theme for better night viewing</p>
              </div>
              <div className="toggle-switch">
                <input type="checkbox" id="dark-mode" />
                <label htmlFor="dark-mode"></label>
              </div>
            </div>

            <div className="toggle-item">
              <div className="toggle-info">
                <h4>Reduced Motion</h4>
                <p>Minimize animations for accessibility</p>
              </div>
              <div className="toggle-switch">
                <input type="checkbox" id="reduced-motion" />
                <label htmlFor="reduced-motion"></label>
              </div>
            </div>

            <div className="toggle-item">
              <div className="toggle-info">
                <h4>High Contrast</h4>
                <p>Increase contrast for better visibility</p>
              </div>
              <div className="toggle-switch">
                <input type="checkbox" id="high-contrast" />
                <label htmlFor="high-contrast"></label>
              </div>
            </div>
          </div>
        </div>

        {/* Data & Privacy */}
        <div className="settings-section">
          <h3>Data & Privacy</h3>
          <div className="settings-cards">
            <div className="setting-card">
              <div className="setting-icon">
                <Shield size={24} />
              </div>
              <div className="setting-content">
                <h4>Data Export</h4>
                <p>Download your health data and insights</p>
              </div>
              <motion.button 
                className="setting-button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ChevronRight size={16} />
              </motion.button>
            </div>

            <div className="setting-card">
              <div className="setting-icon">
                <Users size={24} />
              </div>
              <div className="setting-content">
                <h4>Data Sharing</h4>
                <p>Control how your data is shared with healthcare providers</p>
              </div>
              <motion.button 
                className="setting-button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ChevronRight size={16} />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Connected Devices */}
        <div className="settings-section">
          <h3>Connected Devices</h3>
          <div className="connected-devices">
            <div className="device-item">
              <div className="device-icon">
                <Activity size={20} />
              </div>
              <div className="device-info">
                <h4>Apple Health</h4>
                <p>Connected • Syncing</p>
              </div>
              <div className="device-status connected">
                <CheckCircle size={16} />
              </div>
            </div>

            <div className="device-item">
              <div className="device-icon">
                <Heart size={20} />
              </div>
              <div className="device-info">
                <h4>Fitbit Versa</h4>
                <p>Connected • Last sync: 2 min ago</p>
              </div>
              <div className="device-status connected">
                <CheckCircle size={16} />
              </div>
            </div>

            <div className="device-item">
              <div className="device-icon">
                <Moon size={20} />
              </div>
              <div className="device-info">
                <h4>Sleep Tracker</h4>
                <p>Not connected</p>
              </div>
              <div className="device-status disconnected">
                <Plus size={16} />
              </div>
            </div>
          </div>
        </div>

        {/* Support & Help */}
        <div className="settings-section">
          <h3>Support & Help</h3>
          <div className="settings-cards">
            <div className="setting-card">
              <div className="setting-icon">
                <MessageCircle size={24} />
              </div>
              <div className="setting-content">
                <h4>Contact Support</h4>
                <p>Get help with any issues or questions</p>
              </div>
              <motion.button 
                className="setting-button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ChevronRight size={16} />
              </motion.button>
            </div>

            <div className="setting-card">
              <div className="setting-icon">
                <Gift size={24} />
              </div>
              <div className="setting-content">
                <h4>Upgrade to Premium</h4>
                <p>Unlock advanced AI features and family sharing</p>
              </div>
              <motion.button 
                className="setting-button premium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Star size={16} />
              </motion.button>
            </div>
          </div>
        </div>

        {/* App Information */}
        <div className="settings-section">
          <h3>About</h3>
          <div className="app-info">
            <div className="app-version">
              <h4>Prevently AI</h4>
              <p>Version 2.0.0</p>
            </div>
            <div className="app-links">
              <a href="#privacy">Privacy Policy</a>
              <a href="#terms">Terms of Service</a>
              <a href="#about">About Us</a>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }
};

export default PreventlyApp;