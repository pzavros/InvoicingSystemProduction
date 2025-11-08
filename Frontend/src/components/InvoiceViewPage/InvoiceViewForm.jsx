import React, { useState, useEffect, useCallback } from "react";
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
  IconButton,
  Divider,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
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
import { getAllDocumentTypes } from "../DocumentTypePage/api";

const InvoiceViewForm = ({ invoice, isEditMode, invoiceId }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [editMode, setEditMode] = useState(isEditMode);
  const [currencies, setCurrencies] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [filteredStatuses, setFilteredStatuses] = useState([]); // Statuses filtered by document category
  const [documentTypes, setDocumentTypes] = useState([]);
  const [documentCategory, setDocumentCategory] = useState("Invoice"); // "Invoice" or "Proforma"
  const [filteredDocumentTypes, setFilteredDocumentTypes] = useState([]); // Document types filtered by category
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

  const fetchActiveTemplate = useCallback(async (documentTypeId) => {
    const resolvedDocTypeId = documentTypeId ?? invoice?.documentTypeId ?? null;
    try {
      if (!resolvedDocTypeId) {
        setSelectedTemplate(null);
        setFormData(prev => ({ ...prev, templateId: null }));
        return;
      }

      setSelectedTemplate(null);
      const activeTemplate = await getActiveInvoiceTemplate(resolvedDocTypeId);
      if (activeTemplate) {
        setTemplateFromDto(activeTemplate);
        setFormData(prev => ({ ...prev, templateId: activeTemplate.id || null }));
      } else {
        setFormData(prev => ({ ...prev, templateId: null }));
      }
    } catch (error) {
      console.error('Error loading active template for view:', error);
    }
  }, [invoice?.documentTypeId]);

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
    documentTypeId: invoice?.documentTypeId || 1,
    templateId: null,
    isDeleted: invoice?.isDeleted || false, // Ensure isDeleted is initialized
    items: invoice?.items?.map((item, index) => ({
      itemId: item.id || `temp-${index}-${Date.now()}`,
      itemName: item.title || "",
      itemDescription: item.description || "",
      itemPrice: (item.unitPrice !== undefined && item.unitPrice !== null) 
        ? parseFloat(item.unitPrice).toFixed(2) 
        : "0.00",
      itemQuantity: item.quantity || 1,
      itemTaxRate: (item.taxRate !== null && item.taxRate !== undefined) ? parseFloat(item.taxRate) : 0,
      productId: item.productId || null,
      isCustomItem: item.isCustomItem || false
    })) || [
      {
        itemId: `temp-default-${Date.now()}`,
        itemName: "",
        itemDescription: "",
        itemPrice: "1.00",
        itemQuantity: 1,
        itemTaxRate: 0,
      },
    ],
  });

  const documentTypeLabel = React.useMemo(() => {
    const typeId = formData?.documentTypeId;
    if (!typeId) {
      return "";
    }

    const apiType = documentTypes.find((type) => type.id === typeId);
    if (apiType?.displayName) {
      return apiType.displayName;
    }

    switch (typeId) {
      case 1:
        return "Invoice";
      case 2:
        return "Tax Invoice";
      case 3:
        return "Proforma Invoice";
      case 4:
        return "Quotation";
      default:
        return "Invoice";
    }
  }, [documentTypes, formData?.documentTypeId]);

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const [currenciesData, statusesData, documentTypesData] = await Promise.all([
          getAllCurrencies(),
          getAllStatuses(),
          getAllDocumentTypes()
        ]);
        setCurrencies(currenciesData);
        setStatuses(statusesData);
        setDocumentTypes(documentTypesData);
        
        // Set initial category - if viewing an invoice, it will be updated in the invoice useEffect
        // Otherwise default to Invoice category
        if (invoice?.documentTypeId) {
          const docType = documentTypesData.find(dt => dt.id === invoice.documentTypeId);
          if (docType && docType.category) {
            setDocumentCategory(docType.category);
          }
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
        iban: invoice?.iban || '',
        statusName: currentStatus.name,
        statusId: currentStatus.statusId,
        documentTypeId: invoice?.documentTypeId || 1,
        templateId: null,
        isDeleted: invoice?.isDeleted || false, // Ensure isDeleted is updated
        items: invoice?.items?.map((item, index) => ({
          itemId: item.id || `temp-${index}-${Date.now()}`,
          itemName: item.title || "",
          itemDescription: item.description || "",
          itemPrice: item.unitPrice !== undefined ? parseFloat(item.unitPrice).toFixed(2) : "0.00",
          itemQuantity: item.quantity || 1,
          itemTaxRate: (item.taxRate !== null && item.taxRate !== undefined) ? parseFloat(item.taxRate) : 0,
          productId: item.productId || null, // Preserve productId for stock management
          isCustomItem: item.isCustomItem || false
        })) || [],
      };
      setFormData(newFormData);
      
      // Update document category based on the invoice's document type
      if (invoice?.documentTypeId && documentTypes.length > 0) {
        const docType = documentTypes.find(dt => dt.id === invoice.documentTypeId);
        if (docType && docType.category) {
          setDocumentCategory(docType.category);
        }
      }
    }
  }, [invoice, currencies, statuses, documentTypes]);

  // Filter document types based on selected category
  useEffect(() => {
    if (documentTypes.length > 0) {
      const filtered = documentTypes.filter(dt => dt.category === documentCategory);
      setFilteredDocumentTypes(filtered);
      
      // If current documentTypeId is not in filtered list, don't change it when viewing
      // Only auto-select when in edit mode
      if (editMode) {
        const currentTypeStillValid = filtered.find(dt => dt.id === formData.documentTypeId);
        if (!currentTypeStillValid && filtered.length > 0) {
          setFormData(prev => ({
            ...prev,
            documentTypeId: filtered[0].id
          }));
        }
      }
    }
  }, [documentTypes, documentCategory, editMode]);

  // Filter statuses based on document category
  // Proforma/Quotation documents don't have payment statuses
  useEffect(() => {
    if (statuses.length > 0) {
      if (documentCategory === "Proforma") {
        // For proforma/quotations, only allow Draft and Deleted statuses
        const allowedStatusIds = [1, 4]; // 1=Draft, 4=Deleted
        const filtered = statuses.filter(s => allowedStatusIds.includes(s.statusId));
        setFilteredStatuses(filtered);
        
        // If viewing a Proforma with Unpaid/Paid status, we need to include it in the dropdown
        // so the user can see the current status, but they can only change it to Draft or Deleted
        if (formData.statusId && !allowedStatusIds.includes(formData.statusId)) {
          const currentStatus = statuses.find(s => s.statusId === formData.statusId);
          if (currentStatus) {
            // Add the current status to the filtered list so it shows in the dropdown
            setFilteredStatuses([...filtered, currentStatus]);
          }
        }
      } else {
        // For invoices, show all statuses
        setFilteredStatuses(statuses);
      }
    }
  }, [statuses, documentCategory, formData.statusId]);

  useEffect(() => {
    const docTypeId = formData.documentTypeId || invoice?.documentTypeId || null;
    fetchActiveTemplate(docTypeId);
  }, [fetchActiveTemplate, formData.documentTypeId, invoice?.documentTypeId]);

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
      itemTaxRate: 0,
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

  const openModal = async (event) => {
    event.preventDefault();
    await fetchActiveTemplate(formData.documentTypeId || invoice?.documentTypeId || null);
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
      DocumentTypeId: formData.documentTypeId || 1,
      templateId: formData.templateId || null,
      items: formData.items.map(item => ({
        Id: isNaN(parseInt(item.itemId)) ? 0 : parseInt(item.itemId),
        ProductId: item.productId || null,
        Title: item.itemName || "",
        Description: item.itemDescription || "",
        Quantity: parseInt(item.itemQuantity) || 1,
        UnitPrice: parseFloat(item.itemPrice) || 0,
        TaxRate: item.itemTaxRate !== undefined && item.itemTaxRate !== null && item.itemTaxRate !== "" ? parseFloat(item.itemTaxRate) : 0
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
      await fetchActiveTemplate(formData.documentTypeId || invoice?.documentTypeId || null);
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

  // Calculate VAT breakdown by rate from items (per-item VAT system)
  const calculateVATBreakdown = () => {
    const vatByRate = {};
    let totalNet = 0;
    
    formData.items.forEach(item => {
      const quantity = parseFloat(item.itemQuantity) || 0;
      const grossPrice = parseFloat(item.itemPrice) || 0;
      const taxRate = parseFloat(item.itemTaxRate) || 0;
      
      const lineGross = quantity * grossPrice;
      totalNet += lineGross;
      
      // Calculate VAT from gross price: VAT = gross × (rate / (100 + rate))
      if (taxRate > 0) {
        const itemVatAmount = lineGross * (taxRate / (100 + taxRate));
        
        if (!vatByRate[taxRate]) {
          vatByRate[taxRate] = 0;
        }
        vatByRate[taxRate] += itemVatAmount;
      }
    });
    
    return { vatByRate, totalNet };
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
      py: 3
    }}>
      <form onSubmit={openModal} style={{ maxWidth: '100%' }}>
        {/* Header with Back Button */}
        <Box sx={{ 
          width: '100%',
          maxWidth: '1200px',
          margin: '0 auto',
          px: { xs: 2, sm: 3, md: 4 },
          mb: 3
        }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <IconButton 
              onClick={() => navigate("/")} 
              sx={{ 
                width: 40,
                height: 40,
                borderRadius: '8px',
                backgroundColor: 'rgba(15, 23, 42, 0.04)',
                border: '1px solid rgba(15, 23, 42, 0.08)',
                transition: 'all 0.15s ease',
                '&:hover': {
                  backgroundColor: 'rgba(15, 23, 42, 0.08)',
                  borderColor: 'rgba(15, 23, 42, 0.12)',
                }
              }}
            >
              <ArrowBackIcon sx={{ fontSize: 20, color: 'rgba(15, 23, 42, 0.7)' }} />
            </IconButton>
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
                Invoice Details
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
                View and manage invoice information
              </Typography>
            </Box>
          </Box>
        </Box>

      <Box sx={{ 
        width: '100%', 
        maxWidth: '1200px', 
        margin: '0 auto',
        px: { xs: 2, sm: 3, md: 4 }
      }}>
        <Box sx={{ 
          mb: 2, 
          borderRadius: '20px',
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(15, 23, 42, 0.06)',
          boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
          overflow: 'visible',
          position: 'relative'
        }}>
          <Box sx={{ 
            p: 3, 
            borderBottom: '1px solid rgba(15, 23, 42, 0.08)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2
          }}>
            <Typography variant="h6" component="div" sx={{ 
              fontWeight: 600, 
              fontSize: '1.125rem',
              color: 'rgba(15, 23, 42, 0.95)',
              letterSpacing: '-0.01em',
              display: 'flex',
              alignItems: 'center',
              gap: 1.5
            }}>
              <Box sx={{
                width: 36,
                height: 36,
                borderRadius: '10px',
                backgroundColor: 'rgba(139, 92, 246, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#8b5cf6',
                fontSize: '16px'
              }}>
                📄
              </Box>
              Invoice #{formData.invoiceNumber}
              {documentTypeLabel && (
                <Box
                  sx={{
                    px: 2,
                    py: 0.5,
                    borderRadius: '8px',
                    backgroundColor: 'rgba(139, 92, 246, 0.08)',
                    color: '#8b5cf6',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}
                >
                  {documentTypeLabel}
                </Box>
              )}
            </Typography>
            {statuses.length > 0 && (
              <FormControl sx={{ 
                minWidth: '160px', 
                flexGrow: 1, 
                maxWidth: { xs: '100%', sm: '200px' },
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                  backgroundColor: 'rgba(139, 92, 246, 0.04)',
                  border: '1px solid rgba(139, 92, 246, 0.12)',
                  transition: 'all 0.15s ease',
                  '& fieldset': {
                    borderColor: 'rgba(139, 92, 246, 0.12)',
                    borderWidth: '1px'
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(139, 92, 246, 0.06)',
                    borderColor: 'rgba(139, 92, 246, 0.2)',
                    '& fieldset': {
                      borderColor: 'rgba(139, 92, 246, 0.2)',
                    }
                  },
                  '&.Mui-focused': {
                    backgroundColor: 'white',
                    borderColor: '#8b5cf6',
                    boxShadow: '0 0 0 3px rgba(139, 92, 246, 0.1)',
                    '& fieldset': {
                      borderColor: '#8b5cf6',
                      borderWidth: '1.5px'
                    }
                  }
                }
              }} size="small">
                <InputLabel id="status-select-label-view" sx={{ 
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: 'rgba(15, 23, 42, 0.6)',
                  backgroundColor: 'transparent',
                  '&.Mui-focused': { 
                    color: '#8b5cf6'
                  },
                  '&.MuiInputLabel-shrink': {
                    backgroundColor: 'white',
                    px: 0.5
                  }
                }}>
                  Status
                </InputLabel>
                <Select
                  labelId="status-select-label-view"
                  label="Status"
                  value={formData.statusId || ''}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  disabled={statusUpdateLoading || !editMode}
                  sx={{
                    '& .MuiSelect-select': {
                      color: 'rgba(15, 23, 42, 0.9)',
                      fontWeight: 500,
                      fontSize: '0.875rem',
                      padding: '7px 10px'
                    },
                    '& .MuiSelect-icon': {
                      color: '#8b5cf6',
                      right: 8
                    }
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        borderRadius: '10px',
                        boxShadow: '0 8px 24px rgba(139, 92, 246, 0.12)',
                        border: '1px solid rgba(139, 92, 246, 0.08)',
                        mt: 0.5,
                        '& .MuiMenuItem-root': {
                          fontSize: '0.875rem',
                          padding: '8px 12px',
                          margin: '0 4px',
                          borderRadius: '6px',
                          '&:hover': {
                            backgroundColor: 'rgba(139, 92, 246, 0.06)'
                          },
                          '&.Mui-selected': {
                            backgroundColor: 'rgba(139, 92, 246, 0.08)',
                            '&:hover': {
                              backgroundColor: 'rgba(139, 92, 246, 0.12)'
                            }
                          }
                        }
                      }
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
                  {filteredStatuses.map(status => (
                    <MenuItem key={status.statusId} value={status.statusId}>
                      {status.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', p: 3, gap: 3 }}>
            {/* 1. Currency Dropdown */}
            <FormControl sx={{ 
              minWidth: '160px', 
              flexGrow: 1, 
              maxWidth: { xs: '100%', sm: '200px' },
              '& .MuiOutlinedInput-root': {
                borderRadius: '10px',
                backgroundColor: 'rgba(139, 92, 246, 0.04)',
                border: '1px solid rgba(139, 92, 246, 0.12)',
                transition: 'all 0.15s ease',
                '& fieldset': {
                  borderColor: 'rgba(139, 92, 246, 0.12)',
                  borderWidth: '1px'
                },
                '&:hover': {
                  backgroundColor: 'rgba(139, 92, 246, 0.06)',
                  borderColor: 'rgba(139, 92, 246, 0.2)',
                  '& fieldset': {
                    borderColor: 'rgba(139, 92, 246, 0.2)',
                  }
                },
                '&.Mui-focused': {
                  backgroundColor: 'white',
                  borderColor: '#8b5cf6',
                  boxShadow: '0 0 0 3px rgba(139, 92, 246, 0.1)',
                  '& fieldset': {
                    borderColor: '#8b5cf6',
                    borderWidth: '1.5px'
                  }
                }
              },
              '& .MuiInputLabel-root': {
                fontSize: '0.875rem',
                fontWeight: 500,
                color: 'rgba(15, 23, 42, 0.6)',
                backgroundColor: 'transparent',
                '&.Mui-focused': { 
                  color: '#8b5cf6'
                },
                '&.MuiInputLabel-shrink': {
                  backgroundColor: 'white',
                  px: 0.5
                }
              }
            }}>
              <InputLabel 
                id="currency-select-label"
              >
                Currency
              </InputLabel>
              <Select
                labelId="currency-select-label"
                label="Currency"
                onChange={(event) => onCurrencyChange(event.target.value)}
                value={formData.currencyId}
                size="small"
                disabled={!editMode}
                sx={{
                  '& .MuiSelect-select': {
                    color: 'rgba(15, 23, 42, 0.9)',
                    fontWeight: 500,
                    fontSize: '0.875rem',
                    padding: '7px 10px'
                  },
                  '& .MuiSelect-icon': {
                    color: '#8b5cf6',
                    right: 8
                  }
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      borderRadius: '10px',
                      boxShadow: '0 8px 24px rgba(139, 92, 246, 0.12)',
                      border: '1px solid rgba(139, 92, 246, 0.08)',
                      mt: 0.5,
                      '& .MuiMenuItem-root': {
                        fontSize: '0.875rem',
                        padding: '8px 12px',
                        margin: '0 4px',
                        borderRadius: '6px',
                        '&:hover': {
                          backgroundColor: 'rgba(139, 92, 246, 0.06)'
                        },
                        '&.Mui-selected': {
                          backgroundColor: 'rgba(139, 92, 246, 0.08)',
                          '&:hover': {
                            backgroundColor: 'rgba(139, 92, 246, 0.12)'
                          }
                        }
                      }
                    }
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

            {/* 2. Discount Rate Field */}
            <TextField
              name="discountRate"
              type="number"
              value={formData.discountRate}
              onChange={(e) => editField(e.target.name, e.target.value)}
              placeholder="0.0"
              label="Discount Rate"
              variant="outlined"
              size="small"
              disabled={!editMode}
              sx={{
                minWidth: '160px',
                flexGrow: 1,
                maxWidth: { xs: '100%', sm: '200px' },
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                  backgroundColor: 'rgba(139, 92, 246, 0.04)',
                  border: '1px solid rgba(139, 92, 246, 0.12)',
                  transition: 'all 0.15s ease',
                  '& fieldset': {
                    borderColor: 'rgba(139, 92, 246, 0.12)',
                    borderWidth: '1px'
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(139, 92, 246, 0.06)',
                    borderColor: 'rgba(139, 92, 246, 0.2)',
                    '& fieldset': {
                      borderColor: 'rgba(139, 92, 246, 0.2)',
                    }
                  },
                  '&.Mui-focused': {
                    backgroundColor: 'white',
                    borderColor: '#8b5cf6',
                    boxShadow: '0 0 0 3px rgba(139, 92, 246, 0.1)',
                    '& fieldset': {
                      borderColor: '#8b5cf6',
                      borderWidth: '1.5px'
                    }
                  }
                },
                '& .MuiInputLabel-root': {
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: 'rgba(15, 23, 42, 0.6)',
                  backgroundColor: 'transparent',
                  '&.Mui-focused': {
                    color: '#8b5cf6'
                  },
                  '&.MuiInputLabel-shrink': {
                    backgroundColor: 'white',
                    px: 0.5
                  }
                },
                '& .MuiOutlinedInput-input': {
                  padding: '7px 10px',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: 'rgba(15, 23, 42, 0.9)',
                  '&::placeholder': {
                    color: 'rgba(15, 23, 42, 0.4)',
                    opacity: 1
                  }
                }
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">%</InputAdornment>
                ),
              }}
            />
          </Box>
        </Box>
      </Box>

      <Box sx={{ 
        width: '100%', 
        maxWidth: '1200px', 
        margin: '0 auto',
        px: { xs: 2, sm: 3, md: 4 }
      }}>
        <Grid container spacing={{ xs: 2, md: 3 }}>
          <Grid item xs={12} md={8} lg={9}>
            <Box
              sx={{
                p: { xs: 3, md: 4 },
                my: { xs: 2, md: 3 },
                background: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(15, 23, 42, 0.06)',
                borderRadius: '20px',
                boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
                color: "#2d3748"
              }}
            >
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                justifyContent: "space-between",
                alignItems: { xs: "flex-start", sm: "flex-start" },
                mb: 4,
                gap: 3,
                padding: '20px',
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
                borderRadius: '16px',
                border: '1px solid rgba(139, 92, 246, 0.15)'
              }}
            >
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Typography sx={{ 
                    fontWeight: 700, 
                    minWidth: "120px",
                    color: '#2d3748',
                    fontSize: '0.95rem'
                  }}>
                    Issue Date:
                  </Typography>
                  <TextField
                    type="date"
                    name="dateOfIssue"
                    value={formData.dateOfIssue}
                    onChange={(e) => editField(e.target.name, e.target.value)}
                    size="small"
                    disabled={!editMode}
                    sx={{ 
                      width: "160px",
                      '& .MuiOutlinedInput-root': {
                        background: 'rgba(255, 255, 255, 0.6)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '12px',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          background: 'rgba(255, 255, 255, 0.8)'
                        },
                        '&.Mui-focused': {
                          background: 'rgba(255, 255, 255, 0.9)'
                        }
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(15, 23, 42, 0.08)',
                        borderWidth: '1px'
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(15, 23, 42, 0.15)'
                      },
                      '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(15, 23, 42, 0.25)',
                        borderWidth: '1.5px'
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
                    Due Date:
                  </Typography>
                  <TextField
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={(e) => editField(e.target.name, e.target.value)}
                    size="small"
                    disabled={!editMode}
                    sx={{ 
                      width: "160px",
                      '& .MuiOutlinedInput-root': {
                        background: 'rgba(255, 255, 255, 0.6)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '12px',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          background: 'rgba(255, 255, 255, 0.8)'
                        },
                        '&.Mui-focused': {
                          background: 'rgba(255, 255, 255, 0.9)'
                        }
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(15, 23, 42, 0.08)',
                        borderWidth: '1px'
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(15, 23, 42, 0.15)'
                      },
                      '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(15, 23, 42, 0.25)',
                        borderWidth: '1.5px'
                      },
                      '& .MuiInputBase-input': {
                        color: '#2d3748',
                        fontWeight: 500
                      }
                    }}
                  />
                </Box>
              </Box>
            </Box>            <Divider sx={{ 
              my: 3, 
              borderColor: "rgba(15, 23, 42, 0.08)",
              '&::before, &::after': {
                borderColor: "rgba(15, 23, 42, 0.08)"
              }
            }} />

            <Grid container spacing={{ xs: 2, sm: 3 }}>
              <Grid item xs={12} sm={6}>
                <Box sx={{
                  p: 3,
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.03), rgba(118, 75, 162, 0.03))',
                  border: '1px solid rgba(102, 126, 234, 0.08)'
                }}>
                  <Typography component="div" sx={{ 
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
                      ✉
                    </Box>
                    Bill To:
                  </Typography>
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
                        background: 'rgba(255, 255, 255, 0.6)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '12px',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          background: 'rgba(255, 255, 255, 0.8)'
                        },
                        '&.Mui-focused': {
                          background: 'rgba(255, 255, 255, 0.9)'
                        }
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(15, 23, 42, 0.08)',
                        borderWidth: '1px'
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(15, 23, 42, 0.15)'
                      },
                      '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(15, 23, 42, 0.25)',
                        borderWidth: '1.5px'
                      },
                      '& .MuiInputBase-input': {
                        color: '#2d3748',
                        fontWeight: 500,
                        fontSize: '0.9375rem'
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
                        background: 'rgba(255, 255, 255, 0.6)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '12px',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          background: 'rgba(255, 255, 255, 0.8)'
                        },
                        '&.Mui-focused': {
                          background: 'rgba(255, 255, 255, 0.9)'
                        }
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(15, 23, 42, 0.08)',
                        borderWidth: '1px'
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(15, 23, 42, 0.15)'
                      },
                      '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(15, 23, 42, 0.25)',
                        borderWidth: '1.5px'
                      },
                      '& .MuiInputBase-input': {
                        color: '#2d3748',
                        fontWeight: 500,
                        fontSize: '0.9375rem'
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
                        background: 'rgba(255, 255, 255, 0.6)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '12px',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          background: 'rgba(255, 255, 255, 0.8)'
                        },
                        '&.Mui-focused': {
                          background: 'rgba(255, 255, 255, 0.9)'
                        }
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(15, 23, 42, 0.08)',
                        borderWidth: '1px'
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(15, 23, 42, 0.15)'
                      },
                      '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(15, 23, 42, 0.25)',
                        borderWidth: '1.5px'
                      },
                      '& .MuiInputBase-input': {
                        color: '#2d3748',
                        fontWeight: 500,
                        fontSize: '0.9375rem'
                      }
                    }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{
                  p: 3,
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.03), rgba(118, 75, 162, 0.03))',
                  border: '1px solid rgba(102, 126, 234, 0.08)'
                }}>
                  <Typography component="div" sx={{ 
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
                      🏢
                    </Box>
                    Bill From:
                  </Typography>
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
                        background: 'rgba(255, 255, 255, 0.6)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '12px',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          background: 'rgba(255, 255, 255, 0.8)'
                        },
                        '&.Mui-focused': {
                          background: 'rgba(255, 255, 255, 0.9)'
                        }
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(15, 23, 42, 0.08)',
                        borderWidth: '1px'
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(15, 23, 42, 0.15)'
                      },
                      '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(15, 23, 42, 0.25)',
                        borderWidth: '1.5px'
                      },
                      '& .MuiInputBase-input': {
                        color: '#2d3748',
                        fontWeight: 500,
                        fontSize: '0.9375rem'
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
                        background: 'rgba(255, 255, 255, 0.6)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '12px',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          background: 'rgba(255, 255, 255, 0.8)'
                        },
                        '&.Mui-focused': {
                          background: 'rgba(255, 255, 255, 0.9)'
                        }
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(15, 23, 42, 0.08)',
                        borderWidth: '1px'
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(15, 23, 42, 0.15)'
                      },
                      '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(15, 23, 42, 0.25)',
                        borderWidth: '1.5px'
                      },
                      '& .MuiInputBase-input': {
                        color: '#2d3748',
                        fontWeight: 500,
                        fontSize: '0.9375rem'
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
                        background: 'rgba(255, 255, 255, 0.6)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '12px',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          background: 'rgba(255, 255, 255, 0.8)'
                        },
                        '&.Mui-focused': {
                          background: 'rgba(255, 255, 255, 0.9)'
                        }
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(15, 23, 42, 0.08)',
                        borderWidth: '1px'
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(15, 23, 42, 0.15)'
                      },
                      '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(15, 23, 42, 0.25)',
                        borderWidth: '1.5px'
                      },
                      '& .MuiInputBase-input': {
                        color: '#2d3748',
                        fontWeight: 500,
                        fontSize: '0.9375rem'
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
                    <span style={{ fontWeight: "bold" }}>Subtotal (excl. VAT):</span>
                    <span>
                      {formData.currency}
                      {(() => {
                        const { totalNet } = calculateVATBreakdown();
                        const { vatByRate } = calculateVATBreakdown();
                        const totalVAT = Object.values(vatByRate).reduce((sum, vat) => sum + vat, 0);
                        const netAmount = totalNet - totalVAT;
                        return netAmount.toFixed(2);
                      })()}
                    </span>
                  </Box>
                  
                  {/* Display VAT breakdown by rate */}
                  {(() => {
                    const { vatByRate } = calculateVATBreakdown();
                    return Object.keys(vatByRate).length > 0 && Object.keys(vatByRate).map(rate => (
                      <Box
                        key={rate}
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mt: 2,
                        }}
                      >
                        <span style={{ fontWeight: "bold" }}>VAT ({rate}%):</span>
                        <span>
                          {formData.currency}
                          {vatByRate[rate].toFixed(2)}
                        </span>
                      </Box>
                    ));
                  })()}
                  
                  {/* Only show discount if it's greater than 0 */}
                  {parseFloat(formData.discountRate) > 0 && (
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
                    <span>Total (incl. VAT):</span>
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
          </Box>
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
                dueDate: formData.dueDate,
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
                logoMimeType: invoice?.logoMimeType || "",
                statusId: formData.statusId, // Pass statusId
                statusName: formData.statusName, // Pass statusName
                isDeleted: formData.isDeleted, // Pass isDeleted
                documentTypeId: formData.documentTypeId, // Pass documentTypeId
              }}
              items={formData.items}
              currency={formData.currency}
              subTotal={formData.subTotal}
              taxAmount={formData.taxAmount}
              discountAmount={formData.discountAmount}
              total={formData.total}
              logoMimeType={invoice?.logoMimeType || ""}
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
          padding: '16px 24px',
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(15, 23, 42, 0.06)',
          boxShadow: '0 -1px 3px rgba(15, 23, 42, 0.04)',
          display: 'flex',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <Box sx={{ 
            display: 'flex', 
            gap: 2, 
            width: '100%',
            maxWidth: '1200px',
            justifyContent: { xs: 'center', sm: 'flex-end' },
            flexWrap: 'wrap'
          }}>
            <Button
              variant="outlined"
              type="submit"
              sx={{ 
                minWidth: '140px',
                borderRadius: '12px',
                backgroundColor: 'rgba(139, 92, 246, 0.04)',
                border: '1.5px solid rgba(139, 92, 246, 0.2)',
                color: '#8b5cf6',
                fontWeight: 600,
                fontSize: '0.9375rem',
                textTransform: 'none',
                transition: 'all 0.15s ease',
                '&:hover': {
                  backgroundColor: 'rgba(139, 92, 246, 0.08)',
                  borderColor: '#8b5cf6',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 2px 8px rgba(139, 92, 246, 0.15)'
                }
              }}
              disabled={loading}
            >
              Preview Invoice
            </Button>
            
            <Button
              variant="outlined"
              onClick={handleSendInvoice}
              sx={{ 
                minWidth: '160px',
                borderRadius: '12px',
                backgroundColor: 'rgba(34, 197, 94, 0.04)',
                border: '1.5px solid rgba(34, 197, 94, 0.2)',
                color: '#22c55e',
                fontWeight: 600,
                fontSize: '0.9375rem',
                textTransform: 'none',
                transition: 'all 0.15s ease',
                '&:hover': {
                  backgroundColor: 'rgba(34, 197, 94, 0.08)',
                  borderColor: '#22c55e',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 2px 8px rgba(34, 197, 94, 0.15)'
                },
                '&:disabled': {
                  opacity: 0.5,
                  cursor: 'not-allowed'
                }
              }}
              disabled={loading || !formData.billToEmail}
              title={!formData.billToEmail ? "Please add client email address first" : "Download PDF and open email client"}
            >
              Email + PDF
            </Button>
            {editMode && (
              <Button
                variant="contained"
                onClick={handleSaveInvoice}
                sx={{ 
                  minWidth: '160px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                  fontWeight: 600,
                  fontSize: '0.9375rem',
                  textTransform: 'none',
                  transition: 'all 0.15s ease',
                  boxShadow: '0 2px 8px rgba(139, 92, 246, 0.25)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(139, 92, 246, 0.35)'
                  }
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
