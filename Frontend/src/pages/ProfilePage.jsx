// src/pages/ProfilePage.jsx
import React from "react";
import PageContainer from "../components/ReusableComponents/PageContainer";
import UserProfilePage from "../components/UserProfilePage/UserProfilePage";

export default function ProfilePageWrapper() {
  return (
    <PageContainer maxWidth="xl">
      <UserProfilePage />
    </PageContainer>
  );
}
