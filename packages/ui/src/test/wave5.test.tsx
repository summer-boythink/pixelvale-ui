import { describe, expect, it, vi } from 'vitest';
import { useState, type ReactNode } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { PixelValeProvider } from '../components/PixelValeProvider';
import { Drawer } from '../components/Drawer';
import { ToggleGroup } from '../components/ToggleGroup';
import { Steps } from '../components/Steps';
import { Stat } from '../components/Stat';
import { Skeleton } from '../components/Skeleton';

function withProvider(node: ReactNode) {
  return <PixelValeProvider defaultSoundEnabled={false}>{node}</PixelValeProvider>;
}

describe('Drawer', () => {
  function Harness() {
    const [open, setOpen] = useState(false);
    return (
      <PixelValeProvider defaultSoundEnabled={false}>
        <button type="button" onClick={() => setOpen(true)}>
          Open drawer
        </button>
        <Drawer
          open={open}
          onOpenChange={setOpen}
          side="left"
          width="sm"
          title="Quest details"
          description="A short trip"
        >
          <p>Bring a torch.</p>
        </Drawer>
      </PixelValeProvider>
    );
  }

  it('uses Dialog focus behavior with side-sheet classes', async () => {
    render(<Harness />);
    const trigger = screen.getByRole('button', { name: 'Open drawer' });
    trigger.focus();
    fireEvent.click(trigger);

    const dialog = await screen.findByRole('dialog');
    expect(dialog.classList.contains('pv-drawer')).toBe(true);
    expect(dialog.classList.contains('pv-drawer--left')).toBe(true);
    expect(dialog.classList.contains('pv-drawer--sm')).toBe(true);
    expect(document.querySelector('.pv-overlay--drawer')).toBeTruthy();
    expect(document.body.style.overflow).toBe('hidden');

    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(document.body.style.overflow).toBe('');
    expect(document.activeElement).toBe(trigger);
  });
});

describe('ToggleGroup', () => {
  const items = [
    { value: 'grid', label: 'Grid' },
    { value: 'labels', label: 'Labels' },
    { value: 'weather', label: 'Weather', disabled: true },
  ];

  it('selects one item at a time in single mode', () => {
    const onValueChange = vi.fn();
    render(
      withProvider(
        <ToggleGroup
          label="Farm overlays"
          items={items}
          defaultValue={['grid']}
          onValueChange={onValueChange}
        />,
      ),
    );

    const grid = screen.getByRole('button', { name: 'Grid' });
    const labels = screen.getByRole('button', { name: 'Labels' });
    expect(grid.getAttribute('aria-pressed')).toBe('true');
    expect(labels.getAttribute('aria-pressed')).toBe('false');

    fireEvent.click(labels);
    expect(onValueChange).toHaveBeenLastCalledWith(['labels']);
    expect(labels.getAttribute('aria-pressed')).toBe('true');
    expect(grid.getAttribute('aria-pressed')).toBe('false');
  });

  it('toggles multiple items and skips disabled options with arrows', () => {
    const onValueChange = vi.fn();
    render(
      withProvider(
        <ToggleGroup
          label="Farm overlays"
          items={items}
          multiple
          defaultValue={['grid']}
          onValueChange={onValueChange}
        />,
      ),
    );

    const grid = screen.getByRole('button', { name: 'Grid' });
    const labels = screen.getByRole('button', { name: 'Labels' });
    fireEvent.click(labels);
    expect(onValueChange).toHaveBeenLastCalledWith(['grid', 'labels']);

    grid.focus();
    fireEvent.keyDown(grid, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(labels);
    fireEvent.keyDown(labels, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(grid);
  });
});

describe('Steps', () => {
  const steps = [
    { value: 'plan', label: 'Plan', description: 'Check supplies' },
    { value: 'pack', label: 'Pack', description: 'Torch and snacks' },
    { value: 'mine', label: 'Mine', description: 'Floor 20', disabled: true },
  ];

  it('marks completed and current steps and reports clicks', () => {
    const onStepClick = vi.fn();
    const { container } = render(
      withProvider(
        <Steps
          steps={steps}
          current="pack"
          label="Expedition"
          onStepClick={onStepClick}
        />,
      ),
    );

    expect(
      container.querySelectorAll('.pv-steps__item[data-state="complete"]'),
    ).toHaveLength(1);
    expect(
      container.querySelectorAll('.pv-steps__item[data-state="current"]'),
    ).toHaveLength(1);
    const current = screen.getByRole('button', { name: /Pack/ });
    expect(current.getAttribute('aria-current')).toBe('step');

    fireEvent.click(screen.getByRole('button', { name: /Plan/ }));
    expect(onStepClick).toHaveBeenCalledWith('plan');
    expect(
      (screen.getByRole('button', { name: /Mine/ }) as HTMLButtonElement).disabled,
    ).toBe(true);
  });

  it('renders a static list when no click handler is provided', () => {
    const { container } = render(withProvider(<Steps steps={steps} current="plan" />));
    expect(screen.queryAllByRole('button')).toHaveLength(0);
    expect(container.querySelector('[aria-current="step"]')?.textContent).toContain(
      'Plan',
    );
  });
});

describe('Stat', () => {
  it('renders a labelled metric with a tone', () => {
    const { container } = render(
      withProvider(<Stat label="Energy" value="72 / 100" hint="Ready" tone="success" />),
    );
    expect(screen.getByText('Energy')).toBeTruthy();
    expect(screen.getByText('72 / 100')).toBeTruthy();
    expect(screen.getByText('Ready')).toBeTruthy();
    expect(container.querySelector('.pv-stat--success')).toBeTruthy();
  });
});

describe('Skeleton', () => {
  it('renders decorative text bars and clamps the line count', () => {
    const { container } = render(
      <Skeleton lines={4} height={10} className="test-skeleton" />,
    );
    const root = container.querySelector('.pv-skeleton');
    expect(root?.getAttribute('aria-hidden')).toBe('true');
    expect(root?.classList.contains('test-skeleton')).toBe(true);
    expect(root?.classList.contains('pv-skeleton--animated')).toBe(true);
    expect(container.querySelectorAll('.pv-skeleton__bar')).toHaveLength(4);
  });

  it('supports a single block variant', () => {
    const { container } = render(<Skeleton variant="block" lines={9} />);
    expect(container.querySelectorAll('.pv-skeleton__bar')).toHaveLength(1);
    expect(container.querySelector('.pv-skeleton--block')).toBeTruthy();
  });
});
