import { 
  Email
} from '@mui/icons-material';
import { Box } from '@mui/material';
import Section from '../ReusableComponents/Section.jsx';
import Text from '../ReusableComponents/Text.jsx';
import IconBox from '../ReusableComponents/IconBox.jsx';

const ContactAlternativesSection = () => {
  return (
    <Section spacing="large" sx={{ mt: 8 }}>
      <Text variant="h2" weight="bold" align="center" sx={{ mb: 6 }}>
        Get in Touch
      </Text>
      
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Box sx={{ textAlign: 'center', maxWidth: 400 }}>
          <IconBox size={80} sx={{ mx: 'auto', mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <Email sx={{ color: 'white', fontSize: 40 }} />
          </IconBox>
          <Text variant="h5" weight="bold" sx={{ mb: 2 }}>
            Email Contact
          </Text>
          <Text 
            sx={{ 
              color: '#667eea', 
              fontSize: '1.2rem', 
              fontWeight: 600,
              mb: 2,
              '&:hover': { textDecoration: 'underline' }
            }}
            component="a"
            href="mailto:support@e-nvoicing.com"
          >
            support@e-nvoicing.com
          </Text>
          <Text sx={{ color: 'text.secondary', fontSize: '1rem', lineHeight: 1.6 }}>
            Send us a message using the contact form above and we'll get back to you as soon as possible. 
            All inquiries are handled via email for your convenience.
          </Text>
        </Box>
      </Box>
    </Section>
  );
};

export default ContactAlternativesSection;
