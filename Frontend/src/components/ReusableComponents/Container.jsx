import React from 'react';
import { Box } from '@mui/material';

const Container = ({ children, marginBottom = '32px', ...props }) => {
    return (
        <Box
            sx={{
                width: '100%',
                mb: marginBottom,
                px: { xs: 2, sm: 3, md: 4 },
                ...props.sx,
            }}
            {...props}
        >
            {children}
        </Box>
    );
};

export default Container;
