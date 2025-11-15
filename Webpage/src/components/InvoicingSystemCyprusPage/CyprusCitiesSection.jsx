import { Box, Chip, Stack } from '@mui/material';
import Section from '../ReusableComponents/Section.jsx';
import Text from '../ReusableComponents/Text.jsx';

const CyprusCitiesSection = () => {
  const cities = [
    'Nicosia', 
    'Limassol', 
    'Larnaca', 
    'Paphos', 
    'Famagusta', 
    'Protaras', 
    'Ayia Napa'
  ];

  return (
    <Section variant="light" spacing="large">
      <Text variant="h2" weight="bold" align="center" sx={{ mb: 4 }}>
        Serving All of Cyprus
      </Text>
      <Text variant="body1" align="center" sx={{ 
        mb: 4, 
        fontSize: '1.1rem', 
        maxWidth: 800, 
        mx: 'auto',
        lineHeight: 1.7,
        color: 'text.secondary'
      }}>
        Whether you're an electrician in Nicosia, HVAC technician in Limassol, plumber in Larnaca, or contractor in Paphos, 
        our invoicing system is accessible 24/7 from anywhere in Cyprus. Invoice your clients from the job site, 
        your van, or at home - on any device.
      </Text>
      
      <Stack 
        direction="row" 
        spacing={2} 
        justifyContent="center" 
        flexWrap="wrap" 
        useFlexGap
        sx={{ mt: 4 }}
      >
        {cities.map((city) => (
          <Chip 
            key={city} 
            label={city} 
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

export default CyprusCitiesSection;
