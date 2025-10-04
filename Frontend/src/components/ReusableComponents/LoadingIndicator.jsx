import React from "react";
import { Box, Typography } from "@mui/material";

const LoadingIndicator = ({ message }) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="100vh"
      sx={{ backgroundColor: "var(--color-background)" }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Box
          sx={{
            width: "10px",
            height: "10px",
            backgroundColor: "var(--color-primary)",
            borderRadius: "50%",
            margin: "0 5px",
            animation: "bounce 1.5s infinite ease-in-out",
            "@keyframes bounce": {
              "0%": { transform: "scale(1)" },
              "50%": { transform: "scale(1.5)" },
              "100%": { transform: "scale(1)" },
            },
          }}
        />
        <Box
          sx={{
            width: "10px",
            height: "10px",
            backgroundColor: "var(--color-secondary)",
            borderRadius: "50%",
            margin: "0 5px",
            animation: "bounce 1.5s infinite ease-in-out",
            animationDelay: "0.2s",
          }}
        />
        <Box
          sx={{
            width: "10px",
            height: "10px",
            backgroundColor: "var(--color-primary)",
            borderRadius: "50%",
            margin: "0 5px",
            animation: "bounce 1.5s infinite ease-in-out",
            animationDelay: "0.4s",
          }}
        />
      </Box>
      {message && (
        <Typography
          variant="body1"
          sx={{ color: "var(--color-text-primary)", marginTop: "16px" }}
        >
          {message}
        </Typography>
      )}
    </Box>
  );
};

export default LoadingIndicator;