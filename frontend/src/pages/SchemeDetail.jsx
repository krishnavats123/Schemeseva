import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, Button, Chip, Divider,
  List, ListItem, ListItemIcon, ListItemText, CircularProgress,
  LinearProgress, Alert, IconButton, Tooltip
} from '@mui/material';
import {
  ArrowBack, CheckCircle, Cancel, OpenInNew,
  Bookmark, BookmarkBorder
} from '@mui/icons-material';
import { schemeAPI, userAPI } from '../services/api';

export default function SchemeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [scheme, setScheme] = useState(null);
  const [docStatus, setDocStatus] = useState({});
  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      schemeAPI.getById(id),
      userAPI.getDocuments(),
      userAPI.getBookmarks()
    ]).then(([sch, docs, bk]) => {
      setScheme(sch.data);
      const myDoc = docs.data.find(d => d.schemeId === id);
      const initialStatus = {};
      sch.data.requiredDocuments?.forEach(doc => {
        initialStatus[doc] = myDoc?.documentStatus?.[doc] || false;
      });
      setDocStatus(initialStatus);
      setBookmarked(bk.data.includes(id));
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const toggleDoc = async (docName) => {
    const updated = { ...docStatus, [docName]: !docStatus[docName] };
    setDocStatus(updated);
    setSaving(true);
    try {
      await userAPI.updateDocuments({ schemeId: id, documentStatus: updated });
    } catch { setSaving(false); }
    setSaving(false);
  };

  const toggleBookmark = async () => {
    if (bookmarked) { await userAPI.removeBookmark(id); setBookmarked(false); }
    else { await userAPI.addBookmark(id); setBookmarked(true); }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;
  if (!scheme) return <Alert severity="error">Scheme not found</Alert>;

  const readyCount = Object.values(docStatus).filter(Boolean).length;
  const total = scheme.requiredDocuments?.length || 0;
  const docPct = total > 0 ? (readyCount / total) * 100 : 100;
  const overallReadiness = Math.round((100 + docPct) / 2);

  return (
    <Box>
      <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
        Back
      </Button>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box>
          <Typography variant="h5">{scheme.schemeName}</Typography>
          <Typography variant="body2" color="text.secondary">{scheme.ministry}</Typography>
        </Box>
        <Tooltip title={bookmarked ? 'Remove bookmark' : 'Bookmark scheme'}>
          <IconButton onClick={toggleBookmark} color={bookmarked ? 'primary' : 'default'}>
            {bookmarked ? <Bookmark /> : <BookmarkBorder />}
          </IconButton>
        </Tooltip>
      </Box>

      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 3 }}>
        {scheme.tags?.map(t => <Chip key={t} label={t} size="small" />)}
      </Box>

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>

        {/* Readiness card */}
        <Card sx={{ flex: '1 1 200px' }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Box sx={{ position: 'relative', display: 'inline-flex' }}>
              <CircularProgress variant="determinate" value={overallReadiness}
                size={80} thickness={5}
                sx={{ color: overallReadiness >= 75 ? '#639922' : '#EF9F27' }} />
              <Box sx={{ top: 0, left: 0, bottom: 0, right: 0, position: 'absolute',
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="body1" fontWeight={700}>{overallReadiness}%</Typography>
              </Box>
            </Box>
            <Typography variant="body2" fontWeight={600} sx={{ mt: 1 }}>Overall Readiness</Typography>
            <Typography variant="caption" color="text.secondary">
              Eligibility 100% · Docs {Math.round(docPct)}%
            </Typography>
          </CardContent>
        </Card>

        {/* Eligibility summary */}
        <Card sx={{ flex: '2 1 300px' }}>
          <CardContent>
            <Typography variant="subtitle2" gutterBottom>Eligibility criteria</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {scheme.minAge > 0 && <Chip size="small" label={`Age: ${scheme.minAge}–${scheme.maxAge}`} variant="outlined" />}
              {scheme.maxIncome > 0 && <Chip size="small" label={`Income ≤ ₹${scheme.maxIncome.toLocaleString('en-IN')}`} variant="outlined" />}
              {scheme.allowedCategories?.length > 0 && (
                <Chip size="small" label={`Category: ${scheme.allowedCategories.join(', ')}`} variant="outlined" />
              )}
              {scheme.allowedOccupations?.length > 0 && (
                <Chip size="small" label={`Occupation: ${scheme.allowedOccupations.join(', ')}`} variant="outlined" />
              )}
              {scheme.allowedStates?.length > 0 && (
                <Chip size="small" label={`States: ${scheme.allowedStates.slice(0, 3).join(', ')}`} variant="outlined" />
              )}
            </Box>
          </CardContent>
        </Card>
      </Box>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>About this scheme</Typography>
          <Typography variant="body2" color="text.secondary">{scheme.description}</Typography>
        </CardContent>
      </Card>

      {/* Document checklist */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle1" fontWeight={600}>Document checklist</Typography>
            <Typography variant="body2" color="text.secondary">
              {readyCount} / {total} ready {saving && '(saving…)'}
            </Typography>
          </Box>
          <LinearProgress variant="determinate" value={docPct}
            sx={{ mb: 2, height: 6, borderRadius: 3 }}
            color={docPct >= 75 ? 'success' : docPct >= 50 ? 'warning' : 'error'} />
          <List disablePadding>
            {scheme.requiredDocuments?.map(doc => (
              <ListItem key={doc} disablePadding
                sx={{ py: 0.5, borderBottom: '1px solid #F0F0F0', '&:last-child': { borderBottom: 'none' } }}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  {docStatus[doc]
                    ? <CheckCircle color="success" />
                    : <Cancel color="error" />}
                </ListItemIcon>
                <ListItemText primary={doc}
                  primaryTypographyProps={{ variant: 'body2' }} />
                <Button size="small" variant={docStatus[doc] ? 'outlined' : 'contained'}
                  color={docStatus[doc] ? 'success' : 'primary'}
                  onClick={() => toggleDoc(doc)}>
                  {docStatus[doc] ? 'Have it' : 'Missing'}
                </Button>
              </ListItem>
            ))}
          </List>

          {scheme.applicationUrl && (
            <>
              <Divider sx={{ my: 2 }} />
              <Button fullWidth variant="contained" endIcon={<OpenInNew />}
                href={scheme.applicationUrl} target="_blank">
                Apply Now on Official Portal
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
