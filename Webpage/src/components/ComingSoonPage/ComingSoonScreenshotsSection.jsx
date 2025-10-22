import { useState } from 'react';
import { 
  Box,
  IconButton,
  Modal,
  Backdrop
} from '@mui/material';
import {
  Dashboard,
  Receipt,
  People,
  BarChart,
  Description,
  Inventory,
  Settings,
  ArrowBackIos,
  ArrowForwardIos,
  ZoomIn,
  Close
} from '@mui/icons-material';
import Section from '../ReusableComponents/Section.jsx';
import Column from '../ReusableComponents/Column.jsx';
import Text from '../ReusableComponents/Text.jsx';

const ComingSoonScreenshotsSection = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState({});
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const screenshots = [
    {
      id: 0,
      icon: <Dashboard />,
      title: 'Dashboard Overview',
      path: '/media/Dashboard1.png',
      description: 'Comprehensive business metrics at a glance'
    },
    {
      id: 1,
      icon: <Receipt />,
      title: 'Invoice Management',
      path: '/media/Invoice1.png',
      description: 'Create and manage invoices effortlessly'
    },
    {
      id: 2,
      icon: <People />,
      title: 'Client Management',
      path: '/media/Clients.png',
      description: 'Complete client directory and profiles'
    },
    {
      id: 3,
      icon: <BarChart />,
      title: 'Reports & Analytics',
      path: '/media/Report.png',
      description: 'Powerful insights and reporting'
    },
    {
      id: 4,
      icon: <Description />,
      title: 'Invoice Templates',
      path: '/media/Template1.png',
      description: 'Professional customizable templates'
    },
    {
      id: 5,
      icon: <Inventory />,
      title: 'Product Catalog',
      path: '/media/Products.png',
      description: 'Organize products and services'
    },
    {
      id: 6,
      icon: <Settings />,
      title: 'System Setup',
      path: '/media/SystemSetup1.png',
      description: 'Configure your business settings'
    }
  ];

  const currentScreenshot = screenshots[currentImageIndex];

  const handleNext = () => {
    setCurrentImageIndex((prev) => 
      prev === screenshots.length - 1 ? 0 : prev + 1
    );
  };

  const handlePrev = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? screenshots.length - 1 : prev - 1
    );
  };

  const handleImageError = (id) => {
    setImageErrors(prev => ({
      ...prev,
      [id]: true
    }));
  };

  return (
    <Section spacing="large" sx={{ mt: 6, position: 'relative' }}>
      <Column gap={4}>
        {/* Section Header */}
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Text 
            variant="h2" 
            weight="bold" 
            align="center" 
            sx={{ 
              mb: 2,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              textFillColor: 'transparent',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Sneak Peek
          </Text>
          <Text variant="h6" align="center" sx={{ 
            color: 'text.secondary',
            maxWidth: 700,
            mx: 'auto',
            lineHeight: 1.6
          }}>
            Get a glimpse of what's coming - a powerful, intuitive platform designed for your success
          </Text>
        </Box>

        {/* Main Screenshot Display with Liquid Glass Effect */}
        <Box sx={{
          animation: 'fadeIn 0.5s ease-out',
          '@keyframes fadeIn': {
            '0%': { opacity: 0, transform: 'translateY(20px)' },
            '100%': { opacity: 1, transform: 'translateY(0)' }
          }
        }} key={currentImageIndex}>
          <Box>
            <Box
              sx={{
                position: 'relative',
                maxWidth: 1200,
                mx: 'auto',
                borderRadius: 4,
                overflow: 'hidden',
                background: 'linear-gradient(145deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                border: '1px solid rgba(102, 126, 234, 0.2)',
                boxShadow: '0 20px 60px rgba(102, 126, 234, 0.2)',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
                  animation: 'shimmer 3s infinite',
                  zIndex: 1,
                  pointerEvents: 'none'
                },
                '@keyframes shimmer': {
                  '0%': { left: '-100%' },
                  '100%': { left: '100%' }
                }
              }}
            >
              {/* Browser Chrome */}
              <Box sx={{
                position: 'relative',
                zIndex: 2,
                height: 40,
                background: 'linear-gradient(145deg, rgba(241, 245, 249, 0.9) 0%, rgba(226, 232, 240, 0.9) 100%)',
                backdropFilter: 'blur(10px)',
                borderBottom: '1px solid rgba(0,0,0,0.1)',
                display: 'flex',
                alignItems: 'center',
                px: 2,
                gap: 1
              }}>
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f57' }} />
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', background: '#ffbd2e' }} />
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', background: '#28c840' }} />
                <Box sx={{
                  flex: 1,
                  height: 24,
                  background: 'rgba(255, 255, 255, 0.6)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 1,
                  ml: 2,
                  display: 'flex',
                  alignItems: 'center',
                  px: 2,
                  gap: 1
                }}>
                  <Box sx={{ color: 'primary.main', display: 'flex', alignItems: 'center' }}>
                    {currentScreenshot.icon}
                  </Box>
                  <Text sx={{ fontSize: '0.75rem', color: 'text.primary', fontWeight: 600 }}>
                    {currentScreenshot.title}
                  </Text>
                </Box>
              </Box>

              {/* Navigation Arrows */}
              {screenshots.length > 1 && (
                <>
                  <IconButton
                    onClick={handlePrev}
                    sx={{
                      position: 'absolute',
                      left: 16,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      zIndex: 3,
                      background: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(102, 126, 234, 0.2)',
                      width: 48,
                      height: 48,
                      boxShadow: '0 4px 20px rgba(102, 126, 234, 0.2)',
                      '&:hover': {
                        background: 'white',
                        transform: 'translateY(-50%) scale(1.1)',
                        boxShadow: '0 6px 30px rgba(102, 126, 234, 0.3)'
                      }
                    }}
                  >
                    <ArrowBackIos sx={{ fontSize: 20, color: '#667eea', ml: 0.5 }} />
                  </IconButton>

                  <IconButton
                    onClick={handleNext}
                    sx={{
                      position: 'absolute',
                      right: 16,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      zIndex: 3,
                      background: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(102, 126, 234, 0.2)',
                      width: 48,
                      height: 48,
                      boxShadow: '0 4px 20px rgba(102, 126, 234, 0.2)',
                      '&:hover': {
                        background: 'white',
                        transform: 'translateY(-50%) scale(1.1)',
                        boxShadow: '0 6px 30px rgba(102, 126, 234, 0.3)'
                      }
                    }}
                  >
                    <ArrowForwardIos sx={{ fontSize: 20, color: '#667eea' }} />
                  </IconButton>
                </>
              )}

              {/* Screenshot Container - Clickable to open in lightbox */}
              <Box 
                onClick={() => setLightboxOpen(true)}
                sx={{
                  width: '100%',
                  aspectRatio: '16/10',
                  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.03) 0%, rgba(118, 75, 162, 0.03) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  cursor: 'pointer',
                  '&:hover .zoom-icon': {
                    opacity: 1,
                    transform: 'translate(-50%, -50%) scale(1)'
                  }
                }}
              >
                {imageErrors[currentScreenshot.id] ? (
                  <Box sx={{ 
                    textAlign: 'center', 
                    p: 5,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Box sx={{ 
                      fontSize: '80px', 
                      color: 'rgba(102, 126, 234, 0.3)', 
                      mb: 2 
                    }}>
                      📷
                    </Box>
                    <Text weight="600" sx={{ 
                      color: 'rgba(0,0,0,0.5)', 
                      fontSize: '1.2rem', 
                      mb: 1 
                    }}>
                      {currentScreenshot.title}
                    </Text>
                    <Text sx={{ 
                      color: 'rgba(0,0,0,0.4)', 
                      fontSize: '1rem' 
                    }}>
                      {currentScreenshot.description}
                    </Text>
                  </Box>
                ) : (
                  <>
                    <Box 
                      component="img"
                      src={currentScreenshot.path}
                      alt={currentScreenshot.title}
                      onError={() => handleImageError(currentScreenshot.id)}
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                    {/* Zoom Icon Hint */}
                    <Box 
                      className="zoom-icon"
                      sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%) scale(0.8)',
                        opacity: 0,
                        transition: 'all 0.3s ease',
                        background: 'rgba(0, 0, 0, 0.7)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '50%',
                        width: 80,
                        height: 80,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        pointerEvents: 'none',
                        zIndex: 3
                      }}
                    >
                      <ZoomIn sx={{ fontSize: 40, color: 'white' }} />
                    </Box>
                  </>
                )}
              </Box>

              {/* Info Overlay with Glass Effect - Only on Preview */}
              <Box sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'linear-gradient(0deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 50%, transparent 100%)',
                backdropFilter: 'blur(10px)',
                color: 'white',
                p: 3,
                pt: 6,
                zIndex: 2
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                  <Box>
                    <Text weight="600" sx={{ fontSize: '1.3rem', mb: 0.5, color: 'white' }}>
                      {currentScreenshot.title}
                    </Text>
                    <Text sx={{ fontSize: '1rem', opacity: 0.9, color: 'rgba(255,255,255,0.9)' }}>
                      {currentScreenshot.description}
                    </Text>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    {screenshots.map((_, index) => (
                      <Box
                        key={index}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentImageIndex(index);
                        }}
                        sx={{
                          width: index === currentImageIndex ? 32 : 8,
                          height: 8,
                          borderRadius: '4px',
                          background: index === currentImageIndex 
                            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                            : 'rgba(255, 255, 255, 0.4)',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            background: index === currentImageIndex
                              ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                              : 'rgba(255, 255, 255, 0.7)',
                            transform: 'scale(1.1)'
                          }
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Thumbnail Preview Grid */}
        <Box sx={{
          display: 'flex',
          gap: 2,
          overflowX: 'auto',
          pb: 2,
          justifyContent: 'center',
          flexWrap: { xs: 'nowrap', md: 'wrap' },
          '&::-webkit-scrollbar': {
            height: 8
          },
          '&::-webkit-scrollbar-track': {
            background: 'rgba(0,0,0,0.05)',
            borderRadius: 4
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(102, 126, 234, 0.3)',
            borderRadius: 4,
            '&:hover': {
              background: 'rgba(102, 126, 234, 0.5)'
            }
          }
        }}>
          {screenshots.map((screenshot, index) => (
            <Box
              key={screenshot.id}
              onClick={() => setCurrentImageIndex(index)}
              sx={{
                minWidth: { xs: 100, sm: 120 },
                cursor: 'pointer',
                p: 2,
                borderRadius: 2,
                background: currentImageIndex === index
                  ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)'
                  : 'rgba(102, 126, 234, 0.05)',
                backdropFilter: 'blur(10px)',
                border: currentImageIndex === index
                  ? '2px solid rgba(102, 126, 234, 0.4)'
                  : '2px solid transparent',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)',
                  boxShadow: '0 8px 24px rgba(102, 126, 234, 0.2)'
                }
              }}
            >
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: currentImageIndex === index
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  : 'rgba(102, 126, 234, 0.1)',
                mx: 'auto',
                mb: 1,
                color: currentImageIndex === index ? 'white' : 'primary.main',
                '& svg': { fontSize: 20 }
              }}>
                {screenshot.icon}
              </Box>
              <Text 
                align="center" 
                sx={{ 
                  fontSize: '0.75rem',
                  fontWeight: currentImageIndex === index ? 600 : 500,
                  color: currentImageIndex === index ? 'primary.main' : 'text.secondary'
                }}
              >
                {screenshot.title}
              </Text>
            </Box>
          ))}
        </Box>
      </Column>

      {/* Lightbox Modal for Image Preview */}
      <Modal
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 500,
            sx: {
              backgroundColor: 'rgba(0, 0, 0, 0.9)',
              backdropFilter: 'blur(10px)'
            }
          }
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '95%', sm: '90%', md: '85%' },
            maxWidth: 1400,
            maxHeight: '90vh',
            outline: 'none',
            animation: 'fadeInScale 0.3s ease-out',
            '@keyframes fadeInScale': {
              '0%': { opacity: 0, transform: 'translate(-50%, -50%) scale(0.9)' },
              '100%': { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' }
            }
          }}
        >
          {/* Close Button */}
          <IconButton
            onClick={() => setLightboxOpen(false)}
            sx={{
              position: 'absolute',
              top: -50,
              right: 0,
              color: 'white',
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              zIndex: 10,
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.2)',
                transform: 'scale(1.1)'
              }
            }}
          >
            <Close />
          </IconButton>

          {/* Image with Browser Chrome */}
          <Box
            sx={{
              position: 'relative',
              borderRadius: 3,
              overflow: 'hidden',
              background: 'linear-gradient(145deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
            }}
          >
            {/* Browser Chrome */}
            <Box sx={{
              height: 40,
              background: 'linear-gradient(145deg, rgba(241, 245, 249, 0.95) 0%, rgba(226, 232, 240, 0.95) 100%)',
              backdropFilter: 'blur(10px)',
              borderBottom: '1px solid rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'center',
              px: 2,
              gap: 1
            }}>
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f57' }} />
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', background: '#ffbd2e' }} />
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', background: '#28c840' }} />
              <Box sx={{
                flex: 1,
                height: 24,
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(10px)',
                borderRadius: 1,
                ml: 2,
                display: 'flex',
                alignItems: 'center',
                px: 2,
                gap: 1
              }}>
                <Box sx={{ color: 'primary.main', display: 'flex', alignItems: 'center' }}>
                  {currentScreenshot.icon}
                </Box>
                <Text sx={{ fontSize: '0.75rem', color: 'text.primary', fontWeight: 600 }}>
                  {currentScreenshot.title}
                </Text>
              </Box>
            </Box>

            {/* Full Size Image */}
            <Box
              sx={{
                width: '100%',
                maxHeight: 'calc(90vh - 40px)',
                overflow: 'auto',
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.03) 0%, rgba(118, 75, 162, 0.03) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Box
                component="img"
                src={currentScreenshot.path}
                alt={currentScreenshot.title}
                sx={{
                  width: '100%',
                  height: 'auto',
                  display: 'block'
                }}
              />
            </Box>

            {/* Navigation Arrows in Lightbox */}
          </Box>
        </Box>
      </Modal>
    </Section>
  );
};

export default ComingSoonScreenshotsSection;
