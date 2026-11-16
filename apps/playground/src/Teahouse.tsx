import { useState } from 'react';
import {
  Alert,
  Avatar,
  Badge,
  Button,
  CoinDisplay,
  Divider,
  NumberField,
  Panel,
  PixelIcon,
  ProgressBar,
  Rating,
  Select,
  Stat,
  Steps,
  ToggleGroup,
  useToast,
} from '@pixelvale/ui';

const TEA_STEPS = [
  { value: 'pick', label: '采茶', description: '露水未干' },
  { value: 'roast', label: '焙火', description: '文火慢烘' },
  { value: 'brew', label: '沏茶', description: '八十五度' },
] as const;

const TEA_MENU = [
  {
    name: '雨前龙井',
    note: '豆香清扬，回甘很快。',
    price: 68,
    icon: 'leaf',
    tone: 'green',
  },
  {
    name: '桂花乌龙',
    note: '焙火之后，落一层秋桂。',
    price: 82,
    icon: 'sparkle',
    tone: 'gold',
  },
  {
    name: '陈皮普洱',
    note: '陈香厚实，适合雨天。',
    price: 96,
    icon: 'moon',
    tone: 'rust',
  },
] as const;

const SEATS = [
  { value: 'window', label: '靠窗', description: '能看见院子里的柿子树。' },
  { value: 'porch', label: '廊下', description: '听得见雨，也吹得到风。' },
  { value: 'hearth', label: '灶边', description: '暖和一些，离茶壶最近。' },
];

export function Teahouse() {
  const [step, setStep] = useState('roast');
  const [guests, setGuests] = useState(2);
  const [seat, setSeat] = useState('window');
  const [snacks, setSnacks] = useState<string[]>(['osmanthus']);
  const [teaRating, setTeaRating] = useState(5);
  const { toast } = useToast();

  const currentStep =
    TEA_STEPS.find((teaStep) => teaStep.value === step)?.label ?? '焙火';
  const currentSeat = SEATS.find((option) => option.value === seat)?.label ?? '靠窗';

  const reserve = () => {
    toast({
      variant: 'gold',
      title: '已为你留座',
      description: `${currentSeat} · ${guests} 位 · ${snacks.length} 样茶点。`,
    });
  };

  return (
    <section
      id="teahouse"
      className="demo-section demo-teahouse"
      aria-labelledby="teahouse-title"
      lang="zh-CN"
    >
      <div className="demo-section__head">
        <p className="demo-kicker">一隅茶香 · 中文界面</p>
        <h2 id="teahouse-title">农舍茶馆</h2>
        <p>
          中文不是英文的翻译补丁：内置读屏文案会随语言切换，数字使用本地格式，
          汉字使用像素字体。点右上角的语言按钮，就能对比两套界面。
        </p>
      </div>

      <div className="demo-teahouse__grid">
        <Panel
          headingLevel={3}
          className="shelf-panel"
          title="今日茶单"
          subtitle="三款时令茶，配一碟桂花糕。"
          icon={<PixelIcon name="leaf" size={18} />}
          actions={<Badge variant="success">春茶</Badge>}
        >
          <div className="demo-stack">
            <ul className="tea-list" aria-label="今日茶单">
              {TEA_MENU.map((tea) => (
                <li className="tea-item" data-tone={tea.tone} key={tea.name}>
                  <span className="tea-item__icon" aria-hidden="true">
                    <PixelIcon name={tea.icon} size={19} />
                  </span>
                  <span className="tea-item__text">
                    <span className="tea-item__name">{tea.name}</span>
                    <span className="tea-item__note">{tea.note}</span>
                  </span>
                  <span className="tea-item__price">
                    {tea.price}
                    <span className="tea-item__unit">文</span>
                  </span>
                </li>
              ))}
            </ul>

            <Divider label="茶点偏好" />

            <ToggleGroup
              label="茶点偏好"
              multiple
              fullWidth
              value={snacks}
              onValueChange={setSnacks}
              items={[
                {
                  value: 'osmanthus',
                  label: '桂花糕',
                  icon: <PixelIcon name="sparkle" size={14} />,
                },
                {
                  value: 'chestnut',
                  label: '烤栗子',
                  icon: <PixelIcon name="sun" size={14} />,
                },
                {
                  value: 'orange',
                  label: '陈皮糖',
                  icon: <PixelIcon name="heart" size={14} />,
                },
              ]}
            />

            <div className="tea-form">
              <NumberField
                label="客人"
                min={1}
                max={8}
                value={guests}
                onValueChange={setGuests}
                hint="最多八位。"
              />
              <Select label="座位" value={seat} options={SEATS} onValueChange={setSeat} />
            </div>

            <div className="rating-demo">
              <Rating
                label="今日茶香"
                value={teaRating}
                onValueChange={setTeaRating}
                allowClear
                showValue
              />
              <span className="demo-inline-hint">点星星评分，再点一次可清空。</span>
            </div>

            <div className="demo-row demo-row--center">
              <Button
                variant="primary"
                leftIcon={<PixelIcon name="clock" size={15} />}
                onClick={reserve}
              >
                预订一席
              </Button>
              <span className="demo-inline-hint">
                {currentSeat} · {guests} 位
              </span>
            </div>
          </div>
        </Panel>

        <div className="demo-teahouse__side">
          <Panel
            headingLevel={3}
            className="shelf-panel"
            title="冲泡进度"
            subtitle="三沸三沏，急不得。"
            icon={<PixelIcon name="clock" size={18} />}
            footer={
              <div className="tea-total">
                <span>今日茶资</span>
                <CoinDisplay value={216} size="md" />
              </div>
            }
          >
            <div className="demo-stack">
              <Steps
                steps={TEA_STEPS}
                current={step}
                onStepClick={setStep}
                label="冲泡步骤"
              />
              <p className="tea-stage">
                当前：<strong>{currentStep}</strong>
              </p>
              <ProgressBar label="水温" value={85} max={100} variant="energy" showValue />
              <ProgressBar
                label="茶汤浓度"
                value={62}
                max={100}
                variant="gold"
                showValue
              />
              <p className="tea-tip">
                <PixelIcon name="info" size={15} />
                第一泡十五秒出汤，第二泡二十秒。水不要滚，壶要温。
              </p>
            </div>
          </Panel>

          <Panel
            headingLevel={3}
            className="shelf-panel"
            title="茶客留言"
            subtitle="来自山那边的字条。"
            icon={<PixelIcon name="heart" size={18} />}
          >
            <div className="demo-stack">
              <div className="tea-review">
                <Avatar name="林晚照" size="md" status="online" />
                <div className="tea-review__body">
                  <div className="tea-review__head">
                    <span>林晚照</span>
                    <Badge variant="success">老茶客</Badge>
                  </div>
                  <Rating
                    value={5}
                    readOnly
                    size="sm"
                    showValue
                    aria-label="林晚照的评分：5/5 星"
                  />
                  <p>窗边的光落在茶汤上，像一小块琥珀。桂花糕要趁热。</p>
                </div>
              </div>

              <div className="tea-stats">
                <Stat
                  label="今日茶位"
                  value="3 / 6"
                  hint="廊下还剩两席"
                  icon={<PixelIcon name="sun" size={16} />}
                  tone="warning"
                />
                <Stat
                  label="茶龄"
                  value="7 年"
                  hint="从第一场春雨开始"
                  icon={<PixelIcon name="leaf" size={16} />}
                  tone="success"
                />
              </div>

              <Alert variant="info" title="今日小贴士">
                雨天路滑，廊下备了蓑衣。走的时候记得带一把新焙的茶叶。
              </Alert>
            </div>
          </Panel>
        </div>
      </div>
    </section>
  );
}
