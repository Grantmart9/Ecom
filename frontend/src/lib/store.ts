import cartReducer from './cartSlice'
import { configureStore } from '@reduxjs/toolkit'

export const store = configureStore({
  reducer: {
    cart: cartReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['cart/update'],
      },
    }),
})



export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
