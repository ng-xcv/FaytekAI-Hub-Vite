import { alpha } from '@mui/material/styles';

export const FAYTEK_GOLD = '#F5C200';
export const FAYTEK_BLUE = '#2563EB';
export const FAYTEK_DARK_BG = '#0D1729';
export const FAYTEK_GOLD_BG = '#0A0F1A';

function createGradient(c1, c2) {
  return `linear-gradient(to bottom, ${c1}, ${c2})`;
}

const GREY = {
  0: '#FFFFFF', 100: '#F9FAFB', 200: '#F4F6F8', 300: '#DFE3E8', 400: '#C4CDD5',
  500: '#919EAB', 600: '#637381', 700: '#454F5B', 800: '#212B36', 900: '#161C24',
  500_8: alpha('#919EAB', 0.08), 500_12: alpha('#919EAB', 0.12), 500_16: alpha('#919EAB', 0.16),
  500_24: alpha('#919EAB', 0.24), 500_32: alpha('#919EAB', 0.32), 500_48: alpha('#919EAB', 0.48),
  500_56: alpha('#919EAB', 0.56), 500_80: alpha('#919EAB', 0.8),
};

const INFO    = { lighter: '#D0F2FF', light: '#74CAFF', main: '#1890FF', dark: '#0C53B7', darker: '#04297A', contrastText: '#fff' };
const SUCCESS = { lighter: '#E9FCD4', light: '#AAF27F', main: '#54D62C', dark: '#229A16', darker: '#08660D', contrastText: '#fff' };
const WARNING = { lighter: '#FFF7CD', light: '#FFE16A', main: '#FFC107', dark: '#B78103', darker: '#7A4F01', contrastText: '#000' };
const ERROR   = { lighter: '#FFE7D9', light: '#FFA48D', main: '#FF4842', dark: '#B72136', darker: '#7A0C2E', contrastText: '#fff' };

const dark = {
  mode: 'dark',
  primary: { lighter: alpha(FAYTEK_GOLD, 0.3), light: alpha(FAYTEK_GOLD, 0.7), main: FAYTEK_GOLD, dark: '#C9A000', darker: '#9A7A00', contrastText: '#0D1729' },
  secondary: { lighter: '#B8CBFF', light: '#7E9EFF', main: '#4575F3', dark: '#2B4EBF', darker: '#1A318A', contrastText: '#fff' },
  info: INFO, success: SUCCESS, warning: WARNING, error: ERROR, grey: GREY,
  divider: alpha(FAYTEK_GOLD, 0.16),
  text: { primary: '#FFF7E6', secondary: alpha('#FFF7E6', 0.65), disabled: alpha('#FFF7E6', 0.35) },
  background: { paper: '#131E35', default: FAYTEK_DARK_BG, neutral: alpha(FAYTEK_GOLD, 0.06) },
  action: { active: GREY[500], hover: alpha(FAYTEK_GOLD, 0.08), selected: alpha(FAYTEK_GOLD, 0.16), disabled: alpha('#fff', 0.3), disabledBackground: alpha('#fff', 0.12), focus: alpha(FAYTEK_GOLD, 0.24), hoverOpacity: 0.08, disabledOpacity: 0.48 },
  common: { black: '#000', white: '#fff' },
  gradients: { primary: createGradient(alpha(FAYTEK_GOLD, 0.7), FAYTEK_GOLD), info: createGradient(INFO.light, INFO.main), success: createGradient(SUCCESS.light, SUCCESS.main), warning: createGradient(WARNING.light, WARNING.main), error: createGradient(ERROR.light, ERROR.main) },
};

const light = {
  mode: 'light',
  primary: { lighter: '#DBEAFE', light: '#93C5FD', main: FAYTEK_BLUE, dark: '#1D4ED8', darker: '#1E40AF', contrastText: '#fff' },
  secondary: { lighter: alpha(FAYTEK_GOLD, 0.3), light: alpha(FAYTEK_GOLD, 0.7), main: FAYTEK_GOLD, dark: '#C9A000', darker: '#9A7A00', contrastText: '#0D1729' },
  info: INFO, success: SUCCESS, warning: WARNING, error: ERROR, grey: GREY,
  divider: alpha(FAYTEK_BLUE, 0.16),
  text: { primary: '#1A2332', secondary: GREY[600], disabled: GREY[500] },
  background: { paper: '#FFFFFF', default: '#F8FAFC', neutral: GREY[200] },
  action: { active: GREY[600], hover: alpha(FAYTEK_BLUE, 0.08), selected: alpha(FAYTEK_BLUE, 0.16), disabled: alpha(FAYTEK_BLUE, 0.8), disabledBackground: alpha(FAYTEK_BLUE, 0.24), focus: alpha(FAYTEK_BLUE, 0.24), hoverOpacity: 0.08, disabledOpacity: 0.48 },
  common: { black: '#000', white: '#fff' },
  gradients: { primary: createGradient('#93C5FD', FAYTEK_BLUE), info: createGradient(INFO.light, INFO.main), success: createGradient(SUCCESS.light, SUCCESS.main), warning: createGradient(WARNING.light, WARNING.main), error: createGradient(ERROR.light, ERROR.main) },
};

const gold = {
  ...dark,
  background: { paper: '#111827', default: FAYTEK_GOLD_BG, neutral: alpha(FAYTEK_GOLD, 0.05) },
  text: { primary: '#FFF7E6', secondary: alpha('#FFF7E6', 0.7), disabled: alpha('#FFF7E6', 0.38) },
  divider: alpha(FAYTEK_GOLD, 0.24),
};

const palette = { dark, light, gold };
export default palette;
