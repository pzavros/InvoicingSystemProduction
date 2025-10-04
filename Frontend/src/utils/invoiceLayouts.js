// Invoice Layout Templates - Structure without colors
export const INVOICE_LAYOUTS = {
  classic: {
    id: 'classic',
    name: 'Classic Business',
    description: 'Traditional invoice layout with header, company details, and itemized billing',
    preview: 'Classic layout with company info at top, clean line items, and summary at bottom',
    structure: {
      header: {
        position: 'top',
        style: 'banner',
        height: 'large',
        alignment: 'spread'
      },
      companyInfo: {
        position: 'top-left',
        style: 'block',
        includeIcon: true
      },
      clientInfo: {
        position: 'top-right',
        style: 'block'
      },
      invoiceDetails: {
        position: 'middle',
        style: 'horizontal',
        fields: ['invoiceNumber', 'date', 'dueDate', 'terms']
      },
      itemsTable: {
        style: 'detailed',
        columns: ['description', 'quantity', 'rate', 'amount'],
        showSubtotals: true
      },
      totals: {
        position: 'right',
        style: 'boxed',
        showTax: true
      },
      footer: {
        style: 'notes',
        includeTerms: true
      }
    }
  },

  modern: {
    id: 'modern',
    name: 'Modern Minimal',
    description: 'Clean, contemporary design with sidebar layout and modern typography',
    preview: 'Sidebar company info, modern typography, and streamlined item presentation',
    structure: {
      header: {
        position: 'top',
        style: 'minimal',
        height: 'medium',
        alignment: 'left'
      },
      companyInfo: {
        position: 'sidebar-left',
        style: 'compact'
      },
      clientInfo: {
        position: 'main-top',
        style: 'inline'
      },
      invoiceDetails: {
        position: 'main-top',
        style: 'grid',
        fields: ['invoiceNumber', 'date', 'dueDate']
      },
      itemsTable: {
        style: 'minimal',
        columns: ['description', 'amount'],
        showSubtotals: false
      },
      totals: {
        position: 'right',
        style: 'minimal',
        showTax: false
      },
      footer: {
        style: 'minimal'
      }
    }
  },

  creative: {
    id: 'creative',
    name: 'Creative Bold',
    description: 'Eye-catching design with asymmetric layout and creative elements',
    preview: 'Bold asymmetric header, creative spacing, and visual emphasis elements',
    structure: {
      header: {
        position: 'top',
        style: 'asymmetric',
        height: 'large',
        alignment: 'creative'
      },
      companyInfo: {
        position: 'header-left',
        style: 'overlay'
      },
      clientInfo: {
        position: 'top-right',
        style: 'card'
      },
      invoiceDetails: {
        position: 'floating',
        style: 'cards',
        fields: ['invoiceNumber', 'date', 'dueDate', 'terms']
      },
      itemsTable: {
        style: 'creative',
        columns: ['description', 'quantity', 'rate', 'amount'],
        showSubtotals: true,
        alternateRows: true
      },
      totals: {
        position: 'right',
        style: 'highlight',
        showTax: true
      },
      footer: {
        style: 'creative',
        includeTerms: true,
        decorative: true
      }
    }
  },

  professional: {
    id: 'professional',
    name: 'Professional Corporate',
    description: 'Formal corporate layout perfect for B2B transactions',
    preview: 'Corporate header with logo space, formal typography, detailed breakdowns',
    structure: {
      header: {
        position: 'top',
        style: 'corporate',
        height: 'large',
        alignment: 'center',
        logoSpace: true
      },
      companyInfo: {
        position: 'top-center',
        style: 'formal'
      },
      clientInfo: {
        position: 'left-section',
        style: 'formal'
      },
      invoiceDetails: {
        position: 'right-section',
        style: 'formal',
        fields: ['invoiceNumber', 'date', 'dueDate', 'terms', 'project']
      },
      itemsTable: {
        style: 'detailed-corporate',
        columns: ['item', 'description', 'hours', 'rate', 'amount'],
        showSubtotals: true,
        showTax: true
      },
      totals: {
        position: 'right',
        style: 'corporate',
        showTax: true,
        showDiscount: true
      },
      footer: {
        style: 'corporate',
        includeTerms: true,
        includeLegal: true
      }
    }
  },

  simple: {
    id: 'simple',
    name: 'Simple & Clean',
    description: 'Straightforward layout focusing on clarity and readability',
    preview: 'No-frills design with clear sections and easy-to-read formatting',
    structure: {
      header: {
        position: 'top',
        style: 'simple',
        height: 'small',
        alignment: 'left'
      },
      companyInfo: {
        position: 'top-left',
        style: 'simple'
      },
      clientInfo: {
        position: 'top-right',
        style: 'simple'
      },
      invoiceDetails: {
        position: 'middle',
        style: 'simple',
        fields: ['invoiceNumber', 'date', 'dueDate']
      },
      itemsTable: {
        style: 'simple',
        columns: ['description', 'amount'],
        showSubtotals: false
      },
      totals: {
        position: 'right',
        style: 'simple',
        showTax: false
      },
      footer: {
        style: 'simple'
      }
    }
  }
};

export default INVOICE_LAYOUTS;
