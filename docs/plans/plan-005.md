# Plan 005: Comparação Detalhada — `/login` vs `/resend-confirmation`

**Data:** 2026-04-05  
**Analista:** Atlas (Analyst Agent)  
**Status:** Estudo Completo — Pronto para Implementação

---

## ⚠️ RESTRIÇÃO CRÍTICA

**🚫 NÃO ALTERAR `/login` EM HIPÓTESE ALGUMA**

- ✅ `/login` é a página **PADRÃO DE REFERÊNCIA** — deve permanecer intocada
- ✅ Todas as mudanças devem ser **APENAS em `/resend-confirmation`**
- ✅ Usar `/login` apenas como **modelo visual e estrutural**

**Escopo:** Apenas `/resend-confirmation` será modificada para seguir o padrão do `/login`.

---

## 📋 Resumo Executivo

Comparação linha-por-linha de fontes, tamanhos, espaçamentos, cores e estilos entre `/login` e `/resend-confirmation`.

**Diferenças encontradas:** 15+ em componentes, labels, inputs, buttons, spacing.

---

## 🔄 COMPARAÇÃO DE ESTRUTURA

### Nível 1: Página (LoginPageContent vs ResendConfirmationPageContent)

#### ✅ Container Principal — IDÊNTICO

| Propriedade | Login | Resend | Status |
|------------|-------|--------|--------|
| Classes | `min-h-screen bg-[#f8fafc] flex flex-col justify-center py-12 sm:px-6 lg:px-8` | `min-h-screen bg-[#f8fafc] flex flex-col justify-center py-12 sm:px-6 lg:px-8` | ✅ IDÊNTICO |

---

#### ✅ Header Section (Logo + Título + Subtítulo)

##### Logo Container

| Propriedade | Login | Resend | Status |
|------------|-------|--------|--------|
| Classes | `w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/30` | `w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/30` | ✅ IDÊNTICO |

##### SVG Logo

| Propriedade | Login | Resend | Status |
|------------|-------|--------|--------|
| Size | `w-7 h-7` | `w-7 h-7` | ✅ IDÊNTICO |
| Color | `text-white` | `text-white` | ✅ IDÊNTICO |
| Fill | `fill="none" stroke="currentColor"` | `fill="currentColor"` | ⚠️ DIFERENTE (outline vs filled) |
| ViewBox | `0 0 24 24` | `0 0 20 20` | ⚠️ DIFERENTE (tamanho canvas) |

---

##### Título (h2)

| Propriedade | Login | Resend | Status |
|------------|-------|--------|--------|
| Tag HTML | `<h2>` | `<h2>` | ✅ IDÊNTICO |
| Classes | `text-center text-3xl font-extrabold text-gray-900 tracking-tight` | `text-center text-3xl font-extrabold text-gray-900 tracking-tight` | ✅ IDÊNTICO |
| Font Size | 3xl (30px) | 3xl (30px) | ✅ IDÊNTICO |
| Font Weight | extrabold (800) | extrabold (800) | ✅ IDÊNTICO |
| Letter Spacing | tracking-tight (-0.02em) | tracking-tight (-0.02em) | ✅ IDÊNTICO |

---

##### Subtítulo (p)

| Propriedade | Login | Resend | Status |
|------------|-------|--------|--------|
| Tag HTML | `<p>` | `<p>` | ✅ IDÊNTICO |
| Classes | `mt-2 text-center text-sm text-gray-600` | `mt-2 text-center text-sm text-gray-600` | ✅ IDÊNTICO |
| Margin Top | mt-2 (0.5rem) | mt-2 (0.5rem) | ✅ IDÊNTICO |
| Font Size | text-sm (14px) | text-sm (14px) | ✅ IDÊNTICO |
| Color | text-gray-600 | text-gray-600 | ✅ IDÊNTICO |

---

#### ✅ Card Container

| Propriedade | Login | Resend | Status |
|------------|-------|--------|--------|
| Spacing from header | `mt-8` | `mt-8` | ✅ IDÊNTICO |
| Responsive wrapper | `sm:mx-auto sm:w-full sm:max-w-md` | `sm:mx-auto sm:w-full sm:max-w-md` | ✅ IDÊNTICO |
| Card styling | `bg-white py-10 px-4 shadow-2xl shadow-gray-200/50 sm:rounded-3xl sm:px-12 border border-gray-100` | `bg-white py-10 px-4 shadow-2xl shadow-gray-200/50 sm:rounded-3xl sm:px-12 border border-gray-100` | ✅ IDÊNTICO |

**Detalhes:**
- Padding vertical: `py-10` (2.5rem) — IDÊNTICO
- Padding horizontal (mobile): `px-4` (1rem) — IDÊNTICO
- Padding horizontal (tablet+): `sm:px-12` (3rem) — IDÊNTICO
- Background: `bg-white` — IDÊNTICO
- Border radius (mobile): default (0.375rem) — IDÊNTICO
- Border radius (tablet+): `sm:rounded-3xl` (1.5rem) — IDÊNTICO
- Shadow: `shadow-2xl shadow-gray-200/50` — IDÊNTICO
- Border: `border border-gray-100` — IDÊNTICO

---

#### ⚠️ Tratamento de Erros — DIFERENTE

| Aspecto | Login | Resend | Status |
|---------|-------|--------|--------|
| **Localização** | Renderizado em `LoginPageContent` (dentro do card) | Renderizado em `ResendConfirmationForm` (dentro do form) | ⚠️ DIFERENTE |
| **Wrapper classes** | `mt-6 p-4 bg-red-50/50 border border-red-100 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300` | `rounded-lg bg-red-50 border border-red-200 p-4 animate-in fade-in slide-in-from-top-2 duration-300` | ⚠️ DIFERENTE |

**Detalhes:**
- Background opacity: `bg-red-50/50` (50%) vs `bg-red-50` (100%) ⚠️
- Border radius: `rounded-2xl` vs `rounded-lg` ⚠️
- Border color: `border-red-100` vs `border-red-200` ⚠️
- Margin top: `mt-6` vs (no spacing) ⚠️
- Icon size (SVG): `h-5 w-5` — IDÊNTICO
- Icon color: `text-red-400` — IDÊNTICO
- Text styling: `text-sm font-medium text-red-800` — IDÊNTICO
- Animation: `animate-in fade-in slide-in-from-top-2 duration-300` — IDÊNTICO

---

#### ✅ Toast Sucesso — IDÊNTICO

| Propriedade | Login | Resend | Status |
|------------|-------|--------|--------|
| Componente | `<Toast />` | `<Toast />` | ✅ IDÊNTICO |
| Props | `message={successMessage} type="success" onClose={...}` | `message={successMessage} type="success" onClose={...}` | ✅ IDÊNTICO |

---

## 🔄 COMPARAÇÃO DE FORMULÁRIOS

### Nível 2: LoginForm vs ResendConfirmationForm

#### ❌ Form Container — DIFERENTE

| Propriedade | Login | Resend | Status |
|------------|-------|--------|--------|
| Classes | `space-y-5` | `space-y-4` | ⚠️ DIFERENTE |
| Spacing entre items | 1.25rem (20px) | 1rem (16px) | ⚠️ DIFERENTE |

---

#### ⚠️ Label Styling — DIFERENTE

**Login (Email label):**
```tsx
className="block text-sm font-semibold text-gray-700 ml-1"
```

**Resend (Email label):**
```tsx
className="block text-sm font-medium mb-2"
```

| Propriedade | Login | Resend | Status |
|------------|-------|--------|--------|
| Font size | text-sm (14px) | text-sm (14px) | ✅ IDÊNTICO |
| Font weight | font-semibold (600) | font-medium (500) | ⚠️ DIFERENTE |
| Color | text-gray-700 | (não definido, herda) | ⚠️ DIFERENTE |
| Margin left | ml-1 (0.25rem) | (não definido) | ⚠️ DIFERENTE |
| Margin bottom | (não definido) | mb-2 (0.5rem) | ⚠️ DIFERENTE |

---

#### ⚠️ Label Wrapper (space-y) — DIFERENTE

**Login:**
```tsx
<div className="space-y-1.5">
  <label>...</label>
  <input>...</input>
</div>
```

**Resend:**
```tsx
<div>
  <label>...</label>
  <input>...</input>
</div>
```

| Propriedade | Login | Resend | Status |
|------------|-------|--------|--------|
| Spacing entre label e input | space-y-1.5 (0.375rem = 6px) | (nenhum) | ⚠️ DIFERENTE |

---

#### ⚠️ Input Styling — DIFERENTE

**Login:**
```tsx
className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 placeholder:text-gray-400"
```

**Resend:**
```tsx
className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
```

| Propriedade | Login | Resend | Status |
|------------|-------|--------|--------|
| Width | w-full | w-full | ✅ IDÊNTICO |
| Padding X | px-4 (1rem) | px-4 (1rem) | ✅ IDÊNTICO |
| **Padding Y** | **py-2.5 (0.625rem = 10px)** | **py-2 (0.5rem = 8px)** | ⚠️ DIFERENTE |
| **Background** | **bg-gray-50** | (nenhum/transparent) | ⚠️ DIFERENTE |
| **Border color** | **border-gray-200** | **border-gray-300** | ⚠️ DIFERENTE |
| **Border radius** | **rounded-xl (0.75rem)** | **rounded-lg (0.5rem)** | ⚠️ DIFERENTE |
| **Focus ring** | **focus:ring-blue-500/20** | **focus:ring-blue-500** | ⚠️ DIFERENTE (opacidade) |
| **Focus border** | **focus:border-blue-500** | (não definido) | ⚠️ DIFERENTE |
| **Transition** | **transition-all duration-200** | (nenhum) | ⚠️ DIFERENTE |
| **Placeholder color** | **placeholder:text-gray-400** | (não definido) | ⚠️ DIFERENTE |
| **Disabled state** | (não definido) | **disabled:bg-gray-50 disabled:text-gray-500** | ⚠️ DIFERENTE |

---

#### ⚠️ Button Styling — MUITO DIFERENTE

**Login:**
```tsx
className={`
  w-full py-3 rounded-xl font-bold text-white transition-all duration-300 transform active:scale-[0.98]
  ${
    isFormValid && !loading
      ? "bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/25 cursor-pointer"
      : "bg-gray-300 cursor-not-allowed"
  }
`}
```

**Resend:**
```tsx
className="w-full bg-gray-300 text-gray-700 font-medium py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-400 transition"
```

| Propriedade | Login | Resend | Status |
|------------|-------|--------|--------|
| **Width** | w-full | w-full | ✅ IDÊNTICO |
| **Padding Y** | **py-3 (0.75rem = 12px)** | **py-2 (0.5rem = 8px)** | ⚠️ DIFERENTE |
| **Border radius** | **rounded-xl (0.75rem)** | **rounded-lg (0.5rem)** | ⚠️ DIFERENTE |
| **Font weight** | **font-bold (700)** | **font-medium (500)** | ⚠️ DIFERENTE |
| **Text color (default)** | **text-white** | **text-gray-700** | ⚠️ DIFERENTE |
| **Background (ativo)** | **bg-blue-600 (válido+não loading)** | **bg-gray-300 (sempre)** | ⚠️ DIFERENTE |
| **Background (hover)** | **hover:bg-blue-700 (válido)** | **hover:bg-gray-400 (sempre)** | ⚠️ DIFERENTE |
| **Shadow** | **shadow-lg shadow-blue-500/25 (ativo)** | (nenhum) | ⚠️ DIFERENTE |
| **Active transform** | **active:scale-[0.98]** | (nenhum) | ⚠️ DIFERENTE |
| **Transition** | **transition-all duration-300** | **transition** | ⚠️ DIFERENTE (duration) |
| **Transform** | **transform** | (nenhum) | ⚠️ DIFERENTE |
| **Disabled state** | **condicional (bg-gray-300)** | **disabled:opacity-50** | ⚠️ DIFERENTE |

---

#### ⚠️ Button Loading Spinner — DIFERENTE

**Login:**
```tsx
<div className="flex items-center justify-center space-x-2">
  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
  <span>Signing in...</span>
</div>
```

**Resend:**
```tsx
<span className="flex items-center justify-center gap-2">
  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="..." />
  </svg>
  Sending...
</span>
```

| Aspecto | Login | Resend | Status |
|---------|-------|--------|--------|
| **Container** | `<div>` + `space-x-2` | `<span>` + `gap-2` | ⚠️ DIFERENTE |
| **Spinner tipo** | CSS border spinner | SVG spinner | ⚠️ DIFERENTE |
| **Spinner size** | w-4 h-4 | w-4 h-4 | ✅ IDÊNTICO |
| **Text** | "Signing in..." | "Sending..." | ⚠️ DIFERENTE (conteúdo) |
| **Text color** | (herda button) | (herda button) | ✅ IDÊNTICO |

---

#### ❌ Links Adicionais — DIFERENTES

**Login:**
```tsx
<div className="pt-2 text-center text-sm text-gray-500">
  Don't have an account? 
  <a href="/register" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
    Create an account
  </a>
</div>

<div className="pt-2 text-center text-sm text-gray-500">
  Password issues:
  <a href="#" className="font-medium text-blue-600 hover:text-blue-700 transition-colors">
    Change Password
  </a> or 
  <a href="/resend-confirmation" className="font-medium text-blue-600 hover:text-blue-700 transition-colors">
    Resend Email Confirmation
  </a>
</div>
```

**Resend:**
```tsx
<p className="text-center text-sm">
  <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
    Back to Login
  </Link>
</p>
```

| Propriedade | Login | Resend | Status |
|------------|-------|--------|--------|
| **Número de links** | 3 | 1 | ❌ DIFERENTE |
| **Container padding** | pt-2 (0.5rem) | (nenhum) | ⚠️ DIFERENTE |
| **Text color** | text-gray-500 | (não definido, herda) | ⚠️ DIFERENTE |
| **Font size** | text-sm (14px) | text-sm (14px) | ✅ IDÊNTICO |
| **Link color** | text-blue-600 | text-blue-600 | ✅ IDÊNTICO |
| **Link hover** | hover:text-blue-700 | hover:text-blue-700 | ✅ IDÊNTICO |
| **Link transition** | transition-colors | (nenhum) | ⚠️ DIFERENTE |
| **Link font weight** | font-semibold/font-medium | font-medium | ⚠️ VARIA |

---

#### ⚠️ Error Component — DIFERENTE

**Login:**
```tsx
{error && <FormError message={error} />}
```
- Usa componente separado `FormError`

**Resend:**
```tsx
{error && (
  <div className="rounded-lg bg-red-50 border border-red-200 p-4 animate-in fade-in slide-in-from-top-2 duration-300">
    <div className="flex">
      <div className="flex-shrink-0">
        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
          ...
        </svg>
      </div>
      <div className="ml-3">
        <p className="text-sm font-medium text-red-800">{error}</p>
      </div>
    </div>
  </div>
)}
```
- Renderizado inline com classes Tailwind

---

#### ⚠️ Extra Content em Resend — AUSENTE EM LOGIN

**ResendConfirmationForm tem:**
```tsx
{emailSendFailedMessage && (
  <div className="mb-6 rounded-lg bg-amber-50 border border-amber-300 p-4 flex items-start justify-between gap-4">
    {/* Warning message about email send failure */}
  </div>
)}
```

- Background: `bg-amber-50`
- Border: `border-amber-300`
- Padding: `p-4`
- Spacing: `mb-6`
- Layout: `flex items-start justify-between gap-4`
- Close button com classes: `text-amber-600 hover:text-amber-800`

**Status:** ❌ AUSENTE EM LOGIN

---

#### ✅ Input Label para Resend — EXISTE APENAS EM RESEND

**Resend tem validação de email com:**
```tsx
const isValidInput = email && isValidEmail(email);
```

**Login não tem equivalente** — valida apenas se campos estão preenchidos.

---

## 📊 Resumo de Diferenças — Matriz Completa

| # | Elemento | Propriedade | Login | Resend | Severidade |
|----|----------|-----------|-------|--------|-----------|
| 1 | Form | space-y | space-y-5 | space-y-4 | MÉDIA |
| 2 | Label | font-weight | font-semibold | font-medium | MÉDIA |
| 3 | Label | ml-1 | Sim | Não | BAIXA |
| 4 | Label | mb-2 | Não | Sim | BAIXA |
| 5 | Label wrapper | space-y-1.5 | Sim | Não | BAIXA |
| 6 | Input | py | py-2.5 | py-2 | BAIXA |
| 7 | Input | bg-gray-50 | Sim | Não | MÉDIA |
| 8 | Input | border-color | gray-200 | gray-300 | BAIXA |
| 9 | Input | rounded | rounded-xl | rounded-lg | BAIXA |
| 10 | Input | focus:ring opacity | /20 | /100 | MÉDIA |
| 11 | Input | focus:border-blue-500 | Sim | Não | BAIXA |
| 12 | Input | transition | Sim | Não | BAIXA |
| 13 | Input | placeholder color | gray-400 | (default) | BAIXA |
| 14 | Button | py | py-3 | py-2 | BAIXA |
| 15 | Button | rounded | rounded-xl | rounded-lg | BAIXA |
| 16 | Button | font-weight | font-bold | font-medium | MÉDIA |
| 17 | Button | text-color | text-white | text-gray-700 | ALTA |
| 18 | Button | bg-color | blue (ativo) | gray-300 (sempre) | ALTA |
| 19 | Button | bg:hover | bg-blue-700 | bg-gray-400 | ALTA |
| 20 | Button | shadow | shadow-lg blue | (nenhum) | BAIXA |
| 21 | Button | active:scale | Sim | Não | BAIXA |
| 22 | Button | transition duration | duration-300 | default | BAIXA |
| 23 | Button loading | spinner type | CSS border | SVG | BAIXA |
| 24 | Links | quantity | 3 | 1 | N/A |
| 25 | Links | pt-2 | Sim | Não | BAIXA |
| 26 | Links | text-gray-500 | Sim | Não | BAIXA |
| 27 | Links | transition-colors | Sim | Não | BAIXA |
| 28 | Error | location | LoginPageContent | ResendConfirmationForm | MÉDIA |
| 29 | Error | bg-opacity | 50% | 100% | BAIXA |
| 30 | Error | rounded | rounded-2xl | rounded-lg | BAIXA |
| 31 | Error | border-color | red-100 | red-200 | BAIXA |
| 32 | Error | mt-6 | Sim | Não | BAIXA |

**Total:** 32 diferenças identificadas

---

## 🎯 Alterações Requeridas para Alinhar Resend ao Padrão Login

### Prioridade ALTA (Funcionalidade/UX crítica)

1. **Button style**: Mudar de gray para blue (quando input válido)
2. **Button text color**: Mudar de text-gray-700 para text-white
3. **Input background**: Adicionar bg-gray-50 para consistência visual
4. **Error handling**: Mover para pai (ResendConfirmationPageContent) com classes Login

### Prioridade MÉDIA (Consistência visual)

5. **Form spacing**: space-y-5 em vez de space-y-4
6. **Label font weight**: font-semibold em vez de font-medium
7. **Input border color**: border-gray-200 em vez de gray-300
8. **Input border radius**: rounded-xl em vez de rounded-lg
9. **Button padding**: py-3 em vez de py-2
10. **Button border radius**: rounded-xl em vez de rounded-lg
11. **Button font weight**: font-bold em vez de font-medium
12. **Input focus ring opacity**: focus:ring-blue-500/20 em vez de /100
13. **Input transition**: Adicionar transition-all duration-200

### Prioridade BAIXA (Polish/refinement)

14. **Label ml-1**: Adicionar margin-left pequeno
15. **Input placeholder color**: placeholder:text-gray-400
16. **Button active transform**: active:scale-[0.98]
17. **Button shadow**: shadow-lg shadow-blue-500/25 quando válido
18. **Button loading spinner**: Considerar CSS border em vez de SVG
19. **Links layout**: Adicionar pt-2 e text-gray-500 wrapper
20. **Links transition**: Adicionar transition-colors
21. **Input disabled state styling**: Melhorar feedback visual
22. **Focus border**: focus:border-blue-500 no input

---

## 📋 Checklist de Implementação

### Fase 1: Button Styling (ALTA prioridade)
- [x] Aceitar prop para estado "válido" do form
- [x] Condicionar bg-color: blue quando válido, gray quando inválido
- [x] Mudar text-color para text-white
- [x] Implementar shadow quando válido

### Fase 2: Input Styling (MÉDIA prioridade)
- [x] Adicionar bg-gray-50
- [x] Mudar border-color para gray-200
- [x] Mudar rounded para rounded-xl
- [x] Mudar py para py-2.5
- [x] Mudar focus:ring para blue-500/20
- [x] Adicionar focus:border-blue-500
- [x] Adicionar transition-all duration-200
- [x] Adicionar placeholder:text-gray-400

### Fase 3: Form Layout (MÉDIA prioridade)
- [x] Mudar space-y-5 em form
- [x] Adicionar space-y-1.5 em label wrapper
- [x] Mudar label font weight para font-semibold
- [x] Adicionar ml-1 em label
- [x] Remover mb-2 de label (será controlado por space-y-1.5)

### Fase 4: Error Handling (MÉDIA prioridade)
- [x] Mover erro de ResendConfirmationForm para ResendConfirmationPageContent
- [x] Adicionar classes: `mt-6 p-4 bg-red-50/50 border border-red-100 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300`

### Fase 5: Links (BAIXA prioridade)
- [x] Adicionar wrapper com pt-2 text-center text-sm text-gray-500
- [x] Adicionar transition-colors aos links

### Fase 6: Polish (BAIXA prioridade)
- [x] Button active:scale-[0.98]
- [x] Button transition-all duration-300 transform
- [x] Input disabled:bg-gray-50 disabled:text-gray-500 para feedback consistente
- [x] Considerar spinner CSS border em vez de SVG

---

## 📝 Arquivos a Serem Modificados

| Arquivo | Mudanças | Prioridade |
|---------|----------|-----------|
| `components/ResendConfirmationForm.tsx` | Input/Button styling, error inline (remover), form spacing | ALTA/MÉDIA |
| `components/ResendConfirmationPageContent.tsx` | Adicionar error rendering, Toast callback | MÉDIA |
| `components/FormError.tsx` (se existir) | Reusar ou criar equivalente | BAIXA |

---

**Status:** ✅ Implementado por @dev.

**Observação:** `/login` é INTOCÁVEL — use apenas como referência visual.
