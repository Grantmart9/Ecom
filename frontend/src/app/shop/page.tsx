/**
 * Shop page - displays a grid of products fetched from the API.
 * Uses client-side data fetching with React hooks and framer-motion for animations.
 */
'use client'

import { useState } from "react"
import { useQuery } from '@tanstack/react-query'
import PageShell from "@/components/page/PageShell"
import ProductCard from "@/components/page/ProductCard"
import FilterBar from "@/components/page/FilterBar"
import { Box, Typography } from "@mui/material"

type ProductImage = {
  id: number;
  productId: number;
  imageUrl: string;
  altText: string | null;
  isPrimary: boolean;
  sortOrder: number | null;
};

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

const API_URL_BASE = '/api';

export default function Shop() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['products', { search: searchQuery, categoryId: selectedCategory }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);
      if (selectedCategory) params.set('categoryId', String(selectedCategory));
      
      const res = await fetch(`${API_URL_BASE}/products?${params.toString()}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(`Products ${res.status}: ${body.detail || res.statusText}`);
      }
      return res.json();
    },
  });

  const products = data?.data ?? [];

  return (
    <PageShell maxWidth backHref="/">
      <Box sx={{ textAlign: 'center', maxWidth: 640, width: '100%', mb: 2 }}>
        <Typography variant="h4">Shop</Typography>
      </Box>
      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      {isLoading && (
        <Typography>Loading products...</Typography>
      )}

      {error && (
        <Typography color="error.main">{String(error)}</Typography>
      )}

      {!isLoading && products.length > 0 && (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 4 }}>
          {products.map((p: Product) => (
            <ProductCard
              key={p.id}
              id={p.id}
              name={p.name}
              description={p.description}
              price={p.price}
              images={p.images}
            />
          ))}
        </Box>
      )}

      {!isLoading && products.length === 0 && !error && (
        <Typography>No products found.</Typography>
      )}
    </PageShell>
  );
}
