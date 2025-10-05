import { Analytics, Settings, TrendingUp } from '@mui/icons-material';
import Section from '../ReusableComponents/Section.jsx';
import Grid from '../ReusableComponents/Grid.jsx';
import Text from '../ReusableComponents/Text.jsx';
import Card from '../ReusableComponents/Card.jsx';

const HowItWorksArchitectureSection = () => {
  const systemFlow = [
    {
      icon: <Settings sx={{ fontSize: 32 }} />,
      title: 'System Architecture',
      description: 'Modern web interface connects seamlessly with powerful backend for instant response'
    },
    {
      icon: <Analytics sx={{ fontSize: 32 }} />,
      title: 'Data Processing',
      description: 'Reliable database system handles all your business data securely and efficiently'
    },
    {
      icon: <TrendingUp sx={{ fontSize: 32 }} />,
      title: 'Real-time Updates',
      description: 'Dashboard analytics update in real-time as you create and manage invoices'
    }
  ];

  return (
    <Section spacing="large" sx={{ mt: 8 }}>
      <Text variant="h2" weight="bold" align="center" sx={{ mb: 2 }}>
        System Architecture
      </Text>
      <Text variant="h6" align="center" sx={{ 
        color: 'text.secondary', 
        mb: 6, 
        maxWidth: 600, 
        mx: 'auto' 
      }}>
        Understanding the technical foundation that powers your invoicing experience
      </Text>
      
      <Grid columns={{ xs: 1, md: 3 }} gap={6}>
        {systemFlow.map((item, index) => (
          <Card key={index} variant="feature" title={item.title} icon={item.icon}>
            <Text align="center" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
              {item.description}
            </Text>
          </Card>
        ))}
      </Grid>
    </Section>
  );
};

export default HowItWorksArchitectureSection;
