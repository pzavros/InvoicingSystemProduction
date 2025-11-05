// Centralized SEO keywords management
// Update these keywords based on your market research and performance data

export const seoKeywords = {
  // Primary keywords (high search volume, high competition)
  primary: [
    'invoicing system',
    'e-invoicing',
    'invoice software',
    'digital invoicing',
    'invoice management'
  ],

  // Secondary keywords (medium search volume, medium competition)
  secondary: [
    'professional invoicing',
    'automated invoicing',
    'billing software',
    'invoice generator',
    'online invoicing',
    'invoice tracking',
    'invoice templates'
  ],

  // Location-based keywords (Global markets)
  local: [
    'invoicing software USA',
    'invoice system UK',
    'e-invoicing Europe',
    'invoice software Canada',
    'billing software Australia',
    'digital invoicing worldwide',
    'invoice management global',
    'international invoicing solution',
    'cloud invoicing system',
    'invoicing Cyprus' // Keep Cyprus as one of many markets
  ],

  // Long-tail keywords (lower competition, higher conversion)
  longTail: [
    'best invoicing system for small business',
    'professional invoice software for logistics',
    'multi-currency invoice system',
    'automated billing software online',
    'invoice management system with Stripe',
    'how to create professional invoices',
    'invoice software with payment integration',
    'logistics invoice tracking system',
    'cloud-based invoicing solution',
    'international invoicing software',
    'SaaS invoicing platform',
    'web-based invoice management'
  ],

  // Feature-specific keywords
  features: [
    'multi-currency invoicing',
    'Stripe invoice integration',
    'invoice payment processing',
    'customizable invoice templates',
    'automated invoice reminders',
    'invoice analytics',
    'logistics reporting',
    'invoice PDF generation',
    'cloud invoice storage',
    'recurring invoicing',
    'invoice API integration',
    'real-time invoice tracking'
  ],

  // Industry-specific
  industry: [
    'logistics invoicing',
    'freight invoice software',
    'shipping invoice system',
    'transport billing software',
    'warehouse invoicing',
    'supply chain invoicing'
  ],

  // Intent-based (what users are trying to do)
  intent: {
    informational: [
      'what is e-invoicing',
      'how does invoicing software work',
      'benefits of digital invoicing',
      'invoice vs receipt',
      'cloud invoicing explained',
      'international invoicing best practices',
      'multi-currency invoicing guide'
    ],
    navigational: [
      'invoicing system login',
      'invoice software demo',
      'invoice template download'
    ],
    transactional: [
      'buy invoice software',
      'invoice system pricing',
      'get invoicing software',
      'start invoicing today',
      'invoice software free trial'
    ]
  },

  // Competitor alternatives (use carefully, ethically)
  alternatives: [
    'invoice software like QuickBooks',
    'FreshBooks alternative Cyprus',
    'Zoho Invoice alternative',
    'Wave invoicing alternative'
  ],

  // Question-based (voice search & featured snippets)
  questions: [
    'how to create an invoice',
    'what is the best invoicing software',
    'how much does invoicing software cost',
    'which invoice system is best for small business',
    'what features should invoice software have',
    'how to automate invoicing',
    'what is cloud-based invoicing',
    'how to invoice international clients',
    'what is multi-currency invoicing',
    'how to accept payments on invoices',
    'best invoicing software for freelancers',
    'how to send professional invoices'
  ]
};

// Helper function to generate keyword string for meta tags
export const generateKeywordString = (...keywordArrays) => {
  return keywordArrays
    .flat()
    .filter((keyword, index, self) => self.indexOf(keyword) === index) // Remove duplicates
    .join(', ');
};

// Pre-generated keyword combinations for different pages
export const pageKeywords = {
  home: generateKeywordString(
    seoKeywords.primary,
    seoKeywords.secondary.slice(0, 5),
    seoKeywords.local.slice(0, 5),
    seoKeywords.longTail.slice(0, 3)
  ),
  
  features: generateKeywordString(
    seoKeywords.features,
    seoKeywords.primary.slice(0, 3),
    seoKeywords.secondary.slice(0, 3)
  ),
  
  pricing: generateKeywordString(
    ['invoicing pricing', 'invoice software cost', 'billing software pricing'],
    seoKeywords.intent.transactional.slice(0, 3),
    seoKeywords.primary.slice(0, 3)
  ),
  
  contact: generateKeywordString(
    ['invoice support Cyprus', 'invoicing help', 'billing software support'],
    seoKeywords.local.slice(0, 3)
  ),
  
  about: generateKeywordString(
    ['invoicing company Cyprus', 'e-invoicing provider'],
    seoKeywords.primary.slice(0, 3)
  ),

  howItWorks: generateKeywordString(
    seoKeywords.intent.informational.slice(0, 3),
    seoKeywords.primary.slice(0, 3)
  )
};

// Common typos and variations to consider (for content, not meta keywords)
export const keywordVariations = {
  'invoicing': ['envoicing', 'e-nvoicing', 'invoicing', 'invoiceing'],
  'invoice': ['invioce', 'innvoice', 'invoce'],
  'billing': ['biling', 'billling'],
  'system': ['systep', 'sistem', 'systme']
};

// Search trends - Update quarterly based on Google Trends
export const seasonalKeywords = {
  yearEnd: ['year-end invoicing', 'tax invoice preparation', 'annual billing'],
  quarterEnd: ['quarterly invoicing', 'Q1 invoice', 'quarterly billing'],
  taxSeason: ['tax compliant invoices', 'VAT invoice Cyprus', 'tax invoice software']
};

export default seoKeywords;
