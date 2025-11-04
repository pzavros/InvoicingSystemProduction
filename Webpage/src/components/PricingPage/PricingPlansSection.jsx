import { Box } from '@mui/material';
import { 
  CheckCircle, 
  Stars, 
  Rocket,
  Close
} from '@mui/icons-material';
import Section from '../ReusableComponents/Section.jsx';
import Column from '../ReusableComponents/Column.jsx';
import Row from '../ReusableComponents/Row.jsx';
import Text from '../ReusableComponents/Text.jsx';
import Button from '../ReusableComponents/Button.jsx';
import { navigateToApp } from '../../utils/navigation.js';

const PricingPlansSection = () => {

  const plans = [
    {
      name: 'Free',
      price: 0,
      period: 'forever',
      description: 'Perfect for getting started',
      features: [
        { text: '3 invoices per month', included: true },
        { text: '1 client', included: true },
        { text: '1 product category', included: true },
        { text: '1 product', included: true },
        { text: 'Basic invoice templates', included: true },
        { text: 'PDF generation', included: true },
        { text: 'Email invoices', included: true },
        { text: 'Free tier watermark', included: true, note: true },
        { text: 'Custom templates', included: false },
        { text: 'Unlimited invoices', included: false },
        { text: 'Unlimited clients', included: false },
        { text: 'Unlimited products', included: false },
        { text: 'Priority support', included: false }
      ],
      buttonText: 'Get Started Free',
      buttonVariant: 'outline',
      popular: false,
      onAction: () => navigateToApp('register')
    },
    {
      name: 'Premium',
      price: 13.99,
      period: 'month',
      description: 'For growing businesses',
      features: [
        { text: 'Unlimited invoices', included: true },
        { text: 'Unlimited clients', included: true },
        { text: 'Unlimited products', included: true },
        { text: 'Unlimited categories', included: true },
        { text: 'Custom invoice templates', included: true },
        { text: 'PDF generation', included: true },
        { text: 'Email invoices', included: true },
        { text: 'No watermarks', included: true },
        { text: 'Dashboard analytics', included: true },
        { text: 'Reports & insights', included: true },
        { text: 'Payment tracking', included: true },
        { text: 'Priority support', included: true }
      ],
      buttonText: 'Start Free Trial',
      buttonVariant: 'primary',
      popular: true,
      onAction: () => navigateToApp('register')
    }
  ];

  return (
    <Section spacing="large">
      <Column gap={6}>
        <Column gap={2} sx={{ textAlign: 'center' }}>
          <Text variant="h2" weight="bold" align="center">
            Choose Your Plan
          </Text>
          <Text variant="h6" align="center" sx={{ color: 'text.secondary', maxWidth: 600, mx: 'auto' }}>
            All plans include core invoicing features. Upgrade anytime for unlimited access.
          </Text>
        </Column>

        {/* Pricing Cards */}
        <Row gap={4} sx={{ 
          justifyContent: 'center', 
          flexWrap: { xs: 'wrap', md: 'nowrap' },
          alignItems: 'stretch'
        }}>
          {plans.map((plan, index) => (
            <Box
              key={index}
              sx={{
                flex: { xs: '1 1 100%', md: '1 1 0' },
                maxWidth: { xs: '100%', md: 500 },
                position: 'relative',
                borderRadius: 4,
                p: 4,
                background: plan.popular 
                  ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)'
                  : 'white',
                border: plan.popular 
                  ? '2px solid #667eea'
                  : '1px solid rgba(0,0,0,0.1)',
                boxShadow: plan.popular 
                  ? '0 8px 32px rgba(102, 126, 234, 0.2)'
                  : '0 4px 16px rgba(0,0,0,0.08)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: plan.popular 
                    ? '0 12px 40px rgba(102, 126, 234, 0.3)'
                    : '0 8px 24px rgba(0,0,0,0.12)'
                }
              }}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <Box sx={{
                  position: 'absolute',
                  top: -12,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  px: 3,
                  py: 1,
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
                }}>
                  <Stars sx={{ fontSize: 18 }} />
                  Most Popular
                </Box>
              )}

              <Column gap={3}>
                {/* Plan Header */}
                <Column gap={1}>
                  <Text variant="h4" weight="bold">
                    {plan.name}
                  </Text>
                  <Text sx={{ color: 'text.secondary' }}>
                    {plan.description}
                  </Text>
                </Column>

                {/* Price */}
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                    <Text variant="h2" weight="bold" sx={{ 
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      backgroundClip: 'text',
                      textFillColor: 'transparent',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}>
                      ${plan.price}
                    </Text>
                    <Text sx={{ color: 'text.secondary' }}>
                      /{plan.period}
                    </Text>
                  </Box>
                  {plan.savings && (
                    <Text sx={{ 
                      color: 'success.main', 
                      fontSize: '0.875rem', 
                      fontWeight: 600,
                      mt: 1
                    }}>
                      {plan.savings}
                    </Text>
                  )}
                </Box>

                {/* Features List */}
                <Column gap={1.5} sx={{ flex: 1 }}>
                  {plan.features.map((feature, idx) => (
                    <Box key={idx} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                      {feature.included ? (
                        <CheckCircle sx={{ 
                          fontSize: 20, 
                          color: feature.note ? 'warning.main' : 'success.main',
                          flexShrink: 0,
                          mt: 0.25
                        }} />
                      ) : (
                        <Close sx={{ 
                          fontSize: 20, 
                          color: 'text.disabled',
                          flexShrink: 0,
                          mt: 0.25
                        }} />
                      )}
                      <Text sx={{ 
                        color: feature.included ? 'text.primary' : 'text.disabled',
                        fontSize: '0.95rem'
                      }}>
                        {feature.text}
                      </Text>
                    </Box>
                  ))}
                </Column>

                {/* Action Button */}
                <Button
                  variant={plan.buttonVariant}
                  size="large"
                  fullWidth
                  onClick={plan.onAction}
                  startIcon={plan.popular ? <Rocket /> : null}
                  sx={{
                    mt: 2,
                    ...(plan.popular && {
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
                      '&:hover': {
                        boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)'
                      }
                    })
                  }}
                >
                  {plan.buttonText}
                </Button>
              </Column>
            </Box>
          ))}
        </Row>

        {/* Bottom Note */}
        <Box sx={{ 
          textAlign: 'center', 
          mt: 4,
          p: 3,
          borderRadius: 3,
          background: 'rgba(102, 126, 234, 0.05)',
          border: '1px solid rgba(102, 126, 234, 0.1)',
          maxWidth: 800,
          mx: 'auto'
        }}>
          <Text sx={{ color: 'text.secondary' }}>
            💳 All premium plans include a <strong>7-day free trial</strong>. No credit card required to start. 
            Cancel anytime with no questions asked.
          </Text>
        </Box>
      </Column>
    </Section>
  );
};

export default PricingPlansSection;
