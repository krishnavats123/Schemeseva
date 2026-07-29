import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box, Card, CardContent, TextField, Button, Typography,
  Alert, CircularProgress, InputAdornment, IconButton
} from '@mui/material';
import { AccountBalance, Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(form.email, form.password);
      navigate(data.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard');
    } catch {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', bgcolor: '#F5F7FA', p: 2 }}>
      <Card sx={{ width: '100%', maxWidth: 400 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <AccountBalance sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
            <Typography variant="h5">SchemeSeva</Typography>
            <Typography variant="body2" color="text.secondary">
              Government Scheme Recommendation Portal
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField fullWidth label="Email" type="email" margin="normal"
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
              required autoFocus />
            <TextField fullWidth label="Password" margin="normal"
              type={showPass ? 'text' : 'password'}
              value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPass(!showPass)}>
                      {showPass ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <Button fullWidth variant="contained" type="submit" size="large"
              sx={{ mt: 2 }} disabled={loading}>
              {loading ? <CircularProgress size={22} color="inherit" /> : 'Sign in'}
            </Button>
          </Box>

          <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
            Don't have an account? <Link to="/register">Register</Link>
          </Typography>

          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2, textAlign: 'center' }}>
            Demo Admin: admin@schemeseva.in / admin123
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
