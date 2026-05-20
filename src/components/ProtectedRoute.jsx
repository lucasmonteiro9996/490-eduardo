import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import AccountStatusGate from './AccountStatusGate.jsx'

export default function ProtectedRoute({ children }) {
  const { user, loading, hasFirebaseConfig, demoMode, accountProfile, profileLoading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', color: 'var(--light-main)' }}>Carregando...</div>
  }

  if (!hasFirebaseConfig || demoMode) {
    return <AccountStatusGate>{children}</AccountStatusGate>
  }

  if (!user) {
    return <Navigate to="/" replace state={{ from: location }} />
  }

  const accountApproved = accountProfile?.status === 'active'
  if (!profileLoading && !user.emailVerified && !accountApproved) {
    return <Navigate to="/" replace />
  }

  return <AccountStatusGate>{children}</AccountStatusGate>
}
