import { useState } from 'react';
import { useSubscription } from '../utils/SubscriptionContext';

/**
 * Custom hook to check subscription limits and handle limit-reached scenarios
 */
export const useLimit = () => {
  const { usageStats, canCreate, isPremium } = useSubscription();
  const [limitModalOpen, setLimitModalOpen] = useState(false);
  const [limitModalResource, setLimitModalResource] = useState(null);
  const [limitModalInfo, setLimitModalInfo] = useState(null);

  /**
   * Check if user can create a resource and show modal if limit reached
   * @param {string} resource - 'client', 'category', 'product', 'invoice', or 'template'
   * @returns {boolean} - true if can create, false if limit reached
   */
  const checkLimit = (resource) => {
    // Premium users have no limits
    if (isPremium) {
      return true;
    }

    // Check specific resource limit
    const canCreateResource = canCreate[resource];
    
    if (!canCreateResource) {
      // Show limit reached modal
      setLimitModalResource(resource);
      
      // Add extra info for invoices (current/max/reset date)
      if (resource === 'invoice' && usageStats) {
        setLimitModalInfo({
          current: usageStats.invoicesThisMonth,
          max: usageStats.maxInvoicesPerMonth,
          resetDate: usageStats.nextResetDate,
        });
      } else {
        setLimitModalInfo(null);
      }
      
      setLimitModalOpen(true);
      return false;
    }

    return true;
  };

  /**
   * Close the limit reached modal
   */
  const closeLimitModal = () => {
    setLimitModalOpen(false);
    setLimitModalResource(null);
    setLimitModalInfo(null);
  };

  return {
    checkLimit,
    limitModalOpen,
    limitModalResource,
    limitModalInfo,
    closeLimitModal,
    isPremium,
    usageStats,
    canCreate,
  };
};

export default useLimit;
