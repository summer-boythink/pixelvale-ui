import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PixelSprite, type PixelSpriteName } from '../components/PixelSprite';

const NAMES: PixelSpriteName[] = [
  'parsnip',
  'strawberry',
  'potato',
  'pumpkin',
  'wood',
  'stone',
  'gem',
  'fish',
  'watering-can',
  'sword',
  'coin',
  'apple',
];

describe('PixelSprite', () => {
  it('renders every sprite inside the 12×12 grid', () => {
    render(
      <div>
        {NAMES.map((name) => (
          <PixelSprite key={name} name={name} label={name} size={48} />
        ))}
      </div>,
    );

    for (const name of NAMES) {
      const image = screen.getByRole('img', { name });
      const rawRects = image.querySelectorAll('rect');

      expect(image.getAttribute('viewBox')).toBe('0 0 12 12');
      expect(rawRects.length).toBeGreaterThan(4);

      rawRects.forEach((rect) => {
        const x = Number(rect.getAttribute('x'));
        const y = Number(rect.getAttribute('y'));
        const width = Number(rect.getAttribute('width'));

        expect(Number.isFinite(x)).toBe(true);
        expect(Number.isFinite(y)).toBe(true);
        expect(Number.isFinite(width)).toBe(true);
        expect(x).toBeGreaterThanOrEqual(0);
        expect(y).toBeGreaterThanOrEqual(0);
        expect(x + width).toBeLessThanOrEqual(12);
        expect(y).toBeLessThan(12);
      });
    }
  });

  it('is decorative when no label is provided', () => {
    render(<PixelSprite name="coin" />);
    const svg = document.querySelector('svg.pv-sprite');
    expect(svg?.getAttribute('aria-hidden')).toBe('true');
    expect(svg?.getAttribute('role')).toBeNull();
  });
});
