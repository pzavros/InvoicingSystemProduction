import { CheckCircle, TrendingUp } from '@mui/icons-material';
import { Box } from '@mui/material';
import Section from '../ReusableComponents/Section.jsx';
import Row from '../ReusableComponents/Row.jsx';
import Column from '../ReusableComponents/Column.jsx';
import Text from '../ReusableComponents/Text.jsx';
import Card from '../ReusableComponents/Card.jsx';
import IconBox from '../ReusableComponents/IconBox.jsx';

const WhyChooseUsSection = () => {
  const benefits = [
    'Complete CRUD Operations - Full Create, Read, Update, Delete functionality for all entities',
    'Multi-Currency Support - Built-in currency management for international business',
    'Advanced Status Management - Track invoice lifecycle with bulk status updates',
    'Trial & Subscription System - Trial periods and subscription management built-in',
    'Real-Time Analytics - Dashboard with earnings breakdown and business statistics',
    'Template System - Customizable invoice templates with brand consistency',
    'Excel Export - Generate comprehensive logistics and invoice reports',
    'Secure Authentication - JWT-based security with user authorization'
  ];

  return (
    <Section spacing="large" sx={{ mt: 4 }}>
      <Row gap={6} sx={{ alignItems: 'stretch' }}>
        <Column sx={{ flex: 1 }}>
          <Text variant="h2" weight="bold" sx={{ 
            mb: 4,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundClip: 'text',
            textFillColor: 'transparent',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Why Choose Our Invoicing System?
          </Text>
          
          <Text variant="h6" sx={{ 
            color: 'text.secondary',
            mb: 4,
            lineHeight: 1.6
          }}>
            A production-ready invoicing system with comprehensive features built for real business needs. 
            Here's what our platform offers:
          </Text>

          <Column gap={3}>
            {benefits.map((benefit, index) => (
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
                    fontSize: 24,
                    mt: 0.25,
                    flexShrink: 0
                  }} 
                />
                <Text sx={{ 
                  fontSize: '1.1rem',
                  lineHeight: 1.5,
                  fontWeight: 500
                }}>
                  {benefit}
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
          <Card variant="gradient" sx={{ 
            width: '100%', 
            maxWidth: 400, 
            height: { xs: 'auto', md: 500 },
            minHeight: { xs: 300, md: 500 }
          }}>
            <IconBox size={80} color="white" sx={{ mb: { xs: 3, md: 4 } }}>
              <TrendingUp sx={{ fontSize: 40 }} />
            </IconBox>
            
            <Text variant="h3" weight="bold" sx={{ mb: 2, color: 'white' }}>
              Full-Stack
            </Text>
            <Text variant="h6" sx={{ mb: 2, color: 'rgba(255,255,255,0.9)' }}>
              Solution
            </Text>
            <Text sx={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.6 }}>
              Complete invoicing solution with modern web interface and powerful backend
            </Text>
          </Card>
        </Column>
      </Row>
    </Section>
  );
};

export default WhyChooseUsSection;
