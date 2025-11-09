// src/components/SupportPage/AdminSupportTicketsPage.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert
} from '@mui/material';
import {
  Support as SupportIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  BugReport as BugIcon,
  Lightbulb as FeatureIcon,
  HelpOutline as OtherIcon
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import Section from '../ReusableComponents/Section';
import { getAllTickets, updateTicket, deleteTicket } from './api';

const AdminSupportTicketsPage = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editData, setEditData] = useState({
    status: '',
    priority: '',
    adminNotes: ''
  });

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const data = await getAllTickets();
      setTickets(data);
      setError(null);
    } catch (err) {
      setError('Failed to load tickets');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleViewTicket = (ticket) => {
    setSelectedTicket(ticket);
    setViewDialogOpen(true);
  };

  const handleEditTicket = (ticket) => {
    setSelectedTicket(ticket);
    setEditData({
      status: ticket.status,
      priority: ticket.priority || 'Medium',
      adminNotes: ticket.adminNotes || ''
    });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    try {
      await updateTicket(selectedTicket.id, editData);
      setEditDialogOpen(false);
      fetchTickets();
    } catch (err) {
      console.error('Failed to update ticket:', err);
      alert('Failed to update ticket');
    }
  };

  const handleDeleteTicket = async (id) => {
    if (window.confirm('Are you sure you want to delete this ticket?')) {
      try {
        await deleteTicket(id);
        fetchTickets();
      } catch (err) {
        console.error('Failed to delete ticket:', err);
        alert('Failed to delete ticket');
      }
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'bug':
        return <BugIcon sx={{ fontSize: '1rem' }} />;
      case 'feature':
        return <FeatureIcon sx={{ fontSize: '1rem' }} />;
      case 'issue':
        return <SupportIcon sx={{ fontSize: '1rem' }} />;
      default:
        return <OtherIcon sx={{ fontSize: '1rem' }} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open':
        return { bg: 'rgba(59, 130, 246, 0.1)', text: '#3b82f6', border: 'rgba(59, 130, 246, 0.3)' };
      case 'In Progress':
        return { bg: 'rgba(245, 158, 11, 0.1)', text: '#f59e0b', border: 'rgba(245, 158, 11, 0.3)' };
      case 'Resolved':
        return { bg: 'rgba(16, 185, 129, 0.1)', text: '#10b981', border: 'rgba(16, 185, 129, 0.3)' };
      case 'Closed':
        return { bg: 'rgba(107, 114, 128, 0.1)', text: '#6b7280', border: 'rgba(107, 114, 128, 0.3)' };
      default:
        return { bg: 'rgba(107, 114, 128, 0.1)', text: '#6b7280', border: 'rgba(107, 114, 128, 0.3)' };
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Urgent':
        return { bg: 'rgba(220, 38, 38, 0.1)', text: '#dc2626', border: 'rgba(220, 38, 38, 0.3)' };
      case 'High':
        return { bg: 'rgba(245, 158, 11, 0.1)', text: '#f59e0b', border: 'rgba(245, 158, 11, 0.3)' };
      case 'Medium':
        return { bg: 'rgba(59, 130, 246, 0.1)', text: '#3b82f6', border: 'rgba(59, 130, 246, 0.3)' };
      case 'Low':
        return { bg: 'rgba(107, 114, 128, 0.1)', text: '#6b7280', border: 'rgba(107, 114, 128, 0.3)' };
      default:
        return { bg: 'rgba(107, 114, 128, 0.1)', text: '#6b7280', border: 'rgba(107, 114, 128, 0.3)' };
    }
  };

  const columns = [
    {
      field: 'referenceNumber',
      headerName: 'Reference',
      width: 150,
      renderCell: (params) => (
        <Typography
          sx={{
            fontFamily: 'monospace',
            fontSize: '0.875rem',
            fontWeight: 600,
            color: '#8b5cf6'
          }}
        >
          {params.value}
        </Typography>
      )
    },
    {
      field: 'type',
      headerName: 'Type',
      width: 120,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {getTypeIcon(params.value)}
          <Typography sx={{ fontSize: '0.875rem', textTransform: 'capitalize' }}>
            {params.value}
          </Typography>
        </Box>
      )
    },
    {
      field: 'subject',
      headerName: 'Subject',
      flex: 1,
      minWidth: 200
    },
    {
      field: 'userName',
      headerName: 'User',
      width: 150
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      renderCell: (params) => {
        const colors = getStatusColor(params.value);
        return (
          <Chip
            label={params.value}
            size="small"
            sx={{
              backgroundColor: colors.bg,
              color: colors.text,
              border: `1px solid ${colors.border}`,
              fontWeight: 600,
              fontSize: '0.75rem',
              height: 24
            }}
          />
        );
      }
    },
    {
      field: 'priority',
      headerName: 'Priority',
      width: 110,
      renderCell: (params) => {
        const colors = getPriorityColor(params.value);
        return (
          <Chip
            label={params.value}
            size="small"
            sx={{
              backgroundColor: colors.bg,
              color: colors.text,
              border: `1px solid ${colors.border}`,
              fontWeight: 600,
              fontSize: '0.75rem',
              height: 24
            }}
          />
        );
      }
    },
    {
      field: 'createdDate',
      headerName: 'Created',
      width: 120,
      renderCell: (params) => (
        <Typography sx={{ fontSize: '0.875rem' }}>
          {new Date(params.value).toLocaleDateString()}
        </Typography>
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 140,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <IconButton
            size="small"
            onClick={() => handleViewTicket(params.row)}
            sx={{
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              color: '#3b82f6',
              '&:hover': {
                backgroundColor: 'rgba(59, 130, 246, 0.2)'
              }
            }}
          >
            <ViewIcon sx={{ fontSize: '1rem' }} />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleEditTicket(params.row)}
            sx={{
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              color: '#f59e0b',
              '&:hover': {
                backgroundColor: 'rgba(245, 158, 11, 0.2)'
              }
            }}
          >
            <EditIcon sx={{ fontSize: '1rem' }} />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleDeleteTicket(params.row.id)}
            sx={{
              backgroundColor: 'rgba(220, 38, 38, 0.1)',
              color: '#dc2626',
              '&:hover': {
                backgroundColor: 'rgba(220, 38, 38, 0.2)'
              }
            }}
          >
            <DeleteIcon sx={{ fontSize: '1rem' }} />
          </IconButton>
        </Box>
      )
    }
  ];

  return (
    <Section>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
            }}
          >
            <SupportIcon sx={{ fontSize: '1.5rem', color: 'white' }} />
          </Box>
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                fontSize: { xs: '1.75rem', sm: '2rem' },
                color: 'rgba(15, 23, 42, 0.95)',
                letterSpacing: '-0.02em'
              }}
            >
              Support Tickets
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'rgba(15, 23, 42, 0.5)',
                fontSize: '0.9375rem'
              }}
            >
              Manage all user support requests
            </Typography>
          </Box>
        </Box>

        <Button
          variant="outlined"
          onClick={fetchTickets}
          sx={{
            color: '#8b5cf6',
            borderColor: '#8b5cf6',
            borderRadius: '8px',
            px: 3,
            py: 1,
            fontWeight: 600,
            textTransform: 'none',
            '&:hover': {
              borderColor: '#7c3aed',
              backgroundColor: 'rgba(139, 92, 246, 0.04)'
            }
          }}
        >
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
          {error}
        </Alert>
      )}

      {/* DataGrid */}
      <Box
        sx={{
          height: 600,
          backgroundColor: 'white',
          borderRadius: '12px',
          border: '1px solid rgba(15, 23, 42, 0.08)',
          overflow: 'hidden'
        }}
      >
        <DataGrid
          rows={tickets}
          columns={columns}
          loading={loading}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
          disableSelectionOnClick
          sx={{
            border: 'none',
            '& .MuiDataGrid-cell': {
              fontSize: '0.875rem',
              color: 'rgba(15, 23, 42, 0.8)'
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: 'rgba(15, 23, 42, 0.02)',
              borderBottom: '1px solid rgba(15, 23, 42, 0.08)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: 'rgba(15, 23, 42, 0.7)'
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: 'rgba(139, 92, 246, 0.04)'
            }
          }}
        />
      </Box>

      {/* View Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '12px'
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Ticket Details
          </Typography>
          <IconButton onClick={() => setViewDialogOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedTicket && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="caption" sx={{ color: 'rgba(15, 23, 42, 0.5)' }}>
                  Reference Number
                </Typography>
                <Typography variant="h6" sx={{ fontFamily: 'monospace', color: '#8b5cf6' }}>
                  {selectedTicket.referenceNumber}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: 'rgba(15, 23, 42, 0.5)' }}>
                  Type
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                  {getTypeIcon(selectedTicket.type)}
                  <Typography sx={{ textTransform: 'capitalize' }}>
                    {selectedTicket.type}
                  </Typography>
                </Box>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: 'rgba(15, 23, 42, 0.5)' }}>
                  Subject
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {selectedTicket.subject}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: 'rgba(15, 23, 42, 0.5)' }}>
                  Description
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mt: 0.5 }}>
                  {selectedTicket.description}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: 'rgba(15, 23, 42, 0.5)' }}>
                    User
                  </Typography>
                  <Typography variant="body2">
                    {selectedTicket.userName} ({selectedTicket.userEmail})
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: 'rgba(15, 23, 42, 0.5)' }}>
                    Status
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip
                      label={selectedTicket.status}
                      size="small"
                      sx={{
                        backgroundColor: getStatusColor(selectedTicket.status).bg,
                        color: getStatusColor(selectedTicket.status).text,
                        fontWeight: 600
                      }}
                    />
                  </Box>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: 'rgba(15, 23, 42, 0.5)' }}>
                    Priority
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip
                      label={selectedTicket.priority}
                      size="small"
                      sx={{
                        backgroundColor: getPriorityColor(selectedTicket.priority).bg,
                        color: getPriorityColor(selectedTicket.priority).text,
                        fontWeight: 600
                      }}
                    />
                  </Box>
                </Box>
              </Box>
              {selectedTicket.adminNotes && (
                <Box>
                  <Typography variant="caption" sx={{ color: 'rgba(15, 23, 42, 0.5)' }}>
                    Admin Notes
                  </Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mt: 0.5 }}>
                    {selectedTicket.adminNotes}
                  </Typography>
                </Box>
              )}
              <Box>
                <Typography variant="caption" sx={{ color: 'rgba(15, 23, 42, 0.5)' }}>
                  Created
                </Typography>
                <Typography variant="body2">
                  {new Date(selectedTicket.createdDate).toLocaleString()}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '12px'
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Edit Ticket
          </Typography>
          <IconButton onClick={() => setEditDialogOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={editData.status}
                onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                label="Status"
              >
                <MenuItem value="Open">Open</MenuItem>
                <MenuItem value="In Progress">In Progress</MenuItem>
                <MenuItem value="Resolved">Resolved</MenuItem>
                <MenuItem value="Closed">Closed</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={editData.priority}
                onChange={(e) => setEditData({ ...editData, priority: e.target.value })}
                label="Priority"
              >
                <MenuItem value="Low">Low</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="High">High</MenuItem>
                <MenuItem value="Urgent">Urgent</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Admin Notes"
              multiline
              rows={4}
              value={editData.adminNotes}
              onChange={(e) => setEditData({ ...editData, adminNotes: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button
            onClick={() => setEditDialogOpen(false)}
            sx={{ textTransform: 'none', color: 'rgba(15, 23, 42, 0.7)' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveEdit}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: 'none',
              '&:hover': {
                background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                boxShadow: 'none'
              }
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Section>
  );
};

export default AdminSupportTicketsPage;
