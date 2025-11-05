// src/components/GettingStartedPage/GettingStartedGuide.jsx
import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  Fade,
  Grow,
  Card,
  CardContent,
  List,
  ListItem,
  Chip,
  Alert
} from '@mui/material';
import {
  RocketLaunch as RocketIcon,
  Settings as SettingsIcon,
  Category as CategoryIcon,
  Inventory as ProductIcon,
  Description as TemplateIcon,
  People as ClientIcon,
  Receipt as InvoiceIcon,
  CheckCircle as CheckIcon,
  ArrowForward as ArrowIcon,
  Info as InfoIcon,
  Business as BusinessIcon,
  AttachMoney as MoneyIcon,
  Image as ImageIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const steps = [
  {
    label: 'Complete System Setup',
    icon: <SettingsIcon sx={{ fontSize: 28 }} />,
    color: '#6366f1',
    description: 'Configure your business information and preferences',
    details: [
      {
        title: 'Go to Settings Page',
        text: 'Click "Settings" in the left sidebar menu.',
        action: '/settings'
      },
      {
        title: 'Fill Company Information',
        text: 'Enter your business name, address, phone number, email, website, and tax ID. This information will appear on all your invoices.',
        icon: <BusinessIcon sx={{ color: '#6366f1' }} />
      },
      {
        title: 'Upload Company Logo',
        text: 'Click "Upload Logo" button to add your business logo. Recommended size: 200x60 pixels, PNG or JPG format. Your logo will appear on all invoice templates.',
        icon: <ImageIcon sx={{ color: '#6366f1' }} />
      },
      {
        title: 'Select Currency & Language',
        text: 'Choose your preferred currency (USD, EUR, GBP, etc.) and language for the interface. Currency affects all invoices.',
        icon: <MoneyIcon sx={{ color: '#6366f1' }} />
      },
      {
        title: 'Set Invoice Defaults (Optional)',
        text: 'Configure invoice number prefix, starting number, and default payment terms to save time later.',
        icon: <InvoiceIcon sx={{ color: '#6366f1' }} />
      }
    ],
    tips: [
      'Complete this step before creating your first invoice',
      'Your company info becomes the "Bill From" section on invoices',
      'You can update this information anytime'
    ]
  },
  {
    label: 'Create Product Categories',
    icon: <CategoryIcon sx={{ fontSize: 28 }} />,
    color: '#f59e0b',
    description: 'Organize your products and services into categories',
    details: [
      {
        title: 'Navigate to Products Page',
        text: 'Click "Products" in the sidebar menu.',
        action: '/products'
      },
      {
        title: 'Switch to Categories Tab',
        text: 'Click on the "Categories" tab at the top of the page (second tab).',
        icon: <CategoryIcon sx={{ color: '#f59e0b' }} />
      },
      {
        title: 'Create Your First Category',
        text: 'Click "Add Category" button. Enter a category name (e.g., "Consulting Services", "Software Products", "Monthly Plans") and save.',
        icon: <AddIcon sx={{ color: '#f59e0b' }} />
      },
      {
        title: 'Add More Categories',
        text: 'Create additional categories to organize different types of products or services you offer.',
        icon: <CategoryIcon sx={{ color: '#f59e0b' }} />
      }
    ],
    tips: [
      'Free plan users have a limited number of categories',
      'Use clear names like "Consulting", "Products", "Subscriptions"',
      'Categories make it easier to find products when creating invoices'
    ]
  },
  {
    label: 'Add Products/Services',
    icon: <ProductIcon sx={{ fontSize: 28 }} />,
    color: '#10b981',
    description: 'Build your product catalog for quick invoice creation',
    details: [
      {
        title: 'Go to Products Tab',
        text: 'On the Products page, make sure you\'re on the "Products & Services" tab (first tab).',
        action: '/products'
      },
      {
        title: 'Click Add Product',
        text: 'Click the green "Add Product" button in the top-right corner.',
        icon: <AddIcon sx={{ color: '#10b981' }} />
      },
      {
        title: 'Fill Product Details',
        text: 'Enter product/service name, description, price, and select the category you created. Add SKU code if needed.',
        icon: <EditIcon sx={{ color: '#10b981' }} />
      },
      {
        title: 'Enable Inventory Tracking (Optional)',
        text: 'Toggle "Track Inventory" if this is a physical product. Set stock quantity and low stock alert level.',
        icon: <ProductIcon sx={{ color: '#10b981' }} />
      },
      {
        title: 'Save and Repeat',
        text: 'Click Save. Add more products to build your catalog. You can always add more later.',
        icon: <CheckIcon sx={{ color: '#10b981' }} />
      }
    ],
    tips: [
      'Add your most frequently used items first',
      'Prices can be changed anytime without affecting old invoices',
      'Good descriptions help you identify items quickly',
      'Free plan users have a product limit - upgrade for unlimited products'
    ]
  },
  {
    label: 'Customize Invoice Templates',
    icon: <TemplateIcon sx={{ fontSize: 28 }} />,
    color: '#14b8a6',
    description: 'Create professional-looking invoice templates',
    details: [
      {
        title: 'Navigate to Templates',
        text: 'Click "Templates" in the sidebar menu.',
        action: '/templates'
      },
      {
        title: 'Select Document Type',
        text: 'Choose the document type from the dropdown (Invoice, Quote, etc.). Each type can have its own template.',
        icon: <TemplateIcon sx={{ color: '#14b8a6' }} />
      },
      {
        title: 'Create New Template (Optional)',
        text: 'Click "Add Template" to create a custom design. Choose colors, layout, and styling that match your brand.',
        icon: <AddIcon sx={{ color: '#14b8a6' }} />
      },
      {
        title: 'Set Active Template',
        text: 'Click the star icon next to a template to make it active. This becomes your default template for that document type.',
        icon: <CheckIcon sx={{ color: '#14b8a6' }} />
      }
    ],
    tips: [
      'Your company logo (from Settings) appears on all templates',
      'You can create multiple templates and switch between them',
      'Preview templates before setting them as active',
      'One template per document type can be active at a time'
    ]
  },
  {
    label: 'Add Your First Client',
    icon: <ClientIcon sx={{ fontSize: 28 }} />,
    color: '#06b6d4',
    description: 'Create client records for easy invoicing',
    details: [
      {
        title: 'Go to Clients Page',
        text: 'Click "Clients" in the sidebar menu.',
        action: '/clients'
      },
      {
        title: 'Click Add Client',
        text: 'Click the "Add Client" button in the top-right corner.',
        icon: <AddIcon sx={{ color: '#06b6d4' }} />
      },
      {
        title: 'Enter Client Information',
        text: 'Fill in client name (required), email (required), phone number, address, and optionally Tax ID for business clients.',
        icon: <EditIcon sx={{ color: '#06b6d4' }} />
      },
      {
        title: 'Save Client',
        text: 'Click Save to add the client to your database. Repeat for all your clients.',
        icon: <CheckIcon sx={{ color: '#06b6d4' }} />
      }
    ],
    tips: [
      'Email is required for sending invoices',
      'Client information auto-fills when creating invoices',
      'You can add clients on-the-fly while creating invoices',
      'Use the search feature to find clients quickly'
    ]
  },
  {
    label: 'Create Your First Invoice',
    icon: <InvoiceIcon sx={{ fontSize: 28 }} />,
    color: '#8b5cf6',
    description: 'Put it all together and create a professional invoice',
    details: [
      {
        title: 'Navigate to Create Invoice',
        text: 'Click "Create Invoice" in the sidebar menu.',
        action: '/invoices/create'
      },
      {
        title: 'Select Client',
        text: 'Choose a client from the dropdown. Their information (name, email, address) will auto-populate on the invoice.',
        icon: <ClientIcon sx={{ color: '#8b5cf6' }} />
      },
      {
        title: 'Choose Document Type & Template',
        text: 'Select document type (Invoice, Quote, etc.) and your preferred template. The preview shows how it will look.',
        icon: <TemplateIcon sx={{ color: '#8b5cf6' }} />
      },
      {
        title: 'Add Products/Services',
        text: 'Click "Add Item" and select products from your catalog, or enter custom items. Quantity and prices can be adjusted.',
        icon: <ProductIcon sx={{ color: '#8b5cf6' }} />
      },
      {
        title: 'Set Dates and Terms',
        text: 'Set issue date and due date. The invoice number is auto-generated. Set status to "Draft" while working or "Sent" when ready.',
        icon: <InvoiceIcon sx={{ color: '#8b5cf6' }} />
      },
      {
        title: 'Add Notes (Optional)',
        text: 'Include payment instructions, terms & conditions, or special notes in the notes field.',
        icon: <EditIcon sx={{ color: '#8b5cf6' }} />
      },
      {
        title: 'Save & Download',
        text: 'Click "Save" to store the invoice. Use the preview section to download as PDF and send to your client.',
        icon: <DownloadIcon sx={{ color: '#8b5cf6' }} />
      }
    ],
    tips: [
      'Start with "Draft" status and change to "Sent" after sending',
      'All invoice data saves automatically as you work',
      'You can edit invoices anytime by clicking on them in the Home page',
      'Use "Duplicate" feature for recurring invoices',
      'Track invoice status: Draft → Sent → Paid → Overdue'
    ]
  }
];

export default function GettingStartedGuide() {
  const [activeStep, setActiveStep] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  const handleNavigate = (path) => {
    if (path) {
      navigate(path);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 }, px: { xs: 2, md: 3 } }}>
      <Fade in={true} timeout={800}>
        <Box>
          {/* Header Section */}
          <Box
            sx={{
              textAlign: 'center',
              mb: { xs: 4, md: 6 },
              p: { xs: 3, md: 4 },
              borderRadius: 4,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              boxShadow: '0 10px 40px rgba(102, 126, 234, 0.3)'
            }}
          >
            <RocketIcon sx={{ fontSize: { xs: 48, md: 64 }, mb: 2 }} />
            <Typography
              variant="h3"
              component="h1"
              sx={{
                fontWeight: 'bold',
                mb: 2,
                fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' }
              }}
            >
              Getting Started Guide
            </Typography>
            <Typography
              variant="h6"
              sx={{
                opacity: 0.95,
                maxWidth: 800,
                mx: 'auto',
                fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' }
              }}
            >
              Follow these simple steps to set up your invoicing system and create your first professional invoice
            </Typography>
          </Box>

          {/* Progress Overview */}
          <Grow in={true} timeout={1000}>
            <Card
              sx={{
                mb: 4,
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)'
              }}
            >
              <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
                  <InfoIcon sx={{ color: '#667eea', fontSize: 28 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#334155' }}>
                    Your Progress
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Step {activeStep + 1} of {steps.length}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {steps.map((step, index) => (
                    <Chip
                      key={index}
                      label={`${index + 1}. ${step.label}`}
                      color={index <= activeStep ? 'primary' : 'default'}
                      variant={index === activeStep ? 'filled' : 'outlined'}
                      sx={{
                        fontWeight: index === activeStep ? 600 : 400,
                        fontSize: { xs: '0.75rem', sm: '0.875rem' }
                      }}
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grow>

          {/* Stepper */}
          <Paper
            elevation={3}
            sx={{
              p: { xs: 2, md: 4 },
              borderRadius: 4,
              background: '#ffffff'
            }}
          >
            <Stepper activeStep={activeStep} orientation="vertical">
              {steps.map((step, index) => (
                <Step key={step.label}>
                  <StepLabel
                    StepIconComponent={() => (
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: '50%',
                          background:
                            index <= activeStep
                              ? `linear-gradient(135deg, ${step.color} 0%, ${step.color}dd 100%)`
                              : '#e2e8f0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          boxShadow: index === activeStep ? `0 4px 12px ${step.color}40` : 'none',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        {index < activeStep ? <CheckIcon /> : step.icon}
                      </Box>
                    )}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        color: index <= activeStep ? step.color : '#94a3b8',
                        fontSize: { xs: '1rem', sm: '1.25rem' }
                      }}
                    >
                      {step.label}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'text.secondary',
                        mt: 0.5,
                        fontSize: { xs: '0.875rem', sm: '1rem' }
                      }}
                    >
                      {step.description}
                    </Typography>
                  </StepLabel>
                  <StepContent>
                    <Box sx={{ mb: 2 }}>
                      {/* Detailed Steps */}
                      <List sx={{ mb: 3 }}>
                        {step.details.map((detail, detailIndex) => (
                          <ListItem
                            key={detailIndex}
                            sx={{
                              flexDirection: 'column',
                              alignItems: 'flex-start',
                              px: 0,
                              py: 2,
                              borderLeft: `3px solid ${step.color}30`,
                              pl: 2,
                              mb: 1,
                              backgroundColor: `${step.color}08`,
                              borderRadius: 2
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1, width: '100%' }}>
                              <Box
                                sx={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: '50%',
                                  backgroundColor: step.color,
                                  color: 'white',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontWeight: 'bold',
                                  fontSize: '0.875rem',
                                  flexShrink: 0
                                }}
                              >
                                {detailIndex + 1}
                              </Box>
                              <Typography
                                variant="subtitle1"
                                sx={{
                                  fontWeight: 600,
                                  color: '#1e293b',
                                  fontSize: { xs: '0.95rem', sm: '1.05rem' }
                                }}
                              >
                                {detail.title}
                              </Typography>
                            </Box>
                            <Typography
                              variant="body2"
                              sx={{
                                color: 'text.secondary',
                                lineHeight: 1.7,
                                ml: 5,
                                fontSize: { xs: '0.875rem', sm: '0.95rem' }
                              }}
                            >
                              {detail.text}
                            </Typography>
                            {detail.action && (
                              <Button
                                size="small"
                                endIcon={<ArrowIcon />}
                                onClick={() => handleNavigate(detail.action)}
                                sx={{
                                  ml: 5,
                                  mt: 1,
                                  textTransform: 'none',
                                  color: step.color,
                                  fontWeight: 600
                                }}
                              >
                                Go to page
                              </Button>
                            )}
                          </ListItem>
                        ))}
                      </List>

                      {/* Tips Section */}
                      {step.tips && step.tips.length > 0 && (
                        <Alert
                          severity="info"
                          icon={<InfoIcon />}
                          sx={{
                            backgroundColor: `${step.color}10`,
                            border: `1px solid ${step.color}30`,
                            borderRadius: 2,
                            '& .MuiAlert-icon': {
                              color: step.color
                            }
                          }}
                        >
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                            💡 Pro Tips:
                          </Typography>
                          <List dense sx={{ m: 0, p: 0 }}>
                            {step.tips.map((tip, tipIndex) => (
                              <ListItem key={tipIndex} sx={{ px: 0, py: 0.5, display: 'list-item', ml: 2 }}>
                                <Typography variant="body2" sx={{ fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}>
                                  {tip}
                                </Typography>
                              </ListItem>
                            ))}
                          </List>
                        </Alert>
                      )}
                    </Box>

                    {/* Navigation Buttons */}
                    <Box sx={{ mb: 2, mt: 3 }}>
                      <Button
                        variant="contained"
                        onClick={handleNext}
                        sx={{
                          mr: 1,
                          background: `linear-gradient(135deg, ${step.color} 0%, ${step.color}dd 100%)`,
                          textTransform: 'none',
                          fontWeight: 600,
                          px: 3,
                          py: 1,
                          '&:hover': {
                            background: `linear-gradient(135deg, ${step.color}dd 0%, ${step.color}bb 100%)`
                          }
                        }}
                      >
                        {index === steps.length - 1 ? 'Finish' : 'Continue'}
                      </Button>
                      <Button
                        disabled={index === 0}
                        onClick={handleBack}
                        sx={{ textTransform: 'none' }}
                      >
                        Back
                      </Button>
                    </Box>
                  </StepContent>
                </Step>
              ))}
            </Stepper>

            {/* Completion Message */}
            {activeStep === steps.length && (
              <Fade in={true} timeout={800}>
                <Box
                  sx={{
                    p: 4,
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    borderRadius: 3,
                    color: 'white'
                  }}
                >
                  <CheckIcon sx={{ fontSize: 72, mb: 2 }} />
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>
                    Congratulations! 🎉
                  </Typography>
                  <Typography variant="h6" sx={{ mb: 3, opacity: 0.95 }}>
                    You've completed the setup! You're now ready to manage your invoices like a pro.
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Button
                      variant="contained"
                      onClick={() => navigate('/invoices/create')}
                      sx={{
                        backgroundColor: 'white',
                        color: '#10b981',
                        textTransform: 'none',
                        fontWeight: 600,
                        px: 3,
                        py: 1.5,
                        '&:hover': {
                          backgroundColor: '#f0fdf4'
                        }
                      }}
                    >
                      Create Your First Invoice
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={handleReset}
                      sx={{
                        borderColor: 'white',
                        color: 'white',
                        textTransform: 'none',
                        fontWeight: 600,
                        px: 3,
                        py: 1.5,
                        '&:hover': {
                          borderColor: 'white',
                          backgroundColor: 'rgba(255, 255, 255, 0.1)'
                        }
                      }}
                    >
                      Review Steps Again
                    </Button>
                  </Box>
                </Box>
              </Fade>
            )}
          </Paper>
        </Box>
      </Fade>
    </Container>
  );
}
