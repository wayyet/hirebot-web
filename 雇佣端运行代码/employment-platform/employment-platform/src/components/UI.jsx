import { STATUS_META, TYPE_META } from '../mock/seed.js'

export function cx(...parts) {
  return parts.filter(Boolean).join(' ')
}

const TONE = {
  blue: 'bg-[#e8edff] text-[#3d5cff]',
  emerald: 'bg-[#e6f5ec] text-[#15803d]',
  amber: 'bg-[#fef1e3] text-[#c47a26]',
  rose: 'bg-[#fde2e8] text-[#be185d]',
  purple: 'bg-[#ece8ff] text-[#6a5acd]',
  slate: 'bg-[#efefef] text-[#525252]'
}

const AVATAR_TONE = {
  blue: 'bg-[#dde9ff] text-[#3d5cff]',
  emerald: 'bg-[#dcf2e3] text-[#0e8e4e]',
  amber: 'bg-[#fef0d8] text-[#c47a26]',
  rose: 'bg-[#fde2e2] text-[#be3a4a]',
  purple: 'bg-[#e6e2fa] text-[#6a5acd]',
  slate: 'bg-[#ececec] text-[#666666]'
}

export function Card({ children, className = '' }) {
  return (
    <section
      className={cx(
        'rounded-[28px] border border-white/80 bg-white/92 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-sm',
        className
      )}
    >
      {children}
    </section>
  )
}

export function PageHero({ eyebrow, title, subtitle, actions, stats }) {
  return (
    <Card className="relative overflow-hidden">
      <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[#e1e9fa] blur-3xl" />
      <div className="pointer-events-none absolute -left-12 bottom-0 h-36 w-36 rounded-full bg-[#fff0e0] blur-3xl" />
      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          {eyebrow && (
            <div className="mb-3 inline-flex rounded-full border border-[#ececec] bg-white px-3 py-1 text-xs font-medium text-[#525252]">
              {eyebrow}
            </div>
          )}
          <h1 className="text-[30px] font-semibold tracking-[-0.02em] text-[#0a0a0a] sm:text-[38px]">
            {title}
          </h1>
          {subtitle && <p className="mt-3 max-w-2xl text-sm leading-7 text-[#5f5f66] sm:text-[15px]">{subtitle}</p>}
        </div>
        {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
      </div>
      {stats && (
        <div className="relative mt-7 grid gap-4 md:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-[22px] border border-[#ececec] bg-white/90 px-5 py-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]"
            >
              <div className="text-xs text-[#80808a]">{stat.label}</div>
              <div className="mt-2 text-2xl font-semibold text-[#0a0a0a] tabular-nums">{stat.value}</div>
              {stat.hint && <div className="mt-1 text-xs text-[#666]">{stat.hint}</div>}
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

export function PageSection({ title, hint, action, children, className = '' }) {
  return (
    <Card className={className}>
      <div className="mb-5 flex flex-col gap-3 border-b border-[#f1f1f1] pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[#0a0a0a]">{title}</h2>
          {hint && <p className="mt-1 text-sm text-[#6f6f78]">{hint}</p>}
        </div>
        {action}
      </div>
      {children}
    </Card>
  )
}

export function SquircleAvatar({ initial, tone = 'blue', size = 'md' }) {
  const sizeMap = {
    sm: 'h-9 w-9 text-xs rounded-[12px]',
    md: 'h-12 w-12 text-sm rounded-[14px]',
    lg: 'h-16 w-16 text-base rounded-[18px]',
    xl: 'h-20 w-20 text-xl rounded-[22px]'
  }

  return (
    <div
      className={cx(
        'flex shrink-0 items-center justify-center font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]',
        AVATAR_TONE[tone] || AVATAR_TONE.blue,
        sizeMap[size]
      )}
    >
      {initial}
    </div>
  )
}

export function Pill({ children, tone = 'slate' }) {
  return (
    <span className={cx('inline-flex rounded-full px-3 py-1 text-xs font-medium', TONE[tone] || TONE.slate)}>
      {children}
    </span>
  )
}

export function StatusPill({ status }) {
  const meta = STATUS_META[status] || STATUS_META.hired
  return <Pill tone={meta.tone}>{meta.label}</Pill>
}

export function TypePill({ type }) {
  const meta = TYPE_META[type] || TYPE_META.department
  return <Pill tone={meta.tone}>{meta.label}</Pill>
}

export function PrimaryButton({ className = '', ...props }) {
  return (
    <button
      {...props}
      className={cx(
        'rounded-full bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#161616] hover:shadow-[0_6px_18px_rgba(0,0,0,0.12)] disabled:cursor-not-allowed disabled:bg-[#d4d4d8] disabled:text-white/80',
        className
      )}
    />
  )
}

export function SecondaryButton({ className = '', ...props }) {
  return (
    <button
      {...props}
      className={cx(
        'rounded-full border border-[#e5e5e5] bg-white px-5 py-2.5 text-sm font-medium text-[#0a0a0a] transition hover:border-[#d4d4d8] hover:bg-[#fafafa] disabled:cursor-not-allowed disabled:text-[#b0b0b5]',
        className
      )}
    />
  )
}

export function QuietButton({ className = '', ...props }) {
  return (
    <button
      {...props}
      className={cx('text-sm font-medium text-[#525252] transition hover:text-[#0a0a0a]', className)}
    />
  )
}

export function MetricStrip({ items }) {
  return (
    <div className="grid gap-3 rounded-[22px] border border-[#ececec] bg-white/88 p-3 md:grid-cols-4">
      {items.map((item, index) => (
        <div
          key={item.label}
          className={cx(
            'rounded-[18px] px-4 py-3',
            index % 2 === 0 ? 'bg-[#fafafa]' : 'bg-[#fffdf8]'
          )}
        >
          <div className="text-xs text-[#8b8b92]">{item.label}</div>
          <div className="mt-2 text-xl font-semibold text-[#0a0a0a] tabular-nums">{item.value}</div>
          {item.hint && <div className="mt-1 text-xs text-[#666]">{item.hint}</div>}
        </div>
      ))}
    </div>
  )
}

export function SearchInput({ value, onChange, placeholder }) {
  return (
    <label className="flex items-center gap-3 rounded-full border border-[#e5e5e5] bg-white px-4 py-3 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
      <span className="text-sm text-[#9ca3af]">⌕</span>
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-transparent text-sm text-[#0a0a0a] outline-none placeholder:text-[#9ca3af]"
      />
    </label>
  )
}

export function FilterTabs({ items, current, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => {
        const active = current === item.value
        return (
          <button
            key={item.value}
            onClick={() => onChange(item.value)}
            className={cx(
              'rounded-full px-4 py-2 text-sm transition',
              active
                ? 'bg-black text-white shadow-[0_6px_18px_rgba(0,0,0,0.12)]'
                : 'border border-[#e5e5e5] bg-white text-[#525252] hover:border-[#d4d4d8] hover:text-[#0a0a0a]'
            )}
          >
            {item.label}
          </button>
        )
      })}
    </div>
  )
}

export function EmptyState({ title, description, action }) {
  return (
    <div className="rounded-[24px] border border-dashed border-[#d9d9de] bg-white/70 px-6 py-12 text-center">
      <div className="text-sm font-medium text-[#0a0a0a]">{title}</div>
      {description && <div className="mt-2 text-sm text-[#6f6f78]">{description}</div>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function ProgressSteps({ steps, currentIndex, confirmed }) {
  return (
    <div className="overflow-hidden rounded-[24px] border border-[#ececec] bg-white">
      <div className="grid gap-0 md:grid-cols-6">
        {steps.map((step, index) => {
          const active = index === currentIndex
          const done = confirmed[index]
          return (
            <div key={step.key} className="relative border-b border-[#f5f5f5] px-4 py-4 md:border-b-0 md:border-r last:border-r-0">
              <div className="flex items-center gap-3">
                <div
                  className={cx(
                    'flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold',
                    done
                      ? 'bg-[#0a0a0a] text-white'
                      : active
                        ? 'bg-[#4a6cf7] text-white'
                        : 'bg-[#efefef] text-[#80808a]'
                  )}
                >
                  {done ? '✓' : index + 1}
                </div>
                <div>
                  <div className={cx('text-sm font-medium', active || done ? 'text-[#0a0a0a]' : 'text-[#80808a]')}>
                    {step.title}
                  </div>
                  <div className="text-xs text-[#8b8b92]">{done ? '已确认' : active ? '进行中' : '待处理'}</div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function StepCallout({ title, description, tone = 'blue' }) {
  const styles = {
    blue: 'border-[#d7e2ff] bg-[#f7f9ff] text-[#2447b8]',
    amber: 'border-[#fde5bf] bg-[#fff8ef] text-[#9a6420]',
    rose: 'border-[#f9d5de] bg-[#fff6f8] text-[#a42a57]',
    emerald: 'border-[#d3efde] bg-[#f5fcf7] text-[#0f7c43]'
  }
  return (
    <div className={cx('rounded-[20px] border px-4 py-4 text-sm', styles[tone] || styles.blue)}>
      <div className="font-medium">{title}</div>
      <div className="mt-2 leading-6">{description}</div>
    </div>
  )
}

export function DetailList({ items }) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.label} className="flex items-start justify-between gap-6 rounded-[18px] bg-[#fafafa] px-4 py-3">
          <div className="text-sm text-[#80808a]">{item.label}</div>
          <div className="text-right text-sm font-medium leading-6 text-[#0a0a0a]">{item.value}</div>
        </div>
      ))}
    </div>
  )
}

export function ConversationBubble({ role, text }) {
  const left = role === 'coach' || role === 'bot' || role === 'system'
  const bubbleTone =
    role === 'system'
      ? 'bg-[#f8fafc] border border-[#e5eef8] text-[#425466]'
      : role === 'coach' || role === 'bot'
        ? 'bg-white border border-[#ececec] text-[#0a0a0a]'
        : 'bg-[#eef2ff] text-[#233ab0]'
  return (
    <div className={cx('flex gap-3', left ? '' : 'justify-end')}>
      {left && <SquircleAvatar initial={role === 'coach' ? '教练' : role === 'bot' ? '机' : '系统'} tone={role === 'system' ? 'slate' : 'blue'} size="sm" />}
      <div className={cx('max-w-[88%] rounded-[22px] px-4 py-3 text-sm leading-7 shadow-[0_6px_18px_rgba(15,23,42,0.04)]', bubbleTone)}>
        {text}
      </div>
      {!left && <SquircleAvatar initial="我" tone="emerald" size="sm" />}
    </div>
  )
}

export function FeishuGuideModal({ instance, onClose }) {
  if (!instance) return null
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/35 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-[32px] bg-[#fffdf8] p-6 shadow-[0_24px_80px_rgba(15,23,42,0.22)]">
        <div className="mb-6 flex items-start justify-between gap-6">
          <div>
            <div className="inline-flex rounded-full border border-[#ececec] bg-white px-3 py-1 text-xs text-[#666]">
              去飞书使用
            </div>
            <h3 className="mt-3 text-2xl font-semibold text-[#0a0a0a]">{instance.feishu.displayName}</h3>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-[#6f6f78]">
              Web 端只负责雇佣、评估和配置。正式使用发生在飞书一对一私聊里，这里展示的是上岗前后的使用引导和调试预览。
            </p>
          </div>
          <SecondaryButton onClick={onClose}>关闭</SecondaryButton>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="bg-white">
            <div className="mb-5 flex items-center gap-4">
              <SquircleAvatar initial={instance.feishu.avatarInitial} tone={instance.avatarTone} size="xl" />
              <div>
                <div className="text-xl font-semibold text-[#0a0a0a]">{instance.feishu.displayName}</div>
                <div className="mt-1 text-sm text-[#666]">{instance.feishu.description}</div>
                <div className="mt-2 text-xs text-[#8b8b92]">{instance.feishu.handle}</div>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {[
                { label: '联系人状态', value: instance.feishu.botStatus },
                { label: '正式入口', value: '飞书一对一私聊' },
                { label: 'Web 端定位', value: '配置 / 管理 / 调试预览' }
              ].map((item) => (
                <div key={item.label} className="rounded-[18px] bg-[#fafafa] px-4 py-3">
                  <div className="text-xs text-[#8b8b92]">{item.label}</div>
                  <div className="mt-2 text-sm font-medium text-[#0a0a0a]">{item.value}</div>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-[22px] border border-[#d1fae5] bg-[#ecfdf5] px-5 py-4 text-sm leading-7 text-[#157347]">
              <div className="font-medium">使用提醒</div>
              <div className="mt-2">
                1. 在飞书搜索联系人或从工作群的机器人目录进入。
                <br />
                2. 首次私聊建议先发一个真实任务，而不是“你好”。
                <br />
                3. 如果遇到异常，请回到 Web 端看运行状态和历史评估，而不是在这里继续调配置。
              </div>
            </div>
          </Card>

          <Card className="bg-white">
            <div className="mb-4 text-base font-semibold text-[#0a0a0a]">调试预览</div>
            <div className="rounded-[28px] border border-[#ececec] bg-[#fafafa] p-4">
              <div className="mb-3 text-xs text-[#8b8b92]">历史会话 / 调试预览，不作为正式主入口</div>
              <div className="space-y-3">
                {(instance.debugPreview || []).length === 0 ? (
                  <div className="rounded-[18px] bg-white px-4 py-6 text-center text-sm text-[#80808a]">
                    当前没有可展示的调试消息。正式使用请前往飞书一对一私聊。
                  </div>
                ) : (
                  instance.debugPreview.map((message, index) => (
                    <ConversationBubble
                      key={`${message.role}-${index}`}
                      role={message.role === 'user' ? 'user' : 'bot'}
                      text={message.text}
                    />
                  ))
                )}
              </div>
            </div>
            <div className="mt-4 text-xs leading-6 text-[#8b8b92]">
              权限边界：只有 owner 才能看到自己的调试预览；部门长查看团队内部门员工时只展示元数据和状态，不展示下属私聊内容。
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
