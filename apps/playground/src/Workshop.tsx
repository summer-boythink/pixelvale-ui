import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Divider,
  Drawer,
  Panel,
  PixelIcon,
  PixelSprite,
  Skeleton,
  Stat,
  Steps,
  ToggleGroup,
  useToast,
} from '@pixelvale/ui';

const EXPEDITION_STEPS = [
  {
    value: 'plan',
    label: 'Plan',
    description: 'Check the board',
  },
  {
    value: 'pack',
    label: 'Pack',
    description: 'Torch and snacks',
  },
  {
    value: 'mine',
    label: 'Mine',
    description: 'Floor 20',
  },
  {
    value: 'return',
    label: 'Return',
    description: 'Before dusk',
  },
] as const;

interface WorkshopProps {
  gold: number;
}

export function Workshop({ gold }: WorkshopProps) {
  const [stage, setStage] = useState<string>('pack');
  const [overlays, setOverlays] = useState<string[]>(['watered']);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const syncTimer = useRef<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      if (syncTimer.current !== null) window.clearTimeout(syncTimer.current);
    };
  }, []);

  const currentStage =
    EXPEDITION_STEPS.find((step) => step.value === stage)?.label ?? 'Plan';

  const simulateSync = () => {
    if (loading) return;
    setLoading(true);
    syncTimer.current = window.setTimeout(() => {
      syncTimer.current = null;
      setLoading(false);
      toast({
        variant: 'gold',
        title: 'Shipping bin synced',
        description: '4 items · 340g ready for pickup.',
      });
    }, 1400);
  };

  return (
    <section
      id="workshop"
      className="demo-section demo-workshop"
      aria-labelledby="workshop-title"
    >
      <div className="demo-section__head">
        <p className="demo-kicker">A quiet workbench</p>
        <h2 id="workshop-title">The workshop</h2>
        <p>
          Small pieces for planning: a step trail, pressed filters, a side sheet, compact
          numbers, and a loading state that does not pretend to be finished.
        </p>
      </div>

      <div className="demo-workshop__grid">
        <Panel
          headingLevel={3}
          className="shelf-panel"
          title="Quest workshop"
          subtitle="Plan the next trip into the mines."
          icon={<PixelIcon name="star" size={18} />}
        >
          <div className="demo-stack">
            <Steps
              steps={EXPEDITION_STEPS}
              current={stage}
              onStepClick={setStage}
              label="Mine expedition stages"
            />
            <p className="workshop-stage">
              Current stage: <strong>{currentStage}</strong>
            </p>

            <Divider label="crop overlays" />

            <ToggleGroup
              label="Crop overlays"
              multiple
              fullWidth
              value={overlays}
              onValueChange={setOverlays}
              items={[
                {
                  value: 'watered',
                  label: 'Watered',
                  icon: <PixelIcon name="leaf" size={14} />,
                },
                {
                  value: 'ready',
                  label: 'Ready',
                  icon: <PixelSprite name="strawberry" size={15} />,
                },
                {
                  value: 'fertilized',
                  label: 'Fertilized',
                  icon: <PixelIcon name="sparkle" size={14} />,
                },
              ]}
            />
            <p className="demo-inline-hint">
              Pressed filters stay active. Arrow keys move focus; Space presses.
            </p>

            <div className="demo-row demo-row--center">
              <Button
                variant="primary"
                leftIcon={<PixelIcon name="moon" size={15} />}
                onClick={() => setDrawerOpen(true)}
              >
                Open quest drawer
              </Button>
              <Badge variant="info">
                {overlays.length} {overlays.length === 1 ? 'overlay' : 'overlays'}
              </Badge>
            </div>
          </div>
        </Panel>

        <Panel
          headingLevel={3}
          className="shelf-panel"
          title="Farm snapshot"
          subtitle="A few numbers, quickly."
          icon={<PixelIcon name="sun" size={18} />}
        >
          <div className="demo-stack">
            <div className="stat-grid">
              <Stat
                label="Spring day"
                value="12"
                hint="Year 1 · sunny"
                icon={<PixelIcon name="sun" size={17} />}
                tone="warning"
              />
              <Stat
                label="Gold"
                value={`${new Intl.NumberFormat('en-US').format(gold)}g`}
                hint="+340g this week"
                icon={<PixelSprite name="coin" size={18} />}
                tone="gold"
              />
              <Stat
                label="Energy"
                value="72 / 100"
                hint="The mines are open"
                icon={<PixelIcon name="bolt" size={17} />}
                tone="success"
              />
              <Stat
                label="Rainfall"
                value="0 mm"
                hint="Clouds undecided"
                icon={<PixelIcon name="info" size={17} />}
                tone="info"
              />
            </div>

            <Divider label="loading state" />

            <div className="skeleton-demo" aria-live="polite" aria-busy={loading}>
              {loading ? (
                <div className="demo-stack demo-stack--sm">
                  <Skeleton lines={3} />
                  <Skeleton variant="block" height={52} />
                </div>
              ) : (
                <div className="skeleton-result">
                  <PixelSprite name="coin" size={22} />
                  <div>
                    <p className="skeleton-result__title">Shipping bin synced</p>
                    <p className="skeleton-result__hint">4 items · 340g ready.</p>
                  </div>
                </div>
              )}
              <Button
                size="sm"
                variant={loading ? 'ghost' : 'gold'}
                loading={loading}
                leftIcon={!loading ? <PixelIcon name="sparkle" size={14} /> : undefined}
                onClick={simulateSync}
              >
                {loading ? 'Syncing…' : 'Simulate sync'}
              </Button>
            </div>
          </div>
        </Panel>
      </div>

      <Drawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        side="right"
        width="md"
        title="Mine expedition"
        description="A short trip to floor 20."
        icon={<PixelIcon name="moon" size={20} />}
        footer={
          <>
            <Button variant="ghost" onClick={() => setDrawerOpen(false)}>
              Later
            </Button>
            <Button
              variant="primary"
              leftIcon={<PixelIcon name="bolt" size={15} />}
              onClick={() => {
                setDrawerOpen(false);
                toast({
                  variant: 'success',
                  title: 'Expedition started',
                  description: 'Torch packed. Snacks packed. Courage optional.',
                });
              }}
            >
              Begin expedition
            </Button>
          </>
        }
      >
        <div className="demo-stack">
          <Steps steps={EXPEDITION_STEPS} current="pack" label="Packing plan" />
          <Alert variant="warning" title="Bring a torch">
            Floor 20 is dark this time of year. The slimes are not afraid of the dark.
          </Alert>
          <div className="packing-list" role="list" aria-label="Packing list">
            <div className="packing-item" role="listitem">
              <PixelSprite name="wood" size={22} />
              <span>Torch wood</span>
              <Badge>6</Badge>
            </div>
            <div className="packing-item" role="listitem">
              <PixelSprite name="apple" size={22} />
              <span>Wild apples</span>
              <Badge variant="success">3</Badge>
            </div>
            <div className="packing-item" role="listitem">
              <PixelSprite name="sword" size={22} />
              <span>Rusty sword</span>
              <Badge variant="warning">1</Badge>
            </div>
          </div>
          <p className="drawer-note">
            The drawer shares the Dialog focus trap, Escape handling, scroll lock and
            themed portal host.
          </p>
        </div>
      </Drawer>
    </section>
  );
}
