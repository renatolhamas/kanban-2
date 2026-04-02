# Design System Specification: Executive Precision

---

**📚 Related Documents:**
- **Approach:** [docs/architecture/recommended-approach.md](../architecture/recommended-approach.md) — Technical implementation & architecture
- **Analysis:** [docs/architecture/project-analysis.md](../architecture/project-analysis.md) — Project overview & complexity assessment
- **Requirements:** [docs/brainstorm/draft.geral.md](./draft.geral.md) — Functional specifications & business logic

**This document defines visual design system only.** For technical stack and architecture, see recommended-approach.md. For functional requirements, see draft.geral.md.

---

## 1. Overview & Creative North Star: "The Architectural Ledger"
This design system is built on the philosophy of **Architectural Ledger**. It moves away from the cluttered, line-heavy interfaces of legacy enterprise software and adopts an editorial, high-contrast aesthetic that feels both authoritative and breathable. 

The "Architectural" aspect refers to the use of structural depth and tonal layering rather than borders to define space. The "Ledger" aspect ensures that information density remains high but legible, utilizing the geometric clarity of Manrope typography. This system breaks the "standard template" look through intentional asymmetry—using generous white space on one axis to balance dense data on another—creating a signature executive feel that prioritizes focus over decoration.

---

### 2. Colors: Tonal Depth & The "No-Line" Rule
The palette is rooted in a high-contrast relationship between Deep Navy and Cool Gray, punctuated by the vibrant Emerald Green to signal action and growth.

*   **Primary (Emerald):** `#006c49` (Action) / `#10b981` (Container). Used for growth signals and primary CTAs.
*   **Secondary (Navy/Steel):** `#515f78`. Used for professional grounding and secondary actions.
*   **Surface/Background:** `#f7f9fb`. A crisp, cool base that prevents visual fatigue.

#### The "No-Line" Rule
Traditional 1px solid borders are strictly prohibited for sectioning. Boundaries must be defined solely through:
1.  **Background Color Shifts:** Placing a `surface-container-low` component on a `surface` background.
2.  **Tonal Transitions:** Using subtle shifts in the surface hierarchy to denote change in context.

#### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. To create depth, nest containers using the following logic:
*   **Base Layer:** `surface` (#f7f9fb)
*   **Secondary Content Areas:** `surface-container-low` (#f2f4f6)
*   **Floating Cards/Interactive Elements:** `surface-container-lowest` (#ffffff)
*   **Deep Insets:** `surface-container-high` (#e6e8ea)

#### The Glass & Signature Texture Rule
To elevate the "LinkedIn-like" feel into a premium tier, use **Glassmorphism** for persistent floating elements (e.g., navigation bars or sticky headers). Use `surface-container-lowest` at 80% opacity with a `20px` backdrop blur. 
*   **Signature Gradients:** For primary CTAs, apply a subtle linear gradient from `primary` (#006c49) to `primary_container` (#10b981) at 135 degrees to add "soul" and dimension.

---

### 3. Typography: The Manrope Hierarchy
Manrope’s geometric sans-serif nature provides a modern, technical, yet approachable tone. 

*   **Display (lg/md/sm):** Used for high-impact data points or hero headlines. Use `ExtraBold` weight. These should feel editorial and "loud" against the quiet background.
*   **Headline & Title:** Used for section headers. Use `SemiBold`. Ensure high contrast by using `on_surface` (#191c1e) to command authority.
*   **Body (lg/md/sm):** Use `Medium` weight for `body-lg` to ensure readability. For `body-md` and `body-sm`, use `Regular`.
*   **Label (md/sm):** Reserved for metadata and micro-copy. Always `Bold` and often in `secondary` (#515f78) to create clear visual shorthand.

---

### 4. Elevation & Depth: Tonal Layering
We reject the "drop shadow" defaults. We communicate hierarchy through light and material density.

*   **The Layering Principle:** Instead of shadows, stack `surface-container-lowest` cards on top of `surface-container-low` backgrounds. The subtle contrast change creates a natural, soft lift.
*   **Ambient Shadows:** If a floating state is required (e.g., a modal or dropdown), use a "soft-breath" shadow: `0px 12px 32px rgba(10, 25, 47, 0.06)`. The tint is derived from our Deep Navy, not pure black, ensuring the shadow feels like part of the environment.
*   **The Ghost Border Fallback:** If a divider is mandatory for accessibility, use the `outline-variant` (#bbcabf) at **15% opacity**. It should be felt, not seen.

---

### 5. Components: Executive Patterns
All components utilize the **DEFAULT (0.5rem / 8px) roundedness** for a professional, "soft-corporate" feel.

*   **Buttons:**
    *   *Primary:* Emerald gradient background, white text, 8px radius.
    *   *Secondary:* `secondary-container` (#d2e0fe) background with `on-secondary-container` (#55637d) text. No border.
*   **Input Fields:** Use `surface-container-lowest` (#ffffff) for the fill. The label should be `label-md` in `on-surface-variant` (#3c4a42). Use a 2px `primary` bottom-border *only* on focus.
*   **Cards:** Forbid divider lines. Separate header from body using a `1.5rem` (6) spacing gap or a background shift to `surface-container-low` for the card footer.
*   **Chips:** Use `full` (9999px) roundedness. Filter chips should use `surface-variant` and transition to `primary_fixed` when active.
*   **Lists:** Never use 1px dividers. Use `surface-container-lowest` for the list item and `8px` of vertical spacing between items to create a "segmented" look.

#### Signature Component: The "Executive Insight" Card
A card that uses a `primary` (#006c49) left-accent bar (4px width) and a `surface-container-lowest` background to highlight key B2B metrics or high-priority notifications.

---

### 6. Do's and Don'ts

#### Do:
*   **DO** use `2.5rem` (10) to `4rem` (16) spacing for section margins to create an elite, spacious feel.
*   **DO** use Emerald Green sparingly. It is a laser, not a floodlight. Use it to guide the eye to the single most important action.
*   **DO** use `Manrope Bold` for numerical data. It is a highly legible font for financial and performance metrics.

#### Don't:
*   **DON'T** use pure black (#000000) for text. Use `on_surface` (#191c1e) to maintain the Deep Navy sophistication.
*   **DON'T** use 1px solid borders to separate sidebar navigation from the main content. Use a background color shift to `surface-container-low`.
*   **DON'T** use "muddy" grays. If a color feels warm or brown, pivot back to the Cool Gray (#f7f9fb) or Navy (#515f78) spectrum.
*   **DON'T** crowd the interface. If in doubt, increase the spacing by one tier on the Spacing Scale.