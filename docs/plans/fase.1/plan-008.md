# Plan 008 — Diagnóstico e Correção da Instalação AIOX

**Data:** 2026-04-06  
**Status:** ✅ IMPLEMENTADO - Todas as correções aplicadas  
**Severidade:** MEDIUM - Aplicação não inicia, mas código está íntegro  
**Implementado por:** Renato Lhamas (correção manual)

---

## 📋 Situação Atual

### ✅ Diagnóstico Realizado

```
ERRO 1: Port 3017 Already in Use
- Causa: Processo anterior (PID 17684) ainda rodando
- Impacto: npm run dev não consegue iniciar
- Status: Detectado

ERRO 2: next.config.js Incompatibilidade
- Arquivo: C:\git\kanban.2\next.config.js
- Problema: Opção 'swcMinify' não é mais válida no Next.js 16.2.2
- Linha: 4
- Impacto: Aviso de configuração inválida
- Status: Detectado

AVISO: Dependências AIOX
- yarn, inquirer, fs-extra, @clack/prompts foram instaladas com sucesso
- package.json está OK
- node_modules está integro
```

### 📊 Package.json Status

```json
{
  "name": "kanban-app",
  "version": "0.1.0",
  "scripts": {
    "dev": "next dev -p 3017",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "jest",
    "typecheck": "tsc --noEmit"
  }
}
```

**Status:** ✅ Válido — Nenhuma modificação relacionada ao AIOX quebrou o package.json

---

## 🔧 Problemas Identificados

### Problema 1: Port 3017 Já em Uso

**Descrição:** Um processo anterior está rodando na porta 3017

**Sintomas:**
```
Error: listen EADDRINUSE: address already in use :::3017
```

**Causa Raiz:** Processo Node.js anterior não foi terminado (PID 17684)

**Solução Recomendada:**
```bash
# Opção A: Terminar processo específico
taskkill /PID 17684 /F

# Opção B: Terminar todos os Node.js
taskkill /F /IM node.exe

# Opção C: Usar porta diferente
npm run dev -- -p 3019
```

**Prioridade:** 🟡 MEDIUM - Bloqueia desenvolvimento local

---

### Problema 2: next.config.js com Opção Deprecated

**Descrição:** Opção `swcMinify` foi removida do Next.js 16.2.2

**Sintomas:**
```
⚠ Invalid next.config.js options detected:
⚠     Unrecognized key(s) in object: 'swcMinify'
```

**Arquivo:** `C:\git\kanban.2\next.config.js` (linhas 4)

**Causa Raiz:** Configuração legada de versões anteriores do Next.js

**Solução Recomendada:**

Remover a linha `swcMinify: true` do arquivo:

**Antes:**
```javascript
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,  // ❌ REMOVER ESTA LINHA
  experimental: {
    esmExternals: true,
  },
};
```

**Depois:**
```javascript
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    esmExternals: true,
  },
};
```

**Prioridade:** 🟡 MEDIUM - Gera aviso, mas aplicação continua funcionando

---

### Problema 3: Dependências do AIOX vs Instalação

**Status:** ✅ RESOLVIDO - Todas as dependências foram instaladas corretamente

```bash
✅ inquirer@13.3.2
✅ yaml@2.8.3
✅ fs-extra@11.3.4
✅ @clack/prompts@1.2.0
✅ Security vulnerabilities fixed (npm audit fix --force)
```

---

## ✅ Checklist de Correção

- [x] **Parar processo na porta 3017**
  ```bash
  taskkill /PID 17684 /F
  ```
  ✅ Correção manual realizada por Renato Lhamas

- [x] **Remover `swcMinify` do next.config.js**
  - Editar: `C:\git\kanban.2\next.config.js`
  - Remover linha 4: `swcMinify: true,`
  - Salvar arquivo
  ✅ Correção manual realizada por Renato Lhamas

- [x] **Testar npm run dev novamente**
  ```bash
  npm run dev
  # Deve iniciar em http://localhost:3017 sem erros
  ```
  ✅ Correção manual realizada por Renato Lhamas

- [x] **Verificar compilação**
  ```bash
  npm run build
  # Deve completar sem erros
  ```
  ✅ Correção manual realizada por Renato Lhamas

- [x] **Rodar testes (opcional)**
  ```bash
  npm run lint
  npm test
  ```
  ✅ Correção manual realizada por Renato Lhamas

---

## 📈 Próximas Ações Recomendadas

### Imediato (Hoje)

1. **Parar processo:**
   ```bash
   taskkill /PID 17684 /F
   ```

2. **Corrigir next.config.js** (remover swcMinify)

3. **Testar npm run dev:**
   ```bash
   npm run dev
   ```

4. **Verificar se aplicação inicia sem erros**

### Curto Prazo (Este Sprint)

1. Rodar qualidade completa: `npm run lint && npm test && npm run typecheck && npm run build`
2. Commit das mudanças: `git add . && git commit -m "fix: remove deprecated swcMinify from next.config.js"`
3. Executar pre-push quality gates: `@devops *pre-push`

### Documentação

- Atualizar `docs/SETUP.md` com informações sobre Next.js 16.x configuration
- Documentar deprecações conhecidas do Next.js

---

## 🎯 Conclusão

**A instalação do AIOX não quebrou a aplicação.** Os problemas são:

1. **Técnico (Port):** Processo antigo rodando na porta — fácil correção
2. **Configuração (Next.js):** Arquivo de config desatualizado — fácil correção

Ambos os problemas são **críticos para desenvolvimento local** mas **NÃO afetam** o código da aplicação ou o package.json.

**Tempo Estimado para Correção:** 5-10 minutos

**Risco:** ✅ BAIXO — Nenhuma perda de código

---

## 📝 Notas

- O AIOX foi instalado corretamente
- Todas as dependências críticas estão presentes
- Vulnerabilidades de segurança foram resolvidas (npm audit fix --force)
- O package.json está íntegro
- Nenhuma configuração do AIOX interferiu na aplicação

---

---

## 🎉 Status Final — Implementação Completa

**Data de Conclusão:** 2026-04-06  
**Implementado por:** Renato Lhamas (correção manual)  
**Status:** ✅ TODAS AS CORREÇÕES APLICADAS COM SUCESSO

### Resumo de Implementação

Todos os itens do checklist foram implementados manualmente:

1. ✅ Processo na porta 3017 encerrado
2. ✅ Arquivo `next.config.js` corrigido (removido `swcMinify: true`)
3. ✅ Aplicação testada com sucesso (`npm run dev`)
4. ✅ Compilação verificada (`npm run build`)
5. ✅ Testes e linting executados com sucesso

**Resultado:** A aplicação está funcionando corretamente sem erros de configuração ou porta.

— Dex, registrando implementação 🔨
