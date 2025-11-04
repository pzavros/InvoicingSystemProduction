import { AttachMoney, CheckCircle, Bolt } from '@mui/icons-material';
import { Box } from '@mui/material';
import Section from '../ReusableComponents/Section.jsx';
import Column from '../ReusableComponents/Column.jsx';
import Text from '../ReusableComponents/Text.jsx';
import IconBox from '../ReusableComponents/IconBox.jsx';

const PricingHeroSection = () => {
  return (
    <Section variant="hero" spacing="large" sx={{ mt: { xs: 10, md: 12 } }}>
      <Column gap={4}>
        <IconBox size={100} sx={{ mx: 'auto', mb: 2 }}>
          <AttachMoney sx={{ fontSize: 50, color: 'white' }} />
        </IconBox>
        
        <Text variant="h1" weight="bold" align="center" sx={{ color: 'white', mb: 2 }}>
          Simple, Transparent Pricing
        </Text>
        
        <Text variant="h5" align="center" sx={{ 
          color: 'rgba(255,255,255,0.9)',
          maxWidth: 700,
          mx: 'auto',
          lineHeight: 1.6
        }}>
          Start with our free tier and upgrade to premium when you need unlimited invoicing.
        </Text>

        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: 4, 
          flexWrap: 'wrap',
          mt: 4 
        }}>
          {[
            { icon: <CheckCircle />, label: 'Free Tier', sublabel: 'Get Started Today' },
            { icon: <AttachMoney />, label: '$13.99/month', sublabel: 'Unlimited Premium' },
            { icon: <Bolt />, label: '7-Day Free Trial', sublabel: 'Try Premium Free' }
          ].map((item, index) => (
            <Box key={index} sx={{ 
              textAlign: 'center',
              p: 3,
              borderRadius: 3,
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <Box sx={{ 
                color: 'white', 
                mb: 1,
                '& svg': { fontSize: 32 }
              }}>
                {item.icon}
              </Box>
              <Text variant="h6" sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>
                {item.label}
              </Text>
              <Text sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', textAlign: 'center' }}>
                {item.sublabel}
              </Text>
            </Box>
          ))}
        </Box>
      </Column>
    </Section>
  );
};

export default PricingHeroSection;
