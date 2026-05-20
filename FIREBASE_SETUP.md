# Firebase do zero — Ocean Capital

Guia para criar um **projeto Firebase novo** (sem o nome `eduardo`) e conectar ao app **Ocean Capital Payment Manager** (React + Hostinger).

**Tempo estimado:** 45–90 minutos (sem migração pesada de dados).

---

## Visão geral

| Parte | Função |
|--------|--------|
| **Firebase Auth** | Login, cadastro, e-mail de senha, admin |
| **Firestore** | Usuários, carteiras, transações, pedidos ao admin |
| **Variáveis `VITE_FIREBASE_*`** | O app lê a config no build |
| **`firestore.rules`** | Segurança (quem lê/escreve o quê) |
| **E-mail admin** | Fixo no código: `siteocn@gmail.com` |

O app **não** guarda senha no seu servidor: tudo passa pelo Firebase no navegador.

---

## Parte 1 — Criar o projeto

### 1.1 Novo projeto

1. Acesse [console.firebase.google.com](https://console.firebase.google.com/).
2. **Adicionar projeto** (ou **Criar um projeto**).
3. **Nome do projeto:** `Ocean Capital` (nome amigável).
4. **ID do projeto:** escolha algo **sem** nome pessoal, por exemplo:
   - `ocean-capital-prod`
   - `ocn-capital-app`  
   O ID **não pode ser alterado depois** e aparece em URLs se você não usar domínio personalizado.
5. Google Analytics: opcional (pode desativar).
6. Conclua a criação.

### 1.2 Nome público (e-mails)

1. **Configurações do projeto** (engrenagem) → **Geral**.
2. **Nome público:** `Ocean Capital`.
3. Salve.

Assim os e-mails de senha não mostram outro nome.

---

## Parte 2 — Authentication

### 2.1 Ativar login por e-mail

1. Menu **Authentication** → **Começar** (se for a primeira vez).
2. Aba **Sign-in method**.
3. **E-mail/senha** → **Ativar** → Salvar.

### 2.2 Domínios autorizados

1. **Authentication** → **Settings** → **Authorized domains**.
2. Confirme que existem:
   - `localhost` (desenvolvimento)
   - `ocn.capital`
   - `www.ocn.capital`
   - Domínio da Hostinger, se for diferente (ex.: `seudominio.com`)

### 2.3 Conta administrador

O painel admin só aceita este e-mail (definido no código):

- **`siteocn@gmail.com`**

**Depois** que o Firebase estiver ligado ao app:

1. No site, abra **Criar conta** (ou cadastro normal).
2. Use **exatamente** `siteocn@gmail.com` e uma senha forte.
3. No **Firestore**, o documento `users/{uid}` desse usuário pode ficar `status: pending` até você aprovar — como admin, as regras já permitem acesso total pelo e-mail.

> Se quiser outro e-mail de admin no futuro, será preciso alterar `firestore.rules`, `AdminAuthContext.jsx`, `AuthPage.jsx`, `_auth.mjs` e `emailService.js`.

### 2.4 Modelos de e-mail (opcional)

**Authentication** → **Templates** → **Redefinição de senha** (e verificação de e-mail):

- Idioma: português, se disponível.
- Ajuste texto para “Ocean Capital”.

### 2.5 Domínio personalizado nos links (recomendado)

Para links **sem** `seu-id.firebaseapp.com`:

1. **Authentication** → **Settings** → **Custom domain** (Domínio personalizado).
2. Use algo como `auth.ocn.capital`.
3. Crie os registros DNS na Hostinger conforme o assistente do Firebase.
4. Quando estiver **Verified**, use no `.env`:
   ```env
   VITE_FIREBASE_AUTH_DOMAIN=auth.ocn.capital
   ```
   Se ainda não configurou, use o padrão:
   ```env
   VITE_FIREBASE_AUTH_DOMAIN=ocean-capital-prod.firebaseapp.com
   ```
   (troque pelo **ID real** do seu projeto)

---

## Parte 3 — Firestore

### 3.1 Criar banco

1. Menu **Firestore Database** → **Criar banco de dados**.
2. Modo: **Produção** (regras restritivas; você vai publicar as regras do projeto).
3. Região: prefira **`southamerica-east1`** (São Paulo) se disponível, ou a mais próxima dos usuários.

### 3.2 Publicar regras de segurança

No computador, na pasta do projeto:

```bash
npm install -g firebase-tools
firebase login
```

Edite `.firebaserc` e aponte para o **novo** ID:

```json
{
  "projects": {
    "default": "ocean-capital-prod"
  }
}
```

(substitua `ocean-capital-prod` pelo ID que você criou)

Publique as regras:

```bash
firebase deploy --only firestore:rules
```

O arquivo usado é o `firestore.rules` na raiz do repositório. Ele define:

- Admin: `siteocn@gmail.com`
- Cada usuário só acessa seus dados em `users/{uid}/...`
- Coleção global `adminRequests` para depósitos, saques e investimentos

### 3.3 Índices

O app ordena por data em:

- `adminRequests` → `createdAt` desc
- `users/{uid}/notifications` → `createdAt` desc

Na primeira vez que essas telas rodarem, o Firebase pode mostrar um **link no console do navegador** para criar o índice — clique e confirme.

---

## Parte 4 — App Web e variáveis do projeto

### 4.1 Registrar app Web

1. Na página inicial do projeto Firebase → ícone **Web** `</>`.
2. Apelido: `Ocean Capital Web`.
3. **Não** marque Firebase Hosting se o site fica só na Hostinger.
4. Copie o objeto `firebaseConfig` exibido.

### 4.2 Arquivo `.env` (build)

Na raiz do projeto, crie ou edite `.env` (e `.env.production` para build de produção):

```env
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=ocean-capital-prod.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=ocean-capital-prod
VITE_FIREBASE_STORAGE_BUCKET=ocean-capital-prod.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXX

VITE_APP_URL=https://ocn.capital

VITE_EMAILJS_SERVICE_ID=
VITE_EMAILJS_TEMPLATE_ID=
VITE_EMAILJS_PUBLIC_KEY=

VITE_REAL_PAYMENTS_ENABLED=false
VITE_FUNCTIONS_BASE_URL=
VITE_PASSWORD_RESET_SERVER=false
```

| Variável | Onde achar no Console |
|----------|------------------------|
| `apiKey` | Configurações do projeto → Seus apps → SDK |
| `authDomain` | Mesmo lugar; ou domínio personalizado `auth.ocn.capital` |
| `projectId` | Configurações → Geral |
| `storageBucket` | Configurações → Geral |
| `messagingSenderId` | Configurações → Geral |
| `appId` | Seus apps → Web |
| `measurementId` | Só se Analytics estiver ativo |

**Importante:** depois de alterar o `.env`, rode **novo build** antes de subir para a Hostinger.

---

## Parte 5 — Estrutura de dados (o que o app usa)

Não é obrigatório criar coleções manualmente; o app cria ao usar. Referência:

```
users/{userId}
  ├── name, email, cpf, status (pending | active | rejected), ...
  ├── wallets/brl
  ├── wallets/usd
  ├── transactions/{id}
  ├── cards/{id}
  ├── bankAccounts/{id}
  ├── investments/{id}
  └── notifications/{id}

adminRequests/{id}   ← depósitos, saques, investimentos pendentes
```

**Carteiras iniciais:** o admin pode creditar pelo painel; ou você cria documentos `wallets/brl` e `wallets/usd` manualmente no Console.

---

## Parte 6 — Migrar do projeto antigo (`eduardo-99751`)

Escolha **uma** estratégia:

### Opção A — Começar limpo (mais simples)

1. Novo Firebase configurado (este guia).
2. Admin se cadastra de novo com `siteocn@gmail.com`.
3. Clientes criam conta de novo no site.
4. Admin recadastra cartões/dados se necessário.

Bom se poucos usuários ou ambiente ainda em testes.

### Opção B — Copiar Firestore

1. No projeto **antigo**: Google Cloud Console → Firestore → **Exportar**.
2. No projeto **novo**: **Importar** (mesmo bucket Cloud Storage, outro projeto).
3. Usuários do Auth **não** vêm junto — veja opção C.

Documentação: [Exportar e importar dados](https://firebase.google.com/docs/firestore/manage-data/export-import)

### Opção C — Migrar usuários (Auth)

Senhas **não** podem ser lidas. Caminhos:

- Pedir **redefinição de senha** no site novo para cada e-mail; ou
- [Importar usuários](https://firebase.google.com/docs/auth/admin/import-users) com hash (avançado, exige export do projeto antigo).

Na prática, muitos times usam **Opção A** + aviso aos clientes para se cadastrarem de novo.

---

## Parte 7 — Service Account (só se usar Netlify Functions)

Se no futuro usar funções em `netlify/functions/` (pagamentos, reset por EmailJS no servidor):

1. Firebase → **Configurações** → **Contas de serviço**.
2. **Gerar nova chave privada** (JSON).
3. No Netlify, variável de ambiente:
   - `FIREBASE_SERVICE_ACCOUNT_JSON` = conteúdo **inteiro** do JSON em **uma linha** (escape correto).

Na Hostinger **só com frontend**, essa variável **não** é necessária.

---

## Parte 8 — Build e publicar na Hostinger

```bash
npm install
npm run build:hostinger
```

Envie o **conteúdo** de `dist/` para `public_html/` (não a pasta `dist` em si).

Checklist pós-deploy:

- [ ] Site abre em `https://ocn.capital` (ou seu domínio)
- [ ] Cadastro de cliente funciona
- [ ] Login admin com `siteocn@gmail.com` → `/admin`
- [ ] Esqueci a senha → e-mail com **Ocean Capital** (não `eduardo`)
- [ ] Depósito/saque cria documento em `adminRequests` (teste no Console)

---

## Parte 9 — Testes rápidos

| Teste | Resultado esperado |
|--------|-------------------|
| Cadastro com e-mail novo | Documento em `users/{uid}`, `status: pending` |
| Login cliente | Dashboard após aprovação (ou conforme `AccountStatusGate`) |
| Login `siteocn@gmail.com` | Redireciona para área admin |
| Esqueci a senha | E-mail recebido; link abre e permite nova senha |
| Regras | Cliente **não** lê dados de outro `uid` |

Erros comuns:

| Erro | Solução |
|------|---------|
| `Firebase não configurado` | `.env` incompleto ou build sem variáveis |
| `auth/unauthorized-domain` | Domínio não está em Authorized domains |
| `Missing or insufficient permissions` | Rode `firebase deploy --only firestore:rules` |
| Índice ausente | Clique no link do erro no console do navegador |
| Admin não entra | E-mail deve ser exatamente `siteocn@gmail.com` |

---

## Parte 10 — Desligar o projeto antigo

Quando tudo estiver validado no projeto novo:

1. Avise usuários (se migração limpa).
2. No projeto `eduardo-99751`, evite apagar de imediato — mantenha backup/export.
3. Depois de semanas estáveis, pode desativar Auth ou o projeto inteiro no Console.

---

## Resumo dos arquivos do repositório

| Arquivo | Ação |
|---------|------|
| `.firebaserc` | Trocar `default` para o novo Project ID |
| `.env` / `.env.production` | Preencher todas `VITE_FIREBASE_*` |
| `firestore.rules` | Publicar com `firebase deploy --only firestore:rules` |
| `HOSTINGER_DEPLOY.md` | Deploy do `dist/` |
| `FIREBASE_REBRANDING.md` | Alternativa sem migrar (só renomear no projeto antigo) |

---

## Comandos úteis

```bash
# Login CLI
firebase login

# Ver projeto atual
firebase use

# Publicar só regras
firebase deploy --only firestore:rules

# Build Hostinger
npm run build:hostinger
```

Se quiser ajuda na migração dos dados do Firestore ou na configuração do domínio `auth.ocn.capital`, diga quantos usuários existem hoje no projeto antigo.
