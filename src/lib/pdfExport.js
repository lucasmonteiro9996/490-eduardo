function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function openTransactionPdf(tx, meta = {}) {
  if (!tx) return
  const id = escapeHtml(tx.id || '')
  const label = escapeHtml(tx.label || 'Movimentacao')
  const from = escapeHtml(tx.from || '')
  const amount = escapeHtml(tx.amount || '')
  const time = escapeHtml(tx.time || '')
  const status = escapeHtml(tx.status === 'pending' ? 'Pendente' : 'Concluido')
  const kind = tx.type === 'receive' ? 'Deposito' : tx.type === 'send' ? 'Saque' : 'Cambio'
  const owner = escapeHtml(meta.owner || 'Cliente DuoBank')
  const generatedAt = new Date().toLocaleString('pt-BR')
  const positive = !String(tx.amount || '').startsWith('-')
  const amountColor = positive ? '#0c8a5a' : '#b5364f'

  const html = `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <title>Comprovante - ${label}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      background: #f5f6fa;
      margin: 0;
      padding: 32px;
      color: #111;
    }
    .sheet {
      max-width: 640px;
      margin: 0 auto;
      background: #fff;
      border-radius: 14px;
      padding: 36px 40px;
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
      border: 1px solid #e5e8f0;
    }
    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #e5e8f0;
      padding-bottom: 16px;
      margin-bottom: 20px;
    }
    .brand {
      font-size: 1.4rem;
      font-weight: 800;
      color: #1c3a8a;
      letter-spacing: 0.02em;
    }
    .timestamp {
      font-size: 0.8rem;
      color: #5d6b87;
    }
    h1 {
      font-size: 1.15rem;
      margin: 0 0 4px;
      color: #2a3658;
    }
    .kind {
      text-transform: uppercase;
      font-size: 0.72rem;
      letter-spacing: 0.14em;
      color: #4a7fdb;
      font-weight: 700;
    }
    .amount {
      font-size: 2.2rem;
      font-weight: 800;
      color: ${amountColor};
      margin: 18px 0 6px;
      letter-spacing: -0.01em;
    }
    .status {
      display: inline-block;
      font-size: 0.78rem;
      padding: 4px 10px;
      border-radius: 999px;
      background: #eaf4ff;
      color: #1c3a8a;
      font-weight: 600;
    }
    dl {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px 24px;
      margin: 24px 0 0;
    }
    dt {
      font-size: 0.72rem;
      color: #5d6b87;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: 2px;
    }
    dd {
      margin: 0;
      font-size: 0.96rem;
      color: #2a3658;
      font-weight: 600;
    }
    footer {
      margin-top: 30px;
      padding-top: 16px;
      border-top: 1px dashed #d5dae6;
      font-size: 0.74rem;
      color: #7b88a6;
      display: flex;
      justify-content: space-between;
    }
    .btns {
      display: flex;
      justify-content: center;
      gap: 10px;
      margin-top: 24px;
    }
    .btn {
      font-size: 0.86rem;
      font-weight: 600;
      padding: 10px 18px;
      border-radius: 10px;
      border: none;
      cursor: pointer;
      background: #4a7fdb;
      color: #fff;
    }
    .btn.secondary {
      background: transparent;
      color: #4a7fdb;
      border: 1px solid #4a7fdb;
    }
    @media print {
      body { background: #fff; padding: 0; }
      .btns { display: none; }
      .sheet { box-shadow: none; border: none; }
    }
  </style>
</head>
<body>
  <div class="sheet">
    <header>
      <div class="brand">DuoBank</div>
      <div class="timestamp">Gerado em ${escapeHtml(generatedAt)}</div>
    </header>
    <span class="kind">Comprovante de ${escapeHtml(kind)}</span>
    <h1>${label}</h1>
    <div class="amount">${amount}</div>
    <span class="status">${status}</span>
    <dl>
      <div>
        <dt>Cliente</dt>
        <dd>${owner}</dd>
      </div>
      <div>
        <dt>ID da transacao</dt>
        <dd>${id}</dd>
      </div>
      <div>
        <dt>Tipo</dt>
        <dd>${escapeHtml(kind)}</dd>
      </div>
      <div>
        <dt>Data / hora</dt>
        <dd>${time}</dd>
      </div>
      <div>
        <dt>Origem / destino</dt>
        <dd>${from || '-'}</dd>
      </div>
      <div>
        <dt>Moeda</dt>
        <dd>${escapeHtml(tx.currency || (amount.includes('R$') ? 'BRL' : 'USD'))}</dd>
      </div>
    </dl>
    <footer>
      <span>DuoBank - Conta digital em Real e Dolar</span>
      <span>Documento emitido eletronicamente</span>
    </footer>
    <div class="btns">
      <button class="btn" onclick="window.print()">Salvar em PDF / Imprimir</button>
      <button class="btn secondary" onclick="window.close()">Fechar</button>
    </div>
  </div>
  <script>window.addEventListener('load', () => setTimeout(() => window.print(), 350));</script>
</body>
</html>`

  const win = window.open('', '_blank', 'width=720,height=820')
  if (!win) {
    alert('Libere o pop-up para exportar o comprovante em PDF.')
    return
  }
  win.document.open()
  win.document.write(html)
  win.document.close()
}

export function openStatementPdf(transactions = [], meta = {}) {
  const owner = escapeHtml(meta.owner || 'Cliente DuoBank')
  const generatedAt = new Date().toLocaleString('pt-BR')
  const rows = transactions
    .map((tx) => {
      const positive = !String(tx.amount || '').startsWith('-')
      const color = positive ? '#0c8a5a' : '#b5364f'
      return `<tr>
        <td>${escapeHtml(tx.time || '')}</td>
        <td>${escapeHtml(tx.label || '')}</td>
        <td>${escapeHtml(tx.from || '-')}</td>
        <td>${escapeHtml(tx.status === 'pending' ? 'Pendente' : 'Concluido')}</td>
        <td style="color:${color};font-weight:700;text-align:right">${escapeHtml(tx.amount || '')}</td>
      </tr>`
    })
    .join('')

  const html = `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <title>Extrato - DuoBank</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #fff; color: #111; padding: 32px; }
    header { display: flex; justify-content: space-between; align-items: baseline; border-bottom: 2px solid #1c3a8a; padding-bottom: 12px; margin-bottom: 18px; }
    .brand { font-size: 1.4rem; font-weight: 800; color: #1c3a8a; letter-spacing: 0.02em; }
    h1 { font-size: 1.05rem; margin: 10px 0 6px; color: #2a3658; text-transform: uppercase; letter-spacing: 0.08em; }
    table { width: 100%; border-collapse: collapse; font-size: 0.86rem; }
    th, td { text-align: left; padding: 10px 8px; border-bottom: 1px solid #e5e8f0; }
    th { background: #f1f4fb; text-transform: uppercase; font-size: 0.7rem; letter-spacing: 0.1em; color: #5d6b87; }
    footer { margin-top: 18px; font-size: 0.74rem; color: #7b88a6; display: flex; justify-content: space-between; }
    .btns { text-align: center; margin-top: 18px; }
    .btn { font-size: 0.86rem; font-weight: 600; padding: 10px 18px; border-radius: 10px; border: none; cursor: pointer; background: #4a7fdb; color: #fff; }
    @media print { .btns { display: none; } body { padding: 0; } }
  </style>
</head>
<body>
  <header>
    <div class="brand">DuoBank</div>
    <div>Extrato gerado em ${escapeHtml(generatedAt)}</div>
  </header>
  <h1>Extrato Consolidado</h1>
  <p style="margin:0 0 14px;color:#5d6b87">Cliente: <strong>${owner}</strong></p>
  <table>
    <thead>
      <tr><th>Data</th><th>Descricao</th><th>Origem / Destino</th><th>Status</th><th style="text-align:right">Valor</th></tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  <footer>
    <span>DuoBank - Conta digital em Real e Dolar</span>
    <span>${transactions.length} movimentacao(oes)</span>
  </footer>
  <div class="btns"><button class="btn" onclick="window.print()">Salvar em PDF / Imprimir</button></div>
  <script>window.addEventListener('load', () => setTimeout(() => window.print(), 400));</script>
</body>
</html>`

  const win = window.open('', '_blank', 'width=900,height=860')
  if (!win) {
    alert('Libere o pop-up para exportar o extrato em PDF.')
    return
  }
  win.document.open()
  win.document.write(html)
  win.document.close()
}
