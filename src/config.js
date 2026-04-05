import { PATH_DASHBOARD } from './routes/paths';

export const HOST_API = import.meta.env.VITE_HOST_API_KEY || 'https://faytekai-hub-backend.vercel.app';

export const HEADER = {
  MOBILE_HEIGHT: 64,
  MAIN_DESKTOP_HEIGHT: 88,
  DASHBOARD_DESKTOP_HEIGHT: 72,
  DASHBOARD_DESKTOP_OFFSET_HEIGHT: 72 - 32,
};

export const NAVBAR = {
  BASE_WIDTH: 260,
  DASHBOARD_WIDTH: 280,
  DASHBOARD_COLLAPSE_WIDTH: 88,
  DASHBOARD_ITEM_ROOT_HEIGHT: 48,
  DASHBOARD_ITEM_SUB_HEIGHT: 40,
};

export const PATH_AFTER_LOGIN = PATH_DASHBOARD.root;

export const ICON = {
  NAVBAR_ITEM: 22,
};
