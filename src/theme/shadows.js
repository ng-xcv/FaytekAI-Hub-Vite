import { alpha } from '@mui/material/styles';
import { FAYTEK_GOLD } from './palette';

const createShadow = (...px) => ['none', ...px];

const shadows = {
  dark: createShadow(
    `0 1px 2px 0 ${alpha('#000', 0.5)}`,
    `0 2px 4px 0 ${alpha('#000', 0.5)}`,
    ...Array(21).fill(`0 4px 8px 0 ${alpha('#000', 0.4)}`)
  ),
  light: createShadow(
    `0 1px 2px 0 ${alpha('#2563EB', 0.16)}`,
    `0 2px 4px 0 ${alpha('#2563EB', 0.16)}`,
    ...Array(21).fill(`0 4px 8px 0 ${alpha('#2563EB', 0.12)}`)
  ),
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
