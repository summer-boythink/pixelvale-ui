import {
  Badge,
  Carousel,
  DatePicker,
  FileDropzone,
  Panel,
  PixelIcon,
  PixelSprite,
  Spinner,
  type CarouselItem,
  type PixelSpriteName,
} from '@pixelvale/ui';

interface LabelSlide {
  label: string;
  kicker: string;
  title: string;
  note: string;
  batch: string;
  tone: 'success' | 'warning' | 'gold';
  sprite: PixelSpriteName;
  accent: 'spring' | 'autumn' | 'night';
}

const LABELS: readonly LabelSlide[] = [
  {
    label: 'Spring strawberry label',
    kicker: 'Willow Farm · Spring',
    title: 'Strawberry cordial',
    note: 'Pressed at noon, bottled before the rain. A little sweet, a little stubborn.',
    batch: 'Batch 012',
    tone: 'success',
    sprite: 'strawberry',
    accent: 'spring',
  },
  {
    label: 'Autumn pumpkin label',
    kicker: 'Willow Farm · Autumn',
    title: 'Pumpkin preserve',
    note: 'Slow-cooked with spice and patience. The jar is heavier than it looks.',
    batch: 'Batch 027',
    tone: 'warning',
    sprite: 'pumpkin',
    accent: 'autumn',
  },
  {
    label: 'Night shard label',
    kicker: 'Willow Farm · Night',
    title: 'Prismatic tonic',
    note: 'Bottled under a clear sky. Do not shake, do not stare too long.',
    batch: 'Batch 001',
    tone: 'gold',
    sprite: 'gem',
    accent: 'night',
  },
];

const SLIDES: readonly CarouselItem[] = LABELS.map((slide) => ({
  id: slide.accent,
  label: slide.label,
  content: (
    <div className="label-slide" data-accent={slide.accent}>
      <span className="label-slide__art" aria-hidden="true">
        <PixelSprite name={slide.sprite} size={54} />
      </span>
      <div className="label-slide__copy">
        <p className="label-slide__kicker">{slide.kicker}</p>
        <p className="label-slide__title">{slide.title}</p>
        <p className="label-slide__note">{slide.note}</p>
        <Badge variant={slide.tone}>{slide.batch}</Badge>
      </div>
    </div>
  ),
}));

export function Stillroom() {
  return (
    <section
      id="stillroom"
      className="demo-section demo-stillroom"
      aria-labelledby="stillroom-title"
    >
      <div className="demo-section__head">
        <p className="demo-kicker">Bottles & labels</p>
        <h2 id="stillroom-title">The stillroom</h2>
        <p>
          A date field, a dropzone, a small spinner, and a label press. The practical
          pieces behind a very impractical batch of cordial.
        </p>
      </div>

      <div className="demo-stillroom__grid">
        <Panel
          headingLevel={3}
          className="shelf-panel"
          title="Bottling day"
          subtitle="Pick a date and seal the batch."
          icon={<PixelIcon name="calendar" size={18} />}
        >
          <div className="demo-stack">
            <DatePicker
              label="Bottling date"
              name="bottling-date"
              defaultValue="2026-03-18"
              today="2026-03-15"
              min="2026-03-01"
              max="2026-03-31"
              hint="Bottles are sealed the same afternoon."
            />
            <div className="stillroom-status">
              <Spinner label="Sealing bottles" showLabel size="sm" tone="green" />
              <Badge variant="success">12 bottles</Badge>
            </div>
          </div>
        </Panel>

        <Panel
          headingLevel={3}
          className="shelf-panel"
          title="Recipe cards"
          subtitle="Drop a card or browse the drawer."
          icon={<PixelIcon name="upload" size={18} />}
        >
          <FileDropzone
            label="Recipe cards"
            name="recipe-card"
            accept="image/png,image/jpeg,application/pdf"
            multiple
            maxFiles={3}
            maxSize={2 * 1024 * 1024}
            hint="PNG, JPG, or PDF · up to 2 MB each · three cards at a time."
          />
        </Panel>

        <Panel
          headingLevel={3}
          className="shelf-panel demo-stillroom__carousel"
          title="Label press"
          subtitle="Three labels ready for the season."
          icon={<PixelIcon name="sparkle" size={18} />}
        >
          <Carousel label="Label press" items={SLIDES} loop />
        </Panel>
      </div>
    </section>
  );
}
