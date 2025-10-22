import { useState } from 'react';
import { Box, Typography, Button } from '@mui/material';

const DebugPage = () => {
  const [result, setResult] = useState('');

  const testApi = async () => {
    try {
      console.log('Testing API...');
      setResult('Testing...');
      
      const response = await fetch('/api/webpage/waitlist/stats');
      console.log('Response:', response);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Data:', data);
        setResult(JSON.stringify(data, null, 2));
      } else {
        setResult(`Error: ${response.status} - ${response.statusText}`);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setResult(`Fetch error: ${error.message}`);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
      <Typography variant="h4" gutterBottom sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}>
        Debug API Connection
      </Typography>
      
      <Button 
        onClick={testApi} 
        variant="contained" 
        sx={{ mb: 2 }}
        fullWidth
      >
        Test API Connection
      </Button>
      
      <Box 
        component="pre" 
        sx={{ 
          background: '#f5f5f5', 
          p: { xs: 1.5, sm: 2 }, 
          borderRadius: 1,
          maxHeight: { xs: 300, sm: 400 },
          overflow: 'auto',
          fontSize: { xs: '0.7rem', sm: '0.8rem' },
          wordBreak: 'break-word',
          whiteSpace: 'pre-wrap'
        }}
      >
        {result || 'Click button to test API'}
      </Box>
    </Box>
  );
};

export default DebugPage;
