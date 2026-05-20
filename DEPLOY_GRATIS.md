# Publicar de graça (Firebase Hosting)

> **Netlify na sua conta + DNS Hostinger:** use [NETLIFY_CONTA_NOVA.md](./NETLIFY_CONTA_NOVA.md)

# Publicar de graça (sem Netlify paga, sem hospedagem Hostinger)

Voce ja paga so o **dominio** `ocn.capital` na Hostinger. O site pode ficar no **Firebase Hosting** (plano gratuito Spark).

- **Hostinger:** so DNS do dominio (registros A/TXT que o Firebase passar)
- **Firebase:** site + Auth + Firestore (`ocean-capital-2ec85`)
- **Netlify:** pode ignorar (creditos esgotados)

---

## 1. Build local (usa seu `.env`)

```bash
npm run build
```

---

## 2. Publicar no Firebase Hosting

```bash
firebase login
firebase use ocean-capital-2ec85
firebase deploy --only hosting
```

URL temporaria: `https://ocean-capital-2ec85.web.app`

---

## 3. Ligar o dominio `ocn.capital` (gratis)

1. [Console Firebase](https://console.firebase.google.com/) → projeto **ocean-capital-2ec85**
2. **Hosting** → **Adicionar domínio personalizado**
3. Digite `ocn.capital` e `www.ocn.capital`
4. O Firebase mostra registros DNS (tipo **A** e **TXT**)

Na **Hostinger** (dominio → **DNS / Nameservers** → zona DNS, sem contratar "site"):

- Apague registros de **estacionamento** / Netlify (`75.2.60.5`, etc.) se existirem
- Adicione **exatamente** o que o Firebase pedir

Aguarde SSL e propagacao (ate algumas horas).

---

## 4. Firebase Auth

**Authentication → Authorized domains:**

- `ocn.capital`
- `www.ocn.capital`
- `ocean-capital-2ec85.web.app` (teste)

**Nome publico:** Ocean Capital

---

## 5. Atualizar o site depois

Sempre que mudar o codigo:

```bash
npm run build
firebase deploy --only hosting
```

---

## O que nao funciona no plano gratis

- Funcoes Netlify (pagamentos Asaas no servidor) — deixe `VITE_REAL_PAYMENTS_ENABLED=false`
- Login, cadastro, Firestore, esqueci senha: **funcionam**

---

## Resumo

| Paga? | Servico |
|-------|---------|
| Sim (ja tem) | Dominio Hostinger |
| Nao | Firebase Hosting + Auth + Firestore |
| Nao | Netlify (nao usar agora) |
| Nao | Hospedagem web Hostinger |
