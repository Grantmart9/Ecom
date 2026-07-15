'use client';

import { motion } from 'framer-motion';
import { Card, CardMedia, CardContent, Typography, Box } from '@mui/material';
import Link from 'next/link';

interface ProductCardProps {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  images?: { imageUrl: string; altText?: string | null }[];
}

export default function ProductCard({ id, name, description, price, images }: ProductCardProps) {
  const image = images?.[0];
  const imageUrl = image?.imageUrl;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card
        component={Link}
        href={`/shop/${id}`}
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
        {imageUrl ? (
          <CardMedia
            component="img"
            height="180"
            image={imageUrl}
            alt={image?.altText ?? name}
            sx={{ objectFit: 'contain' }}
          />
        ) : (
          <Box sx={{ height: 180, bgcolor: 'grey.200', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography>No Image</Typography>
          </Box>
        )}
        <CardContent>
          <Typography variant="h6" sx={{ mb: 1 }}>
            {name}
          </Typography>
          {description && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {description}
            </Typography>
          )}
          <Typography variant="h5" sx={{ mb: 2 }}>
            R{price.toFixed(2)}
          </Typography>
        </CardContent>
      </Card>
    </motion.div>
  );
}
