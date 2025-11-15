import Section from '../ReusableComponents/Section.jsx';
import Grid from '../ReusableComponents/Grid.jsx';
import Text from '../ReusableComponents/Text.jsx';
import Card from '../ReusableComponents/Card.jsx';

const FreelancerIndustriesSection = () => {
  const industries = [
    'Web Developers & Programmers',
    'Graphic & UI/UX Designers',
    'Digital Marketing Specialists',
    'Content Writers & Copywriters',
    'Business & IT Consultants',
    'Photographers & Videographers',
    'Video Editors & Animators',
    'Translators & Interpreters',
    'Data Analysts & Scientists',
    'Voice Actors & Audio Producers',
    'Online Tutors & Educators',
    'Social Media Managers'
  ];

  return (
    <Section spacing="large">
      <Text variant="h2" weight="bold" align="center" sx={{ mb: 2 }}>
        Trusted by Freelancers Worldwide
      </Text>
      <Text variant="h6" align="center" sx={{ 
        color: 'text.secondary', 
        mb: 6, 
        maxWidth: 600, 
        mx: 'auto' 
      }}>
        Professional invoicing for every freelance profession and independent contractor
      </Text>
      
      <Grid columns={{ xs: 1, sm: 2, md: 3 }} gap={3}>
        {industries.map((industry, index) => (
          <Card 
            key={index} 
            variant="modern"
            sx={{ 
              textAlign: 'center', 
              py: 3,
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 24px rgba(102, 126, 234, 0.15)'
              }
            }}
          >
            <Text variant="body1" weight="medium" sx={{ fontSize: '1rem' }}>
              {industry}
            </Text>
          </Card>
        ))}
      </Grid>
    </Section>
  );
};

export default FreelancerIndustriesSection;
