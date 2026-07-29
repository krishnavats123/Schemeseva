import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Box, Card, CardContent, TextField, Button, Typography, Alert, CircularProgress } from '@mui/material';
import { AccountBalance } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) { setError('Passwords do not match'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', bgcolor: '#F5F7FA', p: 2 }}>
      <Card sx={{ width: '100%', maxWidth: 420 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <AccountBalance sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
            <Typography variant="h5">Create Account</Typography>
            <Typography variant="body2" color="text.secondary">
              Find government schemes you qualify for
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField fullWidth label="Full Name" margin="normal"
              value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required autoFocus />
            <TextField fullWidth label="Email" type="email" margin="normal"
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            <TextField fullWidth label="Password" type="password" margin="normal"
              value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
            <TextField fullWidth label="Confirm Password" type="password" margin="normal"
              value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} required />
            <Button fullWidth variant="contained" type="submit" size="large"
              sx={{ mt: 2 }} disabled={loading}>
              {loading ? <CircularProgress size={22} color="inherit" /> : 'Create Account'}
            </Button>
          </Box>

          <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
            Already have an account? <Link to="/login">Sign in</Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
