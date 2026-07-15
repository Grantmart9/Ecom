'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { AppBar, Container, Toolbar, IconButton, Badge, Box, Typography, Stack } from '@mui/material';
import { ShoppingCart, ArrowBack, Add, Remove, Delete } from '@mui/icons-material';
import Link from 'next/link';
import AnimatedBurger from './AnimatedBurger';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { removeItem, updateQuantity } from '@/lib/cartSlice';
import { API } from '@/lib/animations';

export function useShopNow() {
  const router = useRouter();
  return useCallback(() => {
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

const navLinks = [
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
  { label: 'Shop Now', href: '/shop' },
];

const navVariants = {
  initial: { x: '-100%' },
  animate: { x: 0 },
  exit: { x: '-100%' },
};

const transitionConfig = { type: 'tween' as const, duration: 0.35, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] };

const backdropVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.3 } },
};

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [cartView, setCartView] = useState(false);

  const dispatch = useAppDispatch();
  const items = useAppSelector((s) => s.cart.items);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const burgerColor = open || scrolled ? '#fff' : '#14C4C4';

  const toggleNav = () => {
    setOpen((o) => !o);
    setCartView(false);
  };

  const wave = `
    C1360 70 1320 140 1240 170
    C1140 210 1020 170 900 110
    C760 40 560 20 340 55
    C170 80 70 95 0 75
  `;

  return (
    <Box>
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
            <Toolbar disableGutters sx={{ display: 'flex', alignItems: 'center', position: 'relative', py: 1.5 }} />
          </Container>
        </Box>
      </AppBar>

      <AnimatePresence>
        {open && (
          <>
            <Box
              component={motion.nav}
              initial="initial"
              animate="animate"
              exit="exit"
              variants={navVariants}
              transition={transitionConfig}
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
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                    <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '20px' }}>
                      Your Cart{count > 0 ? ` (${count})` : ''}
                    </Typography>
                    <IconButton onClick={() => setCartView(false)} aria-label="Back to menu" sx={{ color: '#fff' }}>
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
                              <Typography noWrap sx={{ color: '#fff', fontWeight: 600, fontSize: '15px' }}>
                                {item.name}
                              </Typography>
                              <Typography sx={{ color: '#fff', opacity: 0.85, fontSize: '0.8rem' }}>
                                ${Number(item.price).toFixed(2)}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'start', gap: 0.5, mt: 0.5 }}>
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
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
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
                      {link.label}
                    </Link>
                  ))}

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

            <Box
              component={motion.div}
              initial="initial"
              animate="animate"
              exit="exit"
              variants={backdropVariants}
              onClick={() => setOpen(false)}
              sx={{
                position: 'fixed',
                inset: 0,
                bgcolor: 'rgba(0,0,0,0.4)',
                zIndex: (theme) => theme.zIndex.appBar + 200,
              }}
            />
          </>
        )}
      </AnimatePresence>

      <Box aria-hidden sx={{ position: 'relative', width: '100%', height: 160, overflow: 'hidden' }}>
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

          <path
            fill="url(#yellowFront)"
            d={`M0 0 H1440 V70\n              ${wave}\n              Z`}
          />
          <path
            fill="url(#yellowMiddle)"
            transform="translate(0 -30)"
            d={`M0 0 H1440 V70\n              ${wave}\n              Z`}
          />
          <path
            fill="url(#yellowBack)"
            transform="translate(0 -80)"
            d={`M0 0 H1440 V70\n              ${wave}\n              Z`}
          />
        </svg>
      </Box>
    </Box>
  );
}
