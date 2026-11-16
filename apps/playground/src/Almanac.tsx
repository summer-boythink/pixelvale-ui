import { useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Calendar,
  DataTable,
  IconButton,
  Panel,
  PixelIcon,
  PixelSprite,
  Popover,
  TreeView,
  useLocale,
  type BadgeVariant,
  type DataTableColumn,
  type PixelSpriteName,
  type TreeNode,
} from '@pixelvale/ui';

const ARCHIVE: readonly TreeNode[] = [
  {
    id: 'spring',
    label: 'Spring',
    icon: <PixelIcon name="leaf" size={15} />,
    children: [
      {
        id: 'crops',
        label: 'Crops',
        children: [
          { id: 'parsnip', label: 'Parsnip' },
          { id: 'strawberry', label: 'Strawberry' },
          { id: 'potato', label: 'Potato' },
        ],
      },
      {
        id: 'forage',
        label: 'Forage',
        children: [
          { id: 'apple', label: 'Wild apple' },
          { id: 'mushroom', label: 'Mushroom' },
        ],
      },
    ],
  },
  {
    id: 'summer',
    label: 'Summer',
    icon: <PixelIcon name="sun" size={15} />,
    children: [
      { id: 'melon', label: 'Melon' },
      { id: 'blueberry', label: 'Blueberry' },
    ],
  },
  {
    id: 'winter',
    label: 'Winter ledger',
    icon: <PixelIcon name="moon" size={15} />,
    disabled: true,
  },
];

interface CropRow {
  id: string;
  name: string;
  season: string;
  seasonTone: BadgeVariant;
  sprite: PixelSpriteName;
  harvest: number;
  value: number;
}

const CROPS: readonly CropRow[] = [
  {
    id: 'parsnip',
    name: 'Parsnip',
    season: 'Spring',
    seasonTone: 'success',
    sprite: 'parsnip',
    harvest: 12,
    value: 35,
  },
  {
    id: 'strawberry',
    name: 'Strawberry',
    season: 'Spring',
    seasonTone: 'success',
    sprite: 'strawberry',
    harvest: 8,
    value: 120,
  },
  {
    id: 'potato',
    name: 'Potato',
    season: 'Spring',
    seasonTone: 'success',
    sprite: 'potato',
    harvest: 9,
    value: 80,
  },
  {
    id: 'apple',
    name: 'Wild apple',
    season: 'Spring',
    seasonTone: 'info',
    sprite: 'apple',
    harvest: 6,
    value: 50,
  },
  {
    id: 'pumpkin',
    name: 'Pumpkin',
    season: 'Autumn',
    seasonTone: 'warning',
    sprite: 'pumpkin',
    harvest: 3,
    value: 320,
  },
  {
    id: 'gem',
    name: 'Prismatic shard',
    season: 'All year',
    seasonTone: 'gold',
    sprite: 'gem',
    harvest: 1,
    value: 2000,
  },
];

const CROP_COLUMNS: readonly DataTableColumn<CropRow>[] = [
  {
    id: 'crop',
    header: 'Crop',
    cell: (row) => (
      <span className="almanac-crop">
        <PixelSprite name={row.sprite} size={19} />
        <span>{row.name}</span>
      </span>
    ),
    sortValue: (row) => row.name,
  },
  {
    id: 'season',
    header: 'Season',
    cell: (row) => <Badge variant={row.seasonTone}>{row.season}</Badge>,
    sortValue: (row) => row.season,
  },
  {
    id: 'harvest',
    header: 'Harvest',
    cell: (row) => row.harvest,
    sortValue: (row) => row.harvest,
    align: 'end',
    width: 100,
  },
  {
    id: 'value',
    header: 'Value',
    cell: (row) => `${new Intl.NumberFormat('en-US').format(row.value)}g`,
    sortValue: (row) => row.value,
    align: 'end',
    width: 110,
  },
];

function findNodeLabel(nodes: readonly TreeNode[], id: string): string | null {
  for (const node of nodes) {
    if (node.id === id) return typeof node.label === 'string' ? node.label : id;
    if (node.children) {
      const found = findNodeLabel(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

export function Almanac() {
  const [selectedDate, setSelectedDate] = useState('2026-03-12');
  const [archiveId, setArchiveId] = useState('parsnip');
  const [notesOpen, setNotesOpen] = useState(false);
  const { locale } = useLocale();
  const pickedDate = new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeZone: 'UTC',
  }).format(new Date(`${selectedDate}T00:00:00Z`));
  const archiveLabel = findNodeLabel(ARCHIVE, archiveId) ?? archiveId;

  return (
    <section
      id="almanac"
      className="demo-section demo-almanac"
      aria-labelledby="almanac-title"
    >
      <div className="demo-section__head">
        <p className="demo-kicker">Season planner</p>
        <h2 id="almanac-title">The almanac</h2>
        <p>
          Dates, folders, and sortable rows: three ways to keep a growing season legible
          without losing the paper-and-wood feeling.
        </p>
      </div>

      <div className="demo-almanac__grid">
        <Panel
          headingLevel={3}
          className="shelf-panel"
          title="Season calendar"
          subtitle="Pick a day for the ledger."
          icon={<PixelIcon name="clock" size={18} />}
          actions={<Badge variant="gold">Spring · Year 1</Badge>}
        >
          <div className="demo-stack">
            <Calendar
              today="2026-03-15"
              defaultMonth="2026-03"
              value={selectedDate}
              onValueChange={setSelectedDate}
              label="Season calendar"
            />
            <div className="almanac-picked" aria-live="polite">
              <span className="almanac-picked__label">Picked</span>
              <time className="almanac-picked__date" dateTime={selectedDate}>
                {pickedDate}
              </time>
              <span className="demo-inline-hint">
                Arrow keys move; PageUp/PageDown change month.
              </span>
            </div>
          </div>
        </Panel>

        <Panel
          headingLevel={3}
          className="shelf-panel"
          title="Farm archive"
          subtitle="Nested folders with a keyboard trail."
          icon={<PixelIcon name="leaf" size={18} />}
          actions={
            <Popover
              label="Field notes"
              open={notesOpen}
              onOpenChange={setNotesOpen}
              placement="bottom"
              align="end"
              width={300}
              trigger={
                <IconButton label="Field notes" size="sm" variant="default">
                  <PixelIcon name="info" size={15} />
                </IconButton>
              }
            >
              <p className="field-notes__title">A note from the archive</p>
              <p className="field-notes__body">
                The Winter ledger stays locked until the first snow. Folders remember
                where you left them, and arrow keys move through the whole tree.
              </p>
              <div className="field-notes__footer">
                <Badge variant="success">Pinned</Badge>
                <Button size="sm" variant="gold" onClick={() => setNotesOpen(false)}>
                  Mark as read
                </Button>
              </div>
            </Popover>
          }
          footer={
            <div className="almanac-selected">
              <span>Selected leaf</span>
              <strong>{archiveLabel}</strong>
            </div>
          }
        >
          <div className="demo-stack">
            <TreeView
              nodes={ARCHIVE}
              defaultExpanded={['spring', 'crops']}
              defaultSelected="parsnip"
              onSelectedChange={setArchiveId}
              label="Farm archive"
            />
            <p className="demo-inline-hint">
              Right/Left expands or collapses; Enter selects. Branches keep their place.
            </p>
            <Alert variant="warning" title="Winter ledger locked">
              The last folder opens after the first snow. Everything else is fair game.
            </Alert>
          </div>
        </Panel>

        <Panel
          headingLevel={3}
          className="shelf-panel demo-almanac__table"
          title="Harvest ledger"
          subtitle="Sort by crop, season, harvest, or value."
          icon={<PixelIcon name="star" size={18} />}
        >
          <DataTable
            label="Harvest ledger"
            columns={CROP_COLUMNS}
            rows={CROPS}
            getRowKey={(row) => row.id}
            defaultSort={{ columnId: 'value', direction: 'desc' }}
          />
        </Panel>
      </div>
    </section>
  );
}
