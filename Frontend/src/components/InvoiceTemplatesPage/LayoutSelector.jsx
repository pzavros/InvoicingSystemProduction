import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Stack,
  Paper,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  BusinessCenter as BusinessIcon,
  AutoAwesome as CreativeIcon,
  Architecture as ModernIcon,
  AccountBalance as ProfessionalIcon,
  CheckCircle as SimpleIcon,
  Visibility as PreviewIcon
} from '@mui/icons-material';
import { INVOICE_LAYOUTS } from '../../utils/invoiceLayouts';

const LayoutSelector = ({ onSelectLayout, selectedLayout }) => {
  const [hoveredLayout, setHoveredLayout] = useState(null);

  const getLayoutIcon = (layoutId) => {
    switch (layoutId) {
      case 'classic':
        return <BusinessIcon sx={{ fontSize: 40 }} />;
      case 'modern':
        return <ModernIcon sx={{ fontSize: 40 }} />;
      case 'creative':
        return <CreativeIcon sx={{ fontSize: 40 }} />;
      case 'professional':
        return <ProfessionalIcon sx={{ fontSize: 40 }} />;
      case 'simple':
        return <SimpleIcon sx={{ fontSize: 40 }} />;
      default:
        return <BusinessIcon sx={{ fontSize: 40 }} />;
    }
  };

  const getLayoutFeatures = (layout) => {
    const features = [];
    
    if (layout.structure.header.logoSpace) features.push('Logo Space');
    if (layout.structure.totals.showTax) features.push('Tax Support');
    if (layout.structure.itemsTable.showSubtotals) features.push('Subtotals');
    if (layout.structure.footer.includeLegal) features.push('Legal Text');
    if (layout.structure.itemsTable.style.includes('detailed')) features.push('Detailed Items');
    if (layout.structure.companyInfo.position.includes('sidebar')) features.push('Sidebar Layout');
    
    return features.slice(0, 3); // Show max 3 features
  };

  return (
    <Box>
      <Box mb={3}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1f2937', mb: 1 }}>
          Choose Your Layout
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Select the structure and organization that best fits your business style
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {Object.values(INVOICE_LAYOUTS).map((layout) => (
          <Grid item xs={12} sm={6} md={4} key={layout.id}>
            <Card
              elevation={selectedLayout === layout.id ? 6 : 2}
              sx={{
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                border: selectedLayout === layout.id 
                  ? '3px solid #2563eb' 
                  : '2px solid transparent',
                background: selectedLayout === layout.id
                  ? 'linear-gradient(145deg, #eff6ff 0%, #dbeafe 100%)'
                  : 'white',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 24px rgba(0,0,0,0.15)'
                }
              }}
              onMouseEnter={() => setHoveredLayout(layout.id)}
              onMouseLeave={() => setHoveredLayout(null)}
              onClick={() => onSelectLayout(layout.id)}
            >
              <CardContent sx={{ p: 3 }}>
                {/* Layout Icon and Selection Status */}
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Box
                    sx={{
                      color: selectedLayout === layout.id ? '#2563eb' : '#6b7280',
                      transition: 'color 0.3s ease'
                    }}
                  >
                    {getLayoutIcon(layout.id)}
                  </Box>
                  {selectedLayout === layout.id && (
                    <Chip
                      label="Selected"
                      color="primary"
                      size="small"
                      sx={{ fontWeight: 'bold' }}
                    />
                  )}
                </Box>

                {/* Layout Name and Description */}
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 'bold', 
                    mb: 1,
                    color: selectedLayout === layout.id ? '#2563eb' : '#1f2937'
                  }}
                >
                  {layout.name}
                </Typography>

                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ 
                    mb: 2,
                    lineHeight: 1.5,
                    minHeight: 40,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}
                >
                  {layout.description}
                </Typography>

                {/* Layout Features */}
                <Box mb={2}>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {getLayoutFeatures(layout).map((feature) => (
                      <Chip
                        key={feature}
                        label={feature}
                        size="small"
                        variant="outlined"
                        sx={{
                          fontSize: '0.7rem',
                          height: 24,
                          color: selectedLayout === layout.id ? '#2563eb' : '#6b7280',
                          borderColor: selectedLayout === layout.id ? '#2563eb' : '#d1d5db'
                        }}
                      />
                    ))}
                  </Stack>
                </Box>

                {/* Layout Structure Preview */}
                <Paper
                  elevation={1}
                  sx={{
                    p: 2,
                    mb: 2,
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: 2
                  }}
                >
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                    Structure Preview:
                  </Typography>
                  <Box mt={1}>
                    {/* Mini layout representation */}
                    <Box
                      sx={{
                        height: 60,
                        background: 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)',
                        borderRadius: 1,
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                    >
                      {/* Header representation based on layout */}
                      <Box
                        sx={{
                          height: layout.structure.header.height === 'large' ? '35%' : 
                                  layout.structure.header.height === 'medium' ? '25%' : '20%',
                          background: selectedLayout === layout.id 
                            ? 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)'
                            : 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                          mb: 0.5
                        }}
                      />
                      
                      {/* Content sections representation */}
                      <Box display="flex" gap={0.5} px={0.5}>
                        {layout.structure.companyInfo.position.includes('sidebar') ? (
                          <>
                            <Box sx={{ width: '30%', height: 20, background: '#cbd5e1', borderRadius: 0.5 }} />
                            <Box sx={{ width: '70%', height: 20, background: '#e2e8f0', borderRadius: 0.5 }} />
                          </>
                        ) : (
                          <>
                            <Box sx={{ width: '50%', height: 15, background: '#cbd5e1', borderRadius: 0.5 }} />
                            <Box sx={{ width: '50%', height: 15, background: '#e2e8f0', borderRadius: 0.5 }} />
                          </>
                        )}
                      </Box>
                    </Box>
                  </Box>
                </Paper>

                {/* Action Buttons */}
                <Box display="flex" gap={1} justifyContent="center">
                  <Button
                    variant={selectedLayout === layout.id ? "contained" : "outlined"}
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectLayout(layout.id);
                    }}
                    sx={{
                      flex: 1,
                      textTransform: 'none',
                      fontWeight: 600
                    }}
                  >
                    {selectedLayout === layout.id ? 'Selected' : 'Select'}
                  </Button>
                  
                  <Tooltip title="Preview Layout">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        // TODO: Open layout preview modal
                        console.log('Preview layout:', layout.id);
                      }}
                      sx={{
                        color: '#6b7280',
                        border: '1px solid #d1d5db',
                        '&:hover': {
                          color: '#2563eb',
                          borderColor: '#2563eb',
                          backgroundColor: 'rgba(37, 99, 235, 0.1)'
                        }
                      }}
                    >
                      <PreviewIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default LayoutSelector;
