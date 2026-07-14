/**
 * Admin layout wrapper with authentication guard.
 * Features animated sidebar navigation with slide-in/out transitions.
 */
'use client';

import {
  Box,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Typography,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useMemo, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import {
  Dashboard as DashboardIcon,
  Inventory as ProductsIcon,
  ShoppingCart as OrdersIcon,
  People as CustomersIcon,
  Warehouse as InventoryIcon,
  Category as CategoriesIcon,
  LocalOffer as CouponsIcon,
  Settings as SettingsIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

const navItems = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: DashboardIcon },
  { label: 'Products', href: '/admin/products', icon: ProductsIcon },
  { label: 'Orders', href: '/admin/orders', icon: OrdersIcon },
  { label: 'Customers', href: '/admin/customers', icon: CustomersIcon },
  { label: 'Inventory', href: '/admin/inventory', icon: InventoryIcon },
  { label: 'Categories', href: '/admin/categories', icon: CategoriesIcon },
  { label: 'Coupons', href: '/admin/coupons', icon: CouponsIcon },
  { label: 'Settings', href: '/admin/settings', icon: SettingsIcon },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopExpanded, setDesktopExpanded] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  const { data: user, isLoading, error } = useQuery({
    queryKey: ['admin-auth'],
    queryFn: async () => {
      const res = await fetch('/api/admin/auth');
      if (!res.ok) throw new Error('Unauthorized');
      return res.json();
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const sidebarVariants = useMemo<Variants>(() => ({
    expanded: { width: 240, transition: { type: 'spring', stiffness: 300, damping: 30 } },
    collapsed: { width: 72, transition: { type: 'spring', stiffness: 300, damping: 30 } },
  }), []);

  const mobileSidebarVariants = useMemo<Variants>(() => ({
    open: { x: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
    closed: { x: -280, transition: { type: 'spring', stiffness: 300, damping: 30 } },
  }), []);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login?redirect=' + encodeURIComponent(pathname));
    }
  }, [isLoading, user, router, pathname]);

  // Close mobile menu when switching to desktop
  const prevIsMobile = useRef(isMobile);
  useEffect(() => {
    if (prevIsMobile.current && !isMobile) {
      setMobileOpen(false);
    }
    prevIsMobile.current = isMobile;
  }, [isMobile]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <Typography>Redirecting to login...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobile && mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              zIndex: 1200,
            }}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        variants={isMobile ? mobileSidebarVariants : sidebarVariants}
        animate={isMobile ? (mobileOpen ? 'open' : 'closed') : (desktopExpanded ? 'expanded' : 'collapsed')}
        style={{
          width: isMobile ? 240 : undefined,
          height: '100vh',
          position: 'sticky',
          top: 0,
          flexShrink: 0,
        }}
      >
        <Paper
          sx={{
            height: '100%',
            borderRadius: 0,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            borderRight: '1px solid',
            borderColor: 'divider',
          }}
        >
          {/* Header */}
          <Box
            sx={{
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: desktopExpanded ? 'space-between' : 'center',
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}
          >
            {!isMobile && desktopExpanded && (
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                Admin
              </Typography>
            )}
            <IconButton
              onClick={() => isMobile ? setMobileOpen(false) : setDesktopExpanded(!desktopExpanded)}
              size="small"
            >
              {isMobile ? <CloseIcon /> : (desktopExpanded ? <CloseIcon /> : <MenuIcon />)}
            </IconButton>
          </Box>

          {/* Navigation */}
          <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
            <List>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(item.href);
                return (
                  <ListItemButton
                    key={item.href}
                    component={Link}
                    href={item.href}
                    selected={isActive}
                    onClick={() => isMobile && setMobileOpen(false)}
                    sx={{
                      mx: 1,
                      mb: 0.5,
                      borderRadius: 2,
                      justifyContent: desktopExpanded ? 'flex-start' : 'center',
                      px: desktopExpanded ? 2 : 1.5,
                      '&.Mui-selected': {
                        bgcolor: 'primary.light',
                        '&:hover': { bgcolor: 'primary.light' },
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: desktopExpanded ? 40 : 'auto' }}>
                      <Icon />
                    </ListItemIcon>
                    {desktopExpanded && <ListItemText primary={item.label} />}
                  </ListItemButton>
                );
              })}
            </List>
          </Box>

          {/* Footer */}
          <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            {desktopExpanded && user && (
              <Typography variant="caption" color="text.secondary">
                {user.user?.email}
              </Typography>
            )}
          </Box>
        </Paper>
      </motion.div>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, p: 3, overflow: 'auto' }}>
        {/* Mobile Menu Button */}
        {isMobile && (
          <IconButton
            onClick={() => setMobileOpen(true)}
            sx={{ mb: 2, position: 'fixed', top: 16, left: 16, zIndex: 1100 }}
          >
            <MenuIcon />
          </IconButton>
        )}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </Box>
    </Box>
  );
}