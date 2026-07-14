/**
 * Collections page - placeholder page for product collections.
 */
'use client'

import BackButton from "@/components/BackButton"
import { motion } from "framer-motion"
import {
  Container,
  Box,
  Typography,
} from "@mui/material"

export default function Collections() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Container sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, px: 4, position: 'relative' }}>
        <Box sx={{ position: 'absolute', top: 16, left: 16 }}>
          <BackButton href="/" />
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h3">Collections</Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>
            Collections coming soon.
          </Typography>
        </Box>
      </Container>
    </motion.div>
  )
}