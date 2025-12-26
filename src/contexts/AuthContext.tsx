import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { authAPI } from '../services/api'

interface User {
  id: number;
  name: string;
  email: string;
  role: 'USER' | 'PARTNER' | 'ADMIN';  // Match backend enum values (uppercase)
  phone?: string;
  vehicleType?: 'CAR' | 'TAXI' | 'VAN';
  vehicleRegistration?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, phone?: string, vehicleType?: string, vehicleRegistration?: string) => Promise<void>
  logout: () => void
  setAuth: (user: User, token: string) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: { user: User; token: string } }
  | { type: 'LOGOUT' }

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  isLoading: true,
  isAuthenticated: false,
}

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    case 'SET_USER':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      }
    case 'LOGOUT':
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      }
    default:
      return state
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  const setAuth = (user: User, token: string) => {
    localStorage.setItem('token', token)
    dispatch({ type: 'SET_USER', payload: { user, token } })
  }

  const login = async (email: string, password: string) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    
    try {
      const response = await authAPI.login({ email, password })
      const { data: { user, token, refreshToken } = {} } = response.data
      
      console.log('Login response: token', token)
      localStorage.setItem('token', token)
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken)
      }
      
      dispatch({ type: 'SET_USER', payload: { user, token } })
      return
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false })
      throw error
    }
  }

  const register = async (name: string, email: string, password: string, phone?: string, vehicleType?: string, vehicleRegistration?: string) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    
    try {
      const response = await authAPI.register({ name, email, password, phone, vehicleType, vehicleRegistration })
      const { user, token, refreshToken } = response.data
      
      localStorage.setItem('token', token)
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken)
      }
      
      dispatch({ type: 'SET_USER', payload: { user, token } })
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false })
      throw error
    }
  }

  const logout = () => {
    dispatch({ type: 'LOGOUT' })
  }

  // Check for existing token on mount and validate it
  useEffect(() => {
    // Check for URL token first (Magic Link / App Handoff)
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    const isPartnerRoute = window.location.pathname.startsWith('/partner');
    
    // Only process URL token in AuthContext if it's NOT a partner route
    if (urlToken && !isPartnerRoute) {
      localStorage.setItem('token', urlToken);
      
      // Clean URL without refresh
      params.delete('token');
      const newUrl = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
      window.history.replaceState({}, '', newUrl);
    }

    const token = localStorage.getItem('token')
    if (token) {
      // Validate token by fetching current user
      authAPI.getCurrentUser()
        .then((response) => {
          dispatch({ type: 'SET_USER', payload: { user: response.data?.data, token } })
        })
        .catch(() => {
          // Token is invalid, remove it
          localStorage.removeItem('token')
          localStorage.removeItem('refreshToken')
          dispatch({ type: 'SET_LOADING', payload: false })
        })
    } else {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [])

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, setAuth }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}