import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, Button, LinearProgress,
  List, ListItem, ListItemIcon, ListItemText, CircularProgress,
  Grid, Chip, Alert
} from '@mui/material';
import { CheckCircle, Cancel, ArrowForward, Description } from '@mui/icons-material';
import { userAPI } from '../services/api';

export default function Documents() {
  const navigate = useNavigate();
  const [schemes, setSchemes] = useState([]);
  const [docMap, setDocMap] = useState({});   // schemeId -> { docName: bool }
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([userAPI.getRecommendations(), userAPI.getDocuments()])
      .then(([recs, docs]) => {
        // Show top 6 schemes by score
        setSchemes(recs.data.slice(0, 6));
        const map = {};
        docs.data.forEach(d => { map[d.schemeId] = d.documentStatus || {}; });
        setDocMap(map);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const toggleDoc = async (schemeId, docName) => {
    const current = docMap[schemeId] || {};
    const updated = { ...current, [docName]: !current[docName] };
    setDocMap(prev => ({ ...prev, [schemeId]: updated }));
    try {
      await userAPI.updateDocuments({ schemeId, documentStatus: updated });
    } catch { console.error('Failed to save document status'); }
  };

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
      <CircularProgress />
    </Box>
  );

  if (schemes.length === 0) return (
    <Alert severity="info">
      No eligible schemes found. Please update your profile first.
      <Button sx={{ ml: 2 }} variant="outlined" size="small" onClick={() => navigate('/profile')}>
        Update Profile
      </Button>
    </Alert>
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Description color="primary" />
        <Typography variant="h5">Document Checklist</Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Track which documents you have ready for each scheme. Click a document to toggle its status.
      </Typography>

      <Grid container spacing={2}>
        {schemes.map(scheme => {
          const status = docMap[scheme.id] || {};
          const docs = scheme.requiredDocuments || [];
          const readyCount = docs.filter(d => status[d]).length;
          const pct = docs.length > 0 ? (readyCount / docs.length) * 100 : 100;
          const pctColor = pct >= 75 ? 'success' : pct >= 50 ? 'warning' : 'error';

          return (
            <Grid item xs={12} md={6} key={scheme.id}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Box>
                      <Typography variant="subtitle2" fontWeight={600}>{scheme.schemeName}</Typography>
                      <Typography variant="caption" color="text.secondary">{scheme.ministry}</Typography>
                    </Box>
                    <Chip label={`${readyCount}/${docs.length}`} size="small"
                      color={pctColor} variant="outlined" />
                  </Box>

                  <LinearProgress variant="determinate" value={pct}
                    color={pctColor}
                    sx={{ height: 5, borderRadius: 3, mb: 1.5 }} />

                  <List disablePadding dense>
                    {docs.map(doc => {
                      const ready = !!status[doc];
                      return (
                        <ListItem key={doc} disablePadding
                          onClick={() => toggleDoc(scheme.id, doc)}
                          sx={{
                            py: 0.5, px: 1, borderRadius: 1, cursor: 'pointer',
                            '&:hover': { bgcolor: ready ? '#EAF3DE' : '#FCEBEB' },
                            borderBottom: '1px solid #F5F5F5',
                            '&:last-child': { borderBottom: 'none' }
                          }}>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            {ready
                              ? <CheckCircle fontSize="small" color="success" />
                              : <Cancel fontSize="small" color="error" />}
                          </ListItemIcon>
                          <ListItemText
                            primary={doc}
                            primaryTypographyProps={{
                              variant: 'body2',
                              color: ready ? 'success.dark' : 'error.dark',
                              fontWeight: ready ? 500 : 400
                            }}
                          />
                          <Typography variant="caption"
                            sx={{ color: ready ? 'success.main' : 'error.main', fontWeight: 600 }}>
                            {ready ? 'Ready' : 'Missing'}
                          </Typography>
                        </ListItem>
                      );
                    })}
                  </List>

                  <Button size="small" endIcon={<ArrowForward />}
                    onClick={() => navigate(`/schemes/${scheme.id}`)}
                    sx={{ mt: 1.5 }}>
                    View scheme details
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
