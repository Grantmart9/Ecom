'use client';

import { Container, Box, Typography, Card, CardContent, TextField, Button, Chip, Divider, Alert, Snackbar, CircularProgress, RadioGroup, FormControlLabel, Radio, FormControl, FormLabel } from '@mui/material';
import { useState } from 'react';
import { useAppSelector } from '@/lib/hooks';

type CartItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
};

export default function CheckoutPage() {
  const cartItems = useAppSelector((s) => s.cart.items) as CartItem[];

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountType: string;
    discountValue: number;
    discountAmount: number;
    finalTotal: number;
  } | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
  const shipping = subtotal > 0 ? 3000 : 0;
  const discountAmount = appliedCoupon?.discountAmount ?? 0;
  const total = subtotal + shipping - discountAmount;

  const validateMutation = {
    mutate: async (code: string) => {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, userId: 1, orderTotal: subtotal }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || err.detail || 'Invalid coupon');
      }
      return res.json();
    },
    isPending: false,
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setSnackbar({ open: true, message: 'Please enter a coupon code', severity: 'error' });
      return;
    }
    try {
      const data = await validateMutation.mutate(couponCode.trim());
      setAppliedCoupon({
        code: couponCode.trim().toUpperCase(),
        discountType: data.discountType,
        discountValue: data.discountValue,
        discountAmount: data.discountAmount,
        finalTotal: data.finalTotal,
      });
      setCouponCode('');
      setSnackbar({ open: true, message: 'Coupon applied successfully!', severity: 'success' });
    } catch (err) {
      setAppliedCoupon(null);
      setSnackbar({ open: true, message: err instanceof Error ? err.message : 'Invalid coupon', severity: 'error' });
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setSnackbar({ open: true, message: 'Coupon removed', severity: 'success' });
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      setSnackbar({ open: true, message: 'Your cart is empty', severity: 'error' });
      return;
    }
    if (!customerName.trim() || !customerEmail.trim()) {
      setSnackbar({ open: true, message: 'Please enter your name and email', severity: 'error' });
      return;
    }
    setIsProcessing(true);
    try {
      const orderData = {
        userId: 1,
        items: cartItems.map((item) => ({
          productId: Number(item.productId),
          quantity: item.quantity,
          unitPrice: item.price,
        })),
        currency: 'ZAR',
        customerNotes: customerName,
        coupon: appliedCoupon || undefined,
      };
      const res = await fetch('/api/checkout/payfast/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || err.message || 'Failed to initiate payment');
      }
      const result = await res.json();

      const form = document.createElement('form');
      form.method = 'POST';
      form.action = result.payfastUrl;
      Object.entries(result.formParams).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = String(value);
        form.appendChild(input);
      });
      document.body.appendChild(form);
      form.submit();
    } catch (err) {
      setSnackbar({ open: true, message: err instanceof Error ? err.message : 'Checkout failed', severity: 'error' });
      setIsProcessing(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>Checkout</Typography>

      {snackbar.open && (
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }} component="form" onSubmit={handleCheckout}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>Contact Information</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Full Name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                fullWidth
                required
              />
              <TextField
                label="Email Address"
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                fullWidth
                required
              />
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>Payment Method</Typography>
            <FormControl>
              <FormLabel>Select payment method</FormLabel>
              <RadioGroup defaultValue="card">
                <FormControlLabel value="card" control={<Radio />} label="Credit / Debit Card" />
                <FormControlLabel value="eft" control={<Radio />} label="Instant EFT" />
              </RadioGroup>
            </FormControl>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>Order Summary</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {cartItems.map((item) => (
                <Box key={item.productId} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">
                    {item.name || `Product ${item.productId}`} x{item.quantity}
                  </Typography>
                  <Typography variant="body2">
                    R{((item.price || 0) * item.quantity).toFixed(2)}
                  </Typography>
                </Box>
              ))}

              <Divider sx={{ my: 1 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Subtotal</Typography>
                <Typography variant="body2">R{subtotal.toFixed(2)}</Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Shipping</Typography>
                <Typography variant="body2">R{shipping.toFixed(2)}</Typography>
              </Box>

              {appliedCoupon && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', color: 'success.main' }}>
                  <Typography variant="body2">Discount ({appliedCoupon.code})</Typography>
                  <Typography variant="body2">-R{appliedCoupon.discountAmount.toFixed(2)}</Typography>
                </Box>
              )}

              <Divider sx={{ my: 1 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Total</Typography>
                <Typography variant="h6" color="primary">
                  R{total.toFixed(2)}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>Coupon Code</Typography>
            {appliedCoupon ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1, bgcolor: 'success.light', borderRadius: 1 }}>
                <Chip
                  label={`${appliedCoupon.code} - ${appliedCoupon.discountType === 'percentage' ? `${appliedCoupon.discountValue}% off` : `R${appliedCoupon.discountValue.toFixed(2)} off`}`}
                  color="success"
                  onDelete={handleRemoveCoupon}
                />
                <Typography variant="body2" sx={{ ml: 'auto', fontWeight: 600, color: 'success.dark' }}>
                  -R{appliedCoupon.discountAmount.toFixed(2)}
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  label="Enter coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                  fullWidth
                  size="small"
                  placeholder="e.g. SAVE10, WELCOME50"
                />
                <Button
                  variant="outlined"
                  onClick={handleApplyCoupon}
                  disabled={validateMutation.isPending}
                >
                  {validateMutation.isPending ? <CircularProgress size={20} /> : 'Apply'}
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>

        <Alert severity="info" sx={{ mt: 1 }}>
          You will be redirected to Payfast to complete your payment securely.
        </Alert>

        <Button
          type="submit"
          variant="contained"
          size="large"
          fullWidth
          disabled={isProcessing || cartItems.length === 0}
          sx={{ py: 1.5 }}
        >
          {isProcessing ? <CircularProgress size={24} /> : `Pay R${total.toFixed(2)} via Payfast`}
        </Button>
      </Box>
    </Container>
  );
}
