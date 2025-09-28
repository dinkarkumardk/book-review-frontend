# UI System Notes

## Design Tokens
Defined in `src/styles/global.css` via CSS variables under `:root` and `[data-theme="dark"]` for dark mode overrides.

Categories:
- Colors: semantic (background, foreground, muted, border, destructive, ring) and brand accent (sky based)
- Radius: `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-full`
- Shadows: elevation scale tokens
- Typography: base font sizing handled by Tailwind defaults; tokens for line-height can be added later

## Theming
- Theme toggled by `ThemeProvider` sets `data-theme` attribute on `<html>`.
- Dark mode uses adjusted neutral and background variables.

## Components (shadcn-style)
Located in `src/components/ui/`:
- `Button`: variants (default, ghost, outline, destructive, secondary) + sizes (sm, md, lg, icon) + `loading` prop spinner overlay.
- `Card`: structural container with consistent padding / border / background.
- `Skeleton`: shimmer placeholder, width/height controlled by utility classes.
- `badge.tsx`: subtle status/genre labeling, variants `default | secondary | outline | destructive`.
- `input.tsx`, `textarea.tsx`, `label.tsx`: Form primitives aligning focus ring + radius system.
- `toast-provider.tsx`: Wraps `react-hot-toast` with consistent styling baseline.
- `RatingStars`: Read-only rating visualization with optional value + count.

## Compound Components
- `BookCardShadcn`: Uses `Card`, `Badge`, `RatingStars`, responsive image aspect, hover scale effect.
- `ReviewsList`: Simple vertical list with rating star, user, content.
- `ReviewForm`: Inline star picker (button-based) + textarea + submit with optimistic reset.

## Pages
- `BookListPage`: Grid layout using auto-fill minmax; skeleton placeholders; empty + error states.
- `BookDetailPage`: Two-column (responsive) header with rating summary, reviews section modular.
- Auth pages (`LoginPage`, `SignupPage`): Centered card forms using primitives and `Button.loading` state.

## Patterns
- Class merging via `cn` (`clsx + tailwind-merge`), ensures variant + custom classes safe.
- Variant management via `cva` to keep API scalable.
- All type-only imports use `import type` respecting `verbatimModuleSyntax`.
- Axios interceptors attach Authorization header + redirect on 401.

## Accessibility
- Interactive rating uses buttons with `aria-label` per star.
- `RatingStars` has `aria-label` summarizing rating when numeric text hidden.
- Color contrast: primary sky palette balanced with neutral foreground; further audit recommended for WCAG AA on destructive variant.

## Future Enhancements
- Add focus-visible styles for star rating buttons.
- Introduce motion primitives (Framer Motion) for page transitions & list entrance.
- Extract pagination & empty state components for reuse.
- Add favorites (heart toggle) to `BookCardShadcn` and persist via API.
- Add skeleton variations for BookDetail (cover + text blocks).

## Cleanup Summary
Removed legacy pages: `Home.tsx`, `HomePage.tsx`, `BookDetail.tsx`, `Login.tsx`, `Signup.tsx`, `Profile.tsx` in favor of consolidated modern pages.

## Conventions
- Filenames: PascalCase for React components, kebab-case for non-TS assets.
- Domain types centralized in `src/types/domain.ts`.
- Prefer `BookListPage` as canonical listing view.

## Adding New UI Components
1. Create file under `ui/` with minimal semantic markup.
2. Use tokens (avoid hard-coded colors); rely on semantic classes (e.g., `text-muted-foreground`).
3. Expose variants via `cva` only if variant count >1.
4. Export component + (optionally) its variants config for reuse.

---
Short reference: tokens + theme + cva + primitives -> composite components -> pages. Keep layering discipline to maintain scalability.
