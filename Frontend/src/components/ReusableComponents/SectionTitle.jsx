import React from "react";
import { Typography } from "@mui/material";

const SectionTitle = ({ children }) => (
  <Typography
    variant="h5"
    sx={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      fontWeight: "bold",
      fontSize: "1.5rem",
      marginBottom: "16px",
      color: "var(--text-color)",
    }}
  >
    {children}
  </Typography>
);

export default SectionTitle;
