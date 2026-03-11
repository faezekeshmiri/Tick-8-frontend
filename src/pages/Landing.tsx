import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  Button,
  Container,
  IconButton,
  Link,
  Stack,
  TextField,
  Toolbar,
  Typography,
  useTheme,
  alpha,
  keyframes,
} from '@mui/material';
import {
  DarkMode,
  LightMode,
  SchoolOutlined,
  CategoryOutlined,
  TrendingUpOutlined,
  ArrowForward,
  AutoAwesome,
  GroupsOutlined,
  RocketLaunchOutlined,
  FavoriteBorderOutlined,
  EmailOutlined,
  PlaceOutlined,
  SendOutlined,
  TranslateOutlined,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useThemeMode } from '../contexts/ThemeContext';
import { SUPPORTED_LOCALES, isRtl } from '../assets/theme';

/* ── Keyframe animations ── */

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(28px); }
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
  from { opacity: 0; transform: scale(0.92); }
  to   { opacity: 1; transform: scale(1); }
`;

const shimmer = keyframes`
  0%   { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

/* ── Scroll-triggered reveal hook ── */

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, visible };
}

/* ── Animated wrapper ── */

const FadeSection: React.FC<{
  children: React.ReactNode;
  delay?: number;
  sx?: Record<string, unknown>;
}> = ({ children, delay = 0, sx }) => {
  const { ref, visible } = useInView(0.12);
  return (
    <Box
      ref={ref}
      sx={{
        opacity: visible ? 1 : 0,
        animation: visible ? `${fadeInUp} 0.7s cubic-bezier(0.22,1,0.36,1) ${delay}s both` : 'none',
        ...sx,
      }}
    >
      {children}
    </Box>
  );
};

/* ── SVG Illustrations ── */

const HeroIllustration: React.FC<{ primary: string; secondary: string; isDark: boolean }> = ({
  primary,
  secondary,
  isDark,
}) => {
  const cardFill = isDark ? '#1e3a5f' : '#ffffff';
  const cardStroke = isDark ? 'rgba(144,202,249,0.18)' : 'rgba(0,180,216,0.15)';
  const textLine = isDark ? 'rgba(144,202,249,0.25)' : 'rgba(0,0,0,0.1)';

  return (
    <Box
      component="svg"
      viewBox="0 0 400 320"
      sx={{
        width: '100%',
        maxWidth: 420,
        height: 'auto',
        animation: `${scaleIn} 0.9s cubic-bezier(0.22,1,0.36,1) 0.3s both`,
      }}
    >
      {/* Back card */}
      <g style={{ animation: `${floatSlow} 6s ease-in-out infinite` } as React.CSSProperties}>
        <rect x="100" y="60" width="220" height="160" rx="16" fill={cardFill} stroke={cardStroke} strokeWidth="1.5" />
        <rect x="125" y="92" width="120" height="8" rx="4" fill={textLine} />
        <rect x="125" y="112" width="90" height="8" rx="4" fill={textLine} />
        <rect x="125" y="132" width="150" height="8" rx="4" fill={textLine} />
      </g>

      {/* Front card */}
      <g style={{ animation: `${float} 5s ease-in-out 0.5s infinite` } as React.CSSProperties}>
        <rect x="60" y="100" width="220" height="160" rx="16" fill={cardFill} stroke={primary} strokeWidth="1.5"
          style={{ filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.08))' }} />
        <rect x="85" y="135" width="100" height="10" rx="5" fill={primary} opacity="0.7" />
        <rect x="85" y="155" width="70" height="8" rx="4" fill={textLine} />
        <rect x="85" y="175" width="140" height="8" rx="4" fill={textLine} />
        <rect x="85" y="195" width="110" height="8" rx="4" fill={textLine} />
        {/* Check circle */}
        <circle cx="240" cy="225" r="14" fill={secondary} opacity="0.9" />
        <path d="M233 225l4 4 8-8" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* Sparkles */}
      <circle cx="310" cy="80" r="3.5" fill={primary} opacity="0.45">
        <animate attributeName="opacity" values="0.45;0.9;0.45" dur="2.5s" repeatCount="indefinite" />
        <animate attributeName="r" values="3;4.5;3" dur="2.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="50" cy="160" r="2.5" fill={secondary} opacity="0.35">
        <animate attributeName="opacity" values="0.35;0.8;0.35" dur="3s" repeatCount="indefinite" />
      </circle>
      <circle cx="370" cy="50" r="2" fill={primary} opacity="0.3">
        <animate attributeName="opacity" values="0.3;0.75;0.3" dur="3.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="200" cy="305" r="2" fill={secondary} opacity="0.25">
        <animate attributeName="opacity" values="0.25;0.65;0.25" dur="4s" repeatCount="indefinite" />
      </circle>
      <circle cx="385" cy="260" r="2.5" fill={primary} opacity="0.3">
        <animate attributeName="opacity" values="0.3;0.7;0.3" dur="3.2s" repeatCount="indefinite" />
        <animate attributeName="r" values="2;3.5;2" dur="3.2s" repeatCount="indefinite" />
      </circle>
      <circle cx="80" cy="45" r="2" fill={secondary} opacity="0.3">
        <animate attributeName="opacity" values="0.3;0.75;0.3" dur="2.8s" repeatCount="indefinite" />
      </circle>

      {/* Floating diamonds */}
      <g opacity="0.3" transform="translate(340,190)">
        <rect x="-5" y="-5" width="10" height="10" rx="2" fill={primary} transform="rotate(45)" />
        <animateTransform attributeName="transform" type="translate" values="340,190;340,178;340,190" dur="4.5s" repeatCount="indefinite" />
      </g>
      <g opacity="0.25" transform="translate(40,290)">
        <rect x="-4.5" y="-4.5" width="9" height="9" rx="1.5" fill={secondary} transform="rotate(45)" />
        <animateTransform attributeName="transform" type="translate" values="40,290;40,278;40,290" dur="5s" repeatCount="indefinite" />
      </g>
      <g opacity="0.2" transform="translate(25,70)">
        <rect x="-4" y="-4" width="8" height="8" rx="1.5" fill={primary} transform="rotate(45)" />
        <animateTransform attributeName="transform" type="translate" values="25,70;25,60;25,70" dur="5.5s" repeatCount="indefinite" />
      </g>

      {/* Floating plus */}
      <g opacity="0.3" transform="translate(330,120)">
        <line x1="-6" y1="0" x2="6" y2="0" stroke={primary} strokeWidth="2" strokeLinecap="round" />
        <line x1="0" y1="-6" x2="0" y2="6" stroke={primary} strokeWidth="2" strokeLinecap="round" />
        <animateTransform attributeName="transform" type="translate" values="330,120;330,110;330,120" dur="4s" repeatCount="indefinite" />
      </g>
    </Box>
  );
};

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

/* ── Main component ── */

const LANG_LABELS: Record<string, string> = { en: 'EN', fa: 'فا' };

const Landing: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();
  const { isDarkMode, toggleTheme } = useThemeMode();

  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;
  const currentLang = i18n.language;

  const cycleLang = () => {
    const idx = SUPPORTED_LOCALES.indexOf(currentLang as typeof SUPPORTED_LOCALES[number]);
    const next = SUPPORTED_LOCALES[(idx + 1) % SUPPORTED_LOCALES.length];
    i18n.changeLanguage(next);
    document.documentElement.dir = isRtl(next) ? 'rtl' : 'ltr';
    document.documentElement.lang = next;
  };

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const features = [
    {
      icon: <SchoolOutlined sx={{ fontSize: 36 }} />,
      title: t('landing.featureFlashcardsTitle'),
      description: t('landing.featureFlashcardsDesc'),
    },
    {
      icon: <CategoryOutlined sx={{ fontSize: 36 }} />,
      title: t('landing.featureOrganizeTitle'),
      description: t('landing.featureOrganizeDesc'),
    },
    {
      icon: <TrendingUpOutlined sx={{ fontSize: 36 }} />,
      title: t('landing.featureProgressTitle'),
      description: t('landing.featureProgressDesc'),
    },
  ];

  const steps = [
    { number: '01', title: t('landing.step1Title'), description: t('landing.step1Desc') },
    { number: '02', title: t('landing.step2Title'), description: t('landing.step2Desc') },
    { number: '03', title: t('landing.step3Title'), description: t('landing.step3Desc') },
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', overflow: 'hidden' }}>
      {/* ── Navbar ── */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: alpha(theme.palette.background.default, 0.8),
          backdropFilter: 'blur(12px)',
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
          animation: `${fadeInUp} 0.6s cubic-bezier(0.22,1,0.36,1) both`,
        }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ justifyContent: 'space-between', py: 0.5 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <AutoAwesome sx={{ color: 'primary.main', fontSize: 28 }} />
              <Typography
                variant="h6"
                sx={{ fontWeight: 800, letterSpacing: '-0.02em', color: 'text.primary' }}
              >
                Tick 8
              </Typography>
            </Stack>

            <Stack direction="row" alignItems="center" spacing={{ xs: 0.5, sm: 1 }}>
              <Link
                component="button"
                underline="none"
                onClick={() => scrollTo('about')}
                sx={{
                  fontWeight: 600, fontSize: '0.875rem', color: 'text.secondary',
                  cursor: 'pointer', px: 1,
                  transition: 'color 0.2s',
                  '&:hover': { color: 'primary.main' },
                  display: { xs: 'none', sm: 'inline-flex' },
                }}
              >
                {t('landing.navAbout')}
              </Link>
              <Link
                component="button"
                underline="none"
                onClick={() => scrollTo('contact')}
                sx={{
                  fontWeight: 600, fontSize: '0.875rem', color: 'text.secondary',
                  cursor: 'pointer', px: 1,
                  transition: 'color 0.2s',
                  '&:hover': { color: 'primary.main' },
                  display: { xs: 'none', sm: 'inline-flex' },
                }}
              >
                {t('landing.navContact')}
              </Link>
              <Button
                onClick={cycleLang}
                size="small"
                startIcon={<TranslateOutlined sx={{ fontSize: 18 }} />}
                sx={{
                  minWidth: 0, px: 1.2, py: 0.5,
                  borderRadius: 2,
                  fontSize: '0.8rem', fontWeight: 700,
                  color: 'text.secondary',
                  textTransform: 'none',
                  border: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: 'primary.main',
                    color: 'primary.main',
                    bgcolor: alpha(primary, 0.04),
                  },
                }}
              >
                {LANG_LABELS[currentLang] ?? 'EN'}
              </Button>
              <IconButton
                onClick={toggleTheme}
                size="small"
                sx={{
                  color: 'text.secondary',
                  transition: 'transform 0.3s ease',
                  '&:hover': { transform: 'rotate(30deg)' },
                }}
              >
                {isDarkMode ? <LightMode fontSize="small" /> : <DarkMode fontSize="small" />}
              </IconButton>
              <Button
                variant="text"
                onClick={() => navigate('/login')}
                sx={{ fontWeight: 600, color: 'text.primary' }}
              >
                {t('nav.login')}
              </Button>
              <Button
                variant="contained"
                onClick={() => navigate('/signup')}
                sx={{
                  borderRadius: 2,
                  px: 2.5,
                  fontWeight: 600,
                  textTransform: 'none',
                  boxShadow: 'none',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  '&:hover': { boxShadow: 'none', transform: 'translateY(-1px)' },
                }}
              >
                {t('nav.signUp')}
              </Button>
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>

      {/* ── Hero ── */}
      <Box sx={{ position: 'relative', pt: { xs: 8, md: 12 }, pb: { xs: 8, md: 10 } }}>
        {/* Background glow blobs */}
        <Box
          sx={{
            position: 'absolute', top: '-30%', right: '-10%',
            width: '60%', height: '140%', borderRadius: '50%',
            background: `radial-gradient(ellipse at center, ${alpha(primary, isDarkMode ? 0.16 : 0.16)} 0%, transparent 70%)`,
            pointerEvents: 'none',
          }}
        />
        <Box
          sx={{
            position: 'absolute', bottom: '-20%', left: '-15%',
            width: '50%', height: '120%', borderRadius: '50%',
            background: `radial-gradient(ellipse at center, ${alpha(secondary, isDarkMode ? 0.12 : 0.12)} 0%, transparent 70%)`,
            pointerEvents: 'none',
          }}
        />

        {/* Floating decorative shapes */}
        <FloatingShape top="12%" right="8%" size={18} color={alpha(primary, 0.12)} delay={0} duration={7} />
        <FloatingShape top="60%" left="5%" size={14} color={alpha(secondary, 0.1)} delay={1.5} duration={6} />
        <FloatingShape bottom="15%" right="15%" size={10} color={alpha(primary, 0.08)} delay={0.8} duration={8} />
        <FloatingShape top="8%" left="12%" size={12} color={alpha(secondary, 0.09)} delay={0.4} duration={9} />
        <FloatingShape top="35%" right="3%" size={16} color={alpha(primary, 0.1)} delay={2} duration={6.5} />
        <FloatingShape bottom="30%" left="8%" size={10} color={alpha(primary, 0.07)} delay={1.2} duration={7.5} />
        <FloatingShape top="75%" right="22%" size={13} color={alpha(secondary, 0.08)} delay={2.5} duration={8.5} />
        <FloatingShape top="20%" left="25%" size={8} color={alpha(primary, 0.06)} delay={0.6} duration={10} />
        <FloatingShape bottom="8%" left="18%" size={11} color={alpha(secondary, 0.07)} delay={1.8} duration={7} />

        <Container maxWidth="lg" sx={{ position: 'relative' }}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            alignItems="center"
            spacing={{ xs: 6, md: 8 }}
          >
            {/* Text column */}
            <Box sx={{ flex: 1, textAlign: { xs: 'center', md: 'start' } }}>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 2, py: 0.75,
                  borderRadius: 6,
                  mb: 3.5,
                  background: `linear-gradient(135deg, ${alpha(primary, 0.1)}, ${alpha(secondary, 0.08)})`,
                  backgroundSize: '200% auto',
                  animation: `${fadeInUp} 0.6s cubic-bezier(0.22,1,0.36,1) 0.1s both, ${shimmer} 4s linear infinite`,
                  color: 'primary.main',
                }}
              >
                <AutoAwesome sx={{ fontSize: 16 }} />
                <Typography variant="caption" sx={{ fontWeight: 600, letterSpacing: '0.04em' }}>
                  {t('landing.badge')}
                </Typography>
              </Box>

              <Box sx={{ animation: `${fadeInUp} 0.7s cubic-bezier(0.22,1,0.36,1) 0.15s both` }}>
                <Typography
                  variant="h2"
                  component="h1"
                  sx={{
                    fontWeight: 800,
                    fontSize: { xs: '2.25rem', sm: '3rem', md: '3.5rem' },
                    lineHeight: 1.15,
                    letterSpacing: '-0.03em',
                    color: 'text.primary',
                    mb: 3,
                  }}
                >
                  {t('landing.heroTitle')}
                </Typography>
              </Box>

              <Box sx={{ animation: `${fadeInUp} 0.7s cubic-bezier(0.22,1,0.36,1) 0.3s both` }}>
                <Typography
                  variant="h6"
                  component="p"
                  sx={{
                    color: 'text.secondary',
                    fontWeight: 400,
                    maxWidth: 520,
                    mx: { xs: 'auto', md: 0 },
                    lineHeight: 1.6,
                    fontSize: { xs: '1rem', md: '1.1rem' },
                    mb: 4.5,
                  }}
                >
                  {t('landing.heroSubtitle')}
                </Typography>
              </Box>

              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                justifyContent={{ xs: 'center', md: 'flex-start' }}
                sx={{ animation: `${fadeInUp} 0.7s cubic-bezier(0.22,1,0.36,1) 0.45s both` }}
              >
                <Button
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForward />}
                  onClick={() => navigate('/signup')}
                  sx={{
                    borderRadius: 2.5, px: 4, py: 1.5,
                    fontWeight: 700, fontSize: '1rem', textTransform: 'none',
                    boxShadow: `0 4px 14px ${alpha(primary, 0.4)}`,
                    transition: 'all 0.25s ease',
                    '&:hover': {
                      boxShadow: `0 6px 20px ${alpha(primary, 0.5)}`,
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  {t('landing.getStarted')}
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/login')}
                  sx={{
                    borderRadius: 2.5, px: 4, py: 1.5,
                    fontWeight: 600, fontSize: '1rem', textTransform: 'none',
                    borderColor: alpha(theme.palette.text.primary, 0.2),
                    color: 'text.primary',
                    transition: 'all 0.25s ease',
                    '&:hover': {
                      borderColor: 'primary.main',
                      bgcolor: alpha(primary, 0.04),
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  {t('landing.signIn')}
                </Button>
              </Stack>
            </Box>

            {/* Illustration column */}
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <HeroIllustration primary={primary} secondary={secondary} isDark={isDarkMode} />
            </Box>
          </Stack>
        </Container>
      </Box>

      {/* ── Features ── */}
      <Box sx={{ py: { xs: 8, md: 12 }, position: 'relative' }}>
        <FloatingShape top="10%" left="3%" size={12} color={alpha(primary, 0.06)} delay={2} duration={9} />
        <FloatingShape bottom="20%" right="4%" size={16} color={alpha(secondary, 0.06)} delay={0.5} duration={7} />

        <Container maxWidth="lg">
          <FadeSection>
            <Typography
              variant="overline"
              sx={{
                display: 'block', textAlign: 'center', color: 'primary.main',
                fontWeight: 700, letterSpacing: '0.1em', mb: 1.5,
              }}
            >
              {t('landing.featuresLabel')}
            </Typography>
          </FadeSection>
          <FadeSection delay={0.08}>
            <Typography
              variant="h4"
              sx={{
                textAlign: 'center', fontWeight: 700,
                letterSpacing: '-0.02em', color: 'text.primary', mb: 8,
              }}
            >
              {t('landing.featuresHeading')}
            </Typography>
          </FadeSection>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} sx={{ alignItems: 'stretch' }}>
            {features.map((f, idx) => (
              <FadeSection key={idx} delay={0.1 + idx * 0.12} sx={{ flex: 1, display: 'flex' }}>
                <Box
                  sx={{
                    flex: 1, p: 4, borderRadius: 4,
                    border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                    bgcolor: alpha(theme.palette.background.paper, 0.6),
                    transition: 'all 0.3s cubic-bezier(0.22,1,0.36,1)',
                    '&:hover': {
                      borderColor: alpha(primary, 0.3),
                      boxShadow: `0 8px 30px ${alpha(primary, 0.08)}`,
                      transform: 'translateY(-6px)',
                    },
                    '&:hover .feature-icon': {
                      transform: 'scale(1.1) rotate(-4deg)',
                    },
                  }}
                >
                  <Box
                    className="feature-icon"
                    sx={{
                      width: 56, height: 56, borderRadius: 3,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      bgcolor: alpha(primary, 0.1),
                      color: 'primary.main', mb: 3,
                      transition: 'transform 0.3s cubic-bezier(0.22,1,0.36,1)',
                    }}
                  >
                    {f.icon}
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5, color: 'text.primary' }}>
                    {f.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                    {f.description}
                  </Typography>
                </Box>
              </FadeSection>
            ))}
          </Stack>
        </Container>
      </Box>

      {/* ── How It Works ── */}
      <Box
        sx={{
          py: { xs: 8, md: 12 },
          bgcolor: alpha(primary, 0.06),
          position: 'relative',
        }}
      >
        <Container maxWidth="md">
          <FadeSection>
            <Typography
              variant="overline"
              sx={{
                display: 'block', textAlign: 'center', color: 'primary.main',
                fontWeight: 700, letterSpacing: '0.1em', mb: 1.5,
              }}
            >
              {t('landing.howItWorksLabel')}
            </Typography>
          </FadeSection>
          <FadeSection delay={0.08}>
            <Typography
              variant="h4"
              sx={{
                textAlign: 'center', fontWeight: 700,
                letterSpacing: '-0.02em', color: 'text.primary', mb: 8,
              }}
            >
              {t('landing.howItWorksHeading')}
            </Typography>
          </FadeSection>

          <Stack spacing={5}>
            {steps.map((step, idx) => (
              <FadeSection key={idx} delay={0.1 + idx * 0.15}>
                <Stack
                  direction="row"
                  spacing={3}
                  alignItems="flex-start"
                  sx={{
                    p: 3, borderRadius: 3,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      bgcolor: alpha(primary, 0.06),
                    },
                    '&:hover .step-num': {
                      color: primary,
                      transform: 'scale(1.12)',
                    },
                  }}
                >
                  <Typography
                    className="step-num"
                    sx={{
                      fontWeight: 800, fontSize: '2rem', lineHeight: 1,
                      color: alpha(primary, 0.25),
                      minWidth: 48, userSelect: 'none',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {step.number}
                  </Typography>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.75, color: 'text.primary' }}>
                      {step.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                      {step.description}
                    </Typography>
                  </Box>
                </Stack>
              </FadeSection>
            ))}
          </Stack>
        </Container>
      </Box>

      {/* ── CTA ── */}
      <Box sx={{ py: { xs: 10, md: 14 }, position: 'relative' }}>
        <FloatingShape top="20%" left="10%" size={20} color={alpha(primary, 0.06)} delay={1} duration={8} />
        <FloatingShape bottom="25%" right="12%" size={14} color={alpha(secondary, 0.05)} delay={2.5} duration={7} />

        <Container maxWidth="sm" sx={{ textAlign: 'center', position: 'relative' }}>
          <FadeSection>
            <Typography
              variant="h4"
              sx={{ fontWeight: 700, letterSpacing: '-0.02em', color: 'text.primary', mb: 2 }}
            >
              {t('landing.ctaHeading')}
            </Typography>
          </FadeSection>
          <FadeSection delay={0.1}>
            <Typography
              variant="body1"
              sx={{ color: 'text.secondary', mb: 5, lineHeight: 1.7 }}
            >
              {t('landing.ctaSubtext')}
            </Typography>
          </FadeSection>
          <FadeSection delay={0.2}>
            <Button
              variant="contained"
              size="large"
              endIcon={<ArrowForward />}
              onClick={() => navigate('/signup')}
              sx={{
                borderRadius: 2.5, px: 5, py: 1.5,
                fontWeight: 700, fontSize: '1rem', textTransform: 'none',
                boxShadow: `0 4px 14px ${alpha(primary, 0.4)}`,
                transition: 'all 0.25s ease',
                '&:hover': {
                  boxShadow: `0 6px 20px ${alpha(primary, 0.5)}`,
                  transform: 'translateY(-2px)',
                },
              }}
            >
              {t('landing.ctaButton')}
            </Button>
          </FadeSection>
        </Container>
      </Box>

      {/* ── About Us ── */}
      <Box
        id="about"
        sx={{
          py: { xs: 8, md: 12 },
          bgcolor: alpha(primary, 0.06),
          scrollMarginTop: '72px',
        }}
      >
        <Container maxWidth="md">
          <FadeSection>
            <Typography
              variant="overline"
              sx={{
                display: 'block', textAlign: 'center', color: 'primary.main',
                fontWeight: 700, letterSpacing: '0.1em', mb: 1.5,
              }}
            >
              {t('landing.aboutLabel')}
            </Typography>
          </FadeSection>
          <FadeSection delay={0.08}>
            <Typography
              variant="h4"
              sx={{
                textAlign: 'center', fontWeight: 700,
                letterSpacing: '-0.02em', color: 'text.primary', mb: 3,
              }}
            >
              {t('landing.aboutHeading')}
            </Typography>
          </FadeSection>
          <FadeSection delay={0.16}>
            <Typography
              variant="body1"
              sx={{
                textAlign: 'center', color: 'text.secondary',
                lineHeight: 1.8, maxWidth: 640, mx: 'auto', mb: 7,
              }}
            >
              {t('landing.aboutDescription')}
            </Typography>
          </FadeSection>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={4}>
            {[
              {
                icon: <RocketLaunchOutlined sx={{ fontSize: 30 }} />,
                title: t('landing.aboutMissionTitle'),
                text: t('landing.aboutMissionDesc'),
              },
              {
                icon: <GroupsOutlined sx={{ fontSize: 30 }} />,
                title: t('landing.aboutTeamTitle'),
                text: t('landing.aboutTeamDesc'),
              },
              {
                icon: <FavoriteBorderOutlined sx={{ fontSize: 30 }} />,
                title: t('landing.aboutValuesTitle'),
                text: t('landing.aboutValuesDesc'),
              },
            ].map((item, idx) => (
              <FadeSection key={idx} delay={0.12 + idx * 0.1} sx={{ flex: 1, display: 'flex' }}>
                <Box
                  sx={{
                    flex: 1, textAlign: 'center', p: 4, borderRadius: 4,
                    border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                    bgcolor: alpha(theme.palette.background.paper, 0.5),
                    transition: 'all 0.3s cubic-bezier(0.22,1,0.36,1)',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 8px 30px ${alpha(primary, 0.07)}`,
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 52, height: 52, borderRadius: '50%', mx: 'auto', mb: 2.5,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      bgcolor: alpha(primary, 0.1), color: 'primary.main',
                    }}
                  >
                    {item.icon}
                  </Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                    {item.text}
                  </Typography>
                </Box>
              </FadeSection>
            ))}
          </Stack>
        </Container>
      </Box>

      {/* ── Contact Us ── */}
      <Box
        id="contact"
        sx={{ py: { xs: 8, md: 12 }, scrollMarginTop: '72px' }}
      >
        <Container maxWidth="md">
          <FadeSection>
            <Typography
              variant="overline"
              sx={{
                display: 'block', textAlign: 'center', color: 'primary.main',
                fontWeight: 700, letterSpacing: '0.1em', mb: 1.5,
              }}
            >
              {t('landing.contactLabel')}
            </Typography>
          </FadeSection>
          <FadeSection delay={0.08}>
            <Typography
              variant="h4"
              sx={{
                textAlign: 'center', fontWeight: 700,
                letterSpacing: '-0.02em', color: 'text.primary', mb: 2,
              }}
            >
              {t('landing.contactHeading')}
            </Typography>
          </FadeSection>
          <FadeSection delay={0.14}>
            <Typography
              variant="body1"
              sx={{
                textAlign: 'center', color: 'text.secondary',
                lineHeight: 1.7, maxWidth: 500, mx: 'auto', mb: 7,
              }}
            >
              {t('landing.contactSubtext')}
            </Typography>
          </FadeSection>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={6} alignItems="flex-start">
            {/* Contact info */}
            <FadeSection delay={0.15} sx={{ flex: 1 }}>
              <Stack spacing={3.5}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box
                    sx={{
                      width: 44, height: 44, borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      bgcolor: alpha(primary, 0.1), color: 'primary.main', flexShrink: 0,
                    }}
                  >
                    <EmailOutlined fontSize="small" />
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                      {t('landing.contactEmailLabel')}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      support@tick8.app
                    </Typography>
                  </Box>
                </Stack>

                <Stack direction="row" spacing={2} alignItems="center">
                  <Box
                    sx={{
                      width: 44, height: 44, borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      bgcolor: alpha(primary, 0.1), color: 'primary.main', flexShrink: 0,
                    }}
                  >
                    <PlaceOutlined fontSize="small" />
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                      {t('landing.contactLocationLabel')}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {t('landing.contactLocationValue')}
                    </Typography>
                  </Box>
                </Stack>
              </Stack>
            </FadeSection>

            {/* Contact form */}
            <FadeSection delay={0.2} sx={{ flex: 1.4 }}>
              <Box
                component="form"
                onSubmit={(e: React.FormEvent) => e.preventDefault()}
                sx={{
                  p: { xs: 3, md: 4 }, borderRadius: 4,
                  border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                  bgcolor: alpha(theme.palette.background.paper, 0.5),
                }}
              >
                <Stack spacing={2.5}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <TextField
                      fullWidth size="small" label={t('landing.contactName')}
                      variant="outlined"
                    />
                    <TextField
                      fullWidth size="small" label={t('landing.contactEmail')}
                      type="email" variant="outlined"
                    />
                  </Stack>
                  <TextField
                    fullWidth size="small" label={t('landing.contactSubject')}
                    variant="outlined"
                  />
                  <TextField
                    fullWidth label={t('landing.contactMessage')}
                    multiline rows={4} variant="outlined"
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    endIcon={<SendOutlined />}
                    sx={{
                      alignSelf: 'flex-start',
                      borderRadius: 2.5, px: 4, py: 1.25,
                      fontWeight: 700, textTransform: 'none',
                      boxShadow: `0 4px 14px ${alpha(primary, 0.35)}`,
                      transition: 'all 0.25s ease',
                      '&:hover': {
                        boxShadow: `0 6px 20px ${alpha(primary, 0.45)}`,
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    {t('landing.contactSend')}
                  </Button>
                </Stack>
              </Box>
            </FadeSection>
          </Stack>
        </Container>
      </Box>

      {/* ── Footer ── */}
      <Box
        sx={{
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
          py: 4,
        }}
      >
        <Container maxWidth="lg">
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <AutoAwesome sx={{ color: 'primary.main', fontSize: 20 }} />
              <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                Tick 8
              </Typography>
            </Stack>
            <Stack direction="row" spacing={3} alignItems="center">
              {(['about', 'contact'] as const).map((id) => (
                <Link
                  key={id}
                  component="button"
                  underline="none"
                  onClick={() => scrollTo(id)}
                  sx={{
                    fontSize: '0.8rem', fontWeight: 600, color: 'text.secondary',
                    cursor: 'pointer',
                    transition: 'color 0.2s',
                    '&:hover': { color: 'primary.main' },
                  }}
                >
                  {id === 'about' ? t('landing.navAbout') : t('landing.navContact')}
                </Link>
              ))}
            </Stack>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {t('landing.footerCopy')}
            </Typography>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
};

export default Landing;
