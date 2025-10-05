import { useState } from 'react';
import { Box, Tabs, Tab, AppBar, Toolbar, Typography } from '@mui/material';
import SimpleWaitlistDashboard from '../components/AdminComponents/SimpleWaitlistDashboard.jsx';
import ContactMessagesDashboard from '../components/AdminComponents/ContactMessagesDashboard.jsx';
import DebugPage from '../components/AdminComponents/DebugPage.jsx';

const AdminPage = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
      <AppBar position="static" sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <Toolbar>
          <Typography variant="h5" fontWeight="bold">
            Invoice System Admin
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', backgroundColor: 'white' }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          sx={{ px: 2 }}
        >
          <Tab label="Waitlist Dashboard" />
          <Tab label="Contact Messages" />
          <Tab label="Debug" />
          <Tab label="System Settings" disabled />
        </Tabs>
      </Box>

      <Box sx={{ mt: 0 }}>
        {tabValue === 0 && <SimpleWaitlistDashboard />}
        {tabValue === 1 && <ContactMessagesDashboard />}
        {tabValue === 2 && <DebugPage />}
        {tabValue === 3 && (
          <Box sx={{ p: 4 }}>
            <Typography variant="h4">System Settings</Typography>
            <Typography color="text.secondary">Coming soon...</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default AdminPage;
