import { 
  Security,
  Speed,
  CloudSync,
  Settings
} from '@mui/icons-material';
import Section from '../ReusableComponents/Section.jsx';
import Grid from '../ReusableComponents/Grid.jsx';
import Text from '../ReusableComponents/Text.jsx';
import Card from '../ReusableComponents/Card.jsx';

const FeaturesTechnicalSection = () => {
  const technicalFeatures = [
    {
      icon: <Security />,
      title: 'Secure & Reliable',
      description: 'Your business data is protected with JWT authentication and secure authorization'
    },
    {
      icon: <Speed />,
      title: 'Lightning Fast',
      description: 'Create and send professional invoices in seconds, not minutes'
    },
    {
      icon: <CloudSync />,
      title: 'Cloud-Based Access',
      description: 'Access your invoices anywhere, anytime from any device through the web interface'
    },
    {
      icon: <Settings />,
      title: 'Trial & Subscription',
      description: 'Start with a trial period, then subscribe to continue using the platform'
    }
  ];

  return (
    <Section variant="light" spacing="large" sx={{ mt: 6 }}>
      <Text variant="h2" weight="bold" align="center" sx={{ mb: 2 }}>
        Why Choose Our Platform?
      </Text>
      <Text variant="h6" align="center" sx={{ 
        color: 'text.secondary', 
        mb: 6, 
        maxWidth: 600, 
        mx: 'auto' 
      }}>
        Built for business owners who want professional invoicing without the complexity
      </Text>
      
      <Grid columns={{ xs: 1, sm: 2, lg: 4 }} gap={4}>
        {technicalFeatures.map((feature, index) => (
          <Card key={index} variant="feature" title={feature.title} icon={feature.icon}>
            <Text align="center" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
              {feature.description}
            </Text>
          </Card>
        ))}
      </Grid>
    </Section>
  );
};

export default FeaturesTechnicalSection;
