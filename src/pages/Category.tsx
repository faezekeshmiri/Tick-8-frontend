import React, { useState } from "react";
import { useTranslation } from 'react-i18next';
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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useThemeMode } from "../contexts/ThemeContext";
import { lightTheme, darkTheme } from "../assets/theme";
import {
  createSubCategory,
  deleteSubCategory,
  listSubCategories,
  updateSubCategory,
} from "../api/subcategories";
import { getCategory } from "../api/categories";
import { queryKeys } from "../api/queryKeys";
import type { Category, SubCategory } from "../types/content.types";
import SubCategoryCard from "../components/SubCategoryCard";
import SubcategoryColorPicker from "../components/SubcategoryColorPicker";
import { extractErrorMessage } from "../utils/error";
import { DEFAULT_SUBCATEGORY_COLOR, resolveSubcategoryColor } from "../utils/subcategoryColors";

const PER_PAGE = 12;

const CategoryPage: React.FC = () => {
  const { t } = useTranslation();
  const { isDarkMode } = useThemeMode();
  const palette = (isDarkMode ? darkTheme : lightTheme).palette;
  const navigate = useNavigate();
  const { categoryId } = useParams<{ categoryId: string }>();
  const catId = Number(categoryId);

  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<SubCategory | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formColor, setFormColor] = useState<string>(DEFAULT_SUBCATEGORY_COLOR);
  const [formError, setFormError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<SubCategory | null>(null);

  const { data: category } = useQuery({
    queryKey: queryKeys.category(catId),
    queryFn: () => getCategory(catId),
    enabled: !!catId && !Number.isNaN(catId),
  });
  const {
    data: subData,
    isLoading: loading,
    error: listErrorRaw,
  } = useQuery({
    queryKey: queryKeys.subcategories(catId, search, page),
    queryFn: () =>
      listSubCategories(catId, {
        search: search || undefined,
        page,
        per_page: PER_PAGE,
      }),
    enabled: !!catId && !Number.isNaN(catId),
  });
  const subCategories = subData?.items ?? [];
  const total = subData?.total ?? 0;
  const pages = subData?.pages ?? 1;
  const listError = listErrorRaw ? extractErrorMessage(listErrorRaw, t('category.loadError')) : "";
  const saveMutation = useMutation({
    mutationFn: async (payload: {
      id?: number;
      title: string;
      description: string | null;
      color: string;
    }) => {
      if (payload.id) {
        return updateSubCategory(payload.id, {
          title: payload.title,
          description: payload.description,
          color: payload.color,
        });
      }
      return createSubCategory(catId, {
        title: payload.title,
        description: payload.description,
        color: payload.color,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.subcategories(catId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.category(catId) });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      closeDialog();
      setPage(1);
    },
  });
  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteSubCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.subcategories(catId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.category(catId) });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setDeleteTarget(null);
    },
  });

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
    setFormColor(DEFAULT_SUBCATEGORY_COLOR);
    setFormError("");
    setIsDialogOpen(true);
  };

  const openEditDialog = (sub: SubCategory) => {
    setEditingSub(sub);
    setFormTitle(sub.title);
    setFormDescription(sub.description ?? "");
    setFormColor(resolveSubcategoryColor(sub.id, sub.color));
    setFormError("");
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setFormError("");
  };

  const handleSave = async () => {
    const trimmedTitle = formTitle.trim();
    if (!trimmedTitle) { setFormError(t('common.titleRequired')); return; }
    setFormError("");
    saveMutation.mutate(
      {
        id: editingSub?.id,
        title: trimmedTitle,
        description: formDescription.trim() || null,
        color: formColor,
      },
      {
        onError: (err) => {
          setFormError(extractErrorMessage(err, t('category.saveError')));
        },
      }
    );
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, { onError: () => setDeleteTarget(null) });
    if (subCategories.length === 1 && page > 1) setPage((p) => p - 1);
  };

  const categoryTitle = category?.title ?? t('category.fallback');

  return (
    <Box className="w-full">
      <Box className="mx-auto w-full px-4 pb-20 pt-6 sm:px-6 lg:px-8">
        {/* ── Header ── */}
        <Box className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Box>
            <Box className="flex items-center gap-2">
              <IconButton aria-label={t('common.back')} onClick={() => navigate("/categories")}>
                <ArrowBackIcon />
              </IconButton>
              <Typography variant="h4" className="font-bold">
                {categoryTitle}
              </Typography>
            </Box>
            {category?.description && (
              <Typography variant="body1" color="text.secondary" className="mt-1 ms-12">
                {category.description}
              </Typography>
            )}
          </Box>
          <Chip
            label={t('category.subcategoriesCount', { count: total })}
            color="secondary"
            variant="outlined"
            className="font-semibold"
          />
        </Box>

        <Divider className="!my-6" />

        {/* ── Search ── */}
        <Box component="form" onSubmit={handleSearchSubmit} className="mb-5 flex gap-2">
          <TextField
            size="small"
            placeholder={t('category.searchPlaceholder')}
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
          <Button type="submit" variant="outlined" size="small">{t('common.search')}</Button>
          {search && (
            <Button variant="text" size="small" onClick={() => { setSearchInput(""); setSearch(""); setPage(1); }}>
              {t('common.clear')}
            </Button>
          )}
        </Box>

        {listError && <Alert severity="error" className="mb-4">{listError}</Alert>}

        {/* ── Content ── */}
        {loading ? (
          <Box className="flex justify-center py-16"><CircularProgress /></Box>
        ) : subCategories.length === 0 ? (
          <Card className="border border-dashed border-gray-200/70 dark:border-gray-600/40">
            <CardContent className="py-12 text-center">
              <Typography variant="h6" className="font-semibold">
                {search ? t('category.noMatch') : t('category.noneYet')}
              </Typography>
              <Typography variant="body2" color="text.secondary" className="mt-1">
                {search ? t('category.tryDifferent') : t('category.addHint')}
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
        aria-label={t('category.addSubcategory')}
        onClick={openCreateDialog}
        sx={{
          position: "fixed",
          insetInlineEnd: { xs: 16, sm: 24 },
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
          {editingSub ? t('category.editSubcategory') : t('category.newSubcategory')}
          <IconButton aria-label={t('common.close')} onClick={closeDialog} size="small"><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent className="pb-0 pt-3 px-3" sx={{ overflow: "visible" }}>
          <TextField
            autoFocus fullWidth label={t('common.title')}
            value={formTitle}
            onChange={(e) => { setFormTitle(e.target.value); setFormError(""); }}
            error={!!formError && !formTitle.trim()}
            helperText={(!!formError && !formTitle.trim()) ? formError : " "}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleSave(); } }}
          />
          <TextField
            fullWidth label={t('common.descriptionOptional')}
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
            multiline minRows={3} className="mt-2 mb-1"
          />
          <SubcategoryColorPicker value={formColor} onChange={setFormColor} />
          {formError && formTitle.trim() && (
            <Alert severity="error" className="mb-2">{formError}</Alert>
          )}
        </DialogContent>
        <DialogActions className="px-3 pb-3 pt-2 gap-1">
          <Button onClick={closeDialog} variant="text" disabled={saveMutation.isPending}>{t('common.cancel')}</Button>
          <Button onClick={handleSave} variant="contained" disabled={saveMutation.isPending}>
            {saveMutation.isPending ? <CircularProgress size={18} /> : editingSub ? t('common.update') : t('common.create')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete confirmation ── */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle>{t('category.deleteSubcategory')}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" dangerouslySetInnerHTML={{ __html: t('category.deleteWarning', { title: deleteTarget?.title }) }} />
        </DialogContent>
        <DialogActions className="px-3 pb-3 gap-1">
          <Button onClick={() => setDeleteTarget(null)} variant="text" disabled={deleteMutation.isPending}>{t('common.cancel')}</Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={deleteMutation.isPending}>
            {deleteMutation.isPending ? <CircularProgress size={18} /> : t('common.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CategoryPage;
