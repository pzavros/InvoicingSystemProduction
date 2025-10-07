// src/pages/ClientFormPage.jsx
import React from "react";
import Page from "../components/ReusableComponents/Page";
import Section from "../components/ReusableComponents/Section";
import ClientFormPage from "../components/ClientsPage/ClientFormPage";
import { Box } from "@mui/material";

export default function ClientFormPageWrapper() {
  return (
    <Page>
      <Section>
        <ClientFormPage />
      </Section>
    </Page>
  );
}
