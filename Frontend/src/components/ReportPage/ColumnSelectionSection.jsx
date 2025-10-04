import React, { useState } from "react";
import {
  Typography, Box, Paper, FormGroup, FormControlLabel, Checkbox,
  Alert, Chip, Grid, Card, ButtonGroup, Tooltip, Button, Fade, Grow, 
  LinearProgress, Stack, IconButton, Tabs, Tab, Switch, Divider
} from "@mui/material";
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import SelectAllIcon from '@mui/icons-material/SelectAll';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import RestoreIcon from '@mui/icons-material/Restore';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import StarIcon from '@mui/icons-material/Star';
import StarOutlineIcon from '@mui/icons-material/StarOutline';

export default function ColumnSelectionSection({
  selectedColumns,
  availableColumns,
  columnCategories,
  onColumnToggle,
  onSelectAll,
  onClearAll,
  onResetDefault
}) {
  const [viewMode, setViewMode] = useState('simple'); // 'simple' or 'category'
  const [showOnlyEssential, setShowOnlyEssential] = useState(false);

  const essentialColumnsCount = selectedColumns.filter(col => availableColumns[col]?.essential).length;
  const optionalColumnsCount = selectedColumns.filter(col => !availableColumns[col]?.essential).length;
  const totalColumns = Object.keys(availableColumns).length;
  const completionPercentage = (selectedColumns.length / totalColumns) * 100;

  // Get all columns as a flat array
  const allColumnsArray = Object.entries(availableColumns)
    .filter(([_, columnInfo]) => showOnlyEssential ? columnInfo.essential : true)
    .sort(([a, aInfo], [b, bInfo]) => {
      // Sort by essential first, then alphabetically
      if (aInfo.essential && !bInfo.essential) return -1;
      if (!aInfo.essential && bInfo.essential) return 1;
      return aInfo.label.localeCompare(bInfo.label);
    });

  return (
    <Grow in={true} timeout={800}>
      <Card 
        elevation={3}
        sx={{ 
          height: '100%',
          minHeight: '600px',
          borderRadius: 3,
          background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
          border: '1px solid rgba(99, 102, 241, 0.1)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header */}
        <Box sx={{ 
          p: 3, 
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          color: 'white',
          borderRadius: '12px 12px 0 0'
        }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <ViewColumnIcon sx={{ fontSize: 28 }} />
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Select Report Columns
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Choose which data to include in your export
              </Typography>
            </Box>
            <Chip 
              label={`${selectedColumns.length} selected`} 
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)', 
                color: 'white',
                fontWeight: 'bold'
              }} 
            />
          </Stack>
        </Box>

        {/* Content */}
        <Box sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Progress and Quick Actions */}
          <Paper 
            elevation={1} 
            sx={{ 
              p: 3, 
              mb: 3, 
              borderRadius: 2,
              background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
              border: '1px solid rgba(99, 102, 241, 0.1)'
            }}
          >
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#374151' }}>
                  Selection Progress
                </Typography>
                <Typography variant="body2" fontWeight="bold" color="primary.main">
                  {selectedColumns.length} / {totalColumns} columns
                </Typography>
              </Box>
              
              <LinearProgress 
                variant="determinate" 
                value={completionPercentage} 
                sx={{ 
                  height: 8, 
                  borderRadius: 4,
                  bgcolor: 'rgba(99, 102, 241, 0.1)',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 4,
                    background: completionPercentage > 50 
                      ? 'linear-gradient(90deg, #10b981 0%, #059669 100%)'
                      : 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)'
                  }
                }}
              />

              <Stack direction="row" spacing={2} alignItems="center">
                <Chip 
                  icon={<StarIcon />}
                  label={`${essentialColumnsCount} Essential`}
                  color="success"
                  size="small"
                  variant="filled"
                />
                <Chip 
                  icon={<InfoIcon />}
                  label={`${optionalColumnsCount} Optional`}
                  color="info"
                  size="small"
                  variant="outlined"
                />
              </Stack>
            </Stack>
          </Paper>

          {/* Quick Action Buttons */}
          <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
            <Button
              variant="contained"
              startIcon={<SelectAllIcon />}
              onClick={onSelectAll}
              sx={{ 
                bgcolor: '#10b981',
                '&:hover': { bgcolor: '#059669' },
                borderRadius: 2
              }}
            >
              Select All
            </Button>
            <Button
              variant="outlined"
              startIcon={<ClearAllIcon />}
              onClick={onClearAll}
              sx={{ 
                borderColor: '#ef4444',
                color: '#ef4444',
                '&:hover': { 
                  borderColor: '#dc2626',
                  color: '#dc2626',
                  bgcolor: 'rgba(239, 68, 68, 0.05)'
                },
                borderRadius: 2
              }}
            >
              Clear All
            </Button>
            <Button
              variant="outlined"
              startIcon={<RestoreIcon />}
              onClick={onResetDefault}
              sx={{ 
                borderColor: '#6366f1',
                color: '#6366f1',
                '&:hover': { 
                  borderColor: '#5856eb',
                  color: '#5856eb',
                  bgcolor: 'rgba(99, 102, 241, 0.05)'
                },
                borderRadius: 2
              }}
            >
              Reset Default
            </Button>
          </Stack>

          {/* Filter Options */}
          <Stack direction="row" spacing={3} alignItems="center" sx={{ mb: 3 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={showOnlyEssential}
                  onChange={(e) => setShowOnlyEssential(e.target.checked)}
                  color="primary"
                />
              }
              label="Show only essential columns"
            />
            <Divider orientation="vertical" flexItem />
            <Tabs 
              value={viewMode} 
              onChange={(e, newValue) => setViewMode(newValue)}
              sx={{ minHeight: 'auto' }}
            >
              <Tab label="Simple List" value="simple" sx={{ minHeight: 'auto', py: 1 }} />
              <Tab label="By Category" value="category" sx={{ minHeight: 'auto', py: 1 }} />
            </Tabs>
          </Stack>

          {selectedColumns.length === 0 && (
            <Alert 
              severity="warning" 
              icon={<WarningIcon />}
              sx={{ 
                mb: 3,
                borderRadius: 2,
                fontWeight: 500
              }}
            >
              Please select at least one column for the report.
            </Alert>
          )}

          {/* Column Selection */}
          <Box sx={{ flex: 1, overflow: 'auto' }}>
            {viewMode === 'simple' ? (
              <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
                <Grid container spacing={1}>
                  {allColumnsArray.map(([key, columnInfo]) => (
                    <Grid item xs={12} sm={6} key={key}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={selectedColumns.includes(key)}
                            onChange={() => onColumnToggle(key)}
                            sx={{ 
                              '&.Mui-checked': { 
                                color: columnInfo.essential ? '#10b981' : '#6366f1'
                              }
                            }}
                          />
                        }
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                            {columnInfo.essential && (
                              <StarIcon sx={{ color: '#10b981', fontSize: 16, mr: 1 }} />
                            )}
                            <Typography variant="body2" sx={{ fontWeight: columnInfo.essential ? 600 : 400 }}>
                              {columnInfo.label}
                            </Typography>
                          </Box>
                        }
                        sx={{
                          width: '100%',
                          m: 0,
                          p: 1,
                          borderRadius: 1,
                          border: columnInfo.essential ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid transparent',
                          bgcolor: columnInfo.essential ? 'rgba(16, 185, 129, 0.05)' : 'transparent',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            bgcolor: columnInfo.essential ? 'rgba(16, 185, 129, 0.1)' : 'rgba(99, 102, 241, 0.05)',
                            transform: 'translateX(4px)'
                          }
                        }}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            ) : (
              <Grid container spacing={2}>
                {Object.entries(columnCategories).map(([categoryName, categoryInfo]) => {
                  const categoryColumns = Object.entries(availableColumns)
                    .filter(([_, columnInfo]) => columnInfo.category === categoryName)
                    .filter(([_, columnInfo]) => showOnlyEssential ? columnInfo.essential : true);

                  if (categoryColumns.length === 0) return null;

                  return (
                    <Grid item xs={12} sm={6} key={categoryName}>
                      <Paper
                        elevation={2}
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          border: `2px solid`,
                          borderColor: `${categoryInfo.color}.light`,
                          '&:hover': {
                            borderColor: `${categoryInfo.color}.main`,
                          }
                        }}
                      >
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: 'bold',
                            mb: 1,
                            color: `${categoryInfo.color}.dark`,
                            display: 'flex',
                            alignItems: 'center'
                          }}
                        >
                          <span style={{ marginRight: 8 }}>{categoryInfo.icon}</span>
                          {categoryName}
                        </Typography>
                        <FormGroup>
                          {categoryColumns.map(([key, columnInfo]) => (
                            <FormControlLabel
                              key={key}
                              control={
                                <Checkbox
                                  checked={selectedColumns.includes(key)}
                                  onChange={() => onColumnToggle(key)}
                                  size="small"
                                  sx={{
                                    color: `${categoryInfo.color}.main`,
                                    '&.Mui-checked': { 
                                      color: `${categoryInfo.color}.main`
                                    }
                                  }}
                                />
                              }
                              label={
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  {columnInfo.essential && (
                                    <StarIcon sx={{ color: '#10b981', fontSize: 14, mr: 1 }} />
                                  )}
                                  <Typography variant="body2" sx={{ fontWeight: columnInfo.essential ? 600 : 400 }}>
                                    {columnInfo.label}
                                  </Typography>
                                </Box>
                              }
                              sx={{
                                mb: 0.5,
                                borderRadius: 1,
                                '&:hover': {
                                  bgcolor: 'rgba(255,255,255,0.3)',
                                  transform: 'translateX(4px)'
                                }
                              }}
                            />
                          ))}
                        </FormGroup>
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>
            )}
          </Box>
        </Box>
      </Card>
    </Grow>
  );
}
