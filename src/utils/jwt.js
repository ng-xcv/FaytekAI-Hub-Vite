import { jwtDecode } from 'jwt-decode';

export const isValidToken = (accessToken) => {
  if (!accessToken) return false;
  try {
    const decoded = jwtDecode(accessToken);
    return decoded.exp > Date.now() / 1000;
  } catch {
    return false;
  }
};

export const decodeToken = (token) => {
  try { return jwtDecode(token); } catch { return null; }
};
