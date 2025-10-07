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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { BiArrowBack } from "react-icons/bi";
import {
  CloudDownload as DownloadIcon,
  Email as EmailIcon,
  AttachFile as AttachIcon,
  Send as SendIcon,
  Info as InfoIcon
} from "@mui/icons-material";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import InvoiceItem from "../InvoicePage/InvoiceItem";
import InvoiceModal from "../InvoicePage/InvoiceModal";
import { updateInvoice as updateReduxInvoice, updateInvoiceStatus as updateReduxInvoiceStatus } from "../../redux/invoicesSlice";
import { 
  getAllCurrencies, 
  updateInvoice, 
  getAllStatuses, 
  updateInvoiceStatus,
  getActiveInvoiceTemplate,
  getInvoiceTemplateById
} from "../InvoicePage/api";

const InvoiceViewForm = ({ invoice, isEditMode, invoiceId }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [editMode, setEditMode] = useState(isEditMode);
  const [currencies, setCurrencies] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [sendConfirmDialog, setSendConfirmDialog] = useState(false);
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

  const [formData, setFormData] = useState({
    id: invoice?.id || '',
    invoiceNumber: invoice?.invoiceNumber || '',
    currentDate: new Date().toISOString().split('T')[0],
    dateOfIssue: invoice?.dateOfIssue ? new Date(invoice.dateOfIssue).toISOString().split('T')[0] : '',
    dueDate: invoice?.dueDate ? new Date(invoice.dueDate).toISOString().split('T')[0] : '',
    billTo: invoice?.billTo || '',
    billToEmail: invoice?.billToEmail || '',
    billToAddress: invoice?.billToAddress || '',
    billFrom: invoice?.billFrom || '',
    billFromEmail: invoice?.billFromEmail || '',
    billFromAddress: invoice?.billFromAddress || '',
    notes: invoice?.notes || '',
    subTotal: invoice?.subTotal !== undefined && invoice?.subTotal !== null 
      ? parseFloat(invoice.subTotal).toFixed(2) 
      : '0.00',
    taxRate: invoice?.taxRate || 0,
    taxAmount: invoice?.taxAmount !== undefined && invoice?.taxAmount !== null 
      ? parseFloat(invoice.taxAmount).toFixed(2) 
      : '0.00',
    discountRate: invoice?.discountRate || 0,
    discountAmount: invoice?.discountAmount !== undefined && invoice?.discountAmount !== null 
      ? parseFloat(invoice.discountAmount).toFixed(2) 
      : '0.00',
    total: invoice?.total !== undefined && invoice?.total !== null 
      ? parseFloat(invoice.total).toFixed(2) 
      : '0.00',
    currency: invoice?.currency?.symbol || '$',
    currencyId: invoice?.currencyId || '',
    companyLogo: invoice?.logo || '',
    companyName: invoice?.companyName || '',
    companyNo: invoice?.companyNo || '',
    vatNo: invoice?.vatNo || '',
    ticNo: invoice?.ticNo || '',
    website: invoice?.website || '',
    companyEmail: invoice?.companyEmail || '',
    bankName: invoice?.bankName || '',
    accountName: invoice?.accountName || '',
    accountNo: invoice?.accountNo || '',
    swift: invoice?.swift || '',
    iban: invoice?.iban || '',
    statusName: invoice?.statusName || 'Draft',
    statusId: invoice?.statusId || 1,
    templateId: invoice?.templateId || null,
    isDeleted: invoice?.isDeleted || false, // Ensure isDeleted is initialized
    items: invoice?.items?.map((item, index) => ({
      itemId: item.id || `temp-${index}-${Date.now()}`,
      itemName: item.title || "",
      itemDescription: item.description || "",
      itemPrice: (item.unitPrice !== undefined && item.unitPrice !== null) 
        ? parseFloat(item.unitPrice).toFixed(2) 
        : "0.00",
      itemQuantity: item.quantity || 1,
    })) || [
      {
        itemId: `temp-default-${Date.now()}`,
        itemName: "",
        itemDescription: "",
        itemPrice: "1.00",
        itemQuantity: 1,
      },
    ],
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const [currenciesData, statusesData] = await Promise.all([
          getAllCurrencies(),
          getAllStatuses()
        ]);
        setCurrencies(currenciesData);
        setStatuses(statusesData);
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
  }, []);

  useEffect(() => {
    if (invoice) {
      let symbol = '$';
      if (invoice.currency?.symbol) {
        symbol = invoice.currency.symbol;
      } else if (invoice.currencyId && currencies.length > 0) {
        const foundCurrency = currencies.find(c => c.id === invoice.currencyId);
        if (foundCurrency) {
          symbol = foundCurrency.symbol;
        }
      }

      const currentStatus = statuses.find(s => s.statusId === invoice.statusId) || { statusId: invoice.statusId || 1, name: invoice.statusName || 'Draft' };

      const newFormData = {
        id: invoice?.id || '',
        invoiceNumber: invoice?.invoiceNumber || '',
        currentDate: new Date().toISOString().split('T')[0],
        dateOfIssue: invoice?.dateOfIssue ? new Date(invoice.dateOfIssue).toISOString().split('T')[0] : '',
        dueDate: invoice?.dueDate ? new Date(invoice.dueDate).toISOString().split('T')[0] : '',
        billTo: invoice?.billTo || '',
        billToEmail: invoice?.billToEmail || '',
        billToAddress: invoice?.billToAddress || '',
        billFrom: invoice?.billFrom || '',
        billFromEmail: invoice?.billFromEmail || '',
        billFromAddress: invoice?.billFromAddress || '',
        notes: invoice?.notes || '',
        subTotal: invoice?.subTotal !== undefined ? parseFloat(invoice.subTotal).toFixed(2) : '0.00',
        taxRate: invoice?.taxRate || 0,
        taxAmount: invoice?.taxAmount !== undefined ? parseFloat(invoice.taxAmount).toFixed(2) : '0.00',
        discountRate: invoice?.discountRate || 0,
        discountAmount: invoice?.discountAmount !== undefined ? parseFloat(invoice.discountAmount).toFixed(2) : '0.00',
        total: invoice?.total !== undefined ? parseFloat(invoice.total).toFixed(2) : '0.00',
        currency: symbol,
        currencyId: invoice?.currencyId || '',
        companyLogo: invoice?.logo || '',
        companyName: invoice?.companyName || '',
        companyNo: invoice?.companyNo || '',
        vatNo: invoice?.vatNo || '',
        ticNo: invoice?.ticNo || '',
        website: invoice?.website || '',
        companyEmail: invoice?.companyEmail || '',
        bankName: invoice?.bankName || '',
        accountName: invoice?.accountName || '',
        accountNo: invoice?.accountNo || '',
        swift: invoice?.swift || '',
        iban: invoice?.iban || '',        statusName: currentStatus.name,
        statusId: currentStatus.statusId,
        templateId: invoice?.templateId || null, // Add templateId for template loading
        isDeleted: invoice?.isDeleted || false, // Ensure isDeleted is updated
        items: invoice?.items?.map((item, index) => ({
          itemId: item.id || `temp-${index}-${Date.now()}`,
          itemName: item.title || "",
          itemDescription: item.description || "",
          itemPrice: item.unitPrice !== undefined ? parseFloat(item.unitPrice).toFixed(2) : "0.00",
          itemQuantity: item.quantity || 1,
          productId: item.productId || null, // Preserve productId for stock management
          isCustomItem: item.isCustomItem || false
        })) || [],
      };
      setFormData(newFormData);
    }
  }, [invoice, currencies, statuses]);

  // Template loading effect
  useEffect(() => {
    const loadTemplateForView = async () => {
      if (!formData.templateId) {
        // If no template ID, try to get the active template
        try {
          const activeTemplate = await getActiveInvoiceTemplate();
          if (activeTemplate) {
            setTemplateFromDto(activeTemplate);
          }
        } catch (error) {
          console.error('Error loading active template for view:', error);
        }
        return;
      }

      if (selectedTemplate?.id === formData.templateId) {
        return; // Already loaded
      }

      try {
        const templateDto = await getInvoiceTemplateById(formData.templateId);
        if (templateDto) {
          setTemplateFromDto(templateDto);
        }
      } catch (error) {
        console.error('Error loading template for view:', error);
      }
    };

    loadTemplateForView();
  }, [formData.templateId, selectedTemplate]);

  const handleRowDel = (itemToDelete) => {
    if (!editMode) return;

    setFormData(prevFormData => {
      const updatedItems = prevFormData.items.filter(
        (item) => item.itemId !== itemToDelete.itemId
      );

      let newSubTotal = 0;
      updatedItems.forEach((item) => {
        const itemPrice = parseFloat(String(item.itemPrice).replace(/[^\d.-]/g, '')) || 0;
        const itemQuantity = parseInt(String(item.itemQuantity).replace(/[^\d.-]/g, '')) || 0;
        newSubTotal += itemPrice * itemQuantity;
      });

      const taxRate = parseFloat(prevFormData.taxRate) || 0;
      const discountRate = parseFloat(prevFormData.discountRate) || 0;
      const taxAmount = (newSubTotal * (taxRate / 100)).toFixed(2);
      const discountAmount = (newSubTotal * (discountRate / 100)).toFixed(2);
      const total = (newSubTotal - parseFloat(discountAmount) + parseFloat(taxAmount)).toFixed(2);

      return {
        ...prevFormData,
        items: updatedItems,
        subTotal: newSubTotal.toFixed(2),
        taxAmount,
        discountAmount,
        total,
      };
    });
  };

  const handleAddEvent = () => {
    if (!editMode) return;

    const uniqueId = `new-item-${Date.now()}-${Math.floor(Math.random() * 999999)}`;
    const newItem = {
      itemId: uniqueId,
      itemName: "",
      itemDescription: "",
      itemPrice: "1.00",
      itemQuantity: 1,
    };

    setFormData(prevFormData => {
      const updatedItems = [...prevFormData.items, newItem];

      let newSubTotal = 0;
      updatedItems.forEach((item) => {
        const itemPrice = parseFloat(String(item.itemPrice).replace(/[^\d.-]/g, '')) || 0;
        const itemQuantity = parseInt(String(item.itemQuantity).replace(/[^\d.-]/g, '')) || 0;
        newSubTotal += itemPrice * itemQuantity;
      });

      const taxRate = parseFloat(prevFormData.taxRate) || 0;
      const discountRate = parseFloat(prevFormData.discountRate) || 0;
      const taxAmount = (newSubTotal * (taxRate / 100)).toFixed(2);
      const discountAmount = (newSubTotal * (discountRate / 100)).toFixed(2);
      const total = (newSubTotal - parseFloat(discountAmount) + parseFloat(taxAmount)).toFixed(2);      return {
        ...prevFormData,
        items: updatedItems,
        subTotal: newSubTotal.toFixed(2),
        taxAmount,
        discountAmount,
        total,
      };
    });
  };

  const handleProductAdd = (product) => {
    if (!editMode) return;
    
    // Add product from catalog to invoice items
    setFormData(prevFormData => {
      const updatedItems = [...prevFormData.items, product];

      let newSubTotal = 0;
      updatedItems.forEach((item) => {
        const itemPrice = parseFloat(String(item.itemPrice).replace(/[^\d.-]/g, '')) || 0;
        const itemQuantity = parseInt(String(item.itemQuantity).replace(/[^\d.-]/g, '')) || 0;
        newSubTotal += itemPrice * itemQuantity;
      });

      const taxRate = parseFloat(prevFormData.taxRate) || 0;
      const discountRate = parseFloat(prevFormData.discountRate) || 0;
      const taxAmount = (newSubTotal * (taxRate / 100)).toFixed(2);
      const discountAmount = (newSubTotal * (discountRate / 100)).toFixed(2);
      const total = (newSubTotal - parseFloat(discountAmount) + parseFloat(taxAmount)).toFixed(2);

      return {
        ...prevFormData,
        items: updatedItems,
        subTotal: newSubTotal.toFixed(2),
        taxAmount,
        discountAmount,
        total,
      };
    });
  };

  const onItemizedItemEdit = (evt, id) => {
    if (!editMode) return;

    setFormData(prevFormData => {
      let newSubTotal = 0;
      const updatedItems = prevFormData.items.map((oldItem) => {
        let currentItem = oldItem;
        if (oldItem.itemId === id) {
          currentItem = { ...oldItem, [evt.target.name]: evt.target.value };
        }
        const itemPrice = parseFloat(String(currentItem.itemPrice).replace(/[^\d.-]/g, '')) || 0;
        const itemQuantity = parseInt(String(currentItem.itemQuantity).replace(/[^\d.-]/g, '')) || 0;
        newSubTotal += itemPrice * itemQuantity;
        return currentItem;
      });

      const taxRate = parseFloat(prevFormData.taxRate) || 0;
      const discountRate = parseFloat(prevFormData.discountRate) || 0;
      const taxAmount = (newSubTotal * (taxRate / 100)).toFixed(2);
      const discountAmount = (newSubTotal * (discountRate / 100)).toFixed(2);
      const total = (newSubTotal - parseFloat(discountAmount) + parseFloat(taxAmount)).toFixed(2);

      return {
        ...prevFormData,
        items: updatedItems,
        subTotal: newSubTotal.toFixed(2),
        taxAmount,
        discountAmount,
        total,
      };
    });
  };

  const editField = (name, value) => {
    if (!editMode) return;

    setFormData(prevFormData => {
      const updatedFormData = { ...prevFormData, [name]: value };

      if (name === "taxRate" || name === "discountRate") {
        const subTotal = parseFloat(updatedFormData.subTotal) || 0;
        const taxRate = parseFloat(name === "taxRate" ? value : updatedFormData.taxRate) || 0;
        const discountRate = parseFloat(name === "discountRate" ? value : updatedFormData.discountRate) || 0;

        updatedFormData.taxAmount = (subTotal * (taxRate / 100)).toFixed(2);
        updatedFormData.discountAmount = (subTotal * (discountRate / 100)).toFixed(2);
        updatedFormData.total = (
          subTotal -
          parseFloat(updatedFormData.discountAmount) +
          parseFloat(updatedFormData.taxAmount)
        ).toFixed(2);
      }
      return updatedFormData;
    });
  };

  const onCurrencyChange = (selectedCurrencyId) => {
    if (!editMode) return;
    
    const selectedCurrency = currencies.find(c => c.id === selectedCurrencyId);
    if (selectedCurrency) {
      setFormData({ 
        ...formData, 
        currencyId: selectedCurrencyId,
        currency: selectedCurrency.symbol,
      });
    }
  };

  const openModal = (event) => {
    event.preventDefault();
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

  const handleToggleEditMode = () => {
    setEditMode(!editMode);
  };

  const handleStatusChange = async (newStatusId) => {
    if (!invoiceId) return;

    const selectedStatus = statuses.find(s => s.statusId === newStatusId);
    if (!selectedStatus) return;

    setStatusUpdateLoading(true);
    try {
      await updateInvoiceStatus(invoiceId, newStatusId);
      setFormData(prevData => ({
        ...prevData,
        statusId: newStatusId,
        statusName: selectedStatus.name,
      }));
      dispatch(updateReduxInvoiceStatus({ id: invoiceId, statusId: newStatusId, statusName: selectedStatus.name }));
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
      const originalStatus = statuses.find(s => s.statusId === invoice.statusId) || { statusId: 1, name: 'Draft' };
      setFormData(prevData => ({
        ...prevData,
        statusId: originalStatus.statusId,
        statusName: originalStatus.name,
      }));
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  const prepareInvoiceDataForAPI = () => {
    const subTotal = parseFloat(formData.subTotal) || 0;
    const taxAmount = parseFloat(formData.taxAmount) || 0;
    const discountAmount = parseFloat(formData.discountAmount) || 0;
    const total = parseFloat(formData.total) || 0;
    
    return {
      invoiceNumber: formData.invoiceNumber && formData.invoiceNumber.toString().trim() !== ""
        ? formData.invoiceNumber.toString()
        : "1",
      dateOfIssue: formData.dateOfIssue,
      dueDate: formData.dueDate || formData.dateOfIssue,
      billTo: formData.billTo || "",
      billToEmail: formData.billToEmail || "",
      billToAddress: formData.billToAddress || "",
      billFrom: formData.billFrom || "",
      billFromEmail: formData.billFromEmail || "",
      billFromAddress: formData.billFromAddress || "",
      notes: formData.notes || "",
      subTotal: subTotal,
      taxRate: parseFloat(formData.taxRate) || 0,
      taxAmount: taxAmount,
      discountRate: parseFloat(formData.discountRate) || 0,
      discountAmount: discountAmount,
      total: total,
      currencyId: formData.currencyId || 1,
      companyName: formData.companyName || "",
      companyNo: formData.companyNo || "",
      vatNo: formData.vatNo || "",
      ticNo: formData.ticNo || "",
      website: formData.website || "",
      companyEmail: formData.companyEmail || "",
      logo: formData.companyLogo || "https://via.placeholder.com/120x120?text=Your+Logo",
      bankName: formData.bankName || "",
      accountName: formData.accountName || "",
      accountNo: formData.accountNo || "",
      swift: formData.swift || "",
      iban: formData.iban || "N/A",
      statusId: formData.statusId || 1,
      templateId: formData.templateId || null,
      items: formData.items.map(item => ({
        Id: isNaN(parseInt(item.itemId)) ? 0 : parseInt(item.itemId),
        ProductId: item.productId || null,
        Title: item.itemName || "",
        Description: item.itemDescription || "",
        Quantity: parseInt(item.itemQuantity) || 1,
        UnitPrice: parseFloat(item.itemPrice) || 0
      }))
    };
  };

  const handleSaveInvoice = async () => {
    try {
      setLoading(true);
      const invoiceData = prepareInvoiceDataForAPI();
      
      const result = await updateInvoice(invoiceId, invoiceData);
      dispatch(updateReduxInvoice({ id: invoiceId, updatedInvoice: formData }));
      
      setNotification({
        open: true,
        message: "Invoice updated successfully 🥳",
        severity: "success",
      });
      
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error) {
      console.error("Error saving invoice:", error);
      setNotification({
        open: true,
        message: `Failed to update invoice: ${error.message}`,
        severity: "error",
      });
    } finally {
      setLoading(false);
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

  const handleSendInvoice = () => {
    if (!formData.billToEmail) {
      setNotification({
        open: true,
        message: "Please add a client email address to send the invoice.",
        severity: "warning",
      });
      return;
    }

    // Show confirmation dialog first
    setSendConfirmDialog(true);
  };

  const handleSendConfirmed = async () => {
    setSendConfirmDialog(false);
    
    try {
      // First open the preview modal to ensure the invoice is rendered
      setIsOpen(true);
      
      // Wait a bit for the modal to render
      setTimeout(async () => {
        const invoiceElement = document.querySelector("#invoiceCapture");
        if (!invoiceElement) {
          setNotification({
            open: true,
            message: "Please open the invoice preview first, then try sending.",
            severity: "warning",
          });
          return;
        }

        // Generate PDF
        const canvas = await html2canvas(invoiceElement);
        const imgData = canvas.toDataURL("image/png", 1.0);
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "pt",
          format: [612, 792],
        });
        
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        
        // Generate filename and get PDF as blob
        const safeInvoiceNumber = String(formData.invoiceNumber).replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const fileName = `invoice_${safeInvoiceNumber || 'download'}.pdf`;
        const pdfBlob = pdf.output('blob');
        
        // Try web-based email services first
        const emailService = await detectEmailService();
        
        if (emailService === 'gmail') {
          await sendViaGmail(pdfBlob, fileName);
        } else if (emailService === 'outlook') {
          await sendViaOutlook(pdfBlob, fileName);
        } else {
          // Fallback to download + mailto
          pdf.save(fileName);
          await openMailtoWithInstructions();
        }
        
        setIsOpen(false);
      }, 1000);
      
    } catch (error) {
      console.error('Error sending invoice:', error);
      setNotification({
        open: true,
        message: "Failed to prepare invoice for sending. Please try again.",
        severity: "error",
      });
    }
  };

  const detectEmailService = async () => {
    // Check if user is logged into Gmail
    if (window.gapi && await checkGmailAuth()) {
      return 'gmail';
    }
    
    // Check if user is logged into Outlook (Microsoft Graph)
    if (window.msal && await checkOutlookAuth()) {
      return 'outlook';
    }
    
    return 'fallback';
  };

  const checkGmailAuth = async () => {
    try {
      // This would require Gmail API setup
      return false; // Placeholder for now
    } catch (error) {
      return false;
    }
  };

  const checkOutlookAuth = async () => {
    try {
      // This would require Microsoft Graph API setup
      return false; // Placeholder for now
    } catch (error) {
      return false;
    }
  };

  const sendViaGmail = async (pdfBlob, fileName) => {
    // Gmail API implementation would go here
    // For now, fall back to improved method
    await showEmailOptions(pdfBlob, fileName);
  };

  const sendViaOutlook = async (pdfBlob, fileName) => {
    // Outlook API implementation would go here
    // For now, fall back to improved method
    await showEmailOptions(pdfBlob, fileName);
  };

  const showEmailOptions = async (pdfBlob, fileName) => {
    // Create a download link
    const url = URL.createObjectURL(pdfBlob);
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = fileName;
    downloadLink.click();
    URL.revokeObjectURL(url);

    // Show enhanced options
    const userChoice = window.confirm(
      `Invoice PDF downloaded as: ${fileName}\n\n` +
      `Choose your email method:\n` +
      `• Click OK to open Gmail in browser\n` +
      `• Click Cancel to use your default email app\n\n` +
      `You can attach the downloaded PDF to either option.`
    );

    if (userChoice) {
      // Open Gmail compose
      const subject = encodeURIComponent(`Invoice ${formData.invoiceNumber} from ${formData.billFrom}`);
      const body = encodeURIComponent(`Dear ${formData.billTo},

Please find attached the invoice ${formData.invoiceNumber} for your review.

Invoice Details:
- Invoice Number: ${formData.invoiceNumber}
- Issue Date: ${formData.dateOfIssue}
- Due Date: ${formData.dueDate}
- Amount: ${formData.currency?.symbol || '$'}${formData.total}

Thank you for your business!

Best regards,
${formData.billFrom}`);
      
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${formData.billToEmail}&su=${subject}&body=${body}`;
      window.open(gmailUrl, '_blank');
      
      setNotification({
        open: true,
        message: "Gmail opened in browser! Please attach the downloaded PDF before sending.",
        severity: "success",
      });
    } else {
      await openMailtoWithInstructions();
    }
  };

  const openMailtoWithInstructions = async () => {
    const subject = encodeURIComponent(`Invoice ${formData.invoiceNumber} from ${formData.billFrom}`);
    const body = encodeURIComponent(`Dear ${formData.billTo},

Please find attached the invoice ${formData.invoiceNumber} for your review.

Invoice Details:
- Invoice Number: ${formData.invoiceNumber}
- Issue Date: ${formData.dateOfIssue}
- Due Date: ${formData.dueDate}
- Amount: ${formData.currency?.symbol || '$'}${formData.total}

Thank you for your business!

Best regards,
${formData.billFrom}`);
    
    const mailtoUrl = `mailto:${formData.billToEmail}?subject=${subject}&body=${body}`;
    window.open(mailtoUrl);
    
    setNotification({
      open: true,
      message: "Email client opened! The PDF has been downloaded - please attach it before sending.",
      severity: "success",
    });
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
  }
  return (
    <Box sx={{ 
      minHeight: '100vh', 
      backgroundColor: '#f8fafc',
      backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3), transparent 50.2%), radial-gradient(circle at 80% 20%, rgba(120, 119, 198, 0.15), transparent 50.2%), radial-gradient(circle at 40% 80%, rgba(120, 119, 198, 0.1), transparent 50.2%)',
      py: 2
    }}>
      <form onSubmit={openModal} style={{ maxWidth: '100%' }}>
        <Box sx={{ 
          display: "flex", 
          alignItems: "center",
          width: '100%',
          maxWidth: '1200px',
          margin: '0 auto',
          px: { xs: 2, sm: 3, md: 4 },
          mb: 2
        }}>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(255, 255, 255, 0.25)',
            backdropFilter: 'blur(20px)',
            borderRadius: '12px',
            padding: '8px 16px',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            cursor: 'pointer'
          }}>
            <BiArrowBack size={18} color="#4a5568" />
            <Box sx={{ fontWeight: "600", ml: 2, color: "#2d3748" }}>
              <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
                ← Back to Dashboard
              </Link>
            </Box>
          </Box>
        </Box>

      <Box sx={{ 
        width: '100%', 
        maxWidth: '1200px', 
        margin: '0 auto',
        px: { xs: 2, sm: 3, md: 4 }
      }}>        <Card sx={{ 
          mb: 2, 
          borderRadius: '20px',
          background: 'rgba(255, 255, 255, 0.25)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          overflow: 'visible',
          position: 'relative'
        }}>          <Box sx={{ 
            p: 3, 
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
            borderRadius: '20px 20px 0 0'
          }}>
            <Box sx={{ 
              fontWeight: "700", 
              fontSize: "1.1rem", 
              color: "#2d3748", 
              flexGrow: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              📄 Invoice #{formData.invoiceNumber}
            </Box>
              {statuses.length > 0 && (
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
                <InputLabel id="status-select-label-view" sx={{ 
                  color: '#4a5568',
                  fontWeight: 600,
                  '&.Mui-focused': { color: '#667eea' }
                }}>
                  📊 Status
                </InputLabel>
                <Select
                  labelId="status-select-label-view"
                  label="📊 Status"
                  value={formData.statusId || ''}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  disabled={statusUpdateLoading || !editMode}
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
                  startAdornment={
                    statusUpdateLoading ? (
                      <InputAdornment position="start">
                        <CircularProgress size={20} />
                      </InputAdornment>
                    ) : null
                  }
                >
                  {statuses.map(status => (
                    <MenuItem key={status.statusId} value={status.statusId}>
                      {status.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {/* <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button
                variant={editMode ? "contained" : "outlined"}
                onClick={editMode ? handleSaveInvoice : handleToggleEditMode}
                size="small"
                disabled={statusUpdateLoading}
                sx={{ 
                  whiteSpace: 'nowrap',
                  fontSize: '0.8rem',
                  padding: '4px 10px',
                  ...(editMode ? {
                    backgroundColor: 'var(--color-success)',
                    '&:hover': {
                      backgroundColor: 'var(--color-success-dark)',
                    }
                  } : {
                    borderColor: 'var(--color-primary-light)',
                    color: 'var(--color-primary)',
                    '&:hover': {
                      backgroundColor: 'var(--color-primary-light)',
                      color: 'var(--color-primary-dark)',
                      borderColor: 'var(--color-primary)',
                    }
                  })
                }}
              >
                {editMode ? "Save Changes" : "Edit Invoice"}
              </Button>
            </Box> */}
          </Box>
            <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            p: 3, 
            gap: 3,
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
              <InputLabel id="currency-select-label" sx={{ 
                fontSize: "0.9rem",
                color: '#4a5568',
                fontWeight: 600,
                '&.Mui-focused': { color: '#667eea' }
              }}>
                💰 Currency
              </InputLabel>              <Select
                labelId="currency-select-label"
                label="💰 Currency"
                onChange={(event) => onCurrencyChange(event.target.value)}
                value={formData.currencyId}
                size="small"
                disabled={!editMode}
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
                    fontWeight: 500
                  }
                }}
              >
                {currencies.map(currency => (
                  <MenuItem key={currency.id} value={currency.id}>
                    {currency.symbol} {currency.name} ({currency.code})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* <TextField
              name="companyLogo"
              type="text"
              value={formData.companyLogo || ""}
              onChange={(e) => editField(e.target.name, e.target.value)}
              placeholder="https://your-logo-url.com/logo.png"
              label="Company Logo URL"
              variant="outlined"
              size="small"
              disabled={!editMode}
              sx={{
                minWidth: '250px',
                flexGrow: 2,
                '.MuiOutlinedInput-notchedOutline': {
                  borderColor: '#d0d0d0',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'var(--color-primary)',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'var(--color-primary)',
                },
                label: { fontSize: "0.85rem" },
              }}
            /> */}            <FormControl sx={{ 
              minWidth: '120px', 
              flexGrow: 1, 
              maxWidth: { xs: '100%', sm: '180px' },
              '& .MuiOutlinedInput-root': {
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)',
                borderRadius: '12px',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.25)'
                }
              }
            }}>
              <InputLabel id="tax-rate-select-label-view" sx={{ 
                fontSize: "0.9rem",
                color: '#4a5568',
                fontWeight: 600,
                '&.Mui-focused': { color: '#667eea' }
              }}>
                📊 VAT Rate
              </InputLabel>              <Select
                labelId="tax-rate-select-label-view"
                label="📊 VAT Rate"
                name="taxRate"
                value={formData.taxRate}
                onChange={(e) => editField(e.target.name, e.target.value)}
                size="small"
                disabled={!editMode}
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
                    fontWeight: 500
                  }
                }}
              >
                <MenuItem value={0}>0%</MenuItem>
                <MenuItem value={19}>19%</MenuItem>
              </Select>
            </FormControl>            <TextField
              name="discountRate"
              type="number"
              value={formData.discountRate}
              onChange={(e) => editField(e.target.name, e.target.value)}
              placeholder="0.0"
              label="🎯 Discount Rate (%)"
              variant="outlined"
              size="small"
              disabled={!editMode}
              sx={{
                minWidth: '120px',
                flexGrow: 1,
                maxWidth: { xs: '100%', sm: '180px' },
                '& .MuiOutlinedInput-root': {
                  background: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '12px',
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.25)'
                  }
                },
                '& .MuiInputLabel-root': {
                  color: '#4a5568',
                  fontWeight: 600,
                  '&.Mui-focused': { color: '#667eea' }
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
              InputProps={{
                endAdornment: <InputAdornment position="end">%</InputAdornment>,
              }}
            />
          </Box>
        </Card>
      </Box>

      <Box sx={{ 
        width: '100%', 
        maxWidth: '1200px', 
        margin: '0 auto',
        px: { xs: 2, sm: 3, md: 4 }
      }}>
        <Grid container spacing={{ xs: 2, md: 3 }}>
          <Grid item xs={12} md={8} lg={9}>            <Card
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
            >            <Box
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
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <span style={{ fontWeight: "700", minWidth: "130px", color: '#4a5568' }}>
                    📅 Current Date:
                  </span>
                  <TextField
                    type="date"
                    name="currentDate"
                    value={formData.currentDate}
                    onChange={(e) => editField(e.target.name, e.target.value)}
                    size="small"
                    disabled={!editMode}
                    sx={{ 
                      width: "160px",
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
                      '& .MuiInputBase-input': {
                        color: '#2d3748',
                        fontWeight: 500
                      }
                    }}
                  />
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <span style={{ fontWeight: "700", minWidth: "130px", color: '#4a5568' }}>
                    ⏰ Due Date:
                  </span>
                  <TextField
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={(e) => editField(e.target.name, e.target.value)}
                    required
                    size="small"
                    disabled={!editMode}
                    sx={{ 
                      width: "160px",
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
                      '& .MuiInputBase-input': {
                        color: '#2d3748',
                        fontWeight: 500
                      }
                    }}
                  />
                </Box>
              </Box>
              <Box sx={{ 
                display: "flex", 
                alignItems: "center",
                alignSelf: { xs: "flex-start", sm: "center" },
                gap: 2
              }}>
                <span style={{ fontWeight: "700", color: '#4a5568' }}>
                  🧾 Invoice Number:
                </span>
                <TextField
                  type="text"
                  name="invoiceNumber"
                  value={formData.invoiceNumber || ""}
                  onChange={(e) => editField(e.target.name, e.target.value)}
                  required
                  size="small"
                  disabled={true}
                  inputProps={{ style: { maxWidth: "150px" } }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      background: 'rgba(255, 255, 255, 0.15)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: '12px'
                    },
                    '.MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                      borderWidth: '2px'
                    },
                    '& .MuiInputBase-input': {
                      color: '#2d3748',
                      fontWeight: 600,
                      textAlign: 'center'
                    }
                  }}
                />
              </Box>
            </Box>            <Box component="hr" sx={{ 
              my: 3, 
              border: 'none',
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.3), transparent)'
            }} />

            <Grid container spacing={{ xs: 2, sm: 4 }}>
              <Grid item xs={12} sm={6}>
                <Box sx={{
                  padding: '20px',
                  background: 'rgba(102, 126, 234, 0.05)',
                  borderRadius: '16px',
                  border: '1px solid rgba(102, 126, 234, 0.1)',
                  height: '100%'
                }}>
                  <InputLabel sx={{ 
                    fontWeight: "700", 
                    mb: 2,
                    color: '#4a5568',
                    fontSize: '1.1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    📨 Bill to:
                  </InputLabel>
                  <TextField
                    placeholder="Who is this invoice to?"
                    name="billTo"
                    value={formData.billTo}
                    onChange={(e) => editField(e.target.name, e.target.value)}
                    fullWidth
                    required
                    size="small"
                    disabled={!editMode}
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
                      }
                    }}
                  />
                  <TextField
                    placeholder="Email address"
                    name="billToEmail"
                    value={formData.billToEmail}
                    onChange={(e) => editField(e.target.name, e.target.value)}
                    fullWidth
                    type="email"
                    required
                    size="small"
                    disabled={!editMode}
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
                      }
                    }}
                  />
                  <TextField
                    placeholder="Billing address"
                    name="billToAddress"
                    value={formData.billToAddress}
                    onChange={(e) => editField(e.target.name, e.target.value)}
                    fullWidth
                    required
                    size="small"
                    disabled={!editMode}
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
                      }
                    }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{
                  padding: '20px',
                  background: 'rgba(118, 75, 162, 0.05)',
                  borderRadius: '16px',
                  border: '1px solid rgba(118, 75, 162, 0.1)',
                  height: '100%'
                }}>
                  <InputLabel sx={{ 
                    fontWeight: "700", 
                    mb: 2,
                    color: '#4a5568',
                    fontSize: '1.1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    🏢 Bill from:
                  </InputLabel>
                  <TextField
                    placeholder="Who is this invoice from?"
                    name="billFrom"
                    value={formData.billFrom}
                    onChange={(e) => editField(e.target.name, e.target.value)}
                    fullWidth
                    required
                    size="small"
                    disabled={!editMode}
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
                  />
                  <TextField
                    placeholder="Email address"
                    name="billFromEmail"
                    value={formData.billFromEmail}
                    onChange={(e) => editField(e.target.name, e.target.value)}
                    fullWidth
                    type="email"
                    required
                    size="small"
                    disabled={!editMode}
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
                  />
                  <TextField
                    placeholder="Billing address"
                    name="billFromAddress"
                    value={formData.billFromAddress}
                    onChange={(e) => editField(e.target.name, e.target.value)}
                    fullWidth
                    required
                    size="small"
                    disabled={!editMode}
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
                  />
                </Box>
              </Grid>
            </Grid><InvoiceItem
              onItemizedItemEdit={onItemizedItemEdit}
              onRowAdd={handleAddEvent}
              onRowDel={handleRowDel}
              onProductAdd={handleProductAdd}
              currency={formData.currency}
              items={formData.items}
              readOnly={!editMode}
            />

            <Box sx={{ mt: 4 }}>
              <Grid container justifyContent="flex-end">
                <Grid sx={{ width: { xs: '100%', md: '50%' } }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ fontWeight: "bold" }}>Subtotal:</span>
                    <span>
                      {formData.currency}
                      {formData.subTotal}
                    </span>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mt: 2,
                    }}
                  >
                    <span style={{ fontWeight: "bold" }}>Discount:</span>
                    <span>
                      <span style={{ fontSize: "small" }}>
                        ({formData.discountRate || 0}%)
                      </span>
                      {formData.currency}
                      {formData.discountAmount || 0}
                    </span>
                  </Box>
                  {parseFloat(formData.taxRate) > 0 && (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mt: 2,
                      }}
                    >
                      <span style={{ fontWeight: "bold" }}>Tax:</span>
                      <span>
                        <span style={{ fontSize: "small" }}>
                          ({formData.taxRate || 0}%)
                        </span>
                        {formData.currency}
                        {formData.taxAmount || 0}
                      </span>
                    </Box>
                  )}
                  <Box sx={{ my: 2 }}>
                    <hr />
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontSize: "1.125rem",
                      fontWeight: "bold",
                    }}
                  >
                    <span>Total:</span>
                    <span>
                      {formData.currency}
                      {formData.total || 0}
                    </span>
                  </Box>
                </Grid>
              </Grid>
            </Box>

            {/* Conditionally render the Notes section */}
            {(formData.notes && formData.notes.trim() !== '') && (
              <Box sx={{ mt: 2 }}>
                <InputLabel sx={{ fontWeight: "bold" }}>Notes:</InputLabel>
                <TextField
                  placeholder={editMode ? "Optional: Add notes here..." : ""}
                  name="notes"
                  value={formData.notes || ""} 
                  onChange={(e) => editField(e.target.name, e.target.value)}
                  fullWidth
                  multiline
                  rows={1}
                  size="small"
                  disabled={!editMode}
                  sx={{ my: 1 }}
                />
              </Box>
            )}

            {/* Fallback for editMode to allow adding notes if currently empty */}
            {editMode && (!formData.notes || formData.notes.trim() === '') && (
              <Box sx={{ mt: 2 }}>
                <InputLabel sx={{ fontWeight: "bold" }}>Notes:</InputLabel>
                <TextField
                  placeholder="Optional: Add notes here..."
                  name="notes"
                  value={formData.notes || ""}
                  onChange={(e) => editField(e.target.name, e.target.value)}
                  fullWidth
                  multiline
                  rows={1}
                  size="small"
                  disabled={false} // Explicitly enable for adding new notes
                  sx={{ my: 1 }}
                />
              </Box>
            )}
          </Card>
        </Grid>

        <Grid item xs={12} md={4} lg={3}>
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
                billFromAddress: formData.billFromAddress,
                notes: formData.notes,
                total: formData.total,
                subTotal: formData.subTotal,
                taxRate: formData.taxRate,
                taxAmount: formData.taxAmount,
                discountRate: formData.discountRate,
                discountAmount: formData.discountAmount,
                logo: formData.companyLogo,
                statusId: formData.statusId, // Pass statusId
                statusName: formData.statusName, // Pass statusName
                isDeleted: formData.isDeleted, // Pass isDeleted
              }}
              items={formData.items}
              currency={formData.currency}
              subTotal={formData.subTotal}
              taxAmount={formData.taxAmount}
              discountAmount={formData.discountAmount}
              total={formData.total}
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
              minWidth: '140px',
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(10px)',
              borderRadius: '12px',
              border: '2px solid rgba(102, 126, 234, 0.3)',
              color: '#667eea',
              fontWeight: 600
            }}
            disabled={loading}
          >
            👁️ Preview Invoice
          </Button>
          
          <Button
            variant="outlined"
            onClick={handleSendInvoice}
            sx={{ 
              minWidth: '160px',
              background: 'rgba(34, 197, 94, 0.15)',
              backdropFilter: 'blur(10px)',
              borderRadius: '12px',
              border: '2px solid rgba(34, 197, 94, 0.3)',
              color: '#22c55e',
              fontWeight: 600,
              '&:disabled': {
                opacity: 0.5,
                cursor: 'not-allowed'
              }
            }}
            disabled={loading || !formData.billToEmail}
            title={!formData.billToEmail ? "Please add client email address first" : "Download PDF and open email client"}
          >
            📧📎 Email + PDF
          </Button>
          {editMode && (
            <Button
              variant="contained"
              onClick={handleSaveInvoice}
              sx={{ 
                minWidth: '160px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '12px',
                fontWeight: 600,
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
              }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : "💾 Update Invoice"}
            </Button>
          )}
        </Box>
      </Box>
      
      <Box sx={{ height: '80px', width: '100%' }} />      {/* Send Confirmation Dialog */}
      <Dialog
        open={sendConfirmDialog}
        onClose={() => setSendConfirmDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)'
          }
        }}
      >
        <DialogTitle sx={{ pb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <EmailIcon sx={{ color: 'white', fontSize: 24 }} />
            </Box>
            <Typography 
              variant="h5" 
              component="div"
              sx={{
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Send Invoice via Email
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ pb: 2 }}>
          <Alert severity="info" sx={{ mb: 3, borderRadius: '12px' }}>
            <Typography variant="body2">
              <strong>Sending to:</strong> {formData.billToEmail}
            </Typography>
          </Alert>

          <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
            Here's what will happen when you click "Send Email":
          </Typography>

          <List sx={{ pl: 0 }}>
            <ListItem sx={{ px: 0, py: 1 }}>
              <ListItemIcon sx={{ minWidth: 40 }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '8px',
                    background: 'rgba(34, 197, 94, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <DownloadIcon sx={{ color: '#22c55e', fontSize: 20 }} />
                </Box>
              </ListItemIcon>
              <ListItemText
                primary="1. PDF will be generated and downloaded"
                secondary="The invoice will be saved as a PDF file to your Downloads folder"
                primaryTypographyProps={{ fontWeight: 600 }}
              />
            </ListItem>

            <ListItem sx={{ px: 0, py: 1 }}>
              <ListItemIcon sx={{ minWidth: 40 }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '8px',
                    background: 'rgba(59, 130, 246, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <EmailIcon sx={{ color: '#3b82f6', fontSize: 20 }} />
                </Box>
              </ListItemIcon>
              <ListItemText
                primary="2. Your email app will open"
                secondary="A new email will be created with the recipient and message pre-filled"
                primaryTypographyProps={{ fontWeight: 600 }}
              />
            </ListItem>

            <ListItem sx={{ px: 0, py: 1 }}>
              <ListItemIcon sx={{ minWidth: 40 }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '8px',
                    background: 'rgba(245, 158, 11, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <AttachIcon sx={{ color: '#f59e0b', fontSize: 20 }} />
                </Box>
              </ListItemIcon>
              <ListItemText
                primary="3. Attach the PDF and send"
                secondary="You'll need to manually attach the downloaded PDF file before sending"
                primaryTypographyProps={{ fontWeight: 600 }}
              />
            </ListItem>
          </List>

          <Alert severity="warning" sx={{ mt: 2, borderRadius: '12px' }}>
            <Typography variant="body2">
              <strong>Important:</strong> Make sure to attach the downloaded PDF file before sending the email to your client.
            </Typography>
          </Alert>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 1, gap: 2 }}>
          <Button 
            onClick={() => setSendConfirmDialog(false)}
            variant="outlined"
            sx={{ borderRadius: '12px', minWidth: '120px' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSendConfirmed}
            variant="contained"
            startIcon={<SendIcon />}
            sx={{
              borderRadius: '12px',
              minWidth: '120px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
              }
            }}
          >
            Send Email
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity} 
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
      </form>
    </Box>
  );
};

export default InvoiceViewForm;