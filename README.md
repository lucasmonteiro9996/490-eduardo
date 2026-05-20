# Ocean Capital Payment Manager

Aplicacao Vite + React com area do usuario e area administrativa.

## Build local

```bash
npm install
npm run build
```

## Deploy (producao)

**Setup:** site na **Netlify**, dominio com DNS na **Hostinger**.

Guia: [NETLIFY_DEPLOY.md](./NETLIFY_DEPLOY.md)

1. Variaveis `VITE_*` no painel Netlify (Environment variables).
2. Deploy: Git push, `netlify deploy --prod` ou arrastar `dist/` apos `npm run build`.
3. Hostinger: DNS apontando para Netlify (A/CNAME).
4. Firebase: autorizar `ocn.capital`, `www.ocn.capital` e `*.netlify.app`.

Hospedagem so em `public_html` (sem Netlify): [HOSTINGER_DEPLOY.md](./HOSTINGER_DEPLOY.md)

## Netlify

- Build: `npm run build` — Publish: `dist`
- [netlify.toml](./netlify.toml)

## Variaveis de ambiente

Cadastre no provedor de hospedagem ou em `.env.production` antes do build:

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
```

## Firebase

Guia completo (criar projeto novo, regras, `.env`, Hostinger, migração):

- [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)

Antes de publicar em producao:

1. Ative `Authentication > Email/Password`
2. Ative `Firestore Database`
3. Adicione os dominios de producao em `Authentication > Settings > Authorized domains`
4. Publique as regras: `firebase deploy --only firestore:rules`

Domínios para autorizar:

- `seu-dominio.com`
- `www.seu-dominio.com`
