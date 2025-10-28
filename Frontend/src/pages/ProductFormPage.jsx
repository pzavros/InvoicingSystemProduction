// src/pages/ProductFormPage.jsx
import React from "react";
import PageContainer from "../components/ReusableComponents/PageContainer";
import ProductFormPage from "../components/ProductCatalogPage/ProductFormPage";

export default function ProductFormPageWrapper() {
  return (
    <PageContainer maxWidth="xl">
      <ProductFormPage />
    </PageContainer>
  );
}
