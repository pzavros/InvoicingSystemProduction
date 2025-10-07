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
  FormControlLabel
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
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          System Administration
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Advanced system settings and monitoring
        </Typography>
      </Box>

      {/* System Statistics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {systemStats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card elevation={3} sx={{ borderRadius: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ color: `${stat.color}.main` }}>
                    {stat.icon}
                  </Box>
                  <Box>
                    <Typography variant="h5" fontWeight="bold">
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.label}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* System Health */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              System Health
            </Typography>
            <List dense>
              {systemHealth.map((item, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.service}
                    secondary={item.status.toUpperCase()}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* System Controls */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              System Controls
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={maintenanceMode}
                    onChange={handleMaintenanceToggle}
                    color="warning"
                  />
                }
                label="Maintenance Mode"
              />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                Temporarily disable user access for system updates
              </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={debugMode}
                    onChange={handleDebugToggle}
                    color="info"
                  />
                }
                label="Debug Mode"
              />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                Enable detailed logging for troubleshooting
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<CloudSync />}
                fullWidth
              >
                Sync Database
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<Build />}
                fullWidth
              >
                Clear Cache
              </Button>
              
              <Button
                variant="outlined"
                color="error"
                startIcon={<Warning />}
                fullWidth
              >
                Restart System
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Recent System Activity
            </Typography>
            
            <List>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="success" />
                </ListItemIcon>
                <ListItemText 
                  primary="Database backup completed"
                  secondary="2 hours ago"
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <Warning color="warning" />
                </ListItemIcon>
                <ListItemText 
                  primary="High memory usage detected"
                  secondary="4 hours ago"
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <Security color="info" />
                </ListItemIcon>
                <ListItemText 
                  primary="Security patch applied"
                  secondary="1 day ago"
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ mt: 3 }}>
        <Alert severity="warning">
          <Typography variant="body2">
            <strong>Caution:</strong> These are advanced system controls. 
            Improper use may affect system stability and user experience.
          </Typography>
        </Alert>
      </Box>
    </Container>
  );
};

export default SystemAdminPage;
