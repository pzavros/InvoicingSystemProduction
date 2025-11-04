import Page from '../components/ReusableComponents/Page.jsx';
import PricingHeroSection from '../components/PricingPage/PricingHeroSection.jsx';
import PricingPlansSection from '../components/PricingPage/PricingPlansSection.jsx';
import PricingFeaturesComparisonSection from '../components/PricingPage/PricingFeaturesComparisonSection.jsx';
import PricingFAQSection from '../components/PricingPage/PricingFAQSection.jsx';
import PricingCTASection from '../components/PricingPage/PricingCTASection.jsx';

const PricingPage = () => {
  return (
    <Page>
      <PricingHeroSection />
      <PricingPlansSection />
      <PricingFeaturesComparisonSection />
      <PricingFAQSection />
      <PricingCTASection />
    </Page>
  );
};

export default PricingPage;
