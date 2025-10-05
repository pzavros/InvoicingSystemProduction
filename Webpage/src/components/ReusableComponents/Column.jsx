import { Box } from '@mui/material';

const Column = ({ children, gap = 2, sx = {} }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: gap,
        flex: 1,
        ...sx
      }}
    >
      {children}
    </Box>
  );
};

export default Column;
