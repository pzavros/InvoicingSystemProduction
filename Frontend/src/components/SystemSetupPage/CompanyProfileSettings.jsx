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

const CompanyProfileSettings = () => {
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
    >      {/* Hero Header */}
      <Box
        sx={{
          background: 'rgba(248, 249, 250, 0.8)',
          borderBottom: '1px solid rgba(0,0,0,0.08)',
          pb: 4,
          animation: 'fadeInUp 0.6s ease-out'
        }}
      >
        <Stack direction="row" alignItems="center" spacing={3} sx={{ maxWidth: 1400, mx: 'auto' }}>          <Avatar
            sx={{
              width: 64,
              height: 64,
              background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4)',
              fontSize: '24px',
              fontWeight: 'bold',
              animation: 'scaleIn 0.5s ease-out 0.2s both'
            }}
          >
            <BusinessIcon fontSize="large" />
          </Avatar>
          
          <Box >
            <Typography
              variant="h3"
              sx={{
                color: '#2c3e50',
                fontWeight: 700,
                fontSize: { xs: '1.8rem', md: '2.5rem' },
                mb: 1,
                animation: 'slideInLeft 0.6s ease-out 0.1s both'
              }}
            >
              Company Settings
            </Typography>
            
            <Typography
              variant="h6"
              sx={{
                color: '#6c757d',
                fontWeight: 400,
                mb: 2,
                animation: 'slideInLeft 0.6s ease-out 0.2s both'
              }}
            >
              Configure your business profile and banking details
            </Typography>
              {/* Progress Indicator */}
            <Box sx={{ animation: 'slideInLeft 0.6s ease-out 0.3s both' }}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Typography variant="body2" sx={{ color: '#495057', fontWeight: 500 }}>
                  Setup Progress: {Math.round(formProgress)}%
                </Typography>                <Box sx={{ flex: 1, maxWidth: 200 }}>
                  <LinearProgress
                    variant="determinate"
                    value={formProgress}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: 'rgba(0,0,0,0.1)',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                        background: 'linear-gradient(90deg, #4ECDC4, #44A08D)',
                      }
                    }}
                  />
                </Box>
                {formProgress === 100 && (
                  <Chip
                    icon={<CheckIcon />}
                    label="Complete"
                    size="small"                    sx={{
                      backgroundColor: 'rgba(76, 175, 80, 0.9)',
                      color: 'white',
                      fontWeight: 600,
                      animation: 'pulse 2s infinite'
                    }}
                  />
                )}
              </Stack>            </Box>
          </Box>
        </Stack>
      </Box>{/* Main Content */}
      <Box sx={{ maxWidth: 1400, mx: 'auto', p: 3 }}>
        {/* Tab Navigation */}        <Paper
          elevation={0}
          sx={{
            mb: 4,
            borderRadius: 3,
            background: 'rgba(255,255,255,0.98)',
            border: '1px solid rgba(0,0,0,0.08)',
            animation: 'fadeInUp 0.6s ease-out 0.3s both'
          }}
        >
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            sx={{
              '& .MuiTabs-indicator': {
                height: 3,
                background: 'linear-gradient(90deg, #667eea, #764ba2)',
                borderRadius: '3px 3px 0 0'
              }
            }}
          >
            <Tab
              icon={<BusinessIcon />}
              label="Company Profile"
              sx={{
                minHeight: 70,
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '1rem',
                '&.Mui-selected': { color: '#667eea' }
              }}
            />
            <Tab
              icon={<BankIcon />}
              label="Banking Details"
              sx={{
                minHeight: 70,
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '1rem',
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
                  p: 4,
                  borderRadius: 3,
                  background: 'rgba(255,255,255,0.98)',
                  border: '1px solid rgba(0,0,0,0.08)',
                  animation: 'slideInLeft 0.6s ease-out'
                }}
              >
                {/* Company Profile Tab */}                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
                  <BusinessIcon sx={{ color: '#667eea', fontSize: 28 }} />
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#2c3e50' }}>
                    Company Information
                  </Typography>
                </Stack>

                {/* Logo Upload Section */}
                <Box
                  sx={{
                    mb: 4,
                    p: 3,
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
                          maxWidth: 200,
                          maxHeight: 120,
                          borderRadius: 2,
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                          animation: 'scaleIn 0.5s ease-out'
                        }}
                      />
                    ) : (
                      <Avatar
                        sx={{
                          width: 80,
                          height: 80,
                          backgroundColor: '#f5f5f5',
                          border: '2px solid #e0e0e0'
                        }}
                      >
                        <CameraIcon sx={{ fontSize: 40, color: '#999' }} />
                      </Avatar>
                    )}
                      <Stack direction="row" spacing={2} alignItems="center">
                      <Button
                        variant="outlined"
                        component="label"
                        startIcon={<UploadIcon />}
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
                    
                    <Typography variant="caption" sx={{ color: '#666', maxWidth: 300 }}>
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
                  p: 4,
                  borderRadius: 3,
                  background: 'rgba(255,255,255,0.98)',
                  border: '1px solid rgba(0,0,0,0.08)',
                  animation: 'slideInRight 0.6s ease-out'
                }}
              >
                {/* Banking Details Tab */}                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
                  <BankIcon sx={{ color: '#667eea', fontSize: 28 }} />
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#2c3e50' }}>
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
            mt: 4,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            animation: 'fadeInUp 0.6s ease-out 0.5s both'
          }}
        >
          <Stack direction="row" alignItems="center" spacing={2}>
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

          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              onClick={() => window.location.reload()}
              startIcon={<RefreshIcon />}
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
              Reset
            </Button>

            <Button
              variant="contained"
              onClick={handleSave}
              disabled={saving}
              startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
              sx={{
                minWidth: 160,
                height: 48,
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
    </Box>
  );
};

export default CompanyProfileSettings;
