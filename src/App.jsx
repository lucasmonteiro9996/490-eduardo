import { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import { AdminAuthProvider } from './context/AdminAuthContext.jsx'
import { WorkspaceProvider } from './context/WorkspaceContext.jsx'
import { ToastProvider } from './components/Toast.jsx'
import AppShell from './components/AppShell.jsx'
import AdminShell from './components/AdminShell.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

const AuthPage = lazy(() => import('./pages/AuthPage.jsx'))
const WorkspacePage = lazy(() => import('./pages/WorkspacePage.jsx'))
const AdminLoginPage = lazy(() => import('./pages/AdminLoginPage.jsx'))
const AdminPage = lazy(() => import('./pages/AdminPage.jsx'))
const AdminClients = lazy(() => import('./pages/AdminClients.jsx'))

function RouteFallback() {
  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', color: 'var(--light-main)' }}>
      Carregando painel...
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AdminAuthProvider>
        <WorkspaceProvider>
          <ToastProvider>
            <Suspense fallback={<RouteFallback />}>
              <Routes>
                <Route path="/" element={<AuthPage />} />
                <Route
                  path="/dashboard"
                  element={(
                    <ProtectedRoute>
                      <AppShell />
                    </ProtectedRoute>
                  )}
                >
                  <Route index element={<WorkspacePage pageKey="home" />} />
                  <Route path="transacoes" element={<WorkspacePage pageKey="transactions" />} />
                  <Route path="carteiras" element={<WorkspacePage pageKey="wallets" />} />
                  <Route path="cartoes" element={<WorkspacePage pageKey="cards" />} />
                  <Route path="configuracoes" element={<WorkspacePage pageKey="settings" />} />
                </Route>

                <Route path="/admin" element={<AdminLoginPage />} />
                <Route path="/admin/*" element={<AdminShell />}>
                  <Route path="inbox" element={<AdminPage />} />
                  <Route path="clientes" element={<AdminClients />} />
                </Route>

                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Suspense>
          </ToastProvider>
        </WorkspaceProvider>
      </AdminAuthProvider>
    </AuthProvider>
  )
}
