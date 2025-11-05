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
    "name": "Professional Invoicing System",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "description": "Advanced cloud-based invoicing and logistics reporting system for businesses worldwide. Professional e-invoicing, invoice management, and digital invoicing software with Stripe integration.",
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
      "E-invoicing",
      "Logistics reporting",
      "Invoice management",
      "Stripe payment integration",
      "Multi-currency support",
      "Professional templates",
      "Automated billing",
      "Cloud-based access",
      "International invoicing"
    ],
    "audience": {
      "@type": "Audience",
      "audienceType": "Business"
    }
  };

  return (
    <Page>
      <SEO
        title="Professional Invoicing System | Global E-Invoicing Solution"
        description="Advanced cloud-based invoicing and logistics reporting system for businesses worldwide. Professional e-invoicing, invoice management, digital invoicing software with Stripe integration. Streamline your global billing process."
        keywords="invoicing system, e-invoicing, electronic invoicing, invoice software, online invoicing, digital invoicing, invoice management, cloud invoicing, international invoicing, professional invoicing, invoice generator, billing software, Stripe invoicing, invoice templates, business invoicing, invoice tracking, automated invoicing, multi-currency invoicing, global billing solution, SaaS invoicing"
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
