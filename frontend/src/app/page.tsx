/**
 * Home page - dark editorial landing page inspired by fulcrum.rocks.
 * Uses the global dark MUI theme (configured in layout.client.tsx).
 * Framer-motion drives on-scroll reveals and the CTA marquee.
 */
'use client';

import { Box } from '@mui/material';
import { AnimatedBackground, Nav, Hero, Story, Featured, Testimonials, Footer } from '@/components/landing';

export default function Home() {
  return (
    <Box
      sx={{
        background: 'linear-gradient(180deg, #f6fcfd 0%, #eef9f7 42%, #f9f6ef 100%)',
        color: 'text.primary',
        minHeight: '100vh',
        overflowX: 'hidden',
        position: 'relative',
        zIndex: 1,
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background: [
            'radial-gradient(circle at top left, rgba(20,196,196,0.16), transparent 32%)',
            'radial-gradient(circle at top right, rgba(255,229,0,0.18), transparent 30%)',
            'radial-gradient(circle at 50% 55%, rgba(255,255,255,0.82), transparent 45%)',
          ].join(','),
          pointerEvents: 'none',
        },
      }}
    >
      <AnimatedBackground />
      <Nav />
      <Hero />
      <Story />
      <Featured />
      <Testimonials />
      <Footer />
    </Box>
  );
}
