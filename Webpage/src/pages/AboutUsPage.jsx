import Page from '../components/ReusableComponents/Page.jsx';
import AboutHeroSection from '../components/AboutUsPage/AboutHeroSection.jsx';
import AboutStorySection from '../components/AboutUsPage/AboutStorySection.jsx';
import AboutTimelineSection from '../components/AboutUsPage/AboutTimelineSection.jsx';
import AboutValuesSection from '../components/AboutUsPage/AboutValuesSection.jsx';
import AboutTeamSection from '../components/AboutUsPage/AboutTeamSection.jsx';

const AboutUsPage = () => {
  return (
    <Page>
      <AboutHeroSection />
      <AboutStorySection />
      <AboutTimelineSection />
      <AboutValuesSection />
      <AboutTeamSection />
    </Page>
  );
};

export default AboutUsPage;
