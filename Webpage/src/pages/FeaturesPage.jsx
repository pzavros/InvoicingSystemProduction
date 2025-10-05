import Page from '../components/ReusableComponents/Page.jsx';
import FeaturesHeroSection from '../components/FeaturesPage/FeaturesHeroSection.jsx';
import FeaturesMainSection from '../components/FeaturesPage/FeaturesMainSection.jsx';
import FeaturesTechnicalSection from '../components/FeaturesPage/FeaturesTechnicalSection.jsx';
import FeaturesCapabilitiesSection from '../components/FeaturesPage/FeaturesCapabilitiesSection.jsx';
import FeaturesCTASection from '../components/FeaturesPage/FeaturesCTASection.jsx';

const FeaturesPage = () => {
  return (
    <Page>
      <FeaturesHeroSection />
      <FeaturesMainSection />
      <FeaturesTechnicalSection />
      <FeaturesCapabilitiesSection />
      <FeaturesCTASection />
    </Page>
  );
};

export default FeaturesPage;
