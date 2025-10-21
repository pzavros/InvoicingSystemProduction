import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
  Box,
  IconButton,
  Alert,
  CircularProgress,
  Button as MuiButton
} from '@mui/material';
import {
  Close,
  Email,
  Notifications,
  CheckCircle
} from '@mui/icons-material';
import Column from './Column.jsx';
import Row from './Row.jsx';
import Text from './Text.jsx';

const WaitlistModal = ({ open, onClose }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted!', { email, name, company });
    
    if (!email) {
      setError('Email is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/webpage/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim() || null,
          company: company.trim() || null,
          source: 'website'
        })
      });

      if (!response.ok) {
        if (response.status === 400 || response.status === 409) {
          const errorData = await response.json();
          if (errorData.message && (errorData.message.includes('already exists') || errorData.message.includes('Email already exists'))) {
            setError('This email is already on our waitlist!');
          } else {
            setError('Invalid information provided. Please check your details.');
          }
        } else if (response.status === 429) {
          setError('Too many requests. Please try again later.');
        } else {
          setError('Something went wrong. Please try again.');
        }
        setLoading(false);
        return;
      }

      const result = await response.json();
      
      // Also store locally as backup
      const waitlistData = JSON.parse(localStorage.getItem('invoiceSystemWaitlist') || '[]');
      const newEntry = {
        id: result.id || Date.now(),
        email: email.trim(),
        name: name.trim(),
        company: company.trim(),
        timestamp: new Date().toISOString()
      };
      
      // Update local storage
      const existingIndex = waitlistData.findIndex(entry => entry.email === email);
      if (existingIndex >= 0) {
        waitlistData[existingIndex] = newEntry;
      } else {
        waitlistData.push(newEntry);
      }
      localStorage.setItem('invoiceSystemWaitlist', JSON.stringify(waitlistData));
      
      setSubmitted(true);
      setLoading(false);
      
      // Auto close after success
      setTimeout(() => {
        onClose();
        setTimeout(() => {
          setSubmitted(false);
          setEmail('');
          setName('');
          setCompany('');
        }, 500);
      }, 2000);
      
    } catch (err) {
      console.error('Waitlist submission error:', err);
      
      // Fallback to localStorage if API fails
      try {
        const waitlistData = JSON.parse(localStorage.getItem('invoiceSystemWaitlist') || '[]');
        const newEntry = {
          id: Date.now(),
          email: email.trim(),
          name: name.trim(),
          company: company.trim(),
          timestamp: new Date().toISOString(),
          offline: true
        };
        
        if (waitlistData.some(entry => entry.email === email)) {
          setError('This email is already on our waitlist!');
          setLoading(false);
          return;
        }

        waitlistData.push(newEntry);
        localStorage.setItem('invoiceSystemWaitlist', JSON.stringify(waitlistData));
        
        setSubmitted(true);
        setLoading(false);
        
        setTimeout(() => {
          onClose();
          setTimeout(() => {
            setSubmitted(false);
            setEmail('');
            setName('');
            setCompany('');
          }, 500);
        }, 2000);
      } catch (localErr) {
        setError('Unable to join waitlist. Please check your connection and try again.');
        setLoading(false);
      }
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      setTimeout(() => {
        setSubmitted(false);
        setEmail('');
        setName('');
        setCompany('');
        setError('');
      }, 300);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          background: 'linear-gradient(145deg, #ffffff 0%, #f8faff 100%)',
          boxShadow: '0 20px 60px rgba(102, 126, 234, 0.15)',
          overflow: 'visible'
        }
      }}
    >
      <DialogTitle sx={{ p: 0, position: 'relative' }}>
        <Box
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            p: 4,
            borderRadius: '16px 16px 0 0',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
              opacity: 0.3
            }
          }}
        >
          <IconButton
            onClick={handleClose}
            disabled={loading}
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              color: 'white',
              '&:hover': { background: 'rgba(255,255,255,0.1)' }
            }}
          >
            <Close />
          </IconButton>

          {!submitted ? (
            <Column gap={2}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 50,
                    height: 50,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Notifications sx={{ fontSize: 24 }} />
                </Box>
                <Column>
                  <Text variant="h4" weight="bold" sx={{ color: 'white' }}>
                    Join the Waitlist
                  </Text>
                  <Text sx={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem' }}>
                    Be first to access our invoicing system
                  </Text>
                </Column>
              </Box>
            </Column>
          ) : (
            <Column gap={2} sx={{ alignItems: 'center', py: 2 }}>
              <CheckCircle sx={{ fontSize: 48, color: 'white' }} />
              <Text variant="h4" weight="bold" sx={{ color: 'white' }}>
                You're In!
              </Text>
              <Text sx={{ color: 'rgba(255,255,255,0.9)', textAlign: 'center' }}>
                We'll notify you as soon as we launch
              </Text>
            </Column>
          )}
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 4 }}>
        {!submitted ? (
          <Column gap={3}>
            <Text sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
              Our professional invoicing system is coming soon! Join our waitlist to get early access 
              and be notified when we launch. Plus, early users get special pricing.
            </Text>

            {error && (
              <Alert severity="error" sx={{ borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              <Column gap={3}>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  InputProps={{
                    startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      '&:hover fieldset': { borderColor: 'primary.main' }
                    }
                  }}
                />

                <Row gap={2}>
                  <TextField
                    fullWidth
                    label="First Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        '&:hover fieldset': { borderColor: 'primary.main' }
                      }
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Company (Optional)"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    disabled={loading}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        '&:hover fieldset': { borderColor: 'primary.main' }
                      }
                    }}
                  />
                </Row>

                <MuiButton
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading || !email}
                  fullWidth
                  onClick={handleSubmit}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Notifications />}
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    py: 1.5,
                    fontSize: '1.1rem',
                    textTransform: 'none',
                    borderRadius: 2,
                    fontWeight: 600,
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)'
                    }
                  }}
                >
                  {loading ? 'Joining Waitlist...' : 'Join Waitlist'}
                </MuiButton>

                <Text sx={{ fontSize: '0.8rem', color: 'text.secondary', textAlign: 'center' }}>
                  We respect your privacy. No spam, just updates about our launch.
                </Text>
              </Column>
            </Box>
          </Column>
        ) : (
          <Column gap={3} sx={{ alignItems: 'center', py: 2 }}>
            <Alert severity="success" sx={{ width: '100%', borderRadius: 2 }}>
              <Text weight="500">
                Welcome to the waitlist! You'll receive an email confirmation shortly.
              </Text>
            </Alert>
            
            <Box sx={{ textAlign: 'center' }}>
              <Text sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                🚀 You're now in line for early access<br />
                📧 We'll email you when we launch<br />
                💰 Early users get 50% off first year
              </Text>
            </Box>
          </Column>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default WaitlistModal;
