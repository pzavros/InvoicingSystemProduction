import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Box,
  IconButton,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
  Chip,
  Fab,
  Zoom
} from '@mui/material';
import {
  MenuRounded,
  CloseRounded,
  DashboardRounded,
  ReceiptLongRounded,
  PeopleRounded,
  InventoryRounded,
  AnalyticsRounded,
  SettingsRounded,
  AccountCircleRounded,
  LaunchRounded,
  AutoAwesome,
  RocketLaunchRounded
} from '@mui/icons-material';
import Text from './Text.jsx';
import Button from './Button.jsx';

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

  // Get active section from current path
  const getActiveSection = () => {
    const path = location.pathname;
    if (path === '/') return 'home';
    if (path === '/about') return 'about';
    if (path === '/features') return 'features';
    if (path === '/how-it-works') return 'how-it-works';
    if (path === '/contact') return 'contact';
    return 'home';
  };

  const activeSection = getActiveSection();

  const navigationItems = [
    { id: 'home', path: '/', label: 'Home', icon: <DashboardRounded /> },
    { id: 'about', path: '/about', label: 'About Us', icon: <PeopleRounded /> },
    { id: 'features', path: '/features', label: 'Features', icon: <AutoAwesome /> },
    { id: 'how-it-works', path: '/how-it-works', label: 'How It Works', icon: <AnalyticsRounded /> },
    { id: 'contact', path: '/contact', label: 'Contact', icon: <ReceiptLongRounded /> },
  ];

  // Secondary navigation items - Commented out for now
  // const secondaryItems = [
  //   { id: 'pricing', path: '/pricing', label: 'Pricing', icon: <LaunchRounded /> },
  //   { id: 'support', path: '/support', label: 'Support', icon: <SettingsRounded /> },
  // ];

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const FloatingNavItem = ({ item, index }) => (
    <Box
      onClick={() => navigate(item.path)}
      sx={{
        position: 'relative',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        px: 3,
        py: 1.5,
        borderRadius: '25px',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        background: activeSection === item.id 
          ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)'
          : 'transparent',
        backdropFilter: activeSection === item.id ? 'blur(20px)' : 'none',
        border: activeSection === item.id 
          ? '1px solid rgba(102, 126, 234, 0.3)' 
          : '1px solid transparent',
        transform: activeSection === item.id ? 'translateY(-2px) scale(1.05)' : 'translateY(0) scale(1)',
        boxShadow: activeSection === item.id 
          ? '0 8px 32px rgba(102, 126, 234, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1) inset'
          : 'none',
        '&:hover': {
          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)',
          backdropFilter: 'blur(20px)',
          transform: 'translateY(-2px) scale(1.02)',
          border: '1px solid rgba(102, 126, 234, 0.2)',
          '& .nav-icon': {
            transform: 'rotate(360deg) scale(1.1)',
            color: '#667eea'
          },
          '& .nav-text': {
            color: '#667eea'
          }
        }
      }}
    >
      {/* Floating orb effect */}
      <Box
        className="nav-icon"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: activeSection === item.id
            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            : 'rgba(255, 255, 255, 0.1)',
          color: activeSection === item.id ? 'white' : 'text.primary',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: activeSection === item.id 
            ? '0 4px 20px rgba(102, 126, 234, 0.4)'
            : 'none',
          '& svg': { fontSize: 18 }
        }}
      >
        {item.icon}
      </Box>
      
      <Text 
        className="nav-text"
        sx={{ 
          fontWeight: activeSection === item.id ? 600 : 500,
          fontSize: '0.95rem',
          color: activeSection === item.id ? 'primary.main' : 'text.primary',
          transition: 'all 0.3s ease'
        }}
      >
        {item.label}
      </Text>

      {item.badge && (
        <Chip 
          label={item.badge}
          size="small"
          sx={{
            height: 20,
            fontSize: '0.7rem',
            background: 'linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%)',
            color: 'white',
            fontWeight: 600,
            animation: 'pulse 2s infinite',
            '@keyframes pulse': {
              '0%': { transform: 'scale(1)' },
              '50%': { transform: 'scale(1.05)' },
              '100%': { transform: 'scale(1)' }
            }
          }}
        />
      )}
    </Box>
  );

  const MobileNavItem = ({ item }) => (
    <Box
      onClick={() => {
        navigate(item.path);
        setMobileOpen(false);
      }}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        p: 2,
        mx: 2,
        my: 1,
        borderRadius: 3,
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        background: activeSection === item.id 
          ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)'
          : 'transparent',
        '&:hover': {
          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
          transform: 'translateX(8px)'
        }
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: activeSection === item.id
            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            : 'rgba(102, 126, 234, 0.1)',
          color: activeSection === item.id ? 'white' : 'primary.main',
          '& svg': { fontSize: 20 }
        }}
      >
        {item.icon}
      </Box>
      <Text sx={{ fontWeight: activeSection === item.id ? 600 : 500 }}>
        {item.label}
      </Text>
      {item.badge && (
        <Chip 
          label={item.badge}
          size="small"
          sx={{
            height: 18,
            fontSize: '0.7rem',
            background: 'linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%)',
            color: 'white',
            fontWeight: 600,
            ml: 'auto'
          }}
        />
      )}
    </Box>
  );

  return (
    <>
      {/* Main Navbar */}
      <AppBar 
        position="fixed" 
        elevation={0}
        sx={{
          background: scrolled 
            ? 'rgba(255, 255, 255, 0.5)' 
            : 'rgba(255, 255, 255, 0.65)',
          backdropFilter: 'blur(40px) saturate(200%) brightness(1.05)',
          WebkitBackdropFilter: 'blur(40px) saturate(200%) brightness(1.05)',
          borderBottom: scrolled 
            ? '1px solid rgba(102, 126, 234, 0.2)' 
            : '1px solid rgba(255, 255, 255, 0.3)',
          borderTop: '1px solid rgba(255, 255, 255, 0.8)',
          boxShadow: scrolled 
            ? '0 8px 32px rgba(102, 126, 234, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.8)' 
            : '0 4px 16px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
          transition: 'all 0.3s ease',
          zIndex: 1000,
        }}
      >
        <Toolbar 
          sx={{ 
            px: { xs: 2, md: 4 }, 
            py: 1,
            justifyContent: 'space-between',
            minHeight: { xs: 70, md: 80 }
          }}
        >
          {/* Logo with SVG Image */}
          <Box 
            onClick={() => navigate('/')}
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'scale(1.02)'
              }
            }}
          >
            <Box
              sx={{
                width: { xs: 45, md: 50 },
                height: { xs: 45, md: 50 },
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%)',
                backdropFilter: 'blur(10px)',
                border: '1.5px solid rgba(102, 126, 234, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 4px 16px rgba(102, 126, 234, 0.1)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 6px 24px rgba(102, 126, 234, 0.2)',
                  border: '1.5px solid rgba(102, 126, 234, 0.3)',
                  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.12) 0%, rgba(118, 75, 162, 0.12) 100%)',
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
                  animation: 'logoShine 4s infinite',
                },
                '@keyframes logoShine': {
                  '0%': { left: '-100%' },
                  '100%': { left: '100%' }
                }
              }}
            >
              <Box
                component="img"
                src="/media/logo.svg"
                alt="E-Nvoicing Logo"
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '10px',
                  filter: 'drop-shadow(0 2px 4px rgba(102, 126, 234, 0.15))'
                }}
              />
            </Box>
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Text variant="h6" weight="bold" sx={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundClip: 'text',
                textFillColor: 'transparent',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: { xs: '1.1rem', md: '1.25rem' },
                letterSpacing: '-0.02em'
              }}>
                E-Nvoicing
              </Text>
            </Box>
          </Box>

          {/* Desktop Navigation */}
          {!isMobile && (
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 0.5,
                background: 'rgba(255, 255, 255, 0.25)',
                backdropFilter: 'blur(35px) saturate(200%) brightness(1.1)',
                WebkitBackdropFilter: 'blur(35px) saturate(200%) brightness(1.1)',
                borderRadius: '50px',
                p: 0.5,
                border: '1px solid rgba(255, 255, 255, 0.4)',
                boxShadow: '0 8px 32px rgba(102, 126, 234, 0.2), inset 0 1px 2px rgba(255, 255, 255, 0.8), inset 0 -1px 2px rgba(102, 126, 234, 0.1)',
              }}
            >
              {navigationItems.slice(0, 5).map((item, index) => (
                <FloatingNavItem 
                  key={item.id} 
                  item={item} 
                  index={index}
                />
              ))}
              
              {/* Settings Menu - Commented out for now */}
              {/* <Button
                variant="ghost"
                sx={{ 
                  minWidth: 'auto',
                  px: 2,
                  py: 1.5,
                  borderRadius: '25px',
                  '&:hover': {
                    background: 'rgba(102, 126, 234, 0.1)'
                  }
                }}
              >
                <SettingsRounded sx={{ fontSize: 18 }} />
              </Button> */}
            </Box>
          )}

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {!isMobile && (
              <Button 
                variant="primary" 
                size="small"
                startIcon={<LaunchRounded />}
                onClick={() => {
                  navigate('/coming-soon');
                }}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
                  '&:hover': {
                    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
                    transform: 'translateY(-1px)'
                  }
                }}
              >
                Launch System
              </Button>
            )}
            
            {/* Mobile Menu Button */}
            {isMobile && (
              <IconButton
                onClick={handleDrawerToggle}
                sx={{
                  width: 48,
                  height: 48,
                  background: mobileOpen 
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    : 'rgba(102, 126, 234, 0.1)',
                  color: mobileOpen ? 'white' : 'primary.main',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    transform: 'scale(1.05)'
                  }
                }}
              >
                {mobileOpen ? <CloseRounded /> : <MenuRounded />}
              </IconButton>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && isMobile && (
        <Box
          sx={{
            position: 'fixed',
            top: 80,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(40px) saturate(200%) brightness(1.05)',
            WebkitBackdropFilter: 'blur(40px) saturate(200%) brightness(1.05)',
            borderTop: '1px solid rgba(255, 255, 255, 0.6)',
            boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.8), 0 -8px 32px rgba(102, 126, 234, 0.1)',
            zIndex: 999,
            overflow: 'auto',
            pt: 2,
            pb: 4,
            animation: 'slideDown 0.3s ease-out',
            '@keyframes slideDown': {
              '0%': {
                opacity: 0,
                transform: 'translateY(-20px)'
              },
              '100%': {
                opacity: 1,
                transform: 'translateY(0)'
              }
            }
          }}
        >
          {/* Main Navigation */}
          <Box sx={{ mb: 4 }}>
            <Text variant="h6" sx={{ px: 3, mb: 2, color: 'text.secondary', fontSize: '0.9rem' }}>
              MAIN NAVIGATION
            </Text>
            {navigationItems.map((item) => (
              <MobileNavItem 
                key={item.id} 
                item={item}
              />
            ))}
          </Box>

          {/* Secondary Items - Commented out for now */}
          {/* <Box sx={{ mb: 4 }}>
            <Text variant="h6" sx={{ px: 3, mb: 2, color: 'text.secondary', fontSize: '0.9rem' }}>
              MORE
            </Text>
            {secondaryItems.map((item) => (
              <MobileNavItem 
                key={item.id} 
                item={item}
              />
            ))}
          </Box> */}

          {/* Action Buttons */}
          <Box sx={{ px: 3, pt: 2, borderTop: '1px solid rgba(0,0,0,0.1)' }}>
            <Button 
              variant="primary" 
              fullWidth
              startIcon={<RocketLaunchRounded />}
              onClick={() => {
                navigate('/coming-soon');
                setMobileOpen(false);
              }}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)'
              }}
            >
              Launch System
            </Button>
          </Box>
        </Box>
      )}

      {/* Floating Action Button for Quick Actions */}
      <Zoom in={scrolled && !isMobile}>
        <Fab
          onClick={() => navigate('/coming-soon')}
          sx={{
            position: 'fixed',
            bottom: 32,
            right: 32,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            width: 64,
            height: 64,
            boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5a6fd8 0%, #6b46c1 100%)',
              transform: 'scale(1.1)',
              boxShadow: '0 12px 40px rgba(102, 126, 234, 0.4)'
            }
          }}
        >
          <LaunchRounded />
        </Fab>
      </Zoom>
    </>
  );
};

export default Navbar;
