/**
 * Client layout component.
 * Provides global MUI theme (dark Fulcrum palette) and TanStack Query client.
 */
'use client'

import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Provider } from 'react-redux'
import { useState } from 'react'
import { store } from '@/lib/store'
import CartDrawer from '@/components/CartDrawer'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#FFE500', contrastText: '#0B0B0F' },
    secondary: { main: '#0B0B0F', contrastText: '#FFFFFF' },
    background: { default: 'transparent', paper: '#FFFFFF' },
    text: { primary: '#0B0B0F', secondary: '#FFE500' },
    divider: 'rgba(11,11,15,0.12)',
  },
  typography: { fontFamily: '"Glacial Indifference", sans-serif' },
  shape: { borderRadius: 12 },
})

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60000,
        retry: 1,
      },
    },
  }))

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
          <CartDrawer />
        </ThemeProvider>
      </QueryClientProvider>
    </Provider>
  )
}
