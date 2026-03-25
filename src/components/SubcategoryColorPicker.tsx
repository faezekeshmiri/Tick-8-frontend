import React, { useId, useMemo } from 'react';
import {
  Box,
  Divider,
  Stack,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined';
import { useTranslation } from 'react-i18next';
import { SUBCATEGORY_PALETTE } from '../utils/subcategoryColors';

type Props = {
  value: string;
  onChange: (hex: string) => void;
};

function isPresetHex(hex: string): boolean {
  const n = hex.toLowerCase();
  return (SUBCATEGORY_PALETTE as readonly string[]).includes(n);
}

const SubcategoryColorPicker: React.FC<Props> = ({ value, onChange }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const groupId = useId();
  const normalized = value.toLowerCase();
  const safeHex = /^#[0-9A-Fa-f]{6}$/.test(normalized) ? normalized : SUBCATEGORY_PALETTE[0];
  const presetMatch = isPresetHex(safeHex);

  const surfaceSx = useMemo(
    () => ({
      p: 2,
      borderRadius: 2,
      border: '1px solid',
      borderColor: theme.palette.mode === 'light' ? alpha(theme.palette.common.black, 0.08) : alpha(theme.palette.common.white, 0.12),
      backgroundColor:
        theme.palette.mode === 'light'
          ? alpha(theme.palette.primary.main, 0.04)
          : alpha(theme.palette.common.white, 0.04),
    }),
    [theme.palette.common.black, theme.palette.common.white, theme.palette.mode, theme.palette.primary.main],
  );

  return (
    <Stack spacing={1.25} className="mt-2">
      <Box>
        <Typography component="label" htmlFor={groupId} variant="subtitle2" fontWeight={600} color="text.primary" display="block">
          {t('category.subcategoryColor')}
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.25, lineHeight: 1.4 }}>
          {t('category.subcategoryColorHint')}
        </Typography>
      </Box>

      <Box id={groupId} sx={surfaceSx}>
        <Stack spacing={1.75}>
          <Box>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1, fontWeight: 500 }}>
              {t('category.subcategoryColorPresets')}
            </Typography>
            <Stack
              direction="row"
              flexWrap="wrap"
              alignItems="center"
              gap={1}
              role="radiogroup"
              aria-label={t('category.subcategoryColor')}
            >
              {SUBCATEGORY_PALETTE.map((c) => {
                const selected = presetMatch && safeHex === c;
                return (
                  <Tooltip key={c} title={c.toUpperCase()} placement="top" arrow enterDelay={400}>
                    <Box
                      component="button"
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => onChange(c)}
                      sx={{
                        position: 'relative',
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        p: 0,
                        border: 'none',
                        cursor: 'pointer',
                        bgcolor: c,
                        flexShrink: 0,
                        boxShadow:
                          theme.palette.mode === 'light'
                            ? `inset 0 0 0 1px ${alpha(theme.palette.common.black, 0.12)}`
                            : `inset 0 0 0 1px ${alpha(theme.palette.common.white, 0.15)}`,
                        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                        '&:hover': {
                          transform: 'scale(1.08)',
                          boxShadow: `inset 0 0 0 1px ${alpha(theme.palette.common.black, 0.12)}, 0 4px 12px ${alpha(c, 0.45)}`,
                        },
                        '&:focus-visible': {
                          outline: `2px solid ${theme.palette.primary.main}`,
                          outlineOffset: 3,
                        },
                        ...(selected
                          ? {
                              boxShadow: `0 0 0 2px ${theme.palette.background.paper}, 0 0 0 4px ${theme.palette.primary.main}, inset 0 0 0 1px ${alpha(theme.palette.common.black, 0.08)}`,
                            }
                          : {}),
                      }}
                    />
                  </Tooltip>
                );
              })}
            </Stack>
          </Box>

          <Divider sx={{ borderColor: alpha(theme.palette.divider, 0.9) }} />

          <Stack direction="row" alignItems="center" spacing={1.5} flexWrap="wrap" useFlexGap>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
              {t('category.subcategoryColorCustom')}
            </Typography>
            <Tooltip title={t('category.subcategoryColorCustom')} placement="top" arrow>
              <Box
                sx={{
                  position: 'relative',
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  flexShrink: 0,
                  cursor: 'pointer',
                  overflow: 'hidden',
                  boxShadow:
                    !presetMatch
                      ? `0 0 0 2px ${theme.palette.background.paper}, 0 0 0 4px ${theme.palette.primary.main}`
                      : `inset 0 0 0 1px ${alpha(theme.palette.divider, 1)}`,
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                  '&:hover': {
                    transform: 'scale(1.06)',
                  },
                  '&:focus-within': {
                    outline: `2px solid ${theme.palette.primary.main}`,
                    outlineOffset: 2,
                  },
                }}
              >
                <Box
                  aria-hidden
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    background: `linear-gradient(135deg, ${safeHex} 0%, ${alpha(safeHex, 0.85)} 100%)`,
                  }}
                />
                <PaletteOutlinedIcon
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    fontSize: 20,
                    color: theme.palette.getContrastText(safeHex),
                    opacity: 0.92,
                    pointerEvents: 'none',
                    filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.25))',
                  }}
                />
                <input
                  type="color"
                  value={safeHex}
                  onChange={(e) => onChange(e.target.value)}
                  aria-label={t('category.subcategoryColorCustom')}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    opacity: 0,
                    cursor: 'pointer',
                    border: 'none',
                  }}
                />
              </Box>
            </Tooltip>
            <Typography
              component="span"
              variant="caption"
              sx={{
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                fontWeight: 600,
                letterSpacing: '0.02em',
                color: 'text.secondary',
                userSelect: 'all',
              }}
            >
              {safeHex.toUpperCase()}
            </Typography>
          </Stack>
        </Stack>
      </Box>
    </Stack>
  );
};

export default SubcategoryColorPicker;
