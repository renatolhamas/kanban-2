# Design System Specification: High-End WhatsApp Kanban

## 1. Overview & Creative North Star
This design system is built to transform the functional complexity of a WhatsApp-integrated Kanban platform into a serene, high-end editorial experience. 

**Creative North Star: "The Digital Atelier"**
We are moving away from the "cluttered dashboard" aesthetic. Instead, we treat the UI as a curated workspace. This design system breaks the rigid "template" look by utilizing intentional tonal depth, breathing room, and high-contrast typography. It is designed to feel authoritative yet invisible, allowing users to focus on communication and task flow without cognitive friction.

---

## 2. Colors: The Tonal Foundation
The palette is anchored by a high-quality Emerald Green, balanced against a sophisticated cool-gray corporate landscape.

### Primary & Semantic Tones
- **Primary (`#0d631b`):** Used for main actions and brand presence.
- **Primary Container (`#2e7d32`):** Our signature Emerald Green, used for active states and high-priority Kanban elements.
- **Secondary (`#4c616c`):** A sober, cool gray-blue for utilitarian elements and metadata.
- **Tertiary (`#006156`):** Reserved for WhatsApp-specific accents and secondary "success" markers.

### The "No-Line" Rule
To achieve a premium feel, **1px solid borders are prohibited for sectioning.** Boundaries must be defined solely through background color shifts.
*   **Kanban Board Background:** `surface` (`#f7f9fc`).
*   **Kanban Columns:** `surface_container_low` (`#f2f4f7`).
*   **Individual Task Cards:** `surface_container_lowest` (`#ffffff`).

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. 
- Use `surface_container_highest` (`#e0e3e6`) for the far-left global navigation (mimicking the dark sidebar in the reference image).
- Use `surface_bright` for the top bar to create a sense of light and height.
- **Signature Texture:** For primary CTAs, apply a subtle linear gradient from `primary` to `primary_container` (150-degree angle) to add "soul" and dimension that flat hex codes cannot provide.

---

## 3. Typography: Editorial Authority
We utilize **Inter** across all scales. The hierarchy relies on extreme contrast between display sizes and functional labels to guide the eye.

- **Headlines (`headline-sm` to `headline-lg`):** Tight tracking (-0.02em) and Semi-Bold weights. Use these for project names and column headers to provide a sense of "Agile Authority."
- **Body Text (`body-md`):** Regular weight with generous line-height (1.5) for message previews and task descriptions to ensure legibility during high-volume work.
- **Labels (`label-sm`):** All-caps with +0.05em tracking for metadata (e.g., WhatsApp timestamps, SPK-IDs) to distinguish "data" from "content."

---

## 4. Elevation & Depth: Tonal Layering
Traditional drop shadows are replaced with **Tonal Layering** to convey hierarchy.

- **The Layering Principle:** Depth is achieved by stacking. A `surface_container_lowest` card sitting on a `surface_container_low` column creates a soft, natural lift.
- **Ambient Shadows:** For floating elements (like a task detail modal), use a diffused shadow: `0px 12px 32px rgba(25, 28, 30, 0.06)`. The color is a tint of `on_surface`, not pure black.
- **Glassmorphism:** The Top Navigation and Right Detail Panels must use a "frosted glass" effect.
    - **Background:** `surface` at 80% opacity.
    - **Backdrop-blur:** 12px.
    - This allows the Kanban board colors to bleed through, making the interface feel integrated.
- **The "Ghost Border":** If a separator is required for accessibility, use `outline_variant` at 15% opacity. Never use 100% opaque lines.

---

## 5. Components

### Kanban Cards
- **Background:** `surface_container_lowest`.
- **Corner Radius:** `lg` (0.5rem).
- **Structure:** No dividers. Use 16px padding (2x grid) to separate the Task ID, Title, and WhatsApp avatar.
- **Active State:** Instead of a thick border, use a 4px vertical "accent bar" on the left edge using `primary_container`.

### Buttons
- **Primary:** Gradient (`primary` to `primary_container`), `on_primary` text, `full` (pill) radius for high-touch actions.
- **Secondary:** `surface_container_high` background with `on_surface` text. No border.
- **Ghost Action:** `on_surface_variant` text. High contrast on hover only.

### Sidebar Navigation (Global)
- **Background:** `inverse_surface` (`#2d3133`).
- **Icons:** `inverse_on_surface` at 70% opacity.
- **Active State:** A subtle `surface_variant` highlight with an `xl` (0.75rem) rounded corner on the right side.

### Inputs & Search
- **Field Style:** `surface_container_high` background, `sm` (0.125rem) bottom-only radius to maintain an editorial, "underlined" look without the heavy box.

---

## 6. Do’s and Don’ts

### Do
- **Do** use white space as a structural element. If two sections feel cluttered, increase the 8px grid spacing rather than adding a line.
- **Do** use `primary_fixed_dim` for "read" WhatsApp badges to keep the visual weight low.
- **Do** ensure the "Top Bar" (Project breadcrumbs) feels airy by using `surface_bright` and Glassmorphism.

### Don't
- **Don't** use pure black (`#000000`) for text. Use `on_surface` (`#191c1e`) to maintain a premium, soft-contrast feel.
- **Don't** use standard Material Design "elevated" shadows. If it doesn't have a backdrop blur or a tonal shift, it shouldn't be elevated.
- **Don't** use multiple bright colors for different Kanban tags. Use variants of `secondary_container` and `secondary` to keep the UI "Sober Corporate."

---

## 7. Spacing Scale
The system operates on a strict **8px responsive grid**.
- **Internal Padding:** 16px (`2x`).
- **Section Gaps:** 24px (`3x`) or 32px (`4x`).
- **Kanban Column Gutter:** 16px to ensure cards feel connected but distinct.