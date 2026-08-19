'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Close } from '@mui/icons-material';
import { Box, Button, Dialog, IconButton, TextField, Typography } from '@mui/material';

const VISITED_KEY = 'recovery-co-landing-visited';
export const WAITLIST_DISCOUNT_KEY = 'recovery-co-waitlist-discount';

export default function WaitlistModal() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    if (window.localStorage.getItem(VISITED_KEY)) return;

    window.localStorage.setItem(VISITED_KEY, 'true');
    const timeout = window.setTimeout(() => setOpen(true), 650);
    return () => window.clearTimeout(timeout);
  }, []);

  const handleJoin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    window.localStorage.setItem(
      WAITLIST_DISCOUNT_KEY,
      JSON.stringify({ email: email.trim(), percentage: 10 })
    );
    setJoined(true);
  };

  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      aria-labelledby="waitlist-title"
      slotProps={{
        paper: {
          sx: {
          width: 'min(92vw, 520px)',
          m: 2,
          borderRadius: { xs: 0, sm: 0 },
          overflow: 'hidden',
          color: '#063f42',
          background: 'linear-gradient(145deg, #faffff 0%, #dff8f5 60%, #fff7bd 100%)',
          boxShadow: '0 30px 90px rgba(2, 62, 67, 0.35)',
          },
        },
      }}
    >
      <IconButton
        aria-label="Close waitlist offer"
        onClick={() => setOpen(false)}
        sx={{ position: 'absolute', right: 14, top: 14, zIndex: 1, color: '#063f42' }}
      >
        <Close />
      </IconButton>

      <Box sx={{ px: { xs: 3, sm: 6 }, py: { xs: 6, sm: 7 }, textAlign: 'center' }}>
        <Typography
          component="p"
          sx={{
            color: '#0a8a8a',
            fontSize: '0.75rem',
            fontWeight: 800,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            mb: 2,
          }}
        >
          Recovery starts here
        </Typography>

        {joined ? (
          <>
            <Typography id="waitlist-title" component="h2" sx={{ fontSize: { xs: 34, sm: 46 }, fontWeight: 800, lineHeight: 1 }}>
              You are on the list.
            </Typography>
            <Typography sx={{ mt: 2, mb: 4, fontSize: '1.05rem' }}>
              Your 10% discount is ready and will be applied automatically at checkout.
            </Typography>
            <Button variant="contained" onClick={() => setOpen(false)} sx={{ borderRadius: 99, px: 4, py: 1.25, fontWeight: 800 }}>
              Start shopping
            </Button>
          </>
        ) : (
          <>
            <Typography id="waitlist-title" component="h2" sx={{ fontSize: { xs: 38, sm: 54 }, fontWeight: 900, letterSpacing: '-0.045em', lineHeight: 0.95 }}>
              Take 10% off your cart.
            </Typography>
            <Typography sx={{ maxWidth: 390, mx: 'auto', mt: 2.5, mb: 4, color: '#315f61', fontSize: '1rem' }}>
              Join the waitlist for product drops, recovery notes, and 10% off your total cart.
            </Typography>
            <Box component="form" onSubmit={handleJoin} sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1.25 }}>
              <TextField
                type="email"
                required
                fullWidth
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Email address"
                slotProps={{ htmlInput: { 'aria-label': 'Email address' } }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 99, bgcolor: 'rgba(255,255,255,0.8)' } }}
              />
              <Button type="submit" variant="contained" sx={{ borderRadius: 99, px: 3.5, whiteSpace: 'nowrap', fontWeight: 800 }}>
                Join waitlist
              </Button>
            </Box>
            <Typography sx={{ mt: 2, color: '#56797a', fontSize: '0.72rem' }}>
              One welcome reward per customer. Unsubscribe anytime.
            </Typography>
          </>
        )}
      </Box>
    </Dialog>
  );
}
