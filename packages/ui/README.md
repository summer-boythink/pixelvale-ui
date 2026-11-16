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
- Synthesized WebAudio cues via `useSound()`

Full documentation and the interactive playground live in the workspace root.
