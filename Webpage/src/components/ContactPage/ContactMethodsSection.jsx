import { 
  Email, 
  Phone,
  Support
} from '@mui/icons-material';
import { Box } from '@mui/material';
import Section from '../ReusableComponents/Section.jsx';
import Grid from '../ReusableComponents/Grid.jsx';
import Text from '../ReusableComponents/Text.jsx';
import Card from '../ReusableComponents/Card.jsx';
import Button from '../ReusableComponents/Button.jsx';

const ContactMethodsSection = () => {
  const contactMethods = [
    {
      icon: <Email sx={{ fontSize: 40 }} />,
      title: 'Email Support',
      description: 'Get in touch via email for detailed inquiries',
      contact: 'support@invoicesystem.com',
      action: 'Send Email'
    },
    {
      icon: <Phone sx={{ fontSize: 40 }} />,
      title: 'Phone Support',
      description: 'Speak directly with our support team',
      contact: '+1 (555) 123-4567',
      action: 'Call Now'
    },
    {
      icon: <Support sx={{ fontSize: 40 }} />,
      title: 'Technical Support',
      description: 'Get help with technical issues and setup',
      contact: 'Available 24/7 through multiple channels',
      action: 'Get Support'
    }
  ];

  return (
    <Section spacing="large" sx={{ mt: 4 }}>
      <Text variant="h2" weight="bold" align="center" sx={{ mb: 2 }}>
        Contact Methods
      </Text>
      <Text variant="h6" align="center" sx={{ 
        color: 'text.secondary', 
        mb: 6, 
        maxWidth: 600, 
        mx: 'auto' 
      }}>
        Choose the best way to reach us based on your needs and preferences
      </Text>
      
      <Grid columns={{ xs: 1, md: 3 }} gap={6}>
        {contactMethods.map((method, index) => (
          <Card 
            key={index}
            variant="modern" 
            sx={{ 
              height: '100%',
              textAlign: 'center',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 20px 40px rgba(102, 126, 234, 0.2)'
              }
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 80,
                height: 80,
                borderRadius: '20px',
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                mx: 'auto',
                mb: 3
              }}
            >
              {method.icon}
            </Box>
            
            <Text variant="h5" weight="bold" sx={{ mb: 2 }}>
              {method.title}
            </Text>
            <Text sx={{ color: 'text.secondary', mb: 3, lineHeight: 1.6 }}>
              {method.description}
            </Text>
            <Text sx={{ 
              fontSize: '0.9rem', 
              color: 'primary.main', 
              fontWeight: 500,
              mb: 3,
              wordBreak: 'break-word'
            }}>
              {method.contact}
            </Text>
            <Button variant="outline" size="small" fullWidth>
              {method.action}
            </Button>
          </Card>
        ))}
      </Grid>
    </Section>
  );
};

export default ContactMethodsSection;
