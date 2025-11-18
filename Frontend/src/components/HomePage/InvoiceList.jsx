import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  IconButton, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  TablePagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  Alert,
  Snackbar,
  Checkbox,
  Toolbar,
  Tooltip,
  alpha,
  TableSortLabel,
  FormGroup,
  FormControlLabel,
  FormLabel,
  ListItemText,
  Card,
  CardContent,
  CardActions,
  Divider,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { visuallyHidden } from '@mui/utils'; // Corrected import for TableSortLabel accessibility
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon, Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Visibility as ViewIcon, Receipt as ReceiptIcon, Lock as LockIcon } from '@mui/icons-material';
import { getAllInvoices, deleteInvoice, getAllStatuses, updateBulkInvoiceStatus } from '../InvoicePage/api';
import { getAllDocumentTypes } from '../DocumentTypePage/api';
import LoadingOverlay from '../ReusableComponents/LoadingOverlay';
import PageHelper from '../ReusableComponents/PageHelper';
import { pageHelpContent } from '../../config/pageHelpContent';
import { useDispatch } from 'react-redux';
import { formatDate } from '../ReusableComponents/dateUtils';
import UsageIndicator from '../SubscriptionPage/UsageIndicator';
import { useSubscription } from '../../utils/SubscriptionContext';
import PageLoader from '../ReusableComponents/PageLoader';

// Create status badges with different colors and modern styling
const StatusBadge = ({ status, documentCategory }) => {
  let color = 'default';
  let label = status || 'Unknown';
  let customStyles = {};
  
  // For Proforma/Quotation documents, use different labels
  const isProforma = documentCategory === 'Proforma';
  
  switch(status?.toLowerCase()) {
    case 'paid':
      color = 'success';
      label = isProforma ? 'Completed' : 'Paid'; // Proforma shows "Completed" instead of "Paid"
      customStyles = {
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        color: '#059669',
        border: '1px solid rgba(16, 185, 129, 0.2)',
        fontWeight: 600
      };
      break;
    case 'unpaid':
      color = 'warning';
      label = isProforma ? 'Pending' : 'Unpaid'; // Proforma shows "Pending" instead of "Unpaid"
      customStyles = {
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        color: '#d97706',
        border: '1px solid rgba(245, 158, 11, 0.2)',
        fontWeight: 600
      };
      break;
    case 'overdue':
      color = 'error';
      label = isProforma ? 'Expired' : 'Overdue'; // Proforma shows "Expired" instead of "Overdue"
      customStyles = {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        color: '#dc2626',
        border: '1px solid rgba(239, 68, 68, 0.2)',
        fontWeight: 600
      };
      break;
    case 'draft':
      color = 'default';
      label = isProforma ? 'Draft' : 'Draft'; // Both show "Draft"
      customStyles = {
        backgroundColor: 'rgba(107, 114, 128, 0.1)',
        color: '#4b5563',
        border: '1px solid rgba(107, 114, 128, 0.2)',
        fontWeight: 600
      };
      break;
    case 'deleted':
      color = 'error';
      label = 'Deleted'; // Both show "Deleted"
      customStyles = {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        color: '#dc2626',
        border: '1px solid rgba(239, 68, 68, 0.2)',
        fontWeight: 600
      };
      break;
    default:
      color = 'primary';
      customStyles = {
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        color: '#2563eb',
        border: '1px solid rgba(59, 130, 246, 0.2)',
        fontWeight: 600
      };
  }
  
  return (
    <Chip 
      label={label} 
      size="small" 
      sx={{
        ...customStyles,
        borderRadius: 2,
        fontSize: '0.75rem',
        textTransform: 'capitalize',
        minWidth: '80px',
        '& .MuiChip-label': {
          px: 1.5,
          py: 0.5
        }
      }}
    />
  );
};

const DOCUMENT_TYPE_BASE_STYLES = {
  default: {
    label: 'Invoice',
    color: '#2563eb',
    backgroundColor: 'rgba(37, 99, 235, 0.12)',
    border: '1px solid rgba(37, 99, 235, 0.25)',
    category: 'Invoice' // Default category
  },
  1: {
    label: 'Invoice',
    color: '#2563eb',
    backgroundColor: 'rgba(37, 99, 235, 0.12)',
    border: '1px solid rgba(37, 99, 235, 0.25)',
    category: 'Invoice'
  },
  2: {
    label: 'Tax Invoice',
    color: '#047857',
    backgroundColor: 'rgba(4, 120, 87, 0.12)',
    border: '1px solid rgba(4, 120, 87, 0.25)',
    category: 'Invoice'
  },
  3: {
    label: 'Proforma Invoice',
    color: '#7c3aed',
    backgroundColor: 'rgba(124, 58, 237, 0.12)',
    border: '1px solid rgba(124, 58, 237, 0.25)',
    category: 'Proforma'
  },
  4: {
    label: 'Quotation',
    color: '#d97706',
    backgroundColor: 'rgba(217, 119, 6, 0.12)',
    border: '1px solid rgba(217, 119, 6, 0.25)',
    category: 'Proforma'
  },
  5: {
    label: 'Cash Invoice',
    color: '#059669',
    backgroundColor: 'rgba(5, 150, 105, 0.12)',
    border: '1px solid rgba(5, 150, 105, 0.25)',
    category: 'Invoice'
  }
};

// Sorting helper functions
function descendingComparator(a, b, orderBy) {
  let valA = a[orderBy];
  let valB = b[orderBy];

  if (valA == null && valB == null) return 0;
  if (valA == null) return 1;
  if (valB == null) return -1;

  if (orderBy === 'dateOfIssue') {
    const dateA = new Date(valA);
    const dateB = new Date(valB);
    if (dateB < dateA) return -1;
    if (dateB > dateA) return 1;
    return 0;
  } else if (orderBy === 'total') {
    const numA = parseFloat(valA);
    const numB = parseFloat(valB);
    if (numB < numA) return -1;
    if (numB > numA) return 1;
    return 0;
  } else if (typeof valA === 'string' && typeof valB === 'string') {
    return valB.toLowerCase().localeCompare(valA.toLowerCase());
  } else {
    if (valB < valA) return -1;
    if (valB > valA) return 1;
    return 0;
  }
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

const headCells = [
  { id: 'invoiceNumber', numeric: false, label: 'Invoice #' },
  { id: 'dateOfIssue', numeric: false, label: 'Date' },
  { id: 'billTo', numeric: false, label: 'Client' },
  { id: 'documentTypeId', numeric: false, label: 'Type' },
  { id: 'total', numeric: true, label: 'Amount' },
];

export default function InvoiceList() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { canCreate, isPremium } = useSubscription();
  
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [documentTypes, setDocumentTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const canCreateInvoice = canCreate?.invoice !== false;
  
  const [searchTerm, setSearchTerm] = useState('');
  const [activeStatusFilters, setActiveStatusFilters] = useState({ draft: true, unpaid: true, paid: true, overdue: true });
  const [showAllStatuses, setShowAllStatuses] = useState(false);
  const [dateFilter, setDateFilter] = useState('all');

  const [order, setOrder] = useState('desc'); // Default order: descending
  const [orderBy, setOrderBy] = useState('invoiceNumber'); // Default sort by Invoice #

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const documentTypeMap = React.useMemo(() => {
    const map = { ...DOCUMENT_TYPE_BASE_STYLES };
    (documentTypes || []).forEach((type) => {
      if (!type) return;
      const typeId = type.id ?? type.documentTypeId;
      if (!typeId) return;
      const label = type.displayName || type.name || type.description || type.code || `Type ${typeId}`;
      map[typeId] = {
        ...(map[typeId] || DOCUMENT_TYPE_BASE_STYLES.default),
        label,
        category: type.category || 'Invoice' // Add category field
      };
    });
    return map;
  }, [documentTypes]);

  const getDocumentTypeMeta = React.useCallback(
    (typeId) => {
      if (typeId === null || typeId === undefined) {
        return documentTypeMap.default;
      }
      return documentTypeMap[typeId] || documentTypeMap.default;
    },
    [documentTypeMap]
  );
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState(null);
  
  const [availableStatuses, setAvailableStatuses] = useState([]);
  
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const [bulkTargetStatus, setBulkTargetStatus] = useState('');
  const [bulkUpdateDialogOpen, setBulkUpdateDialogOpen] = useState(false);

  useEffect(() => {
    fetchInvoices();
    fetchStatuses();
    fetchDocumentTypes();
  }, []);
  
  useEffect(() => {
    filterInvoices();
  }, [searchTerm, activeStatusFilters, showAllStatuses, dateFilter, invoices, order, orderBy]);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const data = await getAllInvoices();
      const normalized = (data || []).map((invoice) => {
        const resolvedTypeId = invoice?.documentTypeId ?? invoice?.DocumentTypeId ?? 1;
        return {
          ...invoice,
          documentTypeId: resolvedTypeId
        };
      });
      setInvoices(normalized);
      setFilteredInvoices(normalized);
    } catch (err) {
      console.error('Error fetching invoices:', err);
      setError('Failed to load invoices. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchStatuses = async () => {
    try {
      const data = await getAllStatuses();
      const statuses = data || [];
      if (!statuses.some(s => s.name.toLowerCase() === 'draft')) {
        statuses.push({ statusId: statuses.length + 1, name: 'Draft' });
      }
      setAvailableStatuses(statuses);
    } catch (err) {
      console.error('Error fetching statuses:', err);
      setAvailableStatuses([
        { statusId: 1, name: 'Draft' },
        { statusId: 2, name: 'Unpaid' },
        { statusId: 3, name: 'Paid' },
        { statusId: 4, name: 'Deleted' },
        { statusId: 5, name: 'Overdue' }
      ]);
    }
  };

  const fetchDocumentTypes = async () => {
    try {
      const data = await getAllDocumentTypes();
      setDocumentTypes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching document types:', err);
      setDocumentTypes([]);
    }
  };
  
  const filterInvoices = () => {
    let result = [...invoices];
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(invoice => 
        (invoice.billTo && invoice.billTo.toLowerCase().includes(searchLower)) || 
        (invoice.invoiceNumber && invoice.invoiceNumber.toString().includes(searchLower))
      );
    }
    
    if (showAllStatuses) {
    } else {
      const selectedIndividualStatuses = Object.entries(activeStatusFilters)
        .filter(([_, checked]) => checked)
        .map(([statusName, _]) => statusName.toLowerCase());

      result = result.filter(invoice => {
        if (!invoice.statusName) return false;
        const statusLower = invoice.statusName.toLowerCase();
        return statusLower !== 'deleted' && selectedIndividualStatuses.includes(statusLower);
      });
    }
    
    if (dateFilter !== 'all') {
      const today = new Date();
      const thirtyDaysAgo = new Date(today.setDate(today.getDate() - 30));
      const ninetyDaysAgo = new Date(today.setDate(today.getDate() - 90));
      
      result = result.filter(invoice => {
        const invoiceDate = new Date(invoice.dateOfIssue);
        
        switch(dateFilter) {
          case 'last30':
            return invoiceDate >= thirtyDaysAgo;
          case 'last90':
            return invoiceDate >= ninetyDaysAgo;
          case 'thisYear':
            return invoiceDate.getFullYear() === new Date().getFullYear();
          default:
            return true;
        }
      });
    }
    
    result = stableSort(result, getComparator(order, orderBy));
    
    setFilteredInvoices(result);
  };
  
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };
  
  const handleStatusCheckboxChange = (event) => {
    setActiveStatusFilters({
      ...activeStatusFilters,
      [event.target.name]: event.target.checked,
    });
  };

  const handleShowAllStatusesChange = (event) => {
    setShowAllStatuses(event.target.checked);
  };

  const getStatusSelectValue = () => {
    if (showAllStatuses) {
      return ['draft', 'unpaid', 'paid', 'overdue', 'allstatuses'];
    }
    return Object.entries(activeStatusFilters)
      .filter(([_, checked]) => checked)
      .map(([name, _]) => name);
  };

  const handleStatusSelectChange = (event) => {
    const newValues = event.target.value;
    const isNowRequestingAll = newValues.includes('allstatuses');

    if (isNowRequestingAll) {
      setShowAllStatuses(true);
      setActiveStatusFilters({ draft: true, unpaid: true, paid: true, overdue: true });
    } else {
      setShowAllStatuses(false);
      const newActive = { draft: false, unpaid: false, paid: false, overdue: false };
      newValues.forEach(val => {
        if (val !== 'allstatuses' && newActive[val] !== undefined) {
          newActive[val] = true;
        }
      });
      setActiveStatusFilters(newActive);
    }
  };

  const renderSelectedStatusValue = (selected) => {
    if (selected.includes('allstatuses')) {
      return 'All (incl. Deleted)';
    }
    if (selected.length === 0) {
      return 'None Selected';
    }
    return selected.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(', ');
  };

  const handleDateFilterChange = (event) => {
    setDateFilter(event.target.value);
    setPage(0);
  };
  
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    setSelectedInvoices([]);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
    setSelectedInvoices([]);
  };

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = filteredInvoices
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
        .map((n) => n.id);
      setSelectedInvoices(newSelecteds);
      return;
    }
    setSelectedInvoices([]);
  };

  const handleSelectClick = (event, id) => {
    const selectedIndex = selectedInvoices.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedInvoices, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selectedInvoices.slice(1));
    } else if (selectedIndex === selectedInvoices.length - 1) {
      newSelected = newSelected.concat(selectedInvoices.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selectedInvoices.slice(0, selectedIndex),
        selectedInvoices.slice(selectedIndex + 1),
      );
    }
    setSelectedInvoices(newSelected);
  };

  const isSelected = (id) => selectedInvoices.indexOf(id) !== -1;

  const handleViewInvoice = (invoice) => {
    if (invoice && invoice.id) {
      navigate(`/invoices/view/${invoice.id}`);
    } else {
      console.error("Invalid invoice data:", invoice);
      setNotification({
        open: true,
        message: 'Failed to open invoice: Invalid invoice data',
        severity: 'error'
      });
    }
  };
  
  const handleEditInvoice = (invoice) => {
    if (invoice && invoice.id) {
      navigate(`/invoices/edit/${invoice.id}`);
    } else {
      console.error("Invalid invoice data for edit:", invoice);
      setNotification({
        open: true,
        message: 'Failed to edit invoice: Invalid invoice data',
        severity: 'error'
      });
    }
  };
  
  const handleDeleteClick = (invoice) => {
    setInvoiceToDelete(invoice);
    setDeleteDialogOpen(true);
  };
  
  const handleDeleteConfirm = async () => {
    if (!invoiceToDelete || !invoiceToDelete.id) return;
    
    try {
      await deleteInvoice(invoiceToDelete.id);
      setInvoices(prevInvoices => 
        prevInvoices.filter(inv => inv.id !== invoiceToDelete.id)
      );
      setNotification({
        open: true,
        message: `Invoice #${invoiceToDelete.invoiceNumber} deleted successfully.`,
        severity: 'success'
      });
    } catch (err) {
      console.error('Error deleting invoice:', err);
      setNotification({
        open: true,
        message: `Failed to delete invoice #${invoiceToDelete.invoiceNumber}. ${err.message || ''}`,
        severity: 'error'
      });
    } finally {
      setDeleteDialogOpen(false);
      setInvoiceToDelete(null);
      setSelectedInvoices(prevSelected => prevSelected.filter(id => id !== invoiceToDelete?.id));
    }
  };
  
  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setInvoiceToDelete(null);
  };
  
  const handleCreateInvoice = () => {
    if (canCreateInvoice) {
      navigate('/invoices/create');
    } else {
      setNotification({
        open: true,
        message: "You've reached your monthly invoice limit on the free plan. Upgrade to premium for unlimited invoices.",
        severity: 'warning'
      });
    }
  };
  
  const handleCloseNotification = () => {
    setNotification({...notification, open: false});
  };

  const handleBulkStatusChangeClick = () => {
    if (!bulkTargetStatus) {
      setNotification({
        open: true,
        message: 'Please select a target status.',
        severity: 'warning'
      });
      return;
    }
    setBulkUpdateDialogOpen(true);
  };

  const handleBulkUpdateConfirm = async () => {
    setLoading(true);
    try {
      const result = await updateBulkInvoiceStatus(selectedInvoices, bulkTargetStatus);
      setNotification({ 
        open: true, 
        message: result.message || 'Statuses updated successfully.', 
        severity: 'success' 
      });
      fetchInvoices();
      setSelectedInvoices([]);
      setBulkTargetStatus('');
    } catch (err) {
      console.error('Error updating statuses:', err);
      setNotification({ 
        open: true, 
        message: `Failed to update statuses: ${err.message || 'Unknown error'}`,
        severity: 'error' 
      });
    } finally {
      setBulkUpdateDialogOpen(false);
      setLoading(false);
    }
  };

  const handleBulkUpdateCancel = () => {
    setBulkUpdateDialogOpen(false);
  };

  const numSelectedOnPage = filteredInvoices
    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    .filter(inv => selectedInvoices.includes(inv.id))
    .length;
  
  const numItemsOnPage = filteredInvoices
    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    .length;
    
  return (
    <Box sx={{ width: '100%' }}>
      {/* Apple-Style Header Section */}
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between', 
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: { xs: 2, sm: 3 },
          mb: 3,
          pb: 3,
          borderBottom: '1px solid rgba(15, 23, 42, 0.08)',
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography 
              variant="h4" 
              component="h1" 
              sx={{ 
                fontWeight: 700,
                fontSize: { xs: '1.75rem', sm: '2rem' },
                color: 'rgba(15, 23, 42, 0.95)',
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
                mb: 0.5
              }}
            >
              Invoices
            </Typography>
            <PageHelper 
              inline={true}
              compact={true}
              {...pageHelpContent.home}
            />
          </Box>
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'rgba(15, 23, 42, 0.5)',
              fontSize: '0.9375rem',
              fontWeight: 400,
              letterSpacing: '-0.01em'
            }}
          >
            Manage and track all your invoices
          </Typography>
        </Box>
        
        <Tooltip 
          title={!canCreateInvoice ? "You've reached your monthly invoice limit on the free plan. Upgrade to premium for unlimited invoices." : ""}
          arrow
        >
          <span>
            <Button
              variant="contained"
              startIcon={canCreateInvoice ? <AddIcon /> : <LockIcon />}
              onClick={handleCreateInvoice}
              disabled={!canCreateInvoice}
              fullWidth={{ xs: true, sm: false }}
              sx={{ 
                background: canCreateInvoice 
                  ? 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' 
                  : 'rgba(15, 23, 42, 0.3)',
                color: 'white',
                boxShadow: 'none',
                borderRadius: '8px',
                px: 2.5,
                py: 1,
                fontSize: '0.9375rem',
                fontWeight: 600,
                textTransform: 'none',
                letterSpacing: '-0.01em',
                minWidth: { xs: 'auto', sm: 140 },
                transition: 'all 0.15s ease',
                '&:hover': canCreateInvoice ? { 
                  background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                  boxShadow: 'none',
                } : {},
                '&.Mui-disabled': {
                  color: 'rgba(255, 255, 255, 0.6)',
                  opacity: 1
                }
              }}
            >
              {canCreateInvoice ? 'New Invoice' : 'Limit Reached'}
            </Button>
          </span>
        </Tooltip>
      </Box>

      {/* Usage Indicator for Free Tier - Below Header */}
      <Box sx={{ mb: 3 }}>
        <UsageIndicator resource="invoice" label="Invoices (This Month)" />
      </Box>

      {/* Apple-Style Search and Filter Section */}
      <Box 
        sx={{ 
          mb: 3,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'stretch',
            gap: 1.5
          }}
        >
          <TextField
            placeholder="Search invoices..."
            variant="outlined"
            size="small"
            fullWidth
            value={searchTerm}
            onChange={handleSearchChange}
            sx={{ 
              flexGrow: 1,
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
                backgroundColor: 'rgba(15, 23, 42, 0.04)',
                border: '1px solid rgba(15, 23, 42, 0.08)',
                fontSize: '0.9375rem',
                fontWeight: 400,
                transition: 'all 0.15s ease',
                '& fieldset': {
                  border: 'none'
                },
                '&:hover': {
                  backgroundColor: 'rgba(15, 23, 42, 0.06)',
                  borderColor: 'rgba(15, 23, 42, 0.12)',
                },
                '&.Mui-focused': {
                  backgroundColor: 'white',
                  borderColor: '#3b82f6',
                  boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
                }
              },
              '& .MuiOutlinedInput-input': {
                padding: '8.5px 12px',
                '&::placeholder': {
                  color: 'rgba(15, 23, 42, 0.4)',
                  opacity: 1
                }
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'rgba(15, 23, 42, 0.3)', fontSize: 18, ml: 0.5 }} />
                </InputAdornment>
              ),
            }}
          />        
        <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 160 } }}>
          <Select
            labelId="status-select-filter-label"
            id="status-select-filter"
            multiple
            value={getStatusSelectValue()}
            onChange={handleStatusSelectChange}
            onClose={() => setPage(0)}
            displayEmpty
            renderValue={renderSelectedStatusValue}
            sx={{
              borderRadius: '8px',
              backgroundColor: 'rgba(15, 23, 42, 0.04)',
              border: '1px solid rgba(15, 23, 42, 0.08)',
              fontSize: '0.9375rem',
              fontWeight: 400,
              transition: 'all 0.15s ease',
              '& fieldset': {
                border: 'none'
              },
              '&:hover': {
                backgroundColor: 'rgba(15, 23, 42, 0.06)',
                borderColor: 'rgba(15, 23, 42, 0.12)',
              },
              '&.Mui-focused': {
                backgroundColor: 'white',
                borderColor: '#3b82f6',
                boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
              },
              '& .MuiSelect-select': {
                padding: '8.5px 12px',
                display: 'flex',
                alignItems: 'center'
              },
              '& .MuiSelect-icon': {
                color: 'rgba(15, 23, 42, 0.4)',
                right: 8,
                transition: 'transform 0.15s ease'
              }
            }}
            MenuProps={{
              PaperProps: {
                sx: {
                  borderRadius: '10px',
                  boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)',
                  border: '1px solid rgba(15, 23, 42, 0.08)',
                  mt: 0.5,
                  overflow: 'hidden',
                  '& .MuiList-root': {
                    py: 0.5
                  },
                  '& .MuiMenuItem-root': {
                    fontSize: '0.9375rem',
                    padding: '10px 12px',
                    margin: '0 4px',
                    borderRadius: '6px',
                    transition: 'all 0.15s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(15, 23, 42, 0.06)'
                    },
                    '&.Mui-selected': {
                      backgroundColor: 'rgba(59, 130, 246, 0.08)',
                      '&:hover': {
                        backgroundColor: 'rgba(59, 130, 246, 0.12)'
                      }
                    }
                  }
                }
              },
            }}
          >
            {availableStatuses
              .filter(s => ['draft', 'unpaid', 'paid', 'overdue'].includes(s.name.toLowerCase()))
              .map((status) => {
                const statusValue = status.name.toLowerCase();
                return (
                  <MenuItem key={statusValue} value={statusValue} disabled={showAllStatuses}>
                    <Checkbox 
                      checked={showAllStatuses || (activeStatusFilters[statusValue] || false)}
                      size="small"
                      sx={{ 
                        mr: 1.5,
                        p: 0,
                        color: 'rgba(15, 23, 42, 0.3)',
                        '&.Mui-checked': {
                          color: '#3b82f6'
                        }
                      }}
                    />
                    <ListItemText 
                      primary={status.name}
                      primaryTypographyProps={{
                        fontSize: '0.9375rem',
                        fontWeight: 400,
                        color: 'rgba(15, 23, 42, 0.9)'
                      }}
                    />
                  </MenuItem>
                );
            })}
            <MenuItem key="allstatuses" value="allstatuses">
              <Checkbox 
                checked={showAllStatuses} 
                size="small" 
                sx={{ 
                  mr: 1.5,
                  p: 0,
                  color: 'rgba(15, 23, 42, 0.3)',
                  '&.Mui-checked': {
                    color: '#3b82f6'
                  }
                }}
              />
              <ListItemText 
                primary="All (incl. Deleted)"
                primaryTypographyProps={{
                  fontSize: '0.9375rem',
                  fontWeight: 400,
                  color: 'rgba(15, 23, 42, 0.9)'
                }}
              />
            </MenuItem>
          </Select>
        </FormControl>
        
        <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 160 } }}>
          <Select
            labelId="date-filter-label"
            id="date-filter"
            value={dateFilter}
            onChange={handleDateFilterChange}
            displayEmpty
            sx={{
              borderRadius: '8px',
              backgroundColor: 'rgba(15, 23, 42, 0.04)',
              border: '1px solid rgba(15, 23, 42, 0.08)',
              fontSize: '0.9375rem',
              fontWeight: 400,
              transition: 'all 0.15s ease',
              '& fieldset': {
                border: 'none'
              },
              '&:hover': {
                backgroundColor: 'rgba(15, 23, 42, 0.06)',
                borderColor: 'rgba(15, 23, 42, 0.12)',
              },
              '&.Mui-focused': {
                backgroundColor: 'white',
                borderColor: '#3b82f6',
                boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
              },
              '& .MuiSelect-select': {
                padding: '8.5px 12px'
              },
              '& .MuiSelect-icon': {
                color: 'rgba(15, 23, 42, 0.4)',
                right: 8,
                transition: 'transform 0.15s ease'
              }
            }}
            MenuProps={{
              PaperProps: {
                sx: {
                  borderRadius: '10px',
                  boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)',
                  border: '1px solid rgba(15, 23, 42, 0.08)',
                  mt: 0.5,
                  overflow: 'hidden',
                  '& .MuiList-root': {
                    py: 0.5
                  },
                  '& .MuiMenuItem-root': {
                    fontSize: '0.9375rem',
                    padding: '10px 12px',
                    margin: '0 4px',
                    borderRadius: '6px',
                    transition: 'all 0.15s ease',
                    color: 'rgba(15, 23, 42, 0.9)',
                    '&:hover': {
                      backgroundColor: 'rgba(15, 23, 42, 0.06)'
                    },
                    '&.Mui-selected': {
                      backgroundColor: 'rgba(59, 130, 246, 0.08)',
                      color: '#3b82f6',
                      fontWeight: 500,
                      '&:hover': {
                        backgroundColor: 'rgba(59, 130, 246, 0.12)'
                      }
                    }
                  }
                }
              },
            }}
          >
            <MenuItem value="all">All Time</MenuItem>
            <MenuItem value="last30">Last 30 Days</MenuItem>
            <MenuItem value="last90">Last 90 Days</MenuItem>
            <MenuItem value="thisYear">This Year</MenuItem>
          </Select>
        </FormControl>
        </Box>
      </Box>
        <Box
        sx={{
          ...(selectedInvoices.length > 0 && {
            background: 'rgba(59, 130, 246, 0.08)',
            backdropFilter: 'saturate(180%) blur(20px)',
            WebkitBackdropFilter: 'saturate(180%) blur(20px)',
            border: '1px solid rgba(59, 130, 246, 0.15)',
            borderRadius: '12px',
            mb: 3,
            px: 3,
            py: 2.5,
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.12)',
          }),
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2,
          flexWrap: 'wrap',
          visibility: selectedInvoices.length > 0 ? 'visible' : 'hidden',
          height: selectedInvoices.length > 0 ? 'auto' : 0,
          minHeight: selectedInvoices.length > 0 ? 72 : 0,
          transition: 'all 0.2s ease',
          overflow: 'hidden',
        }}
      >
        {selectedInvoices.length > 0 && (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '10px',
                  background: 'rgba(59, 130, 246, 0.12)',
                  backdropFilter: 'blur(10px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#3b82f6',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                }}
              >
                {selectedInvoices.length}
              </Box>
              <Typography
                variant="h6"
                component="div"
                sx={{
                  color: '#3b82f6',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  letterSpacing: '-0.01em'
                }}
              >
                {selectedInvoices.length === 1 ? 'Invoice Selected' : 'Invoices Selected'}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <FormControl 
                size="small" 
                sx={{ 
                  minWidth: 180,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid rgba(15, 23, 42, 0.1)',
                    '& fieldset': {
                      border: 'none'
                    },
                    '&:hover': {
                      backgroundColor: 'white',
                      borderColor: 'rgba(15, 23, 42, 0.15)'
                    },
                    '&.Mui-focused': {
                      borderColor: '#3b82f6',
                      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
                      backgroundColor: 'white'
                    }
                  },
                  '& .MuiInputLabel-root': {
                    fontSize: '0.875rem',
                    color: 'rgba(15, 23, 42, 0.6)',
                    '&.Mui-focused': {
                      color: '#3b82f6'
                    }
                  },
                  '& .MuiSelect-icon': {
                    color: 'rgba(15, 23, 42, 0.4)',
                    right: 8
                  }
                }}
              >
                <InputLabel>Change Status To</InputLabel>
                <Select
                  value={bulkTargetStatus}
                  label="Change Status To"
                  onChange={(e) => setBulkTargetStatus(e.target.value)}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        borderRadius: '10px',
                        boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)',
                        border: '1px solid rgba(15, 23, 42, 0.08)',
                        mt: 0.5,
                        overflow: 'hidden',
                        '& .MuiList-root': {
                          py: 0.5
                        },
                        '& .MuiMenuItem-root': {
                          fontSize: '0.9375rem',
                          padding: '10px 12px',
                          margin: '0 4px',
                          borderRadius: '6px',
                          transition: 'all 0.15s ease',
                          color: 'rgba(15, 23, 42, 0.9)',
                          '&:hover': {
                            backgroundColor: 'rgba(15, 23, 42, 0.06)'
                          },
                          '&.Mui-selected': {
                            backgroundColor: 'rgba(59, 130, 246, 0.08)',
                            color: '#3b82f6',
                            fontWeight: 500,
                            '&:hover': {
                              backgroundColor: 'rgba(59, 130, 246, 0.12)'
                            }
                          }
                        }
                      }
                    }
                  }}
                >
                  <MenuItem value="" disabled><em>Select Status</em></MenuItem>
                  {availableStatuses.map((status) => (
                    <MenuItem key={status.statusId} value={status.statusId}>
                      {status.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button 
                variant="contained" 
                size="medium"
                onClick={handleBulkStatusChangeClick}
                disabled={!bulkTargetStatus}
                sx={{ 
                  background: '#10b981',
                  borderRadius: '10px',
                  px: 3,
                  py: 1.25,
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '0.875rem',
                  letterSpacing: '-0.01em',
                  boxShadow: 'none',
                  border: '1px solid rgba(255, 255, 255, 0.18)',
                  '&:hover': { 
                    background: '#059669',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                  },
                  '&:disabled': {
                    background: '#9ca3af',
                    boxShadow: 'none'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                Apply Change
              </Button>
            </Box>
          </>
        )}
      </Box>      <Paper 
        elevation={0}
        sx={{ 
          width: '100%', 
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'saturate(180%) blur(20px)',
          WebkitBackdropFilter: 'saturate(180%) blur(20px)',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(255, 255, 255, 0.18)',
        }}
      >
        {loading ? (
          <PageLoader color="#3b82f6" minHeight="300px" />
        ) : error ? (
          <Alert 
            severity="error" 
            sx={{ 
              m: { xs: 2, sm: 3 },
              borderRadius: 2,
              background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
              border: '1px solid #fecaca',
              '& .MuiAlert-icon': {
                color: '#dc2626'
              },
              '& .MuiAlert-message': {
                fontWeight: 'medium',
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }
            }}
          >
            {error}
          </Alert>
        ) : filteredInvoices.length === 0 ? (
          <Box 
            sx={{ 
              p: { xs: 4, sm: 6 }, 
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2
            }}
          >
            <Box
              sx={{
                width: { xs: 56, sm: 64 },
                height: { xs: 56, sm: 64 },
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 1
              }}
            >
              <ReceiptIcon sx={{ fontSize: { xs: 28, sm: 32 }, color: '#9ca3af' }} />
            </Box>
            <Typography 
              variant="h6"
              sx={{ 
                color: 'text.primary',
                fontWeight: 'medium',
                fontSize: { xs: '1.125rem', sm: '1.25rem' }
              }}
            >
              No invoices found
            </Typography>
            <Typography 
              variant="body2"
              sx={{ 
                color: 'text.secondary',
                maxWidth: 400,
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }}
            >
              {searchTerm || activeStatusFilters !== 'all' || dateFilter !== 'all' 
                ? 'Try adjusting your filters to see more results.' 
                : 'Create your first invoice to get started with invoice management!'}
            </Typography>
            {!searchTerm && activeStatusFilters === 'all' && dateFilter === 'all' && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleCreateInvoice}
                sx={{ 
                  mt: 2,
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  borderRadius: 2,
                  px: { xs: 2, sm: 3 },
                  py: 1.5,
                  fontWeight: 600,
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  textTransform: 'none',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                  '&:hover': { 
                    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                    boxShadow: '0 6px 16px rgba(16, 185, 129, 0.4)',
                    transform: 'translateY(-1px)'
                  },
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                Create Your First Invoice
              </Button>            )}          </Box>
        ) : (
          <>
            {/* Mobile Card View */}
            {isMobile ? (
              <Box sx={{ p: 2 }}>
                {filteredInvoices
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((invoice) => {
                    const isItemSelected = isSelected(invoice.id);
                    const isDeleted = invoice.statusName?.toLowerCase() === 'deleted';
                    const docTypeMeta = getDocumentTypeMeta(invoice.documentTypeId);
                    const totalValue = Number(invoice.total ?? 0);

                    return (
                      <Card 
                        key={invoice.id}
                        sx={{ 
                          mb: 2, 
                          borderRadius: 2,
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                          border: isItemSelected ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                          backgroundColor: isDeleted ? 'rgba(239, 68, 68, 0.05)' : 'white',
                          '&:hover': {
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                          }
                        }}
                      >
                        <CardContent sx={{ pb: 1 }}>
                          {/* Header: Invoice Number and Status */}
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem', mb: 0.5 }}>
                                Invoice #{invoice.invoiceNumber}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                                {formatDate(invoice.dateOfIssue)}
                              </Typography>
                            </Box>
                            <StatusBadge 
                              status={invoice.statusName || 'Unknown'} 
                              documentCategory={docTypeMeta.category}
                            />
                          </Box>

                          {/* Client */}
                          <Box sx={{ mb: 1.5 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>
                              Client
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 500, fontSize: '0.9rem', mt: 0.5 }}>
                              {invoice.billTo}
                            </Typography>
                          </Box>

                          {/* Document Type and Amount */}
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Box>
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>
                                Type
                              </Typography>
                              <Box sx={{ mt: 0.5 }}>
                                <Chip
                                  label={docTypeMeta.label}
                                  size="small"
                                  sx={{
                                    backgroundColor: docTypeMeta.backgroundColor,
                                    color: docTypeMeta.color,
                                    border: docTypeMeta.border,
                                    fontWeight: 600,
                                    fontSize: '0.7rem',
                                  }}
                                />
                              </Box>
                            </Box>
                            <Box sx={{ textAlign: 'right' }}>
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>
                                Amount
                              </Typography>
                              <Typography variant="h6" sx={{ fontWeight: 600, color: '#059669', fontSize: '1.1rem', mt: 0.5 }}>
                                {(invoice.currency?.symbol || '$')}{totalValue.toFixed(2)}
                              </Typography>
                            </Box>
                          </Box>
                        </CardContent>

                        <Divider />

                        {/* Action Buttons */}
                        <CardActions sx={{ justifyContent: 'space-between', p: 1.5 }}>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<ViewIcon />}
                              onClick={() => handleViewInvoice(invoice)}
                              sx={{
                                color: '#3b82f6',
                                borderColor: 'rgba(59, 130, 246, 0.3)',
                                backgroundColor: 'rgba(59, 130, 246, 0.05)',
                                fontSize: '0.75rem',
                                '&:hover': {
                                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                  borderColor: '#3b82f6',
                                },
                              }}
                            >
                              View
                            </Button>
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<EditIcon />}
                              onClick={() => handleEditInvoice(invoice)}
                              disabled={isDeleted}
                              sx={{
                                color: isDeleted ? '#9ca3af' : '#8b5cf6',
                                borderColor: isDeleted ? 'rgba(156, 163, 175, 0.3)' : 'rgba(139, 92, 246, 0.3)',
                                backgroundColor: isDeleted ? 'rgba(156, 163, 175, 0.05)' : 'rgba(139, 92, 246, 0.05)',
                                fontSize: '0.75rem',
                                '&:hover': {
                                  backgroundColor: isDeleted ? 'rgba(156, 163, 175, 0.05)' : 'rgba(139, 92, 246, 0.1)',
                                  borderColor: isDeleted ? 'rgba(156, 163, 175, 0.3)' : '#8b5cf6',
                                },
                              }}
                            >
                              Edit
                            </Button>
                          </Box>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteClick(invoice)}
                            disabled={isDeleted}
                            sx={{
                              color: isDeleted ? '#9ca3af' : '#ef4444',
                              backgroundColor: isDeleted ? 'rgba(156, 163, 175, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                              borderRadius: 1.5,
                              '&:hover': {
                                backgroundColor: isDeleted ? 'rgba(156, 163, 175, 0.1)' : 'rgba(239, 68, 68, 0.2)',
                              },
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </CardActions>
                      </Card>
                    );
                  })}
                
                {/* Mobile Pagination */}
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  flexDirection: 'column',
                  gap: 2,
                  mt: 3,
                  p: 2,
                  backgroundColor: '#f8fafc',
                  borderRadius: 2
                }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                    Showing {page * rowsPerPage + 1} - {Math.min((page + 1) * rowsPerPage, filteredInvoices.length)} of {filteredInvoices.length}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={(e) => handleChangePage(e, page - 1)}
                      disabled={page === 0}
                      sx={{
                        borderColor: '#d1d5db',
                        color: '#374151',
                        '&:hover': {
                          borderColor: '#3b82f6',
                          backgroundColor: '#f8fafc'
                        },
                        '&:disabled': {
                          borderColor: '#e5e7eb',
                          color: '#9ca3af'
                        }
                      }}
                    >
                      Previous
                    </Button>
                    <Typography variant="body2" sx={{ fontWeight: 500, mx: 2 }}>
                      Page {page + 1} of {Math.ceil(filteredInvoices.length / rowsPerPage)}
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={(e) => handleChangePage(e, page + 1)}
                      disabled={page >= Math.ceil(filteredInvoices.length / rowsPerPage) - 1}
                      sx={{
                        borderColor: '#d1d5db',
                        color: '#374151',
                        '&:hover': {
                          borderColor: '#3b82f6',
                          backgroundColor: '#f8fafc'
                        },
                        '&:disabled': {
                          borderColor: '#e5e7eb',
                          color: '#9ca3af'
                        }
                      }}
                    >
                      Next
                    </Button>
                  </Box>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Per Page</InputLabel>
                    <Select
                      value={rowsPerPage}
                      label="Per Page"
                      onChange={handleChangeRowsPerPage}
                      sx={{
                        borderRadius: 1.5,
                        backgroundColor: 'white'
                      }}
                    >
                      <MenuItem value={5}>5</MenuItem>
                      <MenuItem value={10}>10</MenuItem>
                      <MenuItem value={25}>25</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Box>
            ) : (
              /* Desktop Table View */
            <>
            <TableContainer sx={{ overflowX: 'auto' }}>
              <Table sx={{ minWidth: { xs: 650, md: 750 } }} aria-label="invoices table">
                <TableHead
                  sx={{
                    background: 'rgba(248, 250, 252, 0.6)',
                    backdropFilter: 'blur(10px)',
                    '& .MuiTableCell-root': {
                      borderBottom: '1px solid rgba(15, 23, 42, 0.08)',
                      py: 1.75,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      color: 'rgba(15, 23, 42, 0.6)'
                    }
                  }}
                >
                  <TableRow>
                    <TableCell 
                      padding="checkbox"
                      sx={{
                        backgroundColor: 'transparent',
                        display: { xs: 'none', sm: 'table-cell' }
                      }}
                    >
                      <Checkbox
                        color="primary"
                        indeterminate={numSelectedOnPage > 0 && numSelectedOnPage < numItemsOnPage}
                        checked={numItemsOnPage > 0 && numSelectedOnPage === numItemsOnPage}
                        onChange={handleSelectAllClick}
                        inputProps={{
                          'aria-label': 'select all invoices on this page',
                        }}
                        sx={{
                          '&.Mui-checked': {
                            color: '#3b82f6'
                          },
                          '&.MuiCheckbox-indeterminate': {
                            color: '#3b82f6'
                          }
                        }}
                      />
                    </TableCell>
                    {headCells.map((headCell) => (
                      <TableCell
                        key={headCell.id}
                        align={headCell.numeric ? 'right' : 'left'}
                        padding={'normal'}
                        sortDirection={orderBy === headCell.id ? order : false}
                        sx={{
                          backgroundColor: 'transparent',
                          ...(headCell.id === 'total' && { paddingRight: '24px' }),
                          // Hide 'billTo' on xs, show from sm up
                          ...(headCell.id === 'billTo' && { display: { xs: 'none', sm: 'table-cell' } }),
                          // Hide 'documentTypeId' on xs/sm, show from md up
                          ...(headCell.id === 'documentTypeId' && { display: { xs: 'none', md: 'table-cell' } })
                        }}
                      >
                        <TableSortLabel
                          active={orderBy === headCell.id}
                          direction={orderBy === headCell.id ? order : 'asc'}
                          onClick={(event) => handleRequestSort(event, headCell.id)}
                          sx={{
                            '&.Mui-active': {
                              color: 'rgba(15, 23, 42, 0.9)',
                              '& .MuiTableSortLabel-icon': {
                                color: 'rgba(15, 23, 42, 0.9) !important'
                              }
                            },
                            '&:hover': {
                              color: 'rgba(15, 23, 42, 0.9)'
                            },
                            '& .MuiTableSortLabel-icon': {
                              fontSize: '0.875rem'
                            }
                          }}
                        >
                          {headCell.label}
                          {orderBy === headCell.id ? (
                            <Box component="span" sx={visuallyHidden}>
                              {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                            </Box>
                          ) : null}
                        </TableSortLabel>
                      </TableCell>
                    ))}
                    <TableCell 
                      sx={{ 
                        backgroundColor: 'transparent'
                      }}
                    >
                      Status
                    </TableCell>
                    <TableCell 
                      sx={{ 
                        backgroundColor: 'transparent'
                      }}                    >
                      Actions</TableCell>
                  </TableRow></TableHead>
                <TableBody>
{filteredInvoices
.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
.map((invoice) => {
                      const isItemSelected = isSelected(invoice.id);
                      const labelId = `enhanced-table-checkbox-${invoice.id}`;
                      const isDeleted = invoice.statusName?.toLowerCase() === 'deleted';
                      const docTypeMeta = getDocumentTypeMeta(invoice.documentTypeId);
                      const totalValue = Number(invoice.total ?? 0);

                      return (
                        <TableRow 
                          key={invoice.id || `inv-${Math.random()}`} 
                          hover
                          onClick={(event) => handleSelectClick(event, invoice.id)}
                          role="checkbox"
                          aria-checked={isItemSelected}
                          tabIndex={-1}
                          selected={isItemSelected}
                          sx={{ 
                            cursor: 'pointer',
                            backgroundColor: isDeleted ? 'rgba(239, 68, 68, 0.03)' : 'transparent',
                            transition: 'all 0.15s ease',
                            '&:hover': {
                              backgroundColor: isDeleted 
                                ? 'rgba(239, 68, 68, 0.06)' 
                                : 'rgba(15, 23, 42, 0.02)',
                            },
                            '&.Mui-selected': {
                              backgroundColor: 'rgba(59, 130, 246, 0.06)',
                              '&:hover': {
                                backgroundColor: 'rgba(59, 130, 246, 0.08)'
                              }
                            },
                            '& .MuiTableCell-root': {
                              borderBottom: '1px solid rgba(15, 23, 42, 0.06)',
                              py: 2,
                              fontSize: '0.875rem'
                            }
                          }}
                        >
                          <TableCell padding="checkbox" sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                            <Checkbox
                              color="primary"
                              checked={isItemSelected}
                              inputProps={{
                                'aria-labelledby': labelId,
                              }}
                              sx={{
                                '&.Mui-checked': {
                                  color: '#3b82f6'
                                }
                              }}
                            />
                          </TableCell>
                          <TableCell 
                            component="th" 
                            id={labelId} 
                            scope="row"
                            sx={{
                              fontWeight: 600,
                              color: 'rgba(15, 23, 42, 0.9)',
                              fontSize: '0.875rem'
                            }}
                          >
                            {invoice.invoiceNumber}
                          </TableCell>
                          <TableCell
                            sx={{
                              color: 'rgba(15, 23, 42, 0.6)',
                              fontSize: '0.875rem',
                              fontWeight: 500
                            }}
                          >
                            {formatDate(invoice.dateOfIssue)}
                          </TableCell>
                          <TableCell
                            sx={{
                              color: 'rgba(15, 23, 42, 0.8)',
                              fontSize: '0.875rem',
                              fontWeight: 500,
                              display: { xs: 'none', sm: 'table-cell' }
                            }}
                          >
                            {invoice.billTo}
                          </TableCell>
                          <TableCell
                            sx={{
                              fontSize: '0.8125rem',
                              display: { xs: 'none', md: 'table-cell' }
                            }}
                          >
                            <Chip
                              label={docTypeMeta.label}
                              size="small"
                              sx={{
                                backgroundColor: docTypeMeta.backgroundColor,
                                color: docTypeMeta.color,
                                borderRadius: '6px',
                                fontWeight: 600,
                                fontSize: '0.6875rem',
                                letterSpacing: '0.02em',
                                border: docTypeMeta.border,
                                height: '24px',
                                '& .MuiChip-label': {
                                  px: 1,
                                  py: 0
                                }
                              }}
                            />
                          </TableCell>
                          <TableCell 
                            align="right" 
                            sx={{ 
                              paddingRight: '24px',
                              fontWeight: 600,
                              color: '#059669',
                              fontSize: '0.875rem',
                              fontVariantNumeric: 'tabular-nums'
                            }}
                          >
                            {(invoice.currency?.symbol || '$')}{totalValue.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <StatusBadge 
                              status={invoice.statusName || 'Unknown'} 
                              documentCategory={docTypeMeta.category}
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 0.75 }}>
                              <Tooltip title="View Invoice" arrow>
                                <IconButton 
                                  size="small" 
                                  onClick={(e) => { e.stopPropagation(); handleViewInvoice(invoice); }}
                                  sx={{
                                    backgroundColor: 'rgba(59, 130, 246, 0.08)',
                                    color: '#3b82f6',
                                    borderRadius: '6px',
                                    width: 32,
                                    height: 32,
                                    '&:hover': {
                                      backgroundColor: 'rgba(59, 130, 246, 0.15)',
                                    },
                                    transition: 'all 0.15s ease'
                                  }}
                                >
                                  <ViewIcon sx={{ fontSize: '1.125rem' }} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Edit Invoice" arrow>
                                <IconButton 
                                  size="small"
                                  onClick={(e) => { e.stopPropagation(); handleEditInvoice(invoice); }}
                                  disabled={isDeleted}
                                  sx={{
                                    backgroundColor: isDeleted ? 'rgba(156, 163, 175, 0.08)' : 'rgba(139, 92, 246, 0.08)',
                                    color: isDeleted ? '#9ca3af' : '#8b5cf6',
                                    borderRadius: '6px',
                                    width: 32,
                                    height: 32,
                                    '&:hover': {
                                      backgroundColor: isDeleted ? 'rgba(156, 163, 175, 0.08)' : 'rgba(139, 92, 246, 0.15)',
                                    },
                                    '&:disabled': {
                                      opacity: 0.5
                                    },
                                    transition: 'all 0.15s ease'
                                  }}
                                >
                                  <EditIcon sx={{ fontSize: '1.125rem' }} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete Invoice" arrow sx={{ display: { xs: 'none', sm: 'block' } }}>
                                <IconButton 
                                  size="small"
                                  onClick={(e) => { e.stopPropagation(); handleDeleteClick(invoice); }}
                                  disabled={isDeleted}
                                  sx={{
                                    backgroundColor: isDeleted ? 'rgba(156, 163, 175, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                                    color: isDeleted ? '#9ca3af' : '#ef4444',
                                    borderRadius: '6px',
                                    width: 32,
                                    height: 32,
                                    display: { xs: 'none', sm: 'inline-flex' },
                                    '&:hover': {
                                      backgroundColor: isDeleted ? 'rgba(156, 163, 175, 0.08)' : 'rgba(239, 68, 68, 0.15)',
                                    },
                                    '&:disabled': {
                                      opacity: 0.5
                                    },
                                    transition: 'all 0.15s ease'
                                  }}
                                >
                                  <DeleteIcon sx={{ fontSize: '1.125rem' }} />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>                      );
                    })}</TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredInvoices.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{
                borderTop: '1px solid rgba(15, 23, 42, 0.08)',
                backgroundColor: 'rgba(248, 250, 252, 0.4)',
                '& .MuiTablePagination-toolbar': {
                  paddingLeft: 3,
                  paddingRight: 2,
                  minHeight: 56
                },
                '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                  fontWeight: 500,
                  color: 'rgba(15, 23, 42, 0.7)',
                  fontSize: '0.8125rem'
                },
                '& .MuiTablePagination-select': {
                  borderRadius: '6px',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  border: '1px solid rgba(15, 23, 42, 0.1)',
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  '&:hover': {
                    borderColor: 'rgba(15, 23, 42, 0.2)',
                    backgroundColor: 'white'
                  },
                  '&:focus': {
                    borderColor: 'rgba(59, 130, 246, 0.4)',
                    backgroundColor: 'white'
                  }
                },
                '& .MuiTablePagination-actions': {
                  '& .MuiIconButton-root': {
                    borderRadius: '6px',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    border: '1px solid rgba(15, 23, 42, 0.1)',
                    color: 'rgba(15, 23, 42, 0.7)',
                    width: 32,
                    height: 32,
                    margin: '0 2px',
                    '&:hover': {
                      backgroundColor: 'rgba(59, 130, 246, 0.08)',
                      borderColor: 'rgba(59, 130, 246, 0.2)',
                      color: '#3b82f6',
                    },
                    '&.Mui-disabled': {
                      backgroundColor: 'rgba(248, 250, 252, 0.5)',
                      borderColor: 'rgba(15, 23, 42, 0.05)',
                      color: 'rgba(15, 23, 42, 0.3)'
                    },
                    transition: 'all 0.15s ease'
                  }
                }
              }}
            />
          </>
            )}
          </>
        )}
      </Paper>
        <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        fullScreen={isMobile}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: isMobile ? 0 : '12px',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'saturate(180%) blur(20px)',
            WebkitBackdropFilter: 'saturate(180%) blur(20px)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
            border: '1px solid rgba(255, 255, 255, 0.18)',
          }
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 600,
            fontSize: '1.125rem',
            color: 'rgba(15, 23, 42, 0.95)',
            borderBottom: '1px solid rgba(15, 23, 42, 0.08)',
            pb: 2
          }}
        >
          Delete Invoice
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          <DialogContentText
            sx={{
              color: 'rgba(15, 23, 42, 0.7)',
              fontSize: '0.9375rem',
              lineHeight: 1.6
            }}
          >
            Are you sure you want to delete invoice #{invoiceToDelete?.invoiceNumber}? 
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0, gap: 1.5 }}>
          <Button 
            onClick={handleDeleteCancel}
            variant="outlined"
            sx={{
              borderRadius: '10px',
              borderColor: 'rgba(15, 23, 42, 0.15)',
              color: 'rgba(15, 23, 42, 0.7)',
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              '&:hover': {
                borderColor: 'rgba(15, 23, 42, 0.3)',
                backgroundColor: 'rgba(15, 23, 42, 0.04)'
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            variant="contained"
            autoFocus
            sx={{
              borderRadius: '10px',
              backgroundColor: '#ef4444',
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              boxShadow: 'none',
              '&:hover': {
                backgroundColor: '#dc2626',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
              }
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      <Dialog
        open={bulkUpdateDialogOpen}
        onClose={handleBulkUpdateCancel}
        fullScreen={isMobile}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: isMobile ? 0 : '12px',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'saturate(180%) blur(20px)',
            WebkitBackdropFilter: 'saturate(180%) blur(20px)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
            border: '1px solid rgba(255, 255, 255, 0.18)',
          }
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 600,
            fontSize: '1.125rem',
            color: 'rgba(15, 23, 42, 0.95)',
            borderBottom: '1px solid rgba(15, 23, 42, 0.08)',
            pb: 2
          }}
        >
          Confirm Status Change
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          <DialogContentText
            sx={{
              color: 'rgba(15, 23, 42, 0.7)',
              fontSize: '0.9375rem',
              lineHeight: 1.6
            }}
          >
            Are you sure you want to change the status of {selectedInvoices.length} selected invoice(s) to 
            "{availableStatuses.find(s => s.statusId === bulkTargetStatus)?.name || 'Unknown'}"?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0, gap: 1.5 }}>
          <Button 
            onClick={handleBulkUpdateCancel} 
            disabled={loading}
            variant="outlined"
            sx={{
              borderRadius: '10px',
              borderColor: 'rgba(15, 23, 42, 0.15)',
              color: 'rgba(15, 23, 42, 0.7)',
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              '&:hover': {
                borderColor: 'rgba(15, 23, 42, 0.3)',
                backgroundColor: 'rgba(15, 23, 42, 0.04)'
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleBulkUpdateConfirm} 
            variant="contained"
            autoFocus 
            disabled={loading}
            sx={{
              borderRadius: '10px',
              backgroundColor: '#3b82f6',
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              boxShadow: 'none',
              '&:hover': {
                backgroundColor: '#2563eb',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
              }
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Confirm Change'}
          </Button>
        </DialogActions>
      </Dialog>
      
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          sx={{
            borderRadius: 2,
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
            '&.MuiAlert-standardSuccess': {
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              color: '#059669'
            },
            '&.MuiAlert-standardError': {
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              color: '#dc2626'
            },
            '&.MuiAlert-standardWarning': {
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.2)',
              color: '#d97706'
            },
            '&.MuiAlert-standardInfo': {
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              color: '#2563eb'
            }
          }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
      <LoadingOverlay open={loading} message="Loading invoices..." />
    </Box>
  );
}
