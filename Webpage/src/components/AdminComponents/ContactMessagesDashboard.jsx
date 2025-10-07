import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Alert,
  CircularProgress,
  Grid,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Button,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { apiCall } from '../../utils/apiConfig.js';
import {
  Email,
  TrendingUp,
  QuestionAnswer,
  CalendarToday,
  MarkEmailRead,
  Reply,
  Visibility,
  Delete,
  Close
} from '@mui/icons-material';

const ContactMessagesDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalMessages: 0,
    newMessages: 0,
    inProgressMessages: 0,
    resolvedMessages: 0,
    todayMessages: 0,
    weekMessages: 0,
    monthMessages: 0,
    statusBreakdown: {},
    sourceBreakdown: {}
  });
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const fetchStats = async () => {
    try {
      const data = await apiCall('/api/webpage/contact/stats');
      setStats({
        totalMessages: data.totalMessages || 0,
        newMessages: data.newMessages || 0,
        inProgressMessages: data.inProgressMessages || 0,
        resolvedMessages: data.resolvedMessages || 0,
        todayMessages: data.todayMessages || 0,
        weekMessages: data.weekMessages || 0,
        monthMessages: data.monthMessages || 0,
        statusBreakdown: data.statusBreakdown || {},
        sourceBreakdown: data.sourceBreakdown || {}
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('Unable to connect to server');
    }
  };

  const fetchMessages = async () => {
    setMessagesLoading(true);
    try {
      const data = await apiCall('/api/webpage/contact?page=1&pageSize=50');
      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setMessagesLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await apiCall(`/api/webpage/contact/${id}/read`, {
        method: 'PATCH'
      });
      // Refresh data
      await Promise.all([fetchStats(), fetchMessages()]);
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const markAsReplied = async (id) => {
    try {
      await apiCall(`/api/webpage/contact/${id}/replied`, {
        method: 'PATCH'
      });
      // Refresh data
      await Promise.all([fetchStats(), fetchMessages()]);
    } catch (err) {
      console.error('Error marking as replied:', err);
    }
  };

  const handleViewDetails = (message) => {
    setSelectedMessage(message);
    setAdminNotes(message.adminNotes || '');
    setSelectedStatus(message.status || 'New');
    setDetailsDialogOpen(true);
    
    // Mark as read if not already read
    if (!message.isRead) {
      markAsRead(message.id);
    }
  };

  const handleCloseDetails = () => {
    setDetailsDialogOpen(false);
    setSelectedMessage(null);
    setAdminNotes('');
    setSelectedStatus('');
  };

  const handleUpdateMessage = async () => {
    if (!selectedMessage) return;
    
    try {
      // Update notes if they changed
      if (adminNotes !== (selectedMessage.adminNotes || '')) {
        await apiCall(`/api/webpage/contact/${selectedMessage.id}/notes`, {
          method: 'PATCH',
          body: JSON.stringify({
            notes: adminNotes
          })
        });
      }
      
      // Update status if it changed
      if (selectedStatus !== selectedMessage.status) {
        await apiCall(`/api/webpage/contact/${selectedMessage.id}/status`, {
          method: 'PATCH',
          body: JSON.stringify({
            status: selectedStatus
          })
        });
      }
      
      // Refresh data
      await Promise.all([fetchStats(), fetchMessages()]);
      handleCloseDetails();
    } catch (err) {
      console.error('Error updating message:', err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchStats(), fetchMessages()]);
      setLoading(false);
    };

    loadData();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'New':
        return 'error';
      case 'InProgress':
        return 'warning';
      case 'Resolved':
        return 'success';
      case 'Closed':
        return 'default';
      default:
        return 'default';
    }
  };

  const StatCard = ({ title, value, icon, color = 'primary' }) => {
    const colorMap = {
      primary: { bg: '#667eea', bgSecondary: '#764ba2', shadow: 'rgba(102, 126, 234, 0.3)' },
      success: { bg: '#48bb78', bgSecondary: '#38a169', shadow: 'rgba(72, 187, 120, 0.3)' },
      warning: { bg: '#ed8936', bgSecondary: '#dd6b20', shadow: 'rgba(237, 137, 54, 0.3)' },
      error: { bg: '#f56565', bgSecondary: '#e53e3e', shadow: 'rgba(245, 101, 101, 0.3)' }
    };
    
    const colors = colorMap[color] || colorMap.primary;
    
    return (
      <Card 
        sx={{ 
          height: '100%',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.6) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: 3,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: `0 20px 40px ${colors.shadow}`,
            border: `1px solid ${colors.bg}40`
          }
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: 3,
                background: `linear-gradient(135deg, ${colors.bg} 0%, ${colors.bgSecondary} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                boxShadow: `0 8px 32px ${colors.shadow}`,
                '& svg': { fontSize: '1.75rem' }
              }}
            >
              {icon}
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography 
                variant="h3" 
                fontWeight="bold" 
                sx={{ 
                  color: '#2d3748',
                  mb: 0.5,
                  lineHeight: 1
                }}
              >
                {value?.toLocaleString() || 0}
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: '#718096',
                  fontWeight: 500
                }}
              >
                {title}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 4,
            borderRadius: 2,
            background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.1) 0%, rgba(211, 47, 47, 0.05) 100%)',
            border: '1px solid rgba(244, 67, 54, 0.2)'
          }}
        >
          {error}
        </Alert>
      )}

      <Grid container spacing={4} sx={{ mb: 6 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Messages"
            value={stats.totalMessages || 0}
            icon={<Email />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="New Messages"
            value={stats.newMessages || 0}
            icon={<QuestionAnswer />}
            color="error"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Today"
            value={stats.todayMessages || 0}
            icon={<TrendingUp />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="This Week"
            value={stats.weekMessages || 0}
            icon={<CalendarToday />}
            color="warning"
          />
        </Grid>
      </Grid>

      <Grid container spacing={4}>
        {/* Status Breakdown Card */}
        {stats.statusBreakdown && typeof stats.statusBreakdown === 'object' && Object.keys(stats.statusBreakdown).length > 0 && (
          <Grid item xs={12} lg={4}>
            <Card 
              sx={{ 
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.6) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: 3,
                height: 'fit-content'
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Typography 
                  variant="h5" 
                  fontWeight="bold" 
                  sx={{ 
                    mb: 3,
                    color: '#2d3748',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  <QuestionAnswer sx={{ color: '#667eea' }} />
                  Status Breakdown
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {Object.entries(stats.statusBreakdown || {}).map(([status, count], index) => {
                    const statusColors = {
                      'New': '#f56565',
                      'InProgress': '#ed8936',
                      'Resolved': '#48bb78',
                      'Closed': '#4299e1'
                    };
                    const color = statusColors[status] || '#667eea';
                    return (
                      <Box 
                        key={status} 
                        sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          p: 2,
                          borderRadius: 2,
                          background: `linear-gradient(135deg, ${color}10 0%, ${color}05 100%)`,
                          border: `1px solid ${color}20`
                        }}
                      >
                        <Typography fontWeight="500" sx={{ color: '#2d3748' }}>
                          {status}
                        </Typography>
                        <Chip 
                          label={count} 
                          size="small"
                          sx={{
                            background: color,
                            color: 'white',
                            fontWeight: 'bold'
                          }}
                        />
                      </Box>
                    );
                  })}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Messages Table */}
        <Grid item xs={12} lg={stats.statusBreakdown && Object.keys(stats.statusBreakdown).length > 0 ? 8 : 12}>
          <Card 
            sx={{ 
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.6) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: 3
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Typography 
                variant="h5" 
                fontWeight="bold" 
                sx={{ 
                  mb: 3,
                  color: '#2d3748',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <Email sx={{ color: '#667eea' }} />
                Recent Messages
              </Typography>
              
              {messagesLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                  <CircularProgress size={48} sx={{ color: '#667eea' }} />
                </Box>
              ) : messages.length > 0 ? (
                <Box sx={{ overflowX: 'auto' }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold', color: '#4a5568', borderBottom: '2px solid #e2e8f0' }}>Name</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: '#4a5568', borderBottom: '2px solid #e2e8f0' }}>Email</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: '#4a5568', borderBottom: '2px solid #e2e8f0' }}>Subject</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: '#4a5568', borderBottom: '2px solid #e2e8f0' }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: '#4a5568', borderBottom: '2px solid #e2e8f0' }}>Date</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: '#4a5568', borderBottom: '2px solid #e2e8f0' }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {messages.map((message) => (
                        <TableRow 
                          key={message.id}
                          sx={{ 
                            backgroundColor: message.isRead ? 'inherit' : 'rgba(102, 126, 234, 0.04)',
                            fontWeight: message.isRead ? 'normal' : 'bold',
                            '&:hover': {
                              backgroundColor: 'rgba(102, 126, 234, 0.08)',
                              transform: 'scale(1.001)'
                            },
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <TableCell>
                            <Typography 
                              variant="body2" 
                              fontWeight={message.isRead ? 'normal' : 'bold'}
                              sx={{ color: '#2d3748' }}
                            >
                              {message.firstName} {message.lastName}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ color: '#4a5568' }}>{message.email}</TableCell>
                          <TableCell>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                maxWidth: 200, 
                                overflow: 'hidden', 
                                textOverflow: 'ellipsis',
                                fontWeight: message.isRead ? 'normal' : 'bold',
                                color: '#4a5568'
                              }}
                            >
                              {message.subject}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={message.status} 
                              color={getStatusColor(message.status)}
                              size="small"
                              sx={{
                                fontWeight: 'bold',
                                '& .MuiChip-label': { fontSize: '0.75rem' }
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ color: '#718096', fontSize: '0.875rem' }}>
                            {formatDate(message.createdAt)}
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                              {!message.isRead && (
                                <Tooltip title="Mark as Read">
                                  <IconButton 
                                    size="small" 
                                    onClick={() => markAsRead(message.id)}
                                    sx={{ 
                                      color: '#667eea',
                                      '&:hover': { backgroundColor: 'rgba(102, 126, 234, 0.1)' }
                                    }}
                                  >
                                    <MarkEmailRead fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                              {!message.isReplied && (
                                <Tooltip title="Mark as Replied">
                                  <IconButton 
                                    size="small" 
                                    onClick={() => markAsReplied(message.id)}
                                    sx={{ 
                                      color: '#48bb78',
                                      '&:hover': { backgroundColor: 'rgba(72, 187, 120, 0.1)' }
                                    }}
                                  >
                                    <Reply fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                              <Tooltip title="View Details">
                                <IconButton 
                                  size="small" 
                                  onClick={() => handleViewDetails(message)}
                                  sx={{ 
                                    color: '#4299e1',
                                    '&:hover': { backgroundColor: 'rgba(66, 153, 225, 0.1)' }
                                  }}
                                >
                                  <Visibility fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              ) : (
                <Box 
                  sx={{ 
                    textAlign: 'center', 
                    py: 8,
                    color: '#718096'
                  }}
                >
                  <Email sx={{ fontSize: 64, color: '#cbd5e0', mb: 2 }} />
                  <Typography variant="h6" sx={{ color: '#4a5568', mb: 1 }}>
                    No messages yet
                  </Typography>
                  <Typography variant="body2">
                    Contact messages will appear here once users start reaching out
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Enhanced Message Details Dialog */}
      <Dialog 
        open={detailsDialogOpen} 
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }
        }}
      >
        <DialogTitle 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: '12px 12px 0 0'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Email />
            <Typography variant="h6" fontWeight="bold">Message Details</Typography>
          </Box>
          <IconButton 
            onClick={handleCloseDetails} 
            size="small"
            sx={{ 
              color: 'white',
              '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {selectedMessage && (
            <Box>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Name</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedMessage.firstName} {selectedMessage.lastName}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedMessage.email}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      label="Status"
                    >
                      <MenuItem value="New">New</MenuItem>
                      <MenuItem value="InProgress">In Progress</MenuItem>
                      <MenuItem value="Resolved">Resolved</MenuItem>
                      <MenuItem value="Closed">Closed</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Date</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {formatDate(selectedMessage.createdAt)}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Subject</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedMessage.subject}
                  </Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                Message
              </Typography>
              <Box 
                sx={{ 
                  p: 2, 
                  backgroundColor: 'grey.50', 
                  borderRadius: 1, 
                  mb: 3,
                  whiteSpace: 'pre-wrap'
                }}
              >
                <Typography variant="body1">
                  {selectedMessage.message}
                </Typography>
              </Box>

              <TextField
                label="Admin Notes"
                multiline
                rows={4}
                fullWidth
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add internal notes about this message..."
                sx={{ mb: 2 }}
              />

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Read: {selectedMessage.isRead ? 'Yes' : 'No'}
                </Typography>
                <Typography variant="subtitle2" color="text.secondary">
                  Replied: {selectedMessage.isReplied ? 'Yes' : 'No'}
                </Typography>
                {selectedMessage.source && (
                  <Typography variant="subtitle2" color="text.secondary">
                    Source: {selectedMessage.source}
                  </Typography>
                )}
              </Box>

              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                {!selectedMessage.isReplied && (
                  <Button
                    size="small"
                    variant="outlined"
                    color="success"
                    onClick={() => markAsReplied(selectedMessage.id)}
                    startIcon={<Reply />}
                  >
                    Mark as Replied
                  </Button>
                )}
                <Button
                  size="small"
                  variant="outlined"
                  color="warning"
                  onClick={() => setSelectedStatus('InProgress')}
                >
                  Set In Progress
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  color="success"
                  onClick={() => setSelectedStatus('Resolved')}
                >
                  Mark Resolved
                </Button>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetails}>
            Cancel
          </Button>
          <Button 
            onClick={handleUpdateMessage} 
            variant="contained"
            disabled={!selectedMessage}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ContactMessagesDashboard;
