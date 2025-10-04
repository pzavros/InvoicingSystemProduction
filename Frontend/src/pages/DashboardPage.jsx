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
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Fade in={true} timeout={800}>
        <Box>
          <Typography 
            variant="h4" 
            gutterBottom 
            sx={{ 
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 3
            }}
          >
            Dashboard Overview
          </Typography>

          <Grow in={true} timeout={600}>
            <Paper
              elevation={4}
              sx={{
                p: 3,
                mb: 4,
                borderRadius: 3,
                background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
                border: '1px solid rgba(79, 70, 229, 0.1)',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 24px rgba(79, 70, 229, 0.12)'
                }
              }}
            >
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'medium', color: 'text.primary' }}>
                Filter Options
              </Typography>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                alignItems="center"
              >
                <FormControl size="small" sx={{ minWidth: 120 }}>
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

                <FormControl size="small" sx={{ minWidth: 120 }}>
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
              gap: 3,
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              mb: 4
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

          <Box sx={{ mb: 3 }}>
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
