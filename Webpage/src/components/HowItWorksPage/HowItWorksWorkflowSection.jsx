import { Box } from '@mui/material';
import Section from '../ReusableComponents/Section.jsx';
import Grid from '../ReusableComponents/Grid.jsx';
import Text from '../ReusableComponents/Text.jsx';
import Card from '../ReusableComponents/Card.jsx';

const HowItWorksWorkflowSection = () => {
  const workflow = [
    {
      step: '01',
      action: 'Login to Dashboard',
      description: 'Access your personalized dashboard with real-time business statistics'
    },
    {
      step: '02',
      action: 'Select Invoice Creation',
      description: 'Choose from existing templates or create a new custom invoice'
    },
    {
      step: '03',
      action: 'Add Client & Items',
      description: 'Select client from database and add products/services from catalog'
    },
    {
      step: '04',
      action: 'Review & Send',
      description: 'Preview invoice, apply branding, and send directly or export as PDF'
    },
    {
      step: '05',
      action: 'Track & Analyze',
      description: 'Monitor payment status and analyze business performance metrics'
    }
  ];

  return (
    <Section variant="light" spacing="large" sx={{ mt: 8 }}>
      <Text variant="h2" weight="bold" align="center" sx={{ mb: 2 }}>
        Detailed Workflow
      </Text>
      <Text variant="h6" align="center" sx={{ 
        color: 'text.secondary', 
        mb: 6, 
        maxWidth: 600, 
        mx: 'auto' 
      }}>
        Step-by-step breakdown of the invoice creation process from login to completion
      </Text>
      
      <Grid columns={{ xs: 1, sm: 2, lg: 5 }} gap={4}>
        {workflow.map((item, index) => (
          <Box key={index} sx={{ position: 'relative' }}>
            {/* Connection arrow */}
            {index < workflow.length - 1 && (
              <Box
                sx={{
                  display: { xs: 'none', lg: 'block' },
                  position: 'absolute',
                  top: 40,
                  right: -30,
                  width: 60,
                  height: 2,
                  background: 'linear-gradient(90deg, rgba(102, 126, 234, 0.3) 0%, rgba(118, 75, 162, 0.3) 100%)',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    right: -4,
                    top: -3,
                    width: 0,
                    height: 0,
                    borderLeft: '8px solid rgba(102, 126, 234, 0.3)',
                    borderTop: '4px solid transparent',
                    borderBottom: '4px solid transparent'
                  }
                }}
              />
            )}

            <Card variant="step" sx={{ textAlign: 'center', height: '100%' }}>
              <Box
                sx={{
                  width: 50,
                  height: 50,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1rem',
                  fontWeight: 700,
                  mx: 'auto',
                  mb: 2
                }}
              >
                {item.step}
              </Box>
              <Text variant="h6" weight="bold" sx={{ mb: 1 }}>
                {item.action}
              </Text>
              <Text sx={{ color: 'text.secondary', fontSize: '0.9rem', lineHeight: 1.5 }}>
                {item.description}
              </Text>
            </Card>
          </Box>
        ))}
      </Grid>
    </Section>
  );
};

export default HowItWorksWorkflowSection;
