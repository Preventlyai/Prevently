import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Types
export interface UIState {
  // Theme and appearance
  theme: 'light' | 'dark' | 'auto';
  reducedMotion: boolean;
  fontSize: 'small' | 'medium' | 'large';
  highContrast: boolean;
  
  // Navigation and views
  currentView: 'dashboard' | 'health' | 'ai-coach' | 'family' | 'settings';
  sidebarOpen: boolean;
  
  // Modals and overlays
  modals: {
    symptomLogger: boolean;
    userProfile: boolean;
    familyInvite: boolean;
    achievement: boolean;
    settings: boolean;
    help: boolean;
  };
  
  // Loading states
  loading: {
    global: boolean;
    data: boolean;
    sync: boolean;
  };
  
  // Notifications
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
    persistent?: boolean;
  }>;
  
  // Achievement celebrations
  celebratingAchievement: {
    id: string;
    title: string;
    description: string;
    icon: string;
    xpAwarded: number;
  } | null;
  
  // Tips and help
  activeTip: {
    id: string;
    title: string;
    content: string;
    category: string;
    priority: 'low' | 'medium' | 'high';
  } | null;
  
  // Data sync status
  syncStatus: {
    lastSync: Date | null;
    syncing: boolean;
    error: string | null;
  };
  
  // Voice interaction
  voiceActive: boolean;
  voiceRecording: boolean;
  
  // Offline status
  isOnline: boolean;
  offlineActions: Array<{
    id: string;
    type: string;
    data: any;
    timestamp: Date;
  }>;
}

// Initial state
const initialState: UIState = {
  theme: 'auto',
  reducedMotion: false,
  fontSize: 'medium',
  highContrast: false,
  currentView: 'dashboard',
  sidebarOpen: false,
  modals: {
    symptomLogger: false,
    userProfile: false,
    familyInvite: false,
    achievement: false,
    settings: false,
    help: false,
  },
  loading: {
    global: false,
    data: false,
    sync: false,
  },
  notifications: [],
  celebratingAchievement: null,
  activeTip: null,
  syncStatus: {
    lastSync: null,
    syncing: false,
    error: null,
  },
  voiceActive: false,
  voiceRecording: false,
  isOnline: navigator.onLine,
  offlineActions: [],
};

// UI slice
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Theme and appearance
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'auto'>) => {
      state.theme = action.payload;
    },
    toggleReducedMotion: (state) => {
      state.reducedMotion = !state.reducedMotion;
    },
    setFontSize: (state, action: PayloadAction<'small' | 'medium' | 'large'>) => {
      state.fontSize = action.payload;
    },
    toggleHighContrast: (state) => {
      state.highContrast = !state.highContrast;
    },
    
    // Navigation
    setCurrentView: (state, action: PayloadAction<UIState['currentView']>) => {
      state.currentView = action.payload;
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebar: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    
    // Modals
    openModal: (state, action: PayloadAction<keyof UIState['modals']>) => {
      state.modals[action.payload] = true;
    },
    closeModal: (state, action: PayloadAction<keyof UIState['modals']>) => {
      state.modals[action.payload] = false;
    },
    closeAllModals: (state) => {
      Object.keys(state.modals).forEach(key => {
        state.modals[key as keyof UIState['modals']] = false;
      });
    },
    
    // Loading states
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.loading.global = action.payload;
    },
    setDataLoading: (state, action: PayloadAction<boolean>) => {
      state.loading.data = action.payload;
    },
    setSyncLoading: (state, action: PayloadAction<boolean>) => {
      state.loading.sync = action.payload;
    },
    
    // Notifications
    addNotification: (state, action: PayloadAction<{
      type: 'success' | 'error' | 'warning' | 'info';
      title: string;
      message: string;
      persistent?: boolean;
    }>) => {
      const notification = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        ...action.payload,
        timestamp: new Date(),
        read: false,
      };
      state.notifications.unshift(notification);
      
      // Keep only last 20 notifications
      if (state.notifications.length > 20) {
        state.notifications = state.notifications.slice(0, 20);
      }
    },
    markNotificationRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification) {
        notification.read = true;
      }
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
    clearAllNotifications: (state) => {
      state.notifications = [];
    },
    markAllNotificationsRead: (state) => {
      state.notifications.forEach(notification => {
        notification.read = true;
      });
    },
    
    // Achievement celebrations
    celebrateAchievement: (state, action: PayloadAction<{
      id: string;
      title: string;
      description: string;
      icon: string;
      xpAwarded: number;
    }>) => {
      state.celebratingAchievement = action.payload;
      state.modals.achievement = true;
    },
    clearAchievementCelebration: (state) => {
      state.celebratingAchievement = null;
      state.modals.achievement = false;
    },
    
    // Tips and help
    setActiveTip: (state, action: PayloadAction<UIState['activeTip']>) => {
      state.activeTip = action.payload;
    },
    clearActiveTip: (state) => {
      state.activeTip = null;
    },
    
    // Sync status
    setSyncStatus: (state, action: PayloadAction<{
      lastSync?: Date | null;
      syncing?: boolean;
      error?: string | null;
    }>) => {
      state.syncStatus = { ...state.syncStatus, ...action.payload };
    },
    setSyncError: (state, action: PayloadAction<string | null>) => {
      state.syncStatus.error = action.payload;
      state.syncStatus.syncing = false;
    },
    startSync: (state) => {
      state.syncStatus.syncing = true;
      state.syncStatus.error = null;
    },
    completeSync: (state) => {
      state.syncStatus.syncing = false;
      state.syncStatus.lastSync = new Date();
      state.syncStatus.error = null;
    },
    
    // Voice interaction
    setVoiceActive: (state, action: PayloadAction<boolean>) => {
      state.voiceActive = action.payload;
    },
    setVoiceRecording: (state, action: PayloadAction<boolean>) => {
      state.voiceRecording = action.payload;
    },
    toggleVoice: (state) => {
      state.voiceActive = !state.voiceActive;
    },
    
    // Offline status
    setOnlineStatus: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload;
    },
    addOfflineAction: (state, action: PayloadAction<{
      type: string;
      data: any;
    }>) => {
      const offlineAction = {
        id: Date.now().toString(),
        ...action.payload,
        timestamp: new Date(),
      };
      state.offlineActions.push(offlineAction);
    },
    removeOfflineAction: (state, action: PayloadAction<string>) => {
      state.offlineActions = state.offlineActions.filter(action => action.id !== action.payload);
    },
    clearOfflineActions: (state) => {
      state.offlineActions = [];
    },
    
    // Batch operations
    resetUI: (state) => {
      return { ...initialState, isOnline: state.isOnline };
    },
    updateUserPreferences: (state, action: PayloadAction<{
      theme?: 'light' | 'dark' | 'auto';
      reducedMotion?: boolean;
      fontSize?: 'small' | 'medium' | 'large';
      highContrast?: boolean;
    }>) => {
      Object.keys(action.payload).forEach(key => {
        if (action.payload[key as keyof typeof action.payload] !== undefined) {
          (state as any)[key] = action.payload[key as keyof typeof action.payload];
        }
      });
    },
  },
});

export const {
  // Theme and appearance
  setTheme,
  toggleReducedMotion,
  setFontSize,
  toggleHighContrast,
  
  // Navigation
  setCurrentView,
  toggleSidebar,
  setSidebar,
  
  // Modals
  openModal,
  closeModal,
  closeAllModals,
  
  // Loading states
  setGlobalLoading,
  setDataLoading,
  setSyncLoading,
  
  // Notifications
  addNotification,
  markNotificationRead,
  removeNotification,
  clearAllNotifications,
  markAllNotificationsRead,
  
  // Achievement celebrations
  celebrateAchievement,
  clearAchievementCelebration,
  
  // Tips and help
  setActiveTip,
  clearActiveTip,
  
  // Sync status
  setSyncStatus,
  setSyncError,
  startSync,
  completeSync,
  
  // Voice interaction
  setVoiceActive,
  setVoiceRecording,
  toggleVoice,
  
  // Offline status
  setOnlineStatus,
  addOfflineAction,
  removeOfflineAction,
  clearOfflineActions,
  
  // Batch operations
  resetUI,
  updateUserPreferences,
} = uiSlice.actions;

export default uiSlice.reducer;