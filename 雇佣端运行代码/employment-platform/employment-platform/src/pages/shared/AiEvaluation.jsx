import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { findInstance } from '../../lib/prototype.js'
import { useApp } from '../../store.jsx'
import {
  Card,
  PageHero,
  Pill,
  PrimaryButton,
  SecondaryButton,
  StepCallout
} from '../../components/UI.jsx'

export default function AiEvaluation() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { instances, updateInstance } = useApp()
  const instance = findInstance(instances, id)

  useEffect(() => {
    if (!instance?.aiEvaluation || instance.aiEvaluation.runState !== 'running') return undefined

    const timer = window.setInterval(() => {
      updateInstance(id, (current) => {
        const evaluation = current.aiEvaluation
        if (!evaluation || evaluation.runState !== 'running') return current

        const nextProgress = Math.min(100, evaluation.progress + 14)
        const nextStageIndex = Math.min(
          evaluation.stages.length - 1,
          Math.floor((nextProgress / 100) * evaluation.stages.length)
        )
        const completed = nextProgress >= 100
        return {
          ...current,
          status: completed ? 'interning_ai' : current.status,
          recentActive: completed ? 'AI 评估完成' : 'AI 评估进行中',
          updatedAt: completed ? '刚刚' : current.updatedAt,
          aiEvaluation: {
            ...evaluation,
            progress: nextProgress,
            stageIndex: nextStageIndex,
            runState: completed ? 'completed' : evaluation.runState,
            conclusion: completed ? 'passed' : evaluation.conclusion,
            score: completed ? 84 : evaluation.score,
            eta: completed ? '已完成' : '约 1 分钟',
            cases: evaluation.cases.map((item, index) =>
              completed
                ? {
                    ...item,
                    state: item.state === 'queued' ? 'passed' : item.state,
                    score: item.score || 86
                  }
                : index <= nextStageIndex
                  ? { ...item, state: item.state === 'queued' ? 'warning' : item.state, score: item.score || 79 }
                  : item
            )
          },
          latestEvaluation: {
            aiScore: completed ? 84 : nextProgress,
            humanScore: null,
            highlight: completed ? 'AI 评估已通过，可进入人工评估。' : `AI 评估进行中，已完成 ${nextProgress}%。`
          }
        }
      })
    }, 700)

    return () => window.clearInterval(timer)
  }, [id, instance?.aiEvaluation, updateInstance])

  if (!instance || !instance.aiEvaluation) {
    return (
      <Card>
        <div className="text-center text-sm text-[#6f6f78]">当前实例没有 AI 评估数据。</div>
      </Card>
    )
  }

  const evaluation = instance.aiEvaluation
  const passed = evaluation.conclusion === 'passed'
  const failed = evaluation.conclusion === 'failed'

  function goHumanEvaluation() {
    updateInstance(instance.id, {
      status: 'interning_human',
      updatedAt: '刚刚',
      recentActive: '等待人工评估',
      latestEvaluation: {
        aiScore: evaluation.score,
        humanScore: null,
        highlight: 'AI 评估已通过，等待人工评估。'
      }
    })
    navigate(`/human-evaluation/${instance.id}`)
  }

  function goReview() {
    updateInstance(instance.id, {
      status: 'failed',
      updatedAt: '刚刚',
      recentActive: '等待 Review',
      latestEvaluation: {
        aiScore: evaluation.score,
        humanScore: null,
        highlight: 'AI 评估未通过，建议回退到知识生成或能力生成工位。'
      }
    })
    navigate(`/review/${instance.id}`)
  }

  return (
    <div className="space-y-4">
      <PageHero
        eyebrow="AI 评估页"
        title={`正在评估「${instance.displayName}」`}
        subtitle="AI 评估先做结构完整性、边界规则、资料质量和场景用例批跑。通过后才能进入人工评估，不会直接完成上岗决策。"
        actions={
          <>
            <SecondaryButton onClick={() => navigate(`/instances/${instance.id}`)}>返回详情</SecondaryButton>
            {passed && <PrimaryButton onClick={goHumanEvaluation}>进入人工评估</PrimaryButton>}
            {failed && <PrimaryButton onClick={goReview}>去 Review</PrimaryButton>}
          </>
        }
        stats={[
          { label: '当前进度', value: `${evaluation.progress}%`, hint: evaluation.eta },
          { label: '当前阶段', value: evaluation.stages[evaluation.stageIndex] },
          { label: '当前评分', value: evaluation.score, hint: '通过阈值建议 ≥ 75' }
        ]}
      />

      <div className="grid gap-4 xl:grid-cols-[1fr_0.95fr]">
        <Card className="space-y-5">
          <div className="text-base font-semibold text-[#0a0a0a]">标准检查区</div>
          <div className="space-y-3">
            {evaluation.checks.map((item) => (
              <div key={item.label} className="rounded-[22px] border border-[#ececec] bg-white p-4 shadow-[0_6px_18px_rgba(15,23,42,0.04)]">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-medium text-[#0a0a0a]">{item.label}</div>
                  <Pill tone={item.state === 'passed' ? 'emerald' : 'amber'}>
                    {item.state === 'passed' ? '已通过' : '重点关注'}
                  </Pill>
                </div>
                <div className="mt-2 text-sm leading-7 text-[#525252]">{item.detail}</div>
              </div>
            ))}
          </div>

          <div className="text-base font-semibold text-[#0a0a0a]">测试结果区</div>
          <div className="space-y-3">
            {evaluation.cases.map((item) => (
              <div key={item.id} className="rounded-[22px] bg-[#fafafa] px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-medium text-[#0a0a0a]">{item.name}</div>
                    <div className="mt-1 text-xs text-[#8b8b92]">{item.id}</div>
                  </div>
                  <Pill
                    tone={
                      item.state === 'passed'
                        ? 'emerald'
                        : item.state === 'failed'
                          ? 'rose'
                          : item.state === 'warning'
                            ? 'amber'
                            : 'slate'
                    }
                  >
                    {item.state === 'queued' ? '排队中' : `${item.score} 分`}
                  </Pill>
                </div>
                <div className="mt-2 text-sm leading-7 text-[#525252]">{item.note}</div>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="space-y-4">
            <div className="text-base font-semibold text-[#0a0a0a]">训练建议区</div>
            <div className="space-y-3">
              {evaluation.suggestions.map((item) => (
                <div key={item} className="rounded-[20px] border border-[#ececec] bg-white px-4 py-4 text-sm leading-7 text-[#525252]">
                  {item}
                </div>
              ))}
            </div>
          </Card>

          <Card className="space-y-4">
            <div className="text-base font-semibold text-[#0a0a0a]">结论区</div>
            {evaluation.runState === 'running' ? (
              <StepCallout
                title="AI 评估执行中"
                description="页面保留独立结构和稳定按钮位，方便后续研发直接接入真正的自动化评估服务。"
                tone="blue"
              />
            ) : passed ? (
              <StepCallout
                title="AI 评估通过"
                description="当前实例已满足进入人工评估的前置门槛。下一步由真实评估者按场景轮次完成最终上岗判断。"
                tone="emerald"
              />
            ) : (
              <StepCallout
                title="AI 评估未通过"
                description="当前实例需要进入 Review 决定回退工位。失败不会新增一级列表标签，而是通过详情页和 Review 页承接。"
                tone="rose"
              />
            )}

            {passed && <PrimaryButton className="w-full" onClick={goHumanEvaluation}>进入人工评估</PrimaryButton>}
            {failed && <PrimaryButton className="w-full" onClick={goReview}>去 Review</PrimaryButton>}
          </Card>
        </div>
      </div>
    </div>
  )
}
