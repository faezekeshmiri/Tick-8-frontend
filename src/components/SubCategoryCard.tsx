import React from "react";
import { Box, Button, Card, CardContent, Chip, Typography } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import type { SubCategory } from "../types/content.types";

// Deterministic color palette derived from the subcategory id
const CARD_COLORS = [
  "#38bdf8", // sky
  "#10b981", // emerald
  "#f59e0b", // amber
  "#fb7185", // rose
  "#8b5cf6", // violet
  "#64748b", // slate
  "#f97316", // orange
  "#06b6d4", // cyan
];

function cardColor(id: number): string {
  return CARD_COLORS[id % CARD_COLORS.length];
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

type SubCategoryCardProps = {
  item: SubCategory;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

const SubCategoryCard: React.FC<SubCategoryCardProps> = ({ item, onClick, onEdit, onDelete }) => {
  const color = cardColor(item.id);

  return (
    <Box
      sx={{
        position: "relative",
        width: 360,
        height: 220,
        maxWidth: "100%",
        cursor: "pointer",
        perspective: 900,
        transformStyle: "preserve-3d",
        "&:hover .stack-top": { transform: "translate3d(-8px, -8px, 24px)" },
        "&:hover .stack-layer-1": { transform: "translate3d(8px, 8px, -24px)" },
        "&:hover .stack-layer-2": { transform: "translate3d(20px, 20px, -48px)" },
      }}
      onClick={onClick}
    >
      {/* Shadow layers */}
      <Box
        aria-hidden className="stack-layer-2"
        sx={{
          position: "absolute", inset: 0, borderRadius: 3,
          bgcolor: "background.paper",
          boxShadow: `0 10px 20px ${hexToRgba(color, 0.18)}`,
          transform: "translate3d(12px, 12px, -32px)",
          transition: "transform 0.25s ease", zIndex: 0,
        }}
      />
      <Box
        aria-hidden className="stack-layer-1"
        sx={{
          position: "absolute", inset: 0, borderRadius: 3,
          bgcolor: "background.paper",
          boxShadow: `0 8px 16px ${hexToRgba(color, 0.22)}`,
          transform: "translate3d(6px, 6px, -16px)",
          transition: "transform 0.25s ease", zIndex: 1,
        }}
      />

      <Card
        className="stack-top"
        variant="outlined"
        sx={{
          position: "relative", width: "100%", height: "100%",
          borderRadius: 3,
          boxShadow: `0 12px 24px ${hexToRgba(color, 0.28)}`,
          transform: "translate3d(0, 0, 0)",
          transition: "transform 0.25s ease",
          borderColor: color, zIndex: 2,
        }}
      >
        <CardContent className="h-full flex flex-col px-3 py-3">
          <Box className="flex items-start justify-between gap-3">
            <Typography variant="subtitle1" className="font-semibold">
              {item.title}
            </Typography>
            <Box
              aria-hidden
              sx={{
                width: 14, height: 14, borderRadius: "50%",
                bgcolor: color,
                boxShadow: `0 0 0 4px ${hexToRgba(color, 0.18)}`,
                flexShrink: 0, mt: 0.5,
              }}
            />
          </Box>

          {item.description && (
            <Typography variant="body2" color="text.secondary" className="mt-2 line-clamp-2">
              {item.description}
            </Typography>
          )}

          <Box className="mt-auto pt-2">
            <Chip
              label={`${item.flashcard_count} flashcards`}
              size="small"
              variant="outlined"
              sx={{ borderColor: color, color }}
            />
          </Box>

          <Box className="flex gap-2 pt-2">
            <Button
              size="small"
              startIcon={<EditIcon />}
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
            >
              Edit
            </Button>
            <Button
              size="small"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
            >
              Delete
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SubCategoryCard;
