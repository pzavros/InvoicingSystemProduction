import React, { useState } from "react";
import {
  Container, Typography, Box, Grid
} from "@mui/material";
import TableChartIcon from '@mui/icons-material/TableChart';
import ExportFiltersSection from "../components/ReportPage/ExportFiltersSection";
import ColumnSelectionSection from "../components/ReportPage/ColumnSelectionSection";
import { downloadLogisticsReport } from "../components/ReportPage/api";

export default function ReportsPage() {
  const today = new Date();
  const [from, setFrom] = useState(today);
  const [to, setTo] = useState(today);
  const [statusIds, setStatusIds] = useState([1, 2, 3, 4]); // All statuses
  
  // Available columns with their display names and categories
  const availableColumns = {
    // Core Information
    invoiceNumber: { label: "Invoice #", category: "Core", essential: true },
    date: { label: "Date", category: "Core", essential: true },
    customer: { label: "Customer", category: "Core", essential: true },
    itemTitle: { label: "Item Title", category: "Core", essential: true },
    status: { label: "Status", category: "Core", essential: true },

    // Financial Data
    vatAmount: { label: "VAT Amount", category: "Financial", essential: true },
    discountAmount: { label: "Discount Amount", category: "Financial", essential: true },
    totalAmount: { label: "Total Amount (EUR)", category: "Financial", essential: true },
    subtotal: { label: "Subtotal", category: "Financial", essential: false },
    unitPrice: { label: "Unit Price", category: "Financial", essential: false },

    // Item Details
    itemDescription: { label: "Item Description", category: "Details", essential: false },
    quantity: { label: "Quantity", category: "Details", essential: false },

    // Additional Information
    invoiceNotes: { label: "Notes", category: "Additional", essential: false },
    dueDate: { label: "Due Date", category: "Additional", essential: false },
    billToEmail: { label: "Customer Email", category: "Additional", essential: false },
    billToAddress: { label: "Customer Address", category: "Additional", essential: false }
  };

  const columnCategories = {
    "Core": { color: "primary", icon: "📋" },
    "Financial": { color: "success", icon: "💰" },
    "Details": { color: "info", icon: "📝" },
    "Additional": { color: "secondary", icon: "➕" }
  };

  // Default selected columns (the original 8)
  const [selectedColumns, setSelectedColumns] = useState([
    "invoiceNumber", "date", "customer", "itemTitle", "status", "vatAmount", "discountAmount", "totalAmount"
  ]);

  const handleFiltersChange = (newFrom, newTo, newStatusIds) => {
    setFrom(newFrom);
    setTo(newTo);
    setStatusIds(newStatusIds);
  };

  const handleColumnToggle = (columnKey) => {
    setSelectedColumns(prev =>
      prev.includes(columnKey)
        ? prev.filter(col => col !== columnKey)
        : [...prev, columnKey]
    );
  };

  const handleSelectAll = () => {
    setSelectedColumns(Object.keys(availableColumns));
  };

  const handleClearAll = () => {
    setSelectedColumns([]);
  };

  const handleResetDefault = () => {
    setSelectedColumns([
      "invoiceNumber", "date", "customer", "itemTitle", "status", "vatAmount", "discountAmount", "totalAmount"
    ]);
  };

  const handleExport = async () => {
    try {
      await downloadLogisticsReport({ from, to, statusIds, columns: selectedColumns });
    } catch (err) {
      console.error(err);
      alert("Could not download report. Check console.");
    }
  };
  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <TableChartIcon sx={{ fontSize: 32, color: 'primary.main', mr: 2 }} />
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Logistics Export Report
        </Typography>
      </Box>      {/* Export Configuration (Wider) and Column Selection */}
      <Grid container spacing={3} sx={{ minHeight: '600px', alignItems: 'stretch' }}>
        {/* Export Filters Section - Wider */}
        <Grid item xs={12} lg={7} sx={{ display: 'flex' }}>
          <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
            <ExportFiltersSection
              from={from}
              to={to}
              statusIds={statusIds}
              selectedColumns={selectedColumns}
              availableColumns={availableColumns}
              onFiltersChange={handleFiltersChange}
              onExport={handleExport}
            />
          </Box>
        </Grid>

        {/* Column Selection Section - Narrower */}
        <Grid item xs={12} lg={5} sx={{ display: 'flex' }}>
          <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
            <ColumnSelectionSection
              selectedColumns={selectedColumns}
              availableColumns={availableColumns}
              columnCategories={columnCategories}
              onColumnToggle={handleColumnToggle}
              onSelectAll={handleSelectAll}
              onClearAll={handleClearAll}
              onResetDefault={handleResetDefault}
            />
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
}
