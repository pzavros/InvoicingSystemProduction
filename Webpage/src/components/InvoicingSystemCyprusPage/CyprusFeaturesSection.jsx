import { 
  Euro, 
  Security, 
  Cloud,
  Speed,
  TrendingUp,
  CheckCircle
} from '@mui/icons-material';
import { Box } from '@mui/material';
import Section from '../ReusableComponents/Section.jsx';
import Grid from '../ReusableComponents/Grid.jsx';
import Text from '../ReusableComponents/Text.jsx';
import Card from '../ReusableComponents/Card.jsx';
import Column from '../ReusableComponents/Column.jsx';

const CyprusFeaturesSection = () => {
  const cyprusFeatures = [
    {
      icon: <Euro sx={{ fontSize: 48, color: '#667eea' }} />,
      title: 'Multi-Currency Support',
      description: 'Handle EUR, GBP, USD, and more. Perfect for Cyprus contractors working with international property owners and expat clients.',
      details: [
        'Euro (EUR) as primary currency',
        'Support for GBP, USD, and 15+ currencies',
        'Great for servicing tourists and expats',
        'Automatic currency display on invoices'
      ]
    },
    {
      icon: <Security sx={{ fontSize: 48, color: '#764ba2' }} />,
      title: 'VAT Compliant',
      description: 'Fully compliant with Cyprus VAT regulations. Automatic VAT calculations - no math needed.',
      details: [
        'Cyprus VAT compliance built-in',
        'Automatic 19% VAT calculation',
        'VAT-exempt options when needed',
        'Ready for tax filing'
      ]
    },
    {
      icon: <Cloud sx={{ fontSize: 48, color: '#667eea' }} />,
      title: 'Work From Anywhere',
      description: 'Access your invoices from the job site, your van, or home. Works on phone, tablet, and computer.',
      details: [
        'Invoice clients from any location',
        'Mobile-friendly for on-site invoicing',
        'No software to install',
        'Automatic cloud backups'
      ]
    },
    {
      icon: <Speed sx={{ fontSize: 48, color: '#764ba2' }} />,
      title: 'Quick & Simple',
      description: 'Create professional invoices in under 2 minutes. No accounting degree required - built for tradespeople.',
      details: [
        'Simple, easy-to-use interface',
        'Pre-filled templates save time',
        'Add labor and materials easily',
        'Professional invoices every time'
      ]
    },
    {
      icon: <TrendingUp sx={{ fontSize: 48, color: '#667eea' }} />,
      title: 'Track Your Income',
      description: 'See at a glance who owes you money and track your monthly earnings. Keep your Cyprus business organized.',
      details: [
        'Track paid vs unpaid invoices',
        'See monthly and yearly income',
        'Know exactly who owes you',
        'Simple reports for your accountant'
      ]
    },
    {
      icon: <CheckCircle sx={{ fontSize: 48, color: '#764ba2' }} />,
      title: 'Professional Image',
      description: 'Add your logo and business details. Look professional to every client - from homeowners to businesses.',
      details: [
        'Custom branding with your logo',
        'Professional invoice templates',
        'Add your Cyprus business details',
        'PDF invoices for printing or emailing'
      ]
    }
  ];

  return (
    <Section spacing="large" sx={{ mt: 4 }}>
      <Text variant="h2" weight="bold" align="center" sx={{ mb: 2 }}>
        Why Cyprus Contractors & Service Providers Choose E-nvoicing
      </Text>
      <Text variant="h6" align="center" sx={{ 
        color: 'text.secondary', 
        mb: 6, 
        maxWidth: 700, 
        mx: 'auto' 
      }}>
        Simple, professional invoicing for electricians, plumbers, HVAC technicians, and all trade businesses in Cyprus
      </Text>
      
      <Grid columns={{ xs: 1, lg: 2 }} gap={6}>
        {cyprusFeatures.map((feature, index) => (
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

export default CyprusFeaturesSection;
