// src/components/ReportPage/ReportFilters.jsx
import React from "react";
import {
  Grid,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Box,
  Chip
} from "@mui/material";
import {
  FilterList as FilterIcon,
  PlayArrow as RunIcon,
  CalendarToday as CalendarIcon,
  Assessment as StatusIcon
} from "@mui/icons-material";

const ReportFilters = ({ filters, onFiltersChange, onRunReport, loading }) => {
  const handleFilterChange = (field, value) => {
    onFiltersChange({
      ...filters,
      [field]: value
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      all: '#6366f1',
      paid: '#10b981',
      pending: '#f59e0b',
      overdue: '#ef4444',
      draft: '#6b7280'
    };
    return colors[status] || '#6366f1';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {/* Section Header */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)'
              }}
            >
              <FilterIcon sx={{ color: 'white', fontSize: 18 }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ 
                fontWeight: 'bold',
                color: '#000000',
              }}>
                Report Filters
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Define your report parameters
              </Typography>
            </Box>
          </Box>
        </Grid>

        {/* Filter Inputs */}
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            size="small"
            type="date"
            label="Start Date"
            value={filters.startDate}
            onChange={(e) => handleFilterChange('startDate', e.target.value)}
            InputLabelProps={{ shrink: true }}
            InputProps={{
              startAdornment: <CalendarIcon sx={{ mr: 1, fontSize: 18, color: '#6b7280' }} />
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                transition: 'all 0.2s',
                '&:hover': {
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#4f46e5',
                  }
                },
                '&.Mui-focused': {
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#4f46e5',
                    borderWidth: 2
                  }
                }
              }
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            size="small"
            type="date"
            label="End Date"
            value={filters.endDate}
            onChange={(e) => handleFilterChange('endDate', e.target.value)}
            InputLabelProps={{ shrink: true }}
            InputProps={{
              startAdornment: <CalendarIcon sx={{ mr: 1, fontSize: 18, color: '#6b7280' }} />
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                transition: 'all 0.2s',
                '&:hover': {
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#4f46e5',
                  }
                },
                '&.Mui-focused': {
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#4f46e5',
                    borderWidth: 2
                  }
                }
              }
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <FormControl 
            fullWidth 
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                transition: 'all 0.2s',
                '&:hover': {
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#4f46e5',
                  }
                },
                '&.Mui-focused': {
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#4f46e5',
                    borderWidth: 2
                  }
                }
              }
            }}
          >
            <InputLabel>Invoice Status</InputLabel>
            <Select
              value={filters.status}
              label="Invoice Status"
              onChange={(e) => handleFilterChange('status', e.target.value)}
              startAdornment={<StatusIcon sx={{ ml: 1, mr: 0.5, fontSize: 18, color: '#6b7280' }} />}
              renderValue={(value) => (
                <Chip
                  label={value.charAt(0).toUpperCase() + value.slice(1)}
                  size="small"
                  sx={{
                    backgroundColor: `${getStatusColor(value)}15`,
                    color: getStatusColor(value),
                    fontWeight: 'medium',
                    border: `1px solid ${getStatusColor(value)}30`
                  }}
                />
              )}
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="paid">Paid</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="overdue">Overdue</MenuItem>
              <MenuItem value="draft">Draft</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Button
            variant="contained"
            fullWidth
            startIcon={<RunIcon />}
            onClick={onRunReport}
            disabled={loading}
            sx={{
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              color: 'white',
              borderRadius: 2,
              py: 1.5,
              fontWeight: 'medium',
              textTransform: 'none',
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #4338ca 0%, #6d28d9 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 20px rgba(79, 70, 229, 0.4)',
              },
              '&:disabled': {
                background: 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)',
                color: 'white',
                opacity: 0.7
              },
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            {loading ? 'Running...' : 'Run Report'}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ReportFilters;