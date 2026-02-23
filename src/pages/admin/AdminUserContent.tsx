import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Typography,
} from '@mui/material';
import {
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  Folder as FolderIcon,
  FolderOpen as FolderOpenIcon,
  Style as StyleIcon,
} from '@mui/icons-material';
import * as adminApi from '../../api/admin';
import type { Category, Flashcard, FlashcardSide, SubCategory } from '../../types/content.types';
import { extractErrorMessage } from '../../utils/error';

const PER_PAGE = 100;

const AdminUserContent: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const uid = userId ? parseInt(userId, 10) : NaN;

  const [userName, setUserName] = useState<string>('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [expandedCategory, setExpandedCategory] = useState<number | null>(null);
  const [subcategoriesByCategory, setSubcategoriesByCategory] = useState<Record<number, SubCategory[]>>({});
  const [expandedSub, setExpandedSub] = useState<number | null>(null);
  const [flashcardsBySub, setFlashcardsBySub] = useState<Record<number, Flashcard[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; severity: 'success' | 'error' } | null>(null);

  const loadUserAndCategories = useCallback(async () => {
    if (Number.isNaN(uid)) {
      setError('Invalid user ID');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [detail, catData] = await Promise.all([
        adminApi.getUserDetail(uid),
        adminApi.adminListCategories(uid, { per_page: PER_PAGE }),
      ]);
      setUserName(detail.user.display_name);
      setCategories(catData.items);
      setSubcategoriesByCategory({});
      setFlashcardsBySub({});
      setExpandedCategory(null);
      setExpandedSub(null);
    } catch (err) {
      setError(extractErrorMessage(err, 'Failed to load data.'));
    } finally {
      setLoading(false);
    }
  }, [uid]);

  useEffect(() => {
    loadUserAndCategories();
  }, [loadUserAndCategories]);

  const loadSubcategories = useCallback(
    async (categoryId: number) => {
      if (Number.isNaN(uid)) return;
      try {
        const data = await adminApi.adminListSubCategories(uid, categoryId, { per_page: PER_PAGE });
        setSubcategoriesByCategory((prev) => ({ ...prev, [categoryId]: data.items }));
      } catch (err) {
        setToast({ message: extractErrorMessage(err, 'Failed to load subcategories.'), severity: 'error' });
      }
    },
    [uid],
  );

  const loadFlashcards = useCallback(
    async (subId: number) => {
      if (Number.isNaN(uid)) return;
      try {
        const data = await adminApi.adminListFlashcards(uid, subId, { per_page: PER_PAGE });
        setFlashcardsBySub((prev) => ({ ...prev, [subId]: data.items }));
      } catch (err) {
        setToast({ message: extractErrorMessage(err, 'Failed to load flashcards.'), severity: 'error' });
      }
    },
    [uid],
  );

  const toggleCategory = (categoryId: number) => {
    setExpandedCategory((prev) => (prev === categoryId ? null : categoryId));
    if (!subcategoriesByCategory[categoryId]) loadSubcategories(categoryId);
  };

  const toggleSub = (subId: number) => {
    setExpandedSub((prev) => (prev === subId ? null : subId));
    if (!flashcardsBySub[subId]) loadFlashcards(subId);
  };

  // ─── Category CRUD ───────────────────────────────────────────────────────
  const [catDialog, setCatDialog] = useState<{ open: boolean; category: Category | null; title: string; description: string }>({
    open: false,
    category: null,
    title: '',
    description: '',
  });
  const [catSaving, setCatSaving] = useState(false);
  const [catError, setCatError] = useState('');
  const openAddCategory = () => {
    setCatDialog({ open: true, category: null, title: '', description: '' });
    setCatError('');
  };
  const openEditCategory = (c: Category) => {
    setCatDialog({ open: true, category: c, title: c.title, description: c.description ?? '' });
    setCatError('');
  };
  const saveCategory = async () => {
    const title = catDialog.title.trim();
    if (!title) {
      setCatError('Title is required.');
      return;
    }
    setCatSaving(true);
    setCatError('');
    try {
      if (catDialog.category) {
        await adminApi.adminUpdateCategory(uid, catDialog.category.id, { title, description: catDialog.description || null });
        setToast({ message: 'Category updated.', severity: 'success' });
      } else {
        await adminApi.adminCreateCategory(uid, { title, description: catDialog.description || null });
        setToast({ message: 'Category created.', severity: 'success' });
      }
      setCatDialog((d) => ({ ...d, open: false }));
      loadUserAndCategories();
    } catch (err) {
      setCatError(extractErrorMessage(err, 'Failed to save category.'));
    } finally {
      setCatSaving(false);
    }
  };
  const [deleteCat, setDeleteCat] = useState<Category | null>(null);
  const confirmDeleteCategory = async () => {
    if (!deleteCat) return;
    try {
      await adminApi.adminDeleteCategory(uid, deleteCat.id);
      setToast({ message: 'Category deleted.', severity: 'success' });
      setDeleteCat(null);
      loadUserAndCategories();
    } catch (err) {
      setToast({ message: extractErrorMessage(err, 'Delete failed.'), severity: 'error' });
    }
  };

  // ─── Subcategory CRUD ───────────────────────────────────────────────────
  const [subDialog, setSubDialog] = useState<{
    open: boolean;
    categoryId: number;
    sub: SubCategory | null;
    title: string;
    description: string;
  }>({ open: false, categoryId: 0, sub: null, title: '', description: '' });
  const [subSaving, setSubSaving] = useState(false);
  const [subError, setSubError] = useState('');
  const openAddSub = (categoryId: number) => {
    setSubDialog({ open: true, categoryId, sub: null, title: '', description: '' });
    setSubError('');
  };
  const openEditSub = (s: SubCategory) => {
    setSubDialog({ open: true, categoryId: s.category_id, sub: s, title: s.title, description: s.description ?? '' });
    setSubError('');
  };
  const saveSub = async () => {
    const title = subDialog.title.trim();
    if (!title) {
      setSubError('Title is required.');
      return;
    }
    setSubSaving(true);
    setSubError('');
    try {
      if (subDialog.sub) {
        await adminApi.adminUpdateSubCategory(uid, subDialog.sub.id, { title, description: subDialog.description || null });
        setToast({ message: 'Subcategory updated.', severity: 'success' });
      } else {
        await adminApi.adminCreateSubCategory(uid, subDialog.categoryId, { title, description: subDialog.description || null });
        setToast({ message: 'Subcategory created.', severity: 'success' });
      }
      setSubDialog((d) => ({ ...d, open: false }));
      if (subcategoriesByCategory[subDialog.categoryId]) loadSubcategories(subDialog.categoryId);
      loadUserAndCategories();
    } catch (err) {
      setSubError(extractErrorMessage(err, 'Failed to save subcategory.'));
    } finally {
      setSubSaving(false);
    }
  };
  const [deleteSub, setDeleteSub] = useState<SubCategory | null>(null);
  const confirmDeleteSub = async () => {
    if (!deleteSub) return;
    try {
      await adminApi.adminDeleteSubCategory(uid, deleteSub.id);
      setToast({ message: 'Subcategory deleted.', severity: 'success' });
      setDeleteSub(null);
      loadSubcategories(deleteSub.category_id);
      loadUserAndCategories();
    } catch (err) {
      setToast({ message: extractErrorMessage(err, 'Delete failed.'), severity: 'error' });
    }
  };

  // ─── Flashcard CRUD (simple text front/back) ──────────────────────────────
  const defaultSide: FlashcardSide = { type: 'text', text: '', image_url: null };
  const [cardDialog, setCardDialog] = useState<{
    open: boolean;
    subId: number;
    card: Flashcard | null;
    front: FlashcardSide;
    back: FlashcardSide;
  }>({ open: false, subId: 0, card: null, front: defaultSide, back: defaultSide });
  const [cardSaving, setCardSaving] = useState(false);
  const [cardError, setCardError] = useState('');
  const openAddCard = (subId: number) => {
    setCardDialog({ open: true, subId, card: null, front: defaultSide, back: defaultSide });
    setCardError('');
  };
  const openEditCard = (card: Flashcard) => {
    setCardDialog({
      open: true,
      subId: card.sub_category_id,
      card,
      front: card.front,
      back: card.back,
    });
    setCardError('');
  };
  const saveCard = async () => {
    const frontText = (cardDialog.front.type === 'text' ? cardDialog.front.text : null)?.trim();
    const backText = (cardDialog.back.type === 'text' ? cardDialog.back.text : null)?.trim();
    if (cardDialog.front.type === 'text' && !frontText) {
      setCardError('Front text is required.');
      return;
    }
    if (cardDialog.back.type === 'text' && !backText) {
      setCardError('Back text is required.');
      return;
    }
    setCardSaving(true);
    setCardError('');
    const front: FlashcardSide =
      cardDialog.front.type === 'text'
        ? { type: 'text', text: frontText ?? '', image_url: null }
        : cardDialog.front;
    const back: FlashcardSide =
      cardDialog.back.type === 'text' ? { type: 'text', text: backText ?? '', image_url: null } : cardDialog.back;
    try {
      if (cardDialog.card) {
        await adminApi.adminUpdateFlashcard(uid, cardDialog.card.id, { front, back });
        setToast({ message: 'Flashcard updated.', severity: 'success' });
      } else {
        await adminApi.adminCreateFlashcard(uid, cardDialog.subId, { front, back });
        setToast({ message: 'Flashcard created.', severity: 'success' });
      }
      setCardDialog((d) => ({ ...d, open: false }));
      if (flashcardsBySub[cardDialog.subId]) loadFlashcards(cardDialog.subId);
      loadUserAndCategories();
    } catch (err) {
      setCardError(extractErrorMessage(err, 'Failed to save flashcard.'));
    } finally {
      setCardSaving(false);
    }
  };
  const [deleteCard, setDeleteCard] = useState<Flashcard | null>(null);
  const confirmDeleteCard = async () => {
    if (!deleteCard) return;
    try {
      await adminApi.adminDeleteFlashcard(uid, deleteCard.id);
      setToast({ message: 'Flashcard deleted.', severity: 'success' });
      setDeleteCard(null);
      loadFlashcards(deleteCard.sub_category_id);
      loadUserAndCategories();
    } catch (err) {
      setToast({ message: extractErrorMessage(err, 'Delete failed.'), severity: 'error' });
    }
  };

  if (Number.isNaN(uid)) {
    return (
      <Box>
        <Typography color="error">Invalid user.</Typography>
        <Button onClick={() => navigate('/admin/users')}>Back to users</Button>
      </Box>
    );
  }

  if (loading && categories.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Alert severity="error">{error}</Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(`/admin/users/${uid}`)} sx={{ mt: 2 }}>
          Back
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, flexWrap: 'wrap' }}>
        <IconButton aria-label="Back" onClick={() => navigate(`/admin/users/${uid}`)} size="small">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" fontWeight="bold">
          Manage content: {userName}
        </Typography>
      </Box>

      {toast && (
        <Alert
          severity={toast.severity}
          onClose={() => setToast(null)}
          sx={{ mb: 2 }}
        >
          {toast.message}
        </Alert>
      )}

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openAddCategory}>
          Add category
        </Button>
        <Chip label={`${categories.length} categories`} size="small" variant="outlined" />
      </Box>

      {categories.length === 0 ? (
        <Card variant="outlined">
          <CardContent sx={{ py: 4, textAlign: 'center' }}>
            <FolderIcon sx={{ fontSize: 48 }} color="disabled" />
            <Typography sx={{ mt: 1 }}>No categories. Add one to get started.</Typography>
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {categories.map((cat) => {
            const expanded = expandedCategory === cat.id;
            const subs = subcategoriesByCategory[cat.id] ?? [];
            return (
              <Card key={cat.id} variant="outlined" sx={{ mb: 1 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    p: 1.5,
                    cursor: 'pointer',
                    bgcolor: expanded ? 'action.hover' : undefined,
                  }}
                  onClick={() => toggleCategory(cat.id)}
                >
                  <IconButton size="small">{expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}</IconButton>
                  <FolderOpenIcon fontSize="small" color="action" />
                  <Typography variant="subtitle1" fontWeight="600" sx={{ flex: 1 }}>
                    {cat.title}
                  </Typography>
                  <Chip size="small" label={`${cat.subcategory_count} subcategories`} variant="outlined" />
                  <Chip size="small" label={`${cat.flashcard_count} cards`} variant="outlined" />
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditCategory(cat);
                    }}
                    aria-label="Edit category"
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteCat(cat);
                    }}
                    aria-label="Delete category"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                  <Button
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={(e) => {
                      e.stopPropagation();
                      openAddSub(cat.id);
                    }}
                  >
                    Add subcategory
                  </Button>
                </Box>
                <Collapse in={expanded}>
                  <Box sx={{ pl: 4, pr: 2, pb: 2 }}>
                    {subs.length === 0 && !expanded ? null : subs.length === 0 ? (
                      <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                        No subcategories. Add one above.
                      </Typography>
                    ) : (
                      subs.map((sub) => {
                        const subExpanded = expandedSub === sub.id;
                        const cards = flashcardsBySub[sub.id] ?? [];
                        return (
                          <Card key={sub.id} variant="outlined" sx={{ mt: 1 }}>
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                p: 1,
                                cursor: 'pointer',
                                bgcolor: subExpanded ? 'action.hover' : undefined,
                              }}
                              onClick={() => toggleSub(sub.id)}
                            >
                              <IconButton size="small">{subExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}</IconButton>
                              <Typography variant="body2" fontWeight="500" sx={{ flex: 1 }}>
                                {sub.title}
                              </Typography>
                              <Chip size="small" label={`${sub.flashcard_count} cards`} variant="outlined" />
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEditSub(sub);
                                }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteSub(sub);
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                              <Button
                                size="small"
                                startIcon={<AddIcon />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openAddCard(sub.id);
                                }}
                              >
                                Add card
                              </Button>
                            </Box>
                            <Collapse in={subExpanded}>
                              <Box sx={{ pl: 4, pr: 2, pb: 2 }}>
                                {cards.length === 0 ? (
                                  <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
                                    No flashcards. Add one above.
                                  </Typography>
                                ) : (
                                  cards.map((card) => (
                                    <Box
                                      key={card.id}
                                      sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                        py: 0.5,
                                        borderBottom: '1px solid',
                                        borderColor: 'divider',
                                      }}
                                    >
                                      <StyleIcon fontSize="small" color="action" />
                                      <Typography variant="body2" sx={{ flex: 1 }} noWrap>
                                        {card.front.type === 'text'
                                          ? (card.front.text ?? '').replace(/<[^>]*>/g, '').slice(0, 60) || '—'
                                          : '[Image]'}
                                        {' → '}
                                        {card.back.type === 'text'
                                          ? (card.back.text ?? '').replace(/<[^>]*>/g, '').slice(0, 40) || '—'
                                          : '[Image]'}
                                      </Typography>
                                      <IconButton size="small" onClick={() => openEditCard(card)}>
                                        <EditIcon fontSize="small" />
                                      </IconButton>
                                      <IconButton size="small" color="error" onClick={() => setDeleteCard(card)}>
                                        <DeleteIcon fontSize="small" />
                                      </IconButton>
                                    </Box>
                                  ))
                                )}
                              </Box>
                            </Collapse>
                          </Card>
                        );
                      })
                    )}
                  </Box>
                </Collapse>
              </Card>
            );
          })}
        </Box>
      )}

      {/* Category create/edit dialog */}
      <Dialog open={catDialog.open} onClose={() => setCatDialog((d) => ({ ...d, open: false }))} maxWidth="sm" fullWidth>
        <DialogTitle>{catDialog.category ? 'Edit category' : 'Add category'}</DialogTitle>
        <DialogContent>
          {catError && <Alert severity="error" sx={{ mb: 2 }}>{catError}</Alert>}
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            fullWidth
            value={catDialog.title}
            onChange={(e) => setCatDialog((d) => ({ ...d, title: e.target.value }))}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={2}
            value={catDialog.description}
            onChange={(e) => setCatDialog((d) => ({ ...d, description: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCatDialog((d) => ({ ...d, open: false }))}>Cancel</Button>
          <Button onClick={saveCategory} variant="contained" disabled={catSaving}>
            {catSaving ? <CircularProgress size={20} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Subcategory create/edit dialog */}
      <Dialog open={subDialog.open} onClose={() => setSubDialog((d) => ({ ...d, open: false }))} maxWidth="sm" fullWidth>
        <DialogTitle>{subDialog.sub ? 'Edit subcategory' : 'Add subcategory'}</DialogTitle>
        <DialogContent>
          {subError && <Alert severity="error" sx={{ mb: 2 }}>{subError}</Alert>}
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            fullWidth
            value={subDialog.title}
            onChange={(e) => setSubDialog((d) => ({ ...d, title: e.target.value }))}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={2}
            value={subDialog.description}
            onChange={(e) => setSubDialog((d) => ({ ...d, description: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSubDialog((d) => ({ ...d, open: false }))}>Cancel</Button>
          <Button onClick={saveSub} variant="contained" disabled={subSaving}>
            {subSaving ? <CircularProgress size={20} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Flashcard create/edit dialog */}
      <Dialog open={cardDialog.open} onClose={() => setCardDialog((d) => ({ ...d, open: false }))} maxWidth="sm" fullWidth>
        <DialogTitle>{cardDialog.card ? 'Edit flashcard' : 'Add flashcard'}</DialogTitle>
        <DialogContent>
          {cardError && <Alert severity="error" sx={{ mb: 2 }}>{cardError}</Alert>}
          <TextField
            autoFocus
            margin="dense"
            label="Front (text)"
            fullWidth
            multiline
            rows={3}
            value={cardDialog.front.type === 'text' ? (cardDialog.front.text ?? '') : ''}
            onChange={(e) =>
              setCardDialog((d) => ({
                ...d,
                front: { type: 'text' as const, text: e.target.value, image_url: null },
              }))
            }
            placeholder="Front side text"
          />
          <TextField
            margin="dense"
            label="Back (text)"
            fullWidth
            multiline
            rows={3}
            value={cardDialog.back.type === 'text' ? (cardDialog.back.text ?? '') : ''}
            onChange={(e) =>
              setCardDialog((d) => ({
                ...d,
                back: { type: 'text' as const, text: e.target.value, image_url: null },
              }))
            }
            placeholder="Back side text"
          />
          {cardDialog.card && (cardDialog.front.type === 'image' || cardDialog.back.type === 'image') && (
            <Typography variant="caption" color="text.secondary">
              One or both sides use an image; edit in the main app for full editor.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCardDialog((d) => ({ ...d, open: false }))}>Cancel</Button>
          <Button onClick={saveCard} variant="contained" disabled={cardSaving}>
            {cardSaving ? <CircularProgress size={20} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirm dialogs */}
      <Dialog open={!!deleteCat} onClose={() => setDeleteCat(null)}>
        <DialogTitle>Delete category?</DialogTitle>
        <DialogContent>
          This will soft-delete &quot;{deleteCat?.title}&quot; and all its subcategories and flashcards. They can be restored from Trash.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteCat(null)}>Cancel</Button>
          <Button onClick={confirmDeleteCategory} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={!!deleteSub} onClose={() => setDeleteSub(null)}>
        <DialogTitle>Delete subcategory?</DialogTitle>
        <DialogContent>
          This will soft-delete &quot;{deleteSub?.title}&quot; and all its flashcards. They can be restored from Trash.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteSub(null)}>Cancel</Button>
          <Button onClick={confirmDeleteSub} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={!!deleteCard} onClose={() => setDeleteCard(null)}>
        <DialogTitle>Delete flashcard?</DialogTitle>
        <DialogContent>
          This card will be moved to Trash and can be restored.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteCard(null)}>Cancel</Button>
          <Button onClick={confirmDeleteCard} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminUserContent;
