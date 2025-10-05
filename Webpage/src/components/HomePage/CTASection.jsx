import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Rocket, ArrowForward, TrendingUp } from '@mui/icons-material';
import { Box } from '@mui/material';
import Section from '../ReusableComponents/Section.jsx';
import Column from '../ReusableComponents/Column.jsx';
import Row from '../ReusableComponents/Row.jsx';
import Text from '../ReusableComponents/Text.jsx';
import Button from '../ReusableComponents/Button.jsx';
import IconBox from '../ReusableComponents/IconBox.jsx';
import WaitlistModal from '../ReusableComponents/WaitlistModal.jsx';

const CTASection = () => {
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const navigate = useNavigate();

  const handleGetStarted = () => {
    setWaitlistOpen(true);
  };

  const handleViewFeatures = () => {
    navigate('/features');
  };

  return (
    <Section variant="cta" spacing="large" sx={{ mt: 4 }}>
      <Column gap={4}>
        <IconBox size={80} color="white" sx={{ mx: 'auto', mb: 2 }}>
          <TrendingUp sx={{ fontSize: 40 }} />
        </IconBox>
        
        <Text variant="h2" weight="bold" align="center" sx={{ color: 'white', mb: 2 }}>
          Be First to Access Our System
        </Text>
        
        <Text variant="h6" align="center" sx={{ 
          color: 'rgba(255,255,255,0.9)',
          maxWidth: 600,
          mx: 'auto',
          mb: 2
        }}>
          Join our exclusive waitlist and get early access to the complete invoicing platform
        </Text>
        
        <Text align="center" sx={{ 
          color: 'rgba(255,255,255,0.8)',
          fontSize: '1.1rem'
        }}>
          Early users receive 50% off their first year and priority support
        </Text>

        <Row gap={3} sx={{ justifyContent: 'center', flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
          <Button 
            variant="glass" 
            size="large"
            onClick={handleGetStarted}
            startIcon={<Rocket />}
          >
            Join Waitlist
          </Button>
          <Button 
            variant="outline" 
            size="large"
            onClick={handleViewFeatures}
            endIcon={<ArrowForward />}
          >
            View Features
          </Button>
        </Row>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: 4,
            flexWrap: 'wrap',
            mt: 4,
            pt: 4,
            borderTop: '1px solid rgba(255,255,255,0.2)'
          }}
        >
          {['Full-Stack Solution', 'Production Ready', 'Enterprise Grade'].map((item, index) => (
            <Box key={index} sx={{ textAlign: 'center' }}>
              <Text variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                {item.split(' ')[0]}
              </Text>
              <Text sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
                {item.split(' ').slice(1).join(' ')}
              </Text>
            </Box>
          ))}
        </Box>
      </Column>
      
      <WaitlistModal 
        open={waitlistOpen} 
        onClose={() => setWaitlistOpen(false)} 
      />
    </Section>
  );
};

export default CTASection;
