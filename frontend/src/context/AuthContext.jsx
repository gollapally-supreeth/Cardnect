import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { setAuthToken } from '../api/axiosClient'
import {
  fetchAuthMe,
  sendOtp as sendOtpApi,
  verifyOtp as verifyOtpApi,
  registerUser as registerUserApi,
  loginWithPassword as loginWithPasswordApi,
} from '../api/services'

const STORAGE_KEY = 'cardnect_auth_token'
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token,     setToken]     = useState(null)
  const [user,      setUser]      = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const applyToken = useCallback((nextToken) => {
    setToken(nextToken || null)
    setAuthToken(nextToken || null)
    if (nextToken) localStorage.setItem(STORAGE_KEY, nextToken)
    else           localStorage.removeItem(STORAGE_KEY)
  }, [])

  const refreshMe = useCallback(async () => {
    const profile = await fetchAuthMe()
    setUser(profile)
    return profile
  }, [])

  useEffect(() => {
    const init = async () => {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (!saved) { setIsLoading(false); return }
      applyToken(saved)
      try { await refreshMe() }
      catch { applyToken(null); setUser(null) }
      finally { setIsLoading(false) }
    }
    init()
  }, [applyToken, refreshMe])

  /* OTP send */
  const sendOtp = useCallback(async (email) => {
    await sendOtpApi(email)
  }, [])

  /* OTP verify / sign-in (existing flow) */
  const verifyOtp = useCallback(async (payload) => {
    const auth = await verifyOtpApi(payload)
    applyToken(auth.token)
    await refreshMe()
    return auth
  }, [applyToken, refreshMe])

  /* Register with password (after email OTP verified) */
  const register = useCallback(async (payload) => {
    const auth = await registerUserApi(payload)
    applyToken(auth.token)
    await refreshMe()
    return auth
  }, [applyToken, refreshMe])

  /* Password login */
  const loginPassword = useCallback(async (payload) => {
    const auth = await loginWithPasswordApi(payload)
    applyToken(auth.token)
    await refreshMe()
    return auth
  }, [applyToken, refreshMe])

  const signOut = useCallback(() => {
    applyToken(null)
    setUser(null)
  }, [applyToken])

  const value = useMemo(() => ({
    token, user, isLoading,
    isAuthenticated: !!token,
    sendOtp, verifyOtp, register, loginPassword, signOut, refreshMe,
  }), [token, user, isLoading, sendOtp, verifyOtp, register, loginPassword, signOut, refreshMe])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider')
  return ctx
}
