# Deploy Ocean Capital na Netlify (conta lucas.monteiro9996@gmail.com)
# Rode no PowerShell na raiz do projeto: .\scripts\deploy-netlify.ps1

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..

Write-Host "=== 1/5 Build ===" -ForegroundColor Cyan
npm run build

Write-Host "`n=== 2/5 Login Netlify (abra o navegador e use lucas.monteiro9996@gmail.com) ===" -ForegroundColor Cyan
npx --yes netlify-cli@17 login

Write-Host "`n=== 3/5 Criar site (se ainda nao existir) ===" -ForegroundColor Cyan
$siteName = "ocean-capital-ocn"
try {
  npx --yes netlify-cli@17 sites:create --name $siteName 2>&1
} catch {
  Write-Host "Site pode ja existir, continuando..." -ForegroundColor Yellow
}

Write-Host "`n=== 4/5 Variaveis de ambiente (.env) ===" -ForegroundColor Cyan
if (Test-Path .env) {
  npx --yes netlify-cli@17 env:import .env --context production 2>&1
} else {
  Write-Host "Arquivo .env nao encontrado!" -ForegroundColor Red
  exit 1
}

Write-Host "`n=== 5/5 Deploy producao ===" -ForegroundColor Cyan
npx --yes netlify-cli@17 deploy --prod --dir=dist

Write-Host "`n=== Pronto ===" -ForegroundColor Green
Write-Host "Copie a URL *.netlify.app exibida acima."
Write-Host "Depois: Netlify -> Domain management -> ocn.capital"
Write-Host "Hostinger DNS: A @ 75.2.60.5 e CNAME www -> SUA-URL.netlify.app"
