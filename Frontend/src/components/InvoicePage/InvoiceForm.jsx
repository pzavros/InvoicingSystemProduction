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
  IconButton,
} from "@mui/material";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import { useDispatch } from "react-redux";
import { Link, useParams, useLocation, useNavigate } from "react-router-dom";
import InvoiceItem from "./InvoiceItem";
import InvoiceModal from "./InvoiceModal";
import LimitReachedModal from "../SubscriptionPage/LimitReachedModal";
import LoadingOverlay from "../ReusableComponents/LoadingOverlay";
import { useLimit } from "../../utils/useLimit";
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
import { getAllProducts } from "../ProductCatalogPage/api";
import { getUserProfile } from "../AuthPages/api";
import PageLoader from "../ReusableComponents/PageLoader";
import PageHelper from "../ReusableComponents/PageHelper";
import { pageHelpContent } from "../../config/pageHelpContent";

const LANGUAGE_LOCALE_MAP = {
  english: "en-US",
  french: "fr-FR",
  spanish: "es-ES",
  german: "de-DE",
  italian: "it-IT",
  portuguese: "pt-PT",
};

const resolveLocaleFromPreference = (languagePreference) => {
  if (!languagePreference) {
    return typeof navigator !== "undefined" && navigator.language
      ? navigator.language
      : "en-US";
  }

  const normalized = languagePreference.trim().toLowerCase();
  return (
    LANGUAGE_LOCALE_MAP[normalized] ||
    (typeof navigator !== "undefined" && navigator.language) ||
    "en-US"
  );
};

const readStoredUserPreferences = () => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const storedUserRaw = localStorage.getItem("user");
    if (!storedUserRaw) {
      return null;
    }

    const storedUser = JSON.parse(storedUserRaw);
    return {
      currency: storedUser?.currency ? storedUser.currency.toUpperCase() : null,
      dateFormat: storedUser?.dateFormat ? storedUser.dateFormat.toUpperCase() : null,
      language: storedUser?.language || null,
    };
  } catch (error) {
    console.warn("Failed to read stored user preferences:", error);
    return null;
  }
};

const InvoiceForm = () => {
  const dispatch = useDispatch();
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const isCopy = location.pathname.includes("create");
  const isEdit = location.pathname.includes("edit");
  
  // Freemium limit checking
  const { checkLimit, limitModalOpen, limitModalResource, limitModalInfo, closeLimitModal } = useLimit();

  const [isOpen, setIsOpen] = useState(false);
  const [copyId, setCopyId] = useState("");
  const { getOneInvoice, listSize } = useInvoiceListData();
  
  // Calculate default due date (14 days from today)
  const getDefaultDueDate = () => {
    const today = new Date();
    const dueDate = new Date(today);
    dueDate.setDate(today.getDate() + 14);
    return dueDate.toISOString().split('T')[0];
  };
  
  const [formData, setFormData] = useState({
    id: generateRandomId(),
    invoiceNumber: listSize + 1,
    dateOfIssue: new Date().toISOString().split('T')[0],
    dueDate: getDefaultDueDate(),
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
    currencyCode: "USD",
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
        itemTaxRate: 0,
      },
    ],
    statusId: 1,
    statusName: "Draft",
    templateId: null,
    documentTypeId: 1, // Default to standard invoice
  });

  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [currencies, setCurrencies] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [filteredStatuses, setFilteredStatuses] = useState([]); // Statuses filtered by document category
  const [clients, setClients] = useState([]);
  const [documentTypes, setDocumentTypes] = useState([]);
  const [documentCategory, setDocumentCategory] = useState("Invoice"); // "Invoice" or "Proforma"
  const [filteredDocumentTypes, setFilteredDocumentTypes] = useState([]);
  const [clientSelectionMode, setClientSelectionMode] = useState("manual"); // "manual" or "select"
  const [selectedClientId, setSelectedClientId] = useState("");
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [userPreferences, setUserPreferences] = useState(() => readStoredUserPreferences());
  const [setupStatus, setSetupStatus] = useState({
    hasCompanyInfo: false,
    hasClients: false,
    hasProducts: false,
    isCheckComplete: false
  });

  const resolvedLocale = resolveLocaleFromPreference(userPreferences?.language);
  const resolvedDateFormat = (userPreferences?.dateFormat || "MM/DD/YYYY").toUpperCase().trim();
  const resolvedCurrencyCode = (formData.currencyCode || userPreferences?.currency || "USD")?.toUpperCase();

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
        // Filter to only show active clients in the dropdown
        const activeClients = clientsData.filter(client => client.isActive !== false);
        setClients(activeClients);

        const documentTypesData = await getAllDocumentTypes();
        setDocumentTypes(documentTypesData);
        
        // Set initial category based on the default document type (ID=1 is Invoice)
        const defaultDocType = documentTypesData.find(dt => dt.id === 1);
        if (defaultDocType) {
          setDocumentCategory(defaultDocType.category || "Invoice");
        }

        // Load template after setting up initial form data
        await loadTemplateForDocumentType(1); // Default to Invoice (type 1)

        const setupData = await getSystemSetup(); // Assuming this returns { ..., logo, logoMimeType }
        
        // Check setup completion status - fetch products to complete the check
        let hasProducts = false;
        try {
          const productsResponse = await getAllProducts();
          const products = productsResponse.data || productsResponse;
          hasProducts = products && products.length > 0;
        } catch (error) {
          console.error("Error checking products for setup status:", error);
        }
        
        const hasCompanyInfo = !!(setupData?.name && setupData?.email);
        const hasClients = activeClients && activeClients.length > 0;
        
        setSetupStatus({
          hasCompanyInfo,
          hasClients,
          hasProducts,
          isCheckComplete: true // Setup check is now complete
        });
        
        let profileData = null;
        try {
          profileData = await getUserProfile();
          const normalizedPreferences = {
            currency: profileData.currency ? profileData.currency.toUpperCase() : null,
            dateFormat: profileData.dateFormat ? profileData.dateFormat.toUpperCase() : "MM/DD/YYYY",
            language: profileData.language || null,
          };

          setUserPreferences(normalizedPreferences);

          if (typeof window !== "undefined") {
            try {
              const storedUserRaw = localStorage.getItem("user");
              if (storedUserRaw) {
                const storedUser = JSON.parse(storedUserRaw);
                // Only update safe, non-sensitive fields
                const updatedUser = {
                  firstName: storedUser.firstName,
                  lastName: storedUser.lastName,
                  subscriptionTier: storedUser.subscriptionTier,
                  isAdmin: storedUser.isAdmin,
                  currency: normalizedPreferences.currency || storedUser?.currency,
                  dateFormat: normalizedPreferences.dateFormat || storedUser?.dateFormat,
                  language: normalizedPreferences.language || storedUser?.language,
                  darkMode: storedUser.darkMode
                };
                localStorage.setItem("user", JSON.stringify(updatedUser));
              }
            } catch (storageError) {
              console.warn("Failed to sync user preferences to localStorage:", storageError);
            }
          }
        } catch (prefError) {
          console.error("Error fetching user preferences for invoice defaults:", prefError);
        }

        const findCurrencyById = (id) => currenciesData.find(c => c.id === id);

        const preferredCurrency = profileData?.currency
          ? currenciesData.find(
              c => (c.code || "").toUpperCase() === profileData.currency.toUpperCase()
            )
          : null;

        const systemCurrency = setupData?.defaultCurrencyId
          ? findCurrencyById(setupData.defaultCurrencyId)
          : null;

        const fallbackCurrency =
          preferredCurrency ||
          systemCurrency ||
          currenciesData.find(c => (c.code || "").toUpperCase() === "EUR") ||
          currenciesData[0] ||
          null;

        const currencyDefaults = {
          id: fallbackCurrency?.id ?? systemCurrency?.id ?? 1,
          symbol:
            fallbackCurrency?.symbol ||
            fallbackCurrency?.code ||
            profileData?.currency ||
            "€",
          code: (fallbackCurrency?.code || profileData?.currency || "EUR")?.toUpperCase(),
        };
        
        if (isEdit && params.id) {
          try {
            const invoiceData = await getInvoiceById(params.id);
            mapInvoiceDataToForm(invoiceData, currenciesData, statusesData);
            
            // Load template based on invoice's document type
            if (invoiceData.documentTypeId) {
              await loadTemplateForDocumentType(invoiceData.documentTypeId);
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
          const defaultStatus = statusesData.find(s => s.statusId === 1) || { statusId: 1, name: 'Draft' };

          let baseDataForNewOrCopy;

          if (isCopy && params.id) {
            const invoiceToCopy = getOneInvoice(params.id); // Assuming this Redux state includes companyLogoMimeType
            if (invoiceToCopy) {
              const copyCurrency = findCurrencyById(invoiceToCopy.currencyId);
              baseDataForNewOrCopy = {
                ...invoiceToCopy,
                id: generateRandomId(),
                invoiceNumber: listSize + 1,
                currencyId: invoiceToCopy.currencyId || currencyDefaults.id,
                currency: invoiceToCopy.currency || copyCurrency?.symbol || currencyDefaults.symbol,
                currencyCode: (invoiceToCopy.currencyCode || copyCurrency?.code || currencyDefaults.code)?.toUpperCase(),
                statusId: invoiceToCopy.statusId || defaultStatus.statusId,
                statusName: invoiceToCopy.statusName || defaultStatus.name,
                templateId: null,
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
                currencyId: currencyDefaults.id,
                currency: currencyDefaults.symbol,
                currencyCode: currencyDefaults.code,
                statusId: defaultStatus.statusId,
                statusName: defaultStatus.name,
                templateId: activeTemplateData?.id || null,
              };
            }
          } else { // New invoice
            const defaultDocumentTypeId = documentTypes?.[0]?.id || 1;
            baseDataForNewOrCopy = {
              ...formData, // Initial formData state, includes empty companyLogoMimeType
              currencyId: currencyDefaults.id,
              currency: currencyDefaults.symbol,
              currencyCode: currencyDefaults.code,
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
            currencyCode: baseDataForNewOrCopy.currencyCode || currencyDefaults.code,
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
  }, [formData.items, formData.discountRate]);

  // Filter document types based on selected category
  useEffect(() => {
    if (documentTypes.length > 0) {
      const filtered = documentTypes.filter(dt => dt.category === documentCategory);
      setFilteredDocumentTypes(filtered);
      
      // If current documentTypeId is not in filtered list, select preferred type
      const currentTypeStillValid = filtered.find(dt => dt.id === formData.documentTypeId);
      if (!currentTypeStillValid && filtered.length > 0) {
        // For Invoice category, prefer the basic "Invoice" type (ID=1)
        // For Proforma category, prefer "Proforma Invoice" type (ID=3)
        let preferredType;
        if (documentCategory === "Invoice") {
          preferredType = filtered.find(dt => dt.id === 1) || filtered[0];
        } else if (documentCategory === "Proforma") {
          preferredType = filtered.find(dt => dt.id === 3) || filtered[0];
        } else {
          preferredType = filtered[0];
        }
        setFormData(prev => ({
          ...prev,
          documentTypeId: preferredType.id
        }));
      }
    }
  }, [documentTypes, documentCategory]);

  // Filter statuses based on document category
  // Proforma/Quotation documents don't have payment statuses
  useEffect(() => {
    if (statuses.length > 0) {
      if (documentCategory === "Proforma") {
        // For proforma/quotations, only allow Draft and Deleted statuses
        const allowedStatusIds = [1, 4]; // 1=Draft, 4=Deleted
        const filtered = statuses.filter(s => allowedStatusIds.includes(s.statusId));
        
        // If editing a Proforma with Unpaid/Paid status, include it in the dropdown
        // so the user can see the current status, but they can only change it to Draft or Deleted
        if (formData.statusId && !allowedStatusIds.includes(formData.statusId)) {
          const currentStatus = statuses.find(s => s.statusId === formData.statusId);
          if (currentStatus) {
            // Add the current status to the filtered list so it shows in the dropdown
            setFilteredStatuses([...filtered, currentStatus]);
          } else {
            setFilteredStatuses(filtered);
          }
        } else {
          setFilteredStatuses(filtered);
        }
      } else {
        // For invoices, show all statuses
        setFilteredStatuses(statuses);
      }
    }
  }, [statuses, documentCategory, formData.statusId]);

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

    // Set the selected client ID if the invoice has one
    if (invoiceData.clientId) {
      setSelectedClientId(invoiceData.clientId);
    }

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
      currencyCode: (invoiceData.currency?.code || invoiceData.currencyCode || "USD")?.toUpperCase(),
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
        itemTaxRate: (item.taxRate !== null && item.taxRate !== undefined) ? parseFloat(item.taxRate) : 0, // Per-item VAT rate
        productId: item.productId || null, // Preserve productId for stock management
        isCustomItem: item.isCustomItem || false
      })) || [
        {
          itemId: 0,
          itemName: "",
          itemPrice: "1.00",
          itemQuantity: 1,
          itemTaxRate: 0,
        },
      ],
      statusId: currentStatus.statusId,
      statusName: currentStatus.name,
      templateId: null,
      documentTypeId: invoiceData.documentTypeId || 1,
    });
    
    // Set document category based on the loaded invoice's document type
    if (invoiceData.documentTypeId && documentTypes.length > 0) {
      const docType = documentTypes.find(dt => dt.id === invoiceData.documentTypeId);
      if (docType && docType.category) {
        setDocumentCategory(docType.category);
      }
    }
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
      itemTaxRate: 0,
    };
    setFormData({
      ...formData,
      items: [...formData.items, newItem],
    });
    handleCalculateTotal();
  };

  const handleProductAdd = (product) => {
    // Check if there's an empty item first
    setFormData(prevFormData => {
      const emptyItemIndex = prevFormData.items.findIndex(
        item => !item.itemName || item.itemName.trim() === ''
      );

      let updatedItems;
      if (emptyItemIndex !== -1) {
        // Replace the first empty item with the selected product
        updatedItems = [...prevFormData.items];
        updatedItems[emptyItemIndex] = product;
      } else {
        // No empty items, add as new item
        updatedItems = [...prevFormData.items, product];
      }

      return {
        ...prevFormData,
        items: updatedItems,
      };
    });
    handleCalculateTotal();
  };

  const handleCalculateTotal = () => {
    setFormData((prevFormData) => {
      let totalGross = 0;
      let totalNet = 0;
      const vatByRate = {}; // Object to group VAT by rate
      
      prevFormData.items.forEach((item) => {
        const grossPrice = parseFloat(String(item.itemPrice).replace(/[^\d.-]/g, '')) || 0;
        const itemQuantity = parseInt(String(item.itemQuantity).replace(/[^\d.-]/g, '')) || 0;
        const itemTaxRate = parseFloat(String(item.itemTaxRate).replace(/[^\d.-]/g, '')) || 0;
        
        // Line total (gross) - price already includes VAT
        const lineGross = grossPrice * itemQuantity;
        totalGross += lineGross;
        
        // Calculate VAT amount from gross price
        // VAT = gross × (taxRate / (100 + taxRate))
        const itemVatAmount = itemTaxRate > 0 
          ? lineGross * (itemTaxRate / (100 + itemTaxRate))
          : 0;
        
        // Net amount = Gross - VAT
        const lineNet = lineGross - itemVatAmount;
        totalNet += lineNet;
        
        // Group VAT by rate
        if (itemTaxRate > 0) {
          if (!vatByRate[itemTaxRate]) {
            vatByRate[itemTaxRate] = 0;
          }
          vatByRate[itemTaxRate] += itemVatAmount;
        }
      });
      
      // Calculate total VAT amount
      const totalVatAmount = Object.values(vatByRate).reduce((sum, amount) => sum + amount, 0);
      
      const discountRate = parseFloat(prevFormData.discountRate) || 0;
      const discountAmount = (totalNet * (discountRate / 100)).toFixed(2);
      
      // Total = Gross - Discount (discount is applied to net, then add back VAT)
      const total = (totalGross - parseFloat(discountAmount)).toFixed(2);

      return {
        ...prevFormData,
        subTotal: totalNet.toFixed(2), // Net amount (excluding VAT)
        taxAmount: totalVatAmount.toFixed(2),
        vatBreakdown: vatByRate, // Store VAT breakdown for display
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
      setSelectedTemplate(null);
      const activeTemplateData = await getActiveInvoiceTemplate(documentTypeId);
      if (activeTemplateData) {
        setTemplateFromDto(activeTemplateData);
        setFormData(prev => ({ ...prev, templateId: activeTemplateData.id }));
      } else {
        setSelectedTemplate(null);
        setFormData(prev => ({ ...prev, templateId: null }));
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
        currency: selectedCurrency.symbol || selectedCurrency.code || prevData.currency,
        currencyCode: selectedCurrency.code || prevData.currencyCode,
      }));
    }
  };

  const validateInvoiceItems = () => {
    // Check if invoice has at least one item with a valid name
    const hasValidItems = formData.items && formData.items.length > 0 && 
      formData.items.some(item => item.itemName && item.itemName.trim() !== '');
    
    return hasValidItems;
  };

  const validateStock = async () => {
    // Get all items that are linked to products (not custom items)
    const productItems = formData.items.filter(item => item.productId && !item.isCustomItem);
    
    if (productItems.length === 0) {
      return { isValid: true }; // No stock items to validate
    }

    try {
      // Fetch current product stock levels
      const productsResponse = await getAllProducts();
      const products = productsResponse.data || productsResponse;

      // If editing, fetch the original invoice to compare quantities
      let originalItems = [];
      if (isEdit && params.id) {
        try {
          const originalInvoice = await getInvoiceById(params.id);
          originalItems = originalInvoice.items || [];
        } catch (error) {
          console.error("Error fetching original invoice for stock validation:", error);
          // If we can't fetch original, proceed with current validation
        }
      }

      // Check each product item against stock
      const stockIssues = [];
      
      for (const item of productItems) {
        const product = products.find(p => p.id === item.productId);
        
        if (product && product.trackInventory) {
          const requestedQty = parseInt(item.itemQuantity) || 0;
          const availableStock = product.stockQuantity || 0;
          
          // If editing, account for the quantity already allocated in the original invoice
          let effectiveAvailableStock = availableStock;
          if (isEdit && originalItems.length > 0) {
            const originalItem = originalItems.find(orig => orig.productId === item.productId);
            if (originalItem) {
              const originalQty = parseInt(originalItem.quantity) || 0;
              // Add back the original quantity to available stock
              effectiveAvailableStock = availableStock + originalQty;
            }
          }
          
          if (requestedQty > effectiveAvailableStock) {
            stockIssues.push({
              itemName: item.itemName,
              requested: requestedQty,
              available: effectiveAvailableStock
            });
          }
        }
      }

      if (stockIssues.length > 0) {
        return {
          isValid: false,
          issues: stockIssues
        };
      }

      return { isValid: true };
    } catch (error) {
      console.error("Error validating stock:", error);
      // If we can't validate stock, we'll allow the invoice to proceed
      // but log the error for debugging
      return { isValid: true };
    }
  };

  const handleStatusChange = async (newStatusId) => {
    if (!isEdit || !params.id) return;

    const selectedStatus = statuses.find(s => s.statusId === newStatusId);
    if (!selectedStatus) return;

    // Check if trying to change from Draft (statusId: 1) to another status
    const isDraftStatus = formData.statusId === 1;
    const isChangingFromDraft = isDraftStatus && newStatusId !== 1;

    // Validate items when changing from Draft to another status
    if (isChangingFromDraft) {
      const hasValidItems = validateInvoiceItems();
      
      if (!hasValidItems) {
        setNotification({
          open: true,
          message: "Cannot change status from Draft. Please add at least one item with a valid name before changing the invoice status.",
          severity: "error",
        });
        return;
      }

      // Check if all required fields are filled
      if (!formData.billTo || !formData.billToEmail || !formData.dateOfIssue) {
        setNotification({
          open: true,
          message: "Cannot change status from Draft. Please fill in all required fields (Bill To, Email, and Due Date) before changing the invoice status.",
          severity: "error",
        });
        return;
      }
    }

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

  const openModal = async (event) => {
    event.preventDefault();
    if (formData.documentTypeId) {
      await loadTemplateForDocumentType(formData.documentTypeId);
    }
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
      if (!dateString) {
        return new Date().toISOString();
      }
      
      // Create date from the input string (which is in YYYY-MM-DD format from date input)
      // Add 'T12:00:00Z' to make it noon UTC to avoid timezone issues
      const dateWithTime = dateString.includes('T') ? dateString : `${dateString}T12:00:00Z`;
      const date = new Date(dateWithTime);
      
      if (!isNaN(date.getTime())) {
        return date.toISOString();
      } 
      return new Date().toISOString(); 
    };

    const payload = {
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
      clientId: selectedClientId || null, // Link to client if selected
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
        UnitPrice: parseFloat(item.itemPrice) || 0,
        TaxRate: item.itemTaxRate !== undefined && item.itemTaxRate !== null && item.itemTaxRate !== "" ? parseFloat(item.itemTaxRate) : 0
      }))
    };
    
    return payload;
  };
  

  const handleAddInvoice = async () => {
    // For new invoices (not edits), check the limit first
    if (!isEdit) {
      const canCreate = checkLimit('invoice');
      if (!canCreate) {
        // Limit modal will be shown automatically by useLimit hook
        return;
      }
    }

    // Validate items if status is not Draft
    const isDraftStatus = formData.statusId === 1;
    if (!isDraftStatus) {
      const hasValidItems = validateInvoiceItems();
      
      if (!hasValidItems) {
        setNotification({
          open: true,
          message: "Cannot save invoice with a non-Draft status. Please add at least one item with a valid name or change the status to Draft.",
          severity: "error",
        });
        return;
      }

      // Check if all required fields are filled
      if (!formData.billTo || !formData.billToEmail || !formData.dateOfIssue) {
        setNotification({
          open: true,
          message: "Cannot save invoice with a non-Draft status. Please fill in all required fields (Bill To, Email, and Due Date) or change the status to Draft.",
          severity: "error",
        });
        return;
      }
    }

    // Validate stock for all product items
    setLoading(true);
    setLoadingMessage("Validating stock availability...");
    
    const stockValidation = await validateStock();
    if (!stockValidation.isValid) {
      const issueMessages = stockValidation.issues.map(issue => 
        `${issue.itemName}: Requested ${issue.requested}, Available ${issue.available}`
      ).join('\n');
      
      setLoading(false);
      setLoadingMessage("");
      setNotification({
        open: true,
        message: `Insufficient stock for the following items:\n${issueMessages}`,
        severity: "error",
      });
      return;
    }
    
    try {
      setLoadingMessage(isEdit ? "Updating invoice..." : "Creating invoice...");
      const invoiceData = prepareInvoiceDataForAPI();
      
      let result;
      if (isEdit) {
        result = await updateInvoice(params.id, invoiceData);
        dispatch(updateReduxInvoice({ id: params.id, updatedInvoice: formData }));
        setLoadingMessage("Invoice updated successfully! Redirecting...");
        setNotification({
          open: true,
          message: "Invoice updated successfully",
          severity: "success",
        });
      } else {
        result = await createInvoice(invoiceData);
        dispatch(addInvoice(formData));
        setLoadingMessage("Invoice created successfully! Redirecting...");
        setNotification({
          open: true,
          message: "Invoice added successfully",
          severity: "success",
        });
      }
      
      setTimeout(() => {
        navigate("/");
      }, 2000);
      
    } catch (error) {
      console.error("Error saving invoice:", error);
      
      setLoading(false);
      setLoadingMessage("");
      
      // Check if it's a limit error from the backend
      if (error.response?.status === 403 && error.response?.data?.limitReached) {
        const errorData = error.response.data;
        setNotification({
          open: true,
          message: errorData.message || "You have reached your limit for this resource.",
          severity: "error",
        });
        // The modal will be shown by the checkLimit call above
      } else {
        setNotification({
          open: true,
          message: `Failed to ${isEdit ? "update" : "create"} invoice: ${error.message}`,
          severity: "error",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopyInvoice = () => {
    const receivedInvoice = getOneInvoice(copyId);
    if (receivedInvoice) {
      const invoiceCurrency = currencies.find(c => c.id === receivedInvoice.currencyId);
      setFormData({
        ...receivedInvoice,
        id: formData.id,
        invoiceNumber: formData.invoiceNumber,
        templateId: receivedInvoice.templateId || formData.templateId,
        currency: receivedInvoice.currency || invoiceCurrency?.symbol || formData.currency,
        currencyCode: (receivedInvoice.currencyCode || invoiceCurrency?.code || formData.currencyCode)?.toUpperCase(),
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
    return <PageLoader color="#10b981" minHeight="100vh" />;
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
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Typography 
                  variant="h4" 
                  component="h1" 
                  sx={{ 
                    fontWeight: 700,
                    fontSize: { xs: '1.75rem', sm: '2rem' },
                    color: 'rgba(15, 23, 42, 0.95)',
                    letterSpacing: '-0.02em',
                    lineHeight: 1.1,
                  }}
                >
                  {isEdit ? "Edit Invoice" : isCopy ? "Copy Invoice" : "Create Invoice"}
                </Typography>
                <PageHelper 
                  inline={true}
                  compact={true}
                  {...pageHelpContent.invoice}
                />
              </Box>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'rgba(15, 23, 42, 0.5)',
                  fontSize: '0.9375rem',
                  fontWeight: 400,
                  letterSpacing: '-0.01em'
                }}
              >
                {isEdit ? "Update invoice details" : "Fill in the details below"}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Setup Completion Alert - Show only if setup is incomplete and not editing */}
        {!isEdit && setupStatus.isCheckComplete && (!setupStatus.hasCompanyInfo || !setupStatus.hasClients || !setupStatus.hasProducts) && (
          <Box sx={{ 
            width: '100%', 
            maxWidth: '1200px', 
            margin: '0 auto',
            px: { xs: 2, sm: 3, md: 4 },
            mb: 2
          }}>
            <Alert 
              severity="info" 
              sx={{ 
                borderRadius: '12px',
                backgroundColor: 'rgba(59, 130, 246, 0.08)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                '& .MuiAlert-icon': {
                  color: '#3b82f6'
                },
                '& .MuiAlert-message': {
                  color: 'rgba(15, 23, 42, 0.9)'
                }
              }}
            >
              <Typography variant="body1" sx={{ fontWeight: 600, mb: 1, color: 'rgba(15, 23, 42, 0.9)' }}>
                👋 Welcome! Complete your setup for a better invoice experience
              </Typography>
              <Typography variant="body2" sx={{ mb: 1.5, color: 'rgba(15, 23, 42, 0.7)' }}>
                Before creating invoices, we recommend setting up:
              </Typography>
              <Box component="ul" sx={{ m: 0, pl: 2.5, color: 'rgba(15, 23, 42, 0.7)' }}>
                {!setupStatus.hasCompanyInfo && (
                  <li>
                    <Typography variant="body2" component="span">
                      <strong>Company Details</strong> - Add your business information in{' '}
                      <Link 
                        to="/settings" 
                        style={{ 
                          color: '#2563eb', 
                          fontWeight: 600,
                          textDecoration: 'underline'
                        }}
                      >
                        System Settings
                      </Link>
                    </Typography>
                  </li>
                )}
                {!setupStatus.hasClients && (
                  <li>
                    <Typography variant="body2" component="span">
                      <strong>Clients</strong> - Create client profiles in{' '}
                      <Link 
                        to="/clients" 
                        style={{ 
                          color: '#2563eb', 
                          fontWeight: 600,
                          textDecoration: 'underline'
                        }}
                      >
                        Client Management
                      </Link>
                    </Typography>
                  </li>
                )}
                {!setupStatus.hasProducts && (
                  <li>
                    <Typography variant="body2" component="span">
                      <strong>Products/Services</strong> - Add items to your catalog in{' '}
                      <Link 
                        to="/products" 
                        style={{ 
                          color: '#2563eb', 
                          fontWeight: 600,
                          textDecoration: 'underline'
                        }}
                      >
                        Product Catalog
                      </Link>
                    </Typography>
                  </li>
                )}
              </Box>
              <Typography variant="body2" sx={{ mt: 1.5, fontStyle: 'italic', color: '#475569' }}>
                💡 You can still create invoices now, but completing these steps will make the process much faster!
              </Typography>
            </Alert>
          </Box>
        )}

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
          }}>            <Box sx={{ 
              p: 3, 
              borderBottom: '1px solid rgba(15, 23, 42, 0.08)',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2
            }}>              <Typography variant="h6" component="div" sx={{ 
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
                  ⚙
                </Box>
                Invoice Settings
              </Typography>
            </Box>              <Box sx={{ display: 'flex', flexWrap: 'wrap', p: 3, gap: 3 }}>
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

              {/* 3. Status Dropdown - Only in Edit Mode */}
              {isEdit && statuses.length > 0 && (
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
                }}>
                  <InputLabel id="status-select-label" sx={{ 
                    fontSize: "0.875rem",
                    color: 'rgba(15, 23, 42, 0.6)',
                    fontWeight: 500,
                    backgroundColor: 'transparent',
                    '&.Mui-focused': { color: '#8b5cf6' },
                    '&.MuiInputLabel-shrink': {
                      backgroundColor: 'white',
                      px: 0.5
                    }
                  }}>
                    Status
                  </InputLabel>
                  <Select
                    labelId="status-select-label"
                    label="Status"
                    value={formData.statusId || ''}
                    onChange={(event) => handleStatusChange(event.target.value)}
                    disabled={loading}
                    size="small"
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
                    {filteredStatuses.map(status => (
                      <MenuItem key={status.statusId} value={status.statusId}>
                        {status.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </Box>
          </Box>
        </Box>        <Box sx={{ 
          width: '100%', 
          maxWidth: '1200px', 
          margin: '0 auto',
          px: { xs: 2, sm: 3, md: 4 }
        }}>
          <Grid container spacing={{ xs: 2, md: 3 }}>            <Grid item xs={12} md={8} lg={9}>
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
              >              <Box
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
                  {/* Document Category Selection */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
                    <Typography sx={{ 
                      fontWeight: 700, 
                      minWidth: { xs: '100%', sm: '120px' },
                      color: '#2d3748',
                      fontSize: '0.95rem'
                    }}>
                      Category:
                    </Typography>
                    <FormControl size="small" sx={{ 
                      minWidth: { xs: '100%', sm: 160 }, 
                      flex: 1,
                      maxWidth: 200,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '10px',
                        backgroundColor: 'rgba(139, 92, 246, 0.04)',
                        border: '1px solid rgba(15, 23, 42, 0.12)',
                        transition: 'all 0.15s ease',
                        '& fieldset': {
                          border: 'none'
                        },
                        '&:hover': {
                          backgroundColor: 'rgba(139, 92, 246, 0.06)',
                          borderColor: 'rgba(15, 23, 42, 0.2)',
                        },
                        '&.Mui-focused': {
                          backgroundColor: 'white',
                          borderColor: 'rgba(15, 23, 42, 0.25)',
                          boxShadow: '0 0 0 3px rgba(139, 92, 246, 0.1)',
                        }
                      }
                    }}>
                      <Select
                        value={documentCategory}
                        onChange={(e) => {
                          const newCategory = e.target.value;
                          setDocumentCategory(newCategory);
                          // Auto-select appropriate document type from new category
                          const typesInCategory = documentTypes.filter(dt => dt.category === newCategory);
                          if (typesInCategory.length > 0) {
                            // For Invoice category, prefer the basic "Invoice" type (ID=1)
                            // For Proforma category, prefer "Proforma Invoice" type (ID=3)
                            let preferredType;
                            if (newCategory === "Invoice") {
                              preferredType = typesInCategory.find(dt => dt.id === 1) || typesInCategory[0];
                            } else if (newCategory === "Proforma") {
                              preferredType = typesInCategory.find(dt => dt.id === 3) || typesInCategory[0];
                            } else {
                              preferredType = typesInCategory[0];
                            }
                            editField('documentTypeId', preferredType.id);
                          }
                        }}
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
                        <MenuItem value="Invoice">Invoice (Counts for Logistics)</MenuItem>
                        <MenuItem value="Proforma">Proforma (Does Not Count)</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>

                  {/* Document Type Selection - Now filtered by category */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
                    <Typography sx={{ 
                      fontWeight: 700, 
                      minWidth: { xs: '100%', sm: '120px' },
                      color: '#2d3748',
                      fontSize: '0.95rem'
                    }}>
                      Document Type:
                    </Typography>
                    <FormControl size="small" sx={{ 
                      minWidth: { xs: '100%', sm: 160 }, 
                      flex: 1,
                      maxWidth: 200,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '10px',
                        backgroundColor: 'rgba(139, 92, 246, 0.04)',
                        border: '1px solid rgba(15, 23, 42, 0.12)',
                        transition: 'all 0.15s ease',
                        '& fieldset': {
                          border: 'none'
                        },
                        '&:hover': {
                          backgroundColor: 'rgba(139, 92, 246, 0.06)',
                          borderColor: 'rgba(15, 23, 42, 0.2)',
                        },
                        '&.Mui-focused': {
                          backgroundColor: 'white',
                          borderColor: 'rgba(15, 23, 42, 0.25)',
                          boxShadow: '0 0 0 3px rgba(139, 92, 246, 0.1)',
                        }
                      }
                    }}>
                      <Select
                        value={formData.documentTypeId || 1}
                        onChange={(e) => editField('documentTypeId', e.target.value)}
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
                        {filteredDocumentTypes.map((type) => (
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
                      Issue Date:
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
              </Box>              <Divider sx={{ 
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
                        ✉
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
                          px: 2,
                          py: 0.75,
                          backgroundColor: clientSelectionMode === "select" ? '#8b5cf6' : 'rgba(139, 92, 246, 0.04)',
                          borderColor: 'rgba(15, 23, 42, 0.12)',
                          color: clientSelectionMode === "select" ? 'white' : 'rgba(15, 23, 42, 0.75)',
                          '&:hover': {
                            backgroundColor: clientSelectionMode === "select" ? '#7c3aed' : 'rgba(139, 92, 246, 0.08)',
                            borderColor: 'rgba(15, 23, 42, 0.2)'
                          }
                        }}
                      >
                        Select Client
                      </Button>
                      <Button
                        variant={clientSelectionMode === "manual" ? "contained" : "outlined"}
                        size="small"
                        onClick={() => handleClientSelectionModeChange("manual")}
                        sx={{
                          borderRadius: '8px',
                          textTransform: 'none',
                          fontSize: '0.8rem',
                          px: 2,
                          py: 0.75,
                          backgroundColor: clientSelectionMode === "manual" ? '#8b5cf6' : 'rgba(139, 92, 246, 0.04)',
                          borderColor: 'rgba(15, 23, 42, 0.12)',
                          color: clientSelectionMode === "manual" ? 'white' : 'rgba(15, 23, 42, 0.75)',
                          '&:hover': {
                            backgroundColor: clientSelectionMode === "manual" ? '#7c3aed' : 'rgba(139, 92, 246, 0.08)',
                            borderColor: 'rgba(15, 23, 42, 0.2)'
                          }
                        }}
                      >
                        Manual Entry
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
                            label="Search & Select Client"
                            placeholder="Type to search clients..."
                            size="small"
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
                                fontWeight: 500
                              },
                              '& .MuiInputLabel-root': {
                                fontSize: "0.875rem",
                                color: 'rgba(15, 23, 42, 0.55)',
                                fontWeight: 500,
                                '&.Mui-focused': { color: 'rgba(15, 23, 42, 0.75)' }
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
                                {option.email} {option.company && `• ${option.company}`}
                              </Typography>
                              {option.phone && (
                                <Typography variant="caption" sx={{ color: '#6b7280' }}>
                                  {option.phone}
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
                            color: 'rgba(15, 23, 42, 0.55)'
                          },
                          '& .MuiAutocomplete-clearIndicator': {
                            color: 'rgba(15, 23, 42, 0.55)'
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
                            ? 'rgba(200, 200, 200, 0.3)' 
                            : 'rgba(255, 255, 255, 0.6)',
                          backdropFilter: 'blur(10px)',
                          borderRadius: '12px',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            background: (clientSelectionMode === "select" && selectedClientId) 
                              ? 'rgba(200, 200, 200, 0.3)'
                              : 'rgba(255, 255, 255, 0.8)'
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
                            ? 'rgba(200, 200, 200, 0.3)' 
                            : 'rgba(255, 255, 255, 0.6)',
                          backdropFilter: 'blur(10px)',
                          borderRadius: '12px',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            background: (clientSelectionMode === "select" && selectedClientId) 
                              ? 'rgba(200, 200, 200, 0.3)'
                              : 'rgba(255, 255, 255, 0.8)'
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
                            ? 'rgba(200, 200, 200, 0.3)' 
                            : 'rgba(255, 255, 255, 0.6)',
                          backdropFilter: 'blur(10px)',
                          borderRadius: '12px',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            background: (clientSelectionMode === "select" && selectedClientId) 
                              ? 'rgba(200, 200, 200, 0.3)'
                              : 'rgba(255, 255, 255, 0.8)'
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

                    {/* Show selected client info when in select mode */}
                    {clientSelectionMode === "select" && selectedClientId && (
                      <Box sx={{ 
                        mt: 2, 
                        p: 2, 
                        backgroundColor: 'rgba(139, 92, 246, 0.06)', 
                        borderRadius: '12px',
                        border: '1px solid rgba(139, 92, 246, 0.15)'
                      }}>
                        <Typography variant="caption" sx={{ color: '#8b5cf6', fontWeight: 600, mb: 1, display: 'block' }}>
                          Selected Client Details:
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
                    background: 'linear-gradient(135deg, rgba(118, 75, 162, 0.03) 0%, rgba(102, 126, 234, 0.03) 100%)',
                    borderRadius: '16px',
                    border: '1px solid rgba(139, 92, 246, 0.12)',
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
                        ⌂
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
                        <Typography sx={{ fontWeight: 600, color: '#4a5568' }}>Subtotal (excl. VAT):</Typography>
                        <Typography sx={{ fontWeight: 600, color: '#2d3748' }}>
                          {formData.currency}{formData.subTotal}
                        </Typography>
                      </Box>
                      
                      {/* Only show discount if it's greater than 0 */}
                      {parseFloat(formData.discountRate) > 0 && (
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
                      )}
                      
                      {/* VAT Breakdown - Show each VAT rate separately */}
                      {formData.vatBreakdown && Object.keys(formData.vatBreakdown).length > 0 && (
                        <>
                          {Object.entries(formData.vatBreakdown).map(([rate, amount]) => (
                            <Box
                              key={rate}
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                mb: 2,
                              }}
                            >
                              <Typography sx={{ fontWeight: 600, color: '#4a5568' }}>
                                VAT ({rate}%):
                              </Typography>
                              <Typography sx={{ fontWeight: 600, color: '#2d3748' }}>
                                {formData.currency}{amount.toFixed(2)}
                              </Typography>
                            </Box>
                          ))}
                        </>
                      )}
                      <Divider sx={{ my: 2, borderColor: "rgba(15, 23, 42, 0.08)" }} />
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          fontSize: "1.2rem",
                          fontWeight: "bold",
                        }}
                      >
                        <Typography sx={{ fontSize: "1.2rem", fontWeight: 700, color: '#2d3748' }}>Total (incl. VAT):</Typography>
                        <Typography sx={{ fontSize: "1.2rem", fontWeight: 700, color: '#8b5cf6' }}>
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
                invoiceNumber: formData.invoiceNumber,
                dateOfIssue: formData.dateOfIssue,
                dueDate: formData.dueDate,
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
              currencyCode={resolvedCurrencyCode}
              currencySymbol={formData.currency}
              subTotal={formData.subTotal}
              taxAmount={formData.taxAmount}
              discountAmount={formData.discountAmount}
              total={formData.total}
              logo={formData.companyLogo || ""}
              logoMimeType={formData.companyLogoMimeType}
              companyInfo={getCompanyInfo()}
              bankInfo={getBankInfo()}
              templateConfig={selectedTemplate?.parsedConfig}
              templateMeta={selectedTemplate}
              dateFormat={resolvedDateFormat}
              locale={resolvedLocale}
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
              px: 3,
              py: 1.25,
              borderRadius: '10px',
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              backdropFilter: 'blur(10px)',
              borderColor: 'rgba(15, 23, 42, 0.12)',
              color: 'rgba(15, 23, 42, 0.85)',
              fontWeight: 600,
              fontSize: '0.875rem',
              textTransform: 'none',
              border: '1px solid rgba(15, 23, 42, 0.12)',
              transition: 'all 0.2s ease',
              boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderColor: 'rgba(15, 23, 42, 0.25)',
                boxShadow: '0 1px 3px rgba(15, 23, 42, 0.08)'
              }
            }}
            disabled={loading}
          >
            Preview Invoice
          </Button>
          <Button
            variant="contained"
            onClick={handleAddInvoice}
            sx={{ 
              px: 3,
              py: 1.25,
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
              color: 'white',
              fontWeight: 600,
              fontSize: '0.875rem',
              textTransform: 'none',
              border: 'none',
              transition: 'all 0.2s ease',
              boxShadow: '0 1px 3px rgba(139, 92, 246, 0.15)',
              '&:hover': {
                background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
                boxShadow: '0 2px 6px rgba(139, 92, 246, 0.25)'
              }
            }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : (isEdit ? "Update Invoice" : "Save Invoice")}
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
      
      {/* Freemium Limit Reached Modal */}
      <LimitReachedModal
        open={limitModalOpen}
        onClose={closeLimitModal}
        resource={limitModalResource}
        limitInfo={limitModalInfo}
      />

      {/* Loading Overlay */}
      <LoadingOverlay open={loading} message={loadingMessage} />
      
      </form>
    </Box>
  );
};

export default InvoiceForm;
