import { useState } from 'react';
import { Rocket, NotificationsActive } from '@mui/icons-material';
import { Box } from '@mui/material';
import Section from '../ReusableComponents/Section.jsx';
import Column from '../ReusableComponents/Column.jsx';
import Text from '../ReusableComponents/Text.jsx';
import Button from '../ReusableComponents/Button.jsx';
import WaitlistModal from '../ReusableComponents/WaitlistModal.jsx';

const ComingSoonCTASection = () => {
  const [waitlistOpen, setWaitlistOpen] = useState(false);

  return (
    <Section 
      variant="cta" 
      spacing="large" 
      sx={{ 
        mt: 6,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Animated Background Elements */}
      <Box
        sx={{
          position: 'absolute',
          top: '-50%',
          left: '-10%',
          width: '120%',
          height: '200%',
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%)',
          animation: 'rotate 30s linear infinite',
          pointerEvents: 'none',
          '@keyframes rotate': {
            '0%': { transform: 'rotate(0deg)' },
            '100%': { transform: 'rotate(360deg)' }
          }
        }}
      />

      <Column gap={4} sx={{ position: 'relative', zIndex: 2 }}>
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(20px)',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 2,
            animation: 'bounce 2s ease-in-out infinite',
            '@keyframes bounce': {
              '0%, 100%': { transform: 'translateY(0)' },
              '50%': { transform: 'translateY(-10px)' }
            }
          }}
        >
          <Rocket sx={{ fontSize: 40, color: 'white' }} />
        </Box>

        <Text variant="h2" weight="bold" align="center" sx={{ color: 'white', mb: 2 }}>
          Don't Miss Out
        </Text>
        
        <Text variant="h5" align="center" sx={{ 
          color: 'rgba(255,255,255,0.9)',
          maxWidth: 700,
          mx: 'auto',
          mb: 2,
          lineHeight: 1.6
        }}>
          Be among the first to experience the future of invoicing. 
          Join our waitlist and get exclusive early access when we launch.
        </Text>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            alignItems: 'center',
            p: 4,
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(15px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            maxWidth: 600,
            mx: 'auto',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
          }}
        >
          <Button 
            variant="glass" 
            size="large"
            onClick={() => setWaitlistOpen(true)}
            startIcon={<NotificationsActive />}
            sx={{
              fontSize: '1.1rem',
              py: 2.5,
              px: 5,
              background: 'rgba(255, 255, 255, 0.95)',
              color: '#667eea',
              fontWeight: 700,
              '&:hover': {
                background: 'white',
                transform: 'translateY(-2px)',
                boxShadow: '0 12px 40px rgba(255, 255, 255, 0.3)'
              }
            }}
          >
            Join the Waitlist Now
          </Button>
          
          <Box sx={{ 
            display: 'flex', 
            gap: 4, 
            mt: 2,
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            {[
              { number: 'Soon', label: 'Launch Date' },
              { number: 'Full', label: 'Feature Set' },
              { number: '100%', label: 'Secure' }
            ].map((stat, index) => (
              <Box key={index} sx={{ textAlign: 'center' }}>
                <Text 
                  variant="h4" 
                  weight="bold" 
                  sx={{ 
                    color: 'white',
                    mb: 0.5,
                    textShadow: '0 2px 10px rgba(0, 0, 0, 0.2)'
                  }}
                >
                  {stat.number}
                </Text>
                <Text sx={{ 
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: '0.9rem'
                }}>
                  {stat.label}
                </Text>
              </Box>
            ))}
          </Box>
        </Box>

        <Text align="center" sx={{ 
          color: 'rgba(255, 255, 255, 0.7)',
          fontSize: '0.95rem',
          mt: 2
        }}>
          No credit card required • Free to join • Cancel anytime
        </Text>
      </Column>

      <WaitlistModal 
        open={waitlistOpen} 
        onClose={() => setWaitlistOpen(false)} 
      />
    </Section>
  );
};

export default ComingSoonCTASection;
