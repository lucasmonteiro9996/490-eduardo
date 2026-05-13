# Ocean Capital Payment Manager

Aplicacao Vite + React com area do usuario e area administrativa.

## Build local

```bash
npm install
npm run build
```

## Deploy na Hostinger

1. Crie o arquivo `.env.production` com as variaveis `VITE_*` do projeto.
2. Gere o pacote de publicacao:

```bash
npm run build:hostinger
```

3. Envie o conteudo da pasta `dist/` para `public_html/` no hPanel.
4. Confirme que o `.htaccess` foi publicado junto com o build para manter as rotas SPA.
5. No Firebase, autorize o dominio da Hostinger em `Authentication > Settings > Authorized domains`.

## Deploy na Netlify

Use estas configuracoes:

- Build command: `npm run build`
- Publish directory: `dist`

As rotas SPA ja estao cobertas por:

- [netlify.toml](./netlify.toml)
- [public/_redirects](./public/_redirects)

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

Antes de publicar em producao:

1. Ative `Authentication > Email/Password`
2. Ative `Firestore Database`
3. Adicione os dominios de producao em `Authentication > Settings > Authorized domains`

Domínios para autorizar:

- `seu-dominio.com`
- `www.seu-dominio.com`
