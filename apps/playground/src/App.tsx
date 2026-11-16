import { useState } from 'react';
import {
  PixelIcon,
  PixelSprite,
  PixelValeProvider,
  ToastProvider,
  type PixelValeLocale,
} from '@pixelvale/ui';
import { FarmHud } from './FarmHud';
import { Gallery } from './Gallery';
import { Header } from './Header';
import { Hero } from './Hero';
import { Almanac } from './Almanac';
import { Stillroom } from './Stillroom';
import { Teahouse } from './Teahouse';
import { TownLedger } from './TownLedger';
import { Workshop } from './Workshop';
import type { DemoTheme } from './data';

function Scenery() {
  return (
    <div className="demo-scenery" aria-hidden="true">
      <div className="demo-stars" />
      <div className="demo-celestial" />
      <div className="demo-cloud demo-cloud--one" />
      <div className="demo-cloud demo-cloud--two" />
      <div className="demo-cloud demo-cloud--three" />
      <div className="demo-hill demo-hill--back" />
      <div className="demo-hill demo-hill--front" />
      <div className="demo-grass" />
      <span className="demo-mote demo-mote--one" />
      <span className="demo-mote demo-mote--two" />
      <span className="demo-mote demo-mote--three" />
      <span className="demo-mote demo-mote--four" />
      <span className="demo-mote demo-mote--five" />
    </div>
  );
}

function CraftNotes() {
  return (
    <section
      id="craft-notes"
      className="demo-section demo-notes"
      aria-labelledby="notes-title"
    >
      <div className="demo-section__head">
        <p className="demo-kicker">Under the floorboards</p>
        <h2 id="notes-title">Craft notes</h2>
        <p>
          Small decisions that make the kit feel like a place instead of a style sheet.
        </p>
      </div>

      <div className="demo-notes__grid">
        <article className="note-card">
          <span className="note-card__icon" aria-hidden="true">
            <PixelIcon name="leaf" size={22} />
          </span>
          <h3>Original art, encoded small</h3>
          <p>
            Every crop and tool is a 12×12 character grid that compiles to an SVG. No
            sprite sheets, no borrowed game assets, no network requests.
          </p>
          <span className="note-card__tag">12 hand-built sprites</span>
        </article>

        <article className="note-card">
          <span className="note-card__icon" aria-hidden="true">
            <PixelIcon name="bolt" size={22} />
          </span>
          <h3>Sound from an oscillator</h3>
          <p>
            Click ticks, craft chimes, and coin clinks are synthesized with WebAudio. The
            context is lazy, the gain is tiny, and mute is one click away.
          </p>
          <span className="note-card__tag">No audio files</span>
        </article>

        <article className="note-card">
          <span className="note-card__icon" aria-hidden="true">
            <PixelIcon name="star" size={22} />
          </span>
          <h3>Keyboard paths, not leftovers</h3>
          <p>
            Tabs, selects, inventories, and dialogs all have arrow-key navigation, focus
            traps, and clear gold focus rings. Tooltips appear on focus too.
          </p>
          <span className="note-card__tag">A11y in the frame</span>
        </article>

        <article className="note-card">
          <span className="note-card__icon" aria-hidden="true">
            <PixelSprite name="gem" size={24} />
          </span>
          <h3>Portals share the palette</h3>
          <p>
            The provider owns a themed portal host. Overlays inherit the current theme,
            flip at the viewport edge, and never leak outside the component.
          </p>
          <span className="note-card__tag">Theme-aware overlays</span>
        </article>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="demo-footer">
      <div className="demo-footer__brand">
        <span className="demo-footer__mark" aria-hidden="true">
          <PixelSprite name="coin" size={26} />
        </span>
        <div>
          <p className="demo-footer__name">Pixelvale UI</p>
          <p className="demo-footer__version">v0.1.0 · React 19 · TypeScript</p>
        </div>
      </div>
      <p className="demo-footer__copy">
        Original pixel art and code. No Stardew Valley assets were used or redistributed.
      </p>
      <nav className="demo-footer__links" aria-label="Footer">
        <a href="#homestead">The demo</a>
        <a href="#shelf">Components</a>
        <a href="#workshop">Workshop</a>
        <a href="#top">Back to top ↑</a>
        <a href="/FUSION-PIXEL-OFL.txt">Fusion Pixel · OFL-1.1</a>
      </nav>
    </footer>
  );
}

function Shell({
  theme,
  onThemeChange,
  locale,
  onLocaleChange,
}: {
  theme: DemoTheme;
  onThemeChange: (theme: DemoTheme) => void;
  locale: PixelValeLocale;
  onLocaleChange: (locale: PixelValeLocale) => void;
}) {
  const [gold, setGold] = useState(1280);

  return (
    <>
      <a className="demo-skip" href="#main">
        {locale === 'zh-CN' ? '跳到主内容' : 'Skip to the farm'}
      </a>
      <Scenery />
      <div className="demo-shell">
        <Header
          theme={theme}
          onThemeChange={onThemeChange}
          locale={locale}
          onLocaleChange={onLocaleChange}
        />
        <main id="main" tabIndex={-1}>
          <Hero />
          <FarmHud gold={gold} setGold={setGold} />
          <Gallery gold={gold} setGold={setGold} />
          <Workshop gold={gold} />
          <TownLedger />
          <Almanac />
          <Stillroom />
          <Teahouse />
          <CraftNotes />
        </main>
        <Footer />
      </div>
    </>
  );
}

export default function App() {
  const [theme, setTheme] = useState<DemoTheme>('day');
  const [locale, setLocale] = useState<PixelValeLocale>('en');

  return (
    <PixelValeProvider
      theme={theme}
      locale={locale}
      defaultSoundEnabled
      defaultVolume={0.55}
      className="demo-root"
    >
      <ToastProvider>
        <Shell
          theme={theme}
          onThemeChange={setTheme}
          locale={locale}
          onLocaleChange={setLocale}
        />
      </ToastProvider>
    </PixelValeProvider>
  );
}
