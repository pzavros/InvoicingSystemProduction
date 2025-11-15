import Page from '../components/ReusableComponents/Page.jsx';
import SEO from '../components/SEO.jsx';
import FreelancerHeroSection from '../components/FreelancerInvoicingPage/FreelancerHeroSection.jsx';
import FreelancerFeaturesSection from '../components/FreelancerInvoicingPage/FreelancerFeaturesSection.jsx';
import FreelancerBenefitsSection from '../components/FreelancerInvoicingPage/FreelancerBenefitsSection.jsx';
import FreelancerIndustriesSection from '../components/FreelancerInvoicingPage/FreelancerIndustriesSection.jsx';
import FreelancerCountriesSection from '../components/FreelancerInvoicingPage/FreelancerTestimonialsSection.jsx';
import FreelancerCTASection from '../components/FreelancerInvoicingPage/FreelancerCTASection.jsx';

const FreelancerInvoicingPage = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "E-nvoicing - Invoicing System for Freelancers",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "description": "Professional invoicing system for freelancers worldwide. Simple online invoice software with multi-currency support (EUR, GBP, USD, and more), international payments via Stripe, automated billing, and mobile-friendly. Perfect for freelance developers, designers, consultants, writers, and digital professionals.",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "150"
    },
    "featureList": [
      "Online invoicing for freelancers",
      "Multi-currency invoicing (EUR, GBP, USD, CHF, CAD, AUD)",
      "International payment processing",
      "Cloud-based invoice system",
      "Professional invoice templates",
      "Automated billing",
      "Stripe payment integration",
      "VAT/Tax-compliant invoicing",
      "Digital invoice management",
      "Client management system",
      "Expense tracking",
      "Financial reporting"
    ],
    "audience": {
      "@type": "Audience",
      "audienceType": "Freelancers, Independent Contractors, Self-Employed Professionals"
    }
  };

  return (
    <Page>
      <SEO
        title="Invoicing System for Freelancers | Professional Online Invoice Software"
        description="Simple invoicing system for freelancers worldwide. Professional invoice software with multi-currency support, international payments, automated billing, and mobile access. Perfect for developers, designers, consultants, writers, and digital professionals."
        keywords="invoicing system for freelancers, freelance invoice software, online invoicing for freelancers, freelancer billing software, invoice software for self-employed, freelance invoicing system, professional invoice software, multi-currency invoicing, international freelancer invoicing, freelance payment software, invoice app for freelancers, freelance billing system, online invoice generator, freelance invoice template, digital invoicing for freelancers, cloud invoicing software, freelance business invoicing, contractor invoice software, solopreneur invoicing, freelance accounting software"
        structuredData={structuredData}
      />
      <FreelancerHeroSection />
      <FreelancerFeaturesSection />
      <FreelancerBenefitsSection />
      <FreelancerIndustriesSection />
      <FreelancerCountriesSection />
      <FreelancerCTASection />
    </Page>
  );
};

export default FreelancerInvoicingPage;
