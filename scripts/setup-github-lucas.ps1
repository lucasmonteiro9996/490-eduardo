# Cria repo na conta GitHub logada no `gh` e faz push
# Antes: gh auth login com lucas.monteiro9996@gmail.com

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..

$repoName = "ocean-capital-payment-manager"

Write-Host "Conta GitHub ativa:" -ForegroundColor Cyan
gh auth status

$status = gh auth status 2>&1 | Out-String
if ($status -match "borderlesspc05") {
  Write-Host ""
  Write-Host "AVISO: Voce ainda esta logado como borderlesspc05." -ForegroundColor Yellow
  Write-Host "Rode: gh auth logout && gh auth login (lucas.monteiro9996@gmail.com)" -ForegroundColor Yellow
  exit 1
}

$hasLucas = git remote 2>$null | Select-String -Pattern "^lucas$"
if (-not $hasLucas) {
  Write-Host "`nCriando repositorio $repoName ..." -ForegroundColor Cyan
  gh repo create $repoName --private --description "Ocean Capital Payment Manager" --source=. --remote=lucas
} else {
  Write-Host "`nRemote 'lucas' ja existe. Enviando push ..." -ForegroundColor Cyan
}

$dirty = git status --porcelain
if ($dirty) {
  Write-Host "`nCommitando alteracoes locais ..." -ForegroundColor Cyan
  git add -A
  git commit -m "Atualiza Firebase ocean-capital-2ec85, deploy e documentacao"
}

Write-Host "`nPush para lucas/main ..." -ForegroundColor Cyan
git push -u lucas main

Write-Host "`nPronto. URL do repo:" -ForegroundColor Green
gh repo view --remote lucas --json url -q ".url"
