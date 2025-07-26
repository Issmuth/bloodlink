'use client'

import { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI } from '../lib/api';

// Initial state
const initialState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isLoading: true,
  isAuthenticated: false,
};

// Action types
const AuthActionTypes = {
  SET_LOADING: 'SET_LOADING',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGOUT: 'LOGOUT',
  UPDATE_USER: 'UPDATE_USER',
  SET_TOKENS: 'SET_TOKENS',
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AuthActionTypes.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };
    case AuthActionTypes.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
        isAuthenticated: true,
        isLoading: false,
      };
    case AuthActionTypes.LOGOUT:
      return {
        ...initialState,
        isLoading: false,
      };
    case AuthActionTypes.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    case AuthActionTypes.SET_TOKENS:
      return {
        ...state,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
      };
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      console.log('🔐 [AUTH CONTEXT] Initializing authentication state...');
      
      try {
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');
        const userData = localStorage.getItem('user');

        console.log('🔐 [AUTH CONTEXT] Checking stored tokens:', {
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
          hasUserData: !!userData,
          accessTokenPreview: accessToken?.substring(0, 20) + '...',
          refreshTokenPreview: refreshToken?.substring(0, 20) + '...'
        });

        if (accessToken && refreshToken && userData) {
          const user = JSON.parse(userData);
          console.log('✅ [AUTH CONTEXT] Valid tokens found, restoring user session:', {
            userId: user.id,
            email: user.email,
            role: user.role
          });
          
          dispatch({
            type: AuthActionTypes.LOGIN_SUCCESS,
            payload: {
              user,
              accessToken,
              refreshToken,
            },
          });
        } else {
          console.log('ℹ️ [AUTH CONTEXT] No valid tokens found, user not authenticated');
          dispatch({ type: AuthActionTypes.SET_LOADING, payload: false });
        }
      } catch (error) {
        console.error('❌ [AUTH CONTEXT] Error initializing auth:', error);
        // Clear corrupted data
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        dispatch({ type: AuthActionTypes.SET_LOADING, payload: false });
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (credentials) => {
    try {
      dispatch({ type: AuthActionTypes.SET_LOADING, payload: true });
      
      console.log('🔐 [AUTH CONTEXT] Starting login process...');
      console.log('🔐 [AUTH CONTEXT] Login credentials:', {
        email: credentials.email,
        role: credentials.role
      });
      
      const response = await authAPI.login(credentials);
      console.log('✅ [AUTH CONTEXT] Login API response received:', {
        status: response.status,
        hasData: !!response.data,
        hasTokens: !!response.data?.data?.tokens,
        tokenStructure: response.data?.data ? Object.keys(response.data.data) : 'no data'
      });

      // Extract user and tokens from nested structure
      const { user, tokens } = response.data.data;
      const { accessToken, refreshToken } = tokens;

      console.log('🔐 [AUTH CONTEXT] Extracted tokens:', {
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
        accessTokenPreview: accessToken?.substring(0, 20) + '...',
        refreshTokenPreview: refreshToken?.substring(0, 20) + '...'
      });

      // Store tokens in localStorage
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));

      console.log('✅ [AUTH CONTEXT] Tokens stored in localStorage');

      dispatch({
        type: AuthActionTypes.LOGIN_SUCCESS,
        payload: {
          user,
          accessToken,
          refreshToken,
        },
      });

      return { success: true, message: response.data.message };
    } catch (error) {
      dispatch({ type: AuthActionTypes.SET_LOADING, payload: false });
      
      console.error('❌ [AUTH CONTEXT] Login failed:', {
        message: error.message,
        status: error.response?.status,
        responseData: error.response?.data
      });
      
      const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
      const errorCode = error.response?.data?.code;
      const validationErrors = error.response?.data?.errors;

      return { 
        success: false, 
        message: errorMessage,
        code: errorCode,
        errors: validationErrors
      };
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      dispatch({ type: AuthActionTypes.SET_LOADING, payload: true });
      
      console.log('🔐 [AUTH CONTEXT] Starting registration process...');
      console.log('🔐 [AUTH CONTEXT] Registration data:', {
        email: userData.email,
        role: userData.role
      });
      
      const response = await authAPI.register(userData);
      console.log('✅ [AUTH CONTEXT] Registration API response received:', {
        status: response.status,
        hasData: !!response.data,
        hasTokens: !!response.data?.data?.tokens
      });

      // Extract user and tokens from nested structure
      const { user, tokens } = response.data.data;
      const { accessToken, refreshToken } = tokens;

      console.log('🔐 [AUTH CONTEXT] Extracted tokens from registration:', {
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
        accessTokenPreview: accessToken?.substring(0, 20) + '...'
      });

      // Store tokens in localStorage
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));

      console.log('✅ [AUTH CONTEXT] Registration tokens stored in localStorage');

      dispatch({
        type: AuthActionTypes.LOGIN_SUCCESS,
        payload: {
          user,
          accessToken,
          refreshToken,
        },
      });

      return { success: true, message: response.data.message };
    } catch (error) {
      dispatch({ type: AuthActionTypes.SET_LOADING, payload: false });
      
      console.error('❌ [AUTH CONTEXT] Registration failed:', {
        message: error.message,
        status: error.response?.status,
        responseData: error.response?.data
      });
      
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      const errorCode = error.response?.data?.code;
      const validationErrors = error.response?.data?.errors;

      return { 
        success: false, 
        message: errorMessage,
        code: errorCode,
        errors: validationErrors
      };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await authAPI.logout(refreshToken);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');

      dispatch({ type: AuthActionTypes.LOGOUT });
    }
  };

  // Update user profile
  const updateUser = (userData) => {
    const updatedUser = { ...state.user, ...userData };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    dispatch({
      type: AuthActionTypes.UPDATE_USER,
      payload: userData,
    });
  };

  // Refresh tokens
  const refreshTokens = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) throw new Error('No refresh token available');

      const response = await authAPI.refreshToken(refreshToken);
      const { accessToken } = response.data.data;

      localStorage.setItem('accessToken', accessToken);
      dispatch({
        type: AuthActionTypes.SET_TOKENS,
        payload: {
          accessToken,
          refreshToken: state.refreshToken,
        },
      });

      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
      return false;
    }
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateUser,
    refreshTokens,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 