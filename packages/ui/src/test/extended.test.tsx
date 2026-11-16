import { describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { PixelValeProvider } from '../components/PixelValeProvider';
import { Accordion } from '../components/Accordion';
import { Alert } from '../components/Alert';
import { RadioGroup } from '../components/RadioGroup';
import { NumberField } from '../components/NumberField';
import { DropdownMenu, type DropdownMenuItem } from '../components/DropdownMenu';
import { EmptyState } from '../components/EmptyState';

function withProvider(node: ReactNode) {
  return <PixelValeProvider defaultSoundEnabled={false}>{node}</PixelValeProvider>;
}

describe('Accordion', () => {
  const items = [
    { value: 'alpha', title: 'Alpha', content: 'Alpha content' },
    { value: 'beta', title: 'Beta', content: 'Beta content' },
    { value: 'gamma', title: 'Gamma', content: 'Gamma content', disabled: true },
  ];

  it('opens one section at a time and closes it again', () => {
    render(withProvider(<Accordion items={items} />));
    const alpha = screen.getByRole('button', { name: 'Alpha' });
    const beta = screen.getByRole('button', { name: 'Beta' });

    expect(alpha.getAttribute('aria-expanded')).toBe('false');
    const alphaPanel = document.getElementById(alpha.getAttribute('aria-controls') ?? '');
    expect(alphaPanel?.hasAttribute('inert')).toBe(true);

    fireEvent.click(alpha);
    expect(alpha.getAttribute('aria-expanded')).toBe('true');
    expect(alphaPanel?.hasAttribute('inert')).toBe(false);
    expect(alpha.getAttribute('aria-controls')).toBeTruthy();

    fireEvent.click(beta);
    expect(alpha.getAttribute('aria-expanded')).toBe('false');
    expect(beta.getAttribute('aria-expanded')).toBe('true');

    fireEvent.click(beta);
    expect(beta.getAttribute('aria-expanded')).toBe('false');
  });

  it('supports multiple open sections and skips disabled headers with arrows', () => {
    render(
      withProvider(
        <Accordion
          items={items}
          multiple
          defaultValue={['alpha', 'beta']}
          headingLevel={3}
        />,
      ),
    );

    expect(
      screen.getByRole('button', { name: 'Alpha' }).getAttribute('aria-expanded'),
    ).toBe('true');
    expect(
      screen.getByRole('button', { name: 'Beta' }).getAttribute('aria-expanded'),
    ).toBe('true');

    const alpha = screen.getByRole('button', { name: 'Alpha' });
    alpha.focus();
    fireEvent.keyDown(alpha, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Beta' }));

    const beta = screen.getByRole('button', { name: 'Beta' });
    fireEvent.keyDown(beta, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(alpha);
  });
});

describe('Alert', () => {
  it('uses status and alert roles by variant', () => {
    const { rerender } = render(withProvider(<Alert title="Saved" variant="success" />));
    expect(screen.getByRole('status').textContent).toContain('Saved');

    rerender(withProvider(<Alert title="Something broke" variant="error" />));
    expect(screen.getByRole('alert').textContent).toContain('Something broke');
  });

  it('only shows a close button when a dismiss handler exists', () => {
    const onDismiss = vi.fn();
    const { rerender } = render(withProvider(<Alert title="Notice" />));
    expect(screen.queryByRole('button', { name: 'Dismiss message' })).toBeNull();

    rerender(withProvider(<Alert title="Notice" dismissible onDismiss={onDismiss} />));
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss message' }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});

describe('RadioGroup', () => {
  it('uses one native radio name and reports selection changes', () => {
    const onValueChange = vi.fn();
    render(
      withProvider(
        <RadioGroup
          label="Shipping method"
          defaultValue="bin"
          onValueChange={onValueChange}
          options={[
            { value: 'bin', label: 'Shipping bin' },
            { value: 'crate', label: 'Farm crate', description: 'Faster' },
            { value: 'merchant', label: 'Merchant', disabled: true },
          ]}
        />,
      ),
    );

    const radios = screen.getAllByRole('radio') as HTMLInputElement[];
    expect(radios).toHaveLength(3);
    expect(new Set(radios.map((radio) => radio.name)).size).toBe(1);
    expect(radios[0]?.checked).toBe(true);

    fireEvent.click(radios[1] as HTMLElement);
    expect(onValueChange).toHaveBeenCalledWith('crate');
    expect(radios[1]?.checked).toBe(true);
    expect((radios[2] as HTMLInputElement).disabled).toBe(true);
  });
});

describe('NumberField', () => {
  it('steps, clamps typed values, and disables buttons at the limits', () => {
    const onValueChange = vi.fn();
    render(
      withProvider(
        <NumberField
          label="Seeds"
          defaultValue={5}
          min={1}
          max={10}
          unit="seeds"
          onValueChange={onValueChange}
        />,
      ),
    );

    const input = screen.getByRole('spinbutton', { name: 'Seeds' }) as HTMLInputElement;
    expect(input.value).toBe('5');

    fireEvent.click(screen.getByRole('button', { name: 'Increase Seeds' }));
    expect(input.value).toBe('6');
    expect(onValueChange).toHaveBeenLastCalledWith(6);

    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(input.value).toBe('7');

    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: '99' } });
    fireEvent.blur(input);
    expect(input.value).toBe('10');
    expect(onValueChange).toHaveBeenLastCalledWith(10);
    expect(
      (screen.getByRole('button', { name: 'Increase Seeds' }) as HTMLButtonElement)
        .disabled,
    ).toBe(true);

    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'not a number' } });
    fireEvent.blur(input);
    expect(input.value).toBe('10');
  });
});

describe('NumberField draft stepping', () => {
  it('steps from the visible draft even before it has blurred', () => {
    const onValueChange = vi.fn();
    render(
      withProvider(
        <NumberField
          label="Seeds"
          defaultValue={5}
          min={1}
          max={99}
          onValueChange={onValueChange}
        />,
      ),
    );

    const input = screen.getByRole('spinbutton', { name: 'Seeds' }) as HTMLInputElement;
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: '50' } });
    fireEvent.click(screen.getByRole('button', { name: 'Increase Seeds' }));

    expect(input.value).toBe('51');
    expect(onValueChange).toHaveBeenLastCalledWith(51);

    fireEvent.change(input, { target: { value: '50' } });
    fireEvent.keyDown(input, { key: 'Home' });
    expect(input.value).toBe('1');

    fireEvent.keyDown(input, { key: 'End' });
    expect(input.value).toBe('99');
  });
});

describe('DropdownMenu', () => {
  const items: DropdownMenuItem[] = [
    {
      id: 'water',
      label: 'Water crops',
      shortcut: 'W',
      onSelect: vi.fn(),
    },
    { id: 'disabled', label: 'Locked action', disabled: true },
    { type: 'separator', id: 'sep' },
    { id: 'sleep', label: 'End the day', shortcut: 'N' },
  ];

  it('opens with keyboard focus on the first enabled item and closes on Escape', async () => {
    const onSelect = vi.fn();
    render(
      withProvider(
        <DropdownMenu label="Farm actions" items={items} onSelect={onSelect} />,
      ),
    );

    const trigger = screen.getByRole('button', { name: 'Farm actions' });
    trigger.focus();
    fireEvent.keyDown(trigger, { key: 'ArrowDown' });

    const menu = await screen.findByRole('menu');
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(menu.getAttribute('aria-label')).toBe('Farm actions menu');
    expect(document.activeElement?.textContent).toContain('Water crops');

    fireEvent.keyDown(menu, { key: 'ArrowDown' });
    expect(document.activeElement?.textContent).toContain('End the day');

    fireEvent.keyDown(menu, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
    expect(document.activeElement).toBe(trigger);
  });

  it('selects an item and returns focus to the trigger', async () => {
    const onSelect = vi.fn();
    render(
      withProvider(
        <DropdownMenu
          label="Farm actions"
          items={items}
          menuLabel="Farm actions"
          onSelect={onSelect}
        />,
      ),
    );

    const trigger = screen.getByRole('button', { name: 'Farm actions' });
    fireEvent.click(trigger);
    const item = await screen.findByRole('menuitem', { name: /Water crops/ });
    fireEvent.click(item);

    expect(onSelect).toHaveBeenCalledWith('water');
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
    expect(document.activeElement).toBe(trigger);
  });
});

describe('EmptyState', () => {
  it('renders a title, description, illustration, and action', () => {
    const onAction = vi.fn();
    render(
      withProvider(
        <EmptyState
          title="Nothing planted yet"
          description="The greenhouse is waiting."
          action={
            <button type="button" onClick={onAction}>
              Buy seeds
            </button>
          }
        />,
      ),
    );

    expect(screen.getByText('Nothing planted yet')).toBeTruthy();
    expect(screen.getByText('The greenhouse is waiting.')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Buy seeds' }));
    expect(onAction).toHaveBeenCalledTimes(1);
  });
});
