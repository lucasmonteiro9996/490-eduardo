export const mockWallets = [
  { id: 'usdt', symbol: 'USDT', name: 'Tether USD', amount: '12,840.50', usd: 12840.5, change: '+2.3%', up: true, color: '#26a17b' },
  { id: 'usdc', symbol: 'USDC', name: 'USD Coin', amount: '5,210.00', usd: 5210, change: '+0.8%', up: true, color: '#2775ca' },
  { id: 'brl', symbol: 'BRL', name: 'Real Brasileiro', amount: '18.600,00', usd: 3720, change: '-0.4%', up: false, color: '#3ecf8e' },
  { id: 'btc', symbol: 'BTC', name: 'Bitcoin', amount: '0.1842', usd: 11230, change: '+5.1%', up: true, color: '#f7931a' },
]

export const mockTransactions = [
  { id: 'tx-1', type: 'receive', label: 'Deposito USDT', from: 'Binance Exchange', amount: '+$2,500.00', time: 'Hoje, 14:32', status: 'completed' },
  { id: 'tx-2', type: 'send', label: 'Transferencia PIX', from: 'Para: Joao Silva', amount: '-R$850.00', time: 'Hoje, 11:15', status: 'completed' },
  { id: 'tx-3', type: 'exchange', label: 'Cambio USDC para BRL', from: 'Taxa: 0.1%', amount: '+R$3,012.00', time: 'Ontem, 18:44', status: 'completed' },
  { id: 'tx-4', type: 'send', label: 'Pagamento Cartao', from: 'Assinatura Premium', amount: '-R$214.50', time: 'Ontem, 09:20', status: 'pending' },
]

export const mockCards = [
  { id: 'card-1', brand: 'Visa Infinite', last4: '4402', limit: 'R$ 25.000', status: 'Ativo' },
  { id: 'card-2', brand: 'Virtual Stable', last4: '1908', limit: 'R$ 8.500', status: 'Congelado' },
]

export const mockRates = [
  { id: 'rate-1', pair: 'USDT/BRL', value: 'R$ 5,08', change: '+0,12%' },
  { id: 'rate-2', pair: 'USDC/BRL', value: 'R$ 5,07', change: '+0,09%' },
  { id: 'rate-3', pair: 'BTC/USDT', value: '$ 84.210', change: '+1,84%' },
]

export const mockSecurityEvents = [
  { id: 'sec-1', title: '2FA habilitado', description: 'Sua conta esta protegida por autenticacao em duas etapas.' },
  { id: 'sec-2', title: 'Ultimo acesso', description: 'Login realizado em Sao Paulo, Brasil.' },
]

export const mockSettings = [
  { id: 'set-1', label: 'Moeda padrao', value: 'BRL' },
  { id: 'set-2', label: 'Idioma da conta', value: 'Portugues (Brasil)' },
  { id: 'set-3', label: 'Notificacoes', value: 'Email e push' },
]
