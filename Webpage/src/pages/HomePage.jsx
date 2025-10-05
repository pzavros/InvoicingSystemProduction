import Page from '../components/ReusableComponents/Page.jsx';
import HeroSection from '../components/HomePage/HeroSection.jsx';
import FeaturesSection from '../components/HomePage/FeaturesSection.jsx';
import HowItWorksSection from '../components/HomePage/HowItWorksSection.jsx';
import WhyChooseUsSection from '../components/HomePage/WhyChooseUsSection.jsx';
import CTASection from '../components/HomePage/CTASection.jsx';

const HomePage = () => {
  return (
    <Page>
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <WhyChooseUsSection />
      <CTASection />
    </Page>
  );
};

export default HomePage;
