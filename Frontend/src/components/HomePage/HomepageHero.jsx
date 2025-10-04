import { Typography, Paper, Box, Button } from '@mui/material';
import Section from '../../components/ReusableComponents/Section';

export default function HomepageHero() {
  return (
    <Section>
      <Paper elevation={3} sx={{ 
        p: 4, 
        backgroundColor: 'var(--color-card-background)',
        boxShadow: `0 4px 8px var(--color-shadow)`
      }}>
        <Typography variant="h4" gutterBottom sx={{ color: 'var(--color-text-primary)' }}>
          Welcome to the Invoicing System
        </Typography>
        <Typography variant="body1" gutterBottom sx={{ color: 'var(--color-text-secondary)' }}>
          This is your central dashboard. From here, you'll be able to:
        </Typography>

        <Box sx={{ mt: 2, mb: 2 }}>
          <ul>
            <li>Create and manage invoices</li>
            <li>Track clients and services</li>
            <li>Export and print receipts</li>
          </ul>
        </Box>

        <Button 
          variant="contained" 
          sx={{ 
            backgroundColor: 'var(--color-primary)', 
            '&:hover': { 
              backgroundColor: 'var(--color-primary-dark)' 
            } 
          }}
        >
          Create New Invoice
        </Button>
      </Paper>
    </Section>
  );
}
