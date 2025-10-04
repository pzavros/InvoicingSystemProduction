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
          borderRadius: 3,
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          minHeight: '500px'
        }
      }}
    >
      <DialogTitle 
        sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 2,
          pt: 2
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <TimelineIcon sx={{ fontSize: 28 }} />
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
              Price History
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {product?.name}
            </Typography>
          </Box>
        </Box>
        <IconButton 
          onClick={handleClose} 
          sx={{ 
            color: 'white',
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
        {/* Current Price Banner */}
        <Card 
          sx={{ 
            m: 3, 
            mb: 2,
            background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
            color: 'white',
            boxShadow: '0 8px 32px rgba(17, 153, 142, 0.3)'
          }}
        >
          <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2 }}>
            <EuroIcon sx={{ fontSize: 32 }} />
            <Box>
              <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>
                Current Price
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
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
                borderRadius: 2,
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                overflow: 'hidden'
              }}
            >
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                    <TableCell sx={{ fontWeight: 700, color: '#374151', py: 2 }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#374151', py: 2 }}>Previous Price</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#374151', py: 2 }}>New Price</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#374151', py: 2 }}>Change</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#374151', py: 2 }}>Reason</TableCell>
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
                          '&:hover': { backgroundColor: '#f8fafc' },
                          transition: 'background-color 0.2s ease'
                        }}
                      >
                        <TableCell sx={{ py: 2 }}>
                          <Chip
                            label={formatDate(entry.changeDate)}
                            variant="outlined"
                            size="small"
                            sx={{ 
                              backgroundColor: '#e0f2fe',
                              borderColor: '#0277bd',
                              color: '#0277bd',
                              fontWeight: 500
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ py: 2 }}>
                          <Typography variant="body2" sx={{ color: '#6b7280', fontSize: '0.95rem' }}>
                            {previousPrice ? `€${previousPrice.toFixed(2)}` : "—"}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 2 }}>
                          <Typography variant="body1" sx={{ fontWeight: 600, color: '#1f2937' }}>
                            €{entry.newPrice.toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 2 }}>
                          {priceChange ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Chip
                                icon={priceChange.isIncrease ? <TrendingUpIcon /> : <TrendingDownIcon />}
                                label={`${priceChange.isIncrease ? "+" : ""}€${Math.abs(priceChange.amount).toFixed(2)} (${priceChange.isIncrease ? "+" : ""}${priceChange.percentage}%)`}
                                color={priceChange.isIncrease ? "success" : "error"}
                                variant="filled"
                                size="small"
                                sx={{ fontWeight: 600 }}
                              />
                            </Box>
                          ) : (
                            <Chip
                              label="Initial Price"
                              variant="outlined"
                              size="small"
                              sx={{ 
                                backgroundColor: '#f3f4f6',
                                color: '#6b7280',
                                borderColor: '#d1d5db'
                              }}
                            />
                          )}
                        </TableCell>
                        <TableCell sx={{ py: 2 }}>
                          <Typography variant="body2" sx={{ color: '#6b7280', maxWidth: 200 }}>
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
              <Typography variant="h6" sx={{ mb: 3, color: '#1f2937', fontWeight: 600 }}>
                Price Analytics
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 3 }}>
                <Card sx={{ 
                  background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
                  color: 'white',
                  boxShadow: '0 8px 32px rgba(238, 90, 36, 0.3)',
                  transition: 'transform 0.2s ease',
                  '&:hover': { transform: 'translateY(-4px)' }
                }}>
                  <CardContent sx={{ textAlign: 'center', py: 3 }}>
                    <TrendingUpIcon sx={{ fontSize: 32, mb: 1, opacity: 0.9 }} />
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                      Highest Price
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      €{Math.max(...priceHistory.map(h => h.newPrice)).toFixed(2)}
                    </Typography>
                  </CardContent>
                </Card>
                
                <Card sx={{ 
                  background: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)',
                  color: 'white',
                  boxShadow: '0 8px 32px rgba(9, 132, 227, 0.3)',
                  transition: 'transform 0.2s ease',
                  '&:hover': { transform: 'translateY(-4px)' }
                }}>
                  <CardContent sx={{ textAlign: 'center', py: 3 }}>
                    <TrendingDownIcon sx={{ fontSize: 32, mb: 1, opacity: 0.9 }} />
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                      Lowest Price
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      €{Math.min(...priceHistory.map(h => h.newPrice)).toFixed(2)}
                    </Typography>
                  </CardContent>
                </Card>
                
                <Card sx={{ 
                  background: 'linear-gradient(135deg, #a29bfe 0%, #6c5ce7 100%)',
                  color: 'white',
                  boxShadow: '0 8px 32px rgba(108, 92, 231, 0.3)',
                  transition: 'transform 0.2s ease',
                  '&:hover': { transform: 'translateY(-4px)' }
                }}>
                  <CardContent sx={{ textAlign: 'center', py: 3 }}>
                    <TimelineIcon sx={{ fontSize: 32, mb: 1, opacity: 0.9 }} />
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                      Total Changes
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      {priceHistory.length - 1}
                    </Typography>
                  </CardContent>
                </Card>

                <Card sx={{ 
                  background: 'linear-gradient(135deg, #fd79a8 0%, #e84393 100%)',
                  color: 'white',
                  boxShadow: '0 8px 32px rgba(232, 67, 147, 0.3)',
                  transition: 'transform 0.2s ease',
                  '&:hover': { transform: 'translateY(-4px)' }
                }}>
                  <CardContent sx={{ textAlign: 'center', py: 3 }}>
                    <EuroIcon sx={{ fontSize: 32, mb: 1, opacity: 0.9 }} />
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                      Price Range
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      €{(Math.max(...priceHistory.map(h => h.newPrice)) - Math.min(...priceHistory.map(h => h.newPrice))).toFixed(2)}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            </Box>
          )}
        </Box>
      </DialogContent>      <DialogActions sx={{ px: 3, py: 2, backgroundColor: '#f8fafc' }}>
        <Button 
          onClick={handleClose} 
          variant="outlined"
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            px: 4,
            py: 1.5,
            borderColor: '#667eea',
            color: '#667eea',
            '&:hover': {
              backgroundColor: '#667eea',
              color: 'white',
              borderColor: '#667eea'
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
