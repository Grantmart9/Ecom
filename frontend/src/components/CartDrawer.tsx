'use client'

import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Button,
  Divider,
  Stack,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import Link from 'next/link'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { toggleCart, removeItem, updateQuantity } from '@/lib/cartSlice'

export default function CartDrawer() {
  const dispatch = useAppDispatch()
  const { items, isOpen } = useAppSelector((s) => s.cart)
  const count = items.reduce((sum, i) => sum + i.quantity, 0)
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  return (
    <Drawer
      anchor="right"
      open={isOpen}
      onClose={() => dispatch(toggleCart())}
      slotProps={{ paper: { sx: { bgcolor: 'background.paper' } } }}
    >
      <Box sx={{ width: 380, maxWidth: '100vw', display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography variant="h6">
            Your Cart{count > 0 ? ` (${count})` : ''}
          </Typography>
          <IconButton onClick={() => dispatch(toggleCart())} aria-label="Close cart">
            <CloseIcon />
          </IconButton>
        </Box>

        {items.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary', flex: 1 }}>
            <Typography>Your cart is empty.</Typography>
          </Box>
        ) : (
          <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
            <Stack spacing={2}>
              {items.map((item) => (
                <Box
                  key={item.productId}
                  sx={{
                    display: 'flex',
                    gap: 2,
                    p: 1.5,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                  }}
                >
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 1,
                      flexShrink: 0,
                      bgcolor: 'grey.800',
                      backgroundImage: item.image ? `url(${item.image})` : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography noWrap sx={{ fontWeight: 600 }}>
                      {item.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      R{Number(item.price).toFixed(2)}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                      <IconButton
                        size="small"
                        onClick={() =>
                          dispatch(
                            updateQuantity({
                              productId: item.productId,
                              quantity: Math.max(1, item.quantity - 1),
                            })
                          )
                        }
                        aria-label="Decrease quantity"
                      >
                        <RemoveIcon fontSize="small" />
                      </IconButton>
                      <Typography sx={{ minWidth: 20, textAlign: 'center' }}>
                        {item.quantity}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() =>
                          dispatch(
                            updateQuantity({
                              productId: item.productId,
                              quantity: item.quantity + 1,
                            })
                          )
                        }
                        aria-label="Increase quantity"
                      >
                        <AddIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                      onClick={() => dispatch(removeItem(item.productId))}
                      aria-label="Remove item"
                    >
                      <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                  <Typography sx={{ fontWeight: 700 }}>
                    R{(Number(item.price) * item.quantity).toFixed(2)}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>
        )}

        {items.length > 0 && (
          <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography sx={{ fontWeight: 800 }}>Total</Typography>
              <Typography sx={{ fontWeight: 800 }}>R{total.toFixed(2)}</Typography>
            </Box>
            <Button
              component={Link}
              href="/checkout"
              variant="contained"
              fullWidth
              onClick={() => dispatch(toggleCart())}
              sx={{ borderRadius: 999, textTransform: 'none', fontWeight: 700 }}
            >
              Checkout
            </Button>
          </Box>
        )}
      </Box>
    </Drawer>
  )
}
