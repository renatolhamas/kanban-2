Write-Host "🚀 Iniciando workflow de desenvolvimento..." -ForegroundColor Green

## Write-Host "🧹 Limpando processos nas portas 3017 (Next), 6006 (Storybook) e cache..." -ForegroundColor Yellow
## ports = @(3017, 6006)
Write-Host "🧹 Limpando processos na porta 3017 (Next) e cache..." -ForegroundColor Yellow
$ports = @(3017)
foreach ($port in $ports) {
    Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | ForEach-Object { 
        Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue 
    }
}
Remove-Item -Path ".next" -Recurse -Force -ErrorAction SilentlyContinue

## Write-Host "⚡ Iniciando Storybook na porta 6006..." -ForegroundColor Cyan
## Start-Process powershell -ArgumentList "npm run storybook"

Write-Host "⚡ Iniciando o servidor do Next.js na porta 3017..." -ForegroundColor Cyan
npm run dev -- -p 3017
