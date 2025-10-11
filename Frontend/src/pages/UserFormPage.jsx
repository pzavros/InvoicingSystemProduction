// src/pages/UserFormPage.jsx
import React from "react";
import Page from "../components/ReusableComponents/Page";
import UserFormPage from "../components/UserManagementPage/UserFormPage";

export default function UserFormPageWrapper() {
  return (
    <Page>
      <UserFormPage />
    </Page>
  );
}
