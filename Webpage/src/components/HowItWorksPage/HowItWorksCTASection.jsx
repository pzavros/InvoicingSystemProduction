import { RocketLaunch, ArrowForward } from '@mui/icons-material';
import Section from '../ReusableComponents/Section.jsx';
import Column from '../ReusableComponents/Column.jsx';
import Row from '../ReusableComponents/Row.jsx';
import Text from '../ReusableComponents/Text.jsx';
import Button from '../ReusableComponents/Button.jsx';

const HowItWorksCTASection = () => {
  return (
    <Section variant="cta" spacing="large" sx={{ mt: 8 }}>
      <Column gap={4}>
        <Text variant="h2" weight="bold" align="center" sx={{ color: 'white', mb: 2 }}>
          Ready to Get Started?
        </Text>
        
        <Text variant="h6" align="center" sx={{ 
          color: 'rgba(255,255,255,0.9)',
          maxWidth: 600,
          mx: 'auto',
          mb: 2
        }}>
          Join the workflow and experience how simple professional invoicing can be
        </Text>
        
        <Row gap={3} sx={{ justifyContent: 'center', flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
          <Button 
            variant="primary" 
            size="large"
            startIcon={<RocketLaunch />}
            sx={{ 
              background: 'rgba(255,255,255,0.9)',
              color: '#667eea',
              '&:hover': {
                background: 'white',
              }
            }}
          >
            Start Your Journey
          </Button>
          <Button 
            variant="outline" 
            size="large"
            endIcon={<ArrowForward />}
          >
            Watch Demo
          </Button>
        </Row>
      </Column>
    </Section>
  );
};

export default HowItWorksCTASection;
