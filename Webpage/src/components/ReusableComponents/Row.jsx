import { Box } from '@mui/material';

const Row = ({ children, gap = 2, sx = {} }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: gap,
        alignItems: 'center',
        ...sx
      }}
    >
      {children}
    </Box>
  );
};

export default Row;
