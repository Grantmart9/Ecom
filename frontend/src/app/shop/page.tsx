/**
 * Shop page - displays a grid of products fetched from the API.
 * Uses client-side data fetching with React hooks and framer-motion for animations.
 */
'use client'

import Link from "next/link"
import BackButton from "@/components/BackButton"
import React, { useState } from "react"
import { motion } from "framer-motion"
import {
  Container,
  Box,
  Typography,
  Card,
  CardMedia,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
} from "@mui/material"
import { Search } from "@mui/icons-material"
import { useQuery } from '@tanstack/react-query'

// Product image type for API response
type ProductImage = {
  id: number;
  productId: number;
  imageUrl: string;
  altText: string | null;
  isPrimary: boolean;
  sortOrder: number | null;
};

// Product type for API response
type Product = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  compareAtPrice: number | null;
  costPrice: number | null;
  weight: number | null;
  dimensions: string | null;
  sku: string | null;
  barcode: string | null;
  isActive: boolean;
  isFeatured: boolean;
  status: string;
  availabilityStatus: string;
  metaTitle: string | null;
  metaDescription: string | null;
  categoryId: number;
  createdAt: string;
  updatedAt: string;
  images: ProductImage[];
};

type Category = {
  id: number;
  name: string;
  slug: string;
  status: string;
};

const API_URL_BASE = '/api';

export default function Shop() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  // Debounced search
  const debouncedSearch = useDebounce(searchQuery, 300);

  const { data, isLoading, error } = useQuery({
    queryKey: ['products', { search: debouncedSearch, categoryId: selectedCategory }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (selectedCategory) params.set('categoryId', String(selectedCategory));
      
      const res = await fetch(`${API_URL_BASE}/products?${params.toString()}`);
      if (!res.ok) throw new Error(`Products ${res.status}`);
      return res.json();
    },
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await fetch(`${API_URL_BASE}/categories`);
      if (!res.ok) throw new Error('Failed to fetch categories');
      return res.json();
    },
  });

  const products = data?.data ?? [];
  const categories = categoriesData?.data ?? [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Container sx={{ py: 4 }}>
        {/* Page header */}
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
          <BackButton href="/" />
          <Typography variant="h4">Shop</Typography>
        </Box>

        {/* Search and filters */}
        <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ minWidth: 250, flex: 1 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              },
            }}
          />
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Filter by Category</InputLabel>
            <Select<string>
              value={selectedCategory !== null ? String(selectedCategory) : ''}
              label="Filter by Category"
              onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : null)}
            >
              <MenuItem value="">All Categories</MenuItem>
              {categories.map((c: Category) => (
                <MenuItem key={c.id} value={String(c.id)}>
                  {c.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Loading state */}
        {isLoading && (
          <Box component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <Typography>Loading products...</Typography>
          </Box>
        )}

        {/* Error state */}
        {error && (
          <Box component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <Typography color="error.main">Error: {String(error)}</Typography>
          </Box>
        )}

        {/* Products grid */}
        {!isLoading && products.length > 0 && (
          <Box component={motion.div} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 4 }}>
              {products.map((p: Product) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.1 * p.id }}
                >
                  <Card
                    component={Link}
                    href={`/shop/${p.id}`}
                    sx={{
                      minHeight: '100%',
                      cursor: 'pointer',
                      textDecoration: 'none',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform .2s, box-shadow .2s',
                      '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 },
                    }}
                  >
                    {/* Product image or placeholder */}
                    {p.images && p.images.length > 0 ? (
                      <CardMedia
                        component="img"
                        height="180"
                        image={p.images[0].imageUrl}
                        alt={p.images[0].altText ?? p.name}
                        sx={{ objectFit: 'contain' }}
                      />
                    ) : (
                      <Box sx={{ height: 180, bgcolor: 'grey.200', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography>No Image</Typography>
                      </Box>
                    )}

                    {/* Product details */}
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 1 }}>
                        {p.name}
                      </Typography>

                      {p.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {p.description}
                        </Typography>
                      )}

                      {p.price !== undefined && (
                        <Typography variant="h5" sx={{ mb: 2 }}>
                          R{p.price.toFixed(2)}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </Box>
          </Box>
        )}

        {/* Empty state */}
        {!isLoading && products.length === 0 && !error && (
          <Box component={motion.div} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Typography>No products found.</Typography>
          </Box>
        )}
      </Container>
    </motion.div>
  )
}

// Simple debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState<T>(value);

  React.useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debounced;
}