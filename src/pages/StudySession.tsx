import React, { useCallback, useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
  LinearProgress,
  Skeleton,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useNavigate } from "react-router-dom";
import { getTodaysQueue, getStudyCard, recordTick } from "../api/study";
import type {
  QueueItem,
  StudyCardResponse,
  TodaysQueueResponse,
} from "../types/study.types";
import { extractErrorMessage } from "../utils/error";
import Flashcard from "../components/Flashcard";

type TickResult = "remembered" | "forgot";

const StudySession: React.FC = () => {
  const navigate = useNavigate();
  const [queueData, setQueueData] = useState<TodaysQueueResponse | null>(null);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [index, setIndex] = useState(0);
  const [card, setCard] = useState<StudyCardResponse | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [regressionOffer, setRegressionOffer] = useState(false);
  const [sessionDone, setSessionDone] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);
  const [remembered, setRemembered] = useState(0);
  const [forgot, setForgot] = useState(0);

  const currentItem = queue[index] ?? null;
  const total = queue.length;

  const loadQueue = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getTodaysQueue();
      setQueueData(data);
      setQueue(data.queue);
      setIndex(0);
      setCard(null);
      setRevealed(false);
      setSessionDone(data.queue.length === 0);
    } catch (err) {
      setError(extractErrorMessage(err, "Failed to load queue."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  const loadCard = useCallback(async () => {
    if (!currentItem) return;
    setError("");
    try {
      const c = await getStudyCard(currentItem.progress_id, {
        tick_in_phase: currentItem.tick_in_phase,
        catch_up_n: currentItem.catch_up_n,
        catch_up_total: currentItem.catch_up_total,
      });
      setCard(c);
      setRevealed(false);
    } catch (err) {
      setError(extractErrorMessage(err, "Failed to load card."));
    }
  }, [currentItem]);

  useEffect(() => {
    if (queue.length === 0) return;
    if (index >= queue.length) {
      setSessionDone(true);
      return;
    }
    loadCard();
  }, [index, queue.length, loadCard]);

  const handleReveal = () => setRevealed(true);

  const handleResponse = async (result: TickResult) => {
    if (!card || !currentItem || sending) return;
    setSending(true);
    setError("");
    try {
      const res = await recordTick(currentItem.progress_id, { result });
      setReviewedCount((n) => n + 1);
      if (result === "remembered") setRemembered((n) => n + 1);
      if (result === "forgot") setForgot((n) => n + 1);
      if (res.phase2_regression_offer) {
        setRegressionOffer(true);
        return;
      }
      setIndex((i) => i + 1);
    } catch (err) {
      setError(extractErrorMessage(err, "Failed to record response."));
    } finally {
      setSending(false);
    }
  };

  const closeRegressionOffer = () => {
    setRegressionOffer(false);
    setIndex((i) => i + 1);
  };

  if (loading) {
    return (
      <Box sx={{ maxWidth: 560, mx: "auto", p: 2 }}>
        <Skeleton height={200} sx={{ mb: 2 }} />
        <Skeleton height={48} width="100%" />
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ maxWidth: 560, mx: "auto", p: 2 }}>
        <Skeleton height={200} sx={{ mb: 2 }} />
        <Skeleton height={48} width="100%" />
      </Box>
    );
  }

  if (!queueData) {
    return (
      <Box sx={{ maxWidth: 560, mx: "auto", p: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          Could not load your study queue. Please make sure the database migrations have been applied
          and try again.
        </Typography>
        <Button variant="contained" onClick={() => navigate("/")}>
          Back to Home
        </Button>
      </Box>
    );
  }

  if (queueData.queue.length === 0) {
    return (
      <Box sx={{ maxWidth: 560, mx: "auto", p: 2 }}>
        <Typography variant="h6" gutterBottom>
          You&apos;re all caught up!
        </Typography>
        <Button variant="contained" onClick={() => navigate("/")}>
          Back to Home
        </Button>
      </Box>
    );
  }

  if (sessionDone) {
    return (
      <Box sx={{ maxWidth: 560, mx: "auto", p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Session complete
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          You reviewed {reviewedCount} card{reviewedCount !== 1 ? "s" : ""}. Remembered:{" "}
          {remembered} · Forgot: {forgot}
        </Typography>
        <Button variant="contained" onClick={() => navigate("/")}>
          Back to Home
        </Button>
      </Box>
    );
  }

  const catchUpLabel =
    currentItem && currentItem.catch_up_total > 1
      ? `Catch-up · Review ${currentItem.catch_up_n} of ${currentItem.catch_up_total}`
      : null;
  const phaseLabel =
    card && card.phase >= 1
      ? `Phase ${card.phase} · Review ${card.tick_in_phase} of 8`
      : "SRS review";

  return (
    <Box sx={{ maxWidth: 560, mx: "auto", px: 2, py: 3 }}>
      <LinearProgress
        variant="determinate"
        value={total ? (index / total) * 100 : 0}
        sx={{ height: 6, borderRadius: 1, mb: 2 }}
      />
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        {index + 1} of {total}
        {catchUpLabel && ` · ${catchUpLabel}`}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!card ? (
        <Skeleton height={220} width={360} sx={{ mb: 2 }} />
      ) : (
        <Box sx={{ mb: 2 }}>
          <Typography variant="overline" color="text.secondary" display="block" gutterBottom>
            {phaseLabel}
          </Typography>
          <Flashcard
            front={{
              type: card.content.type === "image" ? "image" : "text",
              text: card.content.text ?? null,
              image_url: card.content.image_url ?? null,
            }}
            back={{
              type: card.content_hidden.type === "image" ? "image" : "text",
              text: card.content_hidden.text ?? null,
              image_url: card.content_hidden.image_url ?? null,
            }}
            mode="study"
            revealed={revealed}
          />
          {!revealed ? (
            <Button
              variant="outlined"
              fullWidth
              onClick={handleReveal}
              sx={{ mt: 2 }}
            >
              Reveal {card.hidden_side_label}
            </Button>
          ) : (
            <Box
              sx={{
                display: "flex",
                gap: 1,
                mt: 2,
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <Button
                variant="contained"
                color="error"
                startIcon={<CloseIcon />}
                onClick={() => handleResponse("forgot")}
                disabled={recordTickMutation.isPending}
                sx={{ flex: 1 }}
              >
                Forgot
              </Button>
              <Button
                variant="contained"
                color="success"
                startIcon={<CheckCircleIcon />}
                onClick={() => handleResponse("remembered")}
                disabled={recordTickMutation.isPending}
                sx={{ flex: 1 }}
              >
                Remembered
              </Button>
            </Box>
          )}
        </Box>
      )}

      <Dialog open={regressionOffer} onClose={closeRegressionOffer}>
        <DialogTitle>Phase 1 revisit?</DialogTitle>
        <DialogContent>
          <Typography>
            You&apos;ve forgotten this card 3 times in a row. Would you like to briefly revisit
            the front-to-back direction before continuing?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeRegressionOffer}>No, continue</Button>
          <Button variant="contained" onClick={closeRegressionOffer}>
            Yes, revisit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StudySession;
