import React, { useState } from 'react';
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import IconButton from "@mui/material/IconButton";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CircleIcon from "@mui/icons-material/Circle";
import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from "@mui/icons-material/Clear";
import RemoveIcon from "@mui/icons-material/Remove";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { alpha, useTheme } from "@mui/material/styles";


interface FlashcardProps {
  word: string;
  type: string;
  pronunciation: string;
  translation: string;
  example?: string;
  exampleTranslation?: string;
  color?: string;
}

const MAX_TICKS = 8;

type MarkType = 'tick' | 'x';

const Flashcard: React.FC<FlashcardProps> = ({
  word,
  type,
  pronunciation,
  translation,
  example,
  exampleTranslation,
  color,
}) => {
  const [flipped, setFlipped] = useState(false);
  const [frontMarks, setFrontMarks] = useState<MarkType[]>([]);
  const [backMarks, setBackMarks] = useState<MarkType[]>([]);
  const [hoveredFrontIndex, setHoveredFrontIndex] = useState<number | null>(null);
  const [hoveredBackIndex, setHoveredBackIndex] = useState<number | null>(null);
  const theme = useTheme();
  const cardColor = color || theme.palette.primary.main;

  const handleAddFrontMark = (markType: MarkType) => (e: React.MouseEvent) => {
    e.stopPropagation();
    setFrontMarks((prev) => (prev.length < MAX_TICKS ? [...prev, markType] : prev));
  };

  const handleAddBackMark = (markType: MarkType) => (e: React.MouseEvent) => {
    e.stopPropagation();
    setBackMarks((prev) => (prev.length < MAX_TICKS ? [...prev, markType] : prev));
  };

  const handleRemoveMark = (
    setMarks: React.Dispatch<React.SetStateAction<MarkType[]>>,
    index: number,
    setHoveredIndex: React.Dispatch<React.SetStateAction<number | null>>
  ) => (e: React.MouseEvent) => {
    e.stopPropagation();
    setMarks((prev) => prev.filter((_, i) => i !== index));
    setHoveredIndex(null);
  };

  const handleToggleMark = (
    setMarks: React.Dispatch<React.SetStateAction<MarkType[]>>,
    index: number
  ) => (e: React.MouseEvent) => {
    e.stopPropagation();
    setMarks((prev) =>
      prev.map((mark, i) => (i === index ? (mark === 'tick' ? 'x' : 'tick') : mark))
    );
  };

  const handleFlip = () => {
    setFlipped((prev) => !prev);
  };

  const renderFooter = (
    marks: MarkType[],
    onAddTick: (e: React.MouseEvent) => void,
    onAddX: (e: React.MouseEvent) => void,
    hoveredIndex: number | null,
    setHoveredIndex: React.Dispatch<React.SetStateAction<number | null>>,
    setMarks: React.Dispatch<React.SetStateAction<MarkType[]>>
  ) => (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        position: "absolute",
        left: 0,
        bottom: 8,
        width: "100%",
        justifyContent: "center",
        zIndex: 2,
        mb: 0.5,
      }}
    >
      {[...Array(MAX_TICKS)].map((_, i) => {
        const isFilled = i < marks.length;
        const isHovered = hoveredIndex === i && isFilled;
        const markType = marks[i];

        return (
          <Box
            key={i}
            sx={{ position: "relative", display: "inline-flex"}}
            onMouseEnter={() => isFilled && setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {isFilled ? (
              markType === 'tick' ? (
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    display: "grid",
                    placeItems: "center",
                    transition: "transform 0.2s ease-in-out",
                    transform: isHovered ? "scale(1.35)" : "scale(1)",
                    cursor: "pointer",
                  }}
                >
                  <CircleIcon
                    sx={{
                      gridArea: "1 / 1",
                      fontSize: 24,
                      color: theme.palette.success.main,
                    }}
                  />
                  <CheckIcon
                    sx={{
                      gridArea: "1 / 1",
                      fontSize: 16,
                      color: theme.palette.common.white,
                    }}
                  />
                </Box>
              ) : (
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    display: "grid",
                    placeItems: "center",
                    transition: "transform 0.2s ease-in-out",
                    transform: isHovered ? "scale(1.35)" : "scale(1)",
                    cursor: "pointer",
                  }}
                >
                  <CircleIcon
                    sx={{
                      gridArea: "1 / 1",
                      fontSize: 24,
                      color: theme.palette.error.main,
                    }}
                  />
                  <ClearIcon
                    sx={{
                      gridArea: "1 / 1",
                      fontSize: 16,
                      color: theme.palette.common.white,
                    }}
                  />
                </Box>
              )
            ) : (
              <CircleIcon
                fontSize="medium"
                sx={{
                  color: theme.palette.primary.contrastText,
                  opacity: 0.9,
                  stroke: cardColor,
                  strokeWidth: 1,
                }}
              />
            )}
            {/* Floating action button group */}
            {isHovered && (
              <Box
                sx={{
                  position: "absolute",
                  top: "100%",
                  left: "50%",
                  transform: "translateX(-50%)",
                  mt: 0.5,
                  display: "flex",
                  flexDirection: "column",
                  gap: 0.5,
                  zIndex: 10,
                  animation: "fadeSlideIn 0.2s ease-out",
                  "@keyframes fadeSlideIn": {
                    "0%": {
                      opacity: 0,
                      transform: "translateX(-50%) translateY(-8px) scale(0.9)",
                    },
                    "100%": {
                      opacity: 1,
                      transform: "translateX(-50%) translateY(0) scale(1)",
                    },
                  },
                }}
              >
                <IconButton
                  size="small"
                  aria-label="toggle-mark"
                  onClick={handleToggleMark(setMarks, i)}
                  sx={{
                    bgcolor: markType === 'tick' ? "error.light" : "success.light",
                    "&:hover": {
                      bgcolor: markType === 'tick' ? "error.main" : "success.main",
                    },
                    width: 28,
                    height: 28,
                  }}
                >
                  {markType === 'tick' ? (
                    <ClearIcon fontSize="small" sx={{ color: "white" }} />
                  ) : (
                    <CheckIcon fontSize="small" sx={{ color: "white" }} />
                  )}
                </IconButton>
                  <IconButton
                  size="small"
                  aria-label="remove-mark"
                  onClick={handleRemoveMark(setMarks, i, setHoveredIndex)}
                  sx={{
                    bgcolor: "grey.200",
                    "&:hover": { bgcolor: "grey.300" },
                    width: 28,
                    height: 28,
                  }}
                >
                  <RemoveIcon fontSize="small" />
                </IconButton>
              </Box>
            )}
          </Box>
        );
      })}
      <IconButton
        size="small"
        aria-label="add-tick"
        onClick={onAddTick}
        color='success'
        sx={{
          ml: 0.5,
          bgcolor: alpha(theme.palette.common.white, 0.18),
        }}
        disabled={marks.length >= MAX_TICKS}
      >
        <CheckIcon fontSize="medium" color={marks.length < MAX_TICKS ? "success" : "disabled"} />
      </IconButton>
      <IconButton
        size="small"
        aria-label="add-x"
        onClick={onAddX}
        color='error'
        sx={{
          bgcolor: alpha(theme.palette.common.white, 0.18),
        }}
        disabled={marks.length >= MAX_TICKS}
      >
        <ClearIcon fontSize="medium" color={marks.length < MAX_TICKS ? "error" : "disabled"} />
      </IconButton>
    </Box>
  );

  return (
    <Box
      sx={{
        perspective: 1200,
        display: "inline-block",
        width: 360,
        height: 220,
      }}
    >
      <Card
        variant="outlined"
        sx={{
          width: "100%",
          height: "100%",
          position: "relative",
          borderRadius: 3,
          borderColor: cardColor,
          boxShadow: `0 10px 24px ${alpha(cardColor, 0.35)}`,
          transition: "transform 0.5s",
          transformStyle: "preserve-3d",
          transform: flipped ? "rotateY(180deg)" : "none",
          overflow: "visible",
        }}
      >
        {/* Front Side */}
        <CardContent
          sx={{
            position: "absolute",
            width: "100%",
            height: "100%",
            top: 0,
            left: 0,
            backfaceVisibility: "hidden",
            opacity: flipped ? 0 : 1,
            pointerEvents: flipped ? "none" : "auto",
            transition: "opacity 0.3s",
            zIndex: flipped ? 0 : 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            gap: 0.5,
            px: 3,
            py: 4,
          }}
        >
          <Typography variant="h5" fontWeight="bold">{word}</Typography>
          <Typography variant="subtitle1" color="text.secondary">{type}</Typography>
          <Typography variant="subtitle1" color="text.secondary">{pronunciation}</Typography>
          {example && (
            <Typography variant="body1" mt={2} mb={3}>"{example}"</Typography>
          )}
          <IconButton
            aria-label="flip"
            onClick={handleFlip}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <ArrowForwardIcon />
          </IconButton>
          {renderFooter(
            frontMarks,
            handleAddFrontMark('tick'),
            handleAddFrontMark('x'),
            hoveredFrontIndex,
            setHoveredFrontIndex,
            setFrontMarks
          )}
        </CardContent>
        {/* Back Side */}
        <CardContent
          sx={{
            position: "absolute",
            width: "100%",
            height: "100%",
            top: 0,
            left: 0,
            backfaceVisibility: "hidden",
            bgcolor: cardColor,
            color: "#fff",
            transform: "rotateY(180deg)",
            opacity: flipped ? 1 : 0,
            pointerEvents: flipped ? "auto" : "none",
            transition: "opacity 0.3s",
            zIndex: flipped ? 1 : 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            gap: 0.5,
            px: 3,
            py: 4,
            borderRadius: 3,
          }}
        >
          <Typography variant="h5" fontWeight="bold">{translation}</Typography>
          {exampleTranslation && (
            <Typography variant="body2" mt={2}>"{exampleTranslation}"</Typography>
          )}
          <IconButton
            aria-label="flip-back"
            onClick={handleFlip}
            sx={{ position: "absolute", right: 8, top: 8, color: "#fff" }}
          >
            <ArrowBackIcon />
          </IconButton>
          {renderFooter(
            backMarks,
            handleAddBackMark('tick'),
            handleAddBackMark('x'),
            hoveredBackIndex,
            setHoveredBackIndex,
            setBackMarks
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Flashcard;
