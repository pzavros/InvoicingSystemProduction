import { useNavigate } from 'react-router-dom';
import { Rocket, ArrowForward } from '@mui/icons-material';
import { Box, Chip } from '@mui/material';
import Section from '../ReusableComponents/Section.jsx';
import Column from '../ReusableComponents/Column.jsx';
import Row from '../ReusableComponents/Row.jsx';
import Text from '../ReusableComponents/Text.jsx';
import Button from '../ReusableComponents/Button.jsx';
import { navigateToApp } from '../../utils/navigation.js';

const CyprusHeroSection = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigateToApp('register');
  };

  const handleViewPricing = () => {
    navigate('/pricing');
  };

  return (
    <Section variant="hero" spacing="large" sx={{ mt: { xs: 10, md: 12 } }}>
      <Column gap={4}>
        <Chip 
          label="🇨🇾 Made for Cyprus Businesses" 
          sx={{ 
            mx: 'auto',
            mb: 2,
            bgcolor: 'rgba(255,255,255,0.2)', 
            color: 'white',
            fontWeight: 600,
            fontSize: '1rem',
            py: 2.5,
            px: 1,
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.3)'
          }} 
        />
        
        <Box>
          <Text variant="h1" weight="bold" align="center" sx={{ color: 'white', mb: 2 }}>
            Cyprus's Leading
          </Text>
          <Text variant="h1" weight="bold" align="center" sx={{ 
            color: 'white',
            background: 'linear-gradient(45deg, #ffffff 30%, #f0f8ff 90%)',
            backgroundClip: 'text',
            textFillColor: 'transparent',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Invoicing System
          </Text>
        </Box>
        
        <Text variant="h2" gutterBottom color="white" align="center">
          Professional E-Invoicing for Cyprus Tradespeople & Service Providers
        </Text>
        
        <Text variant="h5" gutterBottom color="rgba(255, 255, 255, 0.9)" align="center" sx={{ maxWidth: 700, mx: 'auto', mb: 4, textAlign: 'center', lineHeight: 1.6 }}>
          Trusted by electricians, HVAC technicians, plumbers, contractors, and local service businesses across Nicosia, Limassol, Larnaca, and all of Cyprus. 
          Create professional invoices in minutes, manage your clients, and get paid faster.
        </Text>
        
        <Row gap={3} sx={{ justifyContent: 'center', flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
          <Button 
            variant="glass" 
            size="large"
            onClick={handleGetStarted}
            startIcon={<Rocket />}
          >
            Start Free Trial
          </Button>
          <Button 
            variant="outline" 
            size="large"
            onClick={handleViewPricing}
            endIcon={<ArrowForward />}
          >
            View Pricing
          </Button>
        </Row>
        
        <Text variant="body2" align="center" sx={{ color: 'rgba(255,255,255,0.8)', mt: 2 }}>
          ✓ Free forever plan available  ✓ No credit card required  ✓ EUR currency support
        </Text>
      </Column>
    </Section>
  );
};

export default CyprusHeroSection;
