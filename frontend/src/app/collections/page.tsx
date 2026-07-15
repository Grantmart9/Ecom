/**
 * Collections page - placeholder page for product collections.
 */
'use client'

import PageShell from '@/components/page/PageShell';
import { Box, Typography } from '@mui/material';

export default function Collections() {
  return (
    <PageShell>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h3">Collections</Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          Collections coming soon.
        </Typography>
      </Box>
    </PageShell>
  );
}