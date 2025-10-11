const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Create axios-like wrapper for fetch
const api = {
  get: async (url) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  }
};

// Get all document types
export const getAllDocumentTypes = async () => {
  try {
    const response = await api.get('/documenttypes');
    return response;
  } catch (error) {
    console.error('Error fetching document types:', error);
    throw error;
  }
};

// Get document type by ID
export const getDocumentTypeById = async (id) => {
  try {
    const response = await api.get(`/documenttypes/${id}`);
    return response;
  } catch (error) {
    console.error('Error fetching document type:', error);
    throw error;
  }
};

// Get document type by code
export const getDocumentTypeByCode = async (code) => {
  try {
    const response = await api.get(`/documenttypes/by-code/${code}`);
    return response;
  } catch (error) {
    console.error('Error fetching document type:', error);
    throw error;
  }
};
