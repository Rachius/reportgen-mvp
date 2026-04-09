import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useEffect, useState } from 'react'
import { getSubscription } from '../lib/reportApi'
import { getUserConsultations } from '../lib/adminApi'

export default function TabsNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [answeredCount, setAnsweredCount] = useState(0)
  const [plan, setPlan] = useState(null)

  useEffect(() => {
    if (!user) return
    user.getIdTokenResult().then(r => setIsAdmin(!!r.claims.admin)).catch(() => {})
    getSubscription().then(sub => {
      setPlan(sub.plan)
    }).catch(() => {})
    getUserConsultations().then(list => {
      setAnsweredCount(list.filter(c => c.status === 'answered').length)
    }).catch(() => {})
  }, [user])

  const tabs = [
    { to: '/', label: 'Inicio', exact: true },
    { to: '/subscription', label: 'Mi plan', exact: false },
    { to: '/consultations', label: 'Consultas', exact: false, badge: answeredCount > 0 ? answeredCount : null },
    { to: '/profile', label: 'Perfil', exact: false },
    { to: '/about', label: '¿Qué es Reporti?', exact: false },
  ]

  if (isAdmin) {
    tabs.push({ to: '/admin', label: 'Admin', exact: false, small: true })
  }

  const isActive = (tab) => {
    if (tab.exact) return location.pathname === tab.to
    return location.pathname.startsWith(tab.to)
  }

  return (
    <div style={{
      background: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
    }}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center gap-1.5 overflow-x-auto py-2" style={{ scrollbarWidth: 'none' }}>
          {tabs.map(tab => {
            const active = isActive(tab)
            return (
              <button
                key={tab.to}
                onClick={() => navigate(tab.to)}
                className={`tab ${active ? 'tab-active' : ''}`}
                style={{
                  fontSize: tab.small ? '0.72rem' : '0.8rem',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  position: 'relative',
                }}
              >
                {tab.label}
                {tab.badge && (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: 16,
                    height: 16,
                    padding: '0 4px',
                    borderRadius: 999,
                    background: 'var(--orange)',
                    color: '#fff',
                    fontSize: '0.6rem',
                    fontWeight: 700,
                    marginLeft: 4,
                  }}>
                    {tab.badge}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
