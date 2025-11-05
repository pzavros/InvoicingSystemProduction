import Page from '../components/ReusableComponents/Page.jsx';
import SEO from '../components/SEO.jsx';
import AboutHeroSection from '../components/AboutUsPage/AboutHeroSection.jsx';
import AboutStorySection from '../components/AboutUsPage/AboutStorySection.jsx';
import AboutTimelineSection from '../components/AboutUsPage/AboutTimelineSection.jsx';
import AboutValuesSection from '../components/AboutUsPage/AboutValuesSection.jsx';
import AboutTeamSection from '../components/AboutUsPage/AboutTeamSection.jsx';

const AboutUsPage = () => {
  return (
    <Page>
      <SEO
        title="About Us | Professional Invoicing System"
        description="Learn about our mission to simplify invoicing for businesses globally. Discover our story, values, and commitment to providing the best cloud-based e-invoicing and logistics reporting solutions worldwide."
        keywords="about invoicing system, e-invoicing company, invoicing software company, digital billing solutions, invoice system developers, cloud invoicing provider, SaaS billing platform"
      />
      <AboutHeroSection />
      <AboutStorySection />
      <AboutTimelineSection />
      <AboutValuesSection />
      <AboutTeamSection />
    </Page>
  );
};

export default AboutUsPage;
