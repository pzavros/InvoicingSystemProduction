// src/pages/SystemSetupPage.jsx
import React from "react";
import PageContainer from "../components/ReusableComponents/PageContainer";
import CompanyProfileSettings from "../components/SystemSetupPage/CompanyProfileSettings";

export default function SystemSetupPage() {
  return (
    <PageContainer maxWidth="xl">
      <CompanyProfileSettings />
    </PageContainer>
  );
}
