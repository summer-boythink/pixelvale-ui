import type { ItemDefinition } from '../components/InventoryGrid';

export const ITEM_FIXTURES: Record<string, ItemDefinition> = {
  parsnip: {
    id: 'parsnip',
    name: 'Parsnip',
    sprite: 'parsnip',
    category: 'Vegetable',
    sellPrice: 35,
    edible: true,
  },
  strawberry: {
    id: 'strawberry',
    name: 'Strawberry',
    sprite: 'strawberry',
    category: 'Fruit',
    rarity: 'uncommon',
    sellPrice: 120,
    edible: true,
  },
  gem: {
    id: 'gem',
    name: 'Prismatic Shard',
    sprite: 'gem',
    category: 'Gem',
    rarity: 'legendary',
    sellPrice: 2000,
  },
};
