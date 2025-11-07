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
            <Box>
              <Typography variant="h6" sx={{ 
                fontWeight: 700,
                color: 'rgba(15, 23, 42, 0.95)',
                letterSpacing: '-0.02em'
              }}>
                Report Filters
              </Typography>
              <Typography variant="caption" sx={{ 
                color: 'rgba(15, 23, 42, 0.55)',
                fontSize: '0.875rem',
                fontWeight: 500
              }}>
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
              startAdornment: <CalendarIcon sx={{ mr: 1, fontSize: 18, color: 'rgba(15, 23, 42, 0.55)' }} />
            }}
            sx={{
              '& .MuiInputLabel-root': {
                color: 'rgba(15, 23, 42, 0.75)',
                fontWeight: 600,
                fontSize: '0.875rem',
                '&.Mui-focused': {
                  color: 'rgba(15, 23, 42, 0.85)'
                }
              },
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'white',
                borderRadius: '12px',
                fontSize: '0.875rem',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(15, 23, 42, 0.08)',
                  borderWidth: '1px'
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(15, 23, 42, 0.15)'
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(15, 23, 42, 0.25)',
                  borderWidth: '1.5px'
                },
                '& .MuiInputBase-input': {
                  padding: '8px 12px'
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
              startAdornment: <CalendarIcon sx={{ mr: 1, fontSize: 18, color: 'rgba(15, 23, 42, 0.55)' }} />
            }}
            sx={{
              '& .MuiInputLabel-root': {
                color: 'rgba(15, 23, 42, 0.75)',
                fontWeight: 600,
                fontSize: '0.875rem',
                '&.Mui-focused': {
                  color: 'rgba(15, 23, 42, 0.85)'
                }
              },
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'white',
                borderRadius: '12px',
                fontSize: '0.875rem',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(15, 23, 42, 0.08)',
                  borderWidth: '1px'
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(15, 23, 42, 0.15)'
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(15, 23, 42, 0.25)',
                  borderWidth: '1.5px'
                },
                '& .MuiInputBase-input': {
                  padding: '8px 12px'
                }
              }
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <FormControl 
            fullWidth 
            size="small"
            sx={{
              '& .MuiInputLabel-root': {
                color: 'rgba(15, 23, 42, 0.75)',
                fontWeight: 600,
                fontSize: '0.875rem',
                '&.Mui-focused': {
                  color: 'rgba(15, 23, 42, 0.85)'
                }
              },
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'white',
                borderRadius: '12px',
                fontSize: '0.875rem',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(15, 23, 42, 0.08)',
                  borderWidth: '1px'
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(15, 23, 42, 0.15)'
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(15, 23, 42, 0.25)',
                  borderWidth: '1.5px'
                },
                '& .MuiSelect-select': {
                  padding: '8px 12px',
                  display: 'flex',
                  alignItems: 'center'
                }
              }
            }}
          >
            <InputLabel>Invoice Status</InputLabel>
            <Select
              value={filters.status}
              label="Invoice Status"
              onChange={(e) => handleFilterChange('status', e.target.value)}
              startAdornment={<StatusIcon sx={{ ml: 1, mr: 0.5, fontSize: 18, color: 'rgba(15, 23, 42, 0.55)' }} />}
              renderValue={(value) => (
                <Chip
                  label={value.charAt(0).toUpperCase() + value.slice(1)}
                  size="small"
                  sx={{
                    backgroundColor: `${getStatusColor(value)}15`,
                    color: getStatusColor(value),
                    fontWeight: 600,
                    fontSize: '0.8125rem',
                    border: `1px solid ${getStatusColor(value)}30`
                  }}
                />
              )}
              MenuProps={{
                PaperProps: {
                  sx: {
                    borderRadius: '12px',
                    mt: 1,
                    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
                    border: '1px solid rgba(15, 23, 42, 0.08)',
                    '& .MuiList-root': {
                      py: 1
                    }
                  }
                }
              }}
            >
              <MenuItem 
                value="all"
                sx={{
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: 'rgba(15, 23, 42, 0.85)',
                  py: 1.25,
                  px: 2,
                  mx: 1,
                  borderRadius: '8px',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(15, 23, 42, 0.04)'
                  },
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(139, 92, 246, 0.08)',
                    color: '#8b5cf6',
                    fontWeight: 600,
                    '&:hover': {
                      backgroundColor: 'rgba(139, 92, 246, 0.12)'
                    }
                  }
                }}
              >
                All Statuses
              </MenuItem>
              <MenuItem 
                value="paid"
                sx={{
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: 'rgba(15, 23, 42, 0.85)',
                  py: 1.25,
                  px: 2,
                  mx: 1,
                  borderRadius: '8px',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(15, 23, 42, 0.04)'
                  },
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(139, 92, 246, 0.08)',
                    color: '#8b5cf6',
                    fontWeight: 600,
                    '&:hover': {
                      backgroundColor: 'rgba(139, 92, 246, 0.12)'
                    }
                  }
                }}
              >
                Paid
              </MenuItem>
              <MenuItem 
                value="pending"
                sx={{
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: 'rgba(15, 23, 42, 0.85)',
                  py: 1.25,
                  px: 2,
                  mx: 1,
                  borderRadius: '8px',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(15, 23, 42, 0.04)'
                  },
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(139, 92, 246, 0.08)',
                    color: '#8b5cf6',
                    fontWeight: 600,
                    '&:hover': {
                      backgroundColor: 'rgba(139, 92, 246, 0.12)'
                    }
                  }
                }}
              >
                Pending
              </MenuItem>
              <MenuItem 
                value="overdue"
                sx={{
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: 'rgba(15, 23, 42, 0.85)',
                  py: 1.25,
                  px: 2,
                  mx: 1,
                  borderRadius: '8px',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(15, 23, 42, 0.04)'
                  },
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(139, 92, 246, 0.08)',
                    color: '#8b5cf6',
                    fontWeight: 600,
                    '&:hover': {
                      backgroundColor: 'rgba(139, 92, 246, 0.12)'
                    }
                  }
                }}
              >
                Overdue
              </MenuItem>
              <MenuItem 
                value="draft"
                sx={{
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: 'rgba(15, 23, 42, 0.85)',
                  py: 1.25,
                  px: 2,
                  mx: 1,
                  borderRadius: '8px',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(15, 23, 42, 0.04)'
                  },
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(139, 92, 246, 0.08)',
                    color: '#8b5cf6',
                    fontWeight: 600,
                    '&:hover': {
                      backgroundColor: 'rgba(139, 92, 246, 0.12)'
                    }
                  }
                }}
              >
                Draft
              </MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Button
            variant="contained"
            fullWidth
            startIcon={<RunIcon />}
            onClick={onRunReport}
            disabled={loading}
            sx={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
              color: 'white',
              borderRadius: '10px',
              px: 3,
              py: 1,
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '0.9375rem',
              boxShadow: 'none',
              transition: 'all 0.2s ease',
              '&:hover': {
                background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
              },
              '&:disabled': {
                background: 'rgba(15, 23, 42, 0.12)',
                color: 'rgba(15, 23, 42, 0.4)',
              }
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