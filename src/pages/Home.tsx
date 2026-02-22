import React, { useCallback, useEffect, useRef, useState } from "react";
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
import {
  getTodaysQueueWithCards,
  getUpcomingReviews,
  getNextReviewDate,
  setProgressTicks,
} from "../api/study";
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
  const [items, setItems] = useState<Awaited<ReturnType<typeof getTodaysQueueWithCards>>>([]);
  const [upcoming, setUpcoming] = useState<UpcomingDay[]>([]);
  const [nextDate, setNextDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const saveTicksTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [cardsRes, upcomingRes, nextRes] = await Promise.all([
        getTodaysQueueWithCards(),
        getUpcomingReviews(5),
        getNextReviewDate(),
      ]);
      setItems(Array.isArray(cardsRes) ? cardsRes : []);
      setUpcoming(upcomingRes);
      setNextDate(nextRes.date ?? null);
    } catch (err) {
      setError(extractErrorMessage(err, "Failed to load study queue."));
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const handleMarksChange = useCallback(
    (progressId: number, frontMarks: MarkType[], backMarks: MarkType[]) => {
      if (saveTicksTimeoutRef.current) clearTimeout(saveTicksTimeoutRef.current);
      saveTicksTimeoutRef.current = setTimeout(async () => {
        saveTicksTimeoutRef.current = null;
        const marks = marksToTickMarks(frontMarks, backMarks);
        try {
          await setProgressTicks(progressId, marks);
          const cardsRes = await getTodaysQueueWithCards();
          setItems(Array.isArray(cardsRes) ? cardsRes : []);
        } catch {
          // optional: toast
        }
      }, 400);
    },
    []
  );

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", px: 2, py: 3 }}>
      <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
        Today&apos;s Study
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
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
