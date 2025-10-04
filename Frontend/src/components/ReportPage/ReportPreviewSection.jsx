import React from "react";
import {
  Typography, Box, List, ListItem, ListItemText, Divider,
  Alert, Chip, Grid, Card, CardContent, Fade, Icon,
  Paper, Stack, Grow, LinearProgress, IconButton
} from "@mui/material";
import AssessmentIcon from '@mui/icons-material/Assessment';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

export default function ReportPreviewSection({
  selectedColumns,
  availableColumns,
  columnCategories
}) {
  const essentialColumnsCount = selectedColumns.filter(col => availableColumns[col]?.essential).length;
  const optionalColumnsCount = selectedColumns.filter(col => !availableColumns[col]?.essential).length;
  const totalColumns = Object.keys(availableColumns).length;
  const completionPercentage = (selectedColumns.length / totalColumns) * 100;

  return (
    <Grow in={true} timeout={1000}>
      <Card 
        elevation={6}        sx={{ 
          height: '100%',
          minHeight: '600px',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 3,
          background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
          border: '1px solid rgba(139, 92, 246, 0.1)',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 20px 40px rgba(139, 92, 246, 0.15)',
            border: '1px solid rgba(139, 92, 246, 0.2)'
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #8b5cf6 0%, #6366f1 100%)',
            zIndex: 1
          }
        }}
      >        <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Header Section */}
          <Paper 
            elevation={2} 
            sx={{ 
              p: 3, 
              mb: 3, 
              borderRadius: 3,
              background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                right: 0,
                width: '100px',
                height: '100px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '50%',
                transform: 'translate(30px, -30px)'
              }
            }}
          >
            <Stack direction="row" alignItems="center" spacing={2} sx={{ position: 'relative', zIndex: 1 }}>
              <AssessmentIcon sx={{ fontSize: 32 }} />
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                  Report Preview
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.85rem' }}>
                  Your customized logistics export overview
                </Typography>
              </Box>
              <Chip 
                label={selectedColumns.length > 0 ? 'Ready' : 'Setup Required'} 
                size="small" 
                sx={{ 
                  bgcolor: selectedColumns.length > 0 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)', 
                  color: selectedColumns.length > 0 ? '#10b981' : '#ef4444',
                  fontWeight: 'bold',
                  border: selectedColumns.length > 0 ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)'
                }} 
              />
            </Stack>
          </Paper>          <Fade in={selectedColumns.length > 0} timeout={800}>
            <Paper 
              elevation={1} 
              sx={{ 
                p: 3, 
                mb: 3, 
                borderRadius: 3,
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(99, 102, 241, 0.05) 100%)',
                border: '1px solid rgba(139, 92, 246, 0.1)',
                position: 'relative'
              }}
            >
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#374151', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircleIcon sx={{ color: '#10b981', fontSize: 20 }} />
                    Selected Columns
                  </Typography>
                  <Chip 
                    label={`${selectedColumns.length} selected`}
                    size="small"
                    color={selectedColumns.length > 5 ? 'success' : selectedColumns.length > 0 ? 'warning' : 'error'}
                    sx={{ fontWeight: 'bold' }}
                  />
                </Box>

                {selectedColumns.length > 0 ? (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {selectedColumns.map((columnKey, index) => {
                      const columnInfo = availableColumns[columnKey];
                      const categoryInfo = columnCategories[columnInfo.category];
                      return (
                        <Chip
                          key={columnKey}
                          label={`${index + 1}. ${columnInfo.label}`}
                          color={categoryInfo.color}
                          variant={columnInfo.essential ? "filled" : "outlined"}
                          size="small"
                          sx={{
                            fontWeight: columnInfo.essential ? 'bold' : 'normal',
                            '& .MuiChip-label': { fontSize: '0.75rem' },
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              transform: 'scale(1.05)',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                            }
                          }}
                        />
                      );
                    })}
                  </Box>
                ) : (
                  <Alert severity="info" sx={{ 
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                    border: '1px solid #2196f3'
                  }}>
                    No columns selected. Please choose columns from the selection above.
                  </Alert>
                )}
              </Stack>
            </Paper>
          </Fade>          <Divider sx={{ my: 2, borderColor: 'rgba(139, 92, 246, 0.1)' }} />

          <Fade in={true} timeout={1200}>
            <Paper 
              elevation={1} 
              sx={{ 
                p: 3, 
                borderRadius: 3,
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                border: '1px solid rgba(139, 92, 246, 0.1)'
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, color: '#374151', display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUpIcon sx={{ color: '#8b5cf6', fontSize: 20 }} />
                Report Features
              </Typography>              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <List dense>
                    <ListItem sx={{ 
                      borderRadius: 1, 
                      transition: 'all 0.2s ease',
                      '&:hover': { bgcolor: 'rgba(139, 92, 246, 0.05)', transform: 'translateX(4px)' }
                    }}>
                      <ListItemText
                        primary="📊 Main data sheet with selected columns"
                        primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                      />
                    </ListItem>
                    <ListItem sx={{ 
                      borderRadius: 1, 
                      transition: 'all 0.2s ease',
                      '&:hover': { bgcolor: 'rgba(139, 92, 246, 0.05)', transform: 'translateX(4px)' }
                    }}>
                      <ListItemText
                        primary="📈 Summary sheet with export overview"
                        primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                      />
                    </ListItem>
                    <ListItem sx={{ 
                      borderRadius: 1, 
                      transition: 'all 0.2s ease',
                      '&:hover': { bgcolor: 'rgba(139, 92, 246, 0.05)', transform: 'translateX(4px)' }
                    }}>
                      <ListItemText
                        primary="💰 Financial totals (VAT, discounts, totals)"
                        primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                      />
                    </ListItem>
                    <ListItem sx={{ 
                      borderRadius: 1, 
                      transition: 'all 0.2s ease',
                      '&:hover': { bgcolor: 'rgba(139, 92, 246, 0.05)', transform: 'translateX(4px)' }
                    }}>
                      <ListItemText
                        primary="📋 Total invoices and item quantities"
                        primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                      />
                    </ListItem>
                  </List>
                </Grid>
                <Grid item xs={12} md={6}>
                  <List dense>
                    <ListItem sx={{ 
                      borderRadius: 1, 
                      transition: 'all 0.2s ease',
                      '&:hover': { bgcolor: 'rgba(139, 92, 246, 0.05)', transform: 'translateX(4px)' }
                    }}>
                      <ListItemText
                        primary="🌍 Currency breakdown (if multiple currencies)"
                        primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                      />
                    </ListItem>
                    <ListItem sx={{ 
                      borderRadius: 1, 
                      transition: 'all 0.2s ease',
                      '&:hover': { bgcolor: 'rgba(139, 92, 246, 0.05)', transform: 'translateX(4px)' }
                    }}>
                      <ListItemText
                        primary="🏆 Top 10 customers by value"
                        primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                      />
                    </ListItem>
                    <ListItem sx={{ 
                      borderRadius: 1, 
                      transition: 'all 0.2s ease',
                      '&:hover': { bgcolor: 'rgba(139, 92, 246, 0.05)', transform: 'translateX(4px)' }
                    }}>
                      <ListItemText
                        primary="💸 Amount columns always appear last"
                        primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                      />
                    </ListItem>
                    <ListItem sx={{ 
                      borderRadius: 1, 
                      transition: 'all 0.2s ease',
                      '&:hover': { bgcolor: 'rgba(139, 92, 246, 0.05)', transform: 'translateX(4px)' }
                    }}>
                      <ListItemText
                        primary="🧮 Auto-calculated totals row with SUM formulas"
                        primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                      />
                    </ListItem>
                  </List>
                </Grid>
              </Grid>            </Paper>
          </Fade>

          <Alert
            severity="info"
            icon={<InfoIcon />}
            sx={{
              mt: 2,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
              border: '1px solid #2196f3',
              '& .MuiAlert-icon': { color: '#1976d2' },
              '& .MuiAlert-message': { fontWeight: 500 },
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)'
              }
            }}
          >
            <Typography variant="body2">
              <strong>Smart Column Ordering:</strong> Financial columns (VAT Amount, Discount Amount, Total Amount)
              will automatically appear at the end of your report for better readability and analysis.
            </Typography>
          </Alert>
        </CardContent>
      </Card>
    </Grow>
  );
}
