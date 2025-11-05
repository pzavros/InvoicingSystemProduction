import React, { useState } from 'react';
import {
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Tooltip
} from '@mui/material';
import {
  HelpOutline as HelpIcon,
  Close as CloseIcon,
  InfoOutlined as InfoIcon,
  CheckCircleOutline as CheckIcon
} from '@mui/icons-material';

/**
 * PageHelper Component
 * Displays a help icon that opens a dialog with page-specific guidance
 * 
 * @param {Object} props
 * @param {string} props.title - The title of the help dialog
 * @param {string} props.description - Main description text
 * @param {Array} props.steps - Array of step objects with icon, title, and description
 * @param {Array} props.tips - Array of tip strings (optional)
 */
export default function PageHelper({ title, description, steps = [], tips = [] }) {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      <Tooltip title="Help & Guide" arrow placement="left">
        <IconButton
          onClick={handleOpen}
          sx={{
            position: 'fixed',
            top: { xs: 80, md: 20 },
            right: { xs: 16, md: 24 },
            width: { xs: 40, md: 36 },
            height: { xs: 40, md: 36 },
            backgroundColor: 'rgba(0, 0, 0, 0.15)',
            color: 'rgba(0, 0, 0, 0.65)',
            zIndex: 9999,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.2)',
              color: 'rgba(0, 0, 0, 0.85)',
              transform: 'scale(1.05)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
            },
            '&:active': {
              transform: 'scale(0.98)',
            }
          }}
        >
          <HelpIcon sx={{ fontSize: { xs: 22, md: 20 } }} />
        </IconButton>
      </Tooltip>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        fullScreen={{ xs: true, sm: false }}
        PaperProps={{
          sx: {
            borderRadius: { xs: 0, sm: 3 },
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            margin: { xs: 0, sm: 2 },
            maxHeight: { xs: '100vh', sm: '90vh' }
          }
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
            color: 'white',
            py: { xs: 1.5, sm: 2 },
            px: { xs: 2, sm: 3 }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 } }}>
            <HelpIcon sx={{ fontSize: { xs: 24, sm: 28 } }} />
            <Typography variant="h6" component="div" sx={{ fontWeight: 600, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
              {title}
            </Typography>
          </Box>
          <IconButton
            onClick={handleClose}
            sx={{
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 3 }, overflowY: 'auto' }}>
          {description && (
            <>
              <Box sx={{ mb: { xs: 2, sm: 3 } }}>
                <Typography
                  variant="body1"
                  sx={{
                    color: 'text.secondary',
                    lineHeight: 1.7,
                    fontSize: { xs: '0.9rem', sm: '1rem' }
                  }}
                >
                  {description}
                </Typography>
              </Box>
              <Divider sx={{ mb: { xs: 2, sm: 3 } }} />
            </>
          )}

          {steps.length > 0 && (
            <>
              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  fontWeight: 600,
                  color: 'text.primary',
                  fontSize: { xs: '1rem', sm: '1.125rem' }
                }}
              >
                How to Use This Page
              </Typography>
              <List sx={{ mb: 2 }}>
                {steps.map((step, index) => (
                  <ListItem
                    key={index}
                    sx={{
                      alignItems: 'flex-start',
                      px: 0,
                      py: { xs: 1, sm: 1.5 },
                      '&:hover': {
                        backgroundColor: 'rgba(139, 92, 246, 0.04)',
                        borderRadius: 2
                      }
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: { xs: 36, sm: 40 }, mt: 0.5 }}>
                      {step.icon || <CheckIcon sx={{ color: '#8b5cf6', fontSize: { xs: 20, sm: 24 } }} />}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: 600,
                            color: 'text.primary',
                            mb: 0.5,
                            fontSize: { xs: '0.875rem', sm: '0.95rem' }
                          }}
                        >
                          {step.title}
                        </Typography>
                      }
                      secondary={
                        <Typography
                          variant="body2"
                          sx={{
                            color: 'text.secondary',
                            lineHeight: 1.6,
                            fontSize: { xs: '0.8125rem', sm: '0.875rem' }
                          }}
                        >
                          {step.description}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </>
          )}

          {tips.length > 0 && (
            <>
              <Divider sx={{ my: { xs: 2, sm: 3 } }} />
              <Box
                sx={{
                  backgroundColor: 'rgba(139, 92, 246, 0.05)',
                  borderRadius: 2,
                  p: { xs: 2, sm: 2.5 },
                  border: '1px solid rgba(139, 92, 246, 0.2)'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <InfoIcon sx={{ color: '#8b5cf6', fontSize: { xs: 20, sm: 22 } }} />
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 600,
                      color: '#8b5cf6',
                      fontSize: { xs: '0.875rem', sm: '0.95rem' }
                    }}
                  >
                    Pro Tips
                  </Typography>
                </Box>
                <List dense sx={{ pl: 0.5 }}>
                  {tips.map((tip, index) => (
                    <ListItem
                      key={index}
                      sx={{
                        px: 0,
                        py: 0.5,
                        display: 'list-item',
                        listStyleType: 'disc',
                        listStylePosition: 'inside'
                      }}
                    >
                      <Typography
                        variant="body2"
                        component="span"
                        sx={{
                          color: 'text.secondary',
                          ml: 0.5,
                          lineHeight: 1.6,
                          fontSize: { xs: '0.8125rem', sm: '0.875rem' }
                        }}
                      >
                        {tip}
                      </Typography>
                    </ListItem>
                  ))}
                </List>
              </Box>
            </>
          )}
        </DialogContent>

        <DialogActions sx={{ px: { xs: 2, sm: 3 }, py: { xs: 1.5, sm: 2 }, backgroundColor: '#f8fafc' }}>
          <Button
            onClick={handleClose}
            variant="contained"
            fullWidth={{ xs: true, sm: false }}
            sx={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
              color: 'white',
              px: 3,
              py: { xs: 1.25, sm: 1 },
              textTransform: 'none',
              fontWeight: 600,
              fontSize: { xs: '0.9375rem', sm: '1rem' },
              '&:hover': {
                background: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)',
              }
            }}
          >
            Got it!
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
