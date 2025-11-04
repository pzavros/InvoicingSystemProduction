import React, { useState } from 'react';
import { 
  Box, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { CheckCircle, Close } from '@mui/icons-material';
import Section from '../ReusableComponents/Section.jsx';
import Column from '../ReusableComponents/Column.jsx';
import Text from '../ReusableComponents/Text.jsx';

const PricingFeaturesComparisonSection = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const featureCategories = [
    {
      category: 'Invoicing',
      features: [
        { name: 'Invoices per month', free: '3', premium: 'Unlimited' },
        { name: 'Custom templates', free: false, premium: true },
        { name: 'PDF generation', free: true, premium: true },
        { name: 'Payment tracking', free: true, premium: true },
        { name: 'Watermark', free: 'Yes', premium: 'No' },
      ]
    },
    {
      category: 'Client Management',
      features: [
        { name: 'Number of clients', free: '1', premium: 'Unlimited' },
        { name: 'Client profiles', free: true, premium: true },
        { name: 'Client history', free: true, premium: true },
      ]
    },
    {
      category: 'Product Catalog',
      features: [
        { name: 'Number of products', free: '1', premium: 'Unlimited' },
        { name: 'Product categories', free: '1', premium: 'Unlimited' },
        { name: 'Price management', free: true, premium: true },
      ]
    },
    {
      category: 'Reports & Analytics',
      features: [
        { name: 'Dashboard analytics', free: true, premium: true },
        { name: 'Revenue reports', free: true, premium: true },
        { name: 'Export reports', free: true, premium: true },
      ]
    },
    {
      category: 'Support',
      features: [
        { name: 'Email support', free: true, premium: true },
        { name: 'Priority support', free: false, premium: true },
        { name: 'Response time', free: '48 hours', premium: '24 hours' },
      ]
    }
  ];

  const renderValue = (value) => {
    if (typeof value === 'boolean') {
      return value ? (
        <CheckCircle sx={{ fontSize: 24, color: 'success.main' }} />
      ) : (
        <Close sx={{ fontSize: 24, color: 'text.disabled' }} />
      );
    }
    return <Text sx={{ fontWeight: 500, textAlign: 'center' }}>{value}</Text>;
  };

  if (isMobile) {
    // Mobile view - stacked cards
    return (
      <Section spacing="large" sx={{ background: 'rgba(248, 250, 252, 0.5)' }}>
        <Column gap={4}>
          <Column gap={2} sx={{ textAlign: 'center' }}>
            <Text variant="h2" weight="bold">
              Feature Comparison
            </Text>
            <Text variant="h6" sx={{ color: 'text.secondary', maxWidth: 700, mx: 'auto' }}>
              See exactly what's included in each plan
            </Text>
          </Column>
          
          {featureCategories.map((category, catIndex) => (
            <Box key={catIndex} sx={{ mb: 4 }}>
              <Text variant="h5" weight="bold" sx={{ mb: 3 }}>
                {category.category}
              </Text>
              {category.features.map((feature, featIndex) => (
                <Box
                  key={featIndex}
                  sx={{
                    p: 2,
                    mb: 2,
                    borderRadius: 2,
                    background: 'white',
                    border: '1px solid rgba(0,0,0,0.08)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                  }}
                >
                  <Text weight="bold" sx={{ mb: 2 }}>
                    {feature.name}
                  </Text>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                    <Box>
                      <Text sx={{ color: 'text.secondary', fontSize: '0.875rem', mb: 0.5 }}>
                        Free
                      </Text>
                      {renderValue(feature.free)}
                    </Box>
                    <Box>
                      <Text sx={{ color: 'text.secondary', fontSize: '0.875rem', mb: 0.5 }}>
                        Premium
                      </Text>
                      {renderValue(feature.premium)}
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          ))}
        </Column>
      </Section>
    );
  }

  // Desktop view - table
  return (
    <Section spacing="large" sx={{ background: 'rgba(248, 250, 252, 0.5)' }}>
      <Column gap={4}>
        <Column gap={2} sx={{ textAlign: 'center' }}>
          <Text variant="h2" weight="bold">
            Feature Comparison
          </Text>
          <Text variant="h6" sx={{ color: 'text.secondary', maxWidth: 700, mx: 'auto' }}>
            See exactly what's included in each plan
          </Text>
        </Column>
        
        <TableContainer sx={{ 
          borderRadius: 3, 
          overflow: 'hidden',
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          background: 'white'
        }}>
          <Table>
            <TableHead>
              <TableRow sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: '1rem' }}>
                  Features
                </TableCell>
                <TableCell align="center" sx={{ color: 'white', fontWeight: 600, fontSize: '1rem' }}>
                  Free
                </TableCell>
                <TableCell align="center" sx={{ color: 'white', fontWeight: 600, fontSize: '1rem' }}>
                  Premium
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {featureCategories.map((category, catIndex) => (
                <React.Fragment key={`cat-${catIndex}`}>
                  <TableRow sx={{ 
                    background: 'rgba(102, 126, 234, 0.05)'
                  }}>
                    <TableCell colSpan={3} sx={{ 
                      fontWeight: 700,
                      fontSize: '1.1rem',
                      color: 'primary.main',
                      py: 2
                    }}>
                      {category.category}
                    </TableCell>
                  </TableRow>
                  {category.features.map((feature, featIndex) => (
                    <TableRow 
                      key={`feat-${catIndex}-${featIndex}`}
                      sx={{ 
                        '&:hover': { background: 'rgba(102, 126, 234, 0.02)' },
                        transition: 'background 0.2s ease'
                      }}
                    >
                      <TableCell sx={{ py: 2.5 }}>
                        <Text weight="500">{feature.name}</Text>
                      </TableCell>
                      <TableCell align="center" sx={{ py: 2.5 }}>
                        {renderValue(feature.free)}
                      </TableCell>
                      <TableCell align="center" sx={{ py: 2.5 }}>
                        {renderValue(feature.premium)}
                      </TableCell>
                    </TableRow>
                  ))}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Column>
    </Section>
  );
};

export default PricingFeaturesComparisonSection;
