// src/pages/ProfilePage.jsx
import React from "react";
import Page from "../components/ReusableComponents/Page";
import UserProfilePage from "../components/UserProfilePage/UserProfilePage";

export default function ProfilePageWrapper() {
  return (
    <Page>
      <UserProfilePage />
    </Page>
  );
}
