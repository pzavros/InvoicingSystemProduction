import { useState, useEffect } from 'react';
import { Rocket, Timer, NotificationsActive } from '@mui/icons-material';
import { Box } from '@mui/material';
import Section from '../ReusableComponents/Section.jsx';
import Column from '../ReusableComponents/Column.jsx';
import Row from '../ReusableComponents/Row.jsx';
import Text from '../ReusableComponents/Text.jsx';
import Button from '../ReusableComponents/Button.jsx';
import IconBox from '../ReusableComponents/IconBox.jsx';
import WaitlistModal from '../ReusableComponents/WaitlistModal.jsx';

const ComingSoonHeroSection = () => {
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [floatingElements, setFloatingElements] = useState([]);

  useEffect(() => {
    // Generate random floating elements for liquid glass effect
    const elements = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: 100 + Math.random() * 200,
      duration: 15 + Math.random() * 10,
      delay: Math.random() * 5
    }));
    setFloatingElements(elements);
  }, []);

  return (
    <Section variant="hero" spacing="large" sx={{ 
      mt: { xs: 10, md: 12 },
      position: 'relative',
      overflow: 'hidden',
      minHeight: '90vh',
      display: 'flex',
      alignItems: 'center'
    }}>
      {/* Animated Liquid Glass Background Elements */}
      {floatingElements.map((element) => (
        <Box
          key={element.id}
          sx={{
            position: 'absolute',
            left: `${element.left}%`,
            top: `${element.top}%`,
            width: element.size,
            height: element.size,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.1) 50%, transparent 100%)',
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 32px rgba(102, 126, 234, 0.1)',
            animation: `float ${element.duration}s ease-in-out infinite`,
            animationDelay: `${element.delay}s`,
            pointerEvents: 'none',
            '@keyframes float': {
              '0%, 100%': {
                transform: 'translate(0, 0) scale(1)',
                opacity: 0.3
              },
              '25%': {
                transform: 'translate(20px, -20px) scale(1.1)',
                opacity: 0.5
              },
              '50%': {
                transform: 'translate(-20px, 20px) scale(0.9)',
                opacity: 0.4
              },
              '75%': {
                transform: 'translate(30px, 10px) scale(1.05)',
                opacity: 0.45
              }
            }
          }}
        />
      ))}

      <Column gap={5} sx={{ position: 'relative', zIndex: 2, textAlign: 'center', alignItems: 'center', width: '100%' }}>
        {/* Animated Icon */}
        <Box sx={{ 
          position: 'relative', 
          display: 'inline-block', 
          mx: 'auto',
          animation: 'fadeIn 1s ease-out',
          '@keyframes fadeIn': {
            '0%': { opacity: 0, transform: 'translateY(20px)' },
            '100%': { opacity: 1, transform: 'translateY(0)' }
          }
        }}>
          <Box sx={{ position: 'relative', display: 'inline-block', mx: 'auto' }}>
            <IconBox 
              size={120} 
              sx={{ 
                mx: 'auto',
                mb: 2,
                background: 'rgba(255, 255, 255, 0.25)',
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                border: '2px solid rgba(255, 255, 255, 0.4)',
                boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.5)',
                animation: 'pulse 3s ease-in-out infinite',
                '@keyframes pulse': {
                  '0%, 100%': { 
                    transform: 'scale(1)',
                    boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.5)'
                  },
                  '50%': { 
                    transform: 'scale(1.05)',
                    boxShadow: '0 12px 40px rgba(102, 126, 234, 0.5), inset 0 1px 2px rgba(255, 255, 255, 0.7)'
                  }
                }
              }}
            >
              <Rocket sx={{ fontSize: 60, color: 'white' }} />
            </IconBox>
            
            {/* Orbiting particles */}
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: 180,
                height: 180,
                marginLeft: '-90px',
                marginTop: '-90px',
                animation: 'rotate 20s linear infinite',
                '@keyframes rotate': {
                  '0%': { transform: 'rotate(0deg)' },
                  '100%': { transform: 'rotate(360deg)' }
                }
              }}
            >
              {[0, 120, 240].map((angle, i) => (
                <Box
                  key={i}
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: '50%',
                    width: 12,
                    height: 12,
                    marginLeft: '-6px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.8)',
                    boxShadow: '0 0 20px rgba(102, 126, 234, 0.8)',
                    transform: `rotate(${angle}deg) translateY(-90px)`,
                    animation: `particlePulse ${1 + i * 0.2}s ease-in-out infinite`
                  }}
                />
              ))}
              <style>
                {`
                  @keyframes particlePulse {
                    0%, 100% { opacity: 0.6; transform: rotate(0deg) translateY(-90px) scale(1); }
                    50% { opacity: 1; transform: rotate(0deg) translateY(-90px) scale(1.3); }
                  }
                `}
              </style>
            </Box>
          </Box>
        </Box>

        {/* Main Heading with Liquid Glass Effect */}
        <Box sx={{
          animation: 'fadeIn 1.2s ease-out',
          textAlign: 'center',
          width: '100%',
          '@keyframes fadeIn': {
            '0%': { opacity: 0, transform: 'translateY(20px)' },
            '100%': { opacity: 1, transform: 'translateY(0)' }
          }
        }}>
          <Box sx={{ textAlign: 'center', width: '100%' }}>
            <Text 
              variant="h1" 
              weight="bold" 
              align="center" 
              sx={{ 
                color: 'white',
                mb: 2,
                fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem' },
                lineHeight: 1.1,
                textShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                animation: 'fadeInUp 1s ease-out',
                '@keyframes fadeInUp': {
                  '0%': { 
                    opacity: 0,
                    transform: 'translateY(30px)'
                  },
                  '100%': { 
                    opacity: 1,
                    transform: 'translateY(0)'
                  }
                }
              }}
            >
              Coming Soon
            </Text>
            <Text 
              variant="h3" 
              weight="bold" 
              align="center" 
              sx={{ 
                background: 'linear-gradient(135deg, #ffffff 0%, rgba(255, 255, 255, 0.8) 50%, #f0f8ff 100%)',
                backgroundClip: 'text',
                textFillColor: 'transparent',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 3,
                fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }
              }}
            >
              E-Nvoicing Platform
            </Text>
          </Box>
        </Box>

        {/* Description in Glass Container */}
        <Box sx={{
          animation: 'fadeIn 1.4s ease-out',
          textAlign: 'center',
          width: '100%',
          '@keyframes fadeIn': {
            '0%': { opacity: 0, transform: 'translateY(20px)' },
            '100%': { opacity: 1, transform: 'translateY(0)' }
          }
        }}>
          <Box
            sx={{
              maxWidth: 700,
              mx: 'auto',
              p: 4,
              borderRadius: 4,
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 2px rgba(255, 255, 255, 0.3)',
              textAlign: 'center'
            }}
          >
            <Text 
              variant="h5" 
              align="center" 
              sx={{ 
                color: 'rgba(255, 255, 255, 0.95)',
                lineHeight: 1.6,
                mb: 2
              }}
            >
              We're putting the finishing touches on our revolutionary invoicing platform.
            </Text>
            <Text 
              variant="h6" 
              align="center" 
              sx={{ 
                color: 'rgba(255, 255, 255, 0.85)',
                lineHeight: 1.6
              }}
            >
              Get ready to transform your business with professional invoicing, 
              powerful analytics, and seamless client management.
            </Text>
          </Box>
        </Box>

        {/* Features Cards */}
        <Box sx={{
          animation: 'fadeIn 1.6s ease-out',
          textAlign: 'center',
          width: '100%',
          '@keyframes fadeIn': {
            '0%': { opacity: 0, transform: 'translateY(20px)' },
            '100%': { opacity: 1, transform: 'translateY(0)' }
          }
        }}>
          <Row 
            gap={3} 
            sx={{ 
              justifyContent: 'center', 
              flexWrap: 'wrap',
              mt: 4,
              maxWidth: 900,
              mx: 'auto'
            }}
          >
            {[
              { icon: <Rocket />, title: 'Launch Ready', desc: 'Final preparations underway' },
              { icon: <Timer />, title: 'Almost There', desc: 'Just a few more days' },
              { icon: <NotificationsActive />, title: 'Be First', desc: 'Join our waitlist now' }
            ].map((feature, index) => (
              <Box
                key={index}
                sx={{
                  flex: { xs: '1 1 100%', sm: '1 1 calc(33.333% - 16px)' },
                  maxWidth: { xs: '100%', sm: 280 },
                  p: 3,
                  borderRadius: 3,
                  background: 'rgba(255, 255, 255, 0.12)',
                  backdropFilter: 'blur(15px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(15px) saturate(180%)',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.3s ease',
                  textAlign: 'center',
                  animation: `slideIn 0.6s ease-out ${index * 0.1}s backwards`,
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    background: 'rgba(255, 255, 255, 0.18)',
                    boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
                  },
                  '@keyframes slideIn': {
                    '0%': {
                      opacity: 0,
                      transform: 'translateY(40px)'
                    },
                    '100%': {
                      opacity: 1,
                      transform: 'translateY(0)'
                    }
                  }
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(10px)',
                    mx: 'auto',
                    mb: 2,
                    color: 'white',
                    '& svg': { fontSize: 28 }
                  }}
                >
                  {feature.icon}
                </Box>
                <Text 
                  variant="h6" 
                  weight="bold" 
                  align="center" 
                  sx={{ color: 'white', mb: 1 }}
                >
                  {feature.title}
                </Text>
                <Text 
                  align="center" 
                  sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9rem' }}
                >
                  {feature.desc}
                </Text>
              </Box>
            ))}
          </Row>
        </Box>

        {/* CTA Button */}
        <Box sx={{ 
          mt: 2,
          textAlign: 'center',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          animation: 'fadeIn 1.8s ease-out',
          '@keyframes fadeIn': {
            '0%': { opacity: 0, transform: 'translateY(20px)' },
            '100%': { opacity: 1, transform: 'translateY(0)' }
          }
        }}>
          <Box sx={{ mt: 2, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Button 
              variant="glass" 
              size="large"
              onClick={() => setWaitlistOpen(true)}
              startIcon={<NotificationsActive />}
              sx={{
                fontSize: { xs: '1rem', md: '1.1rem' },
                py: { xs: 2, md: 2.5 },
                px: { xs: 4, md: 5 },
                animation: 'buttonPulse 2s ease-in-out infinite',
                '@keyframes buttonPulse': {
                  '0%, 100%': { 
                    boxShadow: '0 8px 32px rgba(255, 255, 255, 0.2)'
                  },
                  '50%': { 
                    boxShadow: '0 12px 40px rgba(255, 255, 255, 0.4)'
                  }
                }
              }}
            >
              Join the Waitlist
            </Button>
            <Text 
              align="center" 
              sx={{ 
                color: 'rgba(255, 255, 255, 0.7)', 
                mt: 2,
                fontSize: '0.9rem'
              }}
            >
              Be among the first to experience E-Nvoicing
            </Text>
          </Box>
        </Box>
      </Column>

      <WaitlistModal 
        open={waitlistOpen} 
        onClose={() => setWaitlistOpen(false)} 
      />
    </Section>
  );
};

export default ComingSoonHeroSection;
