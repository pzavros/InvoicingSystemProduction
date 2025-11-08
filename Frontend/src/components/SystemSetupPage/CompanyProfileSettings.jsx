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
    <>
      <Box
        sx={{
          position: 'relative'
        }}
      >
      {/* Clean Header */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: { xs: 2, sm: 3 },
          mb: 3,
          pb: 3,
          borderBottom: '1px solid rgba(15, 23, 42, 0.08)',
        }}
      >
        {/* Left Side - Title and Description */}
        <Box>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 700,
              fontSize: { xs: '1.75rem', sm: '2rem' },
              color: 'rgba(15, 23, 42, 0.95)',
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              mb: 0.5
            }}
          >
            Company Settings
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: 'rgba(15, 23, 42, 0.5)',
              fontSize: '0.9375rem',
              fontWeight: 400,
              letterSpacing: '-0.01em'
            }}
          >
            Configure your business profile and banking details
          </Typography>
        </Box>

        {/* Right Side - Progress Indicator */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: { xs: 'flex-start', sm: 'flex-end' },
            gap: 1,
            minWidth: { sm: 200 }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'rgba(15, 23, 42, 0.7)', fontSize: '0.8125rem' }}>
              Setup Progress
            </Typography>
            {formProgress === 100 && (
              <Chip
                icon={<CheckIcon />}
                label="Complete"
                size="small"
                sx={{
                  backgroundColor: 'rgba(34, 197, 94, 0.08)',
                  color: '#059669',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  height: '24px',
                  borderRadius: '6px',
                  border: 'none',
                }}
              />
            )}
          </Box>
          <Box sx={{ width: '100%' }}>
            <LinearProgress
              variant="determinate"
              value={formProgress}
              sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor: 'rgba(15, 23, 42, 0.08)',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
                }
              }}
            />
          </Box>
          <Typography variant="caption" sx={{ color: 'rgba(15, 23, 42, 0.5)', fontSize: '0.8125rem' }}>
            {Math.round(formProgress)}% complete{hasUnsavedChanges ? ' • Unsaved changes' : ''}
          </Typography>
        </Box>
      </Box>
      
      {/* Segmented Control - Apple Style */}
      <Box 
        sx={{ 
          mb: 3,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <Box
          sx={{
            display: 'inline-flex',
            backgroundColor: 'rgba(15, 23, 42, 0.04)',
            borderRadius: '12px',
            padding: '4px',
            gap: '4px',
            border: '1px solid rgba(15, 23, 42, 0.06)',
          }}
        >
          <Box
            onClick={() => setActiveTab(0)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 3,
              py: 1.25,
              borderRadius: '9px',
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              background: activeTab === 0 
                ? 'white'
                : 'transparent',
              color: activeTab === 0
                ? '#8b5cf6'
                : 'rgba(15, 23, 42, 0.6)',
              boxShadow: activeTab === 0
                ? '0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)'
                : 'none',
              fontWeight: activeTab === 0 ? 600 : 500,
              fontSize: '0.875rem',
              letterSpacing: '-0.01em',
              userSelect: 'none',
              '&:hover': {
                background: activeTab === 0
                  ? 'white'
                  : 'rgba(139, 92, 246, 0.08)',
                color: activeTab === 0
                  ? '#8b5cf6'
                  : 'rgba(15, 23, 42, 0.8)',
              }
            }}
          >
            <BusinessIcon sx={{ fontSize: '1.125rem' }} />
            <Typography 
              sx={{ 
                fontSize: '0.875rem', 
                fontWeight: 'inherit',
                letterSpacing: 'inherit',
                lineHeight: 1
              }}
            >
              Company Profile
            </Typography>
          </Box>

          <Box
            onClick={() => setActiveTab(1)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 3,
              py: 1.25,
              borderRadius: '9px',
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              background: activeTab === 1 
                ? 'white'
                : 'transparent',
              color: activeTab === 1
                ? '#8b5cf6'
                : 'rgba(15, 23, 42, 0.6)',
              boxShadow: activeTab === 1
                ? '0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)'
                : 'none',
              fontWeight: activeTab === 1 ? 600 : 500,
              fontSize: '0.875rem',
              letterSpacing: '-0.01em',
              userSelect: 'none',
              '&:hover': {
                background: activeTab === 1
                  ? 'white'
                  : 'rgba(139, 92, 246, 0.08)',
                color: activeTab === 1
                  ? '#8b5cf6'
                  : 'rgba(15, 23, 42, 0.8)',
              }
            }}
          >
            <BankIcon sx={{ fontSize: '1.125rem' }} />
            <Typography 
              sx={{ 
                fontSize: '0.875rem', 
                fontWeight: 'inherit',
                letterSpacing: 'inherit',
                lineHeight: 1
              }}
            >
              Banking Details
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Tab Content */}
      <Box>
        {activeTab === 0 && (
          <Box
            sx={{
              p: { xs: 2, sm: 3, md: 4 },
              borderRadius: '12px',
              backgroundColor: 'white',
              border: '1px solid rgba(15, 23, 42, 0.06)',
            }}
          >
            {/* Company Profile Tab */}
            <Box sx={{ mb: { xs: 3, md: 4 } }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 600, 
                  color: 'rgba(15, 23, 42, 0.9)',
                  fontSize: '1.125rem',
                  letterSpacing: '-0.01em'
                }}
              >
                Company Information
              </Typography>
            </Box>

                {/* Logo Upload Section */}
                <Box
                  sx={{
                    mb: 4,
                    p: 3,
                    border: '2px dashed rgba(15, 23, 42, 0.15)',
                    borderRadius: '12px',
                    textAlign: 'center',
                    backgroundColor: 'rgba(15, 23, 42, 0.02)',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: '#8b5cf6',
                      backgroundColor: 'rgba(139, 92, 246, 0.02)',
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
                          borderRadius: '8px',
                          objectFit: 'contain',
                        }}
                      />
                    ) : (
                      <Avatar
                        sx={{
                          width: 80,
                          height: 80,
                          backgroundColor: 'rgba(15, 23, 42, 0.04)',
                          border: 'none'
                        }}
                      >
                        <CameraIcon sx={{ fontSize: 40, color: 'rgba(15, 23, 42, 0.4)' }} />
                      </Avatar>
                    )}
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Button
                        variant="outlined"
                        component="label"
                        startIcon={<UploadIcon />}
                        sx={{
                          borderRadius: '8px',
                          fontWeight: 600,
                          textTransform: 'none',
                          fontSize: '0.875rem',
                          borderColor: '#8b5cf6',
                          color: '#8b5cf6',
                          '&:hover': {
                            backgroundColor: 'rgba(139, 92, 246, 0.04)',
                            borderColor: '#7c3aed'
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
                            borderRadius: '8px',
                            fontWeight: 500,
                            textTransform: 'none',
                            fontSize: '0.875rem',
                            color: 'rgba(15, 23, 42, 0.6)',
                            '&:hover': {
                              backgroundColor: 'rgba(15, 23, 42, 0.04)'
                            }
                          }}
                        >
                          Refresh
                        </Button>
                      )}
                    </Stack>
                    
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: 'rgba(15, 23, 42, 0.6)', 
                        maxWidth: 300 
                      }}
                    >
                      Upload your company logo. Recommended size: 400x200px. Max file size: 2MB.
                    </Typography>
                  </Stack>
                </Box>                {/* Company Details Form */}
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <TextField
                      name="name"
                      label="Company Name"
                      value={companyInfo.name}
                      onChange={handleCompanyInfoChange}
                      fullWidth
                      variant="outlined"
                      InputProps={{
                        startAdornment: <BusinessIcon sx={{ mr: 1, color: '#8b5cf6' }} />
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          backgroundColor: 'white',
                          transition: 'all 0.2s ease',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(15, 23, 42, 0.08)',
                            borderWidth: '1px'
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#8b5cf6'
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#8b5cf6',
                            borderWidth: '1.5px'
                          },
                          '& .MuiInputBase-input': {
                            padding: '9px 12px',
                            fontSize: '0.875rem'
                          }
                        }
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <TextField
                      name="email"
                      label="Email Address"
                      value={companyInfo.email}
                      onChange={handleCompanyInfoChange}
                      fullWidth
                      variant="outlined"
                      InputProps={{
                        startAdornment: <EmailIcon sx={{ mr: 1, color: '#8b5cf6' }} />
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          backgroundColor: 'white',
                          transition: 'all 0.2s ease',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(15, 23, 42, 0.08)',
                            borderWidth: '1px'
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#8b5cf6'
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#8b5cf6',
                            borderWidth: '1.5px'
                          },
                          '& .MuiInputBase-input': {
                            padding: '9px 12px',
                            fontSize: '0.875rem'
                          }
                        }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      name="website"
                      label="Website URL"
                      value={companyInfo.website}
                      onChange={handleCompanyInfoChange}
                      fullWidth
                      variant="outlined"
                      placeholder="https://www.example.com"
                      InputProps={{
                        startAdornment: <WebIcon sx={{ mr: 1, color: '#8b5cf6' }} />
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          backgroundColor: 'white',
                          transition: 'all 0.2s ease',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(15, 23, 42, 0.08)',
                            borderWidth: '1px'
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#8b5cf6'
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#8b5cf6',
                            borderWidth: '1.5px'
                          },
                          '& .MuiInputBase-input': {
                            padding: '9px 12px',
                            fontSize: '0.875rem'
                          }
                        }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      name="companyNo"
                      label="Company Registration Number"
                      value={companyInfo.companyNo}
                      onChange={handleCompanyInfoChange}
                      fullWidth
                      variant="outlined"
                      placeholder="HE 123456"
                      InputProps={{
                        startAdornment: <VerifiedIcon sx={{ mr: 1, color: '#8b5cf6' }} />
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          backgroundColor: 'white',
                          transition: 'all 0.2s ease',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(15, 23, 42, 0.08)',
                            borderWidth: '1px'
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#8b5cf6'
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#8b5cf6',
                            borderWidth: '1.5px'
                          },
                          '& .MuiInputBase-input': {
                            padding: '9px 12px',
                            fontSize: '0.875rem'
                          }
                        }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      name="vatNo"
                      label="VAT Number"
                      value={companyInfo.vatNo}
                      onChange={handleCompanyInfoChange}
                      fullWidth
                      variant="outlined"
                      placeholder="6789456"
                      InputProps={{
                        startAdornment: <CardIcon sx={{ mr: 1, color: '#8b5cf6' }} />
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          backgroundColor: 'white',
                          transition: 'all 0.2s ease',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(15, 23, 42, 0.08)',
                            borderWidth: '1px'
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#8b5cf6'
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#8b5cf6',
                            borderWidth: '1.5px'
                          },
                          '& .MuiInputBase-input': {
                            padding: '9px 12px',
                            fontSize: '0.875rem'
                          }
                        }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      name="ticNo"
                      label="TIC Number"
                      value={companyInfo.ticNo}
                      onChange={handleCompanyInfoChange}
                      fullWidth
                      variant="outlined"
                      placeholder="1234563"
                      InputProps={{
                        startAdornment: <WalletIcon sx={{ mr: 1, color: '#8b5cf6' }} />
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          backgroundColor: 'white',
                          transition: 'all 0.2s ease',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(15, 23, 42, 0.08)',
                            borderWidth: '1px'
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#8b5cf6'
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#8b5cf6',
                            borderWidth: '1.5px'
                          },
                          '& .MuiInputBase-input': {
                            padding: '9px 12px',
                            fontSize: '0.875rem'
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
                        startAdornment: <AddressIcon sx={{ mr: 1, color: '#8b5cf6', alignSelf: 'flex-start', mt: 1 }} />
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          backgroundColor: 'white',
                          transition: 'all 0.2s ease',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(15, 23, 42, 0.08)',
                            borderWidth: '1px'
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#8b5cf6'
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#8b5cf6',
                            borderWidth: '1.5px'
                          },
                          '& .MuiInputBase-input': {
                            padding: '9px 12px',
                            fontSize: '0.875rem'
                          }
                        }
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>
            )}

            {activeTab === 1 && (
              <Box
                sx={{
                  p: { xs: 2, sm: 3, md: 4 },
                  borderRadius: '12px',
                  backgroundColor: 'white',
                  border: '1px solid rgba(15, 23, 42, 0.06)',
                }}
              >
                {/* Banking Details Tab */}
                <Box sx={{ mb: { xs: 3, md: 4 } }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 600, 
                      color: 'rgba(15, 23, 42, 0.9)',
                      fontSize: '1.125rem',
                      letterSpacing: '-0.01em'
                    }}
                  >
                    Banking Information
                  </Typography>
                </Box>

                {/* Banking Form */}
                <Grid container spacing={3}>
                  {/* Row 1: Bank Name, Account Holder, Account Number */}
                  <Grid item xs={12} md={4}>
                    <TextField
                      name="bankName"
                      label="Bank Name"
                      value={bankInfo.bankName}
                      onChange={handleBankInfoChange}
                      fullWidth
                      variant="outlined"
                      placeholder="e.g. Hellenic Bank"
                      InputProps={{
                        startAdornment: <BankIcon sx={{ mr: 1, color: '#8b5cf6' }} />
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          backgroundColor: 'white',
                          transition: 'all 0.2s ease',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(15, 23, 42, 0.08)',
                            borderWidth: '1px'
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#8b5cf6'
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#8b5cf6',
                            borderWidth: '1.5px'
                          },
                          '& .MuiInputBase-input': {
                            padding: '9px 12px',
                            fontSize: '0.875rem'
                          }
                        }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      name="accountName"
                      label="Account Holder Name"
                      value={bankInfo.accountName}
                      onChange={handleBankInfoChange}
                      fullWidth
                      variant="outlined"
                      placeholder="Account holder's full name"
                      InputProps={{
                        startAdornment: <BusinessIcon sx={{ mr: 1, color: '#8b5cf6' }} />
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          backgroundColor: 'white',
                          transition: 'all 0.2s ease',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(15, 23, 42, 0.08)',
                            borderWidth: '1px'
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#8b5cf6'
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#8b5cf6',
                            borderWidth: '1.5px'
                          },
                          '& .MuiInputBase-input': {
                            padding: '9px 12px',
                            fontSize: '0.875rem'
                          }
                        }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      name="accountNo"
                      label="Account Number"
                      value={bankInfo.accountNo}
                      onChange={handleBankInfoChange}
                      fullWidth
                      variant="outlined"
                      placeholder="350-01-H01712-01"
                      InputProps={{
                        startAdornment: <CardIcon sx={{ mr: 1, color: '#8b5cf6' }} />
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          backgroundColor: 'white',
                          transition: 'all 0.2s ease',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(15, 23, 42, 0.08)',
                            borderWidth: '1px'
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#8b5cf6'
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#8b5cf6',
                            borderWidth: '1.5px'
                          },
                          '& .MuiInputBase-input': {
                            padding: '9px 12px',
                            fontSize: '0.875rem'
                          }
                        }
                      }}
                    />
                  </Grid>

                  {/* Row 2: SWIFT/BIC, IBAN */}
                  <Grid item xs={12} md={4}>
                    <TextField
                      name="swift"
                      label="SWIFT/BIC Code"
                      value={bankInfo.swift}
                      onChange={handleBankInfoChange}
                      fullWidth
                      variant="outlined"
                      placeholder="HEBACY2N"
                      InputProps={{
                        startAdornment: <WalletIcon sx={{ mr: 1, color: '#8b5cf6' }} />
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          backgroundColor: 'white',
                          transition: 'all 0.2s ease',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(15, 23, 42, 0.08)',
                            borderWidth: '1px'
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#8b5cf6'
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#8b5cf6',
                            borderWidth: '1.5px'
                          },
                          '& .MuiInputBase-input': {
                            padding: '9px 12px',
                            fontSize: '0.875rem'
                          }
                        }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={8}>
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
                        startAdornment: <BankIcon sx={{ mr: 1, color: ibanError ? '#f44336' : '#8b5cf6' }} />
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          backgroundColor: 'white',
                          transition: 'all 0.2s ease',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: ibanError ? '#ef4444' : 'rgba(15, 23, 42, 0.08)',
                            borderWidth: '1px'
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: ibanError ? '#ef4444' : '#8b5cf6'
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: ibanError ? '#ef4444' : '#8b5cf6',
                            borderWidth: '1.5px'
                          },
                          '& .MuiInputBase-input': {
                            padding: '9px 12px',
                            fontSize: '0.875rem'
                          }
                        }
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>
            )}
          </Box>

        {/* Action Buttons */}
        <Box
          sx={{
            mt: 4,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2
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
                  fontWeight: 600
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
                borderRadius: '8px',
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '0.875rem',
                borderColor: '#8b5cf6',
                color: '#8b5cf6',
                '&:hover': {
                  backgroundColor: 'rgba(139, 92, 246, 0.04)',
                  borderColor: '#7c3aed'
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
                borderRadius: '8px',
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '0.875rem',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                boxShadow: 'none',
                '&:hover': {
                  background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                  boxShadow: 'none'
                },
                '&:disabled': {
                  background: 'rgba(0,0,0,0.12)',
                  boxShadow: 'none'
                }
              }}
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </Stack>
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
          </Typography>
        </Stack>
      </Backdrop>

      {/* Notification */}
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
            borderRadius: '8px',
            fontWeight: 600,
            boxShadow: 'none'
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
    </>
  );
};

export default CompanyProfileSettings;
