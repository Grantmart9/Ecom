'use client';

import { motion } from 'framer-motion';
import { Box, Container, Typography, Stack } from '@mui/material';
import { StarRounded } from '@mui/icons-material';
import { fadeUp, stagger } from '@/lib/animations';

const testimonials = [
  {
    quote:
      'Genuinely the best online shopping experience I have had. Fast, clean, and the quality is unreal.',
    name: 'Amara Okafor',
    role: 'Verified buyer',
  },
  {
    quote:
      'Ordered on a Monday, wearing it by Wednesday. The attention to detail is on another level.',
    name: 'Liam Bennett',
    role: 'Verified buyer',
  },
  {
    quote: 'Everything feels considered — from the packaging to the fit. I am a customer for life.',
    name: 'Sofia Marchetti',
    role: 'Verified buyer',
  },
];

export default function Testimonials() {
  return (
    <Box component="section" sx={{ py: { xs: 8, md: 14 } }}>
      <Container maxWidth="lg">
        <Typography
          variant="h2"
          sx={{
            fontSize: { xs: '2.2rem', md: '3.5rem' },
            fontWeight: 700,
            letterSpacing: '-0.02em',
            mb: { xs: 5, md: 8 },
            maxWidth: 800,
          }}
        >
          Reviews from our customers
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
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 4,
                bgcolor: 'background.paper',
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
