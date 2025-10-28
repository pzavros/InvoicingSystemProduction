import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Alert,
  Container,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Switch,
  FormControlLabel,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Storage,
  Security,
  Build,
  Analytics,
  CloudSync,
  Warning,
  CheckCircle,
  Error
} from '@mui/icons-material';

const SystemAdminPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [debugMode, setDebugMode] = useState(false);

  const systemStats = [
    { label: 'Total Users', value: '1,247', icon: <Analytics />, color: 'primary' },
    { label: 'Active Sessions', value: '89', icon: <Security />, color: 'success' },
    { label: 'Database Size', value: '2.4 GB', icon: <Storage />, color: 'info' },
    { label: 'System Uptime', value: '99.8%', icon: <CheckCircle />, color: 'success' },
  ];

  const systemHealth = [
    { service: 'Database', status: 'healthy', icon: <CheckCircle color="success" /> },
    { service: 'Authentication Service', status: 'healthy', icon: <CheckCircle color="success" /> },
    { service: 'File Storage', status: 'warning', icon: <Warning color="warning" /> },
    { service: 'Email Service', status: 'error', icon: <Error color="error" /> },
  ];

  const handleMaintenanceToggle = () => {
    setMaintenanceMode(!maintenanceMode);
    // Here you would make an API call to toggle maintenance mode
  };

  const handleDebugToggle = () => {
    setDebugMode(!debugMode);
    // Here you would make an API call to toggle debug mode
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
      <Box sx={{ mb: { xs: 3, md: 4 } }}>
        <Typography variant={isMobile ? "h5" : "h4"} fontWeight="bold" gutterBottom>
          System Administration
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
          Advanced system settings and monitoring
        </Typography>
      </Box>

      {/* System Statistics */}
      <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: { xs: 3, md: 4 } }}>
        {systemStats.map((stat, index) => (
          <Grid item xs={6} sm={6} md={3} key={index}>
            <Card elevation={3} sx={{ borderRadius: { xs: 2, md: 3 } }}>
              <CardContent sx={{ p: { xs: 1.5, md: 2 } }}>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, gap: { xs: 1, md: 2 } }}>
                  <Box sx={{ color: `${stat.color}.main` }}>
                    {React.cloneElement(stat.icon, { fontSize: isMobile ? 'medium' : 'large' })}
                  </Box>
                  <Box>
                    <Typography variant={isMobile ? "h6" : "h5"} fontWeight="bold">
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}>
                      {stat.label}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={{ xs: 2, md: 3 }}>
        {/* System Health */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: { xs: 2, md: 3 }, borderRadius: { xs: 2, md: 3 } }}>
            <Typography variant={isMobile ? "subtitle1" : "h6"} fontWeight="bold" gutterBottom>
              System Health
            </Typography>
            <List dense={isMobile}>
              {systemHealth.map((item, index) => (
                <ListItem key={index} sx={{ px: { xs: 0, md: 2 } }}>
                  <ListItemIcon sx={{ minWidth: { xs: 36, md: 56 } }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.service}
                    secondary={item.status.toUpperCase()}
                    primaryTypographyProps={{ fontSize: { xs: '0.875rem', md: '1rem' } }}
                    secondaryTypographyProps={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* System Controls */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: { xs: 2, md: 3 }, borderRadius: { xs: 2, md: 3 } }}>
            <Typography variant={isMobile ? "subtitle1" : "h6"} fontWeight="bold" gutterBottom>
              System Controls
            </Typography>
            
            <Box sx={{ mb: { xs: 2, md: 3 } }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={maintenanceMode}
                    onChange={handleMaintenanceToggle}
                    color="warning"
                  />
                }
                label={<Typography variant={isMobile ? "body2" : "body1"}>Maintenance Mode</Typography>}
              />
              <Typography variant="body2" color="text.secondary" sx={{ ml: { xs: 3, md: 4 }, fontSize: { xs: '0.75rem', md: '0.875rem' } }}>
                Temporarily disable user access for system updates
              </Typography>
            </Box>

            <Box sx={{ mb: { xs: 2, md: 3 } }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={debugMode}
                    onChange={handleDebugToggle}
                    color="info"
                  />
                }
                label={<Typography variant={isMobile ? "body2" : "body1"}>Debug Mode</Typography>}
              />
              <Typography variant="body2" color="text.secondary" sx={{ ml: { xs: 3, md: 4 }, fontSize: { xs: '0.75rem', md: '0.875rem' } }}>
                Enable detailed logging for troubleshooting
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.5, md: 2 } }}>
              <Button
                variant="outlined"
                startIcon={!isMobile && <CloudSync />}
                fullWidth
                size={isMobile ? "small" : "medium"}
              >
                Sync Database
              </Button>
              
              <Button
                variant="outlined"
                startIcon={!isMobile && <Build />}
                fullWidth
                size={isMobile ? "small" : "medium"}
              >
                Clear Cache
              </Button>
              
              <Button
                variant="outlined"
                color="error"
                startIcon={!isMobile && <Warning />}
                fullWidth
                size={isMobile ? "small" : "medium"}
              >
                Restart System
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: { xs: 2, md: 3 }, borderRadius: { xs: 2, md: 3 } }}>
            <Typography variant={isMobile ? "subtitle1" : "h6"} fontWeight="bold" gutterBottom>
              Recent System Activity
            </Typography>
            
            <List dense={isMobile}>
              <ListItem sx={{ px: { xs: 0, md: 2 } }}>
                <ListItemIcon sx={{ minWidth: { xs: 36, md: 56 } }}>
                  <CheckCircle color="success" />
                </ListItemIcon>
                <ListItemText 
                  primary="Database backup completed"
                  secondary="2 hours ago"
                  primaryTypographyProps={{ fontSize: { xs: '0.875rem', md: '1rem' } }}
                  secondaryTypographyProps={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}
                />
              </ListItem>
              
              <ListItem sx={{ px: { xs: 0, md: 2 } }}>
                <ListItemIcon sx={{ minWidth: { xs: 36, md: 56 } }}>
                  <Warning color="warning" />
                </ListItemIcon>
                <ListItemText 
                  primary="High memory usage detected"
                  secondary="4 hours ago"
                  primaryTypographyProps={{ fontSize: { xs: '0.875rem', md: '1rem' } }}
                  secondaryTypographyProps={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}
                />
              </ListItem>
              
              <ListItem sx={{ px: { xs: 0, md: 2 } }}>
                <ListItemIcon sx={{ minWidth: { xs: 36, md: 56 } }}>
                  <Security color="info" />
                </ListItemIcon>
                <ListItemText 
                  primary="Security patch applied"
                  secondary="1 day ago"
                  primaryTypographyProps={{ fontSize: { xs: '0.875rem', md: '1rem' } }}
                  secondaryTypographyProps={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ mt: { xs: 2, md: 3 } }}>
        <Alert severity="warning" sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}>
          <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}>
            <strong>Caution:</strong> These are advanced system controls. 
            Improper use may affect system stability and user experience.
          </Typography>
        </Alert>
      </Box>
    </Container>
  );
};

export default SystemAdminPage;
