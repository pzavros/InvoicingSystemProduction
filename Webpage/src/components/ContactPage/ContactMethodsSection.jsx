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
      contact: 'panazavros8@gmail.com',
      action: 'Send Email',
      onClick: () => window.open('mailto:panazavros8@gmail.com?subject=InvoiceSystem Pro Inquiry', '_blank')
    },
    {
      icon: <Phone sx={{ fontSize: 40 }} />,
      title: 'Phone Support',
      description: 'Speak directly with our support team',
      contact: '+357 97667089',
      action: 'Call Now',
      onClick: () => window.open('tel:+35797667089', '_blank')
    },
    {
      icon: <Support sx={{ fontSize: 40 }} />,
      title: 'Technical Support',
      description: 'Get help with technical issues and setup',
      contact: 'Available via email for technical assistance',
      action: 'Get Support',
      onClick: () => window.open('mailto:panazavros8@gmail.com?subject=Technical Support - InvoiceSystem Pro', '_blank')
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
            
            <Text variant="h5" weight="bold" align="center" sx={{ mb: 2 }}>
              {method.title}
            </Text>
            <Text align="center" sx={{ color: 'text.secondary', mb: 3, lineHeight: 1.6 }}>
              {method.description}
            </Text>
            <Box
              sx={{
                backgroundColor: 'rgba(102, 126, 234, 0.05)',
                borderRadius: '12px',
                p: 2,
                mb: 3,
                border: '1px solid rgba(102, 126, 234, 0.1)',
                textAlign: 'center'
              }}
            >
              <Text align="center" sx={{ 
                fontSize: '0.95rem', 
                color: 'text.primary', 
                fontWeight: 600,
                wordBreak: 'break-word',
                userSelect: 'text',
                '&::selection': {
                  backgroundColor: 'rgba(102, 126, 234, 0.2)',
                  color: 'text.primary'
                }
              }}>
                {method.contact}
              </Text>
            </Box>
            <Button 
              variant="primary" 
              size="small" 
              fullWidth
              onClick={method.onClick}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                fontWeight: 600,
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a6fd8 0%, #6b46c1 100%)',
                  boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
                  transform: 'translateY(-1px)'
                }
              }}
            >
              {method.action}
            </Button>
          </Card>
        ))}
      </Grid>
    </Section>
  );
};

export default ContactMethodsSection;
