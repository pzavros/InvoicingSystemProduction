import { useState } from 'react';
import { 
  Send,
  QuestionAnswer,
  BugReport,
  Feedback,
  Support,
  CheckCircle
} from '@mui/icons-material';
import { 
  Box, 
  TextField, 
  Alert, 
  CircularProgress,
  Button as MuiButton
} from '@mui/material';
import Section from '../ReusableComponents/Section.jsx';
import Column from '../ReusableComponents/Column.jsx';
import Row from '../ReusableComponents/Row.jsx';
import Grid from '../ReusableComponents/Grid.jsx';
import Text from '../ReusableComponents/Text.jsx';

const ContactFormSection = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const contactReasons = [
    {
      icon: <QuestionAnswer />,
      title: 'General Questions',
      description: 'Questions about features, pricing, or getting started'
    },
    {
      icon: <BugReport />,
      title: 'Bug Reports',
      description: 'Report issues or unexpected behavior in the system'
    },
    {
      icon: <Feedback />,
      title: 'Feature Requests',
      description: 'Suggest new features or improvements to the platform'
    },
    {
      icon: <Support />,
      title: 'Technical Support',
      description: 'Get help with setup, configuration, or troubleshooting'
    }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/webpage/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim(),
          subject: formData.subject.trim(),
          message: formData.message.trim(),
          source: 'website'
        })
      });

      if (!response.ok) {
        if (response.status === 400) {
          const errorData = await response.json();
          setError('Please check your form data and try again.');
        } else {
          setError('Something went wrong. Please try again later.');
        }
        setLoading(false);
        return;
      }

      setSubmitted(true);
      setLoading(false);
      
      // Reset form after success
      setTimeout(() => {
        setSubmitted(false);
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          subject: '',
          message: ''
        });
      }, 3000);
      
    } catch (err) {
      console.error('Contact form submission error:', err);
      setError('Unable to send message. Please check your connection and try again.');
      setLoading(false);
    }
  };

  return (
    <Section variant="light" spacing="large" sx={{ mt: 8 }}>
      <Row gap={8} sx={{ alignItems: 'flex-start' }}>
        <Column sx={{ flex: 1 }}>
          <Text variant="h2" weight="bold" sx={{ mb: 2 }}>
            Send us a Message
          </Text>
          <Text variant="h6" sx={{ color: 'text.secondary', mb: 4, lineHeight: 1.6 }}>
            Fill out the form below and we'll get back to you as soon as possible. 
            We typically respond within 24 hours.
          </Text>

          {submitted && (
            <Alert 
              severity="success" 
              icon={<CheckCircle />}
              sx={{ mb: 4, borderRadius: 2 }}
            >
              <Text weight="500">
                Thank you for your message! We'll get back to you within 24 hours.
              </Text>
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <Grid columns={{ xs: 1, sm: 2 }} gap={3} sx={{ mb: 3 }}>
              <TextField
                fullWidth
                name="firstName"
                label="First Name"
                variant="outlined"
                required
                value={formData.firstName}
                onChange={handleInputChange}
                disabled={loading || submitted}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    }
                  }
                }}
              />
              <TextField
                fullWidth
                name="lastName"
                label="Last Name"
                variant="outlined"
                required
                value={formData.lastName}
                onChange={handleInputChange}
                disabled={loading || submitted}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    }
                  }
                }}
              />
            </Grid>

            <TextField
              fullWidth
              name="email"
              label="Email Address"
              type="email"
              variant="outlined"
              required
              value={formData.email}
              onChange={handleInputChange}
              disabled={loading || submitted}
              sx={{ 
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover fieldset': {
                    borderColor: 'primary.main',
                  }
                }
              }}
            />

            <TextField
              fullWidth
              name="subject"
              label="Subject"
              variant="outlined"
              required
              value={formData.subject}
              onChange={handleInputChange}
              disabled={loading || submitted}
              sx={{ 
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover fieldset': {
                    borderColor: 'primary.main',
                  }
                }
              }}
            />

            <TextField
              fullWidth
              name="message"
              label="Message"
              multiline
              rows={6}
              variant="outlined"
              required
              placeholder="Tell us about your question, issue, or feedback..."
              value={formData.message}
              onChange={handleInputChange}
              disabled={loading || submitted}
              sx={{ 
                mb: 4,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover fieldset': {
                    borderColor: 'primary.main',
                  }
                }
              }}
            />

            <MuiButton
              type="submit"
              variant="contained"
              size="large"
              disabled={loading || submitted}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Send />}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                px: 4,
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1.1rem',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)'
                }
              }}
            >
              {loading ? 'Sending...' : submitted ? 'Message Sent!' : 'Send Message'}
            </MuiButton>
          </Box>
        </Column>

        <Column sx={{ 
          flex: 1,
          display: { xs: 'none', lg: 'flex' }
        }}>
          <Text variant="h3" weight="bold" sx={{ mb: 3 }}>
            What can we help you with?
          </Text>
          
          <Grid columns={{ xs: 1 }} gap={3}>
            {contactReasons.map((reason, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 2,
                  p: 3,
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: 'divider',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: 'primary.main',
                    background: 'linear-gradient(145deg, rgba(102, 126, 234, 0.02) 0%, rgba(118, 75, 162, 0.02) 100%)',
                    transform: 'translateX(4px)'
                  }
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 40,
                    height: 40,
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                    color: 'primary.main',
                    flexShrink: 0
                  }}
                >
                  {reason.icon}
                </Box>
                <Column>
                  <Text variant="h6" weight="bold" sx={{ mb: 0.5 }}>
                    {reason.title}
                  </Text>
                  <Text sx={{ color: 'text.secondary', fontSize: '0.95rem', lineHeight: 1.5 }}>
                    {reason.description}
                  </Text>
                </Column>
              </Box>
            ))}
          </Grid>

          <Box sx={{ mt: 6, p: 4, borderRadius: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <Text variant="h6" weight="bold" sx={{ mb: 2 }}>
              Quick Response Guarantee
            </Text>
            <Text sx={{ lineHeight: 1.6, opacity: 0.9 }}>
              We pride ourselves on fast response times. Most inquiries receive a response within 4-6 hours, 
              and all messages are answered within 24 hours maximum.
            </Text>
          </Box>
        </Column>
      </Row>
    </Section>
  );
};

export default ContactFormSection;
