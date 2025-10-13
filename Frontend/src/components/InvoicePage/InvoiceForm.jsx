import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Card,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Alert,
  Snackbar,
  CircularProgress,
  Typography,
  Divider,
  Autocomplete,
} from "@mui/material";
import { BiArrowBack } from "react-icons/bi";
import { useDispatch } from "react-redux";
import { Link, useParams, useLocation, useNavigate } from "react-router-dom";
import InvoiceItem from "./InvoiceItem";
import InvoiceModal from "./InvoiceModal";
import { addInvoice, updateInvoice as updateReduxInvoice, updateInvoiceStatus as updateReduxInvoiceStatus } from "../../redux/invoicesSlice";
import generateRandomId from "../../utils/generateRandomId";
import { useInvoiceListData } from "../../redux/hooks";
import { 
  getAllCurrencies,
  getSystemSetup,
  createInvoice,
  updateInvoice,
  getInvoiceById,
  getAllStatuses,
  updateInvoiceStatus,
  getActiveInvoiceTemplate,
  getInvoiceTemplateById
} from "./api";
import { getAllClients } from "../ClientsPage/api";
import { getAllDocumentTypes } from "../DocumentTypePage/api";

const InvoiceForm = () => {
  const dispatch = useDispatch();
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const isCopy = location.pathname.includes("create");
  const isEdit = location.pathname.includes("edit");

  const [isOpen, setIsOpen] = useState(false);
  const [copyId, setCopyId] = useState("");
  const { getOneInvoice, listSize } = useInvoiceListData();
  const [formData, setFormData] = useState({
    id: generateRandomId(),
    currentDate: new Date().toISOString().split('T')[0],
    invoiceNumber: listSize + 1,
    dateOfIssue: "",
    dueDate: "",
    billTo: "",
    billToEmail: "",
    billToAddress: "",
    billFrom: "",
    billFromEmail: "",
    address: "",
    notes: "",
    total: "0.00",
    subTotal: "0.00",
    taxRate: 0,
    taxAmount: "0.00",
    discountRate: 0,
    discountAmount: "0.00",
    currency: "$",
    currencyId: 1,
    companyLogo: "",
    companyLogoMimeType: "", // Added for MIME type
    companyName: "",
    companyNo: "",
    vatNo: "",
    ticNo: "",
    website: "",
    companyEmail: "",
    bankName: "",
    accountName: "",
    accountNo: "",
    swift: "",
    iban: "",
    items: [
      {
        itemId: 0,
        itemName: "",
        itemPrice: "1.00",
        itemQuantity: 1,
      },
    ],
    statusId: 1,
    statusName: "Draft",
    templateId: null,
    documentTypeId: 1, // Default to standard invoice
  });

  const [loading, setLoading] = useState(false);
  const [currencies, setCurrencies] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [clients, setClients] = useState([]);
  const [documentTypes, setDocumentTypes] = useState([]);
  const [clientSelectionMode, setClientSelectionMode] = useState("manual"); // "manual" or "select"
  const [selectedClientId, setSelectedClientId] = useState("");
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const parseTemplateData = (templateDto) => {
    if (!templateDto) return null;

    let parsedConfig = {};
    try {
      if (templateDto.templateData) {
        parsedConfig = typeof templateDto.templateData === 'string'
          ? JSON.parse(templateDto.templateData)
          : { ...templateDto.templateData };
      }
    } catch (error) {
      console.error('Error parsing template data:', error);
      parsedConfig = {};
    }

    return {
      ...templateDto,
      parsedConfig,
    };
  };

  const setTemplateFromDto = (templateDto) => {
    const normalizedTemplate = parseTemplateData(templateDto);
    setSelectedTemplate(normalizedTemplate);
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const currenciesData = await getAllCurrencies();
        setCurrencies(currenciesData);

        const statusesData = await getAllStatuses();
        setStatuses(statusesData);

        const clientsData = await getAllClients();
        setClients(clientsData);

        const documentTypesData = await getAllDocumentTypes();
        setDocumentTypes(documentTypesData);

        // Load template after setting up initial form data
        await loadTemplateForDocumentType(1); // Default to Invoice (type 1)

        const setupData = await getSystemSetup(); // Assuming this returns { ..., logo, logoMimeType }
        
        if (isEdit && params.id) {
          try {
            const invoiceData = await getInvoiceById(params.id);
            mapInvoiceDataToForm(invoiceData, currenciesData, statusesData);
            
            // Load template based on invoice's document type
            if (invoiceData.documentTypeId) {
              await loadTemplateForDocumentType(invoiceData.documentTypeId);
            }
            
            // If invoice has a specific template, use that instead
            if (invoiceData.templateId) {
              try {
                const templateDto = await getInvoiceTemplateById(invoiceData.templateId);
                if (templateDto) {
                  setTemplateFromDto(templateDto);
                  setFormData(prev => ({ ...prev, templateId: invoiceData.templateId }));
                }
              } catch (templateFetchError) {
                console.error("Error fetching invoice template by id:", templateFetchError);
                // Fall back to active template for this document type
                await loadTemplateForDocumentType(invoiceData.documentTypeId || 1);
              }
            } else {
              setSelectedTemplate(null);
            }
          } catch (error) {
            console.error("Error fetching invoice:", error);
            setNotification({
              open: true,
              message: "Failed to load invoice data",
              severity: "error",
            });
          }
        } else {
          const defaultCurrencyId = setupData.defaultCurrencyId || 1;
          const defaultCurrency = currenciesData.find(c => c.id === defaultCurrencyId);
          const defaultSymbol = defaultCurrency ? defaultCurrency.symbol : "$";
          const defaultStatus = statusesData.find(s => s.statusId === 1) || { statusId: 1, name: 'Draft' };

          let baseDataForNewOrCopy;

          if (isCopy && params.id) {
            const invoiceToCopy = getOneInvoice(params.id); // Assuming this Redux state includes companyLogoMimeType
            if (invoiceToCopy) {
              baseDataForNewOrCopy = {
                ...invoiceToCopy,
                id: generateRandomId(),
                invoiceNumber: listSize + 1,
                currencyId: invoiceToCopy.currencyId || defaultCurrencyId,
                currency: invoiceToCopy.currency || defaultSymbol,
                statusId: invoiceToCopy.statusId || defaultStatus.statusId,
                statusName: invoiceToCopy.statusName || defaultStatus.name,
                templateId: invoiceToCopy.templateId || null,
                // companyLogo and companyLogoMimeType are expected to be in invoiceToCopy
              };
              
              // Load template for the copied invoice's document type
              if (invoiceToCopy.documentTypeId) {
                await loadTemplateForDocumentType(invoiceToCopy.documentTypeId);
              }
            } else {
              console.warn(`Invoice with ID ${params.id} not found for copying.`);
              baseDataForNewOrCopy = {
                ...formData, // Initial formData state, includes empty companyLogoMimeType
                currencyId: defaultCurrencyId,
                currency: defaultSymbol,
                statusId: defaultStatus.statusId,
                statusName: defaultStatus.name,
                templateId: activeTemplateData?.id || null,
              };
            }
          } else { // New invoice
            const defaultDocumentTypeId = documentTypes?.[0]?.id || null;
            baseDataForNewOrCopy = {
              ...formData, // Initial formData state, includes empty companyLogoMimeType
              currencyId: defaultCurrencyId,
              currency: defaultSymbol,
              statusId: defaultStatus.statusId,
              statusName: defaultStatus.name,
              documentTypeId: defaultDocumentTypeId,
              templateId: null, // Will be set by loadTemplateForDocumentType
            };
            
            // Load template for the default document type
            if (defaultDocumentTypeId) {
              await loadTemplateForDocumentType(defaultDocumentTypeId);
            }
          }

          setFormData({ 
            ...baseDataForNewOrCopy,
            companyName: setupData.name || baseDataForNewOrCopy.companyName || "",
            companyNo: setupData.companyNo || baseDataForNewOrCopy.companyNo || "",
            vatNo: setupData.vatNo || baseDataForNewOrCopy.vatNo || "",
            ticNo: setupData.ticNo || baseDataForNewOrCopy.ticNo || "",
            website: setupData.website || baseDataForNewOrCopy.website || "",
            companyEmail: setupData.email || baseDataForNewOrCopy.companyEmail || "",
            
            companyLogo: setupData.logo || baseDataForNewOrCopy.companyLogo || "",
            companyLogoMimeType: setupData.logoMimeType || baseDataForNewOrCopy.companyLogoMimeType || "",

            bankName: setupData.bankName || baseDataForNewOrCopy.bankName || "",
            accountName: setupData.accountName || baseDataForNewOrCopy.accountName || "",
            accountNo: setupData.accountNo || baseDataForNewOrCopy.accountNo || "",
            swift: setupData.swift || baseDataForNewOrCopy.swift || "",
            iban: setupData.iban || baseDataForNewOrCopy.iban || "",
            billFrom: setupData.name || baseDataForNewOrCopy.billFrom || "",
            billFromEmail: setupData.email || baseDataForNewOrCopy.billFromEmail || "",
            address: setupData.address || baseDataForNewOrCopy.address || "",
            currencyId: baseDataForNewOrCopy.currencyId,
            currency: baseDataForNewOrCopy.currency,
            statusId: baseDataForNewOrCopy.statusId,
            statusName: baseDataForNewOrCopy.statusName,
            templateId: baseDataForNewOrCopy.templateId,
          });
        }
      } catch (error) {
        console.error("Error fetching initial data:", error);
        setNotification({
          open: true,
          message: "Failed to load initial data",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [params.id, isEdit, isCopy, listSize]);

  useEffect(() => {
    handleCalculateTotal();
  }, [formData.items, formData.taxRate, formData.discountRate]);

  useEffect(() => {
    const loadTemplateForForm = async () => {
      const templateId = formData.templateId;

      if (!templateId) {
        if (selectedTemplate !== null) {
          setSelectedTemplate(null);
        }
        return;
      }

      if (selectedTemplate?.id === templateId) {
        return;
      }

      try {
        const templateDto = await getInvoiceTemplateById(templateId);
        if (templateDto) {
          setTemplateFromDto(templateDto);
        }
      } catch (error) {
        console.error('Error loading template for invoice form:', error);
      }
    };

    loadTemplateForForm();
  }, [formData.templateId, selectedTemplate]);

  const mapInvoiceDataToForm = (invoiceData, availableCurrencies, availableStatuses) => {
    let symbol = '$';
    const currenciesToUse = availableCurrencies || currencies;
    const statusesToUse = availableStatuses || statuses;
    if (invoiceData.currency?.symbol) {
      symbol = invoiceData.currency.symbol;
    } else if (invoiceData.currencyId && currenciesToUse.length > 0) {
      const foundCurrency = currenciesToUse.find(c => c.id === invoiceData.currencyId);
      if (foundCurrency) {
        symbol = foundCurrency.symbol;
      }
    }

    const currentStatus = statusesToUse.find(s => s.statusId === invoiceData.statusId) || { statusId: 1, name: 'Draft' };

    setFormData({
      id: invoiceData.id,
      invoiceNumber: invoiceData.invoiceNumber,
      dateOfIssue: invoiceData.dateOfIssue ? new Date(invoiceData.dateOfIssue).toISOString().split('T')[0] : "",
      dueDate: invoiceData.dueDate ? new Date(invoiceData.dueDate).toISOString().split('T')[0] : "",
      billTo: invoiceData.billTo,
      billToEmail: invoiceData.billToEmail,
      billToAddress: invoiceData.billToAddress,
      billFrom: invoiceData.billFrom,
      billFromEmail: invoiceData.billFromEmail,
      address: invoiceData.billFromAddress,
      notes: invoiceData.notes,
      subTotal: invoiceData.subTotal?.toFixed(2) || "0.00",
      taxRate: invoiceData.taxRate || 0,
      taxAmount: invoiceData.taxAmount?.toFixed(2) || "0.00",
      discountRate: invoiceData.discountRate || 0,
      discountAmount: invoiceData.discountAmount?.toFixed(2) || "0.00",
      total: invoiceData.total?.toFixed(2) || "0.00",
      currencyId: invoiceData.currencyId,
      currency: symbol,
      companyName: invoiceData.companyName,
      companyNo: invoiceData.companyNo,
      vatNo: invoiceData.vatNo,
      ticNo: invoiceData.ticNo,
      website: invoiceData.website,
      companyEmail: invoiceData.companyEmail,
      companyLogo: invoiceData.logo,
      companyLogoMimeType: invoiceData.logoMimeType, // Added for MIME type
      bankName: invoiceData.bankName,
      accountName: invoiceData.accountName,
      accountNo: invoiceData.accountNo,
      swift: invoiceData.swift,
      iban: invoiceData.iban,      items: invoiceData.items?.map(item => ({
        itemId: item.id || `temp-${Date.now()}`,
        itemName: item.title || "",
        itemDescription: item.description,
        itemPrice: (item.unitPrice !== undefined ? parseFloat(item.unitPrice).toFixed(2) : "0.00"),
        itemQuantity: item.quantity || 1,
        productId: item.productId || null, // Preserve productId for stock management
        isCustomItem: item.isCustomItem || false
      })) || [
        {
          itemId: 0,
          itemName: "",
          itemPrice: "1.00",
          itemQuantity: 1,
        },
      ],
      statusId: currentStatus.statusId,
      statusName: currentStatus.name,
      templateId: invoiceData.templateId || null,
      documentTypeId: invoiceData.documentTypeId || 1,
    });
  };

  const handleRowDel = (itemToDelete) => {
    const updatedItems = formData.items.filter(
      (item) => item.itemId !== itemToDelete.itemId
    );
    setFormData({ ...formData, items: updatedItems });
    handleCalculateTotal();
  };
  const handleAddEvent = () => {
    const id = (+new Date() + Math.floor(Math.random() * 999999)).toString(36);
    const newItem = {
      itemId: id,
      itemName: "",
      itemPrice: "1.00",
      itemQuantity: 1,
    };
    setFormData({
      ...formData,
      items: [...formData.items, newItem],
    });
    handleCalculateTotal();
  };

  const handleProductAdd = (product) => {
    // Add product from catalog to invoice items
    setFormData(prevFormData => ({
      ...prevFormData,
      items: [...prevFormData.items, product],
    }));
    handleCalculateTotal();
  };

  const handleCalculateTotal = () => {
    setFormData((prevFormData) => {
      let subTotal = 0;
      prevFormData.items.forEach((item) => {
        const itemPrice = parseFloat(String(item.itemPrice).replace(/[^\d.-]/g, '')) || 0;
        const itemQuantity = parseInt(String(item.itemQuantity).replace(/[^\d.-]/g, '')) || 0;
        subTotal += itemPrice * itemQuantity;
      });
      
      const taxRate = parseFloat(prevFormData.taxRate) || 0;
      const discountRate = parseFloat(prevFormData.discountRate) || 0;
      
      const taxAmount = (subTotal * (taxRate / 100)).toFixed(2);
      const discountAmount = (subTotal * (discountRate / 100)).toFixed(2);
      
      const total = (
        subTotal -
        parseFloat(discountAmount) +
        parseFloat(taxAmount)
      ).toFixed(2);

      return {
        ...prevFormData,
        subTotal: subTotal.toFixed(2),
        taxAmount,
        discountAmount,
        total,
      };
    });
  };

  const onItemizedItemEdit = (evt, id) => {
    const updatedItems = formData.items.map((oldItem) => {
      if (oldItem.itemId === id) {
        return { ...oldItem, [evt.target.name]: evt.target.value };
      }
      return oldItem;
    });
    setFormData({ ...formData, items: updatedItems });
    handleCalculateTotal();
  };

  const loadTemplateForDocumentType = async (documentTypeId) => {
    try {
      const activeTemplateData = await getActiveInvoiceTemplate(documentTypeId);
      if (activeTemplateData) {
        console.log('Loading template for document type:', documentTypeId, activeTemplateData.name);
        setTemplateFromDto(activeTemplateData);
        setFormData(prev => ({ ...prev, templateId: activeTemplateData.id }));
      }
    } catch (error) {
      console.error('Error loading template for document type:', error);
    }
  };

  const editField = async (name, value) => {
    setFormData({ ...formData, [name]: value });
    
    // If document type changes, update the active template
    if (name === 'documentTypeId') {
      await loadTemplateForDocumentType(value);
    }
    
    handleCalculateTotal();
  };

  const onCurrencyChange = (selectedCurrencyId) => {
    const selectedCurrency = currencies.find(c => c.id === selectedCurrencyId);
    if (selectedCurrency) {
      setFormData(prevData => ({ 
        ...prevData, 
        currencyId: selectedCurrencyId,
        currency: selectedCurrency.symbol,
      }));
    }
  };

  const handleStatusChange = async (newStatusId) => {
    if (!isEdit || !params.id) return;

    const selectedStatus = statuses.find(s => s.statusId === newStatusId);
    if (!selectedStatus) return;

    setLoading(true);
    try {
      await updateInvoiceStatus(params.id, newStatusId);
      setFormData(prevData => ({
        ...prevData,
        statusId: newStatusId,
        statusName: selectedStatus.name,
      }));
      dispatch(updateReduxInvoiceStatus({ id: params.id, statusId: newStatusId, statusName: selectedStatus.name }));
      setNotification({
        open: true,
        message: "Invoice status updated successfully!",
        severity: "success",
      });
    } catch (error) {
      console.error("Error updating invoice status:", error);
      setNotification({
        open: true,
        message: `Failed to update status: ${error.message}`,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClientSelectionModeChange = (mode) => {
    setClientSelectionMode(mode);
    if (mode === "manual") {
      setSelectedClientId("");
      // Keep existing manual data
    }
  };

  const handleClientSelect = (event, selectedClient) => {
    if (selectedClient) {
      setSelectedClientId(selectedClient.id);
      setFormData(prevData => ({
        ...prevData,
        billTo: selectedClient.name || "",
        billToEmail: selectedClient.email || "",
        billToAddress: `${selectedClient.address || ""} ${selectedClient.city || ""} ${selectedClient.state || ""} ${selectedClient.postalCode || ""}`.trim() || ""
      }));
    } else {
      setSelectedClientId("");
      // Keep existing form data when clearing selection
    }
  };

  const openModal = (event) => {
    event.preventDefault();
    handleCalculateTotal();
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false,
    });
  };

  const prepareInvoiceDataForAPI = () => {
    const ensureValidDate = (dateString) => {
      const date = new Date(dateString);
      if (dateString && !isNaN(date.getTime())) {
        return date.toISOString();
      } 
      return new Date().toISOString(); 
    };

    return {
      dateOfIssue: ensureValidDate(formData.dateOfIssue),
      dueDate: ensureValidDate(formData.dueDate || formData.dateOfIssue),
      billTo: formData.billTo,
      billToEmail: formData.billToEmail,
      billToAddress: formData.billToAddress,
      billFrom: formData.billFrom,
      billFromEmail: formData.billFromEmail,
      BillFromAddress: formData.address,
      notes: formData.notes,
      subTotal: parseFloat(formData.subTotal) || 0,
      taxRate: parseFloat(formData.taxRate) || 0,
      taxAmount: parseFloat(formData.taxAmount) || 0,
      discountRate: parseFloat(formData.discountRate) || 0,
      discountAmount: parseFloat(formData.discountAmount) || 0,
      total: parseFloat(formData.total) || 0,
      currencyId: formData.currencyId,
      companyName: formData.companyName,
      companyNo: formData.companyNo,
      vatNo: formData.vatNo,
      ticNo: formData.ticNo,
      website: formData.website,
      companyEmail: formData.companyEmail,
      logo: formData.companyLogo,
      logoMimeType: formData.companyLogoMimeType, // Added for MIME type
      bankName: formData.bankName,
      accountName: formData.accountName,
      accountNo: formData.accountNo,
      swift: formData.swift,
      iban: formData.iban,
      StatusId: formData.statusId || 1,
      TemplateId: formData.templateId,
      DocumentTypeId: formData.documentTypeId || 1,
      items: formData.items.map(item => ({
        ProductId: item.productId || null,
        Title: item.itemName || "",
        Description: item.itemDescription,
        Quantity: parseInt(item.itemQuantity) || 1,
        UnitPrice: parseFloat(item.itemPrice) || 0
      }))
    };
  };
  

  const handleAddInvoice = async () => {
    try {
      setLoading(true);
      const invoiceData = prepareInvoiceDataForAPI();
      
      let result;
      if (isEdit) {
        result = await updateInvoice(params.id, invoiceData);
        dispatch(updateReduxInvoice({ id: params.id, updatedInvoice: formData }));
        setNotification({
          open: true,
          message: "Invoice updated successfully 🥳",
          severity: "success",
        });
      } else {
        result = await createInvoice(invoiceData);
        dispatch(addInvoice(formData));
        setNotification({
          open: true,
          message: "Invoice added successfully 🥳",
          severity: "success",
        });
      }
      
      setTimeout(() => {
        navigate("/");
      }, 2000);
      
    } catch (error) {
      console.error("Error saving invoice:", error);
      setNotification({
        open: true,
        message: `Failed to ${isEdit ? "update" : "create"} invoice: ${error.message}`,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyInvoice = () => {
    const receivedInvoice = getOneInvoice(copyId);
    if (receivedInvoice) {
      setFormData({
        ...receivedInvoice,
        id: formData.id,
        invoiceNumber: formData.invoiceNumber,
        templateId: receivedInvoice.templateId || formData.templateId,
      });
    } else {
      setNotification({
        open: true,
        message: "Invoice does not exist!",
        severity: "error",
      });
    }
  };

  const getCompanyInfo = () => {
    return {
      name: formData.companyName || formData.billFrom,
      companyNo: formData.companyNo,
      vatNo: formData.vatNo,
      ticNo: formData.ticNo,
      website: formData.website,
      email: formData.companyEmail,
    };
  };

  const getBankInfo = () => {
    return {
      bankName: formData.bankName,
      accountName: formData.accountName,
      accountNo: formData.accountNo,
      swift: formData.swift,
      iban: formData.iban,
    };
  };

  if (loading && currencies.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }  return (
    <Box sx={{ 
      minHeight: '100vh', 
      backgroundColor: '#f8fafc',
      backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3), transparent 50.2%), radial-gradient(circle at 80% 20%, rgba(120, 119, 198, 0.15), transparent 50.2%), radial-gradient(circle at 40% 80%, rgba(120, 119, 198, 0.1), transparent 50.2%)',
      py: 2
    }}>
      <form onSubmit={openModal} style={{ maxWidth: '100%' }}><Box sx={{ 
          display: "flex", 
          alignItems: "center",
          width: '100%',
          maxWidth: '1200px',
          margin: '0 auto',
          px: { xs: 2, sm: 3, md: 4 }
        }}>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            padding: '8px 16px',
            borderRadius: '8px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
            }
          }}>
            <BiArrowBack size={18} color="white" />
            <Link to="/" style={{ textDecoration: "none", color: "white", marginLeft: '8px' }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Go Back
              </Typography>
            </Link>
          </Box>
        </Box>        <Box sx={{ 
          width: '100%', 
          maxWidth: '1200px', 
          margin: '0 auto',
          px: { xs: 2, sm: 3, md: 4 }
        }}>
          <Card sx={{ 
            mb: 2, 
            borderRadius: '20px',
            background: 'rgba(255, 255, 255, 0.25)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            overflow: 'visible',
            position: 'relative'
          }}>            <Box sx={{ 
              p: 3, 
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
              borderRadius: '20px 20px 0 0'
            }}>              <Typography variant="h6" component="div" sx={{ 
                fontWeight: 700, 
                color: '#2d3748',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <Box sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '14px'
                }}>
                  ⚙️
                </Box>
                Invoice Settings
              </Typography>
            </Box>              <Box sx={{ display: 'flex', flexWrap: 'wrap', p: 3, gap: 3,
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '0 0 20px 20px'
            }}>
              <FormControl sx={{ 
                minWidth: '200px', 
                flexGrow: 1, 
                maxWidth: { xs: '100%', sm: '220px' },
                '& .MuiOutlinedInput-root': {
                  background: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '12px',
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.25)'
                  }
                }
              }}>
                <InputLabel 
                  id="currency-select-label" 
                  sx={{ 
                    fontSize: "0.9rem",
                    color: '#4a5568',
                    fontWeight: 600,
                    '&.Mui-focused': { color: '#667eea' }
                  }}
                >
                  💰 Currency
                </InputLabel>
                <Select
                  labelId="currency-select-label"
                  label="💰 Currency"
                  onChange={(event) => onCurrencyChange(event.target.value)}
                  value={formData.currencyId}
                  size="medium"
                  sx={{
                    '.MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                      borderWidth: '2px'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(102, 126, 234, 0.5)'
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#667eea',
                      borderWidth: '2px'
                    },
                    '& .MuiSelect-select': {
                      color: '#2d3748',
                      fontWeight: 600
                    }
                  }}
                >
                  {currencies.map(currency => (
                    <MenuItem key={currency.id} value={currency.id}>
                      {currency.symbol} {currency.name} ({currency.code})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>              {isEdit && statuses.length > 0 && (
                <FormControl sx={{ 
                  minWidth: 150, 
                  maxWidth: { xs: '100%', sm: 200 },
                  '& .MuiOutlinedInput-root': {
                    background: 'rgba(255, 255, 255, 0.15)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '12px',
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.25)'
                    }
                  }
                }} size="small">
                  <InputLabel id="status-select-label" sx={{ 
                    color: '#4a5568',
                    fontWeight: 600,
                    '&.Mui-focused': { color: '#667eea' }
                  }}>
                    📊 Status
                  </InputLabel>
                  <Select
                    labelId="status-select-label"
                    label="📊 Status"
                    value={formData.statusId || ''}
                    onChange={(event) => handleStatusChange(event.target.value)}
                    disabled={loading}
                    sx={{
                      '.MuiOutlinedInput-notchedOutline': { 
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                        borderWidth: '2px'
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': { 
                        borderColor: 'rgba(102, 126, 234, 0.5)' 
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { 
                        borderColor: '#667eea',
                        borderWidth: '2px'
                      },
                      '& .MuiSelect-select': {
                        color: '#2d3748',
                        fontWeight: 600
                      }
                    }}
                  >
                    {statuses.map(status => (
                      <MenuItem key={status.statusId} value={status.statusId}>
                        {status.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}              <FormControl sx={{ 
                minWidth: '180px', 
                flexGrow: 1, 
                maxWidth: { xs: '100%', sm: '220px' },
                '& .MuiOutlinedInput-root': {
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '12px'
                },
                '.MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  borderWidth: '2px'
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(102, 126, 234, 0.5)'
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#667eea',
                  borderWidth: '2px'
                }
              }}>
                <InputLabel 
                  id="tax-rate-select-label" 
                  sx={{ 
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    color: '#4a5568',
                    '&.Mui-focused': { color: '#667eea' }
                  }}
                >
                  🧾 VAT Rate
                </InputLabel>
                <Select
                  labelId="tax-rate-select-label"
                  label="🧾 VAT Rate"
                  name="taxRate"
                  value={formData.taxRate}
                  onChange={(e) => editField(e.target.name, e.target.value)}
                  size="medium"
                  sx={{
                    '& .MuiSelect-select': {
                      color: '#2d3748',
                      fontWeight: 600
                    }
                  }}
                >
                  <MenuItem value={0}>0%</MenuItem>
                  <MenuItem value={19}>19%</MenuItem>
                </Select>
              </FormControl><TextField
                name="discountRate"
                type="number"
                value={formData.discountRate}
                onChange={(e) => editField(e.target.name, e.target.value)}
                placeholder="0.0"
                label="💸 Discount Rate"
                variant="outlined"
                size="small"
                sx={{
                  minWidth: '180px',
                  flexGrow: 1,
                  maxWidth: { xs: '100%', sm: '220px' },
                  '& .MuiOutlinedInput-root': {
                    background: 'rgba(255, 255, 255, 0.15)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '12px'
                  },
                  '.MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    borderWidth: '2px'
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(102, 126, 234, 0.5)'
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#667eea',
                    borderWidth: '2px'
                  },
                  '& .MuiInputLabel-root': {
                    color: '#4a5568',
                    fontWeight: 600,
                    '&.Mui-focused': { color: '#667eea' }
                  },
                  '& .MuiInputBase-input': {
                    color: '#2d3748',
                    fontWeight: 500
                  }
                }}
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
              />
            </Box>
          </Card>
        </Box>        <Box sx={{ 
          width: '100%', 
          maxWidth: '1200px', 
          margin: '0 auto',
          px: { xs: 2, sm: 3, md: 4 }
        }}>
          <Grid container spacing={{ xs: 2, md: 3 }}>            <Grid item xs={12} md={8} lg={9}>
              <Card
                sx={{
                  p: { xs: 3, md: 4 },
                  my: { xs: 2, md: 3 },
                  background: 'rgba(255, 255, 255, 0.25)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.18)',
                  borderRadius: '20px',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                  color: "#2d3748"
                }}
              >              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  justifyContent: "space-between",
                  alignItems: { xs: "flex-start", sm: "flex-start" },
                  mb: 4,
                  gap: 3,
                  padding: '20px',
                  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                  borderRadius: '16px',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
              >
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {/* Document Type Selection */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Typography sx={{ 
                      fontWeight: 700, 
                      minWidth: "120px",
                      color: '#2d3748',
                      fontSize: '0.95rem'
                    }}>
                      📋 Document Type:
                    </Typography>
                    <FormControl size="small" sx={{ minWidth: 200 }}>
                      <Select
                        value={formData.documentTypeId}
                        onChange={(e) => editField('documentTypeId', e.target.value)}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            background: 'rgba(255, 255, 255, 0.2)',
                            backdropFilter: 'blur(10px)',
                            borderRadius: '12px'
                          },
                          '.MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(255, 255, 255, 0.3)',
                            borderWidth: '2px'
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(102, 126, 234, 0.5)'
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#667eea',
                            borderWidth: '2px'
                          },
                          '& .MuiInputBase-input': {
                            color: '#2d3748',
                            fontWeight: 500
                          }
                        }}
                      >
                        {documentTypes.map((type) => (
                          <MenuItem key={type.id} value={type.id}>
                            {type.displayName}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Typography sx={{ 
                      fontWeight: 700, 
                      minWidth: "120px",
                      color: '#2d3748',
                      fontSize: '0.95rem'
                    }}>
                      📅 Issue Date:
                    </Typography>
                    <TextField
                      type="date"
                      name="currentDate"
                      value={formData.currentDate}
                      onChange={(e) => editField(e.target.name, e.target.value)}
                      size="small"
                      sx={{ 
                        width: "160px",
                        '& .MuiOutlinedInput-root': {
                          background: 'rgba(255, 255, 255, 0.2)',
                          backdropFilter: 'blur(10px)',
                          borderRadius: '12px'
                        },
                        '.MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255, 255, 255, 0.3)',
                          borderWidth: '2px'
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(102, 126, 234, 0.5)'
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#667eea',
                          borderWidth: '2px'
                        },
                        '& .MuiInputBase-input': {
                          color: '#2d3748',
                          fontWeight: 500
                        }
                      }}
                    />
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Typography sx={{ 
                      fontWeight: 700, 
                      minWidth: "120px",
                      color: '#2d3748',
                      fontSize: '0.95rem'
                    }}>
                      ⏰ Due Date:
                    </Typography>
                    <TextField
                      type="date"
                      name="dateOfIssue"
                      value={formData.dateOfIssue}
                      onChange={(e) => editField(e.target.name, e.target.value)}
                      required
                      size="small"
                      sx={{ 
                        width: "160px",
                        '& .MuiOutlinedInput-root': {
                          background: 'rgba(255, 255, 255, 0.2)',
                          backdropFilter: 'blur(10px)',
                          borderRadius: '12px'
                        },
                        '.MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255, 255, 255, 0.3)',
                          borderWidth: '2px'
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(102, 126, 234, 0.5)'
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#667eea',
                          borderWidth: '2px'
                        },
                        '& .MuiInputBase-input': {
                          color: '#2d3748',
                          fontWeight: 500
                        }
                      }}
                    />
                  </Box>
                </Box>
              </Box>              <Divider sx={{ 
                my: 3, 
                borderColor: "rgba(102, 126, 234, 0.2)",
                '&::before, &::after': {
                  borderColor: "rgba(102, 126, 234, 0.2)"
                }
              }} />

              <Grid container spacing={{ xs: 2, sm: 3 }}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{
                    p: 3,
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.03), rgba(118, 75, 162, 0.03))',
                    border: '1px solid rgba(102, 126, 234, 0.08)'
                  }}>                    <Typography component="div" sx={{ 
                      fontWeight: 700, 
                      mb: 2,
                      color: '#2d3748',
                      fontSize: '1.1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}>
                      <Box sx={{
                        width: 24,
                        height: 24,
                        borderRadius: '6px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '12px'
                      }}>
                        📧
                      </Box>
                      Bill To:
                    </Typography>

                    {/* Client Selection Mode Toggle */}
                    <Box sx={{ mb: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Button
                        variant={clientSelectionMode === "select" ? "contained" : "outlined"}
                        size="small"
                        onClick={() => handleClientSelectionModeChange("select")}
                        sx={{
                          borderRadius: '8px',
                          textTransform: 'none',
                          fontSize: '0.8rem',
                          backgroundColor: clientSelectionMode === "select" ? '#667eea' : 'transparent',
                          borderColor: '#667eea',
                          color: clientSelectionMode === "select" ? 'white' : '#667eea',
                          '&:hover': {
                            backgroundColor: clientSelectionMode === "select" ? '#5a67d8' : 'rgba(102, 126, 234, 0.1)'
                          }
                        }}
                      >
                        👥 Select Client
                      </Button>
                      <Button
                        variant={clientSelectionMode === "manual" ? "contained" : "outlined"}
                        size="small"
                        onClick={() => handleClientSelectionModeChange("manual")}
                        sx={{
                          borderRadius: '8px',
                          textTransform: 'none',
                          fontSize: '0.8rem',
                          backgroundColor: clientSelectionMode === "manual" ? '#667eea' : 'transparent',
                          borderColor: '#667eea',
                          color: clientSelectionMode === "manual" ? 'white' : '#667eea',
                          '&:hover': {
                            backgroundColor: clientSelectionMode === "manual" ? '#5a67d8' : 'rgba(102, 126, 234, 0.1)'
                          }
                        }}
                      >
                        ✏️ Manual Entry
                      </Button>
                    </Box>

                    {/* Client Selection Dropdown */}
                    {clientSelectionMode === "select" && (
                      <Autocomplete
                        fullWidth
                        options={clients}
                        value={clients.find(client => client.id === selectedClientId) || null}
                        onChange={handleClientSelect}
                        getOptionLabel={(option) => option.name || ""}
                        isOptionEqualToValue={(option, value) => option.id === value?.id}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="🔍 Search & Select Client"
                            placeholder="Type to search clients..."
                            size="small"
                            sx={{
                              mb: 2,
                              '& .MuiOutlinedInput-root': {
                                background: 'rgba(255, 255, 255, 0.2)',
                                backdropFilter: 'blur(10px)',
                                borderRadius: '12px'
                              },
                              '.MuiOutlinedInput-notchedOutline': {
                                borderColor: 'rgba(255, 255, 255, 0.3)',
                                borderWidth: '2px'
                              },
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'rgba(102, 126, 234, 0.5)'
                              },
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#667eea',
                                borderWidth: '2px'
                              },
                              '& .MuiInputBase-input': {
                                color: '#2d3748',
                                fontWeight: 500
                              },
                              '& .MuiInputLabel-root': {
                                fontSize: "0.9rem",
                                color: '#4a5568',
                                fontWeight: 600,
                                '&.Mui-focused': { color: '#667eea' }
                              }
                            }}
                          />
                        )}
                        renderOption={(props, option) => (
                          <Box component="li" {...props} key={option.id}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                              <Typography variant="body1" sx={{ fontWeight: 600, color: '#2d3748' }}>
                                {option.name}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#6b7280' }}>
                                📧 {option.email} {option.company && `• 🏢 ${option.company}`}
                              </Typography>
                              {option.phone && (
                                <Typography variant="caption" sx={{ color: '#6b7280' }}>
                                  📞 {option.phone}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        )}
                        filterOptions={(options, { inputValue }) => {
                          const filtered = options.filter((option) =>
                            option.name?.toLowerCase().includes(inputValue.toLowerCase()) ||
                            option.email?.toLowerCase().includes(inputValue.toLowerCase()) ||
                            option.company?.toLowerCase().includes(inputValue.toLowerCase()) ||
                            option.phone?.includes(inputValue)
                          );
                          return filtered;
                        }}
                        noOptionsText="No clients found - try a different search term"
                        clearOnEscape
                        sx={{
                          '& .MuiAutocomplete-popupIndicator': {
                            color: '#667eea'
                          },
                          '& .MuiAutocomplete-clearIndicator': {
                            color: '#667eea'
                          }
                        }}
                      />
                    )}

                    {/* Manual Input Fields */}
                    <TextField
                      placeholder="Who is this invoice to?"
                      name="billTo"
                      value={formData.billTo}
                      onChange={(e) => editField(e.target.name, e.target.value)}
                      fullWidth
                      required
                      size="small"
                      disabled={clientSelectionMode === "select" && selectedClientId}
                      sx={{ 
                        mb: 2,
                        '& .MuiOutlinedInput-root': {
                          background: (clientSelectionMode === "select" && selectedClientId) 
                            ? 'rgba(200, 200, 200, 0.2)' 
                            : 'rgba(255, 255, 255, 0.2)',
                          backdropFilter: 'blur(10px)',
                          borderRadius: '12px'
                        },
                        '.MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255, 255, 255, 0.3)',
                          borderWidth: '2px'
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(102, 126, 234, 0.5)'
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#667eea',
                          borderWidth: '2px'
                        },
                        '& .MuiInputBase-input': {
                          color: '#2d3748',
                          fontWeight: 500
                        }
                      }}
                    />                    <TextField
                      placeholder="Email address"
                      name="billToEmail"
                      value={formData.billToEmail}
                      onChange={(e) => editField(e.target.name, e.target.value)}
                      fullWidth
                      type="email"
                      required
                      size="small"
                      disabled={clientSelectionMode === "select" && selectedClientId}
                      sx={{ 
                        mb: 2,
                        '& .MuiOutlinedInput-root': {
                          background: (clientSelectionMode === "select" && selectedClientId) 
                            ? 'rgba(200, 200, 200, 0.2)' 
                            : 'rgba(255, 255, 255, 0.2)',
                          backdropFilter: 'blur(10px)',
                          borderRadius: '12px'
                        },
                        '.MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255, 255, 255, 0.3)',
                          borderWidth: '2px'
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(102, 126, 234, 0.5)'
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#667eea',
                          borderWidth: '2px'
                        },
                        '& .MuiInputBase-input': {
                          color: '#2d3748',
                          fontWeight: 500
                        }
                      }}
                    />                    <TextField
                      placeholder="Billing address"
                      name="billToAddress"
                      value={formData.billToAddress}
                      onChange={(e) => editField(e.target.name, e.target.value)}
                      fullWidth
                      required
                      size="small"
                      disabled={clientSelectionMode === "select" && selectedClientId}
                      sx={{ 
                        mb: 2,
                        '& .MuiOutlinedInput-root': {
                          background: (clientSelectionMode === "select" && selectedClientId) 
                            ? 'rgba(200, 200, 200, 0.2)' 
                            : 'rgba(255, 255, 255, 0.2)',
                          backdropFilter: 'blur(10px)',
                          borderRadius: '12px'
                        },
                        '.MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255, 255, 255, 0.3)',
                          borderWidth: '2px'
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(102, 126, 234, 0.5)'
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#667eea',
                          borderWidth: '2px'
                        },
                        '& .MuiInputBase-input': {
                          color: '#2d3748',
                          fontWeight: 500
                        }
                      }}
                    />

                    {/* Show selected client info when in select mode */}
                    {clientSelectionMode === "select" && selectedClientId && (
                      <Box sx={{ 
                        mt: 2, 
                        p: 2, 
                        backgroundColor: 'rgba(102, 126, 234, 0.1)', 
                        borderRadius: '8px',
                        border: '1px solid rgba(102, 126, 234, 0.2)'
                      }}>
                        <Typography variant="caption" sx={{ color: '#667eea', fontWeight: 600, mb: 1, display: 'block' }}>
                          📋 Selected Client Details:
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                          <strong>Name:</strong> {formData.billTo}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                          <strong>Email:</strong> {formData.billToEmail}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Address:</strong> {formData.billToAddress}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Grid>                <Grid item xs={12} sm={6}>
                  <Box sx={{
                    padding: '20px',
                    background: 'rgba(118, 75, 162, 0.05)',
                    borderRadius: '16px',
                    border: '1px solid rgba(118, 75, 162, 0.1)',
                    height: '100%'
                  }}>                    <Typography component="div" sx={{ 
                      fontWeight: 700, 
                      mb: 2,
                      color: '#2d3748',
                      fontSize: '1.1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}>
                      <Box sx={{
                        width: 24,
                        height: 24,
                        borderRadius: '6px',
                        background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '12px'
                      }}>
                        🏢
                      </Box>
                      Bill From:
                    </Typography><TextField
                      placeholder="Who is this invoice from?"
                      name="billFrom"
                      value={formData.billFrom}
                      onChange={(e) => editField(e.target.name, e.target.value)}
                      fullWidth
                      required
                      size="small"
                      sx={{ 
                        mb: 2,
                        '& .MuiOutlinedInput-root': {
                          background: 'rgba(255, 255, 255, 0.2)',
                          backdropFilter: 'blur(10px)',
                          borderRadius: '12px'
                        },
                        '.MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255, 255, 255, 0.3)',
                          borderWidth: '2px'
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(118, 75, 162, 0.5)'
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#764ba2',
                          borderWidth: '2px'
                        },
                        '& .MuiInputBase-input': {
                          color: '#2d3748',
                          fontWeight: 500
                        }
                      }}
                    />                    <TextField
                      placeholder="Email address"
                      name="billFromEmail"
                      value={formData.billFromEmail}
                      onChange={(e) => editField(e.target.name, e.target.value)}
                      fullWidth
                      type="email"
                      required
                      size="small"
                      sx={{ 
                        mb: 2,
                        '& .MuiOutlinedInput-root': {
                          background: 'rgba(255, 255, 255, 0.2)',
                          backdropFilter: 'blur(10px)',
                          borderRadius: '12px'
                        },
                        '.MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255, 255, 255, 0.3)',
                          borderWidth: '2px'
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(118, 75, 162, 0.5)'
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#764ba2',
                          borderWidth: '2px'
                        },
                        '& .MuiInputBase-input': {
                          color: '#2d3748',
                          fontWeight: 500
                        }
                      }}
                    />                    <TextField
                      placeholder="Billing address"
                      name="address"
                      value={formData.address}
                      onChange={(e) => editField(e.target.name, e.target.value)}
                      fullWidth
                      required
                      size="small"
                      sx={{ 
                        mb: 2,
                        '& .MuiOutlinedInput-root': {
                          background: 'rgba(255, 255, 255, 0.2)',
                          backdropFilter: 'blur(10px)',
                          borderRadius: '12px'
                        },
                        '.MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255, 255, 255, 0.3)',
                          borderWidth: '2px'
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(118, 75, 162, 0.5)'
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#764ba2',
                          borderWidth: '2px'
                        },
                        '& .MuiInputBase-input': {
                          color: '#2d3748',
                          fontWeight: 500
                        }
                      }}
                    /></Box>
                </Grid>
              </Grid>

              <InvoiceItem
                onItemizedItemEdit={onItemizedItemEdit}
                onRowAdd={handleAddEvent}
                onRowDel={handleRowDel}
                onProductAdd={handleProductAdd}
                currency={formData.currency}
                items={formData.items}
              />

              <Box sx={{ mt: 4 }}>
                <Grid container justifyContent="flex-end">
                  <Grid sx={{ width: { xs: '100%', md: '50%' } }}>
                    <Box sx={{
                      p: 3,
                      borderRadius: '16px',
                      background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05))',
                      border: '1px solid rgba(102, 126, 234, 0.1)'
                    }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 2
                        }}
                      >
                        <Typography sx={{ fontWeight: 600, color: '#4a5568' }}>Subtotal:</Typography>
                        <Typography sx={{ fontWeight: 600, color: '#2d3748' }}>
                          {formData.currency}{formData.subTotal}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 2,
                        }}
                      >
                        <Typography sx={{ fontWeight: 600, color: '#4a5568' }}>Discount:</Typography>
                        <Typography sx={{ fontWeight: 600, color: '#2d3748' }}>
                          <Typography component="span" sx={{ fontSize: "0.85rem", color: '#718096', mr: 1 }}>
                            ({formData.discountRate || 0}%)
                          </Typography>
                          {formData.currency}{formData.discountAmount || 0}
                        </Typography>
                      </Box>
                      {parseFloat(formData.taxRate) > 0 && (
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 2,
                          }}
                        >
                          <Typography sx={{ fontWeight: 600, color: '#4a5568' }}>Tax:</Typography>
                          <Typography sx={{ fontWeight: 600, color: '#2d3748' }}>
                            <Typography component="span" sx={{ fontSize: "0.85rem", color: '#718096', mr: 1 }}>
                              ({formData.taxRate || 0}%)
                            </Typography>
                            {formData.currency}{formData.taxAmount || 0}
                          </Typography>
                        </Box>
                      )}
                      <Divider sx={{ my: 2, borderColor: "rgba(102, 126, 234, 0.2)" }} />
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          fontSize: "1.2rem",
                          fontWeight: "bold",
                        }}
                      >
                        <Typography sx={{ fontSize: "1.2rem", fontWeight: 700, color: '#2d3748' }}>Total:</Typography>
                        <Typography sx={{ fontSize: "1.2rem", fontWeight: 700, color: '#667eea' }}>
                          {formData.currency}{formData.total || 0}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              <Box sx={{ mt: 4 }}>
                <Typography sx={{ 
                  fontWeight: 600, 
                  mb: 2,
                  color: '#2d3748',
                  fontSize: '1.1rem'
                }}>
                  Notes:
                </Typography>                <TextField
                  placeholder="Thanks for your business! (Optional)"
                  name="notes"
                  value={formData.notes}
                  onChange={(e) => editField(e.target.name, e.target.value)}
                  fullWidth
                  multiline
                  rows={3}
                  size="small"
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      background: 'rgba(255, 255, 255, 0.2)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: '12px'
                    },
                    '.MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                      borderWidth: '2px'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(118, 75, 162, 0.5)'
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#764ba2',
                      borderWidth: '2px'
                    },
                    '& .MuiInputBase-input': {
                      color: '#2d3748',
                      fontWeight: 500
                    }
                  }}
                />
              </Box>
            </Card>
          </Grid>        <Grid item xs={12} md={4} lg={3}>
          <Box
            sx={{
              position: "sticky",
              top: { xs: 16, md: 24 },
              pt: { xs: 2, md: 3 },
            }}
          >
            <InvoiceModal
              showModal={isOpen}
              closeModal={closeModal}
              info={{
                isOpen,
                id: formData.id,
                currency: formData.currency,
                currentDate: formData.currentDate,
                invoiceNumber: formData.invoiceNumber,
                dateOfIssue: formData.dateOfIssue,
                billTo: formData.billTo,
                billToEmail: formData.billToEmail,
                billToAddress: formData.billToAddress,
                billFrom: formData.billFrom,
                billFromEmail: formData.billFromEmail,
                billFromAddress: formData.address,
                address: formData.address,
                notes: formData.notes,
                total: formData.total,
                subTotal: formData.subTotal,
                taxRate: formData.taxRate,
                taxAmount: formData.taxAmount,
                discountRate: formData.discountRate,
                discountAmount: formData.discountAmount,
                documentTypeId: formData.documentTypeId,
              }}
              items={formData.items}
              currency={formData.currency}
              subTotal={formData.subTotal}
              taxAmount={formData.taxAmount}
              discountAmount={formData.discountAmount}
              total={formData.total}
              logo={formData.companyLogo || "https://via.placeholder.com/120x120?text=Your+Logo"}
              logoMimeType={formData.companyLogoMimeType}
              companyInfo={getCompanyInfo()}
              bankInfo={getBankInfo()}
              templateConfig={selectedTemplate?.parsedConfig}
              templateMeta={selectedTemplate}
            />
          </Box>
        </Grid>
      </Grid>
      </Box>
        <Box sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '20px 24px',
        background: 'rgba(255, 255, 255, 0.25)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.18)',
        boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        justifyContent: 'center',
        zIndex: 1000,
      }}>
        <Box sx={{ 
          display: 'flex', 
          gap: 3, 
          width: '100%',
          maxWidth: '1200px',
          justifyContent: { xs: 'center', sm: 'flex-end' },
        }}>
          <Button
            variant="outlined"
            type="submit"
            sx={{ 
              minWidth: '160px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: 'transparent',
              borderColor: '#667eea',
              color: '#667eea',
              fontWeight: 600,
              fontSize: '0.95rem',
              textTransform: 'none',
              border: '2px solid #667eea',
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                borderColor: '#667eea',
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)'
              }
            }}
            disabled={loading}
          >
            📄 Preview Invoice
          </Button>
          <Button
            variant="contained"
            onClick={handleAddInvoice}
            sx={{ 
              minWidth: '180px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              fontWeight: 600,
              fontSize: '0.95rem',
              textTransform: 'none',
              border: 'none',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 30px rgba(102, 126, 234, 0.4)'
              }
            }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : (isEdit ? "💾 Update Invoice" : "💾 Save Invoice")}
          </Button>
        </Box>
      </Box>
      
      <Box sx={{ height: '100px', width: '100%' }} />

      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity} 
          sx={{ 
            width: '100%',
            borderRadius: '12px',
            fontWeight: 500,
            '&.MuiAlert-standardSuccess': {
              backgroundColor: '#f0fff4',
              color: '#22543d',
              border: '1px solid #9ae6b4'
            },
            '&.MuiAlert-standardError': {
              backgroundColor: '#fed7d7',
              color: '#742a2a',
              border: '1px solid #fc8181'
            }
          }}        >
          {notification.message}
        </Alert>
      </Snackbar>
      </form>
    </Box>
  );
};

export default InvoiceForm;
