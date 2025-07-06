import React, { Suspense, ErrorBoundary, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { getCurrentUser } from './store/slices/authSlice';
import { setOnlineStatus } from './store/slices/uiSlice';
import PreventlyApp from './PreventlyApp';
import './App.css';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

// Error Boundary Component
class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App Error:', error, errorInfo);
    // You can also log the error to an error reporting service
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-content">
            <div className="error-icon">⚠️</div>
            <h2>Something went wrong</h2>
            <p>We're sorry, but something unexpected happened.</p>
            <button
              onClick={() => window.location.reload()}
              className="error-retry-button"
            >
              Reload App
            </button>
            <details className="error-details">
              <summary>Error Details</summary>
              <pre>{this.state.error?.message}</pre>
            </details>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Loading Component
const LoadingSpinner: React.FC = () => (
  <div className="loading-spinner">
    <div className="spinner-container">
      <div className="spinner"></div>
      <p>Loading Prevently AI...</p>
    </div>
  </div>
);

// App Initializer Component (handles auth and setup)
const AppInitializer: React.FC = () => {
  const dispatch = useAppDispatch();
  const { token, isAuthenticated } = useAppSelector(state => state.auth);
  const { isOnline } = useAppSelector(state => state.ui);

  // Initialize app on mount
  useEffect(() => {
    // Handle online/offline status
    const handleOnline = () => dispatch(setOnlineStatus(true));
    const handleOffline = () => dispatch(setOnlineStatus(false));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Get current user if token exists
    if (token && !isAuthenticated) {
      dispatch(getCurrentUser());
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [dispatch, token, isAuthenticated]);

  // Show offline banner
  if (!isOnline) {
    return (
      <div className="offline-banner">
        <div className="offline-content">
          <span className="offline-icon">📶</span>
          <p>You're currently offline. Some features may be limited.</p>
        </div>
      </div>
    );
  }

  return <PreventlyApp />;
};

// Main App Component
const App: React.FC = () => {
  return (
    <AppErrorBoundary>
      <Provider store={store}>
        <HelmetProvider>
          <QueryClientProvider client={queryClient}>
            <Router>
              <div className="App">
                <Suspense fallback={<LoadingSpinner />}>
                  <AppInitializer />
                </Suspense>
                
                {/* Toast Notifications */}
                <Toaster
                  position="top-right"
                  reverseOrder={false}
                  gutter={8}
                  containerClassName="toast-container"
                  toastOptions={{
                    className: 'toast-notification',
                    duration: 4000,
                    style: {
                      background: 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '16px',
                      color: 'white',
                      fontSize: '14px',
                      padding: '16px',
                      boxShadow: '0 8px 32px rgba(31, 38, 135, 0.37)',
                    },
                    success: {
                      iconTheme: {
                        primary: '#27ae60',
                        secondary: 'white',
                      },
                    },
                    error: {
                      iconTheme: {
                        primary: '#e74c3c',
                        secondary: 'white',
                      },
                    },
                  }}
                />
              </div>
            </Router>
          </QueryClientProvider>
        </HelmetProvider>
      </Provider>
    </AppErrorBoundary>
  );
};

export default App;