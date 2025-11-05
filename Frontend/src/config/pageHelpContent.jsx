import React from 'react';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Description as InvoiceIcon,
  Inventory as ProductIcon,
  Receipt as TemplateIcon,
  Assessment as ReportIcon,
  Settings as SettingsIcon,
  TrendingUp,
  Add,
  Edit,
  FilterList,
  Search,
  Download,
  Email,
  Payment,
  Palette,
  Category,
  Receipt,
  ViewModule
} from '@mui/icons-material';

/**
 * Help content configuration for all pages
 * Each page has: title, description, steps, and tips
 */
export const pageHelpContent = {
  dashboard: {
    title: 'Dashboard Overview',
    description: 'Your dashboard displays key business metrics at a glance. Track monthly earnings, invoice counts, and analyze annual trends to understand your business performance.',
    steps: [
      {
        icon: <FilterList sx={{ color: '#8b5cf6' }} />,
        title: 'Select Month & Year',
        description: 'Use the month and year dropdown filters to view data for specific time periods. The monthly cards below update automatically to show earnings and invoice counts.'
      },
      {
        icon: <TrendingUp sx={{ color: '#8b5cf6' }} />,
        title: 'View Monthly Metrics',
        description: 'The top section shows two key cards: Current Month Earnings (total revenue) and Current Month Invoice Count. These reflect only the selected month and year.'
      },
      {
        icon: <DashboardIcon sx={{ color: '#8b5cf6' }} />,
        title: 'Analyze Annual Charts',
        description: 'Scroll down to see Annual Earnings Chart and Annual Invoice Count Chart. These visualize trends across 12 months and can be switched between different years.'
      }
    ],
    tips: [
      'Dashboard data updates automatically when you create, edit, or delete invoices.',
      'Monthly earnings include all invoice statuses - paid, unpaid, and drafts.',
      'Use the year selector on charts to compare performance across different years.',
      'Charts show monthly breakdown to help identify seasonal patterns.',
      'The system stores up to 5 years of historical data for trend analysis.'
    ]
  },

  clients: {
    title: 'Clients Management',
    description: 'Manage your client database efficiently. Add, edit, search, and organize all your client information in one centralized location.',
    steps: [
      {
        icon: <Add sx={{ color: '#8b5cf6' }} />,
        title: 'Add New Client',
        description: 'Click "Add Client" button in the top-right corner. Enter client name, email, address, phone number, and optional tax ID for business clients.'
      },
      {
        icon: <Search sx={{ color: '#8b5cf6' }} />,
        title: 'Search Clients',
        description: 'Use the search bar to find clients quickly by typing their name, email, or company. Results filter in real-time as you type.'
      },
      {
        icon: <Edit sx={{ color: '#8b5cf6' }} />,
        title: 'Edit or Delete',
        description: 'Click the edit icon on any client row to update their information. Use the delete icon to remove clients (only if they have no associated invoices).'
      }
    ],
    tips: [
      'Fill in complete client details for professional invoices.',
      'Client email is required for sending invoices digitally.',
      'Tax ID field is useful for B2B clients requiring tax documentation.',
      'You cannot delete clients who have existing invoices - this protects your invoice history.',
      'Client information auto-fills when creating new invoices.'
    ]
  },

  invoice: {
    title: 'Create & Manage Invoices',
    description: 'Create professional invoices with ease. Fill in client details, add items, customize templates, and save or generate PDFs for your clients.',
    steps: [
      {
        icon: <PeopleIcon sx={{ color: '#8b5cf6' }} />,
        title: 'Select or Add Client',
        description: 'Choose an existing client from the dropdown menu. Their information (name, email, address) will automatically populate the invoice. You can also create a new client on the fly.'
      },
      {
        icon: <Add sx={{ color: '#8b5cf6' }} />,
        title: 'Add Products/Services',
        description: 'Click "Add Item" to include products or services. Select from your product catalog for quick entry, or manually enter item name, description, quantity, and price.'
      },
      {
        icon: <TemplateIcon sx={{ color: '#8b5cf6' }} />,
        title: 'Choose Document Type & Template',
        description: 'Select the document type (Invoice, Quote, Receipt, etc.) and choose a template that matches your branding. The preview updates in real-time.'
      },
      {
        icon: <Payment sx={{ color: '#8b5cf6' }} />,
        title: 'Set Dates & Terms',
        description: 'Configure the issue date, due date, and payment terms. Add notes or special instructions in the notes field. Set invoice status (Draft, Sent, Paid, etc.).'
      },
      {
        icon: <Download sx={{ color: '#8b5cf6' }} />,
        title: 'Save & Download PDF',
        description: 'Click "Save" to store the invoice in your database. Use the preview to generate and download a PDF. Send it to your client via your preferred method.'
      }
    ],
    tips: [
      'Use Draft status while working on invoices - change to Sent once delivered to client.',
      'Product catalog items speed up invoice creation significantly.',
      'Currency and tax settings are configured in System Setup.',
      'Invoice numbers are auto-generated but can be customized.',
      'All invoice data is saved automatically as you work.',
      'You can duplicate existing invoices to save time on recurring charges.'
    ]
  },

  products: {
    title: 'Product & Service Catalog',
    description: 'Build and maintain your product/service catalog. Organize items by categories, manage inventory, and use them for quick invoice creation.',
    steps: [
      {
        icon: <Add sx={{ color: '#8b5cf6' }} />,
        title: 'Add Products or Services',
        description: 'Click "Add Product" to create new catalog items. Enter name, description, price, SKU, and select a category. Toggle "Track Inventory" for physical products.'
      },
      {
        icon: <Category sx={{ color: '#8b5cf6' }} />,
        title: 'Manage Categories',
        description: 'Switch to the "Categories" tab to create, edit, or delete product categories. Organize products logically (e.g., Consulting, Products, Software, etc.).'
      },
      {
        icon: <Edit sx={{ color: '#8b5cf6' }} />,
        title: 'Update Products',
        description: 'Click edit icon on any product to modify details or pricing. Inventory levels can be tracked and adjusted. Deactivate products instead of deleting them.'
      },
      {
        icon: <InvoiceIcon sx={{ color: '#8b5cf6' }} />,
        title: 'Use in Invoices',
        description: 'When creating invoices, click "Add Item" and select from your catalog. Product details auto-fill, saving time and ensuring consistency.'
      }
    ],
    tips: [
      'Free plan users have limits on products and categories - upgrade to Premium for unlimited items.',
      'Check the "Low Stock" tab to monitor inventory levels and reorder products.',
      'Use clear, descriptive names for easy selection during invoice creation.',
      'Pricing changes only affect new invoices, not existing ones.',
      'Categories help organize large catalogs - use them wisely.',
      'SKU codes are optional but helpful for inventory management.'
    ]
  },

  templates: {
    title: 'Invoice Templates & Branding',
    description: 'Customize how your invoices look. Choose layouts, adjust colors, add your logo, and create professional branded documents for different document types.',
    steps: [
      {
        icon: <Palette sx={{ color: '#8b5cf6' }} />,
        title: 'Select Document Type',
        description: 'Choose the document type (Invoice, Quote, Receipt, Credit Note, etc.). Each type can have its own default template and styling.'
      },
      {
        icon: <Add sx={{ color: '#8b5cf6' }} />,
        title: 'Create New Template',
        description: 'Click "Add Template" to create a custom design. Name it, choose a layout style, and customize colors, fonts, and positioning.'
      },
      {
        icon: <Edit sx={{ color: '#8b5cf6' }} />,
        title: 'Customize Design',
        description: 'Edit template properties including header color, accent color, font styles, logo placement, and layout structure. See changes in the preview.'
      },
      {
        icon: <Download sx={{ color: '#8b5cf6' }} />,
        title: 'Set as Active',
        description: 'Mark a template as "Active" to use it as the default for that document type. Only one template can be active per document type at a time.'
      }
    ],
    tips: [
      'Free plan users are limited to a specific number of templates - upgrade for unlimited templates.',
      'Upload your company logo in System Setup - it appears on all templates.',
      'Test templates by creating sample invoices before using them with clients.',
      'Create different templates for different clients or use cases.',
      'Active templates are automatically selected when creating new documents.',
      'You can preview templates before setting them as active.'
    ]
  },

  reports: {
    title: 'Reports & Financial Analytics',
    description: 'Generate detailed reports on your invoicing activity. Filter by date range, status, and clients to analyze your business performance and export data.',
    steps: [
      {
        icon: <FilterList sx={{ color: '#8b5cf6' }} />,
        title: 'Set Date Range & Filters',
        description: 'Use the filter panel to select start date, end date, and invoice status (All, Draft, Sent, Paid, Overdue, etc.). Click "Generate Report" to view results.'
      },
      {
        icon: <ReportIcon sx={{ color: '#8b5cf6' }} />,
        title: 'View Report Data',
        description: 'Review the data table showing invoice number, client, amount, status, dates, and totals. Use column sorting and search to find specific records.'
      },
      {
        icon: <Download sx={{ color: '#8b5cf6' }} />,
        title: 'Export to Excel',
        description: 'Click the "Export to Excel" button to download your report data as a spreadsheet. Great for accounting, tax preparation, and sharing with stakeholders.'
      },
      {
        icon: <TrendingUp sx={{ color: '#8b5cf6' }} />,
        title: 'Analyze Trends',
        description: 'Compare different time periods to identify trends. Check revenue by month, track payment patterns, and identify top clients.'
      }
    ],
    tips: [
      'Default date range is the current month - adjust as needed.',
      'Use status filters to find unpaid or overdue invoices quickly.',
      'Export reports monthly for your bookkeeper or accountant.',
      'Save time by using common date ranges (This Month, Last Month, This Year).',
      'Column headers are sortable - click to organize data.',
      'Use the search function to find specific invoices or clients in large reports.'
    ]
  },

  systemSetup: {
    title: 'System Configuration',
    description: 'Configure your business information, currency preferences, logo, and system defaults. This information appears on all your invoices and documents.',
    steps: [
      {
        icon: <SettingsIcon sx={{ color: '#8b5cf6' }} />,
        title: 'Company Profile',
        description: 'Enter your business name, address, phone, email, website, and tax ID. This information auto-populates on all invoices as the "Bill From" section.'
      },
      {
        icon: <Payment sx={{ color: '#8b5cf6' }} />,
        title: 'Currency & Regional Settings',
        description: 'Select your default currency from the dropdown (USD, EUR, GBP, etc.). Choose your language preference for the interface.'
      },
      {
        icon: <Receipt sx={{ color: '#8b5cf6' }} />,
        title: 'Upload Company Logo',
        description: 'Click "Upload Logo" to add your company branding. Logo appears on all invoice templates. Recommended size: 200x60 pixels, PNG or JPG format.'
      },
      {
        icon: <Category sx={{ color: '#8b5cf6' }} />,
        title: 'Invoice Numbering & Terms',
        description: 'Set invoice number prefix (e.g., "INV-"), starting number, and default payment terms. Add default notes or footer text for all invoices.'
      }
    ],
    tips: [
      'Complete System Setup before creating your first invoice.',
      'Your company information is used as default "Bill From" on all invoices.',
      'Logo should be high quality for professional appearance in PDFs.',
      'Currency setting affects all new invoices - choose carefully.',
      'Default payment terms save time but can be changed per invoice.',
      'Update your information here if you change business address or contact details.',
      'Tax ID is important for compliance in many regions.'
    ]
  }
};

export default pageHelpContent;
