'use client';

import { Container, Box, Typography, Table, TableHead, TableBody, TableRow, TableCell, Chip, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions, Tabs, Tab, CircularProgress } from '@mui/material';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

type InventoryItem = {
  id: number;
  quantity: number;
  reservedQuantity: number;
  lowStockThreshold: number | null;
  product: { id: number; name: string; sku: string | null };
  isLowStock: boolean;
};

type MovementRow = {
  id: number;
  productId: number;
  quantityChange: number;
  movementType: string;
  referenceType: string | null;
  referenceId: string | null;
  notes: string | null;
  createdAt: string;
  productName: string | null;
  productSku: string | null;
};

function MovementChip({ type }: { type: string }) {
  const colorMap: Record<string, 'default' | 'success' | 'error' | 'warning' | 'info'> = {
    manual_adjustment: 'default',
    order_fulfilled: 'error',
    order_cancelled: 'info',
    restock: 'success',
    return: 'warning',
    initial_stock: 'default',
    reservation: 'info',
  };
  return <Chip label={type.replace(/_/g, ' ')} size="small" color={colorMap[type] ?? 'default'} variant="outlined" />;
}

function StockChangeCell({ change }: { change: number }) {
  const signed = change > 0 ? `+${change}` : `${change}`;
  const color = change > 0 ? 'success.main' : change < 0 ? 'error.main' : 'text.primary';
  return <TableCell sx={{ color }}>{signed}</TableCell>;
}

export default function InventoryPage() {
  const [tab, setTab] = useState(0);
  const [adjustDialog, setAdjustDialog] = useState<{ open: boolean; product: InventoryItem | null }>({
    open: false,
    product: null,
  });
  const [adjustQty, setAdjustQty] = useState(0);
  const [adjustNotes, setAdjustNotes] = useState('');
  const [movementsFilter, setMovementsFilter] = useState('');
  const [movementsLimit] = useState(100);

  const queryClient = useQueryClient();

  const { data, isLoading: inventoryLoading } = useQuery({
    queryKey: ['inventory'],
    queryFn: async () => {
      const res = await fetch('/api/inventory');
      if (!res.ok) throw new Error('Failed to fetch inventory');
      return res.json();
    },
  });

  const { data: movementsData, isLoading: movementsLoading } = useQuery({
    queryKey: ['inventory-movements', movementsFilter, movementsLimit],
    queryFn: async () => {
      const url = movementsFilter
        ? `/api/inventory/movements?productId=${movementsFilter}&limit=${movementsLimit}`
        : `/api/inventory/movements?limit=${movementsLimit}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch movements');
      return res.json();
    },
  });

  const adjustMutation = useMutation({
    mutationFn: async (payload: {
      productId: number;
      quantityChange: number;
      movementType: string;
      notes?: string;
    }) => {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-movements'] });
      setAdjustDialog({ open: false, product: null });
      setAdjustQty(0);
      setAdjustNotes('');
    },
  });

  const inventory = data?.data ?? [];
  const lowStockCount = data?.lowStockCount ?? 0;
  const movements = movementsData?.data ?? [];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h4">Inventory Management</Typography>
        <Chip label={`${lowStockCount} items low stock`} color={lowStockCount > 0 ? 'warning' : 'success'} sx={{ mt: 1 }} />
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="Stock Levels" />
          <Tab label="Movement History" />
        </Tabs>
      </Box>

      {tab === 0 && (
        inventoryLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
        ) : inventory.length === 0 ? (
          <Typography color="text.secondary">No inventory records found.</Typography>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Product</TableCell>
                <TableCell>SKU</TableCell>
                <TableCell>Current Stock</TableCell>
                <TableCell>Reserved</TableCell>
                <TableCell>Available</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {inventory.map((item: InventoryItem) => (
                <TableRow key={item.id}>
                  <TableCell>{item.product.name}</TableCell>
                  <TableCell>{item.product.sku ?? '-'}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{item.reservedQuantity}</TableCell>
                  <TableCell>{item.quantity - item.reservedQuantity}</TableCell>
                  <TableCell>
                    {item.isLowStock && <Chip label="Low Stock" color="warning" size="small" />}
                  </TableCell>
                  <TableCell>
                    <Button size="small" variant="outlined" onClick={() => {
                      setAdjustDialog({ open: true, product: item });
                      setAdjustQty(0);
                      setAdjustNotes('');
                    }}>Adjust</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )
      )}

      {tab === 1 && (
        <Box>
          <Box sx={{ mb: 2 }}>
            <TextField
              label="Filter by Product ID"
              type="number"
              size="small"
              value={movementsFilter}
              onChange={(e) => setMovementsFilter(e.target.value)}
              sx={{ width: 200 }}
              placeholder="productId"
            />
          </Box>
          {movementsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
          ) : movements.length === 0 ? (
            <Typography color="text.secondary">No movement records found.</Typography>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Product</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Change</TableCell>
                  <TableCell>Reference</TableCell>
                  <TableCell>Notes</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {movements.map((m: MovementRow) => (
                  <TableRow key={m.id}>
                    <TableCell>{new Date(m.createdAt).toLocaleString()}</TableCell>
                    <TableCell>{m.productName ?? 'Unknown'} {m.productSku ? `(${m.productSku})` : ''}</TableCell>
                    <TableCell><MovementChip type={m.movementType} /></TableCell>
                    <StockChangeCell change={m.quantityChange} />
                    <TableCell>{m.referenceType && !m.referenceId ? m.referenceType : `${m.referenceType ?? ''} ${m.referenceId ?? ''}`.trim() || '-'}</TableCell>
                    <TableCell sx={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.notes ?? '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Box>
      )}

      {/* Adjust Stock Dialog */}
      <Dialog open={adjustDialog.open} onClose={() => setAdjustDialog({ open: false, product: null })}>
        <DialogTitle>Adjust Stock: {adjustDialog.product?.product.name}</DialogTitle>
        <DialogContent>
          <TextField
            label="Quantity Change"
            type="number"
            value={adjustQty}
            onChange={(e) => setAdjustQty(Number(e.target.value))}
            fullWidth
            margin="dense"
            helperText="Positive to add, negative to subtract"
          />
          <TextField
            label="Notes"
            value={adjustNotes}
            onChange={(e) => setAdjustNotes(e.target.value)}
            fullWidth
            margin="dense"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAdjustDialog({ open: false, product: null })}>Cancel</Button>
          <Button
            onClick={() =>
              adjustMutation.mutate({
                productId: adjustDialog.product!.product.id,
                quantityChange: adjustQty,
                movementType: 'manual_adjustment',
                notes: adjustNotes,
              })
            }
            variant="contained"
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
