/**
 * Settings page - store configuration management.
 */
'use client';

import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

type Settings = {
  storeName: string;
  currency: string;
  taxRate: number;
  shippingZones: Array<{ name: string; price: number }>;
  emailNotifications: boolean;
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    storeName: 'Recovery Co.',
    currency: 'USD',
    taxRate: 0,
    shippingZones: [{ name: 'Domestic', price: 0 }],
    emailNotifications: true,
  });

  const queryClient = useQueryClient();
  const settingsLoaded = useRef(false);

  const { data: savedSettings, isLoading: settingsLoading, error: settingsError } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => {
      const res = await fetch('/api/admin/settings');
      if (!res.ok) throw new Error('Failed to fetch settings');
      return res.json();
    },
  });

  useEffect(() => {
    if (savedSettings && !settingsLoaded.current) {
      settingsLoaded.current = true;
      setSettings({
        storeName: savedSettings.storeName || 'Recovery Co.',
        currency: savedSettings.currency || 'USD',
        taxRate: savedSettings.taxRate ?? 0,
        shippingZones: Array.isArray(savedSettings.shippingZones) && savedSettings.shippingZones.length > 0
          ? savedSettings.shippingZones
          : [{ name: 'Domestic', price: 0 }],
        emailNotifications: !!savedSettings.emailNotifications,
      });
    }
  }, [savedSettings]);

  const saveMutation = useMutation({
    mutationFn: async (data: Settings) => {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
    },
  });

  const handleSave = () => {
    saveMutation.mutate(settings);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>Settings</Typography>

      {settingsLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {settingsError && <Alert severity="error" sx={{ mb: 2 }}>Failed to load settings.</Alert>}

      {!settingsLoading && !settingsError && (
        <>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Store Configuration</Typography>

        <TextField
          label="Store Name"
          value={settings.storeName}
          onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
          fullWidth
          margin="dense"
        />

        <TextField
          label="Currency"
          value={settings.currency}
          onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
          fullWidth
          margin="dense"
          helperText="3-letter currency code (USD, EUR, GBP)"
        />

        <TextField
          label="Default Tax Rate (%)"
          type="number"
          value={settings.taxRate}
          onChange={(e) => setSettings({ ...settings, taxRate: Number(e.target.value) })}
          fullWidth
          margin="dense"
        />

        <FormControlLabel
          control={
            <Switch
              checked={settings.emailNotifications}
              onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
            />
          }
          label="Email Notifications"
          sx={{ mt: 2 }}
        />
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Shipping Zones</Typography>

        {settings.shippingZones.map((zone, idx) => (
          <Box key={idx} sx={{ display: 'flex', gap: 2, mb: 1 }}>
            <TextField
              label="Zone Name"
              value={zone.name}
              onChange={(e) => {
                const zones = [...settings.shippingZones];
                zones[idx].name = e.target.value;
                setSettings({ ...settings, shippingZones: zones });
              }}
              size="small"
            />
            <TextField
              label="Price"
              type="number"
              value={zone.price}
              onChange={(e) => {
                const zones = [...settings.shippingZones];
                zones[idx].price = Number(e.target.value);
                setSettings({ ...settings, shippingZones: zones });
              }}
              size="small"
            />
          </Box>
        ))}

        <Button
          variant="outlined"
          size="small"
          onClick={() => setSettings({ ...settings, shippingZones: [...settings.shippingZones, { name: '', price: 0 }] })}
        >
          Add Zone
        </Button>
      </Paper>

      <Button variant="contained" onClick={handleSave} disabled={saveMutation.isPending}>
        Save Settings
      </Button>

      {saveMutation.isError && <Alert severity="error" sx={{ mt: 2 }}>Failed to save settings</Alert>}
      {saveMutation.isSuccess && <Alert severity="success" sx={{ mt: 2 }}>Settings saved successfully</Alert>}
      </Box>
      </>
      )}
    </Container>
  );
}