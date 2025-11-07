// src/components/ProductCatalogPage/ProductPriceHistoryDialog.jsx
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  Divider
} from "@mui/material";
import {
  Close as CloseIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Timeline as TimelineIcon,
  Euro as EuroIcon
} from "@mui/icons-material";
import { getProductPriceHistory } from "./api";
import { formatDate } from "../ReusableComponents/dateUtils";

const ProductPriceHistoryDialog = ({ open, product, onClose }) => {
  const [priceHistory, setPriceHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open && product) {
      loadPriceHistory();
    }
  }, [open, product]);
  const loadPriceHistory = async () => {
    setLoading(true);
    setError("");
    
    try {
      const history = await getProductPriceHistory(product.id);
      setPriceHistory(history);
    } catch (error) {
      setError("Error loading price history: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPriceHistory([]);
    setError("");
    onClose();
  };

  const calculatePriceChange = (currentPrice, previousPrice) => {
    if (!previousPrice) return null;
    
    const change = currentPrice - previousPrice;
    const percentage = ((change / previousPrice) * 100).toFixed(2);
    
    return {
      amount: change,
      percentage: percentage,
      isIncrease: change > 0
    };
  };
  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="lg" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '20px',
          boxShadow: '0 20px 60px rgba(15, 23, 42, 0.15)',
          minHeight: '500px'
        }
      }}
      slotProps={{
        backdrop: {
          sx: {
            backdropFilter: 'blur(12px)',
            backgroundColor: 'rgba(15, 23, 42, 0.4)'
          }
        }
      }}
    >
      <DialogTitle 
        sx={{ 
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          pb: 2,
          pt: 3,
          px: 3
        }}
      >
        <Box>
          <Typography variant="h5" sx={{
            fontWeight: 700,
            color: 'rgba(15, 23, 42, 0.95)',
            fontSize: '1.5rem',
            letterSpacing: '-0.02em',
            mb: 0.5
          }}>
            Price History
          </Typography>
          <Typography variant="body2" sx={{
            color: 'rgba(15, 23, 42, 0.55)',
            fontSize: '0.875rem',
            fontWeight: 500
          }}>
            {product?.name}
          </Typography>
        </Box>
        <IconButton 
          onClick={handleClose} 
          sx={{ 
            width: 36,
            height: 36,
            borderRadius: '10px',
            border: '1px solid rgba(15, 23, 42, 0.08)',
            backgroundColor: 'rgba(15, 23, 42, 0.02)',
            color: 'rgba(15, 23, 42, 0.65)',
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: 'rgba(15, 23, 42, 0.06)',
              borderColor: 'rgba(15, 23, 42, 0.12)',
              color: 'rgba(15, 23, 42, 0.85)'
            }
          }}
        >
          <CloseIcon sx={{ fontSize: '1.125rem' }} />
        </IconButton>
      </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
        {/* Current Price Banner */}
        <Card 
          sx={{ 
            m: 3, 
            mb: 2,
            background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
            color: 'white',
            boxShadow: '0 4px 12px rgba(139, 92, 246, 0.25)',
            borderRadius: '14px',
            border: 'none'
          }}
        >
          <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2.5, px: 3 }}>
            <Box sx={{ 
              width: 48,
              height: 48,
              borderRadius: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <EuroIcon sx={{ fontSize: 28 }} />
            </Box>
            <Box>
              <Typography variant="body2" sx={{ opacity: 0.85, mb: 0.5, fontSize: '0.8125rem', fontWeight: 500 }}>
                Current Price
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
                €{(product?.unitPrice || 0).toFixed(2)}
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Box sx={{ px: 3, pb: 3 }}>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : priceHistory.length === 0 ? (
            <Alert severity="info">
              No price history available for this product.
            </Alert>          ) : (
            <TableContainer 
              component={Paper} 
              sx={{ 
                borderRadius: '14px',
                boxShadow: 'none',
                border: '1px solid rgba(15, 23, 42, 0.08)',
                overflow: 'hidden'
              }}
            >
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'rgba(15, 23, 42, 0.02)' }}>
                    <TableCell sx={{ 
                      fontWeight: 600, 
                      color: 'rgba(15, 23, 42, 0.75)', 
                      py: 2,
                      fontSize: '0.8125rem',
                      borderBottom: '1px solid rgba(15, 23, 42, 0.08)'
                    }}>Date</TableCell>
                    <TableCell sx={{ 
                      fontWeight: 600, 
                      color: 'rgba(15, 23, 42, 0.75)', 
                      py: 2,
                      fontSize: '0.8125rem',
                      borderBottom: '1px solid rgba(15, 23, 42, 0.08)'
                    }}>Previous Price</TableCell>
                    <TableCell sx={{ 
                      fontWeight: 600, 
                      color: 'rgba(15, 23, 42, 0.75)', 
                      py: 2,
                      fontSize: '0.8125rem',
                      borderBottom: '1px solid rgba(15, 23, 42, 0.08)'
                    }}>New Price</TableCell>
                    <TableCell sx={{ 
                      fontWeight: 600, 
                      color: 'rgba(15, 23, 42, 0.75)', 
                      py: 2,
                      fontSize: '0.8125rem',
                      borderBottom: '1px solid rgba(15, 23, 42, 0.08)'
                    }}>Change</TableCell>
                    <TableCell sx={{ 
                      fontWeight: 600, 
                      color: 'rgba(15, 23, 42, 0.75)', 
                      py: 2,
                      fontSize: '0.8125rem',
                      borderBottom: '1px solid rgba(15, 23, 42, 0.08)'
                    }}>Reason</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {priceHistory.map((entry, index) => {
                    const previousPrice = index < priceHistory.length - 1 
                      ? priceHistory[index + 1].newPrice 
                      : null;                    const priceChange = calculatePriceChange(entry.newPrice, previousPrice);
                    
                    return (
                      <TableRow 
                        key={entry.id} 
                        hover
                        sx={{ 
                          '&:hover': { backgroundColor: 'rgba(15, 23, 42, 0.02)' },
                          transition: 'background-color 0.2s ease'
                        }}
                      >
                        <TableCell sx={{ 
                          py: 2,
                          borderBottom: '1px solid rgba(15, 23, 42, 0.06)'
                        }}>
                          <Chip
                            label={formatDate(entry.changeDate)}
                            variant="outlined"
                            size="small"
                            sx={{ 
                              backgroundColor: 'rgba(139, 92, 246, 0.06)',
                              borderColor: 'rgba(139, 92, 246, 0.3)',
                              color: '#8b5cf6',
                              fontWeight: 500,
                              fontSize: '0.8125rem',
                              borderRadius: '8px'
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ 
                          py: 2,
                          borderBottom: '1px solid rgba(15, 23, 42, 0.06)'
                        }}>
                          <Typography variant="body2" sx={{ 
                            color: 'rgba(15, 23, 42, 0.55)', 
                            fontSize: '0.875rem',
                            fontWeight: 500
                          }}>
                            {previousPrice ? `€${previousPrice.toFixed(2)}` : "—"}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ 
                          py: 2,
                          borderBottom: '1px solid rgba(15, 23, 42, 0.06)'
                        }}>
                          <Typography variant="body1" sx={{ 
                            fontWeight: 600, 
                            color: 'rgba(15, 23, 42, 0.95)',
                            fontSize: '0.875rem'
                          }}>
                            €{entry.newPrice.toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ 
                          py: 2,
                          borderBottom: '1px solid rgba(15, 23, 42, 0.06)'
                        }}>
                          {priceChange ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Chip
                                icon={priceChange.isIncrease ? <TrendingUpIcon sx={{ fontSize: '1rem' }} /> : <TrendingDownIcon sx={{ fontSize: '1rem' }} />}
                                label={`${priceChange.isIncrease ? "+" : ""}€${Math.abs(priceChange.amount).toFixed(2)} (${priceChange.isIncrease ? "+" : ""}${priceChange.percentage}%)`}
                                size="small"
                                sx={{ 
                                  fontWeight: 600,
                                  fontSize: '0.8125rem',
                                  borderRadius: '8px',
                                  backgroundColor: priceChange.isIncrease ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                                  color: priceChange.isIncrease ? '#10b981' : '#ef4444',
                                  border: 'none',
                                  '& .MuiChip-icon': {
                                    color: priceChange.isIncrease ? '#10b981' : '#ef4444'
                                  }
                                }}
                              />
                            </Box>
                          ) : (
                            <Chip
                              label="Initial Price"
                              variant="outlined"
                              size="small"
                              sx={{ 
                                backgroundColor: 'rgba(15, 23, 42, 0.04)',
                                color: 'rgba(15, 23, 42, 0.55)',
                                borderColor: 'rgba(15, 23, 42, 0.12)',
                                fontSize: '0.8125rem',
                                borderRadius: '8px'
                              }}
                            />
                          )}
                        </TableCell>
                        <TableCell sx={{ 
                          py: 2,
                          borderBottom: '1px solid rgba(15, 23, 42, 0.06)'
                        }}>
                          <Typography variant="body2" sx={{ 
                            color: 'rgba(15, 23, 42, 0.55)', 
                            maxWidth: 200,
                            fontSize: '0.875rem'
                          }}>
                            {entry.changeReason || "No reason provided"}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}          {/* Enhanced Price Summary */}
          {priceHistory.length > 1 && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" sx={{ 
                mb: 2.5, 
                color: 'rgba(15, 23, 42, 0.95)', 
                fontWeight: 700,
                fontSize: '1.125rem',
                letterSpacing: '-0.02em'
              }}>
                Price Analytics
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
                <Card sx={{ 
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  color: 'white',
                  boxShadow: '0 2px 8px rgba(239, 68, 68, 0.2)',
                  borderRadius: '14px',
                  border: 'none',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  '&:hover': { 
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                  }
                }}>
                  <CardContent sx={{ textAlign: 'center', py: 2.5 }}>
                    <TrendingUpIcon sx={{ fontSize: 28, mb: 1, opacity: 0.9 }} />
                    <Typography variant="body2" sx={{ opacity: 0.85, mb: 1, fontSize: '0.8125rem', fontWeight: 500 }}>
                      Highest Price
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
                      €{Math.max(...priceHistory.map(h => h.newPrice)).toFixed(2)}
                    </Typography>
                  </CardContent>
                </Card>
                
                <Card sx={{ 
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  color: 'white',
                  boxShadow: '0 2px 8px rgba(59, 130, 246, 0.2)',
                  borderRadius: '14px',
                  border: 'none',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  '&:hover': { 
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                  }
                }}>
                  <CardContent sx={{ textAlign: 'center', py: 2.5 }}>
                    <TrendingDownIcon sx={{ fontSize: 28, mb: 1, opacity: 0.9 }} />
                    <Typography variant="body2" sx={{ opacity: 0.85, mb: 1, fontSize: '0.8125rem', fontWeight: 500 }}>
                      Lowest Price
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
                      €{Math.min(...priceHistory.map(h => h.newPrice)).toFixed(2)}
                    </Typography>
                  </CardContent>
                </Card>
                
                <Card sx={{ 
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                  color: 'white',
                  boxShadow: '0 2px 8px rgba(139, 92, 246, 0.2)',
                  borderRadius: '14px',
                  border: 'none',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  '&:hover': { 
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
                  }
                }}>
                  <CardContent sx={{ textAlign: 'center', py: 2.5 }}>
                    <TimelineIcon sx={{ fontSize: 28, mb: 1, opacity: 0.9 }} />
                    <Typography variant="body2" sx={{ opacity: 0.85, mb: 1, fontSize: '0.8125rem', fontWeight: 500 }}>
                      Total Changes
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
                      {priceHistory.length - 1}
                    </Typography>
                  </CardContent>
                </Card>

                <Card sx={{ 
                  background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
                  color: 'white',
                  boxShadow: '0 2px 8px rgba(236, 72, 153, 0.2)',
                  borderRadius: '14px',
                  border: 'none',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  '&:hover': { 
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(236, 72, 153, 0.3)'
                  }
                }}>
                  <CardContent sx={{ textAlign: 'center', py: 2.5 }}>
                    <EuroIcon sx={{ fontSize: 28, mb: 1, opacity: 0.9 }} />
                    <Typography variant="body2" sx={{ opacity: 0.85, mb: 1, fontSize: '0.8125rem', fontWeight: 500 }}>
                      Price Range
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
                      €{(Math.max(...priceHistory.map(h => h.newPrice)) - Math.min(...priceHistory.map(h => h.newPrice))).toFixed(2)}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            </Box>
          )}
        </Box>
      </DialogContent>      <DialogActions sx={{ 
        px: 3, 
        py: 2.5, 
        borderTop: '1px solid rgba(15, 23, 42, 0.08)',
        justifyContent: 'flex-end'
      }}>
        <Button 
          onClick={handleClose} 
          variant="outlined"
          sx={{
            px: 3,
            py: 1.25,
            borderRadius: '10px',
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.875rem',
            color: 'rgba(15, 23, 42, 0.65)',
            border: '1px solid rgba(15, 23, 42, 0.12)',
            backgroundColor: 'white',
            letterSpacing: '-0.01em',
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: 'rgba(15, 23, 42, 0.02)',
              borderColor: 'rgba(15, 23, 42, 0.2)',
              color: 'rgba(15, 23, 42, 0.85)'
            }
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProductPriceHistoryDialog;
