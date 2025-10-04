// src/components/ProductCatalogPage/CategoryManager.jsx
import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Tooltip
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from "@mui/icons-material";
import { createCategory, updateCategory, deleteCategory } from "./api";

const CategoryManager = ({ categories, onCategoryUpdated, showNotification }) => {
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryFormData, setCategoryFormData] = useState({
    name: "",
    description: ""
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAddCategory = () => {
    setEditingCategory(null);
    setCategoryFormData({ name: "", description: "" });
    setCategoryDialogOpen(true);
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setCategoryFormData({
      name: category.name,
      description: category.description || ""
    });
    setCategoryDialogOpen(true);
  };

  const handleDeleteCategory = (category) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };

  const handleCategoryFormChange = (event) => {
    const { name, value } = event.target;
    setCategoryFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveCategory = async () => {
    if (!categoryFormData.name.trim()) {
      showNotification("Category name is required", "error");
      return;
    }

    setLoading(true);
    try {      const categoryData = {
        name: categoryFormData.name.trim(),
        description: categoryFormData.description.trim(),
        isActive: true
      };if (editingCategory) {
        await updateCategory(editingCategory.id, categoryData);
        showNotification("Category updated successfully!", "success");
      } else {
        await createCategory(categoryData);
        showNotification("Category created successfully!", "success");
      }

      setCategoryDialogOpen(false);
      onCategoryUpdated();
    } catch (error) {
      showNotification(
        `Error ${editingCategory ? 'updating' : 'creating'} category: ${error.message}`,
        "error"
      );
    } finally {
      setLoading(false);
    }
  };
  const handleConfirmDelete = async () => {
    setLoading(true);
    try {
      await deleteCategory(categoryToDelete.id);
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
      onCategoryUpdated();
      showNotification("Category deleted successfully!", "success");
    } catch (error) {
      showNotification(`Error deleting category: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };
  return (
    <Box>
      {/* Enhanced Header */}
      <Box 
        sx={{ 
          p: 3, 
          mb: 3, 
          borderRadius: 3,
          background: 'linear-gradient(145deg, #ffffff 0%, #f1f5f9 100%)',
          border: '1px solid rgba(148, 163, 184, 0.2)',
          boxShadow: '0 4px 12px rgba(148, 163, 184, 0.1)',
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center'
        }}
      >
        <Box>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 'bold',
              color: '#1f2937',
              mb: 0.5
            }}
          >
            Product Categories
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#6b7280'
            }}
          >
            Organize your products into categories for better management
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddCategory}
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
          Add Category
        </Button>
      </Box>      {/* Enhanced Categories Table */}
      <TableContainer 
        component={Paper} 
        sx={{ 
          borderRadius: 3,
          border: '1px solid rgba(148, 163, 184, 0.2)',
          boxShadow: '0 4px 12px rgba(148, 163, 184, 0.1)',
          overflow: 'hidden',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            boxShadow: '0 8px 20px rgba(148, 163, 184, 0.15)',
            transform: 'translateY(-1px)'
          }
        }}
      >
        <Table>
          <TableHead 
            sx={{ 
              background: 'linear-gradient(145deg, #f8fafc 0%, #f1f5f9 100%)',
              borderBottom: '2px solid rgba(148, 163, 184, 0.2)'
            }}
          >
            <TableRow>
              <TableCell 
                sx={{ 
                  fontWeight: 'bold', 
                  color: '#374151',
                  fontSize: '0.95rem',
                  py: 2
                }}
              >
                Name
              </TableCell>
              <TableCell 
                sx={{ 
                  fontWeight: 'bold', 
                  color: '#374151',
                  fontSize: '0.95rem'
                }}
              >
                Description
              </TableCell>
              <TableCell 
                sx={{ 
                  fontWeight: 'bold', 
                  color: '#374151',
                  fontSize: '0.95rem'
                }}
              >
                Products Count
              </TableCell>
              <TableCell 
                align="center" 
                sx={{ 
                  fontWeight: 'bold', 
                  color: '#374151',
                  fontSize: '0.95rem'
                }}
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.length === 0 ? (
              <TableRow>
                <TableCell 
                  colSpan={4} 
                  align="center" 
                  sx={{ 
                    py: 8,
                    background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)'
                  }}
                >
                  <Box sx={{ textAlign: 'center' }}>
                    <AddIcon sx={{ fontSize: 48, color: '#9ca3af', mb: 2 }} />
                    <Typography variant="h6" sx={{ color: '#6b7280', fontWeight: 500, mb: 1 }}>
                      No categories found
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                      Create your first category to organize products
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (              categories.map((category) => (
                <TableRow 
                  key={category.id} 
                  sx={{
                    '&:hover': {
                      backgroundColor: 'rgba(16, 185, 129, 0.02)',
                      cursor: 'pointer',
                      '& .MuiTableCell-root': {
                        backgroundColor: 'transparent'
                      }
                    },
                    '&:nth-of-type(even)': {
                      backgroundColor: 'rgba(248, 250, 252, 0.5)'
                    },
                    transition: 'all 0.2s ease-in-out'
                  }}
                >
                  <TableCell sx={{ py: 2 }}>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        fontWeight: 600,
                        color: '#1f2937'
                      }}
                    >
                      {category.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: category.description ? '#6b7280' : '#9ca3af',
                        fontStyle: category.description ? 'normal' : 'italic'
                      }}
                    >
                      {category.description || "No description"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={`${category.productCount || 0} products`}
                      size="small"
                      sx={{
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        color: '#2563eb',
                        border: '1px solid rgba(59, 130, 246, 0.2)',
                        fontWeight: 600,
                        borderRadius: 2,
                        minWidth: '100px'
                      }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                      <Tooltip title="Edit Category">
                        <IconButton 
                          size="small" 
                          onClick={() => handleEditCategory(category)}
                          sx={{
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            color: '#2563eb',
                            border: '1px solid rgba(59, 130, 246, 0.2)',
                            borderRadius: 2,
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                              backgroundColor: 'rgba(59, 130, 246, 0.2)',
                              transform: 'translateY(-1px)',
                              boxShadow: '0 4px 8px rgba(59, 130, 246, 0.3)'
                            }
                          }}
                        >
                          <EditIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Delete Category">
                        <IconButton 
                          size="small" 
                          onClick={() => handleDeleteCategory(category)}
                          sx={{
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            color: '#dc2626',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            borderRadius: 2,
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                              backgroundColor: 'rgba(239, 68, 68, 0.2)',
                              transform: 'translateY(-1px)',
                              boxShadow: '0 4px 8px rgba(239, 68, 68, 0.3)'
                            }
                          }}
                        >
                          <DeleteIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>      {/* Enhanced Category Form Dialog */}
      <Dialog 
        open={categoryDialogOpen} 
        onClose={() => setCategoryDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            border: '1px solid rgba(148, 163, 184, 0.2)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
            background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)'
          }
        }}
      >
        <DialogTitle 
          sx={{
            background: 'linear-gradient(145deg, #f8fafc 0%, #f1f5f9 100%)',
            borderBottom: '1px solid rgba(148, 163, 184, 0.2)',
            pb: 2,
            pt: 3
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box 
              sx={{ 
                width: 48,
                height: 48,
                borderRadius: 3,
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 16px rgba(16, 185, 129, 0.3)'
              }}
            >
              {editingCategory ? <EditIcon sx={{ color: 'white', fontSize: 24 }} /> : <AddIcon sx={{ color: 'white', fontSize: 24 }} />}
            </Box>
            <Box>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 'bold',
                  color: '#1f2937',
                  mb: 0.5
                }}
              >
                {editingCategory ? "Edit Category" : "Add New Category"}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#6b7280'
                }}
              >
                {editingCategory ? "Update category information" : "Create a new product category"}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3, pb: 2 }}>
          <Box sx={{ pt: 1 }}>
            <TextField
              name="name"
              label="Category Name"
              value={categoryFormData.name}
              onChange={handleCategoryFormChange}
              fullWidth
              required
              sx={{ 
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#10b981'
                    }
                  },
                  '&.Mui-focused': {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#10b981',
                      borderWidth: '2px'
                    }
                  }
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#10b981'
                }
              }}
            />
            <TextField
              name="description"
              label="Description"
              value={categoryFormData.description}
              onChange={handleCategoryFormChange}
              fullWidth
              multiline
              rows={3}
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#10b981'
                    }
                  },
                  '&.Mui-focused': {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#10b981',
                      borderWidth: '2px'
                    }
                  }
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#10b981'
                }
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 2 }}>
          <Button 
            onClick={() => setCategoryDialogOpen(false)} 
            disabled={loading}
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1.5,
              fontWeight: 600,
              color: '#6b7280',
              border: '1px solid rgba(148, 163, 184, 0.3)',
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: 'rgba(148, 163, 184, 0.1)',
                borderColor: '#94a3b8'
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSaveCategory} 
            variant="contained" 
            disabled={loading}
            sx={{
              backgroundColor: '#10b981',
              backgroundImage: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              boxShadow: '0 8px 16px rgba(16, 185, 129, 0.3)',
              borderRadius: 2,
              px: 3,
              py: 1.5,
              fontWeight: 600,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                backgroundColor: '#059669',
                backgroundImage: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                transform: 'translateY(-1px)',
                boxShadow: '0 12px 24px rgba(16, 185, 129, 0.4)'
              },
              '&:disabled': {
                backgroundColor: '#9ca3af',
                color: 'white',
                boxShadow: 'none'
              }
            }}
          >
            {loading ? "Saving..." : (editingCategory ? "Update" : "Create")}
          </Button>
        </DialogActions>
      </Dialog>      {/* Enhanced Delete Confirmation Dialog */}
      <Dialog 
        open={deleteDialogOpen} 
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            border: '1px solid rgba(239, 68, 68, 0.2)',
            boxShadow: '0 20px 40px rgba(239, 68, 68, 0.1)',
            background: 'linear-gradient(145deg, #ffffff 0%, #fef2f2 100%)'
          }
        }}
      >
        <DialogTitle 
          sx={{
            background: 'linear-gradient(145deg, #fef2f2 0%, #fee2e2 100%)',
            borderBottom: '1px solid rgba(239, 68, 68, 0.2)',
            pb: 2,
            pt: 3
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box 
              sx={{ 
                width: 48,
                height: 48,
                borderRadius: 3,
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 16px rgba(239, 68, 68, 0.3)'
              }}
            >
              <DeleteIcon sx={{ color: 'white', fontSize: 24 }} />
            </Box>
            <Box>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 'bold',
                  color: '#1f2937',
                  mb: 0.5
                }}
              >
                Delete Category
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#6b7280'
                }}
              >
                This action cannot be undone
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3, pb: 2 }}>
          <Box 
            sx={{
              p: 3,
              borderRadius: 2,
              backgroundColor: 'rgba(249, 250, 251, 0.8)',
              border: '1px solid rgba(209, 213, 219, 0.3)'
            }}
          >
            <Typography 
              variant="body1" 
              sx={{ 
                color: '#374151',
                mb: 2,
                lineHeight: 1.6
              }}
            >
              Are you sure you want to delete the category <strong>"{categoryToDelete?.name}"</strong>?
            </Typography>
            {categoryToDelete?.productCount > 0 && (
              <Box 
                sx={{
                  mt: 2,
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: 'rgba(251, 191, 36, 0.1)',
                  border: '1px solid rgba(251, 191, 36, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2
                }}
              >
                <Box 
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(251, 191, 36, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Typography sx={{ color: '#f59e0b', fontWeight: 'bold', fontSize: '14px' }}>!</Typography>
                </Box>
                <Typography 
                  sx={{ 
                    color: '#92400e',
                    fontWeight: 500,
                    lineHeight: 1.5
                  }}
                >
                  Warning: This category has {categoryToDelete.productCount} products associated with it.
                  Those products will become uncategorized.
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 2 }}>
          <Button 
            onClick={() => setDeleteDialogOpen(false)} 
            disabled={loading}
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1.5,
              fontWeight: 600,
              color: '#6b7280',
              border: '1px solid rgba(148, 163, 184, 0.3)',
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: 'rgba(148, 163, 184, 0.1)',
                borderColor: '#94a3b8'
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmDelete} 
            variant="contained"
            disabled={loading}
            sx={{
              backgroundColor: '#ef4444',
              backgroundImage: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              boxShadow: '0 8px 16px rgba(239, 68, 68, 0.3)',
              borderRadius: 2,
              px: 3,
              py: 1.5,
              fontWeight: 600,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                backgroundColor: '#dc2626',
                backgroundImage: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                transform: 'translateY(-1px)',
                boxShadow: '0 12px 24px rgba(239, 68, 68, 0.4)'
              },
              '&:disabled': {
                backgroundColor: '#9ca3af',
                color: 'white',
                boxShadow: 'none'
              }
            }}
          >
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CategoryManager;
