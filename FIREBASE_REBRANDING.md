# Remover o nome "eduardo" dos e-mails e links do Firebase

> **Migrar para projeto novo?** Use o guia completo: [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)

# Remover o nome "eduardo" (sem migrar)

O site (React) já usa a marca **Ocean Capital**. O que aparece como `eduardo` vem do **projeto Firebase** `eduardo-99751`, não do código da interface.

## O que cada coisa controla

| Onde aparece | Causa | Como corrigir |
|--------------|--------|----------------|
| Assunto: *"Redefinir a senha do app eduardo"* | Nome público do projeto no Firebase | Console → Configurações → alterar **Nome público** |
| Link `eduardo-99751.firebaseapp.com` | ID do projeto (não dá para renomear) | Domínio personalizado de Auth **ou** novo projeto Firebase |
| Arquivo `.firebaserc` no repositório | Alias do CLI (`firebase deploy`) | Só muda se criar outro projeto Firebase |

---

## Passo 1 — Nome nos e-mails (rápido, ~2 min)

1. Abra [Firebase Console](https://console.firebase.google.com/) → projeto `eduardo-99751`.
2. **Configurações do projeto** (ícone de engrenagem) → **Geral**.
3. Em **Nome público**, troque `eduardo` por **`Ocean Capital`**.
4. Salve.

Os próximos e-mails de redefinição de senha devem vir como *"Redefinir a senha do app Ocean Capital"* (ou similar).

Opcional: **Authentication → Templates** → edite o assunto/corpo dos modelos em português.

---

## Passo 2 — Tirar `eduardo-99751` da URL do link (domínio personalizado)

Enquanto o link for `*.firebaseapp.com`, o ID do projeto continua visível. Para usar o seu domínio (ex.: `ocn.capital`):

1. Console → **Authentication** → **Settings** → **Authorized domains**  
   - Confirme: `ocn.capital`, `www.ocn.capital`, domínio da Hostinger.
2. Na mesma área, procure **Domínio personalizado** / **Custom domain** (Auth).  
3. Siga o assistente (registros DNS na Hostinger). Exemplo de subdomínio: `auth.ocn.capital`.
4. Depois que o Firebase validar o DNS, atualize o `.env` de produção:

```env
VITE_FIREBASE_AUTH_DOMAIN=auth.ocn.capital
VITE_APP_URL=https://ocn.capital
```

5. Rode de novo `npm run build:hostinger` e publique o `dist/`.

Os links de e-mail passam a usar o domínio personalizado em vez de `eduardo-99751.firebaseapp.com`.

Documentação oficial: [Personalizar domínio de e-mail de autenticação](https://firebase.google.com/docs/auth/custom-email-handler)

---

## Passo 3 — Só se quiser apagar o ID `eduardo-99751` por completo

O **Project ID** não pode ser renomeado. A única forma de sumir com ele é:

1. Criar um **novo** projeto Firebase (ex.: `ocean-capital-prod`).
2. Ativar Auth, Firestore e copiar regras (`firestore.rules`).
3. Migrar usuários/dados (export/import Firestore + import de usuários no Auth, se necessário).
4. Atualizar todas as variáveis `VITE_FIREBASE_*` e `FIREBASE_SERVICE_ACCOUNT_JSON`.
5. Atualizar `.firebaserc` com o novo project ID.

Isso é trabalhoso; na prática **Passo 1 + Passo 2** resolvem o que o cliente vê.

---

## Checklist após mudanças

- [ ] Nome público = **Ocean Capital**
- [ ] Domínios autorizados incluem o site em produção
- [ ] (Recomendado) Domínio personalizado de Auth configurado
- [ ] `.env` de build atualizado e novo `dist/` na Hostinger
- [ ] Teste: **Esqueci a senha** → e-mail com marca e link corretos

---

## Repositório GitHub

Se o repositório ainda se chama `490-eduardo`, isso é só o nome no GitHub — não aparece para usuários do site. Renomeie em **Settings → Repository name** se quiser.
