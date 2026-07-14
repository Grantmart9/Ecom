'use client';

import { Container, Box, Typography, Table, TableHead, TableBody, TableRow, TableCell, Chip, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, TextField, Select, MenuItem, FormControl, InputLabel, CircularProgress, Alert, Snackbar } from '@mui/material';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import StarIcon from '@mui/icons-material/Star';
import AddIcon from '@mui/icons-material/Add';

type Address = {
  id: number;
  userId: number;
  type: string;
  firstName: string;
  lastName: string;
  company: string | null;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

type FormState = {
  userId: string;
  type: 'billing' | 'shipping' | 'both';
  firstName: string;
  lastName: string;
  company: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
};

export default function AddressesPage() {
  const [userIdFilter, setUserIdFilter] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const emptyForm: FormState = {
    userId: '',
    type: 'both',
    firstName: '',
    lastName: '',
    company: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    phone: '',
    isDefault: false,
  };
  const [form, setForm] = useState<FormState>(emptyForm);

  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['addresses', userIdFilter],
    queryFn: async () => {
      if (!userIdFilter) return { data: [] as Address[], total: 0 };
      const res = await fetch(`/api/addresses?userId=${userIdFilter}`);
      if (!res.ok) throw new Error('Failed to fetch addresses');
      return res.json();
    },
    enabled: !!userIdFilter,
  });

  type CreatePayload = {
    userId: number;
    type: FormState['type'];
    firstName: string;
    lastName: string;
    company?: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone?: string;
    isDefault: boolean;
  };

  const buildPayload = (f: FormState): CreatePayload => ({
    userId: Number(f.userId),
    type: f.type,
    firstName: f.firstName,
    lastName: f.lastName,
    company: f.company || undefined,
    addressLine1: f.addressLine1,
    addressLine2: f.addressLine2 || undefined,
    city: f.city,
    state: f.state,
    postalCode: f.postalCode,
    country: f.country,
    phone: f.phone || undefined,
    isDefault: f.isDefault,
  });

  const createMutation = useMutation({
    mutationFn: async (payload: CreatePayload) => {
      const res = await fetch('/api/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Failed to create address');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      setDialogOpen(false);
      setForm(emptyForm);
      setEditingId(null);
      setSnackbar({ open: true, message: 'Address created successfully', severity: 'success' });
    },
    onError: (err: Error) => setSnackbar({ open: true, message: err.message, severity: 'error' }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: Partial<CreatePayload> }) => {
      const res = await fetch(`/api/addresses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Failed to update address');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      setDialogOpen(false);
      setForm(emptyForm);
      setEditingId(null);
      setSnackbar({ open: true, message: 'Address updated successfully', severity: 'success' });
    },
    onError: (err: Error) => setSnackbar({ open: true, message: err.message, severity: 'error' }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/addresses/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Failed to delete address');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      setDeleteConfirmId(null);
      setSnackbar({ open: true, message: 'Address deleted', severity: 'success' });
    },
    onError: (err: Error) => setSnackbar({ open: true, message: err.message, severity: 'error' }),
  });

  const handleSubmit = () => {
    if (!form.userId || !form.firstName || !form.lastName || !form.addressLine1 || !form.city || !form.state || !form.postalCode || !form.country) {
      setSnackbar({ open: true, message: 'Please fill in all required fields', severity: 'error' });
      return;
    }

    const payload = buildPayload(form);

    if (editingId) {
      updateMutation.mutate({ id: editingId, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const addresses: Address[] = data?.data ?? [];

  const typeColor: Record<string, 'default' | 'primary' | 'secondary'> = {
    billing: 'primary',
    shipping: 'secondary',
    both: 'default',
  };

  const startEdit = (addr: Address) => {
    setEditingId(addr.id);
    setForm({
      userId: String(addr.userId),
      type: addr.type as FormState['type'],
      firstName: addr.firstName,
      lastName: addr.lastName,
      company: addr.company ?? '',
      addressLine1: addr.addressLine1,
      addressLine2: addr.addressLine2 ?? '',
      city: addr.city,
      state: addr.state,
      postalCode: addr.postalCode,
      country: addr.country,
      phone: addr.phone ?? '',
      isDefault: addr.isDefault,
    });
    setDialogOpen(true);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h4">Address Management</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setForm(emptyForm); setEditingId(null); setDialogOpen(true); }} disabled={!userIdFilter}>
          Add Address
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <TextField
          label="Filter by User ID"
          type="number"
          value={userIdFilter}
          onChange={(e) => setUserIdFilter(e.target.value)}
          sx={{ width: 200 }}
          helperText="Enter a user ID to view their addresses"
        />
      </Box>

      {error && <Alert severity="error">Error loading addresses</Alert>}

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
      ) : !userIdFilter ? (
        <Alert severity="info">Please enter a user ID to load addresses.</Alert>
      ) : addresses.length === 0 ? (
        <Alert severity="info">No addresses found for this user.</Alert>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Type</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Address</TableCell>
              <TableCell>City, State, Postal</TableCell>
              <TableCell>Country</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Default</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {addresses.map((addr) => (
              <TableRow key={addr.id} hover>
                <TableCell><Chip label={addr.type} size="small" color={typeColor[addr.type] ?? 'default'} variant="outlined" /></TableCell>
                <TableCell>{addr.firstName} {addr.lastName}</TableCell>
                <TableCell>
                  {addr.addressLine1}
                  {addr.addressLine2 && <><br />{addr.addressLine2}</>}
                  {addr.company && <><br /><em>{addr.company}</em></>}
                </TableCell>
                <TableCell>{addr.city}, {addr.state} {addr.postalCode}</TableCell>
                <TableCell>{addr.country}</TableCell>
                <TableCell>{addr.phone ?? '-'}</TableCell>
                <TableCell>
                  {addr.isDefault ? (
                    <Chip icon={<StarIcon sx={{ fontSize: 16 }} />} label="Default" size="small" color="warning" variant="filled" />
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell>
                  <Button size="small" startIcon={<EditIcon />} onClick={() => startEdit(addr)}>Edit</Button>
                  <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => setDeleteConfirmId(addr.id)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={dialogOpen} onClose={() => { setDialogOpen(false); setForm(emptyForm); setEditingId(null); }} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edit Address' : 'Add Address'}</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            {editingId ? 'Update the address details below.' : 'Fill in the address details below. Fields marked with * are required.'}
          </DialogContentText>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <TextField label="User ID *" type="number" value={form.userId} onChange={(e) => setForm({ ...form, userId: e.target.value })} fullWidth size="small" disabled={!!editingId} />
            <FormControl fullWidth size="small">
              <InputLabel>Address Type</InputLabel>
              <Select value={form.type} label="Address Type" onChange={(e) => setForm({ ...form, type: e.target.value as FormState['type'] })}>
                <MenuItem value="both">Both (Billing + Shipping)</MenuItem>
                <MenuItem value="shipping">Shipping Only</MenuItem>
                <MenuItem value="billing">Billing Only</MenuItem>
              </Select>
            </FormControl>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField label="First Name *" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} fullWidth size="small" />
              <TextField label="Last Name *" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} fullWidth size="small" />
            </Box>
            <TextField label="Company (optional)" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} fullWidth size="small" />
            <TextField label="Address Line 1 *" value={form.addressLine1} onChange={(e) => setForm({ ...form, addressLine1: e.target.value })} fullWidth size="small" />
            <TextField label="Address Line 2 (optional)" value={form.addressLine2} onChange={(e) => setForm({ ...form, addressLine2: e.target.value })} fullWidth size="small" />
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField label="City *" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} fullWidth size="small" />
              <TextField label="State *" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} fullWidth size="small" />
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField label="Postal Code *" value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })} fullWidth size="small" />
              <TextField label="Country *" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} fullWidth size="small" />
            </Box>
            <TextField label="Phone (optional)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} fullWidth size="small" />
          </Box>
          <Box sx={{ mt: 2 }}>
            <Button variant={form.isDefault ? 'contained' : 'outlined'} size="small" onClick={() => setForm({ ...form, isDefault: !form.isDefault })}>
              {form.isDefault ? 'Default Address' : 'Set as Default'}
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setDialogOpen(false); setForm(emptyForm); setEditingId(null); }}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={createMutation.isPending || updateMutation.isPending}>
            {editingId ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteConfirmId !== null} onClose={() => setDeleteConfirmId(null)}>
        <DialogTitle>Delete Address</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to delete this address? This action cannot be undone.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmId(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={() => deleteConfirmId && deleteMutation.mutate(deleteConfirmId)} disabled={deleteMutation.isPending}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>{snackbar.message}</Alert>
      </Snackbar>
    </Container>
  );
}
