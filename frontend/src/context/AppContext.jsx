import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { fetchMyNotifications } from '../api/services'
import { useAuthContext } from './AuthContext'

const AppContext = createContext(null)

const POLL_INTERVAL = 15_000 // 15s fallback polling when WS is down

export function AppProvider({ children }) {
  const { token, isAuthenticated } = useAuthContext()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount]     = useState(0)
  const stompClientRef = useRef(null)
  const wsLiveRef      = useRef(false)   // true when WS is connected
  const pollTimerRef   = useRef(null)

  /* ── Fetch & merge notifications ── */
  const refreshNotifications = useCallback(async () => {
    if (!isAuthenticated) return
    try {
      const data = await fetchMyNotifications()
      setNotifications(data)
      setUnreadCount(data.filter(n => !n.read).length)
    } catch { /* silent */ }
  }, [isAuthenticated])

  /* ── Initial load ── */
  useEffect(() => { refreshNotifications() }, [refreshNotifications])

  /* ── Polling fallback (runs when WS is down) ── */
  const startPolling = useCallback(() => {
    if (pollTimerRef.current) return           // already running
    pollTimerRef.current = setInterval(() => {
      if (!wsLiveRef.current) refreshNotifications()
    }, POLL_INTERVAL)
  }, [refreshNotifications])

  const stopPolling = useCallback(() => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current)
      pollTimerRef.current = null
    }
  }, [])

  /* ── WebSocket connection ── */
  useEffect(() => {
    if (!isAuthenticated || !token) return

    let client

    const connect = () => {
      client = new Client({
        webSocketFactory: () => new SockJS(
          import.meta.env.VITE_WS_URL || 'http://localhost:8080/ws'
        ),
        connectHeaders: { Authorization: `Bearer ${token}` },

        onConnect: () => {
          wsLiveRef.current = true

          // Subscribe to personal notification queue
          client.subscribe('/user/queue/notifications', (msg) => {
            try {
              const notification = JSON.parse(msg.body)
              setNotifications(prev => {
                // Avoid duplicates if polling also fetched it
                if (prev.some(n => n.id === notification.id)) return prev
                return [notification, ...prev]
              })
              setUnreadCount(prev => prev + 1)
            } catch { /* bad payload – ignore */ }
          })

          // Also subscribe to the request status update topic
          // so holders and seekers both get live card request status changes
          client.subscribe('/user/queue/request-updates', (msg) => {
            try {
              const notification = JSON.parse(msg.body)
              setNotifications(prev => {
                if (prev.some(n => n.id === notification.id)) return prev
                return [notification, ...prev]
              })
              setUnreadCount(prev => prev + 1)
            } catch { /* ignore */ }
          })
        },

        onStompError: () => {
          wsLiveRef.current = false
          startPolling()        // start polling when WS errors
        },

        onDisconnect: () => {
          wsLiveRef.current = false
          startPolling()        // start polling when WS drops
        },

        reconnectDelay: 5000,  // auto-reconnect every 5s
      })

      client.activate()
      stompClientRef.current = client
    }

    connect()
    startPolling()  // start polling immediately as safety net

    return () => {
      wsLiveRef.current = false
      stopPolling()
      if (stompClientRef.current?.active) {
        stompClientRef.current.deactivate()
      }
    }
  }, [isAuthenticated, token, startPolling, stopPolling])

  /* ── Mark read helpers ── */
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
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useApp = () => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
