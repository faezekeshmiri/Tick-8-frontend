import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Fab,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Pagination,
  Switch,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import ImageIcon from "@mui/icons-material/Image";
import TextFieldsIcon from "@mui/icons-material/TextFields";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from 'react-i18next';
import { ThemeModeContext } from "../contexts/ThemeContext";
import { lightTheme, darkTheme } from "../assets/theme";
import {
  createFlashcard,
  deleteFlashcard,
  listFlashcards,
  reorderFlashcards,
  updateFlashcard,
} from "../api/flashcards";
import { getSubCategory } from "../api/subcategories";
import { getCategory } from "../api/categories";
import { queryKeys } from "../api/queryKeys";
import {
  getSubcategoryCardProgress,
  getSubcategoryProgress,
  getTodaysQueue,
  getStudySettings,
  updateStudySettings,
  setProgressTicks,
} from "../api/study";
import { uploadImage, resolveImageUrl } from "../api/upload";
import type { Category, Flashcard, FlashcardSide, SubCategory } from "../types/content.types";
import type {
  SubcategoryProgressResponse,
  TickMark,
  UserStudySettingsResponse,
} from "../types/study.types";
import type { MarkType } from "../components/Flashcard/Flashcard";
import FlashcardComponent from "../components/Flashcard";
import RichTextEditor from "../components/RichTextEditor";
import { extractErrorMessage } from "../utils/error";

const PER_PAGE = 20;

// ─── HTML helpers ─────────────────────────────────────────────────────────────

/** Returns true if the string contains any HTML tag. */
const containsHtml = (text: string): boolean => /<[a-z][\s\S]*>/i.test(text);

/** Strips all HTML tags, returning plain text. */
const stripHtml = (html: string): string => {
  const el = document.createElement("div");
  el.innerHTML = html;
  return el.textContent ?? el.innerText ?? "";
};

// ─── Side editor ──────────────────────────────────────────────────────────────

interface SideEditorProps {
  label: string;
  value: FlashcardSide;
  onChange: (side: FlashcardSide) => void;
  error?: string;
}

const SideEditor: React.FC<SideEditorProps> = ({ label, value, onChange, error }) => {
  const { t } = useTranslation();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  // Auto-detect rich mode from existing content (e.g. when editing a card that has HTML)
  const [richMode, setRichMode] = useState<boolean>(
    () => value.type === "text" && containsHtml(value.text ?? ""),
  );

  const handleTypeChange = (_: React.MouseEvent, newType: "text" | "image" | null) => {
    if (!newType) return;
    onChange({ type: newType, text: null, image_url: null });
  };

  const handleToggleRich = (toRich: boolean) => {
    if (!toRich && value.type === "text") {
      // Strip HTML when going back to plain text
      onChange({ ...value, text: stripHtml(value.text ?? "") });
    }
    setRichMode(toRich);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError("");
    try {
      const { url } = await uploadImage(file);
      onChange({ ...value, image_url: url });
    } catch (err) {
      setUploadError(extractErrorMessage(err, t('subcategory.uploadFailed')));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <Box>
      {/* ── Row: label + type toggle + rich-text switch ── */}
      <Box className="flex items-center justify-between mb-1 flex-wrap gap-2">
        <Typography variant="body2" color="text.secondary" fontWeight={600}>
          {label}
        </Typography>
        <Box className="flex items-center gap-2">
          {/* Rich text toggle — only meaningful for text sides */}
          {value.type === "text" && (
            <FormControlLabel
              control={
                <Switch
                  size="small"
                  checked={richMode}
                  onChange={(e) => handleToggleRich(e.target.checked)}
                />
              }
              label={
                <Typography variant="caption" color="text.secondary">
                  {t('subcategory.richText')}
                </Typography>
              }
              labelPlacement="start"
              sx={{ mx: 0, gap: 0.5 }}
            />
          )}
          <ToggleButtonGroup
            size="small"
            exclusive
            value={value.type}
            onChange={handleTypeChange}
          >
            <ToggleButton value="text" aria-label="text">
              <Tooltip title={t('subcategory.plainRichText')}>
                <TextFieldsIcon fontSize="small" />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="image" aria-label="image">
              <Tooltip title={t('subcategory.image')}>
                <ImageIcon fontSize="small" />
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      {/* ── Content area ── */}
      {value.type === "text" ? (
        richMode ? (
          // Rich text editor — mounts fresh when richMode becomes true
          <RichTextEditor
            value={value.text ?? ""}
            onChange={(html) => onChange({ ...value, text: html })}
            placeholder={t('subcategory.enterText')}
            error={!!error}
            errorText={error}
          />
        ) : (
          <TextField
            fullWidth
            multiline
            minRows={3}
            placeholder={t('subcategory.enterText')}
            value={value.text ?? ""}
            onChange={(e) => onChange({ ...value, text: e.target.value })}
            error={!!error}
            helperText={error || " "}
          />
        )
      ) : (
        <Box
          sx={{
            border: "1px dashed",
            borderColor: error ? "error.main" : "divider",
            borderRadius: 2,
            p: 2,
            textAlign: "center",
            minHeight: 80,
          }}
        >
          {value.image_url ? (
            <Box className="flex flex-col items-center gap-2">
              <Box
                component="img"
                src={resolveImageUrl(value.image_url)}
                alt="preview"
                sx={{ maxHeight: 100, maxWidth: "100%", objectFit: "contain", borderRadius: 1 }}
              />
              <Button size="small" onClick={() => fileRef.current?.click()} disabled={uploading}>
                {t('subcategory.replace')}
              </Button>
            </Box>
          ) : (
            <Box className="flex flex-col items-center gap-1">
              <ImageIcon color="disabled" />
              <Typography variant="caption" color="text.secondary">
                {t('subcategory.imageHint')}
              </Typography>
              <Button
                size="small"
                variant="outlined"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? <CircularProgress size={16} /> : t('subcategory.chooseImage')}
              </Button>
            </Box>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            hidden
            onChange={handleFileChange}
          />
          {uploadError && <Typography variant="caption" color="error">{uploadError}</Typography>}
          {error && !uploadError && <Typography variant="caption" color="error">{error}</Typography>}
        </Box>
      )}
    </Box>
  );
};

// ─── Flashcard list item ──────────────────────────────────────────────────────

const emptyFlashcardSide = (): FlashcardSide => ({ type: 'text', text: null, image_url: null });

// ─── Sortable flashcard item (drag-and-drop) ───────────────────────────────────

/** Map MarkType to backend TickMark: tick → remembered, x → forgot. */
const marksToTickMarks = (front: MarkType[], back: MarkType[]): TickMark[] => [
  ...front.map((m) => (m === "tick" ? "remembered" : "forgot")),
  ...back.map((m) => (m === "tick" ? "remembered" : "forgot")),
];

interface SortableFlashcardItemProps {
  card: Flashcard;
  progressId: number | null;
  progressMarks?: TickMark[];
  onEdit: () => void;
  onDelete: () => void;
  onMarksChange: (progressId: number, frontMarks: MarkType[], backMarks: MarkType[]) => void;
}

const SortableFlashcardItem: React.FC<SortableFlashcardItemProps> = ({
  card,
  progressId,
  progressMarks,
  onEdit,
  onDelete,
  onMarksChange,
}) => {
  const { t } = useTranslation();
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleMarksChange = useCallback(
    (frontMarks: MarkType[], backMarks: MarkType[]) => {
      if (progressId != null && progressId > 0) {
        onMarksChange(progressId, frontMarks, backMarks);
      }
    },
    [progressId, onMarksChange]
  );

  return (
    <Box
      ref={setNodeRef}
      style={style}
      className="flex flex-col items-center"
      sx={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <Box sx={{ position: "relative", display: "inline-block" }}>
        <FlashcardComponent
          front={card.front}
          back={card.back}
          progressMarks={progressMarks}
          onMarksChange={handleMarksChange}
        />

        {/* Top-left: drag handle + three-dot menu */}
        <Box
          sx={{
            position: "absolute",
            top: 8,
            insetInlineStart: 8,
            zIndex: 2,
            display: "flex",
            alignItems: "center",
            gap: 0.25,
          }}
        >
          <Tooltip title={t('subcategory.dragReorder')} placement="top">
            <Box
              {...listeners}
              {...attributes}
              sx={{
                cursor: isDragging ? "grabbing" : "grab",
                touchAction: "none",
                p: 0.5,
                borderRadius: 1,
                bgcolor: "background.paper",
                boxShadow: 1,
                "&:hover": { bgcolor: "action.hover" },
              }}
            >
              <DragIndicatorIcon sx={{ fontSize: 20 }} color="action" />
            </Box>
          </Tooltip>
          <Tooltip title={t('subcategory.options')} placement="top">
            <IconButton
              size="small"
              onClick={(e) => { e.stopPropagation(); setMenuAnchor(e.currentTarget); }}
              sx={{
                minWidth: 32,
                minHeight: 32,
                bgcolor: "background.paper",
                boxShadow: 1,
                "&:hover": { bgcolor: "action.hover" },
              }}
              aria-label={t('subcategory.cardOptions')}
            >
              <MoreVertIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        transformOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <MenuItem onClick={() => { setMenuAnchor(null); onEdit(); }}>
          <EditIcon fontSize="small" sx={{ marginInlineEnd: 1 }} />
          {t('common.edit')}
        </MenuItem>
        <MenuItem
          onClick={() => { setMenuAnchor(null); onDelete(); }}
          sx={{ color: "error.main" }}
        >
          <DeleteIcon fontSize="small" sx={{ marginInlineEnd: 1 }} />
          {t('common.delete')}
        </MenuItem>
      </Menu>
    </Box>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────

const SubCategoryPage: React.FC = () => {
  const { t } = useTranslation();
  const { isDarkMode } = useContext(ThemeModeContext);
  const palette = (isDarkMode ? darkTheme : lightTheme).palette;
  const navigate = useNavigate();
  const { categoryId, subCategoryId } = useParams<{ categoryId: string; subCategoryId: string }>();
  const catId = Number(categoryId);
  const subId = Number(subCategoryId);

  // ── breadcrumb data ──────────────────────────────────────────────────────────
  const [category, setCategory] = useState<Category | null>(null);
  const [subCategory, setSubCategory] = useState<SubCategory | null>(null);
  const [progress, setProgress] = useState<SubcategoryProgressResponse | null>(null);
  const [dueTodayProgressIds, setDueTodayProgressIds] = useState<Set<number>>(new Set());
  const [studySettings, setStudySettings] = useState<UserStudySettingsResponse | null>(null);
  const dueTodayProgressIdsRef = useRef<Set<number>>(new Set());
  const studySettingsRef = useRef<UserStudySettingsResponse | null>(null);
  const cardProgressMapRef = useRef<Map<number, { progress_id: number; marks: TickMark[] }>>(new Map());
  const saveTicksTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [offScheduleDialog, setOffScheduleDialog] = useState<{
    open: boolean;
    progressId: number | null;
    frontMarks: MarkType[] | null;
    backMarks: MarkType[] | null;
    rememberMe: boolean;
  }>({ open: false, progressId: null, frontMarks: null, backMarks: null, rememberMe: false });
  /** When set, override displayed marks for that progress so the card reverts until dialog is closed. */
  const [revertedMarks, setRevertedMarks] = useState<Record<number, TickMark[]>>({});

  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const {
    data: flashcardsData,
    isLoading: loading,
    error: listErrorRaw,
  } = useQuery({
    queryKey: queryKeys.flashcards(subId, search, page),
    queryFn: async () => {
      const [listRes, progressRes] = await Promise.all([
        listFlashcards(subId, { search: search || undefined, page, per_page: PER_PAGE }),
        getSubcategoryCardProgress(subId),
      ]);
      const map = new Map<number, { progress_id: number; marks: TickMark[] }>();
      (progressRes.card_progress ?? []).forEach((item) =>
        map.set(item.flashcard_id, { progress_id: item.progress_id, marks: item.marks ?? [] })
      );
      return { items: listRes.items, total: listRes.total, pages: listRes.pages, cardProgressMap: map };
    },
    enabled: !!subId && !Number.isNaN(subId),
  });

  const flashcards = flashcardsData?.items ?? [];
  const total = flashcardsData?.total ?? 0;
  const pages = flashcardsData?.pages ?? 1;
  const cardProgressMap = flashcardsData?.cardProgressMap ?? new Map<number, { progress_id: number; marks: TickMark[] }>();
  const listError = listErrorRaw ? extractErrorMessage(listErrorRaw, t('subcategory.loadError')) : "";

  const saveFlashcardMutation = useMutation({
    mutationFn: async (payload: { id?: number; front: FlashcardSide; back: FlashcardSide }) => {
      if (payload.id) return updateFlashcard(payload.id, { front: payload.front, back: payload.back });
      return createFlashcard(subId, { front: payload.front, back: payload.back });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.flashcards(subId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.subcategoryCardProgress(subId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.subcategory(subId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.subcategoryProgress(subId) });
      closeDialog();
      setPage(1);
    },
  });

  const deleteFlashcardMutation = useMutation({
    mutationFn: (id: number) => deleteFlashcard(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.flashcards(subId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.subcategoryCardProgress(subId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.subcategory(subId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.subcategoryProgress(subId) });
      setDeleteTarget(null);
    },
  });

  const reorderFlashcardsMutation = useMutation({
    mutationFn: (reorderItems: { id: number; order_index: number }[]) =>
      reorderFlashcards(subId, reorderItems),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.flashcards(subId) });
    },
  });

  // ── create / edit dialog ─────────────────────────────────────────────────────
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null);
  const [formFront, setFormFront] = useState<FlashcardSide>(emptyFlashcardSide());
  const [formBack, setFormBack] = useState<FlashcardSide>(emptyFlashcardSide());
  const [frontError, setFrontError] = useState("");
  const [backError, setBackError] = useState("");
  const [saveError, setSaveError] = useState("");

  // ── delete confirmation ──────────────────────────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState<Flashcard | null>(null);

  // ── load breadcrumbs, progress summary, today's queue, study settings ─────────
  useEffect(() => {
    getCategory(catId).then(setCategory).catch(() => {});
    getSubCategory(subId).then(setSubCategory).catch(() => {});
    getSubcategoryProgress(subId).then(setProgress).catch(() => {});
    getTodaysQueue()
      .then((data) => {
        const ids = new Set(data.queue.map((q) => q.progress_id));
        dueTodayProgressIdsRef.current = ids;
        setDueTodayProgressIds(ids);
      })
      .catch(() => {});
    getStudySettings().then((d) => {
      studySettingsRef.current = d;
      setStudySettings(d);
    }).catch(() => {});
  }, [catId, subId]);

  useEffect(() => {
    cardProgressMapRef.current = cardProgressMap;
  }, [cardProgressMap]);

  // ── search ───────────────────────────────────────────────────────────────────
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  // ── create / edit dialog ─────────────────────────────────────────────────────
  const openCreateDialog = () => {
    setEditingCard(null);
    setFormFront(emptyFlashcardSide());
    setFormBack(emptyFlashcardSide());
    setFrontError("");
    setBackError("");
    setSaveError("");
    setIsDialogOpen(true);
  };

  const openEditDialog = (card: Flashcard) => {
    setEditingCard(card);
    setFormFront({ ...card.front });
    setFormBack({ ...card.back });
    setFrontError("");
    setBackError("");
    setSaveError("");
    setIsDialogOpen(true);
  };

  const closeDialog = () => { setIsDialogOpen(false); setSaveError(""); };

  const validateSide = (side: FlashcardSide, setErr: (m: string) => void): boolean => {
    if (side.type === 'text') {
      if (!side.text?.trim()) { setErr(t('subcategory.textRequired')); return false; }
    } else {
      if (!side.image_url) { setErr(t('subcategory.imageRequired')); return false; }
    }
    setErr("");
    return true;
  };

  const handleSave = () => {
    const frontOk = validateSide(formFront, setFrontError);
    const backOk = validateSide(formBack, setBackError);
    if (!frontOk || !backOk) return;
    setSaveError("");
    saveFlashcardMutation.mutate(
      { id: editingCard?.id, front: formFront, back: formBack },
      {
        onError: (err) => setSaveError(extractErrorMessage(err, t('subcategory.saveError'))),
      }
    );
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteFlashcardMutation.mutate(deleteTarget.id, { onError: () => setDeleteTarget(null) });
    if (flashcards.length === 1 && page > 1) setPage((p) => p - 1);
  };

  const performSaveTicks = useCallback(
    async (progressId: number, frontMarks: MarkType[], backMarks: MarkType[]) => {
      const marks = marksToTickMarks(frontMarks, backMarks);
      try {
        await setProgressTicks(progressId, marks);
        queryClient.invalidateQueries({ queryKey: queryKeys.flashcards(subId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.studyQueueWithCards() });
        getSubcategoryProgress(subId).then(setProgress).catch(() => {});
        getTodaysQueue()
          .then((data) => {
            const ids = new Set(data.queue.map((q) => q.progress_id));
            dueTodayProgressIdsRef.current = ids;
            setDueTodayProgressIds(ids);
          })
          .catch(() => {});
      } catch {
        // optional: toast
      }
    },
    [subId, queryClient]
  );

  // ── persist strip edits (debounced); show off-schedule dialog when card not due today ─
  const handleMarksChange = useCallback(
    (progressId: number, frontMarks: MarkType[], backMarks: MarkType[]) => {
      const isDueToday = dueTodayProgressIdsRef.current.has(progressId);
      const skipPrompt = studySettingsRef.current?.skip_off_schedule_progress_prompt ?? false;

      if (!isDueToday && !skipPrompt) {
        const map = cardProgressMapRef.current;
        const saved = Array.from(map.values()).find((p) => p.progress_id === progressId);
        const savedMarks = saved?.marks ?? [];
        setRevertedMarks((prev) => ({ ...prev, [progressId]: savedMarks }));
        setOffScheduleDialog({
          open: true,
          progressId,
          frontMarks,
          backMarks,
          rememberMe: false,
        });
        return;
      }

      if (saveTicksTimeoutRef.current) clearTimeout(saveTicksTimeoutRef.current);
      saveTicksTimeoutRef.current = setTimeout(() => {
        saveTicksTimeoutRef.current = null;
        performSaveTicks(progressId, frontMarks, backMarks);
      }, 400);
    },
    [performSaveTicks]
  );

  const handleOffScheduleConfirm = useCallback(async () => {
    const { progressId, frontMarks, backMarks, rememberMe } = offScheduleDialog;
    if (progressId == null || frontMarks == null || backMarks == null) return;
    if (rememberMe) {
      try {
        await updateStudySettings({ skip_off_schedule_progress_prompt: true });
        setStudySettings((prev) =>
          prev ? { ...prev, skip_off_schedule_progress_prompt: true } : null
        );
      } catch {
        // optional: toast
      }
    }
    setOffScheduleDialog({
      open: false,
      progressId: null,
      frontMarks: null,
      backMarks: null,
      rememberMe: false,
    });
    setRevertedMarks((prev) => {
      const next = { ...prev };
      delete next[progressId];
      return next;
    });
    await performSaveTicks(progressId, frontMarks, backMarks);
  }, [offScheduleDialog, performSaveTicks]);

  const handleOffScheduleCancel = useCallback(() => {
    const progressId = offScheduleDialog.progressId;
    setOffScheduleDialog({
      open: false,
      progressId: null,
      frontMarks: null,
      backMarks: null,
      rememberMe: false,
    });
    if (progressId != null) {
      const map = cardProgressMapRef.current;
      const saved = Array.from(map.values()).find((p) => p.progress_id === progressId);
      const savedMarks = saved?.marks ?? [];
      setRevertedMarks((prev) => ({ ...prev, [progressId]: [...savedMarks] }));
    }
  }, [offScheduleDialog.progressId]);

  // ── drag-and-drop reorder ─────────────────────────────────────────────────────
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = flashcards.findIndex((c) => c.id === active.id);
      const newIndex = flashcards.findIndex((c) => c.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;

      const newCards = arrayMove(flashcards, oldIndex, newIndex);
      const reorderPayload = newCards.map((c, i) => ({ id: c.id, order_index: i }));
      reorderFlashcardsMutation.mutate(reorderPayload);
    },
    [flashcards, reorderFlashcardsMutation],
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    }),
  );

  const subTitle = subCategory?.title ?? t('subcategory.fallback');
  const catTitle = category?.title ?? t('subcategory.categoryFallback');

  return (
    <Box className="w-full">
      <Box className="mx-auto w-full px-4 pb-20 pt-6 sm:px-6 lg:px-8">
        {/* ── Header ── */}
        <Box className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Box>
            <Box className="flex items-center gap-2 flex-wrap">
              <IconButton
                aria-label={t('common.back')}
                onClick={() => navigate(`/categories/${catId}/subcategories`)}
              >
                <ArrowBackIcon />
              </IconButton>
              <Typography variant="caption" color="text.secondary">
                {catTitle} /
              </Typography>
              <Typography variant="h5" className="font-bold">
                {subTitle}
              </Typography>
            </Box>
            {subCategory?.description && (
              <Typography variant="body2" color="text.secondary" className="mt-1 ms-12">
                {subCategory.description}
              </Typography>
            )}
          </Box>
          <Chip label={t('subcategory.flashcardsCount', { count: total })} variant="outlined" className="font-semibold" color="secondary" />
        </Box>

        {progress != null && progress.total > 0 && (
          <Box
            className="rounded-xl border border-gray-200/70 p-4 mb-4"
            sx={{ bgcolor: "background.paper" }}
          >
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              {t('subcategory.yourProgress')}
            </Typography>
            <Box className="flex flex-wrap items-center gap-4">
              <Typography variant="body2" color="text.secondary">
                {t('subcategory.pending')} <strong>{progress.pending}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('subcategory.phase1')} <strong>{progress.phase1}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('subcategory.phase2')} <strong>{progress.phase2}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('subcategory.graduatedSrs')} <strong>{progress.graduated}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('subcategory.longTermMastered')} <strong>{progress.long_term_mastered}</strong>
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {t('subcategory.mastery')} {progress.mastery_percent}%
              </Typography>
              {progress.mastery_percent >= 100 && (
                <Chip label={t('subcategory.mastered')} color="success" size="small" />
              )}
            </Box>
          </Box>
        )}

        <Divider className="!my-6" />

        {/* ── Search ── */}
        <Box component="form" onSubmit={handleSearchSubmit} className="mb-5 flex gap-2">
          <TextField
            size="small"
            placeholder={t('subcategory.searchPlaceholder')}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
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
        ) : flashcards.length === 0 ? (
          <Box className="rounded-2xl border border-dashed border-gray-200/70 py-12 text-center">
            <Typography variant="h6" className="font-semibold">
              {search ? t('subcategory.noMatch') : t('subcategory.noneYet')}
            </Typography>
            <Typography variant="body2" color="text.secondary" className="mt-1">
              {search ? t('subcategory.tryDifferent') : t('subcategory.createFirst')}
            </Typography>
          </Box>
        ) : (
          <>
            <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
              <SortableContext
                items={flashcards.map((c) => c.id)}
                strategy={rectSortingStrategy}
              >
                <Box
                  className="grid gap-4 sm:gap-6"
                  sx={{
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "repeat(2, 1fr)",
                      md: "repeat(3, 1fr)",
                    },
                  }}
                >
                  {flashcards.map((card) => {
                    const cardProgress = cardProgressMap.get(card.id);
                    const progressId = cardProgress?.progress_id ?? null;
                    const marksOverride = progressId != null ? revertedMarks[progressId] : undefined;
                    const progressMarks = marksOverride ?? cardProgress?.marks;
                    return (
                      <SortableFlashcardItem
                        key={card.id}
                        card={card}
                        progressId={progressId}
                        progressMarks={progressMarks}
                        onEdit={() => openEditDialog(card)}
                        onDelete={() => setDeleteTarget(card)}
                        onMarksChange={handleMarksChange}
                      />
                    );
                  })}
                </Box>
              </SortableContext>
            </DndContext>
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
        aria-label={t('subcategory.addFlashcard')}
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
      <Dialog open={isDialogOpen} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle className="flex items-center justify-between py-3 px-3">
          {editingCard ? t('subcategory.editFlashcard') : t('subcategory.newFlashcard')}
          <IconButton aria-label={t('common.close')} onClick={closeDialog} size="small"><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent className="px-3 pb-2 flex flex-col gap-4" dividers>
          <SideEditor
            key={`front-${editingCard?.id ?? "new"}`}
            label={t('subcategory.front')}
            value={formFront}
            onChange={(side) => { setFormFront(side); setFrontError(""); }}
            error={frontError}
          />
          <Divider className="!my-4" />
          <SideEditor
            key={`back-${editingCard?.id ?? "new"}`}
            label={t('subcategory.back')}
            value={formBack}
            onChange={(side) => { setFormBack(side); setBackError(""); }}
            error={backError}
          />
          {saveError && <Alert severity="error">{saveError}</Alert>}
        </DialogContent>
        <DialogActions className="px-3 pb-3 pt-2 gap-1">
          <Button onClick={closeDialog} variant="text" disabled={saveFlashcardMutation.isPending}>{t('common.cancel')}</Button>
          <Button onClick={handleSave} variant="contained" disabled={saveFlashcardMutation.isPending}>
            {saveFlashcardMutation.isPending ? <CircularProgress size={18} /> : editingCard ? t('common.update') : t('common.create')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete confirmation ── */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle>{t('subcategory.deleteFlashcard')}</DialogTitle>
        <DialogContent>
          <Typography variant="body2">{t('subcategory.deleteFlashcardWarning')}</Typography>
        </DialogContent>
        <DialogActions className="px-3 pb-3 gap-1">
          <Button onClick={() => setDeleteTarget(null)} variant="text" disabled={deleteFlashcardMutation.isPending}>{t('common.cancel')}</Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={deleteFlashcardMutation.isPending}>
            {deleteFlashcardMutation.isPending ? <CircularProgress size={18} /> : t('common.delete')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Off-schedule progress confirmation ── */}
      <Dialog
        open={offScheduleDialog.open}
        onClose={handleOffScheduleCancel}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>{t('subcategory.offScheduleTitle')}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            {t('subcategory.offScheduleMessage')}
          </Typography>
          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={offScheduleDialog.rememberMe}
                onChange={(e) =>
                  setOffScheduleDialog((prev) => ({ ...prev, rememberMe: e.target.checked }))
                }
              />
            }
            label={
              <Typography variant="body2">{t('subcategory.offScheduleRemember')}</Typography>
            }
          />
        </DialogContent>
        <DialogActions className="px-3 pb-3 gap-1">
          <Button onClick={handleOffScheduleCancel} variant="text">
            {t('common.cancel')}
          </Button>
          <Button variant="contained" onClick={handleOffScheduleConfirm}>
            {t('common.continue')}
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default SubCategoryPage;
