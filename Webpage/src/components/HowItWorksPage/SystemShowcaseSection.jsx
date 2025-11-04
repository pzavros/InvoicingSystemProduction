import { useState } from 'react';
import { 
  Box,
  useTheme,
  useMediaQuery,
  Fade,
  IconButton,
  Modal,
  Backdrop
} from '@mui/material';
import {
  Dashboard,
  Receipt,
  People,
  BarChart,
  Settings,
  CheckCircle,
  ArrowBackIos,
  ArrowForwardIos,
  Description,
  Inventory,
  ZoomIn,
  Close
} from '@mui/icons-material';
import Section from '../ReusableComponents/Section.jsx';
import Column from '../ReusableComponents/Column.jsx';
import Row from '../ReusableComponents/Row.jsx';
import Text from '../ReusableComponents/Text.jsx';
import Grid from '../ReusableComponents/Grid.jsx';

const SystemShowcaseSection = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [selectedFeature, setSelectedFeature] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState({});
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Feature tabs
  const features = [
    {
      id: 0,
      icon: <Dashboard />,
      title: 'Dashboard Overview',
      description: 'Get a complete overview of your business metrics at a glance',
      // Replace these placeholder paths with your actual screenshot paths
      images: [
        {
          path: '/media/Dashboard1.png',
          title: 'Main Dashboard',
          description: 'Overview of key metrics and recent activity'
        },
        {
          path: '/media/Dashboard2.png',
          title: 'Main Dashboard',
          description: 'Overview of key metrics and recent activity'
        }
      ],
      highlights: [
        'Real-time analytics',
        'Revenue tracking',
        'Recent invoices',
        'Client overview'
      ]
    },
    {
      id: 1,
      icon: <Receipt />,
      title: 'Invoice Management',
      description: 'Create, edit, and manage invoices with professional templates',
      images: [
        {
          path: '/media/Invoice1.png',
          title: 'Invoice List',
          description: 'Manage all your invoices in one place'
        },
        {
          path: '/media/InvoiceModal.png',
          title: 'Invoice Quick Viewer',
          description: 'Quick preview an invoice.'
        }
      ],
      highlights: [
        'Custom templates',
        'Multiple currencies',
        'Automatic calculations',
        'PDF generation'
      ]
    },
    {
      id: 2,
      icon: <People />,
      title: 'Client Management',
      description: 'Keep track of all your clients and their billing information',
      images: [
        {
          path: '/media/Clients.png',
          title: 'Client Directory',
          description: 'Complete list of all your clients'
        }
      ],
      highlights: [
        'Client profiles',
        'Contact management',
        'Invoice history',
        'Quick actions'
      ]
    },
    {
      id: 3,
      icon: <BarChart />,
      title: 'Reports & Analytics',
      description: 'Gain insights with comprehensive reports and analytics',
      images: [
        {
          path: '/media/Report.png',
          title: 'Reports Dashboard',
          description: 'Summary of all your business reports'
        }
      ],
      highlights: [
        'Revenue reports',
        'Client analytics',
        'Export options',
        'Visual charts'
      ]
    },
    {
      id: 4,
      icon: <Description />,
      title: 'Invoice Templates',
      description: 'Create and customize professional invoice templates for your business',
      images: [
        {
          path: '/media/Template1.png',
          title: 'Template Gallery',
          description: 'Browse and select from various invoice templates'
        },
        {
          path: '/media/Template2.png',
          title: 'Template Designer',
          description: 'Customize colors, fonts, and layout of your templates'
        }
      ],
      highlights: [
        'Professional designs',
        'Custom branding',
        'Multiple layouts',
        'Easy customization'
      ]
    },
    {
      id: 5,
      icon: <Inventory />,
      title: 'Product Management',
      description: 'Organize and manage your products and services efficiently',
      images: [
        {
          path: '/media/Products.png',
          title: 'Product Catalog',
          description: 'Complete overview of all your products and services'
        },
        {
          path: '/media/Categories.png',
          title: 'Product Categories',
          description: 'Add and edit product categories for better organization of products.'
        }
      ],
      highlights: [
        'Product catalog',
        'Price management',
        'Service tracking',
        'Quick selection'
      ]
    },
    {
      id: 6,
      icon: <Settings />,
      title: 'System Setup',
      description: 'Configure your system settings and business preferences',
      images: [
        {
          path: '/media/SystemSetup1.png',
          title: 'General Settings',
          description: 'Configure business information.'
        },
        {
          path: '/media/SystemSetup2.png',
          title: 'General Settings',
          description: 'Configure business information.'
        }
      ],
      highlights: [
        'Business setup',
        'User preferences',
        'Integration settings',
        'Notification control'
      ]
    }
  ];

  const currentFeature = features[selectedFeature];
  const currentImage = currentFeature.images[currentImageIndex];

  const handleFeatureChange = (featureId) => {
    setSelectedFeature(featureId);
    setCurrentImageIndex(0); // Reset to first image when changing features
    setImageErrors({}); // Reset image errors when changing features
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === currentFeature.images.length - 1 ? 0 : prev + 1
    );
  };

  const handleImageError = (imageKey) => {
    setImageErrors(prev => ({
      ...prev,
      [imageKey]: true
    }));
  };

  const getImageKey = (featureId, imageIndex) => `${featureId}-${imageIndex}`;

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? currentFeature.images.length - 1 : prev - 1
    );
  };

  return (
    <Section spacing="large" sx={{ mt: 8 }} data-section="system-showcase">
      <Column gap={4}>
        {/* Section Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Text variant="h2" weight="bold" align="center" sx={{ mb: 2 }}>
            See The System In Action
          </Text>
          <Text variant="h6" align="center" sx={{ 
            color: 'text.secondary',
            maxWidth: 700,
            mx: 'auto',
            lineHeight: 1.6
          }}>
            Explore our intuitive interface designed to streamline your invoicing workflow
          </Text>
        </Box>

        {/* Feature Tabs */}
        <Box sx={{ 
          display: 'flex',
          gap: 2,
          overflowX: 'auto',
          pb: 2,
          mb: 4,
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
          {features.map((feature) => (
            <Box
              key={feature.id}
              onClick={() => handleFeatureChange(feature.id)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                px: 3,
                py: 1.5,
                borderRadius: 3,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                minWidth: { xs: 'auto', md: 'unset' },
                whiteSpace: 'nowrap',
                background: selectedFeature === feature.id
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  : 'rgba(102, 126, 234, 0.05)',
                color: selectedFeature === feature.id ? 'white' : 'text.primary',
                border: selectedFeature === feature.id
                  ? '2px solid transparent'
                  : '2px solid rgba(102, 126, 234, 0.1)',
                transform: selectedFeature === feature.id ? 'translateY(-2px)' : 'translateY(0)',
                boxShadow: selectedFeature === feature.id
                  ? '0 8px 24px rgba(102, 126, 234, 0.3)'
                  : 'none',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  background: selectedFeature === feature.id
                    ? 'linear-gradient(135deg, #5a6fd8 0%, #6b46c1 100%)'
                    : 'rgba(102, 126, 234, 0.1)',
                  boxShadow: '0 4px 16px rgba(102, 126, 234, 0.2)'
                }
              }}
            >
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                '& svg': { fontSize: 20 }
              }}>
                {feature.icon}
              </Box>
              <Text 
                weight={selectedFeature === feature.id ? 600 : 500}
                sx={{ 
                  fontSize: '0.95rem',
                  display: { xs: 'none', sm: 'block' }
                }}
              >
                {feature.title}
              </Text>
            </Box>
          ))}
        </Box>

        {/* Showcase Content */}
        <Fade in={true} timeout={500} key={selectedFeature}>
          <Box>
            <Row gap={6} sx={{ 
              alignItems: 'flex-start',
              flexDirection: { xs: 'column', md: 'row' }
            }}>
              {/* Feature Info */}
              <Column sx={{ 
                flex: { xs: '1', md: '0 0 35%' },
                order: { xs: 2, md: 1 }
              }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 2, 
                  mb: 2 
                }}>
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 48,
                    height: 48,
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                    color: 'primary.main',
                    '& svg': { fontSize: 24 }
                  }}>
                    {currentFeature.icon}
                  </Box>
                  <Text variant="h4" weight="bold">
                    {currentFeature.title}
                  </Text>
                </Box>

                <Text sx={{ 
                  color: 'text.secondary', 
                  mb: 4, 
                  lineHeight: 1.6,
                  fontSize: '1.05rem'
                }}>
                  {currentFeature.description}
                </Text>

                {/* Highlights */}
                <Box sx={{ 
                  background: 'linear-gradient(145deg, rgba(102, 126, 234, 0.03) 0%, rgba(118, 75, 162, 0.03) 100%)',
                  borderRadius: 3,
                  p: 3,
                  border: '1px solid rgba(102, 126, 234, 0.1)'
                }}>
                  <Text variant="h6" weight="bold" sx={{ mb: 2 }}>
                    Key Features
                  </Text>
                  <Column gap={1.5}>
                    {currentFeature.highlights.map((highlight, index) => (
                      <Box 
                        key={index}
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1.5 
                        }}
                      >
                        <CheckCircle sx={{ 
                          fontSize: 20, 
                          color: '#667eea' 
                        }} />
                        <Text sx={{ fontSize: '0.95rem' }}>
                          {highlight}
                        </Text>
                      </Box>
                    ))}
                  </Column>
                </Box>
              </Column>

              {/* Screenshot Display */}
              <Box sx={{ 
                flex: 1,
                order: { xs: 1, md: 2 }
              }}>
                <Box sx={{
                  position: 'relative',
                  borderRadius: 2,
                  overflow: 'hidden',
                  background: 'linear-gradient(145deg, #f8fafc 0%, #ffffff 100%)',
                  border: '1px solid rgba(102, 126, 234, 0.1)',
                  boxShadow: '0 20px 60px rgba(102, 126, 234, 0.15)',
                  aspectRatio: '16/10',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {/* Browser Chrome */}
                  <Box sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 40,
                    background: 'linear-gradient(145deg, #f1f5f9 0%, #e2e8f0 100%)',
                    borderBottom: '1px solid rgba(0,0,0,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    px: 2,
                    gap: 1,
                    zIndex: 2
                  }}>
                    <Box sx={{ 
                      width: 12, 
                      height: 12, 
                      borderRadius: '50%', 
                      background: '#ff5f57' 
                    }} />
                    <Box sx={{ 
                      width: 12, 
                      height: 12, 
                      borderRadius: '50%', 
                      background: '#ffbd2e' 
                    }} />
                    <Box sx={{ 
                      width: 12, 
                      height: 12, 
                      borderRadius: '50%', 
                      background: '#28c840' 
                    }} />
                    <Box sx={{
                      flex: 1,
                      height: 24,
                      background: 'white',
                      borderRadius: 1,
                      ml: 2,
                      display: 'flex',
                      alignItems: 'center',
                      px: 2
                    }}>
                      <Text sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                        {currentImage.title}
                      </Text>
                    </Box>
                  </Box>

                  {/* Navigation Arrows */}
                  {currentFeature.images.length > 1 && (
                    <>
                      <IconButton
                        onClick={handlePrevImage}
                        sx={{
                          position: 'absolute',
                          left: 16,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          zIndex: 3,
                          background: 'rgba(255, 255, 255, 0.9)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(102, 126, 234, 0.2)',
                          width: 44,
                          height: 44,
                          '&:hover': {
                            background: 'rgba(255, 255, 255, 1)',
                            transform: 'translateY(-50%) scale(1.05)',
                          }
                        }}
                      >
                        <ArrowBackIos sx={{ fontSize: 18, color: '#667eea' }} />
                      </IconButton>

                      <IconButton
                        onClick={handleNextImage}
                        sx={{
                          position: 'absolute',
                          right: 16,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          zIndex: 3,
                          background: 'rgba(255, 255, 255, 0.9)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(102, 126, 234, 0.2)',
                          width: 44,
                          height: 44,
                          '&:hover': {
                            background: 'rgba(255, 255, 255, 1)',
                            transform: 'translateY(-50%) scale(1.05)',
                          }
                        }}
                      >
                        <ArrowForwardIos sx={{ fontSize: 18, color: '#667eea' }} />
                      </IconButton>
                    </>
                  )}

                  {/* Screenshot Container */}
                  <Box 
                    onClick={() => setLightboxOpen(true)}
                    sx={{
                      width: '100%',
                      height: '100%',
                      pt: 5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.03) 0%, rgba(118, 75, 162, 0.03) 100%)',
                      position: 'relative',
                      cursor: 'pointer',
                      '&:hover .zoom-icon': {
                        opacity: 1,
                        transform: 'translate(-50%, -50%) scale(1)'
                      }
                    }}
                  >
                    <Fade in={true} timeout={300} key={`${selectedFeature}-${currentImageIndex}`}>
                      <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {imageErrors[getImageKey(selectedFeature, currentImageIndex)] ? (
                          // Fallback when image doesn't exist
                          <Box sx={{ 
                            textAlign: 'center', 
                            p: 5,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <Box sx={{ 
                              fontSize: '64px', 
                              color: 'rgba(102, 126, 234, 0.3)', 
                              mb: 2 
                            }}>
                              📷
                            </Box>
                            <Text weight="600" sx={{ 
                              color: 'rgba(0,0,0,0.4)', 
                              fontSize: '1rem', 
                              mb: 1 
                            }}>
                              {currentImage.title}
                            </Text>
                            <Text sx={{ 
                              color: 'rgba(0,0,0,0.3)', 
                              fontSize: '0.875rem' 
                            }}>
                              Add screenshot to: {currentImage.path}
                            </Text>
                          </Box>
                        ) : (
                          <>
                            <Box 
                              component="img"
                              src={currentImage.path}
                              alt={currentImage.title}
                              onError={() => handleImageError(getImageKey(selectedFeature, currentImageIndex))}
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
                    </Fade>
                  </Box>

                  {/* Image Info Overlay */}
                  <Box sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: 'linear-gradient(0deg, rgba(0,0,0,0.8) 0%, transparent 100%)',
                    color: 'white',
                    p: 3,
                    pt: 6,
                    zIndex: 2
                  }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Text weight="600" sx={{ fontSize: '1.1rem', mb: 0.5 }}>
                          {currentImage.title}
                        </Text>
                        <Text sx={{ fontSize: '0.9rem', opacity: 0.9 }}>
                          {currentImage.description}
                        </Text>
                      </Box>
                      {currentFeature.images.length > 1 && (
                        <Box sx={{ 
                          display: 'flex', 
                          gap: 1, 
                          alignItems: 'center' 
                        }}>
                          {currentFeature.images.map((_, index) => (
                            <Box
                              key={index}
                              onClick={() => setCurrentImageIndex(index)}
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                background: index === currentImageIndex 
                                  ? 'white' 
                                  : 'rgba(255, 255, 255, 0.4)',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                  background: 'white',
                                  transform: 'scale(1.2)'
                                }
                              }}
                            />
                          ))}
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Row>
          </Box>
        </Fade>

        {/* Bottom Info */}
        <Box sx={{
          mt: 6,
          p: 4,
          borderRadius: 3,
          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
          border: '1px solid rgba(102, 126, 234, 0.1)',
          textAlign: 'center'
        }}>
          <Text variant="h6" weight="bold" sx={{ mb: 1 }}>
            Ready to experience it yourself?
          </Text>
          <Text sx={{ color: 'text.secondary' }}>
            Start managing your invoices professionally - get started free today with 3 invoices per month
          </Text>
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
                  {currentFeature.icon}
                </Box>
                <Text sx={{ fontSize: '0.75rem', color: 'text.primary', fontWeight: 600 }}>
                  {currentImage.title}
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
                src={currentImage.path}
                alt={currentImage.title}
                sx={{
                  width: '100%',
                  height: 'auto',
                  display: 'block'
                }}
              />
            </Box>

            {/* Navigation Arrows in Lightbox */}
            {currentFeature.images.length > 1 && (
              <>
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrevImage();
                  }}
                  sx={{
                    position: 'absolute',
                    left: 16,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(102, 126, 234, 0.2)',
                    width: 48,
                    height: 48,
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                    '&:hover': {
                      background: 'white',
                      transform: 'translateY(-50%) scale(1.1)',
                      boxShadow: '0 6px 30px rgba(102, 126, 234, 0.4)'
                    }
                  }}
                >
                  <ArrowBackIos sx={{ fontSize: 20, color: '#667eea', ml: 0.5 }} />
                </IconButton>

                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNextImage();
                  }}
                  sx={{
                    position: 'absolute',
                    right: 16,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(102, 126, 234, 0.2)',
                    width: 48,
                    height: 48,
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                    '&:hover': {
                      background: 'white',
                      transform: 'translateY(-50%) scale(1.1)',
                      boxShadow: '0 6px 30px rgba(102, 126, 234, 0.4)'
                    }
                  }}
                >
                  <ArrowForwardIos sx={{ fontSize: 20, color: '#667eea' }} />
                </IconButton>
              </>
            )}
          </Box>
        </Box>
      </Modal>
    </Section>
  );
};

export default SystemShowcaseSection;
