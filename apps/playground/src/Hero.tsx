import { Badge, Button, PixelIcon, PixelSprite, useToast } from '@pixelvale/ui';

function scrollToShelf() {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.getElementById('shelf')?.scrollIntoView({
    behavior: reduced ? 'auto' : 'smooth',
    block: 'start',
  });
}

export function Hero() {
  const { toast } = useToast();

  return (
    <section className="demo-hero" aria-labelledby="hero-title">
      <div className="demo-hero__copy">
        <p className="demo-eyebrow">
          <span className="demo-eyebrow__dot" aria-hidden="true" />
          Original pixel art · React 19 · TypeScript
        </p>
        <h1 id="hero-title" className="demo-hero__title">
          Cozy pixels,
          <span>serious components.</span>
        </h1>
        <p className="demo-hero__lede">
          一套手写的星露谷风格 React + TypeScript 组件库。木框、羊皮纸、合成音效，
          还有一个真的会装满的背包。
        </p>
        <div className="demo-hero__actions">
          <Button
            variant="primary"
            size="lg"
            rightIcon={<PixelIcon name="arrow-right" size={18} />}
            onClick={scrollToShelf}
          >
            Explore the kit
          </Button>
          <Button
            variant="gold"
            size="lg"
            leftIcon={<PixelSprite name="coin" size={20} />}
            onClick={() =>
              toast({
                variant: 'gold',
                title: 'The village bell rings',
                description: 'Somewhere, a very good dog barks back.',
              })
            }
          >
            Ring the bell
          </Button>
        </div>
        <ul className="demo-hero__meta" aria-label="Library highlights">
          <li>
            <PixelIcon name="check" size={14} /> 30+ components
          </li>
          <li>
            <PixelIcon name="check" size={14} /> Keyboard friendly
          </li>
          <li>
            <PixelIcon name="check" size={14} /> Synth sound, zero files
          </li>
          <li>
            <PixelIcon name="check" size={14} /> No game assets
          </li>
        </ul>
      </div>

      <div className="demo-hero__art" aria-hidden="true">
        <div className="hero-plot">
          <div className="hero-plot__window">
            <div className="hero-plot__sky">
              <span className="hero-plot__sun" />
              <span className="hero-plot__cloud hero-plot__cloud--one" />
              <span className="hero-plot__cloud hero-plot__cloud--two" />
            </div>
            <div className="hero-plot__soil">
              <span className="hero-plot__furrow hero-plot__furrow--one" />
              <span className="hero-plot__furrow hero-plot__furrow--two" />
              <PixelSprite
                name="pumpkin"
                size={78}
                className="hero-plot__crop hero-plot__crop--pumpkin"
              />
              <PixelSprite
                name="strawberry"
                size={48}
                className="hero-plot__crop hero-plot__crop--berry"
              />
              <PixelSprite
                name="parsnip"
                size={44}
                className="hero-plot__crop hero-plot__crop--parsnip"
              />
              <PixelSprite
                name="watering-can"
                size={52}
                className="hero-plot__crop hero-plot__crop--can"
              />
            </div>
          </div>
          <div className="hero-plot__sign">
            <span className="hero-plot__sign-title">Pixelvale</span>
            <span className="hero-plot__sign-sub">good soil · good code</span>
          </div>
          <span className="hero-plot__nail hero-plot__nail--a" />
          <span className="hero-plot__nail hero-plot__nail--b" />
          <span className="hero-plot__nail hero-plot__nail--c" />
          <span className="hero-plot__nail hero-plot__nail--d" />
        </div>
        <Badge className="demo-hero__sticker" variant="gold">
          <PixelIcon name="sparkle" size={12} /> handcrafted
        </Badge>
      </div>
    </section>
  );
}
