import { describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { Button, IconButton } from '../components/Button';
import { Checkbox, Switch } from '../components/Checkbox';
import { PixelValeProvider } from '../components/PixelValeProvider';

function withProvider(node: ReactNode) {
  return <PixelValeProvider defaultSoundEnabled={false}>{node}</PixelValeProvider>;
}

describe('Button', () => {
  it('fires click handlers with a native button', () => {
    const onClick = vi.fn();
    render(withProvider(<Button onClick={onClick}>Plant</Button>));
    fireEvent.click(screen.getByRole('button', { name: 'Plant' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('exposes loading state and blocks disabled clicks', () => {
    const onClick = vi.fn();
    const { rerender } = render(
      withProvider(
        <Button loading onClick={onClick}>
          Crafting
        </Button>,
      ),
    );

    const loadingButton = screen.getByRole('button', { name: /Crafting/ });
    expect(loadingButton.getAttribute('aria-busy')).toBe('true');
    expect((loadingButton as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(loadingButton);
    expect(onClick).not.toHaveBeenCalled();

    rerender(
      withProvider(
        <Button disabled onClick={onClick}>
          Locked
        </Button>,
      ),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Locked' }));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('labels icon buttons with aria-label', () => {
    render(
      withProvider(
        <IconButton label="Mute sounds">
          <span aria-hidden="true">×</span>
        </IconButton>,
      ),
    );
    expect(screen.getByRole('button', { name: 'Mute sounds' })).toBeTruthy();
  });
});

describe('form controls', () => {
  it('toggles a checkbox and reports the new value', () => {
    const onCheckedChange = vi.fn();
    render(
      withProvider(
        <Checkbox
          label="Crop report"
          description="Every Monday"
          onCheckedChange={onCheckedChange}
        />,
      ),
    );

    const checkbox = screen.getByRole('checkbox', { name: /Crop report/ });
    fireEvent.click(checkbox);
    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect((checkbox as HTMLInputElement).checked).toBe(true);
  });

  it('uses switch semantics with a native input', () => {
    const onCheckedChange = vi.fn();
    render(
      withProvider(<Switch label="Evening chimes" onCheckedChange={onCheckedChange} />),
    );

    const toggle = screen.getByRole('switch', { name: 'Evening chimes' });
    fireEvent.click(toggle);
    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect((toggle as HTMLInputElement).checked).toBe(true);
  });
});

describe('PixelValeProvider', () => {
  it('applies the theme and creates a portal host', () => {
    const { container } = render(
      <PixelValeProvider theme="night" className="test-root">
        <span>child</span>
      </PixelValeProvider>,
    );

    const root = container.querySelector('.pv-root');
    expect(root?.getAttribute('data-pv-theme')).toBe('night');
    expect(root?.classList.contains('test-root')).toBe(true);
    expect(container.querySelector('.pv-portal')).toBeTruthy();
  });
});
