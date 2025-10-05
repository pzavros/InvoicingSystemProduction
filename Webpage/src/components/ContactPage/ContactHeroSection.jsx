import { Email } from '@mui/icons-material';
import Section from '../ReusableComponents/Section.jsx';
import Column from '../ReusableComponents/Column.jsx';
import Text from '../ReusableComponents/Text.jsx';
import IconBox from '../ReusableComponents/IconBox.jsx';

const ContactHeroSection = () => {
  return (
    <Section variant="hero" spacing="large" sx={{ mt: { xs: 10, md: 12 } }}>
      <Column gap={4}>
        <IconBox size={100} sx={{ mx: 'auto', mb: 2 }}>
          <Email sx={{ fontSize: 50, color: 'white' }} />
        </IconBox>
        
        <Text variant="h1" weight="bold" align="center" sx={{ color: 'white', mb: 2 }}>
          Get In Touch
        </Text>
        
        <Text variant="h5" align="center" sx={{ 
          color: 'rgba(255,255,255,0.9)',
          maxWidth: 700,
          mx: 'auto',
          lineHeight: 1.6
        }}>
          Have questions about our invoicing system? Need support or want to share feedback? 
          We're here to help you succeed.
        </Text>
      </Column>
    </Section>
  );
};

export default ContactHeroSection;
