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
import { resolveImageUrl } from '../../api/upload';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface FlashcardSideContent {
  type: 'text' | 'image';
  text?: string | null;
  image_url?: string | null;
}

interface FlashcardProps {
  front: FlashcardSideContent;
  back: FlashcardSideContent;
  color?: string;
}

// Legacy props for backwards compatibility (used by Home.tsx demo)
interface LegacyFlashcardProps {
  word: string;
  type: string;
  pronunciation: string;
  translation: string;
  example?: string;
  exampleTranslation?: string;
  color?: string;
}

type CombinedProps = FlashcardProps | LegacyFlashcardProps;

function isLegacy(p: CombinedProps): p is LegacyFlashcardProps {
  return 'word' in p;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_TICKS = 8;
type MarkType = 'tick' | 'x';

/** Returns true if the string contains an HTML tag (i.e. was created in rich-text mode). */
const containsHtml = (text: string): boolean => /<[a-z][\s\S]*>/i.test(text);

// ─── Side renderer ────────────────────────────────────────────────────────────

const SideContent: React.FC<{ content: FlashcardSideContent; inverted?: boolean }> = ({
  content,
  inverted,
}) => {
  if (content.type === 'image' && content.image_url) {
    return (
      <Box
        component="img"
        src={resolveImageUrl(content.image_url)}
        alt="Flashcard image"
        sx={{
          maxWidth: '100%',
          maxHeight: 120,
          objectFit: 'contain',
          borderRadius: 1,
        }}
      />
    );
  }

  const text = content.text ?? '';

  if (containsHtml(text)) {
    // Rich-text content: render as HTML
    return (
      <Box
        dangerouslySetInnerHTML={{ __html: text }}
        sx={{
          color: inverted ? '#fff' : 'inherit',
          textAlign: 'center',
          width: '100%',
          maxHeight: 130,
          overflowY: 'auto',
          fontSize: '0.9rem',
          lineHeight: 1.5,
          '& p': { margin: '0 0 0.2em', '&:last-child': { marginBottom: 0 } },
          '& ul, & ol': { paddingLeft: '1.2em', margin: '0 0 0.2em', textAlign: 'left' },
          '& strong': { fontWeight: 700 },
          '& em': { fontStyle: 'italic' },
          '& u': { textDecoration: 'underline' },
          '& s': { textDecoration: 'line-through' },
          '& sub': { verticalAlign: 'sub', fontSize: '0.75em' },
          '& sup': { verticalAlign: 'super', fontSize: '0.75em' },
        }}
      />
    );
  }

  // Plain text content
  return (
    <Typography
      variant="h6"
      fontWeight="bold"
      sx={{ color: inverted ? '#fff' : 'text.primary', textAlign: 'center' }}
    >
      {text}
    </Typography>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────

const Flashcard: React.FC<CombinedProps> = (props) => {
  const [flipped, setFlipped] = useState(false);
  const [frontMarks, setFrontMarks] = useState<MarkType[]>([]);
  const [backMarks, setBackMarks] = useState<MarkType[]>([]);
  const [hoveredFrontIndex, setHoveredFrontIndex] = useState<number | null>(null);
  const [hoveredBackIndex, setHoveredBackIndex] = useState<number | null>(null);
  const theme = useTheme();

  // Normalise props
  const frontContent: FlashcardSideContent = isLegacy(props)
    ? { type: 'text', text: `${props.word}${props.pronunciation ? ` (${props.pronunciation})` : ''}` }
    : props.front;
  const backContent: FlashcardSideContent = isLegacy(props)
    ? { type: 'text', text: props.translation }
    : props.back;
  const cardColor = props.color || theme.palette.primary.main;

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
    setHoveredIndex: React.Dispatch<React.SetStateAction<number | null>>,
  ) => (e: React.MouseEvent) => {
    e.stopPropagation();
    setMarks((prev) => prev.filter((_, i) => i !== index));
    setHoveredIndex(null);
  };

  const handleToggleMark = (
    setMarks: React.Dispatch<React.SetStateAction<MarkType[]>>,
    index: number,
  ) => (e: React.MouseEvent) => {
    e.stopPropagation();
    setMarks((prev) =>
      prev.map((mark, i) => (i === index ? (mark === 'tick' ? 'x' : 'tick') : mark)),
    );
  };

  const renderFooter = (
    marks: MarkType[],
    onAddTick: (e: React.MouseEvent) => void,
    onAddX: (e: React.MouseEvent) => void,
    hoveredIndex: number | null,
    setHoveredIndex: React.Dispatch<React.SetStateAction<number | null>>,
    setMarks: React.Dispatch<React.SetStateAction<MarkType[]>>,
  ) => (
    <Box
      sx={{
        display: 'flex', alignItems: 'center', gap: 1,
        position: 'absolute', left: 0, bottom: 8, width: '100%',
        justifyContent: 'center', zIndex: 2, mb: 0.5,
      }}
    >
      {[...Array(MAX_TICKS)].map((_, i) => {
        const isFilled = i < marks.length;
        const isHovered = hoveredIndex === i && isFilled;
        const markType = marks[i];

        return (
          <Box
            key={i}
            sx={{ position: 'relative', display: 'inline-flex' }}
            onMouseEnter={() => isFilled && setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {isFilled ? (
              <Box
                sx={{
                  width: 24, height: 24, display: 'grid', placeItems: 'center',
                  transition: 'transform 0.2s', transform: isHovered ? 'scale(1.35)' : 'scale(1)',
                  cursor: 'pointer',
                }}
              >
                <CircleIcon sx={{ gridArea: '1 / 1', fontSize: 24, color: markType === 'tick' ? theme.palette.success.main : theme.palette.error.main }} />
                {markType === 'tick'
                  ? <CheckIcon sx={{ gridArea: '1 / 1', fontSize: 16, color: '#fff' }} />
                  : <ClearIcon sx={{ gridArea: '1 / 1', fontSize: 16, color: '#fff' }} />}
              </Box>
            ) : (
              <CircleIcon fontSize="medium" sx={{ color: theme.palette.primary.contrastText, opacity: 0.9, stroke: cardColor, strokeWidth: 1 }} />
            )}
            {isHovered && (
              <Box sx={{
                position: 'absolute', top: '100%', left: '50%',
                transform: 'translateX(-50%)', mt: 0.5,
                display: 'flex', flexDirection: 'column', gap: 0.5, zIndex: 10,
              }}>
                <IconButton
                  size="small"
                  onClick={handleToggleMark(setMarks, i)}
                  sx={{ bgcolor: markType === 'tick' ? 'error.light' : 'success.light', '&:hover': { bgcolor: markType === 'tick' ? 'error.main' : 'success.main' }, width: 28, height: 28 }}
                >
                  {markType === 'tick' ? <ClearIcon fontSize="small" sx={{ color: 'white' }} /> : <CheckIcon fontSize="small" sx={{ color: 'white' }} />}
                </IconButton>
                <IconButton
                  size="small"
                  onClick={handleRemoveMark(setMarks, i, setHoveredIndex)}
                  sx={{ bgcolor: 'grey.200', '&:hover': { bgcolor: 'grey.300' }, width: 28, height: 28 }}
                >
                  <RemoveIcon fontSize="small" />
                </IconButton>
              </Box>
            )}
          </Box>
        );
      })}
      <IconButton size="small" onClick={onAddTick} color="success" sx={{ ml: 0.5, bgcolor: alpha(theme.palette.common.white, 0.18) }} disabled={marks.length >= MAX_TICKS}>
        <CheckIcon fontSize="medium" color={marks.length < MAX_TICKS ? 'success' : 'disabled'} />
      </IconButton>
      <IconButton size="small" onClick={onAddX} color="error" sx={{ bgcolor: alpha(theme.palette.common.white, 0.18) }} disabled={marks.length >= MAX_TICKS}>
        <ClearIcon fontSize="medium" color={marks.length < MAX_TICKS ? 'error' : 'disabled'} />
      </IconButton>
    </Box>
  );

  return (
    <Box sx={{ perspective: 1200, display: 'inline-block', width: 360, height: 220 }}>
      <Card
        variant="outlined"
        sx={{
          width: '100%', height: '100%', position: 'relative', borderRadius: 3,
          borderColor: cardColor, boxShadow: `0 10px 24px ${alpha(cardColor, 0.35)}`,
          transition: 'transform 0.5s', transformStyle: 'preserve-3d',
          transform: flipped ? 'rotateY(180deg)' : 'none', overflow: 'visible',
        }}
      >
        {/* Front */}
        <CardContent
          sx={{
            position: 'absolute', width: '100%', height: '100%', top: 0, left: 0,
            backfaceVisibility: 'hidden', opacity: flipped ? 0 : 1,
            pointerEvents: flipped ? 'none' : 'auto', transition: 'opacity 0.3s',
            zIndex: flipped ? 0 : 1, display: 'flex', flexDirection: 'column',
            justifyContent: 'center', alignItems: 'center', textAlign: 'center',
            gap: 0.5, px: 3, py: 4,
          }}
        >
          <SideContent content={frontContent} />
          <IconButton aria-label="flip" onClick={() => setFlipped(true)} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <ArrowForwardIcon />
          </IconButton>
          {renderFooter(frontMarks, handleAddFrontMark('tick'), handleAddFrontMark('x'), hoveredFrontIndex, setHoveredFrontIndex, setFrontMarks)}
        </CardContent>

        {/* Back */}
        <CardContent
          sx={{
            position: 'absolute', width: '100%', height: '100%', top: 0, left: 0,
            backfaceVisibility: 'hidden', bgcolor: cardColor, color: '#fff',
            transform: 'rotateY(180deg)', opacity: flipped ? 1 : 0,
            pointerEvents: flipped ? 'auto' : 'none', transition: 'opacity 0.3s',
            zIndex: flipped ? 1 : 0, display: 'flex', flexDirection: 'column',
            justifyContent: 'center', alignItems: 'center', textAlign: 'center',
            gap: 0.5, px: 3, py: 4, borderRadius: 3,
          }}
        >
          <SideContent content={backContent} inverted />
          <IconButton aria-label="flip-back" onClick={() => setFlipped(false)} sx={{ position: 'absolute', right: 8, top: 8, color: '#fff' }}>
            <ArrowBackIcon />
          </IconButton>
          {renderFooter(backMarks, handleAddBackMark('tick'), handleAddBackMark('x'), hoveredBackIndex, setHoveredBackIndex, setBackMarks)}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Flashcard;
