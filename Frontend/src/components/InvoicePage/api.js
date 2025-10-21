// src/components/InvoicePage/api.js
import axios from "axios";

// API Base URL Configuration
// Development: empty string uses Vite proxy (/api -> http://localhost:5088)
// Production: /api routed through Caddy reverse proxy to backend container
const API_BASE_URL = import.meta.env.VITE_APP_API_BASE_URL || '';

const invoiceApi = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Add token to requests if available
invoiceApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
invoiceApi.interceptors.response.use(
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

// Get all invoices
export const getAllInvoices = async () => {
  try {
    const response = await invoiceApi.get("/api/Invoices");
    return response.data;
  } catch (error) {
    console.error("Error fetching invoices:", error);
    throw error;
  }
};

// Get a single invoice by id
export const getInvoiceById = async (id) => {
  try {
    const response = await invoiceApi.get(`/api/Invoices/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching invoice by id:", error);
    throw error;
  }
};

// Create a new invoice
export const createInvoice = async (invoiceData) => {
  try {
    const response = await invoiceApi.post("/api/Invoices", invoiceData);
    return response.data;
  } catch (error) {
    console.error("Error creating invoice:", error);
    throw error;
  }
};

// Update an existing invoice
export const updateInvoice = async (id, invoiceData) => {
  try {
    const response = await invoiceApi.put(`/api/Invoices/${id}`, invoiceData);
    return response.data;
  } catch (error) {
    console.error("Error updating invoice:", error);
    throw error;
  }
};

// Delete an invoice 
export const deleteInvoice = async (id) => {
  try {
    const response = await invoiceApi.delete(`/api/Invoices/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting invoice:", error);
    throw error;
  }
};

// Get all statuses
export const getAllStatuses = async () => {
  try {
    const response = await invoiceApi.get("/api/Invoices/statuses");
    return response.data;
  } catch (error) {
    console.error("Error fetching statuses:", error);
    // If the endpoint doesn't exist yet, return default statuses
    return [
      { statusId: 1, name: 'Draft' },
      { statusId: 2, name: 'Unpaid' },
      { statusId: 3, name: 'Paid' }
    ];
  }
};

// Add this function to update invoice status
export const updateInvoiceStatus = async (id, statusId) => {
  try {
    const response = await invoiceApi.put(`/api/Invoices/${id}/status`, { statusId });
    return response.data; // Or handle NoContent response appropriately
  } catch (error) {
    console.error("Error updating invoice status:", error);
    throw error;
  }
};

// Get all currencies
export const getAllCurrencies = async () => {
  try {
    const response = await invoiceApi.get("/api/Invoices/Currencies");
    return response.data;
  } catch (error) {
    console.error("Error fetching currencies:", error);
    throw error;
  }
};

// Get system setup
export const getSystemSetup = async () => {
  try {
    const response = await invoiceApi.get("/api/SystemSetup");
    return response.data;
  } catch (error) {
    console.error("Error fetching system setup:", error);
    throw error;
  }
};

// Function to update the status of multiple invoices
export const updateBulkInvoiceStatus = async (invoiceIds, statusId) => {
  if (!invoiceIds || invoiceIds.length === 0) {
    throw new Error('No invoice IDs provided for bulk update.');
  }
  try {
    const response = await invoiceApi.post("/api/Invoices/bulk-status", { invoiceIds, statusId });
    return response.data;
  } catch (error) {
    console.error("Error updating bulk invoice statuses:", error);
    throw error;
  }
};

export const getActiveInvoiceTemplate = async (documentTypeId = null) => {
  try {
    const url = documentTypeId 
      ? `/api/invoicetemplates/active/document-type?documentTypeId=${documentTypeId}`
      : '/api/invoicetemplates/active';
    const response = await invoiceApi.get(url);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      return null;
    }
    console.error('Error fetching active invoice template:', error);
    throw error;
  }
};

export const getInvoiceTemplateById = async (templateId) => {
  if (!templateId) {
    return null;
  }

  try {
    const response = await invoiceApi.get(`/api/invoicetemplates/${templateId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching invoice template with id ${templateId}:`, error);
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
};

export default invoiceApi;
