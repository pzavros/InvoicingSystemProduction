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
 * @param {boolean} props.inline - If true, renders as inline button instead of fixed position (default: false)
 * @param {boolean} props.compact - If true, renders as a tiny icon next to title (default: false)
 */
export default function PageHelper({ title, description, steps = [], tips = [], inline = false, compact = false }) {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      <Tooltip title="Help & Guide" arrow placement={inline || compact ? "bottom" : "right"}>
        <IconButton
          onClick={handleOpen}
          sx={compact ? {
            // Compact mode - tiny icon next to title
            width: 20,
            height: 20,
            padding: 0,
            minWidth: 'auto',
            color: '#8b5cf6',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              color: '#7c3aed',
              transform: 'scale(1.15)',
            },
            '&:active': {
              transform: 'scale(0.95)',
            }
          } : inline ? {
            // Inline mode - no fixed positioning
            width: { xs: 40, md: 40 },
            height: { xs: 40, md: 40 },
            backgroundColor: 'rgba(139, 92, 246, 0.08)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(139, 92, 246, 0.15)',
            color: '#8b5cf6',
            borderRadius: '10px',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              backgroundColor: 'rgba(139, 92, 246, 0.12)',
              borderColor: 'rgba(139, 92, 246, 0.25)',
              boxShadow: '0 4px 12px rgba(139, 92, 246, 0.2)',
            },
            '&:active': {
              transform: 'scale(0.95)',
            }
          } : {
            // Fixed mode - floating button
            position: 'fixed',
            bottom: { xs: 20, md: 24 },
            left: { xs: 16, md: 24 },
            width: { xs: 52, md: 48 },
            height: { xs: 52, md: 48 },
            backgroundColor: 'rgba(139, 92, 246, 0.08)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(139, 92, 246, 0.15)',
            color: '#8b5cf6',
            zIndex: 1200,
            borderRadius: '12px',
            boxShadow: '0 4px 16px rgba(139, 92, 246, 0.15)',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              backgroundColor: 'rgba(139, 92, 246, 0.12)',
              borderColor: 'rgba(139, 92, 246, 0.25)',
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 24px rgba(139, 92, 246, 0.25)',
            },
            '&:active': {
              transform: 'translateY(0)',
            }
          }}
        >
          <HelpIcon sx={{ fontSize: compact ? 16 : (inline ? 20 : { xs: 24, md: 22 }) }} />
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
            borderRadius: { xs: 0, sm: '20px' },
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)',
            boxShadow: '0 20px 60px rgba(15, 23, 42, 0.15), 0 0 1px rgba(15, 23, 42, 0.1)',
            border: { xs: 'none', sm: '1px solid rgba(15, 23, 42, 0.08)' },
            margin: { xs: 0, sm: 2 },
            maxHeight: { xs: '100vh', sm: '90vh' },
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.06) 0%, rgba(168, 85, 247, 0.06) 100%)',
            borderBottom: '1px solid rgba(139, 92, 246, 0.1)',
            py: { xs: 2.5, sm: 3 },
            px: { xs: 3, sm: 4 }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2 } }}>
            <Box
              sx={{
                width: { xs: 40, sm: 48 },
                height: { xs: 40, sm: 48 },
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(139, 92, 246, 0.25)'
              }}
            >
              <HelpIcon sx={{ fontSize: { xs: 22, sm: 26 }, color: 'white' }} />
            </Box>
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ 
                fontWeight: 700, 
                fontSize: { xs: '1.125rem', sm: '1.375rem' },
                color: 'rgba(15, 23, 42, 0.95)',
                letterSpacing: '-0.02em'
              }}
            >
              {title}
            </Typography>
          </Box>
          <IconButton
            onClick={handleClose}
            sx={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              backgroundColor: 'rgba(15, 23, 42, 0.04)',
              border: '1px solid rgba(15, 23, 42, 0.08)',
              color: 'rgba(15, 23, 42, 0.6)',
              transition: 'all 0.15s ease',
              '&:hover': {
                backgroundColor: 'rgba(15, 23, 42, 0.08)',
                borderColor: 'rgba(15, 23, 42, 0.12)',
                color: 'rgba(15, 23, 42, 0.9)',
              }
            }}
          >
            <CloseIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ px: { xs: 3, sm: 4 }, py: { xs: 3, sm: 4 }, overflowY: 'auto' }}>
          {description && (
            <>
              <Box sx={{ mb: { xs: 3, sm: 4 } }}>
                <Typography
                  variant="body1"
                  sx={{
                    color: 'rgba(15, 23, 42, 0.7)',
                    lineHeight: 1.7,
                    fontSize: { xs: '0.9375rem', sm: '1rem' },
                    fontWeight: 400
                  }}
                >
                  {description}
                </Typography>
              </Box>
              <Divider sx={{ 
                mb: { xs: 3, sm: 4 },
                borderColor: 'rgba(15, 23, 42, 0.08)'
              }} />
            </>
          )}

          {steps.length > 0 && (
            <>
              <Typography
                variant="h6"
                sx={{
                  mb: 3,
                  fontWeight: 700,
                  color: 'rgba(15, 23, 42, 0.95)',
                  fontSize: { xs: '1rem', sm: '1.125rem' },
                  letterSpacing: '-0.01em'
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
                      px: 2.5,
                      py: { xs: 2, sm: 2.5 },
                      mb: 1.5,
                      borderRadius: '12px',
                      backgroundColor: 'rgba(139, 92, 246, 0.03)',
                      border: '1px solid rgba(139, 92, 246, 0.08)',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: 'rgba(139, 92, 246, 0.06)',
                        borderColor: 'rgba(139, 92, 246, 0.15)',
                        transform: 'translateX(4px)',
                        boxShadow: '0 2px 8px rgba(139, 92, 246, 0.1)'
                      }
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: { xs: 40, sm: 48 }, mt: 0.25 }}>
                      <Box
                        sx={{
                          width: { xs: 32, sm: 36 },
                          height: { xs: 32, sm: 36 },
                          borderRadius: '10px',
                          background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 2px 8px rgba(139, 92, 246, 0.2)'
                        }}
                      >
                        {step.icon ? (
                          React.cloneElement(step.icon, {
                            sx: { color: 'white', fontSize: { xs: 18, sm: 20 } }
                          })
                        ) : (
                          <CheckIcon sx={{ color: 'white', fontSize: { xs: 18, sm: 20 } }} />
                        )}
                      </Box>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: 700,
                            color: 'rgba(15, 23, 42, 0.95)',
                            mb: 0.75,
                            fontSize: { xs: '0.9375rem', sm: '1rem' },
                            letterSpacing: '-0.01em'
                          }}
                        >
                          {step.title}
                        </Typography>
                      }
                      secondary={
                        <Typography
                          variant="body2"
                          sx={{
                            color: 'rgba(15, 23, 42, 0.65)',
                            lineHeight: 1.7,
                            fontSize: { xs: '0.875rem', sm: '0.9375rem' }
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
              <Divider sx={{ 
                my: { xs: 3, sm: 4 },
                borderColor: 'rgba(15, 23, 42, 0.08)'
              }} />
              <Box
                sx={{
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.04) 0%, rgba(168, 85, 247, 0.04) 100%)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  borderRadius: '16px',
                  p: { xs: 2.5, sm: 3 },
                  border: '1px solid rgba(139, 92, 246, 0.15)',
                  boxShadow: '0 2px 8px rgba(139, 92, 246, 0.08)'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 8px rgba(139, 92, 246, 0.2)'
                    }}
                  >
                    <InfoIcon sx={{ color: 'white', fontSize: { xs: 18, sm: 20 } }} />
                  </Box>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 700,
                      color: '#8b5cf6',
                      fontSize: { xs: '0.9375rem', sm: '1rem' },
                      letterSpacing: '-0.01em'
                    }}
                  >
                    💡 Pro Tips
                  </Typography>
                </Box>
                <List dense sx={{ pl: 0.5 }}>
                  {tips.map((tip, index) => (
                    <ListItem
                      key={index}
                      sx={{
                        px: 0,
                        py: 0.75,
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 1.5
                      }}
                    >
                      <Box
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          backgroundColor: '#8b5cf6',
                          flexShrink: 0,
                          mt: 1
                        }}
                      />
                      <Typography
                        variant="body2"
                        component="span"
                        sx={{
                          color: 'rgba(15, 23, 42, 0.7)',
                          lineHeight: 1.7,
                          fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                          flex: 1
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

        <DialogActions 
          sx={{ 
            px: { xs: 3, sm: 4 }, 
            py: { xs: 2.5, sm: 3 }, 
            background: 'linear-gradient(180deg, rgba(248, 250, 252, 0.5) 0%, rgba(248, 250, 252, 0.9) 100%)',
            borderTop: '1px solid rgba(15, 23, 42, 0.06)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)'
          }}
        >
          <Button
            onClick={handleClose}
            variant="contained"
            fullWidth={{ xs: true, sm: false }}
            sx={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
              color: 'white',
              px: { xs: 3, sm: 4 },
              py: { xs: 1.5, sm: 1.25 },
              minWidth: { xs: '100%', sm: '160px' },
              textTransform: 'none',
              fontWeight: 700,
              fontSize: { xs: '1rem', sm: '1.0625rem' },
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(139, 92, 246, 0.25)',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              letterSpacing: '-0.01em',
              '&:hover': {
                background: 'linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 16px rgba(139, 92, 246, 0.35)',
              },
              '&:active': {
                transform: 'translateY(0)',
              }
            }}
          >
            Got it, thanks! ✓
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
