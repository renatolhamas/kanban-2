# Plan-006: Implementar Fluxo de Reset de Senha (Forgot Password)

**Data:** 2026-04-05  
**Responsável:** @dev  
**Referência:** Design System - `design.login.md`  
**Documentação Supabase:** Password Recovery via Email

---

## 🎯 Objetivo

Implementar um fluxo completo de reset de senha com duas páginas:

1. **`/forgot-password`** — Página que solicita o email do usuário
2. **`/change-password`** — Página para definir a nova senha (ativada via link de email)

---

## 📋 Visão Geral do Fluxo

```
1. Usuário clica em "Esqueci minha senha" na página de login
2. Vai para /forgot-password e digita seu email
3. API valida email e rate-limit, envia email via Supabase
4. Usuário recebe email com link: /change-password?token=<recovery_token>
5. Usuário clica no link, redirecionado para /change-password
6. Preenche nova senha e confirmação
7. API verifica token via Supabase e atualiza senha
8. Sucesso → redireciona para /login com mensagem de confirmação
```

---

## 🏗️ Arquitetura

### Páginas (Server-Side Rendering)

**`app/(auth)/forgot-password/page.tsx`**
- Componente servidor que renderiza `ForgotPasswordPageContent`
- Carregamento dinâmico com `ssr: false` (mesmo padrão de `resend-confirmation`)

**`app/(auth)/change-password/page.tsx`**
- Componente servidor que renderiza `ChangePasswordPageContent`
- Extrai token dos query parameters (ex: `?token=abc123`)
- Passa token como prop ao componente cliente

### Componentes de UI (Client-Side)

**`components/ForgotPasswordPageContent.tsx`**
- Layout idêntico ao padrão em `ResendConfirmationPageContent.tsx`
- Estado: `email`, `loading`, `success`, `error`
- Renderiza `ForgotPasswordForm` + erros + Toast

**`components/ForgotPasswordForm.tsx`**
- Formulário com campo email
- Integra com `/api/auth/forgot-password`
- Validação de email antes de submit
- Feedback de carregamento e sucesso

**`components/ChangePasswordPageContent.tsx`**
- Layout idêntico ao padrão
- Estado: `newPassword`, `confirmPassword`, `loading`, `success`, `error`, `invalidToken`
- Renderiza `ChangePasswordForm` + erros

**`components/ChangePasswordForm.tsx`**
- Formulário com campos: nova senha e confirmação
- Validação de match entre os campos
- Requisitos de senha mínimos (8+ caracteres)
- Integra com `/api/auth/change-password`
- Mensagem de erro se token inválido/expirado

### Rotas de API

**`app/api/auth/forgot-password/route.ts`**
- **Method:** POST
- **Body:** `{ email: string }`
- **Fluxo:**
  1. Validar formato do email
  2. Rate-limit por email (3 tentativas em 60 minutos)
  3. Chamar `supabase.auth.resetPasswordForEmail(email)`
  4. Log de sucesso/erro
  5. Sempre retornar 200 (previne enumeration de usuários)
  
**`app/api/auth/change-password/route.ts`**
- **Method:** POST
- **Body:** `{ token: string, password: string, passwordConfirm: string }`
- **Fluxo:**
  1. Validar formato de token e senhas
  2. Validação de match entre password e passwordConfirm
  3. Requisitos mínimos: 8+ caracteres
  4. Chamar `supabase.auth.verifyOtp()` para validar token (tipo "recovery")
  5. Se válido, chamar `supabase.auth.updateUser({ password })`
  6. Log de sucesso/erro
  7. Retornar erro 400 se token inválido
  8. Retornar sucesso 200 se tudo OK

---

## 🎨 Design (Design System)

Ambas as páginas seguem o padrão definido em `design.login.md`:

### Container Global
```tsx
<div className="min-h-screen bg-[#f8fafc] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
```

### Header (Logo + Título)
```tsx
<div className="sm:mx-auto sm:w-full sm:max-w-md">
  <div className="flex justify-center mb-6">
    <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/30">
      <svg className="w-7 h-7 text-white" />
    </div>
  </div>
  <h2 className="text-center text-3xl font-extrabold text-gray-900 tracking-tight">
    {title}
  </h2>
  <p className="mt-2 text-center text-sm text-gray-600">
    {subtitle}
  </p>
</div>
```

### Card Form
```tsx
<div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
  <div className="bg-white py-10 px-4 shadow-2xl shadow-gray-200/50 sm:rounded-3xl sm:px-12 border border-gray-100">
    {/* Conteúdo */}
  </div>
</div>
```

### Inputs
```tsx
<input 
  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 placeholder:text-gray-400 disabled:bg-gray-50 disabled:text-gray-500"
/>
```

### Botões
- Ativo: `bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/25`
- Desabilitado: `bg-gray-300 text-gray-700 cursor-not-allowed`

### Erros
```tsx
<div className="mt-6 p-4 bg-red-50/50 border border-red-100 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300">
  {/* Ícone + mensagem */}
</div>
```

### Links de Navegação
```tsx
<Link href="/login" className="font-medium text-blue-600 hover:text-blue-700 transition-colors">
  Back to Login
</Link>
```

---

## 📝 Detalhes de Implementação

### `/forgot-password` — Página 1

**Título:** "Reset Your Password"  
**Subtítulo:** "Enter your email address and we'll send you a link to reset your password"

**Campos do Formulário:**
- Email (text input, required, validação de formato)

**Estados:**
- Inicial: Mostrar formulário vazio
- Carregando: Desabilitar input e botão, exibir spinner
- Sucesso: Mostrar mensagem verde com Toast e link para /login
- Erro: Mostrar alerta vermelho com mensagem (ex: "Too many attempts, try again in 5 minutes")

**Link Extra:**
- "Back to Login" → `/login`

---

### `/change-password` — Página 2

**URL:** `/change-password?token={recovery_token}`

**Título:** "Create New Password"  
**Subtítulo:** "Set a new password for your account"

**Campos do Formulário:**
- New Password (password input, 8+ caracteres)
- Confirm Password (password input, deve match)

**Validações:**
- Senha deve ter 8+ caracteres
- Confirmação deve ser idêntica à senha
- Botão desabilitado enquanto não atender requisitos

**Estados:**
- Token inválido/expirado → Mostrar erro e link para /forgot-password
- Carregando: Desabilitar inputs e botão
- Sucesso: Mostrar mensagem verde e redirecionar para /login após 2s
- Erro: Mostrar alerta (ex: "Failed to update password")

**Link Extra:**
- "Back to Login" → `/login`
- (Se token inválido) "Request new reset link" → `/forgot-password`

---

## 🔐 Segurança

1. **Rate Limiting:**
   - `/forgot-password` API: 3 tentativas por email em 60 minutos
   - Usa `checkEmailLimit()` (já existe em `lib/rate-limit.ts`)
   - Retorna 429 se limite excedido

2. **Prevenção de Enumeration:**
   - `/forgot-password` sempre retorna 200, mesmo se email não existe
   - Mensagem genérica: "If that email exists, we've sent a reset link"

3. **Token Expiration:**
   - Supabase gerencia expiração de tokens (padrão 1 hora)
   - Mensagem clara se token expirou

4. **Validação Lado-Servidor:**
   - Todas as validações duplicadas na API
   - Nunca confiar em validação client-side

5. **HTTPS/Secure Cookies:**
   - Usar `secure` flag em production
   - Usar `SameSite=Lax`

---

## 📦 Dependências Requeridas

Já existem no projeto:
- `@supabase/supabase-js` — Client Supabase
- `next` — Next.js
- `react` — React

Não há novas dependências necessárias.

---

## ✅ Checklist de Implementação

### Fase 1: Componentes & UI
- [x] Criar `components/ForgotPasswordPageContent.tsx`
- [x] Criar `components/ForgotPasswordForm.tsx`
- [x] Criar `components/ChangePasswordPageContent.tsx`
- [x] Criar `components/ChangePasswordForm.tsx`
- [x] Criar `app/(auth)/forgot-password/page.tsx`
- [x] Criar `app/(auth)/change-password/page.tsx`

### Fase 2: Rotas de API
- [x] Criar `app/api/auth/forgot-password/route.ts`
- [x] Criar `app/api/auth/change-password/route.ts`
- [x] Adicionar testes unitários para ambas as rotas

### Fase 3: Validação & Integração
- [x] Testar fluxo completo end-to-end
- [x] Validar rate limiting
- [x] Validar token expirado
- [x] Testar mensagens de erro
- [x] Verificar styling contra design.login.md

### Fase 4: Documentação
- [x] Atualizar README com instruções de reset de senha
- [x] Adicionar link "Esqueci minha senha" na página de login
- [x] Documentar environment variables (se necessário)

---

## 🔗 Links de Referência

**Documentação Supabase:**
- Password Reset: https://supabase.com/docs/guides/auth/passwords
- Reset Password for Email: https://supabase.com/docs/reference/javascript/auth-resetpasswordforemail
- Verify OTP: https://supabase.com/docs/reference/javascript/auth-verifyotp

**Padrões do Projeto:**
- Design System: `docs/plans/design.login.md`
- Resend Confirmation: `app/(auth)/resend-confirmation/` (referência)
- Rate Limiting: `lib/rate-limit.ts`

---

## 🚀 Próximos Passos

1. Revisar esta proposta com o time (@po, @qa)
2. Executar Fase 1 (componentes)
3. Executar Fase 2 (APIs)
4. Executar Fase 3 (testes)
5. Executar Fase 4 (documentação)

**Status:** Ready for Review (@dev concluído)
