import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface CartItem {
  productId: string
  name: string
  price: number
  quantity: number
  image?: string
}

interface CartState {
  items: CartItem[]
  isOpen: boolean
}

const initialState: CartState = {
  items: [],
  isOpen: false,
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem(state, action: PayloadAction<CartItem>) {
      const existing = state.items.find(
        (item) => item.productId === action.payload.productId
      )
      if (existing) {
        existing.quantity += action.payload.quantity
      } else {
        state.items.push(action.payload)
      }
    },
    removeItem(state, action: PayloadAction<string>) {
      state.items = state.items.filter(
        (item) => item.productId !== action.payload
      )
    },
    updateQuantity(state, action: PayloadAction<{ productId: string; quantity: number }>) {
      const item = state.items.find(
        (item) => item.productId === action.payload.productId
      )
      if (item) {
        item.quantity = action.payload.quantity
      }
    },
    toggleCart(state) {
      state.isOpen = !state.isOpen
    },
    clearCart(state) {
      state.items = []
    },
  },
})

export const { addItem, removeItem, updateQuantity, toggleCart, clearCart } = cartSlice.actions
export default cartSlice.reducer
