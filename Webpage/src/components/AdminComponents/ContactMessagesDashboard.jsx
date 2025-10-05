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
      const response = await fetch('http://localhost:5000/api/webpage/contact/stats');
      if (response.ok) {
        const data = await response.json();
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
      } else {
        setError('Failed to load statistics');
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('Unable to connect to server');
    }
  };

  const fetchMessages = async () => {
    setMessagesLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/webpage/contact?page=1&pageSize=50');
      if (response.ok) {
        const data = await response.json();
        setMessages(Array.isArray(data) ? data : []);
      } else {
        console.error('Failed to load messages');
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setMessagesLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/webpage/contact/${id}/read`, {
        method: 'PATCH'
      });
      if (response.ok) {
        // Refresh data
        await Promise.all([fetchStats(), fetchMessages()]);
      }
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const markAsReplied = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/webpage/contact/${id}/replied`, {
        method: 'PATCH'
      });
      if (response.ok) {
        // Refresh data
        await Promise.all([fetchStats(), fetchMessages()]);
      }
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
        await fetch(`http://localhost:5000/api/webpage/contact/${selectedMessage.id}/notes`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            notes: adminNotes
          })
        });
      }
      
      // Update status if it changed
      if (selectedStatus !== selectedMessage.status) {
        await fetch(`http://localhost:5000/api/webpage/contact/${selectedMessage.id}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
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

  const StatCard = ({ title, value, icon, color = 'primary' }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${color === 'primary' ? '#667eea 0%, #764ba2' : color === 'success' ? '#4caf50 0%, #2e7d32' : color === 'warning' ? '#ff9800 0%, #f57c00' : '#f44336 0%, #d32f2f'} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}
          >
            {icon}
          </Box>
          <Box>
            <Typography variant="h4" fontWeight="bold">
              {value}
            </Typography>
            <Typography color="text.secondary">
              {title}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h3" fontWeight="bold" sx={{ mb: 4 }}>
        Contact Messages Dashboard
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 4 }}>
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

      {stats.statusBreakdown && typeof stats.statusBreakdown === 'object' && Object.keys(stats.statusBreakdown).length > 0 && (
        <Card sx={{ mt: 4 }}>
          <CardContent>
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
              Status Breakdown
            </Typography>
            <Box>
              {Object.entries(stats.statusBreakdown || {}).map(([status, count]) => (
                <Typography key={status}>
                  {status}: {count}
                </Typography>
              ))}
            </Box>
          </CardContent>
        </Card>
      )}

      <Card sx={{ mt: 4 }}>
        <CardContent>
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
            Recent Messages
          </Typography>
          {messagesLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : messages.length > 0 ? (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Subject</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {messages.map((message) => (
                  <TableRow 
                    key={message.id}
                    sx={{ 
                      backgroundColor: message.isRead ? 'inherit' : 'rgba(102, 126, 234, 0.05)',
                      fontWeight: message.isRead ? 'normal' : 'bold'
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight={message.isRead ? 'normal' : 'bold'}>
                        {message.firstName} {message.lastName}
                      </Typography>
                    </TableCell>
                    <TableCell>{message.email}</TableCell>
                    <TableCell>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          maxWidth: 200, 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis',
                          fontWeight: message.isRead ? 'normal' : 'bold'
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
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(message.createdAt)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {!message.isRead && (
                          <Tooltip title="Mark as Read">
                            <IconButton 
                              size="small" 
                              onClick={() => markAsRead(message.id)}
                              color="primary"
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
                              color="success"
                            >
                              <Reply fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="View Details">
                          <IconButton 
                            size="small" 
                            color="info"
                            onClick={() => handleViewDetails(message)}
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
          ) : (
            <Typography color="text.secondary">
              No messages yet
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Message Details Dialog */}
      <Dialog 
        open={detailsDialogOpen} 
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Message Details</Typography>
          <IconButton onClick={handleCloseDetails} size="small">
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
