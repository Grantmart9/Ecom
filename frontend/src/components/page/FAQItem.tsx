'use client';

import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Box, Typography } from '@mui/material';

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

interface FAQItemProps {
  question: string;
  children: ReactNode;
}

export default function FAQItem({ question, children }: FAQItemProps) {
  return (
    <motion.div variants={itemVariants}>
      <Box
        sx={{
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          overflow: 'hidden',
          transition: 'border-color .25s, box-shadow .25s',
          '&:hover': {
            borderColor: 'primary.main',
            boxShadow: '0 6px 24px rgba(0,0,0,0.06)',
          },
        }}
      >
        <Box sx={{ p: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
            {question}
          </Typography>
          <Box sx={{ mt: 1.5 }}>
            {children}
          </Box>
        </Box>
      </Box>
    </motion.div>
  );
}
