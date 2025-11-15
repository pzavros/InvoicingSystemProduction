import Section from '../ReusableComponents/Section.jsx';
import Grid from '../ReusableComponents/Grid.jsx';
import Text from '../ReusableComponents/Text.jsx';
import Card from '../ReusableComponents/Card.jsx';

const CyprusIndustriesSection = () => {
  const industries = [
    'Electricians & Electrical Services',
    'HVAC & Air Conditioning Installation',
    'Plumbing Services',
    'Construction & Renovation',
    'Painting & Decorating',
    'Carpentry & Woodwork',
    'Cleaning Services',
    'Landscaping & Gardening',
    'Auto Repair & Mechanics',
    'Handyman Services',
    'Solar Panel Installation',
    'Pool Maintenance & Repair'
  ];

  return (
    <Section spacing="large">
      <Text variant="h2" weight="bold" align="center" sx={{ mb: 2 }}>
        Trusted by Cyprus Contractors & Service Providers
      </Text>
      <Text variant="h6" align="center" sx={{ 
        color: 'text.secondary', 
        mb: 6, 
        maxWidth: 600, 
        mx: 'auto' 
      }}>
        Professional invoicing for every trade and service business in Cyprus
      </Text>
      
      <Grid columns={{ xs: 1, sm: 2, md: 3 }} gap={3}>
        {industries.map((industry, index) => (
          <Card 
            key={index} 
            variant="modern"
            sx={{ 
              textAlign: 'center', 
              py: 3,
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 24px rgba(102, 126, 234, 0.15)'
              }
            }}
          >
            <Text variant="body1" weight="medium" sx={{ fontSize: '1rem' }}>
              {industry}
            </Text>
          </Card>
        ))}
      </Grid>
    </Section>
  );
};

export default CyprusIndustriesSection;
