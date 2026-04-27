import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { canAccessInstance, findInstance } from '../../lib/prototype.js'
import { useApp } from '../../store.jsx'
import {
  Card,
  PageHero,
  Pill,
  PrimaryButton,
  ProgressSteps,
  SecondaryButton,
  SquircleAvatar
} from '../../components/UI.jsx'

const CLONE_STEPS = [
  { key: 'confirm', title: '确认复制' },
  { key: 'identity', title: '配置个人对外身份' },
  { key: 'launch', title: '绑定并上岗' }
]

export default function CloneFlow() {
  const { instanceId } = useParams()
  const navigate = useNavigate()
  const { user, instances, createPersonalClone, showToast } = useApp()
  const source = findInstance(instances, instanceId)
  const [stepIndex, setStepIndex] = useState(0)
  const [launching, setLaunching] = useState(false)
  const [result, setResult] = useState(null)
  const [form, setForm] = useState({
    displayName: source ? `我的${source.displayName}` : '',
    avatarInitial: source?.avatarInitial || '我的',
    description: source?.summary || ''
  })

  if (!source || !canAccessInstance(user, source) || source.instanceType !== 'department' || source.status !== 'live') {
    return (
      <Card>
        <div className="text-center text-sm text-[#6f6f78]">当前部门员工不可复制，可能已经下线或你没有权限。</div>
      </Card>
    )
  }

  function launchClone() {
    if (!form.displayName.trim()) {
      showToast('显示名必填')
      return
    }
    setLaunching(true)
    setStepIndex(2)
    window.setTimeout(() => {
      const clone = createPersonalClone({
        sourceInstanceId: source.id,
        displayName: form.displayName.trim(),
        avatarInitial: form.avatarInitial.trim() || '分身',
        description: form.description.trim() || `来自 ${source.displayName} 的个人分身`
      })
      setResult(clone)
      setLaunching(false)
    }, 1800)
  }

  return (
    <div className="space-y-4">
      <PageHero
        eyebrow="分身复制向导"
        title={`复制「${source.displayName}」为我的分身`}
        subtitle="复制链路被压缩成三步，不进入雇佣教练对话，也不进入双阶段评估。你只需要确认复制、配置身份，然后直接绑定上岗。"
        actions={<SecondaryButton onClick={() => navigate(-1)}>返回上一页</SecondaryButton>}
        stats={[
          { label: '复制来源', value: source.displayName, hint: '当前是 live 部门员工' },
          { label: '当前步骤', value: `${Math.min(stepIndex + 1, 3)} / 3`, hint: CLONE_STEPS[stepIndex]?.title || '已完成' },
          { label: '上线边界', value: '不走双阶段评估', hint: '沿用母版已通过的评估结果' }
        ]}
      />

      <ProgressSteps
        steps={CLONE_STEPS.map((item) => ({ ...item, short: item.title }))}
        currentIndex={stepIndex}
        confirmed={CLONE_STEPS.map((_, index) => index < stepIndex || Boolean(result))}
      />

      {stepIndex === 0 && (
        <Card className="space-y-5">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
            <div className="flex items-center gap-4">
              <SquircleAvatar initial={source.avatarInitial} tone={source.avatarTone} size="xl" />
              <div>
                <div className="text-xl font-semibold text-[#0a0a0a]">{source.displayName}</div>
                <div className="mt-2 text-sm leading-7 text-[#525252]">{source.summary}</div>
              </div>
            </div>
            <div className="grid flex-1 gap-3 md:grid-cols-3">
              {[
                { label: '最近活跃', value: source.recentActive },
                { label: '能力标签', value: source.abilityTags.slice(0, 3).join(' / ') },
                { label: '当前状态', value: '已上岗' }
              ].map((item) => (
                <div key={item.label} className="rounded-[20px] bg-[#fafafa] px-4 py-4">
                  <div className="text-xs text-[#8b8b92]">{item.label}</div>
                  <div className="mt-2 text-sm font-medium text-[#0a0a0a]">{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[24px] border border-[#d1fae5] bg-[#ecfdf5] px-5 py-5 text-sm leading-7 text-[#157347]">
            <div className="font-medium">复制后独立</div>
            <div className="mt-2">
              你的分身会继承母版的能力和评估结果，但对外身份、后续私人定制和退役操作都由你自己独立管理，不影响部门版继续被其他同事复制。
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <SecondaryButton onClick={() => navigate(-1)}>取消</SecondaryButton>
            <PrimaryButton onClick={() => setStepIndex(1)}>确认复制</PrimaryButton>
          </div>
        </Card>
      )}

      {stepIndex === 1 && (
        <div className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
          <Card className="space-y-4">
            <div className="text-lg font-semibold text-[#0a0a0a]">配置个人对外身份</div>
            <div className="space-y-4">
              <div>
                <div className="mb-2 text-sm font-medium text-[#0a0a0a]">显示名</div>
                <input
                  value={form.displayName}
                  onChange={(event) => setForm((current) => ({ ...current, displayName: event.target.value }))}
                  className="w-full rounded-[18px] border border-[#e5e5e5] bg-white px-4 py-3 text-sm outline-none focus:border-[#4a6cf7] focus:ring-4 focus:ring-[#dde5ff]"
                />
                <div className="mt-2 text-xs text-[#8b8b92]">同一 owner 下需保持名称唯一，修改身份不会触发重新评估。</div>
              </div>

              <div>
                <div className="mb-2 text-sm font-medium text-[#0a0a0a]">头像缩写</div>
                <input
                  value={form.avatarInitial}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, avatarInitial: event.target.value.slice(0, 4) }))
                  }
                  className="w-full rounded-[18px] border border-[#e5e5e5] bg-white px-4 py-3 text-sm outline-none focus:border-[#4a6cf7] focus:ring-4 focus:ring-[#dde5ff]"
                />
              </div>

              <div>
                <div className="mb-2 text-sm font-medium text-[#0a0a0a]">对外描述</div>
                <textarea
                  value={form.description}
                  onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                  rows={4}
                  className="w-full rounded-[18px] border border-[#e5e5e5] bg-white px-4 py-3 text-sm leading-7 outline-none focus:border-[#4a6cf7] focus:ring-4 focus:ring-[#dde5ff]"
                />
              </div>
            </div>

            <div className="flex justify-between gap-3">
              <SecondaryButton onClick={() => setStepIndex(0)}>返回</SecondaryButton>
              <PrimaryButton onClick={launchClone}>绑定并上岗</PrimaryButton>
            </div>
          </Card>

          <Card className="space-y-4">
            <div className="text-lg font-semibold text-[#0a0a0a]">飞书联系人预览</div>
            <div className="rounded-[28px] border border-[#ececec] bg-[#fafafa] p-5">
              <div className="rounded-[24px] border border-[#ececec] bg-white p-5 text-center shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
                <SquircleAvatar initial={form.avatarInitial || '分身'} tone={source.avatarTone} size="xl" />
                <div className="mt-4 text-lg font-semibold text-[#0a0a0a]">{form.displayName || '未命名分身'}</div>
                <div className="mt-2 text-sm text-[#6f6f78]">仅 {user.name} 可见的个人数字员工</div>
                <div className="mt-4 rounded-[20px] bg-[#fafafa] px-4 py-4 text-sm leading-7 text-[#525252]">
                  {form.description || '还没有填写对外描述。'}
                </div>
                <div className="mt-4 flex justify-center">
                  <Pill tone="emerald">完成复制后即出现在飞书联系人里</Pill>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {stepIndex === 2 && (
        <Card className="space-y-5 text-center">
          {!result && launching && (
            <>
              <div className="text-2xl font-semibold text-[#0a0a0a]">正在为你绑定并上岗</div>
              <div className="mx-auto max-w-xl text-sm leading-7 text-[#6f6f78]">
                1. 创建 personal clone 快照
                <br />
                2. 写入个人飞书身份
                <br />
                3. 启动运行时并把状态切到 live
              </div>
            </>
          )}

          {result && (
            <>
              <div className="text-2xl font-semibold text-[#0a0a0a]">分身已就绪</div>
              <div className="mx-auto max-w-xl text-sm leading-7 text-[#6f6f78]">
                你的个人分身已经完成绑定，可从“我的数字员工”继续管理，也可以直接进入详情页查看飞书使用指引。
              </div>
              <div className="mx-auto max-w-2xl rounded-[24px] border border-[#ececec] bg-[#fafafa] p-5">
                <div className="grid gap-3 md:grid-cols-3">
                  {[
                    { label: '分身名称', value: result.displayName },
                    { label: '飞书 handle', value: result.feishu.handle },
                    { label: '可见范围', value: `${user.name} 私有` }
                  ].map((item) => (
                    <div key={item.label} className="rounded-[18px] bg-white px-4 py-4">
                      <div className="text-xs text-[#8b8b92]">{item.label}</div>
                      <div className="mt-2 text-sm font-medium text-[#0a0a0a]">{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-center gap-3">
                <SecondaryButton onClick={() => navigate('/staff/mine')}>返回我的数字员工</SecondaryButton>
                <PrimaryButton onClick={() => navigate(`/instances/${result.id}`)}>查看分身详情</PrimaryButton>
              </div>
            </>
          )}
        </Card>
      )}
    </div>
  )
}
