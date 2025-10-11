// src/pages/UserManagementPage.jsx
import React from "react";
import Page from "../components/ReusableComponents/Page";
import UserManagementPage from "../components/UserManagementPage/UserManagementPage";

export default function UserManagementPageWrapper() {
  return (
    <Page>
      <UserManagementPage />
    </Page>
  );
}
