// src/components/SystemSetupPage/CompanyProfileSettings.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  Grid,
  TextField,
  Typography,
  Button,
  Alert,
  Snackbar,
  Avatar,
  Chip,
  Divider,
  Tabs,
  Tab,
  Paper,
  Stack,
  Zoom,
  Fade,
  Grow,
  LinearProgress,
  CircularProgress,
  Backdrop,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Business as BusinessIcon,
  AccountBalance as BankIcon,
  CloudUpload as UploadIcon,
  Save as SaveIcon,
  PhotoCamera as CameraIcon,
  CheckCircle as CheckIcon,
  ErrorOutline as ErrorIcon,
  Info as InfoIcon,
  VerifiedUser as VerifiedIcon,
  Language as WebIcon,
  Email as EmailIcon,
  LocationOn as AddressIcon,
  Phone as PhoneIcon,
  CreditCard as CardIcon,
  AccountBalanceWallet as WalletIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { getSystemSetup, updateSystemSetup } from "./api";
import PageHelper from "../ReusableComponents/PageHelper";
import { pageHelpContent } from "../../config/pageHelpContent";

const CompanyProfileSettings = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [companyInfo, setCompanyInfo] = useState({
    name: "",
    companyNo: "",
    vatNo: "",
    ticNo: "",
    website: "",
    email: "",
    logo: "",
    address: "",
  });
  const [logoMimeType, setLogoMimeType] = useState("");
  const [bankInfo, setBankInfo] = useState({
    bankName: "",
    accountName: "",
    accountNo: "",
    swift: "",
    iban: "",
  });
  const [ibanError, setIbanError] = useState("");
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",  });
  
  // Enhanced state for improved UX
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  const [formProgress, setFormProgress] = useState(0);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getSystemSetup();
        if (data) {
          setCompanyInfo({
            name: data.name || "",
            companyNo: data.companyNo || "",
            vatNo: data.vatNo || "",
            ticNo: data.ticNo || "",
            website: data.website || "",
            email: data.email || "",
            logo: data.logo || "",
            address: data.address || "",
          });
          setLogoMimeType(data.logoMimeType || "");
          setBankInfo({
            bankName: data.bankName || "",
            accountName: data.accountName || "",
            accountNo: data.accountNo || "",
            swift: data.swift || "",
            iban: data.iban || "",
          });
            // Set logo preview if exists
          if (data.logo) {
            const mimeType = data.logoMimeType || 'image/png'; // Default to PNG if MIME type is missing
            setLogoPreview(`data:${mimeType};base64,${data.logo}`);
            console.log('Logo loaded:', { 
              hasLogo: !!data.logo, 
              logoMimeType: data.logoMimeType, 
              usedMimeType: mimeType,
              logoLength: data.logo?.length 
            });
          } else {
            console.log('No logo data found in API response');
          }
        }
      } catch (error) {
        console.error("Failed to fetch system setup:", error);
        showNotification("Failed to load settings", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  // Calculate form completion progress
  useEffect(() => {
    const totalFields = 12; // Total form fields
    const filledFields = [
      companyInfo.name,
      companyInfo.companyNo,
      companyInfo.vatNo,
      companyInfo.ticNo,        // Added missing field
      companyInfo.website,      // Added missing field
      companyInfo.email,
      companyInfo.address,
      bankInfo.bankName,
      bankInfo.accountName,
      bankInfo.accountNo,
      bankInfo.swift,
      bankInfo.iban
    ].filter(field => field && field.trim() !== "").length;
    
    setFormProgress((filledFields / totalFields) * 100);
  }, [companyInfo, bankInfo]);
  const showNotification = (message, severity = "success") => {
    setNotification({
      open: true,
      message,
      severity,
    });
  };

  const handleCompanyInfoChange = (e) => {
    const { name, value } = e.target;
    setCompanyInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
    setHasUnsavedChanges(true);
  };

  const handleBankInfoChange = (e) => {
    const { name, value } = e.target;
    setBankInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
    setIbanError(""); // Clear IBAN error on change
    setHasUnsavedChanges(true);
  };
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const refreshLogoPreview = () => {
    console.log('Refreshing logo preview...');
    if (companyInfo.logo) {
      const mimeType = logoMimeType || 'image/png';
      const newPreview = `data:${mimeType};base64,${companyInfo.logo}`;
      setLogoPreview(newPreview);
      console.log('Logo preview refreshed:', { mimeType, hasPreview: !!newPreview });
      showNotification('Logo preview refreshed', 'info');
    } else {
      console.log('No logo data to refresh');
      showNotification('No logo data found', 'warning');
    }
  };
  
  const handleLogoFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        // 2MB size limit
        showNotification("File size must be less than 2MB", "error");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const base64String = event.target.result.split(",")[1]; // Remove the data URL prefix
        setCompanyInfo((prev) => ({
          ...prev,
          logo: base64String,
        }));
        setLogoMimeType(file.type); // Set MIME type
        setLogoPreview(event.target.result); // Set preview
        setHasUnsavedChanges(true);
      };
      reader.readAsDataURL(file);
    }
  };
  const validateIban = (iban) => {
    if (!iban) return ""; // IBAN is now optional

    const cleanedIban = iban.replace(/\s/g, ""); // Remove spaces

    if (cleanedIban.length !== 28) {
      return "IBAN must be 28 characters long.";
    }
    if (!cleanedIban.startsWith("CY")) {
      return "IBAN must start with CY.";
    }
    if (!/^\d{2}$/.test(cleanedIban.substring(2, 4))) {
      return "Invalid check digits.";
    }
    // Bank code can be alphanumeric, but example shows digits. Assuming alphanumeric for flexibility.
    if (!/^[a-zA-Z0-9]{3}$/.test(cleanedIban.substring(4, 7))) {
      return "Invalid bank code.";
    }
    if (!/^\d{5}$/.test(cleanedIban.substring(7, 12))) {
      return "Invalid branch code.";
    }
    // Account number can be alphanumeric, but example shows digits. Assuming alphanumeric.
    if (!/^[a-zA-Z0-9]{16}$/.test(cleanedIban.substring(12, 28))) {
      return "Invalid bank account number.";
    }
    return ""; // No error
  };
  const handleSave = async () => {
    const ibanValidationError = validateIban(bankInfo.iban);
    if (ibanValidationError) {
      setIbanError(ibanValidationError);
      showNotification(ibanValidationError, "error");
      return;
    }

    const payload = {
      ...companyInfo,
      ...bankInfo,
      logoMimeType: logoMimeType, // Include logoMimeType in the payload
    };

    try {
      setSaving(true);
      const savedData = await updateSystemSetup(payload);
      showNotification("Settings saved successfully!", "success");
      setHasUnsavedChanges(false);
      setCompanyInfo((prev) => ({
        ...prev,
        name: savedData.name || "",
        companyNo: savedData.companyNo || "",
        vatNo: savedData.vatNo || "",
        ticNo: savedData.ticNo || "",
        website: savedData.website || "",
        email: savedData.email || "",
        logo: savedData.logo || "",
        address: savedData.address || "",
      }));
      setLogoMimeType(savedData.logoMimeType || logoMimeType); // Update logoMimeType
      setBankInfo((prev) => ({
        ...prev,
        bankName: savedData.bankName || "",
        accountName: savedData.accountName || "",
        accountNo: savedData.accountNo || "",
        swift: savedData.swift || "",
        iban: savedData.iban || "",
      }));
    } catch (error) {
      showNotification(`Failed to save settings: ${error.message || "Unknown error"}`, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleCloseNotification = () => {
    setNotification((prev) => ({ ...prev, open: false }));
  };
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }
  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        '@keyframes fadeInUp': {
          '0%': { opacity: 0, transform: 'translateY(30px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' }
        },
        '@keyframes slideInLeft': {
          '0%': { opacity: 0, transform: 'translateX(-30px)' },
          '100%': { opacity: 1, transform: 'translateX(0)' }
        },
        '@keyframes slideInRight': {
          '0%': { opacity: 0, transform: 'translateX(30px)' },
          '100%': { opacity: 1, transform: 'translateX(0)' }
        },
        '@keyframes scaleIn': {
          '0%': { opacity: 0, transform: 'scale(0.9)' },
          '100%': { opacity: 1, transform: 'scale(1)' }
        },
        '@keyframes shimmer': {
          '0%': { backgroundPosition: '-200px 0' },
          '100%': { backgroundPosition: 'calc(200px + 100%) 0' }
        },
        '@keyframes pulse': {
          '0%': { boxShadow: '0 0 0 0 rgba(103, 126, 234, 0.7)' },
          '70%': { boxShadow: '0 0 0 10px rgba(103, 126, 234, 0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(103, 126, 234, 0)' }
        }
      }}
    >
      {/* Hero Header */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          gap: { xs: 2, md: 3 },
          mb: { xs: 3, md: 4 },
          p: { xs: 2, md: 3 },
          borderRadius: { xs: 2, md: 3 },
          background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
          border: '1px solid rgba(34, 197, 94, 0.18)',
          boxShadow: '0 4px 12px rgba(34, 197, 94, 0.12)',
          position: 'relative',
          overflow: 'hidden',
          animation: 'fadeInUp 0.6s ease-out',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #6366f1 0%, #4f46e5 100%)',
            borderRadius: '3px 3px 0 0'
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: { xs: '100%', md: 'auto' } }}>
          <Box
            sx={{
              width: { xs: 48, md: 56 },
              height: { xs: 48, md: 56 },
              borderRadius: { xs: '14px', md: '16px' },
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 18px rgba(16, 185, 129, 0.35)',
              animation: 'scaleIn 0.5s ease-out 0.2s both'
            }}
          >
            <BusinessIcon sx={{ color: 'white', fontSize: { xs: 22, md: 26 } }} />
          </Box>
          <Box sx={{ animation: 'slideInLeft 0.6s ease-out 0.1s both', flex: 1 }}>
            <Typography
              variant={isMobile ? "h6" : "h5"}
              component="h1"
              sx={{
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 0.5
              }}
            >
              Company Settings
            </Typography>
            <Typography
              variant={isMobile ? "caption" : "subtitle2"}
              sx={{
                color: 'text.secondary',
                fontWeight: 'medium',
                display: { xs: 'none', sm: 'block' }
              }}
            >
              Configure your business profile and banking details to keep your invoices accurate.
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: { xs: 'flex-start', md: 'flex-end' },
            gap: 1.5,
            width: { xs: '100%', md: 320 },
            animation: 'slideInRight 0.6s ease-out 0.2s both'
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Typography variant={isMobile ? "caption" : "subtitle2"} sx={{ fontWeight: 600, color: '#047857' }}>
              Setup Progress
            </Typography>
            {formProgress === 100 && (
              <Chip
                icon={<CheckIcon />}
                label="Complete"
                size="small"
                sx={{
                  backgroundColor: 'rgba(34, 197, 94, 0.15)',
                  color: '#047857',
                  fontWeight: 600,
                  animation: 'pulse 2s infinite'
                }}
              />
            )}
          </Stack>
          <Box sx={{ width: '100%' }}>
            <LinearProgress
              variant="determinate"
              value={formProgress}
              sx={{
                height: { xs: 6, md: 8 },
                borderRadius: 4,
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                  background: 'linear-gradient(90deg, #059669 0%, #10b981 50%, #22c55e 100%)'
                }
              }}
            />
          </Box>
          <Typography variant={isMobile ? "caption" : "body2"} color="text.secondary">
            {Math.round(formProgress)}% complete{hasUnsavedChanges ? ' • Unsaved changes' : ''}
          </Typography>
        </Box>
      </Box>
      {/* Main Content */}
      <Box sx={{ maxWidth: 1400, mx: 'auto', p: { xs: 1, sm: 2, md: 3 } }}>
        {/* Tab Navigation */}        <Paper
          elevation={0}
          sx={{
            mb: { xs: 2, md: 4 },
            borderRadius: { xs: 2, md: 3 },
            background: 'rgba(255,255,255,0.98)',
            border: '1px solid rgba(0,0,0,0.08)',
            animation: 'fadeInUp 0.6s ease-out 0.3s both'
          }}
        >
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant={isMobile ? "fullWidth" : "standard"}
            sx={{
              '& .MuiTabs-indicator': {
                height: 3,
                background: 'linear-gradient(90deg, #667eea, #764ba2)',
                borderRadius: '3px 3px 0 0'
              }
            }}
          >
            <Tab
              icon={isMobile ? undefined : <BusinessIcon />}
              iconPosition={isMobile ? undefined : "start"}
              label={isMobile ? "Company" : "Company Profile"}
              sx={{
                minHeight: { xs: 56, md: 70 },
                fontWeight: 600,
                textTransform: 'none',
                fontSize: { xs: '0.875rem', md: '1rem' },
                '&.Mui-selected': { color: '#667eea' }
              }}
            />
            <Tab
              icon={isMobile ? undefined : <BankIcon />}
              iconPosition={isMobile ? undefined : "start"}
              label={isMobile ? "Banking" : "Banking Details"}
              sx={{
                minHeight: { xs: 56, md: 70 },
                fontWeight: 600,
                textTransform: 'none',
                fontSize: { xs: '0.875rem', md: '1rem' },
                '&.Mui-selected': { color: '#667eea' }
              }}
            />
          </Tabs>
        </Paper>

        {/* Tab Content */}
        <Fade in={true} timeout={500}>
          <Box>
            {activeTab === 0 && (              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2, sm: 3, md: 4 },
                  borderRadius: { xs: 2, md: 3 },
                  background: 'rgba(255,255,255,0.98)',
                  border: '1px solid rgba(0,0,0,0.08)',
                  animation: 'slideInLeft 0.6s ease-out'
                }}
              >
                {/* Company Profile Tab */}                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: { xs: 3, md: 4 } }}>
                  <BusinessIcon sx={{ color: '#667eea', fontSize: { xs: 24, md: 28 } }} />
                  <Typography variant={isMobile ? "h6" : "h5"} sx={{ fontWeight: 700, color: '#2c3e50' }}>
                    Company Information
                  </Typography>
                </Stack>

                {/* Logo Upload Section */}
                <Box
                  sx={{
                    mb: { xs: 3, md: 4 },
                    p: { xs: 2, md: 3 },
                    border: '2px dashed #e0e0e0',
                    borderRadius: 2,
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, #f8f9fa 0%, #fff 100%)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: '#667eea',
                      background: 'linear-gradient(135deg, #f0f2ff 0%, #fff 100%)'
                    }
                  }}
                >
                  <Stack alignItems="center" spacing={2}>
                    {logoPreview ? (
                      <Box
                        component="img"
                        src={logoPreview}
                        alt="Company Logo"
                        sx={{
                          maxWidth: { xs: 150, md: 200 },
                          maxHeight: { xs: 90, md: 120 },
                          borderRadius: 2,
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                          animation: 'scaleIn 0.5s ease-out'
                        }}
                      />
                    ) : (
                      <Avatar
                        sx={{
                          width: { xs: 64, md: 80 },
                          height: { xs: 64, md: 80 },
                          backgroundColor: '#f5f5f5',
                          border: '2px solid #e0e0e0'
                        }}
                      >
                        <CameraIcon sx={{ fontSize: { xs: 32, md: 40 }, color: '#999' }} />
                      </Avatar>
                    )}
                      <Stack direction={isMobile ? "column" : "row"} spacing={2} alignItems="center" sx={{ width: isMobile ? '100%' : 'auto' }}>
                      <Button
                        variant="outlined"
                        component="label"
                        startIcon={<UploadIcon />}
                        fullWidth={isMobile}
                        sx={{
                          borderRadius: 2,
                          fontWeight: 600,
                          textTransform: 'none',
                          borderColor: '#667eea',
                          color: '#667eea',
                          '&:hover': {
                            backgroundColor: 'rgba(102, 126, 234, 0.05)',
                            borderColor: '#667eea'
                          }
                        }}
                      >
                        {logoPreview ? 'Change Logo' : 'Upload Logo'}
                        <input
                          type="file"
                          accept="image/*"
                          hidden
                          onChange={handleLogoFileChange}
                        />
                      </Button>
                      
                      {companyInfo.logo && (
                        <Button
                          variant="text"
                          startIcon={<RefreshIcon />}
                          fullWidth={isMobile}
                          onClick={refreshLogoPreview}
                          sx={{
                            borderRadius: 2,
                            fontWeight: 600,
                            textTransform: 'none',
                            color: '#666',
                            '&:hover': {
                              backgroundColor: 'rgba(0, 0, 0, 0.04)'
                            }
                          }}
                        >
                          Refresh
                        </Button>
                      )}
                    </Stack>
                    
                    <Typography variant="caption" sx={{ color: '#666', maxWidth: 300, px: 1 }}>
                      Upload your company logo. Recommended size: 400x200px. Max file size: 2MB.
                    </Typography>
                  </Stack>
                </Box>

                {/* Company Details Form */}
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      name="name"
                      label="Company Name"
                      value={companyInfo.name}
                      onChange={handleCompanyInfoChange}
                      fullWidth
                      variant="outlined"
                      InputProps={{
                        startAdornment: <BusinessIcon sx={{ mr: 1, color: '#667eea' }} />
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            '& > fieldset': { borderColor: '#667eea' }
                          },
                          '&.Mui-focused': {
                            '& > fieldset': { borderColor: '#667eea', borderWidth: 2 }
                          }
                        }
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      name="email"
                      label="Email Address"
                      value={companyInfo.email}
                      onChange={handleCompanyInfoChange}
                      fullWidth
                      variant="outlined"
                      InputProps={{
                        startAdornment: <EmailIcon sx={{ mr: 1, color: '#667eea' }} />
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            '& > fieldset': { borderColor: '#667eea' }
                          },
                          '&.Mui-focused': {
                            '& > fieldset': { borderColor: '#667eea', borderWidth: 2 }
                          }
                        }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      name="website"
                      label="Website URL"
                      value={companyInfo.website}
                      onChange={handleCompanyInfoChange}
                      fullWidth
                      variant="outlined"
                      placeholder="https://www.example.com"
                      InputProps={{
                        startAdornment: <WebIcon sx={{ mr: 1, color: '#667eea' }} />
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            '& > fieldset': { borderColor: '#667eea' }
                          },
                          '&.Mui-focused': {
                            '& > fieldset': { borderColor: '#667eea', borderWidth: 2 }
                          }
                        }
                      }}
                    />
                  </Grid>                  <Grid item xs={12} md={6}>
                    <TextField
                      name="companyNo"
                      label="Company Registration Number"
                      value={companyInfo.companyNo}
                      onChange={handleCompanyInfoChange}
                      fullWidth
                      variant="outlined"
                      placeholder="HE 123456"
                      InputProps={{
                        startAdornment: <VerifiedIcon sx={{ mr: 1, color: '#667eea' }} />
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            '& > fieldset': { borderColor: '#667eea' }
                          },
                          '&.Mui-focused': {
                            '& > fieldset': { borderColor: '#667eea', borderWidth: 2 }
                          }
                        }
                      }}
                    />
                  </Grid>                  <Grid item xs={12} md={6}>
                    <TextField
                      name="vatNo"
                      label="VAT Number"
                      value={companyInfo.vatNo}
                      onChange={handleCompanyInfoChange}
                      fullWidth
                      variant="outlined"
                      placeholder="6789456"
                      InputProps={{
                        startAdornment: <CardIcon sx={{ mr: 1, color: '#667eea' }} />
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            '& > fieldset': { borderColor: '#667eea' }
                          },
                          '&.Mui-focused': {
                            '& > fieldset': { borderColor: '#667eea', borderWidth: 2 }
                          }
                        }
                      }}
                    />
                  </Grid>                  <Grid item xs={12} md={6}>
                    <TextField
                      name="ticNo"
                      label="TIC Number"
                      value={companyInfo.ticNo}
                      onChange={handleCompanyInfoChange}
                      fullWidth
                      variant="outlined"
                      placeholder="1234563"
                      InputProps={{
                        startAdornment: <WalletIcon sx={{ mr: 1, color: '#667eea' }} />
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            '& > fieldset': { borderColor: '#667eea' }
                          },
                          '&.Mui-focused': {
                            '& > fieldset': { borderColor: '#667eea', borderWidth: 2 }
                          }
                        }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      name="address"
                      label="Business Address"
                      value={companyInfo.address}
                      onChange={handleCompanyInfoChange}
                      fullWidth
                      multiline
                      rows={3}
                      variant="outlined"
                      placeholder="Enter your complete business address"
                      InputProps={{
                        startAdornment: <AddressIcon sx={{ mr: 1, color: '#667eea', alignSelf: 'flex-start', mt: 1 }} />
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            '& > fieldset': { borderColor: '#667eea' }
                          },
                          '&.Mui-focused': {
                            '& > fieldset': { borderColor: '#667eea', borderWidth: 2 }
                          }
                        }
                      }}
                    />
                  </Grid>
                </Grid>
              </Paper>
            )}

            {activeTab === 1 && (              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2, sm: 3, md: 4 },
                  borderRadius: { xs: 2, md: 3 },
                  background: 'rgba(255,255,255,0.98)',
                  border: '1px solid rgba(0,0,0,0.08)',
                  animation: 'slideInRight 0.6s ease-out'
                }}
              >
                {/* Banking Details Tab */}                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: { xs: 3, md: 4 } }}>
                  <BankIcon sx={{ color: '#667eea', fontSize: { xs: 24, md: 28 } }} />
                  <Typography variant={isMobile ? "h6" : "h5"} sx={{ fontWeight: 700, color: '#2c3e50' }}>
                    Banking Information
                  </Typography>                </Stack>

                {/* Banking Form */}
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      name="bankName"
                      label="Bank Name"
                      value={bankInfo.bankName}
                      onChange={handleBankInfoChange}
                      fullWidth
                      variant="outlined"
                      placeholder="e.g. Hellenic Bank"
                      InputProps={{
                        startAdornment: <BankIcon sx={{ mr: 1, color: '#667eea' }} />
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            '& > fieldset': { borderColor: '#667eea' }
                          },
                          '&.Mui-focused': {
                            '& > fieldset': { borderColor: '#667eea', borderWidth: 2 }
                          }
                        }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      name="accountName"
                      label="Account Holder Name"
                      value={bankInfo.accountName}
                      onChange={handleBankInfoChange}
                      fullWidth
                      variant="outlined"
                      placeholder="Account holder's full name"
                      InputProps={{
                        startAdornment: <BusinessIcon sx={{ mr: 1, color: '#667eea' }} />
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            '& > fieldset': { borderColor: '#667eea' }
                          },
                          '&.Mui-focused': {
                            '& > fieldset': { borderColor: '#667eea', borderWidth: 2 }
                          }
                        }
                      }}
                    />
                  </Grid>                  <Grid item xs={12} md={6}>
                    <TextField
                      name="accountNo"
                      label="Account Number"
                      value={bankInfo.accountNo}
                      onChange={handleBankInfoChange}
                      fullWidth
                      variant="outlined"
                      placeholder="350-01-H01712-01"
                      InputProps={{
                        startAdornment: <CardIcon sx={{ mr: 1, color: '#667eea' }} />
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            '& > fieldset': { borderColor: '#667eea' }
                          },
                          '&.Mui-focused': {
                            '& > fieldset': { borderColor: '#667eea', borderWidth: 2 }
                          }
                        }
                      }}
                    />
                  </Grid>                  <Grid item xs={12} md={6}>
                    <TextField
                      name="swift"
                      label="SWIFT/BIC Code"
                      value={bankInfo.swift}
                      onChange={handleBankInfoChange}
                      fullWidth
                      variant="outlined"
                      placeholder="HEBACY2N"
                      InputProps={{
                        startAdornment: <WalletIcon sx={{ mr: 1, color: '#667eea' }} />
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            '& > fieldset': { borderColor: '#667eea' }
                          },
                          '&.Mui-focused': {
                            '& > fieldset': { borderColor: '#667eea', borderWidth: 2 }
                          }
                        }
                      }}
                    />
                  </Grid>                  <Grid item xs={12}>
                    <TextField
                      name="iban"
                      label="IBAN Number"
                      value={bankInfo.iban}
                      onChange={handleBankInfoChange}
                      fullWidth
                      variant="outlined"
                      placeholder="CY87 0020 0128 0000 0012 0052 7600"
                      error={!!ibanError}
                      helperText={ibanError || "Enter the complete IBAN number"}
                      InputProps={{
                        startAdornment: <BankIcon sx={{ mr: 1, color: ibanError ? '#f44336' : '#667eea' }} />
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            '& > fieldset': { borderColor: ibanError ? '#f44336' : '#667eea' }
                          },
                          '&.Mui-focused': {
                            '& > fieldset': { borderColor: ibanError ? '#f44336' : '#667eea', borderWidth: 2 }
                          }
                        }
                      }}
                    />
                  </Grid>
                </Grid>
              </Paper>
            )}
          </Box>
        </Fade>

        {/* Action Buttons */}
        <Box
          sx={{
            mt: { xs: 3, md: 4 },
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'stretch', sm: 'center' },
            gap: 2,
            animation: 'fadeInUp 0.6s ease-out 0.5s both'
          }}
        >
          <Stack direction="row" alignItems="center" spacing={2} sx={{ justifyContent: { xs: 'center', sm: 'flex-start' } }}>
            {hasUnsavedChanges && (
              <Chip
                icon={<ErrorIcon />}
                label="Unsaved changes"
                size="small"
                sx={{
                  backgroundColor: 'rgba(255, 152, 0, 0.1)',
                  color: '#ff9800',
                  fontWeight: 600,
                  animation: 'pulse 2s infinite'
                }}
              />
            )}
          </Stack>

          <Stack direction={isMobile ? "column-reverse" : "row"} spacing={2} sx={{ width: { xs: '100%', sm: 'auto' } }}>
            <Button
              variant="outlined"
              onClick={() => window.location.reload()}
              startIcon={!isMobile && <RefreshIcon />}
              fullWidth={isMobile}
              sx={{
                borderRadius: 2,
                fontWeight: 600,
                textTransform: 'none',
                borderColor: '#667eea',
                color: '#667eea',
                height: { xs: 44, md: 48 },
                '&:hover': {
                  backgroundColor: 'rgba(102, 126, 234, 0.05)',
                  borderColor: '#667eea'
                }
              }}
            >
              Reset
            </Button>

            <Button
              variant="contained"
              onClick={handleSave}
              disabled={saving}
              startIcon={saving ? <CircularProgress size={20} color="inherit" /> : !isMobile && <SaveIcon />}
              fullWidth={isMobile}
              sx={{
                minWidth: { xs: '100%', sm: 160 },
                height: { xs: 44, md: 48 },
                borderRadius: 2,
                fontWeight: 600,
                textTransform: 'none',
                background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #5a6fd8 30%, #694a98 90%)',
                  boxShadow: '0 6px 16px rgba(102, 126, 234, 0.4)',
                  transform: 'translateY(-1px)'
                },
                '&:disabled': {
                  background: 'rgba(0,0,0,0.12)',
                  boxShadow: 'none'
                },
                transition: 'all 0.3s ease'
              }}
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </Stack>
        </Box>
      </Box>

      {/* Loading Backdrop */}
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={saving}
      >
        <Stack alignItems="center" spacing={2}>
          <CircularProgress color="inherit" size={60} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Saving your settings...
          </Typography>        </Stack>
      </Backdrop>

      {/* Enhanced Notification */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          variant="filled"
          sx={{
            width: "100%",
            borderRadius: 2,
            fontWeight: 600,
            boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
          }}
          icon={
            notification.severity === 'success' ? <CheckIcon /> :
            notification.severity === 'error' ? <ErrorIcon /> : <InfoIcon />
          }
        >
          {notification.message}
        </Alert>
      </Snackbar>
      
      <PageHelper {...pageHelpContent.systemSetup} />
    </Box>
  );
};

export default CompanyProfileSettings;
