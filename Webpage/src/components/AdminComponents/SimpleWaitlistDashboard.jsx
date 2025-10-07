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
import { apiCall } from '../../utils/apiConfig.js';

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
      const data = await apiCall('/api/webpage/waitlist/stats');
      setStats({
        totalEntries: data.totalEntries || 0,
        todayEntries: data.todayEntries || 0,
        weekEntries: data.weekEntries || 0,
        monthEntries: data.monthEntries || 0,
        sourceBreakdown: data.sourceBreakdown || {}
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('Unable to connect to server');
    }
  };

  const fetchEntries = async () => {
    setEntriesLoading(true);
    try {
      const data = await apiCall('/api/webpage/waitlist?page=1&pageSize=50');
      // Backend returns array directly, not wrapped in object
      setEntries(Array.isArray(data) ? data : []);
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

  const StatCard = ({ title, value, icon, color = 'primary' }) => {
    const colorMap = {
      primary: { bg: '#667eea', bgSecondary: '#764ba2', shadow: 'rgba(102, 126, 234, 0.3)' },
      success: { bg: '#48bb78', bgSecondary: '#38a169', shadow: 'rgba(72, 187, 120, 0.3)' },
      warning: { bg: '#ed8936', bgSecondary: '#dd6b20', shadow: 'rgba(237, 137, 54, 0.3)' },
      info: { bg: '#4299e1', bgSecondary: '#3182ce', shadow: 'rgba(66, 153, 225, 0.3)' }
    };
    
    const colors = colorMap[color] || colorMap.primary;
    
    return (
      <Card 
        sx={{ 
          height: '100%',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.6) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: 3,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: `0 20px 40px ${colors.shadow}`,
            border: `1px solid ${colors.bg}40`
          }
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: 3,
                background: `linear-gradient(135deg, ${colors.bg} 0%, ${colors.bgSecondary} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                boxShadow: `0 8px 32px ${colors.shadow}`,
                '& svg': { fontSize: '1.75rem' }
              }}
            >
              {icon}
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography 
                variant="h3" 
                fontWeight="bold" 
                sx={{ 
                  color: '#2d3748',
                  mb: 0.5,
                  lineHeight: 1
                }}
              >
                {value?.toLocaleString() || 0}
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: '#718096',
                  fontWeight: 500
                }}
              >
                {title}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 4,
            borderRadius: 2,
            background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.1) 0%, rgba(211, 47, 47, 0.05) 100%)',
            border: '1px solid rgba(244, 67, 54, 0.2)'
          }}
        >
          {error}
        </Alert>
      )}

      <Grid container spacing={4} sx={{ mb: 6 }}>
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
            color="info"
          />
        </Grid>
      </Grid>

      <Grid container spacing={4}>
        {/* Source Breakdown Card */}
        {stats.sourceBreakdown && typeof stats.sourceBreakdown === 'object' && Object.keys(stats.sourceBreakdown).length > 0 && (
          <Grid item xs={12} lg={4}>
            <Card 
              sx={{ 
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.6) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: 3,
                height: 'fit-content'
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Typography 
                  variant="h5" 
                  fontWeight="bold" 
                  sx={{ 
                    mb: 3,
                    color: '#2d3748',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  <TrendingUp sx={{ color: '#667eea' }} />
                  Source Breakdown
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {Object.entries(stats.sourceBreakdown || {}).map(([source, count], index) => {
                    const colors = ['#667eea', '#48bb78', '#ed8936', '#4299e1', '#9f7aea'];
                    const color = colors[index % colors.length];
                    return (
                      <Box 
                        key={source} 
                        sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          p: 2,
                          borderRadius: 2,
                          background: `linear-gradient(135deg, ${color}10 0%, ${color}05 100%)`,
                          border: `1px solid ${color}20`
                        }}
                      >
                        <Typography fontWeight="500" sx={{ color: '#2d3748' }}>
                          {source}
                        </Typography>
                        <Chip 
                          label={count} 
                          size="small"
                          sx={{
                            background: color,
                            color: 'white',
                            fontWeight: 'bold'
                          }}
                        />
                      </Box>
                    );
                  })}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Recent Signups Table */}
        <Grid item xs={12} lg={stats.sourceBreakdown && Object.keys(stats.sourceBreakdown).length > 0 ? 8 : 12}>
          <Card 
            sx={{ 
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.6) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: 3
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Typography 
                variant="h5" 
                fontWeight="bold" 
                sx={{ 
                  mb: 3,
                  color: '#2d3748',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <People sx={{ color: '#667eea' }} />
                Recent Signups
              </Typography>
              
              {entriesLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                  <CircularProgress size={48} sx={{ color: '#667eea' }} />
                </Box>
              ) : entries.length > 0 ? (
                <Box sx={{ overflowX: 'auto' }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold', color: '#4a5568', borderBottom: '2px solid #e2e8f0' }}>Email</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: '#4a5568', borderBottom: '2px solid #e2e8f0' }}>Name</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: '#4a5568', borderBottom: '2px solid #e2e8f0' }}>Company</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: '#4a5568', borderBottom: '2px solid #e2e8f0' }}>Source</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: '#4a5568', borderBottom: '2px solid #e2e8f0' }}>Join Date</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {entries.map((entry, index) => (
                        <TableRow 
                          key={entry.id || index}
                          sx={{
                            '&:hover': {
                              backgroundColor: 'rgba(102, 126, 234, 0.04)',
                              transform: 'scale(1.001)'
                            },
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <TableCell sx={{ color: '#2d3748', fontWeight: '500' }}>{entry.email}</TableCell>
                          <TableCell sx={{ color: '#4a5568' }}>{entry.name || 'N/A'}</TableCell>
                          <TableCell sx={{ color: '#4a5568' }}>{entry.company || 'N/A'}</TableCell>
                          <TableCell>
                            <Chip 
                              label={entry.source || 'Direct'} 
                              size="small"
                              sx={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                fontWeight: 'bold',
                                '& .MuiChip-label': { fontSize: '0.75rem' }
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ color: '#718096', fontSize: '0.875rem' }}>
                            {formatDate(entry.joinedAt || entry.createdAt)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              ) : (
                <Box 
                  sx={{ 
                    textAlign: 'center', 
                    py: 8,
                    color: '#718096'
                  }}
                >
                  <Email sx={{ fontSize: 64, color: '#cbd5e0', mb: 2 }} />
                  <Typography variant="h6" sx={{ color: '#4a5568', mb: 1 }}>
                    No signups yet
                  </Typography>
                  <Typography variant="body2">
                    Waitlist entries will appear here once users start signing up
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SimpleWaitlistDashboard;
