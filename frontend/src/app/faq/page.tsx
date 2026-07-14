'use client';

import BackButton from '@/components/BackButton';
import { motion } from 'framer-motion';
import {
  Container,
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Container
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 3,
          px: 4,
          py: 8,
          position: 'relative',
        }}
      >
        <Box sx={{ position: 'absolute', top: 16, left: 16 }}>
          <BackButton href="/" />
        </Box>
        <Box
          sx={{
            textAlign: 'center',
            maxWidth: 680,
            width: '100%',
            mx: 'auto',
          }}
        >
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
          <Box sx={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {faqs.map((faq, i) => (
              <Accordion
                key={faq.question}
                defaultExpanded={i === 0}
                disableGutters
                elevation={0}
                sx={{
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                  overflow: 'hidden',
                  transition: 'border-color .25s, box-shadow .25s',
                  '&:hover': {
                    borderColor: 'primary.main',
                    boxShadow: '0 6px 24px rgba(0,0,0,0.06)',
                  },
                  '&:before': { display: 'none' },
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon sx={{ color: 'text.primary' }} />}
                  sx={{
                    px: 3,
                    py: 1,
                    '& .MuiAccordionSummary-content': { my: 1.5 },
                  }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
                    {faq.question}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ px: 3, pb: 3, pt: 0 }}>{faq.answer}</AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </Box>
      </Container>
    </motion.div>
  );
}
