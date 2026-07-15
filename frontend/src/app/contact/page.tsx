'use client';

import PageShell from '@/components/page/PageShell';
import { motion } from 'framer-motion';
import { Box, Typography, TextField, Button } from '@mui/material';

export default function Contact() {
  return (
    <PageShell maxWidth>
      <Box sx={{ textAlign: 'center', width: '100%' }}>
        <Typography variant="h3">Contact</Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          Contact form coming soon.
        </Typography>
      </Box>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Box sx={{ width: '100%', maxWidth: 400 }}>
          <TextField label="Name" variant="outlined" fullWidth sx={{ mb: 2 }} />
          <TextField label="Email" variant="outlined" fullWidth sx={{ mb: 2 }} type="email" />
          <TextField label="Message" variant="outlined" fullWidth sx={{ mb: 2 }} multiline rows={4} />
          <Button variant="contained" type="submit" fullWidth sx={{ mt: 2 }}>
            Send Message
          </Button>
        </Box>
      </motion.div>
    </PageShell>
  );
}