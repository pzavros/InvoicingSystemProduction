import React from 'react';
import { Box } from '@mui/material';
import PageContainer from '../components/ReusableComponents/PageContainer';
import InvoiceList from '../components/HomePage/InvoiceList';
import PageHelper from '../components/ReusableComponents/PageHelper';
import { pageHelpContent } from '../config/pageHelpContent';

export default function HomePage() {
  return (
    <PageContainer maxWidth="xl">
      <Box>
        <InvoiceList />
      </Box>
      <PageHelper {...pageHelpContent.home} />
    </PageContainer>
  );
}
