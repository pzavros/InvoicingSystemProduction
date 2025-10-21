// src/components/ProductCatalogPage/api.js
import axios from "axios";

// API Base URL Configuration
// Development: empty string uses Vite proxy (/api -> http://localhost:5088)
// Production: /api routed through Caddy reverse proxy to backend container
const API_BASE_URL = import.meta.env.VITE_APP_API_BASE_URL || '';

const productApi = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Add token to requests if available
productApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
productApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Product APIs
export const getAllProducts = async (searchParams = {}) => {
  try {
    const params = new URLSearchParams();
    if (searchParams.name) params.append('name', searchParams.name);
    if (searchParams.categoryId) params.append('categoryId', searchParams.categoryId);
    if (searchParams.isActive !== undefined) params.append('isActive', searchParams.isActive);
    if (searchParams.pageNumber) params.append('pageNumber', searchParams.pageNumber);
    if (searchParams.pageSize) params.append('pageSize', searchParams.pageSize);
    
    const queryString = params.toString();
    const url = queryString ? `/api/Products?${queryString}` : '/api/Products';
    
    const response = await productApi.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

export const getProductById = async (id) => {
  try {
    const response = await productApi.get(`/api/Products/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching product by id:", error);
    throw error;
  }
};

export const createProduct = async (productData) => {
  try {
    const response = await productApi.post("/api/Products", productData);
    return response.data;
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
};

export const updateProduct = async (id, productData) => {
  try {
    const response = await productApi.put(`/api/Products/${id}`, productData);
    return response.data;
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
};

export const deleteProduct = async (id) => {
  try {
    const response = await productApi.delete(`/api/Products/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
};

export const updateProductInventory = async (id, quantity) => {
  try {
    const response = await productApi.put(`/api/Products/${id}/inventory`, { quantity });
    return response.data;
  } catch (error) {
    console.error("Error updating product inventory:", error);
    throw error;
  }
};

export const getLowStockProducts = async (threshold = 10) => {
  try {
    const response = await productApi.get(`/api/Products/low-stock?threshold=${threshold}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching low stock products:", error);
    throw error;
  }
};

// Product Category APIs
export const getAllCategories = async () => {
  try {
    const response = await productApi.get("/api/Products/categories");
    return response.data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};

export const createCategory = async (categoryData) => {
  try {
    const response = await productApi.post("/api/Products/categories", categoryData);
    return response.data;
  } catch (error) {
    console.error("Error creating category:", error);
    throw error;
  }
};

export const updateCategory = async (id, categoryData) => {
  try {
    const response = await productApi.put(`/api/Products/categories/${id}`, categoryData);
    return response.data;
  } catch (error) {
    console.error("Error updating category:", error);
    throw error;
  }
};

export const deleteCategory = async (id) => {
  try {
    const response = await productApi.delete(`/api/Products/categories/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting category:", error);
    throw error;
  }
};

// Price History APIs
export const getProductPriceHistory = async (productId) => {
  try {
    const response = await productApi.get(`/api/Products/${productId}/price-history`);
    return response.data;
  } catch (error) {
    console.error("Error fetching price history:", error);
    throw error;
  }
};
