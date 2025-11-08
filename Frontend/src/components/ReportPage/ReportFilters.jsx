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
      all: '#8b5cf6',
      paid: '#34c759',
      pending: '#ff9500',
      overdue: '#ff3b30',
      draft: '#8e8e93'
    };
    return colors[status] || '#8b5cf6';
  };

  return (
    <Box sx={{ 
      p: { xs: 2, md: 2.5 },
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif'
    }}>
      <Grid container spacing={2} alignItems="flex-end">
        {/* Filter Inputs */}
        <Grid item xs={12} sm={6} md={2.5}>
          <TextField
            fullWidth
            size="small"
            type="date"
            label="Start Date"
            value={filters.startDate}
            onChange={(e) => handleFilterChange('startDate', e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{
              '& .MuiInputLabel-root': {
                color: '#86868b',
                fontWeight: 500,
                fontSize: '0.875rem',
                letterSpacing: '-0.01em',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                '&.Mui-focused': {
                  color: '#86868b'
                }
              },
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'white',
                borderRadius: '10px',
                fontSize: '0.875rem',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                letterSpacing: '-0.01em',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#d1d1d6',
                  borderWidth: '1px'
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#86868b'
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#86868b',
                  borderWidth: '2px'
                },
                '& .MuiInputBase-input': {
                  padding: '8px 12px',
                  fontWeight: 400
                }
              }
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={2.5}>
          <TextField
            fullWidth
            size="small"
            type="date"
            label="End Date"
            value={filters.endDate}
            onChange={(e) => handleFilterChange('endDate', e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{
              '& .MuiInputLabel-root': {
                color: '#86868b',
                fontWeight: 500,
                fontSize: '0.875rem',
                letterSpacing: '-0.01em',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                '&.Mui-focused': {
                  color: '#86868b'
                }
              },
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'white',
                borderRadius: '10px',
                fontSize: '0.875rem',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                letterSpacing: '-0.01em',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#d1d1d6',
                  borderWidth: '1px'
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#86868b'
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#86868b',
                  borderWidth: '2px'
                },
                '& .MuiInputBase-input': {
                  padding: '8px 12px',
                  fontWeight: 400
                }
              }
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={5}>
          <FormControl 
            fullWidth 
            size="small"
            sx={{
              '& .MuiInputLabel-root': {
                color: '#86868b',
                fontWeight: 500,
                fontSize: '0.875rem',
                letterSpacing: '-0.01em',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                '&.Mui-focused': {
                  color: '#86868b'
                }
              },
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'white',
                borderRadius: '10px',
                fontSize: '0.875rem',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                letterSpacing: '-0.01em',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#d1d1d6',
                  borderWidth: '1px'
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#86868b'
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#86868b',
                  borderWidth: '2px'
                },
                '& .MuiSelect-select': {
                  padding: '8px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  fontWeight: 400
                }
              }
            }}
          >
            <InputLabel>Status</InputLabel>
            <Select
              value={filters.status}
              label="Status"
              onChange={(e) => handleFilterChange('status', e.target.value)}
              renderValue={(value) => (
                <Chip
                  label={value.charAt(0).toUpperCase() + value.slice(1)}
                  size="small"
                  sx={{
                    backgroundColor: `${getStatusColor(value)}15`,
                    color: getStatusColor(value),
                    fontWeight: 500,
                    fontSize: '0.875rem',
                    letterSpacing: '-0.01em',
                    border: `1px solid ${getStatusColor(value)}40`,
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif'
                  }}
                />
              )}
              MenuProps={{
                PaperProps: {
                  sx: {
                    borderRadius: '16px',
                    mt: 1.5,
                    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.12), 0 0 0 0.5px rgba(0, 0, 0, 0.04)',
                    border: 'none',
                    '& .MuiList-root': {
                      py: 1.5
                    }
                  }
                }
              }}
            >
              <MenuItem 
                value="all"
                sx={{
                  fontSize: '0.9375rem',
                  fontWeight: 400,
                  color: '#1d1d1f',
                  letterSpacing: '-0.01em',
                  py: 1.5,
                  px: 2.5,
                  mx: 1.5,
                  borderRadius: '10px',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)'
                  },
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    color: '#8b5cf6',
                    fontWeight: 500,
                    '&:hover': {
                      backgroundColor: 'rgba(139, 92, 246, 0.15)'
                    }
                  }
                }}
              >
                All Statuses
              </MenuItem>
              <MenuItem 
                value="paid"
                sx={{
                  fontSize: '0.9375rem',
                  fontWeight: 400,
                  color: '#1d1d1f',
                  letterSpacing: '-0.01em',
                  py: 1.5,
                  px: 2.5,
                  mx: 1.5,
                  borderRadius: '10px',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)'
                  },
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    color: '#8b5cf6',
                    fontWeight: 500,
                    '&:hover': {
                      backgroundColor: 'rgba(139, 92, 246, 0.15)'
                    }
                  }
                }}
              >
                Paid
              </MenuItem>
              <MenuItem 
                value="pending"
                sx={{
                  fontSize: '0.9375rem',
                  fontWeight: 400,
                  color: '#1d1d1f',
                  letterSpacing: '-0.01em',
                  py: 1.5,
                  px: 2.5,
                  mx: 1.5,
                  borderRadius: '10px',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)'
                  },
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    color: '#8b5cf6',
                    fontWeight: 500,
                    '&:hover': {
                      backgroundColor: 'rgba(139, 92, 246, 0.15)'
                    }
                  }
                }}
              >
                Pending
              </MenuItem>
              <MenuItem 
                value="overdue"
                sx={{
                  fontSize: '0.9375rem',
                  fontWeight: 400,
                  color: '#1d1d1f',
                  letterSpacing: '-0.01em',
                  py: 1.5,
                  px: 2.5,
                  mx: 1.5,
                  borderRadius: '10px',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)'
                  },
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    color: '#8b5cf6',
                    fontWeight: 500,
                    '&:hover': {
                      backgroundColor: 'rgba(139, 92, 246, 0.15)'
                    }
                  }
                }}
              >
                Overdue
              </MenuItem>
              <MenuItem 
                value="draft"
                sx={{
                  fontSize: '0.9375rem',
                  fontWeight: 400,
                  color: '#1d1d1f',
                  letterSpacing: '-0.01em',
                  py: 1.5,
                  px: 2.5,
                  mx: 1.5,
                  borderRadius: '10px',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)'
                  },
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    color: '#8b5cf6',
                    fontWeight: 500,
                    '&:hover': {
                      backgroundColor: 'rgba(139, 92, 246, 0.15)'
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
            startIcon={<RunIcon sx={{ fontSize: 18 }} />}
            onClick={onRunReport}
            disabled={loading}
            sx={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              color: 'white',
              borderRadius: '10px',
              px: 2.5,
              py: 1,
              height: '40px',
              fontWeight: 500,
              textTransform: 'none',
              fontSize: '0.875rem',
              letterSpacing: '-0.01em',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
              boxShadow: 'none',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                boxShadow: 'none',
                transform: 'translateY(-1px)'
              },
              '&:active': {
                transform: 'scale(0.98)'
              },
              '&:disabled': {
                background: 'rgba(0, 0, 0, 0.06)',
                color: 'rgba(0, 0, 0, 0.26)',
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