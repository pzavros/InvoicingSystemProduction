import React from "react";
import { TextField } from "@mui/material";

const InputField = ({ name, label, placeholder, value, onChange, ...props }) => {
  return (
    <TextField
      name={name}
      label={label}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      fullWidth
      variant="outlined"
      InputLabelProps={{
        style: {
          color: "var(--color-text-secondary)",
        },
      }}
      sx={{
        "& .MuiOutlinedInput-root": {
          "& fieldset": {
            borderColor: "var(--color-border)",
          },
          "&:hover fieldset": {
            borderColor: "var(--color-primary)",
          },
          "&.Mui-focused fieldset": {
            borderColor: "var(--color-primary)",
          },
        },
        input: {
          color: "var(--color-text-primary)",
        },
      }}
      {...props}
    />
  );
};

export default InputField;
