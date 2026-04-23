import { Navigate, Outlet } from 'react-router-dom'
import { useAdminAuth } from '../context/AdminAuthContext.jsx'
import { useWorkspace } from '../context/WorkspaceContext.jsx'
import AdminSidebar from './AdminSidebar.jsx'
import styles from '../pages/Dashboard.module.css'

function AdminShellInner() {
  const { pendingRequests } = useWorkspace()

  return (
    <div className={styles.layout}>
      <AdminSidebar pendingCount={pendingRequests.length} />
      <Outlet />
    </div>
  )
}

export default function AdminShell() {
  const { isAdmin } = useAdminAuth()

  if (!isAdmin) {
    return <Navigate to="/admin" replace />
  }

  return <AdminShellInner />
}
