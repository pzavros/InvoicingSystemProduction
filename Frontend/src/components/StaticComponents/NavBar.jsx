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
  Chip,
  Fade,
  Grow,
  Menu,
  MenuItem
} from '@mui/material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import InfoIcon from '@mui/icons-material/Info';
import ReceiptIcon from '@mui/icons-material/Receipt';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
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
import { SidebarContext } from './SidebarContext';
import { useAuth } from '../../utils/AuthContext';

export default function NavBar() {
  const { sidebarOpen, setSidebarOpen } = useContext(SidebarContext);
  const { user: currentUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [hoveredItem, setHoveredItem] = useState(null);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);

  const handleDrawerToggle = () => {
    setSidebarOpen(!sidebarOpen);
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
  
  const navItems = [
    { 
      text: 'Home', 
      icon: <HomeIcon />, 
      path: '/', 
      description: 'Invoice management',
      color: '#3b82f6'
    },
    { 
      text: 'Dashboard', 
      icon: <DashboardIcon />, 
      path: '/dashboard', 
      description: 'Analytics & insights',
      color: '#8b5cf6'
    },
    { 
      text: 'Create Invoice', 
      icon: <AddCircleOutlineIcon />, 
      path: '/invoices/create', 
      description: 'New invoice',
      color: '#10b981'
    },
    { 
      text: 'Products', 
      icon: <InventoryIcon />, 
      path: '/products', 
      description: 'Manage catalog',
      color: '#f59e0b'
    },
    { 
      text: 'Templates', 
      icon: <DescriptionIcon />, 
      path: '/templates', 
      description: 'Invoice templates',
      color: '#8b5cf6'
    },
    { 
      text: 'Clients', 
      icon: <GroupIcon />, 
      path: '/clients', 
      description: 'Manage clients',
      color: '#06b6d4'
    },
    { 
      text: 'Reports', 
      icon: <ReceiptIcon />, 
      path: '/report', 
      description: 'Generate reports',
      color: '#ef4444'
    },
    { 
      text: 'Settings', 
      icon: <SettingsIcon />, 
      path: '/settings', 
      description: 'System configuration',
      color: '#6b7280'
    },
    { 
      text: 'Subscription', 
      icon: <CreditCardIcon />, 
      path: '/subscription', 
      description: 'Manage subscription',
      color: '#22c55e'
    },
    { 
      text: 'About', 
      icon: <InfoIcon />, 
      path: '/about', 
      description: 'System information',
      color: '#06b6d4'
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
      text: 'System Admin', 
      icon: <AdminPanelSettingsIcon />, 
      path: '/admin/system', 
      description: 'Advanced system settings',
      color: '#ea580c'
    },
  ];
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 50%, #020617 100%)',
          color: 'white',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          overflowX: 'hidden',
          borderRight: '1px solid rgba(148, 163, 184, 0.1)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        },
      }}
    >
      {/* Enhanced Header Section */}
      <Fade in timeout={800}>
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          padding: '32px 24px', // Increased padding to make header taller
          justifyContent: sidebarOpen ? 'space-between' : 'center',
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
          borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.02) 50%, transparent 70%)',
            animation: 'shimmer 3s ease-in-out infinite',
          },
          '@keyframes shimmer': {
            '0%': { transform: 'translateX(-100%)' },
            '100%': { transform: 'translateX(100%)' }
          }
        }}>
          {sidebarOpen && (
            <Grow in={sidebarOpen} timeout={600}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar sx={{ 
                  bgcolor: 'transparent', 
                  background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                  width: 32, 
                  height: 32,
                  boxShadow: '0 8px 32px rgba(59, 130, 246, 0.3)'
                }}>
                  <BusinessIcon sx={{ fontSize: 18 }} />
                </Avatar>
                <Box>
                  <Typography 
                    variant="h6" 
                    noWrap 
                    component="div" 
                    sx={{ 
                      background: 'linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      fontWeight: 700,
                      fontSize: '1.1rem',
                      letterSpacing: '0.5px'
                    }}
                  >
                    Invoicing
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: 'rgba(255, 255, 255, 0.6)',
                      fontSize: '0.7rem',
                      fontWeight: 500
                    }}
                  >
                    Business Suite
                  </Typography>
                </Box>
              </Box>
            </Grow>
          )}
          <Tooltip title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"} placement="right">
            <IconButton 
              onClick={handleDrawerToggle} 
              sx={{ 
                color: 'white',
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.1)',
                  transform: 'scale(1.05)',
                  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)'
                }
              }}
            >
              {sidebarOpen ? <ChevronLeftIcon /> : <MenuIcon />}
            </IconButton>
          </Tooltip>
        </Box>
      </Fade>

      {/* Enhanced Navigation List */}
      <List sx={{ pt: 2, px: 1 }}>
        {navItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          const isHovered = hoveredItem === item.text;
          
          return (
            <Grow in timeout={600 + index * 100} key={item.text}>
              <Box sx={{ mb: 1 }}>
                <Tooltip 
                  title={!sidebarOpen ? `${item.text} - ${item.description}` : ""} 
                  placement="right"
                  arrow
                >
                  <ListItem
                    component={Link}
                    to={item.path}
                    onMouseEnter={() => setHoveredItem(item.text)}
                    onMouseLeave={() => setHoveredItem(null)}
                    sx={{
                      minHeight: 56,
                      justifyContent: sidebarOpen ? 'initial' : 'center',
                      px: 2,
                      mx: 1,
                      borderRadius: 3,
                      cursor: 'pointer',
                      textDecoration: 'none',
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      background: isActive 
                        ? `linear-gradient(135deg, ${item.color}20 0%, ${item.color}10 100%)`
                        : isHovered 
                          ? 'rgba(255, 255, 255, 0.05)'
                          : 'transparent',
                      border: isActive 
                        ? `1px solid ${item.color}40`
                        : '1px solid transparent',
                      transform: isHovered ? 'translateX(8px)' : 'translateX(0px)',
                      boxShadow: isActive 
                        ? `0 8px 32px ${item.color}20`
                        : isHovered
                          ? '0 8px 25px rgba(0, 0, 0, 0.1)'
                          : 'none',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        height: '100%',
                        width: isActive ? '4px' : '0px',
                        background: `linear-gradient(180deg, ${item.color} 0%, ${item.color}80 100%)`,
                        borderRadius: '0 8px 8px 0',
                        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      }
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: sidebarOpen ? 2 : 'auto',
                        justifyContent: 'center',
                        color: isActive ? item.color : 'rgba(255, 255, 255, 0.8)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                        filter: isActive ? 'drop-shadow(0 0 8px currentColor)' : 'none'
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    {sidebarOpen && (
                      <Fade in={sidebarOpen} timeout={400}>
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 1 }}>
                          <ListItemText
                            primary={item.text}
                            secondary={item.description}
                            primaryTypographyProps={{
                              sx: { 
                                color: isActive ? item.color : 'white', 
                                fontWeight: isActive ? 600 : 500,
                                fontSize: '0.95rem',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                              }
                            }}
                            secondaryTypographyProps={{
                              sx: { 
                                color: 'rgba(255, 255, 255, 0.5)', 
                                fontSize: '0.75rem',
                                fontWeight: 400
                              }
                            }}
                          />
                          {isActive && (
                            <Chip
                              size="small"
                              label="•"
                              sx={{
                                bgcolor: item.color,
                                color: 'white',
                                minWidth: 'auto',
                                width: 24,
                                height: 24,
                                fontSize: '1.2rem',
                                fontWeight: 'bold',
                                '& .MuiChip-label': {
                                  px: 0
                                }
                              }}
                            />
                          )}
                        </Box>
                      </Fade>
                    )}
                  </ListItem>
                </Tooltip>
              </Box>
            </Grow>
          );
        })}
      </List>

      {/* Admin Section */}
      {currentUser?.isAdmin && (
        <>
          <Box sx={{ px: 2, py: 1 }}>
            <Divider sx={{ borderColor: 'rgba(148, 163, 184, 0.2)' }} />
            {sidebarOpen && (
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.6)', 
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  letterSpacing: '0.5px',
                  mt: 2,
                  display: 'block'
                }}
              >
                ADMIN PANEL
              </Typography>
            )}
          </Box>
          
          <List sx={{ pt: 1, px: 1 }}>
            {adminItems.map((item, index) => {
              const isActive = location.pathname === item.path;
              const isHovered = hoveredItem === item.text;
              
              return (
                <Grow in timeout={800 + index * 100} key={item.text}>
                  <Box sx={{ mb: 1 }}>
                    <Tooltip 
                      title={!sidebarOpen ? `${item.text} - ${item.description}` : ""} 
                      placement="right"
                      arrow
                    >
                      <ListItem
                        component={Link}
                        to={item.path}
                        onMouseEnter={() => setHoveredItem(item.text)}
                        onMouseLeave={() => setHoveredItem(null)}
                        sx={{
                          minHeight: 56,
                          justifyContent: sidebarOpen ? 'initial' : 'center',
                          px: 2,
                          mx: 1,
                          borderRadius: 3,
                          cursor: 'pointer',
                          textDecoration: 'none',
                          position: 'relative',
                          overflow: 'hidden',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          background: isActive 
                            ? `linear-gradient(135deg, ${item.color}20 0%, ${item.color}10 100%)`
                            : isHovered 
                              ? 'rgba(255, 255, 255, 0.05)'
                              : 'transparent',
                          border: isActive 
                            ? `1px solid ${item.color}40`
                            : '1px solid transparent',
                          transform: isHovered ? 'translateX(8px)' : 'translateX(0px)',
                          boxShadow: isActive 
                            ? `0 8px 32px ${item.color}20`
                            : isHovered
                              ? '0 8px 25px rgba(0, 0, 0, 0.1)'
                              : 'none',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            height: '100%',
                            width: isActive ? '4px' : '0px',
                            background: `linear-gradient(180deg, ${item.color} 0%, ${item.color}80 100%)`,
                            borderRadius: '0 8px 8px 0',
                            transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          }
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            minWidth: 0,
                            mr: sidebarOpen ? 2 : 'auto',
                            justifyContent: 'center',
                            color: isActive ? item.color : 'rgba(255, 255, 255, 0.8)',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                            filter: isActive ? 'drop-shadow(0 0 8px currentColor)' : 'none'
                          }}
                        >
                          {item.icon}
                        </ListItemIcon>
                        {sidebarOpen && (
                          <Fade in={sidebarOpen} timeout={400}>
                            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 1 }}>
                              <ListItemText
                                primary={item.text}
                                secondary={item.description}
                                primaryTypographyProps={{
                                  sx: { 
                                    color: isActive ? item.color : 'white', 
                                    fontWeight: isActive ? 600 : 500,
                                    fontSize: '0.95rem',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                  }
                                }}
                                secondaryTypographyProps={{
                                  sx: { 
                                    color: 'rgba(255, 255, 255, 0.5)', 
                                    fontSize: '0.75rem',
                                    fontWeight: 400
                                  }
                                }}
                              />
                              {isActive && (
                                <Chip
                                  size="small"
                                  label="•"
                                  sx={{
                                    bgcolor: item.color,
                                    color: 'white',
                                    minWidth: 'auto',
                                    width: 24,
                                    height: 24,
                                    fontSize: '1.2rem',
                                    fontWeight: 'bold',
                                    '& .MuiChip-label': {
                                      px: 0
                                    }
                                  }}
                                />
                              )}
                            </Box>
                          </Fade>
                        )}
                      </ListItem>
                    </Tooltip>
                  </Box>
                </Grow>
              );
            })}
          </List>
        </>
      )}

      {/* Enhanced Footer */}
      <Fade in timeout={1000}>
        <Box
          sx={{
            mt: 'auto',
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(2, 6, 23, 0.9) 100%)',
            borderTop: '1px solid rgba(148, 163, 184, 0.1)',
            backdropFilter: 'blur(10px)'
          }}
        >
          {/* User Profile Section */}
          {currentUser && (
            <Box
              sx={{
                p: 2,
                borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.05)'
                }
              }}
              onClick={handleUserMenuClick}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                  sx={{
                    width: sidebarOpen ? 40 : 32,
                    height: sidebarOpen ? 40 : 32,
                    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                    fontSize: sidebarOpen ? '1rem' : '0.8rem',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {currentUser?.firstName?.[0]}{currentUser?.lastName?.[0]}
                </Avatar>
                {sidebarOpen && (
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {currentUser?.firstName} {currentUser?.lastName}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'rgba(255, 255, 255, 0.6)',
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
            {sidebarOpen ? (
              <Box>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    display: 'block',
                    mb: 0.5
                  }}
                >
                  Version 2.2.0
                </Typography>
              </Box>
            ) : (
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.6)',
                  fontSize: '0.7rem',
                  fontWeight: 500,
                  writingMode: 'vertical-rl',
                  textOrientation: 'mixed'
                }}
              >
                v2.2.0
              </Typography>
            )}
          </Box>
        </Box>
      </Fade>

      {/* User Menu */}
      <Menu
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={handleUserMenuClose}
        transformOrigin={{ horizontal: 'left', vertical: 'bottom' }}
        anchorOrigin={{ horizontal: 'left', vertical: 'top' }}
        PaperProps={{
          sx: {
            background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)',
            color: 'white',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
            borderRadius: 2,
            minWidth: 200
          }
        }}
      >
        <MenuItem
          onClick={handleProfile}
          sx={{
            py: 1.5,
            '&:hover': {
              background: 'rgba(255, 255, 255, 0.1)'
            }
          }}
        >
          <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
            <PersonIcon />
          </ListItemIcon>
          <ListItemText primary="Profile" />
        </MenuItem>
        <Divider sx={{ borderColor: 'rgba(148, 163, 184, 0.2)' }} />
        <MenuItem
          onClick={handleLogout}
          sx={{
            py: 1.5,
            '&:hover': {
              background: 'rgba(239, 68, 68, 0.1)'
            }
          }}
        >
          <ListItemIcon sx={{ color: '#ef4444', minWidth: 40 }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" primaryTypographyProps={{ color: '#ef4444' }} />
        </MenuItem>
      </Menu>
    </Drawer>
  );
}
