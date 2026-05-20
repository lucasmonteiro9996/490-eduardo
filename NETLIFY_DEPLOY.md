# Deploy Netlify + domínio na Hostinger

Setup do Ocean Capital:

| O quê | Onde |
|--------|------|
| **Site (React)** | Netlify |
| **Domínio `ocn.capital`** | DNS na Hostinger → aponta para Netlify |
| **Auth + banco** | Firebase `ocean-capital-2ec85` |
| **Funções** (pagamentos, reset senha servidor) | Netlify Functions (`netlify/functions/`) |

A Hostinger **não** hospeda os arquivos do site — só o DNS do domínio.

---

## 1. Variáveis na Netlify (obrigatório)

No painel Netlify: **Site configuration → Environment variables** → adicione (Production):

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=ocean-capital-2ec85.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=ocean-capital-2ec85
VITE_FIREBASE_STORAGE_BUCKET=ocean-capital-2ec85.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=

VITE_APP_URL=https://ocn.capital

VITE_EMAILJS_SERVICE_ID=
VITE_EMAILJS_TEMPLATE_ID=
VITE_EMAILJS_PUBLIC_KEY=

VITE_REAL_PAYMENTS_ENABLED=false
VITE_PASSWORD_RESET_SERVER=false
```

Valores completos: copie do `.env` local do projeto.

Opcional (pagamentos reais / reset por servidor):

```env
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
ASAAS_API_KEY=
ASAAS_ENV=sandbox
```

> O build na Netlify **não** usa o `.env` do seu PC — só o que estiver no painel ou no repositório (não commite `.env`).

---

## 2. Publicar o site na Netlify

### Opção A — Git (recomendado)

1. Conecte o repositório GitHub ao site Netlify.
2. Build settings (já no `netlify.toml`):
   - Build command: `npm run build`
   - Publish directory: `dist`
3. **Deploy site** (ou push na branch principal).

### Opção B — CLI

```bash
npm install -g netlify-cli
netlify login
netlify link
npm run build
netlify deploy --prod --dir=dist
```

### Opção C — Arrastar pasta

1. `npm run build` localmente.
2. [app.netlify.com](https://app.netlify.com) → seu site → **Deploys** → arraste a pasta `dist/`.

---

## 3. Domínio na Hostinger (só DNS)

No **hPanel Hostinger** → domínio → **DNS / Zona DNS**:

### Domínio raiz `ocn.capital`

| Tipo | Nome | Valor |
|------|------|--------|
| **A** | `@` | `75.2.60.5` |

(IP da Netlify para apex — confira em Netlify → Domain management se mudar.)

Se a Hostinger não permitir A no `@`, use o assistente da Netlify (**Set up Netlify DNS** ou registro que eles indicarem).

### `www`

| Tipo | Nome | Valor |
|------|------|--------|
| **CNAME** | `www` | `seu-site.netlify.app` |

(substitua pelo subdomínio Netlify do seu site, ex. `ocean-capital.netlify.app`)

### Na Netlify

1. **Domain management** → **Add domain** → `ocn.capital` e `www.ocn.capital`
2. Aguarde SSL (Let's Encrypt) ficar **Active**
3. Ative redirecionamento **www → apex** ou o contrário, como preferir

Propagação DNS: de minutos a 48h (geralmente &lt; 1h).

---

## 4. Firebase

Projeto: **ocean-capital-2ec85**

**Authentication → Settings → Authorized domains**, inclua:

- `ocn.capital`
- `www.ocn.capital`
- `seu-site.netlify.app` (subdomínio Netlify, para testes)

**Configurações → Geral → Nome público:** `Ocean Capital`

Regras Firestore (no PC):

```bash
firebase deploy --only firestore:rules
```

---

## 5. Checklist pós-deploy

- [ ] Site abre em `https://ocn.capital`
- [ ] Variáveis `VITE_FIREBASE_*` na Netlify (não só no PC)
- [ ] Cadastro / login funcionam
- [ ] Esqueci a senha → e-mail **Ocean Capital** (não eduardo)
- [ ] Admin: `siteocn@gmail.com` cadastrado no projeto **novo**

---

## Erros comuns

| Sintoma | Causa |
|---------|--------|
| Firebase não configurado | Faltam env vars na Netlify → novo deploy |
| `auth/unauthorized-domain` | Domínio não está em Authorized domains |
| Ainda aparece eduardo no e-mail | Build antigo ou env apontando para `eduardo-99751` |
| 404 em rotas `/admin` | `netlify.toml` redirect SPA já cobre; confira deploy recente |

---

## Hostinger x Netlify

| Ação | Onde |
|------|------|
| Subir HTML/JS | **Netlify** (não `public_html`) |
| Apontar domínio | **Hostinger DNS** |
| E-mail corporativo | Hostinger (se tiver) — independente do site |

Guia Firebase completo: [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)
