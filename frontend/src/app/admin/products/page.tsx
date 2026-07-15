/**
 * Product management page - admin interface for CRUD operations.
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
  Paper,
  InputAdornment,
} from '@mui/material';
import { Edit, Delete, Add, Upload, Search as SearchIcon } from '@mui/icons-material';
import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

type ProductStatus = 'draft' | 'active' | 'inactive' | 'archived';

type ProductImage = {
  id?: number;
  productId?: number;
  imageUrl: string;
  altText?: string;
  isPrimary?: boolean;
};

type Product = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compareAtPrice: number | null;
  sku: string | null;
  categoryId: number;
  status: ProductStatus;
  images: ProductImage[];
  stockQuantity: number;
};

type Category = {
  id: number;
  name: string;
};

const emptyFormData: Partial<Product> & { images: ProductImage[] } = {
  name: '',
  slug: '',
  description: '',
  price: 0,
  sku: '',
  categoryId: 0,
  status: 'draft',
  images: [],
  stockQuantity: 0,
};

export default function ProductsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> & { images: ProductImage[] }>(emptyFormData);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [formError, setFormError] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deleteError, setDeleteError] = useState('');

  const queryClient = useQueryClient();

  const { data: productsData, isLoading: productsLoading, error } = useQuery({
    queryKey: ['admin-products', searchQuery, statusFilter, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        skip: String(page * 20),
        limit: '20',
      });
      if (searchQuery) params.set('search', searchQuery);
      if (statusFilter) params.set('status', statusFilter);
      const res = await fetch(`/api/admin/products?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch products');
      return res.json();
    },
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories-dropdown'],
    queryFn: async () => {
      const res = await fetch('/api/categories');
      if (!res.ok) throw new Error('Failed to fetch categories');
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (product: typeof emptyFormData) => {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setDialogOpen(false);
      setEditingProduct(emptyFormData);
      setFormError('');
    },
    onError: (err: Error) => setFormError(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: async (product: { id: number } & typeof emptyFormData) => {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setDialogOpen(false);
      setEditingProduct(emptyFormData);
      setFormError('');
    },
    onError: (err: Error) => setFormError(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setDeleteId(null);
      setDeleteError('');
    },
    onError: (err: Error) => setDeleteError(err.message),
  });

  const handleEdit = (product: Product) => {
    setEditingProduct({
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.price,
      compareAtPrice: product.compareAtPrice ?? undefined,
      sku: product.sku ?? '',
      categoryId: product.categoryId,
      status: product.status,
      images: product.images,
      stockQuantity: product.stockQuantity,
    });
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingProduct(emptyFormData);
    setDialogOpen(true);
    setFormError('');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!editingProduct.name?.trim() || !editingProduct.slug?.trim() || editingProduct.price == null || !editingProduct.sku?.trim() || !editingProduct.categoryId) {
      setFormError('Please fill in all required fields and select a category.');
      return;
    }

    const productData = {
      name: editingProduct.name,
      slug: editingProduct.slug,
      description: editingProduct.description || '',
      price: editingProduct.price,
      compareAtPrice: editingProduct.compareAtPrice || null,
      sku: editingProduct.sku,
      categoryId: editingProduct.categoryId,
      images: editingProduct.images,
      stockQuantity: editingProduct.stockQuantity || 0,
      status: editingProduct.status || 'draft',
    };

    if (editingProduct.id) {
      updateMutation.mutate({ ...productData, id: editingProduct.id });
    } else {
      createMutation.mutate(productData);
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

  const addImage = () => {
    if (imageUrlInput.trim()) {
      setEditingProduct({
        ...editingProduct,
        images: [
          ...(editingProduct.images || []),
          { imageUrl: imageUrlInput.trim(), altText: '', isPrimary: (editingProduct.images || []).length === 0 },
        ],
      });
      setImageUrlInput('');
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...(editingProduct.images || [])];
    newImages.splice(index, 1);
    setEditingProduct({ ...editingProduct, images: newImages });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setEditingProduct({
        ...editingProduct,
        images: [
          ...(editingProduct.images || []),
          { imageUrl: data.url, altText: '', isPrimary: (editingProduct.images || []).length === 0 },
        ],
      });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const products = productsData?.data ?? [];
  const total = productsData?.total ?? 0;
  const categories: Category[] = categoriesData?.data ?? [];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h4">Products</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={handleAdd}>
          Add Product
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          label="Search products..."
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
          size="small"
          sx={{ minWidth: 300 }}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select value={statusFilter} label="Status" onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}>
            <MenuItem value="">All</MenuItem>
            <MenuItem value="draft">Draft</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
            <MenuItem value="archived">Archived</MenuItem>
          </Select>
        </FormControl>
      </Box>

          {error && <Alert severity="error">Failed to load products.</Alert>}

      {productsLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
      ) : products.length === 0 ? (
        <Alert severity="info">No products found.</Alert>
      ) : (
        <Box>
          {/* Desktop Table View */}
          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
            <Paper>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>SKU</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Stock</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {products.map((product: Product) => (
                    <TableRow key={product.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {product.images?.[0]?.imageUrl && (
                            <Box component="img" src={product.images[0].imageUrl} sx={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 1 }} />
                          )}
                          {product.name}
                        </Box>
                      </TableCell>
                      <TableCell>{product.sku ?? '-'}</TableCell>
                      <TableCell>R{Number(product.price).toFixed(2)}</TableCell>
                      <TableCell>
                        {categories.find((c: Category) => c.id === product.categoryId)?.name ?? '-'}
                      </TableCell>
                      <TableCell>{product.stockQuantity ?? '-'}</TableCell>
                      <TableCell>
                        <Chip
                          label={product.status}
                          color={product.status === 'active' ? 'success' : product.status === 'draft' ? 'default' : product.status === 'inactive' ? 'warning' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleEdit(product)}>
                          <Edit />
                        </IconButton>
                        <IconButton onClick={() => handleDelete(product.id)} color="error">
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          </Box>

          {/* Mobile Card View */}
          <Box sx={{ display: { xs: 'block', md: 'none' } }}>
            {products.map((product: Product) => (
              <Paper
                key={product.id}
                sx={{ mb: 2, p: 2, cursor: 'pointer' }}
                onClick={() => handleEdit(product)}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  {product.images?.[0]?.imageUrl && (
                    <Box component="img" src={product.images[0].imageUrl} sx={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 2 }} />
                  )}
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle1" noWrap sx={{ fontWeight: 600 }}>{product.name}</Typography>
                    <Typography variant="body2" color="text.secondary">SKU: {product.sku || '-'}</Typography>
                  </Box>
                  <Chip
                    label={product.status}
                    size="small"
                    color={product.status === 'active' ? 'success' : product.status === 'draft' ? 'default' : product.status === 'inactive' ? 'warning' : 'error'}
                  />
                </Box>
                <Box sx={{ mt: 2, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Price</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>R{Number(product.price).toFixed(2)}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Stock</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{product.stockQuantity ?? '-'}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Category</Typography>
                    <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>{categories.find((c: Category) => c.id === product.categoryId)?.name || '-'}</Typography>
                  </Box>
                </Box>
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                  <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleEdit(product); }}>
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); handleDelete(product.id); }}>
                    <Delete fontSize="small" />
                  </IconButton>
                </Box>
              </Paper>
            ))}
          </Box>
        </Box>
      )}

      {total > 20 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3 }}>
          <Button disabled={page === 0} onClick={() => setPage(p => Math.max(0, p - 1))}>
            Previous
          </Button>
          <Typography sx={{ alignSelf: 'center' }}>
            Page {page + 1} of {Math.ceil(total / 20)}
          </Typography>
          <Button disabled={page >= Math.ceil(total / 20) - 1} onClick={() => setPage(p => p + 1)}>
            Next
          </Button>
        </Box>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <form onSubmit={handleSave}>
          <DialogTitle>{editingProduct.id ? 'Edit Product' : 'Add Product'}</DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Name"
                  value={editingProduct.name ?? ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  fullWidth
                  required
                />
                <TextField
                  label="Slug"
                  value={editingProduct.slug ?? ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, slug: e.target.value })}
                  fullWidth
                  required
                  helperText="URL-friendly slug"
                />
              </Box>

              <TextField
                label="Description"
                value={editingProduct.description ?? ''}
                onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                fullWidth
                multiline
                rows={3}
              />

              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Price"
                  type="number"
                  value={editingProduct.price ?? ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                  fullWidth
                  required
                  slotProps={{ input: { startAdornment: <InputAdornment position="start">R</InputAdornment> } }}
                />
                <TextField
                  label="Compare At Price"
                  type="number"
                  value={editingProduct.compareAtPrice ?? ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, compareAtPrice: e.target.value ? Number(e.target.value) : null })}
                  fullWidth
                  slotProps={{ input: { startAdornment: <InputAdornment position="start">R</InputAdornment> } }}
                />
              </Box>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="SKU"
                  value={editingProduct.sku ?? ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                  fullWidth
                  required
                />
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={editingProduct.categoryId || ''}
                    label="Category"
                    onChange={(e) => setEditingProduct({ ...editingProduct, categoryId: e.target.value ? Number(e.target.value) : 0 })}
                    required
                  >
                    <MenuItem value="">Select a category</MenuItem>
                    {categories.map((c: Category) => (
                      <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <TextField
                label="Stock Quantity"
                type="number"
                value={editingProduct.stockQuantity ?? ''}
                onChange={(e) => setEditingProduct({ ...editingProduct, stockQuantity: Number(e.target.value) })}
                fullWidth
              />

              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={editingProduct.status ?? 'draft'}
                  label="Status"
                  onChange={(e) => setEditingProduct({ ...editingProduct, status: e.target.value as ProductStatus })}
                >
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="archived">Archived</MenuItem>
                </Select>
              </FormControl>

              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Images</Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <TextField
                    label="Image URL"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    fullWidth
                    size="small"
                    placeholder="https://example.com/image.jpg"
                  />
                  <Button type="button" variant="outlined" onClick={addImage} disabled={!imageUrlInput.trim()}>
                    <Add />
                  </Button>
                </Box>
                <Box sx={{ mb: 1 }}>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleFileChange}
                  />
                  <Button
                    type="button"
                    variant="outlined"
                    startIcon={<Upload />}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    {uploading ? 'Uploading…' : 'Upload from device'}
                  </Button>
                </Box>
                {editingProduct.images && editingProduct.images.length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {editingProduct.images.map((img, idx) => (
                      <Box key={idx} sx={{ position: 'relative', width: 60, height: 60 }}>
                        <Box component="img" src={img.imageUrl} sx={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 1 }} />
                        <IconButton
                          size="small"
                          sx={{ position: 'absolute', top: -8, right: -8, bgcolor: 'error.main', color: 'white', width: 20, height: 20 }}
                          type="button"
                          onClick={() => removeImage(idx)}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button type="button" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={createMutation.isPending || updateMutation.isPending}>
              {editingProduct.id ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog open={!!deleteId} onClose={() => { setDeleteId(null); setDeleteError(''); }}>
        <DialogTitle>Delete Product?</DialogTitle>
        <DialogContent>
          {deleteError && <Alert severity="error" sx={{ mb: 2 }}>{deleteError}</Alert>}
          <Typography>This will permanently delete the product and cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setDeleteId(null); setDeleteError(''); }}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained" disabled={deleteMutation.isPending}>
            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}