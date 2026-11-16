import { describe, expect, it } from 'vitest';
import type { ReactNode } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import {
  PixelValeProvider,
  ToastProvider,
  useLocale,
  useToast,
  type LocaleMessagesOverride,
} from '../index';
import { Alert } from '../components/Alert';
import { Avatar } from '../components/Avatar';
import { Breadcrumb } from '../components/Breadcrumb';
import { Calendar } from '../components/Calendar';
import { Carousel } from '../components/Carousel';
import { CoinDisplay, ProgressBar } from '../components/ProgressBar';
import { Combobox } from '../components/Combobox';
import { DataTable } from '../components/DataTable';
import { DatePicker } from '../components/DatePicker';
import { Dialog } from '../components/Dialog';
import { FileDropzone } from '../components/FileDropzone';
import { InventoryGrid } from '../components/InventoryGrid';
import { NumberField } from '../components/NumberField';
import { Pagination } from '../components/Pagination';
import { Popover } from '../components/Popover';
import { Rating } from '../components/Rating';
import { Select } from '../components/Select';
import { Sparkline } from '../components/Sparkline';
import { Spinner } from '../components/Spinner';
import { Steps } from '../components/Steps';
import { Tabs } from '../components/Tabs';
import { TagInput } from '../components/TagInput';
import { Timeline } from '../components/Timeline';
import { TreeView } from '../components/TreeView';
import { ITEM_FIXTURES } from './fixtures';

function zh(node: ReactNode, messages?: LocaleMessagesOverride) {
  return (
    <PixelValeProvider defaultSoundEnabled={false} locale="zh-CN" messages={messages}>
      {node}
    </PixelValeProvider>
  );
}

describe('Chinese locale', () => {
  it('sets lang and exposes translated hooks', () => {
    function Probe() {
      const { locale, t } = useLocale();
      return (
        <span>
          {locale}:{t('gold')}
        </span>
      );
    }

    const { container } = render(zh(<Probe />));
    expect(container.querySelector('.pv-root')?.getAttribute('lang')).toBe('zh-CN');
    expect(screen.getByText('zh-CN:金币')).toBeTruthy();
  });

  it('localizes dialog, alert, select, and number field built-ins', () => {
    render(
      zh(
        <>
          <Dialog open onOpenChange={() => undefined} title="茶话">
            <p>今日有雨。</p>
          </Dialog>
          <Alert title="水开了" dismissible onDismiss={() => undefined} />
          <Select label="农场" options={[{ value: 'tea', label: '茶园' }]} />
          <NumberField label="种子" defaultValue={3} />
        </>,
      ),
    );

    expect(screen.getByRole('button', { name: '关闭对话框' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '关闭提示' })).toBeTruthy();
    expect(screen.getByText('请选择…')).toBeTruthy();
    expect(screen.getByRole('button', { name: '减少种子' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '增加种子' })).toBeTruthy();
  });

  it('localizes combobox, rating, avatar, sparkline, and inventory', () => {
    render(
      zh(
        <div>
          <Combobox label="找任务" options={[]} />
          <Rating label="茶香" defaultValue={3} readOnly />
          <Avatar name="玛妮" status="online" />
          <Sparkline values={[2, 4, 8]} label="收成" />
          <InventoryGrid
            items={[
              {
                item: { ...ITEM_FIXTURES.strawberry!, name: '草莓' },
                quantity: 8,
              },
            ]}
            columns={3}
            rows={1}
            showTooltips={false}
          />
        </div>,
      ),
    );

    expect(screen.getByPlaceholderText('搜索…')).toBeTruthy();
    expect(screen.getByRole('img', { name: '茶香：3/5 星' })).toBeTruthy();
    expect(screen.getByText('在线')).toBeTruthy();
    expect(screen.getByRole('img', { name: '玛妮' }).textContent).toContain('玛妮');
    expect(screen.getByRole('img', { name: '收成：3 个数据点，最新 8' })).toBeTruthy();
    expect(screen.getByRole('listbox', { name: '背包' })).toBeTruthy();
    expect(screen.getByRole('option', { name: '草莓，数量 8' })).toBeTruthy();
  });

  it('localizes landmark labels and number formatting', () => {
    render(
      zh(
        <>
          <Tabs items={[{ value: 'tea', label: '茶单' }]} />
          <ProgressBar value={50} />
          <Steps steps={[{ value: 'pick', label: '采茶' }]} current="pick" />
          <CoinDisplay value={1234} animate={false} />
        </>,
      ),
    );

    expect(screen.getByRole('tablist', { name: '分区' })).toBeTruthy();
    expect(screen.getByRole('progressbar', { name: '进度' })).toBeTruthy();
    expect(screen.getByRole('list', { name: '进度步骤' })).toBeTruthy();
    expect(screen.getByTitle('1,234 金币')).toBeTruthy();
  });

  it('falls back to a valid number formatter for unknown locales', () => {
    render(zh(<CoinDisplay value={12} locale="not-a-locale" animate={false} />));
    expect(screen.getByTitle('12 金币')).toBeTruthy();
  });

  it('localizes breadcrumb, pagination, timeline, and tag input', () => {
    render(
      zh(
        <>
          <Breadcrumb items={[{ label: '山谷' }]} />
          <Pagination pageCount={3} defaultPage={2} />
          <Timeline items={[{ id: 'tea', title: '种茶' }]} />
          <TagInput label="标签" defaultValue={['春天', '雨天']} maxTags={2} />
        </>,
      ),
    );

    expect(screen.getByRole('navigation', { name: '面包屑导航' })).toBeTruthy();
    expect(screen.getByRole('navigation', { name: '分页导航' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '上一页' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '下一页' })).toBeTruthy();
    expect(
      screen.getByRole('button', { name: '第 2 页' }).getAttribute('aria-current'),
    ).toBe('page');
    expect(screen.getByRole('list', { name: '时间线' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '移除春天' })).toBeTruthy();
    expect(screen.getByText('最多 2 个标签')).toBeTruthy();
  });

  it('localizes calendar, table, tree, and popover landmarks', () => {
    render(
      zh(
        <>
          <Calendar today="2026-03-15" defaultMonth="2026-03" />
          <DataTable
            columns={[{ id: 'tea', header: '茶', cell: () => '龙井' }]}
            rows={[{ id: 'tea' }]}
            getRowKey={(row) => row.id}
          />
          <TreeView nodes={[{ id: 'spring', label: '春天' }]} />
          <Popover label="详情" defaultOpen trigger={<button type="button">打开</button>}>
            <p>新茶到了。</p>
          </Popover>
        </>,
      ),
    );

    expect(screen.getByRole('group', { name: '日历' })).toBeTruthy();
    expect(screen.getByText('2026年3月')).toBeTruthy();
    expect(screen.getByRole('button', { name: '上个月' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '下个月' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '今天' })).toBeTruthy();
    expect(screen.getByRole('region', { name: '数据表' })).toBeTruthy();
    expect(screen.getByRole('tree', { name: '树形列表' })).toBeTruthy();
    expect(screen.getByRole('treeitem', { name: '春天' })).toBeTruthy();
    expect(screen.getByRole('dialog', { name: '详情' })).toBeTruthy();
  });

  it('localizes spinner, date picker, dropzone, and carousel', () => {
    const file = new File(['x'], 'seed.png', { type: 'image/png' });
    render(
      zh(
        <>
          <Spinner />
          <DatePicker defaultValue="2026-03-12" today="2026-03-15" />
          <DatePicker today="2026-03-15" />
          <FileDropzone label="卡片" defaultFiles={[file]} />
          <Carousel
            items={[
              { id: 'a', content: '甲' },
              { id: 'b', content: '乙' },
            ]}
          />
        </>,
      ),
    );

    expect(screen.getByRole('status', { name: '加载中' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '2026年3月12日' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '清除日期' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '选择日期' })).toBeTruthy();
    expect(screen.getByRole('list', { name: '已选文件' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '移除seed.png' })).toBeTruthy();
    expect(screen.getByRole('region', { name: '轮播图' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '上一张' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '下一张' })).toBeTruthy();
    expect(screen.getByText('第 1 张，共 2 张')).toBeTruthy();
  });

  it('allows per-key message overrides', () => {
    render(
      zh(
        <Dialog open onOpenChange={() => undefined} title="茶话">
          <p>今日有雨。</p>
        </Dialog>,
        { closeDialog: '关上' },
      ),
    );
    expect(screen.getByRole('button', { name: '关上' })).toBeTruthy();
  });
});

describe('Chinese toast defaults', () => {
  function Harness() {
    const { toast } = useToast();
    return (
      <button type="button" onClick={() => toast({ title: '茶好了', duration: 0 })}>
        上茶
      </button>
    );
  }

  it('translates the notification region and dismiss button', async () => {
    render(
      <PixelValeProvider defaultSoundEnabled={false} locale="zh-CN">
        <ToastProvider>
          <Harness />
        </ToastProvider>
      </PixelValeProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: '上茶' }));
    expect(await screen.findByRole('status')).toBeTruthy();
    expect(screen.getByRole('region', { name: '通知' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '关闭通知' })).toBeTruthy();
  });
});
