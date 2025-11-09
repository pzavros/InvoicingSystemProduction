// src/components/SupportPage/SupportTicketPage.jsx
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  FormLabel,
  OutlinedInput,
  IconButton,
  Zoom,
  Paper
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Support as SupportIcon,
  BugReport as BugIcon,
  Lightbulb as FeatureIcon,
  HelpOutline as OtherIcon,
  CheckCircle as CheckIcon,
  Send as SendIcon,
  Description as IssueIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { createTicket } from './api';

/** ---------- Form Components ---------- **/
const FormGrid = ({ size, children }) => (
  <Grid size={size}>
    {children}
  </Grid>
);

const SectionTitle = ({ children }) => (
  <FormGrid size={{ xs: 12 }}>
    <Typography variant="h6" sx={{ 
      fontWeight: 600, 
      color: 'rgba(15, 23, 42, 0.95)', 
      mb: 2,
      mt: 3,
      fontSize: '1rem',
      letterSpacing: '-0.02em',
      borderBottom: '1px solid rgba(15, 23, 42, 0.08)',
      pb: 1.5
    }}>
      {children}
    </Typography>
  </FormGrid>
);
/** -------------------------------------------------------------------- **/

const SupportTicketPage = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    type: '',
    subject: '',
    description: ''
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    severity: 'success'
  });

  const handleChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.type) newErrors.type = 'Please select a ticket type';
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      const response = await createTicket(formData);
      setReferenceNumber(response.referenceNumber);
      setSubmitted(true);
      setFormData({
        type: '',
        subject: '',
        description: ''
      });
    } catch (err) {
      setNotification({
        show: true,
        message: err.response?.data?.message || 'Failed to submit ticket. Please try again.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAnother = () => {
    setSubmitted(false);
    setReferenceNumber('');
  };

  const handleBack = () => navigate(-1);

  const getTypeIcon = (type) => {
    switch (type) {
      case 'bug':
        return <BugIcon />;
      case 'feature':
        return <FeatureIcon />;
      case 'issue':
        return <IssueIcon />;
      default:
        return <OtherIcon />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'bug':
        return '#dc2626';
      case 'feature':
        return '#8b5cf6';
      case 'issue':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  // Success Screen
  if (submitted) {
    return (
      <Box>
        <Zoom in={submitted}>
          <Box sx={{ maxWidth: 700, mx: 'auto', textAlign: 'center', py: 4 }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '20px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3,
                boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)'
              }}
            >
              <CheckIcon sx={{ fontSize: '3rem', color: 'white' }} />
            </Box>

            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                fontSize: { xs: '1.75rem', sm: '2rem' },
                color: 'rgba(15, 23, 42, 0.95)',
                letterSpacing: '-0.02em',
                mb: 2
              }}
            >
              Ticket Submitted Successfully!
            </Typography>

            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: '12px',
                border: '2px solid rgba(16, 185, 129, 0.2)',
                backgroundColor: 'rgba(16, 185, 129, 0.05)',
                mb: 3
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  color: 'rgba(15, 23, 42, 0.6)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  mb: 1
                }}
              >
                Your Reference Number
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  color: '#10b981',
                  fontSize: '1.5rem',
                  fontFamily: 'monospace',
                  letterSpacing: '0.05em'
                }}
              >
                {referenceNumber}
              </Typography>
            </Paper>

            <Typography
              variant="body1"
              sx={{
                color: 'rgba(15, 23, 42, 0.7)',
                fontSize: '0.9375rem',
                mb: 4,
                lineHeight: 1.6,
                maxWidth: 500,
                mx: 'auto'
              }}
            >
              We've received your support ticket and sent a confirmation email to your registered email address.
              Our team will review your request and get back to you as soon as possible.
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                onClick={handleCreateAnother}
                sx={{
                  minWidth: 160,
                  color: 'rgba(15, 23, 42, 0.65)',
                  borderColor: 'rgba(15, 23, 42, 0.15)',
                  borderRadius: '10px',
                  px: 3,
                  py: 1,
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  letterSpacing: '-0.01em',
                  '&:hover': {
                    borderColor: 'rgba(15, 23, 42, 0.25)',
                    backgroundColor: 'rgba(15, 23, 42, 0.04)'
                  }
                }}
              >
                Submit Another Ticket
              </Button>
            </Box>
          </Box>
        </Zoom>
      </Box>
    );
  }

  // Main Form
  return (
    <Box>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mb: 2,
        pb: 2,
        borderBottom: '1px solid rgba(15, 23, 42, 0.08)'
      }}>
        <IconButton 
          onClick={handleBack}
          sx={{ 
            mr: 2,
            width: 40,
            height: 40,
            borderRadius: '10px',
            border: '1px solid rgba(15, 23, 42, 0.08)',
            backgroundColor: 'rgba(15, 23, 42, 0.02)',
            color: 'rgba(15, 23, 42, 0.65)',
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: 'rgba(15, 23, 42, 0.06)',
              borderColor: 'rgba(15, 23, 42, 0.12)',
              color: 'rgba(15, 23, 42, 0.85)'
            }
          }}
        >
          <ArrowBackIcon fontSize="small" />
        </IconButton>
        <Box>
          <Typography variant="h4" component="h1" sx={{ 
            fontWeight: 700,
            color: 'rgba(15, 23, 42, 0.95)',
            fontSize: { xs: '1.5rem', sm: '2rem' },
            letterSpacing: '-0.02em',
            mb: 0.5
          }}>
            Support Center
          </Typography>
          <Typography variant="body2" sx={{
            color: 'rgba(15, 23, 42, 0.55)',
            fontSize: '0.875rem',
            fontWeight: 500
          }}>
            Submit a support ticket and we'll get back to you shortly
          </Typography>
        </Box>
      </Box>

      {/* Notification */}
      {notification.show && (
        <Alert
          severity={notification.severity}
          onClose={() => setNotification({ ...notification, show: false })}
          sx={{ 
            mb: 2,
            borderRadius: '12px',
            border: '1px solid rgba(15, 23, 42, 0.06)',
            '& .MuiAlert-icon': {
              color: notification.severity === 'success' ? '#10b981' : 
                     notification.severity === 'error' ? '#ef4444' : '#8b5cf6'
            }
          }}
        >
          {notification.message}
        </Alert>
      )}

      {/* Form */}
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={{ xs: 1.5, md: 2 }}>
          
          {/* Ticket Information */}
          <SectionTitle>Ticket Information</SectionTitle>

          {/* Ticket Type */}
          <FormGrid size={{ xs: 12, md: 6 }}>
            <FormLabel sx={{ 
              color: 'rgba(15, 23, 42, 0.75)',
              fontWeight: 600,
              fontSize: '0.875rem',
              mb: 0.5,
              display: 'block'
            }}>
              Ticket Type *
            </FormLabel>
            <FormControl fullWidth>
              <Select
                value={formData.type}
                onChange={handleChange('type')}
                error={!!errors.type}
                displayEmpty
                size="small"
                sx={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  fontSize: '0.875rem',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: errors.type ? '#ef4444' : 'rgba(15, 23, 42, 0.08)',
                    borderWidth: '1px'
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: errors.type ? '#ef4444' : 'rgba(15, 23, 42, 0.15)'
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: errors.type ? '#ef4444' : 'rgba(15, 23, 42, 0.25)',
                    borderWidth: '1.5px'
                  },
                  '& .MuiSelect-select': {
                    padding: '9px 12px'
                  }
                }}
                renderValue={(value) => {
                  if (!value) {
                    return <Typography sx={{ color: 'rgba(15, 23, 42, 0.4)', fontSize: '0.875rem' }}>Select ticket type</Typography>;
                  }
                  return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ display: 'flex', color: getTypeColor(value), fontSize: '1.125rem' }}>
                        {getTypeIcon(value)}
                      </Box>
                      <Typography sx={{ fontSize: '0.875rem', textTransform: 'capitalize', fontWeight: 500 }}>
                        {value === 'issue' ? 'Issue' : value === 'bug' ? 'Bug Report' : value === 'feature' ? 'Feature Request' : 'Other'}
                      </Typography>
                    </Box>
                  );
                }}
              >
                <MenuItem value="issue">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.5 }}>
                    <IssueIcon sx={{ color: '#f59e0b', fontSize: '1.25rem' }} />
                    <Box>
                      <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Issue</Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(15, 23, 42, 0.5)', fontSize: '0.75rem' }}>
                        Report a problem you're experiencing
                      </Typography>
                    </Box>
                  </Box>
                </MenuItem>
                <MenuItem value="bug">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.5 }}>
                    <BugIcon sx={{ color: '#dc2626', fontSize: '1.25rem' }} />
                    <Box>
                      <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Bug Report</Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(15, 23, 42, 0.5)', fontSize: '0.75rem' }}>
                        Report a technical bug or error
                      </Typography>
                    </Box>
                  </Box>
                </MenuItem>
                <MenuItem value="feature">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.5 }}>
                    <FeatureIcon sx={{ color: '#8b5cf6', fontSize: '1.25rem' }} />
                    <Box>
                      <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Feature Request</Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(15, 23, 42, 0.5)', fontSize: '0.75rem' }}>
                        Suggest a new feature or improvement
                      </Typography>
                    </Box>
                  </Box>
                </MenuItem>
                <MenuItem value="other">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.5 }}>
                    <OtherIcon sx={{ color: '#6b7280', fontSize: '1.25rem' }} />
                    <Box>
                      <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Other</Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(15, 23, 42, 0.5)', fontSize: '0.75rem' }}>
                        General inquiry or question
                      </Typography>
                    </Box>
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
            {errors.type && (
              <Typography variant="caption" sx={{ 
                mt: 0.5, 
                display: 'block',
                color: '#ef4444',
                fontSize: '0.75rem',
                fontWeight: 500
              }}>
                {errors.type}
              </Typography>
            )}
          </FormGrid>

          {/* Subject */}
          <FormGrid size={{ xs: 12, md: 6 }}>
            <FormLabel sx={{ 
              color: 'rgba(15, 23, 42, 0.75)',
              fontWeight: 600,
              fontSize: '0.875rem',
              mb: 0.5,
              display: 'block'
            }}>
              Subject *
            </FormLabel>
            <OutlinedInput
              value={formData.subject}
              onChange={handleChange('subject')}
              error={!!errors.subject}
              required
              size="small"
              fullWidth
              placeholder="Brief summary of your request"
              sx={{
                backgroundColor: 'white',
                borderRadius: '12px',
                fontSize: '0.875rem',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: errors.subject ? '#ef4444' : 'rgba(15, 23, 42, 0.08)',
                  borderWidth: '1px'
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: errors.subject ? '#ef4444' : 'rgba(15, 23, 42, 0.15)'
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: errors.subject ? '#ef4444' : 'rgba(15, 23, 42, 0.25)',
                  borderWidth: '1.5px'
                },
                '& .MuiInputBase-input': {
                  padding: '9px 12px'
                }
              }}
            />
            {errors.subject && (
              <Typography variant="caption" sx={{ 
                mt: 0.5, 
                display: 'block',
                color: '#ef4444',
                fontSize: '0.75rem',
                fontWeight: 500
              }}>
                {errors.subject}
              </Typography>
            )}
          </FormGrid>

          {/* Description */}
          <FormGrid size={{ xs: 12 }}>
            <FormLabel sx={{ 
              color: 'rgba(15, 23, 42, 0.75)',
              fontWeight: 600,
              fontSize: '0.875rem',
              mb: 0.5,
              display: 'block'
            }}>
              Description *
            </FormLabel>
            <OutlinedInput
              value={formData.description}
              onChange={handleChange('description')}
              error={!!errors.description}
              required
              multiline
              rows={8}
              fullWidth
              placeholder="Please provide as much detail as possible..."
              sx={{
                backgroundColor: 'white',
                borderRadius: '12px',
                fontSize: '0.875rem',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: errors.description ? '#ef4444' : 'rgba(15, 23, 42, 0.08)',
                  borderWidth: '1px'
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: errors.description ? '#ef4444' : 'rgba(15, 23, 42, 0.15)'
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: errors.description ? '#ef4444' : 'rgba(15, 23, 42, 0.25)',
                  borderWidth: '1.5px'
                },
                '& .MuiInputBase-input': {
                  padding: '12px'
                }
              }}
            />
            {errors.description && (
              <Typography variant="caption" sx={{ 
                mt: 0.5, 
                display: 'block',
                color: '#ef4444',
                fontSize: '0.75rem',
                fontWeight: 500
              }}>
                {errors.description}
              </Typography>
            )}
          </FormGrid>

          {/* Action Buttons */}
          <FormGrid size={{ xs: 12 }}>
            <Box sx={{ 
              display: 'flex', 
              gap: 2, 
              justifyContent: 'flex-end',
              mt: 3,
              pt: 3,
              borderTop: '1px solid rgba(15, 23, 42, 0.08)'
            }}>
              <Button
                variant="outlined"
                onClick={handleBack}
                disabled={loading}
                sx={{
                  minWidth: 120,
                  color: 'rgba(15, 23, 42, 0.65)',
                  borderColor: 'rgba(15, 23, 42, 0.15)',
                  borderRadius: '10px',
                  px: 3,
                  py: 1,
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  letterSpacing: '-0.01em',
                  '&:hover': {
                    borderColor: 'rgba(15, 23, 42, 0.25)',
                    backgroundColor: 'rgba(15, 23, 42, 0.04)'
                  }
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <SendIcon />}
                sx={{
                  minWidth: 150,
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                  color: 'white',
                  boxShadow: 'none',
                  borderRadius: '10px',
                  px: 3,
                  py: 1,
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  letterSpacing: '-0.01em',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                    boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
                  },
                  '&.Mui-disabled': {
                    background: 'rgba(15, 23, 42, 0.3)',
                    color: 'rgba(255, 255, 255, 0.6)'
                  }
                }}
              >
                {loading ? 'Submitting...' : 'Submit Ticket'}
              </Button>
            </Box>
          </FormGrid>

        </Grid>
      </Box>
    </Box>
  );
};

export default SupportTicketPage;
