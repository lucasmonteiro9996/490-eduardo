import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import { AdminAuthProvider } from './context/AdminAuthContext.jsx'
import { WorkspaceProvider } from './context/WorkspaceContext.jsx'
import { ToastProvider } from './components/Toast.jsx'
import AppShell from './components/AppShell.jsx'
import AdminShell from './components/AdminShell.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import AuthPage from './pages/AuthPage.jsx'
import WorkspacePage from './pages/WorkspacePage.jsx'
import AdminLoginPage from './pages/AdminLoginPage.jsx'
import AdminPage from './pages/AdminPage.jsx'
import AdminClients from './pages/AdminClients.jsx'

export default function App() {
  return (
    <AuthProvider>
      <AdminAuthProvider>
        <WorkspaceProvider>
          <ToastProvider>
            <Routes>
              {/* ── Área do cliente ── */}
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

              {/* ── Área administrativa (isolada) ── */}
              <Route path="/admin" element={<AdminLoginPage />} />
              <Route path="/admin/*" element={<AdminShell />}>
                <Route path="inbox"    element={<AdminPage />} />
                <Route path="clientes" element={<AdminClients />} />
              </Route>

              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </ToastProvider>
        </WorkspaceProvider>
      </AdminAuthProvider>
    </AuthProvider>
  )
}
