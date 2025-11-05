import Page from '../components/ReusableComponents/Page.jsx';
import SEO from '../components/SEO.jsx';
import FeaturesHeroSection from '../components/FeaturesPage/FeaturesHeroSection.jsx';
import FeaturesMainSection from '../components/FeaturesPage/FeaturesMainSection.jsx';
import FeaturesTechnicalSection from '../components/FeaturesPage/FeaturesTechnicalSection.jsx';
import FeaturesCapabilitiesSection from '../components/FeaturesPage/FeaturesCapabilitiesSection.jsx';
import FeaturesCTASection from '../components/FeaturesPage/FeaturesCTASection.jsx';

const FeaturesPage = () => {
  return (
    <Page>
      <SEO
        title="Features | Professional Invoicing System - Global Solution"
        description="Explore powerful invoicing features: e-invoicing, automated billing, invoice templates, multi-currency support, Stripe integration, logistics reporting, cloud access, and more for businesses worldwide."
        keywords="invoicing features, e-invoicing features, invoice automation, invoice templates, multi-currency invoicing, Stripe payment integration, logistics reports, invoice tracking, billing automation, digital invoice management, cloud invoicing features, international billing"
      />
      <FeaturesHeroSection />
      <FeaturesMainSection />
      <FeaturesTechnicalSection />
      <FeaturesCapabilitiesSection />
      <FeaturesCTASection />
    </Page>
  );
};

export default FeaturesPage;
