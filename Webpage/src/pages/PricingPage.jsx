import Page from '../components/ReusableComponents/Page.jsx';
import SEO from '../components/SEO.jsx';
import PricingHeroSection from '../components/PricingPage/PricingHeroSection.jsx';
import PricingPlansSection from '../components/PricingPage/PricingPlansSection.jsx';
import PricingFeaturesComparisonSection from '../components/PricingPage/PricingFeaturesComparisonSection.jsx';
import PricingFAQSection from '../components/PricingPage/PricingFAQSection.jsx';
import PricingCTASection from '../components/PricingPage/PricingCTASection.jsx';

const PricingPage = () => {
  return (
    <Page>
      <SEO
        title="Pricing Plans | Affordable Global E-Invoicing System"
        description="Transparent pricing for professional cloud-based invoicing software. Free plan available. Premium features include unlimited invoices, multi-currency support, Stripe integration. Perfect for businesses worldwide."
        keywords="invoicing pricing, e-invoicing cost, invoice software pricing, affordable invoicing, free invoice system, invoicing subscription, billing software cost, invoice pricing plans, SaaS invoicing pricing, cloud invoicing cost"
      />
      <PricingHeroSection />
      <PricingPlansSection />
      <PricingFeaturesComparisonSection />
      <PricingFAQSection />
      <PricingCTASection />
    </Page>
  );
};

export default PricingPage;
