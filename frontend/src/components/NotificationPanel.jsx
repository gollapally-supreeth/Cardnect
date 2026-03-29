import { useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bell, CheckCheck, X, MessageCircle, Check, Loader,
  Inbox, CreditCard, ChevronRight
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { markNotificationRead, markAllNotificationsRead, updateRequestStatus } from '../api/services'
import { useState } from 'react'
import './NotificationPanel.css'

function timeAgo(dateStr) {
  const seconds = Math.floor((Date.now() - new Date(dateStr)) / 1000)
  if (seconds < 60)    return 'just now'
  if (seconds < 3600)  return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

/** Determine the route a notification should navigate to when clicked */
function getNotifRoute(notif) {
  if (!notif) return null
  // Card request received by Holder → go to requests page
  if (notif.type === 'CARD_REQUEST' || notif.requestId) return '/dashboard/requests'
  // Response to a request (accepted/rejected) → Seeker sees it in My Requests
  if (notif.type === 'REQUEST_ACCEPTED' || notif.type === 'REQUEST_REJECTED') return '/dashboard/requests'
  return null
}

/** Icon for the notification type */
function NotifIcon({ notif }) {
  if (notif.requestId) return <CreditCard size={16} strokeWidth={1.5} />
  return <Bell size={16} strokeWidth={1.5} />
}

export default function NotificationPanel({ onClose }) {
  const { notifications, unreadCount, markNotificationRead: markRead, markAllRead } = useApp()
  const panelRef   = useRef(null)
  const navigate   = useNavigate()

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target) &&
        !e.target.closest('#notifications-btn')
      ) { onClose() }
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

  const unread = notifications.filter(n => !n.read)
  const read   = notifications.filter(n =>  n.read)

  return (
    <div className="notif-panel animate-slide-up" ref={panelRef}>

      {/* Header */}
      <div className="notif-panel-header">
        <div className="notif-panel-title">
          <Bell size={15} />
          Notifications
          {unreadCount > 0 && <span className="notif-count-badge">{unreadCount}</span>}
        </div>
        <div className="notif-panel-actions">
          {unreadCount > 0 && (
            <button className="btn btn-ghost btn-sm" onClick={handleMarkAllRead} title="Mark all read">
              <CheckCheck size={14} />
              <span className="notif-action-label">All read</span>
            </button>
          )}
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            <X size={14} />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="notif-list">
        {notifications.length === 0 ? (
          <div className="notif-empty">
            <div className="notif-empty-icon"><Bell size={28} /></div>
            <p className="notif-empty-title">All caught up</p>
            <p className="notif-empty-sub">You have no notifications yet.</p>
          </div>
        ) : (
          <>
            {/* Unread section */}
            {unread.length > 0 && (
              <>
                <div className="notif-section-label">
                  <span className="notif-unread-dot-sm" /> Unread
                </div>
                {unread.map(notif => (
                  <NotificationItem
                    key={notif.id}
                    notif={notif}
                    onMarkRead={handleMarkRead}
                    onNavigate={(path) => { onClose(); navigate(path) }}
                  />
                ))}
                {read.length > 0 && <div className="notif-section-divider" />}
              </>
            )}

            {/* Read section */}
            {read.length > 0 && (
              <>
                {unread.length > 0 && (
                  <div className="notif-section-label notif-section-label--muted">Earlier</div>
                )}
                {read.slice(0, 10).map(notif => (
                  <NotificationItem
                    key={notif.id}
                    notif={notif}
                    onMarkRead={handleMarkRead}
                    onNavigate={(path) => { onClose(); navigate(path) }}
                  />
                ))}
              </>
            )}
          </>
        )}
      </div>

      {/* Footer shortcut */}
      {notifications.length > 0 && (
        <div className="notif-panel-footer">
          <button
            className="notif-footer-link"
            onClick={() => { onClose(); navigate('/dashboard/requests') }}
          >
            <Inbox size={13} /> View all requests <ChevronRight size={12} />
          </button>
        </div>
      )}
    </div>
  )
}

/* ── Individual notification item ── */
function NotificationItem({ notif, onMarkRead, onNavigate }) {
  const { refreshNotifications } = useApp()
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const isUnread   = !notif.read
  const isRequest  = !!notif.requestId
  const status     = notif.requestStatus
  const isPending  = status === 'PENDING'
  const isAccepted = status === 'ACCEPTED'
  const isRejected = status === 'REJECTED'

  const route = getNotifRoute(notif)

  const waLink = isAccepted && notif.requesterPhone
    ? `https://wa.me/${notif.requesterPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
        `Hi ${notif.requesterName || ''}! I've accepted your card request on Cardnect. Let's discuss details.`
      )}`
    : null

  const handleAction = async (statusVal, e) => {
    e.stopPropagation()
    setLoading(true); setError('')
    try {
      await updateRequestStatus(notif.requestId, statusVal)
      await refreshNotifications()
    } catch { setError('Failed to update') }
    finally { setLoading(false) }
  }

  const handleClick = () => {
    if (isUnread) onMarkRead(notif.id)
    if (route)    onNavigate(route)
  }

  return (
    <div
      className={`notif-item ${isUnread ? 'unread' : 'read'} ${route ? 'clickable' : ''}`}
      onClick={handleClick}
    >
      {/* Unread indicator bar */}
      {isUnread && <div className="notif-unread-bar" />}

      {/* Icon */}
      <div className={`notif-item-icon ${isUnread ? 'notif-item-icon--unread' : ''}`}>
        <NotifIcon notif={notif} />
      </div>

      {/* Body */}
      <div className="notif-item-body">
        <p className={`notif-item-msg ${isUnread ? 'notif-item-msg--unread' : ''}`}>
          {notif.message}
        </p>

        {/* Request actions */}
        {isRequest && (
          <div className="notif-request-content">
            {isPending && (
              <div className="notif-actions">
                <button
                  className="notif-btn notif-btn-accept"
                  disabled={loading}
                  onClick={(e) => handleAction('ACCEPTED', e)}
                >
                  {loading ? <Loader size={12} className="spin" /> : <><Check size={13} /> Accept</>}
                </button>
                <button
                  className="notif-btn notif-btn-decline"
                  disabled={loading}
                  onClick={(e) => handleAction('REJECTED', e)}
                >
                  Decline
                </button>
              </div>
            )}

            {isAccepted && (
              <div className="notif-status-row">
                <span className="notif-status-tag accepted">✓ Accepted</span>
                {waLink && (
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="notif-wa-link"
                    onClick={e => e.stopPropagation()}
                  >
                    <MessageCircle size={13} /> Message on WhatsApp
                  </a>
                )}
              </div>
            )}

            {isRejected && (
              <div className="notif-status-row">
                <span className="notif-status-tag rejected">Declined</span>
              </div>
            )}

            {error && <p className="notif-error">{error}</p>}
          </div>
        )}

        <div className="notif-item-footer">
          <span className="notif-item-time">{timeAgo(notif.createdAt)}</span>
          {route && isUnread && (
            <span className="notif-item-cta">Tap to view <ChevronRight size={11} /></span>
          )}
        </div>
      </div>
    </div>
  )
}
