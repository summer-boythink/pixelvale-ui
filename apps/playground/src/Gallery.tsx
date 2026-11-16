import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import {
  Accordion,
  Alert,
  Badge,
  Button,
  Checkbox,
  CoinDisplay,
  Dialog,
  Divider,
  DropdownMenu,
  EmptyState,
  IconButton,
  NumberField,
  Panel,
  PixelIcon,
  PixelSprite,
  ProgressBar,
  RadioGroup,
  Switch,
  TextField,
  Tooltip,
  useToast,
  type DropdownMenuItem,
} from '@pixelvale/ui';

interface GalleryProps {
  gold: number;
  setGold: Dispatch<SetStateAction<number>>;
}

export function Gallery({ gold, setGold }: GalleryProps) {
  const [farmerName, setFarmerName] = useState('Marnie');
  const [cropReport, setCropReport] = useState(true);
  const [chimes, setChimes] = useState(false);
  const [crafting, setCrafting] = useState(false);
  const [recipeOpen, setRecipeOpen] = useState(false);
  const [shipping, setShipping] = useState('bin');
  const [seedCount, setSeedCount] = useState(12);
  const [noticeVisible, setNoticeVisible] = useState(true);

  const craftTimer = useRef<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      if (craftTimer.current !== null) window.clearTimeout(craftTimer.current);
    };
  }, []);

  const trimmedName = farmerName.trim();
  const nameError =
    trimmedName.length === 0
      ? 'A farmer needs a name.'
      : trimmedName.length > 16
        ? 'Keep it to 16 characters or fewer.'
        : undefined;

  const startCraft = () => {
    if (crafting) return;
    setCrafting(true);
    craftTimer.current = window.setTimeout(() => {
      setCrafting(false);
      craftTimer.current = null;
      toast({
        variant: 'success',
        title: 'Sprinkler crafted!',
        description: 'It is already humming a very small tune.',
      });
    }, 1500);
  };

  const craftRecipe = () => {
    if (gold < 250) {
      toast({
        variant: 'error',
        title: 'Not enough gold',
        description: 'The blueprint costs 250g. The shopkeeper is unmoved.',
      });
      return;
    }

    setGold((current) => current - 250);
    setRecipeOpen(false);
    toast({
      variant: 'success',
      title: 'Quality sprinkler crafted',
      description: '−250g. Your backpack stays untouched in this demo.',
    });
  };

  const handleFarmAction = (id: string) => {
    switch (id) {
      case 'water':
        toast({
          variant: 'success',
          title: 'Crops watered',
          description: 'Every furrow is glistening. Nice work.',
        });
        break;
      case 'harvest':
        setGold((current) => current + 80);
        toast({
          variant: 'gold',
          title: 'Strawberries harvested',
          description: '+80g and two berries for the pack.',
        });
        break;
      case 'sleep':
        toast({
          variant: 'info',
          title: 'The day is not over yet',
          description: 'Use the almanac to actually turn in for the night.',
        });
        break;
      case 'abandon':
        toast({
          variant: 'warning',
          title: 'Quest abandoned',
          description: 'The notice board will forgive you. Probably.',
        });
        break;
      default:
        break;
    }
  };

  const farmActions: DropdownMenuItem[] = [
    { type: 'label', id: 'today', label: 'Today' },
    {
      type: 'item',
      id: 'water',
      label: 'Water all crops',
      icon: <PixelIcon name="leaf" size={14} />,
      shortcut: 'W',
    },
    {
      type: 'item',
      id: 'harvest',
      label: 'Harvest strawberries',
      icon: <PixelSprite name="strawberry" size={16} />,
      shortcut: 'H',
    },
    { type: 'separator', id: 'sep' },
    {
      type: 'item',
      id: 'sleep',
      label: 'End the day',
      icon: <PixelIcon name="moon" size={14} />,
      shortcut: 'N',
    },
    {
      type: 'item',
      id: 'abandon',
      label: 'Abandon quest',
      icon: <PixelIcon name="alert" size={14} />,
      danger: true,
    },
  ];

  return (
    <section id="shelf" className="demo-section demo-shelf" aria-labelledby="shelf-title">
      <div className="demo-section__head">
        <p className="demo-kicker">Thirty little pieces</p>
        <h2 id="shelf-title">The component shelf</h2>
        <p>
          Every control below is the real component. Poke the buttons, open the dialog,
          and listen for the tiny wooden clicks.
        </p>
      </div>

      <div className="demo-shelf__grid">
        <Panel
          headingLevel={3}
          className="shelf-panel"
          title="Buttons & actions"
          subtitle="Chunky on purpose."
          icon={<PixelIcon name="bolt" size={18} />}
        >
          <div className="demo-stack">
            <div className="demo-row">
              <Button
                variant="primary"
                leftIcon={<PixelSprite name="parsnip" size={17} />}
              >
                Plant
              </Button>
              <Button leftIcon={<PixelIcon name="leaf" size={15} />}>Examine</Button>
              <Button variant="gold" leftIcon={<PixelSprite name="coin" size={17} />}>
                Ship
              </Button>
              <Button variant="danger">Clear field</Button>
              <Button
                variant="ghost"
                rightIcon={<PixelIcon name="arrow-right" size={14} />}
              >
                Read note
              </Button>
            </div>

            <Divider label="sizes" />

            <div className="demo-row demo-row--center">
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
              <Button disabled>Locked</Button>
            </div>

            <div className="demo-row demo-row--center">
              <Button
                variant="primary"
                loading={crafting}
                onClick={startCraft}
                leftIcon={!crafting ? <PixelIcon name="sparkle" size={15} /> : undefined}
              >
                {crafting ? 'Crafting…' : 'Craft sprinkler'}
              </Button>
              <Button variant="ghost" size="sm">
                Quiet action
              </Button>
            </div>

            <Divider label="icon buttons" />

            <div className="demo-row demo-row--center">
              <IconButton label="Water the crops" variant="default">
                <PixelIcon name="leaf" size={18} />
              </IconButton>
              <IconButton label="Check the forecast" variant="wood">
                <PixelIcon name="sun" size={18} />
              </IconButton>
              <IconButton label="Read a note" variant="ghost">
                <PixelIcon name="info" size={18} />
              </IconButton>
              <IconButton label="Clear a rock" variant="danger">
                <PixelIcon name="alert" size={18} />
              </IconButton>
            </div>
          </div>
        </Panel>

        <Panel
          headingLevel={3}
          className="shelf-panel"
          title="Fields & toggles"
          subtitle="Forms with a little soil on them."
          icon={<PixelIcon name="leaf" size={18} />}
        >
          <div className="demo-stack">
            <TextField
              label="Farmer name"
              value={farmerName}
              onChange={(event) => setFarmerName(event.currentTarget.value)}
              leadingIcon={<PixelIcon name="leaf" size={16} />}
              hint="Up to 16 characters. Shown on the farm sign."
              error={nameError}
              autoComplete="off"
              spellCheck={false}
            />

            <Divider />

            <Checkbox
              label="Weekly crop report"
              description="A tidy summary every Monday morning."
              checked={cropReport}
              onCheckedChange={setCropReport}
            />

            <Switch
              label="Evening chimes"
              description="A soft bell when the sun dips below the hills."
              checked={chimes}
              onCheckedChange={(next) => {
                setChimes(next);
                if (next) {
                  toast({
                    variant: 'info',
                    title: 'Evening chimes on',
                    description: 'The farm now has a soundtrack for dusk.',
                  });
                }
              }}
            />

            <div className="demo-note">
              <PixelIcon name="info" size={13} />
              Toggles are native inputs — Space works, labels click, and focus rings are
              drawn in gold.
            </div>
          </div>
        </Panel>

        <Panel
          headingLevel={3}
          className="shelf-panel"
          title="Meters & purse"
          subtitle="Numbers with a satisfying weight."
          icon={<PixelIcon name="heart" size={18} />}
        >
          <div className="demo-stack">
            <div className="demo-stack demo-stack--sm">
              <ProgressBar label="Health" value={86} variant="health" showValue />
              <ProgressBar label="Energy" value={64} variant="energy" showValue />
              <ProgressBar label="Mining XP" value={42} variant="xp" showValue />
              <ProgressBar label="Shipping" value={73} variant="gold" showValue />
            </div>

            <Divider label="purse" />

            <div className="demo-purse">
              <CoinDisplay value={gold} label="Gold" size="lg" />
              <Button
                size="sm"
                variant="gold"
                leftIcon={<PixelSprite name="coin" size={15} />}
                onClick={() => {
                  setGold((current) => current + 250);
                  toast({
                    variant: 'gold',
                    title: 'Turnips sold',
                    description: '+250g. The shipping bin looks pleased.',
                  });
                }}
              >
                +250g
              </Button>
            </div>

            <Divider label="badges" />

            <div className="demo-row">
              <Badge>Common</Badge>
              <Badge variant="success">Grown</Badge>
              <Badge variant="warning">Weather</Badge>
              <Badge variant="danger">Storm</Badge>
              <Badge variant="info">Quest</Badge>
              <Badge variant="gold">Legendary</Badge>
            </div>
          </div>
        </Panel>

        <Panel
          headingLevel={3}
          className="shelf-panel"
          title="Overlays & whispers"
          subtitle="Dialogs, toasts, and the tiniest hint."
          icon={<PixelIcon name="sparkle" size={18} />}
        >
          <div className="demo-stack">
            <div className="demo-row">
              <Button
                size="sm"
                variant="primary"
                onClick={() =>
                  toast({
                    variant: 'success',
                    title: 'Day saved',
                    description: 'The chickens have been accounted for.',
                  })
                }
              >
                Success toast
              </Button>
              <Button
                size="sm"
                variant="gold"
                onClick={() =>
                  toast({
                    variant: 'gold',
                    title: 'Shipment sold',
                    description: '+340g. A very good morning.',
                  })
                }
              >
                Gold toast
              </Button>
              <Button
                size="sm"
                onClick={() =>
                  toast({
                    variant: 'warning',
                    title: 'Low energy',
                    description: 'Perhaps a snack before the mines?',
                  })
                }
              >
                Warning toast
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() =>
                  toast({
                    variant: 'error',
                    title: 'The soil is too dry',
                    description: 'Give it a drink and try again tomorrow.',
                  })
                }
              >
                Error toast
              </Button>
            </div>

            <Divider />

            <div className="demo-row demo-row--center">
              <Button
                variant="default"
                leftIcon={<PixelIcon name="info" size={15} />}
                onClick={() => setRecipeOpen(true)}
              >
                Open recipe card
              </Button>
              <Tooltip
                content={
                  <span>
                    Portaled, viewport-aware, and available on focus as well as hover.
                    This is a tooltip.
                  </span>
                }
              >
                <Button size="sm" variant="ghost">
                  <PixelIcon name="star" size={14} /> Hover the star
                </Button>
              </Tooltip>
            </div>

            <div className="demo-note">
              <PixelIcon name="info" size={13} />
              Dialogs trap focus, close on Escape, and return focus when dismissed. Toasts
              stack politely and pause nothing else.
            </div>
          </div>
        </Panel>

        <Panel
          headingLevel={3}
          className="shelf-panel"
          title="Menus & disclosures"
          subtitle="Open, choose, escape."
          icon={<PixelIcon name="chevron-down" size={18} />}
        >
          <div className="demo-stack">
            <div className="demo-row demo-row--center">
              <DropdownMenu
                label="Farm actions"
                triggerIcon={<PixelIcon name="leaf" size={15} />}
                items={farmActions}
                onSelect={handleFarmAction}
              />
              <span className="demo-inline-hint">
                ArrowDown to open · arrows to move · Escape to return focus
              </span>
            </div>

            <Divider label="disclosures" />

            <Accordion
              headingLevel={4}
              defaultValue={['layers']}
              items={[
                {
                  value: 'layers',
                  title: 'Menus live in the top layer',
                  icon: <PixelIcon name="sparkle" size={15} />,
                  badge: <Badge variant="info">popover</Badge>,
                  content: (
                    <p>
                      Dropdowns use the Popover API when available, so panel overflow and
                      transformed ancestors cannot clip them. Older browsers keep a
                      fixed-position fallback.
                    </p>
                  ),
                },
                {
                  value: 'keys',
                  title: 'Every path has a keyboard',
                  icon: <PixelIcon name="star" size={15} />,
                  content: (
                    <p>
                      Arrow keys move through menu items, Home and End jump to the edges,
                      and Escape closes the menu and returns focus to the trigger. The
                      accordion headers work the same way.
                    </p>
                  ),
                },
                {
                  value: 'numbers',
                  title: 'Numbers clamp on blur',
                  icon: <PixelIcon name="bolt" size={15} />,
                  content: (
                    <p>
                      The number field accepts free text while you type, then clamps and
                      formats on blur. Arrow keys step, Shift+Arrow jumps five, and
                      PageUp/PageDown jump ten.
                    </p>
                  ),
                },
              ]}
            />
          </div>
        </Panel>

        <Panel
          headingLevel={3}
          className="shelf-panel"
          title="Choices & quantities"
          subtitle="Small decisions, clearly framed."
          icon={<PixelIcon name="star" size={18} />}
        >
          <div className="demo-stack">
            <RadioGroup
              label="Shipping method"
              value={shipping}
              onValueChange={setShipping}
              hint="Native radios — arrow keys move the selection too."
              options={[
                {
                  value: 'bin',
                  label: 'Shipping bin',
                  description: 'Collected overnight at a fair price.',
                },
                {
                  value: 'crate',
                  label: 'Farm crate',
                  description: 'Sold instantly for a little less.',
                },
                {
                  value: 'merchant',
                  label: 'Traveling merchant',
                  description: 'A long walk, a very fine price.',
                },
              ]}
            />

            <Divider />

            <NumberField
              label="Parsnip seeds"
              value={seedCount}
              min={1}
              max={99}
              step={1}
              unit="seeds"
              onValueChange={setSeedCount}
              hint="Free text while typing; clamped on blur. Shift+Arrow steps five at a time."
            />

            <div className="seed-summary">
              <CoinDisplay
                value={seedCount * 20}
                label="Seed cost"
                size="sm"
                animate={false}
              />
              <Badge variant={shipping === 'crate' ? 'warning' : 'info'}>
                20g / seed
              </Badge>
            </div>
          </div>
        </Panel>

        <Panel
          headingLevel={3}
          className="shelf-panel shelf-panel--wide"
          title="Notices & empty states"
          subtitle="Quiet feedback for loud moments."
          icon={<PixelIcon name="info" size={18} />}
        >
          <div className="notices-demo">
            <div className="demo-stack">
              <Alert
                variant="info"
                title="Seed shipment arrived"
                action={
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      toast({
                        variant: 'info',
                        title: 'Three crates unpacked',
                        description: 'The north shed is ready for spring.',
                      })
                    }
                  >
                    Unpack
                  </Button>
                }
              >
                Three crates are waiting by the north gate.
              </Alert>

              {noticeVisible ? (
                <Alert
                  variant="warning"
                  title="Greenhouse water is low"
                  dismissible
                  onDismiss={() => setNoticeVisible(false)}
                >
                  The reserve tank is at 12%. A storm would help, but a bucket would help
                  sooner.
                </Alert>
              ) : (
                <div className="notice-restore">
                  <span className="demo-inline-hint">Notice dismissed.</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setNoticeVisible(true)}
                  >
                    Restore notice
                  </Button>
                </div>
              )}

              <Alert
                variant="gold"
                title="Shipping bin is full"
                action={<Badge variant="gold">4 items</Badge>}
              >
                Collect it before dusk or the merchant will simply shrug.
              </Alert>
            </div>

            <EmptyState
              illustration={<PixelSprite name="watering-can" size={28} />}
              title="The greenhouse is quiet"
              description="No seeds in the tray yet. A little planning goes a long way."
              action={
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => {
                    setSeedCount(12);
                    toast({
                      variant: 'success',
                      title: 'Seeds ordered',
                      description: '12 parsnip seeds will arrive at dawn.',
                    });
                  }}
                >
                  Order seeds
                </Button>
              }
            />
          </div>
        </Panel>
      </div>

      <Dialog
        open={recipeOpen}
        onOpenChange={setRecipeOpen}
        title="Sprinkler blueprint"
        description="A small machine with a very thirsty job."
        icon={<PixelIcon name="sparkle" size={20} />}
        footer={
          <>
            <Button variant="ghost" onClick={() => setRecipeOpen(false)}>
              Put it back
            </Button>
            <Button
              variant="gold"
              leftIcon={<PixelSprite name="coin" size={16} />}
              onClick={craftRecipe}
            >
              Craft for 250g
            </Button>
          </>
        }
      >
        <div className="recipe">
          <div className="recipe__hero">
            <span className="recipe__sprite" aria-hidden="true">
              <PixelSprite name="watering-can" size={62} />
            </span>
            <div>
              <p className="recipe__name">Quality Sprinkler</p>
              <div className="recipe__tags">
                <Badge variant="info">Craftable</Badge>
                <Badge variant="gold">Spring</Badge>
              </div>
            </div>
          </div>

          <p className="recipe__copy">
            Waters the eight surrounding tiles every morning. A sensible investment for
            anyone who would rather spend the afternoon fishing.
          </p>

          <ul className="recipe__materials" aria-label="Materials">
            <li>
              <PixelSprite name="wood" size={24} />
              <span>Oak Wood</span>
              <Badge>6</Badge>
            </li>
            <li>
              <PixelSprite name="stone" size={24} />
              <span>Stone</span>
              <Badge>4</Badge>
            </li>
            <li>
              <PixelSprite name="gem" size={24} />
              <span>Prismatic Shard</span>
              <Badge variant="gold">1</Badge>
            </li>
          </ul>

          <p className="recipe__note">
            This demo charges gold only; your backpack stays exactly as it is.
          </p>
        </div>
      </Dialog>

      <div className="demo-shelf__footer">
        <PixelIcon name="leaf" size={16} />
        <span>
          Every panel above uses the same exported <code>Panel</code>, <code>Button</code>
          , and <code>Badge</code> primitives.
        </span>
        <Button
          variant="ghost"
          size="sm"
          rightIcon={<PixelIcon name="arrow-right" size={13} />}
          onClick={() => {
            document.getElementById('craft-notes')?.scrollIntoView();
          }}
        >
          Read the craft notes
        </Button>
      </div>
    </section>
  );
}
