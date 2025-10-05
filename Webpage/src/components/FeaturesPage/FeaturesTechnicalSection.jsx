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
      description: 'Your business data is protected with bank-level security and automatic backups'
    },
    {
      icon: <Speed />,
      title: 'Lightning Fast',
      description: 'Create and send professional invoices in seconds, not minutes'
    },
    {
      icon: <CloudSync />,
      title: 'Always Available',
      description: 'Access your invoices anywhere, anytime from any device with automatic sync'
    },
    {
      icon: <Settings />,
      title: 'Flexible Billing',
      description: 'Try free, then choose a plan that grows with your business needs'
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
