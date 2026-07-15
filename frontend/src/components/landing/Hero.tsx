'use client';

import { motion } from 'framer-motion';
import { Box, Container, Typography } from '@mui/material';
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
  useShopNow();

  return (
    <Box
      component="section"
      sx={{ position: 'relative', pt: { xs: 6, md: 10 }, pb: { xs: 12, md: 20 } }}
    >
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          top: '-25%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '90vw',
          height: '90vw',
          maxWidth: 1000,
          maxHeight: 1000,
          background: `radial-gradient(circle, rgba(255,229,0,0.15) 0%, rgba(20,196,196,0) 60%)`,
          pointerEvents: 'none',
        }}
      />
      <Container maxWidth="lg" sx={{ position: 'relative' }}>
        <Box
          component={motion.div}
          variants={fadeUp}
          sx={{ textAlign: 'center', mb: { xs: 4, md: 6 }, mt: { xs: -10, md: -20 } }}
        >
          <Typography
            style={{
              color: '#fff',
              fontWeight: 400,
              fontSize: '3rem',
              letterSpacing: '0.08em',
              textDecoration: 'none',
            }}
          >
            RECOVERY CO.
          </Typography>
        </Box>
      </Container>

      <Container maxWidth="lg" sx={{ position: 'relative', mt: { xs: 4, md: 2 } }}>
        <Box
          component={motion.div}
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <Box component={motion.div} variants={fadeUp} />

          <Typography
            component={motion.h1}
            variants={fadeUp}
            sx={{
              fontSize: { xs: '3rem', sm: '4.5rem', md: '6rem', lg: '7rem' },
              fontWeight: 800,
              lineHeight: 0.98,
              letterSpacing: '-0.03em',
              mb: 4,
              mt: { xs: 4, md: 0 },
              maxWidth: 800,
              display: 'inline-block',
              px: 1.5,
              borderRadius: 2,
            }}
          >
            Invisible to kids.
            <br />
            Powerful in{' '}
            <Box component="span" sx={{ color: 'rgb(255, 209, 38)' }}>
              purpose.
            </Box>
          </Typography>

          <Box
            component={motion.div}
            variants={fadeUp}
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: { xs: 4, md: 6 },
              alignItems: 'center',
            }}
          >
            <Box>
              <Typography
                sx={{
                  fontSize: { xs: '1.1rem', md: '1.35rem' },
                  color: 'black',
                  maxWidth: 620,
                  mb: 5,
                  lineHeight: 1.5,
                }}
              >
                Our flavourless, completely soluble daily powder blends effortlessly into any food
                or drink, providing convenient immune support for growing children.
              </Typography>

              <Box
                component={motion.div}
                variants={stagger}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
                  gap: { xs: 4, md: 3 },
                }}
              >
                {stats.map((s) => (
                  <Box key={s.label} component={motion.div} variants={fadeUp}>
                    <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
                      <s.icon sx={{ color: '#F5C400', fontSize: 64 }} />
                    </Box>
                    <Typography
                      sx={{
                        fontSize: { xs: '1.1rem', md: '1.35rem' },
                        fontWeight: 700,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        color: '#F5C400',
                        textAlign: 'center',
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
                borderRadius: 2,
                overflow: 'hidden',
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
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
