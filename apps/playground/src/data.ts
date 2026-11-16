import type { InventoryEntry, ItemDefinition, SelectOption } from '@pixelvale/ui';

export const ITEMS = {
  parsnip: {
    id: 'parsnip',
    name: 'Parsnip',
    sprite: 'parsnip',
    category: 'Vegetable',
    rarity: 'common',
    sellPrice: 35,
    edible: true,
    description:
      'A starchy root with a sweet, earthy bite. A dependable first harvest for any new farmer.',
  },
  strawberry: {
    id: 'strawberry',
    name: 'Strawberry',
    sprite: 'strawberry',
    category: 'Fruit',
    rarity: 'uncommon',
    sellPrice: 120,
    edible: true,
    description:
      'Sun-warmed and ruby red. Smells like the first warm afternoon of spring.',
  },
  potato: {
    id: 'potato',
    name: 'Potato',
    sprite: 'potato',
    category: 'Vegetable',
    rarity: 'common',
    sellPrice: 80,
    edible: true,
    description: 'A humble tuber. Roasts beautifully, and keeps through the cold months.',
  },
  pumpkin: {
    id: 'pumpkin',
    name: 'Pumpkin',
    sprite: 'pumpkin',
    category: 'Vegetable',
    rarity: 'rare',
    sellPrice: 320,
    edible: true,
    description:
      'Impossibly round and heavier than it looks. The pride of the autumn patch.',
  },
  wood: {
    id: 'wood',
    name: 'Oak Wood',
    sprite: 'wood',
    category: 'Material',
    rarity: 'common',
    sellPrice: 10,
    description: 'Dry, straight, and ready for the workshop. Every farm runs on wood.',
  },
  stone: {
    id: 'stone',
    name: 'Stone',
    sprite: 'stone',
    category: 'Material',
    rarity: 'common',
    sellPrice: 5,
    description:
      'A sturdy grey rock. Useful for paths, fences, and the occasional slingshot.',
  },
  gem: {
    id: 'gem',
    name: 'Prismatic Shard',
    sprite: 'gem',
    category: 'Gem',
    rarity: 'legendary',
    sellPrice: 2000,
    description:
      'It hums with a colour that has no name. The museum would very much like a word.',
  },
  fish: {
    id: 'fish',
    name: 'River Trout',
    sprite: 'fish',
    category: 'Fish',
    rarity: 'uncommon',
    sellPrice: 95,
    edible: true,
    description:
      'Caught in the shallows by the old mill. Best cooked with a little butter.',
  },
  wateringCan: {
    id: 'watering-can',
    name: 'Copper Can',
    sprite: 'watering-can',
    category: 'Tool',
    rarity: 'rare',
    sellPrice: 120,
    description:
      'Dented, patched, and indispensable. It has watered every spring on this farm.',
  },
  sword: {
    id: 'sword',
    name: 'Rusty Sword',
    sprite: 'sword',
    category: 'Weapon',
    rarity: 'uncommon',
    sellPrice: 150,
    description: 'The edge is dull, but it still makes the slimes think twice.',
  },
  apple: {
    id: 'apple',
    name: 'Wild Apple',
    sprite: 'apple',
    category: 'Fruit',
    rarity: 'common',
    sellPrice: 50,
    edible: true,
    description: 'Foraged from the edge of the forest. Tart, crisp, and faintly floral.',
  },
} satisfies Record<string, ItemDefinition>;

export const INITIAL_INVENTORY: InventoryEntry[] = [
  { item: ITEMS.parsnip, quantity: 12 },
  { item: ITEMS.strawberry, quantity: 8 },
  { item: ITEMS.potato, quantity: 5 },
  { item: ITEMS.pumpkin, quantity: 3 },
  { item: ITEMS.apple, quantity: 6 },
  { item: ITEMS.fish, quantity: 4 },
  { item: ITEMS.wood, quantity: 48 },
  { item: ITEMS.stone, quantity: 32 },
  { item: ITEMS.gem, quantity: 1 },
  { item: ITEMS.wateringCan, quantity: 1 },
  { item: ITEMS.sword, quantity: 1 },
];

export interface Quest {
  id: string;
  title: string;
  description: string;
  reward: number;
}

export const QUESTS: readonly Quest[] = [
  {
    id: 'water-field',
    title: 'Water the north field',
    description: 'Give the parsnips a drink before noon.',
    reward: 150,
  },
  {
    id: 'forage-apples',
    title: 'Forage three wild apples',
    description: 'The forest edge is heavy with fruit this week.',
    reward: 220,
  },
  {
    id: 'mine-floor',
    title: 'Reach floor 20 of the mines',
    description: 'Bring a torch. And maybe a snack.',
    reward: 500,
  },
];

export interface Skill {
  id: string;
  label: string;
  level: number;
  value: number;
  variant: 'energy' | 'health' | 'xp' | 'gold';
  blurb: string;
}

export const SKILLS: readonly Skill[] = [
  {
    id: 'farming',
    label: 'Farming',
    level: 7,
    value: 78,
    variant: 'energy',
    blurb: 'Crops grow a little faster and taste a little sweeter.',
  },
  {
    id: 'mining',
    label: 'Mining',
    level: 4,
    value: 46,
    variant: 'xp',
    blurb: 'Ore nodes are less likely to crumble into dust.',
  },
  {
    id: 'fishing',
    label: 'Fishing',
    level: 5,
    value: 56,
    variant: 'health',
    blurb: 'The bobber stays steady when the current pulls hard.',
  },
  {
    id: 'foraging',
    label: 'Foraging',
    level: 3,
    value: 34,
    variant: 'gold',
    blurb: 'You notice the good mushrooms before anyone else.',
  },
];

export const FARM_TYPES: readonly SelectOption[] = [
  {
    value: 'standard',
    label: 'Standard Farm',
    description: 'Rolling fields and a roomy pond.',
  },
  {
    value: 'riverland',
    label: 'Riverland Farm',
    description: 'Islands, bridges, and excellent fishing.',
  },
  {
    value: 'forest',
    label: 'Forest Farm',
    description: 'Stumps, mushrooms, and dappled shade.',
  },
  {
    value: 'meadow',
    label: 'Meadowlands Farm',
    description: 'A small herd of very opinionated chickens.',
  },
  {
    value: 'beach',
    label: 'Beach Farm',
    description: 'Sand underfoot and salt in the air.',
  },
];

export const THEME_ORDER = ['day', 'autumn', 'night'] as const;

export type DemoTheme = (typeof THEME_ORDER)[number];

export const THEME_META: Record<
  DemoTheme,
  { label: string; next: DemoTheme; icon: 'sun' | 'leaf' | 'moon' }
> = {
  day: { label: 'Day', next: 'autumn', icon: 'sun' },
  autumn: { label: 'Autumn', next: 'night', icon: 'leaf' },
  night: { label: 'Night', next: 'day', icon: 'moon' },
};
