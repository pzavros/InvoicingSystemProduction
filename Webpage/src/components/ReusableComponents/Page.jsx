import { Box } from '@mui/material';

const Page = ({ children }) => {
  return (
    <Box
      sx={{
        maxWidth: 1440,
        margin: '0 auto',
        px: { xs: 3, md: 4 }, // Symmetric horizontal padding
        py: { xs: 2, md: 3 },
        minHeight: '100vh',
        width: '100%',
        boxSizing: 'border-box' // Ensure consistent box model
      }}
    >
      {children}
    </Box>
  );
};

export default Page;
