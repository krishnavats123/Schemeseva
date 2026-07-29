import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Grid, Card, CardContent, Typography, Button,
  LinearProgress, Chip, CircularProgress, Skeleton
} from '@mui/material';
import { ArrowForward, Bookmark, Article, NotificationsActive, CheckCircle } from '@mui/icons-material';
import { userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

function StatCard({ label, value, sub, icon, color = 'primary.main' }) {
  return (
    <Card>
      <CardContent sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
        <Box sx={{ bgcolor: `${color}15`, borderRadius: 2, p: 1, color }}>
          {icon}
        </Box>
        <Box>
          <Typography variant="h5" fontWeight={700}>{value}</Typography>
          <Typography variant="body2" fontWeight={500}>{label}</Typography>
          {sub && <Typography variant="caption" color="text.secondary">{sub}</Typography>}
        </Box>
      </CardContent>
    </Card>
  );
}

function ReadinessCard({ scheme }) {
  const overall = scheme.overallReadiness || 0;
  const color = overall >= 75 ? '#639922' : overall >= 50 ? '#EF9F27' : '#D85A30';
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.5,
      borderBottom: '1px solid #F0F0F0', '&:last-child': { borderBottom: 'none' } }}>
      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
        <CircularProgress variant="determinate" value={overall}
          size={56} thickness={4} sx={{ color }} />
        <Box sx={{ top: 0, left: 0, bottom: 0, right: 0, position: 'absolute',
          display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="caption" fontWeight={700}>{Math.round(overall)}%</Typography>
        </Box>
      </Box>
      <Box sx={{ flex: 1 }}>
        <Typography variant="body2" fontWeight={600}>{scheme.schemeName}</Typography>
        <Typography variant="caption" color="text.secondary">
          Eligibility: 100% · Docs: {Math.round(scheme.docReadinessPct)}%
        </Typography>
        <LinearProgress variant="determinate" value={overall}
          sx={{ mt: 0.5, height: 4, borderRadius: 2,
            '& .MuiLinearProgress-bar': { bgcolor: color } }} />
      </Box>
    </Box>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userAPI.getDashboard()
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <Grid container spacing={2}>
      {[...Array(4)].map((_, i) => (
        <Grid item xs={12} sm={6} md={3} key={i}>
          <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2 }} />
        </Grid>
      ))}
    </Grid>
  );

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Welcome back, {user?.name?.split(' ')[0]} 👋
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Here's your scheme eligibility overview
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Eligible Schemes" value={data?.eligibleCount ?? 0}
            icon={<CheckCircle />} color="#185FA5" sub="matching your profile" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Bookmarked" value={data?.bookmarkCount ?? 0}
            icon={<Bookmark />} color="#639922" sub="saved schemes" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Documents Ready" value={data?.docCount ?? 0}
            icon={<Article />} color="#EF9F27" sub="checklists filled" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Avg Readiness" value={`${data?.avgReadiness ?? 0}%`}
            icon={<NotificationsActive />} color="#D85A30" sub="across schemes" />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Top recommended schemes</Typography>
                <Button endIcon={<ArrowForward />} onClick={() => navigate('/schemes')} size="small">
                  View all
                </Button>
              </Box>
              {data?.topSchemes?.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography color="text.secondary">Complete your profile to get recommendations</Typography>
                  <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate('/profile')}>
                    Update Profile
                  </Button>
                </Box>
              )}
              {data?.topSchemes?.map((scheme, i) => (
                <Box key={i} onClick={() => navigate(`/schemes/${scheme.id}`)}
                  sx={{ p: 1.5, mb: 1, border: '1px solid #F0F0F0', borderRadius: 2,
                    cursor: 'pointer', '&:hover': { bgcolor: '#F5F7FA' } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>{scheme.schemeName}</Typography>
                      <Typography variant="caption" color="text.secondary">{scheme.ministry}</Typography>
                    </Box>
                    <Chip label={`${scheme.score}pt`} size="small"
                      color={scheme.score >= 85 ? 'success' : scheme.score >= 70 ? 'warning' : 'default'}
                      sx={{ fontWeight: 600 }} />
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                    {scheme.tags?.slice(0, 3).map(t => (
                      <Chip key={t} label={t} size="small" variant="outlined" sx={{ fontSize: 10, height: 20 }} />
                    ))}
                  </Box>
                  <LinearProgress variant="determinate" value={scheme.docReadinessPct}
                    sx={{ mt: 1, height: 3, borderRadius: 2 }} />
                  <Typography variant="caption" color="text.secondary">
                    {Math.round(scheme.docReadinessPct)}% documents ready
                  </Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Application readiness</Typography>
              {data?.topSchemes?.map((s, i) => <ReadinessCard key={i} scheme={s} />)}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
