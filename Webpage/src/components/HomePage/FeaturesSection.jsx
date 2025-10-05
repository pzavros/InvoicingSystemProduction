import { 
  Speed, 
  Security, 
  CloudSync, 
  Analytics, 
  ReceiptLong, 
  Support 
} from '@mui/icons-material';
import Section from '../ReusableComponents/Section.jsx';
import Grid from '../ReusableComponents/Grid.jsx';
import Card from '../ReusableComponents/Card.jsx';
import Text from '../ReusableComponents/Text.jsx';

const FeaturesSection = () => {
  const features = [
    {
      icon: <ReceiptLong sx={{ fontSize: 48, color: '#667eea' }} />,
      title: 'Invoice Management',
      description: 'Create, update, delete, and track invoices with status management, bulk operations, and multi-currency support.'
    },
    {
      icon: <Support sx={{ fontSize: 48, color: '#764ba2' }} />,
      title: 'Client Management',
      description: 'Complete client database with search functionality, email lookup, and comprehensive contact management system.'
    },
    {
      icon: <Analytics sx={{ fontSize: 48, color: '#667eea' }} />,
      title: 'Analytics Dashboard',
      description: 'Monthly and yearly earnings breakdown, invoice counts, and detailed business performance statistics.'
    },
    {
      icon: <Speed sx={{ fontSize: 48, color: '#764ba2' }} />,
      title: 'Invoice Templates',
      description: 'Customizable invoice templates system to maintain consistent professional branding across all invoices.'
    },
    {
      icon: <CloudSync sx={{ fontSize: 48, color: '#667eea' }} />,
      title: 'Product Catalog',
      description: 'Manage your products and services with integrated pricing, inventory tracking, and quick invoice integration.'
    },
    {
      icon: <Security sx={{ fontSize: 48, color: '#764ba2' }} />,
      title: 'Reports & Export',
      description: 'Generate comprehensive Excel reports and logistics data for detailed business analysis and record keeping.'
    }
  ];

  return (
    <Section 
      title="Complete Invoicing Platform" 
      subtitle="Full-featured system with everything you need to manage invoices, clients, and business analytics"
      spacing="large"
    >
      <Grid columns={{ xs: 1, sm: 2, lg: 3 }} gap={5} sx={{ mt: 2 }}>
        {features.map((feature, index) => (
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

export default FeaturesSection;
