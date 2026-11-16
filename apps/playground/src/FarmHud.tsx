import { useState, type Dispatch, type SetStateAction } from 'react';
import {
  Badge,
  Button,
  Checkbox,
  CoinDisplay,
  Dialog,
  Divider,
  EmptyState,
  InventoryGrid,
  ItemDetails,
  Panel,
  PixelIcon,
  PixelSprite,
  ProgressBar,
  Select,
  Slider,
  Switch,
  Tabs,
  useSound,
  useToast,
} from '@pixelvale/ui';
import { FARM_TYPES, INITIAL_INVENTORY, ITEMS, QUESTS, SKILLS } from './data';

interface FarmHudProps {
  gold: number;
  setGold: Dispatch<SetStateAction<number>>;
}

export function FarmHud({ gold, setGold }: FarmHudProps) {
  const [tab, setTab] = useState('backpack');
  const [items, setItems] = useState(INITIAL_INVENTORY);
  const [selectedId, setSelectedId] = useState<string | null>(
    INITIAL_INVENTORY[0]?.item.id ?? null,
  );
  const [energy, setEnergy] = useState(72);
  const [sunlight, setSunlight] = useState(64);
  const [day, setDay] = useState(12);
  const [tooltips, setTooltips] = useState(true);
  const [farmType, setFarmType] = useState('standard');
  const [autoSave, setAutoSave] = useState(true);
  const [sleepOpen, setSleepOpen] = useState(false);
  const [completed, setCompleted] = useState<Set<string>>(() => new Set<string>());
  const [claimedQuests, setClaimedQuests] = useState<Set<string>>(
    () => new Set<string>(),
  );

  const { toast } = useToast();
  const { enabled, setEnabled, volume, setVolume, play } = useSound();

  const selectedEntry =
    items.find((entry) => entry.item.id === selectedId) ?? items[0] ?? null;

  const decrementItem = (itemId: string) => {
    const index = items.findIndex((entry) => entry.item.id === itemId);
    if (index < 0) return;

    const entry = items[index];
    if (!entry) return;

    const nextItems =
      entry.quantity > 1
        ? items.map((candidate, candidateIndex) =>
            candidateIndex === index
              ? { ...candidate, quantity: candidate.quantity - 1 }
              : candidate,
          )
        : items.filter((_, candidateIndex) => candidateIndex !== index);

    setItems(nextItems);

    if (selectedId === itemId) {
      const fallback = nextItems[Math.min(index, nextItems.length - 1)];
      setSelectedId(fallback?.item.id ?? null);
    }
  };

  const handleUse = () => {
    if (!selectedEntry) return;
    const { item } = selectedEntry;

    if (!item.edible) {
      toast({
        variant: 'info',
        title: `A trusty ${item.name}`,
        description: 'Better kept for the farm than for the dinner plate.',
      });
      return;
    }

    if (energy >= 100) {
      toast({
        variant: 'warning',
        title: 'You are full of energy',
        description: 'Save the snack for a long afternoon in the mines.',
      });
      return;
    }

    const restored = Math.min(12, 100 - energy);
    setEnergy((current) => Math.min(100, current + 12));
    decrementItem(item.id);

    toast({
      variant: 'success',
      title: `You ate ${item.name}`,
      description: `Energy +${restored}.${
        selectedEntry.quantity === 1 ? ' That was the last one.' : ''
      }`,
    });
  };

  const handleSell = () => {
    if (!selectedEntry) return;
    const { item } = selectedEntry;
    const price = item.sellPrice ?? 0;

    setGold((current) => current + price);
    decrementItem(item.id);

    toast({
      variant: 'gold',
      title: `Sold ${item.name}`,
      description: `+${price}g clinks into your purse.${
        selectedEntry.quantity === 1 ? ' The slot is now empty.' : ''
      }`,
    });
  };

  const harvest = () => {
    setItems((current) => {
      const index = current.findIndex((entry) => entry.item.id === ITEMS.strawberry.id);

      if (index >= 0) {
        return current.map((entry, entryIndex) =>
          entryIndex === index
            ? { ...entry, quantity: Math.min(999, entry.quantity + 2) }
            : entry,
        );
      }

      return [...current, { item: ITEMS.strawberry, quantity: 2 }];
    });
    setGold((current) => current + 80);
    setEnergy((current) => Math.max(0, current - 6));
    setSunlight((current) => Math.min(100, current + 8));

    toast({
      variant: 'gold',
      title: 'Strawberries harvested',
      description: 'Two tucked into your pack, and +80g for the shipping bin.',
    });
  };

  const sleep = () => {
    setDay((current) => current + 1);
    setEnergy(100);
    setSunlight(8);
    setSleepOpen(false);
    toast({
      variant: 'success',
      title: `Day ${day + 1} begins`,
      description: 'You feel rested. The farm is already waiting for you.',
    });
  };

  const toggleQuest = (questId: string, title: string, reward: number) => {
    const wasDone = completed.has(questId);
    const alreadyClaimed = claimedQuests.has(questId);

    setCompleted((current) => {
      const next = new Set(current);
      if (wasDone) next.delete(questId);
      else next.add(questId);
      return next;
    });

    if (wasDone) {
      toast({
        variant: 'info',
        title: 'Quest reopened',
        description: `${title} is back on the board. Rewards already claimed stay claimed.`,
      });
      return;
    }

    if (alreadyClaimed) {
      toast({
        variant: 'info',
        title: 'Quest checked off again',
        description: `The ${reward}g reward was already claimed earlier.`,
      });
      return;
    }

    setClaimedQuests((current) => {
      const next = new Set(current);
      next.add(questId);
      return next;
    });
    setGold((current) => current + reward);
    toast({
      variant: 'success',
      title: 'Quest complete!',
      description: `${title} · +${reward}g delivered to your purse.`,
    });
  };

  const questsRemaining = QUESTS.length - completed.size;

  const tabs = [
    {
      value: 'backpack',
      label: 'Backpack',
      icon: <PixelIcon name="leaf" size={15} />,
      badge: items.length,
    },
    {
      value: 'skills',
      label: 'Skills',
      icon: <PixelIcon name="star" size={15} />,
    },
    {
      value: 'journal',
      label: 'Journal',
      icon: <PixelIcon name="clock" size={15} />,
      badge: questsRemaining,
    },
  ];

  return (
    <section
      id="homestead"
      className="demo-section demo-hud"
      aria-labelledby="homestead-title"
    >
      <div className="demo-section__head">
        <p className="demo-kicker">A living demo</p>
        <h2 id="homestead-title">The homestead</h2>
        <p>
          A working inventory, a quest board, and the small sounds that make a menu feel
          alive. Everything updates in place.
        </p>
      </div>

      <div className="demo-hud__grid">
        <Panel
          headingLevel={3}
          className="hud-main"
          ornate
          title="Farmhouse menu"
          subtitle="Tabs, inventory, and a little bit of magic."
          icon={<PixelIcon name="leaf" size={20} />}
          actions={<Badge variant="success">Spring · Day {day}</Badge>}
        >
          <Tabs
            items={tabs}
            value={tab}
            onValueChange={setTab}
            label="Homestead sections"
          />

          <div className="hud-tabpanel" role="tabpanel" aria-label={`${tab} panel`}>
            {tab === 'backpack' ? (
              <div className="inventory-layout">
                <div className="inventory-main">
                  <InventoryGrid
                    items={items}
                    columns={5}
                    rows={3}
                    selectedId={selectedEntry?.item.id ?? null}
                    onSelectedChange={setSelectedId}
                    showTooltips={tooltips}
                    label="Backpack contents"
                  />
                  <p className="inventory-hint">
                    <PixelIcon name="info" size={13} />
                    Click a slot or use the arrow keys. Hover for the full item card.
                  </p>
                </div>

                <aside className="item-detail" aria-label="Selected item">
                  {selectedEntry ? (
                    <>
                      <p className="item-detail__label">Selected</p>
                      <ItemDetails
                        item={selectedEntry.item}
                        quantity={selectedEntry.quantity}
                      />
                      <div className="item-detail__actions">
                        <Button
                          size="sm"
                          variant="primary"
                          leftIcon={
                            <PixelIcon
                              name={selectedEntry.item.edible ? 'heart' : 'info'}
                              size={15}
                            />
                          }
                          onClick={handleUse}
                        >
                          {selectedEntry.item.edible ? 'Eat one' : 'Inspect'}
                        </Button>
                        <Button
                          size="sm"
                          variant="gold"
                          leftIcon={<PixelSprite name="coin" size={15} />}
                          disabled={!selectedEntry.item.sellPrice}
                          onClick={handleSell}
                        >
                          Sell one
                        </Button>
                      </div>
                    </>
                  ) : (
                    <EmptyState
                      size="sm"
                      illustration={<PixelSprite name="watering-can" size={26} />}
                      title="Your pack is empty"
                      description="The farm, however, is not."
                    />
                  )}
                </aside>
              </div>
            ) : null}

            {tab === 'skills' ? (
              <div className="skill-list">
                {SKILLS.map((skill) => (
                  <article className="skill-card" key={skill.id}>
                    <div className="skill-card__head">
                      <span className="skill-card__name">{skill.label}</span>
                      <span className="skill-card__meta">
                        <span className="skill-card__xp">{skill.value} / 100</span>
                        <Badge variant={skill.variant === 'gold' ? 'gold' : 'info'}>
                          Lv {skill.level}
                        </Badge>
                      </span>
                    </div>
                    <ProgressBar
                      value={skill.value}
                      variant={skill.variant}
                      aria-label={`${skill.label} experience`}
                    />
                    <p className="skill-card__blurb">{skill.blurb}</p>
                  </article>
                ))}
              </div>
            ) : null}

            {tab === 'journal' ? (
              <div className="quest-list">
                <div className="quest-list__head">
                  <p className="quest-list__title">Spring chores</p>
                  <Badge variant={questsRemaining === 0 ? 'success' : 'warning'}>
                    {questsRemaining === 0 ? 'All done' : `${questsRemaining} remaining`}
                  </Badge>
                </div>
                {QUESTS.map((quest) => {
                  const done = completed.has(quest.id);
                  const claimed = claimedQuests.has(quest.id);
                  return (
                    <div className={`quest${done ? ' quest--done' : ''}`} key={quest.id}>
                      <Checkbox
                        checked={done}
                        onCheckedChange={() =>
                          toggleQuest(quest.id, quest.title, quest.reward)
                        }
                        label={quest.title}
                        description={quest.description}
                      />
                      <span className="quest__reward">
                        <Badge variant={claimed ? 'success' : 'gold'}>
                          {claimed ? 'Claimed' : `+${quest.reward}g`}
                        </Badge>
                      </span>
                    </div>
                  );
                })}
                {questsRemaining === 0 ? (
                  <p className="quest-list__done">
                    <PixelIcon name="sparkle" size={14} />
                    The board is clear. Take the rest of the day slowly.
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
        </Panel>

        <div className="hud-side">
          <Panel
            headingLevel={3}
            title="Farmer's almanac"
            icon={<PixelIcon name="sun" size={20} />}
            actions={<Badge variant="warning">Sunny</Badge>}
            ornate
          >
            <div className="almanac__date">
              <div>
                <span className="almanac__season">Spring · Year 1</span>
                <strong className="almanac__day">Day {day}</strong>
              </div>
              <span className="almanac__weather" aria-hidden="true">
                <PixelIcon name="sun" size={30} />
              </span>
            </div>

            <Divider />

            <div className="demo-stack demo-stack--sm">
              <ProgressBar label="Energy" value={energy} variant="energy" showValue />
              <ProgressBar label="Sunlight" value={sunlight} variant="gold" showValue />
            </div>

            <div className="almanac__gold">
              <CoinDisplay value={gold} label="Gold" size="lg" />
              <span className="almanac__ship">Shipping bin: ready</span>
            </div>

            <div className="almanac__actions">
              <Button
                variant="primary"
                fullWidth
                leftIcon={<PixelSprite name="strawberry" size={18} />}
                onClick={harvest}
              >
                Harvest +80g
              </Button>
              <Button
                variant="default"
                fullWidth
                leftIcon={<PixelIcon name="moon" size={16} />}
                onClick={() => setSleepOpen(true)}
              >
                End the day
              </Button>
            </div>
          </Panel>

          <Panel
            headingLevel={3}
            title="Quick settings"
            subtitle="Live controls for this demo."
            icon={<PixelIcon name="star" size={18} />}
          >
            <div className="demo-stack">
              <Switch
                label="Sound effects"
                description="Synthesized with WebAudio — no audio files."
                checked={enabled}
                onCheckedChange={setEnabled}
              />
              <Slider
                label="Volume"
                min={0}
                max={100}
                value={Math.round(volume * 100)}
                onValueChange={(next) => setVolume(next / 100)}
                showValue
                formatValue={(next) => `${Math.round(next)}%`}
                disabled={!enabled}
                onPointerUp={() => {
                  if (enabled) play('toggle');
                }}
              />
              <Checkbox
                label="Item tooltips"
                description="Hover or focus a backpack slot."
                checked={tooltips}
                onCheckedChange={setTooltips}
              />
              <Select
                label="Farm layout"
                value={farmType}
                onValueChange={(next) => {
                  setFarmType(next);
                  const chosen = FARM_TYPES.find((option) => option.value === next);
                  toast({
                    variant: 'info',
                    title: 'Farm layout updated',
                    description:
                      typeof chosen?.label === 'string'
                        ? `${chosen.label}. Purely cosmetic in this demo.`
                        : 'A fresh view of the fields.',
                  });
                }}
                options={FARM_TYPES}
                hint="Opens above the fold when space is tight."
              />
              <Switch
                label="Cozy auto-save"
                description="A gentle reminder, not a real save file."
                checked={autoSave}
                onCheckedChange={(next) => {
                  setAutoSave(next);
                  toast({
                    variant: next ? 'success' : 'warning',
                    title: next ? 'Auto-save enabled' : 'Auto-save paused',
                    description: next
                      ? 'Your imaginary farm is safely tucked in.'
                      : 'Remember to save before you wander off.',
                  });
                }}
              />
            </div>
          </Panel>
        </div>
      </div>

      <Dialog
        open={sleepOpen}
        onOpenChange={setSleepOpen}
        size="sm"
        title="End the day?"
        description="A fresh start is only a short nap away."
        icon={<PixelIcon name="moon" size={20} />}
        footer={
          <>
            <Button variant="ghost" onClick={() => setSleepOpen(false)}>
              Not yet
            </Button>
            <Button
              variant="primary"
              leftIcon={<PixelIcon name="moon" size={15} />}
              onClick={sleep}
            >
              Sleep until morning
            </Button>
          </>
        }
      >
        <div className="sleep-dialog">
          <span className="sleep-dialog__sprite" aria-hidden="true">
            <PixelSprite name="watering-can" size={56} />
          </span>
          <div>
            <p>
              You still have <strong>{energy} energy</strong>. Unwatered crops will wait
              patiently, but the shipping bin closes at dusk.
            </p>
            <p className="sleep-dialog__note">
              Waking up will begin Day {day + 1} with a full energy bar.
            </p>
          </div>
        </div>
      </Dialog>
    </section>
  );
}
