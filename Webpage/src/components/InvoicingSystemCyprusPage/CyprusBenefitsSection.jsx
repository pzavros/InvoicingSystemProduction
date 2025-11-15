import { CheckCircle } from '@mui/icons-material';
import { Box } from '@mui/material';
import Section from '../ReusableComponents/Section.jsx';
import Grid from '../ReusableComponents/Grid.jsx';
import Text from '../ReusableComponents/Text.jsx';
import Column from '../ReusableComponents/Column.jsx';

const CyprusBenefitsSection = () => {
  const benefits = [
    'Perfect for Cyprus electricians, plumbers, HVAC technicians, and contractors',
    'Create professional invoices in minutes - no technical skills needed',
    'Multi-language support (English, Greek) for local clients',
    'Euro (EUR) as primary currency with multi-currency support',
    'Compliant with Cyprus tax and VAT regulations',
    'Add your logo and business details for professional branding',
    'Track which clients have paid and who owes you money',
    'Send invoices directly to clients via email or download PDF',
    'Secure cloud backup - never lose your invoicing data',
    'Works on mobile, tablet, and computer - invoice on the go'
  ];

  return (
    <Section variant="light" spacing="large">
      <Text variant="h2" weight="bold" align="center" sx={{ mb: 6 }}>
        Everything Your Cyprus Business Needs
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

export default CyprusBenefitsSection;
