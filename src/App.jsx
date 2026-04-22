import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import { ToastProvider } from './components/Toast.jsx'
import AppShell from './components/AppShell.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import AuthPage from './pages/AuthPage.jsx'
import WorkspacePage from './pages/WorkspacePage.jsx'
import AdminPage from './pages/AdminPage.jsx'

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
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
            <Route path="admin" element={<AdminPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </ToastProvider>
    </AuthProvider>
  )
}
