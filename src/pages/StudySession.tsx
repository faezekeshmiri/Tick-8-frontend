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
import { useTranslation } from 'react-i18next';
import { extractErrorMessage } from "../utils/error";
import Flashcard from "../components/Flashcard";

type TickResult = "remembered" | "forgot";

const StudySession: React.FC = () => {
  const { t } = useTranslation();
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
      setError(extractErrorMessage(err, t('study.loadQueueError')));
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
      setError(extractErrorMessage(err, t('study.loadCardError')));
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
      setError(extractErrorMessage(err, t('study.recordError')));
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
          {t('study.queueError')}
        </Typography>
        <Button variant="contained" onClick={() => navigate("/")}>
          {t('study.backToHome')}
        </Button>
      </Box>
    );
  }

  if (queueData.queue.length === 0) {
    return (
      <Box sx={{ maxWidth: 560, mx: "auto", p: 2 }}>
        <Typography variant="h6" gutterBottom>
          {t('study.allCaughtUp')}
        </Typography>
        <Button variant="contained" onClick={() => navigate("/")}>
          {t('study.backToHome')}
        </Button>
      </Box>
    );
  }

  if (sessionDone) {
    return (
      <Box sx={{ maxWidth: 560, mx: "auto", p: 2 }}>
        <Typography variant="h6" gutterBottom>
          {t('study.sessionComplete')}
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          {t('study.reviewedCards', { count: reviewedCount, remembered, forgot })}
        </Typography>
        <Button variant="contained" onClick={() => navigate("/")}>
          {t('study.backToHome')}
        </Button>
      </Box>
    );
  }

  const catchUpLabel =
    currentItem && currentItem.catch_up_total > 1
      ? t('study.catchUpLabel', { n: currentItem.catch_up_n, total: currentItem.catch_up_total })
      : null;
  const phaseLabel =
    card && card.phase >= 1
      ? t('study.phaseLabel', { phase: card.phase, tick: card.tick_in_phase })
      : t('study.srsReview');

  return (
    <Box sx={{ maxWidth: 560, mx: "auto", px: 2, py: 3 }}>
      <LinearProgress
        variant="determinate"
        value={total ? (index / total) * 100 : 0}
        sx={{ height: 6, borderRadius: 1, mb: 2 }}
      />
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        {t('study.ofTotal', { current: index + 1, total })}
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
            color={card.subcategory_color}
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
              {t('study.reveal', { side: card.hidden_side_label })}
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
                disabled={sending}
                sx={{ flex: 1 }}
              >
                {t('study.forgot')}
              </Button>
              <Button
                variant="contained"
                color="success"
                startIcon={<CheckCircleIcon />}
                onClick={() => handleResponse("remembered")}
                disabled={sending}
                sx={{ flex: 1 }}
              >
                {t('study.remembered')}
              </Button>
            </Box>
          )}
        </Box>
      )}

      <Dialog open={regressionOffer} onClose={closeRegressionOffer}>
        <DialogTitle>{t('study.regressionTitle')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('study.regressionMessage')}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeRegressionOffer}>{t('study.noContinue')}</Button>
          <Button variant="contained" onClick={closeRegressionOffer}>
            {t('study.yesRevisit')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StudySession;
