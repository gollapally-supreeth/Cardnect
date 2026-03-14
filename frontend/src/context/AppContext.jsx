import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { fetchMyNotifications } from '../api/services'
import { useAuthContext } from './AuthContext'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const { token, isAuthenticated, user } = useAuthContext()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const stompClientRef = useRef(null)

  // Fetch initial notifications
  const refreshNotifications = useCallback(async () => {
    if (!isAuthenticated) return
    try {
      const data = await fetchMyNotifications()
      setNotifications(data)
      setUnreadCount(data.filter(n => !n.read).length)
    } catch {
      // silent
    }
  }, [isAuthenticated])

  useEffect(() => {
    refreshNotifications()
  }, [refreshNotifications])

  // WebSocket connection
  useEffect(() => {
    if (!isAuthenticated || !token) return
    let client

    const connect = async () => {
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
  }, [isAuthenticated, token])

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
    user,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useApp = () => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
