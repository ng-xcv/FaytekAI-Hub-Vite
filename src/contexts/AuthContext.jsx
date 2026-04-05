import { createContext, useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';
import axiosInstance from '../utils/axios';
import { HOST_API } from '../config';

const resolveImg = (user) => {
  if (!user?.avatar) return user;
  if (user.avatar.startsWith('/uploads')) return { ...user, avatar: `${HOST_API}${user.avatar}` };
  return user;
};

const initialState = { isAuthenticated: false, isInitialized: false, user: null };

const handlers = {
  INITIALIZE: (state, action) => ({ ...state, isAuthenticated: action.payload.isAuthenticated, isInitialized: true, user: action.payload.user }),
  LOGIN: (state, action) => ({ ...state, isAuthenticated: true, user: action.payload.user }),
  LOGOUT: (state) => ({ ...state, isAuthenticated: false, user: null }),
  UPDATE_PROFILE: (state, action) => ({ ...state, user: action.payload.user }),
};

const reducer = (state, action) => handlers[action.type] ? handlers[action.type](state, action) : state;

export const AuthContext = createContext({ ...initialState, method: 'jwt', login: () => Promise.resolve(), loginMicrosoft: () => Promise.resolve(), logout: () => Promise.resolve(), updateProfile: () => Promise.resolve() });

AuthProvider.propTypes = { children: PropTypes.node };

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const initialize = async () => {
      try {
        const { data } = await axiosInstance.get('/api/auth/me');
        dispatch({ type: 'INITIALIZE', payload: { isAuthenticated: true, user: resolveImg(data.user) } });
      } catch {
        dispatch({ type: 'INITIALIZE', payload: { isAuthenticated: false, user: null } });
      }
    };
    initialize();
  }, []);

  const login = async (email, password) => {
    const { data } = await axiosInstance.post('/api/auth/login', { email, password });
    dispatch({ type: 'LOGIN', payload: { user: resolveImg(data.user) } });
    return resolveImg(data.user);
  };

  const loginMicrosoft = async (msToken) => {
    const { data } = await axiosInstance.post('/api/auth/microsoft', { token: msToken });
    dispatch({ type: 'LOGIN', payload: { user: resolveImg(data.user) } });
    return resolveImg(data.user);
  };

  const logout = async () => {
    await axiosInstance.post('/api/auth/logout').catch(() => {});
    dispatch({ type: 'LOGOUT' });
  };

  const updateProfile = async (payload) => {
    const formData = new FormData();
    Object.entries(payload).forEach(([k, v]) => { if (v !== undefined) formData.append(k, v); });
    const { data } = await axiosInstance.put('/api/auth/profile', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    dispatch({ type: 'UPDATE_PROFILE', payload: { user: resolveImg(data.user) } });
    return resolveImg(data.user);
  };

  return (
    <AuthContext.Provider value={{ ...state, method: 'jwt', login, loginMicrosoft, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}
