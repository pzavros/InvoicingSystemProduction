import { Timeline } from '@mui/icons-material';
import { Box } from '@mui/material';
import Section from '../ReusableComponents/Section.jsx';
import Grid from '../ReusableComponents/Grid.jsx';
import Text from '../ReusableComponents/Text.jsx';

const AboutTimelineSection = () => {
  const timeline = [
    {
      year: '2023',
      title: 'The Vision',
      description: 'Started with a simple idea: make invoicing effortless for businesses of all sizes.'
    },
    {
      year: '2024', 
      title: 'Development Phase',
      description: 'Built a complete invoicing solution with modern web technologies and user-friendly design.'
    },
    {
      year: '2025',
      title: 'Production Ready',
      description: 'Launched with comprehensive features including analytics, templates, and subscription management.'
    }
  ];

  return (
    <Section variant="light" spacing="large" sx={{ mt: 6 }}>
      <Text variant="h2" weight="bold" align="center" sx={{ mb: 6 }}>
        Development Journey
      </Text>
      
      <Grid columns={{ xs: 1, md: 3 }} gap={6}>
        {timeline.map((item, index) => (
          <Box key={index} sx={{ position: 'relative', textAlign: 'center' }}>
            {/* Connection line */}
            {index < timeline.length - 1 && (
              <Box
                sx={{
                  display: { xs: 'none', md: 'block' },
                  position: 'absolute',
                  top: 60,
                  right: -50,
                  width: 100,
                  height: 2,
                  background: 'linear-gradient(90deg, rgba(102, 126, 234, 0.3) 0%, rgba(118, 75, 162, 0.3) 100%)',
                }}
              />
            )}

            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3,
                boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
                position: 'relative',
                zIndex: 2
              }}
            >
              <Timeline sx={{ color: 'white', fontSize: 32 }} />
            </Box>
            
            <Text variant="h4" weight="bold" sx={{ mb: 2, color: 'primary.main' }}>
              {item.year}
            </Text>
            <Text variant="h6" weight="bold" sx={{ mb: 2 }}>
              {item.title}
            </Text>
            <Text sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
              {item.description}
            </Text>
          </Box>
        ))}
      </Grid>
    </Section>
  );
};

export default AboutTimelineSection;
