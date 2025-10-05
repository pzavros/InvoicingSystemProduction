import { Box } from '@mui/material';
import Section from '../ReusableComponents/Section.jsx';
import Grid from '../ReusableComponents/Grid.jsx';
import Text from '../ReusableComponents/Text.jsx';
import Card from '../ReusableComponents/Card.jsx';

const AboutValuesSection = () => {
  const values = [
    {
      title: 'Simplicity First',
      description: 'Complex problems deserve simple solutions. We believe invoicing should be straightforward.',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      title: 'Full Transparency',
      description: 'Open-source approach with complete visibility into features and functionality.',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    {
      title: 'Business Focus',
      description: 'Built by developers who understand real business needs and workflow challenges.',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    },
    {
      title: 'Innovation Drive',
      description: 'Continuously evolving with modern technologies and user feedback integration.',
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
    }
  ];

  return (
    <Section spacing="large" sx={{ mt: 6 }}>
      <Text variant="h2" weight="bold" align="center" sx={{ mb: 2 }}>
        Our Values
      </Text>
      <Text variant="h6" align="center" sx={{ 
        color: 'text.secondary', 
        mb: 6, 
        maxWidth: 600, 
        mx: 'auto' 
      }}>
        The principles that drive our development process and shape our product decisions
      </Text>
      
      <Grid columns={{ xs: 1, sm: 2 }} gap={4}>
        {values.map((value, index) => (
          <Card 
            key={index}
            variant="modern" 
            sx={{ 
              height: '100%',
              position: 'relative',
              overflow: 'hidden',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 20px 40px rgba(102, 126, 234, 0.2)'
              }
            }}
          >
            <Box
              sx={{
                width: 60,
                height: 4,
                background: value.gradient,
                borderRadius: 2,
                mb: 3
              }}
            />
            <Text variant="h5" weight="bold" sx={{ mb: 2 }}>
              {value.title}
            </Text>
            <Text sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
              {value.description}
            </Text>
          </Card>
        ))}
      </Grid>
    </Section>
  );
};

export default AboutValuesSection;
