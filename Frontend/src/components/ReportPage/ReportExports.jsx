// src/components/ReportPage/ReportExports.jsx
import React from "react";
import {
  Box,
  Button,
  CircularProgress,
  Typography
} from "@mui/material";
import {
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
  FileDownload as DownloadIcon
} from "@mui/icons-material";

const ReportExports = ({ onExport, loading, reportType }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <Button
        variant="contained"
        fullWidth
        startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <PdfIcon sx={{ fontSize: 20 }} />}
        onClick={() => onExport('pdf')}
        disabled={loading}
        sx={{
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: 'white',
          px: 2.5,
          py: 1.25,
          fontWeight: 600,
          fontSize: '0.875rem',
          textTransform: 'none',
          borderRadius: '10px',
          boxShadow: 'none',
          border: 'none',
          transition: 'all 0.2s ease',
          '&:hover': {
            background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
          },
          '&:disabled': {
            background: 'rgba(15, 23, 42, 0.12)',
            color: 'rgba(15, 23, 42, 0.4)',
            boxShadow: 'none'
          }
        }}
      >
        Export PDF
      </Button>

      <Button
        variant="contained"
        fullWidth
        startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <ExcelIcon sx={{ fontSize: 20 }} />}
        onClick={() => onExport('excel')}
        disabled={loading}
        sx={{
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: 'white',
          px: 2.5,
          py: 1.25,
          fontWeight: 600,
          fontSize: '0.875rem',
          textTransform: 'none',
          borderRadius: '10px',
          boxShadow: 'none',
          border: 'none',
          transition: 'all 0.2s ease',
          '&:hover': {
            background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
          },
          '&:disabled': {
            background: 'rgba(15, 23, 42, 0.12)',
            color: 'rgba(15, 23, 42, 0.4)',
            boxShadow: 'none'
          }
        }}
      >
        Export Excel
      </Button>

      <Box 
        sx={{ 
          mt: 1, 
          p: 2, 
          borderRadius: '12px',
          backgroundColor: 'rgba(15, 23, 42, 0.02)',
          border: '1px solid rgba(15, 23, 42, 0.08)'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <DownloadIcon sx={{ fontSize: 16, color: 'rgba(15, 23, 42, 0.55)' }} />
          <Typography variant="caption" sx={{ fontWeight: 600, color: 'rgba(15, 23, 42, 0.75)' }}>
            Export Info
          </Typography>
        </Box>
        <Typography variant="caption" sx={{ 
          color: 'rgba(15, 23, 42, 0.65)', 
          lineHeight: 1.5, 
          display: 'block',
          fontSize: '0.8125rem'
        }}>
          Export options will use your selected columns and current filters
        </Typography>
      </Box>
    </Box>
  );
};

export default ReportExports;
