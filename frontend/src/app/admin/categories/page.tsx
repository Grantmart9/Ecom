/**
 * Category management page - admin interface for CRUD operations.
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
  Alert,
} from '@mui/material';
import { Edit, Delete, Add, Upload } from '@mui/icons-material';
import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

type CategoryStatus = 'active' | 'inactive' | 'archived';

type Category = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  parentId: number | null;
  image: string | null;
  icon: string | null;
  status: CategoryStatus;
  sortOrder: number | null;
  createdAt: string;
  updatedAt: string;
};

const emptyFormData = {
  name: '',
  slug: '',
  description: '',
  parentId: null as number | null,
  image: '',
  status: 'active' as CategoryStatus,
  sortOrder: 0,
};

export default function CategoriesPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [formError, setFormError] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['categories-admin'],
    queryFn: async () => {
      const res = await fetch('/api/categories');
      if (!res.ok) throw new Error('Failed to fetch categories');
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (category: typeof emptyFormData) => {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(category),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories-admin'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setDialogOpen(false);
      setEditingCategory(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (category: { id: number } & typeof emptyFormData) => {
      const res = await fetch(`/api/categories/${category.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(category),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories-admin'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setDialogOpen(false);
      setEditingCategory(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(await res.text());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories-admin'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setDeleteId(null);
    },
  });

  const handleEdit = (category: Category) => {
    setEditingCategory({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      parentId: category.parentId,
      image: category.image,
      status: category.status,
      sortOrder: category.sortOrder,
    });
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingCategory(emptyFormData);
    setDialogOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;

    if (editingCategory.id) {
      updateMutation.mutate(editingCategory as { id: number } & typeof emptyFormData);
    } else {
      createMutation.mutate(editingCategory as typeof emptyFormData);
    }
  };

  const handleDelete = (id: number) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setFormError('');
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      if (!res.ok) throw new Error((await res.json())?.detail ?? 'Upload failed');
      const data = await res.json();
      setEditingCategory((c) => c && { ...c, image: data.url });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const getParentName = (parentId: number | null) => {
    return data?.data?.find((c: Category) => c.id === parentId)?.name || '-';
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Categories</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={handleAdd}>
          Add Category
        </Button>
      </Box>

      {isLoading ? (
        <Typography>Loading...</Typography>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Slug</TableCell>
              <TableCell>Parent</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Sort Order</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.data?.map((category: Category) => (
              <TableRow key={category.id}>
                <TableCell>{category.name}</TableCell>
                <TableCell>{category.slug}</TableCell>
                <TableCell>{getParentName(category.parentId)}</TableCell>
                <TableCell>
                  <Chip
                    label={category.status}
                    color={category.status === 'active' ? 'success' : category.status === 'inactive' ? 'warning' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>{category.sortOrder}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleEdit(category)}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(category.id)} color="error">
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Edit/Add Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleSave}>
          <DialogTitle>{editingCategory?.id ? 'Edit Category' : 'Add Category'}</DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
            <TextField
              label="Name"
              value={editingCategory?.name ?? ''}
              onChange={(e) => setEditingCategory((c) => c && { ...c, name: e.target.value })}
              fullWidth
              required
              margin="dense"
            />
            <TextField
              label="Slug"
              value={editingCategory?.slug ?? ''}
              onChange={(e) => setEditingCategory((c) => c && { ...c, slug: e.target.value })}
              fullWidth
              required
              margin="dense"
              helperText="URL-friendly slug (e.g., 'electronics', 'clothing-men')"
            />
            <TextField
              label="Description"
              value={editingCategory?.description ?? ''}
              onChange={(e) => setEditingCategory((c) => c && { ...c, description: e.target.value })}
              fullWidth
              multiline
              rows={3}
              margin="dense"
            />
            <Box sx={{ mb: 1 }}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <TextField
                  label="Image URL"
                  value={editingCategory?.image ?? ''}
                  onChange={(e) => setEditingCategory((c) => c && { ...c, image: e.target.value })}
                  fullWidth
                  margin="dense"
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleImageUpload}
                />
                <Button
                  type="button"
                  variant="outlined"
                  startIcon={<Upload />}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  sx={{ mt: 1, whiteSpace: 'nowrap' }}
                >
                  {uploading ? 'Uploading…' : 'Upload'}
                </Button>
              </Box>
              {editingCategory?.image && (
                <Box
                  component="img"
                  src={editingCategory.image}
                  sx={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 1, mt: 1 }}
                />
              )}
            </Box>
            <TextField
              label="Sort Order"
              type="number"
              value={editingCategory?.sortOrder ?? 0}
              onChange={(e) => setEditingCategory((c) => c && { ...c, sortOrder: Number(e.target.value) })}
              fullWidth
              margin="dense"
            />
            <FormControl fullWidth margin="dense">
              <InputLabel>Parent Category</InputLabel>
              <Select
                value={editingCategory?.parentId?.toString() ?? ''}
                label="Parent Category"
                onChange={(e) =>
                  setEditingCategory((c) => c && { ...c, parentId: e.target.value ? Number(e.target.value) : null })
                }
              >
                <MenuItem value="">None (Top-level)</MenuItem>
                {data?.data
                  ?.filter((c: Category) => c.id !== editingCategory?.id)
                  .map((c: Category) => (
                    <MenuItem key={c.id} value={c.id.toString()}>
                      {c.name}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="dense">
              <InputLabel>Status</InputLabel>
              <Select
                value={editingCategory?.status ?? 'active'}
                label="Status"
                onChange={(e) => setEditingCategory((c) => c && { ...c, status: e.target.value as CategoryStatus })}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="archived">Archived</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button type="button" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingCategory?.id ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>Delete Category?</DialogTitle>
        <DialogContent>
          <Typography>This action cannot be undone. Products in this category will need reassignment.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}