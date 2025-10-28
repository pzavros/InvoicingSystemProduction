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
  const [subscriptionTier, setSubscriptionTier] = useState(null);
  const [usageStats, setUsageStats] = useState(null);
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
      
      // Fetch tier, usage stats, and old subscription status in parallel
      const [tierResponse, usageResponse] = await Promise.all([
        subscriptionAPI.getTier(),
        subscriptionAPI.getUsage(),
      ]);
      
      // Only update state if the request wasn't aborted
      if (!abortController.current?.signal.aborted) {
        setSubscriptionTier(tierResponse.data);
        setUsageStats(usageResponse.data);
        
        // For backward compatibility, keep old subscription status structure
        // but mark everyone as having access (since freemium allows everyone in)
        setSubscriptionStatus({
          isActive: true, // Everyone has access now (free or premium)
          isPremium: tierResponse.data.isPremium,
          tier: tierResponse.data.tier,
        });
        
        setInitialized(true);
      }
    } catch (error) {
      // Don't set error if request was aborted
      if (!abortController.current?.signal.aborted) {
        console.error('Error checking subscription status:', error);
        setError(error.response?.data?.message || 'Failed to check subscription status');
        setSubscriptionStatus(null);
        setSubscriptionTier(null);
        setUsageStats(null);
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
      setSubscriptionTier(null);
      setUsageStats(null);
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
    }, 300000); // Check every 5 minutes

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
          setSubscriptionTier(null);
          setUsageStats(null);
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
    subscriptionTier,
    usageStats,
    loading,
    error,
    initialized,
    refreshStatus: checkSubscriptionStatus,
    
    // Everyone has access now (free or premium)
    hasAccess: true,
    
    // Premium status
    isPremium: subscriptionTier?.isPremium || false,
    tier: subscriptionTier?.tier || 'free',
    
    // Usage limits
    canCreate: {
      client: usageStats?.canCreateClient || false,
      category: usageStats?.canCreateCategory || false,
      product: usageStats?.canCreateProduct || false,
      invoice: usageStats?.canCreateInvoice || false,
      template: usageStats?.canCreateTemplate || false,
    },
    
    // For backward compatibility
    isInTrial: false,
    requiresPayment: false,
    daysUntilExpiry: 0,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export default SubscriptionContext;
