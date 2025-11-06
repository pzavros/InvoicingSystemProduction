// components/DashboardPage/CurrentMonthInvoiceCountDisplay.jsx
import React, { useState, useEffect } from "react";
import {
  Paper,
  Box,
  Typography,
  CircularProgress
} from "@mui/material";
import ReceiptIcon from '@mui/icons-material/Receipt';
import { getDashboardStatsForMonthYear } from "./api";

const monthNames = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

const CurrentMonthInvoiceCountDisplay = ({ month, year }) => {
  const [count, setCount]     = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const data = await getDashboardStatsForMonthYear(month, year);
        if (alive) setCount(data.invoiceCountSelectedMonthYear);
      } catch (err) {
        console.error(err);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [month, year]);

  const monthLabel = monthNames[month - 1];

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
          {monthLabel} {year} Invoices
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
          <ReceiptIcon sx={{ fontSize: 18, color: '#8b5cf6' }} />
        </Box>
      </Box>

      {/* Count */}
      <Typography
        variant="h3"
        sx={{
          fontWeight: 700,
          fontSize: '2.25rem',
          color: 'rgba(15, 23, 42, 0.95)',
          letterSpacing: '-0.02em',
          lineHeight: 1.1,
          mb: 1.5
        }}
      >
        {count.toLocaleString()}
      </Typography>

      {/* Description */}
      <Typography
        variant="body2"
        sx={{
          color: 'rgba(15, 23, 42, 0.5)',
          fontSize: '0.875rem',
          fontWeight: 400
        }}
      >
        Total invoices created
      </Typography>
    </Paper>
  );
};

export default CurrentMonthInvoiceCountDisplay;
