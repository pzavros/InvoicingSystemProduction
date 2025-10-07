// src/components/ClientsPage/useClientsData.js
import { useState, useEffect } from "react";
import { getAllClients } from "./api";

const useClientsData = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const clientsData = await getAllClients();
      setClients(clientsData);
    } catch (error) {
      throw new Error("Error loading clients: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    loadData().catch(() => {
      // Error will be handled by the component using this hook
    });
  }, []);

  const refreshData = () => {
    return loadData();
  };

  return {
    clients,
    loading,
    refreshData
  };
};

export default useClientsData;
