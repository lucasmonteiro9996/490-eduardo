# Deploy na Hostinger

Guia para publicar o site em **hospedagem Hostinger** com dominio `ocn.capital` (DNS na Hostinger, sem Netlify).

## Migrar da Netlify para Hostinger (seu caso)

1. No PC: `npm run build:hostinger` (gera `dist/`).
2. hPanel → **Websites** → adicione/abra o site `ocn.capital` → **File Manager** → `public_html`.
3. Apague arquivos antigos e envie **o conteudo** de `dist/` (incluindo `.htaccess`).
4. **DNS** (hPanel → Dominios → DNS):
   - Remova ou edite o **A** `@` que aponta para `75.2.60.5` (Netlify).
   - **A** `@` → IP da hospedagem Hostinger (hPanel → Hospedagem → detalhes do plano).
   - **CNAME** `www` → `@` ou conforme o assistente Hostinger.
5. Aguarde propagacao (15 min a 24 h). Teste `https://ocn.capital`.
6. Firebase (`ocean-capital-2ec85`): dominos `ocn.capital` e `www.ocn.capital` em Authorized domains.

> So dominio sem plano de site: no hPanel use **Adicionar site** / hospedagem incluida no dominio antes do upload.

---

Este projeto pode ser publicado na Hostinger de duas formas:

1. `Frontend apenas` na hospedagem comum da Hostinger
   Use quando voce quer publicar a interface React/Vite e continuar usando Firebase e EmailJS.

2. `Frontend + backend de pagamentos`
   Necessario se voce quiser manter os fluxos reais de tokenizacao de cartao e criacao de cobrancas/transferencias, porque essas rotas hoje existem como funcoes do Netlify.

## 1. O que funciona na hospedagem comum

Funciona normalmente:
- React/Vite
- Firebase Auth
- Firestore
- EmailJS
- Rotas SPA via `.htaccess`

Nao funciona sozinho na hospedagem estatica:
- `/.netlify/functions/card-tokenize`
- `/.netlify/functions/payment-deposit-create`
- `/.netlify/functions/payment-withdraw-create`

Para pagamentos reais fora da Netlify, defina:

```env
VITE_FUNCTIONS_BASE_URL=https://seu-backend.com/api
```

Assim o frontend passa a chamar um backend externo.

## 2. Build pronto para Hostinger

No projeto, rode:

```bash
npm install
npm run build:hostinger
```

Isso gera a pasta `dist/` pronta para upload.

## 3. Variaveis de ambiente

Antes do build, configure no `.env`:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
VITE_EMAILJS_SERVICE_ID=
VITE_EMAILJS_TEMPLATE_ID=
VITE_EMAILJS_PUBLIC_KEY=
VITE_REAL_PAYMENTS_ENABLED=false
VITE_FUNCTIONS_BASE_URL=
```

Observacoes:
- Se voce for publicar so o frontend na Hostinger, deixe `VITE_REAL_PAYMENTS_ENABLED=false`.
- Se tiver backend externo para pagamentos, preencha `VITE_FUNCTIONS_BASE_URL` e ligue `VITE_REAL_PAYMENTS_ENABLED=true`.

## 4. Publicar no hPanel

### Opcao A: File Manager

1. Entre no hPanel da Hostinger.
2. Abra `Websites`.
3. Selecione o dominio do projeto.
4. Entre em `File Manager`.
5. Acesse `public_html`.
6. Apague os arquivos antigos desse site, se existirem.
7. Envie todo o conteudo da pasta `dist/` para dentro de `public_html`.
   Nao envie a pasta `dist` inteira; envie o conteudo dela.
8. Confirme que estes arquivos ficaram em `public_html`:
   - `index.html`
   - `.htaccess`
   - pasta `assets`
   - pasta `branding` se estiver dentro do build

### Opcao B: FTP

1. Abra o cliente FTP.
2. Conecte com os dados da Hostinger.
3. Entre em `public_html`.
4. Suba o conteudo da pasta `dist/`.

## 5. Se o site abrir em branco

Confira:
- se o `index.html` esta dentro de `public_html`
- se a pasta `assets` foi enviada completa
- se o arquivo `.htaccess` foi enviado
- se o build foi feito depois de preencher o `.env`

## 6. Firebase depois do deploy

No Firebase, adicione seu dominio em:

`Authentication > Settings > Authorized domains`

Inclua:
- `seudominio.com`
- `www.seudominio.com`

### Firebase (projeto novo ou migracao)

Guia passo a passo: [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)

### Marca nos e-mails (remover "eduardo")

Se os e-mails de senha mostram `eduardo` ou `eduardo-99751.firebaseapp.com`, isso vem do **projeto Firebase**, nao do codigo do site. Migre com [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) ou renomeie no projeto antigo: [FIREBASE_REBRANDING.md](./FIREBASE_REBRANDING.md):

1. Configuracoes do projeto → **Nome publico** = `Ocean Capital`
2. (Recomendado) **Dominio personalizado** de Authentication → `auth.seudominio.com`
3. Atualizar `VITE_FIREBASE_AUTH_DOMAIN` e gerar novo build

## 7. Dominio com e sem www

Se usar os dois, confirme no painel da Hostinger:
- dominio principal
- redirecionamento correto entre `www` e raiz
- SSL ativo

## 8. Pagamentos reais na Hostinger

Se quiser que deposito e saque reais continuem funcionando fora da Netlify, voce vai precisar de um backend externo com rotas equivalentes a:

- `POST /api/card-tokenize`
- `POST /api/payment-deposit-create`
- `POST /api/payment-withdraw-create`

O frontend ja esta preparado para isso com:

```env
VITE_FUNCTIONS_BASE_URL=https://seu-backend.com/api
```

## 9. Checklist final

- `.env` preenchido
- `npm run build:hostinger` executado
- `dist/` gerada
- conteudo de `dist/` enviado para `public_html`
- dominio autorizado no Firebase
- SSL ativo
- `VITE_REAL_PAYMENTS_ENABLED=false` se nao houver backend externo
