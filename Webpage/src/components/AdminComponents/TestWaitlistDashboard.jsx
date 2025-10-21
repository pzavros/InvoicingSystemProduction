import { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';

const TestWaitlistDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching stats...');
        const response = await fetch('/api/webpage/waitlist/stats');
        
        if (response.ok) {
          const data = await response.json();
          console.log('Stats received:', data);
          setStats(data);
        } else {
          console.error('Failed to fetch stats:', response.status);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Test Dashboard
      </Typography>
      
      {stats ? (
        <Box>
          <Typography>Total Entries: {stats.totalEntries || 0}</Typography>
          <Typography>Today Entries: {stats.todayEntries || 0}</Typography>
          <Typography>Week Entries: {stats.weekEntries || 0}</Typography>
          <Typography>Month Entries: {stats.monthEntries || 0}</Typography>
          
          {stats.sourceBreakdown && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6">Source Breakdown:</Typography>
              {Object.entries(stats.sourceBreakdown).map(([source, count]) => (
                <Typography key={source}>{source}: {count}</Typography>
              ))}
            </Box>
          )}
        </Box>
      ) : (
        <Typography>No data available</Typography>
      )}
    </Box>
  );
};

export default TestWaitlistDashboard;
