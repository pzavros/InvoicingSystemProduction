// src/components/ClientsPage/ClientsDataGrid.jsx
import React from "react";
import ClientList from "./ClientList";

const ClientsDataGrid = ({ clients, loading, onEditClient, onDeleteClient, onReloadClients }) => {
  return (
    <ClientList
      clients={clients}
      loading={loading}
      onEditClient={onEditClient}
      onDeleteClient={onDeleteClient}
      onReloadClients={onReloadClients}
    />
  );
};

export default ClientsDataGrid;
