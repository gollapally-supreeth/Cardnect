import { useRef, useEffect } from 'react'
import { Bell, CheckCheck, X, MessageCircle, Check, Trash2, Loader } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { markNotificationRead, markAllNotificationsRead, updateRequestStatus } from '../api/services'
import { useState } from 'react'
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
            <NotificationItem 
              key={notif.id} 
              notif={notif} 
              onMarkRead={handleMarkRead} 
            />
          ))
        )}
      </div>
    </div>
  )
}

function NotificationItem({ notif, onMarkRead }) {
  const { refreshNotifications } = useApp()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleAction = async (status) => {
    setLoading(true)
    setError('')
    try {
      await updateRequestStatus(notif.requestId, status)
      await refreshNotifications() // To update the local status seen in notification
    } catch (err) {
      setError('Failed to update')
    } finally {
      setLoading(false)
    }
  }

  const isRequest = !!notif.requestId
  const status = notif.requestStatus
  const isPending = status === 'PENDING'
  const isAccepted = status === 'ACCEPTED'
  const isRejected = status === 'REJECTED'

  // WhatsApp link for accepted requests
  const waLink = isAccepted && notif.requesterPhone 
    ? `https://wa.me/${notif.requesterPhone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${notif.requesterName || ''}! I've accepted your card request on Cardnect. Let's discuss details.`)}`
    : null

  return (
    <div
      className={`notif-item ${!notif.read ? 'unread' : ''}`}
      onClick={() => !notif.read && onMarkRead(notif.id)}
    >
      <div className="notif-item-dot">{!notif.read && <span className="notification-dot" />}</div>
      <div className="notif-item-body">
        <p className="notif-item-msg">{notif.message}</p>
        
        {isRequest && (
          <div className="notif-request-content">
            {isPending && (
              <div className="notif-actions">
                <button 
                  className="notif-btn notif-btn-accept" 
                  disabled={loading}
                  onClick={(e) => { e.stopPropagation(); handleAction('ACCEPTED') }}
                >
                  {loading ? <Loader size={12} className="spin" /> : <><Check size={14} /> Accept</>}
                </button>
                <button 
                  className="notif-btn notif-btn-decline" 
                  disabled={loading}
                  onClick={(e) => { e.stopPropagation(); handleAction('REJECTED') }}
                >
                  Decline
                </button>
              </div>
            )}

            {isAccepted && (
              <div style={{ marginTop: 8 }}>
                <span className="notif-status-tag accepted">Accepted</span>
                {waLink && (
                  <a 
                    href={waLink} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="notif-wa-link"
                    onClick={e => e.stopPropagation()}
                  >
                    <MessageCircle size={14} /> Message on WhatsApp
                  </a>
                )}
              </div>
            )}

            {isRejected && (
              <div style={{ marginTop: 8 }}>
                <span className="notif-status-tag rejected">Declined</span>
              </div>
            )}

            {error && <p className="ap-error" style={{ fontSize: 10, marginTop: 4 }}>{error}</p>}
          </div>
        )}

        <p className="notif-item-time">{timeAgo(notif.createdAt)}</p>
      </div>
    </div>
  )
}
