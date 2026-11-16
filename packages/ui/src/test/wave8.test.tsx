import { describe, expect, it, vi } from 'vitest';
import { useState, type ReactNode } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { PixelValeProvider } from '../components/PixelValeProvider';
import { Button } from '../components/Button';
import { Calendar } from '../components/Calendar';
import { DataTable, type DataTableColumn } from '../components/DataTable';
import { Popover } from '../components/Popover';
import { TreeView, type TreeNode } from '../components/TreeView';

function withProvider(node: ReactNode) {
  return <PixelValeProvider defaultSoundEnabled={false}>{node}</PixelValeProvider>;
}

const treeNodes: readonly TreeNode[] = [
  {
    id: 'spring',
    label: 'Spring',
    children: [
      {
        id: 'crops',
        label: 'Crops',
        children: [
          { id: 'parsnip', label: 'Parsnip' },
          { id: 'strawberry', label: 'Strawberry' },
        ],
      },
      { id: 'forage', label: 'Forage' },
    ],
  },
  { id: 'summer', label: 'Summer', children: [{ id: 'melon', label: 'Melon' }] },
  { id: 'locked', label: 'Locked', disabled: true },
];

interface Crop {
  id: string;
  name: string;
  value: number | null;
}

const crops: readonly Crop[] = [
  { id: 'parsnip', name: 'Parsnip', value: 35 },
  { id: 'apple', name: 'Apple', value: 50 },
  { id: 'pumpkin', name: 'Pumpkin', value: null },
];

const columns: readonly DataTableColumn<Crop>[] = [
  {
    id: 'name',
    header: 'Crop',
    cell: (row) => row.name,
    sortValue: (row) => row.name,
  },
  {
    id: 'value',
    header: 'Value',
    cell: (row) => (row.value === null ? '—' : `${row.value}g`),
    sortValue: (row) => row.value,
    align: 'end',
  },
  {
    id: 'note',
    header: 'Note',
    cell: () => 'Fresh',
  },
];

describe('Popover', () => {
  it('opens from the trigger, focuses content, and closes outside', async () => {
    render(
      withProvider(
        <Popover label="Seed details" trigger={<Button>Details</Button>}>
          <p>Parsnip seeds, 35g.</p>
          <button type="button">Pack</button>
        </Popover>,
      ),
    );

    const trigger = screen.getByRole('button', { name: 'Details' });
    expect(trigger.getAttribute('aria-expanded')).toBe('false');

    fireEvent.click(trigger);
    const dialog = screen.getByRole('dialog', { name: 'Seed details' });
    expect(dialog).toBeTruthy();
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Pack' })),
    );

    fireEvent.pointerDown(document.body);
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  it('closes with Escape and restores trigger focus', async () => {
    render(
      withProvider(
        <Popover label="Notes" trigger={<Button>Notes</Button>}>
          <p>Some notes.</p>
        </Popover>,
      ),
    );
    const trigger = screen.getByRole('button', { name: 'Notes' });
    fireEvent.click(trigger);
    expect(screen.getByRole('dialog', { name: 'Notes' })).toBeTruthy();

    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(document.activeElement).toBe(trigger);
  });

  it('keeps trigger handlers, supports controlled state, and respects disabled', () => {
    const onTrigger = vi.fn();
    const onOpenChange = vi.fn();

    function Controlled() {
      const [open, setOpen] = useState(false);
      return (
        <Popover
          label="Controlled"
          trigger={<Button onClick={onTrigger}>Open</Button>}
          disabled
          open={open}
          onOpenChange={(next) => {
            onOpenChange(next);
            setOpen(next);
          }}
        >
          <button type="button">Inside</button>
        </Popover>
      );
    }

    const { rerender } = render(withProvider(<Controlled />));
    const disabledTrigger = screen.getByRole('button', { name: 'Open' });
    fireEvent.click(disabledTrigger);
    expect(onTrigger).toHaveBeenCalledTimes(1);
    expect(onOpenChange).not.toHaveBeenCalled();

    rerender(
      withProvider(
        <Popover
          label="Controlled"
          trigger={<Button onClick={onTrigger}>Open</Button>}
          open
          onOpenChange={onOpenChange}
        >
          <button type="button">Inside</button>
        </Popover>,
      ),
    );
    expect(screen.getByRole('dialog', { name: 'Controlled' })).toBeTruthy();
    fireEvent.pointerDown(document.body);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('can skip outside-click closing', () => {
    render(
      withProvider(
        <Popover
          label="Sticky"
          defaultOpen
          closeOnOutsideClick={false}
          trigger={<Button>Sticky</Button>}
        >
          <button type="button">Still here</button>
        </Popover>,
      ),
    );
    fireEvent.pointerDown(document.body);
    expect(screen.getByRole('dialog', { name: 'Sticky' })).toBeTruthy();
  });
});

describe('Calendar', () => {
  it('renders a stable grid with selected/today markers and selection', () => {
    const onValueChange = vi.fn();
    const { container } = render(
      withProvider(
        <Calendar
          today="2026-03-15"
          defaultMonth="2026-03"
          defaultValue="2026-03-12"
          onValueChange={onValueChange}
        />,
      ),
    );

    expect(screen.getByRole('group', { name: 'Calendar' })).toBeTruthy();
    expect(screen.getByText('March 2026')).toBeTruthy();
    expect(container.querySelectorAll('.pv-calendar__day')).toHaveLength(42);

    const selected = container.querySelector<HTMLButtonElement>(
      '.pv-calendar__day[data-selected="true"]',
    );
    expect(selected?.textContent).toBe('12');
    expect(selected?.getAttribute('aria-pressed')).toBe('true');

    const today = container.querySelector<HTMLButtonElement>(
      '.pv-calendar__day[data-today="true"]',
    );
    expect(today?.textContent).toBe('15');
    expect(today?.getAttribute('aria-current')).toBe('date');

    fireEvent.click(screen.getByRole('button', { name: /March 20, 2026/ }));
    expect(onValueChange).toHaveBeenLastCalledWith('2026-03-20');
    expect(
      screen.getByRole('button', { name: /March 20, 2026/ }).getAttribute('aria-pressed'),
    ).toBe('true');
  });

  it('moves focus with arrows and pages months', async () => {
    const { container } = render(
      withProvider(
        <Calendar today="2026-03-15" defaultMonth="2026-03" defaultValue="2026-03-12" />,
      ),
    );
    const selected = container.querySelector<HTMLButtonElement>(
      '.pv-calendar__day[data-selected="true"]',
    );
    selected?.focus();

    fireEvent.keyDown(selected as HTMLElement, { key: 'ArrowRight' });
    await waitFor(() => expect(document.activeElement?.textContent).toBe('13'));

    fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'ArrowDown' });
    await waitFor(() => expect(document.activeElement?.textContent).toBe('20'));

    fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'PageDown' });
    await waitFor(() => expect(screen.getByText('April 2026')).toBeTruthy());
    await waitFor(() => expect(document.activeElement?.textContent).toBe('20'));
  });

  it('navigates months and selects today', () => {
    const onMonthChange = vi.fn();
    const onValueChange = vi.fn();
    render(
      withProvider(
        <Calendar
          today="2026-03-15"
          defaultMonth="2026-03"
          defaultValue="2026-03-12"
          onMonthChange={onMonthChange}
          onValueChange={onValueChange}
        />,
      ),
    );

    fireEvent.click(screen.getByRole('button', { name: 'Next month' }));
    expect(screen.getByText('April 2026')).toBeTruthy();
    expect(onMonthChange).toHaveBeenLastCalledWith('2026-04');

    fireEvent.click(screen.getByRole('button', { name: 'Today' }));
    expect(screen.getByText('March 2026')).toBeTruthy();
    expect(onValueChange).toHaveBeenLastCalledWith('2026-03-15');
  });

  it('respects min/max, hidden outside days, and week starts', () => {
    const { container } = render(
      withProvider(
        <Calendar
          today="2026-03-15"
          defaultMonth="2026-03"
          min="2026-03-10"
          max="2026-03-20"
          showOutsideDays={false}
          weekStartsOn={1}
        />,
      ),
    );

    expect(
      screen.getByRole('button', { name: /March 9, 2026/ }).hasAttribute('disabled'),
    ).toBe(true);
    expect(
      screen.getByRole('button', { name: /March 21, 2026/ }).hasAttribute('disabled'),
    ).toBe(true);
    expect(container.querySelectorAll('.pv-calendar__day')).toHaveLength(31);
    expect(screen.getAllByRole('columnheader')[0]?.textContent).toBe('Mon');
  });
});

describe('DataTable', () => {
  const getRowKey = (row: Crop) => row.id;
  const rowNames = (container: HTMLElement) =>
    Array.from(container.querySelectorAll('tbody tr')).map(
      (row) => row.querySelector('td')?.textContent,
    );

  it('sorts by a default column and toggles direction', () => {
    const onSortChange = vi.fn();
    const { container } = render(
      withProvider(
        <DataTable
          label="Crops"
          columns={columns}
          rows={crops}
          getRowKey={getRowKey}
          defaultSort={{ columnId: 'value', direction: 'desc' }}
          onSortChange={onSortChange}
        />,
      ),
    );

    expect(screen.getByRole('region', { name: 'Crops' })).toBeTruthy();
    expect(rowNames(container)).toEqual(['Apple', 'Parsnip', 'Pumpkin']);
    const valueHeader = screen.getByRole('columnheader', { name: /Value/ });
    expect(valueHeader.getAttribute('aria-sort')).toBe('descending');

    fireEvent.click(screen.getByRole('button', { name: 'Crop' }));
    expect(onSortChange).toHaveBeenLastCalledWith({
      columnId: 'name',
      direction: 'asc',
    });
    expect(rowNames(container)).toEqual(['Apple', 'Parsnip', 'Pumpkin']);

    fireEvent.click(screen.getByRole('button', { name: 'Crop' }));
    expect(onSortChange).toHaveBeenLastCalledWith({
      columnId: 'name',
      direction: 'desc',
    });
    expect(rowNames(container)).toEqual(['Pumpkin', 'Parsnip', 'Apple']);
  });

  it('keeps null values last and supports empty and captioned tables', () => {
    const { container, rerender } = render(
      withProvider(
        <DataTable
          label="Crops"
          caption="Spring harvest"
          columns={columns}
          rows={crops}
          getRowKey={getRowKey}
          defaultSort={{ columnId: 'value', direction: 'asc' }}
        />,
      ),
    );
    expect(screen.getByText('Spring harvest')).toBeTruthy();
    expect(rowNames(container)).toEqual(['Parsnip', 'Apple', 'Pumpkin']);

    rerender(
      withProvider(
        <DataTable
          label="Empty crops"
          columns={columns}
          rows={[]}
          getRowKey={getRowKey}
          emptyMessage="Nothing pinned yet"
        />,
      ),
    );
    expect(screen.getByText('Nothing pinned yet')).toBeTruthy();
    expect(screen.getByRole('region', { name: 'Empty crops' })).toBeTruthy();
  });

  it('applies compact, striped, sticky, and alignment options', () => {
    const { container } = render(
      withProvider(
        <DataTable
          label="Crops"
          columns={columns}
          rows={crops}
          getRowKey={getRowKey}
          size="sm"
          striped
          stickyHeader
        />,
      ),
    );
    expect(container.querySelector('.pv-data-table--sm')).toBeTruthy();
    expect(container.querySelector('.pv-data-table--striped')).toBeTruthy();
    expect(container.querySelector('.pv-data-table--sticky')).toBeTruthy();
    expect(container.querySelector('th[data-align="end"]')?.textContent).toContain(
      'Value',
    );
  });
});

describe('TreeView', () => {
  const treeItem = (name: string) =>
    screen
      .getByText(name, { selector: '.pv-tree__label' })
      .closest('[role="treeitem"]') as HTMLElement;
  const rowOf = (name: string) =>
    treeItem(name).querySelector('.pv-tree__row') as HTMLElement;
  const focusedLabel = () =>
    document.activeElement?.querySelector('.pv-tree__label')?.textContent ?? null;

  it('renders nested groups, selection, and expansion state', () => {
    const onSelectedChange = vi.fn();
    render(
      withProvider(
        <TreeView
          label="Farm archive"
          nodes={treeNodes}
          defaultExpanded={['spring', 'crops']}
          defaultSelected="parsnip"
          onSelectedChange={onSelectedChange}
        />,
      ),
    );

    expect(screen.getByRole('tree', { name: 'Farm archive' })).toBeTruthy();
    expect(screen.getAllByRole('treeitem')).toHaveLength(7);
    expect(treeItem('Spring').getAttribute('aria-expanded')).toBe('true');
    expect(treeItem('Parsnip').getAttribute('aria-selected')).toBe('true');

    fireEvent.click(rowOf('Forage'));
    expect(onSelectedChange).toHaveBeenLastCalledWith('forage');
    expect(treeItem('Forage').getAttribute('aria-selected')).toBe('true');
  });

  it('supports roving focus, expand/collapse, and Enter selection', async () => {
    const onSelectedChange = vi.fn();
    render(
      withProvider(
        <TreeView
          nodes={treeNodes}
          defaultExpanded={['spring', 'crops']}
          defaultSelected="parsnip"
          onSelectedChange={onSelectedChange}
        />,
      ),
    );

    const parsnip = treeItem('Parsnip');
    parsnip.focus();
    fireEvent.keyDown(parsnip, { key: 'ArrowDown' });
    await waitFor(() => expect(focusedLabel()).toBe('Strawberry'));

    fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'ArrowDown' });
    await waitFor(() => expect(focusedLabel()).toBe('Forage'));

    fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'ArrowLeft' });
    await waitFor(() => expect(focusedLabel()).toBe('Spring'));
    fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'ArrowDown' });
    await waitFor(() => expect(focusedLabel()).toBe('Crops'));
    fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'ArrowLeft' });
    await waitFor(() =>
      expect(treeItem('Crops').getAttribute('aria-expanded')).toBe('false'),
    );

    fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'ArrowRight' });
    await waitFor(() =>
      expect(treeItem('Crops').getAttribute('aria-expanded')).toBe('true'),
    );
    fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'ArrowRight' });
    await waitFor(() => expect(focusedLabel()).toBe('Parsnip'));

    fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'ArrowDown' });
    await waitFor(() => expect(focusedLabel()).toBe('Strawberry'));
    fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'Enter' });
    expect(onSelectedChange).toHaveBeenLastCalledWith('strawberry');
  });

  it('ignores disabled nodes and supports Home/End', async () => {
    const onSelectedChange = vi.fn();
    render(
      withProvider(
        <TreeView
          nodes={treeNodes}
          defaultExpanded={['spring', 'crops']}
          onSelectedChange={onSelectedChange}
        />,
      ),
    );

    const locked = treeItem('Locked');
    expect(locked.getAttribute('aria-disabled')).toBe('true');
    fireEvent.click(rowOf('Locked'));
    expect(onSelectedChange).not.toHaveBeenCalled();

    const parsnip = treeItem('Parsnip');
    parsnip.focus();
    fireEvent.keyDown(parsnip, { key: 'End' });
    await waitFor(() => expect(focusedLabel()).toBe('Locked'));
    fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'Home' });
    await waitFor(() => expect(focusedLabel()).toBe('Spring'));
  });

  it('can be disabled as a whole', () => {
    const onSelectedChange = vi.fn();
    render(
      withProvider(
        <TreeView
          nodes={treeNodes}
          defaultExpanded={['spring']}
          disabled
          onSelectedChange={onSelectedChange}
        />,
      ),
    );
    fireEvent.click(rowOf('Spring'));
    expect(onSelectedChange).not.toHaveBeenCalled();
    expect(screen.getByRole('tree').getAttribute('aria-disabled')).toBe('true');
  });
});
