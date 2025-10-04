import { useState, useEffect, useContext, createContext } from 'react';
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

  const checkSubscriptionStatus = async () => {
    // Only check if user is authenticated
    if (!authenticated) {
      setLoading(false);
      setInitialized(true);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await subscriptionAPI.getStatus();
      setSubscriptionStatus(response.data);
    } catch (error) {
      console.error('Error checking subscription status:', error);
      setError(error.response?.data?.message || 'Failed to check subscription status');
      setSubscriptionStatus(null);
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  };

  useEffect(() => {
    // Initial check
    checkSubscriptionStatus();

    // Set up interval to periodically check auth status and refresh subscription
    const interval = setInterval(() => {
      if (authenticated && !loading) {
        checkSubscriptionStatus();
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [authenticated, loading]);

  // Also check when the component mounts or when localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      if (authenticated) {
        checkSubscriptionStatus();
      } else {
        setSubscriptionStatus(null);
        setLoading(false);
        setInitialized(true);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [authenticated]);

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
