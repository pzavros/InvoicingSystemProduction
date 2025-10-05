import { Group } from '@mui/icons-material';
import Section from '../ReusableComponents/Section.jsx';
import Column from '../ReusableComponents/Column.jsx';
import Row from '../ReusableComponents/Row.jsx';
import Text from '../ReusableComponents/Text.jsx';
import Card from '../ReusableComponents/Card.jsx';

const AboutStorySection = () => {
  return (
    <Section spacing="large" sx={{ mt: 4 }}>
      <Row gap={8} sx={{ alignItems: 'stretch' }}>
        <Column sx={{ flex: 1 }}>
          <Text variant="h2" weight="bold" sx={{ 
            mb: 4,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundClip: 'text',
            textFillColor: 'transparent',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Our Story
          </Text>
          
          <Text variant="h6" sx={{ mb: 4, lineHeight: 1.7, color: 'text.secondary' }}>
            What started as a solution to streamline our own business invoicing quickly evolved 
            into a comprehensive platform that addresses the real challenges faced by modern businesses.
          </Text>

          <Text sx={{ lineHeight: 1.8, fontSize: '1.1rem', mb: 4 }}>
            Our team recognized that most invoicing solutions were either too complex for small businesses 
            or too limited for growing companies. We set out to bridge that gap with a system that scales 
            with your business needs.
          </Text>

          <Text sx={{ lineHeight: 1.8, fontSize: '1.1rem' }}>
            Built with modern web technologies, our platform combines enterprise-grade reliability 
            with an intuitive user experience that requires no training - you can start creating 
            professional invoices immediately.
          </Text>
        </Column>

        <Column sx={{ 
          flex: 1,
          display: { xs: 'none', md: 'flex' },
          alignItems: 'center'
        }}>
          <Card variant="gradient" sx={{ width: '100%', maxWidth: 400, height: 450, p: 4 }}>
            <Group sx={{ fontSize: 60, color: 'white', mb: 3 }} />
            <Text variant="h4" weight="bold" sx={{ mb: 3, color: 'white' }}>
              Full-Stack Excellence
            </Text>
            <Text sx={{ color: 'rgba(255,255,255,0.9)', lineHeight: 1.6 }}>
              Every component designed and developed with attention to detail, 
              from database architecture to user interface interactions.
            </Text>
          </Card>
        </Column>
      </Row>
    </Section>
  );
};

export default AboutStorySection;
