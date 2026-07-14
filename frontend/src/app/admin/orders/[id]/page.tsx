'use client';

import { Container, Box, Typography, Card, CardContent, Table, TableHead, TableBody, TableRow, TableCell, Chip, Button, TextField, Select, MenuItem, FormControl, InputLabel, Divider, CircularProgress, Alert, Snackbar } from '@mui/material';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';

const STATUS_OPTIONS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'] as const;

const STATUS_COLOR: Record<string, 'default' | 'warning' | 'info' | 'primary' | 'success' | 'error'> = {
  pending: 'default',
  confirmed: 'info',
  processing: 'primary',
  shipped: 'info',
  delivered: 'success',
  cancelled: 'error',
  refunded: 'warning',
};

export default function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [orderId, setOrderId] = useState<string | null>(null);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [shippingCarrier, setShippingCarrier] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  const queryClient = useQueryClient();

  useState(() => {
    params.then((p) => setOrderId(p.id));
  });

  const { data: orderData, isLoading, error } = useQuery({
    queryKey: ['admin-order', orderId],
    queryFn: async () => {
      if (!orderId) return null;
      const res = await fetch(`/api/admin/orders/${orderId}`);
      if (!res.ok) throw new Error('Failed to fetch order');
      return res.json();
    },
    enabled: !!orderId,
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: { status?: string; trackingNumber?: string; shippingCarrier?: string; adminNotes?: string }) => {
      if (!orderId) throw new Error('Order ID missing');
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Failed to update order');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-order', orderId] });
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      setSnackbar({ open: true, message: 'Order updated successfully', severity: 'success' });
    },
    onError: (err: Error) => setSnackbar({ open: true, message: err.message, severity: 'error' }),
  });

  const order = orderData?.order;

  if (!orderId) return null;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 2 }}>
        <Button component={Link} href="/admin/orders" variant="outlined" size="small">
          ← Back to Orders
        </Button>
      </Box>

      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
      )}
      {error && <Alert severity="error">Failed to load order.</Alert>}

      {order && (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Typography variant="h4">Order {order.orderNumber}</Typography>
              <Typography variant="body2" color="text.secondary">
                Created: {new Date(order.createdAt).toLocaleString()}
              </Typography>
            </Box>
            <Chip label={order.status} color={STATUS_COLOR[order.status] ?? 'default'} size="medium" />
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
            <Card sx={{ flex: '1 1 300px', minWidth: 300 }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Order Status</Typography>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={order.status}
                    label="Status"
                    onChange={(e) => updateMutation.mutate({ status: e.target.value })}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <MenuItem key={s} value={s}>{s}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </CardContent>
            </Card>

            <Card sx={{ flex: '1 1 300px', minWidth: 300 }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Shipping</Typography>
                <TextField
                  label="Tracking Number"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  fullWidth
                  size="small"
                  sx={{ mb: 1 }}
                />
                <TextField
                  label="Carrier"
                  value={shippingCarrier}
                  onChange={(e) => setShippingCarrier(e.target.value)}
                  fullWidth
                  size="small"
                />
                <Button
                  size="small"
                  variant="contained"
                  sx={{ mt: 1 }}
                  onClick={() => updateMutation.mutate({ trackingNumber: trackingNumber || undefined, shippingCarrier: shippingCarrier || undefined })}
                  disabled={updateMutation.isPending}
                >
                  Update Shipping
                </Button>
              </CardContent>
            </Card>

            <Card sx={{ flex: '1 1 300px', minWidth: 300 }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Admin Notes</Typography>
                <TextField
                  label="Internal notes for this order"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  fullWidth
                  size="small"
                  multiline
                  minRows={3}
                />
                <Button
                  size="small"
                  variant="contained"
                  sx={{ mt: 1 }}
                  onClick={() => updateMutation.mutate({ adminNotes: adminNotes || undefined })}
                  disabled={updateMutation.isPending}
                >
                  Save Notes
                </Button>
              </CardContent>
            </Card>
          </Box>

          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Order Items</Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell>Qty</TableCell>
                    <TableCell>Unit Price</TableCell>
                    <TableCell>Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(order.items ?? []).map((item: { id: string | number; productName: string; productSku?: string | null; quantity: number; unitPrice: number | string; totalPrice: number | string }) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.productName} {item.productSku ? `(${item.productSku})` : ''}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{Number(item.unitPrice).toLocaleString()}</TableCell>
                      <TableCell>{Number(item.totalPrice).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Totals</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Subtotal</Typography>
                  <Typography variant="body2">{Number(order.subtotal).toLocaleString()}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Shipping</Typography>
                  <Typography variant="body2">{Number(order.shippingAmount).toLocaleString()}</Typography>
                </Box>
                {Number(order.discountAmount) > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', color: 'success.main' }}>
                    <Typography variant="body2">Discount</Typography>
                    <Typography variant="body2">-{Number(order.discountAmount).toLocaleString()}</Typography>
                  </Box>
                )}
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h6">Total</Typography>
                  <Typography variant="h6" color="primary">{Number(order.totalAmount).toLocaleString()}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

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
        </>
      )}
    </Container>
  );
}
