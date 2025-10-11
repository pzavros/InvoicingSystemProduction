// src/components/UserManagementPage/useUsersData.js
import { useState, useEffect, useCallback } from 'react';
import { getAllUsers } from './api';

const useUsersData = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const userData = await getAllUsers();
      setUsers(userData);
    } catch (err) {
      setError(err.message || 'Failed to fetch users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const refreshData = useCallback(() => {
    return fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    loading,
    error,
    refreshData
  };
};

export default useUsersData;
