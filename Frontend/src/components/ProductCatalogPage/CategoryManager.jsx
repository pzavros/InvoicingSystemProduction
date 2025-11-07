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
      </TableContainer>      {/* Apple-Style Category Form Dialog */}
      <Dialog 
        open={categoryDialogOpen} 
        onClose={() => setCategoryDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            boxShadow: '0 20px 60px rgba(15, 23, 42, 0.15)'
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
        <DialogTitle sx={{ 
          color: 'rgba(15, 23, 42, 0.95)', 
          fontWeight: 700,
          fontSize: '1.5rem',
          letterSpacing: '-0.02em',
          pt: 3,
          px: 3,
          pb: 1
        }}>
          {editingCategory ? "Edit Category" : "Add New Category"}
        </DialogTitle>
        <DialogContent sx={{ px: 3, py: 2 }}>
          <Box sx={{ pt: 1.5 }}>
            <Typography sx={{
              color: 'rgba(15, 23, 42, 0.75)',
              fontWeight: 600,
              fontSize: '0.875rem',
              mb: 0.5,
              display: 'block'
            }}>
              Category Name *
            </Typography>
            <TextField
              name="name"
              value={categoryFormData.name}
              onChange={handleCategoryFormChange}
              fullWidth
              required
              placeholder="Enter category name..."
              size="small"
              sx={{ 
                mb: 2.5,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  fontSize: '0.875rem',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(15, 23, 42, 0.08)',
                    borderWidth: '1px'
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(15, 23, 42, 0.15)'
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(15, 23, 42, 0.25)',
                    borderWidth: '1.5px'
                  },
                  '& .MuiInputBase-input': {
                    padding: '9px 12px'
                  }
                }
              }}
            />
            
            <Typography sx={{
              color: 'rgba(15, 23, 42, 0.75)',
              fontWeight: 600,
              fontSize: '0.875rem',
              mb: 0.5,
              display: 'block'
            }}>
              Description
            </Typography>
            <TextField
              name="description"
              value={categoryFormData.description}
              onChange={handleCategoryFormChange}
              fullWidth
              multiline
              rows={3}
              placeholder="Describe this category..."
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  fontSize: '0.875rem',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(15, 23, 42, 0.08)',
                    borderWidth: '1px'
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(15, 23, 42, 0.15)'
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(15, 23, 42, 0.25)',
                    borderWidth: '1.5px'
                  },
                  '& .MuiInputBase-input': {
                    padding: '9px 12px'
                  }
                }
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ 
          p: 3, 
          pt: 2,
          gap: 1.5,
          borderTop: '1px solid rgba(15, 23, 42, 0.08)',
          justifyContent: 'flex-end'
        }}>
          <Button 
            onClick={() => setCategoryDialogOpen(false)} 
            disabled={loading}
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
            Cancel
          </Button>
          <Button 
            onClick={handleSaveCategory} 
            variant="contained" 
            disabled={loading}
            sx={{
              px: 3,
              py: 1.25,
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.875rem',
              letterSpacing: '-0.01em',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
              color: 'white',
              border: 'none',
              boxShadow: '0 1px 3px rgba(139, 92, 246, 0.2)',
              transition: 'all 0.2s ease',
              '&:hover': {
                background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
                boxShadow: '0 2px 6px rgba(139, 92, 246, 0.3)',
                transform: 'translateY(-1px)'
              },
              '&:active': {
                transform: 'translateY(0)'
              },
              '&:disabled': {
                background: 'rgba(15, 23, 42, 0.08)',
                color: 'rgba(15, 23, 42, 0.35)',
                boxShadow: 'none'
              }
            }}
          >
            {loading ? "Saving..." : (editingCategory ? "Update Category" : "Create Category")}
          </Button>
        </DialogActions>
      </Dialog>      {/* Apple-Style Delete Confirmation Dialog */}
      <Dialog 
        open={deleteDialogOpen} 
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            boxShadow: '0 20px 60px rgba(15, 23, 42, 0.15)'
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
        <DialogTitle sx={{ 
          color: 'rgba(15, 23, 42, 0.95)', 
          fontWeight: 700,
          fontSize: '1.5rem',
          letterSpacing: '-0.02em',
          pt: 3,
          px: 3,
          pb: 1
        }}>
          Delete Category
        </DialogTitle>
        <DialogContent sx={{ px: 3, py: 2 }}>
          <Typography sx={{
            color: 'rgba(15, 23, 42, 0.65)',
            fontSize: '0.9375rem',
            lineHeight: 1.6,
            mb: 2
          }}>
            Are you sure you want to delete{" "}
            <Box component="strong" sx={{ 
              color: 'rgba(15, 23, 42, 0.95)',
              fontWeight: 600
            }}>
              "{categoryToDelete?.name}"
            </Box>? This action cannot be undone.
          </Typography>
          
          {categoryToDelete?.productCount > 0 && (
            <Box sx={{
              p: 2,
              borderRadius: '12px',
              backgroundColor: 'rgba(251, 191, 36, 0.08)',
              border: '1px solid rgba(251, 191, 36, 0.2)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 1.5
            }}>
              <Box sx={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                backgroundColor: 'rgba(251, 191, 36, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                mt: 0.25
              }}>
                <Typography sx={{ 
                  color: '#f59e0b', 
                  fontWeight: 'bold', 
                  fontSize: '11px',
                  lineHeight: 1
                }}>!</Typography>
              </Box>
              <Typography sx={{ 
                color: 'rgba(15, 23, 42, 0.75)',
                fontSize: '0.8125rem',
                fontWeight: 500,
                lineHeight: 1.5
              }}>
                This category has {categoryToDelete.productCount} products associated with it.
                Those products will become uncategorized.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ 
          p: 3, 
          pt: 2,
          gap: 1.5,
          borderTop: '1px solid rgba(15, 23, 42, 0.08)',
          justifyContent: 'flex-end'
        }}>
          <Button 
            onClick={() => setDeleteDialogOpen(false)} 
            disabled={loading}
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
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmDelete} 
            variant="contained"
            disabled={loading}
            sx={{
              px: 3,
              py: 1.25,
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.875rem',
              letterSpacing: '-0.01em',
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              color: 'white',
              border: 'none',
              boxShadow: '0 1px 3px rgba(239, 68, 68, 0.2)',
              transition: 'all 0.2s ease',
              '&:hover': {
                background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                boxShadow: '0 2px 6px rgba(239, 68, 68, 0.3)',
                transform: 'translateY(-1px)'
              },
              '&:active': {
                transform: 'translateY(0)'
              },
              '&:disabled': {
                background: 'rgba(15, 23, 42, 0.08)',
                color: 'rgba(15, 23, 42, 0.35)',
                boxShadow: 'none'
              }
            }}
          >
            {loading ? "Deleting..." : "Delete Category"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CategoryManager;
