// Frontend API functions for document types
import api from '../../services/api';

export const getAllDocumentTypes = async () => {
  try {
    const response = await api.get('/api/documenttypes');
    return response.data;
  } catch (error) {
    console.error('Error fetching document types:', error);
    throw error;
  }
};

export const getDocumentTypeById = async (id) => {
  try {
    const response = await api.get(`/api/documenttypes/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching document type:', error);
    throw error;
  }
};

export const getDocumentTypeByCode = async (code) => {
  try {
    const response = await api.get(`/api/documenttypes/by-code/${code}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching document type by code:', error);
    throw error;
  }
};
