import React, { useCallback, useEffect, useRef, useState } from "react";
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
import {
  createFlashcard,
  deleteFlashcard,
  listFlashcards,
  reorderFlashcards,
  updateFlashcard,
} from "../api/flashcards";
import { getSubCategory } from "../api/subcategories";
import { getCategory } from "../api/categories";
import { uploadImage, resolveImageUrl } from "../api/upload";
import type { Category, Flashcard, FlashcardSide, SubCategory } from "../types/content.types";
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
      setUploadError(extractErrorMessage(err, "Upload failed."));
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
                  Rich text
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
              <Tooltip title="Plain / rich text">
                <TextFieldsIcon fontSize="small" />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="image" aria-label="image">
              <Tooltip title="Image">
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
            placeholder="Enter text…"
            error={!!error}
            errorText={error}
          />
        ) : (
          <TextField
            fullWidth
            multiline
            minRows={3}
            placeholder="Enter text…"
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
                Replace
              </Button>
            </Box>
          ) : (
            <Box className="flex flex-col items-center gap-1">
              <ImageIcon color="disabled" />
              <Typography variant="caption" color="text.secondary">
                JPG, PNG or WebP · max 5 MB
              </Typography>
              <Button
                size="small"
                variant="outlined"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? <CircularProgress size={16} /> : "Choose image"}
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

interface SortableFlashcardItemProps {
  card: Flashcard;
  onEdit: () => void;
  onDelete: () => void;
}

const SortableFlashcardItem: React.FC<SortableFlashcardItemProps> = ({
  card,
  onEdit,
  onDelete,
}) => {
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

  return (
    <Box
      ref={setNodeRef}
      style={style}
      className="flex flex-col items-center"
      sx={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <Box sx={{ position: "relative", display: "inline-block" }}>
        {/* Card — flip arrow stays top-right inside the card */}
        <FlashcardComponent front={card.front} back={card.back} />

        {/* Top-left: drag handle + three-dot menu side by side */}
        <Box
          sx={{
            position: "absolute",
            top: 8,
            left: 8,
            zIndex: 2,
            display: "flex",
            alignItems: "center",
            gap: 0.25,
          }}
        >
          <Tooltip title="Hold and drag to reorder" placement="top">
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
          <Tooltip title="Options" placement="top">
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
              aria-label="Card options"
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
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem
          onClick={() => { setMenuAnchor(null); onDelete(); }}
          sx={{ color: "error.main" }}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
    </Box>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────

const SubCategoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { categoryId, subCategoryId } = useParams<{ categoryId: string; subCategoryId: string }>();
  const catId = Number(categoryId);
  const subId = Number(subCategoryId);

  // ── breadcrumb data ──────────────────────────────────────────────────────────
  const [category, setCategory] = useState<Category | null>(null);
  const [subCategory, setSubCategory] = useState<SubCategory | null>(null);

  // ── flashcard list ───────────────────────────────────────────────────────────
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listError, setListError] = useState("");

  // ── create / edit dialog ─────────────────────────────────────────────────────
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null);
  const [formFront, setFormFront] = useState<FlashcardSide>(emptyFlashcardSide());
  const [formBack, setFormBack] = useState<FlashcardSide>(emptyFlashcardSide());
  const [frontError, setFrontError] = useState("");
  const [backError, setBackError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // ── delete confirmation ──────────────────────────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState<Flashcard | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ── load breadcrumbs ─────────────────────────────────────────────────────────
  useEffect(() => {
    getCategory(catId).then(setCategory).catch(() => {});
    getSubCategory(subId).then(setSubCategory).catch(() => {});
  }, [catId, subId]);

  // ── fetch flashcards ─────────────────────────────────────────────────────────
  const fetchCards = useCallback(async () => {
    setLoading(true);
    setListError("");
    try {
      const data = await listFlashcards(subId, { search: search || undefined, page, per_page: PER_PAGE });
      setFlashcards(data.items);
      setTotal(data.total);
      setPages(data.pages);
    } catch (err) {
      setListError(extractErrorMessage(err, "Failed to load flashcards."));
    } finally {
      setLoading(false);
    }
  }, [subId, search, page]);

  useEffect(() => { fetchCards(); }, [fetchCards]);

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
      if (!side.text?.trim()) { setErr("Text is required."); return false; }
    } else {
      if (!side.image_url) { setErr("Please upload an image."); return false; }
    }
    setErr("");
    return true;
  };

  const handleSave = async () => {
    const frontOk = validateSide(formFront, setFrontError);
    const backOk = validateSide(formBack, setBackError);
    if (!frontOk || !backOk) return;

    setSaving(true);
    setSaveError("");
    try {
      if (editingCard) {
        await updateFlashcard(editingCard.id, { front: formFront, back: formBack });
      } else {
        await createFlashcard(subId, { front: formFront, back: formBack });
      }
      closeDialog();
      setPage(1);
      fetchCards();
    } catch (err) {
      setSaveError(extractErrorMessage(err, "Failed to save flashcard."));
    } finally {
      setSaving(false);
    }
  };

  // ── delete ───────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteFlashcard(deleteTarget.id);
      setDeleteTarget(null);
      if (flashcards.length === 1 && page > 1) setPage((p) => p - 1);
      else fetchCards();
    } catch {
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  // ── drag-and-drop reorder ─────────────────────────────────────────────────────
  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = flashcards.findIndex((c) => c.id === active.id);
      const newIndex = flashcards.findIndex((c) => c.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;

      const newCards = arrayMove(flashcards, oldIndex, newIndex);
      setFlashcards(newCards);

      try {
        const reorderPayload = newCards.map((c, i) => ({ id: c.id, order_index: i }));
        await reorderFlashcards(subId, reorderPayload);
      } catch {
        fetchCards(); // revert on error
      }
    },
    [flashcards, subId, fetchCards],
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    }),
  );

  const subTitle = subCategory?.title ?? "Subcategory";
  const catTitle = category?.title ?? "Category";

  return (
    <Box className="w-full">
      <Box className="mx-auto w-full px-4 pb-20 pt-6 sm:px-6 lg:px-8">
        {/* ── Header ── */}
        <Box className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Box>
            <Box className="flex items-center gap-2 flex-wrap">
              <IconButton
                aria-label="back"
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
              <Typography variant="body2" color="text.secondary" className="mt-1 ml-12">
                {subCategory.description}
              </Typography>
            )}
          </Box>
          <Chip label={`${total} flashcards`} variant="outlined" className="font-semibold" color="secondary" />
        </Box>

        <Divider className="my-4" />

        {/* ── Search ── */}
        <Box component="form" onSubmit={handleSearchSubmit} className="mb-5 flex gap-2">
          <TextField
            size="small"
            placeholder="Search flashcards…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
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
        ) : flashcards.length === 0 ? (
          <Box className="rounded-2xl border border-dashed border-gray-200/70 py-12 text-center">
            <Typography variant="h6" className="font-semibold">
              {search ? "No flashcards match your search." : "No flashcards yet"}
            </Typography>
            <Typography variant="body2" color="text.secondary" className="mt-1">
              {search ? "Try a different keyword." : "Create your first flashcard to start studying."}
            </Typography>
          </Box>
        ) : (
          <>
            <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
              <SortableContext
                items={flashcards.map((c) => c.id)}
                strategy={rectSortingStrategy}
              >
                <Box className="flex flex-wrap gap-6">
                  {flashcards.map((card) => (
                    <SortableFlashcardItem
                      key={card.id}
                      card={card}
                      onEdit={() => openEditDialog(card)}
                      onDelete={() => setDeleteTarget(card)}
                    />
                  ))}
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
        color="primary"
        aria-label="add flashcard"
        onClick={openCreateDialog}
        sx={{ position: "fixed", right: { xs: 16, sm: 24 }, bottom: { xs: 16, sm: 24 }, boxShadow: "0 16px 32px rgba(0,0,0,0.15)" }}
      >
        <AddIcon />
      </Fab>

      {/* ── Create / Edit dialog ── */}
      <Dialog open={isDialogOpen} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle className="flex items-center justify-between py-3 px-3">
          {editingCard ? "Edit flashcard" : "New flashcard"}
          <IconButton aria-label="close" onClick={closeDialog} size="small"><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent className="px-3 pb-2 flex flex-col gap-4" dividers>
          <SideEditor
            key={`front-${editingCard?.id ?? "new"}`}
            label="Front"
            value={formFront}
            onChange={(side) => { setFormFront(side); setFrontError(""); }}
            error={frontError}
          />
          <Divider />
          <SideEditor
            key={`back-${editingCard?.id ?? "new"}`}
            label="Back"
            value={formBack}
            onChange={(side) => { setFormBack(side); setBackError(""); }}
            error={backError}
          />
          {saveError && <Alert severity="error">{saveError}</Alert>}
        </DialogContent>
        <DialogActions className="px-3 pb-3 pt-2 gap-1">
          <Button onClick={closeDialog} variant="text" disabled={saving}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={saving}>
            {saving ? <CircularProgress size={18} /> : editingCard ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete confirmation ── */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete flashcard?</DialogTitle>
        <DialogContent>
          <Typography variant="body2">This flashcard will be moved to trash. You can restore it within 30 days.</Typography>
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

export default SubCategoryPage;
