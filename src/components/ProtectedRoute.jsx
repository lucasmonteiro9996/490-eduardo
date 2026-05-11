import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function ProtectedRoute({ children }) {
  const { user, loading, hasFirebaseConfig, demoMode } = useAuth()
  const location = useLocation()

  if (loading) {
    return <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', color: 'var(--light-main)' }}>Carregando...</div>
  }

  if (!hasFirebaseConfig || demoMode) {
    return children
  }

  if (!user) {
    return <Navigate to="/" replace state={{ from: location }} />
  }

  if (!user.emailVerified) {
    return <Navigate to="/" replace />
  }

  return children
}
