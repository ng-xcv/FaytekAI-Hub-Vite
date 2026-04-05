import { alpha } from '@mui/material/styles';
import { FAYTEK_GOLD } from './palette';

// MUI v5 requiert exactement 25 ombres (index 0..24)
// 'none' + 24 valeurs = 25 total
const shadowsDark = [
  'none',
  `0 1px 2px 0 ${alpha('#000', 0.5)}`,
  `0 2px 4px 0 ${alpha('#000', 0.5)}`,
  `0 4px 6px 0 ${alpha('#000', 0.45)}`,
  `0 4px 8px 0 ${alpha('#000', 0.4)}`,
  `0 4px 10px 0 ${alpha('#000', 0.4)}`,
  `0 4px 12px 0 ${alpha('#000', 0.4)}`,
  `0 4px 14px 0 ${alpha('#000', 0.4)}`,
  `0 8px 16px 0 ${alpha('#000', 0.4)}`,
  `0 8px 18px 0 ${alpha('#000', 0.4)}`,
  `0 8px 20px 0 ${alpha('#000', 0.4)}`,
  `0 8px 22px 0 ${alpha('#000', 0.4)}`,
  `0 12px 24px 0 ${alpha('#000', 0.4)}`,
  `0 12px 26px 0 ${alpha('#000', 0.4)}`,
  `0 12px 28px 0 ${alpha('#000', 0.4)}`,
  `0 16px 30px 0 ${alpha('#000', 0.4)}`,
  `0 16px 32px 0 ${alpha('#000', 0.4)}`,
  `0 16px 34px 0 ${alpha('#000', 0.4)}`,
  `0 20px 36px 0 ${alpha('#000', 0.4)}`,
  `0 20px 38px 0 ${alpha('#000', 0.4)}`,
  `0 20px 40px 0 ${alpha('#000', 0.4)}`,
  `0 24px 42px 0 ${alpha('#000', 0.4)}`,
  `0 24px 44px 0 ${alpha('#000', 0.4)}`,
  `0 24px 46px 0 ${alpha('#000', 0.4)}`,
  `0 24px 48px 0 ${alpha('#000', 0.4)}`,
];

const shadowsLight = [
  'none',
  `0 1px 2px 0 ${alpha('#2563EB', 0.16)}`,
  `0 2px 4px 0 ${alpha('#2563EB', 0.16)}`,
  `0 4px 6px 0 ${alpha('#2563EB', 0.12)}`,
  `0 4px 8px 0 ${alpha('#2563EB', 0.12)}`,
  `0 4px 10px 0 ${alpha('#2563EB', 0.12)}`,
  `0 4px 12px 0 ${alpha('#2563EB', 0.12)}`,
  `0 4px 14px 0 ${alpha('#2563EB', 0.12)}`,
  `0 8px 16px 0 ${alpha('#2563EB', 0.12)}`,
  `0 8px 18px 0 ${alpha('#2563EB', 0.12)}`,
  `0 8px 20px 0 ${alpha('#2563EB', 0.12)}`,
  `0 8px 22px 0 ${alpha('#2563EB', 0.12)}`,
  `0 12px 24px 0 ${alpha('#2563EB', 0.12)}`,
  `0 12px 26px 0 ${alpha('#2563EB', 0.12)}`,
  `0 12px 28px 0 ${alpha('#2563EB', 0.12)}`,
  `0 16px 30px 0 ${alpha('#2563EB', 0.12)}`,
  `0 16px 32px 0 ${alpha('#2563EB', 0.12)}`,
  `0 16px 34px 0 ${alpha('#2563EB', 0.12)}`,
  `0 20px 36px 0 ${alpha('#2563EB', 0.12)}`,
  `0 20px 38px 0 ${alpha('#2563EB', 0.12)}`,
  `0 20px 40px 0 ${alpha('#2563EB', 0.12)}`,
  `0 24px 42px 0 ${alpha('#2563EB', 0.12)}`,
  `0 24px 44px 0 ${alpha('#2563EB', 0.12)}`,
  `0 24px 46px 0 ${alpha('#2563EB', 0.12)}`,
  `0 24px 48px 0 ${alpha('#2563EB', 0.12)}`,
];

const shadows = {
  dark: shadowsDark,
  light: shadowsLight,
};

export const customShadows = {
  dark: {
    z1: `0 1px 2px 0 ${alpha('#000', 0.4)}`,
    z8: `0 8px 16px 0 ${alpha('#000', 0.4)}`,
    z12: `0 12px 24px -4px ${alpha('#000', 0.4)}`,
    z24: `0 24px 48px 0 ${alpha('#000', 0.4)}`,
    primary: `0 8px 16px 0 ${alpha(FAYTEK_GOLD, 0.3)}`,
    card: `0 0 2px 0 ${alpha('#000', 0.3)}, 0 12px 24px -4px ${alpha('#000', 0.25)}`,
    dialog: `-40px 40px 80px -8px ${alpha('#000', 0.4)}`,
    dropdown: `0 0 2px 0 ${alpha('#000', 0.3)}, -20px 20px 40px -4px ${alpha('#000', 0.3)}`,
  },
  light: {
    z1: `0 1px 2px 0 ${alpha('#2563EB', 0.16)}`,
    z8: `0 8px 16px 0 ${alpha('#2563EB', 0.16)}`,
    z12: `0 12px 24px -4px ${alpha('#2563EB', 0.16)}`,
    z24: `0 24px 48px 0 ${alpha('#2563EB', 0.16)}`,
    primary: `0 8px 16px 0 ${alpha('#2563EB', 0.24)}`,
    card: `0 0 2px 0 ${alpha('#2563EB', 0.16)}, 0 12px 24px -4px ${alpha('#2563EB', 0.12)}`,
    dialog: `-40px 40px 80px -8px ${alpha('#2563EB', 0.24)}`,
    dropdown: `0 0 2px 0 ${alpha('#2563EB', 0.24)}, -20px 20px 40px -4px ${alpha('#2563EB', 0.24)}`,
  },
};

export default shadows;
