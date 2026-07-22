'use client';

import { IconButton, Box } from '@mui/material';
import { motion } from 'framer-motion';

interface AnimatedBurgerProps {
  open: boolean;
  onClick: () => void;
  color: string;
}

const springTransition = {
  type: 'spring',
  stiffness: 260,
  damping: 20,
} as const;

export default function AnimatedBurger({ open, onClick, color }: AnimatedBurgerProps) {
  const line: React.CSSProperties = {
    position: 'absolute',
    left: 0,
    width: 24,
    height: 2,
    borderRadius: 2,
    background: color,
  };

  return (
    <IconButton onClick={onClick} aria-label="Toggle navigation" sx={{ color, ml: 1, mt: 1 }}>
      <Box sx={{ position: 'relative', width: 24, height: 18 }}>
        <Box
          component={motion.span}
          style={{ ...line, top: 0 }}
          animate={open ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
          transition={springTransition}
        />
        <Box
          component={motion.span}
          style={{ ...line, top: 8 }}
          animate={open ? { opacity: 0 } : { opacity: 1 }}
          transition={springTransition}
        />
        <Box
          component={motion.span}
          style={{ ...line, top: 16 }}
          animate={open ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
          transition={springTransition}
        />
      </Box>
    </IconButton>
  );
}
