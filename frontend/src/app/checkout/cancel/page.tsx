'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Container, Typography, Box, Button } from '@mui/material';

export default function CheckoutCancelPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('order_id');

  return (
    <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
      <Typography variant="h4" color="warning.main" sx={{ mb: 2 }}>
        Payment Cancelled
      </Typography>
      <Typography variant="body1" sx={{ mb: 4 }}>
        Your payment was cancelled. Order {orderId ? `#${orderId}` : ''} has not been processed.
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
        <Button variant="outlined" onClick={() => router.push('/checkout')}>
          Return to Checkout
        </Button>
        <Button variant="contained" onClick={() => router.push('/')}>
          Continue Shopping
        </Button>
      </Box>
    </Container>
  );
}
