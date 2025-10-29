// src/components/ProductCatalogPage/ProductCatalogPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  Chip,
  IconButton,
  Tooltip,
  Paper,
  Badge
} from "@mui/material";
import {
  Add as AddIcon,
  Inventory as InventoryIcon,
  Category as CategoryIcon,
  Warning as WarningIcon,
  Lock as LockIcon
} from "@mui/icons-material";
import ProductList from "./ProductList";

import CategoryManager from "./CategoryManager";
import LowStockAlert from "./LowStockAlert.jsx";
import UsageIndicator from "../SubscriptionPage/UsageIndicator";
import { getAllProducts, getAllCategories, getLowStockProducts } from "./api";
import { useSubscription } from "../../utils/SubscriptionContext";

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`product-tabpanel-${index}`}
      aria-labelledby={`product-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const ProductCatalogPage = () => {
  const navigate = useNavigate();
  const { canCreate, isPremium } = useSubscription();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const canAddProduct = canCreate?.product !== false;

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsData, categoriesData, lowStockData] = await Promise.all([
        getAllProducts(),
        getAllCategories(),
        getLowStockProducts()
      ]);
      
      setProducts(productsData);
      setCategories(categoriesData);
      setLowStockProducts(lowStockData);
    } catch (error) {
      showNotification("Error loading data: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleAddProduct = () => {
    if (canAddProduct) {
      navigate('/products/add');
    } else {
      showNotification("You've reached the maximum number of products on the free plan. Upgrade to premium for unlimited products.", "warning");
    }
  };

  const handleEditProduct = (product) => {
    navigate(`/products/edit/${product.id}`);
  };

  const handleProductDeleted = async () => {
    try {
      await loadData(); // Refresh data
      showNotification("Product deleted successfully!", "success");
    } catch (error) {
      showNotification("Error refreshing data: " + error.message, "error");
    }
  };

  const showNotification = (message, severity = "success") => {
    setNotification({
      open: true,
      message,
      severity,
    });
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };
  return (
    <Box sx={{ width: '100%' }}>
      {/* Enhanced Header Section */}
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between', 
          alignItems: { xs: 'stretch', sm: 'center' },
          gap: { xs: 2, sm: 0 },
          mb: { xs: 3, md: 4 },
          p: { xs: 2, sm: 3 },
          borderRadius: 3,
          background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
          border: '1px solid rgba(16, 185, 129, 0.1)',
          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.08)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #10b981 0%, #3b82f6 50%, #8b5cf6 100%)',
            borderRadius: '3px 3px 0 0'
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2 } }}>
          <Box
            sx={{
              width: { xs: 40, sm: 48 },
              height: { xs: 40, sm: 48 },
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 16px rgba(16, 185, 129, 0.3)'
            }}
          >
            <InventoryIcon sx={{ color: 'white', fontSize: { xs: 20, sm: 24 } }} />
          </Box>
          <Box>
            <Typography 
              variant="h5" 
              component="h1" 
              sx={{ 
                fontWeight: 'bold',
                fontSize: { xs: '1.25rem', sm: '1.5rem' },
                background: 'linear-gradient(135deg, #047857 0%, #10b981 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 0.5
              }}
            >
              Product & Service Catalog
            </Typography>
            <Typography 
              variant="subtitle2" 
              sx={{ 
                color: 'text.secondary',
                fontWeight: 'medium',
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                display: { xs: 'none', sm: 'block' }
              }}
            >
              Manage your products, services, and inventory
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', gap: { xs: 1, sm: 2 }, alignItems: 'center', flexWrap: 'wrap', justifyContent: { xs: 'space-between', sm: 'flex-end' } }}>
          {/* Low Stock Alert */}
          {lowStockProducts.length > 0 && (
            <Tooltip title={`${lowStockProducts.length} products low in stock`}>
              <IconButton 
                onClick={() => setActiveTab(2)}
                sx={{ 
                  position: 'relative',
                  backgroundColor: 'rgba(245, 158, 11, 0.1)',
                  borderRadius: 2,
                  border: '1px solid rgba(245, 158, 11, 0.2)',
                  color: '#d97706',
                  width: { xs: 40, sm: 44 },
                  height: { xs: 40, sm: 44 },
                  '&:hover': {
                    backgroundColor: 'rgba(245, 158, 11, 0.2)',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
                  },
                  transition: 'all 0.3s ease-in-out'
                }}
              >
                <WarningIcon sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }} />
                <Chip 
                  label={lowStockProducts.length} 
                  size="small" 
                  sx={{ 
                    position: 'absolute', 
                    top: -8, 
                    right: -8, 
                    minWidth: 20, 
                    height: 20,
                    backgroundColor: '#dc2626',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '0.7rem'
                  }}
                />
              </IconButton>
            </Tooltip>
          )}
          
          <Tooltip 
            title={!canAddProduct ? "You've reached the maximum number of products on the free plan. Upgrade to premium for unlimited products." : ""}
            arrow
          >
            <span>
              <Button
                variant="contained"
                startIcon={canAddProduct ? <AddIcon /> : <LockIcon />}
                onClick={handleAddProduct}
                disabled={!canAddProduct}
                fullWidth={{ xs: true, sm: false }}
                sx={{ 
                  backgroundColor: canAddProduct ? '#10b981' : '#9ca3af',
                  backgroundImage: canAddProduct 
                    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                    : 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)',
                  boxShadow: canAddProduct ? '0 8px 16px rgba(16, 185, 129, 0.3)' : 'none',
                  border: 'none',
                  borderRadius: 2,
                  px: { xs: 2, sm: 3 },
                  py: 1.5,
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  fontWeight: 600,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': canAddProduct ? { 
                    backgroundColor: '#059669',
                    backgroundImage: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 24px rgba(16, 185, 129, 0.4)'
                  } : {},
                  '&.Mui-disabled': {
                    color: 'white',
                    opacity: 0.7
                  }
                }}
              >
                {canAddProduct ? 'Add Product' : 'Limit Reached'}
              </Button>
            </span>
          </Tooltip>
        </Box>
      </Box>

      {/* Usage Indicators for Free Tier - Below Header */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <UsageIndicator resource="product" label="Products" />
        <UsageIndicator resource="category" label="Categories" />
      </Box>

      {/* Enhanced Tabs Section */}
      <Paper 
        elevation={2}
        sx={{ 
          borderRadius: 3,
          overflow: 'hidden',
          mb: 3,
          background: '#ffffff',
          border: '1px solid rgba(16, 185, 129, 0.08)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
        }}
      >
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{
            borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
            minHeight: { xs: 56, sm: 64 },
            px: { xs: 1, sm: 2 },
            '& .MuiTabs-flexContainer': {
              gap: { xs: 0.5, sm: 1 }
            },
            '& .MuiTabs-scrollButtons': {
              width: { xs: 32, sm: 40 },
              '&.Mui-disabled': {
                opacity: 0.3
              }
            },
            '& .MuiTab-root': {
              minHeight: { xs: 56, sm: 64 },
              fontSize: { xs: '0.8125rem', sm: '0.9375rem' },
              fontWeight: 600,
              textTransform: 'none',
              color: 'text.secondary',
              px: { xs: 2, sm: 3 },
              py: { xs: 1.5, sm: 2 },
              minWidth: { xs: 'auto', sm: 140 },
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                color: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.04)'
              },
              '&.Mui-selected': {
                color: '#10b981',
                fontWeight: 700,
                backgroundColor: 'rgba(16, 185, 129, 0.06)'
              }
            },
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: '3px 3px 0 0',
              background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
              boxShadow: '0 -2px 8px rgba(16, 185, 129, 0.3)'
            }
          }}
        >
          <Tab 
            icon={<InventoryIcon sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }} />} 
            iconPosition="start"
            label="Products & Services" 
          />
          <Tab 
            icon={<CategoryIcon sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }} />} 
            iconPosition="start"
            label="Categories" 
          />
          <Tab 
            icon={
              <Badge 
                badgeContent={lowStockProducts.length} 
                color="error"
                sx={{
                  '& .MuiBadge-badge': {
                    fontSize: { xs: '0.625rem', sm: '0.75rem' },
                    minWidth: { xs: 16, sm: 20 },
                    height: { xs: 16, sm: 20 }
                  }
                }}
              >
                <WarningIcon sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }} />
              </Badge>
            }
            iconPosition="start"
            label="Low Stock" 
          />
        </Tabs>
      </Paper>

      {/* Tab Panels */}
      <TabPanel value={activeTab} index={0}>
        <ProductList
          products={products}
          categories={categories}
          loading={loading}
          onEditProduct={handleEditProduct}
          onDeleteProduct={handleProductDeleted}
          onReloadProducts={loadData}
        />
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <CategoryManager
          categories={categories}
          onCategoryUpdated={loadData}
          showNotification={showNotification}
        />
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        <LowStockAlert
          lowStockProducts={lowStockProducts}
          categories={categories}
          onEditProduct={handleEditProduct}
          onReloadProducts={loadData}
        />
      </TabPanel>

      {/* Enhanced Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        sx={{
          '& .MuiSnackbarContent-root': {
            borderRadius: 2,
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)'
          }
        }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{ 
            width: "100%",
            borderRadius: 2,
            fontWeight: 500,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            ...(notification.severity === 'success' && {
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              color: '#059669',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              '& .MuiAlert-icon': {
                color: '#059669'
              }
            }),
            ...(notification.severity === 'error' && {
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: '#dc2626',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              '& .MuiAlert-icon': {
                color: '#dc2626'
              }
            }),
            ...(notification.severity === 'warning' && {
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              color: '#d97706',
              border: '1px solid rgba(245, 158, 11, 0.2)',
              '& .MuiAlert-icon': {
                color: '#d97706'
              }
            })
          }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProductCatalogPage;
