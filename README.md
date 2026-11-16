# Pixelvale UI

一套手写的**星露谷风格** React + TypeScript UI 组件库，包含组件库本体和一个可交互的农场主题 Playground。

- 木框、羊皮纸、像素投影、金色描边
- 动作菜单、折叠面板、原生单选、数量步进、侧边抽屉、步骤条、统计块、骨架屏
- 可搜索 Combobox、星级评分、像素 Sparkline、头像与状态点
- 内置 `en` / `zh-CN` 界面语言：读屏文案、数字格式、语言属性同步切换
- 中文示例站使用 Fusion Pixel 像素字体，汉字与英文界面都保持同一套视觉语言
- 原创 12×12 像素图标与作物精灵（不含任何游戏素材）
- WebAudio 合成点击/成功/金币音效，无音频文件
- 键盘可用的 Tabs、Select、DropdownMenu、Accordion、Inventory、Dialog、Tooltip
- 弹窗 / Tooltip / Toast 共享主题化 Portal；下拉菜单使用 Popover 顶层级避免裁剪
- 0 个生产运行时依赖（peer 依赖仅 React / ReactDOM）
- 组件测试、类型检查、库构建与示例站构建全部通过

![demo](https://img.shields.io/badge/demo-local%20playground-78ab4f) ![react](https://img.shields.io/badge/react-18.3%20%7C%2019-5a9bd4) ![typescript](https://img.shields.io/badge/typescript-5.9-3178c6)

---

## 目录结构

```text
stardew-ui/
├── apps/
│   └── playground/          # Vite + React 交互示例站
├── packages/
│   └── ui/                  # @pixelvale/ui 组件库
│       ├── src/components/  # 组件实现
│       ├── src/lib/         # 内部 hooks / 工具
│       ├── src/styles.css   # 主题与全部组件样式
│       └── src/test/        # Vitest + Testing Library
├── package.json             # npm workspaces
└── README.md
```

## 快速开始

要求 Node.js **22.12+**（Vitest 5 的环境要求；仅构建 Vite 时 20.19+ 也可用）。

```bash
npm install
npm run dev          # 启动 Playground → http://localhost:5173
```

其他命令：

```bash
npm run typecheck    # 全部 workspace 的 TypeScript 检查
npm test             # 组件测试
npm run build        # 构建库 + Playground
npm run build:lib    # 只构建 @pixelvale/ui
npm run preview      # 预览 Playground 的构建产物
npm run format       # Prettier 格式化
npm run format:check # 检查格式
```

## 在项目中使用

```bash
npm install ./packages/ui
# 或发布后： npm install @pixelvale/ui
```

```tsx
import { Button, Panel, PixelValeProvider, ToastProvider } from '@pixelvale/ui';
import '@pixelvale/ui/style.css';

export function App() {
  return (
    <PixelValeProvider theme="day">
      <ToastProvider>
        <Panel title="Farmhouse menu" ornate>
          <Button variant="primary">Plant a parsnip</Button>
        </Panel>
      </ToastProvider>
    </PixelValeProvider>
  );
}
```

### 字体

组件库不强制打包字体。默认字体栈为：

```css
"Pixelify Sans", "Fusion Pixel 12px Proportional SC", "VT323", "Courier New", monospace;
```

示例站通过 Fontsource 本地加载 `Pixelify Sans` 和 `Fusion Pixel 12px Proportional SC`：

```bash
npm install --save-dev @fontsource/fusion-pixel-12px-proportional-sc
```

```ts
import '@fontsource/fusion-pixel-12px-proportional-sc/400.css';
```

当 `PixelValeProvider` 的 `locale="zh-CN"` 时，根节点会带上 `lang="zh-CN"`，中文界面会自动优先使用 Fusion Pixel：

```css
.pv-root[lang='zh-CN'] {
  --pv-font-pixel:
    'Fusion Pixel 12px Proportional SC', 'Pixelify Sans', 'VT323', monospace;
}
```

你也可以安装任意像素字体，并覆盖：

```css
.my-farm {
  --pv-font-pixel: 'Your Pixel Font', monospace;
}
```

字体未加载或某个汉字缺字时，会回退到 `PingFang SC / Microsoft YaHei / Noto Sans SC`，保持可读性。Fusion Pixel 由 [TakWolf](https://github.com/TakWolf/fusion-pixel-font) 制作，使用 OFL-1.1 许可；完整许可见 [`apps/playground/public/FUSION-PIXEL-OFL.txt`](apps/playground/public/FUSION-PIXEL-OFL.txt)，示例站未修改字体文件。

## 中文与 Locale

语言是 Provider 级别的配置，默认 `en`，不会改变组件 Props 或现有英文行为：

```tsx
<PixelValeProvider locale="zh-CN">
  <ToastProvider>
    <Button>种下一颗防风草</Button>
  </ToastProvider>
</PixelValeProvider>
```

可以在应用里读取当前语言，或按 key 覆盖个别内置文案：

```tsx
const { locale, t } = useLocale();

<PixelValeProvider
  locale={locale}
  messages={{
    closeDialog: '关上',
    notifications: '小通知',
  }}
/>;
```

- `locale`：`'en' | 'zh-CN'`
- `messages`：`Partial<Record<LocaleMessageKey, string>>`，只覆盖需要修改的 key
- `useLocale()`：返回 `{ locale, t }`，`t(key, params)` 支持 `{name}` / `{count}` 插值
- 已内置本地化的组件：Tabs、ProgressBar、CoinDisplay、Select、Dialog、Toast、Alert、NumberField、Steps、Avatar、Sparkline、Rating、Combobox、DropdownMenu、InventoryGrid
- 根节点同时输出 `lang` 与 `data-pv-locale`，方便 CSS、读屏和测试定位
- 业务文案仍由使用方提供；locale 只负责组件内置的可访问名称、占位符和状态文案

## 主题

```tsx
type PixelValeTheme = 'day' | 'night' | 'autumn';

<PixelValeProvider theme="night">…</PixelValeProvider>;
```

主题通过 `data-pv-theme` + CSS 变量切换，Portal 内的所有浮层都会共享同一套变量。自定义主题：

```css
.my-farm-theme {
  --pv-paper: #f7e7b9;
  --pv-paper-2: #eed7a0;
  --pv-wood-0: #392111;
  --pv-gold: #f4c95d;
  --pv-green: #78ab4f;
  --pv-app-bg: linear-gradient(#8ecbe7, #7fae58);
}
```

## 声音

`<PixelValeProvider>` 内置一个极小的 WebAudio 合成器：

```tsx
const { enabled, setEnabled, volume, setVolume, play } = useSound();

play('click'); // click | hover | open | close | toggle | success | error | coin
```

- AudioContext 懒创建，首次交互后才初始化
- 使用短包络和低增益，所有 oscillator 都会自动 stop
- 浏览器不支持或上下文被阻止时静默失败，不影响 UI
- 可通过 `defaultSoundEnabled={false}` 默认静音

## 组件一览

| 组件                         | 说明                                         |
| ---------------------------- | -------------------------------------------- |
| `PixelValeProvider`          | 主题、声音、语言、Portal 宿主                |
| `useLocale`                  | 读取当前语言与内置文案翻译函数               |
| `Button` / `IconButton`      | 5 种变体、3 种尺寸、loading、图标            |
| `Panel`                      | 木质标题栏、装饰铆钉、footer、语义标题层级   |
| `Tabs`                       | 受控/非受控、方向键/Home/End、禁用项         |
| `InventoryGrid`              | 背包网格、选中态、方向键、物品 Tooltip       |
| `ItemDetails`                | 物品名称、稀有度、描述、售价、数量           |
| `Dialog`                     | Portal、焦点陷阱、Escape、滚动锁、焦点归还   |
| `Tooltip`                    | Portal、焦点触发、边界翻转、aria-describedby |
| `Select`                     | 自定义 listbox、顶层级菜单、键盘导航、禁用项 |
| `ToastProvider` / `useToast` | 堆叠、自动关闭、退出动画、role=status        |
| `ProgressBar`                | 5 种变体、ARIA 进度语义                      |
| `CoinDisplay`                | 数字滚动动画、金币精灵                       |
| `TextField`                  | 标签、提示、错误态、前导图标                 |
| `Checkbox` / `Switch`        | 原生 input 语义，可键盘操作                  |
| `Slider`                     | 原生 range，跨浏览器像素轨道                 |
| `Badge` / `Divider`          | 状态标签与像素装饰分隔线                     |
| `Accordion`                  | 单开/多开折叠、方向键、折叠内容 inert        |
| `Alert`                      | 5 种变体、行动区、可关闭、role=alert/status  |
| `RadioGroup`                 | 原生 radio 语义、方向键、描述与错误提示      |
| `NumberField`                | 步进按钮、键入提交、blur 钳制、完整键盘操作  |
| `DropdownMenu`               | 动作菜单、Popover 顶层级、焦点移动与归还     |
| `EmptyState`                 | 像素插画、标题/描述、行动按钮                |
| `Drawer`                     | 左右侧滑抽屉，复用 Dialog 焦点陷阱与滚动锁   |
| `ToggleGroup`                | 单/多选按压组、方向键导航、禁用项            |
| `Steps`                      | 步骤进度、完成/当前状态、可选点击跳转        |
| `Stat`                       | 指标卡、6 种色调、图标/提示                  |
| `Skeleton`                   | 文本/块骨架屏、动画、reduced-motion 适配     |
| `Combobox`                   | 可搜索单选、过滤、键盘导航、顶层级列表       |
| `Rating`                     | 星级评分、radiogroup、方向键、只读/清除      |
| `Sparkline`                  | 像素折线/柱状迷你图、色调、无障碍摘要        |
| `Avatar`                     | 像素头像框、首字母回退、图片错误处理、状态点 |
| `PixelIcon`                  | 24×24 线性像素图标                           |
| `PixelSprite`                | 12×12 字符网格像素画                         |
| `usePixelVale`               | 读取当前主题与 Portal 宿主                   |

完整 Props 定义在 `packages/ui/dist/index.d.ts`，源码使用严格 TypeScript 与导出的类型。

### 组合示例

Toast 必须位于 `ToastProvider` 内：

```tsx
function SaveButton() {
  const { toast } = useToast();

  return (
    <Button
      onClick={() =>
        toast({
          variant: 'success',
          title: 'Day saved',
          description: 'The chickens have been accounted for.',
        })
      }
    >
      Save
    </Button>
  );
}
```

受控 Dialog 会处理 Portal、焦点陷阱与焦点归还：

```tsx
const [open, setOpen] = useState(false);

<Button onClick={() => setOpen(true)}>End the day</Button>
<Dialog
  open={open}
  onOpenChange={setOpen}
  title="End the day?"
  description="A fresh start is only a short nap away."
  footer={<Button onClick={() => setOpen(false)}>Sleep</Button>}
>
  <p>Rest well, farmer.</p>
</Dialog>;
```

背包使用可访问的 listbox 语义，方向键会自动移动选中项：

```tsx
import { InventoryGrid, type InventoryEntry } from '@pixelvale/ui';

const items: InventoryEntry[] = [
  {
    item: {
      id: 'parsnip',
      name: 'Parsnip',
      sprite: 'parsnip',
      category: 'Vegetable',
      sellPrice: 35,
      edible: true,
    },
    quantity: 12,
  },
];

<InventoryGrid
  items={items}
  columns={5}
  rows={3}
  showTooltips
  onSelectedChange={(id) => console.log(id)}
/>;
```

### 菜单、折叠与数量

```tsx
<DropdownMenu
  label="Farm actions"
  items={[
    { id: 'water', label: 'Water crops', shortcut: 'W' },
    { id: 'harvest', label: 'Harvest', shortcut: 'H' },
    { type: 'separator', id: 'sep' },
    { id: 'sleep', label: 'End the day' },
  ]}
  onSelect={(id) => console.log(id)}
/>

<Accordion
  defaultValue={['tips']}
  items={[
    { value: 'tips', title: 'A note', content: <p>Fold me open.</p> },
    { value: 'more', title: 'Another note', content: <p>Me too.</p> },
  ]}
/>

<RadioGroup
  label="Shipping method"
  defaultValue="bin"
  options={[
    { value: 'bin', label: 'Shipping bin' },
    { value: 'crate', label: 'Farm crate' },
  ]}
/>

<NumberField
  label="Seed quantity"
  defaultValue={12}
  min={1}
  max={99}
  unit="seeds"
/>
```

## 无障碍与交互细节

- 所有交互控件使用原生 `button` / `input`，或完整的 ARIA 语义
- Dialog 打开时锁定页面滚动、将背景设为 `inert`、`Tab` 循环、`Escape` 关闭、关闭后恢复焦点
- Tooltip 同时支持 hover 与 keyboard focus，并在视口边缘自动翻转
- Select 支持 `ArrowUp/Down`、`Home/End`、`Enter/Space`、`Escape`
- DropdownMenu 打开后聚焦第一项，方向键/Home/End 移动，Escape 关闭并归还焦点
- Drawer 复用 Dialog 的焦点陷阱、背景 inert、滚动锁和 Escape 归还焦点
- ToggleGroup 使用 roving tabindex，方向键移动焦点，Space/Enter 切换
- Steps 使用有序列表与 `aria-current="step"`，完成/当前状态可被辅助技术读取
- Combobox 使用 `role=combobox` + `aria-activedescendant`，支持过滤、方向键与 Escape
- Rating 使用 radiogroup 语义，方向键/Home/End 改变评分，只读时输出图像摘要
- Sparkline 以图像角色暴露点数与最后值摘要；Avatar 图片失败时回退到首字母
- NumberField 支持方向键步进、Shift+方向键跳 5、PageUp/Down 跳 10、Home/End 到边界
- Accordion 的每个标题都是按钮，方向键在标题间移动，折叠内容同时使用 `inert` 与 `aria-hidden`
- Tabs 使用 roving tabindex，左右方向键切换，自动跳过禁用项
- Inventory 是 listbox 语义，方向键在格子间移动，选中项可被 Tab 聚焦
- `prefers-reduced-motion` 时关闭动画并把数字滚动改为直接跳变
- 语言切换会同步更新根节点 `lang`，读屏会用对应语言朗读内置文案
- Sparkline / Rating 的图像摘要、Combobox 的选项提示、Toast 的区域名称都会随 locale 切换
- 所有图标按钮必须传入 `label`

## 安全说明

- 不使用 `dangerouslySetInnerHTML`、`eval` 或动态脚本
- 不请求任何外部资源；字体由使用方自行选择并本地打包
- 不写入 `localStorage` / cookie，不做埋点
- 音频节点有严格生命周期，音量与数值均做 clamp
- Portal 内容仍通过 React 渲染，转义由 React 负责
- 开发依赖 `npm audit --omit=dev` 为 0 漏洞（当前 lockfile 全量 audit 亦为 0）

## 自定义与扩展

- 组件全部使用 `pv-` 前缀，样式集中在 `src/styles.css`
- 主题只依赖 CSS 变量，可直接覆盖在 Provider 的 `className` 上
- `PixelSprite` 的图形是字符网格，新增精灵只需添加 12 行字符串与调色板
- 组件不依赖 Tailwind / CSS-in-JS / 状态管理库

## 已知边界

- 声音需要用户手势后才能启动，这是浏览器策略，不是缺陷
- 库样式为独立 CSS 文件，需要在应用入口手动 `import '@pixelvale/ui/style.css'`
- 中文像素字体不随库打包，使用 `zh-CN` 时请按上面的字体章节本地引入
- 仅组件内置文案会翻译；业务内容（商品名、任务标题等）仍由使用方维护
- Playground 中的背包、金币、任务状态仅存在内存中，刷新后会重置（刻意不写入存储）
- 没有包含 SSR 专用的水合处理；Portal 在无 `document` 环境不会渲染

## License

MIT © 2026 Pixelvale UI contributors

所有像素图形为原创，未使用或再分发 Stardew Valley 的任何素材。
