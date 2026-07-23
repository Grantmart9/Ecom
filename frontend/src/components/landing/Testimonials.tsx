'use client';

import { motion } from 'framer-motion';
import { Box, Container, Typography, Stack } from '@mui/material';
import { StarRounded } from '@mui/icons-material';
import { fadeUp, stagger } from '@/lib/animations';

const testimonials = [
  {
    quote:
      'Finally something I can add to breakfast without the usual battle. It feels designed for real mornings.',
    name: 'Amara Okafor',
    role: 'Parent of two',
  },
  {
    quote:
      'The packaging is calm, the product is simple, and the routine actually sticks. That combination is rare.',
    name: 'Liam Bennett',
    role: 'Verified customer',
  },
  {
    quote: 'It dissolves instantly and never changes the taste. That alone made it part of our weekly shop.',
    name: 'Sofia Marchetti',
    role: 'Busy mum',
  },
];

export default function Testimonials() {
  return (
    <Box component="section" sx={{ py: { xs: 8, md: 14 } }}>
      <Container maxWidth="lg">
        <Typography
          sx={{
            textTransform: 'uppercase',
            letterSpacing: '0.16em',
            fontSize: '0.78rem',
            fontWeight: 700,
            color: 'rgba(11,11,15,0.56)',
            mb: 1.5,
          }}
        >
          Social proof
        </Typography>
        <Typography
          variant="h2"
          sx={{
            fontSize: { xs: '2.2rem', md: '3.5rem' },
            fontWeight: 700,
            letterSpacing: '-0.02em',
            mb: { xs: 5, md: 8 },
            maxWidth: 720,
          }}
        >
          Trusted by parents who want one less fight in the day.
        </Typography>

        <Box
          component={motion.div}
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
            gap: { xs: 2, md: 3 },
          }}
        >
          {testimonials.map((t) => (
            <Box
              key={t.name}
              component={motion.div}
              variants={fadeUp}
              sx={{
                p: { xs: 3, md: 4 },
                border: '1px solid rgba(255,255,255,0.72)',
                borderRadius: 5,
                bgcolor: 'rgba(255,255,255,0.66)',
                backdropFilter: 'blur(18px)',
                boxShadow: '0 18px 44px rgba(18,45,45,0.08)',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                height: '100%',
              }}
            >
              <Stack direction="row" spacing={0.25}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <StarRounded key={i} sx={{ color: 'primary.main', fontSize: 20 }} />
                ))}
              </Stack>
              <Typography sx={{ color: 'text.primary', fontSize: '1.05rem', lineHeight: 1.6, flexGrow: 1 }}>
                “{t.quote}”
              </Typography>
              <Box>
                <Typography sx={{ fontWeight: 700, color: 'text.primary' }}>{t.name}</Typography>
                <Typography sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>
                  {t.role}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
