import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, CircularProgress, Select, MenuItem, 
  FormControl
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import BarChartIcon from '@mui/icons-material/BarChart';
import { getAnnualEarningsBreakdown } from './api';

const AnnualEarningsChart = ({ initialYear }) => {
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
    <Paper
      sx={{
        p: 3,
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
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
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
            <BarChartIcon sx={{ fontSize: 18, color: '#8b5cf6' }} />
          </Box>
          <Box>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 600,
                fontSize: '1.125rem',
                color: 'rgba(15, 23, 42, 0.95)',
                letterSpacing: '-0.01em',
                mb: 0.25
              }}
            >
              Annual Earnings
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'rgba(15, 23, 42, 0.5)',
                fontSize: '0.875rem',
                fontWeight: 400
              }}
            >
              Monthly breakdown for {year}
            </Typography>
          </Box>
        </Box>
        
        <FormControl size="small" sx={{ minWidth: 100 }}>
          <Select
            value={year}
            onChange={handleYearChange}
            displayEmpty
            sx={{
              borderRadius: '8px',
              backgroundColor: 'rgba(15, 23, 42, 0.04)',
              border: '1px solid rgba(15, 23, 42, 0.08)',
              fontSize: '0.9375rem',
              fontWeight: 400,
              transition: 'all 0.15s ease',
              '& fieldset': {
                border: 'none'
              },
              '&:hover': {
                backgroundColor: 'rgba(15, 23, 42, 0.06)',
                borderColor: 'rgba(15, 23, 42, 0.12)',
              },
              '&.Mui-focused': {
                backgroundColor: 'white',
                borderColor: '#3b82f6',
                boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
              },
              '& .MuiSelect-select': {
                padding: '8.5px 12px'
              },
              '& .MuiSelect-icon': {
                color: 'rgba(15, 23, 42, 0.4)',
                right: 8
              }
            }}
            MenuProps={{
              PaperProps: {
                sx: {
                  borderRadius: '10px',
                  boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)',
                  border: '1px solid rgba(15, 23, 42, 0.08)',
                  mt: 0.5,
                  overflow: 'hidden',
                  '& .MuiList-root': {
                    py: 0.5
                  },
                  '& .MuiMenuItem-root': {
                    fontSize: '0.9375rem',
                    padding: '10px 12px',
                    margin: '0 4px',
                    borderRadius: '6px',
                    transition: 'all 0.15s ease',
                    color: 'rgba(15, 23, 42, 0.9)',
                    '&:hover': {
                      backgroundColor: 'rgba(15, 23, 42, 0.06)'
                    },
                    '&.Mui-selected': {
                      backgroundColor: 'rgba(59, 130, 246, 0.08)',
                      color: '#3b82f6',
                      fontWeight: 500,
                      '&:hover': {
                        backgroundColor: 'rgba(59, 130, 246, 0.12)'
                      }
                    }
                  }
                }
              }
            }}
          >
            {availableYears.map(y => (
              <MenuItem key={y} value={y}>{y}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Content */}
      <Box>
        {loading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 350 }}>
            <CircularProgress size={32} sx={{ color: '#8b5cf6' }} />
          </Box>
        ) : error ? (
          <Typography color="error" sx={{ textAlign: 'center', mt: 2, p: 4 }}>
            {error}
          </Typography>
        ) : data.length === 0 ? (
          <Typography sx={{ textAlign: 'center', mt: 2, p: 4, color: 'rgba(15, 23, 42, 0.5)' }}>
            No earnings data available for {year}.
          </Typography>
        ) : (
          <Box sx={{ height: 350, mt: 2 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(15, 23, 42, 0.08)" opacity={0.6} />
                <XAxis 
                  dataKey="monthName" 
                  stroke="rgba(15, 23, 42, 0.5)" 
                  tick={{ fontSize: 12, fontWeight: 500, fill: 'rgba(15, 23, 42, 0.7)' }}
                  axisLine={{ stroke: 'rgba(15, 23, 42, 0.12)' }}
                />
                <YAxis 
                  stroke="rgba(15, 23, 42, 0.5)" 
                  tickFormatter={(value) => `€${value.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
                  tick={{ fontSize: 12, fontWeight: 500, fill: 'rgba(15, 23, 42, 0.7)' }}
                  axisLine={{ stroke: 'rgba(15, 23, 42, 0.12)' }}
                />
                <Tooltip 
                  formatter={(value) => [`€${value.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' }).replace(/€/g, '').trim()}`, 'Earnings']}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid rgba(15, 23, 42, 0.08)', 
                    borderRadius: '8px',
                    boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)'
                  }}
                  labelStyle={{ fontWeight: 600 }}
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
        )}
      </Box>
    </Paper>
  );
};

export default AnnualEarningsChart;
