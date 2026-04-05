# Plan 004: Alinhamento de Padrão UI — `/resend-confirmation` → `/login`

**Data:** 2026-04-05  
**Analista:** Atlas (Analyst Agent)  
**Status:** Estudo Completo — Pronto para Implementação

---

## ⚠️ RESTRIÇÃO CRÍTICA

**🚫 NÃO ALTERAR `/login` EM HIPÓTESE ALGUMA**

- ✅ `/login` é a página **PADRÃO DE REFERÊNCIA** — deve permanecer intocada
- ✅ Todas as mudanças devem ser **APENAS em `/resend-confirmation`**
- ✅ Usar `/login` apenas como **modelo visual e estrutural**
- ✅ Nenhuma alteração em:
  - `app/(auth)/login/page.tsx` ← **BLOQUEADO**
  - `components/LoginPageContent.tsx` ← **BLOQUEADO**
  - `components/LoginForm.tsx` ← **BLOQUEADO**

**Escopo:** Apenas `/resend-confirmation` será modificada para seguir o padrão do `/login`.

---

## 📋 Resumo Executivo

A página `/login` segue um padrão de layout mais robusto e profissional, com:
- Estrutura de componente externo reutilizável
- Responsividade completa com breakpoints (sm, lg)
- Logo com sombra profunda
- Tratamento de mensagens com Toast component
- Semântica HTML melhorada

A página `/resend-confirmation` possui layout inline no `page.tsx`, logo minimalista e tratamento de mensagens inconsistente.

**Impacto:** 10 alterações estruturais + 3 alterações de padrão de componentes.

---

## 🔄 Estrutura Atual vs Esperada

### Página `/login` (🔒 PADRÃO — INTOCÁVEL)

```
app/(auth)/login/page.tsx
  └─ LoginPageContent (dynamic import, ssr: false)
       └─ LoginPageContent.tsx (client component)
            ├─ Main container: flex flex-col justify-center
            ├─ Logo: w-12 h-12, shadow-xl shadow-blue-500/30
            ├─ Título: h2, text-3xl font-extrabold
            ├─ Subtítulo: text-sm
            ├─ Card: mt-8, py-10 px-4, shadow-2xl
            ├─ LoginForm component
            ├─ Erro inline: red-50 border red-100 (com animação)
            └─ Success: Toast component (externa)
```

### Página `/resend-confirmation` (ATUAL)

```
app/(auth)/resend-confirmation/page.tsx
  ├─ Layout inline no page.tsx
  ├─ Container: flex items-center justify-center
  ├─ Logo: p-3 (sem sombra)
  ├─ Título: h1, text-2xl font-bold
  ├─ Subtítulo: text-center
  └─ ResendConfirmationFormDynamic (import estranho com .then())
```

---

## 🛠️ Alterações Requeridas

### **CAMADA 1: Refatoração de Estrutura (page.tsx)**

#### ✏️ Alteração 1.1: Simplificar o `page.tsx` — Remover layout inline

**Arquivo:** `app/(auth)/resend-confirmation/page.tsx`

**Mudança:**
```tsx
// ❌ ANTES: Layout inline no page.tsx (linhas 16-48)
export default function ResendConfirmationPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white py-10 px-4 shadow-2xl shadow-gray-200/50 sm:rounded-3xl sm:px-12 border border-gray-100">
        {/* Logo, Título, Subtítulo aqui */}
        <ResendConfirmationFormDynamic />
      </div>
    </div>
  );
}

// ✅ DEPOIS: Extrair para componente (padrão login)
const ResendConfirmationPageContent = dynamic(
  () => import("@/components/ResendConfirmationPageContent"),
  {
    ssr: false,
    loading: () => <div>Loading...</div>,
  }
);

export default function ResendConfirmationPage() {
  return <ResendConfirmationPageContent />;
}
```

**Justificativa:** Padrão idêntico ao `/login`. Permite reutilização e separação de responsabilidades.

---

#### ✏️ Alteração 1.2: Corrigir o dynamic import — Usar método padrão

**Arquivo:** `app/(auth)/resend-confirmation/page.tsx` (linha 8-14)

**Mudança:**
```tsx
// ❌ ANTES: Método estranho com .then()
const ResendConfirmationFormDynamic = dynamic(
  () => import("@/components/ResendConfirmationForm").then(m => ({ default: m.ResendConfirmationForm })),
  {
    ssr: false,
    loading: () => <div>Loading...</div>,
  }
);

// ✅ DEPOIS: Método direto (padrão login)
const ResendConfirmationPageContent = dynamic(
  () => import("@/components/ResendConfirmationPageContent"),
  {
    ssr: false,
    loading: () => <div>Loading...</div>,
  }
);
```

**Justificativa:** O LoginPageContent é exportado como `default`, não como named export. Simplifica código e segue padrão.

---

### **CAMADA 2: Novo Componente — ResendConfirmationPageContent**

#### ✏️ Alteração 2.1: Criar novo arquivo `ResendConfirmationPageContent.tsx`

**Arquivo:** `components/ResendConfirmationPageContent.tsx` (NOVO)

**Estrutura esperada:**
```tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ResendConfirmationForm } from "@/components/ResendConfirmationForm";
import { Toast } from "@/components/Toast";

export default function ResendConfirmationPageContent() {
  const searchParams = useSearchParams();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSuccess = () => {
    setSuccessMessage("Confirmation email sent! Check your inbox.");
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Estrutura idêntica ao LoginPageContent */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          {/* Logo com sombra — IDÊNTICO ao login */}
        </div>
        <h2 className="text-center text-3xl font-extrabold text-gray-900 tracking-tight">
          Resend Confirmation
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Enter your email to receive a new confirmation link
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-4 shadow-2xl shadow-gray-200/50 sm:rounded-3xl sm:px-12 border border-gray-100">
          <ResendConfirmationForm onSuccess={handleSuccess} />
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

**Pontos-chave:**
- ✅ Padrão idêntico ao `LoginPageContent.tsx`
- ✅ Usa `Toast` component para mensagens de sucesso
- ✅ Responsividade: `flex flex-col justify-center py-12 sm:px-6 lg:px-8`
- ✅ Breakpoints: `sm:mx-auto sm:w-full sm:max-w-md`
- ✅ Callback `onSuccess` para comunicação component-pai

---

### **CAMADA 3: Atualizar ResendConfirmationForm**

#### ✏️ Alteração 3.1: Aceitar props `onSuccess` callback

**Arquivo:** `components/ResendConfirmationForm.tsx` (linhas 8, 56-58)

**Mudança:**
```tsx
// ❌ ANTES
export function ResendConfirmationForm() {
  // ... resto do código
  if (success) {
    return (
      <div className="space-y-4 text-center">
        {/* Div inline com mensagem de sucesso */}
      </div>
    );
  }
}

// ✅ DEPOIS
interface ResendConfirmationFormProps {
  onSuccess?: () => void;
}

export function ResendConfirmationForm({ onSuccess }: ResendConfirmationFormProps) {
  // ... resto do código
  const handleResend = async (e: React.FormEvent) => {
    // ... lógica de envio
    setSuccess(true);
    setEmail("");
    onSuccess?.(); // ← Chama callback do pai
  };

  if (success) {
    return (
      <div className="space-y-4 text-center">
        {/* Mensagem inline permanece para sucesso local */}
      </div>
    );
  }
}
```

**Justificativa:** Permite que o pai (ResendConfirmationPageContent) mostre Toast component, mantendo padrão do Login.

---

#### ✏️ Alteração 3.2: Melhorar tratamento de erros inline

**Arquivo:** `components/ResendConfirmationForm.tsx` (linhas 132-149)

**Mudança:**
```tsx
// ❌ ANTES: Erro sem animação consistente
{error && (
  <div className="rounded-lg bg-red-50 border border-red-200 p-4">
    <p className="text-red-800 flex items-center gap-2">
      {/* ícone */}
      {error}
    </p>
  </div>
)}

// ✅ DEPOIS: Erro com animação idêntica ao LoginPageContent
{error && (
  <div className="rounded-lg bg-red-50 border border-red-200 p-4 animate-in fade-in slide-in-from-top-2 duration-300">
    <div className="flex">
      <div className="flex-shrink-0">
        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
          {/* ícone de erro padrão */}
        </svg>
      </div>
      <div className="ml-3">
        <p className="text-sm font-medium text-red-800">{error}</p>
      </div>
    </div>
  </div>
)}
```

**Justificativa:** Consistência visual com animações do LoginPageContent (`animate-in fade-in slide-in-from-top-2 duration-300`).

---

### **CAMADA 4: Atualizar Logo**

#### ✏️ Alteração 4.1: Adicionar sombra ao logo — Padrão LoginPageContent

**Arquivo:** `components/ResendConfirmationPageContent.tsx` (novo)

**Mudança de logo:**
```tsx
// ❌ ANTES: Logo minimalista (resend-confirmation/page.tsx)
<div className="bg-blue-600 rounded-2xl p-3">
  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
    {/* documento */}
  </svg>
</div>

// ✅ DEPOIS: Logo com sombra profunda (padrão login)
<div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/30">
  <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
    {/* documento — PODE SER O MESMO SVG */}
  </svg>
</div>
```

**Mudanças:**
- `p-3` → `w-12 h-12 flex items-center justify-center` (sizing consistente)
- Adicionar `shadow-xl shadow-blue-500/30` (sombra profunda)
- Redimensionar SVG: `w-8 h-8` → `w-7 h-7`

**Justificativa:** Padrão visual LoginPageContent. Sombra cria depth e profissionalismo.

---

#### ✏️ Alteração 4.2: Padronizar tipografia de título e subtítulo

**Arquivo:** `components/ResendConfirmationPageContent.tsx` (novo)

**Mudança:**
```tsx
// ❌ ANTES: h1 text-2xl
<h1 className="text-2xl font-bold text-center mb-2">
  Resend Confirmation
</h1>

// ✅ DEPOIS: h2 text-3xl (padrão login)
<h2 className="text-center text-3xl font-extrabold text-gray-900 tracking-tight">
  Resend Confirmation
</h2>
```

**Mudanças:**
- Tag HTML: `h1` → `h2` (Login também usa h2)
- Tamanho: `text-2xl` → `text-3xl`
- Peso: `font-bold` → `font-extrabold`
- Espaçamento: Remover `mb-2`, usar margin do próximo parágrafo
- Cor: Adicionar `text-gray-900`
- Espaçamento de letra: Adicionar `tracking-tight`

**Justificativa:** Padrão visual idêntico ao LoginPageContent.

---

#### ✏️ Alteração 4.3: Padronizar subtítulo

**Arquivo:** `components/ResendConfirmationPageContent.tsx` (novo)

**Mudança:**
```tsx
// ❌ ANTES: text-center text-gray-600 mb-8
<p className="text-center text-gray-600 mb-8">
  Enter your email to receive a new confirmation link
</p>

// ✅ DEPOIS: mt-2 text-center text-sm (padrão login)
<p className="mt-2 text-center text-sm text-gray-600">
  Enter your email to receive a new confirmation link
</p>
```

**Mudanças:**
- Margin: `mb-8` → `mt-2` (deixar mt-8 para card)
- Tamanho: Adicionar `text-sm` (padrão login)
- Remover margin-bottom extra (será controlada pela div pai com mt-8)

**Justificativa:** Consistência com LoginPageContent.

---

### **CAMADA 5: Estrutura de Container**

#### ✏️ Alteração 5.1: Usar responsividade breakpoint completa

**Arquivo:** `components/ResendConfirmationPageContent.tsx` (novo)

**Estrutura esperada:**
```tsx
<div className="min-h-screen bg-[#f8fafc] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
  {/* Header section com logo, título, subtítulo */}
  <div className="sm:mx-auto sm:w-full sm:max-w-md">
    {/* Logo */}
    {/* Título */}
    {/* Subtítulo */}
  </div>

  {/* Card section com form */}
  <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
    <div className="bg-white py-10 px-4 shadow-2xl shadow-gray-200/50 sm:rounded-3xl sm:px-12 border border-gray-100">
      <ResendConfirmationForm onSuccess={handleSuccess} />
    </div>
  </div>

  {/* Toast para sucesso */}
  {successMessage && <Toast ... />}
</div>
```

**Breakpoints:**
- **Mobile (default):** `flex flex-col justify-center py-12` + `p-4` em parent
- **Tablet (sm):** `sm:px-6` + `sm:mx-auto sm:w-full sm:max-w-md`
- **Desktop (lg):** `lg:px-8`
- **Card:** `sm:rounded-3xl sm:px-12` (radius maior em telas maiores)

**Justificativa:** Login usa os mesmos breakpoints. Garante responsividade consistente.

---

### **CAMADA 6: Melhorias de Acessibilidade**

#### ✏️ Alteração 6.1: Adicionar semântica HTML

**Arquivo:** `components/ResendConfirmationPageContent.tsx` (novo)

**Checkpoints:**
- ✅ Usar `<h2>` para título (não `<h1>` — logo é h0 implícito)
- ✅ Usar `<label>` no formulário (já feito em ResendConfirmationForm)
- ✅ Usar `aria-label` em ícones SVG se necessário
- ✅ Contraste: Fundos `bg-red-50`, texto `text-red-800` (WCAG AA ✓)

**Justificativa:** Padrão acessibilidade idêntico ao LoginPageContent.

---

## 📊 Matriz de Mudanças

| # | Tipo | Arquivo | Mudança | Severidade | Dependência |
|---|------|---------|---------|-----------|-------------|
| 1.1 | Refator | `resend-confirmation/page.tsx` | Extrair layout → componente | ALTA | — |
| 1.2 | Fix | `resend-confirmation/page.tsx` | Corrigir dynamic import | ALTA | 1.1 |
| 2.1 | Novo | `ResendConfirmationPageContent.tsx` | Criar componente novo | ALTA | 1.1 |
| 3.1 | Update | `ResendConfirmationForm.tsx` | Aceitar callback `onSuccess` | MÉDIA | 2.1 |
| 3.2 | Update | `ResendConfirmationForm.tsx` | Adicionar animação erro | BAIXA | — |
| 4.1 | Update | `ResendConfirmationPageContent.tsx` | Logo com sombra | MÉDIA | 2.1 |
| 4.2 | Update | `ResendConfirmationPageContent.tsx` | h1→h2, text-2xl→text-3xl | BAIXA | 2.1 |
| 4.3 | Update | `ResendConfirmationPageContent.tsx` | mb-8→mt-2, +text-sm | BAIXA | 2.1 |
| 5.1 | Update | `ResendConfirmationPageContent.tsx` | Breakpoints sm/lg | MÉDIA | 2.1 |
| 6.1 | QA | `ResendConfirmationPageContent.tsx` | Validar acessibilidade | BAIXA | 2.1 |

---

## 🔗 Dependências Entre Alterações

```
1.1 (Refator page.tsx)
  ↓
1.2 (Corrigir import)
  ↓
2.1 (Criar ResendConfirmationPageContent)
  ├─→ 3.1 (Adicionar callback)
  ├─→ 4.1 (Logo)
  ├─→ 4.2 (Título)
  ├─→ 4.3 (Subtítulo)
  ├─→ 5.1 (Responsividade)
  └─→ 6.1 (Acessibilidade)
     ↓
3.2 (Animação erro — independente)
```

---

## 📝 Checklist de Implementação

### Fase 1: Refatoração de Estrutura
- [x] Criar novo arquivo `components/ResendConfirmationPageContent.tsx`
- [x] Mover layout HTML de `page.tsx` para novo componente
- [x] Atualizar `page.tsx` com dynamic import
- [x] Testar dynamic import (deve carregar corretamente)

### Fase 2: Alinhamento Visual
- [x] Logo: Adicionar `w-12 h-12 flex items-center justify-center shadow-xl shadow-blue-500/30`
- [x] Título: `h2` com `text-3xl font-extrabold text-gray-900 tracking-tight`
- [x] Subtítulo: `mt-2 text-center text-sm text-gray-600`
- [x] Verificar espaçamentos entre sections

### Fase 3: Tratamento de Mensagens
- [x] Adicionar import de `Toast` component
- [x] Criar state `successMessage` em ResendConfirmationPageContent
- [x] Adicionar callback `onSuccess` para ResendConfirmationForm
- [x] Renderizar Toast quando sucesso (com auto-dismiss)
- [x] Adicionar animação `animate-in fade-in slide-in-from-top-2 duration-300` ao erro inline

### Fase 4: Responsividade
- [x] Aplicar breakpoints: `sm:px-6 lg:px-8`
- [x] Validar layout mobile (< 640px)
- [x] Validar layout tablet (640px - 1024px)
- [x] Validar layout desktop (> 1024px)
- [x] Testar em 3 viewports (mobile 375px, tablet 768px, desktop 1200px)

### Fase 5: QA
- [x] Testar sucesso de resend (deve mostrar Toast)
- [x] Testar erro (deve animar da top)
- [x] Verificar navegação "Back to Login"
- [x] Validar formulário (disabled quando loading)
- [x] Rodar linter e type-check: `npm run lint && npm run typecheck`
- [x] Testar acessibilidade (contrast, keyboard nav)

---

## 🎯 Resultado Esperado

Após implementação, `/resend-confirmation` terá:

✅ **Estrutura idêntica** ao `/login`  
✅ **Responsividade completa** com breakpoints sm/lg  
✅ **Logo profissional** com sombra  
✅ **Tipografia padronizada** (h2, text-3xl, tracking-tight)  
✅ **Tratamento de sucesso** via Toast component  
✅ **Tratamento de erro** com animação consistente  
✅ **Componente reutilizável** extraído do page.tsx  
✅ **Sem código duplicado** entre páginas  

---

## 📚 Referências

**Comparação lado-a-lado:**
- Login: `app/(auth)/login/page.tsx` + `components/LoginPageContent.tsx`
- Resend: `app/(auth)/resend-confirmation/page.tsx` + `components/ResendConfirmationPageContent.tsx` (novo)

**Toast component:** `components/Toast.tsx` (já existe)

**LoginForm component:** `components/LoginForm.tsx` (para referência de estilos)

---

## 🔒 Restrições de Implementação

**NUNCA modificar:**
- ❌ `app/(auth)/login/page.tsx`
- ❌ `components/LoginPageContent.tsx`
- ❌ `components/LoginForm.tsx`
- ❌ `components/Toast.tsx`
- ❌ Qualquer outro arquivo em `/login` ou relacionado

**SOMENTE modificar:**
- ✅ `app/(auth)/resend-confirmation/page.tsx` (remover layout inline)
- ✅ Criar `components/ResendConfirmationPageContent.tsx` (NOVO)
- ✅ `components/ResendConfirmationForm.tsx` (adicionar callback, animação)

**Razão:** `/login` é a referência visual congelada. Todas as mudanças devem espelhar seu padrão sem alterá-lo.

---

**Status:** ✅ Implementado por @dev.
**Observação:** `/login` é INTOCÁVEL — use apenas como referência visual.
