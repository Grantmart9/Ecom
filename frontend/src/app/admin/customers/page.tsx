/**
 * Customer management page - admin interface for viewing customers and their orders.
 */
'use client';

import {
  Container,
  Box,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';

type Customer = {
  id: number;
  email: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  status: string;
  isVerified: boolean;
  totalOrders: number;
  totalSpent: number;
  createdAt: string;
};

type OrderSummary = {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: string;
  createdAt: string;
};

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [detailUserId, setDetailUserId] = useState<number | null>(null);

  const pageSize = 20;
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-customers', searchQuery, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        skip: String(page * pageSize),
        limit: String(pageSize),
      });
      if (searchQuery) params.set('search', searchQuery);
      const res = await fetch(`/api/admin/customers?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch customers');
      return res.json();
    },
  });

  const { data: userOrders } = useQuery({
    queryKey: ['admin-user-orders', detailUserId],
    queryFn: async () => {
      if (!detailUserId) return { orders: [] };
      const res = await fetch(`/api/admin/orders?userId=${detailUserId}&limit=50`);
      if (!res.ok) throw new Error('Failed to fetch orders');
      return res.json();
    },
    enabled: !!detailUserId,
  });

  const customers: Customer[] = data?.data ?? [];
  const total = data?.total ?? 0;

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h4">Customers</Typography>
        <Typography variant="body2" color="text.secondary">
          {total} total
        </Typography>
      </Box>

      <TextField
        label="Search customers by email..."
        value={searchQuery}
        onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
        size="small"
        sx={{ mb: 2, maxWidth: 400 }}
        fullWidth
      />

      {error && <Alert severity="error">Failed to load customers.</Alert>}

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
      ) : customers.length === 0 ? (
        <Alert severity="info">No customers found.</Alert>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Orders</TableCell>
              <TableCell>Total Spent</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Verified</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {customers.map((c: Customer) => (
              <TableRow key={c.id} hover>
                <TableCell>
                  {c.firstName && c.lastName ? `${c.firstName} ${c.lastName}` : c.username}
                </TableCell>
                <TableCell>{c.email}</TableCell>
                <TableCell>{c.totalOrders}</TableCell>
                <TableCell>R{Number(c.totalSpent).toFixed(2)}</TableCell>
                <TableCell>
                  <Chip
                    label={c.status}
                    color={c.status === 'active' ? 'success' : c.status === 'suspended' ? 'warning' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {c.isVerified ? <Chip label="Yes" color="success" size="small" /> : <Chip label="No" size="small" />}
                </TableCell>
                <TableCell>
                  <Button size="small" onClick={() => setDetailUserId(c.id)}>View Orders</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3 }}>
          <Button disabled={page === 0} onClick={() => setPage(p => Math.max(0, p - 1))}>
            Previous
          </Button>
          <Typography sx={{ alignSelf: 'center' }}>
            Page {page + 1} of {totalPages}
          </Typography>
          <Button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
            Next
          </Button>
        </Box>
      )}

      <Dialog open={!!detailUserId} onClose={() => setDetailUserId(null)} maxWidth="lg" fullWidth>
        <DialogTitle>Customer Orders</DialogTitle>
        <DialogContent>
          {userOrders?.orders?.length === 0 ? (
            <Alert severity="info">No orders found for this customer.</Alert>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Order</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {userOrders?.orders?.map((o: OrderSummary) => (
                  <TableRow key={o.id}>
                    <TableCell>
                      <Link href={`/admin/orders/${o.id}`} style={{ textDecoration: 'none' }}>
                        {o.orderNumber}
                      </Link>
                    </TableCell>
                    <TableCell>{new Date(o.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell><Chip label={o.status} size="small" /></TableCell>
                    <TableCell>R{Number(o.totalAmount).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailUserId(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}