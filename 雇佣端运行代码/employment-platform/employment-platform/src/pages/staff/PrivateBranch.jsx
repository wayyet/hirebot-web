import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { BRANCH_WORKSTATIONS } from '../../mock/seed.js'
import { canAccessInstance, findInstance } from '../../lib/prototype.js'
import { useApp } from '../../store.jsx'
import {
  Card,
  ConversationBubble,
  PageHero,
  Pill,
  PrimaryButton,
  SecondaryButton,
  SquircleAvatar
} from '../../components/UI.jsx'

export default function PrivateBranch() {
  const { instanceId } = useParams()
  const navigate = useNavigate()
  const { user, instances, updateInstance, showToast } = useApp()
  const draft = findInstance(instances, instanceId)
  const source = draft?.sourceInstanceId ? findInstance(instances, draft.sourceInstanceId) : null
  const [input, setInput] = useState('')

  if (
    !draft ||
    draft.instanceType !== 'private_branch' ||
    !canAccessInstance(user, draft) ||
    !source
  ) {
    return (
      <Card>
        <div className="text-center text-sm text-[#6f6f78]">当前私人定制草稿不存在，或者你没有访问权限。</div>
      </Card>
    )
  }

  const plan = draft.branchPlan

  function patchPlan(updater) {
    updateInstance(draft.id, (instance) => ({
      ...instance,
      branchPlan: updater(instance.branchPlan)
    }))
  }

  function toggleWorkstation(key) {
    patchPlan((current) => {
      const exists = current.workstations.includes(key)
      return {
        ...current,
        workstations: exists
          ? current.workstations.filter((item) => item !== key)
          : [...current.workstations, key]
      }
    })
  }

  function sendCoachMessage() {
    if (!input.trim()) return
    patchPlan((current) => ({
      ...current,
      messages: [
        ...current.messages,
        { role: 'user', text: input.trim() },
        {
          role: 'coach',
          text:
            '我会只围绕你选中的工位继续追问，未改动部分全部继承原分身。接下来可以直接进入 AI 评估验证。'
        }
      ]
    }))
    setInput('')
  }

  function startEvaluation() {
    if (!plan.goal.trim()) {
      showToast('请先明确你想改什么')
      return
    }
    if (plan.workstations.length === 0) {
      showToast('至少选择一个要重做的工位')
      return
    }
    updateInstance(draft.id, {
      status: 'interning_ai',
      updatedAt: '刚刚',
      recentActive: '进入 AI 评估',
      latestEvaluation: {
        aiScore: 72,
        humanScore: null,
        highlight: '已带着选中的工位进入 AI 评估。'
      }
    })
    navigate(`/ai-evaluation/${draft.id}`)
  }

  return (
    <div className="space-y-4">
      <PageHero
        eyebrow="私人定制"
        title={`为「${source.displayName}」创建私人定制`}
        subtitle="只重做你真的想改的部分，其他能力、知识和飞书联系人都继续沿用原分身。评估通过后不会新增联系人，而是切换到底层路由。"
        actions={
          <>
            <SecondaryButton onClick={() => navigate('/staff/mine')}>返回我的数字员工</SecondaryButton>
            <PrimaryButton onClick={startEvaluation}>进入 AI 评估</PrimaryButton>
          </>
        }
        stats={[
          { label: '上游分身', value: source.displayName },
          { label: '当前选中工位', value: plan.workstations.length, hint: '支持多选，但不建议贪多' },
          { label: '路由策略', value: '复用原 bot 联系人', hint: '通过后切换底层逻辑' }
        ]}
      />

      <div className="grid gap-4 xl:grid-cols-[1fr_0.95fr]">
        <Card className="space-y-5">
          <div className="flex items-start gap-4 rounded-[24px] bg-[#fafafa] p-5">
            <SquircleAvatar initial={source.avatarInitial} tone={source.avatarTone} size="xl" />
            <div>
              <div className="text-lg font-semibold text-[#0a0a0a]">{source.displayName}</div>
              <div className="mt-2 text-sm leading-7 text-[#525252]">{source.summary}</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {source.abilityTags.map((tag) => (
                  <Pill key={tag} tone={source.avatarTone}>
                    {tag}
                  </Pill>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="text-sm font-semibold text-[#0a0a0a]">差异目标</div>
            <textarea
              value={plan.goal}
              onChange={(event) =>
                patchPlan((current) => ({
                  ...current,
                  goal: event.target.value
                }))
              }
              rows={5}
              className="mt-3 w-full rounded-[18px] border border-[#e5e5e5] bg-white px-4 py-3 text-sm leading-7 outline-none focus:border-[#4a6cf7] focus:ring-4 focus:ring-[#dde5ff]"
              placeholder="例如：语气更简洁；加入我自己的 VIP 名单处理策略；保留原本赔付边界但少一点客套话。"
            />
          </div>

          <div>
            <div className="text-sm font-semibold text-[#0a0a0a]">工位选择</div>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {BRANCH_WORKSTATIONS.map((item) => {
                const active = plan.workstations.includes(item.key)
                return (
                  <button
                    key={item.key}
                    onClick={() => toggleWorkstation(item.key)}
                    className={`rounded-[22px] border px-4 py-4 text-left transition ${
                      active
                        ? 'border-black bg-black text-white shadow-[0_8px_24px_rgba(0,0,0,0.12)]'
                        : 'border-[#ececec] bg-white hover:border-[#d4d4d8] hover:bg-[#fafafa]'
                    }`}
                  >
                    <div className="text-sm font-medium">{item.label}</div>
                    <div className={`mt-2 text-xs leading-6 ${active ? 'text-white/78' : 'text-[#8b8b92]'}`}>
                      {item.hint}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="rounded-[24px] border border-[#ececec] bg-[#fafafa] p-4">
            <div className="text-sm font-semibold text-[#0a0a0a]">简化版训练区</div>
            <div className="mt-3 space-y-3">
              {plan.messages.map((message, index) => (
                <ConversationBubble key={`${message.role}-${index}`} role={message.role} text={message.text} />
              ))}
            </div>
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              rows={3}
              className="mt-4 w-full rounded-[18px] border border-[#e5e5e5] bg-white px-4 py-3 text-sm leading-7 outline-none focus:border-[#4a6cf7] focus:ring-4 focus:ring-[#dde5ff]"
              placeholder="补充你真正想改的差异点，例如：对 VIP 客户先给动作，再补解释。"
            />
            <div className="mt-3 flex justify-end">
              <PrimaryButton onClick={sendCoachMessage}>补充给教练</PrimaryButton>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="space-y-4">
            <div className="text-base font-semibold text-[#0a0a0a]">继承说明</div>
            <div className="space-y-3">
              {plan.inheritance.map((item) => (
                <div key={item} className="rounded-[20px] border border-[#ececec] bg-white px-4 py-4 text-sm leading-7 text-[#525252]">
                  {item}
                </div>
              ))}
            </div>
          </Card>

          <Card className="space-y-4">
            <div className="text-base font-semibold text-[#0a0a0a]">当前改动摘要</div>
            <div className="grid gap-3">
              {BRANCH_WORKSTATIONS.map((item) => (
                <div key={item.key} className="rounded-[20px] bg-[#fafafa] px-4 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-medium text-[#0a0a0a]">{item.label}</div>
                    <Pill tone={plan.workstations.includes(item.key) ? 'purple' : 'slate'}>
                      {plan.workstations.includes(item.key) ? '将重做' : '直接继承'}
                    </Pill>
                  </div>
                  <div className="mt-2 text-sm leading-7 text-[#6f6f78]">
                    {plan.notes[item.key] || '本工位当前没有额外补充说明。'}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="space-y-4">
            <div className="text-base font-semibold text-[#0a0a0a]">评估与切换区</div>
            <div className="rounded-[24px] border border-[#d1fae5] bg-[#ecfdf5] px-5 py-5 text-sm leading-7 text-[#157347]">
              私有分支必须经过 AI 评估和人工评估后，才会把原分身的 bot 路由切换到新版本。失败可以放弃，不影响原分身继续使用。
            </div>
            <PrimaryButton className="w-full" onClick={startEvaluation}>
              进入 AI 评估
            </PrimaryButton>
          </Card>
        </div>
      </div>
    </div>
  )
}
