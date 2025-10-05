import { 
  Engineering,
  Psychology,
  WorkspacePremium
} from '@mui/icons-material';
import Section from '../ReusableComponents/Section.jsx';
import Grid from '../ReusableComponents/Grid.jsx';
import Text from '../ReusableComponents/Text.jsx';
import Card from '../ReusableComponents/Card.jsx';

const AboutTeamSection = () => {
  const team = [
    {
      icon: <Engineering sx={{ fontSize: 40 }} />,
      role: 'Full-Stack Development',
      description: 'Complete system architecture with modern technologies and best practices'
    },
    {
      icon: <Psychology sx={{ fontSize: 40 }} />,
      role: 'User Experience',
      description: 'Intuitive design focused on simplicity and business workflow efficiency'
    },
    {
      icon: <WorkspacePremium sx={{ fontSize: 40 }} />,
      role: 'Quality Assurance',
      description: 'Production-ready system with comprehensive testing and security measures'
    }
  ];

  return (
    <Section variant="light" spacing="large" sx={{ mt: 6 }}>
      <Text variant="h2" weight="bold" align="center" sx={{ mb: 2 }}>
        Development Expertise
      </Text>
      <Text variant="h6" align="center" sx={{ 
        color: 'text.secondary', 
        mb: 6, 
        maxWidth: 600, 
        mx: 'auto' 
      }}>
        The core areas of expertise that make our invoicing system exceptional
      </Text>
      
      <Grid columns={{ xs: 1, md: 3 }} gap={6}>
        {team.map((member, index) => (
          <Card key={index} variant="feature" title={member.role} icon={member.icon}>
            <Text sx={{ color: 'text.secondary', lineHeight: 1.6, textAlign: 'center' }}>
              {member.description}
            </Text>
          </Card>
        ))}
      </Grid>
    </Section>
  );
};

export default AboutTeamSection;
