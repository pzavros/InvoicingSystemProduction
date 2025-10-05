import Page from '../components/ReusableComponents/Page.jsx';
import ContactHeroSection from '../components/ContactPage/ContactHeroSection.jsx';
import ContactMethodsSection from '../components/ContactPage/ContactMethodsSection.jsx';
import ContactFormSection from '../components/ContactPage/ContactFormSection.jsx';
import ContactAlternativesSection from '../components/ContactPage/ContactAlternativesSection.jsx';

const ContactPage = () => {
  return (
    <Page>
      <ContactHeroSection />
      <ContactMethodsSection />
      <ContactFormSection />
      <ContactAlternativesSection />
    </Page>
  );
};

export default ContactPage;
