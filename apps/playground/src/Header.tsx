import {
  IconButton,
  PixelIcon,
  PixelSprite,
  useSound,
  type PixelValeLocale,
} from '@pixelvale/ui';
import { THEME_META, type DemoTheme } from './data';

interface HeaderProps {
  theme: DemoTheme;
  onThemeChange: (theme: DemoTheme) => void;
  locale: PixelValeLocale;
  onLocaleChange: (locale: PixelValeLocale) => void;
}

const THEME_LABELS: Record<PixelValeLocale, Record<DemoTheme, string>> = {
  en: { day: 'Day', autumn: 'Autumn', night: 'Night' },
  'zh-CN': { day: '白天', autumn: '秋日', night: '夜晚' },
};

const NAV_LABELS: Record<
  PixelValeLocale,
  {
    homestead: string;
    shelf: string;
    workshop: string;
    ledger: string;
    almanac: string;
    teahouse: string;
    notes: string;
  }
> = {
  en: {
    homestead: 'Homestead',
    shelf: 'Shelf',
    workshop: 'Workshop',
    ledger: 'Ledger',
    almanac: 'Almanac',
    teahouse: 'Teahouse',
    notes: 'Notes',
  },
  'zh-CN': {
    homestead: '农舍',
    shelf: '组件架',
    workshop: '工坊',
    ledger: '账本',
    almanac: '年历',
    teahouse: '茶馆',
    notes: '手记',
  },
};

export function Header({ theme, onThemeChange, locale, onLocaleChange }: HeaderProps) {
  const meta = THEME_META[theme];
  const { enabled, setEnabled, play } = useSound();
  const isZh = locale === 'zh-CN';
  const themeLabels = THEME_LABELS[locale];
  const nav = NAV_LABELS[locale];

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

      <nav className="demo-nav" aria-label={isZh ? '主导航' : 'Primary'}>
        <a href="#homestead">{nav.homestead}</a>
        <a href="#shelf">{nav.shelf}</a>
        <a href="#workshop">{nav.workshop}</a>
        <a href="#ledger">{nav.ledger}</a>
        <a href="#almanac">{nav.almanac}</a>
        <a href="#teahouse">{nav.teahouse}</a>
        <a href="#craft-notes">{nav.notes}</a>
      </nav>

      <div className="demo-header__actions">
        <button
          type="button"
          className="lang-toggle"
          aria-pressed={isZh}
          title={isZh ? '切换至英文' : 'Switch to Chinese'}
          onClick={() => {
            play('click');
            onLocaleChange(isZh ? 'en' : 'zh-CN');
          }}
        >
          <span lang={isZh ? 'en' : 'zh-CN'} aria-hidden="true">
            {isZh ? 'EN' : '中文'}
          </span>
          <span className="pv-sr-only">{isZh ? '切换至英文' : 'Switch to Chinese'}</span>
        </button>
        <span className="demo-theme-chip">
          <PixelIcon name={meta.icon} size={14} />
          <span>{themeLabels[theme]}</span>
        </span>
        <IconButton
          label={
            isZh
              ? `切换到${themeLabels[meta.next]}主题`
              : `Switch to ${THEME_META[meta.next].label.toLowerCase()} theme`
          }
          variant="wood"
          onClick={cycleTheme}
        >
          <PixelIcon name={meta.icon} size={18} />
        </IconButton>
        <IconButton
          label={
            isZh
              ? enabled
                ? '关闭界面音效'
                : '开启界面音效'
              : enabled
                ? 'Mute interface sounds'
                : 'Enable interface sounds'
          }
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
