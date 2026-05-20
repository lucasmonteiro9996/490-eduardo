# Subir manualmente na Netlify (outra conta)

Use uma **conta Netlify nova/pessoal** (ex. `lucas.monteiro9996@gmail.com`). **Não** use o time **Ocean Capital** / `siteocn@gmail.com` — está sem créditos e ligado ao site antigo.

**Não** reutilize o site `harmonious-cactus-ff90d5` nem `ocn.capital` já configurado na conta antiga até apontar o DNS para o site novo.

---

## 1. Gerar a pasta do site no PC

Na pasta do projeto:

```powershell
cd "c:\Users\Usuário\OneDrive\Área de Trabalho\BORDERLESS\projeto-490"
npm run build
```

A pasta para enviar é:

```
dist\
```

Conteúdo esperado: `index.html`, `assets\`, `branding\`, `_redirects`

---

## 2. Netlify — conta nova

1. Abra aba anônima ou faça **logout** da Netlify antiga.
2. [app.netlify.com](https://app.netlify.com) → login com a **outra conta** (ex. `lucas.monteiro9996@gmail.com`).
3. Confirme no canto: **não** está no time "Ocean Capital" sem crédito.
4. **Add new project** → **Deploy manually** (arrastar arquivos).
3. Arraste **tudo dentro de `dist/`** (ou a pasta `dist` inteira — Netlify aceita os dois).
4. Anote a URL gerada, ex.: `https://nome-aleatorio.netlify.app`.

> **Deploy manual** publica só os arquivos. As variáveis abaixo valem para **próximos** deploys por Git; no manual o Firebase já vai embutido no JS **se** você rodou `npm run build` com o `.env` correto antes de arrastar.

---

## 3. Variáveis de ambiente (cole no painel)

**Site configuration → Environment variables → Add a variable** (ou Import from `.env`)

Adicione **uma por uma** (Production):

| Key | Value |
|-----|--------|
| `VITE_FIREBASE_API_KEY` | `AIzaSyAAkrbkmYpkCq1uJmOtQ1BsgEE3i-pYmUY` |
| `VITE_FIREBASE_AUTH_DOMAIN` | `ocean-capital-2ec85.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | `ocean-capital-2ec85` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `ocean-capital-2ec85.firebasestorage.app` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `1039213725592` |
| `VITE_FIREBASE_APP_ID` | `1:1039213725592:web:ffd3e2d672006491c54ded` |
| `VITE_FIREBASE_MEASUREMENT_ID` | `G-KQNSBX8SWN` |
| `VITE_APP_URL` | `https://ocn.capital` |
| `VITE_EMAILJS_SERVICE_ID` | `service_eif1bhg` |
| `VITE_EMAILJS_TEMPLATE_ID` | `template_sqfuqff` |
| `VITE_EMAILJS_PUBLIC_KEY` | `vKs9K8VogdhRRaLsf` |
| `VITE_REAL_PAYMENTS_ENABLED` | `false` |
| `VITE_FUNCTIONS_BASE_URL` | *(deixe vazio)* |
| `VITE_PASSWORD_RESET_SERVER` | `false` |

Depois de salvar, se for usar **Git** no futuro: **Trigger deploy** de novo.

---

## 4. Se conectar GitHub depois (opcional)

**Site configuration → Build & deploy:**

| Campo | Valor |
|--------|--------|
| Build command | `npm run build` |
| Publish directory | `dist` |
| Node version | 18 ou 20 |

O arquivo `netlify.toml` na raiz do repo já repete isso.

---

## 5. Domínio `ocn.capital` na Netlify

**Domain management → Add domain:**

- `ocn.capital`
- `www.ocn.capital`

A Netlify mostra o subdomínio do site, ex. `seu-site.netlify.app`.

---

## 6. DNS na Hostinger (só registros)

**Domínios → ocn.capital → Gerenciar registros DNS**

### Remova (legado)

- **A** `@` → `199.36.158.100` (Firebase Hosting)
- **TXT** `hosting-site=ocean-capital-2ec85`
- **CNAME** `www` → `harmonious-cactus-ff90d5.netlify.app` (site antigo, se ainda existir)

### Adicione (Netlify)

| Tipo | Nome | Valor |
|------|------|--------|
| **A** | `@` | `75.2.60.5` |
| **CNAME** | `www` | `SEU-SITE.netlify.app` |

(`SEU-SITE` = URL do passo 2, sem `https://`)

Aguarde 15 min–2 h. SSL na Netlify fica **Active** sozinho.

---

## 7. Firebase (`ocean-capital-2ec85`)

[Console Firebase](https://console.firebase.google.com/project/ocean-capital-2ec85)

**Authentication → Settings → Authorized domains** — inclua:

- `ocn.capital`
- `www.ocn.capital`
- `SEU-SITE.netlify.app`

**Configurações → Geral → Nome público:** `Ocean Capital`

**Hosting → domínios:** se `ocn.capital` estiver ligado ao Firebase Hosting, **remova** para não conflitar com a Netlify.

**Firestore:** regras já publicadas (`firebase deploy --only firestore:rules`).

---

## 8. Conta admin

Cadastre no site (projeto novo):

- E-mail: `siteocn@gmail.com`
- Senha forte

---

## 9. Testes

1. `https://SEU-SITE.netlify.app` — abre o app
2. `https://ocn.capital` — após DNS
3. Cadastro / login
4. Esqueci a senha — e-mail **Ocean Capital** (não eduardo)

---

## 10. Atualizar o site depois

**Manual:**

```powershell
npm run build
```

Arraste de novo a pasta `dist/` em **Deploys → Drag and drop**.

**Git:** push no repo → deploy automático (com env vars no painel).

---

## Problemas comuns

| Problema | Solução |
|----------|---------|
| Deploy bloqueado (créditos) | Troque de conta/time; não use Ocean Capital |
| Logou na conta errada | Logout → login na conta nova → site novo |
| Firebase não configurado | Rode `npm run build` com `.env` antes de arrastar `dist/` |
| `auth/unauthorized-domain` | Adicione domínios no Firebase |
| E-mail ainda “eduardo” | Build antigo ou projeto Firebase errado no `.env` |
| 404 em `/admin` | Confirme `index.html` + redirect SPA ( `_redirects` / `netlify.toml`) |

---

## Arquivo `.env` local (referência)

Mantenha na raiz do projeto (não commitar no Git):

```
VITE_FIREBASE_* → ocean-capital-2ec85
VITE_APP_URL=https://ocn.capital
```

Copie também em `scripts/netlify-env-import.txt`.
