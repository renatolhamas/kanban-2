# Design System Principles: The Architectural Ledger

Este documento define a filosofia visual e os princípios de design do projeto Kanban. Ele serve como o "Norte Criativo" para garantir que a interface mantenha um padrão executivo, profissional e premium.

---

**📚 Documentos Relacionados:**
- **Tokens Técnicos:** [docs/DESIGN-TOKENS.md](./DESIGN-TOKENS.md) — Referência de cores (HEX), tipografia (escalas), espaçamento e sombras.
- **Componentes Vivo:** [Storybook (npm run storybook)] — Documentação interativa e testes visuais.

---

## 1. Overview: "The Architectural Ledger"

O sistema de design é construído sobre a filosofia do **Architectural Ledger**. Ele se afasta de interfaces poluídas e cheias de linhas de softwares corporativos legados, adotando uma estética editorial e de alto contraste que transmite autoridade e leveza.

A parte **"Architectural"** refere-se ao uso de profundidade estrutural e camadas tonais em vez de bordas para definir espaços. A parte **"Ledger"** garante que a densidade de informação permaneça alta, mas legível, utilizando a clareza geométrica da tipografia Manrope. O sistema utiliza espaços em branco generosos em um eixo para equilibrar dados densos em outro, priorizando o foco sobre a decoração.

---

## 2. Cores e a Regra do "No-Line"

A paleta é enraizada em uma relação de alto contraste entre tons profundos e neutros, pontuada pelo Verde Esmeralda para sinalizar ação e crescimento.

Para os valores técnicos de cores, consulte o **[DESIGN-TOKENS.md](./DESIGN-TOKENS.md#color-system)**.

### A Regra do "No-Line"
Bordas sólidas de 1px são estritamente proibidas para o seccionamento de grandes áreas. Os limites devem ser definidos exclusivamente através de:
1.  **Mudança de Cor de Fundo:** Colocando um componente com fundo `surface-low` sobre um fundo `surface`.
2.  **Transições Tonais:** Usando mudanças sutis na hierarquia de superfícies para denotar mudança de contexto.

### Hierarquia de Superfície (Nesting)
Tratamos a UI como uma série de camadas físicas. Para criar profundidade, aninhamos os containers seguindo esta lógica:
- **Base Layer:** `surface` (Fundo principal da página)
- **Áreas de Conteúdo Secundário:** `surface-low` (Hover states)
- **Cards/Elementos Interativos:** `surface-lowest` (Fundo de cards e modais)
- **Deep Insets:** `surface-high` (Superfícies elevadas ou foco)

---

## 3. Tipografia: A Hierarquia Manrope

A tipografia Manrope fornece um tom moderno e técnico, porém acessível.

- **Display:** Para dados de alto impacto ou títulos herói. Deve parecer editorial e "barulhento" contra o fundo silencioso.
- **Headline & Title:** Para cabeçalhos de seção. Garante autoridade e clareza.
- **Body:** Foco total em legibilidade. Utilizamos pesos médios para corpo de texto maior e regular para o padrão.
- **Label:** Reservado para metadados e micro-copy. 

Consulte a escala completa em **[DESIGN-TOKENS.md](./DESIGN-TOKENS.md#typography)**.

---

## 4. Elevação e Profundidade: Camadas Tonais

Rejeitamos os padrões de "drop shadow" genéricos. Comunicamos hierarquia através de luz e densidade de material.

- **O Princípio de Camadas:** Em vez de sombras pesadas, empilhamos superfícies com contrastes sutis (ex: card branco sobre fundo cinza muito claro). O contraste cria uma elevação natural e suave.
- **Sombras Ambiente:** Caso um estado flutuante seja obrigatório (modais ou dropdowns), usamos sombras de "respiração suave" (soft-breath), derivadas dos tons de azul do sistema, e não de preto puro.

---

## 5. Componentes: Padrões Executivos

Todos os componentes utilizam o arredondamento padrão de **8px (0.5rem)** para um visual profissional e equilibrado.

- **Buttons:** O verde esmeralda deve ser usado como um laser, não como um refletor. Serve para guiar o olho para a ação mais importante.
- **Input Fields:** Foco na clareza. Usamos preenchimento total e bordas de foco que não poluem o formulário.
- **Cards:** Proibido o uso de linhas divisórias. Separação via espaçamento (gap) ou mudança tonal no rodapé.
- **Lists:** Nunca usar divisores de 1px. Usar o fundo do item da lista e espaçamento vertical para criar um visual segmentado.

### Componente de Assinatura: "Executive Insight" Card
Um card que utiliza uma barra de acento lateral esquerda de 4px (Verde Esmeralda) para destacar métricas B2B ou notificações de alta prioridade.

---

## 6. Boas Práticas (Do's and Don'ts)

### ✅ Fazer (Do):
- Use margens espaçosas para criar uma sensação de produto "Premium".
- Use o Verde Esmeralda com parcimônia. Ele deve atrair atenção seletiva.
- Use pesos negritos para dados numéricos (Manrope é excelente para legibilidade de métricas).

### ❌ Não Fazer (Don't):
- **NÃO** use preto puro (#000) para textos. Use o cinza escuro do sistema (`on-surface`) para manter a sofisticação.
- **NÃO** use bordas sólidas de 1px para separar a sidebar do conteúdo principal. Use a mudança de cor de fundo.
- **NÃO** use cinzas "sujos". Se uma cor parecer amarelada ou marrom, vire para o espectro Cool Gray ou Navy.
- **NÃO** comprima a interface. Em caso de dúvida, aumente o espaçamento em um nível na escala.

---

**Documento mantido pela equipe de Arquitetura & Design.**  
**Última Revisão:** 2026-04-11
