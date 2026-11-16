import { describe, expect, it, vi } from 'vitest';
import { useState, type ReactNode } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Tabs } from '../components/Tabs';
import { Dialog } from '../components/Dialog';
import { Select } from '../components/Select';
import { Tooltip } from '../components/Tooltip';
import { CoinDisplay, ProgressBar } from '../components/ProgressBar';
import { ToastProvider, useToast } from '../components/Toast';
import { PixelValeProvider } from '../components/PixelValeProvider';
import { InventoryGrid, type InventoryEntry } from '../components/InventoryGrid';
import { ITEM_FIXTURES } from './fixtures';

function withProvider(node: ReactNode) {
  return <PixelValeProvider defaultSoundEnabled={false}>{node}</PixelValeProvider>;
}

describe('Tabs', () => {
  const items = [
    { value: 'backpack', label: 'Backpack' },
    { value: 'skills', label: 'Skills' },
    { value: 'journal', label: 'Journal' },
  ];

  it('selects the first enabled tab by default', () => {
    render(withProvider(<Tabs items={items} label="Sections" />));
    const tabs = screen.getAllByRole('tab');
    expect(tabs[0]?.getAttribute('aria-selected')).toBe('true');
    expect(tabs[0]?.getAttribute('tabindex')).toBe('0');
    expect(tabs[1]?.getAttribute('tabindex')).toBe('-1');
  });

  it('moves selection and focus with the arrow keys', () => {
    const onValueChange = vi.fn();
    render(
      withProvider(<Tabs items={items} label="Sections" onValueChange={onValueChange} />),
    );

    const tabs = screen.getAllByRole('tab');
    fireEvent.keyDown(tabs[0] as HTMLElement, { key: 'ArrowRight' });

    expect(onValueChange).toHaveBeenCalledWith('skills');
    expect(tabs[1]?.getAttribute('aria-selected')).toBe('true');
    expect(document.activeElement).toBe(tabs[1]);
  });
});

describe('CoinDisplay', () => {
  it('formats gold and exposes a complete readable value', () => {
    render(withProvider(<CoinDisplay value={1280} animate={false} />));
    expect(screen.getByText('1,280')).toBeTruthy();
    expect(screen.getByText('gold')).toBeTruthy();
    expect(screen.getByTitle('1,280 gold')).toBeTruthy();
  });
});

describe('ProgressBar', () => {
  it('clamps values and exposes progress semantics', () => {
    const { rerender } = render(
      withProvider(<ProgressBar label="Energy" value={150} max={100} showValue />),
    );

    let bar = screen.getByRole('progressbar', { name: 'Energy' });
    expect(bar.getAttribute('aria-valuenow')).toBe('100');
    expect(screen.getByText('100 / 100')).toBeTruthy();

    rerender(withProvider(<ProgressBar label="Energy" value={-20} max={100} />));
    bar = screen.getByRole('progressbar', { name: 'Energy' });
    expect(bar.getAttribute('aria-valuenow')).toBe('0');
  });
});

describe('Dialog', () => {
  function Harness() {
    const [open, setOpen] = useState(false);
    return (
      <PixelValeProvider defaultSoundEnabled={false}>
        <button type="button" onClick={() => setOpen(true)}>
          Open dialog
        </button>
        <Dialog
          open={open}
          onOpenChange={setOpen}
          title="End the day?"
          description="A short nap."
        >
          <p>Rest well.</p>
        </Dialog>
      </PixelValeProvider>
    );
  }

  it('traps the page, closes on Escape, and restores focus', async () => {
    render(<Harness />);
    const trigger = screen.getByRole('button', { name: 'Open dialog' });
    trigger.focus();
    fireEvent.click(trigger);

    const dialog = await screen.findByRole('dialog');
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(document.body.style.overflow).toBe('hidden');
    expect(trigger.hasAttribute('inert')).toBe(true);

    fireEvent.keyDown(document, { key: 'Escape' });

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
    expect(document.body.style.overflow).toBe('');
    expect(trigger.hasAttribute('inert')).toBe(false);
    expect(document.activeElement).toBe(trigger);
  });
});

describe('Select', () => {
  const options = [
    { value: 'standard', label: 'Standard Farm' },
    { value: 'riverland', label: 'Riverland Farm' },
    { value: 'forest', label: 'Forest Farm', disabled: true },
  ];

  it('opens from the keyboard and chooses the active option', () => {
    const onValueChange = vi.fn();
    render(
      withProvider(
        <Select label="Farm layout" options={options} onValueChange={onValueChange} />,
      ),
    );

    const trigger = screen.getByRole('combobox', { name: /Farm layout/ });
    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByRole('listbox')).toBeTruthy();

    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    expect(trigger.getAttribute('aria-activedescendant')).toContain('option-1');

    fireEvent.keyDown(trigger, { key: 'Enter' });
    expect(onValueChange).toHaveBeenCalledWith('riverland');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(trigger.textContent).toContain('Riverland Farm');
  });

  it('closes on Escape and keeps an enclosing dialog open', async () => {
    const onDialogChange = vi.fn();
    render(
      <PixelValeProvider defaultSoundEnabled={false}>
        <Dialog open onOpenChange={onDialogChange} title="Farm settings">
          <Select
            label="Farm layout"
            options={[
              { value: 'standard', label: 'Standard Farm' },
              { value: 'riverland', label: 'Riverland Farm' },
            ]}
          />
        </Dialog>
      </PixelValeProvider>,
    );

    const dialog = await screen.findByRole('dialog');
    const trigger = screen.getByRole('combobox', { name: /Farm layout/ });
    fireEvent.click(trigger);
    expect(await screen.findByRole('listbox')).toBeTruthy();

    fireEvent.keyDown(trigger, { key: 'Escape' });

    await waitFor(() => {
      expect(screen.queryByRole('listbox')).toBeNull();
    });
    expect(screen.getByRole('dialog')).toBe(dialog);
    expect(onDialogChange).not.toHaveBeenCalled();
  });

  it('skips disabled options when moving', () => {
    render(withProvider(<Select label="Farm layout" options={options} />));
    const trigger = screen.getByRole('combobox', { name: /Farm layout/ });
    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    fireEvent.keyDown(trigger, { key: 'ArrowDown' });

    // Wraps past the disabled Forest Farm option back to Standard Farm.
    expect(trigger.getAttribute('aria-activedescendant')).toContain('option-0');
  });
});

describe('InventoryGrid', () => {
  const items: InventoryEntry[] = [
    { item: ITEM_FIXTURES.parsnip, quantity: 12 },
    { item: ITEM_FIXTURES.strawberry, quantity: 8 },
    { item: ITEM_FIXTURES.gem, quantity: 1 },
  ];

  it('selects slots with pointer and keyboard input', () => {
    const onSelectedChange = vi.fn();
    render(
      withProvider(
        <InventoryGrid
          items={items}
          columns={3}
          rows={1}
          showTooltips={false}
          onSelectedChange={onSelectedChange}
        />,
      ),
    );

    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(3);
    expect(options[0]?.getAttribute('aria-selected')).toBe('true');

    fireEvent.click(options[1] as HTMLElement);
    expect(onSelectedChange).toHaveBeenLastCalledWith('strawberry');

    fireEvent.keyDown(options[1] as HTMLElement, { key: 'ArrowRight' });
    expect(onSelectedChange).toHaveBeenLastCalledWith('gem');
    expect(document.activeElement).toBe(options[2]);
  });
});

describe('Tooltip', () => {
  it('appears on focus and links itself with aria-describedby', async () => {
    render(
      withProvider(
        <Tooltip content="A tiny hint" delay={0}>
          <button type="button">Focus me</button>
        </Tooltip>,
      ),
    );

    const button = screen.getByRole('button', { name: 'Focus me' });
    fireEvent.focus(button);

    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip.textContent).toContain('A tiny hint');
    expect(button.getAttribute('aria-describedby')).toBe(tooltip.id);

    fireEvent.keyDown(button, { key: 'Escape' });
    await waitFor(() => {
      expect(screen.queryByRole('tooltip')).toBeNull();
    });
  });
});

describe('Tooltip singleton', () => {
  it('keeps only one tooltip open across focus and hover targets', async () => {
    render(
      withProvider(
        <div>
          <Tooltip content="First hint" delay={0}>
            <button type="button">First</button>
          </Tooltip>
          <Tooltip content="Second hint" delay={0}>
            <button type="button">Second</button>
          </Tooltip>
        </div>,
      ),
    );

    fireEvent.focus(screen.getByRole('button', { name: 'First' }));
    expect((await screen.findByRole('tooltip')).textContent).toContain('First hint');

    fireEvent.focus(screen.getByRole('button', { name: 'Second' }));
    await waitFor(() => {
      const open = screen.getAllByRole('tooltip');
      expect(open).toHaveLength(1);
      expect(open[0]?.textContent).toContain('Second hint');
    });
  });
});

describe('Toast', () => {
  function Harness() {
    const { toast } = useToast();
    return (
      <button
        type="button"
        onClick={() =>
          toast({ title: 'Day saved', description: 'All is well.', duration: 5000 })
        }
      >
        Notify
      </button>
    );
  }

  it('auto-dismisses after the requested duration', async () => {
    function QuickToast() {
      const { toast } = useToast();
      return (
        <button
          type="button"
          onClick={() => toast({ title: 'Quick note', duration: 40 })}
        >
          Quick
        </button>
      );
    }

    render(
      <PixelValeProvider defaultSoundEnabled={false}>
        <ToastProvider>
          <QuickToast />
        </ToastProvider>
      </PixelValeProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Quick' }));
    expect(await screen.findByRole('status')).toBeTruthy();
    await waitFor(
      () => {
        expect(screen.queryByRole('status')).toBeNull();
      },
      { timeout: 1200 },
    );
  });

  it('announces a toast and dismisses it on request', async () => {
    render(
      <PixelValeProvider defaultSoundEnabled={false}>
        <ToastProvider>
          <Harness />
        </ToastProvider>
      </PixelValeProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Notify' }));
    const toast = await screen.findByRole('status');
    expect(toast.textContent).toContain('Day saved');

    fireEvent.click(screen.getByRole('button', { name: 'Dismiss notification' }));
    await waitFor(
      () => {
        expect(screen.queryByRole('status')).toBeNull();
      },
      { timeout: 1200 },
    );
  });
});
