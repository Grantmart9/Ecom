'use client';

import { motion } from 'framer-motion';
import { Box, Container, Typography } from '@mui/material';
import { fadeUp, stagger } from '@/lib/animations';

export default function Story() {
  return (
    <Box component="section" sx={{ py: { xs: 8, md: 14 } }}>
      <Container maxWidth="lg">
        <Box
          component={motion.div}
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: { xs: 4, md: 8 },
            alignItems: 'center',
          }}
        >
          <Box
            component={motion.div}
            variants={fadeUp}
            sx={{
              p: { xs: 3, md: 5 },
              borderRadius: 6,
              bgcolor: 'rgba(255,255,255,0.62)',
              border: '1px solid rgba(255,255,255,0.72)',
              backdropFilter: 'blur(18px)',
              boxShadow: '0 18px 48px rgba(18,45,45,0.08)',
            }}
          >
            <Typography
              sx={{
                textTransform: 'uppercase',
                letterSpacing: '0.16em',
                fontSize: '0.78rem',
                fontWeight: 700,
                color: 'rgba(11,11,15,0.56)',
                mb: 2,
              }}
            >
              Why families choose us
            </Typography>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '2.2rem', md: '3.5rem' },
                fontWeight: 700,
                letterSpacing: '-0.02em',
                mb: 3,
                maxWidth: 500,
                color: 'text.primary',
              }}
            >
              Built for real routines, not ideal ones.
            </Typography>
            <Typography sx={{ color: 'rgba(11,11,15,0.72)', lineHeight: 1.75, maxWidth: 520 }}>
              Recovery Co. was born from a simple challenge familiar to many parents: making daily
              immune support easy for children. Inspired by the realities of raising a busy toddler,
              we created Super Sprinkle-a tasteless, fully soluble daily immune support powder that
              blends effortlessly into the foods and drinks kids already enjoy. Made with carefully
              selected, science-backed ingredients, our mission is to help families build healthy
              habits through simple, effective products that fit naturally into everyday life,
              giving parents confidence in the small choices that support their children&apos;s
              wellbeing.
            </Typography>
          </Box>
          <Box
            component="img"
            src="/product.png"
            alt="Product"
            sx={{
              position: 'relative',
              width: '100%',
              height: '100%',
              minHeight: { xs: 320, md: 520 },
              p: { xs: 3, md: 5 },
              borderRadius: 6,
              overflow: 'hidden',
              bgcolor: 'rgba(255,255,255,0.58)',
              border: '1px solid rgba(255,255,255,0.72)',
              boxShadow: '0 22px 60px rgba(18,45,45,0.1)',
              objectFit: 'contain',
            }}
          />
        </Box>
      </Container>
    </Box>
  );
}
