🔍 Prompt: Diagnóstico e Correção de Hooks com Caminhos Incorretos

Contexto do Problema  
 Você estava recebendo um erro: UserPromptSubmit hook error toda vez que enviava uma mensagem para o Claude Code.

---

O Que Você Pediu

"Verifica pra mim por favor em todos os arquivos deste projeto e me fala se por acaso o que
está tentando procurar apenas mudou de lugar"

---

O Que Descobri (Passo a Passo)

Passo 1: Busca Inicial

Procurei por "hook" em todos os arquivos do projeto (.json, .yaml, .md, .js, .ts).

Resultado: Encontrei 184 arquivos com menção a "hook".

Passo 2: Foco na Origem do Erro

Procurei especificamente por:

- on-prompt-submit
- UserPromptSubmit
- before-toolcall

Resultado: Encontrei apenas 4 arquivos relevantes:

1. .claude/settings.local.json ⭐ CULPADO
2. .claude/hooks/README.md
3. .aiox-core/core/synapse/runtime/hook-runtime.js
4. .aiox-core/core/synapse/diagnostics/collectors/hook-collector.js

Passo 3: Análise do Arquivo Suspeito

Abri .claude/settings.local.json e descobri:

"hooks": {
"UserPromptSubmit": [
{
"command": "node \"C:\\\\git\\\\rent\\\\.claude\\\\hooks\\\\synapse-engine.cjs\""
}
]
}

Problema: O caminho aponta para C:\git\rent\ (projeto antigo), mas os hooks realmente estão
em C:\git\kanban.2\!

Passo 4: Descoberta de Múltiplos Hooks Afetados

Encontrei 3 hooks apontando para o caminho errado:

┌───────┬───────────────────────────────┬─────────────────┬─────────────────────┐
│ Linha │ Hook │ Caminho Errado │ Caminho Certo │
├───────┼───────────────────────────────┼─────────────────┼─────────────────────┤
│ 30 │ code-intel-pretool.cjs │ C:\git\rent\... │ C:\git\kanban.2\... │
├───────┼───────────────────────────────┼─────────────────┼─────────────────────┤
│ 41 │ precompact-session-digest.cjs │ C:\git\rent\... │ C:\git\kanban.2\... │
├───────┼───────────────────────────────┼─────────────────┼─────────────────────┤
│ 52 │ synapse-engine.cjs │ C:\git\rent\... │ C:\git\kanban.2\... │
└───────┴───────────────────────────────┴─────────────────┴─────────────────────┘

Passo 5: Validação

Procurei pelos hooks no projeto atual:

.claude/hooks/
├── code-intel-pretool.cjs ✅ EXISTE
├── precompact-session-digest.cjs ✅ EXISTE
├── synapse-engine.cjs ✅ EXISTE
└── README.md

Confirmação: Os arquivos existem, mas estavam sendo procurados no lugar errado!

---

Como Corrigi

Operação 1: Corrigir code-intel-pretool.cjs (linha 30)

OLD: "node \"C:\\\\git\\\\rent\\\\.claude\\\\hooks\\\\code-intel-pretool.cjs\""
NEW: "node \"C:\\\\git\\\\kanban.2\\\\.claude\\\\hooks\\\\code-intel-pretool.cjs\""

Operação 2: Corrigir synapse-engine.cjs (linha 52)

OLD: "node \"C:\\\\git\\\\rent\\\\.claude\\\\hooks\\\\synapse-engine.cjs\""
NEW: "node \"C:\\\\git\\\\kanban.2\\\\.claude\\\\hooks\\\\synapse-engine.cjs\""

Operação 3: Corrigir precompact-session-digest.cjs (linha 41)

OLD: "node \"C:\\\\git\\\\rent\\\\.claude\\\\hooks\\\\precompact-session-digest.cjs\""
NEW: "node \"C:\\\\git\\\\kanban.2\\\\.claude\\\\hooks\\\\precompact-session-digest.cjs\""

---

Resultado Final

Arquivo .claude/settings.local.json agora aponta para o diretório correto:

{
"hooks": {
"PreToolUse": [
{
"matcher": "Write|Edit",
"hooks": [
{
"command": "node
\"C:\\\\git\\\\kanban.2\\\\.claude\\\\hooks\\\\code-intel-pretool.cjs\""
}
]
}
],
"PreCompact": [
{
"hooks": [
{
"command": "node
\"C:\\\\git\\\\kanban.2\\\\.claude\\\\hooks\\\\precompact-session-digest.cjs\""
}
]
}
],
"UserPromptSubmit": [
{
"hooks": [
{
"command": "node
\"C:\\\\git\\\\kanban.2\\\\.claude\\\\hooks\\\\synapse-engine.cjs\""
}
]
}
]
}
}

---

Por Que o Erro Parou

Antes:
UserPromptSubmit ⟶ Tenta rodar C:\git\rent\...synapse-engine.cjs ⟶ ARQUIVO NÃO EXISTE ⟶
ERRO

Depois:
UserPromptSubmit ⟶ Tenta rodar C:\git\kanban.2\...synapse-engine.cjs ⟶ ARQUIVO EXISTE ✅ ⟶
SUCESSO

---

Lição Aprendida

Quando você migra um projeto de uma pasta para outra, é fácil esquecer de atualizar:

- ✅ Caminhos nos settings.local.json
- ✅ Configurações que apontam para arquivos
- ✅ Referências hardcoded em scripts

Solução: Sempre buscar por caminhos antigos quando um projeto muda de diretório! 🎯
