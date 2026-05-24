// ── Dados mockados de clientes para o painel de administração ──────────────

export const MOCK_CLIENTS = [
  {
    id: 'cli-001',
    name: 'Lucas Monteiro',
    email: 'lucas.monteiro9996@gmail.com',
    phone: '+55 11 98765-4321',
    joinedAt: '12/01/2024',
    status: 'active',
    tier: 'Premium',
    avatarInitials: 'LM',
    avatarColor: '#4a7fdb',
    wallets: [
      { symbol: 'BRL', name: 'Real brasileiro', native: 18600.0, color: '#3ecf8e' },
      { symbol: 'USD', name: 'Dólar americano', native: 9450.0, color: '#4a7fdb' },
    ],
    transactions: [
      { id: 'tx-001', type: 'receive', label: 'Depósito em dólar', from: 'Transferência internacional', amount: '+$2,500.00', currency: 'USD', native: 2500, time: 'Hoje, 14:32', status: 'completed' },
      { id: 'tx-002', type: 'send', label: 'Transferência via TED', from: 'Para: João Silva', amount: '-R$850,00', currency: 'BRL', native: -850, time: 'Hoje, 11:15', status: 'completed' },
      { id: 'tx-003', type: 'exchange', label: 'Câmbio USD → BRL', from: 'Taxa: 0.5%', amount: '+R$3.012,00', currency: 'BRL', native: 3012, time: 'Ontem, 18:44', status: 'completed' },
      { id: 'tx-004', type: 'send', label: 'Pagamento conta de luz', from: 'Energisa SP', amount: '-R$214,50', currency: 'BRL', native: -214.5, time: 'Ontem, 09:20', status: 'completed' },
      { id: 'tx-005', type: 'receive', label: 'Depósito em real', from: 'Boleto bancário', amount: '+R$1.200,00', currency: 'BRL', native: 1200, time: '13/04, 16:00', status: 'completed' },
      { id: 'tx-006', type: 'send', label: 'Transferência internacional', from: 'Para: conta em Miami', amount: '-$1,200.00', currency: 'USD', native: -1200, time: '12/04, 21:10', status: 'pending' },
      { id: 'tx-007', type: 'exchange', label: 'Câmbio BRL → USD', from: 'Taxa: 0.5%', amount: '+$420.00', currency: 'USD', native: 420, time: '11/04, 08:55', status: 'completed' },
    ],
  },
  {
    id: 'cli-002',
    name: 'Fernanda Costa',
    email: 'fernanda.costa@gmail.com',
    phone: '+55 21 97654-3210',
    joinedAt: '03/03/2024',
    status: 'active',
    tier: 'Standard',
    avatarInitials: 'FC',
    avatarColor: '#3ecf8e',
    wallets: [
      { symbol: 'BRL', name: 'Real brasileiro', native: 5420.75, color: '#3ecf8e' },
      { symbol: 'USD', name: 'Dólar americano', native: 1230.0, color: '#4a7fdb' },
    ],
    transactions: [
      { id: 'tx-101', type: 'receive', label: 'Depósito em real', from: 'TED bancário', amount: '+R$5.000,00', currency: 'BRL', native: 5000, time: '20/04, 10:00', status: 'completed' },
      { id: 'tx-102', type: 'send', label: 'Saque via TED', from: 'Conta bancária cadastrada', amount: '-R$1.200,00', currency: 'BRL', native: -1200, time: '19/04, 15:30', status: 'completed' },
      { id: 'tx-103', type: 'exchange', label: 'Câmbio BRL → USD', from: 'Taxa: 0.5%', amount: '+$230.00', currency: 'USD', native: 230, time: '18/04, 09:11', status: 'completed' },
      { id: 'tx-104', type: 'send', label: 'Pagamento de streaming', from: 'Netflix BR', amount: '-R$55,90', currency: 'BRL', native: -55.9, time: '15/04, 12:00', status: 'completed' },
      { id: 'tx-105', type: 'receive', label: 'Depósito em dólar', from: 'Wire transfer EUA', amount: '+$1.000,00', currency: 'USD', native: 1000, time: '10/04, 17:45', status: 'completed' },
    ],
  },
  {
    id: 'cli-003',
    name: 'Rafael Oliveira',
    email: 'rafael.oliveira@hotmail.com',
    phone: '+55 31 96543-2109',
    joinedAt: '17/06/2023',
    status: 'active',
    tier: 'Premium',
    avatarInitials: 'RO',
    avatarColor: '#a78bfa',
    wallets: [
      { symbol: 'BRL', name: 'Real brasileiro', native: 42800.0, color: '#3ecf8e' },
      { symbol: 'USD', name: 'Dólar americano', native: 21000.0, color: '#4a7fdb' },
    ],
    transactions: [
      { id: 'tx-201', type: 'receive', label: 'Depósito em dólar', from: 'Payoneer', amount: '+$8.000,00', currency: 'USD', native: 8000, time: 'Hoje, 08:15', status: 'completed' },
      { id: 'tx-202', type: 'exchange', label: 'Câmbio USD → BRL', from: 'Taxa: 0.5%', amount: '+R$38.400,00', currency: 'BRL', native: 38400, time: 'Ontem, 22:30', status: 'completed' },
      { id: 'tx-203', type: 'send', label: 'TED para corretora', from: 'XP Investimentos', amount: '-R$20.000,00', currency: 'BRL', native: -20000, time: '21/04, 14:00', status: 'completed' },
      { id: 'tx-204', type: 'receive', label: 'Reembolso freelance', from: 'Upwork LLC', amount: '+$3.500,00', currency: 'USD', native: 3500, time: '18/04, 11:22', status: 'completed' },
      { id: 'tx-205', type: 'send', label: 'Saque BRL', from: 'TED — Conta pessoal', amount: '-R$5.000,00', currency: 'BRL', native: -5000, time: '15/04, 09:00', status: 'completed' },
      { id: 'tx-206', type: 'exchange', label: 'Câmbio BRL → USD', from: 'Taxa: 0.5%', amount: '+$1.200,00', currency: 'USD', native: 1200, time: '12/04, 16:45', status: 'completed' },
    ],
  },
  {
    id: 'cli-004',
    name: 'Camila Santos',
    email: 'camila.santos@outlook.com',
    phone: '+55 85 95432-1098',
    joinedAt: '22/09/2024',
    status: 'suspended',
    tier: 'Standard',
    avatarInitials: 'CS',
    avatarColor: '#f97316',
    wallets: [
      { symbol: 'BRL', name: 'Real brasileiro', native: 320.0, color: '#3ecf8e' },
      { symbol: 'USD', name: 'Dólar americano', native: 0.0, color: '#4a7fdb' },
    ],
    transactions: [
      { id: 'tx-301', type: 'receive', label: 'Depósito inicial', from: 'Boleto bancário', amount: '+R$1.000,00', currency: 'BRL', native: 1000, time: '22/09, 10:00', status: 'completed' },
      { id: 'tx-302', type: 'send', label: 'Tentativa de saque', from: 'TED — recusado', amount: '-R$900,00', currency: 'BRL', native: -900, time: '25/09, 18:00', status: 'rejected' },
      { id: 'tx-303', type: 'send', label: 'Taxa administrativa', from: 'Sistema interno', amount: '-R$12,50', currency: 'BRL', native: -12.5, time: '01/10, 00:01', status: 'completed' },
    ],
  },
  {
    id: 'cli-005',
    name: 'Pedro Almeida',
    email: 'pedro.almeida@empresa.com.br',
    phone: '+55 47 94321-0987',
    joinedAt: '05/11/2023',
    status: 'active',
    tier: 'Corporate',
    avatarInitials: 'PA',
    avatarColor: '#f5c842',
    wallets: [
      { symbol: 'BRL', name: 'Real brasileiro', native: 198500.0, color: '#3ecf8e' },
      { symbol: 'USD', name: 'Dólar americano', native: 85000.0, color: '#4a7fdb' },
    ],
    transactions: [
      { id: 'tx-401', type: 'receive', label: 'Recebimento de exportação', from: 'SWIFT — Germany', amount: '+$40.000,00', currency: 'USD', native: 40000, time: 'Hoje, 06:30', status: 'completed' },
      { id: 'tx-402', type: 'exchange', label: 'Câmbio USD → BRL', from: 'Taxa: 0.4%', amount: '+R$192.000,00', currency: 'BRL', native: 192000, time: 'Hoje, 07:00', status: 'completed' },
      { id: 'tx-403', type: 'send', label: 'Pagamento fornecedor', from: 'TED — Indústria MT', amount: '-R$85.000,00', currency: 'BRL', native: -85000, time: 'Ontem, 13:00', status: 'completed' },
      { id: 'tx-404', type: 'send', label: 'Remessa internacional', from: 'SWIFT — USA', amount: '-$15.000,00', currency: 'USD', native: -15000, time: '20/04, 09:45', status: 'completed' },
      { id: 'tx-405', type: 'receive', label: 'Recebimento de clientes', from: 'TED múltiplos', amount: '+R$74.000,00', currency: 'BRL', native: 74000, time: '18/04, 17:30', status: 'completed' },
      { id: 'tx-406', type: 'exchange', label: 'Câmbio BRL → USD', from: 'Taxa: 0.4%', amount: '+$9.800,00', currency: 'USD', native: 9800, time: '15/04, 11:20', status: 'completed' },
      { id: 'tx-407', type: 'send', label: 'Pagamento salários', from: 'Folha — Apr/2025', amount: '-R$62.000,00', currency: 'BRL', native: -62000, time: '05/04, 08:00', status: 'completed' },
    ],
  },
  {
    id: 'cli-006',
    name: 'Juliana Ferreira',
    email: 'juliana.ferreira@gmail.com',
    phone: '+55 51 93210-9876',
    joinedAt: '14/02/2025',
    status: 'pending',
    tier: 'Standard',
    avatarInitials: 'JF',
    avatarColor: '#34d8b6',
    wallets: [
      { symbol: 'BRL', name: 'Real brasileiro', native: 0.0, color: '#3ecf8e' },
      { symbol: 'USD', name: 'Dólar americano', native: 0.0, color: '#4a7fdb' },
    ],
    transactions: [],
  },
]

export function getClientTotalUSD(client, brlToUsd = 1 / 5.75) {
  const brl = client.wallets.find((w) => w.symbol === 'BRL')?.native || 0
  const usd = client.wallets.find((w) => w.symbol === 'USD')?.native || 0
  const rate = brlToUsd > 0 ? brlToUsd : 1 / 5.75
  return Math.max(usd, brl * rate)
}

const COMPACT_AMOUNT_THRESHOLD = 1_000_000

export function formatNative(native, symbol) {
  const abs = Math.abs(native)
  if (symbol === 'BRL') {
    return `R$ ${abs.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }
  return `$ ${abs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function formatCompactUSD(value) {
  const amount = Number(value) || 0
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: Math.abs(amount) >= 1e9 ? 2 : 1,
  }).format(amount)
}

export function formatCompactNative(native, symbol) {
  const amount = Number(native) || 0
  const locale = symbol === 'BRL' ? 'pt-BR' : 'en-US'
  const currency = symbol === 'BRL' ? 'BRL' : 'USD'
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    notation: 'compact',
    maximumFractionDigits: Math.abs(amount) >= 1e9 ? 2 : 1,
  }).format(amount)
}

export function formatUSDDisplay(value) {
  const amount = Number(value) || 0
  if (Math.abs(amount) >= COMPACT_AMOUNT_THRESHOLD) return formatCompactUSD(amount)
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatNativeDisplay(native, symbol) {
  const amount = Number(native) || 0
  if (Math.abs(amount) >= COMPACT_AMOUNT_THRESHOLD) return formatCompactNative(amount, symbol)
  return formatNative(native, symbol)
}

export function formatUSDFull(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0)
}

export function formatNativeFull(native, symbol) {
  const amount = Number(native) || 0
  const locale = symbol === 'BRL' ? 'pt-BR' : 'en-US'
  const currency = symbol === 'BRL' ? 'BRL' : 'USD'
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}
