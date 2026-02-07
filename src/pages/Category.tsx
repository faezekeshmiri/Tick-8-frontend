import React, { useMemo, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
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
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate, useParams } from "react-router-dom";
import type { SubCategory } from "../types/Category.types";
import SubCategoryCard from "../components/SubCategoryCard";
import { hexToRgba } from "../utils/color";

const COLOR_OPTIONS = [
  { name: "Sky", value: "#38bdf8" },
  { name: "Emerald", value: "#10b981" },
  { name: "Amber", value: "#f59e0b" },
  { name: "Rose", value: "#fb7185" },
  { name: "Violet", value: "#8b5cf6" },
  { name: "Slate", value: "#64748b" },
];

const Category: React.FC = () => {
  const navigate = useNavigate();
  const { categoryName } = useParams();
  const decodedName = categoryName ? decodeURIComponent(categoryName) : "Category";

  const [subCategories, setSubCategories] = useState<SubCategory[]>([
    {
      name: "Foundations",
      description: "Core concepts and must-know items.",
      color: COLOR_OPTIONS[0].value,
    },
    {
      name: "Intermediate",
      description: "Everyday usage with richer context.",
      color: COLOR_OPTIONS[1].value,
    },
    {
      name: "Advanced",
      description: "Nuanced meaning and real-world examples.",
      color: COLOR_OPTIONS[2].value,
    },
  ]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newSubCategory, setNewSubCategory] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0].value);
  const [error, setError] = useState("");

  const subCategoriesSorted = useMemo(
    () => [...subCategories].sort((a, b) => a.name.localeCompare(b.name)),
    [subCategories]
  );

  const handleOpenDialog = () => setIsDialogOpen(true);

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setNewSubCategory("");
    setNewDescription("");
    setSelectedColor(COLOR_OPTIONS[0].value);
    setError("");
  };

  const handleAddSubCategory = () => {
    const trimmed = newSubCategory.trim();
    if (!trimmed) {
      setError("Please enter a sub-category name.");
      return;
    }
    const exists = subCategories.some(
      (item) => item.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (exists) {
      setError("This sub-category already exists.");
      return;
    }
    const nextDescription = newDescription.trim();
    setSubCategories((prev) => [
      ...prev,
      {
        name: trimmed,
        description: nextDescription || "No description yet.",
        color: selectedColor,
      },
    ]);
    handleCloseDialog();
  };

  return (
    <Box className="w-full">
      <Box className="mx-auto w-full px-4 pb-20 pt-6 sm:px-6 lg:px-8">
        <Box className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Box>
            <Box className="flex items-center gap-2">
              <IconButton
                aria-label="back to categories"
                onClick={() => navigate("/categories")}
              >
                <ArrowBackIcon />
              </IconButton>
              <Typography variant="h4" className="font-bold">
                {decodedName}
              </Typography>
            </Box>
            <Typography
              variant="body1"
              color="text.secondary"
              className="mt-1"
            >
              Manage sub-categories to keep this section organized.
            </Typography>
          </Box>
          <Chip
            label={`${subCategories.length} total`}
            color="secondary"
            variant="outlined"
            className="font-semibold"
          />
        </Box>

        <Divider className="my-5" />
        {subCategoriesSorted.length === 0 ? (
          <Card className="border border-dashed border-gray-200/70">
            <CardContent className="py-12 text-center">
              <Typography variant="h6" className="font-semibold">
                No sub-categories yet
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                className="mt-2"
              >
                Add one to start organizing this category.
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Box className="flex flex-wrap gap-6">
            {subCategoriesSorted.map((item, index) => (
              <SubCategoryCard
                key={`${item.name}-${index}`}
                item={item}
                onClick={() =>
                  navigate(
                    `/categories/${encodeURIComponent(
                      decodedName
                    )}/subcategories/${encodeURIComponent(item.name)}`,
                    { state: { subCategoryColor: item.color } }
                  )
                }
              />
            ))}
          </Box>
        )}
      </Box>

      <Fab
        color="primary"
        aria-label="add sub-category"
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
        <DialogTitle className="flex items-center justify-between px-3 py-3">
          Add new sub-category
          <IconButton aria-label="close" onClick={handleCloseDialog}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent className="px-3 pb-0 overflow-x-hidden">
          <Typography
            variant="body2"
            color="text.secondary"
            className="mb-2"
          >
            Add a short description to make this section easy to recognize.
          </Typography>
          <TextField
            autoFocus
            fullWidth
            label="Sub-category name"
            value={newSubCategory}
            onChange={(event) => {
              setNewSubCategory(event.target.value);
              if (error) {
                setError("");
              }
            }}
            error={!!error}
            helperText={error || " "}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleAddSubCategory();
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
            className="mt-2 mb-1"
          />
          <Box className="mt-2">
            <Typography variant="body2" color="text.secondary" className="mb-2">
              Pick a color
            </Typography>
            <Box className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map((option) => {
                const isSelected = option.value === selectedColor;
                return (
                  <IconButton
                    key={option.value}
                    aria-label={`select ${option.name}`}
                    onClick={() => setSelectedColor(option.value)}
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      border: isSelected
                        ? "2px solid rgba(15, 23, 42, 0.35)"
                        : "1px solid rgba(15, 23, 42, 0.15)",
                      bgcolor: option.value,
                      boxShadow: isSelected
                        ? `0 0 0 4px ${hexToRgba(option.value, 0.2)}`
                        : "none",
                    }}
                  />
                );
              })}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions className="px-3 pb-3 pt-2 gap-1">
          <Button onClick={handleCloseDialog} variant="text">
            Cancel
          </Button>
          <Button onClick={handleAddSubCategory} variant="contained">
            Save sub-category
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Category;
