import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Stack,
  FormControl,
  Select,
  MenuItem,
  Paper
} from '@mui/material';

import AnnualEarningsChart from '../components/DashboardPage/AnnualEarningsChart';
import AnnualInvoiceCountChart from '../components/DashboardPage/AnnualInvoiceCountChart';

// <-- Correct relative paths into your components folder:
import CurrentMonthEarningsDisplay from '../components/DashboardPage/CurrentMonthEarningsDisplay';
import CurrentMonthInvoiceCountDisplay from '../components/DashboardPage/CurrentMonthInvoiceCountDisplay';
import PageHelper from '../components/ReusableComponents/PageHelper';
import { pageHelpContent } from '../config/pageHelpContent';

const monthNames = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

export default function DashboardPage() {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear]   = useState(today.getFullYear());
  const currentYear = today.getFullYear();

  const years = Array.from({ length: 5 }, (_, i) => today.getFullYear() - i);

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3, md: 4 }, px: { xs: 2, sm: 3, md: 3 } }}>
        <Box>
          {/* Apple-Style Header Section */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', sm: 'center' },
              gap: { xs: 2, sm: 3 },
              mb: 3,
              pb: 3,
              borderBottom: '1px solid rgba(15, 23, 42, 0.08)',
            }}
          >
            <Box>
              <Typography
                variant="h4"
                component="h1"
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: '1.75rem', sm: '2rem' },
                  color: 'rgba(15, 23, 42, 0.95)',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.1,
                  mb: 0.5
                }}
              >
                Dashboard
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: 'rgba(15, 23, 42, 0.5)',
                  fontSize: '0.9375rem',
                  fontWeight: 400,
                  letterSpacing: '-0.01em'
                }}
              >
                Track your revenue and performance metrics
              </Typography>
            </Box>

            {/* Filter Controls */}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1.5}
              sx={{ width: { xs: '100%', sm: 'auto' } }}
            >
              <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 140 } }}>
                <Select
                  value={month}
                  onChange={e => setMonth(Number(e.target.value))}
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
                  {monthNames.map((m, idx) => (
                    <MenuItem key={m} value={idx + 1}>
                      {m}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 100 } }}>
                <Select
                  value={year}
                  onChange={e => setYear(Number(e.target.value))}
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
                  {years.map(y => (
                    <MenuItem key={y} value={y}>
                      {y}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </Box>

          {/* Stats Grid */}
          <Box
            sx={{
              display: 'grid',
              gap: { xs: 2, sm: 3 },
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              mb: { xs: 3, md: 4 }
            }}
          >
            <Box sx={{ height: '100%' }}>
              <CurrentMonthEarningsDisplay month={month} year={year} />
            </Box>
            <Box sx={{ height: '100%' }}>
              <CurrentMonthInvoiceCountDisplay month={month} year={year} />
            </Box>
          </Box>

          {/* Charts Section */}
          <Box sx={{ mb: { xs: 2, sm: 3 } }}>
            <AnnualEarningsChart initialYear={currentYear} />
          </Box>
          
          <Box>
            <AnnualInvoiceCountChart initialYear={currentYear} />
          </Box>
        </Box>
      
        <PageHelper {...pageHelpContent.dashboard} />
      </Container>
  );
}
