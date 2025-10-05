import { useState } from 'react';
import { RocketLaunch, PlayArrow, Close, OpenInNew, VideoLibrary } from '@mui/icons-material';
import { Box, IconButton, Fade, Tooltip, CircularProgress } from '@mui/material';
import Section from '../ReusableComponents/Section.jsx';
import Column from '../ReusableComponents/Column.jsx';
import Row from '../ReusableComponents/Row.jsx';
import Text from '../ReusableComponents/Text.jsx';
import IconBox from '../ReusableComponents/IconBox.jsx';
import Button from '../ReusableComponents/Button.jsx';

const HowItWorksHeroSection = () => {
  const [showVideo, setShowVideo] = useState(false);
  const [videoLoading, setVideoLoading] = useState(true);
  const videoId = 'dA3Dq24BzgY'; // YouTube video ID
  const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;

  const handleViewDemo = () => {
    setShowVideo(true);
    setVideoLoading(true);
    // Simulate loading time for better UX
    setTimeout(() => setVideoLoading(false), 1000);
  };

  const handleCloseVideo = () => {
    setShowVideo(false);
    setVideoLoading(true);
  };

  const handleOpenInYouTube = () => {
    window.open(youtubeUrl, '_blank');
  };

  return (
    <Section variant="hero" spacing="large" sx={{ mt: { xs: 10, md: 12 } }}>
      <Column gap={4}>
        <IconBox size={100} sx={{ mx: 'auto', mb: 2 }}>
          <RocketLaunch sx={{ fontSize: 50, color: 'white' }} />
        </IconBox>
        
        <Text variant="h1" weight="bold" align="center" sx={{ color: 'white', mb: 2 }}>
          How It Works
        </Text>
        
        <Text variant="h5" align="center" sx={{ 
          color: 'rgba(255,255,255,0.9)',
          maxWidth: 700,
          mx: 'auto',
          lineHeight: 1.6
        }}>
          From setup to invoice generation, learn how our system streamlines your entire 
          invoicing workflow in three simple steps.
        </Text>

        {/* Action Buttons */}
        <Row gap={3} sx={{ justifyContent: 'center', flexWrap: { xs: 'wrap', sm: 'nowrap' }, mt: 2 }}>
          <Button 
            variant="primary" 
            size="large"
            sx={{ 
              background: 'rgba(255,255,255,0.9)',
              color: '#667eea',
              '&:hover': {
                background: 'white',
              }
            }}
          >
            Get Started Now
          </Button>
          <Button 
            variant="outline" 
            size="large"
            onClick={handleViewDemo}
            startIcon={<PlayArrow />}
            sx={{
              animation: showVideo ? 'none' : 'pulse 2s infinite',
              '@keyframes pulse': {
                '0%': { transform: 'scale(1)' },
                '50%': { transform: 'scale(1.05)' },
                '100%': { transform: 'scale(1)' }
              }
            }}
          >
            View Demo
          </Button>
        </Row>

        {/* Video Player */}
        <Fade in={showVideo}>
          <Box sx={{ 
            mt: { xs: 4, md: 6 }, 
            mb: { xs: 2, md: 4 },
            display: showVideo ? 'block' : 'none',
            maxWidth: { xs: '95%', sm: '90%', md: 1200, lg: 1400 },
            width: '100%',
            mx: 'auto',
            position: 'relative'
          }}>
            {/* Video Container with Cool Design */}
            <Box sx={{
              position: 'relative',
              background: 'linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
              borderRadius: 4,
              p: { xs: 2, sm: 3, md: 4 },
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
              animation: 'slideInUp 0.5s ease-out',
              '@keyframes slideInUp': {
                from: {
                  transform: 'translateY(30px)',
                  opacity: 0
                },
                to: {
                  transform: 'translateY(0)',
                  opacity: 1
                }
              }
            }}>
              {/* Header with Controls */}
              <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2,
                pb: 2,
                borderBottom: '1px solid rgba(255,255,255,0.1)'
              }}>
                <Text sx={{ color: 'white', fontWeight: 'bold', fontSize: { xs: '1.2rem', md: '1.4rem' } }}>
                  How It Works - Product Demo
                </Text>
                <Row gap={1}>
                  <Tooltip title="Open in YouTube">
                    <IconButton 
                      onClick={handleOpenInYouTube}
                      sx={{ 
                        color: 'white',
                        '&:hover': { background: 'rgba(255,255,255,0.1)' }
                      }}
                    >
                      <OpenInNew />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Close Video">
                    <IconButton 
                      onClick={handleCloseVideo}
                      sx={{ 
                        color: 'white',
                        '&:hover': { background: 'rgba(255,255,255,0.1)' }
                      }}
                    >
                      <Close />
                    </IconButton>
                  </Tooltip>
                </Row>
              </Box>

              {/* Video Player */}
              <Box sx={{
                position: 'relative',
                paddingBottom: '56.25%', // 16:9 aspect ratio
                height: 0,
                borderRadius: 2,
                overflow: 'hidden',
                background: 'linear-gradient(45deg, #1a1a1a 0%, #2d2d2d 100%)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
              }}>
                {/* Loading State */}
                {videoLoading && (
                  <Box sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(45deg, #1a1a1a 0%, #2d2d2d 100%)',
                    zIndex: 2
                  }}>
                    <VideoLibrary sx={{ fontSize: { xs: 60, md: 80 }, color: 'white', mb: 2, opacity: 0.7 }} />
                    <CircularProgress sx={{ color: 'white', mb: 2, size: { xs: 40, md: 50 } }} />
                    <Text sx={{ color: 'white', opacity: 0.8, fontSize: { xs: '1rem', md: '1.2rem' } }}>Loading workflow demo...</Text>
                  </Box>
                )}
                
                {/* YouTube iframe */}
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&controls=1`}
                  title="How It Works Demo"
                  frameBorder="0"
                  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  onLoad={() => setVideoLoading(false)}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    borderRadius: '8px',
                    opacity: videoLoading ? 0 : 1,
                    transition: 'opacity 0.3s ease'
                  }}
                />
              </Box>

              {/* Video Info */}
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Text sx={{ color: 'rgba(255,255,255,0.8)', fontSize: { xs: '1rem', md: '1.1rem' } }}>
                  See our complete invoicing workflow in action • Click the YouTube icon to open in a new tab
                </Text>
              </Box>
            </Box>
          </Box>
        </Fade>
      </Column>
    </Section>
  );
};

export default HowItWorksHeroSection;
