// src/pages/SystemSetupPage.jsx
import React from "react";
import Page from "../components/ReusableComponents/Page";
import Section from "../components/ReusableComponents/Section";
import CompanyProfileSettings from "../components/SystemSetupPage/CompanyProfileSettings";
import { Box } from "@mui/material";

export default function SystemSetupPage() {
  return (
    <Page>
      <Section>
        <Box
          sx={{
            maxWidth: "1200px",
            margin: "0 auto",
            width: "100%",
            p: { xs: 2, sm: 3 },
          }}
        >
          <CompanyProfileSettings />
        </Box>
      </Section>
    </Page>
  );
}
