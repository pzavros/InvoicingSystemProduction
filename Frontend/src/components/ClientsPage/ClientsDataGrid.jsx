// src/components/ClientsPage/ClientsDataGrid.jsx
import React from "react";
import { Box } from "@mui/material";
import ClientList from "./ClientList";

const ClientsDataGrid = ({ clients, loading, onEditClient, onDeleteClient, onReloadClients }) => {
  return (
    <Box sx={{ 
      flex: 1,
      mx: 1,
      mb: 1,
      backgroundColor: '#f8fafc',
      overflow: 'hidden',
      width: 'calc(100% - 16px)',
      '& .MuiDataGrid-root': {
        border: 'none',
        backgroundColor: '#f8fafc',
        width: '100%',
      }
    }}>
      <ClientList
        clients={clients}
        loading={loading}
        onEditClient={onEditClient}
        onDeleteClient={onDeleteClient}
        onReloadClients={onReloadClients}
      />
    </Box>
  );
};

export default ClientsDataGrid;
