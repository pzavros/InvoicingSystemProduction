// src/pages/AdminSupportPage.jsx
import React from "react";
import PageContainer from "../components/ReusableComponents/PageContainer";
import AdminSupportTicketsPage from "../components/SupportPage/AdminSupportTicketsPage";

export default function AdminSupportPage() {
  return (
    <PageContainer maxWidth="xl">
      <AdminSupportTicketsPage />
    </PageContainer>
  );
}
