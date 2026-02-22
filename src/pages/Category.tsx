import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Fab,
  IconButton,
  InputAdornment,
  Pagination,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LayersIcon from "@mui/icons-material/Layers";
import { useNavigate, useParams } from "react-router-dom";
import {
  createSubCategory,
  deleteSubCategory,
  listSubCategories,
  updateSubCategory,
} from "../api/subcategories";
import { getCategory } from "../api/categories";
import type { Category, SubCategory } from "../types/content.types";
import SubCategoryCard from "../components/SubCategoryCard";
import { extractErrorMessage } from "../utils/error";

const PER_PAGE = 12;

const CategoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { categoryId } = useParams<{ categoryId: string }>();
  const catId = Number(categoryId);

  // ── category ────────────────────────────────────────────────────────────────
  const [category, setCategory] = useState<Category | null>(null);

  // ── subcategories ───────────────────────────────────────────────────────────
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listError, setListError] = useState("");

  // ── create / edit dialog ────────────────────────────────────────────────────
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<SubCategory | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  // ── delete confirmation ──────────────────────────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState<SubCategory | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ── load category info ───────────────────────────────────────────────────────
  useEffect(() => {
    getCategory(catId).then(setCategory).catch(() => {});
  }, [catId]);

  // ── fetch subcategories ──────────────────────────────────────────────────────
  const fetchSubs = useCallback(async () => {
    setLoading(true);
    setListError("");
    try {
      const data = await listSubCategories(catId, {
        search: search || undefined,
        page,
        per_page: PER_PAGE,
      });
      setSubCategories(data.items);
      setTotal(data.total);
      setPages(data.pages);
    } catch (err) {
      setListError(extractErrorMessage(err, "Failed to load subcategories."));
    } finally {
      setLoading(false);
    }
  }, [catId, search, page]);

  useEffect(() => {
    fetchSubs();
  }, [fetchSubs]);

  // ── search ──────────────────────────────────────────────────────────────────
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  // ── create / edit ─────────────────────────────────────────────────────────────
  const openCreateDialog = () => {
    setEditingSub(null);
    setFormTitle("");
    setFormDescription("");
    setFormError("");
    setIsDialogOpen(true);
  };

  const openEditDialog = (sub: SubCategory) => {
    setEditingSub(sub);
    setFormTitle(sub.title);
    setFormDescription(sub.description ?? "");
    setFormError("");
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setFormError("");
  };

  const handleSave = async () => {
    const trimmedTitle = formTitle.trim();
    if (!trimmedTitle) { setFormError("Title is required."); return; }
    setSaving(true);
    setFormError("");
    try {
      if (editingSub) {
        await updateSubCategory(editingSub.id, {
          title: trimmedTitle,
          description: formDescription.trim() || null,
        });
      } else {
        await createSubCategory(catId, {
          title: trimmedTitle,
          description: formDescription.trim() || null,
        });
      }
      closeDialog();
      setPage(1);
      fetchSubs();
    } catch (err) {
      setFormError(extractErrorMessage(err, "Failed to save subcategory."));
    } finally {
      setSaving(false);
    }
  };

  // ── delete ──────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteSubCategory(deleteTarget.id);
      setDeleteTarget(null);
      if (subCategories.length === 1 && page > 1) setPage((p) => p - 1);
      else fetchSubs();
    } catch {
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const categoryTitle = category?.title ?? "Category";

  return (
    <Box className="w-full">
      <Box className="mx-auto w-full px-4 pb-20 pt-6 sm:px-6 lg:px-8">
        {/* ── Header ── */}
        <Box className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Box>
            <Box className="flex items-center gap-2">
              <IconButton aria-label="back" onClick={() => navigate("/categories")}>
                <ArrowBackIcon />
              </IconButton>
              <Typography variant="h4" className="font-bold">
                {categoryTitle}
              </Typography>
            </Box>
            {category?.description && (
              <Typography variant="body1" color="text.secondary" className="mt-1 ml-12">
                {category.description}
              </Typography>
            )}
          </Box>
          <Chip
            label={`${total} subcategories`}
            color="secondary"
            variant="outlined"
            className="font-semibold"
          />
        </Box>

        <Divider className="my-4" />

        {/* ── Search ── */}
        <Box component="form" onSubmit={handleSearchSubmit} className="mb-5 flex gap-2">
          <TextField
            size="small"
            placeholder="Search subcategories…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LayersIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ flex: 1, maxWidth: 400 }}
          />
          <Button type="submit" variant="outlined" size="small">Search</Button>
          {search && (
            <Button variant="text" size="small" onClick={() => { setSearchInput(""); setSearch(""); setPage(1); }}>
              Clear
            </Button>
          )}
        </Box>

        {listError && <Alert severity="error" className="mb-4">{listError}</Alert>}

        {/* ── Content ── */}
        {loading ? (
          <Box className="flex justify-center py-16"><CircularProgress /></Box>
        ) : subCategories.length === 0 ? (
          <Card className="border border-dashed border-gray-200/70">
            <CardContent className="py-12 text-center">
              <Typography variant="h6" className="font-semibold">
                {search ? "No subcategories match your search." : "No subcategories yet"}
              </Typography>
              <Typography variant="body2" color="text.secondary" className="mt-1">
                {search ? "Try a different keyword." : "Add one to start organizing this category."}
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <>
            <Box className="flex flex-wrap gap-6">
              {subCategories.map((sub) => (
                <SubCategoryCard
                  key={sub.id}
                  item={sub}
                  onClick={() => navigate(`/categories/${catId}/subcategories/${sub.id}`)}
                  onEdit={() => openEditDialog(sub)}
                  onDelete={() => setDeleteTarget(sub)}
                />
              ))}
            </Box>
            {pages > 1 && (
              <Box className="flex justify-center mt-6">
                <Pagination count={pages} page={page} onChange={(_, v) => setPage(v)} color="primary" />
              </Box>
            )}
          </>
        )}
      </Box>

      {/* ── FAB ── */}
      <Fab
        color="primary"
        aria-label="add subcategory"
        onClick={openCreateDialog}
        sx={{ position: "fixed", right: { xs: 16, sm: 24 }, bottom: { xs: 16, sm: 24 }, boxShadow: "0 16px 32px rgba(0,0,0,0.15)" }}
      >
        <AddIcon />
      </Fab>

      {/* ── Create / Edit dialog ── */}
      <Dialog open={isDialogOpen} onClose={closeDialog} fullWidth maxWidth="xs">
        <DialogTitle className="flex items-center justify-between py-3 px-3">
          {editingSub ? "Edit subcategory" : "New subcategory"}
          <IconButton aria-label="close" onClick={closeDialog} size="small"><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent className="pb-0 px-3">
          <TextField
            autoFocus fullWidth label="Title"
            value={formTitle}
            onChange={(e) => { setFormTitle(e.target.value); setFormError(""); }}
            error={!!formError && !formTitle.trim()}
            helperText={(!!formError && !formTitle.trim()) ? formError : " "}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleSave(); } }}
          />
          <TextField
            fullWidth label="Description (optional)"
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
            multiline minRows={3} className="mt-2 mb-1"
          />
          {formError && formTitle.trim() && (
            <Alert severity="error" className="mb-2">{formError}</Alert>
          )}
        </DialogContent>
        <DialogActions className="px-3 pb-3 pt-2 gap-1">
          <Button onClick={closeDialog} variant="text" disabled={saving}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={saving}>
            {saving ? <CircularProgress size={18} /> : editingSub ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete confirmation ── */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete subcategory?</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Deleting <strong>"{deleteTarget?.title}"</strong> will also delete all flashcards inside it.
          </Typography>
        </DialogContent>
        <DialogActions className="px-3 pb-3 gap-1">
          <Button onClick={() => setDeleteTarget(null)} variant="text" disabled={deleting}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={deleting}>
            {deleting ? <CircularProgress size={18} /> : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CategoryPage;
