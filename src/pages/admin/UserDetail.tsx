import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Collapse,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  Folder as FolderIcon,
  FolderOpen as FolderOpenIcon,
  Layers as LayersIcon,
  MenuBook as MenuBookIcon,
  Style as StyleIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import * as adminApi from '../../api/admin';
import type {
  AdminCategorySummary,
  AdminUserDetail as AdminUserDetailType,
  AdminUserDetailStats,
} from '../../types/auth.types';
import { extractErrorMessage } from '../../utils/error';

const STAT_LABELS: {
  key: keyof AdminUserDetailStats;
  label: string;
  icon: React.ReactNode;
  color: string;
}[] = [
  { key: 'categories_count', label: 'Categories', icon: <FolderIcon />, color: 'primary.main' },
  { key: 'subcategories_count', label: 'Subcategories', icon: <FolderOpenIcon />, color: 'info.main' },
  { key: 'flashcards_count', label: 'Flashcards', icon: <StyleIcon />, color: 'secondary.main' },
  { key: 'cards_with_progress_count', label: 'Cards in progress', icon: <MenuBookIcon />, color: 'success.main' },
  { key: 'total_reviews_count', label: 'Total reviews', icon: <TrendingUpIcon />, color: 'warning.main' },
];

const PROGRESS_LABELS: { key: keyof AdminUserDetailStats; label: string }[] = [
  { key: 'progress_pending', label: 'Pending' },
  { key: 'progress_phase1', label: 'Phase 1' },
  { key: 'progress_phase2', label: 'Phase 2' },
  { key: 'progress_graduated', label: 'Graduated' },
  { key: 'progress_long_term_mastered', label: 'Long-term mastered' },
];

const UserDetail: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [detail, setDetail] = useState<AdminUserDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCategoryIds, setExpandedCategoryIds] = useState<Set<number>>(new Set());

  const load = useCallback(async () => {
    const id = userId ? parseInt(userId, 10) : NaN;
    if (Number.isNaN(id)) {
      setError('Invalid user ID');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.getUserDetail(id);
      setDetail(data);
      setExpandedCategoryIds(new Set());
    } catch (err) {
      setError(extractErrorMessage(err, 'Failed to load user details.'));
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleCategory = (id: number) => {
    setExpandedCategoryIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !detail) {
    return (
      <Box>
        <Typography color="error">{error ?? 'User not found.'}</Typography>
        <Typography
          component="button"
          variant="body2"
          sx={{
            mt: 1,
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            color: 'primary.main',
            fontWeight: 600,
          }}
          onClick={() => navigate('/admin/users')}
        >
          ← Back to users
        </Typography>
      </Box>
    );
  }

  const { user, stats, categories } = detail;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <IconButton aria-label="Back to users" onClick={() => navigate('/admin/users')} size="small">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" fontWeight="bold">
          User details
        </Typography>
      </Box>

      {/* User info card */}
      <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Avatar
            src={user.avatar_url ?? undefined}
            sx={{ width: 56, height: 56, bgcolor: 'primary.main', fontSize: 20 }}
          >
            {user.display_name.slice(0, 2).toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h6" fontWeight="bold">
              {user.display_name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user.email}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
              <Chip
                label={user.role === 'admin' ? 'Admin' : 'User'}
                size="small"
                color={user.role === 'admin' ? 'secondary' : 'default'}
              />
              <Chip
                label={user.is_active ? 'Active' : 'Suspended'}
                size="small"
                color={user.is_active ? 'success' : 'error'}
                variant="outlined"
              />
              <Chip
                label={user.is_email_verified ? 'Verified' : 'Unverified'}
                size="small"
                color={user.is_email_verified ? 'success' : 'warning'}
                variant="outlined"
              />
              <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'center' }}>
                Joined {new Date(user.created_at).toLocaleDateString()}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Stats cards */}
      <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
        Content & activity stats
      </Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {STAT_LABELS.map(({ key, label, icon, color }) => (
          <Grid item xs={12} sm={6} md={4} key={key}>
            <Card variant="outlined" sx={{ height: '100%', borderRadius: 2 }}>
              <CardContent sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <Box sx={{ color, display: 'flex', alignItems: 'center', fontSize: 28 }}>{icon}</Box>
                <Box>
                  <Typography variant="h5" fontWeight="bold">
                    {stats[key] as number}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {label}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Progress breakdown */}
      <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
        Progress breakdown
      </Typography>
      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, mb: 3, maxWidth: 600 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Status</TableCell>
              <TableCell align="right">Count</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {PROGRESS_LABELS.map(({ key, label }) => (
              <TableRow key={key}>
                <TableCell>{label}</TableCell>
                <TableCell align="right">{stats[key] as number}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Categories & subcategories */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, mb: 2 }}>
        <Typography variant="subtitle1" fontWeight="bold">
          Categories & subcategories
        </Typography>
        <Button
          variant="contained"
          size="small"
          onClick={() => navigate(`/admin/users/${userId}/content`)}
        >
          Manage content (CRUD)
        </Button>
      </Box>
      {categories.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
          <Typography color="text.secondary">No categories yet.</Typography>
        </Paper>
      ) : (
        <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
          {categories.map((cat: AdminCategorySummary) => {
            const expanded = expandedCategoryIds.has(cat.id);
            return (
              <Box key={cat.id}>
                <Box
                  component="button"
                  onClick={() => toggleCategory(cat.id)}
                  sx={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    p: 2,
                    border: 'none',
                    background: expanded ? 'action.hover' : 'transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                >
                  <IconButton size="small" aria-label={expanded ? 'Collapse' : 'Expand'}>
                    {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
                  <LayersIcon color="action" fontSize="small" />
                  <Typography variant="body1" fontWeight="600" sx={{ flex: 1 }}>
                    {cat.title}
                  </Typography>
                  <Chip
                    label={`${cat.subcategories_count} subcategories`}
                    size="small"
                    variant="outlined"
                  />
                  <Chip label={`${cat.flashcards_count} cards`} size="small" variant="outlined" />
                </Box>
                <Collapse in={expanded}>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Subcategory</TableCell>
                          <TableCell align="right">Cards</TableCell>
                          <TableCell>Created</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {cat.subcategories.map((sub) => (
                          <TableRow key={sub.id}>
                            <TableCell>{sub.title}</TableCell>
                            <TableCell align="right">{sub.flashcards_count}</TableCell>
                            <TableCell sx={{ color: 'text.secondary' }}>
                              {new Date(sub.created_at).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Collapse>
              </Box>
            );
          })}
        </Paper>
      )}
    </Box>
  );
};

export default UserDetail;
