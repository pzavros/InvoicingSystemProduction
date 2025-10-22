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
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Button
        variant="contained"
        fullWidth
        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <PdfIcon />}
        onClick={() => onExport('pdf')}
        disabled={loading}
        sx={{
          background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
          color: 'white',
          py: 1.5,
          fontWeight: 'medium',
          textTransform: 'none',
          borderRadius: 2,
          boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)',
          '&:hover': {
            background: 'linear-gradient(135deg, #b91c1c 0%, #991b1b 100%)',
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 16px rgba(220, 38, 38, 0.4)',
          },
          '&:disabled': {
            background: 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)',
            color: 'white',
            opacity: 0.7
          },
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        Export PDF
      </Button>

      <Button
        variant="contained"
        fullWidth
        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <ExcelIcon />}
        onClick={() => onExport('excel')}
        disabled={loading}
        sx={{
          background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
          color: 'white',
          py: 1.5,
          fontWeight: 'medium',
          textTransform: 'none',
          borderRadius: 2,
          boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)',
          '&:hover': {
            background: 'linear-gradient(135deg, #047857 0%, #065f46 100%)',
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 16px rgba(5, 150, 105, 0.4)',
          },
          '&:disabled': {
            background: 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)',
            color: 'white',
            opacity: 0.7
          },
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        Export Excel
      </Button>

      <Box 
        sx={{ 
          mt: 1, 
          p: 2, 
          borderRadius: 2,
          background: 'linear-gradient(145deg, #f0f9ff 0%, #e0f2fe 100%)',
          border: '1px solid rgba(59, 130, 246, 0.2)'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <DownloadIcon sx={{ fontSize: 16, color: '#3b82f6' }} />
          <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#1e40af' }}>
            Export Info
          </Typography>
        </Box>
        <Typography variant="caption" sx={{ color: '#475569', lineHeight: 1.5, display: 'block' }}>
          Export options will use your selected columns and current filters
        </Typography>
      </Box>
    </Box>
  );
};

export default ReportExports;
