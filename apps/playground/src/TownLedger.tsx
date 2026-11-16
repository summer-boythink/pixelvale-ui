import { useState } from 'react';
import {
  Alert,
  Badge,
  Breadcrumb,
  CoinDisplay,
  Divider,
  Pagination,
  Panel,
  PixelIcon,
  PixelSprite,
  TagInput,
  Timeline,
  type BadgeVariant,
  type PixelSpriteName,
  type TimelineItem,
} from '@pixelvale/ui';

interface Notice {
  id: string;
  title: string;
  body: string;
  tag: string;
  tone: BadgeVariant;
  sprite: PixelSpriteName;
  reward: number;
}

const NOTICES: readonly Notice[] = [
  {
    id: 'chicken',
    title: 'A very round chicken',
    body: 'A blue hen has taken up residence by the mill. She answers to “Pip” and accepts strawberries.',
    tag: 'Lost & found',
    tone: 'warning',
    sprite: 'apple',
    reward: 120,
  },
  {
    id: 'bridge',
    title: 'Bridge repairs',
    body: 'Three planks are loose on the east crossing. Volunteers with a hammer meet at noon.',
    tag: 'Town works',
    tone: 'info',
    sprite: 'wood',
    reward: 80,
  },
  {
    id: 'lantern',
    title: 'Lantern night',
    body: 'Bring a jar and a wish. The square will be lit at dusk, weather permitting.',
    tag: 'Festival',
    tone: 'gold',
    sprite: 'gem',
    reward: 0,
  },
  {
    id: 'seeds',
    title: 'Seed swap',
    body: 'Leftover parsnip and pumpkin seeds welcome. Take a packet, leave a packet.',
    tag: 'Community',
    tone: 'success',
    sprite: 'parsnip',
    reward: 40,
  },
];

const JOURNAL: readonly TimelineItem[] = [
  {
    id: 'plant',
    title: 'North field planted',
    description: 'Six rows of parsnips, one very optimistic scarecrow.',
    timestamp: 'Spring 12',
    dateTime: '2026-03-12',
    tone: 'success',
    icon: <PixelSprite name="parsnip" size={18} />,
  },
  {
    id: 'rain',
    title: 'Rain all afternoon',
    description: 'The cistern is full and the paths smell like wet stone.',
    timestamp: 'Spring 13',
    dateTime: '2026-03-13',
    tone: 'info',
    icon: <PixelIcon name="info" size={16} />,
  },
  {
    id: 'berry',
    title: 'First strawberry',
    description: 'Small, warm, and immediately eaten. The ledger records no sale.',
    timestamp: 'Spring 14',
    dateTime: '2026-03-14',
    tone: 'gold',
    icon: <PixelSprite name="strawberry" size={18} />,
  },
  {
    id: 'fence',
    title: 'West fence mended',
    description: 'Two nails, one crooked post, and a silent promise to check it again.',
    timestamp: 'Spring 15',
    dateTime: '2026-03-15',
    tone: 'default',
    active: true,
    icon: <PixelIcon name="check" size={16} />,
  },
];

const NOTICES_PER_PAGE = 2;

export function TownLedger() {
  const [page, setPage] = useState(1);
  const pageCount = Math.ceil(NOTICES.length / NOTICES_PER_PAGE);
  const visibleNotices = NOTICES.slice(
    (page - 1) * NOTICES_PER_PAGE,
    page * NOTICES_PER_PAGE,
  );

  return (
    <section
      id="ledger"
      className="demo-section demo-ledger"
      aria-labelledby="ledger-title"
    >
      <div className="demo-section__head">
        <p className="demo-kicker">Paper trails</p>
        <h2 id="ledger-title">The town ledger</h2>
        <p>
          Wayfinding, dates, tags, and pages: small pieces that keep a long season
          readable without turning it into a spreadsheet.
        </p>
      </div>

      <div className="demo-ledger__grid">
        <Panel
          headingLevel={3}
          className="shelf-panel"
          title="Notice board"
          subtitle="Two notices at a time, pinned in place."
          icon={<PixelIcon name="info" size={18} />}
          actions={<Badge variant="info">{NOTICES.length} notices</Badge>}
          footer={
            <Pagination
              page={page}
              pageCount={pageCount}
              onPageChange={setPage}
              size="sm"
              label="Notice board pages"
            />
          }
        >
          <div className="demo-stack">
            <Breadcrumb
              items={[
                { label: 'Valley', href: '#top' },
                { label: 'Willow Farm', href: '#homestead' },
                { label: 'Notice board' },
              ]}
            />

            <ul className="notice-list" aria-live="polite">
              {visibleNotices.map((notice) => (
                <li className="ledger-notice" key={notice.id}>
                  <span className="ledger-notice__icon" aria-hidden="true">
                    <PixelSprite name={notice.sprite} size={26} />
                  </span>
                  <div className="ledger-notice__body">
                    <div className="ledger-notice__head">
                      <p className="ledger-notice__title">{notice.title}</p>
                      <Badge variant={notice.tone}>{notice.tag}</Badge>
                    </div>
                    <p className="ledger-notice__text">{notice.body}</p>
                    <div className="ledger-notice__meta">
                      <span>Reward</span>
                      {notice.reward > 0 ? (
                        <CoinDisplay value={notice.reward} size="sm" animate={false} />
                      ) : (
                        <span className="ledger-notice__thanks">Good will</span>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <p className="demo-inline-hint">
              Page {page} of {pageCount}. Arrow buttons move one page; the numbers jump
              straight there.
            </p>

            <Alert variant="info" title="Pinned by the mayor">
              The board is checked every morning. Notices older than one season go into
              the ledger, tags and all.
            </Alert>
          </div>
        </Panel>

        <Panel
          headingLevel={3}
          className="shelf-panel"
          title="Farm journal"
          subtitle="Dated entries, tags, and one crooked fence post."
          icon={<PixelIcon name="clock" size={18} />}
        >
          <div className="demo-stack">
            <Timeline items={JOURNAL} label="Farm journal entries" />

            <Divider label="archive tags" />

            <TagInput
              label="Journal tags"
              name="journal-tag"
              defaultValue={['spring', 'north field', 'seeds']}
              maxTags={6}
              maxLength={18}
              placeholder="Add a tag…"
              hint="Press Enter or comma to add. Backspace removes the last tag."
            />
          </div>
        </Panel>
      </div>
    </section>
  );
}
