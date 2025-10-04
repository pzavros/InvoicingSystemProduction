// src/pages/ProductCatalogPage.jsx
import React from "react";
import Page from "../components/ReusableComponents/Page";
import Section from "../components/ReusableComponents/Section";
import ProductCatalogPage from "../components/ProductCatalogPage/ProductCatalogPage";
import { Box } from "@mui/material";

export default function ProductCatalogPageWrapper() {
  return (
    <Page>
      <Section>
        <Box
          sx={{
            maxWidth: "1400px",
            margin: "0 auto",
            width: "100%",
            p: { xs: 2, sm: 3 },
          }}
        >
          <ProductCatalogPage />
        </Box>
      </Section>
    </Page>
  );
}
