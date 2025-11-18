import React from 'react';
import { Box } from '@mui/material';
import PageContainer from '../components/ReusableComponents/PageContainer';
import InvoiceList from '../components/HomePage/InvoiceList';

export default function HomePage() {
  return (
    <PageContainer maxWidth="xl">
      <Box>
        <InvoiceList />
      </Box>
    </PageContainer>
  );
}
