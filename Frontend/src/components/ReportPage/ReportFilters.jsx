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
  Chip,
  OutlinedInput,
  Checkbox,
  ListItemText
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
      paid: '#34c759',
      unpaid: '#ff9500',
      overdue: '#ff3b30',
      draft: '#8e8e93',
      deleted: '#ff3b30'
    };
    return colors[status] || '#8b5cf6';
  };

  const getStatusLabel = (status) => {
    const labels = {
      paid: 'Paid',
      unpaid: 'Unpaid',
      overdue: 'Overdue',
      draft: 'Draft',
      deleted: 'Deleted'
    };
    return labels[status] || status;
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

        <Grid item xs={12} sm={12} md={5}>
          <FormControl 
            fullWidth 
            size="small"
            sx={{
              '& .MuiInputLabel-root': {
                color: '#86868b',
                fontWeight: 400,
                fontSize: '0.8125rem',
                letterSpacing: '-0.01em',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                transform: 'translate(12px, 7px) scale(1)',
                '&.MuiInputLabel-shrink': {
                  transform: 'translate(12px, -9px) scale(0.75)',
                  color: '#86868b'
                },
                '&.Mui-focused': {
                  color: '#86868b'
                }
              },
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'white',
                borderRadius: '8px',
                fontSize: '0.8125rem',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                letterSpacing: '-0.01em',
                minHeight: '36px',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(0, 0, 0, 0.1)',
                  borderWidth: '0.5px',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(0, 0, 0, 0.2)',
                  borderWidth: '0.5px'
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(0, 122, 255, 0.5)',
                  borderWidth: '1px'
                },
                '& .MuiSelect-select': {
                  padding: '6px 12px',
                  paddingRight: '32px !important', // Add space for dropdown arrow
                  display: 'flex',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '4px',
                  minHeight: '22px',
                  fontWeight: 400
                }
              }
            }}
          >
            <InputLabel>Status</InputLabel>
            <Select
              multiple
              value={filters.statuses || []}
              onChange={(e) => handleFilterChange('statuses', e.target.value)}
              input={<OutlinedInput label="Status" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.length === 0 && (
                    <Typography variant="body2" sx={{ 
                      color: '#86868b',
                      fontSize: '0.8125rem',
                      fontWeight: 400
                    }}>
                      Select status...
                    </Typography>
                  )}
                  {selected.map((value) => (
                    <Chip
                      key={value}
                      label={getStatusLabel(value)}
                      size="small"
                      sx={{
                        backgroundColor: `${getStatusColor(value)}15`,
                        color: getStatusColor(value),
                        fontWeight: 500,
                        fontSize: '0.75rem',
                        letterSpacing: '-0.01em',
                        border: `0.5px solid ${getStatusColor(value)}30`,
                        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                        height: '20px',
                        borderRadius: '6px',
                        '& .MuiChip-label': {
                          padding: '0 6px'
                        }
                      }}
                    />
                  ))}
                </Box>
              )}
              MenuProps={{
                PaperProps: {
                  sx: {
                    borderRadius: '12px',
                    mt: 0.5,
                    maxHeight: 280,
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1), 0 0 0 0.5px rgba(0, 0, 0, 0.04)',
                    border: 'none',
                    overflow: 'hidden',
                    '& .MuiList-root': {
                      py: 0.5
                    }
                  }
                }
              }}
            >
              <MenuItem 
                value="paid"
                sx={{
                  fontSize: '0.8125rem',
                  fontWeight: 400,
                  color: '#1d1d1f',
                  letterSpacing: '-0.01em',
                  py: 0.75,
                  px: 1.5,
                  mx: 0.5,
                  minHeight: '32px',
                  borderRadius: '6px',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                  transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    backgroundColor: 'rgba(52, 199, 89, 0.08)'
                  },
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(52, 199, 89, 0.12)',
                    '&:hover': {
                      backgroundColor: 'rgba(52, 199, 89, 0.16)'
                    }
                  }
                }}
              >
                <Checkbox 
                  checked={(filters.statuses || []).indexOf('paid') > -1}
                  size="small"
                  sx={{
                    color: 'rgba(0, 0, 0, 0.15)',
                    padding: '4px',
                    marginRight: '8px',
                    '&.Mui-checked': {
                      color: '#34c759'
                    },
                    '& .MuiSvgIcon-root': {
                      fontSize: '1.125rem'
                    }
                  }}
                />
                <ListItemText 
                  primary="Paid" 
                  primaryTypographyProps={{
                    fontSize: '0.8125rem',
                    fontWeight: 400,
                    letterSpacing: '-0.01em'
                  }}
                />
              </MenuItem>
              <MenuItem 
                value="unpaid"
                sx={{
                  fontSize: '0.8125rem',
                  fontWeight: 400,
                  color: '#1d1d1f',
                  letterSpacing: '-0.01em',
                  py: 0.75,
                  px: 1.5,
                  mx: 0.5,
                  minHeight: '32px',
                  borderRadius: '6px',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                  transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 149, 0, 0.08)'
                  },
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(255, 149, 0, 0.12)',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 149, 0, 0.16)'
                    }
                  }
                }}
              >
                <Checkbox 
                  checked={(filters.statuses || []).indexOf('unpaid') > -1}
                  size="small"
                  sx={{
                    color: 'rgba(0, 0, 0, 0.15)',
                    padding: '4px',
                    marginRight: '8px',
                    '&.Mui-checked': {
                      color: '#ff9500'
                    },
                    '& .MuiSvgIcon-root': {
                      fontSize: '1.125rem'
                    }
                  }}
                />
                <ListItemText 
                  primary="Unpaid" 
                  primaryTypographyProps={{
                    fontSize: '0.8125rem',
                    fontWeight: 400,
                    letterSpacing: '-0.01em'
                  }}
                />
              </MenuItem>
              <MenuItem 
                value="overdue"
                sx={{
                  fontSize: '0.8125rem',
                  fontWeight: 400,
                  color: '#1d1d1f',
                  letterSpacing: '-0.01em',
                  py: 0.75,
                  px: 1.5,
                  mx: 0.5,
                  minHeight: '32px',
                  borderRadius: '6px',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                  transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 59, 48, 0.08)'
                  },
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(255, 59, 48, 0.12)',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 59, 48, 0.16)'
                    }
                  }
                }}
              >
                <Checkbox 
                  checked={(filters.statuses || []).indexOf('overdue') > -1}
                  size="small"
                  sx={{
                    color: 'rgba(0, 0, 0, 0.15)',
                    padding: '4px',
                    marginRight: '8px',
                    '&.Mui-checked': {
                      color: '#ff3b30'
                    },
                    '& .MuiSvgIcon-root': {
                      fontSize: '1.125rem'
                    }
                  }}
                />
                <ListItemText 
                  primary="Overdue" 
                  primaryTypographyProps={{
                    fontSize: '0.8125rem',
                    fontWeight: 400,
                    letterSpacing: '-0.01em'
                  }}
                />
              </MenuItem>
              <MenuItem 
                value="draft"
                sx={{
                  fontSize: '0.8125rem',
                  fontWeight: 400,
                  color: '#1d1d1f',
                  letterSpacing: '-0.01em',
                  py: 0.75,
                  px: 1.5,
                  mx: 0.5,
                  minHeight: '32px',
                  borderRadius: '6px',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                  transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    backgroundColor: 'rgba(142, 142, 147, 0.08)'
                  },
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(142, 142, 147, 0.12)',
                    '&:hover': {
                      backgroundColor: 'rgba(142, 142, 147, 0.16)'
                    }
                  }
                }}
              >
                <Checkbox 
                  checked={(filters.statuses || []).indexOf('draft') > -1}
                  size="small"
                  sx={{
                    color: 'rgba(0, 0, 0, 0.15)',
                    padding: '4px',
                    marginRight: '8px',
                    '&.Mui-checked': {
                      color: '#8e8e93'
                    },
                    '& .MuiSvgIcon-root': {
                      fontSize: '1.125rem'
                    }
                  }}
                />
                <ListItemText 
                  primary="Draft" 
                  primaryTypographyProps={{
                    fontSize: '0.8125rem',
                    fontWeight: 400,
                    letterSpacing: '-0.01em'
                  }}
                />
              </MenuItem>
              <MenuItem 
                value="deleted"
                sx={{
                  fontSize: '0.8125rem',
                  fontWeight: 400,
                  color: '#1d1d1f',
                  letterSpacing: '-0.01em',
                  py: 0.75,
                  px: 1.5,
                  mx: 0.5,
                  minHeight: '32px',
                  borderRadius: '6px',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                  transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 59, 48, 0.08)'
                  },
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(255, 59, 48, 0.12)',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 59, 48, 0.16)'
                    }
                  }
                }}
              >
                <Checkbox 
                  checked={(filters.statuses || []).indexOf('deleted') > -1}
                  size="small"
                  sx={{
                    color: 'rgba(0, 0, 0, 0.15)',
                    padding: '4px',
                    marginRight: '8px',
                    '&.Mui-checked': {
                      color: '#ff3b30'
                    },
                    '& .MuiSvgIcon-root': {
                      fontSize: '1.125rem'
                    }
                  }}
                />
                <ListItemText 
                  primary="Deleted" 
                  primaryTypographyProps={{
                    fontSize: '0.8125rem',
                    fontWeight: 400,
                    letterSpacing: '-0.01em'
                  }}
                />
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