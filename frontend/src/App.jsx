import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { useState, useEffect } from 'react'
import Landing from './pages/Landing'
import Home from './pages/Home'
import Login from './pages/Login'
import Profile from './pages/Profile'
import Subscription from './pages/Subscription'
import Consultations from './pages/Consultations'
import AboutPage from './pages/AboutPage'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'
import AdminConsultations from './pages/admin/AdminConsultations'
import AdminReports from './pages/admin/AdminReports'

function ProtectedRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }) {
  const { user } = useAuth()
  return !user ? children : <Navigate to="/home" replace />
}

function LandingRoute({ children }) {
  const { user } = useAuth()
  // Landing: visible para no autenticados; redirige a /home si ya está logueado
  return !user ? children : <Navigate to="/home" replace />
}

function AdminRoute({ children }) {
  const { user } = useAuth()
  const [isAdmin, setIsAdmin] = useState(null)

  useEffect(() => {
    if (user) {
      user.getIdTokenResult().then(result => {
        setIsAdmin(!!result.claims.admin)
      })
    } else {
      setIsAdmin(false)
    }
  }, [user])

  if (isAdmin === null) return null
  return isAdmin ? children : <Navigate to="/home" replace />
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/"      element={<LandingRoute><Landing /></LandingRoute>} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />

      {/* Protected app */}
      <Route path="/home"         element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/profile"      element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/subscription" element={<ProtectedRoute><Subscription /></ProtectedRoute>} />
      <Route path="/subscription/success" element={<ProtectedRoute><Subscription /></ProtectedRoute>} />
      <Route path="/subscription/cancel"  element={<ProtectedRoute><Subscription /></ProtectedRoute>} />
      <Route path="/subscription/pending" element={<ProtectedRoute><Subscription /></ProtectedRoute>} />
      <Route path="/consultations" element={<ProtectedRoute><Consultations /></ProtectedRoute>} />
      <Route path="/about"         element={<ProtectedRoute><AboutPage /></ProtectedRoute>} />

      {/* Admin */}
      <Route path="/admin"                element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="/admin/users"          element={<AdminRoute><AdminUsers /></AdminRoute>} />
      <Route path="/admin/consultations"  element={<AdminRoute><AdminConsultations /></AdminRoute>} />
      <Route path="/admin/reports"        element={<AdminRoute><AdminReports /></AdminRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}
