import React, { useCallback, useRef, useState } from 'react';
import {
  Avatar,
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Fade,
  IconButton,
  Modal,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { uploadImage, resolveImageUrl } from '../api/upload';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_MB = 5;

interface AvatarUploadProps {
  currentUrl: string | null;
  initials: string;
  onUploaded: (url: string) => void;
  onRemoved?: () => void;
  onError: (message: string) => void;
  size?: number;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({
  currentUrl,
  initials,
  onUploaded,
  onRemoved,
  onError,
  size = 120,
}) => {
  const theme = useTheme();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [removeConfirmOpen, setRemoveConfirmOpen] = useState(false);
  const [removing, setRemoving] = useState(false);

  const resolvedUrl = previewUrl ?? (currentUrl ? resolveImageUrl(currentUrl) : null);

  const processFile = useCallback(
    async (file: File) => {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        onError('Please upload a JPG, PNG, or WebP image.');
        return;
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        onError(`Image must be smaller than ${MAX_SIZE_MB} MB.`);
        return;
      }

      const localPreview = URL.createObjectURL(file);
      setPreviewUrl(localPreview);
      setModalOpen(false);
      setUploading(true);

      try {
        const { url } = await uploadImage(file);
        onUploaded(url);
      } catch {
        setPreviewUrl(null);
        onError('Failed to upload image. Please try again.');
      } finally {
        setUploading(false);
      }
    },
    [onUploaded, onError],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
      e.target.value = '';
    },
    [processFile],
  );

  const handleRemoveClick = useCallback(() => {
    setRemoveConfirmOpen(true);
  }, []);

  const handleRemoveConfirm = useCallback(async () => {
    if (!onRemoved) return;
    setRemoving(true);
    try {
      onRemoved();
      setRemoveConfirmOpen(false);
      setModalOpen(false);
      setPreviewUrl(null);
    } catch {
      onError('Failed to remove profile picture.');
    } finally {
      setRemoving(false);
    }
  }, [onRemoved, onError]);

  const handleRemoveCancel = useCallback(() => {
    setRemoveConfirmOpen(false);
  }, []);

  const hasAvatar = !!currentUrl;

  const cameraBadgeSize = Math.round(size * 0.3);

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Avatar with camera badge */}
        <Box sx={{ position: 'relative', width: size, height: size }}>
          <Avatar
            src={resolvedUrl ?? undefined}
            sx={{
              width: '100%',
              height: '100%',
              fontSize: size * 0.32,
              bgcolor: 'primary.main',
            }}
          >
            {initials}
          </Avatar>

          {uploading && (
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: alpha(theme.palette.common.black, 0.45),
              }}
            >
              <CircularProgress size={36} sx={{ color: 'white' }} />
            </Box>
          )}

          {/* Camera badge — always visible */}
          <IconButton
            onClick={() => setModalOpen(true)}
            sx={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: cameraBadgeSize,
              height: cameraBadgeSize,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              border: `2px solid ${theme.palette.background.paper}`,
              boxShadow: theme.shadows[3],
              '&:hover': { bgcolor: 'primary.dark' },
            }}
          >
            <CameraAltIcon sx={{ fontSize: cameraBadgeSize * 0.55 }} />
          </IconButton>
        </Box>
      </Box>

      {/* ── Upload modal ── */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{ backdrop: { timeout: 300 } }}
      >
        <Fade in={modalOpen}>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: { xs: '90vw', sm: 460 },
              bgcolor: 'background.paper',
              borderRadius: 4,
              boxShadow: 24,
              outline: 'none',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 3,
                pt: 2.5,
                pb: 1,
              }}
            >
              <Typography variant="h6" fontWeight={600}>
                Upload Profile Picture
              </Typography>
              <IconButton onClick={() => setModalOpen(false)} size="small">
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>

            {/* Drop zone */}
            <Box sx={{ px: 3, pb: 3 }}>
              <Box
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                sx={{
                  mt: 1,
                  py: 6,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 3,
                  border: `2px dashed ${
                    dragOver
                      ? theme.palette.primary.main
                      : theme.palette.divider
                  }`,
                  bgcolor: dragOver
                    ? alpha(theme.palette.primary.main, 0.06)
                    : alpha(theme.palette.action.hover, 0.03),
                  transition: 'all 0.2s ease',
                  cursor: 'default',
                }}
              >
                <CloudUploadOutlinedIcon
                  sx={{
                    fontSize: 72,
                    color: dragOver
                      ? 'primary.main'
                      : 'text.disabled',
                    transition: 'color 0.2s, transform 0.2s',
                    transform: dragOver ? 'scale(1.1)' : 'scale(1)',
                    mb: 2,
                  }}
                />
                <Typography
                  variant="body1"
                  fontWeight={500}
                  color={dragOver ? 'primary.main' : 'text.primary'}
                  sx={{ transition: 'color 0.2s' }}
                >
                  Drag &amp; drop your image here
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                  JPG, PNG, or WebP · Max {MAX_SIZE_MB} MB
                </Typography>
              </Box>

              {/* Divider with "or" */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  my: 2.5,
                }}
              >
                <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
                <Typography variant="body2" color="text.secondary">
                  or
                </Typography>
                <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
              </Box>

              {/* Browse button */}
              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={() => inputRef.current?.click()}
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
              >
                Choose from Computer
              </Button>

              {/* Remove photo — only when there is an avatar and onRemoved is provided */}
              {hasAvatar && onRemoved && (
                <>
                  <Box sx={{ flex: 1, height: '1px', my: 2.5, bgcolor: 'divider' }} />
                  <Button
                    variant="text"
                    fullWidth
                    size="medium"
                    onClick={handleRemoveClick}
                    startIcon={<DeleteOutlineIcon />}
                    sx={{
                      textTransform: 'none',
                      color: 'error.main',
                      '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.08) },
                    }}
                  >
                    Remove photo
                  </Button>
                </>
              )}
            </Box>
          </Box>
        </Fade>
      </Modal>

      {/* Remove confirmation dialog */}
      <Dialog
        open={removeConfirmOpen}
        onClose={handleRemoveCancel}
        aria-labelledby="remove-avatar-dialog-title"
        aria-describedby="remove-avatar-dialog-description"
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle id="remove-avatar-dialog-title">
          Remove profile picture?
        </DialogTitle>
        <DialogContent sx={{ pt: 0, pb: 1 }}>
          <DialogContentText id="remove-avatar-dialog-description">
            Your initials will be shown instead. You can add a new picture anytime.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, pt: 0 }}>
          <Button onClick={handleRemoveCancel} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleRemoveConfirm}
            color="error"
            variant="contained"
            disabled={removing}
            autoFocus
          >
            {removing ? 'Removing…' : 'Remove'}
          </Button>
        </DialogActions>
      </Dialog>

      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp"
        hidden
        onChange={handleFileChange}
      />
    </>
  );
};

export default AvatarUpload;
