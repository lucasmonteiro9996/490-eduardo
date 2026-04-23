import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../context/AdminAuthContext.jsx'
import styles from './Sidebar.module.css'
import adminStyles from './AdminSidebar.module.css'

const ADMIN_NAV = [
  {
    id: 'inbox',
    label: 'Inbox de Aprovações',
    path: '/admin/inbox',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="M16 2v4M8 2v4M2 10h20" />
        <path d="m9 16 2 2 4-4" />
      </svg>
    ),
  },
  {
    id: 'clients',
    label: 'Gestão de Clientes',
    path: '/admin/clientes',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
]

export default function AdminSidebar({ pendingCount = 0 }) {
  const [collapsed, setCollapsed] = useState(false)
  const { admin, logout } = useAdminAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/admin', { replace: true })
  }

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
      {/* Logo */}
      <div className={styles.logoArea}>
        <div className={styles.logoWrap}>
          <img
            src="/branding/logo-sem-fundo.png"
            alt="Ocean Capital Admin"
            className={styles.logoMark}
          />
          {!collapsed && (
            <img
              src="/branding/logo-escritos-sem-fundo.png"
              alt="Ocean Capital Admin"
              className={styles.logoTextImage}
            />
          )}
        </div>
        <button
          className={styles.collapseBtn}
          onClick={() => setCollapsed((v) => !v)}
          title={collapsed ? 'Expandir' : 'Recolher'}
          type="button"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            {collapsed ? <path d="m9 18 6-6-6-6" /> : <path d="m15 18-6-6 6-6" />}
          </svg>
        </button>
      </div>

      {/* Admin badge */}
      {!collapsed && (
        <div className={adminStyles.adminBanner}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          Painel Administrativo
        </div>
      )}

      {/* Nav */}
      <nav className={styles.nav}>
        {!collapsed && (
          <div className={adminStyles.navSection}>Operações</div>
        )}

        {ADMIN_NAV.map((item) => {
          const badge = item.id === 'inbox' ? pendingCount : 0
          return (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navActive : ''}`}
              title={collapsed ? item.label : ''}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              {!collapsed && <span className={styles.navLabel}>{item.label}</span>}
              {!collapsed && badge > 0 && (
                <span className={styles.badge} style={{ background: 'rgba(245,200,66,0.18)', color: '#f5c842' }}>
                  {badge}
                </span>
              )}
              {collapsed && badge > 0 && <span className={styles.badgeDot} />}
            </NavLink>
          )
        })}
      </nav>

      {/* User area */}
      {!collapsed ? (
        <div className={styles.userArea}>
          <div className={adminStyles.adminAvatar}>⚙</div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{admin?.name ?? 'Administrador'}</span>
            <span className={styles.userPlan}>
              <span className={adminStyles.planDotYellow} />
              {admin?.email ?? 'admin@oceancapital.com'}
            </span>
          </div>
          <button
            className={styles.logoutBtn}
            onClick={handleLogout}
            title="Sair do painel"
            type="button"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
          </button>
        </div>
      ) : (
        <div style={{ padding: '12px 8px', borderTop: '1px solid rgba(61,86,117,0.2)', display: 'flex', justifyContent: 'center' }}>
          <button className={styles.logoutBtn} onClick={handleLogout} title="Sair" type="button">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
          </button>
        </div>
      )}
    </aside>
  )
}
