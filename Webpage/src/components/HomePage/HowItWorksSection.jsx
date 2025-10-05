import { PersonAdd, Palette, Payment } from '@mui/icons-material';
import { Box } from '@mui/material';
import Section from '../ReusableComponents/Section.jsx';
import Grid from '../ReusableComponents/Grid.jsx';
import Card from '../ReusableComponents/Card.jsx';
import Text from '../ReusableComponents/Text.jsx';

const HowItWorksSection = () => {
  const steps = [
    {
      icon: <PersonAdd sx={{ fontSize: 56, color: '#667eea' }} />,
      title: 'Register & Setup',
      description: 'Create your account, configure system settings, and add your business information to get started.'
    },
    {
      icon: <Palette sx={{ fontSize: 56, color: '#764ba2' }} />,
      title: 'Add Clients & Products',
      description: 'Build your client database and product catalog using the integrated management system with search capabilities.'
    },
    {
      icon: <Payment sx={{ fontSize: 56, color: '#667eea' }} />,
      title: 'Create & Track Invoices',
      description: 'Generate professional invoices using templates, manage status updates, and analyze performance through the dashboard.'
    }
  ];

  return (
    <Section 
      variant="light"
      title="How It Works" 
      subtitle="Complete invoicing workflow from setup to analytics in three simple steps"
      spacing="large"
      sx={{ mt: 4, mb: 4 }}
    >
      <Grid columns={{ xs: 1, md: 3 }} gap={{ xs: 8, md: 6 }} sx={{ mt: 4 }}>
        {steps.map((step, index) => (
          <Box key={index} sx={{ position: 'relative', pt: 3 }}>
            {/* Connection line for desktop */}
            {index < steps.length - 1 && (
              <Box
                sx={{
                  display: { xs: 'none', md: 'block' },
                  position: 'absolute',
                  top: 120,
                  right: -50,
                  width: 100,
                  height: 2,
                  background: 'linear-gradient(90deg, rgba(102, 126, 234, 0.3) 0%, rgba(118, 75, 162, 0.3) 100%)',
                  zIndex: 0
                }}
              />
            )}

            {/* Step Number - positioned outside the card */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                right: 20,
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
                boxShadow: '0 6px 20px rgba(102, 126, 234, 0.3)',
                zIndex: 2,
                border: '3px solid white'
              }}
            >
              {(index + 1).toString().padStart(2, '0')}
            </Box>

            <Card variant="step" title={step.title} icon={step.icon} sx={{ pt: 4 }}>
              <Text sx={{ 
                color: 'text.secondary',
                lineHeight: 1.6,
                maxWidth: 280,
                mx: 'auto'
              }}>
                {step.description}
              </Text>
            </Card>
          </Box>
        ))}
      </Grid>
    </Section>
  );
};

export default HowItWorksSection;
