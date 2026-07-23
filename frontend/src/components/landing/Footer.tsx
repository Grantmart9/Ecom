'use client';

import { motion } from 'framer-motion';
import { Box, Container, Typography, Stack } from '@mui/material';
import Link from 'next/link';
import MuiLink from '@mui/material/Link';
import { fadeUp, stagger } from '@/lib/animations';

const columns = [
  {
    title: 'Shop',
    links: [{ label: 'Shop now', href: '/shop' }],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'FAQ', href: '/faq' },
      { label: 'Contact', href: '/contact' },
    ],
  },
];

export default function Footer() {
  return (
    <Box component="footer" sx={{ pt: { xs: 8, md: 12 }, pb: 5 }}>
      <Container maxWidth="lg">
        <Box
          component={motion.div}
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '2fr 1fr 1fr' },
            gap: { xs: 5, md: 4 },
            mb: 8,
          }}
        >
          <Box
            component={motion.div}
            variants={fadeUp}
            sx={{
              p: { xs: 3, md: 4 },
              borderRadius: 5,
              bgcolor: 'rgba(255,255,255,0.62)',
              border: '1px solid rgba(255,255,255,0.72)',
              backdropFilter: 'blur(18px)',
              boxShadow: '0 18px 48px rgba(18,45,45,0.08)',
            }}
          >
            <Typography sx={{ fontWeight: 300, fontSize: '2rem', letterSpacing: '-0.02em', mb: 2 }}>
              RECOVERY CO.
            </Typography>
            <Typography sx={{ color: 'rgba(11,11,15,0.72)', maxWidth: 360, lineHeight: 1.6 }}>
              Our flavourless, completely soluble daily powder blends effortlessly into any food or
              drink, providing convenient immune support for growing children.
            </Typography>
          </Box>
          {columns.map((col) => (
            <Box key={col.title} component={motion.div} variants={fadeUp}>
              <Typography
                sx={{
                  textTransform: 'uppercase',
                  letterSpacing: 2,
                  fontSize: '0.75rem',
                  color: 'rgba(11,11,15,0.56)',
                  mb: 2,
                }}
              >
                {col.title}
              </Typography>
              <Stack spacing={1.25}>
                {col.links.map((l) => (
                  <MuiLink
                    key={l.href + l.label}
                    component={Link}
                    href={l.href}
                    underline="none"
                    sx={{
                      color: 'rgba(11,11,15,0.72)',
                      fontSize: '0.95rem',
                      transition: 'color .2s',
                      '&:hover': { color: 'primary.main' },
                    }}
                  >
                    {l.label}
                  </MuiLink>
                ))}
              </Stack>
            </Box>
          ))}
        </Box>
        <Box
          component={motion.div}
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          sx={{
            pt: 4,
            borderTop: '1px solid rgba(11,11,15,0.08)',
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <Typography sx={{ color: 'rgba(11,11,15,0.62)', fontSize: '0.875rem' }}>
            © {new Date().getFullYear()} Recovery Co. — All rights reserved
          </Typography>
          <Stack direction="row" spacing={2}>
            <MuiLink
              component={Link}
              href="/privacy"
              underline="none"
              sx={{
                color: 'rgba(11,11,15,0.62)',
                fontSize: '0.875rem',
                '&:hover': { color: 'text.primary' },
              }}
            >
              Privacy
            </MuiLink>
            <MuiLink
              component={Link}
              href="/terms"
              underline="none"
              sx={{
                color: 'rgba(11,11,15,0.62)',
                fontSize: '0.875rem',
                '&:hover': { color: 'text.primary' },
              }}
            >
              Terms
            </MuiLink>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
