import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Rocket, ArrowForward } from '@mui/icons-material';
import { Box } from '@mui/material';
import Section from '../ReusableComponents/Section.jsx';
import Column from '../ReusableComponents/Column.jsx';
import Row from '../ReusableComponents/Row.jsx';
import Text from '../ReusableComponents/Text.jsx';
import Button from '../ReusableComponents/Button.jsx';
import WaitlistModal from '../ReusableComponents/WaitlistModal.jsx';

const HeroSection = () => {
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const navigate = useNavigate();

  const handleGetStarted = () => {
    setWaitlistOpen(true);
  };

  // Listen for global waitlist events from navbar
  useEffect(() => {
    const handleOpenWaitlist = () => setWaitlistOpen(true);
    window.addEventListener('openWaitlist', handleOpenWaitlist);
    return () => window.removeEventListener('openWaitlist', handleOpenWaitlist);
  }, []);

  const handleLearnMore = () => {
    navigate('/how-it-works');
  };

  return (
    <Section variant="hero" spacing="large" sx={{ mt: { xs: 10, md: 12 } }}>
      <Column gap={4}>
        <Box>
          <Text variant="h1" weight="bold" align="center" sx={{ color: 'white', mb: 2 }}>
            Professional Invoicing
          </Text>
          <Text variant="h1" weight="bold" align="center" sx={{ 
            color: 'white',
            background: 'linear-gradient(45deg, #ffffff 30%, #f0f8ff 90%)',
            backgroundClip: 'text',
            textFillColor: 'transparent',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Made Simple
          </Text>
        </Box>
        
        <Text variant="h2" gutterBottom color="white" align="center">
          Complete Invoicing System for Your Business
        </Text>
        
        <Text variant="h5" gutterBottom color="rgba(255, 255, 255, 0.9)" sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}>
          Full-featured invoicing platform with client management, dashboard analytics, and customizable templates
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
            onClick={handleLearnMore}
            endIcon={<ArrowForward />}
          >
            Learn More
          </Button>
        </Row>
      </Column>
      
      <WaitlistModal 
        open={waitlistOpen} 
        onClose={() => setWaitlistOpen(false)} 
      />
    </Section>
  );
};

export default HeroSection;
