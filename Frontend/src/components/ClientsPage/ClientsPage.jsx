// src/components/ClientsPage/ClientsPage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import ClientsPageHeader from "./ClientsPageHeader";
import ClientsDataGrid from "./ClientsDataGrid";
import NotificationSnackbar from "./NotificationSnackbar";
import useClientsData from "./useClientsData";
import useNotification from "./useNotification";
import PageLoader from "../ReusableComponents/PageLoader";
import PageHelper from "../ReusableComponents/PageHelper";
import { pageHelpContent } from "../../config/pageHelpContent";
import LoadingOverlay from '../ReusableComponents/LoadingOverlay';

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

  if (loading) {
    return <PageLoader color="#06b6d4" />;
  }

  return (
    <>
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
      
      <PageHelper {...pageHelpContent.clients} />
      <LoadingOverlay open={loading} message="Loading clients..." />
    </>
  );
};

export default ClientsPage;
