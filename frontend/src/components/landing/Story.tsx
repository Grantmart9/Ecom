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
          <Box component={motion.div} variants={fadeUp}>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '2.2rem', md: '3.5rem' },
                fontWeight: 700,
                letterSpacing: '-0.02em',
                mb: 3,
                maxWidth: 500,
                color: 'black',
              }}
            >
              More about our story
            </Typography>
            <Typography sx={{ color: 'black', lineHeight: 1.7, maxWidth: 480 }}>
              Recovery Co. was born from a simple challenge familiar to many parents: making daily
              immune support easy for children. Inspired by the realities of raising a busy toddler,
              we created Super Sprinkle—a tasteless, fully soluble daily immune support powder that
              blends effortlessly into the foods and drinks kids already enjoy. Made with carefully
              selected, science-backed ingredients, our mission is to help families build healthy
              habits through simple, effective products that fit naturally into everyday life,
              giving parents confidence in the small choices that support their children&apos;s
              wellbeing.
            </Typography>
          </Box>
          <Box
            component={motion.div}
            variants={fadeUp}
            sx={{
              position: 'relative',
              width: '100%',
              paddingTop: '56.25%',
              borderRadius: 4,
              overflow: 'hidden',
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <video
              autoPlay
              loop
              muted
              playsInline
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            >
              <source src="/video/landing-hero.mp4" type="video/mp4" />
            </video>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
