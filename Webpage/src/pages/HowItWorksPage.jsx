import Page from '../components/ReusableComponents/Page.jsx';
import HowItWorksHeroSection from '../components/HowItWorksPage/HowItWorksHeroSection.jsx';
import HowItWorksStepsSection from '../components/HowItWorksPage/HowItWorksStepsSection.jsx';
import HowItWorksWorkflowSection from '../components/HowItWorksPage/HowItWorksWorkflowSection.jsx';

const HowItWorksPage = () => {
  return (
    <Page>
      <HowItWorksHeroSection />
      <HowItWorksStepsSection />
      <HowItWorksWorkflowSection />
    </Page>
  );
};

export default HowItWorksPage;
