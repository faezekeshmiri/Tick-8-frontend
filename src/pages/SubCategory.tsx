import React, { useMemo, useState } from "react";
import {
  Box,
  Typography,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Divider,
  IconButton,
  Chip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Flashcard from "../components/Flashcard";
import type { FlashcardItem } from "../types/SubCategory.types";

const SubCategory: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { categoryName, subCategoryName } = useParams();
  const decodedCategory = categoryName
    ? decodeURIComponent(categoryName)
    : "Category";
  const decodedSubCategory = subCategoryName
    ? decodeURIComponent(subCategoryName)
    : "Sub-category";
  const subCategoryColor = (
    location.state as { subCategoryColor?: string } | null
  )?.subCategoryColor;

  const [flashcards, setFlashcards] = useState<FlashcardItem[]>([
    {
      id: "1",
      word: "serendipity",
      type: "noun",
      pronunciation: "/ˌserənˈdipədē/",
      translation: "خوش‌آمدِ اتفاقی",
      example: "Finding that book was pure serendipity.",
      exampleTranslation: "پیدا کردن آن کتاب، کاملاً از روی خوش‌آمدِ اتفاقی بود.",
    },
  ]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formState, setFormState] = useState<Omit<FlashcardItem, "id">>({
    word: "",
    type: "",
    pronunciation: "",
    translation: "",
    example: "",
    exampleTranslation: "",
  });
  const [error, setError] = useState("");

  const flashcardsSorted = useMemo(
    () => [...flashcards].sort((a, b) => a.word.localeCompare(b.word)),
    [flashcards]
  );

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingId(null);
    setFormState({
      word: "",
      type: "",
      pronunciation: "",
      translation: "",
      example: "",
      exampleTranslation: "",
    });
    setError("");
  };

  const handleSubmit = () => {
    if (!formState.word.trim() || !formState.translation.trim()) {
      setError("Word and translation are required.");
      return;
    }
    if (editingId) {
      setFlashcards((prev) =>
        prev.map((item) =>
          item.id === editingId ? { ...item, ...formState } : item
        )
      );
    } else {
      setFlashcards((prev) => [
        ...prev,
        {
          id: `${Date.now()}`,
          ...formState,
        },
      ]);
    }
    handleCloseDialog();
  };

  const handleEdit = (item: FlashcardItem) => {
    setEditingId(item.id);
    setFormState({
      word: item.word,
      type: item.type,
      pronunciation: item.pronunciation,
      translation: item.translation,
      example: item.example || "",
      exampleTranslation: item.exampleTranslation || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setFlashcards((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <Box className="w-full">
      <Box className="mx-auto w-full px-4 pb-20 pt-6 sm:px-6 lg:px-8">
        <Box className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Box>
            <Box className="flex items-center gap-2">
              <IconButton
                aria-label="back to sub-categories"
                onClick={() =>
                  navigate(
                    `/categories/${encodeURIComponent(
                      decodedCategory
                    )}/subcategories`
                  )
                }
              >
                <ArrowBackIcon />
              </IconButton>
              <Typography variant="h4" className="font-bold">
                {decodedSubCategory}
              </Typography>
            </Box>
            <Typography
              variant="body1"
              color="text.secondary"
              className="mt-1"
            >
              Flashcards inside {decodedCategory} → {decodedSubCategory}.
            </Typography>
          </Box>
          <Chip
            label={`${flashcards.length} total`}
            variant="outlined"
            className="font-semibold"
            sx={{
              borderColor: subCategoryColor || "secondary.main",
              color: subCategoryColor || "secondary.main",
            }}
          />
        </Box>

        <Divider className="my-5" />

        {flashcardsSorted.length === 0 ? (
          <Box className="rounded-2xl border border-dashed border-gray-200/70 py-12 text-center">
            <Typography variant="h6" className="font-semibold">
              No flashcards yet
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              className="mt-2"
            >
              Add your first flashcard to start studying.
            </Typography>
          </Box>
        ) : (
          <Box className="flex flex-wrap gap-6">
            {flashcardsSorted.map((card) => (
              <Box key={card.id} className="flex flex-col items-center gap-3">
                <Flashcard
                  word={card.word}
                  type={card.type}
                  pronunciation={card.pronunciation}
                  translation={card.translation}
                  example={card.example}
                  exampleTranslation={card.exampleTranslation}
                  color={subCategoryColor}
                />
                <Box className="flex gap-2">
                  <Button
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => handleEdit(card)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => handleDelete(card.id)}
                  >
                    Delete
                  </Button>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Box>

      <Fab
        color="primary"
        aria-label="add flashcard"
        onClick={handleOpenDialog}
        sx={{
          position: "fixed",
          right: { xs: 16, sm: 24 },
          bottom: { xs: 16, sm: 24 },
          boxShadow: "0 16px 32px rgba(0, 0, 0, 0.15)",
        }}
      >
        <AddIcon />
      </Fab>

      <Dialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            overflowX: "hidden",
          },
        }}
      >
        <DialogTitle className="flex items-center justify-between px-3 py-3">
          {editingId ? "Edit flashcard" : "Add new flashcard"}
          <IconButton aria-label="close" onClick={handleCloseDialog}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent className="px-3 pb-0 overflow-x-hidden">
          <Typography variant="body2" color="text.secondary" className="mb-2">
            Provide the key details for your flashcard.
          </Typography>
          <Box className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <TextField
              fullWidth
              label="Word"
              value={formState.word}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, word: event.target.value }))
              }
              error={!!error && !formState.word.trim()}
            />
            <TextField
              fullWidth
              label="Type"
              value={formState.type}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, type: event.target.value }))
              }
            />
            <TextField
              fullWidth
              label="Pronunciation"
              value={formState.pronunciation}
              onChange={(event) =>
                setFormState((prev) => ({
                  ...prev,
                  pronunciation: event.target.value,
                }))
              }
            />
            <TextField
              fullWidth
              label="Translation"
              value={formState.translation}
              onChange={(event) =>
                setFormState((prev) => ({
                  ...prev,
                  translation: event.target.value,
                }))
              }
              error={!!error && !formState.translation.trim()}
              helperText={error && !formState.translation.trim() ? error : " "}
            />
          </Box>
          <TextField
            fullWidth
            label="Example sentence"
            value={formState.example}
            onChange={(event) =>
              setFormState((prev) => ({ ...prev, example: event.target.value }))
            }
            multiline
            minRows={2}
            className="mt-3"
          />
          <TextField
            fullWidth
            label="Example translation"
            value={formState.exampleTranslation}
            onChange={(event) =>
              setFormState((prev) => ({
                ...prev,
                exampleTranslation: event.target.value,
              }))
            }
            multiline
            minRows={2}
            className="mt-3"
          />
        </DialogContent>
        <DialogActions className="px-3 pb-3 pt-2 gap-1">
          <Button onClick={handleCloseDialog} variant="text">
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingId ? "Update flashcard" : "Save flashcard"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SubCategory;
