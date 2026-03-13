import { useUser, useClerk } from '@clerk/react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  CreditCard, Bell, LayoutDashboard, ListPlus, Inbox,
  User, LogOut, Menu, X, CheckCircle, AlertCircle
} from 'lucide-react'
import { useState } from 'react'
import { useApp } from '../context/AppContext'
import NotificationPanel from './NotificationPanel'
import './DashboardLayout.css'

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Browse Offers', icon: <LayoutDashboard size={18} />, exact: true },
  { path: '/dashboard/my-listings', label: 'My Listings', icon: <ListPlus size={18} /> },
  { path: '/dashboard/requests', label: 'My Requests', icon: <Inbox size={18} /> },
  { path: '/dashboard/profile', label: 'Profile', icon: <User size={18} /> },
]

export default function DashboardLayout({ children }) {
  const { user } = useUser()
  const { signOut } = useClerk()
  const navigate = useNavigate()
  const location = useLocation()
  const { unreadCount } = useApp()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)

  const isVerified = user?.phoneNumbers?.[0]?.verification?.status === 'verified' &&
                     user?.emailAddresses?.[0]?.verification?.status === 'verified'

  const isActive = (path, exact) => exact
    ? location.pathname === path
    : location.pathname.startsWith(path)

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <div className="dash-shell">
      {/* Sidebar */}
      <aside className={`dash-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="dash-sidebar-header">
          <Link to="/" className="dash-logo">
            <div className="dash-logo-icon"><CreditCard size={16} /></div>
            <span>Cardnect</span>
          </Link>
          <button className="dash-sidebar-close btn-ghost" onClick={() => setSidebarOpen(false)}>
            <X size={18} />
          </button>
        </div>

        {/* Verification Status */}
        <div className={`verification-status ${isVerified ? 'verified' : 'unverified'}`}>
          {isVerified
            ? <><CheckCircle size={14} /> Fully Verified</>
            : <><AlertCircle size={14} /> Verification Incomplete</>
          }
        </div>

        <nav className="dash-nav">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`dash-nav-item ${isActive(item.path, item.exact) ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="dash-sidebar-footer">
          <div className="dash-user">
            <div className="dash-user-avatar">
              {user?.imageUrl
                ? <img src={user.imageUrl} alt="avatar" />
                : <span>{user?.firstName?.[0] || 'U'}</span>
              }
            </div>
            <div className="dash-user-info">
              <p className="dash-user-name">{user?.fullName || 'User'}</p>
              <p className="dash-user-email">{user?.primaryEmailAddress?.emailAddress || ''}</p>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm dash-signout" onClick={handleSignOut}>
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* Main area */}
      <div className="dash-main">
        {/* Top bar */}
        <header className="dash-topbar">
          <button className="btn-ghost dash-menu-btn" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </button>
          <div className="dash-topbar-right">
            <div className="notif-btn-wrapper">
              <button
                id="notifications-btn"
                className={`btn btn-ghost btn-sm notif-btn ${notifOpen ? 'active' : ''}`}
                onClick={() => setNotifOpen(v => !v)}
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="notif-count">{unreadCount > 9 ? '9+' : unreadCount}</span>
                )}
              </button>
              {notifOpen && <NotificationPanel onClose={() => setNotifOpen(false)} />}
            </div>
            <div className="dash-topbar-avatar">
              {user?.imageUrl
                ? <img src={user.imageUrl} alt="avatar" />
                : <span>{user?.firstName?.[0] || 'U'}</span>
              }
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="dash-content">
          {!isVerified && (
            <div className="alert alert-warning" style={{ marginBottom: '20px' }}>
              <AlertCircle size={18} />
              <div>
                <strong>Complete your verification</strong> — You need to verify both your phone number and email to send card requests.
                <Link to="/dashboard/profile" style={{ color: 'inherit', marginLeft: '8px', fontWeight: 600, textDecoration: 'underline' }}>
                  Verify now →
                </Link>
              </div>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  )
}
