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

export default function About() {
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
          justifyContent: 'flex-start',
          gap: 3,
          px: 4,
          py: 8,
          position: 'relative',
        }}
      >
        <Box sx={{ position: 'absolute', top: 16, left: 16 }}>
          <BackButton href="/" />
        </Box>
        <Box sx={{ textAlign: 'center', maxWidth: 640, width: '100%' }}>
          <Typography variant="h3" sx={{ fontWeight: 800 }}>
            About Recovery Co.
          </Typography>
          <Typography variant="h4" sx={{ mt: 4, fontWeight: 700 }}>
            Our Story
          </Typography>
          <Typography variant="body1" sx={{ mt: 3, lineHeight: 1.7, textAlign: 'left' }}>
            Recovery Co. began with a simple challenge that many parents know all too well.
          </Typography>
          <Typography variant="body1" sx={{ mt: 2, lineHeight: 1.7, textAlign: 'left' }}>
            Motherhood taught me that the smallest moments often matter the most. As a working mom to
            a busy toddler, I watched my son discover the world with endless curiosity—and,
            inevitably, encounter the everyday germs that come with it. Wanting to support his
            growing immune system, I found myself reaching for a combination of syrups, supplements,
            and gummies each day. It was well intentioned, but it wasn&apos;t always easy. A daily routine
            habit that should have been easy, but often became a negotiation.
          </Typography>
          <Typography variant="body1" sx={{ mt: 2, lineHeight: 1.7, textAlign: 'left' }}>
            We knew there had to be a better way.
          </Typography>
          <Typography variant="body1" sx={{ mt: 2, lineHeight: 1.7, textAlign: 'left' }}>
            So we set out to create a product that children wouldn&apos;t notice—but parents could feel
            confident giving every day.
          </Typography>
          <Typography variant="body1" sx={{ mt: 2, lineHeight: 1.7, textAlign: 'left' }}>
            Recovery Co. Super Sprinkle was built around one simple idea: wellness should blend into
            family life, not disrupt it. Our minimal taste, completely soluble daily immune support
            powder mixes effortlessly into the foods and drinks children already enjoy, making it
            easy to support growing bodies without changing established routines.
          </Typography>
          <Typography variant="body1" sx={{ mt: 2, lineHeight: 1.7, textAlign: 'left' }}>
            Every ingredient is selected with care, guided by quality, simplicity, and the needs of
            growing children. We believe that less can be more, and that thoughtful formulations,
            backed by science and made with integrity, can help families build healthy habits that
            last.
          </Typography>
          <Typography variant="body1" sx={{ mt: 2, lineHeight: 1.7, textAlign: 'left' }}>
            Our mission extends beyond creating well-formulated kid friendly products. We want to
            give parents confidence that they&apos;re making small, meaningful choices that support their
            children&apos;s wellbeing every day.
          </Typography>
        </Box>
       
      </Container>
    </motion.div>
  );
}
