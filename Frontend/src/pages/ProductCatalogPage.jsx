// src/pages/ProductCatalogPage.jsx
import React from "react";
import PageContainer from "../components/ReusableComponents/PageContainer";
import ProductCatalogPage from "../components/ProductCatalogPage/ProductCatalogPage";

export default function ProductCatalogPageWrapper() {
  return (
    <PageContainer maxWidth="xl">
      <ProductCatalogPage />
    </PageContainer>
  );
}
