import { Box, Chip, Stack } from '@mui/material';
import Section from '../ReusableComponents/Section.jsx';
import Text from '../ReusableComponents/Text.jsx';

const FreelancerCountriesSection = () => {
  const countries = [
    'United States',
    'United Kingdom', 
    'Canada', 
    'Australia', 
    'Germany',
    'France',
    'Spain',
    'Netherlands',
    'Singapore',
    'UAE'
  ];

  return (
    <Section variant="light" spacing="large">
      <Text variant="h2" weight="bold" align="center" sx={{ mb: 4 }}>
        Serving Freelancers Globally
      </Text>
      <Text variant="body1" align="center" sx={{ 
        mb: 4, 
        fontSize: '1.1rem', 
        maxWidth: 800, 
        mx: 'auto',
        lineHeight: 1.7,
        color: 'text.secondary'
      }}>
        Whether you're a developer in San Francisco, designer in London, consultant in Toronto, or writer in Sydney, 
        our invoicing system is accessible 24/7 from anywhere in the world. Invoice your clients from your home office, 
        coworking space, or while traveling - on any device.
      </Text>
      
      <Stack 
        direction="row" 
        spacing={2} 
        justifyContent="center" 
        flexWrap="wrap" 
        useFlexGap
        sx={{ mt: 4 }}
      >
        {countries.map((country) => (
          <Chip 
            key={country} 
            label={country} 
            sx={{ 
              fontWeight: 500, 
              fontSize: '0.95rem',
              py: 2.5,
              px: 1,
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
              border: '1px solid rgba(102, 126, 234, 0.2)',
              '&:hover': {
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)'
              },
              transition: 'all 0.3s'
            }} 
          />
        ))}
      </Stack>
    </Section>
  );
};

export default FreelancerCountriesSection;
