import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOADING':
      return { ...state, loading: true, error: null };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null,
      };
    case 'LOGOUT':
      return {
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      };
    case 'ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

const getInitialState = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  return {
    user: user ? JSON.parse(user) : null,
    token,
    isAuthenticated: !!(token && user),
    loading: false,
    error: null,
  };
};

const initialState = getInitialState();

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check if we have a token but no user data (e.g., from OAuth callback)
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && !user && !state.loading) {
      // We have a token but no user data, try to fetch it
      const fetchUserData = async () => {
        try {
          dispatch({ type: 'LOADING' });
          const response = await authApi.getMe();
          const userData = response.data.user;
          
          localStorage.setItem('user', JSON.stringify(userData));
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: { token, user: userData },
          });
        } catch (error) {
          console.error('Failed to fetch user data:', error);
          // Invalid token, clear it
          localStorage.removeItem('token');
          dispatch({ type: 'LOGOUT' });
        }
      };
      
      fetchUserData();
    }
  }, [state.loading]);


  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    dispatch({ type: 'LOGOUT' });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const setAuthData = (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    dispatch({
      type: 'LOGIN_SUCCESS',
      payload: { token, user },
    });
  };

  const value = {
    ...state,
    logout,
    clearError,
    setAuthData,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
