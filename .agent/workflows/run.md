---
description: Reinicia o ambiente de desenvolvimento limpando processos anteriores na porta 3000
---

// turbo-all

1. Limpar processos na porta 3000 para evitar conflitos:
   `Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess -ErrorAction SilentlyContinue | Stop-Process -Force`

2. Iniciar o servidor de desenvolvimento do Next.js:
   `npm run dev`

3. O ambiente estará disponível em: http://localhost:3000
