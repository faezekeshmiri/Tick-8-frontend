import React, { useMemo, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Chip,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Divider,
  IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

type Category = {
  name: string;
  description: string;
};

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([
    {
      name: "Vocabulary",
      description: "Core words you want to remember and review.",
    },
    {
      name: "Phrasal Verbs",
      description: "Everyday verb phrases for fluent conversations.",
    },
    {
      name: "Idioms",
      description: "Common expressions to sound more natural.",
    },
    {
      name: "Business English",
      description: "Professional language for work and meetings.",
    },
    {
      name: "Travel",
      description: "Useful phrases for trips and adventures.",
    },
    {
      name: "Academic",
      description: "Study-focused terms and formal language.",
    },
  ]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [error, setError] = useState("");

  const categoriesSorted = useMemo(
    () => [...categories].sort((a, b) => a.name.localeCompare(b.name)),
    [categories]
  );

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setNewCategory("");
    setNewDescription("");
    setEditingIndex(null);
    setError("");
  };

  const handleAddCategory = () => {
    const trimmed = newCategory.trim();
    if (!trimmed) {
      setError("Please enter a category name.");
      return;
    }
    const exists = categories.some((category, index) => {
      if (editingIndex !== null && index === editingIndex) {
        return false;
      }
      return category.name.toLowerCase() === trimmed.toLowerCase();
    });
    if (exists) {
      setError("This category already exists.");
      return;
    }
    const nextDescription = newDescription.trim();
    if (editingIndex === null) {
      setCategories((prev) => [
        ...prev,
        { name: trimmed, description: nextDescription || "No description yet." },
      ]);
    } else {
      setCategories((prev) =>
        prev.map((category, index) =>
          index === editingIndex
            ? {
                ...category,
                name: trimmed,
                description: nextDescription || "No description yet.",
              }
            : category
        )
      );
    }
    handleCloseDialog();
  };

  const handleEditCategory = (category: Category) => {
    const index = categories.findIndex(
      (item) => item.name === category.name
    );
    setEditingIndex(index);
    setNewCategory(category.name);
    setNewDescription(category.description);
    setIsDialogOpen(true);
  };

  const handleDeleteCategory = (categoryName: string) => {
    setCategories((prev) =>
      prev.filter((category) => category.name !== categoryName)
    );
  };

  return (
    <Box className="w-full">
      <Box className="mx-auto w-full max-w-6xl px-4 pb-20 pt-6 sm:px-6 lg:px-8">
        <Box className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Categories
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              className="mt-1"
            >
              Organize your study sets by topic and keep everything easy to
              find.
            </Typography>
          </Box>
          <Chip
            label={`${categories.length} total`}
            color="secondary"
            variant="outlined"
            sx={{ fontWeight: 600 }}
          />
        </Box>

        <Divider sx={{ my: 3 }} />

        {categoriesSorted.length === 0 ? (
          <Card className="border border-dashed border-gray-200/70">
            <CardContent className="py-12 text-center">
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                No categories yet
              </Typography>
              <Typography variant="body2" color="text.secondary" className="mt-2">
                Create your first category to start organizing your flashcards.
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Box className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categoriesSorted.map((category) => (
              <Card
                key={category.name}
                className="border border-gray-100/70 shadow-sm"
                sx={{
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 12px 24px rgba(15, 23, 42, 0.08)",
                  },
                }}
              >
                <CardContent>
                  <Box className="flex items-start justify-between gap-3">
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {category.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        className="mt-1"
                      >
                        {category.description}
                      </Typography>
                    </Box>
                    <Chip
                      label="Active"
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </Box>
                </CardContent>
                <CardActions sx={{ px: 2, pb: 2, gap: 1 }}>
                  <Button
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => handleEditCategory(category)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => handleDeleteCategory(category.name)}
                  >
                    Delete
                  </Button>
                </CardActions>
              </Card>
            ))}
          </Box>
        )}
      </Box>

      <Fab
        color="primary"
        aria-label="add category"
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
        maxWidth="xs"
        PaperProps={{
          sx: {
            overflowX: "hidden",
          },
        }}
      >
        <DialogTitle
          sx={{
            px: 3,
            py: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {editingIndex === null ? "Add new category" : "Edit category"}
          <IconButton aria-label="close" onClick={handleCloseDialog}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ px: 3, pb: 0, overflowX: "hidden" }}>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 2 }}
          >
            Give your category a clear, descriptive name.
          </Typography>
          <TextField
            autoFocus
            fullWidth
            label="Category name"
            value={newCategory}
            onChange={(event) => {
              setNewCategory(event.target.value);
              if (error) {
                setError("");
              }
            }}
            error={!!error}
            helperText={error || " "}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleAddCategory();
              }
            }}
          />
          <TextField
            fullWidth
            label="Description"
            value={newDescription}
            onChange={(event) => setNewDescription(event.target.value)}
            multiline
            minRows={3}
            sx={{ mt: 2, mb: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, pt: 2, gap: 1 }}>
          <Button onClick={handleCloseDialog} variant="text">
            Cancel
          </Button>
          <Button onClick={handleAddCategory} variant="contained">
            {editingIndex === null ? "Save category" : "Update category"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Categories;
