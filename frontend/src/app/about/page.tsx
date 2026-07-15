'use client';

import PageShell from '@/components/page/PageShell';
import { motion } from 'framer-motion';
import { Box, Typography } from '@mui/material';

export default function About() {
  return (
    <PageShell maxWidth>
      <Box sx={{ textAlign: 'center', maxWidth: 640, width: '100%' }}>
        <Typography variant="h3" sx={{ fontWeight: 800 }}>
          About Recovery Co.
        </Typography>
        <Typography variant="h4" sx={{ mt: 4, fontWeight: 700 }}>
          Our Story
        </Typography>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Box sx={{ mt: 3, textAlign: 'left' }}>
            <Typography variant="body1" sx={{ lineHeight: 1.7, textAlign: 'left' }}>
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
        </motion.div>
      </Box>
    </PageShell>
  );
}
