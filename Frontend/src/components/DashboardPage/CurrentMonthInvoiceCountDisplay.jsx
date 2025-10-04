// components/DashboardPage/CurrentMonthInvoiceCountDisplay.jsx
import React, { useState, useEffect } from "react";
import {
  Paper,
  Box,
  Typography,
  CircularProgress,
  useTheme,
  Card,
  CardContent,
  Grow,
  Fade,
  LinearProgress,
  Chip
} from "@mui/material";
import ReceiptIcon from '@mui/icons-material/Receipt';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { getDashboardStatsForMonthYear } from "./api";

const monthNames = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

const CurrentMonthInvoiceCountDisplay = ({ month, year }) => {
  const theme = useTheme();
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
  return (
    <Card 
      elevation={6}
      sx={{ 
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 3,
        background: 'linear-gradient(145deg, #ffffff 0%, #f0fdf4 100%)',
        border: '1px solid rgba(34, 197, 94, 0.1)',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        height: '100%',
        minHeight: '200px',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: '0 25px 50px rgba(34, 197, 94, 0.15)',
          border: '1px solid rgba(34, 197, 94, 0.2)',
          '& .icon-container': {
            transform: 'scale(1.1) rotate(5deg)',
            background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
          }
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #22c55e 0%, #16a34a 50%, #15803d 100%)',
          borderRadius: '3px 3px 0 0'
        }
      }}
    >
      {/* Header Section */}
      <Box
        sx={{
          p: 3,
          background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.05) 0%, rgba(187, 247, 208, 0.02) 100%)',
          borderBottom: '1px solid rgba(34, 197, 94, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            className="icon-container"
            sx={{
              width: 48,
              height: 48,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              boxShadow: '0 8px 16px rgba(34, 197, 94, 0.3)'
            }}
          >
            <ReceiptIcon sx={{ color: 'white', fontSize: 24 }} />
          </Box>
          <Box>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #15803d 0%, #22c55e 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 0.5
              }}
            >
              Invoice Count
            </Typography>
            <Typography 
              variant="subtitle2" 
              sx={{ 
                color: 'text.secondary',
                fontWeight: 'medium'
              }}
            >
              {monthNames[month - 1]} {year}
            </Typography>
          </Box>
        </Box>
        <Chip
          icon={<AssignmentIcon />}
          label="Documents"
          size="small"
          sx={{
            background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
            color: '#15803d',
            fontWeight: 'medium',
            border: '1px solid rgba(34, 197, 94, 0.2)'
          }}
        />
      </Box>

      {/* Content Section */}
      <CardContent sx={{ p: 4, textAlign: "center", display: 'flex', flexDirection: 'column', justifyContent: 'center', flexGrow: 1 }}>
        {loading ? (
          <Fade in={loading}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <CircularProgress 
                size={60} 
                thickness={4}
                sx={{ 
                  color: '#22c55e',
                  '& .MuiCircularProgress-circle': {
                    strokeLinecap: 'round'
                  }
                }}
              />
              <Typography variant="body2" color="text.secondary">
                Loading invoice data...
              </Typography>
              <LinearProgress 
                sx={{ 
                  width: '100%', 
                  borderRadius: 2,
                  height: 6,
                  backgroundColor: 'rgba(34, 197, 94, 0.1)',
                  '& .MuiLinearProgress-bar': {
                    background: 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)',
                    borderRadius: 2
                  }
                }} 
              />
            </Box>
          </Fade>
        ) : (
          <Grow in={!loading} timeout={800}>
            <Box>
              <Typography 
                variant="h2" 
                sx={{ 
                  fontWeight: 'bold',
                  background: 'linear-gradient(135deg, #15803d 0%, #22c55e 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1,
                  textShadow: '0 2px 4px rgba(34, 197, 94, 0.1)'
                }}
              >
                {count.toLocaleString()}
              </Typography>
              <Box sx={{ 
                width: '60px', 
                height: '4px', 
                background: 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)', 
                margin: '0 auto',
                borderRadius: 2
              }} />
            </Box>
          </Grow>
        )}
      </CardContent>
    </Card>
  );
};

export default CurrentMonthInvoiceCountDisplay;
