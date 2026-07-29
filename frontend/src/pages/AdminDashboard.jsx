import React, { useEffect, useState } from 'react';
import {
  Box, Card, CardContent, Typography, Button, Grid, TextField,
  MenuItem, Dialog, DialogTitle, DialogContent, DialogActions,
  Table, TableHead, TableRow, TableCell, TableBody, Chip,
  IconButton, Alert, Snackbar, CircularProgress, Tooltip
} from '@mui/material';
import { Add, Edit, Delete, AdminPanelSettings, BarChart } from '@mui/icons-material';
import { schemeAPI } from '../services/api';

const EMPTY_SCHEME = {
  schemeName: '', ministry: '', description: '',
  minAge: 0, maxAge: 100, maxIncome: 0,
  allowedGenders: [], allowedCategories: [], allowedOccupations: [], allowedStates: [],
  requiredDocuments: [], tags: [], applicationUrl: '',
  disabilityRequired: false, active: true
};

function MultiInput({ label, value = [], onChange }) {
  const [input, setInput] = useState('');
  const add = () => {
    const v = input.trim();
    if (v && !value.includes(v)) { onChange([...value, v]); }
    setInput('');
  };
  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 1, mb: 0.5 }}>
        <TextField size="small" label={label} value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), add())}
          sx={{ flex: 1 }} />
        <Button size="small" variant="outlined" onClick={add}>Add</Button>
      </Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
        {value.map(v => (
          <Chip key={v} label={v} size="small"
            onDelete={() => onChange(value.filter(x => x !== v))} />
        ))}
      </Box>
    </Box>
  );
}

export default function AdminDashboard() {
  const [schemes, setSchemes] = useState([]);
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog]   = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm]       = useState(EMPTY_SCHEME);
  const [saving, setSaving]   = useState(false);
  const [snack, setSnack]     = useState('');
  const [error, setError]     = useState('');

  const loadData = () => {
    Promise.all([schemeAPI.getAll(), schemeAPI.getStats()])
      .then(([s, st]) => { setSchemes(s.data); setStats(st.data); })
      .catch(() => setError('Failed to load data'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY_SCHEME); setDialog(true); };
  const openEdit   = (s)  => { setEditing(s.id); setForm({ ...s }); setDialog(true); };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editing) {
        await schemeAPI.update(editing, form);
        setSnack('Scheme updated successfully');
      } else {
        await schemeAPI.create(form);
        setSnack('Scheme created successfully');
      }
      setDialog(false);
      loadData();
    } catch {
      setError('Failed to save scheme');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Deactivate "${name}"?`)) return;
    try {
      await schemeAPI.delete(id);
      setSnack('Scheme deactivated');
      loadData();
    } catch { setError('Failed to delete scheme'); }
  };

  const f = (field, val) => setForm(p => ({ ...p, [field]: val }));

  if (loading) return <Box sx={{ display:'flex', justifyContent:'center', mt:8 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Box sx={{ display:'flex', alignItems:'center', gap:1, mb:3 }}>
        <AdminPanelSettings color="primary" />
        <Typography variant="h5">Admin Dashboard</Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb:2 }} onClose={() => setError('')}>{error}</Alert>}

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb:3 }}>
        {[
          { label:'Total Schemes', value: stats?.totalSchemes ?? 0, color:'#185FA5' },
          { label:'Active Schemes', value: stats?.activeSchemes ?? 0, color:'#639922' },
          { label:'Inactive / Hidden', value: stats?.inactiveSchemes ?? 0, color:'#888' },
        ].map(s => (
          <Grid item xs={12} sm={4} key={s.label}>
            <Card>
              <CardContent sx={{ display:'flex', alignItems:'center', gap:2 }}>
                <BarChart sx={{ color: s.color, fontSize:32 }} />
                <Box>
                  <Typography variant="h4" fontWeight={700} sx={{ color: s.color }}>{s.value}</Typography>
                  <Typography variant="body2">{s.label}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Scheme table */}
      <Card>
        <CardContent>
          <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mb:2 }}>
            <Typography variant="h6">All Schemes</Typography>
            <Button variant="contained" startIcon={<Add />} onClick={openCreate}>
              Add Scheme
            </Button>
          </Box>

          <Box sx={{ overflowX:'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ '& th': { fontWeight:600, bgcolor:'#F5F7FA' } }}>
                  <TableCell>Scheme Name</TableCell>
                  <TableCell>Ministry</TableCell>
                  <TableCell>Tags</TableCell>
                  <TableCell>Income Limit</TableCell>
                  <TableCell>Age</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {schemes.map(s => (
                  <TableRow key={s.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>{s.schemeName}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">{s.ministry}</Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display:'flex', gap:0.5, flexWrap:'wrap' }}>
                        {s.tags?.slice(0,2).map(t => (
                          <Chip key={t} label={t} size="small" sx={{ fontSize:10, height:18 }} />
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">
                        {s.maxIncome > 0 ? `₹${s.maxIncome.toLocaleString('en-IN')}` : 'No limit'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">{s.minAge}–{s.maxAge}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={s.active ? 'Active' : 'Hidden'} size="small"
                        color={s.active ? 'success' : 'default'} />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => openEdit(s)}>
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Deactivate">
                        <IconButton size="small" color="error" onClick={() => handleDelete(s.id, s.schemeName)}>
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialog} onClose={() => setDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editing ? 'Edit Scheme' : 'Add New Scheme'}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ pt:1 }}>
            <Grid item xs={12} sm={8}>
              <TextField fullWidth label="Scheme Name" value={form.schemeName}
                onChange={e => f('schemeName', e.target.value)} required />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="Ministry" value={form.ministry}
                onChange={e => f('ministry', e.target.value)} required />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth multiline rows={3} label="Description" value={form.description}
                onChange={e => f('description', e.target.value)} />
            </Grid>

            {/* Eligibility */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb:1 }}>
                Eligibility Criteria
              </Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField fullWidth type="number" label="Min Age" value={form.minAge}
                onChange={e => f('minAge', parseInt(e.target.value))} />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField fullWidth type="number" label="Max Age" value={form.maxAge}
                onChange={e => f('maxAge', parseInt(e.target.value))} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth type="number" label="Max Annual Income (₹, 0 = no limit)"
                value={form.maxIncome} onChange={e => f('maxIncome', parseInt(e.target.value))} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <MultiInput label="Allowed Categories (press Enter)"
                value={form.allowedCategories}
                onChange={v => f('allowedCategories', v)} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <MultiInput label="Allowed Occupations"
                value={form.allowedOccupations}
                onChange={v => f('allowedOccupations', v)} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <MultiInput label="Allowed Genders (blank = all)"
                value={form.allowedGenders}
                onChange={v => f('allowedGenders', v)} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <MultiInput label="Allowed States (blank = all India)"
                value={form.allowedStates}
                onChange={v => f('allowedStates', v)} />
            </Grid>

            {/* Documents & Tags */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb:1 }}>
                Documents & Tags
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <MultiInput label="Required Documents"
                value={form.requiredDocuments}
                onChange={v => f('requiredDocuments', v)} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <MultiInput label="Tags (e.g. Student, Farmer)"
                value={form.tags}
                onChange={v => f('tags', v)} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Application URL" value={form.applicationUrl}
                onChange={e => f('applicationUrl', e.target.value)}
                placeholder="https://..." />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p:2 }}>
          <Button onClick={() => setDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}>
            {saving ? 'Saving…' : editing ? 'Update Scheme' : 'Create Scheme'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack('')}>
        <Alert severity="success" onClose={() => setSnack('')}>{snack}</Alert>
      </Snackbar>
    </Box>
  );
}
