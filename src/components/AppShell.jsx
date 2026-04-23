import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'
import styles from '../pages/Dashboard.module.css'

export default function AppShell() {
  return (
    <div className={styles.layout}>
      <Sidebar />
      <Outlet />
    </div>
  )
}
