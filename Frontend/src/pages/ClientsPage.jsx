// src/pages/ClientsPage.jsx
import React from "react";
import Page from "../components/ReusableComponents/Page";
import Section from "../components/ReusableComponents/Section";
import ClientsPage from "../components/ClientsPage/ClientsPage";
import { Box } from "@mui/material";

export default function ClientsPageWrapper() {
  return (
    <Page>
          <ClientsPage />
    </Page>
  );
}
