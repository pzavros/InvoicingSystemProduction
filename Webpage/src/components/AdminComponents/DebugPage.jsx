import { useState } from 'react';
import { Box, Typography, Button } from '@mui/material';

const DebugPage = () => {
  const [result, setResult] = useState('');

  const testApi = async () => {
    try {
      console.log('Testing API...');
      setResult('Testing...');
      
      const response = await fetch('http://localhost:5000/api/webpage/waitlist/stats');
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
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Debug API Connection
      </Typography>
      
      <Button onClick={testApi} variant="contained" sx={{ mb: 2 }}>
        Test API Connection
      </Button>
      
      <Box 
        component="pre" 
        sx={{ 
          background: '#f5f5f5', 
          p: 2, 
          borderRadius: 1,
          maxHeight: 400,
          overflow: 'auto',
          fontSize: '0.8rem'
        }}
      >
        {result || 'Click button to test API'}
      </Box>
    </Box>
  );
};

export default DebugPage;
