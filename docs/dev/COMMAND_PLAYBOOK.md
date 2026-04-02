# Command Playbook (Guia de Sobrevivência CLI)

Este documento registra comandos verificados e regras de sintaxe para este ambiente (Windows PowerShell). **Consulte este arquivo antes de rodar qualquer comando no terminal.**

## 1. Regras de Sintaxe PowerShell (Ambiente de Desenvolvimento)

### Encadeamento de Comandos (Logical Operators)
---
> [!IMPORTANT]
> **NÃO USE `&&` ou `||`**. O PowerShell 5.1 (padrão em muitos Windows) não os suporta como separadores de comando.

-   **ERRADO**: `npm run build && npm test`
-   **CORRETO**: `npm run build; npm test` (Executa sequencialmente)
-   **AVANÇADO**: `npm run build; if ($?) { npm test }` (Executa o segundo somente se o primeiro for bem-sucedido).

### Aspas e Literais
---
-   Sempre use aspas duplas `"` para caminhos com espaços.
-   Se precisar de aspas dentro de aspas em comandos Complexos, use a técnica de escape do PowerShell: `` ` ` (backtick).

## 2. Comandos do Projeto (Verificados)

### Configuração e Sync
-   `npm install`: Padrão.
-   `npm run dev`: Inicia o servidor Next.js.
-   `npm run sync:ide`: Sincroniza o Codex CLI com o IDE.

### Banco de Dados (Supabase/Postgres)
-   `npx supabase status`: Verifica o estado do Supabase local.
-   `npx supabase migration new <nome>`: Cria nova migração.

## 3. Localização de Ferramentas (Paths)
-   **MCP Config**: `C:\Users\User\.gemini\antigravity\mcp_config.json`
-   **Corpus**: `c:\git\kanban.2`

---
*Última atualização: 2026-04-02*
