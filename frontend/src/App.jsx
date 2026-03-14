import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthContext } from './context/AuthContext'
import LandingPage from './pages/LandingPage.jsx'
import AuthPage from './pages/AuthPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import './App.css'

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuthContext()
  if (isLoading) return <div className="page-loader"><div className="loader-spinner" /></div>
  if (!isAuthenticated) return <Navigate to="/auth" replace />
  return children
}

function PublicOnlyRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuthContext()
  if (!isLoading && isAuthenticated) return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth/*" element={
          <PublicOnlyRoute>
            <AuthPage />
          </PublicOnlyRoute>
        } />
        <Route path="/dashboard/*" element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
