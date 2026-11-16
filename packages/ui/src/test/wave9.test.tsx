import { describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { PixelValeProvider } from '../components/PixelValeProvider';
import { Carousel } from '../components/Carousel';
import { DatePicker } from '../components/DatePicker';
import { FileDropzone, type FileRejection } from '../components/FileDropzone';
import { Spinner } from '../components/Spinner';

function withProvider(node: ReactNode) {
  return <PixelValeProvider defaultSoundEnabled={false}>{node}</PixelValeProvider>;
}

function fileInput(container: HTMLElement): HTMLInputElement {
  return container.querySelector<HTMLInputElement>(
    'input[type="file"]',
  ) as HTMLInputElement;
}

function makeFile(name: string, size: number, type = 'image/png'): File {
  return new File([new Uint8Array(size)], name, { type });
}

describe('Spinner', () => {
  it('exposes a localized status label with optional visible text', () => {
    const { container, rerender } = render(withProvider(<Spinner />));
    expect(screen.getByRole('status', { name: 'Loading' })).toBeTruthy();
    expect(screen.getByText('Loading').classList.contains('pv-sr-only')).toBe(true);

    rerender(
      withProvider(<Spinner label="Sealing bottles" showLabel tone="gold" size="lg" />),
    );
    expect(screen.getByRole('status', { name: 'Sealing bottles' })).toBeTruthy();
    expect(screen.getByText('Sealing bottles').classList.contains('pv-sr-only')).toBe(
      false,
    );
    expect(container.querySelector('.pv-spinner--gold')).toBeTruthy();
    expect(container.querySelector('.pv-spinner--lg')).toBeTruthy();
  });
});

describe('DatePicker', () => {
  it('opens the calendar, selects a day, closes, and returns focus', async () => {
    const onValueChange = vi.fn();
    render(
      withProvider(
        <DatePicker
          label="Bottling date"
          defaultValue="2026-03-12"
          today="2026-03-15"
          name="bottling-date"
          onValueChange={onValueChange}
        />,
      ),
    );

    const trigger = screen.getByRole('button', { name: /Bottling date/ });
    expect(trigger.textContent).toContain('Mar 12, 2026');
    expect(
      document.querySelector<HTMLInputElement>('input[name="bottling-date"]')?.value,
    ).toBe('2026-03-12');

    fireEvent.click(trigger);
    expect(screen.getByRole('dialog', { name: 'Bottling date' })).toBeTruthy();
    expect(screen.getByRole('group', { name: 'Calendar' })).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /March 20, 2026/ }));
    expect(onValueChange).toHaveBeenLastCalledWith('2026-03-20');
    await waitFor(() =>
      expect(screen.queryByRole('dialog', { name: 'Bottling date' })).toBeNull(),
    );
    expect(trigger.textContent).toContain('Mar 20, 2026');
    expect(document.activeElement).toBe(trigger);
    expect(
      document.querySelector<HTMLInputElement>('input[name="bottling-date"]')?.value,
    ).toBe('2026-03-20');
  });

  it('clears the date and supports disabled dates', () => {
    const onValueChange = vi.fn();
    render(
      withProvider(
        <DatePicker
          label="Bottling date"
          defaultValue="2026-03-12"
          today="2026-03-15"
          min="2026-03-10"
          max="2026-03-20"
          onValueChange={onValueChange}
        />,
      ),
    );

    fireEvent.click(screen.getByRole('button', { name: /Bottling date/ }));
    expect(
      screen.getByRole('button', { name: /March 9, 2026/ }).hasAttribute('disabled'),
    ).toBe(true);
    expect(
      screen.getByRole('button', { name: /March 21, 2026/ }).hasAttribute('disabled'),
    ).toBe(true);

    fireEvent.click(screen.getByRole('button', { name: 'Clear date' }));
    expect(onValueChange).toHaveBeenLastCalledWith('');
    expect(screen.getByRole('button', { name: /Bottling date/ }).textContent).toContain(
      'Select a date',
    );
    expect(document.activeElement).toBe(
      screen.getByRole('button', { name: /Bottling date/ }),
    );
  });

  it('does not open while disabled and wires hint/error text', () => {
    const { rerender } = render(
      withProvider(
        <DatePicker
          label="Bottling date"
          defaultValue="2026-03-12"
          disabled
          hint="Bottles are sealed on this day."
        />,
      ),
    );
    const trigger = screen.getByRole('button', { name: /Bottling date/ });
    expect(trigger.hasAttribute('disabled')).toBe(true);
    fireEvent.click(trigger);
    expect(screen.queryByRole('dialog')).toBeNull();

    rerender(
      withProvider(
        <DatePicker
          label="Bottling date"
          defaultValue="2026-03-12"
          error="Choose a day in spring."
        />,
      ),
    );
    const activeTrigger = screen.getByRole('button', { name: /Bottling date/ });
    const error = screen.getByText('Choose a day in spring.');
    expect(activeTrigger.getAttribute('aria-invalid')).toBe('true');
    expect(activeTrigger.getAttribute('aria-describedby')).toBe(error.id);
  });
});

describe('FileDropzone', () => {
  it('accepts files, renders the list, and removes a file', () => {
    const onFilesChange = vi.fn();
    const { container } = render(
      withProvider(
        <FileDropzone
          label="Recipe cards"
          accept="image/*,.pdf"
          multiple
          maxFiles={3}
          maxSize={4096}
          onFilesChange={onFilesChange}
        />,
      ),
    );

    const input = fileInput(container);
    const png = makeFile('seed.png', 1024);
    const pdf = makeFile('notes.pdf', 2048, 'application/pdf');
    fireEvent.change(input, { target: { files: [png, pdf] } });

    expect(onFilesChange).toHaveBeenLastCalledWith([png, pdf]);
    expect(screen.getByText('seed.png')).toBeTruthy();
    expect(screen.getByText('notes.pdf')).toBeTruthy();
    expect(screen.getByText('1.0 KB')).toBeTruthy();
    expect(screen.getByText('2.0 KB')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Remove seed.png' }));
    expect(screen.queryByText('seed.png')).toBeNull();
    expect(onFilesChange).toHaveBeenLastCalledWith([pdf]);
  });

  it('reports type, size, and count rejections', () => {
    const onReject = vi.fn<(rejections: FileRejection[]) => void>();
    const { container } = render(
      withProvider(
        <FileDropzone
          label="Recipe cards"
          accept="image/png"
          maxFiles={2}
          maxSize={1024}
          multiple
          onReject={onReject}
        />,
      ),
    );

    fireEvent.change(fileInput(container), {
      target: {
        files: [
          makeFile('ok.png', 100),
          makeFile('notes.pdf', 100, 'application/pdf'),
          makeFile('huge.png', 2048),
          makeFile('third.png', 100),
          makeFile('fourth.png', 100),
        ],
      },
    });

    expect(container.querySelectorAll('.pv-file-dropzone__file')).toHaveLength(2);
    expect(screen.getByText('notes.pdf is not an accepted type')).toBeTruthy();
    expect(screen.getByText(/huge\.png is too large/)).toBeTruthy();
    expect(onReject).toHaveBeenCalledTimes(1);
    const reasons = (onReject.mock.calls[0]?.[0] ?? []).map(
      (rejection) => rejection.reason,
    );
    expect(reasons).toEqual(['type', 'size', 'count']);
  });

  it('replaces the file in single mode and supports drag/drop', () => {
    const onFilesChange = vi.fn();
    const { container } = render(
      withProvider(
        <FileDropzone
          label="Recipe card"
          multiple={false}
          accept="image/*"
          onFilesChange={onFilesChange}
        />,
      ),
    );

    const first = makeFile('first.png', 100);
    const second = makeFile('second.png', 100);
    fireEvent.change(fileInput(container), { target: { files: [first] } });
    expect(onFilesChange).toHaveBeenLastCalledWith([first]);
    fireEvent.change(fileInput(container), { target: { files: [second] } });
    expect(onFilesChange).toHaveBeenLastCalledWith([second]);
    expect(screen.queryByText('first.png')).toBeNull();

    const target = screen.getByRole('button', { name: /Recipe card/ });
    const dropped = makeFile('dropped.png', 100);
    fireEvent.dragEnter(target, { dataTransfer: { files: [dropped] } });
    expect(target.getAttribute('data-dragging')).toBe('true');
    fireEvent.drop(target, { dataTransfer: { files: [dropped] } });
    expect(onFilesChange).toHaveBeenLastCalledWith([dropped]);
    expect(target.getAttribute('data-dragging')).toBeNull();
  });

  it('respects disabled state and exposes external errors', () => {
    const onFilesChange = vi.fn();
    const { container } = render(
      withProvider(
        <FileDropzone
          label="Recipe cards"
          disabled
          error="The card drawer is locked."
          onFilesChange={onFilesChange}
        />,
      ),
    );

    const target = screen.getByRole('button', { name: /Recipe cards/ });
    const error = screen.getByRole('alert');
    expect(error.textContent).toBe('The card drawer is locked.');
    expect(target.hasAttribute('disabled')).toBe(true);
    expect(target.getAttribute('aria-describedby')).toBe(error.id);
    expect(fileInput(container).disabled).toBe(true);
    fireEvent.change(fileInput(container), {
      target: { files: [makeFile('locked.png', 100)] },
    });
    expect(onFilesChange).not.toHaveBeenCalled();
  });
});

describe('Carousel', () => {
  const items = [
    { id: 'a', content: <p>First label</p>, label: 'First label' },
    { id: 'b', content: <p>Second label</p>, label: 'Second label' },
    { id: 'c', content: <p>Third label</p>, label: 'Third label' },
  ];

  it('moves between slides and exposes the active slide', () => {
    const onIndexChange = vi.fn();
    const { container } = render(
      withProvider(
        <Carousel label="Label press" items={items} onIndexChange={onIndexChange} />,
      ),
    );

    expect(screen.getByRole('region', { name: 'Label press' })).toBeTruthy();
    expect(screen.getByText('Slide 1 of 3')).toBeTruthy();
    const slides = Array.from(
      container.querySelectorAll<HTMLElement>('.pv-carousel__slide'),
    );
    expect(slides).toHaveLength(3);
    expect(slides[0]?.hasAttribute('aria-hidden')).toBe(false);
    expect(slides[1]?.getAttribute('aria-hidden')).toBe('true');
    expect(slides[1]?.hasAttribute('inert')).toBe(true);
    expect(
      screen.getByRole('button', { name: 'Previous slide' }).hasAttribute('disabled'),
    ).toBe(true);

    fireEvent.click(screen.getByRole('button', { name: 'Next slide' }));
    expect(onIndexChange).toHaveBeenLastCalledWith(1);
    expect(screen.getByText('Slide 2 of 3')).toBeTruthy();
    expect(
      screen.getByRole('button', { name: 'Go to slide 2' }).getAttribute('aria-current'),
    ).toBe('true');

    fireEvent.click(screen.getByRole('button', { name: 'Go to slide 3' }));
    expect(onIndexChange).toHaveBeenLastCalledWith(2);
    expect(
      screen.getByRole('button', { name: 'Next slide' }).hasAttribute('disabled'),
    ).toBe(true);
    expect(
      container.querySelector('.pv-carousel__track')?.getAttribute('style'),
    ).toContain('translateX(-200%)');
  });

  it('supports looping, hidden controls, and empty data', () => {
    const { container, rerender } = render(
      withProvider(<Carousel items={items} defaultIndex={2} loop />),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Next slide' }));
    expect(screen.getByText('Slide 1 of 3')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Previous slide' }));
    expect(screen.getByText('Slide 3 of 3')).toBeTruthy();

    rerender(
      withProvider(
        <Carousel
          items={items}
          showArrows={false}
          showDots={false}
          showCounter={false}
        />,
      ),
    );
    expect(screen.queryByRole('button', { name: 'Next slide' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Go to slide 1' })).toBeNull();
    expect(screen.queryByText('Slide 1 of 3')).toBeNull();

    rerender(withProvider(<Carousel items={[]} />));
    expect(container.querySelector('.pv-carousel')).toBeNull();
  });
});
