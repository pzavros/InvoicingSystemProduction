import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  IconButton,
  Fade,
  Zoom,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  Receipt as InvoiceIcon,
  Analytics as AnalyticsIcon,
  CurrencyExchange as CurrencyIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  CloudDownload as ExportIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  CheckCircle as CheckIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,  AutoGraph as AutoGraphIcon,
  Palette as PaletteIcon,
  DeviceHub as IntegrationIcon,
} from "@mui/icons-material";

const AboutUs = () => {
  const [statsVisible, setStatsVisible] = useState(false);

  // Animation state
  useEffect(() => {
    const timer = setTimeout(() => setStatsVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);
  // Core system features based on actual implementation
  const coreFeatures = [
    {
      title: "Invoice Management",
      icon: <InvoiceIcon />,
      color: "#667eea",
      description: "Complete invoice lifecycle management",
      features: [
        "Create and edit invoices with detailed forms",
        "Track invoice status: Draft → Unpaid → Paid",
        "PDF generation and download functionality", 
        "Company branding with logo integration"
      ]
    },
    {
      title: "Financial Analytics",
      icon: <AnalyticsIcon />,
      color: "#f093fb", 
      description: "Real-time business insights and reporting",
      features: [
        "Dashboard with monthly and yearly statistics",
        "Revenue tracking with visual charts",
        "Invoice count analytics by time periods",
        "Excel report generation with custom filters"
      ]
    },
    {
      title: "Multi-Currency Support", 
      icon: <CurrencyIcon />,
      color: "#4facfe",
      description: "International business compatibility",
      features: [
        "Support for EUR, USD, and GBP currencies",
        "Automatic currency symbol formatting",
        "Currency-specific calculations", 
        "Multi-currency reporting capabilities"
      ]
    },
    {
      title: "System Configuration",
      icon: <SecurityIcon />,
      color: "#43e97b",
      description: "Flexible business setup options", 
      features: [
        "Company profile with banking details",
        "Tax rate and discount configurations",
        "Invoice numbering system setup",
        "Custom branding and styling options"
      ]
    }
  ];

  // Statistics data
  const stats = [
    { label: "Total Features", value: "25+", icon: <StarIcon /> },
    { label: "Currencies Supported", value: "3", icon: <CurrencyIcon /> },
    { label: "Report Types", value: "10+", icon: <AutoGraphIcon /> },
    { label: "User Actions", value: "50+", icon: <SpeedIcon /> }
  ];
  return (
    <Box sx={{ 
      minHeight: '100vh',
      position: 'relative'
    }}>
      <Container maxWidth="xl" sx={{ 
        py: 6, 
        position: 'relative', 
        zIndex: 2,
        maxWidth: '1400px !important'
      }}>        {/* Hero Section */}
        <Fade in timeout={1000}>
          <Card
            sx={{
              textAlign: 'center',
              mb: 8,
              py: 8,
              px: 4,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderRadius: 4,
              boxShadow: '0 20px 40px rgba(102, 126, 234, 0.3)',
            }}
          >
            <Typography
              variant="h2"
              component="h1"
              sx={{
                fontWeight: 800,
                mb: 3,
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                lineHeight: 1.2
              }}
            >
              Professional Invoicing System
            </Typography>            <Typography
              variant="h5"
              sx={{
                maxWidth: '800px',
                mx: 'auto',
                mb: 6,
                fontWeight: 400,
                lineHeight: 1.6,
                opacity: 0.95
              }}
            >
              A comprehensive financial management platform featuring advanced analytics, 
              multi-currency support, and intelligent automation designed to streamline 
              your business invoicing workflow with professional precision
            </Typography>
            
            {/* Statistics */}
            <Grid container spacing={3} sx={{ justifyContent: 'center' }}>
              {stats.map((stat, index) => (
                <Grid item xs={6} md={3} key={index}>
                  <Zoom in={statsVisible} timeout={500 + index * 200}>
                    <Card sx={{
                      background: 'rgba(255, 255, 255, 0.15)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: 3,
                      textAlign: 'center',
                      p: 3,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        background: 'rgba(255, 255, 255, 0.25)',
                      }
                    }}>
                      <Box sx={{ color: 'white', mb: 2, fontSize: '2rem' }}>
                        {stat.icon}
                      </Box>
                      <Typography variant="h3" sx={{ fontWeight: 700, color: 'white', mb: 1 }}>
                        {stat.value}
                      </Typography>
                      <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                        {stat.label}
                      </Typography>
                    </Card>
                  </Zoom>
                </Grid>
              ))}
            </Grid>
          </Card>
        </Fade>        {/* Feature Categories Section */}
        <Box sx={{ mb: 10 }}>
          <Typography
            variant="h3"
            sx={{
              textAlign: 'center',
              fontWeight: 700,
              mb: 2,
              color: '#2c3e50'
            }}
          >
            Key Features
          </Typography>
          <Typography
            variant="h6"
            sx={{
              textAlign: 'center',
              mb: 6,
              color: 'rgba(44, 62, 80, 0.7)',
              maxWidth: '600px',
              mx: 'auto'
            }}
          >
            Everything you need for professional invoice management
          </Typography>          <Box sx={{ 
            width: '100%', 
            maxWidth: '1200px', 
            mx: 'auto',
            px: { xs: 2, sm: 3, md: 4 } // Responsive padding
          }}>
            <Grid container spacing={{ xs: 3, sm: 4 }} sx={{ 
              justifyContent: 'center',
              alignItems: 'stretch'
            }}>
              {coreFeatures.map((feature, index) => (
                <Grid 
                  item 
                  xs={12} 
                  sm={12} 
                  md={6} 
                  lg={6} 
                  xl={6}
                  key={index}
                  sx={{
                    display: 'flex',
                    minHeight: '450px' // Minimum height instead of fixed
                  }}
                >
                  <Card sx={{
                    width: '100%',
                    minHeight: '450px', // Consistent minimum height
                    background: 'white',
                    borderRadius: 3,
                    border: `2px solid ${feature.color}20`,
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: `0 10px 30px ${feature.color}30`,
                      borderColor: `${feature.color}40`
                    }
                  }}>
                    <CardContent sx={{ 
                      p: { xs: 2.5, sm: 3 }, 
                      display: 'flex', 
                      flexDirection: 'column', 
                      height: '100%',
                      flex: 1
                    }}>
                      {/* Header Section - Fixed Height */}
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'flex-start', 
                        mb: 2.5,
                        minHeight: '80px' // Fixed header height
                      }}>
                        <Box sx={{
                          width: { xs: 44, sm: 48 },
                          height: { xs: 44, sm: 48 },
                          background: feature.color,
                          borderRadius: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          mr: 2,
                          flexShrink: 0,
                          boxShadow: `0 6px 12px ${feature.color}40`
                        }}>
                          {feature.icon}
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 700,
                              color: '#2c3e50',
                              mb: 0.5,
                              fontSize: { xs: '1rem', sm: '1.1rem' },
                              lineHeight: 1.3,
                              wordBreak: 'break-word'
                            }}
                          >
                            {feature.title}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color: 'rgba(44, 62, 80, 0.6)',
                              fontWeight: 500,
                              fontSize: { xs: '0.8rem', sm: '0.875rem' },
                              lineHeight: 1.4
                            }}
                          >
                            {feature.description}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Features List Section - Flexible Height */}
                      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <List dense sx={{ p: 0, flex: 1 }}>
                          {feature.features.map((featureItem, featureIndex) => (
                            <ListItem key={featureIndex} sx={{ 
                              px: 0, 
                              py: { xs: 0.4, sm: 0.5 },
                              alignItems: 'flex-start'
                            }}>
                              <ListItemIcon sx={{ 
                                minWidth: { xs: 24, sm: 28 },
                                mt: 0.2
                              }}>
                                <CheckIcon sx={{ 
                                  fontSize: { xs: 14, sm: 16 }, 
                                  color: feature.color, 
                                  fontWeight: 'bold' 
                                }} />
                              </ListItemIcon>
                              <ListItemText
                                primary={featureItem}
                                primaryTypographyProps={{
                                  variant: 'body2',
                                  sx: { 
                                    color: 'rgba(44, 62, 80, 0.8)',
                                    lineHeight: 1.4,
                                    fontWeight: 500,
                                    fontSize: { xs: '0.8rem', sm: '0.875rem' },
                                    wordBreak: 'break-word'
                                  }
                                }}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Box>        {/* Technical Specifications */}
        <Box sx={{ mb: 10 }}>
          <Typography
            variant="h3"
            sx={{
              textAlign: 'center',
              fontWeight: 700,
              mb: 2,
              color: '#2c3e50'
            }}
          >
            Technical Specifications
          </Typography>
          <Typography
            variant="h6"
            sx={{
              textAlign: 'center',
              mb: 6,
              color: 'rgba(44, 62, 80, 0.7)',
              maxWidth: '600px',
              mx: 'auto'
            }}
          >
            Built with modern technologies for optimal performance
          </Typography>

          <Box sx={{ 
            width: '100%', 
            maxWidth: '900px', 
            mx: 'auto',
            px: { xs: 2, sm: 3, md: 4 }
          }}>
            <Grid container spacing={4} sx={{ justifyContent: 'center' }}>
            <Grid item xs={12} md={4}>
              <Card sx={{
                height: '100%',
                background: 'white',
                borderRadius: 3,
                border: '2px solid #667eea20',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 10px 30px #667eea30',
                  borderColor: '#667eea40'
                }
              }}>
                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                  <Box sx={{
                    width: 56,
                    height: 56,
                    background: '#667eea',
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    mx: 'auto',
                    mb: 2
                  }}>
                    <SecurityIcon sx={{ fontSize: 28 }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#2c3e50' }}>
                    Security & Privacy
                  </Typography>
                  <List dense sx={{ p: 0 }}>
                    <ListItem sx={{ px: 0, py: 0.5, justifyContent: 'center' }}>
                      <ListItemText
                        primary="Encrypted data storage"
                        primaryTypographyProps={{
                          variant: 'body2',
                          sx: { color: 'rgba(44, 62, 80, 0.8)', textAlign: 'center' }
                        }}
                      />
                    </ListItem>
                    <ListItem sx={{ px: 0, py: 0.5, justifyContent: 'center' }}>
                      <ListItemText
                        primary="Secure banking information"
                        primaryTypographyProps={{
                          variant: 'body2',
                          sx: { color: 'rgba(44, 62, 80, 0.8)', textAlign: 'center' }
                        }}
                      />
                    </ListItem>
                    <ListItem sx={{ px: 0, py: 0.5, justifyContent: 'center' }}>
                      <ListItemText
                        primary="GDPR compliance ready"
                        primaryTypographyProps={{
                          variant: 'body2',
                          sx: { color: 'rgba(44, 62, 80, 0.8)', textAlign: 'center' }
                        }}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{
                height: '100%',
                background: 'white',
                borderRadius: 3,
                border: '2px solid #4facfe20',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 10px 30px #4facfe30',
                  borderColor: '#4facfe40'
                }
              }}>
                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                  <Box sx={{
                    width: 56,
                    height: 56,
                    background: '#4facfe',
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    mx: 'auto',
                    mb: 2
                  }}>
                    <SpeedIcon sx={{ fontSize: 28 }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#2c3e50' }}>
                    Performance
                  </Typography>
                  <List dense sx={{ p: 0 }}>
                    <ListItem sx={{ px: 0, py: 0.5, justifyContent: 'center' }}>
                      <ListItemText
                        primary="Lightning-fast load times"
                        primaryTypographyProps={{
                          variant: 'body2',
                          sx: { color: 'rgba(44, 62, 80, 0.8)', textAlign: 'center' }
                        }}
                      />
                    </ListItem>
                    <ListItem sx={{ px: 0, py: 0.5, justifyContent: 'center' }}>
                      <ListItemText
                        primary="Optimized database queries"
                        primaryTypographyProps={{
                          variant: 'body2',
                          sx: { color: 'rgba(44, 62, 80, 0.8)', textAlign: 'center' }
                        }}
                      />
                    </ListItem>
                    <ListItem sx={{ px: 0, py: 0.5, justifyContent: 'center' }}>
                      <ListItemText
                        primary="Real-time data updates"
                        primaryTypographyProps={{
                          variant: 'body2',
                          sx: { color: 'rgba(44, 62, 80, 0.8)', textAlign: 'center' }
                        }}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{
                height: '100%',
                background: 'white',
                borderRadius: 3,
                border: '2px solid #fa709a20',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 10px 30px #fa709a30',
                  borderColor: '#fa709a40'
                }
              }}>
                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                  <Box sx={{
                    width: 56,
                    height: 56,
                    background: '#fa709a',
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    mx: 'auto',
                    mb: 2
                  }}>
                    <IntegrationIcon sx={{ fontSize: 28 }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#2c3e50' }}>
                    Integration
                  </Typography>
                  <List dense sx={{ p: 0 }}>
                    <ListItem sx={{ px: 0, py: 0.5, justifyContent: 'center' }}>
                      <ListItemText
                        primary="Excel export compatibility"
                        primaryTypographyProps={{
                          variant: 'body2',
                          sx: { color: 'rgba(44, 62, 80, 0.8)', textAlign: 'center' }
                        }}
                      />
                    </ListItem>
                    <ListItem sx={{ px: 0, py: 0.5, justifyContent: 'center' }}>
                      <ListItemText
                        primary="Email service integration"
                        primaryTypographyProps={{
                          variant: 'body2',
                          sx: { color: 'rgba(44, 62, 80, 0.8)', textAlign: 'center' }
                        }}
                      />
                    </ListItem>
                    <ListItem sx={{ px: 0, py: 0.5, justifyContent: 'center' }}>
                      <ListItemText
                        primary="PDF generation engine"
                        primaryTypographyProps={{
                          variant: 'body2',
                          sx: { color: 'rgba(44, 62, 80, 0.8)', textAlign: 'center' }
                        }}
                      />
                    </ListItem>
                  </List>
                </CardContent>              </Card>
            </Grid>
          </Grid>
          </Box>
        </Box>        {/* Contact Section */}
        <Box sx={{ mb: 10 }}>
          <Typography
            variant="h3"
            sx={{
              textAlign: 'center',
              fontWeight: 700,
              mb: 2,
              color: '#2c3e50'
            }}
          >
            Get In Touch
          </Typography>
          <Typography
            variant="h6"
            sx={{
              textAlign: 'center',
              mb: 6,
              color: 'rgba(44, 62, 80, 0.7)',
              maxWidth: '600px',
              mx: 'auto'
            }}
          >
            Ready to transform your invoicing workflow? Let's connect!
          </Typography>

          <Box sx={{ 
            width: '100%', 
            maxWidth: '900px', 
            mx: 'auto',
            px: { xs: 2, sm: 3, md: 4 }
          }}>
            <Grid container spacing={4} sx={{ justifyContent: 'center' }}>
            <Grid item xs={12} md={4}>
              <Card sx={{
                height: '100%',
                background: 'white',
                borderRadius: 3,
                border: '2px solid #667eea20',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 10px 30px #667eea30',
                  borderColor: '#667eea40'
                }
              }}>
                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                  <Box sx={{
                    width: 56,
                    height: 56,
                    background: '#667eea',
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    mx: 'auto',
                    mb: 2
                  }}>
                    <EmailIcon sx={{ fontSize: 28 }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#2c3e50' }}>
                    Email Support
                  </Typography>
                  <Button
                    href="mailto:panazavros8@gmail.com"
                    sx={{
                      color: '#667eea',
                      fontWeight: 600,
                      textTransform: 'none',
                      fontSize: '0.9rem',
                      '&:hover': {
                        backgroundColor: 'transparent',
                        textDecoration: 'underline'
                      }
                    }}
                  >
                    panazavros8@gmail.com
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{
                height: '100%',
                background: 'white',
                borderRadius: 3,
                border: '2px solid #43e97b20',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 10px 30px #43e97b30',
                  borderColor: '#43e97b40'
                }
              }}>
                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                  <Box sx={{
                    width: 56,
                    height: 56,
                    background: '#43e97b',
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    mx: 'auto',
                    mb: 2
                  }}>
                    <PhoneIcon sx={{ fontSize: 28 }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#2c3e50' }}>
                    Phone Support
                  </Typography>
                  <Button
                    href="tel:+35797667089"
                    sx={{
                      color: '#43e97b',
                      fontWeight: 600,
                      textTransform: 'none',
                      fontSize: '0.9rem',
                      '&:hover': {
                        backgroundColor: 'transparent',
                        textDecoration: 'underline'
                      }
                    }}
                  >
                    +357 97667089
                  </Button>
                </CardContent>
              </Card>            </Grid>          </Grid>
          </Box>        </Box>
      </Container>

      {/* Floating Action Button */}
      <Box sx={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 1000
      }}>
        <Zoom in timeout={2000}>
          <IconButton
            sx={{
              width: 60,
              height: 60,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8 0%, #694a98 100%)',
                transform: 'scale(1.1)'
              },
              transition: 'all 0.3s ease',
              boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)'
            }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <TrendingUpIcon />
          </IconButton>
        </Zoom>
      </Box>    </Box>
  );
};

export default AboutUs;