import Page from '../components/ReusableComponents/Page.jsx';
import SEO from '../components/SEO.jsx';
import CyprusHeroSection from '../components/InvoicingSystemCyprusPage/CyprusHeroSection.jsx';
import CyprusFeaturesSection from '../components/InvoicingSystemCyprusPage/CyprusFeaturesSection.jsx';
import CyprusBenefitsSection from '../components/InvoicingSystemCyprusPage/CyprusBenefitsSection.jsx';
import CyprusIndustriesSection from '../components/InvoicingSystemCyprusPage/CyprusIndustriesSection.jsx';
import CyprusCitiesSection from '../components/InvoicingSystemCyprusPage/CyprusCitiesSection.jsx';
import CyprusCTASection from '../components/InvoicingSystemCyprusPage/CyprusCTASection.jsx';

const InvoicingSystemCyprusPage = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "E-nvoicing - Invoicing System Cyprus",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "description": "Simple invoicing system for Cyprus electricians, HVAC technicians, plumbers, contractors, and service providers. Professional online invoice software with multi-currency support (EUR, GBP, USD), VAT compliance, mobile-friendly, and easy to use - no technical skills needed.",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "EUR",
      "availability": "https://schema.org/InStock"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "150"
    },
    "featureList": [
      "E-invoicing Cyprus",
      "Invoice software Cyprus",
      "Online invoicing Cyprus",
      "Multi-currency invoicing (EUR, GBP, USD)",
      "Cloud-based invoice system",
      "Professional invoice templates",
      "Automated billing Cyprus",
      "Stripe payment integration",
      "VAT-compliant invoicing",
      "Digital invoice management"
    ],
    "areaServed": {
      "@type": "Country",
      "name": "Cyprus"
    },
    "audience": {
      "@type": "Audience",
      "audienceType": "Business",
      "geographicArea": {
        "@type": "Country",
        "name": "Cyprus"
      }
    }
  };

  return (
    <Page>
      <SEO
        title="Invoicing System Cyprus | E-Invoicing for Electricians, HVAC, Plumbers & Contractors"
        description="Simple invoicing system for Cyprus electricians, HVAC technicians, plumbers, and contractors. Professional invoice software with EUR support, VAT compliance, works on mobile. Perfect for tradespeople and service providers in Nicosia, Limassol, Larnaca."
        keywords="invoicing system cyprus, invoice software cyprus electricians, cyprus plumber invoicing, HVAC invoice cyprus, contractor invoice software cyprus, e-invoicing cyprus, online invoicing cyprus, cyprus invoice system, invoicing software cyprus, tradesperson invoicing cyprus, electrician invoice cyprus, air conditioning invoice cyprus, plumber invoice software cyprus, contractor billing cyprus, cyprus business invoicing, VAT invoice cyprus, EUR invoicing cyprus, mobile invoicing cyprus, Nicosia electrician invoice, Limassol contractor software, Cyprus tradesperson invoicing, simple invoice cyprus, professional invoice cyprus"
        structuredData={structuredData}
      />
      <CyprusHeroSection />
      <CyprusFeaturesSection />
      <CyprusBenefitsSection />
      <CyprusIndustriesSection />
      <CyprusCitiesSection />
      <CyprusCTASection />
    </Page>
  );
};

export default InvoicingSystemCyprusPage;
