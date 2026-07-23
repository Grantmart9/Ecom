'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Container, Typography, Box, CircularProgress, Alert, Button } from '@mui/material';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('order_id');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(() => (!orderId ? 'error' : 'loading'));
  const [message, setMessage] = useState(() => (!orderId ? 'Missing order reference' : ''));

  useEffect(() => {
    if (!orderId) return;
  }, [orderId]);

  useEffect(() => {
    if (!orderId || status === 'error') return;

    const checkStatus = async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        if (!res.ok) throw new Error('Failed to fetch order');
        const order = await res.json();
        if (order.paymentStatus === 'completed') {
          setStatus('success');
          setMessage(`Payment successful for order ${order.orderNumber}`);
        } else if (order.paymentStatus === 'failed') {
          setStatus('error');
          setMessage(`Payment failed for order ${order.orderNumber}`);
        } else {
          setTimeout(checkStatus, 2000);
        }
      } catch {
        setTimeout(checkStatus, 2000);
      }
    };

    checkStatus();
  }, [orderId, status]);

  return (
    <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
      {status === 'loading' && (
        <Box>
          <CircularProgress sx={{ mb: 2 }} />
          <Typography variant="h6">{message}</Typography>
        </Box>
      )}
      {status === 'success' && (
        <Box>
          <Typography variant="h4" color="success.main" sx={{ mb: 2 }}>
            Payment Successful
          </Typography>
          <Typography variant="body1" sx={{ mb: 4 }}>{message}</Typography>
          <Button variant="contained" onClick={() => router.push('/')}>
            Continue Shopping
          </Button>
        </Box>
      )}
      {status === 'error' && (
        <Box>
          <Alert severity="error" sx={{ mb: 3 }}>{message}</Alert>
          <Button variant="contained" onClick={() => router.push('/checkout')}>
            Try Again
          </Button>
        </Box>
      )}
    </Container>
  );
}
