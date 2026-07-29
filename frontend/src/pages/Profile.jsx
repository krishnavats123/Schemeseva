import React, { useEffect, useState } from 'react';
import {
  Box, Card, CardContent, Typography, TextField, Button,
  Grid, MenuItem, Switch, FormControlLabel, Alert, CircularProgress, Snackbar
} from '@mui/material';
import { Save, Person } from '@mui/icons-material';
import { userAPI } from '../services/api';

const STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal','Delhi','Jammu and Kashmir','Ladakh'
];

const OCCUPATIONS = ['Student','Farmer','Self-employed','Salaried','Unemployed','Retired'];
const CATEGORIES  = ['General','OBC','SC','ST'];
const GENDERS     = ['Male','Female','Other'];
const EDUCATION   = ['Below 10th','10th Pass','12th Pass','Diploma','Graduation','Post-graduation','PhD'];

export default function Profile() {
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError]     = useState('');

  useEffect(() => {
    userAPI.getProfile()
      .then(r => setForm(r.data))
      .catch(() => setError('Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (field, value) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await userAPI.updateProfile(form);
      setSuccess(true);
    } catch {
      setError('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
      <CircularProgress />
    </Box>
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <Person color="primary" />
        <Typography variant="h5">My Profile</Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Keep your profile updated so the eligibility engine gives accurate recommendations.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box component="form" onSubmit={handleSubmit}>
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
              Basic Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Full Name" value={form?.name || ''}
                  onChange={e => handleChange('name', e.target.value)} required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Email" value={form?.email || ''} disabled
                  helperText="Email cannot be changed" />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField fullWidth label="Age" type="number" value={form?.age || ''}
                  onChange={e => handleChange('age', parseInt(e.target.value))}
                  inputProps={{ min: 1, max: 120 }} required />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField fullWidth select label="Gender" value={form?.gender || ''}
                  onChange={e => handleChange('gender', e.target.value)} required>
                  {GENDERS.map(g => <MenuItem key={g} value={g}>{g}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField fullWidth select label="State" value={form?.state || ''}
                  onChange={e => handleChange('state', e.target.value)} required>
                  {STATES.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </TextField>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
              Economic & Social Details
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Annual Income (₹)" type="number"
                  value={form?.annualIncome || ''}
                  onChange={e => handleChange('annualIncome', parseInt(e.target.value))}
                  helperText="Household income per year"
                  inputProps={{ min: 0 }} required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth select label="Occupation" value={form?.occupation || ''}
                  onChange={e => handleChange('occupation', e.target.value)} required>
                  {OCCUPATIONS.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth select label="Caste Category" value={form?.casteCategory || ''}
                  onChange={e => handleChange('casteCategory', e.target.value)} required>
                  {CATEGORIES.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth select label="Education Level" value={form?.educationLevel || ''}
                  onChange={e => handleChange('educationLevel', e.target.value)} required>
                  {EDUCATION.map(e => <MenuItem key={e} value={e}>{e}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch checked={form?.disabled || false}
                      onChange={e => handleChange('disabled', e.target.checked)} />
                  }
                  label="I have a disability (PwD status)"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
              Preferences
            </Typography>
            <FormControlLabel
              control={
                <Switch checked={form?.notificationsEnabled ?? true}
                  onChange={e => handleChange('notificationsEnabled', e.target.checked)} />
              }
              label="Email notifications for new eligible schemes"
            />
          </CardContent>
        </Card>

        <Button type="submit" variant="contained" size="large"
          startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <Save />}
          disabled={saving}>
          {saving ? 'Saving…' : 'Save Profile'}
        </Button>
      </Box>

      <Snackbar open={success} autoHideDuration={3000} onClose={() => setSuccess(false)}>
        <Alert severity="success" onClose={() => setSuccess(false)}>
          Profile saved! Recommendations updated.
        </Alert>
      </Snackbar>
    </Box>
  );
}
