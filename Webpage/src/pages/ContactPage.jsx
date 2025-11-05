import Page from '../components/ReusableComponents/Page.jsx';
import SEO from '../components/SEO.jsx';
import ContactHeroSection from '../components/ContactPage/ContactHeroSection.jsx';
import ContactMethodsSection from '../components/ContactPage/ContactMethodsSection.jsx';
import ContactFormSection from '../components/ContactPage/ContactFormSection.jsx';
import ContactAlternativesSection from '../components/ContactPage/ContactAlternativesSection.jsx';

const ContactPage = () => {
  return (
    <Page>
      <SEO
        title="Contact Us | Professional Invoicing System Support"
        description="Get in touch with our global invoicing system support team. We're here to help with your e-invoicing needs, answer questions, and provide assistance for businesses worldwide."
        keywords="contact invoicing support, e-invoicing help, invoice system contact, billing software support, invoicing customer service, global support, invoice software assistance"
      />
      <ContactHeroSection />
      <ContactMethodsSection />
      <ContactFormSection />
      {/* <ContactAlternativesSection /> */}
    </Page>
  );
};

export default ContactPage;
