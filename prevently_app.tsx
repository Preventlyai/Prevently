import React, { useState, useEffect } from 'react';
import { Heart, Activity, Users, Settings, Bell, Camera, Mic, Calendar, AlertTriangle, CheckCircle, TrendingUp, Sun, Moon, Droplets, Brain, Shield, Award } from 'lucide-react';

const PreventlyApp = () => {
  // State management for app functionality
  const [currentView, setCurrentView] = useState('dashboard');
  const [user, setUser] = useState({
    name: 'Alex',
    streak: 7,
    healthScore: 85,
    dailyTipCompleted: false
  });
  const [healthData, setHealthData] = useState({
    steps: 8542,
    heartRate: 72,
    sleep: 7.5,
    hydration: 6,
    mood: 4
  });
  const [medications, setMedications] = useState([
    { name: 'Vitamin D', time: '09:00', taken: true },
    { name: 'Omega-3', time: '18:00', taken: false }
  ]);
  const [dailyTip, setDailyTip] = useState({
    title: "Boost Your Immunity",
    content: "Based on your sleep patterns and current weather, try 10 minutes of morning sunlight exposure to optimize your vitamin D levels.",
    reason: "Your digital twin shows irregular sleep patterns this week, and sunny weather provides a natural immunity boost.",
    action: "Step outside for 10 minutes between 9-11 AM"
  });

  // Neumorphic styling function - creates the soft, embossed look
  const neumorphicStyle = (pressed = false, size = 'normal') => {
    const baseStyle = {
      backgroundColor: '#e0e0e0',
      borderRadius: size === 'large' ? '20px' : '12px',
      border: 'none',
      transition: 'all 0.2s ease'
    };
    
    if (pressed) {
      return {
        ...baseStyle,
        boxShadow: 'inset 4px 4px 8px #bebebe, inset -4px -4px 8px #ffffff'
      };
    }
    
    return {
      ...baseStyle,
      boxShadow: '6px 6px 12px #bebebe, -6px -6px 12px #ffffff'
    };
  };

  // Navigation component with neumorphic design
  const NavigationBar = () => (
    <div style={{
      position: 'fixed',
      bottom: '0',
      left: '0',
      right: '0',
      height: '70px',
      backgroundColor: '#e0e0e0',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      ...neumorphicStyle(false, 'large')
    }}>
      {[
        { id: 'dashboard', icon: Heart, label: 'Home' },
        { id: 'health', icon: Activity, label: 'Health' },
        { id: 'family', icon: Users, label: 'Family' },
        { id: 'settings', icon: Settings, label: 'Settings' }
      ].map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          onClick={() => setCurrentView(id)}
          style={{
            ...neumorphicStyle(currentView === id),
            width: '50px',
            height: '50px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <Icon size={20} color={currentView === id ? '#4a90e2' : '#666'} />
          <span style={{ fontSize: '10px', color: currentView === id ? '#4a90e2' : '#666', marginTop: '2px' }}>
            {label}
          </span>
        </button>
      ))}
    </div>
  );

  // Daily tip component - the core engagement feature
  const DailyTipCard = () => (
    <div style={{
      ...neumorphicStyle(false, 'large'),
      padding: '20px',
      margin: '20px 0',
      position: 'relative'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
        <Sun size={24} color="#ff6b35" />
        <h3 style={{ margin: '0 0 0 10px', color: '#333', fontSize: '18px' }}>
          Today's Prevently Tip
        </h3>
        {user.dailyTipCompleted && <CheckCircle size={20} color="#4caf50" style={{ marginLeft: 'auto' }} />}
      </div>
      
      <h4 style={{ color: '#4a90e2', marginBottom: '10px' }}>{dailyTip.title}</h4>
      <p style={{ color: '#666', marginBottom: '15px', lineHeight: '1.5' }}>
        {dailyTip.content}
      </p>
      
      <div style={{ ...neumorphicStyle(true), padding: '10px', marginBottom: '15px' }}>
        <p style={{ color: '#666', fontSize: '14px', margin: '0', fontStyle: 'italic' }}>
          Why this tip? {dailyTip.reason}
        </p>
      </div>
      
      <button
        onClick={() => setUser({...user, dailyTipCompleted: true})}
        style={{
          ...neumorphicStyle(user.dailyTipCompleted),
          padding: '12px 20px',
          color: user.dailyTipCompleted ? '#4caf50' : '#4a90e2',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: 'pointer',
          width: '100%'
        }}
      >
        {user.dailyTipCompleted ? '✓ Completed' : 'Mark as Done'}
      </button>
    </div>
  );

  // Health metrics dashboard
  const HealthMetrics = () => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', margin: '20px 0' }}>
      {[
        { label: 'Steps', value: healthData.steps.toLocaleString(), icon: Activity, color: '#4caf50' },
        { label: 'Heart Rate', value: `${healthData.heartRate} bpm`, icon: Heart, color: '#f44336' },
        { label: 'Sleep', value: `${healthData.sleep}h`, icon: Moon, color: '#673ab7' },
        { label: 'Hydration', value: `${healthData.hydration}/8`, icon: Droplets, color: '#2196f3' }
      ].map(({ label, value, icon: Icon, color }) => (
        <div key={label} style={{ ...neumorphicStyle(), padding: '15px', textAlign: 'center' }}>
          <Icon size={24} color={color} style={{ marginBottom: '8px' }} />
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>{value}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{label}</div>
        </div>
      ))}
    </div>
  );

  // Medication tracking component
  const MedicationTracker = () => (
    <div style={{ ...neumorphicStyle(false, 'large'), padding: '20px', margin: '20px 0' }}>
      <h3 style={{ color: '#333', marginBottom: '15px' }}>Today's Medications</h3>
      {medications.map((med, index) => (
        <div key={index} style={{
          display: 'flex',
          alignItems: 'center',
          padding: '10px',
          marginBottom: '10px',
          ...neumorphicStyle(med.taken)
        }}>
          <Calendar size={20} color="#666" />
          <div style={{ marginLeft: '10px', flex: 1 }}>
            <div style={{ fontWeight: 'bold', color: '#333' }}>{med.name}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>{med.time}</div>
          </div>
          <CheckCircle size={20} color={med.taken ? '#4caf50' : '#ccc'} />
        </div>
      ))}
    </div>
  );

  // Voice interaction component
  const VoiceInteraction = () => (
    <div style={{ ...neumorphicStyle(), padding: '15px', margin: '20px 0', textAlign: 'center' }}>
      <button style={{
        ...neumorphicStyle(),
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto'
      }}>
        <Mic size={24} color="#4a90e2" />
      </button>
      <p style={{ color: '#666', fontSize: '14px', marginTop: '10px' }}>
        "Log my breakfast" or "How's my health today?"
      </p>
    </div>
  );

  // Family health profiles
  const FamilyProfiles = () => (
    <div style={{ padding: '20px' }}>
      <h2 style={{ color: '#333', marginBottom: '20px' }}>Family Health Twins</h2>
      {[
        { name: 'Emma (Daughter)', age: 12, healthScore: 92, status: 'Great' },
        { name: 'Michael (Son)', age: 8, healthScore: 88, status: 'Good' },
        { name: 'Sarah (Partner)', age: 35, healthScore: 79, status: 'Needs Rest' }
      ].map((member, index) => (
        <div key={index} style={{
          ...neumorphicStyle(false, 'large'),
          padding: '15px',
          marginBottom: '15px',
          display: 'flex',
          alignItems: 'center'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            backgroundColor: '#4a90e2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold'
          }}>
            {member.name[0]}
          </div>
          <div style={{ marginLeft: '15px', flex: 1 }}>
            <div style={{ fontWeight: 'bold', color: '#333' }}>{member.name}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>Health Score: {member.healthScore}%</div>
            <div style={{ fontSize: '12px', color: member.status === 'Great' ? '#4caf50' : '#ff9800' }}>
              {member.status}
            </div>
          </div>
          <TrendingUp size={20} color="#4caf50" />
        </div>
      ))}
    </div>
  );

  // Settings and privacy controls
  const SettingsView = () => (
    <div style={{ padding: '20px' }}>
      <h2 style={{ color: '#333', marginBottom: '20px' }}>Settings</h2>
      
      <div style={{ ...neumorphicStyle(false, 'large'), padding: '20px', marginBottom: '20px' }}>
        <h3 style={{ color: '#333', marginBottom: '15px', display: 'flex', alignItems: 'center' }}>
          <Shield size={20} style={{ marginRight: '10px' }} />
          Privacy & Security
        </h3>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'flex', alignItems: 'center', color: '#666' }}>
            <input type="checkbox" defaultChecked style={{ marginRight: '10px' }} />
            Anonymous Digital Twin Mode
          </label>
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'flex', alignItems: 'center', color: '#666' }}>
            <input type="checkbox" defaultChecked style={{ marginRight: '10px' }} />
            Share anonymized data for research
          </label>
        </div>
        <div>
          <label style={{ display: 'flex', alignItems: 'center', color: '#666' }}>
            <input type="checkbox" style={{ marginRight: '10px' }} />
            High contrast mode (accessibility)
          </label>
        </div>
      </div>

      <div style={{ ...neumorphicStyle(false, 'large'), padding: '20px', marginBottom: '20px' }}>
        <h3 style={{ color: '#333', marginBottom: '15px' }}>Language & Voice</h3>
        <select style={{
          ...neumorphicStyle(true),
          padding: '10px',
          width: '100%',
          fontSize: '16px'
        }}>
          <option>English</option>
          <option>Français</option>
          <option>Deutsch</option>
        </select>
      </div>
    </div>
  );

  // Main dashboard view
  const DashboardView = () => (
    <div style={{ padding: '20px', paddingBottom: '100px' }}>
      {/* Header with streak and health score */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ color: '#333', margin: '0', fontSize: '24px' }}>
            Good morning, {user.name}!
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', marginTop: '5px' }}>
            <Award size={16} color="#ff6b35" />
            <span style={{ color: '#666', marginLeft: '5px' }}>
              {user.streak} day streak
            </span>
          </div>
        </div>
        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4a90e2' }}>
            {user.healthScore}%
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>Health Score</div>
        </div>
      </div>

      {/* Daily tip - the core engagement feature */}
      <DailyTipCard />

      {/* Quick health metrics */}
      <HealthMetrics />

      {/* Voice interaction */}
      <VoiceInteraction />

      {/* Medication tracking */}
      <MedicationTracker />

      {/* Environmental alert */}
      <div style={{
        ...neumorphicStyle(false, 'large'),
        padding: '15px',
        margin: '20px 0',
        backgroundColor: '#fff3cd',
        border: '1px solid #ffeaa7'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <AlertTriangle size={20} color="#ff9800" />
          <div style={{ marginLeft: '10px' }}>
            <div style={{ fontWeight: 'bold', color: '#333' }}>High Pollen Alert</div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              Consider indoor activities today in Barcelona
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Health data detailed view
  const HealthView = () => (
    <div style={{ padding: '20px', paddingBottom: '100px' }}>
      <h2 style={{ color: '#333', marginBottom: '20px' }}>Health Dashboard</h2>
      
      {/* Digital Twin Status */}
      <div style={{ ...neumorphicStyle(false, 'large'), padding: '20px', marginBottom: '20px' }}>
        <h3 style={{ color: '#333', marginBottom: '15px', display: 'flex', alignItems: 'center' }}>
          <Brain size={20} style={{ marginRight: '10px' }} />
          Digital Health Twin
        </h3>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <div style={{ color: '#4a90e2', fontWeight: 'bold' }}>Active & Learning</div>
            <div style={{ color: '#666', fontSize: '14px' }}>
              Processing data from 5 sources
            </div>
          </div>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: '#4caf50',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'pulse 2s infinite'
          }}>
            <div style={{ width: '10px', height: '10px', backgroundColor: 'white', borderRadius: '50%' }}></div>
          </div>
        </div>
      </div>

      {/* Detailed metrics */}
      <HealthMetrics />

      {/* Data sources */}
      <div style={{ ...neumorphicStyle(false, 'large'), padding: '20px', marginBottom: '20px' }}>
        <h3 style={{ color: '#333', marginBottom: '15px' }}>Connected Sources</h3>
        {[
          { name: 'Apple Health', status: 'Connected', icon: Heart },
          { name: 'Sleep Tracker', status: 'Connected', icon: Moon },
          { name: 'Nutrition Log', status: 'Manual Entry', icon: Droplets },
          { name: 'Environmental Data', status: 'Location-based', icon: Sun }
        ].map((source, index) => (
          <div key={index} style={{
            display: 'flex',
            alignItems: 'center',
            padding: '8px 0',
            borderBottom: index < 3 ? '1px solid #f0f0f0' : 'none'
          }}>
            <source.icon size={16} color="#666" />
            <div style={{ marginLeft: '10px', flex: 1 }}>
              <div style={{ fontWeight: 'bold', color: '#333' }}>{source.name}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>{source.status}</div>
            </div>
            <CheckCircle size={16} color="#4caf50" />
          </div>
        ))}
      </div>

      {/* Upload health records */}
      <div style={{ ...neumorphicStyle(), padding: '15px', textAlign: 'center' }}>
        <Camera size={24} color="#4a90e2" style={{ marginBottom: '10px' }} />
        <div style={{ color: '#333', fontWeight: 'bold' }}>Upload Health Records</div>
        <div style={{ color: '#666', fontSize: '12px' }}>
          Take a photo of lab results, prescriptions, or reports
        </div>
      </div>
    </div>
  );

  // Main app render logic
  const renderCurrentView = () => {
    switch (currentView) {
      case 'health':
        return <HealthView />;
      case 'family':
        return <FamilyProfiles />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div style={{
      backgroundColor: '#e0e0e0',
      minHeight: '100vh',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      position: 'relative'
    }}>
      {/* Add CSS animation for the pulse effect */}
      <style>
        {`
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
          }
        `}
      </style>
      
      {renderCurrentView()}
      <NavigationBar />
    </div>
  );
};

export default PreventlyApp;