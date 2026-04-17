export const mockWallets = [
  { id: 'brl', symbol: 'BRL', name: 'Real Brasileiro', native: 18600, change: '+0,4%', up: true, color: '#3ecf8e' },
  { id: 'usd', symbol: 'USD', name: 'Dolar Americano', native: 9450, change: '+0,2%', up: true, color: '#4a7fdb' },
]

export const mockTransactions = [
  { id: 'tx-1', type: 'receive', label: 'Deposito em Dolar', from: 'Transferencia internacional', amount: '+$2,500.00', time: 'Hoje, 14:32', status: 'completed' },
  { id: 'tx-2', type: 'send', label: 'Transferencia PIX', from: 'Para: Joao Silva', amount: '-R$850,00', time: 'Hoje, 11:15', status: 'completed' },
  { id: 'tx-3', type: 'exchange', label: 'Cambio USD para BRL', from: 'Taxa: 0,5%', amount: '+R$3.012,00', time: 'Ontem, 18:44', status: 'completed' },
  { id: 'tx-4', type: 'send', label: 'Pagamento Cartao', from: 'Assinatura Premium', amount: '-R$214,50', time: 'Ontem, 09:20', status: 'pending' },
  { id: 'tx-5', type: 'receive', label: 'Deposito em Real', from: 'Boleto bancario', amount: '+R$1.200,00', time: '15/04, 10:05', status: 'completed' },
  { id: 'tx-6', type: 'exchange', label: 'Cambio BRL para USD', from: 'Taxa: 0,5%', amount: '+$420.00', time: '13/04, 16:40', status: 'completed' },
]

export const mockCards = [
  { id: 'card-1', brand: 'Mastercard Black', holder: 'LUCAS MONTEIRO', number: '5412 7534 8891 4402', valid: '12/28', cvv: '***', currency: 'BRL', limit: 'R$ 25.000', status: 'Ativo' },
  { id: 'card-2', brand: 'Mastercard Platinum', holder: 'LUCAS MONTEIRO', number: '5284 9912 4456 1908', valid: '09/27', cvv: '***', currency: 'USD', limit: '$ 8.500', status: 'Ativo' },
]

export const mockRates = [
  { id: 'rate-1', pair: 'USD/BRL', value: 'R$ 5,08', change: '+0,12%' },
  { id: 'rate-2', pair: 'BRL/USD', value: '$ 0,197', change: '-0,10%' },
]

export const mockSecurityEvents = [
  { id: 'sec-1', title: 'Verificacao em duas etapas', description: 'Sua conta esta protegida por autenticacao adicional no login.' },
  { id: 'sec-2', title: 'Ultimo acesso', description: 'Login realizado em Sao Paulo, Brasil.' },
]

export const mockSettings = [
  { id: 'set-1', label: 'Moeda padrao', value: 'BRL' },
  { id: 'set-2', label: 'Moeda secundaria', value: 'USD' },
  { id: 'set-3', label: 'Idioma da conta', value: 'Portugues (Brasil)' },
  { id: 'set-4', label: 'Notificacoes', value: 'Email e push' },
]
