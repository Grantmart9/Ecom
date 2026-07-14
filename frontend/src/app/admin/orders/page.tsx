'use client';

import { Container, Box, Typography, Table, TableHead, TableBody, TableRow, TableCell, Chip, Button, TextField, CircularProgress, Alert, Select, MenuItem, FormControl, InputLabel, Snackbar } from '@mui/material';
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

export default function AdminOrdersPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [orderNumberFilter, setOrderNumberFilter] = useState('');
  const [page, setPage] = useState(0);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  const pageSize = 20;

  const queryClient = useQueryClient();

  const searchParams = new URLSearchParams();
  searchParams.set('skip', String(page * pageSize));
  searchParams.set('limit', String(pageSize));
  if (statusFilter) searchParams.set('status', statusFilter);
  if (orderNumberFilter.trim()) searchParams.set('orderNumber', orderNumberFilter.trim());

  const queryKey = ['admin-orders', statusFilter, orderNumberFilter, page];

  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: async () => {
      const res = await fetch(`/api/admin/orders?${searchParams.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch orders');
      return res.json();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ orderId, payload }: { orderId: string; payload: { status?: string; adminNotes?: string } }) => {
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
      queryClient.invalidateQueries({ queryKey });
      setSnackbar({ open: true, message: 'Order updated', severity: 'success' });
    },
    onError: (err: Error) => setSnackbar({ open: true, message: err.message, severity: 'error' }),
  });

  const handleStatusChange = (orderId: string, newStatus: string) => {
    updateMutation.mutate({ orderId, payload: { status: newStatus } });
  };

  const orders = data?.orders ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h4">Orders</Typography>
        <Typography variant="body2" color="text.secondary">
          {total} total
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Status</InputLabel>
          <Select value={statusFilter} label="Status" onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}>
            <MenuItem value="">All</MenuItem>
            {STATUS_OPTIONS.map((s) => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label="Order Number"
          value={orderNumberFilter}
          onChange={(e) => { setOrderNumberFilter(e.target.value); setPage(0); }}
          size="small"
          sx={{ minWidth: 220 }}
        />
      </Box>

      {error && <Alert severity="error">Failed to load orders.</Alert>}
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
      )}
      {!isLoading && orders.length === 0 && (
        <Alert severity="info">No orders found.</Alert>
      )}

      {!isLoading && orders.length > 0 && (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Payment</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Notes</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((o: { id: string; orderNumber: string; createdAt: string | Date; status: string; paymentStatus: string; totalAmount: number | string; adminNotes?: string | null }) => (
              <TableRow key={o.id} hover>
                <TableCell>
                  <Link href={`/admin/orders/${o.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    {o.orderNumber}
                  </Link>
                </TableCell>
                <TableCell>{new Date(o.createdAt).toLocaleString()}</TableCell>
                <TableCell>
                  <Select
                    size="small"
                    value={o.status}
                    label="Status"
                    onChange={(e) => handleStatusChange(o.id, e.target.value)}
                    sx={{ minWidth: 140 }}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <MenuItem key={s} value={s}>{s}</MenuItem>
                    ))}
                  </Select>
                </TableCell>
                <TableCell>
                  <Chip label={o.paymentStatus} size="small" color={o.paymentStatus === 'completed' ? 'success' : o.paymentStatus === 'failed' ? 'error' : 'default'} variant="outlined" />
                </TableCell>
                <TableCell>{Number(o.totalAmount).toLocaleString()}</TableCell>
                <TableCell>
                  {o.adminNotes ? (
                    <Box sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.adminNotes}</Box>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell>
                  <Button size="small" component={Link} href={`/admin/orders/${o.id}`} variant="outlined">
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
          <Button variant="outlined" size="small" disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>
            Previous
          </Button>
          <Typography variant="body2" sx={{ alignSelf: 'center' }}>
            Page {page + 1} of {totalPages}
          </Typography>
          <Button variant="outlined" size="small" disabled={page >= totalPages - 1} onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}>
            Next
          </Button>
        </Box>
      )}

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
    </Container>
  );
}
