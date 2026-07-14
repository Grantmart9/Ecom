'use client';

import { Container, Box, Typography, Card, CardContent, TextField, Button, Chip, Divider, Alert, Snackbar, CircularProgress } from '@mui/material';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

type CartItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
};

export default function CheckoutPage() {
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountType: string;
    discountValue: number;
    discountAmount: number;
    finalTotal: number;
  } | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const queryClient = useQueryClient();

  const mockCart: CartItem[] = [
    { productId: '1', name: 'Sample Product', price: 500000, quantity: 2 },
  ];

  const subtotal = mockCart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = 30000;
  const discountAmount = appliedCoupon?.discountAmount ?? 0;
  const total = subtotal + shipping - discountAmount;

  const validateMutation = useMutation({
    mutationFn: async (code: string) => {
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
    onSuccess: (data) => {
      setAppliedCoupon({
        code: couponCode.trim().toUpperCase(),
        discountType: data.discountType,
        discountValue: data.discountValue,
        discountAmount: data.discountAmount,
        finalTotal: data.finalTotal,
      });
      setCouponCode('');
      setSnackbar({ open: true, message: 'Coupon applied successfully!', severity: 'success' });
    },
    onError: (err: Error) => {
      setAppliedCoupon(null);
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    },
  });

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      setSnackbar({ open: true, message: 'Please enter a coupon code', severity: 'error' });
      return;
    }
    validateMutation.mutate(couponCode.trim());
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setSnackbar({ open: true, message: 'Coupon removed', severity: 'success' });
  };

  const handleCheckout = async () => {
    if (!appliedCoupon) {
      setSnackbar({ open: true, message: 'Please apply a coupon before checkout', severity: 'error' });
      return;
    }
    try {
      const orderData = {
        userId: 1,
        items: mockCart.map((item) => ({
          productId: Number(item.productId),
          quantity: item.quantity,
          unitPrice: item.price,
        })),
        shippingAddressId: 1,
        currency: 'VND',
      };
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });
      if (!res.ok) throw new Error('Failed to create order');
      const order = await res.json();
      setSnackbar({ open: true, message: `Order ${order.orderNumber} created!`, severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: err instanceof Error ? err.message : 'Checkout failed', severity: 'error' });
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

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>Coupon Code</Typography>

            {appliedCoupon ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1, bgcolor: 'success.light', borderRadius: 1 }}>
                <Chip
                  label={`${appliedCoupon.code} - ${appliedCoupon.discountType === 'percentage' ? `${appliedCoupon.discountValue}% off` : `${appliedCoupon.discountValue.toLocaleString('vi-VN')}đ off`}`}
                  color="success"
                  onDelete={handleRemoveCoupon}
                />
                <Typography variant="body2" sx={{ ml: 'auto', fontWeight: 600, color: 'success.dark' }}>
                  -{appliedCoupon.discountAmount.toLocaleString('vi-VN')}đ
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

        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>Order Summary</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {mockCart.map((item) => (
                <Box key={item.productId} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">
                    {item.name} x{item.quantity}
                  </Typography>
                  <Typography variant="body2">
                    {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                  </Typography>
                </Box>
              ))}

              <Divider sx={{ my: 1 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Subtotal</Typography>
                <Typography variant="body2">{subtotal.toLocaleString('vi-VN')}đ</Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Shipping</Typography>
                <Typography variant="body2">{shipping.toLocaleString('vi-VN')}đ</Typography>
              </Box>

              {appliedCoupon && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', color: 'success.main' }}>
                  <Typography variant="body2">Discount ({appliedCoupon.code})</Typography>
                  <Typography variant="body2">-{appliedCoupon.discountAmount.toLocaleString('vi-VN')}đ</Typography>
                </Box>
              )}

              <Divider sx={{ my: 1 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Total</Typography>
                <Typography variant="h6" color="primary">
                  {total.toLocaleString('vi-VN')}đ
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Alert severity="info" sx={{ mt: 1 }}>
          Payment will be processed via VNPAY secure gateway. You will be redirected to complete payment.
        </Alert>

        <Button
          variant="contained"
          size="large"
          fullWidth
          onClick={handleCheckout}
          disabled={!appliedCoupon}
          sx={{ py: 1.5 }}
        >
          Proceed to VNPAY Payment
        </Button>

        {!appliedCoupon && (
          <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
            Please apply a coupon to proceed to checkout
          </Typography>
        )}
      </Box>
    </Container>
  );
}
