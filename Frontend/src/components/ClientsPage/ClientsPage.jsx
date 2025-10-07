// src/components/ClientsPage/ClientsPage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import Section from "../ReusableComponents/Section";
import ClientsPageHeader from "./ClientsPageHeader";
import ClientsDataGrid from "./ClientsDataGrid";
import NotificationSnackbar from "./NotificationSnackbar";
import useClientsData from "./useClientsData";
import useNotification from "./useNotification";

const ClientsPage = () => {
  const navigate = useNavigate();
  const { clients, loading, refreshData } = useClientsData();
  const { notification, showNotification, hideNotification } = useNotification();

  const handleAddClient = () => {
    navigate('/clients/add');
  };

  const handleEditClient = (client) => {
    navigate(`/clients/edit/${client.id}`);
  };

  const handleClientDeleted = async () => {
    try {
      await refreshData();
      showNotification("Client deleted successfully!", "success");
    } catch (error) {
      showNotification(error.message, "error");
    }
  };

  return (
    <Section>
      <ClientsPageHeader 
        clientsCount={clients.length}
        onAddClient={handleAddClient}
      />

      <ClientsDataGrid
        clients={clients}
        loading={loading}
        onEditClient={handleEditClient}
        onDeleteClient={handleClientDeleted}
        onReloadClients={refreshData}
      />

      <NotificationSnackbar
        notification={notification}
        onClose={hideNotification}
      />
    </Section>
  );
};

export default ClientsPage;
