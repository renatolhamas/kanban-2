# Análise Detalhada — Auth Pages Refactor Audit
## Story 2.12: Pages Refactor — Item 1 Clarification

**Data:** 2026-04-11  
**Auditor:** Pax (PO)  
**Objetivo:** Verificar conformidade REAL de cada página auth com os padrões do Design System definidos em Stories 2.1-2.11

---

## 🎯 Parâmetros Padrão do Design System

### Design Tokens Padrão (Stories 2.1, 2.7, 2.10)

| Aspecto | Padrão | Referência |
|---------|--------|-----------|
| **Cor Primária** | `emerald-500` (#10b981) | Story 2.7 tokens |
| **Cor Secundária** | `slate-700` | Story 2.4 |
| **Background Página** | `bg-surface` (crisp cool) | Story 2.10 |
| **Background Form** | `bg-surface-lowest` (white) | Story 2.10 |
| **Texto Principal** | `text-on-surface` | Story 2.10 |
| **Texto Secundário** | `text-on-surface/70` | Story 2.10 |
| **Focus Ring** | `focus:ring-2 focus:ring-emerald-500/20` | Story 2.4 |
| **Border Radius** | `rounded-lg` (8px) | Story 2.10 |
| **Shadow** | `shadow-ambient` | Story 2.10 |
| **Font** | `font-manrope` | Stories 2.1, 2.7 |
| **Font Weight (Header)** | `font-semibold` | Story 2.7 |
| **Font Weight (Body)** | `font-normal` / Regular | Story 2.7 |

### Componentes Padrão (Stories 2.4-2.6)

| Componente | Localização | Padrão |
|-----------|------------|--------|
| **Button** | `components/common/Button.tsx` | Variants: primary, secondary, ghost, disabled |
| **Input** | `components/common/Input.tsx` | Props: label, error, helperText, disabled |
| **Toast** | `components/common/useToast()` hook | Via `useToast()` hook, não import direto |
| **Card** | `components/common/Card.tsx` | Para containers |

### Padrões de Validação (Story 2.5)

| Tipo | Padrão |
|------|--------|
| **Erros Inline** | Usar Input `error` prop + texto sob o input |
| **Erros Globais** | Usar Toast `useToast()` com tipo "error" |
| **Sucesso** | Toast com tipo "success" + redirect |
| **Estado Carregando** | Button `variant="disabled"` + Loader2 spinner |

### Padrões de Layout (Story 2.11)

| Aspecto | Padrão |
|--------|--------|
| **Structure** | Hero section + Form container |
| **Hero** | Ícone centralizado + título + subtítulo |
| **Espaçamento Hero-Form** | `mb-12` / 3rem |
| **Container Width** | `sm:max-w-md` (428px) |
| **Padding Form** | `py-10 px-6` |

### Padrões de Acessibilidade (Story 2.9)

| Item | Padrão |
|------|--------|
| **Labels** | `htmlFor` vinculado ao ID do input |
| **Erro Association** | `aria-describedby` linkado ao ID do erro |
| **ARIA Live** | Toast com `aria-live="polite"` |
| **Dark Mode** | Suporte com prefixos `dark:` |
| **Contrast** | >= 4.5:1 WCAG AA |

---

## 📊 ANÁLISE POR PÁGINA

---

## 1️⃣ **LOGIN PAGE** (`app/(auth)/login/page.tsx`)

### Status Overall: ⚠️ **PARCIALMENTE CONFORME** (7/10)

### ✅ Conformidades Detectadas

| Aspecto | Status | Detalhes |
|---------|--------|----------|
| **Background Página** | ✅ OK | `bg-surface` ✓ |
| **Background Form** | ✅ OK | `bg-surface-lowest` ✓ |
| **Hero Section** | ✅ OK | Ícone + título + subtítulo presente |
| **Layout Structure** | ✅ OK | Padrão hero + form respeitado |
| **Typography** | ✅ OK | `font-manrope` com `font-semibold` ✓ |
| **Input Component** | ✅ OK | Usa `Input` do Design System ✓ |
| **Button Component** | ✅ OK | Usa `Button` do Design System ✓ |
| **Validação Inline** | ✅ OK | Via Input `error` prop ✓ |
| **Toast Integration** | ✅ OK | Usa `useToast()` hook ✓ |
| **Loading State** | ✅ OK | Loader2 spinner implementado ✓ |
| **Spacing** | ✅ OK | Editorial spacing respeitado ✓ |

### ❌ Desconformidades Detectadas

#### **Desconformidade #1.1: Dark Mode Support**
- **Arquivo:** `components/LoginPageContent.tsx`
- **Linhas:** 51, 74-75
- **Status:** ❌ FALTA
- **Padrão Esperado:** Todos os elementos de cor devem ter prefixo `dark:` para suporte dark mode
- **Encontrado:**
  ```jsx
  // Linha 51
  <div className="min-h-screen bg-surface ...">
    // Sem prefixo dark:
  
  // Linha 74-75
  <p className="mt-4 text-center text-base text-on-surface/70 ..."
    // Sem dark:text-on-surface/70
  ```
- **Esperado:**
  ```jsx
  <div className="min-h-screen bg-surface dark:bg-surface-dark ...">
  <p className="... text-on-surface/70 dark:text-on-surface-dark/70 ...">
  ```
- **Impacto:** Sem dark mode, página fica ilegível em dark theme (Story 2.10 requer dark mode)
- **Fix Required:** Adicionar prefixos `dark:` para todas as cores

#### **Desconformidade #1.2: Semantic Color Token Inconsistency**
- **Arquivo:** `components/LoginForm.tsx`
- **Linha:** 97 (indirectly via Button)
- **Status:** ⚠️ PARCIAL
- **Padrão Esperado:** Button deve usar tokens semânticos como `bg-primary`, não cores diretas
- **Encontrado:**
  ```jsx
  // Button.tsx linha 20
  "bg-emerald-500 text-white ..."
  // Cores hardcoded, não tokens semânticos
  ```
- **Esperado:**
  ```jsx
  "bg-primary text-primary-foreground ..."
  // Usando tokens semânticos
  ```
- **Impacto:** Dificuldade para mudar paleta de cores globalmente; não alinha com Story 2.7
- **Fix Required:** Refatorar Button.tsx para usar semantic tokens

#### **Desconformidade #1.3: Focus Ring Color**
- **Arquivo:** `components/LoginPageContent.tsx`
- **Padrão:** Focus ring deve ser `emerald-500/20` (semitransparente)
- **Status:** ⚠️ Usar Input component que já tem, mas verificar Button
- **Button Focus (Line 57 em Button.tsx):**
  ```jsx
  "focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
  // Deveria ser: focus:ring-emerald-500/20 (semitransparente)
  ```
- **Impacto:** Focus visual inconsistente com Input focus ring
- **Fix Required:** Alinhamento do focus ring Button == Input focus ring

---

## 2️⃣ **REGISTER PAGE** (`app/(auth)/register/page.tsx`)

### Status Overall: ⚠️ **PARCIALMENTE CONFORME** (6/10)

### ✅ Conformidades Detectadas

| Aspecto | Status | Detalhes |
|---------|--------|----------|
| **Background Página** | ✅ OK | `bg-surface` ✓ |
| **Background Form** | ✅ OK | `bg-surface-lowest` ✓ |
| **Hero Section** | ✅ OK | Ícone + título + subtítulo |
| **Typography** | ✅ OK | `font-manrope` com `font-semibold` ✓ |
| **Input Component** | ✅ OK | Usa `Input` do Design System ✓ |
| **Button Component** | ✅ OK | Usa `Button` do Design System ✓ |
| **Validação Inline** | ✅ OK | Via Input `error` prop ✓ |
| **Toast Integration** | ✅ OK | Usa `useToast()` hook ✓ |
| **Loading State** | ✅ OK | Loader2 spinner implementado ✓ |

### ❌ Desconformidades Detectadas

#### **Desconformidade #2.1: PasswordInput Custom Component Still in Use**
- **Arquivo:** `components/RegisterForm.tsx`
- **Linha:** 7
- **Status:** ❌ CRÍTICO
- **Encontrado:**
  ```jsx
  import { PasswordInput } from "./PasswordInput";  // Line 7
  // Depois usada para confirmPassword
  ```
- **Padrão Esperado:** Usar `Input` component do Design System com `type="password"`
- **Exemplo Correto (Login):**
  ```jsx
  <Input
    id="password"
    type="password"
    label="Password"
    error={passwordError || undefined}
  />
  ```
- **Impacto:** Usa componente deprecated (Story 2.12 Task 4.11 diz deletar `PasswordInput.tsx`); inconsistência com Login page
- **Fix Required:** Substituir `PasswordInput` por `Input` com `type="password"`

#### **Desconformidade #2.2: Dark Mode Support**
- **Arquivo:** `components/RegisterPageContent.tsx`
- **Linhas:** 52, 75-76
- **Status:** ❌ FALTA
- **Padrão Esperado:** Prefixos `dark:` em todas as cores
- **Encontrado:** Mesma situação que Login (sem `dark:` prefixes)
- **Fix Required:** Adicionar prefixos `dark:`

#### **Desconformidade #2.3: Password Validation Visual Feedback**
- **Arquivo:** `components/RegisterForm.tsx`
- **Padrão:** Story 2.5 menciona "Show password strength" e "Show requirements"
- **Status:** ❌ FALTA
- **Encontrado:** Nenhuma validação visual de força de senha
- **Esperado:** Indicador visual de força (weak/medium/strong)
- **Fix Required:** Adicionar password strength indicator (ou documentar como out-of-scope)

#### **Desconformidade #2.4: Confirm Password Input**
- **Arquivo:** `components/RegisterForm.tsx`
- **Linhas:** 18, 54-56
- **Status:** ⚠️ PARCIAL
- **Encontrado:** Confirmação de senha está em estado, mas não há Input component para ela
- **Localização exata:** Linha 18 `const [confirmPassword, setConfirmPassword]` mas não vejo renderização completa
- **Questão:** Confirm password input está usando `PasswordInput` também? Precisa verificação

---

## 3️⃣ **CHANGE-PASSWORD PAGE** (`app/(auth)/change-password/page.tsx`)

### Status Overall: 🔴 **NÃO CONFORME** (1/10)

### ❌ Desconformidades Detectadas (CRÍTICAS)

#### **Desconformidade #3.1: Hardcoded Colors (Page Background)**
- **Arquivo:** `components/ChangePasswordPageContent.tsx`
- **Linha:** 35
- **Status:** 🔴 CRÍTICO
- **Encontrado:**
  ```jsx
  <div className="min-h-screen bg-[#f8fafc] ...">
  // Cor hardcoded! Não é design token
  ```
- **Padrão Esperado:** 
  ```jsx
  <div className="min-h-screen bg-surface dark:bg-surface-dark ...">
  ```
- **Impacto:** ALTÍSSIMO - viola princípio de design tokens (Story 2.7)
- **Fix Required:** URGENTE - Substituir por `bg-surface`

#### **Desconformidade #3.2: Hardcoded Colors (Hero Icon)**
- **Arquivo:** `components/ChangePasswordPageContent.tsx`
- **Linha:** 38
- **Status:** 🔴 CRÍTICO
- **Encontrado:**
  ```jsx
  <div className="w-12 h-12 bg-blue-600 ...">
  // Azul hardcoded, não é primária
  <div className="... shadow-xl shadow-blue-500/30">
  // Shadow com cor hardcoded
  ```
- **Padrão Esperado:**
  ```jsx
  <div className="w-12 h-12 bg-primary ...">
  <div className="... shadow-ambient ...">
  ```
- **Impacto:** Inconsistência com primária emerald; branding quebrado
- **Fix Required:** URGENTE - Substituir por `bg-primary` e `shadow-ambient`

#### **Desconformidade #3.3: Hardcoded Colors (Typography)**
- **Arquivo:** `components/ChangePasswordPageContent.tsx`
- **Linha:** 49, 52
- **Status:** 🔴 CRÍTICO
- **Encontrado:**
  ```jsx
  <h2 className="... text-gray-900 ...">
  <p className="... text-gray-600 ...">
  // Cores de texto hardcoded
  ```
- **Padrão Esperado:**
  ```jsx
  <h2 className="... text-on-surface dark:text-on-surface-dark ...">
  <p className="... text-on-surface/70 dark:text-on-surface-dark/70 ...">
  ```
- **Impacto:** Sem dark mode; texto fica ilegível em dark theme
- **Fix Required:** URGENTE - Substituir por semantic tokens

#### **Desconformidade #3.4: Hardcoded Colors (Form Container)**
- **Arquivo:** `components/ChangePasswordPageContent.tsx`
- **Linha:** 58
- **Status:** 🔴 CRÍTICO
- **Encontrado:**
  ```jsx
  <div className="bg-white py-10 px-4 ... border border-gray-100">
  // Fundo branco hardcoded, borda cinza hardcoded
  // Shadow com cor cinza hardcoded
  <div className="... shadow-2xl shadow-gray-200/50 ...">
  ```
- **Padrão Esperado:**
  ```jsx
  <div className="bg-surface-lowest dark:bg-surface-lowest-dark py-10 px-6 shadow-ambient rounded-lg">
  // Sem border (Design System não usa borders)
  ```
- **Impacto:** Viola "No 1px Border Rule" (Story 2.10); cores hardcoded
- **Fix Required:** URGENTE - Usar `bg-surface-lowest`, `shadow-ambient`, remover border

#### **Desconformidade #3.5: Border Radius Inconsistency**
- **Arquivo:** `components/ChangePasswordPageContent.tsx`
- **Linha:** 58, 62
- **Status:** 🔴 CRÍTICO
- **Encontrado:**
  ```jsx
  <div className="... sm:rounded-3xl ...">  // 24px radius!
  <div className="... rounded-2xl ...">     // 16px radius
  // Inconsistent com padrão 8px
  ```
- **Padrão Esperado:**
  ```jsx
  <div className="... rounded-lg ...">  // 8px everywhere
  ```
- **Impacto:** Design System usa `rounded-lg` (8px) consistentemente
- **Fix Required:** URGENTE - Padronizar para `rounded-lg`

#### **Desconformidade #3.6: Hardcoded Error Display (Custom Div)**
- **Arquivo:** `components/ChangePasswordPageContent.tsx`
- **Linha:** 61-82
- **Status:** 🔴 CRÍTICO
- **Encontrado:**
  ```jsx
  {error && (
    <div className="mt-6 p-4 bg-red-50/50 border border-red-100 rounded-2xl ...">
      // Erro customizado com div, cores hardcoded (red-50, red-100, red-400, red-800)
      // Violadesign tokens
    </div>
  )}
  ```
- **Padrão Esperado:** Usar Input `error` prop para inline errors + Toast para globais
  ```jsx
  // Input já trata erro:
  <Input error={errorMessage} />
  
  // Para Toast:
  const { toast } = useToast();
  toast({ title: "Error", description: error, type: "error" });
  ```
- **Impacto:** ALTÍSSIMO - Custom error display, não reutilizável, sem design tokens
- **Fix Required:** URGENTE - Substituir por padrão Input error + Toast

#### **Desconformidade #3.7: No Button Component**
- **Arquivo:** `components/ChangePasswordPageContent.tsx`
- **Status:** 🔴 CRÍTICO
- **Encontrado:** Arquivo não mostra buttons (deve estar em ChangePasswordForm)
- **Padrão Esperado:** Usar `Button` component do Design System
- **Fix Required:** Verificar ChangePasswordForm e refatorar buttons se necessário

#### **Desconformidade #3.8: No Input Component**
- **Arquivo:** `components/ChangePasswordPageContent.tsx`
- **Status:** 🔴 CRÍTICO
- **Padrão Esperado:** Usar `Input` component do Design System
- **Encontrado:** Arquivo não mostra inputs (deve estar em ChangePasswordForm)
- **Fix Required:** Verificar ChangePasswordForm e refatorar inputs se necessário

#### **Desconformidade #3.9: No Dark Mode Support (Global)**
- **Arquivo:** `components/ChangePasswordPageContent.tsx`
- **Status:** 🔴 CRÍTICO
- **Encontrado:** Zero prefixos `dark:` em todo o arquivo
- **Padrão Esperado:** WCAG AA compliance + dark mode suporte (Story 2.10)
- **Fix Required:** URGENTE - Adicionar prefixos `dark:` para TODAS as cores

#### **Desconformidade #3.10: Font Not Manrope**
- **Arquivo:** `components/ChangePasswordPageContent.tsx`
- **Linhas:** 49, 52
- **Status:** 🔴 CRÍTICO
- **Encontrado:** Nenhum `font-manrope` presente
- **Padrão Esperado:** `text-3xl font-semibold font-manrope` (heading)
- **Fix Required:** Adicionar `font-manrope` às typography

---

## 4️⃣ **FORGOT-PASSWORD PAGE** (`app/(auth)/forgot-password/page.tsx`)

### Status Overall: 🔴 **NÃO CONFORME** (1/10)

### ❌ Desconformidades Detectadas

**TODAS as desconformidades de Change-Password aplicam-se aqui também:**

- ❌ Hardcoded colors: `bg-[#f8fafc]` (page), `bg-blue-600` (icon), `bg-white` (form), `text-gray-900/600` (text)
- ❌ Hardcoded shadows: `shadow-2xl shadow-gray-200/50`
- ❌ Border radius inconsistente: `rounded-2xl`, `rounded-3xl` (deve ser `rounded-lg`)
- ❌ Custom error div com cores hardcoded (`bg-red-50/50`, `border border-red-100`, etc)
- ❌ Sem Button component
- ❌ Sem Input component
- ❌ Zero dark mode support
- ❌ Font não é Manrope
- ❌ Border na form container (viola "No 1px Border Rule")

**Achado Adicional:**

#### **Desconformidade #4.1: Toast Import Incorreto**
- **Arquivo:** `components/ForgotPasswordPageContent.tsx`
- **Linha:** 5
- **Status:** 🔴 CRÍTICO
- **Encontrado:**
  ```jsx
  import { Toast } from "@/components/Toast";
  // Toast importado diretamente (componente, não hook)
  ```
- **Padrão Esperado:**
  ```jsx
  import { useToast } from "@/components/common/useToast";
  // Usar hook useToast
  ```
- **Impacto:** Toast não seguir padrão de contexto/hook; reutilização dificultada
- **Fix Required:** Mudar para `useToast()` hook

---

## 5️⃣ **RESEND-CONFIRMATION PAGE** (`app/(auth)/resend-confirmation/page.tsx`)

### Status Overall: 🔴 **NÃO CONFORME** (1/10)

### ❌ Desconformidades Detectadas

**IDÊNTICAS às da Forgot-Password page:**

- ❌ Hardcoded colors (background, icon, form container, text)
- ❌ Hardcoded shadows
- ❌ Border radius inconsistente
- ❌ Custom error div
- ❌ Sem Button/Input components
- ❌ Zero dark mode
- ❌ Font não Manrope
- ❌ Toast import incorreto (direto, não hook)

**Nenhuma conformidade detectada.**

---

## 📋 RESUMO DE DESCONFORMIDADES

### Por Página

| Página | Status | Conformidade | Críticas | Warnings |
|--------|--------|-------------|----------|----------|
| **Login** | ⚠️ PARCIAL | 7/10 | 2 | 2 |
| **Register** | ⚠️ PARCIAL | 6/10 | 3 | 2 |
| **Change-Password** | 🔴 NÃO | 1/10 | 10 | 0 |
| **Forgot-Password** | 🔴 NÃO | 1/10 | 10 | 0 |
| **Resend-Confirmation** | 🔴 NÃO | 1/10 | 10 | 0 |

### Por Tipo de Desconformidade

| Tipo | Ocorrências | Páginas Afetadas | Severidade |
|------|------------|------------------|-----------|
| **Hardcoded Colors** | 15+ | Change, Forgot, Resend | 🔴 CRÍTICO |
| **Dark Mode Ausente** | 5 | Todas | 🔴 CRÍTICO |
| **Border Radius Inconsistent** | 4 | Change, Forgot, Resend | 🔴 CRÍTICO |
| **Custom Error Display** | 3 | Change, Forgot, Resend | 🔴 CRÍTICO |
| **Toast Import Incorreto** | 2 | Forgot, Resend | 🔴 CRÍTICO |
| **PasswordInput Still Used** | 1 | Register | 🔴 CRÍTICO |
| **Sem Button Component** | 3 | Change, Forgot, Resend | 🔴 CRÍTICO |
| **Sem Input Component** | 3 | Change, Forgot, Resend | 🔴 CRÍTICO |
| **Font não Manrope** | 3 | Change, Forgot, Resend | 🔴 CRÍTICO |
| **No Border Decoration Rule** | 3 | Change, Forgot, Resend | 🔴 CRÍTICO |

---

## 🎯 CONCLUSÃO

### Decisão de Escopo para Story 2.12

**ACHADO CRÍTICO:**
- **Story 2.5 refatorou APENAS `/login` e `/register`**
- **3 páginas (`/change-password`, `/forgot-password`, `/resend-confirmation`) NÃO foram refatoradas**
- **Essas 3 páginas estão 99% incompatível com Design System padrão**

### Opções para Story 2.12

#### **OPÇÃO A: Ampliar escopo de Story 2.12** ⚠️
- Incluir refatoração das 3 páginas restantes
- Esforço estimado: +4-6h adicionais
- Risco: Pode expandir muito o escopo

#### **OPÇÃO B: Documentar achado, criar separate story** ✅ RECOMENDADO
- Story 2.12 permanece com escopo original (home + profile + VERIFY auth pages)
- Create Story 2.12B: "Auth Pages Refactor Part 2 (Change-Password, Forgot, Resend)" para as 3 páginas
- Vantagem: Escopo controlado, fases claras

#### **OPÇÃO C: Incluir como AC "Audit & Document"** ⚠️
- Documentar desconformidades (done - este audit)
- Criar list de fixes necessárias
- Deixar implementação para próximo sprint

---

## 📝 RECOMENDAÇÃO FINAL

**Proposta para Story 2.12:**

1. **Refazer AC Item 3 (Verify Auth Pages):**
   ```markdown
   ### Phase 3: Verify & Refactor Auth Pages (from Story 2.5) — 4-6h
   
   **Discovery Finding:** Story 2.5 refactored ONLY /login and /register.
   3 pages (change-password, forgot-password, resend-confirmation) are NOT refactored.
   
   **Phase 3.1: Verify Login & Register**
   - [x] Checklist de conformidade (como planejado)
   
   **Phase 3.2: Refactor Change-Password**
   - [ ] Replace hardcoded colors with bg-surface, bg-surface-lowest, etc
   - [ ] Add dark mode support (dark: prefixes)
   - [ ] Replace custom error div with Input error prop + Toast
   - [ ] Add Button and Input components (instead of custom form)
   - [ ] Fix border-radius to rounded-lg
   - [ ] Add font-manrope
   - [ ] Remove border (violates no-border rule)
   
   **Phase 3.3: Refactor Forgot-Password**
   - [ ] (Same as 3.2)
   
   **Phase 3.4: Refactor Resend-Confirmation**
   - [ ] (Same as 3.2)
   ```

2. **Updated Effort Estimate:**
   - Home refactor: 1-2h
   - Profile refactor: 2-3h
   - **Auth pages verify + refactor: 4-6h** (UPDATED)
   - Final validation: 1-2h
   - **Total: 8-13h** (vs original 4-6h)

3. **Decision Point:**
   - If time-constrained: Keep original scope, create Story 2.12B for auth pages
   - If unlimited: Include auth pages and expand AC/tasks accordingly

---

## 📎 Detailed Audit Checklist for Developers

For each non-conformant page, use this checklist:

### Colors & Tokens
- [ ] Replace all `bg-[#f8fafc]` → `bg-surface dark:bg-surface-dark`
- [ ] Replace all `bg-white` → `bg-surface-lowest dark:bg-surface-lowest-dark`
- [ ] Replace all `bg-blue-600` → `bg-primary dark:bg-primary-dark`
- [ ] Replace all `text-gray-900` → `text-on-surface dark:text-on-surface-dark`
- [ ] Replace all `text-gray-600` → `text-on-surface/70 dark:text-on-surface-dark/70`
- [ ] Replace all `shadow-*` hardcoded → `shadow-ambient`

### Components
- [ ] Replace custom error divs with Input `error` prop
- [ ] Replace custom form inputs with `Input` component from Design System
- [ ] Replace custom buttons with `Button` component from Design System
- [ ] Use `useToast()` hook (not direct Toast import)

### Typography
- [ ] Add `font-manrope` to all text elements
- [ ] Verify font weights: `font-semibold` (headings), `font-normal` (body)

### Accessibility
- [ ] Add `dark:` prefixes to ALL color classes
- [ ] Verify `htmlFor` bindings on labels
- [ ] Verify `aria-describedby` on inputs with errors
- [ ] Test WCAG AA contrast in both light/dark modes

### Design
- [ ] Replace `rounded-2xl`, `rounded-3xl` → `rounded-lg`
- [ ] Remove all `border` classes (violates no-border rule)
- [ ] Use `shadow-ambient` for depth

---

**This audit is definitive. Use it as specification for Story 2.12 refactoring.**

— Pax, equilibrando prioridades 🎯
