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
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
          Choose and reorder columns for your report by dragging them
        </Typography>
      </Grid>

      {/* Selected Columns - Draggable to reorder */}
      {selectedColumns.length > 0 && (
        <Grid item sx={{ mb: 2 }}>
          <Typography 
            variant="caption" 
            sx={{ 
              fontWeight: 'bold', 
              color: '#000000',
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
                  borderRadius: 2,
                  background: draggedIndex === index 
                    ? 'linear-gradient(135deg, #e0e7ff 0%, #ddd6fe 100%)' 
                    : 'linear-gradient(145deg, #ffffff 0%, #f9fafb 100%)',
                  cursor: 'move',
                  border: '1px solid',
                  borderColor: draggedIndex === index ? '#4f46e5' : 'rgba(79, 70, 229, 0.15)',
                  boxShadow: draggedIndex === index 
                    ? '0 4px 12px rgba(79, 70, 229, 0.25)' 
                    : '0 1px 3px rgba(0, 0, 0, 0.05)',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    backgroundColor: '#f3f4f6',
                    borderColor: '#4f46e5',
                    boxShadow: '0 2px 8px rgba(79, 70, 229, 0.15)',
                    transform: 'translateX(4px)'
                  }
                }}
              >
                <DragIcon sx={{ fontSize: 18, color: '#6b7280', mr: 1.5 }} />
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: '6px',
                    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 1.5,
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    color: 'white',
                    boxShadow: '0 2px 6px rgba(79, 70, 229, 0.3)'
                  }}
                >
                  {index + 1}
                </Box>
                <Typography variant="body2" sx={{ fontSize: '0.875rem', flex: 1, fontWeight: 'medium', color: '#374151' }}>
                  {getColumnLabel(columnId)}
                </Typography>
                <Checkbox
                  checked={true}
                  onChange={() => handleColumnToggle(columnId)}
                  size="small"
                  sx={{
                    p: 0,
                    '&.Mui-checked': {
                      color: '#4f46e5',
                    },
                  }}
                />
              </Box>
            ))}
          </Box>
        </Grid>
      )}

      <Divider sx={{ my: 2, borderColor: 'rgba(79, 70, 229, 0.1)' }} />

      {/* Available Columns */}
      <Grid item>
        <Typography 
          variant="caption" 
          sx={{ 
            fontWeight: 'bold', 
            color: '#6b7280',
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
                        '&.Mui-checked': {
                          color: '#4f46e5',
                        },
                      }}
                    />
                  }
                  label={
                    <Typography variant="body2" sx={{ fontSize: '0.875rem', fontWeight: 'medium', color: '#374151' }}>
                      {column.label}
                    </Typography>
                  }
                  sx={{ 
                    m: 0,
                    py: 0.75,
                    pl: 1.5,
                    pr: 1,
                    borderRadius: 2,
                    transition: 'all 0.2s',
                    '&:hover': {
                      backgroundColor: 'rgba(79, 70, 229, 0.04)',
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
