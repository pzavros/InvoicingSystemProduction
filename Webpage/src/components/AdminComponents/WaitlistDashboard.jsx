import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Alert,
  CircularProgress,
  Grid,
  Paper
} from '@mui/material';
import {
  People,
  TrendingUp,
  Email,
  CalendarToday,
  Download
} from '@mui/icons-material';
import Column from '../ReusableComponents/Column.jsx';
import Row from '../ReusableComponents/Row.jsx';
import Text from '../ReusableComponents/Text.jsx';
import Button from '../ReusableComponents/Button.jsx';

const WaitlistDashboard = () => {
  console.log('WaitlistDashboard component loading...');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalEntries: 0,
    todayEntries: 0,
    weekEntries: 0,
    monthEntries: 0,
    notifiedCount: 0,
    activeCount: 0,
    sourceBreakdown: {},
    dailySignups: {}
  });
  const [entries, setEntries] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/webpage/waitlist/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        setError('Failed to load statistics');
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('Unable to connect to server');
    }
  };

  const fetchEntries = async (pageNum = 1) => {
    try {
      const response = await fetch(`http://localhost:5000/api/webpage/waitlist?page=${pageNum}&pageSize=50`);
      if (response.ok) {
        const data = await response.json();
        setEntries(data.entries || []);
        setTotalPages(data.totalPages || 1);
      } else {
        setError('Failed to load waitlist entries');
      }
    } catch (err) {
      console.error('Error fetching entries:', err);
      setError('Unable to connect to server');
    }
  };

  const exportCsv = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/webpage/waitlist/export');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `waitlist-export-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (err) {
      console.error('Error exporting CSV:', err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchStats(), fetchEntries(1)]);
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
        <Row gap={2} sx={{ alignItems: 'center' }}>
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
          <Column>
            <Typography variant="h4" fontWeight="bold">
              {value}
            </Typography>
            <Typography color="text.secondary">
              {title}
            </Typography>
          </Column>
        </Row>
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

  try {
    console.log('Rendering WaitlistDashboard with stats:', stats);
    return (
    <Box sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
      <Row gap={2} sx={{ alignItems: 'center', mb: 4 }}>
        <Typography variant="h3" fontWeight="bold">
          Waitlist Dashboard
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Download />}
          onClick={exportCsv}
        >
          Export CSV
        </Button>
      </Row>

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

      <Card>
        <CardContent>
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
            Recent Signups
          </Typography>

          {entries.length === 0 ? (
            <Alert severity="info">
              No waitlist entries yet. The waitlist is ready to collect signups!
            </Alert>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Email</strong></TableCell>
                  <TableCell><strong>Name</strong></TableCell>
                  <TableCell><strong>Company</strong></TableCell>
                  <TableCell><strong>Source</strong></TableCell>
                  <TableCell><strong>Joined</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{entry.email}</TableCell>
                    <TableCell>{entry.name || '-'}</TableCell>
                    <TableCell>{entry.company || '-'}</TableCell>
                    <TableCell>
                      <Chip
                        label={entry.source || 'website'}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{formatDate(entry.joinedAt)}</TableCell>
                    <TableCell>
                      <Chip
                        label={entry.isNotified ? 'Notified' : 'Active'}
                        size="small"
                        color={entry.isNotified ? 'success' : 'primary'}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {totalPages > 1 && (
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 1 }}>
              {Array.from({ length: totalPages }, (_, i) => (
                <Button
                  key={i + 1}
                  variant={page === i + 1 ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => {
                    setPage(i + 1);
                    fetchEntries(i + 1);
                  }}
                >
                  {i + 1}
                </Button>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>

      {stats.sourceBreakdown && Object.keys(stats.sourceBreakdown).length > 0 && (
        <Card sx={{ mt: 4 }}>
          <CardContent>
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
              Source Breakdown
            </Typography>
            <Grid container spacing={2}>
              {Object.entries(stats.sourceBreakdown).map(([source, count]) => (
                <Grid item key={source}>
                  <Chip
                    label={`${source}: ${count}`}
                    color="primary"
                    variant="outlined"
                  />
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}
    </Box>
  );
  } catch (renderError) {
    console.error('Error rendering WaitlistDashboard:', renderError);
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">
          Error loading dashboard: {renderError.message}
        </Alert>
      </Box>
    );
  }
};

export default WaitlistDashboard;
