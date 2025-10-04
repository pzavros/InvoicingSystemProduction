import React from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  Grid, 
  Chip,
  Fade,
  Grow
} from '@mui/material';
import { 
  Home as HomeIcon,
  Receipt as ReceiptIcon,
  TrendingUp as TrendingUpIcon,
  Assignment as AssignmentIcon 
} from '@mui/icons-material';
import Page from '../components/ReusableComponents/Page';
import InvoiceList from '../components/HomePage/InvoiceList';

const StatCard = ({ title, subtitle, icon: Icon, color, children, delay = 0 }) => (
  <Grow in={true} timeout={600 + delay}>
    <Card 
      elevation={6}
      sx={{ 
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 3,
        background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
        border: `1px solid ${color}20`,
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        height: '100%',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 20px 40px ${color}15`,
          border: `1px solid ${color}30`,
          '& .icon-container': {
            transform: 'scale(1.05)',
            background: `linear-gradient(135deg, ${color} 0%, ${color}DD 100%)`
          }
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: `linear-gradient(90deg, ${color} 0%, ${color}CC 50%, ${color}99 100%)`,
          borderRadius: '3px 3px 0 0'
        }
      }}
    >
      <Box
        sx={{
          p: 3,
          background: `linear-gradient(135deg, ${color}08 0%, ${color}03 100%)`,
          borderBottom: `1px solid ${color}10`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            className="icon-container"
            sx={{
              width: 48,
              height: 48,
              borderRadius: '12px',
              background: `linear-gradient(135deg, ${color} 0%, ${color}DD 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              boxShadow: `0 8px 16px ${color}30`
            }}
          >
            <Icon sx={{ color: 'white', fontSize: 24 }} />
          </Box>
          <Box>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 'bold',
                background: `linear-gradient(135deg, ${color} 0%, ${color}CC 100%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 0.5
              }}
            >
              {title}
            </Typography>
            <Typography 
              variant="subtitle2" 
              sx={{ 
                color: 'text.secondary',
                fontWeight: 'medium'
              }}
            >
              {subtitle}
            </Typography>
          </Box>
        </Box>
        
        <Chip
          icon={<TrendingUpIcon />}
          label="Active"
          size="small"
          sx={{
            background: `linear-gradient(135deg, ${color}20 0%, ${color}10 100%)`,
            color: color,
            fontWeight: 'medium',
            border: `1px solid ${color}20`
          }}
        />
      </Box>

      <CardContent sx={{ p: 3 }}>
        {children}
      </CardContent>
    </Card>
  </Grow>
);

export default function HomePage() {
  return (
    <Page>
      <Container maxWidth="xl" sx={{ py: 4 }}>        <Fade in={true} timeout={800}>
          <Box>
            {/* Main Content */}
            <Grow in={true} timeout={1000}>
              <Box>
                <InvoiceList />
              </Box>
            </Grow>
          </Box>
        </Fade>
      </Container>
    </Page>
  );
}
