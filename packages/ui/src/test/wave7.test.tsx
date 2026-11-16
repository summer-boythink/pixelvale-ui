import { describe, expect, it, vi } from 'vitest';
import { useState, type ReactNode } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { PixelValeProvider } from '../components/PixelValeProvider';
import { Breadcrumb } from '../components/Breadcrumb';
import { Pagination, buildPageTokens } from '../components/Pagination';
import { TagInput } from '../components/TagInput';
import { Timeline } from '../components/Timeline';

function withProvider(node: ReactNode) {
  return <PixelValeProvider defaultSoundEnabled={false}>{node}</PixelValeProvider>;
}

describe('Breadcrumb', () => {
  it('renders links, buttons, separators, and the current page', () => {
    const onFarm = vi.fn();
    render(
      withProvider(
        <Breadcrumb
          items={[
            { label: 'Valley', href: '#valley' },
            { label: 'Willow Farm', onClick: onFarm },
            { label: 'Notice board' },
          ]}
        />,
      ),
    );

    const nav = screen.getByRole('navigation', { name: 'Breadcrumb' });
    expect(nav).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Valley' }).getAttribute('href')).toBe(
      '#valley',
    );

    fireEvent.click(screen.getByRole('button', { name: 'Willow Farm' }));
    expect(onFarm).toHaveBeenCalledTimes(1);

    const current = screen.getByText('Notice board').closest('.pv-breadcrumb__current');
    expect(current?.getAttribute('aria-current')).toBe('page');
    expect(current?.closest('a,button')).toBeNull();
    expect(nav.querySelectorAll('.pv-breadcrumb__separator')).toHaveLength(2);
  });

  it('accepts custom labels and renders nothing for an empty trail', () => {
    const { container, rerender } = render(
      withProvider(
        <Breadcrumb
          label="Farm path"
          separator="/"
          items={[
            { id: 'a', label: 'A', href: '#a' },
            { id: 'b', label: 'B', current: true },
          ]}
        />,
      ),
    );

    expect(screen.getByRole('navigation', { name: 'Farm path' })).toBeTruthy();
    expect(container.querySelectorAll('.pv-breadcrumb__separator')).toHaveLength(1);
    expect(screen.getByText('/')).toBeTruthy();

    rerender(withProvider(<Breadcrumb items={[]} />));
    expect(container.querySelector('.pv-breadcrumb')).toBeNull();
  });
});

describe('Pagination', () => {
  it('builds compact page tokens across edges and the middle', () => {
    expect(buildPageTokens(1, 2)).toEqual([1, 2]);
    expect(buildPageTokens(1, 10)).toEqual([1, 2, 3, 4, 'ellipsis', 10]);
    expect(buildPageTokens(5, 10)).toEqual([1, 'ellipsis', 4, 5, 6, 'ellipsis', 10]);
    expect(buildPageTokens(10, 10)).toEqual([1, 'ellipsis', 6, 7, 8, 9, 10]);
    expect(buildPageTokens(4, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(buildPageTokens(4, 8, 2)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(buildPageTokens(99, 10)).toEqual([1, 'ellipsis', 6, 7, 8, 9, 10]);
    expect(buildPageTokens(1, 0)).toEqual([]);
  });

  it('changes pages and exposes the current page', () => {
    const onPageChange = vi.fn();
    render(
      withProvider(
        <Pagination pageCount={10} defaultPage={5} onPageChange={onPageChange} />,
      ),
    );

    const current = screen.getByRole('button', { name: 'Page 5' });
    expect(current.getAttribute('aria-current')).toBe('page');

    fireEvent.click(screen.getByRole('button', { name: 'Page 6' }));
    expect(onPageChange).toHaveBeenLastCalledWith(6);
    expect(
      screen.getByRole('button', { name: 'Page 6' }).getAttribute('aria-current'),
    ).toBe('page');

    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
    expect(onPageChange).toHaveBeenLastCalledWith(7);

    fireEvent.click(screen.getByRole('button', { name: 'Previous page' }));
    expect(onPageChange).toHaveBeenLastCalledWith(6);
  });

  it('clamps pages, disables arrows, and supports compact and single-page modes', () => {
    const { container, rerender } = render(
      withProvider(<Pagination pageCount={5} page={99} />),
    );

    const last = screen.getByRole('button', { name: 'Page 5' });
    expect(last.getAttribute('aria-current')).toBe('page');
    expect(
      screen.getByRole('button', { name: 'Next page' }).hasAttribute('disabled'),
    ).toBe(true);

    rerender(withProvider(<Pagination pageCount={5} page={1} size="sm" />));
    expect(
      screen.getByRole('button', { name: 'Previous page' }).hasAttribute('disabled'),
    ).toBe(true);
    expect(container.querySelector('.pv-pagination--sm')).toBeTruthy();

    rerender(withProvider(<Pagination pageCount={0} />));
    expect(container.querySelector('.pv-pagination')).toBeNull();

    rerender(withProvider(<Pagination pageCount={1} hideOnSinglePage />));
    expect(container.querySelector('.pv-pagination')).toBeNull();
  });

  it('does not fire for disabled or current pages', () => {
    const onPageChange = vi.fn();
    const { rerender } = render(
      withProvider(
        <Pagination pageCount={4} defaultPage={2} onPageChange={onPageChange} />,
      ),
    );

    fireEvent.click(screen.getByRole('button', { name: 'Page 2' }));
    expect(onPageChange).not.toHaveBeenCalled();

    rerender(
      withProvider(
        <Pagination pageCount={4} defaultPage={2} disabled onPageChange={onPageChange} />,
      ),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Page 3' }));
    expect(onPageChange).not.toHaveBeenCalled();
  });
});

describe('Timeline', () => {
  it('renders ordered entries, times, tones, and the active step', () => {
    render(
      withProvider(
        <Timeline
          items={[
            {
              id: 'plant',
              title: 'Planted parsnips',
              description: 'The north field is in.',
              timestamp: 'Spring 12',
              dateTime: '2026-03-12',
              tone: 'success',
            },
            {
              id: 'rain',
              title: 'Rain all afternoon',
              timestamp: 'Spring 13',
              dateTime: '2026-03-13',
              tone: 'info',
              active: true,
            },
          ]}
        />,
      ),
    );

    const list = screen.getByRole('list', { name: 'Timeline' });
    expect(list.tagName).toBe('OL');
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(items[0]?.getAttribute('data-tone')).toBe('success');
    expect(items[1]?.getAttribute('aria-current')).toBe('step');
    expect(items[1]?.getAttribute('data-active')).toBe('true');

    const time = screen.getByText('Spring 12');
    expect(time.tagName).toBe('TIME');
    expect(time.getAttribute('dateTime')).toBe('2026-03-12');
  });

  it('returns nothing for an empty timeline', () => {
    const { container } = render(withProvider(<Timeline items={[]} />));
    expect(container.querySelector('.pv-timeline')).toBeNull();
  });
});

describe('TagInput', () => {
  it('adds tags with Enter, commas, and Chinese commas', () => {
    const onValueChange = vi.fn();
    const { container } = render(
      withProvider(
        <TagInput label="Journal tags" name="tag" onValueChange={onValueChange} />,
      ),
    );
    const input = screen.getByRole('textbox', {
      name: 'Journal tags',
    }) as HTMLInputElement;

    fireEvent.change(input, { target: { value: 'spring' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(screen.getByText('spring')).toBeTruthy();
    expect(input.value).toBe('');
    expect(onValueChange).toHaveBeenLastCalledWith(['spring']);

    fireEvent.change(input, { target: { value: 'rain，tea' } });
    expect(screen.getByText('rain')).toBeTruthy();
    expect(input.value).toBe('tea');
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(screen.getByText('tea')).toBeTruthy();
    expect(container.querySelectorAll('.pv-tag-input__tag')).toHaveLength(3);
    expect(container.querySelectorAll('input[type="hidden"]')).toHaveLength(3);
  });

  it('rejects duplicates and enforces limits', () => {
    const { container } = render(
      withProvider(
        <TagInput label="Journal tags" defaultValue={['spring', 'rain']} maxTags={2} />,
      ),
    );
    const input = screen.getByRole('textbox', {
      name: 'Journal tags',
    }) as HTMLInputElement;

    expect(screen.getByText('Up to 2 tags')).toBeTruthy();
    fireEvent.change(input, { target: { value: 'snow' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(container.querySelectorAll('.pv-tag-input__tag')).toHaveLength(2);

    const removeRain = screen.getByRole('button', { name: 'Remove rain' });
    fireEvent.click(removeRain);
    expect(screen.queryByText('rain')).toBeNull();
    expect(document.activeElement).toBe(input);

    fireEvent.change(input, { target: { value: 'spring' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(container.querySelectorAll('.pv-tag-input__tag')).toHaveLength(1);

    fireEvent.change(input, { target: { value: 'lavender' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(screen.getByText('lavender')).toBeTruthy();
    expect(container.querySelectorAll('.pv-tag-input__tag')).toHaveLength(2);
  });

  it('trims tags to the per-tag length limit', () => {
    const { container } = render(
      withProvider(<TagInput label="Journal tags" maxLength={4} />),
    );
    const input = screen.getByRole('textbox', {
      name: 'Journal tags',
    }) as HTMLInputElement;

    fireEvent.change(input, { target: { value: 'lavender' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(screen.getByText('lave')).toBeTruthy();
    expect(container.querySelectorAll('.pv-tag-input__tag')).toHaveLength(1);
  });

  it('supports uncontrolled removal with Backspace and IME-safe Enter', () => {
    const { container } = render(
      withProvider(<TagInput label="Tags" defaultValue={['spring', 'rain']} />),
    );
    const input = screen.getByRole('textbox', { name: 'Tags' }) as HTMLInputElement;

    fireEvent.keyDown(input, { key: 'Backspace' });
    expect(screen.queryByText('rain')).toBeNull();
    expect(container.querySelectorAll('.pv-tag-input__tag')).toHaveLength(1);

    fireEvent.compositionStart(input);
    fireEvent.change(input, { target: { value: '茶' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(container.querySelectorAll('.pv-tag-input__tag')).toHaveLength(1);

    fireEvent.compositionEnd(input);
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(screen.getByText('茶')).toBeTruthy();
    expect(container.querySelectorAll('.pv-tag-input__tag')).toHaveLength(2);
  });

  it('marks errors and connects help text to the input', () => {
    render(
      withProvider(
        <TagInput
          label="Tags"
          defaultValue={['spring']}
          hint="Use commas"
          error="At least one tag is required."
        />,
      ),
    );
    const input = screen.getByRole('textbox', { name: 'Tags' });
    const help = screen.getByText('At least one tag is required.');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toBe(help.id);
    expect(help.getAttribute('role')).toBe('alert');
  });

  it('renders tags and focuses the input when the empty control is clicked', () => {
    render(withProvider(<TagInput label="Tags" defaultValue={['spring']} />));
    const input = screen.getByRole('textbox', { name: 'Tags' });
    fireEvent.mouseDown(document.querySelector('.pv-tag-input__control') as HTMLElement);
    expect(document.activeElement).toBe(input);
  });

  it('works in controlled mode', () => {
    function ControlledTags() {
      const [tags, setTags] = useState(['spring']);
      return <TagInput label="Tags" value={tags} onValueChange={setTags} />;
    }

    render(withProvider(<ControlledTags />));
    const input = screen.getByRole('textbox', { name: 'Tags' }) as HTMLInputElement;

    fireEvent.change(input, { target: { value: 'rain' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(screen.getByText('rain')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Remove spring' }));
    expect(screen.queryByText('spring')).toBeNull();
    expect(screen.getByText('rain')).toBeTruthy();
  });

  it('blocks editing while disabled', () => {
    const onValueChange = vi.fn();
    const { container } = render(
      withProvider(
        <TagInput
          label="Tags"
          defaultValue={['spring']}
          disabled
          onValueChange={onValueChange}
        />,
      ),
    );
    const input = screen.getByRole('textbox', { name: 'Tags' }) as HTMLInputElement;
    const remove = screen.getByRole('button', { name: 'Remove spring' });

    expect(input.disabled).toBe(true);
    expect(remove.hasAttribute('disabled')).toBe(true);
    fireEvent.click(remove);
    fireEvent.keyDown(input, { key: 'Backspace' });
    expect(container.querySelectorAll('.pv-tag-input__tag')).toHaveLength(1);
    expect(onValueChange).not.toHaveBeenCalled();
  });
});
