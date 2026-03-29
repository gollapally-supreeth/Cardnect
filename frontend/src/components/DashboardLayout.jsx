import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  CreditCard, Bell, LayoutDashboard, ListPlus, Inbox,
  User, LogOut, AlertCircle
} from 'lucide-react'
import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { useAuthContext } from '../context/AuthContext'
import NotificationPanel from './NotificationPanel'
import './DashboardLayout.css'

const NAV_ITEMS = [
  { path: '/dashboard',             label: 'Browse Offers', icon: LayoutDashboard, exact: true },
  { path: '/dashboard/my-listings', label: 'My Listings',   icon: ListPlus },
  { path: '/dashboard/requests',    label: 'My Requests',   icon: Inbox },
  { path: '/dashboard/profile',     label: 'Profile',       icon: User },
]

export default function DashboardLayout({ children }) {
  const { user, signOut } = useAuthContext()
  const navigate = useNavigate()
  const location = useLocation()
  const { unreadCount } = useApp()
  const [notifOpen, setNotifOpen] = useState(false)

  const isVerified = !!user?.emailVerified

  const isActive = (path, exact) =>
    exact ? location.pathname === path : location.pathname.startsWith(path)

  const handleSignOut = async () => { signOut(); navigate('/') }

  const initials = (user?.name || user?.email || 'U')?.[0]?.toUpperCase() || 'U'

  return (
    <div className="dash-shell">

      {/* ── Floating icon sidebar ── */}
      <aside className="dash-sidebar">
        {/* Logo */}
        <Link to="/" className="dash-logo-btn" title="Cardnect">
          <CreditCard size={20} />
          <span className="dash-logo-text">Cardnect</span>
        </Link>

        <div className="dash-sidebar-divider" />

        {/* Navigation */}
        <nav className="dash-nav">
          {NAV_ITEMS.map(({ path, label, icon: Icon, exact }) => (
            <Link
              key={path}
              to={path}
              className={`dash-nav-item ${isActive(path, exact) ? 'active' : ''}`}
            >
              <Icon size={20} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        <div className="dash-sidebar-spacer" />

        {/* Bottom: notifications + profile + sign-out */}
        <div className="dash-sidebar-bottom">
          <button
            id="notifications-btn"
            className={`dash-nav-item notif-icon-btn ${notifOpen ? 'active' : ''}`}
            onClick={() => setNotifOpen(v => !v)}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="sidebar-notif-dot">{unreadCount > 9 ? '9+' : unreadCount}</span>
            )}
            <span>Notifications</span>
          </button>

          <Link
            to="/dashboard/profile"
            className={`dash-sidebar-avatar ${isActive('/dashboard/profile') ? 'active' : ''}`}
          >
            <span className="sidebar-avatar-circle">{initials}</span>
            <span className={`dash-verify-ring ${isVerified ? 'ok' : 'warn'}`} />
            <span>Profile</span>
          </Link>

          <button className="dash-nav-item dash-signout-btn" onClick={handleSignOut}>
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Notification panel */}
      {notifOpen && (
        <div className="notif-panel-anchor">
          <NotificationPanel onClose={() => setNotifOpen(false)} />
        </div>
      )}

      {/* ── Main area ── */}
      <div className="dash-main">
        {/* Minimal topbar — only avatar + bell */}
        <header className="dash-topbar">
          <div className="dash-topbar-right">
            {/* Bell */}
            <div className="notif-btn-wrapper">
              <button
                className={`topbar-icon-btn ${notifOpen ? 'active' : ''}`}
                onClick={() => setNotifOpen(v => !v)}
                title="Notifications"
              >
                <Bell size={22} />
                {unreadCount > 0 && (
                  <span className="notif-count">{unreadCount > 9 ? '9+' : unreadCount}</span>
                )}
              </button>
            </div>

            {/* Avatar */}
            <Link to="/dashboard/profile" className="dash-topbar-avatar" title="Profile">
              {initials}
            </Link>
          </div>
        </header>

        {/* Verification banner (only if not verified) */}
        {!isVerified && (
          <div className="dash-verif-banner">
            <AlertCircle size={15} />
            <span>Verify your email to unlock all features —</span>
            <Link to="/dashboard/profile">Verify now →</Link>
          </div>
        )}

        <main className="dash-content">{children}</main>
      </div>
    </div>
  )
}
