import React, { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Stack,
  Typography,
  useTheme,
  alpha,
  keyframes,
} from '@mui/material';
import { AutoAwesome } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { ThemeModeContext } from '../contexts/ThemeContext';

/* ── Keyframe animations (consistent with Landing) ── */

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-14px); }
`;

const floatSlow = keyframes`
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50%      { transform: translateY(-10px) rotate(3deg); }
`;

const scaleIn = keyframes`
  from { opacity: 0; transform: scale(0.9); }
  to   { opacity: 1; transform: scale(1); }
`;

/* ── Floating shape (same as Landing's FloatingShape) ── */

const FloatingShape: React.FC<{
  top?: string; left?: string; right?: string; bottom?: string;
  size: number; color: string; delay?: number; duration?: number;
}> = ({ top, left, right, bottom, size, color, delay = 0, duration = 6 }) => (
  <Box
    sx={{
      position: 'absolute', top, left, right, bottom,
      width: size, height: size,
      borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
      bgcolor: color,
      pointerEvents: 'none',
      animation: `${float} ${duration}s ease-in-out ${delay}s infinite`,
    }}
  />
);

/* ── SVG Illustration (themed colors, matches Landing HeroIllustration) ── */

const AuthIllustration: React.FC<{
  primary: string;
  secondary: string;
  isDark: boolean;
}> = ({ primary, secondary, isDark }) => {
  const cardFill = isDark ? '#1e3a5f' : '#ffffff';
  const cardStroke = isDark ? 'rgba(144,202,249,0.18)' : 'rgba(0,180,216,0.15)';
  const textLine = isDark ? 'rgba(144,202,249,0.25)' : 'rgba(0,0,0,0.1)';

  return (
    <Box
      component="svg"
      viewBox="0 0 320 280"
      sx={{
        width: '100%',
        maxWidth: 340,
        height: 'auto',
        animation: `${scaleIn} 0.8s cubic-bezier(0.22,1,0.36,1) 0.15s both`,
      }}
    >
      {/* Back card */}
      <g style={{ animation: `${floatSlow} 6s ease-in-out infinite` } as React.CSSProperties}>
        <rect x="85" y="35" width="185" height="130" rx="14"
          fill={cardFill} stroke={cardStroke} strokeWidth="1.2" />
        <rect x="108" y="62" width="100" height="7" rx="3.5" fill={textLine} />
        <rect x="108" y="79" width="70" height="6" rx="3" fill={textLine} />
        <rect x="108" y="96" width="125" height="6" rx="3" fill={textLine} />
        <rect x="108" y="113" width="85" height="6" rx="3" fill={textLine} />
      </g>

      {/* Front card */}
      <g style={{ animation: `${float} 5s ease-in-out 0.5s infinite` } as React.CSSProperties}>
        <rect x="45" y="85" width="185" height="130" rx="14"
          fill={cardFill} stroke={primary} strokeWidth="1.4"
          style={{ filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.08))' }} />
        <rect x="68" y="112" width="80" height="8" rx="4" fill={primary} opacity="0.65" />
        <rect x="68" y="130" width="55" height="6" rx="3" fill={textLine} />
        <rect x="68" y="146" width="115" height="6" rx="3" fill={textLine} />
        <rect x="68" y="162" width="78" height="6" rx="3" fill={textLine} />
        {/* Check circle */}
        <circle cx="198" cy="185" r="12" fill={secondary} opacity="0.85" />
        <path d="M192 185l3.5 3.5 7-7" fill="none" stroke="#fff"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* Sparkles */}
      <circle cx="268" cy="50" r="3" fill={primary} opacity="0.4">
        <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2.5s" repeatCount="indefinite" />
        <animate attributeName="r" values="2.5;4;2.5" dur="2.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="30" cy="140" r="2.2" fill={secondary} opacity="0.3">
        <animate attributeName="opacity" values="0.2;0.7;0.2" dur="3s" repeatCount="indefinite" />
      </circle>
      <circle cx="300" cy="220" r="2" fill={primary} opacity="0.28">
        <animate attributeName="opacity" values="0.2;0.6;0.2" dur="3.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="55" cy="40" r="1.8" fill={secondary} opacity="0.25">
        <animate attributeName="opacity" values="0.15;0.55;0.15" dur="4s" repeatCount="indefinite" />
      </circle>
      <circle cx="170" cy="255" r="2" fill={primary} opacity="0.22">
        <animate attributeName="opacity" values="0.15;0.5;0.15" dur="3.2s" repeatCount="indefinite" />
      </circle>

      {/* Floating diamond */}
      <g opacity="0.28" transform="translate(290,145)">
        <rect x="-4.5" y="-4.5" width="9" height="9" rx="1.5" fill={primary} transform="rotate(45)" />
        <animateTransform attributeName="transform" type="translate"
          values="290,145;290,133;290,145" dur="4.5s" repeatCount="indefinite" />
      </g>
      <g opacity="0.2" transform="translate(22,230)">
        <rect x="-3.5" y="-3.5" width="7" height="7" rx="1.5" fill={secondary} transform="rotate(45)" />
        <animateTransform attributeName="transform" type="translate"
          values="22,230;22,220;22,230" dur="5s" repeatCount="indefinite" />
      </g>

      {/* Floating plus */}
      <g opacity="0.25" transform="translate(285,85)">
        <line x1="-5" y1="0" x2="5" y2="0" stroke={primary} strokeWidth="1.8" strokeLinecap="round" />
        <line x1="0" y1="-5" x2="0" y2="5" stroke={primary} strokeWidth="1.8" strokeLinecap="round" />
        <animateTransform attributeName="transform" type="translate"
          values="285,85;285,75;285,85" dur="3.8s" repeatCount="indefinite" />
      </g>
    </Box>
  );
};

/* ── Main layout ── */

interface AuthLayoutProps {
  children: ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  const theme = useTheme();
  const { isDarkMode } = React.useContext(ThemeModeContext);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {/* ── Full-page radial glow blobs (Landing hero style) ── */}
      <Box
        sx={{
          position: 'absolute',
          top: '-25%',
          right: '-8%',
          width: '55%',
          height: '130%',
          borderRadius: '50%',
          background: `radial-gradient(ellipse at center, ${alpha(primary, isDarkMode ? 0.14 : 0.14)} 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '-20%',
          left: '-12%',
          width: '50%',
          height: '120%',
          borderRadius: '50%',
          background: `radial-gradient(ellipse at center, ${alpha(secondary, isDarkMode ? 0.1 : 0.1)} 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: '30%',
          left: '25%',
          width: '35%',
          height: '60%',
          borderRadius: '50%',
          background: `radial-gradient(ellipse at center, ${alpha(primary, isDarkMode ? 0.06 : 0.05)} 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      {/* ── Full-page dot-grid texture ── */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `radial-gradient(circle, ${alpha(primary, isDarkMode ? 0.06 : 0.07)} 1px, transparent 1px)`,
          backgroundSize: '28px 28px',
          pointerEvents: 'none',
        }}
      />

      {/* ── Floating decorative shapes (spread across full page) ── */}
      <FloatingShape top="10%" right="7%" size={18} color={alpha(primary, 0.1)} delay={0} duration={7} />
      <FloatingShape top="55%" left="4%" size={14} color={alpha(secondary, 0.09)} delay={1.5} duration={6} />
      <FloatingShape bottom="12%" right="14%" size={10} color={alpha(primary, 0.07)} delay={0.8} duration={8} />
      <FloatingShape top="6%" left="15%" size={12} color={alpha(secondary, 0.08)} delay={0.4} duration={9} />
      <FloatingShape top="38%" right="3%" size={15} color={alpha(primary, 0.09)} delay={2} duration={6.5} />
      <FloatingShape bottom="28%" left="7%" size={10} color={alpha(primary, 0.06)} delay={1.2} duration={7.5} />
      <FloatingShape top="72%" right="20%" size={13} color={alpha(secondary, 0.07)} delay={2.5} duration={8.5} />
      <FloatingShape top="18%" left="30%" size={8} color={alpha(primary, 0.05)} delay={0.6} duration={10} />
      <FloatingShape bottom="6%" left="22%" size={11} color={alpha(secondary, 0.06)} delay={1.8} duration={7} />

      {/* ── Content ── */}
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, py: { xs: 4, md: 0 } }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          alignItems="center"
          spacing={{ xs: 4, md: 8 }}
          justifyContent="center"
        >
          {/* Illustration + tagline column (desktop) */}
          <Box
            sx={{
              flex: 1,
              display: { xs: 'none', md: 'flex' },
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              maxWidth: 420,
            }}
          >
            <AuthIllustration primary={primary} secondary={secondary} isDark={isDarkMode ?? false} />

            <Box
              sx={{
                mt: 4,
                maxWidth: 340,
                animation: `${fadeIn} 0.7s cubic-bezier(0.22,1,0.36,1) 0.35s both`,
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  color: 'text.primary',
                  mb: 1.5,
                  fontSize: { md: '1.3rem', lg: '1.45rem' },
                  lineHeight: 1.3,
                  letterSpacing: '-0.015em',
                }}
              >
                {t('auth.panelTitle')}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                  lineHeight: 1.65,
                  fontSize: '0.875rem',
                }}
              >
                {t('auth.panelSubtitle')}
              </Typography>
            </Box>
          </Box>

          {/* Form column */}
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '100%',
              maxWidth: { md: 480 },
            }}
          >
            {/* Mobile brand header */}
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              onClick={() => navigate('/')}
              sx={{
                display: { xs: 'flex', md: 'none' },
                mb: 4,
                cursor: 'pointer',
                animation: `${fadeIn} 0.5s cubic-bezier(0.22,1,0.36,1) both`,
                '&:hover .brand-icon': { transform: 'rotate(18deg)' },
              }}
            >
              <AutoAwesome
                className="brand-icon"
                sx={{ color: 'primary.main', fontSize: 26, transition: 'transform 0.3s ease' }}
              />
              <Typography
                sx={{
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  color: 'text.primary',
                  fontSize: '1.1rem',
                }}
              >
                Tick 8
              </Typography>
            </Stack>

            {/* Desktop brand (sits above the card, in the form column) */}
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              onClick={() => navigate('/')}
              sx={{
                display: { xs: 'none', md: 'flex' },
                mb: 3,
                cursor: 'pointer',
                animation: `${fadeIn} 0.5s cubic-bezier(0.22,1,0.36,1) both`,
                alignSelf: 'flex-start',
                '&:hover .brand-icon-d': { transform: 'rotate(18deg)' },
              }}
            >
              <AutoAwesome
                className="brand-icon-d"
                sx={{ color: 'primary.main', fontSize: 24, transition: 'transform 0.3s ease' }}
              />
              <Typography
                sx={{
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  color: 'text.primary',
                  fontSize: '1.05rem',
                }}
              >
                Tick 8
              </Typography>
            </Stack>

            {/* Form card with entry animation */}
            <Box
              sx={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                animation: `${fadeIn} 0.6s cubic-bezier(0.22,1,0.36,1) 0.1s both`,
              }}
            >
              {children}
            </Box>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
};

export default AuthLayout;
