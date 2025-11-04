import React from 'react';
import { Box } from '@mui/material';
import { 
  Assessment, 
  ViewColumn, 
  FilterList, 
  FileDownload,
  Visibility,
  DragIndicator
} from '@mui/icons-material';
import Section from '../ReusableComponents/Section.jsx';
import Grid from '../ReusableComponents/Grid.jsx';
import Card from '../ReusableComponents/Card.jsx';
import Column from '../ReusableComponents/Column.jsx';
import Text from '../ReusableComponents/Text.jsx';
import Button from '../ReusableComponents/Button.jsx';
import IconBox from '../ReusableComponents/IconBox.jsx';
import { navigateToApp } from '../../utils/navigation.js';

const LogisticsReportSection = () => {
  const features = [
    {
      icon: <ViewColumn sx={{ fontSize: 48, color: '#667eea' }} />,
      title: 'Customizable Columns',
      description: 'Select exactly which data fields you need - invoice numbers, customer details, amounts, VAT, discounts, and more.'
    },
    {
      icon: <DragIndicator sx={{ fontSize: 48, color: '#764ba2' }} />,
      title: 'Drag & Reorder',
      description: 'Arrange your columns in any order with simple drag-and-drop to match your workflow.'
    },
    {
      icon: <FilterList sx={{ fontSize: 48, color: '#667eea' }} />,
      title: 'Smart Filtering',
      description: 'Filter by date ranges, invoice status, and specific time periods to get exactly the data you need.'
    },
    {
      icon: <Visibility sx={{ fontSize: 48, color: '#764ba2' }} />,
      title: 'Live Preview',
      description: 'See your customized report on screen before exporting - no surprises, complete control.'
    },
    {
      icon: <FileDownload sx={{ fontSize: 48, color: '#667eea' }} />,
      title: 'Multiple Export Formats',
      description: 'Download as Excel (.xlsx) with auto-formatting and totals, CSV, or PDF - your choice.'
    },
    {
      icon: <Assessment sx={{ fontSize: 48, color: '#764ba2' }} />,
      title: 'Instant Insights',
      description: 'Generate comprehensive reports in seconds, not hours. From a single invoice to years of data.'
    }
  ];

  return (
    <Section spacing="large">
      <Column gap={6}>
        {/* Header */}
        <Column gap={2} sx={{ textAlign: 'center', maxWidth: 700, mx: 'auto' }}>
          <IconBox size={80} sx={{ mx: 'auto' }}>
            <Assessment sx={{ fontSize: 40, color: 'white' }} />
          </IconBox>
          
          <Text variant="h2" weight="bold" align="center">
            End the Logistics Nightmare
          </Text>
          
          <Text variant="h6" align="center" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
            Stop wasting hours manually tracking invoices across spreadsheets. 
            Get the reports you need in seconds with our powerful, customizable reporting system.
          </Text>
        </Column>

        {/* Features Grid */}
        <Grid columns={{ xs: 1, sm: 2, lg: 3 }} gap={5} sx={{ mt: 2 }}>
          {features.map((feature, index) => (
            <Card key={index} variant="feature" title={feature.title} icon={feature.icon}>
              <Text align="center" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                {feature.description}
              </Text>
            </Card>
          ))}
        </Grid>

        {/* CTA */}
        <Column gap={2} sx={{ textAlign: 'center', mt: 4 }}>
          <Text variant="h5" weight="bold" align="center">
            Ready to Simplify Your Invoice Management?
          </Text>
          <Text sx={{ color: 'text.secondary', maxWidth: 600, mx: 'auto' }}>
            Start with our free plan today and experience the power of automated reporting.
          </Text>
          <Box sx={{ mt: 2 }}>
            <Button 
              variant="primary" 
              size="large"
              onClick={() => navigateToApp('register')}
            >
              Get Started Free
            </Button>
          </Box>
        </Column>
      </Column>
    </Section>
  );
};

export default LogisticsReportSection;
