import React, { useState } from 'react';
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import IconButton from "@mui/material/IconButton";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

interface FlashcardProps {
  word: string;
  type: string;
  pronunciation: string;
  translation: string;
  example?: string;
  exampleTranslation?: string;
}

const MAX_TICKS = 8;

const Flashcard: React.FC<FlashcardProps> = ({
  word,
  type,
  pronunciation,
  translation,
  example,
  exampleTranslation,
}) => {
  const [flipped, setFlipped] = useState(false);
  const [ticks, setTicks] = useState(0);

  const handleAddTick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTicks((prev) => (prev < MAX_TICKS ? prev + 1 : prev));
  };

  const handleFlip = () => {
    setFlipped((prev) => {
      // Remove a tick on flip (if any)
      if (ticks > 0) setTicks((t) => t - 1);
      return !prev;
    });
  };

  const footer = (
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
      }}
    >
      {[...Array(MAX_TICKS)].map((_, i) =>
        i < ticks ? (
          <CheckCircleIcon key={i} fontSize="small" color="success" />
        ) : (
          <RadioButtonUncheckedIcon key={i} fontSize="small" color="disabled" />
        )
      )}
      <IconButton
        size="small"
        aria-label="add-tick"
        onClick={handleAddTick}
        sx={{ ml: 1 }}
        disabled={ticks >= MAX_TICKS}
      >
        <AddCircleOutlineIcon color={ticks < MAX_TICKS ? "primary" : "disabled"} />
      </IconButton>
    </Box>
  );

  return (
    <Box sx={{ perspective: 1000, display: "inline-block" }}>
      <Card
        variant="outlined"
        sx={{
          width: 345,
          height: 200,
          position: "relative",
          transition: "transform 0.5s",
          transformStyle: "preserve-3d",
          transform: flipped ? "rotateY(180deg)" : "none",
          overflow: "visible", // <-- important for 3D flip
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
          }}
        >
          <Typography variant="h5" fontWeight="bold">{word}</Typography>
          <Typography variant="subtitle2" color="text.secondary">{type}</Typography>
          <Typography variant="subtitle2" color="text.secondary">{pronunciation}</Typography>
          {example && (
            <Typography variant="body2" mt={2}>"{example}"</Typography>
          )}
          <IconButton
            aria-label="flip"
            onClick={handleFlip}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <ArrowForwardIcon />
          </IconButton>
          {footer}
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
            bgcolor: "#48CAE4", // Use your theme's primary.light color
            color: "#fff",      // Use your theme's primary.contrastText color
            transform: "rotateY(180deg)",
            opacity: flipped ? 1 : 0,
            pointerEvents: flipped ? "auto" : "none",
            transition: "opacity 0.3s",
            zIndex: flipped ? 1 : 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
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
          {footer}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Flashcard;
