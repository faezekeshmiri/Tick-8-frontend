import React from "react";
import { Box, Button, Card, CardContent, Typography } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import type { SubCategory } from "../types/Category.types";
import { hexToRgba } from "../utils/color";

type SubCategoryCardProps = {
  item: SubCategory;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

const SubCategoryCard: React.FC<SubCategoryCardProps> = ({
  item,
  onClick,
  onEdit,
  onDelete,
}) => (
  <Box
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
    onClick={onClick}
  >
    <Box
      aria-hidden
      className="stack-layer-2"
      sx={{
        position: "absolute",
        inset: 0,
        borderRadius: 3,
        bgcolor: "background.paper",
        boxShadow: `0 10px 20px ${hexToRgba(item.color, 0.18)}`,
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
        boxShadow: `0 8px 16px ${hexToRgba(item.color, 0.22)}`,
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
        boxShadow: `0 12px 24px ${hexToRgba(item.color, 0.28)}`,
        transform: "translate3d(0, 0, 0)",
        transition: "transform 0.25s ease",
        borderColor: item.color,
        zIndex: 2,
      }}
    >
      <CardContent className="h-full flex flex-col px-3 py-3">
        <Box className="flex items-start justify-between gap-3">
          <Typography variant="subtitle1" className="font-semibold">
            {item.name}
          </Typography>
          <Box
            aria-hidden
            sx={{
              width: 14,
              height: 14,
              borderRadius: "50%",
              bgcolor: item.color,
              boxShadow: `0 0 0 4px ${hexToRgba(item.color, 0.18)}`,
              flexShrink: 0,
              mt: 0.5,
            }}
          />
        </Box>
        <Typography variant="body2" color="text.secondary" className="mt-2">
          {item.description}
        </Typography>
        <Box className="mt-auto flex gap-2 pt-3">
          <Button
            size="small"
            startIcon={<EditIcon />}
            onClick={(event) => {
              event.stopPropagation();
              onEdit();
            }}
          >
            Edit
          </Button>
          <Button
            size="small"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={(event) => {
              event.stopPropagation();
              onDelete();
            }}
          >
            Delete
          </Button>
        </Box>
      </CardContent>
    </Card>
  </Box>
);

export default SubCategoryCard;
