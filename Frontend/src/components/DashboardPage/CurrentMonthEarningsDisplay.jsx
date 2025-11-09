// components/DashboardPage/CurrentMonthEarningsDisplay.jsx
import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  CircularProgress
} from '@mui/material';
import { TrendingUp as TrendingUpIcon } from '@mui/icons-material';
import { getDashboardStatsForMonthYear } from './api';


const monthNames = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

const CurrentMonthEarningsDisplay = ({ month, year }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const data = await getDashboardStatsForMonthYear(month, year);
        if (isMounted) {
          setData(data);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load monthly earnings');
          setLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [month, year]);

  if (loading) {
    return (
      <Paper
        sx={{
          p: 3,
          height: '100%',
          borderRadius: '12px',
          border: '1px solid rgba(15, 23, 42, 0.08)',
          backgroundColor: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <CircularProgress size={32} sx={{ color: '#8b5cf6' }} />
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper
        sx={{
          p: 3,
          height: '100%',
          borderRadius: '12px',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          backgroundColor: 'rgba(254, 226, 226, 0.3)'
        }}
      >
        <Typography variant="body2" color="error" sx={{ fontSize: '0.9375rem' }}>
          {error}
        </Typography>
      </Paper>
    );
  }

  const monthLabel = monthNames[month - 1];
  const totalEarnings = data?.totalEarningsSelectedMonthYear ?? 0;
  const totalTax = data?.totalTaxSelectedMonthYear ?? 0;
  const totalRevenue = data?.totalRevenueSelectedMonthYear ?? 0;
  const currencySymbol = data?.currencySymbol || '$';
  const percentage = data?.percentageChangeEarnings ?? 0;

  return (
    <Paper
      sx={{
        p: 3,
        height: '100%',
        borderRadius: '12px',
        border: '1px solid rgba(15, 23, 42, 0.08)',
        backgroundColor: 'white',
        transition: 'all 0.15s ease',
        '&:hover': {
          borderColor: 'rgba(139, 92, 246, 0.2)',
          boxShadow: '0 4px 12px rgba(139, 92, 246, 0.08)'
        }
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
        <Typography
          variant="body2"
          sx={{
            color: 'rgba(15, 23, 42, 0.5)',
            fontSize: '0.9375rem',
            fontWeight: 500,
            letterSpacing: '-0.01em'
          }}
        >
          {monthLabel} {year} Earnings
        </Typography>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: '8px',
            backgroundColor: 'rgba(139, 92, 246, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <TrendingUpIcon sx={{ fontSize: 18, color: '#8b5cf6' }} />
        </Box>
      </Box>

      {/* Amount */}
      <Typography
        variant="h3"
        sx={{
          fontWeight: 700,
          fontSize: '2.25rem',
          color: 'rgba(15, 23, 42, 0.95)',
          letterSpacing: '-0.02em',
          lineHeight: 1.1,
          mb: 1
        }}
      >
        {currencySymbol}{totalEarnings.toFixed(2)}
      </Typography>

      {/* Tax and Revenue Breakdown */}
      <Box sx={{ 
        display: 'flex', 
        gap: 2, 
        mb: 1.5,
        flexWrap: 'wrap'
      }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          gap: 0.25
        }}>
          <Typography
            variant="caption"
            sx={{
              color: 'rgba(15, 23, 42, 0.4)',
              fontSize: '0.75rem',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}
          >
            Revenue (excl. tax)
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: 'rgba(15, 23, 42, 0.7)',
              fontSize: '0.9375rem',
              fontWeight: 600
            }}
          >
            {currencySymbol}{totalRevenue.toFixed(2)}
          </Typography>
        </Box>

        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          gap: 0.25
        }}>
          <Typography
            variant="caption"
            sx={{
              color: 'rgba(15, 23, 42, 0.4)',
              fontSize: '0.75rem',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}
          >
            Tax Collected
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: 'rgba(15, 23, 42, 0.7)',
              fontSize: '0.9375rem',
              fontWeight: 600
            }}
          >
            {currencySymbol}{totalTax.toFixed(2)}
          </Typography>
        </Box>
      </Box>

      {/* Change Indicator */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.5,
            px: 1.25,
            py: 0.5,
            borderRadius: '6px',
            backgroundColor: percentage >= 0 
              ? 'rgba(34, 197, 94, 0.08)' 
              : 'rgba(239, 68, 68, 0.08)'
          }}
        >
          <Typography
            variant="body2"
            sx={{
              fontSize: '0.875rem',
              fontWeight: 600,
              color: percentage >= 0 ? '#16a34a' : '#dc2626',
              letterSpacing: '-0.01em'
            }}
          >
            {percentage >= 0 ? '+' : ''}{percentage.toFixed(1)}%
          </Typography>
        </Box>
        <Typography
          variant="body2"
          sx={{
            color: 'rgba(15, 23, 42, 0.5)',
            fontSize: '0.875rem',
            fontWeight: 400
          }}
        >
          vs last month
        </Typography>
      </Box>
    </Paper>
  );
};

export default CurrentMonthEarningsDisplay;