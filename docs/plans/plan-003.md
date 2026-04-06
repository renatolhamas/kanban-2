# Plan 003: Resend Email Confirmation + Login Support Links

**Data:** 2026-04-04  
**Status:** Done (Transferred)  
**Owner:** @dev (implementação)  
**Decisão:** Supabase Auth nativo para reenvio (`supabase.auth.resend()`) — sem Resend externo

---

## ✅ Implementation Status

**Transferred to:** Story 1.3 (Email Confirmation Flow)  
**Implemented on:** 2026-04-04  
**Implementation Complete:** ✅ Yes  

This plan was successfully implemented and integrated into Story 1.3. All deliverables from this plan were implemented during Story 1.3 development including:
- Email confirmation page and API endpoint
- Resend confirmation functionality via Supabase Auth native
- Login support links  
- Error handling and user-friendly messaging for email send failures
- Toast notifications with persistent messaging

---

---

## ✅ Status de Implementação

| Item | Status | Data | Notas |
|------|--------|------|-------|
| Análise e planejamento | ✅ Completo | 2026-04-04 | — |
| Pesquisa API Supabase nativa | ✅ Completo | 2026-04-04 | `supabase.auth.resend()` confirmado |
| `docs/plans/plan-003.md` | ✅ Completo | 2026-04-04 | Este arquivo |
| `app/api/auth/resend-confirmation/route.ts` | ✅ Completo | 2026-04-04 | Endpoint com rate limiting |
| `components/ResendConfirmationForm.tsx` | ✅ Completo | 2026-04-04 | Formulário padrão |
| `app/(auth)/resend-confirmation/page.tsx` | ✅ Completo | 2026-04-04 | Layout idêntico ao /login |
| `components/LoginForm.tsx` | ✅ Completo | 2026-04-04 | Adicionar links "Password issues" |
| TypeScript compile | ✅ Completo | 2026-04-04 | ✅ Sem erros |
| ESLint linting | ✅ Completo | 2026-04-04 | ✅ Sem warnings |
| Testes e validação | ✅ Completo | 2026-04-05 | Email chegou, DB atualizado, login funcionou |

---

## 1. CONTEXTO

### O Problema
- Usuários que não receberam o email de confirmação não têm como solicitar reenvio
- Página `/login` não oferece suporte para problemas de acesso (senha/confirmação)
- Necessário fluxo self-service para reenvio sem depender de suporte manual

### A Solução
```
/login (modificado)
  └── Link "Resend Email Confirmation"
        └── /resend-confirmation (nova página)
              └── Usuário digita email
                    └── POST /api/auth/resend-confirmation
                          └── supabase.auth.resend({ type: 'signup', email })
                                └── Supabase envia email automaticamente ✅
```

### Por que Supabase nativo (não Resend)?
| Aspecto | Resend (registro) | Supabase nativo (reenvio) |
|---------|-------------------|--------------------------|
| Controle do template | Total | Supabase gerencia |
| Setup necessário | SMTP/domínio verificado | Zero config adicional |
| Caso de uso | Primeiro email (customizado) | Reenvio (funcional) |
| Complexidade | Alta | Mínima |

---

## 2. DETALHAMENTO TÉCNICO

### 2.1 Endpoint: POST /api/auth/resend-confirmation

**Arquivo:** `app/api/auth/resend-confirmation/route.ts`

```
Request: { email: string }
Response: 200 (sempre, mesmo se email não existir — previne enumeração)
```

**Fluxo:**
1. Rate limiting por email: reutiliza `checkEmailLimit()` de `lib/rate-limit.ts`
2. Validação de formato: `isValidEmail()` de `lib/auth.ts`
3. Chamada Supabase nativo:
   ```typescript
   const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)
   await supabase.auth.resend({
     type: 'signup',
     email,
     options: { emailRedirectTo: `${NEXT_PUBLIC_APP_DOMAIN}/login?confirmed=true` }
   })
   ```
4. Retorna 200 independente do resultado (segurança anti-enumeração)

### 2.2 Componente: ResendConfirmationForm

**Arquivo:** `components/ResendConfirmationForm.tsx`

Padrão idêntico ao `LoginForm.tsx`:
- State: `email`, `loading`, `error`, `success`
- Validação client-side com `isValidEmail()`
- Estado de sucesso inline após submit
- Link "Back to Login" → `/login`

### 2.3 Página: /resend-confirmation

**Arquivo:** `app/(auth)/resend-confirmation/page.tsx`

Layout copiado do `/login/page.tsx`:
- Fundo: `bg-[#f8fafc]`
- Card: `bg-white py-10 px-4 shadow-2xl shadow-gray-200/50 sm:rounded-3xl sm:px-12 border border-gray-100`
- Logo: quadrado azul `bg-blue-600 rounded-2xl` com ícone SVG kanban
- Título: **"Resend Confirmation"**
- Subtítulo: "Enter your email to receive a new confirmation link"

### 2.4 LoginForm: Links de suporte

**Arquivo:** `components/LoginForm.tsx`

Adicionar abaixo do link "Don't have an account?":
```
Password issues: Change Password or Resend Email Confirmation
```
- "Change Password" → `href="#"` (temporário, implementado em story futura)
- "Resend Email Confirmation" → `/resend-confirmation`

---

## 3. ARQUIVOS AFETADOS

| Arquivo | Ação | Reutiliza |
|---------|------|-----------|
| `app/api/auth/resend-confirmation/route.ts` | CRIAR | `checkEmailLimit()`, `isValidEmail()` |
| `components/ResendConfirmationForm.tsx` | CRIAR | padrão `LoginForm.tsx` |
| `app/(auth)/resend-confirmation/page.tsx` | CRIAR | layout `/login/page.tsx` |
| `components/LoginForm.tsx` | MODIFICAR | — |

---

## 4. CHECKLIST DE VERIFICAÇÃO

- [ ] `/login` exibe links "Password issues" abaixo de "Don't have an account?"
- [ ] Clicar "Resend Email Confirmation" redireciona para `/resend-confirmation`
- [ ] Página `/resend-confirmation` tem layout visual idêntico ao `/login`
- [ ] Digitar email não confirmado → mensagem de sucesso exibida
- [ ] Email de confirmação chega via Supabase nativo
- [ ] Clicar link no email → `confirmed_at` preenchido no Supabase
- [ ] Login funciona após confirmar via reenvio
- [ ] Email inexistente → retorna 200 (sem expor se email existe)
- [ ] Rate limit: 4ª tentativa mesmo email → 429 com `Retry-After`
- [ ] TypeScript compila sem erros
- [ ] Linting passa sem warnings
