# Report Columns Reference

This document lists all available columns in the Reports system and their data sources.

## Available Columns

### Invoice Information
| Column ID | Label | Data Source | Type |
|-----------|-------|-------------|------|
| `invoiceNumber` | Invoice # | `invoice.invoiceNumber` | Text |
| `date` | Invoice Date | `invoice.dateOfIssue` | Date |
| `dueDate` | Due Date | `invoice.dueDate` | Date |
| `status` | Status | `invoice.statusName` | Status Chip |
| `totalAmount` | Total Amount | `invoice.total` | Currency |
| `invoiceNotes` | Notes | `invoice.notes` | Text |

### Customer Information
| Column ID | Label | Data Source | Type |
|-----------|-------|-------------|------|
| `customer` | Customer | `invoice.billTo` | Text |
| `billToEmail` | Customer Email | `invoice.billToEmail` | Text |
| `billToAddress` | Customer Address | `invoice.billToAddress` | Text |

### Item/Line Details (per invoice item)
| Column ID | Label | Data Source | Type |
|-----------|-------|-------------|------|
| `itemTitle` | Item Title | `item.title` or `item.productName` | Text |
| `itemDescription` | Item Description | `item.description` | Text |
| `quantity` | Quantity | `item.quantity` | Number |
| `unitPrice` | Unit Price | `item.unitPrice` | Currency |
| `subtotal` | Subtotal | `quantity × unitPrice` | Currency |
| `vatAmount` | VAT Amount | Calculated from `item.taxRate` | Currency |
| `discountAmount` | Discount Amount | Not available yet | Currency |

## Important Notes

### Data Flattening
- The report **flattens invoice items** into individual rows
- Each invoice item creates a separate row in the report
- Invoice-level data (invoice #, customer, status, etc.) is repeated for each item
- If an invoice has 3 items, it will appear as 3 rows in the report

### Default Selected Columns
```javascript
[
  'invoiceNumber',
  'date',
  'customer',
  'billToEmail',
  'status',
  'totalAmount'
]
```

### Column Name Consistency
- **DO NOT** use old column names: `clientName`, `clientEmail`, `amount`, `taxAmount`, etc.
- **ALWAYS** use the column IDs listed in this document
- Column IDs match the backend `ReportColumns` constants for Excel export

### Backend Integration
- Excel Export: Uses `/api/Reports/logistics` endpoint
- Screen Display: Uses `/api/Invoices` endpoint with frontend transformation
- Both paths filter by logged-in user's `userId`

## Status Values
- Draft (statusId: 1)
- Pending (statusId: 2)
- Paid (statusId: 3)
- Overdue (statusId: 4)

## Future Enhancements
- Add `discountAmount` to invoice item schema
- Add payment method tracking
- Add more aggregation options for multi-item invoices
