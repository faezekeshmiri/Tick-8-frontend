import React, { useCallback, useRef } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Skeleton,
  Alert,
} from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getTodaysQueueWithCards,
  getUpcomingReviews,
  getNextReviewDate,
  setProgressTicks,
} from "../api/study";
import { queryKeys } from "../api/queryKeys";
import type { UpcomingDay } from "../types/study.types";
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
  const queryClient = useQueryClient();
  const saveTicksTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: items = [], isLoading: loading, error: listError } = useQuery({
    queryKey: queryKeys.studyQueueWithCards(),
    queryFn: async () => {
      const res = await getTodaysQueueWithCards();
      return Array.isArray(res) ? res : [];
    },
  });

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

  const error = listError ? extractErrorMessage(listError, "Failed to load study queue.") : "";

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", px: 2, py: 3 }}>
      <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
        Today&apos;s Study
      </Typography>

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
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Typography color={error ? "error" : "text.secondary"} sx={{ mb: 2 }}>
                  {error
                    ? "Could not load your study queue. Check that the backend is running and migrations are applied."
                    : (
                      <>
                        You&apos;re all caught up!
                        {nextDate && (
                          <> Your next review is on {new Date(nextDate).toLocaleDateString()}.</>
                        )}
                      </>
                    )}
                </Typography>
              </CardContent>
            </Card>
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
                    Upcoming Reviews
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {upcoming
                    .map((day, i) => {
                      const label =
                        i === 0 ? "Tomorrow" : i === 1 ? "In 2 days" : `In ${i + 1} days`;
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
            Browse categories
          </Button>
        </>
      )}
    </Box>
  );
};

export default Home;
