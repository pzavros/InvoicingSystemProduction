import Page from '../components/ReusableComponents/Page.jsx';
import HowItWorksHeroSection from '../components/HowItWorksPage/HowItWorksHeroSection.jsx';
import HowItWorksStepsSection from '../components/HowItWorksPage/HowItWorksStepsSection.jsx';
import SystemShowcaseSection from '../components/HowItWorksPage/SystemShowcaseSection.jsx';
import HowItWorksWorkflowSection from '../components/HowItWorksPage/HowItWorksWorkflowSection.jsx';

const HowItWorksPage = () => {
  return (
    <Page>
      <HowItWorksHeroSection />
      <HowItWorksStepsSection />
      <SystemShowcaseSection />
      <HowItWorksWorkflowSection />
    </Page>
  );
};

export default HowItWorksPage;
