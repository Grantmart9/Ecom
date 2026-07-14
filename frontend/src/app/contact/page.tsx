'use client'

import BackButton from "@/components/BackButton"
import { motion } from "framer-motion"
import {
  Container,
  Box,
  Typography,
  Button,
  TextField,
} from "@mui/material"

export default function Contact() {
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
        <Box sx={{ textAlign: 'center', width: '100%' }}>
          <Typography variant="h3">Contact</Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>
            Contact form coming soon.
          </Typography>
        </Box>
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          sx={{ width: '100%', maxWidth: 400 }}
        >
          <TextField
            label="Name"
            variant="outlined"
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Email"
            variant="outlined"
            fullWidth
            sx={{ mb: 2 }}
            type="email"
          />
          <TextField
            label="Message"
            variant="outlined"
            fullWidth
            sx={{ mb: 2 }}
            multiline
            rows={4}
          />
          <Button
            variant="contained"
            type="submit"
            fullWidth
            sx={{ mt: 2 }}
          >
            Send Message
          </Button>
        </Box>
      </Container>
    </motion.div>
  )
}