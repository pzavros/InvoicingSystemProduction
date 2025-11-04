import { useState } from 'react';
import { Box, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { ExpandMore, HelpOutline } from '@mui/icons-material';
import Section from '../ReusableComponents/Section.jsx';
import Column from '../ReusableComponents/Column.jsx';
import Text from '../ReusableComponents/Text.jsx';
import IconBox from '../ReusableComponents/IconBox.jsx';

const PricingFAQSection = () => {
  const [expanded, setExpanded] = useState('panel0');

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const faqs = [
    {
      question: 'What is included in the free plan?',
      answer: 'The free plan includes 3 invoices per month, 1 client, 1 product category, 1 product, PDF generation, and access to reports and analytics. Perfect for freelancers or businesses just getting started.'
    },
    {
      question: 'Can I upgrade or downgrade my plan at any time?',
      answer: 'Yes! You can upgrade to premium anytime to get unlimited invoices, clients, and products. If you downgrade, you\'ll continue to have premium access until the end of your billing period, then revert to the free plan.'
    },
    {
      question: 'Is there a free trial for the premium plan?',
      answer: 'Yes! We offer a 7-day free trial for the premium plan. You can cancel anytime during the trial period without being charged.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, Mastercard, American Express) through our secure payment processor, Stripe. All transactions are encrypted and secure.'
    },
    {
      question: 'What happens if I reach my monthly invoice limit on the free plan?',
      answer: 'If you reach the 3 invoice limit on the free plan, you\'ll need to wait until the next month or upgrade to premium for unlimited invoices. Your existing invoices remain accessible at all times.'
    },
    {
      question: 'Can I cancel my subscription at any time?',
      answer: 'Absolutely! There are no long-term contracts or cancellation fees. You can cancel your premium subscription at any time from your account settings. You\'ll retain premium access until the end of your billing period.'
    },
    {
      question: 'Is my data secure?',
      answer: 'Yes! We take security seriously. All data is encrypted in transit and at rest. We use industry-standard security practices and regularly update our systems to protect your information.'
    },
    {
      question: 'Can I export my data?',
      answer: 'Yes! You can export your invoices, client data, products, templates, and reports at any time. We believe your data belongs to you, and we make it easy to take it with you if needed.'
    }
  ];

  return (
    <Section spacing="large">
      <Column gap={4}>
        <Column gap={2} sx={{ textAlign: 'center' }}>
          <IconBox size={80} sx={{ mx: 'auto', mb: 2 }}>
            <HelpOutline sx={{ fontSize: 40, color: 'primary.main' }} />
          </IconBox>
          <Text variant="h2" weight="bold" align="center">
            Frequently Asked Questions
          </Text>
          <Text variant="h6" sx={{ color: 'text.secondary', maxWidth: 700, mx: 'auto' }}>
            Have questions? We've got answers. If you can't find what you're looking for, 
            feel free to contact our support team.
          </Text>
        </Column>

        <Box sx={{ maxWidth: 900, mx: 'auto', width: '100%' }}>
          {faqs.map((faq, index) => (
            <Accordion
              key={index}
              expanded={expanded === `panel${index}`}
              onChange={handleChange(`panel${index}`)}
              sx={{
                mb: 2,
                borderRadius: '12px !important',
                overflow: 'hidden',
                border: '1px solid rgba(0,0,0,0.08)',
                boxShadow: expanded === `panel${index}` 
                  ? '0 4px 20px rgba(102, 126, 234, 0.15)' 
                  : '0 2px 8px rgba(0,0,0,0.04)',
                '&:before': {
                  display: 'none'
                },
                transition: 'all 0.3s ease'
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMore />}
                sx={{
                  py: 2,
                  px: 3,
                  background: expanded === `panel${index}` 
                    ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)'
                    : 'white',
                  '&:hover': {
                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.03) 0%, rgba(118, 75, 162, 0.03) 100%)'
                  },
                  transition: 'background 0.2s ease'
                }}
              >
                <Text weight="bold" sx={{ fontSize: '1.1rem' }}>
                  {faq.question}
                </Text>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 3, py: 2, background: 'white' }}>
                <Text sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                  {faq.answer}
                </Text>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </Column>
    </Section>
  );
};

export default PricingFAQSection;
