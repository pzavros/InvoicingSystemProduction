import { useContext, useState, useEffect } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Typography,
  Divider,
  Tooltip,
  Avatar,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
  AppBar,
  Toolbar
} from '@mui/material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import InfoIcon from '@mui/icons-material/Info';
import ReceiptIcon from '@mui/icons-material/Receipt';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import CloseIcon from '@mui/icons-material/Close';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SettingsIcon from '@mui/icons-material/Settings';
import InventoryIcon from '@mui/icons-material/Inventory';
import BusinessIcon from '@mui/icons-material/Business';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import DescriptionIcon from '@mui/icons-material/Description';
import GroupIcon from '@mui/icons-material/Group';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import SchoolIcon from '@mui/icons-material/School';
import SupportIcon from '@mui/icons-material/Support';
import { SidebarContext } from './SidebarContext';
import { useAuth } from '../../utils/AuthContext';

export default function NavBar() {
  const { sidebarOpen, setSidebarOpen } = useContext(SidebarContext);
  const { user: currentUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [hoveredItem, setHoveredItem] = useState(null);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const handleDrawerToggle = () => {
    if (isMobile) {
      setMobileDrawerOpen(!mobileDrawerOpen);
    } else {
      setSidebarOpen(!sidebarOpen);
    }
  };

  const handleMobileItemClick = () => {
    if (isMobile) {
      setMobileDrawerOpen(false);
    }
  };

  const handleUserMenuClick = (event) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleLogout = () => {
    logout();
    handleUserMenuClose();
  };

  const handleProfile = () => {
    navigate('/profile');
    handleUserMenuClose();
  };

  const drawerWidth = sidebarOpen ? 260 : 70;
  const effectiveDrawerOpen = isMobile ? true : sidebarOpen; // Always show full width on mobile drawer
  
  const navItems = [
    { 
      text: 'Home', 
      icon: <HomeIcon />, 
      path: '/', 
      description: 'Invoice management',
      color: '#3b82f6' // Blue
    },
    { 
      text: 'Dashboard', 
      icon: <DashboardIcon />, 
      path: '/dashboard', 
      description: 'Analytics & insights',
      color: '#8b5cf6' // Purple
    },
    { 
      text: 'Create Invoice', 
      icon: <AddCircleOutlineIcon />, 
      path: '/invoices/create', 
      description: 'New invoice',
      color: '#10b981' // Emerald Green
    },
    { 
      text: 'Products', 
      icon: <InventoryIcon />, 
      path: '/products', 
      description: 'Manage catalog',
      color: '#f59e0b' // Amber
    },
    { 
      text: 'Templates', 
      icon: <DescriptionIcon />, 
      path: '/templates', 
      description: 'Invoice templates',
      color: '#14b8a6' // Teal
    },
    { 
      text: 'Clients', 
      icon: <GroupIcon />, 
      path: '/clients', 
      description: 'Manage clients',
      color: '#06b6d4' // Cyan
    },
    { 
      text: 'Reports', 
      icon: <ReceiptIcon />, 
      path: '/report', 
      description: 'Generate reports',
      color: '#ef4444' // Red
    },
    { 
      text: 'Settings', 
      icon: <SettingsIcon />, 
      path: '/settings', 
      description: 'System configuration',
      color: '#6366f1' // Indigo
    },
    { 
      text: 'Subscription', 
      icon: <CreditCardIcon />, 
      path: '/subscription', 
      description: 'Manage subscription',
      color: '#8b5cf6' // Purple
    },
    { 
      text: 'Getting Started', 
      icon: <SchoolIcon />, 
      path: '/getting-started', 
      description: 'Step-by-step guide',
      color: '#ec4899' // Pink
    },
    { 
      text: 'About', 
      icon: <InfoIcon />, 
      path: '/about', 
      description: 'System information',
      color: '#a855f7' // Violet
    },
  ];

  // Admin-only navigation items
  const adminItems = [
    { 
      text: 'User Management', 
      icon: <SupervisorAccountIcon />, 
      path: '/admin/users', 
      description: 'Manage system users',
      color: '#dc2626'
    },
    { 
      text: 'Support Tickets', 
      icon: <SupportIcon />, 
      path: '/admin/support', 
      description: 'Manage user support tickets',
      color: '#8b5cf6'
    },
    { 
      text: 'System Admin', 
      icon: <AdminPanelSettingsIcon />, 
      path: '/admin/system', 
      description: 'Advanced system settings',
      color: '#ea580c'
    },
  ];
  
  // Drawer content component (reused for both mobile and desktop)
  const drawerContent = (
    <>
      {/* Classic Header Section with Glassmorphism */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        padding: effectiveDrawerOpen ? '20px' : '20px 12px',
        justifyContent: effectiveDrawerOpen ? 'space-between' : 'center',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        minHeight: 72,
      }}>
        {effectiveDrawerOpen && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {/* Minimal Logo */}
            <Box
              sx={{
                width: 44,
                height: 44,
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
                src={`${import.meta.env.BASE_URL}media/logo.svg`}
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
            <Box>
              <Typography 
                variant="h6" 
                noWrap 
                component="div" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.95)',
                  fontWeight: 600,
                  fontSize: '1.05rem',
                  letterSpacing: '-0.01em',
                  lineHeight: 1.2
                }}
              >
                E-Nvoicing
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.4)',
                  fontSize: '0.65rem',
                  fontWeight: 500,
                  letterSpacing: '0.5px'
                }}
              >
                BETA
              </Typography>
            </Box>
          </Box>
        )}
        <Tooltip title={effectiveDrawerOpen ? (isMobile ? "Close menu" : "Collapse") : "Expand"} placement="right">
          <IconButton 
            onClick={handleDrawerToggle} 
            size="small"
            sx={{ 
              color: 'rgba(255, 255, 255, 0.7)',
              transition: 'all 0.2s ease',
              '&:hover': {
                color: 'rgba(255, 255, 255, 0.95)',
                background: 'rgba(255, 255, 255, 0.08)',
              }
            }}
          >
            {isMobile ? <CloseIcon fontSize="small" /> : (sidebarOpen ? <ChevronLeftIcon fontSize="small" /> : <MenuIcon fontSize="small" />)}
          </IconButton>
        </Tooltip>
      </Box>

      {/* Professional Navigation List */}
      <List sx={{ pt: 3, px: 2, pb: 2 }}>
        {navItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          const isHovered = hoveredItem === item.text;
          
          return (
            <Box sx={{ mb: 0.5 }} key={item.text}>
              <Tooltip 
                title={!effectiveDrawerOpen ? item.text : ""} 
                placement="right"
                arrow
              >
                <ListItem
                  component={Link}
                  to={item.path}
                  onClick={handleMobileItemClick}
                  onMouseEnter={() => setHoveredItem(item.text)}
                  onMouseLeave={() => setHoveredItem(null)}
                  sx={{
                    minHeight: 44,
                    justifyContent: effectiveDrawerOpen ? 'initial' : 'center',
                    px: effectiveDrawerOpen ? 1.5 : 1.25,
                    borderRadius: '11px',
                    cursor: 'pointer',
                    textDecoration: 'none',
                    position: 'relative',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    background: isActive 
                      ? 'rgba(255, 255, 255, 0.15)'
                      : isHovered 
                        ? 'rgba(255, 255, 255, 0.08)'
                        : 'transparent',
                    backdropFilter: isActive ? 'blur(12px) saturate(180%)' : 'none',
                    WebkitBackdropFilter: isActive ? 'blur(12px) saturate(180%)' : 'none',
                    boxShadow: isActive 
                      ? '0 4px 16px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                      : 'none',
                    '&:hover': {
                      background: isActive 
                        ? 'rgba(255, 255, 255, 0.2)'
                        : 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(12px) saturate(180%)',
                      WebkitBackdropFilter: 'blur(12px) saturate(180%)',
                      transform: 'translateY(-1px)',
                      boxShadow: isActive 
                        ? '0 6px 20px rgba(0, 0, 0, 0.12), 0 2px 4px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.12)'
                        : 'none',
                    }
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: effectiveDrawerOpen ? 1.5 : 'auto',
                      justifyContent: 'center',
                      color: isActive 
                        ? item.color
                        : 'rgba(255, 255, 255, 0.6)',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      fontSize: '1.25rem',
                      '& .MuiSvgIcon-root': {
                        fontSize: '1.25rem'
                      }
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  {effectiveDrawerOpen && (
                    <ListItemText
                      primary={item.text}
                      primaryTypographyProps={{
                        sx: { 
                          color: isActive 
                            ? 'rgba(255, 255, 255, 1)' 
                            : 'rgba(255, 255, 255, 0.7)', 
                          fontWeight: isActive ? 600 : 500,
                          fontSize: '0.875rem',
                          letterSpacing: '-0.01em',
                          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        }
                      }}
                    />
                  )}
                </ListItem>
              </Tooltip>
            </Box>
          );
        })}
      </List>

      {/* Admin Section */}
      {currentUser?.isAdmin && (
        <>
          <Box sx={{ px: 2, py: 2 }}>
            <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.08)' }} />
            {effectiveDrawerOpen && (
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.4)', 
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  mt: 2.5,
                  mb: 1.5,
                  display: 'block',
                  textTransform: 'uppercase'
                }}
              >
                Admin
              </Typography>
            )}
          </Box>
          
          <List sx={{ pt: 0, px: 2, pb: 2 }}>
            {adminItems.map((item, index) => {
              const isActive = location.pathname === item.path;
              const isHovered = hoveredItem === item.text;
              
              return (
                <Box sx={{ mb: 0.5 }} key={item.text}>
                  <Tooltip 
                    title={!effectiveDrawerOpen ? item.text : ""} 
                    placement="right"
                    arrow
                  >
                    <ListItem
                      component={Link}
                      to={item.path}
                      onClick={handleMobileItemClick}
                      onMouseEnter={() => setHoveredItem(item.text)}
                      onMouseLeave={() => setHoveredItem(null)}
                      sx={{
                        minHeight: 44,
                        justifyContent: effectiveDrawerOpen ? 'initial' : 'center',
                        px: effectiveDrawerOpen ? 1.5 : 1.25,
                        borderRadius: '11px',
                        cursor: 'pointer',
                        textDecoration: 'none',
                        position: 'relative',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        background: isActive 
                          ? 'rgba(255, 255, 255, 0.15)'
                          : isHovered 
                            ? 'rgba(255, 255, 255, 0.08)'
                            : 'transparent',
                        backdropFilter: isActive ? 'blur(12px) saturate(180%)' : 'none',
                        WebkitBackdropFilter: isActive ? 'blur(12px) saturate(180%)' : 'none',
                        boxShadow: isActive 
                          ? '0 4px 16px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                          : 'none',
                        '&:hover': {
                          background: isActive 
                            ? 'rgba(255, 255, 255, 0.2)'
                            : 'rgba(255, 255, 255, 0.1)',
                          backdropFilter: 'blur(12px) saturate(180%)',
                          WebkitBackdropFilter: 'blur(12px) saturate(180%)',
                          transform: 'translateY(-1px)',
                          boxShadow: isActive 
                            ? '0 6px 20px rgba(0, 0, 0, 0.12), 0 2px 4px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.12)'
                            : 'none',
                        }
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 0,
                          mr: effectiveDrawerOpen ? 1.5 : 'auto',
                          justifyContent: 'center',
                          color: isActive 
                            ? item.color
                            : 'rgba(255, 255, 255, 0.6)',
                          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                          fontSize: '1.25rem',
                          '& .MuiSvgIcon-root': {
                            fontSize: '1.25rem'
                          }
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>
                      {effectiveDrawerOpen && (
                        <ListItemText
                          primary={item.text}
                          primaryTypographyProps={{
                            sx: { 
                              color: isActive 
                                ? 'rgba(255, 255, 255, 1)' 
                                : 'rgba(255, 255, 255, 0.7)', 
                              fontWeight: isActive ? 600 : 500,
                              fontSize: '0.875rem',
                              letterSpacing: '-0.01em',
                              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            }
                          }}
                        />
                      )}
                    </ListItem>
                  </Tooltip>
                </Box>
              );
            })}
          </List>
        </>
      )}

      {/* Professional Footer with Glassmorphism */}
      <Box
        sx={{
          mt: 'auto',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        {/* User Profile Section */}
        {currentUser && (
          <Box
            sx={{
              p: 2,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.06)',
                backdropFilter: 'blur(20px)',
              }
            }}
            onClick={handleUserMenuClick}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar
                sx={{
                  width: effectiveDrawerOpen ? 36 : 32,
                  height: effectiveDrawerOpen ? 36 : 32,
                  bgcolor: 'rgba(255, 255, 255, 0.12)',
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontSize: effectiveDrawerOpen ? '0.875rem' : '0.75rem',
                  fontWeight: 600,
                  border: '1.5px solid rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(20px)',
                  transition: 'all 0.2s ease'
                }}
              >
                {currentUser?.firstName?.[0]}{currentUser?.lastName?.[0]}
              </Avatar>
              {effectiveDrawerOpen && (
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      letterSpacing: '-0.01em'
                    }}
                  >
                    {currentUser?.firstName} {currentUser?.lastName}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.5)',
                      fontSize: '0.7rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      display: 'block'
                    }}
                  >
                    {currentUser?.email}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        )}

        {/* Version Info */}
        <Box sx={{ p: 2, textAlign: 'center' }}>
          {effectiveDrawerOpen ? (
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'rgba(255, 255, 255, 0.35)',
                fontSize: '0.7rem',
                fontWeight: 500,
                letterSpacing: '0.05em'
              }}
            >
              Version 2.2.0
            </Typography>
          ) : (
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'rgba(255, 255, 255, 0.35)',
                fontSize: '0.65rem',
                fontWeight: 500
              }}
            >
              v2.2
            </Typography>
          )}
        </Box>
      </Box>
    </>
  );
  
  return (
    <>
      {/* Mobile Top AppBar */}
      {isMobile && (
        <AppBar
          position="fixed"
          sx={{
            background: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'saturate(180%) blur(20px)',
            WebkitBackdropFilter: 'saturate(180%) blur(20px)',
            boxShadow: '0 1px 0 rgba(255, 255, 255, 0.08)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ 
                mr: 2,
                color: 'rgba(255, 255, 255, 0.9)'
              }}
            >
              <MenuIcon />
            </IconButton>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexGrow: 1 }}>
              {/* Logo in Mobile AppBar */}
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '10px',
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
                  src={`${import.meta.env.BASE_URL}media/logo.svg`}
                  alt="E-Nvoicing Logo"
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    filter: 'drop-shadow(0 2px 4px rgba(102, 126, 234, 0.15))'
                  }}
                />
              </Box>
              <Typography 
                variant="h6" 
                noWrap 
                component="div" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.95)',
                  fontWeight: 600,
                  fontSize: '1rem',
                  letterSpacing: '-0.01em'
                }}
              >
                E-Nvoicing
              </Typography>
            </Box>
          </Toolbar>
        </AppBar>
      )}

      {/* Mobile Drawer (Temporary) */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={mobileDrawerOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better mobile performance
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: 280,
              background: 'rgba(15, 23, 42, 0.95)',
              backdropFilter: 'saturate(180%) blur(20px)',
              WebkitBackdropFilter: 'saturate(180%) blur(20px)',
              color: 'white',
              borderRight: '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Desktop Drawer (Permanent) */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              background: 'rgba(15, 23, 42, 0.95)',
              backdropFilter: 'saturate(180%) blur(20px)',
              WebkitBackdropFilter: 'saturate(180%) blur(20px)',
              color: 'white',
              transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              overflowX: 'hidden',
              borderRight: '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* User Menu */}
      <Menu
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={handleUserMenuClose}
        transformOrigin={{ horizontal: 'left', vertical: 'bottom' }}
        anchorOrigin={{ horizontal: 'left', vertical: 'top' }}
        PaperProps={{
          sx: {
            background: 'rgba(30, 41, 59, 0.95)',
            backdropFilter: 'saturate(180%) blur(20px)',
            WebkitBackdropFilter: 'saturate(180%) blur(20px)',
            color: 'white',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: '0 12px 24px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
            minWidth: 200,
            mt: 1
          }
        }}
      >
        <MenuItem
          onClick={handleProfile}
          sx={{
            py: 1.5,
            px: 2,
            gap: 1.5,
            '&:hover': {
              background: 'rgba(255, 255, 255, 0.08)'
            }
          }}
        >
          <ListItemIcon sx={{ color: 'rgba(255, 255, 255, 0.9)', minWidth: 36 }}>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText 
            primary="Profile" 
            primaryTypographyProps={{
              sx: { fontSize: '0.875rem', fontWeight: 500 }
            }}
          />
        </MenuItem>
        <MenuItem
          onClick={() => {
            navigate('/support');
            handleUserMenuClose();
          }}
          sx={{
            py: 1.5,
            px: 2,
            gap: 1.5,
            '&:hover': {
              background: 'rgba(255, 255, 255, 0.08)'
            }
          }}
        >
          <ListItemIcon sx={{ color: 'rgba(255, 255, 255, 0.9)', minWidth: 36 }}>
            <SupportIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText 
            primary="Support" 
            primaryTypographyProps={{
              sx: { fontSize: '0.875rem', fontWeight: 500 }
            }}
          />
        </MenuItem>
        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.08)', my: 0.5 }} />
        <MenuItem
          onClick={handleLogout}
          sx={{
            py: 1.5,
            px: 2,
            gap: 1.5,
            '&:hover': {
              background: 'rgba(239, 68, 68, 0.08)'
            }
          }}
        >
          <ListItemIcon sx={{ color: '#ef4444', minWidth: 36 }}>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText 
            primary="Logout" 
            primaryTypographyProps={{ 
              color: '#ef4444',
              sx: { fontSize: '0.875rem', fontWeight: 500 }
            }} 
          />
        </MenuItem>
      </Menu>
    </>
  );
}
