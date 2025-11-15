import Page from '../components/ReusableComponents/Page.jsx';
import SEO from '../components/SEO.jsx';
import HeroSection from '../components/HomePage/HeroSection.jsx';
import LogisticsReportSection from '../components/HomePage/LogisticsReportSection.jsx';
import FeaturesSection from '../components/HomePage/FeaturesSection.jsx';
import HowItWorksSection from '../components/HomePage/HowItWorksSection.jsx';
import WhyChooseUsSection from '../components/HomePage/WhyChooseUsSection.jsx';
import CTASection from '../components/HomePage/CTASection.jsx';

const HomePage = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "E-nvoicing - Professional Invoicing System",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "description": "Advanced cloud-based invoicing system and e-invoicing software for businesses worldwide. Professional online invoice software with Stripe integration, multi-currency support, and automated billing. Serving businesses globally including Cyprus.",
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
      "E-invoicing system",
      "Online invoicing software",
      "Invoice software",
      "Logistics reporting",
      "Invoice management system",
      "Stripe payment integration",
      "Multi-currency support",
      "Professional invoice templates",
      "Automated billing system",
      "Cloud-based invoicing",
      "International invoicing",
      "VAT-compliant invoicing",
      "Invoice tracking",
      "Client management",
      "Digital invoice generation",
      "Cyprus invoice software",
      "EUR currency support",
      "Invoice maker",
      "Business billing software"
    ],
    "audience": {
      "@type": "Audience",
      "audienceType": "Business"
    }
  };

  return (
    <Page>
      <SEO
        title="Invoicing System | E-Invoicing Software | Online Invoice Software | E-nvoicing"
        description="Professional invoicing system and e-invoicing software for businesses worldwide. Online invoice software with multi-currency support, cloud-based invoice management, and automated billing. Perfect for freelancers, SMEs, and enterprises. Also serving Cyprus businesses with EUR invoicing."
        keywords="invoicing system, e-invoicing, electronic invoicing, invoice software, online invoicing software, online invoicing, digital invoicing, invoice management, cloud invoicing, invoice system, professional invoicing, invoice generator, billing software, Stripe invoicing, invoice templates, business invoicing, invoice tracking, automated invoicing, multi-currency invoicing, SaaS invoicing, invoice software cyprus, invoicing system cyprus, e-invoicing cyprus, online invoicing cyprus, cyprus invoice software, invoice app, invoicing solution, create invoices, invoice maker, invoicing platform, web-based invoicing, freelance invoicing, SME invoicing, enterprise invoicing, VAT invoicing, EUR invoicing, international invoicing, global billing solution"
        structuredData={structuredData}
      />
      <HeroSection />
      <LogisticsReportSection />
      <FeaturesSection />
      <HowItWorksSection />
      <WhyChooseUsSection />
      <CTASection />
    </Page>
  );
};

export default HomePage;
