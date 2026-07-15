'use client';

import PageShell from '@/components/page/PageShell';
import FAQItem from '@/components/page/FAQItem';
import { motion } from 'framer-motion';
import { Box, Typography } from '@mui/material';

const faqs = [
  {
    question: 'Disclaimer',
    answer: (
      <>
        <Typography variant="body2" sx={{ lineHeight: 1.7, mb: 1 }}>
          The statements made about Recovery Co. Super Sprinkle have not been evaluated by the South
          African Health Products Regulatory Authority (SAHPRA). This product is not intended to
          diagnose, treat, cure, or prevent any disease.
        </Typography>
        <Typography variant="body2" sx={{ lineHeight: 1.7, mb: 1 }}>
          Recovery Co. Super Sprinkle is a nutritional supplement and should be used as part of a
          balanced diet and healthy lifestyle. It is not intended to replace a varied diet or
          professional medical advice.
        </Typography>
        <Typography variant="body2" sx={{ lineHeight: 1.7, mb: 1 }}>
          The information provided on this website is for general informational purposes only and
          should not be considered medical advice or a substitute for consultation with a qualified
          healthcare professional.
        </Typography>
        <Typography variant="body2" sx={{ lineHeight: 1.7, mb: 1 }}>
          If your child has a medical condition, is taking prescription medication, has known
          allergies, or is under the care of a healthcare practitioner, please consult your doctor,
          pharmacist, or other qualified healthcare professional before using this product.
        </Typography>
        <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
          Always use Recovery Co. Super Sprinkle according to the directions for use and keep it out
          of the reach of children. If any adverse reaction occurs, discontinue use and seek medical
          advice promptly.
        </Typography>
      </>
    ),
  },
  {
    question: 'Who is Super Sprinkle for?',
    answer: (
      <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
        Designed for children aged 2 years and older, Super Sprinkle provides simple, everyday
        nutritional support for toddlers through to older children.
      </Typography>
    ),
  },
  {
    question: 'How to use',
    answer: (
      <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
        Simply add one sachet of Super Sprinkle to your child&apos;s favourite drink or soft food. Our
        minimal-taste, completely soluble formula blends effortlessly into everyday favourites
        without changing the taste or texture, making daily wellness beautifully simple.
      </Typography>
    ),
  },
  {
    question: 'Production & Manufacturing',
    answer: (
      <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
        Super Sprinkle is a proudly locally produced product made in South Africa.
      </Typography>
    ),
  },
  {
    question: 'Preservatives, flavourants, no added sugars',
    answer: (
      <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
        Super Sprinkle is formulated with a clean, science-informed approach—using carefully selected
        ingredients without unnecessary additives. Our formula contains no added sugars,
        preservatives or flavourings.
      </Typography>
    ),
  },
  {
    question: 'Orders & Delivery',
    answer: (
      <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
        We aim to process and dispatch all orders as quickly as possible. Standard delivery within
        South Africa takes 3–5 working days from the date your order is confirmed.
      </Typography>
    ),
  },
];

export default function Faq() {
  return (
    <PageShell maxWidth>
      <Box sx={{ textAlign: 'center', maxWidth: 680, width: '100%', mx: 'auto' }}>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 800,
            letterSpacing: '-0.02em',
            color: 'text.primary',
          }}
        >
          Frequently Asked Questions
        </Typography>
        <Box
          sx={{
            width: 48,
            height: 4,
            borderRadius: 2,
            bgcolor: 'primary.main',
            mx: 'auto',
            mt: 2,
            mb: 4,
          }}
        />
        <Box
          component={motion.div}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
          }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}
        >
          {faqs.map((faq) => (
            <FAQItem key={faq.question} question={faq.question}>
              {faq.answer}
            </FAQItem>
          ))}
        </Box>
      </Box>
    </PageShell>
  );
}
