'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Box, Container, Typography, Chip } from '@mui/material';
import { NorthEast } from '@mui/icons-material';
import Link from 'next/link';
import MuiLink from '@mui/material/Link';
import { API, BG } from '@/lib/animations';

export type Product = {
  id: number;
  name: string;
  price: number | null;
  availabilityStatus?: string;
  images?: { imageUrl: string }[];
};

export default function Featured() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/products`)
      .then((r) => {
        if (!r.ok) throw new Error(`Products ${r.status}`);
        return r.json();
      })
      .then((data) => setProducts((data?.data ?? []).slice(0, 6)))
      .catch((e) => {
        console.error('[home/products]', e);
        setProducts([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box component="section" sx={{ py: { xs: 8, md: 14 } }}>
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'flex-end' },
            gap: 3,
            mb: { xs: 5, md: 8 },
          }}
        >
          <Box>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '2.2rem', md: '3.5rem' },
                fontWeight: 700,
                letterSpacing: '-0.02em',
                maxWidth: 700,
              }}
            >
              Our product
            </Typography>
          </Box>
        </Box>

        {loading ? (
          <Typography sx={{ color: 'text.secondary', py: 4 }}>Loading products…</Typography>
        ) : products.length === 0 ? (
          <Typography sx={{ color: 'text.secondary', py: 4 }}>
            No products available yet.
          </Typography>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' },
              gap: { xs: 2, md: 3 },
            }}
          >
            {products.map((product, i) => {
              const img = product.images?.[0]?.imageUrl;
              return (
                <Box
                  key={product.id}
                  component={motion.div}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ y: -8 }}
                >
                  <MuiLink component={Link} href="/shop" underline="none">
                    <Box
                      sx={{
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 4,
                        overflow: 'hidden',
                        bgcolor: 'background.paper',
                        transition: 'border-color .3s',
                        '&:hover': { borderColor: 'primary.main' },
                        '&:hover .p-arrow': { opacity: 1, transform: 'translate(0,0)' },
                      }}
                    >
                      <Box
                        sx={{
                          position: 'relative',
                          height: 240,
                          background: img
                            ? `url(${img}) center/cover no-repeat`
                            : 'linear-gradient(135deg, #1b1b22 0%, #101015 100%)',
                        }}
                      >
                        <Box
                          className="p-arrow"
                          sx={{
                            position: 'absolute',
                            top: 16,
                            right: 16,
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            bgcolor: 'primary.main',
                            color: BG,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: 0,
                            transform: 'translate(6px, -6px)',
                            transition: 'opacity .3s, transform .3s',
                          }}
                        >
                          <NorthEast fontSize="small" />
                        </Box>
                      </Box>
                      <Box sx={{ p: 3 }}>
                        <Chip
                          label={product.availabilityStatus || 'Available'}
                          size="small"
                          sx={{
                            mb: 1.5,
                            bgcolor: 'rgba(20,196,196,0.12)',
                            color: 'primary.main',
                            fontSize: '0.7rem',
                            textTransform: 'capitalize',
                          }}
                        />
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5, color: 'text.primary' }}>
                          {product.name}
                        </Typography>
                        <Typography sx={{ fontWeight: 700, fontSize: '1.3rem', color: 'text.primary' }}>
                          ${Number(product.price ?? 0).toFixed(2)}
                        </Typography>
                      </Box>
                    </Box>
                  </MuiLink>
                </Box>
              );
            })}
          </Box>
        )}
      </Container>
    </Box>
  );
}
