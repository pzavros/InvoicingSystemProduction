// src/components/ReportPage/ReportPageHeader.jsx
import React from "react";
import {
  Grid,
  Typography,
  Chip
} from "@mui/material";
import {
  Assessment as AssessmentIcon
} from "@mui/icons-material";

const ReportPageHeader = ({ reportType, dateRange }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getReportTypeLabel = (type) => {
    const types = {
      sales: "Sales Report",
      clients: "Client Report",
      invoices: "Invoice Report",
      products: "Product Report",
      financial: "Financial Summary"
    };
    return types[type] || "Report";
  };

  return (
    <Grid 
      container 
      sx={{ 
        mb: 4,
        p: 3,
        borderRadius: 3,
        background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
        border: '1px solid rgba(168, 85, 247, 0.1)',
        boxShadow: '0 4px 12px rgba(168, 85, 247, 0.08)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #a855f7 0%, #3b82f6 50%, #10b981 100%)',
          borderRadius: '3px 3px 0 0'
        }
      }}
    >
      <Grid item xs={12} md={8}>
        <Grid container alignItems="center" spacing={2}>
          <Grid item>
            <Grid
              container
              sx={{
                width: 48,
                height: 48,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #a855f7 0%, #8b5cf6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 16px rgba(168, 85, 247, 0.3)'
              }}
            >
              <AssessmentIcon sx={{ color: 'white', fontSize: 24 }} />
            </Grid>
          </Grid>
          <Grid item xs>
            <Typography 
              variant="h5" 
              component="h1" 
              sx={{ 
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 0.5
              }}
            >
              Reports & Analytics
            </Typography>
            <Typography 
              variant="subtitle2" 
              sx={{ 
                color: 'text.secondary',
                fontWeight: 'medium'
              }}
            >
              Generate detailed business reports and export data insights
            </Typography>
          </Grid>
        </Grid>
      </Grid>
      
      <Grid item xs={12} md={4}>
        <Grid 
          container 
          direction="column" 
          spacing={1}
          sx={{
            minWidth: { xs: '100%', md: 320 }
          }}
        >
          <Grid item>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#a855f7' }}>
              Current Report
            </Typography>
          </Grid>
          <Grid item>
            <Chip 
              label={getReportTypeLabel(reportType)}
              size="small"
              sx={{
                backgroundColor: 'rgba(168, 85, 247, 0.1)',
                color: '#7c3aed',
                fontWeight: 'medium'
              }}
            />
          </Grid>
          <Grid item>
            <Typography variant="body2" color="text.secondary">
              Period: {formatDate(dateRange.startDate)} - {formatDate(dateRange.endDate)}
            </Typography>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default ReportPageHeader;
