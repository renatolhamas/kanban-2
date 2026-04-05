Write-Host "🚀 Iniciando workflow de desenvolvimento..." -ForegroundColor Green

Write-Host "🧹 Limpando processos na porta 3017 e cache (.next)..." -ForegroundColor Yellow
Get-NetTCPConnection -LocalPort 3017 -ErrorAction SilentlyContinue | ForEach-Object { 
    Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue 
}
Remove-Item -Path ".next" -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "⚡ Iniciando o servidor do Next.js na porta 3017..." -ForegroundColor Cyan
npm run dev -- -p 3017
