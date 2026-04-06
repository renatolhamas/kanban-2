# Plan 007: Padronizar Página /register Conforme design.login.md

**Data:** 2026-04-05  
**Prioridade:** Alta  
**Objetivo:** Fazer a página `/register` seguir exatamente o padrão de `/login` conforme especificado em `design.login.md`

---

## ✅ STATUS DE IMPLEMENTAÇÃO

| Status | Data | Executor | Notas |
|--------|------|----------|-------|
| ✅ **IMPLEMENTADO** | 2026-04-05 | @dev (Dex) | Plan 007 foi completamente implementado. Todas as mudanças foram aplicadas conforme especificado. |

### Resumo da Implementação
- ✅ Refatorado `app/(auth)/register/page.tsx` com dynamic import
- ✅ Criado `components/RegisterPageContent.tsx` (espelho de LoginPageContent)
- ✅ Atualizado `components/RegisterForm.tsx` com estilos padrão
- ✅ Verificado `components/PasswordInput.tsx` e `components/FormError.tsx`
- ✅ Todos os 13 passos de mudança aplicados
- ✅ Testes funcionais confirmados
- ✅ Página `/register` agora segue exatamente o padrão de `/login`

---

## 📊 ANÁLISE COMPARATIVA: /login vs /register

### Padrão de Referência (/login - LoginPageContent.tsx)
```
✅ Container Global:    min-h-screen bg-[#f8fafc] flex flex-col justify-center py-12
✅ Logo + Header:       Centralizado com logo azul, h2 titulo, p subtítulo
✅ Card:                mt-8 py-10 px-4 shadow-2xl shadow-gray-200/50 sm:rounded-3xl sm:px-12
✅ Form:                space-y-5
✅ Labels:              text-sm font-semibold text-gray-700 ml-1
✅ Inputs:              bg-gray-50 border border-gray-200 rounded-xl focus:ring-blue-500/20
✅ Botão:               py-3 rounded-xl shadow-lg shadow-blue-500/25 active:scale-[0.98]
✅ Error:               mt-6 p-4 bg-red-50/50 border-red-100 rounded-2xl animate-in
✅ Success:             Toast component
```

### Situação Atual (/register - RegisterPage.tsx + RegisterForm.tsx)
```
❌ Container:    bg-gradient-to-br from-blue-50 to-indigo-100 (GRADIENTE - ERRADO)
❌ Logo:         AUSENTE (deveria ter logo azul como em /login)
❌ Header:       h1 inline no card, sem estrutura separada (ERRADO)
❌ Card:         rounded-lg shadow-xl p-8 (ESPAÇAMENTO/SHADOW ERRADO)
❌ Form:         space-y-4 (deveria ser space-y-5)
❌ Labels:       font-medium (deveria ser font-semibold), mb-2 (deveria ser ml-1)
❌ Inputs:       border-gray-300 falta bg-gray-50, rounded-lg (deveria ser rounded-xl)
❌ Botão:        py-2 rounded-lg (deveria ser py-3 rounded-xl), falta shadow
❌ Error:        FormError OK, mas card adicional de Terms abaixo
❌ Success:      Renderiza inline em verde (deveria usar Toast)
❌ Card Extra:   Terms of Service card (não está no padrão, deve ser removido)
```

---

## 🔧 PASSO A PASSO PARA PADRONIZAR

### PASSO 1: Refatorar `app/(auth)/register/page.tsx`
**Arquivo:** `app/(auth)/register/page.tsx`

Transformar de página "use client" inline para usar componente `RegisterPageContent.tsx` com dynamic import (como /login).

**Mudanças:**
```tsx
// ATUAL (ERRADO):
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { RegisterForm } from "@/components/RegisterForm";

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  const handleRegister = async (...) => { ... }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 ...">
      ...
    </div>
  );
}

// NOVO (CORRETO):
import dynamic from "next/dynamic";

const RegisterPageContent = dynamic(
  () => import("@/components/RegisterPageContent"),
  {
    ssr: false,
    loading: () => <div>Loading...</div>,
  }
);

export default function RegisterPage() {
  return <RegisterPageContent />;
}
```

**Razão:** Seguir exatamente o padrão de /login. Lógica de forma é centralizada em componente reutilizável.

---

### PASSO 2: Criar novo componente `components/RegisterPageContent.tsx`
**Arquivo (NOVO):** `components/RegisterPageContent.tsx`

Espelhar estrutura de `LoginPageContent.tsx` com as seguintes características:

**Template:**
```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RegisterForm } from "@/components/RegisterForm";
import { Toast } from "@/components/Toast";

export default function RegisterPageContent() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleRegister = async (
    email: string,
    name: string,
    password: string,
  ) => {
    try {
      setError(null);

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, name, password }),
        credentials: "include", // Send cookies
      });

      const data = await response.json();

      // Handle email send failure (keep user alive, redirect to resend-confirmation)
      if (data.email_send_failed) {
        router.push(
          `/resend-confirmation?error=email_send_failed&email=${encodeURIComponent(email)}`,
        );
        return;
      }

      if (!response.ok) {
        const errorMessage = data.error || "Registration failed";
        setError(errorMessage);
        throw new Error(errorMessage);
      }

      // Show success message and reset form via RegisterForm
      setSuccessMessage("Account created! Please check your email to confirm.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
      throw err;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/30">
            <svg
              className="w-7 h-7 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
          </div>
        </div>
        <h2 className="text-center text-3xl font-extrabold text-gray-900 tracking-tight">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Join Kanban to manage your boards
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-4 shadow-2xl shadow-gray-200/50 sm:rounded-3xl sm:px-12 border border-gray-100">
          <RegisterForm onSubmit={handleRegister} />

          {error && (
            <div className="mt-6 p-4 bg-red-50/50 border border-red-100 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {successMessage && (
        <Toast
          message={successMessage}
          type="success"
          onClose={() => setSuccessMessage(null)}
        />
      )}
    </div>
  );
}
```

**Razão:** Centraliza lógica de página em componente reutilizável, permitindo SSR=false, igual a /login.

---

### PASSO 3: Refatorar `components/RegisterForm.tsx`

**Mudanças NO ARQUIVO:**

#### 3.1. Remover Success Message Inline
**De:**
```tsx
if (success) {
  return (
    <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
      <p className="text-green-700 font-semibold">Registration successful!</p>
      ...
    </div>
  );
}
```

**Para:** Remover completamente. Success será gerenciado por RegisterPageContent via Toast.

**Razão:** Padrão de /login usa Toast para sucesso, não inline.

---

#### 3.2. Atualizar Form Container
**De:**
```tsx
<form onSubmit={handleSubmit} className="space-y-4">
```

**Para:**
```tsx
<form onSubmit={handleSubmit} className="space-y-5">
```

**Razão:** Padrão especifica `space-y-5`.

---

#### 3.3. Atualizar Estilos de Labels
**De:**
```tsx
<label
  htmlFor="email"
  className="block text-sm font-medium text-gray-700 mb-2"
>
```

**Para:**
```tsx
<label
  htmlFor="email"
  className="block text-sm font-semibold text-gray-700 ml-1"
>
```

**Razão:** Padrão especifica `font-semibold` e `ml-1` (margin-left).

**Aplicar em:** email, name, confirmPassword labels (3 ocorrências).

---

#### 3.4. Atualizar Inputs de Texto (email, name)
**De:**
```tsx
<input
  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
/>
```

**Para:**
```tsx
<input
  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 placeholder:text-gray-400 disabled:bg-gray-50 disabled:text-gray-500"
/>
```

**Aplicar em:** email input (linha 105), name input (linha 124).

**Razão:** Padrão especifica estilos mais refinados com bg-gray-50, ring/20, rounded-xl, etc.

---

#### 3.5. Atualizar Input Confirm Password
**De:**
```tsx
<input
  className={`
    w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
    ${!passwordsMatch && confirmPassword ? "border-red-500" : "border-gray-300"}
  `}
/>
```

**Para:**
```tsx
<input
  className={`
    w-full px-4 py-2.5 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 placeholder:text-gray-400 disabled:bg-gray-50 disabled:text-gray-500
    ${!passwordsMatch && confirmPassword ? "border-red-500" : "border border-gray-200"}
  `}
/>
```

**Razão:** Manter consistência com outros inputs.

---

#### 3.6. Atualizar Botão Submit
**De:**
```tsx
<button
  type="submit"
  disabled={!isFormValid || loading}
  className={`
    w-full py-2 rounded-lg font-semibold text-white transition
    ${
      isFormValid && !loading
        ? "bg-blue-600 hover:bg-blue-700 cursor-pointer"
        : "bg-gray-400 cursor-not-allowed"
    }
  `}
>
  {loading ? "Creating account..." : "Register"}
</button>
```

**Para:**
```tsx
<button
  type="submit"
  disabled={!isFormValid || loading}
  className={`
    w-full py-3 rounded-xl font-bold transition-all duration-300 transform active:scale-[0.98]
    ${
      isFormValid && !loading
        ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/25 cursor-pointer"
        : "bg-gray-300 text-gray-700 cursor-not-allowed opacity-100"
    }
  `}
>
  {loading ? (
    <div className="flex items-center justify-center space-x-2">
      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
      <span>Processing...</span>
    </div>
  ) : (
    "Register"
  )}
</button>
```

**Razão:** Padrão especifica `py-3`, `rounded-xl`, `font-bold`, `active:scale-[0.98]`, shadow específico. Loading state com spinner.

---

#### 3.7. Mover PasswordInput para Form Padrão
O componente `PasswordInput` já está sendo usado (linha 136-144). Verificar se está seguindo padrão de labels.

**Verificar em:** Se PasswordInput segue padrão `font-semibold text-gray-700 ml-1`.

---

#### 3.8. Atualizar Footer Link
**De:**
```tsx
<p className="text-center text-sm text-gray-600">
  Already have an account?{" "}
  <a href="/login" className="text-blue-600 hover:underline">
    Login here
  </a>
</p>
```

**Para:**
```tsx
<p className="pt-2 text-center text-sm text-gray-500">
  Already have an account?{" "}
  <a href="/login" className="font-medium text-blue-600 hover:text-blue-700 transition-colors">
    Login here
  </a>
</p>
```

**Razão:** Padrão especifica `pt-2`, `text-gray-500`, `font-medium` na âncora, e `transition-colors`.

---

#### 3.9. Remover FormError Inline se Existir
Se RegisterForm renderiza FormError internamente, mover para RegisterPageContent (será renderizado fora do card).

**Atual:** `{error && <FormError message={error} />}` na linha 96.

**Mudar:** Remover desta linha. Erro será gerenciado por RegisterPageContent.

---

### PASSO 4: Verificar e Atualizar Componente PasswordInput
**Arquivo:** `components/PasswordInput.tsx`

**Verificações:**
- [ ] Label segue padrão: `block text-sm font-semibold text-gray-700 ml-1`
- [ ] Input segue padrão de cores e borders
- [ ] Placeholder e disabled states corretos
- [ ] Requirements text segue padrão

Se não seguir, aplicar mesmo padrão de estilos das mudanças acima.

---

### PASSO 5: Verificar FormError.tsx
**Arquivo:** `components/FormError.tsx`

Confirmar que segue o padrão:
```tsx
<div className="mt-6 p-4 bg-red-50/50 border border-red-100 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300">
  <div className="flex">
    <div className="flex-shrink-0">
      <svg className="h-5 w-5 text-red-400" ...>
    </div>
    <div className="ml-3">
      <p className="text-sm font-medium text-red-800">{message}</p>
    </div>
  </div>
</div>
```

Se não segue, atualizar.

---

### PASSO 6: Atualizar RegisterPageContent.tsx - Tratar Success
Na função `handleRegister`, após sucesso:

```tsx
// Success: mostrar Toast e resetar form
setSuccessMessage("Account created! Please check your email to confirm.");
// RegisterForm receberá callback ou estado será resetado
```

Certificar que RegisterForm recebe sinal de sucesso e reseta seus campos (email, name, password, confirmPassword).

---

### PASSO 7: Testes de Validação

Após aplicar todas as mudanças, testar:

**Testes Funcionais:**
- [ ] Página /register carrega sem erros
- [ ] Logo aparece centralizado (azul com ícone user+)
- [ ] Título "Create your account" aparece
- [ ] Formulário valida corretamente
- [ ] Erro de validação mostra em vermelho fora do card
- [ ] Botão desabilitado até form ser válido
- [ ] Loading spinner aparece ao submeter
- [ ] Sucesso mostra Toast (não inline)
- [ ] Link "Login here" funciona
- [ ] Email validation, name validation, password requirements funcionam

**Testes Visuais:**
- [ ] Background é #f8fafc (não gradient)
- [ ] Card tem padding py-10 px-4, sm:px-12
- [ ] Card tem shadow-2xl shadow-gray-200/50
- [ ] Inputs tem bg-gray-50, border-gray-200, rounded-xl
- [ ] Botão tem py-3, rounded-xl, shadow-lg shadow-blue-500/25
- [ ] Labels tem font-semibold, ml-1
- [ ] Espaçamento form é space-y-5
- [ ] Animação error é slide-in-from-top-2
- [ ] Cursor feedback no botão (active:scale-[0.98])

**Testes de Responsividade:**
- [ ] Mobile (< 640px)
- [ ] Tablet (640px - 1024px)
- [ ] Desktop (> 1024px)

---

## 📋 RESUMO DAS MUDANÇAS

| Arquivo | Mudança | Tipo |
|---------|---------|------|
| `app/(auth)/register/page.tsx` | Refatorar para usar dynamic import + RegisterPageContent | REFACTOR |
| `components/RegisterPageContent.tsx` | CRIAR novo (espelho de LoginPageContent) | CREATE |
| `components/RegisterForm.tsx` | Atualizar estilos/spacing conforme padrão | UPDATE |
| `components/PasswordInput.tsx` | Verificar/atualizar estilos se necessário | VERIFY |
| `components/FormError.tsx` | Verificar conformidade com padrão | VERIFY |

---

## ✅ CRITÉRIO DE CONCLUSÃO

Plan 007 está **CONCLUÍDO** quando:

1. ✅ `/register` page usa RegisterPageContent (dynamic import)
2. ✅ RegisterPageContent.tsx existe e espelha LoginPageContent
3. ✅ RegisterForm.tsx segue todos os padrões de estilos (space-y-5, labels, inputs, botão)
4. ✅ Background é #f8fafc (não gradient)
5. ✅ Logo azul aparece no topo
6. ✅ Error messages renderizam com animação slide-in-from-top-2 FORA do card
7. ✅ Success usa Toast (não inline)
8. ✅ Card container segue padrão exato (py-10 px-4 sm:px-12, shadow, border)
9. ✅ Inputs seguem padrão (bg-gray-50, border-gray-200, rounded-xl, ring-blue-500/20)
10. ✅ Botão segue padrão (py-3, rounded-xl, active:scale-[0.98], shadow-lg shadow-blue-500/25)
11. ✅ Testes funcionais passam (validação, submissão, sucesso)
12. ✅ Testes visuais confirmam (cores, spacing, shadows, animações)
13. ✅ Responsividade testada em mobile/tablet/desktop

---

## 🔗 REFERÊNCIAS

- Design Padrão: `docs/plans/design.login.md`
- Página Referência: `/login` (LoginPageContent.tsx)
- Página a Padronizar: `/register` (RegisterPageContent.tsx + RegisterForm.tsx)

---

**Autor:** Atlas (Analyst)  
**Data:** 2026-04-05  
**Status:** Pronto para Implementação
