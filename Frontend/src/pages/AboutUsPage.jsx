import React from "react";
import { Box } from "@mui/material";
import AboutUs from "../components/aboutuspage/AboutUs";

const AboutUsPage = () => {
  return (
    <Box
      sx={{
        backgroundColor: "var(--color-background)",
        minHeight: "100vh",
        pt: 2,
        pb: 6,
      }}
    >
      <AboutUs />
    </Box>
  );
};

export default AboutUsPage;