import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Grid, Card, CardContent, Typography, TextField,
  Chip, Button, LinearProgress, InputAdornment, Skeleton,
  IconButton, Tooltip
} from '@mui/material';
import { Search, Bookmark, BookmarkBorder, OpenInNew } from '@mui/icons-material';
import { userAPI } from '../services/api';

const TAGS = ['All', 'Student', 'Farmer', 'Women', 'Health', 'Housing', 'Startup', 'Senior Citizen', 'Banking'];

export default function Schemes() {
  const navigate = useNavigate();
  const [schemes, setSchemes] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState('All');
  const [bookmarks, setBookmarks] = useState(new Set());

  useEffect(() => {
    Promise.all([userAPI.getRecommendations(), userAPI.getBookmarks()])
      .then(([recs, bk]) => {
        setSchemes(recs.data);
        setFiltered(recs.data);
        setBookmarks(new Set(bk.data));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let list = schemes;
    if (activeTag !== 'All') list = list.filter(s => s.tags?.includes(activeTag));
    if (search) list = list.filter(s =>
      s.schemeName.toLowerCase().includes(search.toLowerCase()) ||
      s.description?.toLowerCase().includes(search.toLowerCase()) ||
      s.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()))
    );
    setFiltered(list);
  }, [search, activeTag, schemes]);

  const toggleBookmark = async (id, e) => {
    e.stopPropagation();
    const newSet = new Set(bookmarks);
    if (newSet.has(id)) {
      await userAPI.removeBookmark(id);
      newSet.delete(id);
    } else {
      await userAPI.addBookmark(id);
      newSet.add(id);
    }
    setBookmarks(newSet);
  };

  const scoreColor = (score) =>
    score >= 85 ? 'success' : score >= 70 ? 'warning' : 'default';

  if (loading) return (
    <Grid container spacing={2}>
      {[...Array(6)].map((_, i) => (
        <Grid item xs={12} sm={6} md={4} key={i}>
          <Skeleton variant="rectangular" height={180} sx={{ borderRadius: 2 }} />
        </Grid>
      ))}
    </Grid>
  );

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Eligible Schemes</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {filtered.length} schemes matching your profile, sorted by recommendation score
      </Typography>

      <TextField fullWidth placeholder="Search schemes by name, tag, or keyword…"
        value={search} onChange={e => setSearch(e.target.value)}
        sx={{ mb: 2 }}
        InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }}
      />

      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
        {TAGS.map(tag => (
          <Chip key={tag} label={tag} clickable
            variant={activeTag === tag ? 'filled' : 'outlined'}
            color={activeTag === tag ? 'primary' : 'default'}
            onClick={() => setActiveTag(tag)} />
        ))}
      </Box>

      {filtered.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography color="text.secondary">No schemes match your search.</Typography>
          <Button sx={{ mt: 1 }} onClick={() => { setSearch(''); setActiveTag('All'); }}>Clear filters</Button>
        </Box>
      )}

      <Grid container spacing={2}>
        {filtered.map(scheme => (
          <Grid item xs={12} sm={6} md={4} key={scheme.id}>
            <Card sx={{ height: '100%', cursor: 'pointer', '&:hover': { boxShadow: 4 } }}
              onClick={() => navigate(`/schemes/${scheme.id}`)}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Box sx={{ flex: 1, pr: 1 }}>
                    <Typography variant="body1" fontWeight={600} gutterBottom>
                      {scheme.schemeName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">{scheme.ministry}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Chip label={`${scheme.score}pt`} size="small" color={scoreColor(scheme.score)} />
                    <Tooltip title={bookmarks.has(scheme.id) ? 'Remove bookmark' : 'Bookmark'}>
                      <IconButton size="small" onClick={e => toggleBookmark(scheme.id, e)}>
                        {bookmarks.has(scheme.id)
                          ? <Bookmark fontSize="small" color="primary" />
                          : <BookmarkBorder fontSize="small" />}
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                <Typography variant="body2" color="text.secondary"
                  sx={{ mb: 1.5, display: '-webkit-box', WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {scheme.description}
                </Typography>

                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1.5 }}>
                  {scheme.tags?.slice(0, 3).map(t => (
                    <Chip key={t} label={t} size="small" variant="outlined" sx={{ fontSize: 10, height: 20 }} />
                  ))}
                </Box>

                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" color="text.secondary">Docs ready</Typography>
                    <Typography variant="caption" fontWeight={600}>
                      {Math.round(scheme.docReadinessPct)}%
                    </Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={scheme.docReadinessPct}
                    sx={{ height: 4, borderRadius: 2, mt: 0.5 }}
                    color={scheme.docReadinessPct >= 75 ? 'success' : scheme.docReadinessPct >= 50 ? 'warning' : 'error'}
                  />
                </Box>

                {scheme.applicationUrl && (
                  <Button size="small" endIcon={<OpenInNew />}
                    href={scheme.applicationUrl} target="_blank"
                    onClick={e => e.stopPropagation()}
                    sx={{ mt: 1.5, p: 0 }}>
                    Apply Online
                  </Button>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
