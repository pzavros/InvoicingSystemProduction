import { useState } from 'react';
import { 
  Box, 
  Drawer, 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Chip,
  Divider,
  Paper,
  useTheme,
  alpha,
  IconButton,
  useMediaQuery
} from '@mui/material';
import { 
  LogoutRounded, 
  PersonRounded, 
  DashboardRounded,
  EmailRounded,
  BugReportRounded,
  SettingsRounded,
  PeopleRounded,
  SecurityRounded,
  AdminPanelSettingsRounded,
  MenuRounded,
  CloseRounded
} from '@mui/icons-material';
import SimpleWaitlistDashboard from '../components/AdminComponents/SimpleWaitlistDashboard.jsx';
import ContactMessagesDashboard from '../components/AdminComponents/ContactMessagesDashboard.jsx';
import DebugPage from '../components/AdminComponents/DebugPage.jsx';
import { useAdminAuth } from '../contexts/AdminAuthContext.jsx';

const AdminPage = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { logout, user } = useAdminAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const drawerWidth = 280;

  const navigationItems = [
    {
      id: 0,
      label: 'Waitlist Dashboard',
      icon: <PeopleRounded />,
      color: '#667eea',
      description: 'Manage user waitlist'
    },
    {
      id: 1,
      label: 'Contact Messages',
      icon: <EmailRounded />,
      color: '#764ba2',
      description: 'Handle customer inquiries'
    },
    {
      id: 2,
      label: 'System Debug',
      icon: <BugReportRounded />,
      color: '#f093fb',
      description: 'Debug & monitoring tools'
    },
    {
      id: 3,
      label: 'System Settings',
      icon: <SettingsRounded />,
      color: '#4facfe',
      description: 'Advanced configuration',
      disabled: true
    }
  ];

  const handleLogout = () => {
    logout();
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigation = (id) => {
    setSelectedTab(id);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const renderContent = () => {
    switch (selectedTab) {
      case 0:
        return <SimpleWaitlistDashboard />;
      case 1:
        return <ContactMessagesDashboard />;
      case 2:
        return <DebugPage />;
      case 3:
        return (
          <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
            <Typography variant="h4" gutterBottom>System Settings</Typography>
            <Typography color="text.secondary">Advanced configuration panel coming soon...</Typography>
          </Box>
        );
      default:
        return <SimpleWaitlistDashboard />;
    }
  };

  const drawerContent = (
    <>
      {/* Header Section */}
      <Box
        sx={{
          p: 3,
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Avatar
              sx={{
                width: 48,
                height: 48,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
              }}
            >
              <AdminPanelSettingsRounded />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="bold" sx={{ color: 'white' }}>
                Admin Portal
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                System Management
              </Typography>
            </Box>
          </Box>
          
          {/* User Info */}
          <Paper
            sx={{
              p: 2,
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 2
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  fontSize: '0.875rem'
                }}
              >
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant="body2"
                  fontWeight="600"
                  sx={{ color: 'white', overflow: 'hidden', textOverflow: 'ellipsis' }}
                >
                  {user?.firstName} {user?.lastName}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: 'rgba(255, 255, 255, 0.6)', overflow: 'hidden', textOverflow: 'ellipsis' }}
                >
                  {user?.email}
                </Typography>
              </Box>
              <Chip
                label="Admin"
                size="small"
                sx={{
                  background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '0.7rem'
                }}
              />
            </Box>
          </Paper>
        </Box>

        {/* Navigation */}
        <List sx={{ px: 2, py: 1 }}>
          {navigationItems.map((item) => {
            const isSelected = selectedTab === item.id;
            return (
              <ListItem key={item.id} disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  selected={isSelected}
                  onClick={() => !item.disabled && handleNavigation(item.id)}
                  disabled={item.disabled}
                  sx={{
                    borderRadius: 2,
                    minHeight: 56,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    background: isSelected
                      ? `linear-gradient(135deg, ${item.color}20 0%, ${item.color}10 100%)`
                      : 'transparent',
                    border: isSelected ? `1px solid ${item.color}40` : '1px solid transparent',
                    transform: isSelected ? 'translateX(8px)' : 'translateX(0)',
                    boxShadow: isSelected ? `0 8px 32px ${item.color}20` : 'none',
                    '&:hover': {
                      background: item.disabled 
                        ? 'rgba(255, 255, 255, 0.03)'
                        : 'rgba(255, 255, 255, 0.08)',
                      transform: item.disabled ? 'none' : 'translateX(4px)',
                    },
                    '&.Mui-disabled': {
                      opacity: 0.4
                    }
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: isSelected ? item.color : 'rgba(255, 255, 255, 0.7)',
                      minWidth: 40,
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    secondary={item.description}
                    primaryTypographyProps={{
                      fontWeight: isSelected ? 600 : 400,
                      color: isSelected ? item.color : 'white',
                      fontSize: '0.875rem'
                    }}
                    secondaryTypographyProps={{
                      color: 'rgba(255, 255, 255, 0.5)',
                      fontSize: '0.75rem'
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>

        {/* Footer */}
        <Box sx={{ mt: 'auto', p: 2 }}>
          <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)', mb: 2 }} />
          <Button
            variant="outlined"
            fullWidth
            startIcon={<LogoutRounded />}
            onClick={handleLogout}
            sx={{
              color: 'rgba(255, 255, 255, 0.8)',
              borderColor: 'rgba(255, 255, 255, 0.2)',
              borderRadius: 2,
              py: 1,
              '&:hover': {
                borderColor: '#ff6b6b',
                color: '#ff6b6b',
                background: 'rgba(255, 107, 107, 0.1)'
              }
            }}
          >
            Logout
          </Button>
        </Box>
    </>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            background: 'linear-gradient(145deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
            color: 'white',
            borderRight: 'none',
            boxShadow: '4px 0 20px rgba(0, 0, 0, 0.1)'
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            background: 'linear-gradient(145deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
            color: 'white',
            borderRight: 'none',
            boxShadow: '4px 0 20px rgba(0, 0, 0, 0.1)'
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` },
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          minHeight: '100vh'
        }}
      >
        {/* Top Bar */}
        <AppBar
          position="static"
          elevation={0}
          sx={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
            color: 'black'
          }}
        >
          <Toolbar sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
            {/* Mobile Menu Button */}
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: 'none' } }}
            >
              <MenuRounded />
            </IconButton>

            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h5" fontWeight="bold" sx={{ 
                color: '#2d3748',
                fontSize: { xs: '1.25rem', sm: '1.5rem' }
              }}>
                {navigationItems.find(item => item.id === selectedTab)?.label || 'Dashboard'}
              </Typography>
              <Typography variant="body2" sx={{ 
                color: '#718096',
                display: { xs: 'none', sm: 'block' }
              }}>
                {navigationItems.find(item => item.id === selectedTab)?.description || 'Welcome to the admin portal'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Chip
                icon={<SecurityRounded />}
                label="Secure Session"
                size="small"
                sx={{
                  display: { xs: 'none', sm: 'flex' },
                  background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                  color: 'white',
                  fontWeight: 'bold'
                }}
              />
            </Box>
          </Toolbar>
        </AppBar>

        {/* Content Area */}
        <Box sx={{ p: 0 }}>
          {renderContent()}
        </Box>
      </Box>
    </Box>
  );
};

export default AdminPage;
