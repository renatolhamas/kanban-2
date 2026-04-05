# Design System & UI Patterns - Autenticação

**Data:** 2026-04-05  
**Referência Ouro:** Página `/login` (`app/(auth)/login/page.tsx` e `components/LoginPageContent.tsx`) 

Este documento serve como a **Specificação de Padrão Base** para todas as páginas de fluxo de autenticação e modais com formulários (ex: Recovery, Registration, Resend Confirmation).

---

## 🏗️ Estrutura da Página e Card

O padrão utiliza um background sutil e centraliza verticalmente, empilhando Header e Card Principal.

### Container Global (`PageContent` wrapper)
```tsx
<div className="min-h-screen bg-[#f8fafc] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
```

### Cabeçalho e Títulos (Acima do card)
- **Container**: `sm:mx-auto sm:w-full sm:max-w-md`
- **Logo Container Wrapper**: `flex justify-center mb-6`
- **Logo Estilizado** (com sombra volumétrica):
  ```tsx
  <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/30">
    <svg className="w-7 h-7 text-white" />
  </div>
  ```
- **Título (`h2`)**: `text-center text-3xl font-extrabold text-gray-900 tracking-tight`
- **Subtítulo (`p`)**: `mt-2 text-center text-sm text-gray-600`

### Card Container
- **Wrapper**: `mt-8 sm:mx-auto sm:w-full sm:max-w-md`
- **Superfície do Card**:
  ```tsx
  <div className="bg-white py-10 px-4 shadow-2xl shadow-gray-200/50 sm:rounded-3xl sm:px-12 border border-gray-100">
  ```

---

## 📝 Formulários

### Form Container Principal
```tsx
<form className="space-y-5">
```

### Grupos de Campos (Label + Input)
```tsx
<div className="space-y-1.5">
```

### Typography de Labels
- **Input Labels**: `block text-sm font-semibold text-gray-700 ml-1`

### Estilização de Inputs de Texto / Senha / E-mail
Contém cor de fundo base sutil de contraste (`bg-gray-50`) e anéis de foco suaves azuis.
```tsx
<input 
  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 placeholder:text-gray-400 disabled:bg-gray-50 disabled:text-gray-500"
/>
```

---

## 🔘 Botões

Formatação robusta (padding de `py-3`) e interações de feedback no clique (`active:scale`).

### Botão Primário (Válido / Ativo / Submit)
```tsx
<button
  className="w-full py-3 rounded-xl font-bold transition-all duration-300 transform active:scale-[0.98] bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/25 cursor-pointer"
/>
```

### Botão Primário (Estado de Disabled / Invalid)
```tsx
<button
  className="w-full py-3 rounded-xl font-bold transition-all duration-300 transform bg-gray-300 text-gray-700 cursor-not-allowed opacity-100"
/>
```

### Animação de Carregamento (Loading SVG / CSS)
O label do botão é substituído horizontalmente por um container Flex com Spinner CSS:
```tsx
<div className="flex items-center justify-center space-x-2">
  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
  <span>Processing...</span>
</div>
```

---

## 🔗 Links Extra de Navegação (Footers)
Usados para "Esqueci minha senha" ou "Criar uma conta" embaixo dos formulários.

- **Wrapper do bloco de link**: `pt-2 text-center text-sm text-gray-500`
- **Texto da âncora `<a>` / `<Link>`**: `font-medium text-blue-600 hover:text-blue-700 transition-colors`

---

## 🚫 Tratamento de Mensagens

### Feedback de Erro de Servidor / Submissão
As mensagens de erro renderizadas por respostas de API ou Validação de Servidor ocupam container com background semitransparente em vermelho, com uma animação vinda de cima demonstrando surgimento ("slide-in-from-top-2").

**Sempre posicionada abaixo do Formulário**, instanciado condicional ou exportada por Componente `FormError.tsx`:

```tsx
<div className="mt-6 p-4 bg-red-50/50 border border-red-100 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300">
  <div className="flex">
    <div className="flex-shrink-0">
      <svg className="h-5 w-5 text-red-400" />
    </div>
    <div className="ml-3">
      <p className="text-sm font-medium text-red-800">{errorMessage}</p>
    </div>
  </div>
</div>
```

### Notificação de Sucesso Global (Toasts)
Não é feita com displays "inline" bloqueando renderização. É abstraída para o provedor `Toast`.
```tsx
<Toast 
  message="Mensagem de Sucesso" 
  type="success" 
  onClose={() => setSuccessMessage(null)} 
/>
```
