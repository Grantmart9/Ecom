/**
 * Home page - dark editorial landing page inspired by fulcrum.rocks.
 * Uses the global dark MUI theme (configured in layout.client.tsx).
 * Framer-motion drives on-scroll reveals and the CTA marquee.
 */
'use client';

import { Box } from '@mui/material';
import { Nav, Hero, Story, Featured, Testimonials, Footer } from '@/components/landing';

export default function Home() {
  return (
    <Box
      sx={{
        bgcolor: 'background.default',
        color: 'text.primary',
        minHeight: '100vh',
        overflowX: 'hidden',
        position: 'relative',
        zIndex: 1,
      }}
    >
      <Nav />
      <Hero />
      <Story />
      <Featured />
      <Testimonials />
      <Footer />
    </Box>
  );
}
