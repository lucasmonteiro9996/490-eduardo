import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'
import { WorkspaceProvider } from '../context/WorkspaceContext.jsx'
import styles from '../pages/Dashboard.module.css'

export default function AppShell() {
  return (
    <WorkspaceProvider>
      <div className={styles.layout}>
        <Sidebar />
        <Outlet />
      </div>
    </WorkspaceProvider>
  )
}
