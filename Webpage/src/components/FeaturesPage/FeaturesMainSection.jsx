import { 
  ReceiptLong, 
  Analytics, 
  People,
  Inventory,
  Settings,
  CloudSync,
  CheckCircle
} from '@mui/icons-material';
import { Box } from '@mui/material';
import Section from '../ReusableComponents/Section.jsx';
import Column from '../ReusableComponents/Column.jsx';
import Grid from '../ReusableComponents/Grid.jsx';
import Text from '../ReusableComponents/Text.jsx';
import Card from '../ReusableComponents/Card.jsx';

const FeaturesMainSection = () => {
  const mainFeatures = [
    {
      icon: <ReceiptLong sx={{ fontSize: 48, color: '#667eea' }} />,
      title: 'Complete Invoice Management',
      description: 'Full CRUD operations with status tracking, bulk updates, and multi-currency support',
      details: [
        'Create, read, update, delete invoices',
        'Status management (Draft, Sent, Paid, Overdue)',
        'Bulk status updates for multiple invoices',
        'Multi-currency support with real-time conversion',
        'Invoice numbering and sequence management'
      ]
    },
    {
      icon: <People sx={{ fontSize: 48, color: '#764ba2' }} />,
      title: 'Advanced Client Management',
      description: 'Comprehensive client database with search and relationship tracking',
      details: [
        'Complete client profiles with contact information',
        'Email-based client lookup and search',
        'Client history and invoice tracking',
        'Automated client data validation',
        'Export client data for external systems'
      ]
    },
    {
      icon: <Analytics sx={{ fontSize: 48, color: '#667eea' }} />,
      title: 'Business Analytics Dashboard',
      description: 'Real-time insights with earnings breakdown and performance metrics',
      details: [
        'Monthly and yearly earnings analysis',
        'Invoice count statistics and trends',
        'Revenue breakdown by client and period',
        'Payment status analytics',
        'Business performance indicators'
      ]
    },
    {
      icon: <Settings sx={{ fontSize: 48, color: '#764ba2' }} />,
      title: 'Customizable Templates',
      description: 'Professional invoice templates with brand customization options',
      details: [
        'Multiple pre-designed invoice templates',
        'Custom branding and logo integration',
        'Template management system',
        'PDF generation with custom styling',
        'Template sharing and backup'
      ]
    },
    {
      icon: <Inventory sx={{ fontSize: 48, color: '#667eea' }} />,
      title: 'Product & Service Catalog',
      description: 'Integrated inventory management with pricing and categorization',
      details: [
        'Product and service database',
        'Pricing management and updates',
        'Category organization',
        'Quick invoice item selection',
        'Inventory tracking and reports'
      ]
    },
    {
      icon: <CloudSync sx={{ fontSize: 48, color: '#764ba2' }} />,
      title: 'Advanced Reporting',
      description: 'Comprehensive reports with Excel export and logistics data',
      details: [
        'Excel report generation',
        'Logistics and shipping reports',
        'Financial summaries and statements',
        'Custom date range filtering',
        'Automated report scheduling'
      ]
    }
  ];

  return (
    <Section spacing="large" sx={{ mt: 4 }}>
      <Text variant="h2" weight="bold" align="center" sx={{ mb: 2 }}>
        Core Features
      </Text>
      <Text variant="h6" align="center" sx={{ 
        color: 'text.secondary', 
        mb: 6, 
        maxWidth: 600, 
        mx: 'auto' 
      }}>
        Everything you need to manage invoices, clients, and business operations in one platform
      </Text>
      
      <Grid columns={{ xs: 1, lg: 2 }} gap={6}>
        {mainFeatures.map((feature, index) => (
          <Card 
            key={index}
            variant="modern" 
            sx={{ 
              height: '100%',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 20px 40px rgba(102, 126, 234, 0.2)'
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3, mb: 3 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 64,
                  height: 64,
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                  flexShrink: 0
                }}
              >
                {feature.icon}
              </Box>
              <Box sx={{ flex: 1 }}>
                <Text variant="h5" weight="bold" sx={{ mb: 1 }}>
                  {feature.title}
                </Text>
                <Text sx={{ color: 'text.secondary', mb: 3 }}>
                  {feature.description}
                </Text>
              </Box>
            </Box>
            
            <Column gap={1}>
              {feature.details.map((detail, detailIndex) => (
                <Box key={detailIndex} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <CheckCircle sx={{ color: 'primary.main', fontSize: 18, flexShrink: 0 }} />
                  <Text sx={{ fontSize: '0.95rem', lineHeight: 1.4 }}>
                    {detail}
                  </Text>
                </Box>
              ))}
            </Column>
          </Card>
        ))}
      </Grid>
    </Section>
  );
};

export default FeaturesMainSection;
