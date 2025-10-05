import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Alert,
  CircularProgress,
  Grid,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip
} from '@mui/material';
import {
  People,
  TrendingUp,
  Email,
  CalendarToday
} from '@mui/icons-material';

const SimpleWaitlistDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalEntries: 0,
    todayEntries: 0,
    weekEntries: 0,
    monthEntries: 0,
    sourceBreakdown: {}
  });
  const [entries, setEntries] = useState([]);
  const [entriesLoading, setEntriesLoading] = useState(false);

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/webpage/waitlist/stats');
      if (response.ok) {
        const data = await response.json();
        setStats({
          totalEntries: data.totalEntries || 0,
          todayEntries: data.todayEntries || 0,
          weekEntries: data.weekEntries || 0,
          monthEntries: data.monthEntries || 0,
          sourceBreakdown: data.sourceBreakdown || {}
        });
      } else {
        setError('Failed to load statistics');
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('Unable to connect to server');
    }
  };

  const fetchEntries = async () => {
    setEntriesLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/webpage/waitlist?page=1&pageSize=50');
      if (response.ok) {
        const data = await response.json();
        // Backend returns array directly, not wrapped in object
        setEntries(Array.isArray(data) ? data : []);
      } else {
        console.error('Failed to load entries');
      }
    } catch (err) {
      console.error('Error fetching entries:', err);
    } finally {
      setEntriesLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchStats(), fetchEntries()]);
      setLoading(false);
    };

    loadData();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const StatCard = ({ title, value, icon, color = 'primary' }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${color === 'primary' ? '#667eea 0%, #764ba2' : color === 'success' ? '#4caf50 0%, #2e7d32' : '#ff9800 0%, #f57c00'} 100%)`,
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
            <Typography color="text.secondary">
              {title}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h3" fontWeight="bold" sx={{ mb: 4 }}>
        Waitlist Dashboard
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Signups"
            value={stats.totalEntries || 0}
            icon={<People />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Today"
            value={stats.todayEntries || 0}
            icon={<TrendingUp />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="This Week"
            value={stats.weekEntries || 0}
            icon={<CalendarToday />}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="This Month"
            value={stats.monthEntries || 0}
            icon={<Email />}
            color="primary"
          />
        </Grid>
      </Grid>

      {stats.sourceBreakdown && typeof stats.sourceBreakdown === 'object' && Object.keys(stats.sourceBreakdown).length > 0 && (
        <Card sx={{ mt: 4 }}>
          <CardContent>
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
              Source Breakdown
            </Typography>
            <Box>
              {Object.entries(stats.sourceBreakdown || {}).map(([source, count]) => (
                <Typography key={source}>
                  {source}: {count}
                </Typography>
              ))}
            </Box>
          </CardContent>
        </Card>
      )}

      <Card sx={{ mt: 4 }}>
        <CardContent>
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
            Recent Signups
          </Typography>
          {entriesLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : entries.length > 0 ? (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Email</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Company</TableCell>
                  <TableCell>Source</TableCell>
                  <TableCell>Join Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {entries.map((entry, index) => (
                  <TableRow key={entry.id || index}>
                    <TableCell>{entry.email}</TableCell>
                    <TableCell>{entry.name || 'N/A'}</TableCell>
                    <TableCell>{entry.company || 'N/A'}</TableCell>
                    <TableCell>
                      <Chip 
                        label={entry.source || 'Direct'} 
                        size="small" 
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{formatDate(entry.joinedAt || entry.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Typography color="text.secondary">
              No signups yet
            </Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default SimpleWaitlistDashboard;
