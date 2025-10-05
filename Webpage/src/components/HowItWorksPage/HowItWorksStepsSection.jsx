import { PersonAdd, Palette, Payment, CheckCircle } from '@mui/icons-material';
import { Box } from '@mui/material';
import Section from '../ReusableComponents/Section.jsx';
import Column from '../ReusableComponents/Column.jsx';
import Row from '../ReusableComponents/Row.jsx';
import Grid from '../ReusableComponents/Grid.jsx';
import Text from '../ReusableComponents/Text.jsx';
import Card from '../ReusableComponents/Card.jsx';

const HowItWorksStepsSection = () => {
  const steps = [
    {
      icon: <PersonAdd sx={{ fontSize: 56, color: '#667eea' }} />,
      title: 'Account Setup & Configuration',
      description: 'Register your account and configure your business settings, including company information, branding, and system preferences.',
      details: [
        'Create your secure user account in seconds',
        'Set up company profile and business information',
        'Configure system settings and preferences',
        'Choose your subscription plan (trial available)',
        'Customize invoice templates and branding'
      ],
      time: '5 minutes'
    },
    {
      icon: <Palette sx={{ fontSize: 56, color: '#764ba2' }} />,
      title: 'Build Your Business Database',
      description: 'Add your clients and products to create a comprehensive business database for streamlined invoice creation.',
      details: [
        'Add client information with contact details',
        'Create your product and service catalog',
        'Set up pricing and category organization',
        'Import existing data if migrating from another system',
        'Configure client-specific settings and preferences'
      ],
      time: '15 minutes'
    },
    {
      icon: <Payment sx={{ fontSize: 56, color: '#667eea' }} />,
      title: 'Create & Manage Invoices',
      description: 'Generate professional invoices using templates, track their status, and analyze your business performance through the dashboard.',
      details: [
        'Create invoices using customizable templates',
        'Manage invoice status (Draft, Sent, Paid, Overdue)',
        'Perform bulk operations on multiple invoices',
        'Track payments and send automated reminders',
        'Generate reports and analytics for business insights'
      ],
      time: 'Ongoing'
    }
  ];

  return (
    <Section spacing="large" sx={{ mt: 4 }}>
      <Text variant="h2" weight="bold" align="center" sx={{ mb: 2 }}>
        Three Simple Steps to Success
      </Text>
      <Text variant="h6" align="center" sx={{ 
        color: 'text.secondary', 
        mb: 6, 
        maxWidth: 600, 
        mx: 'auto' 
      }}>
        Our streamlined process gets you from signup to your first invoice in under 30 minutes
      </Text>
      
      <Grid columns={{ xs: 1 }} gap={8} sx={{ maxWidth: 800, mx: 'auto' }}>
        {steps.map((step, index) => (
          <Box key={index} sx={{ position: 'relative' }}>
            {/* Connection line */}
            {index < steps.length - 1 && (
              <Box
                sx={{
                  position: 'absolute',
                  left: '50%',
                  bottom: -40,
                  transform: 'translateX(-50%)',
                  width: 2,
                  height: 80,
                  background: 'linear-gradient(180deg, rgba(102, 126, 234, 0.3) 0%, rgba(118, 75, 162, 0.3) 100%)',
                  display: { xs: 'none', md: 'block' }
                }}
              />
            )}

            <Card variant="modern" sx={{ position: 'relative', overflow: 'visible' }}>
              {/* Step number badge */}
              <Box
                sx={{
                  position: 'absolute',
                  top: -20,
                  right: 20,
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem',
                  fontWeight: 700,
                  boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)',
                  border: '4px solid white'
                }}
              >
                {(index + 1).toString().padStart(2, '0')}
              </Box>

              {/* Time badge */}
              <Box
                sx={{
                  position: 'absolute',
                  top: -10,
                  left: 20,
                  background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                  color: 'white',
                  px: 2,
                  py: 0.5,
                  borderRadius: '16px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  boxShadow: '0 4px 12px rgba(67, 233, 123, 0.3)'
                }}
              >
                {step.time}
              </Box>

              <Row gap={4} sx={{ alignItems: 'flex-start', pt: 3 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 80,
                    height: 80,
                    borderRadius: '20px',
                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                    flexShrink: 0
                  }}
                >
                  {step.icon}
                </Box>
                
                <Column sx={{ flex: 1 }}>
                  <Text variant="h4" weight="bold" sx={{ mb: 2 }}>
                    {step.title}
                  </Text>
                  <Text sx={{ color: 'text.secondary', mb: 3, lineHeight: 1.6 }}>
                    {step.description}
                  </Text>
                  
                  <Column gap={1.5}>
                    {step.details.map((detail, detailIndex) => (
                      <Box key={detailIndex} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <CheckCircle sx={{ color: 'primary.main', fontSize: 18, flexShrink: 0 }} />
                        <Text sx={{ fontSize: '0.95rem', lineHeight: 1.4 }}>
                          {detail}
                        </Text>
                      </Box>
                    ))}
                  </Column>
                </Column>
              </Row>
            </Card>
          </Box>
        ))}
      </Grid>
    </Section>
  );
};

export default HowItWorksStepsSection;
