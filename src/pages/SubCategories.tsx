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

type SubCategory = {
  name: string;
  description: string;
};

const SubCategories: React.FC = () => {
  const navigate = useNavigate();
  const { categoryName } = useParams();
  const decodedName = categoryName ? decodeURIComponent(categoryName) : "Category";

  const [subCategories, setSubCategories] = useState<SubCategory[]>([
    {
      name: "Foundations",
      description: "Core concepts and must-know items.",
    },
    {
      name: "Intermediate",
      description: "Everyday usage with richer context.",
    },
    {
      name: "Advanced",
      description: "Nuanced meaning and real-world examples.",
    },
  ]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newSubCategory, setNewSubCategory] = useState("");
  const [newDescription, setNewDescription] = useState("");
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
      { name: trimmed, description: nextDescription || "No description yet." },
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

        <Divider className="my-3" />
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
              <Box
                key={`${item.name}-${index}`}
                className="subcat-stack"
                sx={{
                  position: "relative",
                  width: 360,
                  height: 220,
                  maxWidth: "100%",
                  cursor: "pointer",
                  perspective: 900,
                  transformStyle: "preserve-3d",
                  "&:hover .stack-top": {
                    transform: "translate3d(-8px, -8px, 24px)",
                  },
                  "&:hover .stack-layer-1": {
                    transform: "translate3d(8px, 8px, -24px)",
                  },
                  "&:hover .stack-layer-2": {
                    transform: "translate3d(20px, 20px, -48px)",
                  },
                }}
              >
                <Box
                  aria-hidden
                  className="stack-layer-2"
                  sx={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: 3,
                    bgcolor: "background.paper",
                    boxShadow: "0 10px 20px rgba(15, 23, 42, 0.12)",
                    transform: "translate3d(12px, 12px, -32px)",
                    transition: "transform 0.25s ease",
                    zIndex: 0,
                  }}
                />
                <Box
                  aria-hidden
                  className="stack-layer-1"
                  sx={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: 3,
                    bgcolor: "background.paper",
                    boxShadow: "0 8px 16px rgba(15, 23, 42, 0.12)",
                    transform: "translate3d(6px, 6px, -16px)",
                    transition: "transform 0.25s ease",
                    zIndex: 1,
                  }}
                />
                <Card
                  className="stack-top"
                  variant="outlined"
                  sx={{
                    position: "relative",
                    width: "100%",
                    height: "100%",
                    borderRadius: 3,
                    boxShadow: "0 12px 24px rgba(0,0,0,0.12)",
                    transform: "translate3d(0, 0, 0)",
                    transition: "transform 0.25s ease",
                    zIndex: 2,
                  }}
                >
                  <CardContent className="h-full flex flex-col justify-between px-3 py-3">
                    <Box className="flex items-start justify-between gap-3">
                      <Typography variant="subtitle1" className="font-semibold">
                        {item.name}
                      </Typography>
                      <Chip
                        label="Active"
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {item.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
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

export default SubCategories;
