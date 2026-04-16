import React, { useCallback, useRef, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Skeleton,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ToggleButton,
  ToggleButtonGroup,
  Snackbar,
} from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import ScheduleSendIcon from "@mui/icons-material/ScheduleSend";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getTodaysQueueWithCards,
  getUpcomingReviews,
  getNextReviewDate,
  setProgressTicks,
  postponeSession,
} from "../api/study";
import { listCategories } from "../api/categories";
import { queryKeys } from "../api/queryKeys";
import type { MarkType } from "../components/Flashcard/Flashcard";
import { extractErrorMessage } from "../utils/error";
import Flashcard from "../components/Flashcard";

/** Map MarkType to backend TickMark: tick → remembered, x → forgot. */
const marksToTickMarks = (front: MarkType[], back: MarkType[]): ("remembered" | "forgot")[] => [
  ...front.map((m) => (m === "tick" ? "remembered" : "forgot")),
  ...back.map((m) => (m === "tick" ? "remembered" : "forgot")),
];

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const saveTicksTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: items = [], isLoading: loading, error: listError } = useQuery({
    queryKey: queryKeys.studyQueueWithCards(),
    queryFn: async () => {
      const res = await getTodaysQueueWithCards();
      return Array.isArray(res) ? res : [];
    },
  });

  const { data: categoriesData } = useQuery({
    queryKey: queryKeys.categories(undefined, 1),
    queryFn: () => listCategories({ page: 1, per_page: 1 }),
  });
  const hasAnyCategories = (categoriesData?.total ?? 0) > 0;

  const { data: upcoming = [] } = useQuery({
    queryKey: queryKeys.studyUpcoming(5),
    queryFn: () => getUpcomingReviews(5),
  });

  const { data: nextReviewData } = useQuery({
    queryKey: queryKeys.studyNextReviewDate(),
    queryFn: getNextReviewDate,
  });
  const nextDate = nextReviewData?.date ?? null;

  const ticksMutation = useMutation({
    mutationFn: ({ progressId, marks }: { progressId: number; marks: ("remembered" | "forgot")[] }) =>
      setProgressTicks(progressId, marks),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.studyQueueWithCards() });
    },
  });

  const handleMarksChange = useCallback(
    (progressId: number, frontMarks: MarkType[], backMarks: MarkType[]) => {
      if (saveTicksTimeoutRef.current) clearTimeout(saveTicksTimeoutRef.current);
      saveTicksTimeoutRef.current = setTimeout(() => {
        saveTicksTimeoutRef.current = null;
        const marks = marksToTickMarks(frontMarks, backMarks);
        ticksMutation.mutate({ progressId, marks });
      }, 400);
    },
    [ticksMutation]
  );

  const [postponeOpen, setPostponeOpen] = useState(false);
  const [postponeDays, setPostponeDays] = useState<number>(1);
  const [snackMsg, setSnackMsg] = useState("");

  const postponeMutation = useMutation({
    mutationFn: (days: number) => postponeSession(days),
    onSuccess: (data) => {
      setPostponeOpen(false);
      setSnackMsg(t('home.postponeSuccess', { count: data.postponed_count, days: postponeDays }));
      queryClient.invalidateQueries({ queryKey: queryKeys.studyQueueWithCards() });
      queryClient.invalidateQueries({ queryKey: queryKeys.studyQueue() });
      queryClient.invalidateQueries({ queryKey: queryKeys.studyUpcoming() });
      queryClient.invalidateQueries({ queryKey: queryKeys.studyNextReviewDate() });
    },
    onError: (err) => {
      setSnackMsg(extractErrorMessage(err, t('home.postponeFailed')));
    },
  });

  const error = listError ? extractErrorMessage(listError, t('home.failedToLoad')) : "";

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", px: 2, py: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h5" fontWeight={600}>
          {t('home.todaysStudy')}
        </Typography>
        {!loading && items.length > 0 && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<ScheduleSendIcon />}
            onClick={() => { setPostponeDays(1); setPostponeOpen(true); }}
          >
            {t('home.postpone')}
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Skeleton height={32} sx={{ mb: 1 }} />
            <Skeleton height={24} width="60%" />
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mt: 2 }}>
              <Skeleton variant="rectangular" width={360} height={220} />
              <Skeleton variant="rectangular" width={360} height={220} />
            </Box>
          </CardContent>
        </Card>
      ) : (
        <>
          {items.length === 0 ? (
            <>
              {!hasAnyCategories ? (
                <Card variant="outlined" sx={{ mb: 3 }}>
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, mb: 2 }}>
                      <AddCircleOutlineIcon color="action" sx={{ mt: 0.25 }} />
                      <Box>
                        <Typography variant="subtitle1" fontWeight={600} color="text.primary" gutterBottom>
                          {t('home.noFlashcardsTitle')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {t('home.noFlashcardsDesc')}
                        </Typography>
                        <Button
                          variant="contained"
                          onClick={() => navigate("/categories")}
                        >
                          {t('home.goToCategories')}
                        </Button>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ) : (
                <Card variant="outlined" sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography color={error ? "error" : "text.secondary"} sx={{ mb: 2 }}>
                      {error
                        ? t('home.loadError')
                        : (
                          <>
                            {t('home.allCaughtUp')}
                            {nextDate && (
                              <> {t('home.nextReviewOn', { date: new Date(nextDate).toLocaleDateString() })}</>
                            )}
                          </>
                        )}
                    </Typography>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 3,
                justifyContent: "flex-start",
                alignItems: "flex-start",
                mb: 3,
              }}
            >
              {items.map((item) => (
                <Box key={item.progress_id} sx={{ flexShrink: 0 }}>
                  <Flashcard
                    front={{
                      type: item.front.type === "image" ? "image" : "text",
                      text: item.front.text ?? null,
                      image_url: item.front.image_url ?? null,
                    }}
                    back={{
                      type: item.back.type === "image" ? "image" : "text",
                      text: item.back.text ?? null,
                      image_url: item.back.image_url ?? null,
                    }}
                    color={item.subcategory_color}
                    progressMarks={item.marks}
                    onMarksChange={(frontMarks, backMarks) =>
                      handleMarksChange(item.progress_id, frontMarks, backMarks)
                    }
                  />
                </Box>
              ))}
            </Box>
          )}

          {!loading && (upcoming.length > 0 || nextDate) && (
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                  <CalendarTodayIcon color="action" />
                  <Typography variant="subtitle1" color="text.secondary">
                    {t('home.upcomingReviews')}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {upcoming
                    .map((day, i) => {
                      const label =
                        i === 0 ? t('home.tomorrow') : t('home.inDays', { count: i + 1 });
                      return `${label}: ${day.count}`;
                    })
                    .join(" · ")}
                </Typography>
              </CardContent>
            </Card>
          )}

          <Button
            variant="outlined"
            fullWidth
            onClick={() => navigate("/categories")}
            sx={{ mt: 1 }}
          >
            {t('home.browseCategories')}
          </Button>
        </>
      )}

      <Dialog
        open={postponeOpen}
        onClose={() => setPostponeOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>{t('home.postponeTitle')}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
            {t('home.postponeDescription')}
          </Typography>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            {t('home.postponeDaysLabel')}
          </Typography>
          <ToggleButtonGroup
            value={postponeDays}
            exclusive
            onChange={(_, val) => { if (val !== null) setPostponeDays(val); }}
            sx={{ flexWrap: "wrap", gap: 0.5 }}
          >
            {[1, 2, 3, 5, 7, 14, 30].map((d) => (
              <ToggleButton key={d} value={d} sx={{ minWidth: 48 }}>
                {d}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
            {t('home.postponeHint', { days: postponeDays })}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPostponeOpen(false)}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="contained"
            onClick={() => postponeMutation.mutate(postponeDays)}
            disabled={postponeMutation.isPending}
          >
            {postponeMutation.isPending ? t('common.savingEllipsis') : t('home.postponeConfirm')}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!snackMsg}
        autoHideDuration={4000}
        onClose={() => setSnackMsg("")}
        message={snackMsg}
      />
    </Box>
  );
};

export default Home;
