import { describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { PixelValeProvider } from '../components/PixelValeProvider';
import { Avatar } from '../components/Avatar';
import { Combobox } from '../components/Combobox';
import { Rating } from '../components/Rating';
import { Sparkline } from '../components/Sparkline';

function withProvider(node: ReactNode) {
  return <PixelValeProvider defaultSoundEnabled={false}>{node}</PixelValeProvider>;
}

const TASKS = [
  { value: 'water', label: 'Water the field', keywords: 'parsnip crops' },
  { value: 'pack', label: 'Pack the bag', description: 'Torch and snacks' },
  { value: 'mine', label: 'Reach floor 20', keywords: 'mines' },
  { value: 'locked', label: 'Locked chore', disabled: true },
];

describe('Combobox', () => {
  it('opens, filters, and selects an option from the keyboard', async () => {
    const onValueChange = vi.fn();
    render(
      withProvider(
        <Combobox
          label="Task"
          options={TASKS}
          onValueChange={onValueChange}
          hint="Type to filter"
        />,
      ),
    );

    const input = screen.getByRole('combobox', { name: 'Task' });
    fireEvent.focus(input);
    expect(await screen.findByRole('listbox')).toBeTruthy();
    expect(screen.getAllByRole('option')).toHaveLength(4);

    fireEvent.change(input, { target: { value: 'pack' } });
    expect(screen.getAllByRole('option')).toHaveLength(1);
    expect(screen.getByRole('option', { name: /Pack the bag/ })).toBeTruthy();

    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onValueChange).toHaveBeenCalledWith('pack');
    expect((input as HTMLInputElement).value).toBe('Pack the bag');
    await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull());
  });

  it('closes on Escape and supports clearing', async () => {
    const onValueChange = vi.fn();
    render(
      withProvider(
        <Combobox
          label="Task"
          options={TASKS}
          defaultValue="water"
          clearable
          name="task"
          onValueChange={onValueChange}
        />,
      ),
    );

    const input = screen.getByRole('combobox', { name: 'Task' }) as HTMLInputElement;
    expect(input.value).toBe('Water the field');
    fireEvent.focus(input);
    expect(await screen.findByRole('listbox')).toBeTruthy();

    fireEvent.keyDown(input, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull());

    fireEvent.click(screen.getByRole('button', { name: 'Clear selection' }));
    expect(input.value).toBe('');
    expect(onValueChange).toHaveBeenLastCalledWith('');
    expect(document.activeElement).toBe(input);
    expect(screen.queryByRole('listbox')).toBeNull();
    const hidden = document.querySelector<HTMLInputElement>('input[type="hidden"]');
    expect(hidden?.value).toBe('');
  });
});

describe('Rating', () => {
  it('uses radiogroup semantics and supports keyboard selection', () => {
    const onValueChange = vi.fn();
    render(
      withProvider(
        <Rating
          label="Harvest"
          defaultValue={3}
          onValueChange={onValueChange}
          showValue
        />,
      ),
    );

    const group = screen.getByRole('radiogroup', { name: /Harvest/ });
    const radios = screen.getAllByRole('radio') as HTMLButtonElement[];
    expect(group).toBeTruthy();
    expect(radios).toHaveLength(5);
    expect(radios[2]?.getAttribute('aria-checked')).toBe('true');
    expect(radios[2]?.tabIndex).toBe(0);

    fireEvent.click(radios[4] as HTMLElement);
    expect(onValueChange).toHaveBeenLastCalledWith(5);
    expect(radios[4]?.getAttribute('aria-checked')).toBe('true');

    fireEvent.keyDown(radios[4] as HTMLElement, { key: 'ArrowLeft' });
    expect(onValueChange).toHaveBeenLastCalledWith(4);
    expect(radios[3]?.getAttribute('aria-checked')).toBe('true');
  });

  it('supports read-only output and clearing', () => {
    const onValueChange = vi.fn();
    const { rerender } = render(
      withProvider(<Rating label="Harvest" defaultValue={3} readOnly />),
    );
    expect(screen.getByRole('img', { name: /Harvest: 3 out of 5 stars/ })).toBeTruthy();
    expect(screen.queryAllByRole('radio')).toHaveLength(0);

    rerender(
      withProvider(
        <Rating
          label="Harvest"
          defaultValue={3}
          allowClear
          onValueChange={onValueChange}
        />,
      ),
    );
    fireEvent.click(screen.getByRole('radio', { name: '3 stars' }));
    expect(onValueChange).toHaveBeenLastCalledWith(0);
  });
});

describe('Sparkline', () => {
  it('renders a labelled line chart and filters invalid values', () => {
    const { container } = render(
      withProvider(
        <Sparkline values={[1, 4, Number.NaN, 2, 8]} label="Energy" tone="gold" />,
      ),
    );

    const image = screen.getByRole('img', {
      name: /Energy: 4 points, last 8/,
    });
    expect(image).toBeTruthy();
    const line = container.querySelector('.pv-sparkline__line');
    expect(line?.getAttribute('d')).toContain('M');
    expect(line?.getAttribute('d')).not.toContain('NaN');
    expect(container.querySelector('.pv-sparkline--gold')).toBeTruthy();
  });

  it('supports bars, single values, and empty data', () => {
    const { container, rerender } = render(
      withProvider(<Sparkline values={[3]} variant="bars" />),
    );
    expect(container.querySelectorAll('.pv-sparkline__bar')).toHaveLength(1);

    rerender(withProvider(<Sparkline values={[]} variant="bars" />));
    expect(screen.getByRole('img', { name: /No data/ })).toBeTruthy();
    expect(container.querySelectorAll('.pv-sparkline__bar')).toHaveLength(0);
  });
});

describe('Avatar', () => {
  it('shows initials, status text, and falls back on image failure', () => {
    const { rerender } = render(
      withProvider(<Avatar name="Marnie Oakes" status="online" />),
    );
    expect(screen.getByRole('img', { name: 'Marnie Oakes' }).textContent).toContain('MO');
    expect(screen.getByText('Online')).toBeTruthy();

    rerender(
      withProvider(
        <Avatar name="Marnie Oakes" src="https://example.com/marnie.png" status="away" />,
      ),
    );
    const image = screen.getByRole('img', { name: 'Marnie Oakes' });
    expect(image.getAttribute('src')).toBe('https://example.com/marnie.png');
    fireEvent.error(image);
    expect(screen.getByRole('img', { name: 'Marnie Oakes' }).textContent).toContain('MO');
    expect(screen.getByText('Away')).toBeTruthy();
  });
});
