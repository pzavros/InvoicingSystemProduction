import React from 'react';
import { Button as MuiButton } from '@mui/material';

const Button = ({ children, variant = 'contained', ...props }) => {
  return (
    <MuiButton
      variant={variant}
      sx={{
        background:
          `linear-gradient(90deg, var(--color-secondary) 0%, var(--color-primary) 100%)`,
        color: "#fff",
        textTransform: "none",
        fontWeight: "bold",
        padding: "6px 16px",
        borderRadius: "50px",
        "&:hover": {
          background:
            `linear-gradient(90deg, var(--color-primary) 0%, var(--color-secondary) 100%)`,
        },
      }}
      {...props}
    >
      {children}
    </MuiButton>
  );
};

export default Button;
