import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useWorkspace } from '../context/WorkspaceContext.jsx'
import { navItems, adminNavItems } from '../data/navigation.js'
import styles from './Sidebar.module.css'

function Icon({ id }) {
  const icons = {
    home: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
    transactions: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 1l4 4-4 4" />
        <path d="M3 11V9a4 4 0 0 1 4-4h14" />
        <path d="m7 23-4-4 4-4" />
        <path d="M21 13v2a4 4 0 0 1-4 4H3" />
      </svg>
    ),
    wallets: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
        <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
        <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
      </svg>
    ),
    cards: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
    settings: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
    admin: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="M16 2v4" />
        <path d="M8 2v4" />
        <path d="M2 10h20" />
        <path d="m9 16 2 2 4-4" />
      </svg>
    ),
  }

  return icons[id] ?? icons.home
}

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const { user } = useAuth()
  const { pendingRequests } = useWorkspace()
  const initials = (user?.displayName || user?.email || 'OC').slice(0, 2).toUpperCase()
  const pendingCount = pendingRequests.length

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
      <div className={styles.logoArea}>
        <div className={styles.logoWrap}>
          <img
            src="/branding/logo-sem-fundo.png"
            alt="Ocean Capital Payment Manager"
            className={styles.logoMark}
          />
          {!collapsed ? (
            <img
              src="/branding/logo-escritos-sem-fundo.png"
              alt="Ocean Capital Payment Manager"
              className={styles.logoTextImage}
            />
          ) : null}
        </div>
        <button className={styles.collapseBtn} onClick={() => setCollapsed((value) => !value)} title={collapsed ? 'Expandir' : 'Recolher'} type="button">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            {collapsed ? <path d="m9 18 6-6-6-6" /> : <path d="m15 18-6-6 6-6" />}
          </svg>
        </button>
      </div>

      <nav className={styles.nav}>
        {navItems.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            end={item.path === '/dashboard'}
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navActive : ''}`}
            title={collapsed ? item.label : ''}
          >
            <span className={styles.navIcon}>
              <Icon id={item.id} />
            </span>
            {!collapsed ? <span className={styles.navLabel}>{item.label}</span> : null}
            {!collapsed && item.badge ? <span className={styles.badge}>{item.badge}</span> : null}
            {collapsed && item.badge ? <span className={styles.badgeDot} /> : null}
          </NavLink>
        ))}

        {/* Divisor Admin */}
        {!collapsed && (
          <div style={{
            margin: '10px 12px 6px',
            fontSize: '0.6rem',
            fontWeight: 600,
            color: 'rgba(232,225,219,0.28)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}>
            Administração
          </div>
        )}

        {adminNavItems.map((item) => {
          const badge = item.id === 'admin' ? pendingCount : item.badge
          return (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navActive : ''}`}
              title={collapsed ? item.label : ''}
            >
              <span className={styles.navIcon}>
                <Icon id={item.id} />
              </span>
              {!collapsed ? <span className={styles.navLabel}>{item.label}</span> : null}
              {!collapsed && badge > 0 ? (
                <span className={styles.badge} style={{ background: 'rgba(245,200,66,0.18)', color: '#f5c842' }}>
                  {badge}
                </span>
              ) : null}
              {collapsed && badge > 0 ? <span className={styles.badgeDot} /> : null}
            </NavLink>
          )
        })}
      </nav>

      {!collapsed ? (
        <div className={styles.userArea}>
          <div className={styles.avatar}>{initials}</div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{user?.displayName || 'Conta local'}</span>
            <span className={styles.userPlan}>
              <span className={styles.planDot} />
              Firebase pronto
            </span>
          </div>
        </div>
      ) : null}
    </aside>
  )
}
