# Ocean Capital Payment Manager

Aplicação Vite + React com área do usuário e área administrativa.

## Build local

```bash
npm install
npm run build
```

## Deploy na Netlify

Use estas configurações:

- Build command: `npm run build`
- Publish directory: `dist`

As rotas SPA já estão cobertas por:

- [netlify.toml](./netlify.toml)
- [public/_redirects](./public/_redirects)

## Variáveis de ambiente

Cadastre na Netlify:

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

Antes de publicar em produção:

1. Ative `Authentication > Email/Password`
2. Ative `Firestore Database`
3. Adicione os domínios da Netlify em `Authentication > Settings > Authorized domains`

Domínios para autorizar:

- `seu-site.netlify.app`
- `seu-dominio.com`
- `www.seu-dominio.com`
