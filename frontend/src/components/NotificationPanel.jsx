import { useRef, useEffect } from 'react'
import { Bell, CheckCheck, X } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { markNotificationRead, markAllNotificationsRead } from '../api/services'
import './NotificationPanel.css'

function timeAgo(dateStr) {
  const seconds = Math.floor((Date.now() - new Date(dateStr)) / 1000)
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

export default function NotificationPanel({ onClose }) {
  const { notifications, unreadCount, markNotificationRead: markRead, markAllRead } = useApp()
  const panelRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target) && !e.target.closest('#notifications-btn')) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  const handleMarkRead = async (id) => {
    markRead(id)
    try { await markNotificationRead(id) } catch { /* silent */ }
  }

  const handleMarkAllRead = async () => {
    markAllRead()
    try { await markAllNotificationsRead() } catch { /* silent */ }
  }

  return (
    <div className="notif-panel animate-slide-up" ref={panelRef}>
      <div className="notif-panel-header">
        <div className="notif-panel-title">
          <Bell size={16} />
          Notifications
          {unreadCount > 0 && <span className="notif-count-badge">{unreadCount}</span>}
        </div>
        <div className="notif-panel-actions">
          {unreadCount > 0 && (
            <button className="btn btn-ghost btn-sm" onClick={handleMarkAllRead} title="Mark all read">
              <CheckCheck size={15} />
            </button>
          )}
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            <X size={15} />
          </button>
        </div>
      </div>

      <div className="notif-list">
        {notifications.length === 0 ? (
          <div className="notif-empty">
            <Bell size={32} color="var(--color-text-muted)" />
            <p>No notifications yet</p>
          </div>
        ) : (
          notifications.slice(0, 20).map(notif => (
            <div
              key={notif.id}
              className={`notif-item ${!notif.read ? 'unread' : ''}`}
              onClick={() => !notif.read && handleMarkRead(notif.id)}
            >
              <div className="notif-item-dot">{!notif.read && <span className="notification-dot" />}</div>
              <div className="notif-item-body">
                <p className="notif-item-msg">{notif.message}</p>
                <p className="notif-item-time">{timeAgo(notif.createdAt)}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
