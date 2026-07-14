'use client'

import BackButton from "@/components/BackButton"
import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Container,
  Box,
  Typography,
  Card,
  CardMedia,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Rating,
  Chip,
  Stack,
  Divider,
  CircularProgress,
  Alert,
  Snackbar,
  IconButton,
} from "@mui/material"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart"
import AddIcon from "@mui/icons-material/Add"
import RemoveIcon from "@mui/icons-material/Remove"
import { useAppDispatch } from "@/lib/hooks"
import { addItem } from "@/lib/cartSlice"

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
  images: ProductImage[];
};

type Review = {
  id: string;
  userId: number;
  productId: number;
  rating: number;
  title: string | null;
  comment: string | null;
  isVerifiedPurchase: boolean;
  helpfulVotes: number;
  createdAt: string;
  user: { username: string | null };
};

type ReviewStats = {
  averageRating: number;
  reviewCount: number;
  ratingDistribution: { 1: number; 2: number; 3: number; 4: number; 5: number };
};

function StarDisplay({ rating, size = 20 }: { rating: number; size?: number }) {
  return (
    <Box sx={{ display: "flex", gap: 0.25 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Box
          key={star}
          sx={{
            width: size,
            height: size,
            borderRadius: "50%",
            bgcolor: star <= rating ? "warning.main" : "grey.300",
            display: "inline-block",
          }}
        />
      ))}
    </Box>
  );
}

function RatingBar({ count, total, color }: { count: number; total: number; color: string }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
      <Typography variant="body2" sx={{ width: 16, fontSize: "0.75rem" }}>{count}</Typography>
      <Box sx={{ flex: 1, height: 8, bgcolor: "grey.200", borderRadius: 1, overflow: "hidden" }}>
        <Box sx={{ width: `${pct}%`, height: "100%", bgcolor: color }} />
      </Box>
    </Box>
  );
}

export default function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [id, setId] = React.useState<string | null>(null);

  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState<number | null>(0);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewUserId] = useState(1);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  const [qty, setQty] = useState(1);

  const handleAddToCart = () => {
    if (!product) return;
    dispatch(
      addItem({
        productId: String(product.id),
        name: product.name,
        price: product.price,
        quantity: qty,
        image: product.images?.[0]?.imageUrl,
      })
    );
    setSnackbar({
      open: true,
      message: `Added ${qty} × ${product.name} to cart`,
      severity: 'success',
    });
  };

  React.useEffect(() => {
    params.then((p) => setId(p.id));
  }, [params]);

  React.useEffect(() => {
    if (!id) return;
    let mounted = true;
    fetch(`/api/products/${id}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        return res.json();
      })
      .then((data) => {
        if (!mounted) return;
        setProduct(data || null);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(String(err));
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [id]);

  const { data: reviewsData, isLoading: reviewsLoading } = useQuery({
    queryKey: ['reviews', id],
    queryFn: async () => {
      if (!id) return null;
      const res = await fetch(`/api/reviews?productId=${id}`);
      if (!res.ok) throw new Error('Failed to fetch reviews');
      return res.json();
    },
    enabled: !!id,
  });

  const submitMutation = useMutation({
    mutationFn: async (payload: { userId: number; productId: number; rating: number; title?: string; comment?: string }) => {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Failed to submit review');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', id] });
      setReviewDialogOpen(false);
      setReviewRating(0);
      setReviewTitle('');
      setReviewComment('');
      setSnackbar({ open: true, message: 'Review submitted successfully!', severity: 'success' });
    },
    onError: (err: Error) => {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    },
  });

  const reviews: Review[] = reviewsData?.data ?? [];
  const stats: ReviewStats | undefined = reviewsData?.stats;
  const avgRating = stats?.averageRating ?? 0;
  const reviewCount = stats?.reviewCount ?? 0;
  const dist = stats?.ratingDistribution ?? { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  const handleSubmitReview = () => {
    if (!reviewRating || reviewRating < 1) {
      setSnackbar({ open: true, message: 'Please select a rating', severity: 'error' });
      return;
    }
    if (!id) return;
    submitMutation.mutate({
      userId: reviewUserId,
      productId: Number(id),
      rating: reviewRating,
      title: reviewTitle || undefined,
      comment: reviewComment || undefined,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Container sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <BackButton href="/shop" />
        </Box>

        {loading && <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>}

        {error && <Alert severity="error">Error: {error}</Alert>}

        {product && (
          <>
            <Card sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}>
              {product.images && product.images.length > 0 ? (
                <CardMedia
                  component="img"
                  height="300"
                  image={product.images[0].imageUrl}
                  alt={product.images[0].altText ?? product.name}
                  sx={{ objectFit: 'contain' }}
                />
              ) : (
                <Box sx={{ height: 300, bgcolor: 'grey.200', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography>No Image</Typography>
                </Box>
              )}
              <CardContent>
                <Typography variant="h4" sx={{ mb: 2 }}>
                  {product.name}
                </Typography>
                {product.description && (
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {product.description}
                  </Typography>
                )}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <StarDisplay rating={Math.round(avgRating)} size={22} />
                  <Typography variant="body2" color="text.secondary">
                    {avgRating.toFixed(1)} ({reviewCount} review{reviewCount !== 1 ? 's' : ''})
                  </Typography>
                </Box>
                <Typography variant="h5" color="primary">
                  R{product.price.toFixed(2)}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 3 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 2,
                      overflow: 'hidden',
                    }}
                  >
                    <IconButton
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      size="small"
                      aria-label="Decrease quantity"
                    >
                      <RemoveIcon fontSize="small" />
                    </IconButton>
                    <Typography sx={{ px: 2, minWidth: 32, textAlign: 'center' }}>
                      {qty}
                    </Typography>
                    <IconButton
                      onClick={() => setQty((q) => q + 1)}
                      size="small"
                      aria-label="Increase quantity"
                    >
                      <AddIcon fontSize="small" />
                    </IconButton>
                  </Box>

                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<AddShoppingCartIcon />}
                    onClick={handleAddToCart}
                    sx={{ flex: 1 }}
                  >
                    Add to Cart
                  </Button>
                </Box>
              </CardContent>
            </Card>

            <Divider sx={{ my: 4 }} />

            <Box sx={{ maxWidth: 600, mx: 'auto' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h5">Customer Reviews</Typography>
                <Button variant="contained" onClick={() => setReviewDialogOpen(true)}>
                  Write a Review
                </Button>
              </Box>

              {reviewCount > 0 && (
                <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <Typography variant="h3" sx={{ fontWeight: 'bold', lineHeight: 1 }}>
                      {avgRating.toFixed(1)}
                    </Typography>
                    <Box>
                      <StarDisplay rating={Math.round(avgRating)} size={24} />
                      <Typography variant="body2" color="text.secondary">
                        Based on {reviewCount} review{reviewCount !== 1 ? 's' : ''}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ mt: 1 }}>
                    {[5, 4, 3, 2, 1].map((star) => (
                      <RatingBar key={star} count={dist[star as keyof typeof dist]} total={reviewCount} color="warning.main" />
                    ))}
                  </Box>
                </Box>
              )}

              {reviewsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
              ) : reviews.length === 0 ? (
                <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  No reviews yet. Be the first to review this product!
                </Typography>
              ) : (
                <Stack spacing={2}>
                  {reviews.map((review) => (
                    <Box key={review.id} sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {review.user.username ?? 'Anonymous'}
                          </Typography>
                          {review.isVerifiedPurchase && (
                            <Chip
                              icon={<CheckCircleIcon sx={{ fontSize: 16 }} />}
                              label="Verified Purchase"
                              size="small"
                              color="success"
                              variant="outlined"
                              sx={{ height: 22, '& .MuiChip-label': { px: 0.5, fontSize: '0.7rem' } }}
                            />
                          )}
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <StarDisplay rating={review.rating} size={16} />
                        {review.title && (
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {review.title}
                          </Typography>
                        )}
                      </Box>
                      {review.comment && (
                        <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                          {review.comment}
                        </Typography>
                      )}
                    </Box>
                  ))}
                </Stack>
              )}
            </Box>
          </>
        )}
      </Container>

      <Dialog open={reviewDialogOpen} onClose={() => setReviewDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Write a Review</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Share your thoughts about this product. Reviews are moderated before being published.
          </DialogContentText>
          <Box sx={{ mb: 2 }}>
            <Typography component="legend" sx={{ mb: 0.5 }}>Rating *</Typography>
            <Rating
              value={reviewRating}
              onChange={(_, val) => setReviewRating(val ?? 0)}
              size="large"
            />
          </Box>
          <TextField
            label="Review Title (optional)"
            value={reviewTitle}
            onChange={(e) => setReviewTitle(e.target.value)}
            fullWidth
            margin="normal"
            placeholder="Summarize your experience"
          />
          <TextField
            label="Your Review"
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
            fullWidth
            margin="normal"
            multiline
            rows={4}
            placeholder="Tell others what you liked or didn't like..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReviewDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSubmitReview}
            variant="contained"
            disabled={submitMutation.isPending}
          >
            {submitMutation.isPending ? 'Submitting...' : 'Submit Review'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </motion.div>
  );
}