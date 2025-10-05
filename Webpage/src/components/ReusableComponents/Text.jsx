import { Typography } from '@mui/material';

const Text = ({ children, variant = 'body1', weight = 'normal', align = 'left', gutter = false, sx = {} }) => {
  const fontWeight = {
    light: 300,
    normal: 400,
    medium: 500,
    bold: 700
  };

  return (
    <Typography
      variant={variant}
      align={align}
      gutterBottom={gutter}
      sx={{
        fontWeight: fontWeight[weight] || fontWeight.normal,
        margin: 0,
        ...sx
      }}
    >
      {children}
    </Typography>
  );
};

export default Text;
