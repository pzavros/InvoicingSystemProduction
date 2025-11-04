import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Rocket, ArrowForward } from '@mui/icons-material';
import { Box } from '@mui/material';
import Section from '../ReusableComponents/Section.jsx';
import Column from '../ReusableComponents/Column.jsx';
import Row from '../ReusableComponents/Row.jsx';
import Text from '../ReusableComponents/Text.jsx';
import Button from '../ReusableComponents/Button.jsx';
import { navigateToApp } from '../../utils/navigation.js';

const HeroSection = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigateToApp('register');
  };

  const handleLearnMore = () => {
    navigate('/how-it-works');
    // Scroll to screenshots section after navigation
    setTimeout(() => {
      const showcaseSection = document.querySelector('[data-section="system-showcase"]');
      if (showcaseSection) {
        showcaseSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
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
        
        <Text variant="h5" gutterBottom color="rgba(255, 255, 255, 0.9)" align="center" sx={{ maxWidth: 600, mx: 'auto', mb: 4, textAlign: 'center' }}>
          Full-featured invoicing platform with client management, dashboard analytics, and customizable templates - Now Live!
        </Text>
        
        <Row gap={3} sx={{ justifyContent: 'center', flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
          <Button 
            variant="glass" 
            size="large"
            onClick={handleGetStarted}
            startIcon={<Rocket />}
          >
            Get Started Free
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
    </Section>
  );
};

export default HeroSection;
