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
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: 1.5,
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif'
    }}>
      <Button
        variant="contained"
        fullWidth
        startIcon={loading ? <CircularProgress size={18} sx={{ color: 'inherit' }} thickness={3} /> : <PdfIcon sx={{ fontSize: 20 }} />}
        onClick={() => onExport('pdf')}
        disabled={loading}
        sx={{
          background: '#ff3b30',
          color: 'white',
          px: 3,
          py: 1.5,
          fontWeight: 500,
          fontSize: '0.9375rem',
          letterSpacing: '-0.01em',
          textTransform: 'none',
          borderRadius: '12px',
          boxShadow: 'none',
          border: 'none',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
          '&:hover': {
            background: '#d70015',
            boxShadow: 'none'
          },
          '&:active': {
            transform: 'scale(0.98)'
          },
          '&:disabled': {
            background: 'rgba(0, 0, 0, 0.06)',
            color: 'rgba(0, 0, 0, 0.26)',
            boxShadow: 'none'
          }
        }}
      >
        Export PDF
      </Button>

      <Button
        variant="contained"
        fullWidth
        startIcon={loading ? <CircularProgress size={18} sx={{ color: 'inherit' }} thickness={3} /> : <ExcelIcon sx={{ fontSize: 20 }} />}
        onClick={() => onExport('excel')}
        disabled={loading}
        sx={{
          background: '#34c759',
          color: 'white',
          px: 3,
          py: 1.5,
          fontWeight: 500,
          fontSize: '0.9375rem',
          letterSpacing: '-0.01em',
          textTransform: 'none',
          borderRadius: '12px',
          boxShadow: 'none',
          border: 'none',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
          '&:hover': {
            background: '#248a3d',
            boxShadow: 'none'
          },
          '&:active': {
            transform: 'scale(0.98)'
          },
          '&:disabled': {
            background: 'rgba(0, 0, 0, 0.06)',
            color: 'rgba(0, 0, 0, 0.26)',
            boxShadow: 'none'
          }
        }}
      >
        Export Excel
      </Button>

      <Box 
        sx={{ 
          mt: 1.5, 
          p: 2.5, 
          borderRadius: '12px',
          background: 'rgba(0, 0, 0, 0.02)',
          border: '0.5px solid rgba(0, 0, 0, 0.06)'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <DownloadIcon sx={{ fontSize: 18, color: '#86868b' }} />
          <Typography variant="body2" sx={{ 
            fontWeight: 600, 
            color: '#1d1d1f',
            fontSize: '0.8125rem',
            letterSpacing: '-0.01em'
          }}>
            Export Info
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ 
          color: '#86868b', 
          lineHeight: 1.5, 
          display: 'block',
          fontSize: '0.875rem',
          fontWeight: 400,
          letterSpacing: '-0.01em'
        }}>
          Export options will use your selected columns and current filters
        </Typography>
      </Box>
    </Box>
  );
};

export default ReportExports;
