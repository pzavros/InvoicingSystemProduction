import { CheckCircle, Settings } from '@mui/icons-material';
import { Box } from '@mui/material';
import Section from '../ReusableComponents/Section.jsx';
import Column from '../ReusableComponents/Column.jsx';
import Row from '../ReusableComponents/Row.jsx';
import Text from '../ReusableComponents/Text.jsx';
import Card from '../ReusableComponents/Card.jsx';
import Button from '../ReusableComponents/Button.jsx';

const FeaturesCapabilitiesSection = () => {
  const businessBenefits = [
    'Get paid faster with professional invoices and automated reminders',
    'Works perfectly on your phone, tablet, or computer',
    'Never lose your data with automatic backups and cloud storage',
    'Easily connect with your favorite business tools and payment systems',
    'Grows with your business from solo freelancer to enterprise',
    'Always works reliably so you can focus on your business',
    'Start immediately with our simple setup process',
    'Deploy anywhere - cloud or on-premise for maximum flexibility'
  ];

  return (
    <Section spacing="large" sx={{ mt: 6 }}>
      <Row gap={8} sx={{ alignItems: 'stretch' }}>
        <Column sx={{ flex: 1 }}>
          <Text variant="h2" weight="bold" sx={{ 
            mb: 4,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundClip: 'text',
            textFillColor: 'transparent',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Built for Your Success
          </Text>
          
          <Text variant="h6" sx={{ mb: 4, lineHeight: 1.7, color: 'text.secondary' }}>
            Every feature is designed to save you time, increase your cash flow, and help 
            your business grow without the hassle.
          </Text>

          <Column gap={2}>
            {businessBenefits.map((capability, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 2,
                  p: 2,
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: 'linear-gradient(145deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
                    transform: 'translateX(8px)'
                  }
                }}
              >
                <CheckCircle 
                  sx={{ 
                    color: '#667eea',
                    fontSize: 20,
                    mt: 0.25,
                    flexShrink: 0
                  }} 
                />
                <Text sx={{ 
                  fontSize: '1rem',
                  lineHeight: 1.5,
                  fontWeight: 500
                }}>
                  {capability}
                </Text>
              </Box>
            ))}
          </Column>
        </Column>

        <Column sx={{ 
          flex: 1,
          display: { xs: 'none', lg: 'flex' },
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Card variant="gradient" sx={{ width: '100%', maxWidth: 400, height: 500, p: 4 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Box
                sx={{
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 4
                }}
              >
                <Settings sx={{ fontSize: 50, color: 'white' }} />
              </Box>
              
              <Text variant="h4" weight="bold" sx={{ mb: 2, color: 'white' }}>
                Ready to Use
              </Text>
              <Text variant="h6" sx={{ mb: 3, color: 'rgba(255,255,255,0.9)' }}>
                Professional Quality
              </Text>
              <Text sx={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.6 }}>
                Trusted by businesses worldwide. Start invoicing professionally today with 
                our reliable, secure, and easy-to-use platform.
              </Text>
            </Box>
          </Card>
        </Column>
      </Row>
    </Section>
  );
};

export default FeaturesCapabilitiesSection;
