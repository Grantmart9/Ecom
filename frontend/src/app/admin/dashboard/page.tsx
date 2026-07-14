'use client';

import { Container, Box, Typography, Card, CardContent, CircularProgress, Alert, Tabs, Tab } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PeopleIcon from '@mui/icons-material/People';
import InventoryIcon from '@mui/icons-material/Inventory';
import StarIcon from '@mui/icons-material/Star';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import { useState } from 'react';

type DashboardStats = {
  revenue: { total: number; monthly: number };
  orders: { total: number; pending: number; processing: number; delivered: number; cancelled: number };
  customers: number;
  products: { total: number; active: number; lowStock: number };
  reviews: number;
  coupons: number;
  period: string;
};

function SummaryCard({
  title,
  value,
  subValue,
  icon,
  color,
}: {
  title: string;
  value: string | number;
  subValue?: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {title}
            </Typography>
            <Typography variant="h4" sx={{ mt: 1, fontWeight: 700, color }}>
              {value}
            </Typography>
            {subValue && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                {subValue}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 2,
              bgcolor: color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

function MiniBarChart({ data, color }: { data: { label: string; value: number; max?: number }[]; color: string }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 1 }}>
      {data.map((item) => {
        const pct = Math.max(5, (item.value / max) * 100);
        return (
          <Box key={item.label}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2">{item.label}</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {item.value}
              </Typography>
            </Box>
            <Box sx={{ width: '100%', height: 10, bgcolor: 'grey.200', borderRadius: 1, overflow: 'hidden' }}>
              <Box sx={{ width: `${pct}%`, height: '100%', bgcolor: color, borderRadius: 1 }} />
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}

function DonutChart({
  segments,
}: {
  segments: { label: string; value: number; color: string }[];
}) {
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;
  const gradients = segments
    .reduce<{ color: string; start: number; end: number }[]>((acc, s) => {
      const prevEnd = acc.length > 0 ? acc[acc.length - 1].end : 0;
      const end = prevEnd + (s.value / total) * 100;
      return [...acc, { color: s.color, start: prevEnd, end }];
    }, [])
    .map(({ color, start, end }) => `${color} ${start}% ${end}%`)
    .join(', ');

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
      <Box
        sx={{
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: `conic-gradient(${gradients})`,
          flexShrink: 0,
        }}
      />
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {segments.map((s) => (
          <Box key={s.label} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 12, height: 12, borderRadius: 0.5, bgcolor: s.color }} />
            <Typography variant="body2">{s.label}</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, ml: 'auto' }}>
              {s.value}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export default function AdminDashboardPage() {
  const [period, setPeriod] = useState('30d');

  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard', period],
    queryFn: async () => {
      const res = await fetch(`/api/dashboard?period=${period}`);
      if (!res.ok) throw new Error('Failed to fetch dashboard stats');
      return res.json() as Promise<DashboardStats>;
    },
  });

  const stats = data;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h4">Dashboard</Typography>
        <Tabs
          value={period}
          onChange={(_, v) => setPeriod(v)}
          sx={{ bgcolor: 'grey.100', borderRadius: 1 }}
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab label="7 days" value="7d" />
          <Tab label="30 days" value="30d" />
          <Tab label="90 days" value="90d" />
        </Tabs>
      </Box>

      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {error && <Alert severity="error">Failed to load dashboard statistics.</Alert>}

      {stats && (
        <>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
            <Box sx={{ flex: '1 1 280px', minWidth: 280 }}>
              <SummaryCard
                title="Revenue"
                value={`${(stats.revenue.total / 1_000_000).toFixed(1)}M`}
                subValue={`Monthly: ${(stats.revenue.monthly / 1_000_000).toFixed(1)}M`}
                icon={<AttachMoneyIcon />}
                color="#2e7d32"
              />
            </Box>
            <Box sx={{ flex: '1 1 280px', minWidth: 280 }}>
              <SummaryCard
                title="Orders"
                value={stats.orders.total}
                subValue={`${stats.orders.delivered} delivered, ${stats.orders.pending} pending`}
                icon={<ShoppingCartIcon />}
                color="#1565c0"
              />
            </Box>
            <Box sx={{ flex: '1 1 280px', minWidth: 280 }}>
              <SummaryCard
                title="Customers"
                value={stats.customers}
                subValue="Active users"
                icon={<PeopleIcon />}
                color="#6a1b9a"
              />
            </Box>
            <Box sx={{ flex: '1 1 280px', minWidth: 280 }}>
              <SummaryCard
                title="Products"
                value={stats.products.total}
                subValue={`${stats.products.active} active, ${stats.products.lowStock} low stock`}
                icon={<InventoryIcon />}
                color="#e65100"
              />
            </Box>
            <Box sx={{ flex: '1 1 280px', minWidth: 280 }}>
              <SummaryCard
                title="Reviews"
                value={stats.reviews}
                subValue="Total reviews"
                icon={<StarIcon />}
                color="#c62828"
              />
            </Box>
            <Box sx={{ flex: '1 1 280px', minWidth: 280 }}>
              <SummaryCard
                title="Active Coupons"
                value={stats.coupons}
                subValue="Currently running"
                icon={<LocalOfferIcon />}
                color="#00838f"
              />
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            <Box sx={{ flex: '1 1 400px', minWidth: 400 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Order Status Breakdown
                  </Typography>
                  <DonutChart
                    segments={[
                      { label: 'Pending', value: stats.orders.pending, color: '#ffb74d' },
                      { label: 'Processing', value: stats.orders.processing, color: '#64b5f6' },
                      { label: 'Delivered', value: stats.orders.delivered, color: '#81c784' },
                      { label: 'Cancelled', value: stats.orders.cancelled, color: '#e57373' },
                    ]}
                  />
                </CardContent>
              </Card>
            </Box>
            <Box sx={{ flex: '1 1 400px', minWidth: 400 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Inventory Health
                  </Typography>
                  <MiniBarChart
                    data={[
                      { label: 'Total Products', value: stats.products.total, max: stats.products.total || 1 },
                      { label: 'Active', value: stats.products.active, max: stats.products.total || 1 },
                      { label: 'Low Stock', value: stats.products.lowStock, max: stats.products.total || 1 },
                    ]}
                    color="#e65100"
                  />
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      Low stock threshold is set per product in Inventory management.
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Box>
        </>
      )}
    </Container>
  );
}
