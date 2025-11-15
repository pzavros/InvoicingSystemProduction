import { CheckCircle } from '@mui/icons-material';
import { Box } from '@mui/material';
import Section from '../ReusableComponents/Section.jsx';
import Grid from '../ReusableComponents/Grid.jsx';
import Text from '../ReusableComponents/Text.jsx';

const FreelancerBenefitsSection = () => {
  const benefits = [
    'Perfect for freelance developers, designers, consultants, and digital professionals',
    'Create professional invoices in minutes - no accounting experience needed',
    'Multi-currency support (EUR, USD, GBP, CHF, CAD, AUD, and more)',
    'Accept international payments with Stripe integration',
    'Compliant with international VAT, GST, and tax regulations',
    'Add your logo and brand colors for professional invoicing',
    'Track which clients have paid and who owes you money',
    'Send invoices directly to clients via email or download PDF',
    'Secure cloud backup - never lose your invoicing data',
    'Works on desktop, mobile, and tablet - invoice from anywhere'
  ];

  return (
    <Section variant="light" spacing="large">
      <Text variant="h2" weight="bold" align="center" sx={{ mb: 6 }}>
        Everything Your Freelance Business Needs
      </Text>
      
      <Grid columns={{ xs: 1, sm: 2 }} gap={3}>
        {benefits.map((benefit, index) => (
          <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
            <CheckCircle sx={{ color: 'success.main', fontSize: 24, flexShrink: 0, mt: 0.5 }} />
            <Text variant="body1" sx={{ fontSize: '1.05rem', lineHeight: 1.6 }}>
              {benefit}
            </Text>
          </Box>
        ))}
      </Grid>
    </Section>
  );
};

export default FreelancerBenefitsSection;
