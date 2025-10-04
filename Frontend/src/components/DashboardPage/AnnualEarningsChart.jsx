import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, CircularProgress, useTheme, Select, MenuItem, 
  FormControl, InputLabel, Card, CardContent, Grow, Fade, Chip, LinearProgress 
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import BarChartIcon from '@mui/icons-material/BarChart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { getAnnualEarningsBreakdown } from './api';

const AnnualEarningsChart = ({ initialYear }) => {
  const theme = useTheme();
  const [year, setYear] = useState(initialYear || new Date().getFullYear());
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const availableYears = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getAnnualEarningsBreakdown(year);
        setData(result.monthlyStats || []);
      } catch (err) {
        console.error("Failed to load annual earnings:", err);
        setError(err.message || 'Failed to load data');
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [year]);

  const handleYearChange = (event) => {
    setYear(event.target.value);
  };
  return (
    <Card 
      elevation={6}
      sx={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 3,
        background: 'linear-gradient(145deg, #ffffff 0%, #fefbff 100%)',
        border: '1px solid rgba(139, 92, 246, 0.1)',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 20px 40px rgba(139, 92, 246, 0.15)',
          border: '1px solid rgba(139, 92, 246, 0.2)',
          '& .icon-container': {
            transform: 'scale(1.05)',
            background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
          }
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #8b5cf6 0%, #7c3aed 50%, #6d28d9 100%)',
          borderRadius: '3px 3px 0 0'
        }
      }}
    >
      {/* Enhanced Header */}
      <Box
        sx={{
          p: 3,
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(196, 181, 253, 0.02) 100%)',
          borderBottom: '1px solid rgba(139, 92, 246, 0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            className="icon-container"
            sx={{
              width: 48,
              height: 48,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              boxShadow: '0 8px 16px rgba(139, 92, 246, 0.3)'
            }}
          >
            <BarChartIcon sx={{ color: 'white', fontSize: 24 }} />
          </Box>
          <Box>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #6d28d9 0%, #8b5cf6 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 0.5
              }}
            >
              Annual Earnings Overview
            </Typography>
            <Typography 
              variant="subtitle2" 
              sx={{ 
                color: 'text.secondary',
                fontWeight: 'medium'
              }}
            >
              Monthly breakdown for {year}
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Chip
            icon={<TrendingUpIcon />}
            label="Analytics"
            size="small"
            sx={{
              background: 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)',
              color: '#6d28d9',
              fontWeight: 'medium',
              border: '1px solid rgba(139, 92, 246, 0.2)'
            }}
          />
          <FormControl 
            size="small" 
            sx={{ 
              minWidth: 120,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#8b5cf6'
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#7c3aed'
                }
              }
            }} 
          >
            <InputLabel id={`earnings-year-select-label-${year}`}>Year</InputLabel>
            <Select
              labelId={`earnings-year-select-label-${year}`}
              value={year}
              label="Year"
              onChange={handleYearChange}
            >
              {availableYears.map(y => (
                <MenuItem key={y} value={y}>{y}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Content */}
      <CardContent sx={{ p: 3 }}>
        {loading ? (
          <Fade in={loading}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, minHeight: 300, justifyContent: 'center' }}>
              <CircularProgress 
                size={60} 
                thickness={4}
                sx={{ 
                  color: '#8b5cf6',
                  '& .MuiCircularProgress-circle': {
                    strokeLinecap: 'round'
                  }
                }}
              />
              <Typography variant="body2" color="text.secondary">
                Loading earnings data...
              </Typography>
              <LinearProgress 
                sx={{ 
                  width: '60%', 
                  borderRadius: 2,
                  height: 6,
                  backgroundColor: 'rgba(139, 92, 246, 0.1)',
                  '& .MuiLinearProgress-bar': {
                    background: 'linear-gradient(90deg, #8b5cf6 0%, #7c3aed 100%)',
                    borderRadius: 2
                  }
                }} 
              />
            </Box>
          </Fade>
        ) : error ? (
          <Typography color="error" sx={{ textAlign: 'center', mt: 2, p: 4 }}>
            {error}
          </Typography>
        ) : data.length === 0 ? (
          <Typography sx={{ textAlign: 'center', mt: 2, p: 4, color: 'text.secondary' }}>
            No earnings data available for {year}.
          </Typography>
        ) : (
          <Grow in={!loading && !error && data.length > 0} timeout={800}>
            <Box sx={{ height: 350 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} opacity={0.6} />
                  <XAxis 
                    dataKey="monthName" 
                    stroke={theme.palette.text.secondary} 
                    tick={{ fontSize: 12, fontWeight: 'medium' }}
                    axisLine={{ stroke: theme.palette.divider }}
                  />
                  <YAxis 
                    stroke={theme.palette.text.secondary} 
                    tickFormatter={(value) => `€${value.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
                    tick={{ fontSize: 12, fontWeight: 'medium' }}
                    axisLine={{ stroke: theme.palette.divider }}
                  />
                  <Tooltip 
                    formatter={(value) => [`€${value.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' }).replace(/€/g, '').trim()}`, 'Earnings']}
                    contentStyle={{ 
                      backgroundColor: theme.palette.background.paper, 
                      border: `1px solid ${theme.palette.divider}`, 
                      borderRadius: '8px',
                      boxShadow: '0 8px 24px rgba(139, 92, 246, 0.15)'
                    }}
                    labelStyle={{ fontWeight: 'bold' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }}/>
                  <Bar 
                    dataKey="totalAmount" 
                    fill="url(#earningsGradient)" 
                    name="Earnings" 
                    radius={[6, 6, 0, 0]}
                  />
                  <defs>
                    <linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#7c3aed" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Grow>
        )}
      </CardContent>
    </Card>
  );
};

export default AnnualEarningsChart;
