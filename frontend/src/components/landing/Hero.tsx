'use client';

import { motion } from 'framer-motion';
import { Box, Button, Chip, Container, Stack, Typography } from '@mui/material';
import Link from 'next/link';
import { WaterDrop, LocalFlorist, LocalCafe } from '@mui/icons-material';
import { useShopNow } from '@/components/landing/Nav';
import { fadeUp, stagger } from '@/lib/animations';

const stats = [
  {
    icon: LocalFlorist,
    label: 'CLEAN INGREDIENTS',
  },
  {
    icon: WaterDrop,
    label: 'SOLUBLE',
  },
  {
    icon: LocalCafe,
    label: 'MINIMAL TASTE',
  },
];

export default function Hero() {
  const shopNow = useShopNow();

  return (
    <Box
      component="section"
      sx={{ position: 'relative', pt: { xs: 10, md: 14 }, pb: { xs: 10, md: 18 } }}
    >
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          top: '-18%',
          right: '-10%',
          width: '65vw',
          height: '65vw',
          maxWidth: 780,
          maxHeight: 780,
          background: 'radial-gradient(circle, rgba(20,196,196,0.18) 0%, rgba(20,196,196,0) 68%)',
          filter: 'blur(8px)',
          pointerEvents: 'none',
        }}
      />
      <Container maxWidth="lg" sx={{ position: 'relative' }}>
        <Box
          component={motion.div}
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <Box
            component={motion.div}
            variants={fadeUp}
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: { xs: 5, md: 8 },
              alignItems: 'center',
            }}
          >
            <Box>
              <Chip
                label="Daily wellness for modern families"
                sx={{
                  mb: 3,
                  px: 1,
                  height: 34,
                  borderRadius: '999px',
                  bgcolor: 'rgba(255,255,255,0.78)',
                  color: 'text.primary',
                  border: '1px solid rgba(11,11,15,0.08)',
                  backdropFilter: 'blur(14px)',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                }}
              />

              <Typography
                component={motion.h1}
                variants={fadeUp}
                sx={{
                  fontSize: { xs: '3.2rem', sm: '4.5rem', md: '5.8rem', lg: '6.8rem' },
                  fontWeight: 800,
                  lineHeight: 0.95,
                  letterSpacing: '-0.05em',
                  mb: 3,
                  maxWidth: 760,
                }}
              >
                Wellness that disappears into the routine.
              </Typography>

              <Typography
                sx={{
                  fontSize: { xs: '1.05rem', md: '1.2rem' },
                  color: 'rgba(11,11,15,0.72)',
                  maxWidth: 600,
                  mb: 4,
                  lineHeight: 1.7,
                }}
              >
                Our flavourless, completely soluble daily powder blends effortlessly into any food
                or drink, providing convenient immune support for growing children.
              </Typography>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 5 }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={shopNow}
                  sx={{
                    px: 3.5,
                    py: 1.5,
                    borderRadius: '999px',
                    boxShadow: '0 18px 40px rgba(20,196,196,0.22)',
                  }}
                >
                  Shop now
                </Button>
                <Button
                  component={Link}
                  href="/about"
                  variant="outlined"
                  size="large"
                  sx={{
                    px: 3.5,
                    py: 1.5,
                    borderRadius: '999px',
                    borderColor: 'rgba(11,11,15,0.12)',
                    color: 'text.primary',
                    bgcolor: 'rgba(255,255,255,0.58)',
                    backdropFilter: 'blur(14px)',
                  }}
                >
                  Learn more
                </Button>
              </Stack>

              <Box
                component={motion.div}
                variants={stagger}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
                  gap: { xs: 3, md: 3 },
                }}
              >
                {stats.map((s) => (
                  <Box
                    key={s.label}
                    component={motion.div}
                    variants={fadeUp}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      p: 3,
                      borderRadius: 5,
                      border: '1px solid rgba(255,255,255,0.7)',
                      bgcolor: 'rgba(255,255,255,0.64)',
                      backdropFilter: 'blur(18px)',
                      boxShadow: '0 18px 38px rgba(18,45,45,0.08)',
                      transition: 'transform .3s, box-shadow .3s, border-color .3s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 18px 48px rgba(18,45,45,0.12)',
                        borderColor: 'primary.main',
                      },
                    }}
                  >
                    <Box
                      sx={{
                        mb: 2,
                        width: 56,
                        height: 56,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'linear-gradient(135deg, rgba(255,229,0,0.28) 0%, rgba(20,196,196,0.16) 100%)',
                      }}
                    >
                      <s.icon sx={{ color: '#F5C400', fontSize: 28 }} />
                     </Box>
                    <Typography
                      sx={{
                        fontSize: { xs: '0.85rem', md: '0.9rem' },
                        fontWeight: 700,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: 'text.primary',
                        lineHeight: 1.3,
                      }}
                    >
                      {s.label}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>

            <Box
              sx={{
                position: 'relative',
                width: '100%',
                paddingTop: '100%',
                borderRadius: 6,
                overflow: 'hidden',
                bgcolor: 'rgba(255,255,255,0.58)',
                border: '1px solid rgba(255,255,255,0.72)',
                boxShadow: '0 30px 80px rgba(18,45,45,0.16)',
                backdropFilter: 'blur(18px)',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(180deg, rgba(255,255,255,0) 20%, rgba(11,11,15,0.12) 100%)',
                  pointerEvents: 'none',
                },
              }}
            >
              <video
                autoPlay
                loop
                muted={true}
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
        </Box>
      </Container>
    </Box>
  );
}
