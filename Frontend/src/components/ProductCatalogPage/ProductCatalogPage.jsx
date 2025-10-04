// src/components/ProductCatalogPage/ProductCatalogPage.jsx
import React, { useState, useEffect } from "react";
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
  Tooltip
} from "@mui/material";
import {
  Add as AddIcon,
  Inventory as InventoryIcon,
  Category as CategoryIcon,
  Warning as WarningIcon
} from "@mui/icons-material";
import ProductList from "./ProductList";
import ProductForm from "./ProductForm";
import CategoryManager from "./CategoryManager";
import LowStockAlert from "./LowStockAlert";
import { getAllProducts, getAllCategories, getLowStockProducts } from "./api";

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
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

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
    setEditingProduct(null);
    setShowProductForm(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const handleCloseProductForm = () => {
    setShowProductForm(false);
    setEditingProduct(null);
  };

  const handleProductSaved = () => {
    setShowProductForm(false);
    setEditingProduct(null);
    loadData(); // Refresh data
    showNotification("Product saved successfully!", "success");
  };

  const handleProductDeleted = () => {
    loadData(); // Refresh data
    showNotification("Product deleted successfully!", "success");
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
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 4,
          p: 3,
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 16px rgba(16, 185, 129, 0.3)'
            }}
          >
            <InventoryIcon sx={{ color: 'white', fontSize: 24 }} />
          </Box>
          <Box>
            <Typography 
              variant="h5" 
              component="h1" 
              sx={{ 
                fontWeight: 'bold',
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
                fontWeight: 'medium'
              }}
            >
              Manage your products, services, and inventory
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
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
                  '&:hover': {
                    backgroundColor: 'rgba(245, 158, 11, 0.2)',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
                  },
                  transition: 'all 0.3s ease-in-out'
                }}
              >
                <WarningIcon />
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
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddProduct}
            sx={{ 
              backgroundColor: '#10b981', 
              backgroundImage: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              boxShadow: '0 8px 16px rgba(16, 185, 129, 0.3)',
              border: 'none',
              borderRadius: 2,
              px: 3,
              py: 1.5,
              fontWeight: 600,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': { 
                backgroundColor: '#059669',
                backgroundImage: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 12px 24px rgba(16, 185, 129, 0.4)'
              } 
            }}
          >
            Add Product
          </Button>
        </Box>
      </Box>      {/* Enhanced Tabs Section */}
      <Card sx={{ 
        backgroundColor: '#ffffff',
        borderRadius: 3,
        border: '1px solid rgba(148, 163, 184, 0.2)',
        boxShadow: '0 4px 12px rgba(148, 163, 184, 0.1)',
        overflow: 'hidden',
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          boxShadow: '0 8px 20px rgba(148, 163, 184, 0.15)',
          transform: 'translateY(-1px)'
        }
      }}>
        <Box sx={{ 
          borderBottom: 1, 
          borderColor: 'rgba(148, 163, 184, 0.2)',
          background: 'linear-gradient(145deg, #f8fafc 0%, #f1f5f9 100%)'
        }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            sx={{
              '& .MuiTab-root': {
                color: '#64748b',
                fontWeight: 600,
                fontSize: '0.95rem',
                textTransform: 'none',
                minHeight: 64,
                px: 3,
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  color: '#10b981',
                  backgroundColor: 'rgba(16, 185, 129, 0.05)'
                }
              },
              '& .Mui-selected': {
                color: '#10b981 !important',
                backgroundColor: 'rgba(16, 185, 129, 0.1) !important',
                fontWeight: 700
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#10b981',
                height: 3,
                borderRadius: '3px 3px 0 0'
              }
            }}
          >
            <Tab 
              icon={<InventoryIcon />} 
              iconPosition="start"
              label="Products & Services" 
              sx={{
                '& .MuiSvgIcon-root': {
                  fontSize: '1.2rem'
                }
              }}
            />
            <Tab 
              icon={<CategoryIcon />} 
              iconPosition="start"
              label="Categories" 
              sx={{
                '& .MuiSvgIcon-root': {
                  fontSize: '1.2rem'
                }
              }}
            />
            <Tab 
              icon={<WarningIcon />} 
              iconPosition="start"
              label={`Low Stock ${lowStockProducts.length > 0 ? `(${lowStockProducts.length})` : ''}`}
              sx={{ 
                color: lowStockProducts.length > 0 ? '#d97706 !important' : '#64748b',
                '& .MuiSvgIcon-root': {
                  fontSize: '1.2rem',
                  color: lowStockProducts.length > 0 ? '#d97706' : 'inherit'
                },
                '&:hover': {
                  color: lowStockProducts.length > 0 ? '#b45309 !important' : '#10b981 !important'
                }
              }}
            />
          </Tabs>
        </Box>

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
            onInventoryUpdated={loadData}
            showNotification={showNotification}
          />
        </TabPanel>
      </Card>

      {/* Product Form Dialog */}
      {showProductForm && (
        <ProductForm
          open={showProductForm}
          product={editingProduct}
          categories={categories}
          onClose={handleCloseProductForm}
          onSave={handleProductSaved}
          showNotification={showNotification}
        />
      )}      {/* Enhanced Notification Snackbar */}
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
