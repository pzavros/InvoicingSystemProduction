import { useState, useEffect, useContext, createContext, useCallback, useRef } from 'react';
import { subscriptionAPI } from '../components/SubscriptionPage/subscriptionAPI';
import { useAuth } from './AuthContext';

const SubscriptionContext = createContext();

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

export const SubscriptionProvider = ({ children }) => {
  const { authenticated } = useAuth();
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);
  const lastCallTime = useRef(0);
  const abortController = useRef(null);

  const checkSubscriptionStatus = useCallback(async (force = false) => {
    // Debounce: prevent calls within 1 second of each other unless forced
    const now = Date.now();
    if (!force && now - lastCallTime.current < 1000) {
      return;
    }
    lastCallTime.current = now;

    // Only check if user is authenticated
    if (!authenticated) {
      setLoading(false);
      setInitialized(true);
      return;
    }

    // Cancel any existing request
    if (abortController.current) {
      abortController.current.abort();
    }
    abortController.current = new AbortController();

    try {
      setLoading(true);
      setError(null);
      const response = await subscriptionAPI.getStatus();
      
      // Only update state if the request wasn't aborted
      if (!abortController.current?.signal.aborted) {
        setSubscriptionStatus(response.data);
        setInitialized(true);
      }
    } catch (error) {
      // Don't set error if request was aborted
      if (!abortController.current?.signal.aborted) {
        console.error('Error checking subscription status:', error);
        setError(error.response?.data?.message || 'Failed to check subscription status');
        setSubscriptionStatus(null);
        setInitialized(true);
      }
    } finally {
      if (!abortController.current?.signal.aborted) {
        setLoading(false);
      }
    }
  }, [authenticated]);

  useEffect(() => {
    // Initial check when authentication status changes
    if (authenticated && !initialized) {
      checkSubscriptionStatus(true); // Force initial call
    } else if (!authenticated) {
      // Clear subscription status when user logs out
      setSubscriptionStatus(null);
      setInitialized(false);
      setLoading(false);
      setError(null);
    }
  }, [authenticated, initialized, checkSubscriptionStatus]);

  useEffect(() => {
    // Set up interval to periodically refresh subscription status
    if (!authenticated || !initialized) return;
    
    const interval = setInterval(() => {
      if (authenticated && !loading) {
        checkSubscriptionStatus(true); // Force periodic refresh
      }
    }, 600000); // Check every 10 minutes (further reduced frequency)

    return () => clearInterval(interval);
  }, [authenticated, initialized, loading, checkSubscriptionStatus]);

  // Handle storage changes (e.g., login/logout in another tab)
  useEffect(() => {
    const handleStorageChange = (event) => {
      // Only react to auth-related storage changes
      if (event.key === 'authToken' || event.key === 'user') {
        if (authenticated && initialized) {
          checkSubscriptionStatus(true);
        } else if (!authenticated) {
          setSubscriptionStatus(null);
          setLoading(false);
          setInitialized(false);
          setError(null);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [authenticated, initialized, checkSubscriptionStatus]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, []);

  const value = {
    subscriptionStatus,
    loading,
    error,
    initialized,
    refreshStatus: checkSubscriptionStatus,
    hasAccess: subscriptionStatus?.IsActive || subscriptionStatus?.isActive || false,
    isInTrial: subscriptionStatus?.IsTrialActive || subscriptionStatus?.isTrialActive || false,
    requiresPayment: subscriptionStatus?.RequiresPayment || subscriptionStatus?.requiresPayment || false,
    daysUntilExpiry: subscriptionStatus?.DaysUntilExpiry || subscriptionStatus?.daysUntilExpiry || 0,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export default SubscriptionContext;
