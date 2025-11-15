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

const FreelancerFeaturesSection = () => {
  const freelancerFeatures = [
    {
      icon: <Euro sx={{ fontSize: 48, color: '#667eea' }} />,
      title: 'Multi-Currency Support',
      description: 'Invoice clients worldwide in EUR, USD, GBP, CHF, CAD, AUD, and more. Perfect for freelancers with international clients.',
      details: [
        'Support for 15+ major currencies',
        'Automatic currency conversion',
        'Localized invoice formats',
        'Great for remote work globally'
      ]
    },
    {
      icon: <Security sx={{ fontSize: 48, color: '#764ba2' }} />,
      title: 'International Tax Compliant',
      description: 'Handle VAT, GST, and sales tax with ease. Automatic calculations compliant with international tax regulations.',
      details: [
        'VAT/GST automatic calculations',
        'Tax-compliant invoicing globally',
        'Support for tax-exempt invoices',
        'Ready for accountant review'
      ]
    },
    {
      icon: <Cloud sx={{ fontSize: 48, color: '#667eea' }} />,
      title: 'Work From Anywhere',
      description: 'Access your invoices from your home office, coworking space, or while traveling. Works on any device.',
      details: [
        'Invoice from any location worldwide',
        'Mobile-friendly for on-the-go invoicing',
        'No software installation needed',
        'Automatic cloud backups & sync'
      ]
    },
    {
      icon: <Speed sx={{ fontSize: 48, color: '#764ba2' }} />,
      title: 'Lightning Fast',
      description: 'Create professional invoices in under 2 minutes. Spend less time on admin, more time on billable work.',
      details: [
        'Intuitive, simple interface',
        'Pre-filled templates save time',
        'Recurring invoices for retainers',
        'Professional results every time'
      ]
    },
    {
      icon: <TrendingUp sx={{ fontSize: 48, color: '#667eea' }} />,
      title: 'Financial Insights',
      description: 'Track your income, expenses, and profitability at a glance. Make informed business decisions.',
      details: [
        'Real-time income tracking',
        'See monthly and yearly earnings',
        'Track paid vs outstanding invoices',
        'Expense tracking and profit reports'
      ]
    },
    {
      icon: <CheckCircle sx={{ fontSize: 48, color: '#764ba2' }} />,
      title: 'Professional Branding',
      description: 'Add your logo and brand colors. Present a professional image to every client, anywhere in the world.',
      details: [
        'Custom branding with your logo',
        'Professional invoice templates',
        'Customizable colors and fonts',
        'PDF export for email or print'
      ]
    }
  ];

  return (
    <Section spacing="large" sx={{ mt: 4 }}>
      <Text variant="h2" weight="bold" align="center" sx={{ mb: 2 }}>
        Why Freelancers Worldwide Choose E-nvoicing
      </Text>
      <Text variant="h6" align="center" sx={{ 
        color: 'text.secondary', 
        mb: 6, 
        maxWidth: 700, 
        mx: 'auto' 
      }}>
        Professional invoicing for developers, designers, consultants, writers, and all independent professionals
      </Text>
      
      <Grid columns={{ xs: 1, lg: 2 }} gap={6}>
        {freelancerFeatures.map((feature, index) => (
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

export default FreelancerFeaturesSection;
