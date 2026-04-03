---
description: Reinicia o ambiente de desenvolvimento limpando processos anteriores na porta 3017
---

// turbo-all

1. Limpar processos na porta 3017 para evitar conflitos:
   `Get-NetTCPConnection -LocalPort 3017 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }`

2. Iniciar o servidor de desenvolvimento do Next.js:
   `npm run dev -- -p 3017`

3. O ambiente estará disponível em: http://localhost:3017