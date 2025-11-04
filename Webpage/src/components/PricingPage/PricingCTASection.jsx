import { Rocket, ArrowForward, Email } from '@mui/icons-material';
import { Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Section from '../ReusableComponents/Section.jsx';
import Column from '../ReusableComponents/Column.jsx';
import Row from '../ReusableComponents/Row.jsx';
import Text from '../ReusableComponents/Text.jsx';
import Button from '../ReusableComponents/Button.jsx';
import { navigateToApp } from '../../utils/navigation.js';

const PricingCTASection = () => {
  const navigate = useNavigate();

  return (
    <Section variant="cta" spacing="large">
      <Column gap={4}>
        <Text variant="h2" weight="bold" align="center" sx={{ color: 'white', mb: 2 }}>
          Ready to Get Started?
        </Text>
        
        <Text variant="h6" align="center" sx={{ 
          color: 'rgba(255,255,255,0.9)',
          maxWidth: 600,
          mx: 'auto',
          mb: 2
        }}>
          Start with our free plan today. Upgrade anytime as your business grows.
        </Text>

        <Row gap={3} sx={{ justifyContent: 'center', flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
          <Button 
            variant="glass" 
            size="large"
            onClick={() => navigateToApp('register')}
            startIcon={<Rocket />}
          >
            Get Started Free
          </Button>
          <Button 
            variant="outline" 
            size="large"
            onClick={() => navigate('/contact')}
            endIcon={<ArrowForward />}
          >
            Contact Sales
          </Button>
        </Row>

        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: 4, 
          flexWrap: 'wrap',
          mt: 4,
          pt: 4,
          borderTop: '1px solid rgba(255,255,255,0.2)'
        }}>
          {[
            { label: '7-Day Free Trial', sublabel: 'Premium' },
            { label: 'Cancel Anytime', sublabel: 'No Lock-in' }
          ].map((item, index) => (
            <Box key={index} sx={{ textAlign: 'center' }}>
              <Text variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                {item.label}
              </Text>
              <Text sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
                {item.sublabel}
              </Text>
            </Box>
          ))}
        </Box>

        <Box sx={{ 
          textAlign: 'center', 
          mt: 4,
          p: 3,
          borderRadius: 3,
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 1 }}>
            <Email sx={{ color: 'white' }} />
            <Text sx={{ color: 'white', fontWeight: 600 }}>
              Need help choosing a plan?
            </Text>
          </Box>
          <Text sx={{ color: 'rgba(255,255,255,0.9)', textAlign: 'center' }}>
            Our team is here to help you find the perfect plan for your business needs.
          </Text>
        </Box>
      </Column>
    </Section>
  );
};

export default PricingCTASection;
