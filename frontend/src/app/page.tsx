/**
 * Home page - dark editorial landing page inspired by fulcrum.rocks.
 * Uses the global dark MUI theme (configured in layout.client.tsx).
 * Framer-motion drives on-scroll reveals and the CTA marquee.
 */
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import {
  Container,
  Box,
  Typography,
  Button,
  Stack,
  Chip,
  AppBar,
  Toolbar,
  IconButton,
  Badge,
  Link as MuiLink,
} from '@mui/material';
import {
  NorthEast,
  ArrowForward,
  StarRounded,
  Add,
  Remove,
  Delete,
  ArrowBack,
  ShoppingCart,
  WaterDrop,
  LocalFlorist,
  LocalCafe,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { removeItem, updateQuantity } from '@/lib/cartSlice';

const API = '/api';
const BG = '#0B0B0F';

// When a single product exists, "Shop now" buttons go straight to that product.
function useShopNow() {
  const router = useRouter();
  return React.useCallback(() => {
    fetch(`${API}/products`)
      .then((r) => r.json())
      .then((data) => {
        const all = data?.data ?? [];
        if (all.length === 1) {
          router.push(`/shop/${all[0].id}`);
        } else {
          router.push('/shop');
        }
      })
      .catch(() => router.push('/shop'));
  }, [router]);
}

// ---- Animation variants ----
const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.08 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

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

export default function Home() {
  return (
    <>
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
    </>
  );
}

function AnimatedBurger({
  open,
  onClick,
  color,
}: {
  open: boolean;
  onClick: () => void;
  color: string;
}) {
  const line: React.CSSProperties = {
    position: 'absolute',
    left: 0,
    width: 24,
    height: 2,
    borderRadius: 2,
    background: color,
  };

  return (
    <IconButton onClick={onClick} aria-label="Toggle navigation" sx={{ color, ml: 1, mt: 1 }}>
      <Box sx={{ position: 'relative', width: 24, height: 18 }}>
        <Box
          component={motion.span}
          style={{ ...line, top: 0 }}
          animate={open ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        />
        <Box
          component={motion.span}
          style={{ ...line, top: 8 }}
          animate={open ? { opacity: 0 } : { opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
        <Box
          component={motion.span}
          style={{ ...line, top: 16 }}
          animate={open ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        />
      </Box>
    </IconButton>
  );
}

const Nav = () => {
  const wave = `
    C1360 70 1320 140 1240 170
    C1140 210 1020 170 900 110
    C760 40 560 20 340 55
    C170 80 70 95 0 75
  `;

  const [open, setOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const [cartView, setCartView] = React.useState(false);

  const dispatch = useAppDispatch();
  const items = useAppSelector((s) => s.cart.items);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // White over the turquoise nav panel (open) or once scrolled past the header.
  const burgerColor = open || scrolled ? '#fff' : '#14C4C4';

  const toggleNav = () => {
    setOpen((o) => !o);
    setCartView(false);
  };

  return (
    <Box>
      {/* Static burger button — stays above the turquoise nav panel and turns white when open/scrolling */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: (theme) => theme.zIndex.appBar + 400,
        }}
      >
        <AnimatedBurger open={open} onClick={toggleNav} color={burgerColor} />
      </Box>

      {/* Visible cart button — appears once items are added, opens the nav in cart view */}
      {count > 0 && (
        <Box
          sx={{
            position: 'fixed',
            top: 4,
            right: 8,
            zIndex: (theme) => theme.zIndex.appBar + 400,
          }}
        >
          <IconButton
            onClick={() => {
              setOpen(true);
              setCartView(true);
            }}
            aria-label={`Open cart, ${count} item${count !== 1 ? 's' : ''}`}
            sx={{ color: scrolled ? '#fff' : '#14C4C4' }}
          >
            <Badge badgeContent={count} color="primary" overlap="circular">
              <ShoppingCart />
            </Badge>
          </IconButton>
        </Box>
      )}

      <AppBar
        position="static"
        elevation={0}
        sx={{
          background: 'linear-gradient(to bottom, #FFFFFF 0%, #FFF8D8 100%)',
          zIndex: (theme) => theme.zIndex.appBar + 100,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ width: 48, height: 48, ml: 1 }} />

          <Container maxWidth="lg" sx={{ flexGrow: 1 }}>
            <Toolbar
              disableGutters
              sx={{
                display: 'flex',
                alignItems: 'center',
                position: 'relative',
                py: 1.5,
              }}
            ></Toolbar>
          </Container>
        </Box>
      </AppBar>

      {/* Retractable left navigation */}
      <AnimatePresence>
        {open && (
          <Box
            component={motion.nav}
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              height: '100vh',
              width: { xs: 260, sm: 300 },
              zIndex: (theme) => theme.zIndex.appBar + 300,
              background:
                'linear-gradient(to bottom, #0A8A8A 0%, #0FB0B0 25%, #14C4C4 50%, #B8EFEF 75%, #D8F8F8 100%)',
              boxShadow: '4px 0 24px rgba(0,0,0,0.25)',
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              p: 3,
              pt: 10,
            }}
          >
            {cartView ? (
              <>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 3,
                  }}
                >
                  <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '20px' }}>
                    Your Cart{count > 0 ? ` (${count})` : ''}
                  </Typography>
                  <IconButton
                    onClick={() => setCartView(false)}
                    aria-label="Back to menu"
                    sx={{ color: '#fff' }}
                  >
                    <ArrowBack />
                  </IconButton>
                </Box>

                {items.length === 0 ? (
                  <Typography sx={{ color: '#fff', opacity: 0.85 }}>Your cart is empty.</Typography>
                ) : (
                  <Box sx={{ flex: 1, overflowY: 'auto' }}>
                    <Stack spacing={1.5}>
                      {items.map((item) => (
                        <Box
                          key={item.productId}
                          sx={{
                            display: 'flex',
                            gap: 2,
                            alignItems: 'center',
                            pb: 1.5,
                            borderBottom: '1px solid rgba(255,255,255,0.2)',
                          }}
                        >
                          <Box
                            sx={{
                              width: 48,
                              height: 48,
                              borderRadius: 1,
                              flexShrink: 0,
                              bgcolor: 'rgba(255,255,255,0.2)',
                              backgroundImage: item.image ? `url(${item.image})` : 'none',
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                            }}
                          />
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography
                              noWrap
                              sx={{ color: '#fff', fontWeight: 600, fontSize: '15px' }}
                            >
                              {item.name}
                            </Typography>
                            <Typography sx={{ color: '#fff', opacity: 0.85, fontSize: '0.8rem' }}>
                              ${Number(item.price).toFixed(2)}
                            </Typography>
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'start',
                                gap: 0.5,
                                mt: 0.5,
                              }}
                            >
                              <IconButton
                                size="small"
                                onClick={() =>
                                  dispatch(
                                    updateQuantity({
                                      productId: item.productId,
                                      quantity: Math.max(1, item.quantity - 1),
                                    })
                                  )
                                }
                                aria-label="Decrease quantity"
                                sx={{ color: '#fff', p: 0.25 }}
                              >
                                <Remove fontSize="small" />
                              </IconButton>
                              <Typography sx={{ color: '#fff', minWidth: 18, textAlign: 'center' }}>
                                {item.quantity}
                              </Typography>
                              <IconButton
                                size="small"
                                onClick={() =>
                                  dispatch(
                                    updateQuantity({
                                      productId: item.productId,
                                      quantity: item.quantity + 1,
                                    })
                                  )
                                }
                                aria-label="Increase quantity"
                                sx={{ color: '#fff', p: 0.25 }}
                              >
                                <Add fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => dispatch(removeItem(item.productId))}
                                aria-label="Remove item"
                                sx={{ color: '#fff', p: 0.25 }}
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            </Box>
                          </Box>
                          <Typography sx={{ color: '#fff', fontWeight: 700, whiteSpace: 'nowrap' }}>
                            ${(Number(item.price) * item.quantity).toFixed(2)}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                )}

                {items.length > 0 && (
                  <Link
                    href="/checkout"
                    onClick={() => setOpen(false)}
                    style={{
                      marginTop: '20px',
                      padding: '12px 22px',
                      borderRadius: '999px',
                      background: '#fff',
                      color: '#0097b2',
                      fontWeight: 700,
                      textAlign: 'center',
                      textDecoration: 'none',
                    }}
                  >
                    Checkout
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link
                  href="/"
                  onClick={() => setOpen(false)}
                  style={{
                    color: '#fff',
                    fontWeight: 400,
                    fontSize: '24px',
                    textDecoration: 'none',
                    marginBottom: '32px',
                  }}
                >
                  RECOVERY CO.
                </Link>
                <Link
                  href="/about"
                  onClick={() => setOpen(false)}
                  style={{
                    color: '#fff',
                    fontSize: '18px',
                    textDecoration: 'none',
                    padding: '14px 0',
                    borderBottom: '1px solid rgba(255,255,255,0.25)',
                    textTransform: 'uppercase',
                  }}
                >
                  About
                </Link>
                <Link
                  href="/contact"
                  onClick={() => setOpen(false)}
                  style={{
                    color: '#fff',
                    fontSize: '18px',
                    textDecoration: 'none',
                    padding: '14px 0',
                    borderBottom: '1px solid rgba(255,255,255,0.25)',
                    textTransform: 'uppercase',
                  }}
                >
                  Contact
                </Link>
                <Link
                  href="/shop"
                  onClick={() => setOpen(false)}
                  style={{
                    color: '#fff',
                    fontSize: '18px',
                    textDecoration: 'none',
                    padding: '14px 0',
                    borderBottom: '1px solid rgba(255,255,255,0.25)',
                    textTransform: 'uppercase',
                  }}
                >
                  Shop Now
                </Link>

                {count > 0 && (
                  <button
                    type="button"
                    onClick={() => setCartView(true)}
                    style={{
                      color: '#fff',
                      fontSize: '18px',
                      textDecoration: 'none',
                      padding: '14px 0',
                      borderBottom: '1px solid rgba(255,255,255,0.25)',
                      textTransform: 'uppercase',
                      background: 'none',
                      border: 'none',
                      width: '100%',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    Cart ({count})
                  </button>
                )}
              </>
            )}
          </Box>
        )}
      </AnimatePresence>

      {/* Click-away backdrop */}
      <AnimatePresence>
        {open && (
          <Box
            component={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setOpen(false)}
            sx={{
              position: 'fixed',
              inset: 0,
              bgcolor: 'rgba(0,0,0,0.4)',
              zIndex: (theme) => theme.zIndex.appBar + 200,
            }}
          />
        )}
      </AnimatePresence>

      {/* Waves underneath the AppBar */}
      <Box
        aria-hidden
        sx={{ position: 'relative', width: '100%', height: 160, overflow: 'hidden' }}
      >
        <svg
          viewBox="0 0 1440 260"
          preserveAspectRatio="none"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            display: 'block',
            pointerEvents: 'none',
          }}
        >
          <defs>
            <linearGradient id="yellowBack" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFFDF6" />
              <stop offset="100%" stopColor="#FFF3A0" />
            </linearGradient>
            <linearGradient id="yellowMiddle" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFF7C2" />
              <stop offset="100%" stopColor="#FFE066" />
            </linearGradient>
            <linearGradient id="yellowFront" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFE75A" />
              <stop offset="100%" stopColor="#F5B800" />
            </linearGradient>
          </defs>

          {/* Deepest layer */}
          <path
            fill="url(#yellowFront)"
            d={`
              M0 0 H1440 V70
              ${wave}
              Z
            `}
          />
          {/* Middle layer */}
          <path
            fill="url(#yellowMiddle)"
            transform="translate(0 -30)"
            d={`
              M0 0 H1440 V70
              ${wave}
              Z
            `}
          />
          {/* Back / highest layer */}
          <path
            fill="url(#yellowBack)"
            transform="translate(0 -80)"
            d={`
              M0 0 H1440 V70
              ${wave}
              Z
            `}
          />
        </svg>
      </Box>
    </Box>
  );
};

function Hero() {
  const goShop = useShopNow();
  return (
    <Box
      component="section"
      sx={{ position: 'relative', pt: { xs: 6, md: 10 }, pb: { xs: 12, md: 20 } }}
    >
      {/* accent glow */}
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
          <Box component={motion.div} variants={fadeUp}></Box>

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
        </Box>
      </Container>
    </Box>
  );
}

function Story() {
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

type Product = {
  id: number;
  name: string;
  price: number | null;
  availabilityStatus?: string;
  images?: { imageUrl: string }[];
};

function Featured() {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch(`${API}/products`)
      .then((r) => r.json())
      .then((data) => setProducts((data?.data ?? []).slice(0, 6)))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box component="section" sx={{ py: { xs: 8, md: 14 } }}>
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'flex-end' },
            gap: 3,
            mb: { xs: 5, md: 8 },
          }}
        >
          <Box>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '2.2rem', md: '3.5rem' },
                fontWeight: 700,
                letterSpacing: '-0.02em',
                maxWidth: 700,
              }}
            >
              Our product
            </Typography>
          </Box>
        </Box>

        {loading ? (
          <Typography sx={{ color: 'text.secondary', py: 4 }}>Loading products…</Typography>
        ) : products.length === 0 ? (
          <Typography sx={{ color: 'text.secondary', py: 4 }}>
            No products available yet.
          </Typography>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' },
              gap: { xs: 2, md: 3 },
            }}
          >
            {products.map((product, i) => {
              const img = product.images?.[0]?.imageUrl;
              return (
                <Box
                  key={product.id}
                  component={motion.div}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ y: -8 }}
                >
                  <MuiLink component={Link} href="/shop" underline="none">
                    <Box
                      sx={{
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 4,
                        overflow: 'hidden',
                        bgcolor: 'background.paper',
                        transition: 'border-color .3s',
                        '&:hover': { borderColor: 'primary.main' },
                        '&:hover .p-arrow': { opacity: 1, transform: 'translate(0,0)' },
                      }}
                    >
                      <Box
                        sx={{
                          position: 'relative',
                          height: 240,
                          background: img
                            ? `url(${img}) center/cover no-repeat`
                            : 'linear-gradient(135deg, #1b1b22 0%, #101015 100%)',
                        }}
                      >
                        <Box
                          className="p-arrow"
                          sx={{
                            position: 'absolute',
                            top: 16,
                            right: 16,
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            bgcolor: 'primary.main',
                            color: BG,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: 0,
                            transform: 'translate(6px, -6px)',
                            transition: 'opacity .3s, transform .3s',
                          }}
                        >
                          <NorthEast fontSize="small" />
                        </Box>
                      </Box>
                      <Box sx={{ p: 3 }}>
                        <Chip
                          label={product.availabilityStatus || 'Available'}
                          size="small"
                          sx={{
                            mb: 1.5,
                            bgcolor: 'rgba(20,196,196,0.12)',
                            color: 'primary.main',
                            fontSize: '0.7rem',
                            textTransform: 'capitalize',
                          }}
                        />
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: 600, mb: 0.5, color: 'text.primary' }}
                        >
                          {product.name}
                        </Typography>
                        <Typography
                          sx={{ fontWeight: 700, fontSize: '1.3rem', color: 'text.primary' }}
                        >
                          ${Number(product.price ?? 0).toFixed(2)}
                        </Typography>
                      </Box>
                    </Box>
                  </MuiLink>
                </Box>
              );
            })}
          </Box>
        )}
      </Container>
    </Box>
  );
}

function Testimonials() {
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
              <Typography
                sx={{ color: 'text.primary', fontSize: '1.05rem', lineHeight: 1.6, flexGrow: 1 }}
              >
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

function Footer() {
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
          <Box component={motion.div} variants={fadeUp}>
            <Typography sx={{ fontWeight: 200, fontSize: '2rem', letterSpacing: '-0.02em', mb: 2 }}>
              RECOVERY CO.
            </Typography>
            <Typography sx={{ color: 'black', maxWidth: 360, lineHeight: 1.6 }}>
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
                  color: 'black',
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
                      color: 'black',
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
            borderTop: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <Typography sx={{ color: 'black', fontSize: '0.875rem' }}>
            © {new Date().getFullYear()} Recovery Co. — All rights reserved
          </Typography>
          <Stack direction="row" spacing={2}>
            <MuiLink
              component={Link}
              href="/privacy"
              underline="none"
              sx={{
                color: 'black',
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
                color: 'black',
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
