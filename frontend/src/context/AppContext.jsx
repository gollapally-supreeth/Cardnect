import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react'
import { useAuth, useUser } from '@clerk/react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { setClerkTokenGetter } from '../api/axiosClient'
import { syncUser, fetchMyNotifications } from '../api/services'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const { getToken, isSignedIn } = useAuth()
  const { user: clerkUser } = useUser()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const stompClientRef = useRef(null)

  // Wire up Clerk token getter into Axios
  useEffect(() => {
    setClerkTokenGetter(() => getToken())
  }, [getToken])

  // Sync user with backend when logged in
  useEffect(() => {
    if (isSignedIn && clerkUser) {
      syncUser().catch(err => console.warn('User sync failed:', err))
    }
  }, [isSignedIn, clerkUser])

  // Fetch initial notifications
  const refreshNotifications = useCallback(async () => {
    if (!isSignedIn) return
    try {
      const data = await fetchMyNotifications()
      setNotifications(data)
      setUnreadCount(data.filter(n => !n.read).length)
    } catch {
      // silent
    }
  }, [isSignedIn])

  useEffect(() => {
    refreshNotifications()
  }, [refreshNotifications])

  // WebSocket connection
  useEffect(() => {
    if (!isSignedIn) return
    let client

    const connect = async () => {
      const token = await getToken()
      client = new Client({
        webSocketFactory: () => new SockJS(import.meta.env.VITE_WS_URL || 'http://localhost:8080/ws'),
        connectHeaders: { Authorization: `Bearer ${token}` },
        onConnect: () => {
          client.subscribe('/user/queue/notifications', (msg) => {
            const notification = JSON.parse(msg.body)
            setNotifications(prev => [notification, ...prev])
            setUnreadCount(prev => prev + 1)
          })
        },
        onStompError: (frame) => console.warn('WebSocket error:', frame),
        reconnectDelay: 5000,
      })
      client.activate()
      stompClientRef.current = client
    }

    connect().catch(console.warn)

    return () => {
      if (stompClientRef.current?.active) {
        stompClientRef.current.deactivate()
      }
    }
  }, [isSignedIn, getToken])

  const markNotificationRead = useCallback((id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    setUnreadCount(prev => Math.max(0, prev - 1))
  }, [])

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
  }, [])

  const value = {
    notifications,
    unreadCount,
    markNotificationRead,
    markAllRead,
    refreshNotifications,
    clerkUser,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useApp = () => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
