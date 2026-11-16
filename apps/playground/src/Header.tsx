import { IconButton, PixelIcon, PixelSprite, useSound } from '@pixelvale/ui';
import { THEME_META, type DemoTheme } from './data';

interface HeaderProps {
  theme: DemoTheme;
  onThemeChange: (theme: DemoTheme) => void;
}

export function Header({ theme, onThemeChange }: HeaderProps) {
  const meta = THEME_META[theme];
  const { enabled, setEnabled, play } = useSound();

  const cycleTheme = () => {
    play('click');
    onThemeChange(meta.next);
  };

  const toggleSound = () => {
    if (enabled) {
      play('toggle');
      setEnabled(false);
    } else {
      setEnabled(true);
    }
  };

  return (
    <header className="demo-header" id="top">
      <a className="brand" href="#top">
        <span className="brand__mark" aria-hidden="true">
          <PixelSprite name="parsnip" size={30} />
        </span>
        <span className="brand__text">
          <span className="brand__name">Pixelvale</span>
          <span className="brand__tag">pixel UI kit · v0.1</span>
        </span>
      </a>

      <nav className="demo-nav" aria-label="Primary">
        <a href="#homestead">Homestead</a>
        <a href="#shelf">Shelf</a>
        <a href="#workshop">Workshop</a>
        <a href="#craft-notes">Craft notes</a>
      </nav>

      <div className="demo-header__actions">
        <span className="demo-theme-chip">
          <PixelIcon name={meta.icon} size={14} />
          <span>{meta.label}</span>
        </span>
        <IconButton
          label={`Switch to ${THEME_META[meta.next].label.toLowerCase()} theme`}
          variant="wood"
          onClick={cycleTheme}
        >
          <PixelIcon name={meta.icon} size={18} />
        </IconButton>
        <IconButton
          label={enabled ? 'Mute interface sounds' : 'Enable interface sounds'}
          variant="wood"
          onClick={toggleSound}
          aria-pressed={enabled}
        >
          <PixelIcon name={enabled ? 'volume-on' : 'volume-off'} size={18} />
        </IconButton>
      </div>
    </header>
  );
}
