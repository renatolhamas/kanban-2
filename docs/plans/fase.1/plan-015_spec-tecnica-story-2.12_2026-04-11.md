# PLAN-015 — Especificação Técnica Story 2.12
**Pages Refactor — Implementation Technical Specification**

**Data:** 2026-04-11  
**Especialista:** Uma (UX/UI Designer)  
**Público:** @dev (Implementadores)  
**Status:** Pronto para desenvolvimento

---

## 📌 OVERVIEW

Este documento responde as 5 questões técnicas que você fez:

1. ✅ **Componentes API** (Button, Input, Toast, Card)
2. ✅ **Conteúdo Atual** (app/page.tsx, app/profile/page.tsx — antes/depois)
3. ✅ **Dark Mode** (como funciona, como testar)
4. ✅ **Testes & Validação** (framework, padrão, coverage)
5. ✅ **Auth Pages Verification** (foram refatoradas? como verificar)

---

## 🎯 SEÇÃO 1: COMPONENTES DO DESIGN SYSTEM — API & PROPS

### Button Component (`components/common/Button.tsx`)

#### Props Disponíveis

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "disabled";  // Default: "primary"
  size?: "sm" | "md" | "lg";                                  // Default: "md"
  asChild?: boolean;                                          // Use Radix asChild pattern
  className?: string;                                        // Optional custom classes
  disabled?: boolean;                                        // Standard HTML disabled
}
```

#### Variants Detalhados

| Variant | Uso | Estilo | Dark Mode |
|---------|-----|--------|-----------|
| **primary** | CTAs principais (Submit, Save, Login) | Emerald-500, hover emerald-700 | ✅ NÃO (BUG: falta `dark:`) |
| **secondary** | CTAs secundárias | Slate-700, hover slate-800 | ✅ NÃO (BUG: falta `dark:`) |
| **ghost** | Links estilizados, ações secundárias | Transparent, underline | ✅ NÃO (BUG: falta `dark:`) |
| **disabled** | Estado desabilitado explícito | Gray-300, opacity-50 | ✅ Não aplicável |

#### Sizes

| Size | Padding | Texto | Radius |
|------|---------|-------|--------|
| **sm** | px-3 py-2 | text-sm | rounded-lg (8px) |
| **md** | px-4 py-2 | text-base | rounded-lg (8px) |
| **lg** | px-6 py-3 | text-lg | rounded-lg (8px) |

#### Exemplos de Uso

```tsx
// Exemplo 1: CTA primária simples
<Button variant="primary" size="lg">
  Login
</Button>

// Exemplo 2: CTA secundária, desabilitada
<Button variant="secondary" size="md" disabled>
  Save Changes
</Button>

// Exemplo 3: Link estilizado como button
<Button variant="ghost" asChild>
  <a href="/forgot-password">Forgot Password?</a>
</Button>

// Exemplo 4: Com classes customizadas
<Button variant="primary" className="w-full">
  Register
</Button>
```

#### ⚠️ Issues Conhecidas

1. **Dark Mode Não Implementado**
   - Button.tsx linhas 20-44 faltam prefixos `dark:`
   - Consequência: Em dark mode, buttons ficam ilegíveis (emerald-500 é ok, mas texto branco contra fundo escuro é ruim)
   - **ANOTAÇÃO:** Story 2.12 deve refatorar Button.tsx para adicionar `dark:` prefixes

2. **asChild Prop Não Funciona**
   - Props interface declara `asChild?: boolean`
   - Mas o componente **não implementa** asChild (não usa Radix primitives)
   - Funciona atualmente apenas como prop (é ignorada)
   - **ANOTAÇÃO:** Funciona como `<Button asChild><a>Link</a></Button>` mas sem benefício

---

### Input Component (`components/common/Input.tsx`)

#### Props Disponíveis

```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;                    // Renderiza <label> acima do input
  error?: string;                    // Mensagem de erro em vermelho
  helperText?: string;               // Mensagem de ajuda em cinza
  containerClassName?: string;       // Classes do wrapper <div>
  type?: string;                     // "text" | "password" | "email" | etc
  id?: string;                       // Auto-generated se não fornecido
  // + todos os HTMLInputElement props padrão
}
```

#### Features

| Feature | Status | Detalhes |
|---------|--------|----------|
| **Label** | ✅ Implementado | Usa `htmlFor` vinculado ao ID do input |
| **Error** | ✅ Implementado | Mostra em vermelho, border-red-500 |
| **HelperText** | ✅ Implementado | Mostra em cinza, sob o input |
| **Accessibility** | ✅ Implementado | `aria-describedby` vinculado ao erro/helper |
| **Dark Mode** | ⚠️ PARCIAL | Faltam prefixos `dark:` em cores |
| **Focus Ring** | ✅ Implementado | `focus:ring-2 focus:ring-emerald-500/20` |
| **Disabled State** | ✅ Implementado | `disabled:bg-slate-100 disabled:cursor-not-allowed` |

#### Exemplos de Uso

```tsx
// Exemplo 1: Email input simples
<Input
  type="email"
  label="Email"
  placeholder="user@example.com"
  id="email-field"
/>

// Exemplo 2: Password com erro inline
<Input
  type="password"
  label="Password"
  error="Passwords do not match"
  id="password-field"
/>

// Exemplo 3: Input com helper text
<Input
  type="password"
  label="New Password"
  helperText="Min 8 characters, 1 uppercase, 1 number"
  id="new-password"
/>

// Exemplo 4: Integração com estado
const [email, setEmail] = useState("");
const [emailError, setEmailError] = useState("");

<Input
  type="email"
  label="Email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={emailError || undefined}  // Passa undefined se sem erro
  id="email"
/>
```

#### ⚠️ Issues Conhecidas

1. **Dark Mode Incompleto**
   - Faltam `dark:` prefixes para text colors
   - Label: `text-slate-900` (fica branco em fundo branco no dark mode)
   - HelperText: `text-slate-500` (fica cinza muito claro)
   - **FIX:** Adicionar:
     ```tsx
     "text-slate-900 dark:text-slate-100"  // Label
     "text-slate-500 dark:text-slate-400"  // HelperText
     ```

---

### Toast Component (`components/common/Toast.tsx`)

#### Hook useToast()

```typescript
const { toast } = useToast();
// Retorna:
// - addToast(message, type, duration?): string
// - removeToast(id): void
// - clearAll(): void
// - toasts: ToastMessage[]
```

#### API

```typescript
addToast(
  message: string,                    // Texto da notificação
  type: "success" | "error" | "warning" | "info",  // Tipo
  duration?: number                   // Milisegundos antes de desaparecer (default: 5000)
): string                            // Retorna ID do toast para remoção manual
```

#### Exemplos de Uso

```tsx
"use client";
import { useToast } from "@/components/common/Toast";

export default function ProfilePage() {
  const { toast } = useToast();

  const handlePasswordChange = async () => {
    try {
      const response = await fetch("/api/auth/profile", {
        method: "PUT",
        body: JSON.stringify({ newPassword }),
      });

      if (!response.ok) throw new Error("Update failed");

      // ✅ Success toast (desaparece em 5s)
      toast("Password updated successfully!", "success");

      // Ou com duração customizada
      toast("Password updated!", "success", 3000);

    } catch (error) {
      // ❌ Error toast (desaparece em 5s)
      toast("Failed to update password", "error");

      // Com duração infinita (só desaparece ao clicar X)
      toast("Critical error!", "error", 0);
    }
  };

  return (
    <form onSubmit={handlePasswordChange}>
      {/* Form content */}
    </form>
  );
}
```

#### Types Visuais

| Type | Cor | Ícone | Uso |
|------|-----|-------|-----|
| **success** | Emerald | ✓ | Operação completada |
| **error** | Red | ✕ | Erro na operação |
| **warning** | Yellow | ⚠ | Aviso para o usuário |
| **info** | Blue | ℹ | Informação geral |

#### ⚠️ Issues Conhecidas

1. **Toast Provider Necessário**
   - `useToast()` só funciona dentro de `<ToastProvider>`
   - Se usar fora, lança: `"useToast must be used within ToastProvider"`
   - **REQUER:** Root layout (RootLayout) deve ter `<ToastProvider>` envolvendo children

2. **Max 3 Toasts Visíveis**
   - Código linha 46: `updated.slice(-3)` = apenas últimas 3 notificações visíveis
   - Mais antigas desaparecem automaticamente
   - Bom para evitar spam, OK para Story 2.12

3. **Dark Mode**
   - Toast background: `bg-surface/80` (precisa ser definido em tokens)
   - Texto: `text-slate-900` (precisa de `dark:text-slate-100`)

---

### Card Component (`components/common/Card.tsx`)

#### Props Disponíveis

```typescript
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;  // Custom classes
  // + padrão div props
}
```

#### Uso Simples

```tsx
<Card>
  <div className="p-6">
    <h2>Card Title</h2>
    <p>Card content goes here</p>
  </div>
</Card>
```

#### Sub-components (Se Existirem)

```tsx
// Verificar se Card.tsx exporta CardHeader, CardContent, etc
// Exemplo esperado:
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Form, text, etc */}
  </CardContent>
  <CardFooter>
    {/* Buttons, etc */}
  </CardFooter>
</Card>
```

---

## 🎯 SEÇÃO 2: CONTEÚDO ATUAL — app/page.tsx & app/profile/page.tsx

### app/page.tsx (Landing/Home Page)

#### Estado Atual (ANTES)

**Arquivo:** `app/page.tsx` (27 linhas)

```tsx
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to Kanban App</h1>
        <p className="text-xl text-gray-600 mb-8">
          Multi-tenant board management system
        </p>
        <div className="flex gap-4 justify-center">
          <a href="/register"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Register
          </a>
          <a href="/login"
            className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
            Login
          </a>
        </div>
      </div>
    </main>
  );
}
```

**Issues Identificadas:**
- ❌ Hardcoded colors: `bg-blue-600`, `bg-gray-200`
- ❌ Inline className (não reutilizável)
- ❌ Links como `<a>` tags (não estilizados como buttons)
- ❌ Sem dark mode support
- ❌ Sem Button component do Design System

#### Estado Esperado (DEPOIS)

**Especificação:**

```tsx
"use client";

import { Button } from "@/components/common/Button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-bold font-manrope mb-4 text-on-surface dark:text-on-surface-dark">
          Welcome to Kanban App
        </h1>
        <p className="text-xl text-on-surface/70 dark:text-on-surface-dark/70 mb-8">
          Multi-tenant board management system
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="primary" size="lg" asChild>
            <a href="/register">Register</a>
          </Button>
          <Button variant="secondary" size="lg" asChild>
            <a href="/login">Login</a>
          </Button>
        </div>
      </div>
    </main>
  );
}
```

**Mudanças:**
1. ✅ Importa `Button` do Design System
2. ✅ Usa `Button` com `asChild` para links
3. ✅ Remove hardcoded colors → usa variants
4. ✅ Adiciona `dark:` prefixes
5. ✅ Adiciona `font-manrope`
6. ✅ Responsive: `flex-col sm:flex-row` (stack on mobile)

**Esforço:** ~30 minutos

---

### app/profile/page.tsx (User Profile Page)

#### Estado Atual (ANTES)

**Arquivo:** `app/profile/page.tsx` (258 linhas)

**Issues Críticas:**
- ❌ **Imports deprecated:**
  ```tsx
  import { PasswordInput } from "@/components/PasswordInput";  // DEPRECATED!
  import { FormError } from "@/components/FormError";          // DEPRECATED!
  ```

- ❌ **Hardcoded colors everywhere:**
  ```tsx
  <div className="min-h-screen bg-gray-50">  // Sem dark mode
  <div className="bg-white rounded-lg shadow p-6">  // Sem dark mode
  <p className="text-gray-600">  // Sem dark mode
  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">  // Success msg
  ```

- ❌ **Custom form validation (não usa Input error prop):**
  ```tsx
  {error && (
    <div className="mb-6">
      <FormError message={error} />
    </div>
  )}
  ```

- ❌ **Sem Toast para feedback:**
  ```tsx
  {success && (
    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
      <p className="text-green-700 font-semibold">Password updated successfully!</p>
    </div>
  )}
  ```

- ❌ **PasswordInput com props customizadas:**
  ```tsx
  <PasswordInput
    id="new-password"
    name="new-password"
    value={newPassword}
    onChange={setNewPassword}  // NÃO É PADRÃO REACT (deve ser onChange={e} setPassword(e.target.value))
    label="New Password"
    showStrength={true}
    showRequirements={true}
  />
  ```

- ❌ **Confirm password input customizado:**
  ```tsx
  <input
    id="confirm-password"
    className={`...px-4 py-2.5 bg-gray-50 border rounded-xl...`}
    // Estilos hardcoded, não usa Input component
  />
  ```

- ❌ **Sem dark mode, sem acessibilidade padrão, sem padrão Design System**

#### Estado Esperado (DEPOIS)

**Especificação (refactored):**

```tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import { useToast } from "@/components/common/Toast";

interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: "owner" | "admin" | "member";
}

export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();  // ✅ Nova linha
  const [user, setUser] = useState<UserProfile | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");  // ✅ Para input error prop
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch user profile (keepexisting logic)
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/auth/profile", {
          credentials: "include",
        });

        if (!response.ok) {
          if (response.status === 401) {
            router.push("/login");
            return;
          }
          throw new Error("Failed to fetch profile");
        }

        const data = await response.json();
        setUser(data.data || null);
      } catch (err) {
        toast(err instanceof Error ? err.message : "Failed to load profile", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router, toast]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");  // ✅ Clear inline error

    // Validation
    if (!newPassword) {
      setPasswordError("New password is required");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ newPassword }),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update password");
      }

      // ✅ Use Toast for success (not custom div)
      toast("Password updated successfully!", "success");
      
      setNewPassword("");
      setConfirmPassword("");
      setPasswordError("");

    } catch (err) {
      // ✅ Use Toast for errors (not custom div)
      toast(err instanceof Error ? err.message : "Failed to update password", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface dark:bg-surface-dark flex items-center justify-center">
        <p className="text-on-surface/70 dark:text-on-surface-dark/70">Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-surface dark:bg-surface-dark flex items-center justify-center">
        <p className="text-on-surface/70 dark:text-on-surface-dark/70">Failed to load profile</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface dark:bg-surface-dark">
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-surface-lowest dark:bg-surface-lowest-dark rounded-lg shadow-ambient p-6">
          <h1 className="text-3xl font-bold font-manrope mb-8 text-on-surface dark:text-on-surface-dark">
            Profile Settings
          </h1>

          {/* User Info Section */}
          <div className="mb-8 pb-8 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-semibold font-manrope mb-4 text-on-surface dark:text-on-surface-dark">
              Account Information
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-on-surface/70 dark:text-on-surface-dark/70 mb-1">
                  Name
                </label>
                <p className="text-lg text-on-surface dark:text-on-surface-dark">{user.name}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-on-surface/70 dark:text-on-surface-dark/70 mb-1">
                  Email
                </label>
                <p className="text-lg text-on-surface dark:text-on-surface-dark">{user.email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-on-surface/70 dark:text-on-surface-dark/70 mb-1">
                  Role
                </label>
                <p className="text-lg text-on-surface dark:text-on-surface-dark capitalize">{user.role}</p>
              </div>
            </div>
          </div>

          {/* Password Change Section */}
          <div>
            <h2 className="text-xl font-semibold font-manrope mb-4 text-on-surface dark:text-on-surface-dark">
              Change Password
            </h2>

            <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
              {/* ✅ Use Input component with error prop */}
              <Input
                type="password"
                label="New Password"
                id="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                error={passwordError || undefined}
                placeholder="Enter new password"
                disabled={saving}
              />

              {/* ✅ Use Input component for confirm */}
              <Input
                type="password"
                label="Confirm Password"
                id="confirm-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={
                  confirmPassword && newPassword !== confirmPassword
                    ? "Passwords do not match"
                    : undefined
                }
                placeholder="Confirm new password"
                disabled={saving}
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={
                  !newPassword ||
                  !confirmPassword ||
                  newPassword !== confirmPassword ||
                  saving
                }
                className="w-full"
              >
                {saving ? "Updating..." : "Update Password"}
              </Button>
            </form>
          </div>

          {/* Logout Section */}
          <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700">
            <form action="/api/auth/logout" method="POST">
              <Button
                type="submit"
                variant="secondary"
                size="lg"
                className="w-full"
              >
                Logout
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
```

**Mudanças Principais:**
1. ✅ Remove imports `PasswordInput`, `FormError`
2. ✅ Adiciona imports `Input`, `Button`, `useToast`
3. ✅ Usa `Input` component com `error` prop para validação inline
4. ✅ Usa `Toast` para feedback global (success/error)
5. ✅ Remove custom form validation divs
6. ✅ Adiciona `dark:` prefixes em TODAS as cores
7. ✅ Adiciona `font-manrope` em headings
8. ✅ Usa design tokens (`bg-surface`, `text-on-surface`) ao invés de cores hardcoded
9. ✅ Atualiza onChange do Input para padrão React: `(e) => setState(e.target.value)`
10. ✅ Remove border (viola "No 1px Border Rule" — use shadow ao invés)

**Esforço:** ~1.5-2 horas

---

## 🎯 SEÇÃO 3: DARK MODE IMPLEMENTATION

### Como Dark Mode Funciona no Projeto

#### 1. Tailwind Configuration

**Arquivo:** `tailwind.config.ts` (presumido, verifique)

Esperado:
```typescript
export default {
  darkMode: 'class',  // Usa classe .dark no HTML
  // ...
}
```

#### 2. Theme Provider (Presumido)

**Localização esperada:** `src/providers/ThemeProvider.tsx` ou `src/components/layout/RootLayout.tsx`

Esperado:
```tsx
export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Lê localStorage ou system preference
    const dark = localStorage.getItem('theme') === 'dark' ||
                  (!localStorage.getItem('theme') && 
                   window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    setIsDark(dark);
    document.documentElement.classList.toggle('dark', dark);
  }, []);

  return <>{children}</>;
}
```

#### 3. Como Usar em Componentes

```tsx
// Padrão Tailwind dark mode
<div className="bg-surface dark:bg-surface-dark">
  <p className="text-on-surface dark:text-on-surface-dark">Text</p>
</div>

// Prefixo 'dark:' só é aplicado se <html class="dark"> estiver presente
```

### Dark Mode Design Tokens (Esperados)

| Token | Light | Dark | Uso |
|-------|-------|------|-----|
| `bg-surface` | #f8fafc (slate-50) | #0f172a (slate-900) | Page background |
| `bg-surface-lowest` | #ffffff (white) | #1e293b (slate-800) | Form background |
| `text-on-surface` | #0f172a (slate-900) | #f1f5f9 (slate-100) | Heading text |
| `text-on-surface/70` | #475569 (slate-600) | #cbd5e1 (slate-400) | Body text secondary |
| `color-primary` | #10b981 (emerald-500) | #10b981 (same) | CTA buttons |
| `shadow-ambient` | `shadow-md` light | `shadow-lg` dark | Depth, cards |

### Como Testar Dark Mode

#### 1. No Navegador (Manual)

```html
<!-- Abre DevTools Console -->
document.documentElement.classList.add('dark')    // ativa dark mode
document.documentElement.classList.remove('dark') // desativa
```

#### 2. No Storybook

**Arquivo:** `.storybook/preview.ts`

Esperado:
```typescript
import { INITIAL_VIEWPORTS } from '@storybook/addon-viewport';

export const parameters = {
  viewport: {
    viewports: INITIAL_VIEWPORTS,
  },
};

export const decorators = [
  (Story) => (
    <div style={{ display: 'flex', gap: '20px' }}>
      <div><h3>Light Mode</h3><Story /></div>
      <div className="dark" style={{ background: '#0f172a', padding: '20px' }}>
        <h3 style={{ color: 'white' }}>Dark Mode</h3>
        <Story />
      </div>
    </div>
  ),
];
```

#### 3. Adicionar Story para Dark Mode

```tsx
// components/common/Button.stories.tsx

import { Button } from './Button';

export default {
  component: Button,
};

export const Primary = {
  args: { variant: 'primary', children: 'Click me' },
};

export const PrimaryDark = {
  args: { variant: 'primary', children: 'Click me' },
  decorators: [
    (Story) => <div className="dark bg-slate-900 p-8"><Story /></div>,
  ],
};
```

---

## 🎯 SEÇÃO 4: TESTES & VALIDAÇÃO

### Framework & Padrão

| Item | Projeto | Detalhes |
|------|---------|----------|
| **Test Runner** | Vitest | Configurado em Story 2.3 |
| **Test Files** | `Component.test.tsx` | Co-located com source |
| **E2E** | Playwright | Para testes de navegação |
| **Coverage Target** | >= 80% | Por arquivo de componente |

### Padrão de Naming

```
components/common/
├── Button.tsx
├── Button.test.tsx           ← Test file padrão
├── Button.stories.tsx        ← Storybook
├── Input.tsx
├── Input.test.tsx
└── Input.stories.tsx
```

### Estrutura de Teste Padrão

```typescript
// components/common/Button.test.tsx

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  it('renders with default variant', () => {
    render(<Button>Click</Button>);
    const button = screen.getByRole('button', { name: /click/i });
    expect(button).toBeInTheDocument();
  });

  it('applies primary variant styles', () => {
    render(<Button variant="primary">Primary</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-emerald-500');
  });

  it('renders as disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('handles click events', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    
    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('renders as dark mode safe', () => {
    const { container } = render(
      <div className="dark">
        <Button>Dark Mode</Button>
      </div>
    );
    // Verificar que dark classes existem (quando implementadas)
    expect(container.innerHTML).toContain('dark:');
  });
});
```

### Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- Button.test.tsx

# Run with coverage
npm test -- --coverage

# Lint
npm run lint

# Type check
npm run typecheck

# Build
npm run build
```

### Tests Necessários para Story 2.12

#### Home Page (`app/page.tsx`)

```typescript
describe('Home Page', () => {
  it('renders welcome message', () => {
    render(<Home />);
    expect(screen.getByText(/Welcome to Kanban App/i)).toBeInTheDocument();
  });

  it('renders Register and Login buttons', () => {
    render(<Home />);
    expect(screen.getByRole('link', { name: /Register/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Login/i })).toBeInTheDocument();
  });

  it('Register button links to /register', () => {
    render(<Home />);
    const registerBtn = screen.getByRole('link', { name: /Register/i });
    expect(registerBtn).toHaveAttribute('href', '/register');
  });

  it('Login button links to /login', () => {
    render(<Home />);
    const loginBtn = screen.getByRole('link', { name: /Login/i });
    expect(loginBtn).toHaveAttribute('href', '/login');
  });

  it('renders with dark mode support', () => {
    const { container } = render(
      <div className="dark">
        <Home />
      </div>
    );
    // Verificar que dark classes aplicadas
    expect(container.innerHTML).toContain('dark:');
  });
});
```

#### Profile Page (`app/profile/page.tsx`)

```typescript
describe('Profile Page', () => {
  // Mocks necessários
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  it('fetches and displays user profile', async () => {
    const mockUser = {
      id: '1',
      email: 'user@example.com',
      name: 'John Doe',
      role: 'admin',
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockUser }),
    });

    render(<ProfilePage />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  it('renders password change form', async () => {
    const mockUser = { id: '1', email: 'user@example.com', name: 'John', role: 'admin' };
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockUser }),
    });

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByLabelText(/New Password/i)).toBeInTheDocument();
    });
  });

  it('shows error if passwords dont match', async () => {
    // ... setup profile fetch

    render(<ProfilePage />);

    await waitFor(() => {
      const newPwdInput = screen.getByLabelText(/New Password/i);
      const confirmInput = screen.getByLabelText(/Confirm Password/i);

      await userEvent.type(newPwdInput, 'password123');
      await userEvent.type(confirmInput, 'password456');
      await userEvent.click(screen.getByRole('button', { name: /Update/i }));

      expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument();
    });
  });

  it('shows toast on successful password update', async () => {
    // ... setup + form fill
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    // ... submit form

    await waitFor(() => {
      expect(screen.getByText(/Password updated successfully/i)).toBeInTheDocument();
    });
  });

  it('redirects to login if not authenticated', async () => {
    const mockRouter = { push: vi.fn() };
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 401,
    });

    // Mock useRouter to track redirect
    render(<ProfilePage />);

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/login');
    });
  });
});
```

---

## 🎯 SEÇÃO 5: AUTH PAGES VERIFICATION (Story 2.5)

### Pergunta: "As 5 auth pages foram realmente refatoradas?"

#### Resposta Baseada em Auditoria Detalhada

**SIM e NÃO:**

| Página | Story 2.5 | Status | Conformidade | Fixes Needed |
|--------|-----------|--------|--------------|--------------|
| **Login** | ✅ Refatorada | ⚠️ PARCIAL | 7/10 | Dark mode, semantic tokens |
| **Register** | ✅ Refatorada | ⚠️ PARCIAL | 6/10 | Remove PasswordInput, dark mode |
| **Change-Password** | ❌ NÃO | 🔴 FALHA | 1/10 | Complete refactor needed |
| **Forgot-Password** | ❌ NÃO | 🔴 FALHA | 1/10 | Complete refactor needed |
| **Resend-Confirmation** | ❌ NÃO | 🔴 FALHA | 1/10 | Complete refactor needed |

### Como Verificar (Procedimento)

#### Step 1: Grep para Component Usage

```bash
# Verificar se página usa Button do Design System
grep -n "from.*Button" app/(auth)/*/page.tsx

# Verificar se página usa deprecated PasswordInput
grep -n "PasswordInput\|FormError" app/(auth)/*/page.tsx
```

#### Step 2: Visual Check em Storybook

```bash
# Start Storybook
npm run storybook

# Navegar para cada auth page story
# Verificar visualmente:
# - Dark mode rendering correto
# - Cores usando design tokens (não hardcoded)
# - Spacing consistente
```

#### Step 3: AXE Accessibility Audit

```bash
# No Storybook, abrir DevTools → Accessibility (Axe)
# Clicar em "Scan THIS PAGE"
# Resultado esperado: 0 CRITICAL, 0 HIGH

# No navegador (se usar testing library):
import { axe, toHaveNoViolations } from 'jest-axe';
expect(await axe(container)).toHaveNoViolations();
```

#### Step 4: Dark Mode Test Manual

```bash
# Abrir cada auth page
# DevTools Console:
document.documentElement.classList.add('dark')

# Verificar:
# ✅ Texto legível (contrast >= 4.5:1)
# ✅ Campos visíveis
# ✅ Botões visíveis e distinguíveis
```

### Checklist de Verificação (Por Página)

Salve como `VERIFICATION-CHECKLIST-AUTH-PAGES.md` e use durante Story 2.12:

```markdown
## ✅ Verificação Auth Pages — Story 2.5 Compliance

### 1. Login Page (`app/(auth)/login/page.tsx`)

- [ ] **Imports:**
  - [ ] imports `Button` from `@/components/common/Button`
  - [ ] imports `Input` from `@/components/common/Input`
  - [ ] NO `PasswordInput` import
  - [ ] NO `FormError` import
  
- [ ] **Components:**
  - [ ] Uses `Button` component (not `<button>`)
  - [ ] Uses `Input` component (not `<input>`)
  - [ ] Uses `useToast()` hook if error messages

- [ ] **Styling:**
  - [ ] NO hardcoded colors (bg-blue-600, text-gray-900, etc)
  - [ ] Uses design tokens (bg-surface, text-on-surface, etc)
  - [ ] Has `dark:` prefixes on ALL colors
  - [ ] Border radius: `rounded-lg` (8px) only

- [ ] **Accessibility:**
  - [ ] Labels have `htmlFor` attribute
  - [ ] Inputs have `aria-describedby` for errors
  - [ ] Focus ring visible (`:focus-visible` or equivalent)
  - [ ] AXE scan: 0 CRITICAL, 0 HIGH
  - [ ] Keyboard navigation: Tab through all fields

- [ ] **Rendering:**
  - [ ] Light mode: All text readable (contrast >= 4.5:1)
  - [ ] Dark mode: All text readable (contrast >= 4.5:1)
  - [ ] Mobile (375px): Layout reflows properly

### 2. Register Page (`app/(auth)/register/page.tsx`)
[Same checklist as Login]

### 3. Change-Password Page
[Same checklist]

### 4. Forgot-Password Page
[Same checklist]

### 5. Resend-Confirmation Page
[Same checklist]

---

## Summary

- Total Checks: 5 pages × ~12 checks = 60 items
- Pass Threshold: >= 57/60 (95%)
- Status: [PASS | FAIL | NEEDS REVIEW]
```

---

## 🎯 RESUMO TÉCNICO

| Componente | API | Dark Mode | Acessibilidade |
|-----------|-----|-----------|----------------|
| **Button** | variants, sizes, asChild | ⚠️ Falta | ✅ Focus ring |
| **Input** | label, error, helperText | ⚠️ Parcial | ✅ aria-describedby |
| **Toast** | addToast(msg, type, duration) | ⚠️ Parcial | ✅ aria-live |
| **Card** | Basic wrapper | ⚠️ Falta | ✅ OK |
| **app/page.tsx** | Landing page | ❌ Falta | ⚠️ Sem labels |
| **app/profile/page.tsx** | Profile form | ❌ Falta | ⚠️ FormError deprecated |

---

## 📋 PRÓXIMOS PASSOS

1. ✅ Leia plan-014 (consolidação)
2. ✅ Leia plan-015 (este documento)
3. → Atualize 2.12.story.md com os 10 passos de plan-014
4. → Implemente home page (30 min)
5. → Implemente profile page (1.5-2h)
6. → Refatore auth pages (4-6h)
7. → Execute testes (2h)
8. → Valide dark mode (1h)
9. → QA gate

---

— Uma, desenhando com empatia 💝
