import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Grid,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider,
  Paper,
  Box,
  Fade,
  Grow,
  Stack,
} from '@mui/material';
import {
  CheckCircle,
  Schedule,
  Warning,
  Cancel,
  Payment,
  History,
  Star,
  CreditCard,
} from '@mui/icons-material';
import Page from '../ReusableComponents/Page';
import Section from '../ReusableComponents/Section';
import { subscriptionAPI } from './subscriptionAPI';
import { useSubscription } from '../../utils/SubscriptionContext';
import PaymentDialog from './PaymentDialog';

const SubscriptionPage = () => {
  const { subscriptionStatus, loading: subscriptionLoading, refreshStatus } = useSubscription();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

    const fetchSubscriptionData = async () => {
    try {
      setLoading(true);
      const paymentsResponse = await subscriptionAPI.getPayments();
      setPayments(paymentsResponse.data);
    } catch (error) {
      console.error('Error fetching payment data:', error);
      setError('Failed to load payment data');
    } finally {
      setLoading(false);
    }
  };

  const handleStartTrial = async () => {
    try {
      setActionLoading(true);
      await subscriptionAPI.startTrial();
      setSuccess('7-day trial started successfully!');
      // Refresh subscription status from context
      await refreshStatus();
      await fetchSubscriptionData();
    } catch (error) {
      console.error('Error starting trial:', error);
      setError(error.response?.data?.message || 'Failed to start trial');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      setActionLoading(true);
      await subscriptionAPI.cancelSubscription();
      setSuccess('Subscription cancelled successfully');
      setCancelDialogOpen(false);
      // Refresh subscription status from context
      await refreshStatus();
      await fetchSubscriptionData();
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      setError(error.response?.data?.message || 'Failed to cancel subscription');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusChip = (status, isTrialActive, isActive) => {
    let customStyles = {};
    let label = status;
    let icon = null;

    if (isTrialActive) {
      label = 'Trial Active';
      icon = <Star />;
      customStyles = {
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        color: '#059669',
        border: '1px solid rgba(16, 185, 129, 0.2)',
        fontWeight: 600
      };
    } else if (isActive) {
      label = 'Active';
      icon = <CheckCircle />;
      customStyles = {
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        color: '#059669',
        border: '1px solid rgba(16, 185, 129, 0.2)',
        fontWeight: 600
      };
    } else {
      switch (status) {
        case 'Trial':
          icon = <Schedule />;
          customStyles = {
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            color: '#2563eb',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            fontWeight: 600
          };
          break;
        case 'Expired':
          icon = <Warning />;
          customStyles = {
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            color: '#dc2626',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            fontWeight: 600
          };
          break;
        case 'Cancelled':
          icon = <Cancel />;
          customStyles = {
            backgroundColor: 'rgba(107, 114, 128, 0.1)',
            color: '#4b5563',
            border: '1px solid rgba(107, 114, 128, 0.2)',
            fontWeight: 600
          };
          break;
        default:
          customStyles = {
            backgroundColor: 'rgba(107, 114, 128, 0.1)',
            color: '#4b5563',
            border: '1px solid rgba(107, 114, 128, 0.2)',
            fontWeight: 600
          };
      }
    }

    return (
      <Chip 
        icon={icon} 
        label={label} 
        sx={{
          ...customStyles,
          borderRadius: 2,
          fontSize: '0.75rem',
          minWidth: '100px',
          '& .MuiChip-label': {
            px: 1.5,
            py: 0.5
          },
          '& .MuiChip-icon': {
            color: 'inherit'
          }
        }}
      />
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading || subscriptionLoading) {
    return (
      <Page>
        <Section>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
            <CircularProgress size={60} sx={{ color: 'var(--color-primary)' }} />
          </Box>
        </Section>
      </Page>
    );
  }

  return (
    <Page>
      <Section>
        <Fade in={true} timeout={800}>
          <Box>
            <Typography 
              variant="h4" 
              gutterBottom 
              sx={{ 
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 3
              }}
            >
              Subscription Management
            </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                  {error}
                </Alert>
              )}

              {success && (
                <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
                  {success}
                </Alert>
              )}

              <Box
                sx={{
                  display: 'grid',
                  gap: 3,
                  gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' },
                  mb: 4
                }}
              >
                {/* Subscription Status Card */}
                <Grow in={true} timeout={600}>
                  <Paper
                    elevation={4}
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
                      border: '1px solid rgba(79, 70, 229, 0.1)',
                      backdropFilter: 'blur(10px)',
                      transition: 'all 0.3s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 12px 24px rgba(79, 70, 229, 0.12)'
                      }
                    }}
                  >
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                          <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'var(--color-text-primary)' }}>
                            Current Subscription
                          </Typography>
                          {subscriptionStatus && getStatusChip(
                            subscriptionStatus.status,
                            subscriptionStatus.isTrialActive,
                            subscriptionStatus.isActive
                          )}
                        </Box>

                        {subscriptionStatus ? (
                          <Box
                            sx={{
                              display: 'grid',
                              gap: 2,
                              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }
                            }}
                          >
                            <Box>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                Monthly Price
                              </Typography>
                              <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>
                                €{subscriptionStatus.monthlyPrice.toFixed(2)}
                              </Typography>
                            </Box>

                            {subscriptionStatus.isTrialActive && subscriptionStatus.trialEndDate && (
                              <Box>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                  Trial Ends
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                  {formatDate(subscriptionStatus.trialEndDate)}
                                </Typography>
                              </Box>
                            )}

                            {subscriptionStatus.nextPaymentDate && !subscriptionStatus.isTrialActive && (
                              <Box>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                  Next Payment
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                  {formatDate(subscriptionStatus.nextPaymentDate)}
                                </Typography>
                              </Box>
                            )}

                            <Box>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                Days Until Expiry
                              </Typography>
                              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                {subscriptionStatus.daysUntilExpiry} days
                              </Typography>
                            </Box>
                          </Box>
                        ) : (
                          <Typography variant="body1" color="text.secondary">
                            No active subscription found
                          </Typography>
                        )}

                        <Stack mt={3} direction="row" spacing={2} flexWrap="wrap">
                          {!subscriptionStatus?.isActive && !subscriptionStatus?.isTrialActive && (
                            <Button
                              variant="contained"
                              onClick={handleStartTrial}
                              disabled={actionLoading}
                              startIcon={<Star />}
                              sx={{
                                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: 600,
                                px: 3,
                                '&:hover': {
                                  background: 'linear-gradient(135deg, #4338ca 0%, #6d28d9 100%)',
                                }
                              }}
                            >
                              Start 7-Day Trial
                            </Button>
                          )}

                          {subscriptionStatus?.requiresPayment && (
                            <Button
                              variant="contained"
                              onClick={() => setPaymentDialogOpen(true)}
                              disabled={actionLoading}
                              startIcon={<Payment />}
                              sx={{
                                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: 600,
                                px: 3,
                                '&:hover': {
                                  background: 'linear-gradient(135deg, #047857 0%, #065f46 100%)',
                                }
                              }}
                            >
                              Pay €{subscriptionStatus.monthlyPrice.toFixed(2)}
                            </Button>
                          )}

                          {subscriptionStatus?.isActive && (
                            <Button
                              variant="outlined"
                              onClick={() => setCancelDialogOpen(true)}
                              disabled={actionLoading}
                              startIcon={<Cancel />}
                              sx={{
                                borderColor: '#dc2626',
                                color: '#dc2626',
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: 600,
                                px: 3,
                                '&:hover': {
                                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                  borderColor: '#dc2626',
                                }
                              }}
                            >
                              Cancel Subscription
                            </Button>
                          )}
                        </Stack>
                      </Paper>
                    </Grow>

                {/* Pricing Info Card */}
                <Grow in={true} timeout={800}>
                  <Paper
                    elevation={4}
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
                      border: '1px solid rgba(79, 70, 229, 0.1)',
                      backdropFilter: 'blur(10px)',
                      transition: 'all 0.3s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 12px 24px rgba(79, 70, 229, 0.12)'
                      }
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: 'var(--color-text-primary)' }}>
                      Pricing Plan
                    </Typography>
                    <Box textAlign="center" py={2}>
                      <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>
                        €20
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        per month
                      </Typography>
                    </Box>
                    <Typography variant="body2" gutterBottom sx={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      What's included:
                    </Typography>
                    <List dense>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemText 
                          primary="Unlimited invoices" 
                          primaryTypographyProps={{ fontSize: '0.875rem' }}
                        />
                      </ListItem>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemText 
                          primary="Product catalog management" 
                          primaryTypographyProps={{ fontSize: '0.875rem' }}
                        />
                      </ListItem>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemText 
                          primary="Dashboard analytics" 
                          primaryTypographyProps={{ fontSize: '0.875rem' }}
                        />
                      </ListItem>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemText 
                          primary="PDF export" 
                          primaryTypographyProps={{ fontSize: '0.875rem' }}
                        />
                      </ListItem>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemText 
                          primary="Email support" 
                          primaryTypographyProps={{ fontSize: '0.875rem' }}
                        />
                      </ListItem>
                    </List>
                  </Paper>
                </Grow>
              </Box>

              {/* Payment History */}
              <Grow in={true} timeout={1000}>
                <Paper
                  elevation={4}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
                    border: '1px solid rgba(79, 70, 229, 0.1)',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 12px 24px rgba(79, 70, 229, 0.12)'
                    }
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1} mb={3}>
                    <History sx={{ color: 'var(--color-primary)' }} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'var(--color-text-primary)' }}>
                      Payment History
                    </Typography>
                  </Box>
                  {payments.length > 0 ? (
                    <Stack spacing={2}>
                      {payments.map((payment) => (
                        <Paper 
                          key={payment.id} 
                          sx={{ 
                            p: 2, 
                            borderRadius: 2,
                            background: 'rgba(59, 130, 246, 0.02)',
                            border: '1px solid rgba(59, 130, 246, 0.1)'
                          }}
                        >
                          <Box
                            sx={{
                              display: 'grid',
                              gap: 2,
                              gridTemplateColumns: { xs: '1fr', sm: 'repeat(4, 1fr)' },
                              alignItems: 'center'
                            }}
                          >
                            <Box>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                Amount
                              </Typography>
                              <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>
                                €{payment.amount.toFixed(2)}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                Date
                              </Typography>
                              <Typography variant="body1">
                                {formatDate(payment.paymentDate)}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                Status
                              </Typography>
                              <Chip
                                label={payment.status}
                                size="small"
                                sx={{
                                  backgroundColor: payment.status === 'Succeeded' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(107, 114, 128, 0.1)',
                                  color: payment.status === 'Succeeded' ? '#059669' : '#4b5563',
                                  border: payment.status === 'Succeeded' ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(107, 114, 128, 0.2)',
                                  fontWeight: 600,
                                  borderRadius: 2,
                                }}
                              />
                            </Box>
                            <Box>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                Description
                              </Typography>
                              <Typography variant="body2">
                                {payment.description || 'Monthly subscription'}
                              </Typography>
                            </Box>
                          </Box>
                        </Paper>
                      ))}
                    </Stack>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No payment history available
                    </Typography>
                  )}
                </Paper>
              </Grow>

              {/* Payment Dialog */}
              <PaymentDialog
                open={paymentDialogOpen}
                onClose={() => setPaymentDialogOpen(false)}
                amount={subscriptionStatus?.monthlyPrice || 20}
                onSuccess={() => {
                  setPaymentDialogOpen(false);
                  setSuccess('Payment processed successfully!');
                  fetchSubscriptionData();
                }}
                onError={(error) => {
                  setError(error);
                }}
              />

              {/* Cancel Confirmation Dialog */}
              <Dialog 
                open={cancelDialogOpen} 
                onClose={() => setCancelDialogOpen(false)}
                PaperProps={{
                  sx: {
                    borderRadius: 3,
                    background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
                  }
                }}
              >
                <DialogTitle sx={{ fontWeight: 'bold', color: 'var(--color-text-primary)' }}>
                  Cancel Subscription
                </DialogTitle>
                <DialogContent>
                  <Typography>
                    Are you sure you want to cancel your subscription? You will lose access to all features
                    at the end of your current billing period.
                  </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                  <Button 
                    onClick={() => setCancelDialogOpen(false)} 
                    disabled={actionLoading}
                    sx={{ textTransform: 'none', borderRadius: 2 }}
                  >
                    Keep Subscription
                  </Button>
                  <Button
                    onClick={handleCancelSubscription}
                    disabled={actionLoading}
                    startIcon={actionLoading && <CircularProgress size={16} />}
                    sx={{
                      backgroundColor: '#dc2626',
                      color: 'white',
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      '&:hover': {
                        backgroundColor: '#b91c1c',
                      }
                    }}
                  >
                    Cancel Subscription
                  </Button>
                </DialogActions>
              </Dialog>
            </Box>
          </Fade>
        </Section>
      </Page>
    );
  };

  export default SubscriptionPage;
