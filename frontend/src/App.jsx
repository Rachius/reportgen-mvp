import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { useState, useEffect } from 'react'
import Home from './pages/Home'
import Login from './pages/Login'
import Profile from './pages/Profile'
import Subscription from './pages/Subscription'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'
import AdminConsultations from './pages/admin/AdminConsultations'
import AdminReports from './pages/admin/AdminReports'
import Consultations from './pages/Consultations'

function ProtectedRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }) {
  const { user } = useAuth()
  return !user ? children : <Navigate to="/" replace />
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
  return isAdmin ? children : <Navigate to="/" replace />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={
        <PublicRoute><Login /></PublicRoute>
      } />
      <Route path="/" element={
        <ProtectedRoute><Home /></ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute><Profile /></ProtectedRoute>
      } />
      <Route path="/subscription" element={<ProtectedRoute><Subscription /></ProtectedRoute>} />
      <Route path="/subscription/success" element={<ProtectedRoute><Subscription /></ProtectedRoute>} />
      <Route path="/subscription/cancel" element={<ProtectedRoute><Subscription /></ProtectedRoute>} />
      <Route path="/subscription/pending" element={<ProtectedRoute><Subscription /></ProtectedRoute>} />
      <Route path="/consultations" element={<ProtectedRoute><Consultations /></ProtectedRoute>} />
      <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
      <Route path="/admin/consultations" element={<AdminRoute><AdminConsultations /></AdminRoute>} />
      <Route path="/admin/reports" element={<AdminRoute><AdminReports /></AdminRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
