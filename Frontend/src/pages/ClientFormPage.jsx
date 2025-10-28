// src/pages/ClientFormPage.jsx
import React from "react";
import PageContainer from "../components/ReusableComponents/PageContainer";
import ClientFormPage from "../components/ClientsPage/ClientFormPage";

export default function ClientFormPageWrapper() {
  return (
    <PageContainer maxWidth="xl">
      <ClientFormPage />
    </PageContainer>
  );
}
