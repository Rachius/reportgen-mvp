import { NavLink, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { getConsultations } from '../../lib/adminApi'

const NAV_ITEMS = [
  {
    to: '/admin',
    label: 'Dashboard',
    end: true,
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
  },
  {
    to: '/admin/users',
    label: 'Usuarios',
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
  },
  {
    to: '/admin/consultations',
    label: 'Consultas',
    hasBadge: true,
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
      </svg>
    ),
  },
  {
    to: '/admin/reports',
    label: 'Reportes',
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
  },
]

const SECTION_TITLES = {
  '/admin': 'Dashboard',
  '/admin/users': 'Usuarios',
  '/admin/consultations': 'Consultas',
  '/admin/reports': 'Reportes',
}

// Sidebar always dark, independent of theme
const S = {
  sidebar: {
    width: 220,
    background: '#1A2332',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    minHeight: '100vh',
    position: 'sticky',
    top: 0,
    alignSelf: 'flex-start',
  },
  sidebarHeader: {
    padding: '1.25rem 1.25rem 1rem',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  logo: { color: '#E8F0F8', fontWeight: 700, fontSize: '1rem' },
  adminBadge: {
    background: 'rgba(78,199,245,0.2)',
    color: '#4EC7F5',
    border: '1px solid rgba(78,199,245,0.3)',
    borderRadius: 3,
    padding: '1px 7px',
    fontSize: '0.65rem',
    fontWeight: 700,
  },
  nav: { flex: 1, padding: '0.75rem 0.625rem', display: 'flex', flexDirection: 'column', gap: 2 },
  navItem: (isActive) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '0.5rem 0.75rem',
    borderRadius: 3,
    fontSize: '0.8rem',
    fontWeight: 500,
    textDecoration: 'none',
    transition: 'all 0.15s',
    background: isActive ? '#FE7808' : 'transparent',
    color: isActive ? '#fff' : '#7A9AB8',
  }),
  footer: {
    padding: '1rem 1.25rem',
    borderTop: '1px solid rgba(255,255,255,0.08)',
  },
  backLink: {
    color: '#4A6078',
    fontSize: '0.75rem',
    textDecoration: 'none',
    transition: 'color 0.15s',
  },
  main: { flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: '100vh', background: '#0F1923' },
  header: {
    padding: '1rem 2rem',
    borderBottom: '1px solid rgba(255,255,255,0.07)',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: '#162030',
  },
  headerTitle: { color: '#E8F0F8', fontWeight: 700, fontSize: '1rem' },
  headerBadge: {
    background: 'rgba(78,199,245,0.15)',
    color: '#4EC7F5',
    border: '1px solid rgba(78,199,245,0.25)',
    borderRadius: 999,
    padding: '2px 10px',
    fontSize: '0.7rem',
    fontWeight: 600,
  },
  content: { flex: 1, padding: '2rem', overflowAuto: 'auto' },
}

export default function AdminLayout({ children }) {
  const { pathname } = useLocation()
  const title = SECTION_TITLES[pathname] ?? 'Admin'
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    getConsultations().then(list => {
      setPendingCount(list.filter(c => c.status === 'pending').length)
    }).catch(() => {})
  }, [])

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={S.sidebar}>
        <div style={S.sidebarHeader}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4EC7F5', flexShrink: 0 }} />
          <span style={S.logo}>Reporti</span>
          <span style={S.adminBadge}>Admin</span>
        </div>

        <nav style={S.nav}>
          {NAV_ITEMS.map(({ to, label, icon, end, hasBadge }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              style={({ isActive }) => S.navItem(isActive)}
              onMouseEnter={e => {
                if (e.currentTarget.style.background !== 'rgb(254, 120, 8)') {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                  e.currentTarget.style.color = '#E8F0F8'
                }
              }}
              onMouseLeave={e => {
                if (e.currentTarget.style.background !== 'rgb(254, 120, 8)') {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = '#7A9AB8'
                }
              }}
            >
              {icon}
              <span style={{ flex: 1 }}>{label}</span>
              {hasBadge && pendingCount > 0 && (
                <span style={{
                  minWidth: 18,
                  height: 18,
                  background: '#FE7808',
                  color: '#fff',
                  borderRadius: 999,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.62rem',
                  fontWeight: 700,
                  padding: '0 4px',
                }}>
                  {pendingCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div style={S.footer}>
          <NavLink to="/" style={S.backLink}
            onMouseEnter={e => e.currentTarget.style.color = '#7A9AB8'}
            onMouseLeave={e => e.currentTarget.style.color = '#4A6078'}
          >
            ← Volver a la app
          </NavLink>
        </div>
      </aside>

      {/* Main */}
      <div style={S.main}>
        <header style={S.header}>
          <h1 style={S.headerTitle}>{title}</h1>
          <span style={S.headerBadge}>Admin</span>
        </header>
        <main style={{ flex: 1, padding: '2rem', overflow: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
