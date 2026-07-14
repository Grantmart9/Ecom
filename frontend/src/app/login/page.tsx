/**
 * Login page - handles user authentication.
 */
'use client';

import { Container, Box, Typography, TextField, Button, Alert, Paper } from '@mui/material';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        router.push(redirect);
      } else {
        const data = await res.json();
        setError(data.detail || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ py: 8 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" sx={{ mb: 3 }}>Login</Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              required
              margin="normal"
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              required
              margin="normal"
            />
            <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
              Login
            </Button>
          </form>
        </Paper>
      </Box>
    </Container>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}