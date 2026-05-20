# Netlify (sua conta) + domínio na Hostinger

Site na **Netlify gratuita (pessoal)**. Hostinger só com **DNS** — sem pagar hospedagem web lá.

---

## Parte 1 — Criar site na Netlify

1. Acesse [app.netlify.com](https://app.netlify.com) com **sua conta** (não o time que estourou crédito).
2. **Add new project** → **Import an existing project** (GitHub) **ou** **Deploy manually**.
3. Se usar **GitHub**:
   - Repositório do Ocean Capital
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Se usar **manual**: rode `npm run build` no PC e arraste a pasta `dist/` em **Deploys**.

O `netlify.toml` do projeto já define build e SPA.

---

## Parte 2 — Variáveis de ambiente (obrigatório)

**Site configuration → Environment variables → Production**

Copie do `.env` local:

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

Depois de salvar: **Trigger deploy → Deploy project** (rebuild com as variáveis).

---

## Parte 3 — Domínio na Netlify

1. **Domain management** → **Add a domain** → `ocn.capital`
2. Adicione também `www.ocn.capital`
3. A Netlify mostra os registros DNS (anote o subdomínio, ex. `algo-123.netlify.app`)

---

## Parte 4 — DNS na Hostinger (só registros)

**Domínios → ocn.capital → Gerenciar registros DNS**

### Remova (legado / Firebase / site antigo)

- **A** `@` → `199.36.158.100` (Firebase Hosting), se existir
- **TXT** `hosting-site=ocean-capital-2ec85`, se existir
- **CNAME** `www` → `harmonious-cactus-ff90d5.netlify.app` (site Netlify antigo)

### Adicione (valores da **sua** Netlify nova)

A Netlify indica no painel; em geral:

| Tipo | Nome | Valor |
|------|------|--------|
| **A** | `@` | `75.2.60.5` |
| **CNAME** | `www` | `SEU-SITE.netlify.app` |

(`SEU-SITE` = subdomínio do projeto novo, ex. `ocean-capital-xyz.netlify.app`)

Salve e aguarde 15 min–2 h.

---

## Parte 5 — Firebase

Projeto **ocean-capital-2ec85**:

- **Authentication → Authorized domains:** `ocn.capital`, `www.ocn.capital`, `SEU-SITE.netlify.app`
- **Nome público:** Ocean Capital
- Se ligou domínio no **Firebase Hosting**, remova `ocn.capital` lá (Hosting → domínios) para não conflitar com a Netlify.

---

## Parte 6 — Testar

1. `https://SEU-SITE.netlify.app` — site novo
2. `https://ocn.capital` — após DNS propagar
3. Cadastro, login, esqueci senha

---

## Atualizar o site depois

- **Com Git:** `git push` → deploy automático
- **Manual:** `npm run build` → arrastar `dist/` em Deploys

---

## Plano gratuito Netlify (pessoal)

- Bandwidth e minutos de build limitados — normalmente suficiente para este projeto.
- Use **conta pessoal**, não o time sem créditos.

## Funções Netlify (opcional)

Pagamentos reais: `FIREBASE_SERVICE_ACCOUNT_JSON` + `ASAAS_*` nas env vars do site. Senão deixe `VITE_REAL_PAYMENTS_ENABLED=false`.
