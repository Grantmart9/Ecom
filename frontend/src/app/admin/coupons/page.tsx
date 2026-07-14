/**
 * Coupon management page - admin interface for CRUD operations.
 */
'use client';

import {
  Container,
  Box,
  Typography,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Chip,
  CircularProgress,
  Alert,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Add, Edit, Delete } from '@mui/icons-material';

type Coupon = {
  id: number;
  code: string;
  description: string | null;
  discountType: string;
  discountValue: number;
  minimumPurchase: number;
  maximumUsage: number | null;
  usageCount: number;
  usageLimitPerUser: number;
  startsAt: string | null;
  endsAt: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

const emptyFormData = {
  code: '',
  description: '',
  discountType: 'percentage' as 'percentage' | 'fixed_amount' | 'free_shipping',
  discountValue: 0,
  minimumPurchase: 0,
  maximumUsage: null as number | null,
  usageLimitPerUser: 1,
  startsAt: '',
  endsAt: '',
  isActive: true,
};

export default function CouponsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Partial<Coupon> | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-coupons'],
    queryFn: async () => {
      const res = await fetch('/api/coupons?all=true');
      if (!res.ok) throw new Error('Failed to fetch coupons');
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (coupon: typeof emptyFormData) => {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(coupon),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      setDialogOpen(false);
      setEditingCoupon(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (coupon: { id: number } & typeof emptyFormData) => {
      const res = await fetch(`/api/admin/coupons/${coupon.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(coupon),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      setDialogOpen(false);
      setEditingCoupon(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/coupons/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(await res.text());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
      setDeleteId(null);
    },
  });

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon({
      ...coupon,
      startsAt: coupon.startsAt ? new Date(coupon.startsAt).toISOString().slice(0, 16) : '',
      endsAt: coupon.endsAt ? new Date(coupon.endsAt).toISOString().slice(0, 16) : '',
    });
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingCoupon(emptyFormData);
    setDialogOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCoupon) return;

    const payload = {
      ...editingCoupon,
      code: editingCoupon.code?.toUpperCase() ?? '',
      startsAt: editingCoupon.startsAt ? new Date(editingCoupon.startsAt).toISOString() : null,
      endsAt: editingCoupon.endsAt ? new Date(editingCoupon.endsAt).toISOString() : null,
    };

    if (editingCoupon.id) {
      updateMutation.mutate(payload as { id: number } & typeof emptyFormData);
    } else {
      createMutation.mutate(payload as typeof emptyFormData);
    }
  };

  const coupons: Coupon[] = data?.data ?? [];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h4">Coupons</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={handleAdd}>
          Add Coupon
        </Button>
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
      ) : coupons.length === 0 ? (
        <Alert severity="info">No coupons found.</Alert>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Code</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Value</TableCell>
              <TableCell>Min Purchase</TableCell>
              <TableCell>Usage</TableCell>
              <TableCell>Active</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {coupons.map((coupon: Coupon) => (
              <TableRow key={coupon.id}>
                <TableCell><strong>{coupon.code}</strong></TableCell>
                <TableCell>{coupon.description ?? '-'}</TableCell>
                <TableCell>
                  <Chip
                    label={coupon.discountType === 'percentage' ? 'Percent' : coupon.discountType === 'fixed_amount' ? 'Fixed' : 'Free Ship'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `R${coupon.discountValue}`}
                </TableCell>
                <TableCell>R{coupon.minimumPurchase}</TableCell>
                <TableCell>
                  {coupon.usageCount} / {coupon.maximumUsage ?? '∞'}
                </TableCell>
                <TableCell>
                  <Chip label={coupon.isActive ? 'Yes' : 'No'} color={coupon.isActive ? 'success' : 'default'} size="small" />
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(coupon)}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => setDeleteId(coupon.id)} color="error">
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleSave}>
          <DialogTitle>{editingCoupon?.id ? 'Edit Coupon' : 'Add Coupon'}</DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <TextField
              label="Code"
              value={editingCoupon?.code ?? ''}
              onChange={(e) => setEditingCoupon(c => c && { ...c, code: e.target.value.toUpperCase() })}
              fullWidth
              required
              margin="dense"
            />
            <TextField
              label="Description"
              value={editingCoupon?.description ?? ''}
              onChange={(e) => setEditingCoupon(c => c && { ...c, description: e.target.value })}
              fullWidth
              margin="dense"
            />
            <FormControl fullWidth margin="dense">
              <InputLabel>Discount Type</InputLabel>
              <Select
                value={editingCoupon?.discountType ?? 'percentage'}
                label="Discount Type"
                onChange={(e) => setEditingCoupon(c => c && { ...c, discountType: e.target.value as 'percentage' | 'fixed_amount' | 'free_shipping' })}
              >
                <MenuItem value="percentage">Percentage</MenuItem>
                <MenuItem value="fixed_amount">Fixed Amount</MenuItem>
                <MenuItem value="free_shipping">Free Shipping</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Discount Value"
              type="number"
              value={editingCoupon?.discountValue ?? ''}
              onChange={(e) => setEditingCoupon(c => c && { ...c, discountValue: Number(e.target.value) })}
              fullWidth
              margin="dense"
            />
            <TextField
              label="Minimum Purchase"
              type="number"
              value={editingCoupon?.minimumPurchase ?? ''}
              onChange={(e) => setEditingCoupon(c => c && { ...c, minimumPurchase: Number(e.target.value) })}
              fullWidth
              margin="dense"
            />
            <TextField
              label="Maximum Usage (optional)"
              type="number"
              value={editingCoupon?.maximumUsage ?? ''}
              onChange={(e) => setEditingCoupon(c => c && { ...c, maximumUsage: e.target.value ? Number(e.target.value) : null })}
              fullWidth
              margin="dense"
            />
            <TextField
              label="Usage Limit Per User"
              type="number"
              value={editingCoupon?.usageLimitPerUser ?? ''}
              onChange={(e) => setEditingCoupon(c => c && { ...c, usageLimitPerUser: Number(e.target.value) })}
              fullWidth
              margin="dense"
            />
            <TextField
              label="Starts At"
              type="datetime-local"
              value={editingCoupon?.startsAt ?? ''}
              onChange={(e) => setEditingCoupon(c => c && { ...c, startsAt: e.target.value })}
              fullWidth
              margin="dense"
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              label="Ends At"
              type="datetime-local"
              value={editingCoupon?.endsAt ?? ''}
              onChange={(e) => setEditingCoupon(c => c && { ...c, endsAt: e.target.value })}
              fullWidth
              margin="dense"
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={!!editingCoupon?.isActive}
                  onChange={(e) => setEditingCoupon(c => c && { ...c, isActive: e.target.checked })}
                />
              }
              label="Active"
              sx={{ mt: 1 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingCoupon?.id ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>Delete Coupon?</DialogTitle>
        <DialogContent>
          <Typography>This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button onClick={() => deleteId && deleteMutation.mutate(deleteId)} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}