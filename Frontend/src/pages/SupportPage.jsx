// src/pages/SupportPage.jsx
import React from "react";
import PageContainer from "../components/ReusableComponents/PageContainer";
import SupportTicketPage from "../components/SupportPage/SupportTicketPage";

export default function SupportPage() {
  return (
    <PageContainer maxWidth="xl">
      <SupportTicketPage />
    </PageContainer>
  );
}
