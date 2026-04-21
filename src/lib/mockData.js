export const mockWallets = [
  { id: 'brl', symbol: 'BRL', name: 'Real Brasileiro', native: 18600, change: '+0,4%', up: true, color: '#3ecf8e' },
  { id: 'usd', symbol: 'USD', name: 'Dólar americano', native: 9450, change: '+0,2%', up: true, color: '#4a7fdb' },
]

export const mockTransactions = [
  { id: 'tx-1', type: 'receive', label: 'Depósito em dólar', from: 'Transferência internacional', amount: '+$2,500.00', time: 'Hoje, 14:32', status: 'completed' },
  { id: 'tx-2', type: 'send', label: 'Transferência via PIX', from: 'Para: João Silva', amount: '-R$850,00', time: 'Hoje, 11:15', status: 'completed' },
  { id: 'tx-3', type: 'exchange', label: 'Câmbio de USD para BRL', from: 'Taxa: 0,5%', amount: '+R$3.012,00', time: 'Ontem, 18:44', status: 'completed' },
  { id: 'tx-4', type: 'send', label: 'Pagamento do cartão', from: 'Assinatura premium', amount: '-R$214,50', time: 'Ontem, 09:20', status: 'pending' },
  { id: 'tx-5', type: 'receive', label: 'Depósito em real', from: 'Boleto bancário', amount: '+R$1.200,00', time: '15/04, 10:05', status: 'completed' },
  { id: 'tx-6', type: 'exchange', label: 'Câmbio de BRL para USD', from: 'Taxa: 0,5%', amount: '+$420.00', time: '13/04, 16:40', status: 'completed' },
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
  { id: 'sec-1', title: 'Verificação em duas etapas', description: 'Sua conta está protegida por autenticação adicional no login.' },
  { id: 'sec-2', title: 'Último acesso', description: 'Login realizado em São Paulo, Brasil.' },
]

export const mockSettings = [
  { id: 'set-1', label: 'Moeda padrão', value: 'BRL' },
  { id: 'set-2', label: 'Moeda secundária', value: 'USD' },
  { id: 'set-3', label: 'Idioma da conta', value: 'Português (Brasil)' },
  { id: 'set-4', label: 'Notificações', value: 'E-mail e push' },
]
