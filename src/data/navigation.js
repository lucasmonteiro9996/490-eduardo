export const navItems = [
  { id: 'home', label: 'Início', path: '/dashboard', badge: null },
  { id: 'transactions', label: 'Transações', path: '/dashboard/transacoes', badge: 3 },
  { id: 'wallets', label: 'Carteiras', path: '/dashboard/carteiras', badge: null },
  { id: 'cards', label: 'Cartões', path: '/dashboard/cartoes', badge: null },
  { id: 'settings', label: 'Configurações', path: '/dashboard/configuracoes', badge: null },
]

// Navegação admin removida da sidebar do cliente.
// O painel administrativo fica em /admin/* com login próprio.
export const adminNavItems = []
