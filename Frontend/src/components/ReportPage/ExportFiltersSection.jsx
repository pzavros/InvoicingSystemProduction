import React from "react";
import {
  Typography, Box, Button, Card, CardContent, Chip, Paper, Divider, 
  Fade, Grow, LinearProgress, Stack, IconButton
} from "@mui/material";
import DownloadIcon from '@mui/icons-material/Download';
import TuneIcon from '@mui/icons-material/Tune';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ReportExportControls from "./ReportExportControls";

export default function ExportFiltersSection({
  from,
  to,
  statusIds,
  selectedColumns,
  availableColumns,
  onFiltersChange,
  onExport
}) {  const handleFiltersChange = (newFrom, newTo, newStatusIds) => {
    onFiltersChange(newFrom, newTo, newStatusIds);
  };

  const completionPercentage = (selectedColumns.length / Object.keys(availableColumns).length) * 100;
  const isReadyToExport = selectedColumns.length > 0;
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, height: '100%', minHeight: '600px' }}>
      {/* Main Export Controls Card */}
      <Grow in={true} timeout={600}>
        <Card 
          elevation={6} 
          sx={{ 
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 3,
            background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
            border: '1px solid rgba(79, 70, 229, 0.1)',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 20px 40px rgba(79, 70, 229, 0.15)',
              border: '1px solid rgba(79, 70, 229, 0.2)'
            },
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 4,
              background: 'linear-gradient(90deg, #4f46e5 0%, #7c3aed 50%, #db2777 100%)',
              borderRadius: '12px 12px 0 0'
            }
          }}
        >
          <CardContent sx={{ p: 4 }}>
            {/* Header Section with Enhanced Design */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mb: 4,
              p: 3,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Cpath d="m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E") repeat',
                opacity: 0.3
              }
            }}>
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 50,
                height: 50,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                mr: 3,
                border: '2px solid rgba(255, 255, 255, 0.3)',
                position: 'relative',
                zIndex: 1
              }}>
                <TuneIcon sx={{ color: 'white', fontSize: 24 }} />
              </Box>
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Typography 
                  variant="h5" 
                  component="h2" 
                  sx={{ 
                    fontWeight: 'bold',
                    mb: 0.5,
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                  }}
                >
                  Export Configuration
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    opacity: 0.9,
                    fontSize: '0.9rem'
                  }}
                >
                  Configure filters and generate your report
                </Typography>
              </Box>
            </Box>
            
            {/* Filters Section */}
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                mb: 4, 
                bgcolor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: '#f1f5f9',
                  transform: 'translateY(-1px)'
                }
              }}
            >
              <ReportExportControls
                from={from}
                to={to}
                statusIds={statusIds}
                onChange={handleFiltersChange}
              />
            </Paper>

            {/* Progress Section */}
            <Fade in={true} timeout={800}>
              <Box sx={{ mb: 4 }}>                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="body2" fontWeight="medium" color="text.secondary">
                    Selection Progress
                  </Typography>
                  <Typography variant="body2" fontWeight="bold" color="primary.main">
                    {selectedColumns.length} / {Object.keys(availableColumns).length} columns
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={completionPercentage} 
                  sx={{ 
                    height: 8, 
                    borderRadius: 4,
                    bgcolor: 'rgba(79, 70, 229, 0.1)',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 4,
                      background: completionPercentage < 30 
                        ? 'linear-gradient(90deg, #ef4444 0%, #f97316 100%)'
                        : completionPercentage < 70
                        ? 'linear-gradient(90deg, #f59e0b 0%, #10b981 100%)'
                        : 'linear-gradient(90deg, #10b981 0%, #059669 100%)'
                    }
                  }} 
                />
              </Box>
            </Fade>

            {/* Export Button */}
            <Fade in={true} timeout={1000}>
              <Box sx={{ mb: 3 }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={onExport}
                  disabled={!isReadyToExport}
                  startIcon={<DownloadIcon />}
                  sx={{
                    width: '100%',
                    py: 2,
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    borderRadius: 3,
                    textTransform: 'none',
                    boxShadow: isReadyToExport 
                      ? '0 8px 25px rgba(79, 70, 229, 0.3)'
                      : '0 4px 10px rgba(0,0,0,0.1)',
                    background: isReadyToExport 
                      ? 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)'
                      : 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      transform: isReadyToExport ? 'translateY(-2px)' : 'none',
                      boxShadow: isReadyToExport 
                        ? '0 12px 35px rgba(79, 70, 229, 0.4)'
                        : '0 4px 10px rgba(0,0,0,0.1)',
                      background: isReadyToExport 
                        ? 'linear-gradient(135deg, #4338ca 0%, #7c2d12 100%)'
                        : 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)'
                    },
                    '&:disabled': {
                      background: 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)',
                      color: 'white',
                      cursor: 'not-allowed'
                    }
                  }}
                >
                  {isReadyToExport ? (
                    <>
                      <CheckCircleIcon sx={{ mr: 1, fontSize: 20 }} />
                      Download Excel Report
                    </>
                  ) : (
                    <>
                      <WarningIcon sx={{ mr: 1, fontSize: 20 }} />
                      Select Columns First
                    </>
                  )}
                </Button>

                {/* Warning Message */}
                {!isReadyToExport && (
                  <Fade in={true} timeout={500}>
                    <Box sx={{ 
                      mt: 2, 
                      p: 2.5, 
                      borderRadius: 2, 
                      bgcolor: '#fef3c7', 
                      border: '1px solid #f59e0b',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5
                    }}>
                      <InfoIcon sx={{ color: '#d97706', fontSize: 20 }} />
                      <Typography variant="body2" sx={{ 
                        color: '#92400e',
                        fontWeight: 'medium',
                        flex: 1
                      }}>
                        Please select at least one column from the Column Selection section to generate your report.
                      </Typography>
                    </Box>
                  </Fade>
                )}
              </Box>
            </Fade>
          </CardContent>        </Card>
      </Grow>
    </Box>
  );
}
