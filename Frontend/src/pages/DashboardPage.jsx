import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Fade,
  Grow
} from '@mui/material';
import {
  Insights as InsightsIcon
} from '@mui/icons-material';

import AnnualEarningsChart from '../components/DashboardPage/AnnualEarningsChart';
import AnnualInvoiceCountChart from '../components/DashboardPage/AnnualInvoiceCountChart';

// <-- Correct relative paths into your components folder:
import CurrentMonthEarningsDisplay from '../components/DashboardPage/CurrentMonthEarningsDisplay';
import CurrentMonthInvoiceCountDisplay from '../components/DashboardPage/CurrentMonthInvoiceCountDisplay';

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
  const selectedMonthLabel = monthNames[month - 1];
  const minYear = years[years.length - 1];
  const maxYear = years[0];
  const chartsRendered = 4;

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3, md: 4 }, px: { xs: 2, sm: 3, md: 3 } }}>
      <Fade in={true} timeout={800}>
        <Box>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', md: 'center' },
              gap: { xs: 2, sm: 3 },
              mb: { xs: 3, md: 4 },
              p: { xs: 2, sm: 3 },
              borderRadius: 3,
              background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
              border: '1px solid rgba(79, 70, 229, 0.18)',
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.15)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #4f46e5 0%, #7c3aed 50%, #3b82f6 100%)',
                borderRadius: '3px 3px 0 0'
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2 }, minWidth: { xs: '100%', sm: 280 } }}>
              <Box
                sx={{
                  width: { xs: 48, sm: 56 },
                  height: { xs: 48, sm: 56 },
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 10px 18px rgba(79, 70, 229, 0.35)'
                }}
              >
                <InsightsIcon sx={{ color: 'white', fontSize: { xs: 22, sm: 26 } }} />
              </Box>
              <Box>
                <Typography
                  variant="h5"
                  component="h1"
                  sx={{
                    fontWeight: 'bold',
                    fontSize: { xs: '1.25rem', sm: '1.5rem' },
                    background: 'linear-gradient(135deg, #4338ca 0%, #7c3aed 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 0.5
                  }}
                >
                  Dashboard Overview
                </Typography>
                <Typography
                  variant="subtitle2"
                  sx={{
                    color: 'text.secondary',
                    fontWeight: 'medium',
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    display: { xs: 'none', sm: 'block' }
                  }}
                >
                  Track revenue, invoice volume, and yearly performance at a glance.
                </Typography>
              </Box>
            </Box>

            <Stack
              spacing={0.5}
              sx={{
                minWidth: { xs: '100%', md: 320 },
                display: { xs: 'none', md: 'flex' }
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#4f46e5' }}>
                Current Filters
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Reporting Period: {selectedMonthLabel} {year}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Year Range Loaded: {minYear} – {maxYear}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Metrics Displayed: {chartsRendered} dashboards
              </Typography>
            </Stack>
          </Box>

          <Grow in={true} timeout={600}>
            <Paper
              elevation={4}
              sx={{
                p: { xs: 2, sm: 3 },
                mb: { xs: 3, md: 4 },
                borderRadius: 3,
                background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
                border: '1px solid rgba(79, 70, 229, 0.1)',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: { xs: 'none', md: 'translateY(-2px)' },
                  boxShadow: '0 12px 24px rgba(79, 70, 229, 0.12)'
                }
              }}
            >
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'medium', color: 'text.primary', fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                Filter Options
              </Typography>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                alignItems="center"
              >
                <FormControl size="small" sx={{ minWidth: 120, width: { xs: '100%', sm: 'auto' } }}>
                  <InputLabel>Month</InputLabel>
                  <Select
                    value={month}
                    label="Month"
                    onChange={e => setMonth(Number(e.target.value))}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#4f46e5'
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

                <FormControl size="small" sx={{ minWidth: 120, width: { xs: '100%', sm: 'auto' } }}>
                  <InputLabel>Year</InputLabel>
                  <Select
                    value={year}
                    label="Year"
                    onChange={e => setYear(Number(e.target.value))}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#4f46e5'
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
            </Paper>
          </Grow>

          <Box
            sx={{
              display: 'grid',
              gap: { xs: 2, sm: 3 },
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              mb: { xs: 3, md: 4 }
            }}
          >
            <Grow in={true} timeout={800}>
              <Box sx={{ height: '100%' }}>
                <CurrentMonthEarningsDisplay month={month} year={year} />
              </Box>
            </Grow>
            <Grow in={true} timeout={1000}>
              <Box sx={{ height: '100%' }}>
                <CurrentMonthInvoiceCountDisplay month={month} year={year} />
              </Box>
            </Grow>
          </Box>

          <Box sx={{ mb: { xs: 2, sm: 3 } }}>
            <Grow in={true} timeout={1200}>
              <Box>
                <AnnualEarningsChart initialYear={currentYear} />
              </Box>
            </Grow>
          </Box>
          
          <Grow in={true} timeout={1400}>
            <Box>
              <AnnualInvoiceCountChart initialYear={currentYear} />
            </Box>
          </Grow>
        </Box>
      </Fade>
    </Container>
  );
}
