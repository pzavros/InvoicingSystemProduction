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
  Badge,
  Fade,
  Grow
} from "@mui/material";
import {
  Add as AddIcon,
  Inventory as InventoryIcon,
  Category as CategoryIcon,
  Warning as WarningIcon,
  Lock as LockIcon
} from "@mui/icons-material";
import ProductList from "./ProductList";
import PageLoader from "../ReusableComponents/PageLoader";
import CategoryManager from "./CategoryManager";
import LowStockAlert from "./LowStockAlert";
import UsageIndicator from "../SubscriptionPage/UsageIndicator";
import { getAllProducts, getAllCategories, getLowStockProducts } from "./api";
import { useSubscription } from "../../utils/SubscriptionContext";
import PageHelper from "../ReusableComponents/PageHelper";
import { pageHelpContent } from "../../config/pageHelpContent";

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`product-tabpanel-${index}`}
      aria-labelledby={`product-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
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

  if (loading) {
    return <PageLoader color="#f59e0b" />;
  }

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
            Products
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'rgba(15, 23, 42, 0.5)',
              fontSize: '0.9375rem',
              fontWeight: 400,
              letterSpacing: '-0.01em'
            }}
          >
            Manage your product catalog and categories
          </Typography>
        </Box>
        
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
                background: canAddProduct 
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
                '&:hover': canAddProduct ? { 
                  background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                  boxShadow: 'none',
                } : {},
                '&.Mui-disabled': {
                  color: 'rgba(255, 255, 255, 0.6)',
                  opacity: 1
                }
              }}
            >
              {canAddProduct ? 'New Product' : 'Limit Reached'}
            </Button>
          </span>
        </Tooltip>
      </Box>

      {/* Usage Indicators - Below Header */}
      {!isPremium && (
        <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <UsageIndicator resource="product" label="Products" />
          <UsageIndicator resource="category" label="Categories" />
        </Box>
      )}

      {/* Low Stock Alert Banner */}
      {lowStockProducts.length > 0 && (
        <Alert 
          severity="warning" 
          sx={{ 
            mb: 3,
            borderRadius: '8px',
            '& .MuiAlert-icon': {
              fontSize: '1.25rem'
            }
          }}
        >
          {lowStockProducts.length} product{lowStockProducts.length > 1 ? 's' : ''} low in stock. Click the "Low Stock" tab to view.
        </Alert>
      )}

      {/* Tabs Section - Apple-Style Segmented Control */}
      <Box 
        sx={{ 
          mb: 3,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <Box
          sx={{
            display: 'inline-flex',
            backgroundColor: 'rgba(15, 23, 42, 0.04)',
            borderRadius: '12px',
            padding: '4px',
            gap: '4px',
            border: '1px solid rgba(15, 23, 42, 0.06)',
          }}
        >
          <Box
            onClick={() => handleTabChange(null, 0)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 3,
              py: 1.25,
              borderRadius: '9px',
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              background: activeTab === 0 
                ? 'white'
                : 'transparent',
              color: activeTab === 0
                ? '#8b5cf6'
                : 'rgba(15, 23, 42, 0.6)',
              boxShadow: activeTab === 0
                ? '0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)'
                : 'none',
              fontWeight: activeTab === 0 ? 600 : 500,
              fontSize: '0.875rem',
              letterSpacing: '-0.01em',
              userSelect: 'none',
              '&:hover': {
                background: activeTab === 0
                  ? 'white'
                  : 'rgba(139, 92, 246, 0.08)',
                color: activeTab === 0
                  ? '#8b5cf6'
                  : 'rgba(15, 23, 42, 0.8)',
              }
            }}
          >
            <InventoryIcon sx={{ fontSize: '1.125rem' }} />
            <Typography 
              sx={{ 
                fontSize: '0.875rem', 
                fontWeight: 'inherit',
                letterSpacing: 'inherit',
                lineHeight: 1
              }}
            >
              Products
            </Typography>
          </Box>

          <Box
            onClick={() => handleTabChange(null, 1)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 3,
              py: 1.25,
              borderRadius: '9px',
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              background: activeTab === 1 
                ? 'white'
                : 'transparent',
              color: activeTab === 1
                ? '#8b5cf6'
                : 'rgba(15, 23, 42, 0.6)',
              boxShadow: activeTab === 1
                ? '0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)'
                : 'none',
              fontWeight: activeTab === 1 ? 600 : 500,
              fontSize: '0.875rem',
              letterSpacing: '-0.01em',
              userSelect: 'none',
              '&:hover': {
                background: activeTab === 1
                  ? 'white'
                  : 'rgba(139, 92, 246, 0.08)',
                color: activeTab === 1
                  ? '#8b5cf6'
                  : 'rgba(15, 23, 42, 0.8)',
              }
            }}
          >
            <CategoryIcon sx={{ fontSize: '1.125rem' }} />
            <Typography 
              sx={{ 
                fontSize: '0.875rem', 
                fontWeight: 'inherit',
                letterSpacing: 'inherit',
                lineHeight: 1
              }}
            >
              Categories
            </Typography>
          </Box>

          <Box
            onClick={() => handleTabChange(null, 2)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 3,
              py: 1.25,
              borderRadius: '9px',
              cursor: 'pointer',
              position: 'relative',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              background: activeTab === 2 
                ? 'white'
                : 'transparent',
              color: activeTab === 2
                ? '#f59e0b'
                : 'rgba(15, 23, 42, 0.6)',
              boxShadow: activeTab === 2
                ? '0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)'
                : 'none',
              fontWeight: activeTab === 2 ? 600 : 500,
              fontSize: '0.875rem',
              letterSpacing: '-0.01em',
              userSelect: 'none',
              '&:hover': {
                background: activeTab === 2
                  ? 'white'
                  : 'rgba(245, 158, 11, 0.08)',
                color: activeTab === 2
                  ? '#f59e0b'
                  : 'rgba(15, 23, 42, 0.8)',
              }
            }}
          >
            <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <WarningIcon sx={{ fontSize: '1.125rem' }} />
              {lowStockProducts.length > 0 && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: -6,
                    right: -8,
                    minWidth: 18,
                    height: 18,
                    borderRadius: '9px',
                    backgroundColor: '#dc2626',
                    color: 'white',
                    fontSize: '0.625rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 5px',
                    border: '2px solid rgba(15, 23, 42, 0.04)',
                    boxShadow: '0 2px 4px rgba(220, 38, 38, 0.3)',
                  }}
                >
                  {lowStockProducts.length}
                </Box>
              )}
            </Box>
            <Typography 
              sx={{ 
                fontSize: '0.875rem', 
                fontWeight: 'inherit',
                letterSpacing: 'inherit',
                lineHeight: 1
              }}
            >
              Low Stock
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Content Container */}
      <Paper 
        elevation={0}
        sx={{ 
          borderRadius: '12px',
          overflow: 'hidden',
          backgroundColor: 'white',
          border: '1px solid rgba(15, 23, 42, 0.08)',
        }}
      >
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
            onInventoryUpdated={loadData}
            showNotification={showNotification}
          />
        </TabPanel>
      </Paper>

      {/* Refined Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{ 
            width: "100%",
            borderRadius: '10px',
            fontWeight: 500,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
            backdropFilter: 'blur(20px)',
            ...(notification.severity === 'success' && {
              backgroundColor: 'rgba(139, 92, 246, 0.95)',
              color: 'white',
              border: 'none',
              '& .MuiAlert-icon': {
                color: 'white'
              }
            }),
            ...(notification.severity === 'error' && {
              backgroundColor: 'rgba(220, 38, 38, 0.95)',
              color: 'white',
              border: 'none',
              '& .MuiAlert-icon': {
                color: 'white'
              }
            }),
            ...(notification.severity === 'warning' && {
              backgroundColor: 'rgba(217, 119, 6, 0.95)',
              color: 'white',
              border: 'none',
              '& .MuiAlert-icon': {
                color: 'white'
              }
            })
          }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
      
      <PageHelper {...pageHelpContent.products} />
    </Box>
  );
};

export default ProductCatalogPage;
