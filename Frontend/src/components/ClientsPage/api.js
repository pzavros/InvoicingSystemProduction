const API_BASE_URL = 'https://localhost:7101/api';

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Create headers with auth token
const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Get all clients
export const getAllClients = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/clients`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching clients:', error);
    throw error;
  }
};

// Search clients
export const searchClients = async (searchTerm) => {
  try {
    const response = await fetch(`${API_BASE_URL}/clients?search=${encodeURIComponent(searchTerm)}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error searching clients:', error);
    throw error;
  }
};

// Get client by ID
export const getClientById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/clients/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching client:', error);
    throw error;
  }
};

// Get client by email
export const getClientByEmail = async (email) => {
  try {
    const response = await fetch(`${API_BASE_URL}/clients/email/${encodeURIComponent(email)}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null; // Client not found
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching client by email:', error);
    throw error;
  }
};

// Create client
export const createClient = async (clientData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/clients`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(clientData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating client:', error);
    throw error;
  }
};

// Update client
export const updateClient = async (id, clientData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/clients/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ ...clientData, id }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating client:', error);
    throw error;
  }
};

// Delete client
export const deleteClient = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/clients/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error('Error deleting client:', error);
    throw error;
  }
};
