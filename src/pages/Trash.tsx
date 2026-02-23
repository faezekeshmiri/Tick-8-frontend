import React, { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Typography,
  Chip,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import RestoreIcon from "@mui/icons-material/Restore";
import FolderIcon from "@mui/icons-material/Folder";
import LayersIcon from "@mui/icons-material/Layers";
import StyleIcon from "@mui/icons-material/Style";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listTrash, restoreItem } from "../api/trash";
import { queryKeys } from "../api/queryKeys";
import type {
  TrashCategory,
  TrashFlashcard,
  TrashItemType,
  TrashResponse,
  TrashSubCategory,
} from "../types/content.types";
import { extractErrorMessage } from "../utils/error";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function daysLeft(iso: string, retentionDays = 30): number {
  const deletedAt = new Date(iso).getTime();
  const expiresAt = deletedAt + retentionDays * 86_400_000;
  return Math.max(0, Math.ceil((expiresAt - Date.now()) / 86_400_000));
}

// ─── Single trash item row ────────────────────────────────────────────────────

interface TrashItemRowProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  deletedAt: string;
  onRestore: () => void;
  restoring: boolean;
}

const TrashItemRow: React.FC<TrashItemRowProps> = ({
  icon,
  title,
  subtitle,
  deletedAt,
  onRestore,
  restoring,
}) => {
  const days = daysLeft(deletedAt);
  return (
    <Box className="flex items-center gap-3 py-2">
      <Box sx={{ color: "text.secondary", flexShrink: 0 }}>{icon}</Box>
      <Box className="flex-1 min-w-0">
        <Typography variant="body2" className="font-medium truncate">
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        )}
        <Typography variant="caption" color="text.secondary" className="ml-2">
          · Deleted {formatDate(deletedAt)}
        </Typography>
      </Box>
      <Chip
        label={`${days}d left`}
        size="small"
        color={days <= 3 ? "error" : days <= 7 ? "warning" : "default"}
        variant="outlined"
        sx={{ flexShrink: 0 }}
      />
      <Button
        size="small"
        startIcon={restoring ? <CircularProgress size={14} /> : <RestoreIcon />}
        onClick={onRestore}
        disabled={restoring}
        sx={{ flexShrink: 0 }}
      >
        Restore
      </Button>
    </Box>
  );
};

// ─── Section card ─────────────────────────────────────────────────────────────

interface SectionProps {
  title: string;
  icon: React.ReactNode;
  count: number;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, icon, count, children }) => (
  <Card variant="outlined" className="mb-4">
    <CardContent>
      <Box className="flex items-center gap-2 mb-3">
        {icon}
        <Typography variant="subtitle1" className="font-semibold">
          {title}
        </Typography>
        <Chip label={count} size="small" color="secondary" variant="outlined" />
      </Box>
      <Divider className="mb-2" />
      {children}
    </CardContent>
  </Card>
);

// ─── Main page ────────────────────────────────────────────────────────────────

const Trash: React.FC = () => {
  const queryClient = useQueryClient();
  const [restoringKey, setRestoringKey] = useState<string | null>(null);
  const [restoreError, setRestoreError] = useState("");

  const { data, isLoading: loading, error: listError } = useQuery({
    queryKey: queryKeys.trash(),
    queryFn: listTrash,
  });

  const restoreMutation = useMutation({
    mutationFn: ({ type, id }: { type: TrashItemType; id: number }) => restoreItem(type, id),
    onMutate: ({ type, id }) => setRestoringKey(`${type}-${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.trash() });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['subcategories'] });
      queryClient.invalidateQueries({ queryKey: ['flashcards'] });
    },
    onSettled: () => setRestoringKey(null),
    onError: (err) => setRestoreError(extractErrorMessage(err, "Failed to restore item.")),
  });

  const handleRestore = (type: TrashItemType, id: number) => {
    setRestoreError("");
    restoreMutation.mutate({ type, id });
  };

  const error = listError ? extractErrorMessage(listError, "Failed to load trash.") : "";
  const isEmpty =
    data && data.categories.length === 0 && data.subcategories.length === 0 && data.flashcards.length === 0;

  return (
    <Box className="w-full">
      <Box className="mx-auto w-full px-4 pb-20 pt-6 sm:px-6 lg:px-8">
        {/* ── Header ── */}
        <Box className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Box>
            <Box className="flex items-center gap-2">
              <DeleteOutlineIcon />
              <Typography variant="h4" className="font-bold">
                Trash
              </Typography>
            </Box>
            <Typography variant="body1" color="text.secondary" className="mt-1">
              Deleted items are kept for 30 days, then removed from here automatically.
            </Typography>
          </Box>
          {data && (
            <Chip
              label={`${data.total} items`}
              color="secondary"
              variant="outlined"
              className="font-semibold"
            />
          )}
        </Box>

        <Divider className="my-4" />

        {restoreError && (
          <Alert severity="error" className="mb-4" onClose={() => setRestoreError("")}>
            {restoreError}
          </Alert>
        )}
        {error && <Alert severity="error" className="mb-4">{error}</Alert>}

        {loading ? (
          <Box className="flex justify-center py-16"><CircularProgress /></Box>
        ) : isEmpty ? (
          <Card className="border border-dashed border-gray-200/70">
            <CardContent className="py-12 text-center">
              <DeleteOutlineIcon sx={{ fontSize: 48 }} color="disabled" />
              <Typography variant="h6" className="font-semibold mt-3">
                Trash is empty
              </Typography>
              <Typography variant="body2" color="text.secondary" className="mt-1">
                Deleted categories, subcategories, and flashcards will appear here.
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Categories */}
            {data && data.categories.length > 0 && (
              <Section title="Categories" icon={<FolderIcon color="action" />} count={data.categories.length}>
                {data.categories.map((item: TrashCategory) => (
                  <React.Fragment key={item.id}>
                    <TrashItemRow
                      icon={<FolderIcon fontSize="small" />}
                      title={item.title}
                      subtitle={item.description ?? undefined}
                      deletedAt={item.deleted_at}
                      onRestore={() => handleRestore("category", item.id)}
                      restoring={restoringKey === `category-${item.id}`}
                    />
                    <Divider />
                  </React.Fragment>
                ))}
              </Section>
            )}

            {/* Subcategories */}
            {data && data.subcategories.length > 0 && (
              <Section title="Subcategories" icon={<LayersIcon color="action" />} count={data.subcategories.length}>
                {data.subcategories.map((item: TrashSubCategory) => (
                  <React.Fragment key={item.id}>
                    <TrashItemRow
                      icon={<LayersIcon fontSize="small" />}
                      title={item.title}
                      subtitle={item.description ?? undefined}
                      deletedAt={item.deleted_at}
                      onRestore={() => handleRestore("subcategory", item.id)}
                      restoring={restoringKey === `subcategory-${item.id}`}
                    />
                    <Divider />
                  </React.Fragment>
                ))}
              </Section>
            )}

            {/* Flashcards */}
            {data && data.flashcards.length > 0 && (
              <Section title="Flashcards" icon={<StyleIcon color="action" />} count={data.flashcards.length}>
                {data.flashcards.map((item: TrashFlashcard) => (
                  <React.Fragment key={item.id}>
                    <TrashItemRow
                      icon={<StyleIcon fontSize="small" />}
                      title={item.front_preview ?? `Flashcard #${item.id}`}
                      deletedAt={item.deleted_at}
                      onRestore={() => handleRestore("flashcard", item.id)}
                      restoring={restoringKey === `flashcard-${item.id}`}
                    />
                    <Divider />
                  </React.Fragment>
                ))}
              </Section>
            )}
          </>
        )}
      </Box>
    </Box>
  );
};

export default Trash;
