# @pixelvale/ui

Cozy, Stardew-inspired pixel UI components for React + TypeScript.

```bash
npm install @pixelvale/ui
```

```tsx
import { PixelValeProvider, ToastProvider, Panel, Button } from '@pixelvale/ui';
import '@pixelvale/ui/style.css';

<PixelValeProvider theme="day">
  <ToastProvider>
    <Panel title="Farmhouse menu" ornate>
      <Button variant="primary">Plant a parsnip</Button>
    </Panel>
  </ToastProvider>
</PixelValeProvider>;
```

- React 18.3+ or 19
- No runtime dependencies beyond React
- Ships ESM, CJS, CSS, and TypeScript declarations
- Themes: `day`, `night`, `autumn` (or override CSS variables)
- Built-in `en` / `zh-CN` interface strings via `<PixelValeProvider locale="zh-CN">`
- Breadcrumb, Pagination, Timeline, and TagInput with keyboard and screen-reader support
- Popover, Calendar, DataTable, and TreeView for overlays, dates, tables, and nested data
- DatePicker, FileDropzone, Carousel, and Spinner for forms, uploads, and feedback
- Synthesized WebAudio cues via `useSound()`

## Locale

```tsx
<PixelValeProvider locale="zh-CN" messages={{ closeDialog: '关上' }}>
  <ToastProvider>{children}</ToastProvider>
</PixelValeProvider>
```

`useLocale()` returns `{ locale, t }`; `t` interpolates `{name}`-style
parameters. The provider also sets `lang` and `data-pv-locale` on its root.
Business copy stays with the app — only built-in labels, placeholders, and
screen-reader summaries are translated.

For Chinese pixel glyphs, load a CJK pixel font locally (the library does not
bundle font files):

```bash
npm install --save-dev @fontsource/fusion-pixel-12px-proportional-sc
```

```ts
import '@fontsource/fusion-pixel-12px-proportional-sc/400.css';
```

Fusion Pixel is made by TakWolf and licensed under OFL-1.1.

Full documentation and the interactive playground live in the workspace root.
