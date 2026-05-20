export const TRANSLATIONS = {
  pt: {
    // Page titles
    page_home: 'Dashboard',
    page_transactions: 'Extrato',
    page_wallets: 'Carteiras',
    page_cards: 'Cartões',
    page_settings: 'Configurações',

    // Topbar
    logout: 'Sair',

    // Firebase banner
    firebase_status: 'Status do Firebase',

    // DashboardSummary stat cards
    balance_brl: 'Saldo em real',
    balance_usd: 'Saldo em dólar',
    rate_label: 'Cotação USD/BRL',
    account_brl: 'Saldo BRL',
    account_usd: 'Saldo USD',
    flow_positive: 'Fluxo positivo',
    flow_stable: 'Movimento estável',

    // DashboardActions buttons
    deposit: 'Depositar',
    withdraw: 'Sacar',
    invest: 'Investir',
    statement: 'Extrato',
    invested_label: 'Investidos',
    invested_hint: 'Total em aplicações',
    invested_empty: 'Nenhuma aplicação ativa ainda',
    invested_pending: 'pendente(s)',
    modal_invest_kicker: 'Nova aplicação',
    modal_invest_action: 'Confirmar investimento',
    modal_invest_product: 'Produto',
    modal_note_invest_ph: 'Ex.: reserva de emergência',

    // DashboardTransactions
    recent_tx: 'Transações recentes',
    col_date: 'Data',
    col_type: 'Tipo',
    col_amount: 'Valor',
    col_status: 'Status',
    col_note: 'Observação',
    tx_deposit: 'Depósito',
    tx_withdraw: 'Saque',
    tx_exchange: 'Câmbio',
    note_incoming: 'Entrada na conta',
    note_outgoing: 'Saída da conta',
    note_exchange: 'Conversão BRL/USD',
    no_movements: 'Nenhuma movimentação ainda. Faça um depósito para começar.',
    status_confirmed: 'Confirmado',
    status_pending: 'Aguardando resposta do admin',
    status_rejected: 'Recusado',

    // TransactionsSummary
    entries: 'Entradas',
    exits: 'Saídas',
    exchanges: 'Câmbios',
    pending: 'Pendentes',
    total: 'Total',

    // WalletsSummary
    portfolio_total: 'Portfólio total em BRL',
    portfolio_hint: 'BRL + USD convertido',
    rate: 'Cotação USD/BRL',

    // CardsSummary
    cards_registered_1: 'Cartão cadastrado',
    cards_registered_n: 'Cartões cadastrados',
    active_1: 'Ativo',
    active_n: 'Ativos',
    brl_cards: 'Cartões BRL',
    usd_cards: 'Cartões USD',

    // SettingsSummary
    account_holder: 'Titular da conta',
    email_access: 'E-mail de acesso',
    account_status: 'Status da conta',
    two_factor: 'Verificação 2 etapas',
    account_active: '● Ativa',
    two_factor_on: '● Ativada',
    two_factor_off: '○ Inativa',

    // UserRequestStatus
    requests_title: 'Pedidos enviados ao administrador',
    tx_deposit_label: 'Depósito',
    tx_withdraw_label: 'Saque',
    origin: 'Origem',
    destination: 'Destino',
    pending_admin: 'Aguardando resposta do admin',
    approved_admin: 'Aceito pelo admin',
    refused_admin: 'Recusado pelo admin',

    // UserNotifications
    notifications_title: 'Notificações do administrador',
    from_label: 'De',
    close_label: 'Fechar',

    // StatementTable
    holder_label: 'Titular',
    count_1: 'movimentação',
    count_n: 'movimentações',
    export_pdf_btn: 'Exportar extrato completo em PDF',
    col_transaction: 'Transação',
    status_completed: 'Concluído',

    // Section titles
    section_history: 'Histórico de movimentações',
    section_wallets: 'Sua conta em real e dólar',
    account_unified: 'Conta Ocean Capital',
    account_unified_hint: 'Uma conta com saldo em real e dólar',
    section_add_card: 'Adicionar cartão',
    section_cards: 'Seus cartões',
    section_preferences: 'Preferências',
    section_security: 'Segurança da conta',

    // CardsGallery
    no_cards: 'Nenhum cartão cadastrado ainda.',
    delete_card: 'Excluir cartão',
    delete_confirm: 'Confirmar',
    cancel: 'Cancelar',
    meta_currency: 'Moeda',
    meta_limit: 'Limite',
    meta_status: 'Status',

    // AddCardPanel
    card_data_kicker: 'Dados do cartão',
    add_card_title: 'Adicionar novo cartão',
    add_card_desc: 'Cadastre um cartão manualmente para que ele apareça na galeria com o visual já estilizado.',
    field_holder: 'Nome impresso',
    field_number: 'Número do cartão',
    field_expiry: 'Validade',
    field_cvv: 'CVV',
    field_currency: 'Moeda',
    field_limit: 'Limite',
    add_card_btn: 'Adicionar cartão',
    card_added_ok: 'Cartão adicionado com sucesso. Ele já aparece na galeria abaixo.',
    card_error_fill: 'Preencha nome, número, validade, CVV e limite para adicionar o cartão.',
    how_title: 'Como funciona',
    how_step1: 'Preencha os dados principais do cartão.',
    how_step2: 'Defina a moeda e o limite da conta vinculada.',
    how_step3: 'Clique em adicionar para gerar o cartão visual.',
    how_step4: 'Use o botão de exclusão para remover cartões com confirmação.',
    how_note: 'Esse fluxo simula a experiência de cadastro antes da integração com backend ou carteira digital.',

    // Preferences panel
    pref_primary_currency: 'Moeda principal',
    pref_language: 'Idioma',
    currency_brl: 'Real (BRL)',
    currency_usd: 'Dólar (USD)',

    // Sidebar
    nav_home: 'Início',
    nav_transactions: 'Extrato',
    nav_wallets: 'Carteiras',
    nav_cards: 'Cartões',
    nav_settings: 'Configurações',
    sidebar_expand: 'Expandir',
    sidebar_collapse: 'Recolher',
    sidebar_local_account: 'Conta local',
    sidebar_firebase_ready: 'Firebase pronto',

    // MoneyModal
    modal_deposit_kicker: 'Entrada de dinheiro',
    modal_withdraw_kicker: 'Retirada de dinheiro',
    modal_deposit_action: 'Confirmar depósito',
    modal_withdraw_action: 'Confirmar saque',
    modal_amount: 'Valor',
    modal_origin: 'Origem do depósito',
    modal_dest: 'Destino do saque',
    modal_note: 'Observação (opcional)',
    modal_note_deposit_ph: 'Ex.: recebimento de cliente',
    modal_note_withdraw_ph: 'Ex.: aluguel de abril',
    modal_invalid: 'Informe um valor maior que zero.',
    modal_cancel: 'Cancelar',
  },

  en: {
    // Page titles
    page_home: 'Dashboard',
    page_transactions: 'Statement',
    page_wallets: 'Wallets',
    page_cards: 'Cards',
    page_settings: 'Settings',

    // Topbar
    logout: 'Sign out',

    // Firebase banner
    firebase_status: 'Firebase Status',

    // DashboardSummary stat cards
    balance_brl: 'BRL balance',
    balance_usd: 'USD balance',
    rate_label: 'USD/BRL rate',
    account_brl: 'BRL balance',
    account_usd: 'USD balance',
    flow_positive: 'Positive flow',
    flow_stable: 'Stable movement',

    // DashboardActions buttons
    deposit: 'Deposit',
    withdraw: 'Withdraw',
    invest: 'Invest',
    statement: 'Statement',
    invested_label: 'Invested',
    invested_hint: 'Total in investments',
    invested_empty: 'No active investments yet',
    invested_pending: 'pending',
    modal_invest_kicker: 'New investment',
    modal_invest_action: 'Confirm investment',
    modal_invest_product: 'Product',
    modal_note_invest_ph: 'E.g.: emergency reserve',

    // DashboardTransactions
    recent_tx: 'Recent transactions',
    col_date: 'Date',
    col_type: 'Type',
    col_amount: 'Amount',
    col_status: 'Status',
    col_note: 'Note',
    tx_deposit: 'Deposit',
    tx_withdraw: 'Withdrawal',
    tx_exchange: 'Exchange',
    note_incoming: 'Incoming transfer',
    note_outgoing: 'Outgoing transfer',
    note_exchange: 'BRL/USD conversion',
    no_movements: 'No movements yet. Make a deposit to get started.',
    status_confirmed: 'Confirmed',
    status_pending: 'Awaiting admin response',
    status_rejected: 'Rejected',

    // TransactionsSummary
    entries: 'Incoming',
    exits: 'Outgoing',
    exchanges: 'Exchanges',
    pending: 'Pending',
    total: 'Total',

    // WalletsSummary
    portfolio_total: 'Total portfolio in BRL',
    portfolio_hint: 'BRL + converted USD',
    rate: 'USD/BRL rate',

    // CardsSummary
    cards_registered_1: 'Registered card',
    cards_registered_n: 'Registered cards',
    active_1: 'Active',
    active_n: 'Active',
    brl_cards: 'BRL cards',
    usd_cards: 'USD cards',

    // SettingsSummary
    account_holder: 'Account holder',
    email_access: 'Login email',
    account_status: 'Account status',
    two_factor: '2-step verification',
    account_active: '● Active',
    two_factor_on: '● Enabled',
    two_factor_off: '○ Inactive',

    // UserRequestStatus
    requests_title: 'Requests sent to administrator',
    tx_deposit_label: 'Deposit',
    tx_withdraw_label: 'Withdrawal',
    origin: 'Origin',
    destination: 'Destination',
    pending_admin: 'Awaiting admin response',
    approved_admin: 'Approved by admin',
    refused_admin: 'Refused by admin',

    // UserNotifications
    notifications_title: 'Administrator notifications',
    from_label: 'From',
    close_label: 'Close',

    // StatementTable
    holder_label: 'Holder',
    count_1: 'transaction',
    count_n: 'transactions',
    export_pdf_btn: 'Export full statement as PDF',
    col_transaction: 'Transaction',
    status_completed: 'Completed',

    // Section titles
    section_history: 'Transaction history',
    section_wallets: 'Your BRL and USD account',
    account_unified: 'Ocean Capital account',
    account_unified_hint: 'One account with BRL and USD balances',
    section_add_card: 'Add card',
    section_cards: 'Your cards',
    section_preferences: 'Preferences',
    section_security: 'Account security',

    // CardsGallery
    no_cards: 'No cards registered yet.',
    delete_card: 'Delete card',
    delete_confirm: 'Confirm',
    cancel: 'Cancel',
    meta_currency: 'Currency',
    meta_limit: 'Limit',
    meta_status: 'Status',

    // AddCardPanel
    card_data_kicker: 'Card details',
    add_card_title: 'Add new card',
    add_card_desc: 'Manually register a card so it appears in the gallery with the styled visual.',
    field_holder: 'Cardholder name',
    field_number: 'Card number',
    field_expiry: 'Expiry',
    field_cvv: 'CVV',
    field_currency: 'Currency',
    field_limit: 'Limit',
    add_card_btn: 'Add card',
    card_added_ok: 'Card added successfully. It now appears in the gallery below.',
    card_error_fill: 'Please fill in name, number, expiry, CVV and limit to add the card.',
    how_title: 'How it works',
    how_step1: 'Fill in the main card details.',
    how_step2: 'Set the currency and limit for the linked account.',
    how_step3: 'Click add to generate the visual card.',
    how_step4: 'Use the delete button to remove cards with confirmation.',
    how_note: 'This flow simulates the registration experience before backend or digital wallet integration.',

    // Preferences panel
    pref_primary_currency: 'Primary currency',
    pref_language: 'Language',
    currency_brl: 'Brazilian Real (BRL)',
    currency_usd: 'US Dollar (USD)',

    // Sidebar
    nav_home: 'Home',
    nav_transactions: 'Statement',
    nav_wallets: 'Wallets',
    nav_cards: 'Cards',
    nav_settings: 'Settings',
    sidebar_expand: 'Expand',
    sidebar_collapse: 'Collapse',
    sidebar_local_account: 'Local account',
    sidebar_firebase_ready: 'Firebase ready',

    // MoneyModal
    modal_deposit_kicker: 'Incoming money',
    modal_withdraw_kicker: 'Outgoing money',
    modal_deposit_action: 'Confirm deposit',
    modal_withdraw_action: 'Confirm withdrawal',
    modal_amount: 'Amount',
    modal_origin: 'Deposit source',
    modal_dest: 'Withdrawal destination',
    modal_note: 'Note (optional)',
    modal_note_deposit_ph: 'E.g.: client payment received',
    modal_note_withdraw_ph: 'E.g.: April rent',
    modal_invalid: 'Please enter a value greater than zero.',
    modal_cancel: 'Cancel',
  },

  es: {
    // Page titles
    page_home: 'Panel',
    page_transactions: 'Extracto',
    page_wallets: 'Carteras',
    page_cards: 'Tarjetas',
    page_settings: 'Configuración',

    // Topbar
    logout: 'Cerrar sesión',

    // Firebase banner
    firebase_status: 'Estado de Firebase',

    // DashboardSummary stat cards
    balance_brl: 'Saldo en BRL',
    balance_usd: 'Saldo en USD',
    rate_label: 'Cotización USD/BRL',
    account_brl: 'Saldo BRL',
    account_usd: 'Saldo USD',
    flow_positive: 'Flujo positivo',
    flow_stable: 'Movimiento estable',

    // DashboardActions buttons
    deposit: 'Depositar',
    withdraw: 'Retirar',
    invest: 'Invertir',
    statement: 'Extracto',
    invested_label: 'Invertidos',
    invested_hint: 'Total en inversiones',
    invested_empty: 'Sin inversiones activas aún',
    invested_pending: 'pendiente(s)',
    modal_invest_kicker: 'Nueva inversión',
    modal_invest_action: 'Confirmar inversión',
    modal_invest_product: 'Producto',
    modal_note_invest_ph: 'Ej.: reserva de emergencia',

    // DashboardTransactions
    recent_tx: 'Transacciones recientes',
    col_date: 'Fecha',
    col_type: 'Tipo',
    col_amount: 'Monto',
    col_status: 'Estado',
    col_note: 'Nota',
    tx_deposit: 'Depósito',
    tx_withdraw: 'Retiro',
    tx_exchange: 'Cambio',
    note_incoming: 'Ingreso en cuenta',
    note_outgoing: 'Salida de cuenta',
    note_exchange: 'Conversión BRL/USD',
    no_movements: 'Sin movimientos aún. Haz un depósito para comenzar.',
    status_confirmed: 'Confirmado',
    status_pending: 'En espera de respuesta del admin',
    status_rejected: 'Rechazado',

    // TransactionsSummary
    entries: 'Entradas',
    exits: 'Salidas',
    exchanges: 'Cambios',
    pending: 'Pendientes',
    total: 'Total',

    // WalletsSummary
    portfolio_total: 'Portafolio total en BRL',
    portfolio_hint: 'BRL + USD convertido',
    rate: 'Cotización USD/BRL',

    // CardsSummary
    cards_registered_1: 'Tarjeta registrada',
    cards_registered_n: 'Tarjetas registradas',
    active_1: 'Activa',
    active_n: 'Activas',
    brl_cards: 'Tarjetas BRL',
    usd_cards: 'Tarjetas USD',

    // SettingsSummary
    account_holder: 'Titular de la cuenta',
    email_access: 'Correo de acceso',
    account_status: 'Estado de la cuenta',
    two_factor: 'Verificación en 2 pasos',
    account_active: '● Activa',
    two_factor_on: '● Activada',
    two_factor_off: '○ Inactiva',

    // UserRequestStatus
    requests_title: 'Solicitudes enviadas al administrador',
    tx_deposit_label: 'Depósito',
    tx_withdraw_label: 'Retiro',
    origin: 'Origen',
    destination: 'Destino',
    pending_admin: 'En espera de respuesta del admin',
    approved_admin: 'Aceptado por el admin',
    refused_admin: 'Rechazado por el admin',

    // UserNotifications
    notifications_title: 'Notificaciones del administrador',
    from_label: 'De',
    close_label: 'Cerrar',

    // StatementTable
    holder_label: 'Titular',
    count_1: 'movimiento',
    count_n: 'movimientos',
    export_pdf_btn: 'Exportar extracto completo en PDF',
    col_transaction: 'Transacción',
    status_completed: 'Completado',

    // Section titles
    section_history: 'Historial de movimientos',
    section_wallets: 'Tu cuenta en BRL y USD',
    account_unified: 'Cuenta Ocean Capital',
    account_unified_hint: 'Una cuenta con saldo en BRL y USD',
    section_add_card: 'Agregar tarjeta',
    section_cards: 'Tus tarjetas',
    section_preferences: 'Preferencias',
    section_security: 'Seguridad de la cuenta',

    // CardsGallery
    no_cards: 'Ninguna tarjeta registrada aún.',
    delete_card: 'Eliminar tarjeta',
    delete_confirm: 'Confirmar',
    cancel: 'Cancelar',
    meta_currency: 'Moneda',
    meta_limit: 'Límite',
    meta_status: 'Estado',

    // AddCardPanel
    card_data_kicker: 'Datos de la tarjeta',
    add_card_title: 'Agregar nueva tarjeta',
    add_card_desc: 'Registra una tarjeta manualmente para que aparezca en la galería con el visual estilizado.',
    field_holder: 'Nombre impreso',
    field_number: 'Número de tarjeta',
    field_expiry: 'Vencimiento',
    field_cvv: 'CVV',
    field_currency: 'Moneda',
    field_limit: 'Límite',
    add_card_btn: 'Agregar tarjeta',
    card_added_ok: 'Tarjeta agregada exitosamente. Ya aparece en la galería a continuación.',
    card_error_fill: 'Completa nombre, número, vencimiento, CVV y límite para agregar la tarjeta.',
    how_title: 'Cómo funciona',
    how_step1: 'Completa los datos principales de la tarjeta.',
    how_step2: 'Define la moneda y el límite de la cuenta vinculada.',
    how_step3: 'Haz clic en agregar para generar la tarjeta visual.',
    how_step4: 'Usa el botón de eliminar para remover tarjetas con confirmación.',
    how_note: 'Este flujo simula la experiencia de registro antes de la integración con backend o billetera digital.',

    // Preferences panel
    pref_primary_currency: 'Moneda principal',
    pref_language: 'Idioma',
    currency_brl: 'Real brasileño (BRL)',
    currency_usd: 'Dólar estadounidense (USD)',

    // Sidebar
    nav_home: 'Inicio',
    nav_transactions: 'Extracto',
    nav_wallets: 'Carteras',
    nav_cards: 'Tarjetas',
    nav_settings: 'Configuración',
    sidebar_expand: 'Expandir',
    sidebar_collapse: 'Contraer',
    sidebar_local_account: 'Cuenta local',
    sidebar_firebase_ready: 'Firebase listo',

    // MoneyModal
    modal_deposit_kicker: 'Ingreso de dinero',
    modal_withdraw_kicker: 'Retiro de dinero',
    modal_deposit_action: 'Confirmar depósito',
    modal_withdraw_action: 'Confirmar retiro',
    modal_amount: 'Monto',
    modal_origin: 'Origen del depósito',
    modal_dest: 'Destino del retiro',
    modal_note: 'Nota (opcional)',
    modal_note_deposit_ph: 'Ej.: pago recibido de cliente',
    modal_note_withdraw_ph: 'Ej.: alquiler de abril',
    modal_invalid: 'Ingresa un valor mayor a cero.',
    modal_cancel: 'Cancelar',
  },
}
