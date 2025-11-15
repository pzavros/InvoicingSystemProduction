import { useNavigate } from 'react-router-dom';
import { Rocket } from '@mui/icons-material';
import Section from '../ReusableComponents/Section.jsx';
import Column from '../ReusableComponents/Column.jsx';
import Text from '../ReusableComponents/Text.jsx';
import Button from '../ReusableComponents/Button.jsx';
import { navigateToApp } from '../../utils/navigation.js';

const FreelancerCTASection = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigateToApp('register');
  };

  return (
    <Section variant="cta" spacing="large">
      <Column gap={4} sx={{ textAlign: 'center' }}>
        <Text variant="h2" weight="bold" align="center" sx={{ color: 'white' }}>
          Ready to Get Paid Faster & Look More Professional?
        </Text>
        
        <Text variant="h5" align="center" sx={{ 
          color: 'rgba(255,255,255,0.9)', 
          maxWidth: 600, 
          mx: 'auto',
          lineHeight: 1.6
        }}>
          Join thousands of freelancers worldwide already using E-nvoicing to simplify their business
        </Text>
        
        <Button 
          variant="glass" 
          size="large"
          onClick={handleGetStarted}
          startIcon={<Rocket />}
          sx={{ mx: 'auto', mt: 2 }}
        >
          Start Your Free Trial Today
        </Button>
        
        <Text variant="body2" align="center" sx={{ color: 'rgba(255,255,255,0.8)', mt: 2 }}>
          No credit card required • Free forever plan available • Cancel anytime
        </Text>
      </Column>
    </Section>
  );
};

export default FreelancerCTASection;
