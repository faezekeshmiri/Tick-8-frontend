import React, { useState, useContext } from "react";
import {
  Box,
  Button,
  Card,
  CardActions,
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
  Alert,
  useTheme,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ThemeModeContext } from "../contexts/ThemeContext";
import { lightTheme, darkTheme } from "../assets/theme";
import {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory,
} from "../api/categories";
import { queryKeys } from "../api/queryKeys";
import type { Category } from "../types/content.types";
import { extractErrorMessage } from "../utils/error";

const PER_PAGE = 12;

const Categories: React.FC = () => {
  const { isDarkMode } = useContext(ThemeModeContext);
  const palette = (isDarkMode ? darkTheme : lightTheme).palette;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const {
    data,
    isLoading: loading,
    error: listErrorRaw,
  } = useQuery({
    queryKey: queryKeys.categories(search, page),
    queryFn: () =>
      listCategories({ search: search || undefined, page, per_page: PER_PAGE }),
  });

  const categories = data?.items ?? [];
  const total = data?.total ?? 0;
  const pages = data?.pages ?? 1;
  const listError = listErrorRaw ? extractErrorMessage(listErrorRaw, "Failed to load categories.") : "";

  const saveMutation = useMutation({
    mutationFn: async (payload: {
      id?: number;
      title: string;
      description: string | null;
    }) => {
      if (payload.id) {
        return updateCategory(payload.id, {
          title: payload.title,
          description: payload.description,
        });
      }
      return createCategory({
        title: payload.title,
        description: payload.description,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      closeDialog();
      setPage(1);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setDeleteTarget(null);
    },
  });

  // ── create / edit dialog ────────────────────────────────────────────────────
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formError, setFormError] = useState("");

  // ── delete confirmation dialog ───────────────────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  // ── search ──────────────────────────────────────────────────────────────────
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  // ── create / edit ────────────────────────────────────────────────────────────
  const openCreateDialog = () => {
    setEditingCategory(null);
    setFormTitle("");
    setFormDescription("");
    setFormError("");
    setIsDialogOpen(true);
  };

  const openEditDialog = (cat: Category) => {
    setEditingCategory(cat);
    setFormTitle(cat.title);
    setFormDescription(cat.description ?? "");
    setFormError("");
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setFormError("");
  };

  const handleSave = async () => {
    const trimmedTitle = formTitle.trim();
    if (!trimmedTitle) {
      setFormError("Title is required.");
      return;
    }
    setFormError("");
    saveMutation.mutate(
      {
        id: editingCategory?.id,
        title: trimmedTitle,
        description: formDescription.trim() || null,
      },
      {
        onError: (err) => {
          setFormError(extractErrorMessage(err, "Failed to save category."));
        },
      }
    );
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onError: () => setDeleteTarget(null),
    });
    if (categories.length === 1 && page > 1) setPage((p) => p - 1);
  };

  return (
    <Box className="w-full">
      <Box className="mx-auto w-full px-4 pb-20 pt-6 sm:px-6 lg:px-8">
        {/* ── Header ── */}
        <Box className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Box>
            <Typography variant="h4" className="font-bold">
              Categories
            </Typography>
            <Typography variant="body1" color="text.secondary" className="mt-1">
              Organize your study sets by topic.
            </Typography>
          </Box>
          <Chip
            label={`${total} total`}
            color="secondary"
            variant="outlined"
            className="font-semibold"
          />
        </Box>

        <Divider className="my-4" />

        {/* ── Search bar ── */}
        <Box component="form" onSubmit={handleSearchSubmit} className="mb-5 flex gap-2">
          <TextField
            size="small"
            placeholder="Search categories…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ flex: 1, maxWidth: 400 }}
          />
          <Button type="submit" variant="outlined" size="small">
            Search
          </Button>
          {search && (
            <Button
              variant="text"
              size="small"
              onClick={() => { setSearchInput(""); setSearch(""); setPage(1); }}
            >
              Clear
            </Button>
          )}
        </Box>

        {/* ── Error ── */}
        {listError && (
          <Alert severity="error" className="mb-4">
            {listError}
          </Alert>
        )}

        {/* ── Loading ── */}
        {loading ? (
          <Box className="flex justify-center py-16">
            <CircularProgress />
          </Box>
        ) : categories.length === 0 ? (
          <Card className="border border-dashed border-gray-200/70">
            <CardContent className="py-12 text-center">
              <FolderOpenIcon sx={{ fontSize: 48 }} color="disabled" />
              <Typography variant="h6" className="font-semibold mt-3">
                {search ? "No categories match your search." : "No categories yet"}
              </Typography>
              <Typography variant="body2" color="text.secondary" className="mt-1">
                {search ? "Try a different keyword." : "Create your first category to get started."}
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <>
            <Box className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((cat) => (
                <Card
                  key={cat.id}
                  className="border border-gray-100/70 shadow-sm"
                  sx={{
                    cursor: "pointer",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 12px 24px rgba(15,23,42,0.08)",
                    },
                  }}
                  onClick={() => navigate(`/categories/${cat.id}/subcategories`)}
                >
                  <CardContent>
                    <Box className="flex items-start justify-between gap-3">
                      <Box className="min-w-0">
                        <Typography variant="subtitle1" className="font-semibold truncate">
                          {cat.title}
                        </Typography>
                        {cat.description && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            className="mt-1 line-clamp-2"
                          >
                            {cat.description}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                    <Box className="mt-3 flex gap-2 flex-wrap">
                      <Chip
                        label={`${cat.subcategory_count} subcategories`}
                        size="small"
                        variant="outlined"
                        color="primary"
                      />
                      <Chip
                        label={`${cat.flashcard_count} flashcards`}
                        size="small"
                        variant="outlined"
                        color="secondary"
                      />
                    </Box>
                  </CardContent>
                  <CardActions className="px-2 pb-2 gap-1">
                    <Button
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={(e) => { e.stopPropagation(); openEditDialog(cat); }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={(e) => { e.stopPropagation(); setDeleteTarget(cat); }}
                    >
                      Delete
                    </Button>
                  </CardActions>
                </Card>
              ))}
            </Box>

            {pages > 1 && (
              <Box className="flex justify-center mt-6">
                <Pagination
                  count={pages}
                  page={page}
                  onChange={(_, v) => setPage(v)}
                  color="primary"
                />
              </Box>
            )}
          </>
        )}
      </Box>

      {/* ── FAB ── */}
      <Fab
        aria-label="add category"
        onClick={openCreateDialog}
        sx={{
          position: "fixed",
          right: { xs: 16, sm: 24 },
          bottom: { xs: 16, sm: 24 },
          backgroundColor: palette.primary.main,
          color: palette.primary.contrastText,
          boxShadow: isDarkMode
            ? "0 16px 32px rgba(0,0,0,0.4)"
            : "0 16px 32px rgba(0,0,0,0.15)",
          "&:hover": {
            backgroundColor: palette.primary.dark,
            color: palette.primary.contrastText,
          },
        }}
      >
        <AddIcon />
      </Fab>

      {/* ── Create / Edit dialog ── */}
      <Dialog open={isDialogOpen} onClose={closeDialog} fullWidth maxWidth="xs">
        <DialogTitle className="flex items-center justify-between py-3 px-3">
          {editingCategory ? "Edit category" : "New category"}
          <IconButton aria-label="close" onClick={closeDialog} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent className="pb-0 px-3">
          <TextField
            autoFocus
            fullWidth
            label="Title"
            value={formTitle}
            onChange={(e) => { setFormTitle(e.target.value); setFormError(""); }}
            error={!!formError && !formTitle.trim()}
            helperText={(!!formError && !formTitle.trim()) ? formError : " "}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleSave(); } }}
          />
          <TextField
            fullWidth
            label="Description (optional)"
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
            multiline
            minRows={3}
            className="mt-2 mb-1"
          />
          {formError && formTitle.trim() && (
            <Alert severity="error" className="mb-2">
              {formError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions className="px-3 pb-3 pt-2 gap-1">
          <Button onClick={closeDialog} variant="text" disabled={saveMutation.isPending}>
            Cancel
          </Button>
          <Button onClick={handleSave} variant="contained" disabled={saveMutation.isPending}>
            {saveMutation.isPending ? <CircularProgress size={18} /> : editingCategory ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete confirmation dialog ── */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete category?</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Deleting <strong>"{deleteTarget?.title}"</strong> will also delete all subcategories
            and flashcards inside it. This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions className="px-3 pb-3 gap-1">
          <Button onClick={() => setDeleteTarget(null)} variant="text" disabled={deleteMutation.isPending}>
            Cancel
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={deleteMutation.isPending}>
            {deleteMutation.isPending ? <CircularProgress size={18} /> : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Categories;
