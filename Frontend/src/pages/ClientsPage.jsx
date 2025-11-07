// src/pages/ClientsPage.jsx
import React from "react";
import ClientsPage from "../components/ClientsPage/ClientsPage";
import PageContainer from "../components/ReusableComponents/PageContainer";

export default function ClientsPageWrapper() {
  return (
    <PageContainer maxWidth="xl">
      <ClientsPage />
    </PageContainer>
  );
}
