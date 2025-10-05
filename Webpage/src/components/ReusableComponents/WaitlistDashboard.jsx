import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Alert
} from '@mui/material';
import {
  Download,
  People,
  TrendingUp,
  Schedule
} from '@mui/icons-material';

const WaitlistDashboard = () => {
  const [waitlistData, setWaitlistData] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    thisWeek: 0
  });

  useEffect(() => {
    loadWaitlistData();
  }, []);

  const loadWaitlistData = () => {
    const data = JSON.parse(localStorage.getItem('invoiceSystemWaitlist') || '[]');
    setWaitlistData(data);

    // Calculate stats
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const todayCount = data.filter(entry => 
      new Date(entry.timestamp) >= today
    ).length;

    const weekCount = data.filter(entry => 
      new Date(entry.timestamp) >= weekAgo
    ).length;

    setStats({
      total: data.length,
      today: todayCount,
      thisWeek: weekCount
    });
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Company', 'Date Joined'];
    const csvContent = [
      headers.join(','),
      ...waitlistData.map(entry => [
        entry.name || 'N/A',
        entry.email,
        entry.company || 'N/A',
        new Date(entry.timestamp).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `waitlist-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const StatCard = ({ title, value, icon, color = 'primary' }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box
          sx={{
            width: 50,
            height: 50,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${color === 'primary' ? '#667eea 0%, #764ba2 100%' : '#43e97b 0%, #38f9d7 100%'})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white'
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            {value}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" fontWeight="bold" gutterBottom>
          Waitlist Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Track interest and manage your pre-launch audience
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 3, mb: 4 }}>
        <StatCard 
          title="Total Signups" 
          value={stats.total} 
          icon={<People />} 
        />
        <StatCard 
          title="Today" 
          value={stats.today} 
          icon={<TrendingUp />} 
          color="success"
        />
        <StatCard 
          title="This Week" 
          value={stats.thisWeek} 
          icon={<Schedule />} 
          color="success"
        />
      </Box>

      {/* Export Button */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" fontWeight="600">
          Waitlist Entries
        </Typography>
        {waitlistData.length > 0 && (
          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={exportToCSV}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}
          >
            Export CSV
          </Button>
        )}
      </Box>

      {/* Waitlist Table */}
      {waitlistData.length === 0 ? (
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          No waitlist entries yet. Start promoting your waitlist to get signups!
        </Alert>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f8faff' }}>
                <TableCell fontWeight="600">Name</TableCell>
                <TableCell fontWeight="600">Email</TableCell>
                <TableCell fontWeight="600">Company</TableCell>
                <TableCell fontWeight="600">Date Joined</TableCell>
                <TableCell fontWeight="600">Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {waitlistData
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                .map((entry, index) => (
                <TableRow key={entry.id} sx={{ '&:hover': { backgroundColor: '#f8faff' } }}>
                  <TableCell>
                    {entry.name || (
                      <Typography color="text.secondary" fontStyle="italic">
                        Not provided
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>{entry.email}</TableCell>
                  <TableCell>
                    {entry.company || (
                      <Typography color="text.secondary" fontStyle="italic">
                        Not provided
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(entry.timestamp).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label="Waitlisted" 
                      color="primary" 
                      size="small"
                      sx={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white'
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default WaitlistDashboard;
