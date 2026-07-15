'use client';

import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Container, Box } from '@mui/material';
import BackButton from '@/components/BackButton';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

interface PageShellProps {
  children: ReactNode;
  backHref?: string;
  maxWidth?: boolean;
  noBack?: boolean;
}

export default function PageShell({ children, backHref = '/', maxWidth, noBack }: PageShellProps) {
  return (
    <motion.div initial="initial" animate="animate" transition={pageVariants.transition}>
      <Container
        maxWidth={maxWidth ? 'lg' : false}
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          gap: 3,
          px: 4,
          py: 8,
          position: 'relative',
        }}
      >
        {!noBack && (
          <Box sx={{ position: 'absolute', top: 16, left: 16 }}>
            <BackButton href={backHref} />
          </Box>
        )}
        {children}
      </Container>
    </motion.div>
  );
}
