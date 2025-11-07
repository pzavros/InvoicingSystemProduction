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
  
  // Column definitions matching backend ReportColumns
  const availableColumns = [
    { id: 'invoiceNumber', label: 'Invoice #' },
    { id: 'date', label: 'Date' },
    { id: 'customer', label: 'Customer' },
    { id: 'itemTitle', label: 'Item Title' },
    { id: 'status', label: 'Status' },
    { id: 'vatAmount', label: 'VAT Amount' },
    { id: 'discountAmount', label: 'Discount Amount' },
    { id: 'totalAmount', label: 'Total Amount (EUR)' },
    { id: 'itemDescription', label: 'Item Description' },
    { id: 'quantity', label: 'Quantity' },
    { id: 'unitPrice', label: 'Unit Price' },
    { id: 'subtotal', label: 'Subtotal' },
    { id: 'invoiceNotes', label: 'Notes' },
    { id: 'dueDate', label: 'Due Date' },
    { id: 'billToEmail', label: 'Customer Email' },
    { id: 'billToAddress', label: 'Customer Address' }
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
    <Grid container direction="column">
      <Grid item>
        <Typography variant="body2" sx={{ 
          mb: 2, 
          lineHeight: 1.6,
          color: 'rgba(15, 23, 42, 0.65)',
          fontSize: '0.875rem'
        }}>
          Choose and reorder columns for your report by dragging them
        </Typography>
      </Grid>

      {/* Selected Columns - Draggable to reorder */}
      {selectedColumns.length > 0 && (
        <Grid item sx={{ mb: 2 }}>
          <Typography 
            variant="caption" 
            sx={{ 
              fontWeight: 600, 
              color: 'rgba(15, 23, 42, 0.75)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontSize: '0.7rem',
              display: 'block',
              mb: 1.5
            }}
          >
            Selected Columns (Drag to reorder)
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
                  py: 1,
                  px: 1.5,
                  mb: 1,
                  borderRadius: '12px',
                  backgroundColor: draggedIndex === index 
                    ? 'rgba(139, 92, 246, 0.08)' 
                    : 'white',
                  cursor: 'move',
                  border: '1px solid',
                  borderColor: draggedIndex === index ? '#8b5cf6' : 'rgba(15, 23, 42, 0.08)',
                  boxShadow: draggedIndex === index 
                    ? '0 4px 12px rgba(139, 92, 246, 0.15)' 
                    : 'none',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(15, 23, 42, 0.02)',
                    borderColor: 'rgba(15, 23, 42, 0.15)',
                    boxShadow: '0 2px 8px rgba(15, 23, 42, 0.06)',
                    transform: 'translateX(4px)'
                  }
                }}
              >
                <DragIcon sx={{ fontSize: 18, color: 'rgba(15, 23, 42, 0.55)', mr: 1.5 }} />
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: '6px',
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 1.5,
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: 'white'
                  }}
                >
                  {index + 1}
                </Box>
                <Typography variant="body2" sx={{ 
                  fontSize: '0.875rem', 
                  flex: 1, 
                  fontWeight: 500, 
                  color: 'rgba(15, 23, 42, 0.85)'
                }}>
                  {getColumnLabel(columnId)}
                </Typography>
                <Checkbox
                  checked={true}
                  onChange={() => handleColumnToggle(columnId)}
                  size="small"
                  sx={{
                    p: 0,
                    color: 'rgba(15, 23, 42, 0.25)',
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

      <Divider sx={{ my: 2, borderColor: 'rgba(15, 23, 42, 0.08)' }} />

      {/* Available Columns */}
      <Grid item>
        <Typography 
          variant="caption" 
          sx={{ 
            fontWeight: 600, 
            color: 'rgba(15, 23, 42, 0.65)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            fontSize: '0.7rem',
            display: 'block',
            mb: 1.5
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
                        color: 'rgba(15, 23, 42, 0.25)',
                        '&.Mui-checked': {
                          color: '#8b5cf6',
                        },
                      }}
                    />
                  }
                  label={
                    <Typography variant="body2" sx={{ 
                      fontSize: '0.875rem', 
                      fontWeight: 500, 
                      color: 'rgba(15, 23, 42, 0.75)'
                    }}>
                      {column.label}
                    </Typography>
                  }
                  sx={{ 
                    m: 0,
                    py: 0.75,
                    pl: 1.5,
                    pr: 1,
                    borderRadius: '12px',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(15, 23, 42, 0.02)',
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
