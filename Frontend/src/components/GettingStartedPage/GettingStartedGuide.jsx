// src/components/GettingStartedPage/GettingStartedGuide.jsx
import React, { useState } from 'react';
import {
  Typography,
  Box,
  Paper,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
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
    <Box sx={{ p: { xs: 2.5, md: 3.5 } }}>
      <Box>
        {/* Header Section */}
        <Box
          sx={{
            textAlign: 'center',
            mb: { xs: 4, md: 5 },
            p: { xs: 4, md: 5 },
            borderRadius: '20px',
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(124, 58, 237, 0.08) 100%)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(139, 92, 246, 0.1)',
            boxShadow: '0 4px 24px rgba(139, 92, 246, 0.08)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'radial-gradient(circle at top center, rgba(139, 92, 246, 0.05) 0%, transparent 70%)',
              pointerEvents: 'none'
            }
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Box
              sx={{
                width: { xs: 72, md: 80 },
                height: { xs: 72, md: 80 },
                mx: 'auto',
                mb: 3,
                borderRadius: '18px',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(139, 92, 246, 0.25)'
              }}
            >
              <RocketIcon sx={{ fontSize: { xs: 40, md: 48 }, color: 'white' }} />
            </Box>
            <Typography
              variant="h3"
              component="h1"
              sx={{
                fontWeight: 700,
                letterSpacing: '-0.025em',
                mb: 2,
                fontSize: { xs: '2rem', sm: '2.5rem', md: '2.75rem' },
                color: 'rgba(15, 23, 42, 0.95)',
                lineHeight: 1.2
              }}
            >
              Getting Started
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: 'rgba(15, 23, 42, 0.6)',
                maxWidth: 600,
                mx: 'auto',
                fontWeight: 400,
                fontSize: { xs: '1rem', sm: '1.0625rem', md: '1.125rem' },
                lineHeight: 1.6
              }}
            >
              Follow these simple steps to set up your invoicing system and create your first professional invoice
            </Typography>
          </Box>
        </Box>

        {/* Progress Overview */}
        <Card
          sx={{
            mb: 4,
            borderRadius: '18px',
            border: '1px solid rgba(15, 23, 42, 0.08)',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.06)'
          }}
        >
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 2 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(124, 58, 237, 0.1) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <InfoIcon sx={{ color: '#8b5cf6', fontSize: 20 }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 600, letterSpacing: '-0.015em', color: 'rgba(15, 23, 42, 0.95)', fontSize: '1.0625rem' }}>
                Your Progress
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: 'rgba(15, 23, 42, 0.5)', mb: 2.5, ml: 6, fontSize: '0.875rem', fontWeight: 500 }}>
              Step {activeStep + 1} of {steps.length}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mt: 3 }}>
              {steps.map((step, index) => (
                <Chip
                  key={index}
                  label={`${index + 1}. ${step.label}`}
                  sx={{
                    height: '34px',
                    borderRadius: '10px',
                    backgroundColor: index <= activeStep ? 'rgba(139, 92, 246, 0.08)' : 'rgba(15, 23, 42, 0.03)',
                    color: index <= activeStep ? '#8b5cf6' : 'rgba(15, 23, 42, 0.45)',
                    fontWeight: index <= activeStep ? 600 : 500,
                    fontSize: '0.8125rem',
                    border: index <= activeStep ? '1px solid rgba(139, 92, 246, 0.2)' : '1px solid rgba(15, 23, 42, 0.08)',
                    transition: 'all 0.2s ease',
                    letterSpacing: '-0.01em',
                    '&:hover': {
                      backgroundColor: index <= activeStep ? 'rgba(139, 92, 246, 0.12)' : 'rgba(15, 23, 42, 0.05)',
                      transform: 'translateY(-1px)'
                    },
                    '& .MuiChip-label': {
                      px: 2
                    }
                  }}
                />
              ))}
            </Box>
          </CardContent>
        </Card>

          {/* Stepper */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 4.5 },
              borderRadius: '18px',
              border: '1px solid rgba(15, 23, 42, 0.08)',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              boxShadow: '0 2px 8px rgba(15, 23, 42, 0.06)'
            }}
          >
            <Stepper activeStep={activeStep} orientation="vertical">
              {steps.map((step, index) => (
                <Step key={step.label}>
                  <StepLabel
                    StepIconComponent={() => (
                      <Box
                        sx={{
                          width: 56,
                          height: 56,
                          borderRadius: '16px',
                          background:
                            index <= activeStep
                              ? `linear-gradient(135deg, ${step.color} 0%, ${step.color}dd 100%)`
                              : 'rgba(15, 23, 42, 0.04)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: index <= activeStep ? 'white' : 'rgba(15, 23, 42, 0.3)',
                          border: index <= activeStep ? 'none' : '1.5px solid rgba(15, 23, 42, 0.1)',
                          boxShadow: index <= activeStep ? `0 4px 16px ${step.color}25` : '0 2px 8px rgba(15, 23, 42, 0.04)',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          '&:hover': {
                            transform: index <= activeStep ? 'scale(1.05)' : 'none',
                            boxShadow: index <= activeStep ? `0 6px 20px ${step.color}30` : '0 2px 8px rgba(15, 23, 42, 0.04)'
                          }
                        }}
                      >
                        {index < activeStep ? <CheckIcon sx={{ fontSize: 28 }} /> : step.icon}
                      </Box>
                    )}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        letterSpacing: '-0.02em',
                        color: index <= activeStep ? step.color : 'rgba(15, 23, 42, 0.4)',
                        fontSize: { xs: '1.0625rem', sm: '1.25rem' },
                        transition: 'color 0.3s ease',
                        lineHeight: 1.3
                      }}
                    >
                      {step.label}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'rgba(15, 23, 42, 0.5)',
                        mt: 0.5,
                        fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                        lineHeight: 1.5,
                        fontWeight: 400
                      }}
                    >
                      {step.description}
                    </Typography>
                  </StepLabel>
                  <StepContent>
                    <Box sx={{ mb: 2, mt: 2 }}>
                      {/* Detailed Steps */}
                      <List sx={{ mb: 3.5 }}>
                        {step.details.map((detail, detailIndex) => (
                          <ListItem
                            key={detailIndex}
                            sx={{
                              flexDirection: 'column',
                              alignItems: 'flex-start',
                              px: 0,
                              py: 2.5,
                              borderLeft: `2.5px solid ${step.color}`,
                              pl: 3,
                              mb: 2,
                              backgroundColor: `${step.color}04`,
                              borderRadius: '14px',
                              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                              '&:hover': {
                                backgroundColor: `${step.color}08`,
                                transform: 'translateX(3px)',
                                boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)'
                              }
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5, width: '100%' }}>
                              <Box
                                sx={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: '9px',
                                  backgroundColor: step.color,
                                  color: 'white',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontWeight: 600,
                                  fontSize: '0.875rem',
                                  flexShrink: 0,
                                  boxShadow: `0 2px 8px ${step.color}30`
                                }}
                              >
                                {detailIndex + 1}
                              </Box>
                              <Typography
                                variant="subtitle1"
                                sx={{
                                  fontWeight: 600,
                                  letterSpacing: '-0.015em',
                                  color: 'rgba(15, 23, 42, 0.95)',
                                  fontSize: { xs: '0.9375rem', sm: '1rem' },
                                  lineHeight: 1.4
                                }}
                              >
                                {detail.title}
                              </Typography>
                            </Box>
                            <Typography
                              variant="body2"
                              sx={{
                                color: 'rgba(15, 23, 42, 0.6)',
                                lineHeight: 1.65,
                                ml: 6,
                                fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                                fontWeight: 400
                              }}
                            >
                              {detail.text}
                            </Typography>
                            {detail.action && (
                              <Button
                                size="small"
                                endIcon={<ArrowIcon sx={{ fontSize: 16 }} />}
                                onClick={() => handleNavigate(detail.action)}
                                sx={{
                                  ml: 6,
                                  mt: 1.5,
                                  textTransform: 'none',
                                  color: step.color,
                                  fontWeight: 600,
                                  fontSize: '0.875rem',
                                  px: 2.5,
                                  py: 1,
                                  borderRadius: '10px',
                                  backgroundColor: `${step.color}08`,
                                  border: `1.5px solid ${step.color}20`,
                                  letterSpacing: '-0.01em',
                                  '&:hover': {
                                    backgroundColor: `${step.color}15`,
                                    borderColor: `${step.color}35`,
                                    transform: 'translateY(-1px)',
                                    boxShadow: `0 2px 8px ${step.color}15`
                                  },
                                  transition: 'all 0.2s ease'
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
                          icon={<InfoIcon sx={{ fontSize: 20 }} />}
                          sx={{
                            backgroundColor: `${step.color}05`,
                            border: `1.5px solid ${step.color}15`,
                            borderRadius: '14px',
                            py: 2,
                            px: 2.5,
                            '& .MuiAlert-icon': {
                              color: step.color,
                              opacity: 0.9
                            },
                            '& .MuiAlert-message': {
                              width: '100%'
                            }
                          }}
                        >
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, fontSize: '0.9375rem', color: 'rgba(15, 23, 42, 0.9)', letterSpacing: '-0.01em' }}>
                            💡 Pro Tips
                          </Typography>
                          <List dense sx={{ m: 0, p: 0 }}>
                            {step.tips.map((tip, tipIndex) => (
                              <ListItem key={tipIndex} sx={{ px: 0, py: 0.75, display: 'list-item', ml: 3 }}>
                                <Typography variant="body2" sx={{ fontSize: '0.875rem', color: 'rgba(15, 23, 42, 0.65)', lineHeight: 1.65, fontWeight: 400 }}>
                                  {tip}
                                </Typography>
                              </ListItem>
                            ))}
                          </List>
                        </Alert>
                      )}
                    </Box>

                    {/* Navigation Buttons */}
                    <Box sx={{ mb: 2, mt: 4, display: 'flex', gap: 2 }}>
                      <Button
                        variant="contained"
                        onClick={handleNext}
                        sx={{
                          background: `linear-gradient(135deg, ${step.color} 0%, ${step.color}dd 100%)`,
                          textTransform: 'none',
                          fontWeight: 600,
                          fontSize: '0.9375rem',
                          px: 4,
                          py: 1.75,
                          borderRadius: '12px',
                          boxShadow: `0 4px 14px ${step.color}25`,
                          letterSpacing: '-0.015em',
                          '&:hover': {
                            background: `linear-gradient(135deg, ${step.color}dd 0%, ${step.color}bb 100%)`,
                            boxShadow: `0 6px 18px ${step.color}35`,
                            transform: 'translateY(-2px)'
                          },
                          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                      >
                        {index === steps.length - 1 ? 'Finish' : 'Continue'}
                      </Button>
                      <Button
                        disabled={index === 0}
                        onClick={handleBack}
                        sx={{
                          textTransform: 'none',
                          fontWeight: 500,
                          fontSize: '0.9375rem',
                          borderRadius: '12px',
                          px: 3.5,
                          py: 1.75,
                          color: 'rgba(15, 23, 42, 0.55)',
                          letterSpacing: '-0.01em',
                          '&:hover': {
                            backgroundColor: 'rgba(15, 23, 42, 0.05)'
                          },
                          '&:disabled': {
                            color: 'rgba(15, 23, 42, 0.25)'
                          }
                        }}
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
              <Box
                sx={{
                  p: { xs: 4, md: 6 },
                  textAlign: 'center',
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(5, 150, 105, 0.08) 100%)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  borderRadius: '20px',
                  border: '1.5px solid rgba(16, 185, 129, 0.15)',
                  boxShadow: '0 8px 32px rgba(16, 185, 129, 0.15)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'radial-gradient(circle at top center, rgba(16, 185, 129, 0.05) 0%, transparent 60%)',
                    pointerEvents: 'none'
                  }
                }}
              >
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                  <Box
                    sx={{
                      width: { xs: 80, md: 96 },
                      height: { xs: 80, md: 96 },
                      mx: 'auto',
                      mb: 3,
                      borderRadius: '24px',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)'
                    }}
                  >
                    <CheckIcon sx={{ fontSize: { xs: 48, md: 56 }, color: 'white' }} />
                  </Box>
                  <Typography variant="h3" sx={{ fontWeight: 700, letterSpacing: '-0.025em', mb: 2, fontSize: { xs: '2rem', md: '2.5rem' }, color: '#10b981', lineHeight: 1.2 }}>
                    Congratulations! 🎉
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 4.5, color: 'rgba(15, 23, 42, 0.6)', fontWeight: 400, fontSize: { xs: '1rem', md: '1.125rem' }, maxWidth: 500, mx: 'auto', lineHeight: 1.65 }}>
                    You've completed the setup! You're now ready to manage your invoices like a pro.
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2.5, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Button
                      variant="contained"
                      onClick={() => navigate('/invoices/create')}
                      sx={{
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        color: 'white',
                        textTransform: 'none',
                        fontWeight: 600,
                        fontSize: '0.9375rem',
                        px: 4.5,
                        py: 2,
                        borderRadius: '12px',
                        boxShadow: '0 4px 14px rgba(16, 185, 129, 0.25)',
                        letterSpacing: '-0.015em',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                          boxShadow: '0 6px 18px rgba(16, 185, 129, 0.35)',
                          transform: 'translateY(-2px)'
                        },
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                    >
                      Create Your First Invoice
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={handleReset}
                      sx={{
                        borderColor: 'rgba(16, 185, 129, 0.3)',
                        color: '#10b981',
                        textTransform: 'none',
                        fontWeight: 600,
                        fontSize: '0.9375rem',
                        px: 4,
                        py: 2,
                        borderRadius: '12px',
                        borderWidth: '1.5px',
                        letterSpacing: '-0.015em',
                        '&:hover': {
                          borderColor: 'rgba(16, 185, 129, 0.5)',
                          backgroundColor: 'rgba(16, 185, 129, 0.05)',
                          borderWidth: '1.5px',
                          transform: 'translateY(-2px)'
                        },
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                    >
                      Review Steps Again
                    </Button>
                  </Box>
                </Box>
              </Box>
            )}
          </Paper>
        </Box>
      </Box>
    );
}
