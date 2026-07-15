'use client';

import { useQuery } from '@tanstack/react-query';
import { Box, TextField, FormControl, InputLabel, Select, MenuItem, InputAdornment } from '@mui/material';
import { Search } from '@mui/icons-material';

const API_URL_BASE = '/api';

type Category = {
  id: number;
  name: string;
  slug: string;
  status: string;
};

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedCategory: number | null;
  onCategoryChange: (value: number | null) => void;
}

export default function FilterBar({ searchQuery, onSearchChange, selectedCategory, onCategoryChange }: FilterBarProps) {
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await fetch(`${API_URL_BASE}/categories`);
      if (!res.ok) throw new Error('Failed to fetch categories');
      return res.json();
    },
  });

  const categories = categoriesData?.data ?? [];

  return (
    <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
      <TextField
        placeholder="Search products..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
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
          onChange={(e) => onCategoryChange(e.target.value ? Number(e.target.value) : null)}
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
  );
}
