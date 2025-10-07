// src/pages/ProductFormPage.jsx
import React from "react";
import Page from "../components/ReusableComponents/Page";
import Section from "../components/ReusableComponents/Section";
import ProductFormPage from "../components/ProductCatalogPage/ProductFormPage";
import { Box } from "@mui/material";

export default function ProductFormPageWrapper() {
  return (
    <Page>
      <Section>
        <ProductFormPage />
      </Section>
    </Page>
  );
}
