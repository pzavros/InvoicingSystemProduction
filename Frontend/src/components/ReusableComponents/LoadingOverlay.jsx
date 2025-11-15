import { Backdrop, Box, CircularProgress, Typography } from '@mui/material';

const LoadingOverlay = ({ open, message = "Loading..." }) => {
  return (
    <Backdrop
      sx={{
        color: '#fff',
        zIndex: (theme) => theme.zIndex.modal + 1,
        backdropFilter: 'blur(8px)',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
      }}
      open={open}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 3,
          padding: 4,
          borderRadius: '20px',
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        }}
      >
        <CircularProgress
          size={60}
          thickness={4}
          sx={{
            color: '#667eea',
          }}
        />
        {message && (
          <Typography
            variant="h6"
            sx={{
              color: '#fff',
              fontWeight: 600,
              textAlign: 'center',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)',
            }}
          >
            {message}
          </Typography>
        )}
      </Box>
    </Backdrop>
  );
};

export default LoadingOverlay;
