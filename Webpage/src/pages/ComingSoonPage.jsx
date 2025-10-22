import Page from '../components/ReusableComponents/Page.jsx';
import ComingSoonHeroSection from '../components/ComingSoonPage/ComingSoonHeroSection.jsx';
import ComingSoonScreenshotsSection from '../components/ComingSoonPage/ComingSoonScreenshotsSection.jsx';
import ComingSoonCTASection from '../components/ComingSoonPage/ComingSoonCTASection.jsx';

const ComingSoonPage = () => {
  return (
    <Page>
      <ComingSoonHeroSection />
      <ComingSoonScreenshotsSection />
      {/* <ComingSoonCTASection /> */}
    </Page>
  );
};

export default ComingSoonPage;
