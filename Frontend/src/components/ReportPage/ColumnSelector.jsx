// src/components/ReportPage/ColumnSelector.jsx
import React, { useState } from "react";
import {
  Grid,
  Typography,
  FormControlLabel,
  Checkbox,
  Box,
  IconButton,
  Divider
} from "@mui/material";
import {
  ViewColumn as ColumnIcon,
  DragIndicator as DragIcon
} from "@mui/icons-material";

const ColumnSelector = ({ selectedColumns, onColumnsChange }) => {
  const [draggedIndex, setDraggedIndex] = useState(null);
  
  // Column definitions for invoice report (one row per invoice)
  const availableColumns = [
    { id: 'invoiceNumber', label: 'Invoice #' },
    { id: 'date', label: 'Invoice Date' },
    { id: 'dueDate', label: 'Due Date' },
    { id: 'status', label: 'Status' },
    { id: 'customer', label: 'Customer Name' },
    { id: 'billToEmail', label: 'Customer Email' },
    { id: 'billToAddress', label: 'Customer Address' },
    { id: 'itemCount', label: 'Number of Items' },
    { id: 'totalQuantity', label: 'Total Quantity' },
    { id: 'subtotal', label: 'Subtotal (Before Tax)' },
    { id: 'vatAmount', label: 'VAT Amount' },
    { id: 'discountAmount', label: 'Discount Amount' },
    { id: 'totalAmount', label: 'Total Amount' },
    { id: 'invoiceNotes', label: 'Invoice Notes' }
  ];

  const handleColumnToggle = (columnId) => {
    if (selectedColumns.includes(columnId)) {
      onColumnsChange(selectedColumns.filter(col => col !== columnId));
    } else {
      onColumnsChange([...selectedColumns, columnId]);
    }
  };

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    const newColumns = [...selectedColumns];
    const draggedColumn = newColumns[draggedIndex];
    newColumns.splice(draggedIndex, 1);
    newColumns.splice(dropIndex, 0, draggedColumn);
    
    onColumnsChange(newColumns);
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // Get label for a column ID
  const getColumnLabel = (columnId) => {
    const column = availableColumns.find(col => col.id === columnId);
    return column ? column.label : columnId;
  };

  return (
    <Grid container direction="column" sx={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif'
    }}>
      <Grid item>
        <Typography variant="body2" sx={{ 
          mb: 2.5, 
          lineHeight: 1.5,
          color: '#86868b',
          fontSize: '0.9375rem',
          fontWeight: 400,
          letterSpacing: '-0.01em'
        }}>
          Choose and reorder columns for your report by dragging them
        </Typography>
      </Grid>

      {/* Selected Columns - Draggable to reorder */}
      {selectedColumns.length > 0 && (
        <Grid item sx={{ mb: 2.5 }}>
          <Typography 
            variant="caption" 
            sx={{ 
              fontWeight: 600, 
              color: '#1d1d1f',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              fontSize: '0.6875rem',
              display: 'block',
              mb: 2
            }}
          >
            Selected Columns
          </Typography>
          <Box sx={{ mt: 1 }}>
            {selectedColumns.map((columnId, index) => (
              <Box
                key={columnId}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  py: 1.25,
                  px: 2,
                  mb: 1,
                  borderRadius: '12px',
                  backgroundColor: draggedIndex === index 
                    ? 'rgba(139, 92, 246, 0.08)' 
                    : 'white',
                  cursor: 'move',
                  border: '0.5px solid',
                  borderColor: draggedIndex === index ? '#8b5cf6' : 'rgba(0, 0, 0, 0.08)',
                  boxShadow: draggedIndex === index 
                    ? '0 4px 16px rgba(139, 92, 246, 0.15)' 
                    : 'none',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    backgroundColor: draggedIndex === index ? 'rgba(139, 92, 246, 0.08)' : 'rgba(0, 0, 0, 0.02)',
                    borderColor: draggedIndex === index ? '#8b5cf6' : 'rgba(0, 0, 0, 0.12)',
                    transform: 'translateX(4px)'
                  },
                  '&:active': {
                    transform: 'scale(0.99)'
                  }
                }}
              >
                <DragIcon sx={{ fontSize: 20, color: '#86868b', mr: 2 }} />
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: '8px',
                    background: '#8b5cf6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2,
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    color: 'white',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif'
                  }}
                >
                  {index + 1}
                </Box>
                <Typography variant="body2" sx={{ 
                  fontSize: '0.9375rem', 
                  flex: 1, 
                  fontWeight: 400, 
                  color: '#1d1d1f',
                  letterSpacing: '-0.01em'
                }}>
                  {getColumnLabel(columnId)}
                </Typography>
                <Checkbox
                  checked={true}
                  onChange={() => handleColumnToggle(columnId)}
                  size="small"
                  sx={{
                    p: 0,
                    color: 'rgba(0, 0, 0, 0.2)',
                    '&.Mui-checked': {
                      color: '#8b5cf6',
                    },
                  }}
                />
              </Box>
            ))}
          </Box>
        </Grid>
      )}

      <Divider sx={{ my: 3, borderColor: 'rgba(0, 0, 0, 0.08)' }} />

      {/* Available Columns */}
      <Grid item>
        <Typography 
          variant="caption" 
          sx={{ 
            fontWeight: 600, 
            color: '#1d1d1f',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            fontSize: '0.6875rem',
            display: 'block',
            mb: 2
          }}
        >
          Available Columns
        </Typography>
        <Grid container direction="column" sx={{ mt: 1 }}>
          {availableColumns
            .filter(column => !selectedColumns.includes(column.id))
            .map((column) => (
              <Grid item key={column.id}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={false}
                      onChange={() => handleColumnToggle(column.id)}
                      size="small"
                      sx={{
                        color: 'rgba(0, 0, 0, 0.2)',
                        '&.Mui-checked': {
                          color: '#8b5cf6',
                        },
                      }}
                    />
                  }
                  label={
                    <Typography variant="body2" sx={{ 
                      fontSize: '0.9375rem', 
                      fontWeight: 400, 
                      color: '#1d1d1f',
                      letterSpacing: '-0.01em'
                    }}>
                      {column.label}
                    </Typography>
                  }
                  sx={{ 
                    m: 0,
                    py: 1,
                    pl: 2,
                    pr: 1.5,
                    borderRadius: '12px',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.02)',
                      transform: 'translateX(4px)'
                    }
                  }}
                />
              </Grid>
            ))}
        </Grid>
      </Grid>
    </Grid>
  );
};

export default ColumnSelector;
