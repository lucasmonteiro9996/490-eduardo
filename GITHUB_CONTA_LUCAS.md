# GitHub na conta lucas.monteiro9996@gmail.com

Hoje o projeto aponta para:

- `https://github.com/borderlesspc05/490-eduardo` (conta antiga)

Objetivo: repositório **novo** na **sua** conta GitHub (Lucas).

---

## Passo 1 — Login GitHub CLI com a conta Lucas

No PowerShell:

```powershell
gh auth logout
gh auth login
```

Escolha:

1. **GitHub.com**
2. **HTTPS**
3. **Login with a web browser**
4. Copie o código e autorize com **lucas.monteiro9996@gmail.com**

Confirme:

```powershell
gh auth status
```

Deve mostrar sua conta Lucas (não `borderlesspc05`).

---

## Passo 2 — Criar repositório e enviar código

Na pasta do projeto:

```powershell
cd "c:\Users\Usuário\OneDrive\Área de Trabalho\BORDERLESS\projeto-490"
.\scripts\setup-github-lucas.ps1
```

O script:

- Cria `ocean-capital-payment-manager` na sua conta (privado)
- Adiciona remote `lucas`
- Faz commit das alterações pendentes (se houver)
- Dá `push` na branch `main`

---

## Passo 3 — Manual (se preferir)

```powershell
gh repo create ocean-capital-payment-manager --private --description "Ocean Capital Payment Manager" --source=. --remote=lucas --push
```

Se o repo já existir no GitHub:

```powershell
git remote add lucas https://github.com/SEU_USUARIO/ocean-capital-payment-manager.git
git push -u lucas main
```

(`SEU_USUARIO` = login GitHub, ex. `lucasmonteiro9996`)

---

## Passo 4 — Netlify (conta nova) + Git

Na Netlify (login Lucas):

1. **Add new project** → **Import from GitHub**
2. Autorize GitHub e escolha `ocean-capital-payment-manager`
3. Build: `npm run build` | Publish: `dist`
4. Cole as variáveis de `NETLIFY_MANUAL.md`

---

## Remotes no Git

| Remote | Uso |
|--------|-----|
| `origin` | Repo antigo `borderlesspc05/490-eduardo` (pode manter ou remover) |
| `lucas` | **Seu** repo novo (principal daqui pra frente) |

Trocar o principal:

```powershell
git remote rename origin old-borderless
git remote rename lucas origin
```

---

## O que não sobe no Git

- `.env` (segredos) — já no `.gitignore`
- `node_modules/`, `dist/`

Nunca commite API keys no GitHub.
