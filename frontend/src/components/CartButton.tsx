'use client'

import { IconButton, Badge, Tooltip, type SxProps, type Theme } from '@mui/material'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { toggleCart } from '@/lib/cartSlice'

export default function CartButton({ sx }: { sx?: SxProps<Theme> }) {
  const dispatch = useAppDispatch()
  const items = useAppSelector((s) => s.cart.items)
  const count = items.reduce((sum, i) => sum + i.quantity, 0)

  if (count === 0) return null

  return (
    <Tooltip title="Open cart">
      <IconButton
        onClick={() => dispatch(toggleCart())}
        aria-label={`Open cart, ${count} item${count !== 1 ? 's' : ''}`}
        sx={{
          color: 'text.primary',
          border: '1px solid',
          borderColor: 'divider',
          '&:hover': { borderColor: 'primary.main', color: 'primary.main' },
          ...sx,
        }}
      >
        <Badge badgeContent={count} color="primary" overlap="circular">
          <ShoppingCartIcon />
        </Badge>
      </IconButton>
    </Tooltip>
  )
}
