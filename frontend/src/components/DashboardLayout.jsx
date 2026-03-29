import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  CreditCard, Bell, LayoutDashboard, ListPlus, Inbox,
  User, LogOut, AlertCircle, Home, ShoppingBag
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

const MOBILE_ICONS = [Home, ShoppingBag, Inbox, User];

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

      {/* ── Floating icon sidebar (Desktop) ── */}
      <aside className="dash-sidebar desktop-only">
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

      {/* ── Mobile Bottom Navigation ── */}
      <nav className="mobile-nav-bar mobile-only">
        <div className="mobile-nav-inner">
          {/* Main Nav Items (using specific MOBILE_ICONS to match reference) */}
          {NAV_ITEMS.map(({ path, exact }, index) => {
             const active = isActive(path, exact);
             const Icon = MOBILE_ICONS[index];
             return (
               <Link
                 key={path}
                 to={path}
                 className={`mobile-nav-item ${active ? 'active' : ''}`}
                 onClick={() => setNotifOpen(false)}
               >
                 <div className="mobile-nav-icon-wrapper">
                    <Icon size={24} />
                 </div>
               </Link>
             );
          })}
          
          {/* Active Liquid Indicator / Droplet */}
          <div 
            className="mobile-nav-indicator" 
            style={{ 
              left: `calc(${(NAV_ITEMS.findIndex(item => isActive(item.path, item.exact)))} * (100% / ${NAV_ITEMS.length}))` 
            }}
          >
            <div className="indicator-droplet">
               <div className="droplet-glow"></div>
            </div>
          </div>
        </div>
      </nav>

      {/* Notification panel */}
      {notifOpen && (
        <div className="notif-panel-anchor">
          <NotificationPanel onClose={() => setNotifOpen(false)} />
        </div>
      )}

      {/* ── Main area ── */}
      <div className="dash-main">
        {/* Topbar: Added Logout and Notifications for mobile */}
        <header className="dash-topbar">
          <div className="dash-topbar-right">
            {/* Bell (Always visible now) */}
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

            {/* Logout (Visible on mobile topbar) */}
            <button 
              className="topbar-icon-btn mobile-only" 
              onClick={handleSignOut}
              title="Sign Out"
            >
              <LogOut size={20} className="logout-icon-mobile" />
            </button>

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
