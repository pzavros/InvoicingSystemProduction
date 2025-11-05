// Global Business Structured Data
// Update this with your actual business information

export const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareCompany",
  "name": "Professional Invoicing System",
  "description": "Advanced cloud-based invoicing and logistics reporting system for businesses worldwide",
  "url": "https://e-nvoicing.com",
  "logo": "https://e-nvoicing.com/media/logo.svg",
  "image": "https://e-nvoicing.com/media/og-image.jpg",
  // Only include address if you have a physical location
  // "address": {
  //   "@type": "PostalAddress",
  //   "streetAddress": "Your Street Address",
  //   "addressLocality": "Your City",
  //   "addressRegion": "Your State/Region",
  //   "postalCode": "12345",
  //   "addressCountry": "US" // Use ISO country code
  // },
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+1-XXX-XXX-XXXX", // Update with your number
    "contactType": "customer service",
    "availableLanguage": ["English"],
    "areaServed": ["US", "GB", "CA", "AU", "EU", "CY"] // Countries you serve
  },
  "sameAs": [
    "https://www.linkedin.com/company/yourcompany",
    "https://twitter.com/yourcompany",
    "https://www.facebook.com/yourcompany"
  ],
  "priceRange": "€€"
};

// FAQ Schema - Add to FAQ section or create FAQ page
export const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is e-invoicing?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "E-invoicing (electronic invoicing) is the digital exchange of invoice documents between suppliers and buyers. It automates the invoicing process, reduces errors, speeds up payment cycles, and works globally across borders."
      }
    },
    {
      "@type": "Question",
      "name": "How much does the invoicing system cost?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "We offer a free plan for getting started and premium plans with competitive pricing. Visit our pricing page for detailed information about features and costs for businesses of all sizes."
      }
    },
    {
      "@type": "Question",
      "name": "Can I use this invoicing system internationally?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, our cloud-based invoicing system is designed for global businesses with multi-currency support, international payment processing via Stripe, and compliance with international invoicing standards."
      }
    },
    {
      "@type": "Question",
      "name": "Does the system integrate with payment processors?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, we integrate with Stripe for seamless online payment processing, allowing your customers worldwide to pay invoices directly online in multiple currencies."
      }
    },
    {
      "@type": "Question",
      "name": "Can I customize invoice templates?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Absolutely! Our system offers professional, customizable invoice templates that you can brand with your logo, colors, and business information to maintain consistent branding globally."
      }
    },
    {
      "@type": "Question",
      "name": "Is the invoicing system cloud-based?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, our system is 100% cloud-based, meaning you can access it from anywhere in the world with an internet connection. No software installation required."
      }
    }
  ]
};

// Product Schema
export const productSchema = {
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Professional Invoicing System",
  "description": "Advanced cloud-based invoicing and logistics reporting system for businesses worldwide",
  "brand": {
    "@type": "Brand",
    "name": "Professional Invoicing System"
  },
  "offers": {
    "@type": "AggregateOffer",
    "priceCurrency": "USD",
    "lowPrice": "0",
    "highPrice": "49.99",
    "offerCount": "2",
    "availability": "https://schema.org/InStock"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "150"
  }
};

// Breadcrumb Schema - Use on inner pages
export const createBreadcrumbSchema = (items) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": items.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": item.name,
    "item": item.url
  }))
});

// Example usage for Features page:
// const featuresBreadcrumb = createBreadcrumbSchema([
//   { name: "Home", url: "https://yourdomain.com/" },
//   { name: "Features", url: "https://yourdomain.com/features" }
// ]);
