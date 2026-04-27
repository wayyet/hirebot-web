import { useNavigate, useParams } from 'react-router-dom'
import { HIRE_STEPS } from '../../mock/seed.js'
import { findInstance } from '../../lib/prototype.js'
import { useApp } from '../../store.jsx'
import { Card, PageHero, PrimaryButton, SecondaryButton, StepCallout } from '../../components/UI.jsx'

const ROLLBACK_HINTS = {
  scene: '重新梳理目标场景、用户和任务边界。',
  gap: '补齐知识缺口、能力缺口和禁做事项。',
  persona: '调整角色定位、语气和不可越界事项。',
  knowledge: '补充资料、FAQ、规则文档和解析结果。',
  ability: '重新定义可做 / 不可做动作和边界判断。',
  integration: '补外部系统、认证信息和连通性测试结论。'
}

export default function ReviewCenter() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, instances, updateInstance, retireInstance, showToast } = useApp()
  const instance = findInstance(instances, id)

  if (!instance) {
    return (
      <Card>
        <div className="text-center text-sm text-[#6f6f78]">当前实例不存在，无法进入 Review。</div>
      </Card>
    )
  }

  function rollbackTo(stepIndex) {
    if (instance.instanceType === 'department') {
      updateInstance(instance.id, (current) => ({
        ...current,
        status: 'hired',
        updatedAt: '刚刚',
        recentActive: `回退到${HIRE_STEPS[stepIndex].title}`,
        workflow: {
          ...(current.workflow || {}),
          stepIndex
        }
      }))
      navigate(`/hire/${instance.id}`)
      return
    }

    updateInstance(instance.id, {
      status: 'hired',
      updatedAt: '刚刚',
      recentActive: `回退到${HIRE_STEPS[stepIndex].title}`
    })
    navigate(`/branch/${instance.id}`)
  }

  function abandonBranch() {
    if (!window.confirm('确定放弃这个私人定制分支吗？不会影响原分身继续可用。')) return
    retireInstance(instance.id)
    showToast('已放弃当前私人定制')
    navigate(user.role === 'lead' ? '/lead/mine' : '/staff/mine')
  }

  return (
    <div className="space-y-4">
      <PageHero
        eyebrow="Review 页"
        title={`为「${instance.displayName}」决定回退位置`}
        subtitle="评估失败后不会出现“跳过评估”的出口。你只能选择回退到合适工位继续处理，或者在私人定制场景下直接放弃当前分支。"
        actions={<SecondaryButton onClick={() => navigate(`/instances/${instance.id}`)}>返回详情</SecondaryButton>}
        stats={[
          { label: '失败对象', value: instance.displayName },
          { label: '失败原因', value: instance.lastError || '评估边界未达标' },
          { label: '推荐动作', value: '回退工位', hint: instance.instanceType === 'private_branch' ? '可放弃当前分支' : '部门版不支持放弃主流程' }
        ]}
      />

      <div className="grid gap-4 xl:grid-cols-[1fr_0.95fr]">
        <Card className="space-y-4">
          <div className="text-base font-semibold text-[#0a0a0a]">失败摘要区</div>
          <StepCallout
            title="低分维度"
            description={instance.latestEvaluation?.highlight || '当前失败集中在边界判断、知识完备度和高风险场景稳定性。'}
            tone="rose"
          />

          <div className="text-base font-semibold text-[#0a0a0a]">回退入口区</div>
          <div className="grid gap-3 md:grid-cols-2">
            {HIRE_STEPS.map((step, index) => (
              <button
                key={step.key}
                onClick={() => rollbackTo(index)}
                className={`rounded-[24px] border px-4 py-4 text-left transition ${
                  step.key === 'knowledge' || step.key === 'gap'
                    ? 'border-[#fde5bf] bg-[#fff8ef] hover:border-[#f7c873]'
                    : 'border-[#ececec] bg-white hover:border-[#d4d4d8] hover:bg-[#fafafa]'
                }`}
              >
                <div className="text-sm font-medium text-[#0a0a0a]">{step.title}</div>
                <div className="mt-2 text-sm leading-7 text-[#6f6f78]">{ROLLBACK_HINTS[step.key]}</div>
              </button>
            ))}
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="space-y-4">
            <div className="text-base font-semibold text-[#0a0a0a]">保留说明区</div>
            <div className="rounded-[24px] border border-[#d1fae5] bg-[#ecfdf5] px-5 py-5 text-sm leading-7 text-[#157347]">
              已上传原料会被保留，回退后系统会从你选中的工位开始重算后续产物，不需要重新从零上传资料。
            </div>
          </Card>

          <Card className="space-y-4">
            <div className="text-base font-semibold text-[#0a0a0a]">风险提示区</div>
            <div className="rounded-[24px] border border-[#ececec] bg-[#fafafa] px-5 py-5 text-sm leading-7 text-[#525252]">
              如果连续失败多次，系统建议回到“场景匹配”重新梳理目标任务，避免在后续工位里只做局部修补。
            </div>
          </Card>

          {instance.instanceType === 'private_branch' ? (
            <Card className="space-y-4">
              <div className="text-base font-semibold text-[#0a0a0a]">放弃区</div>
              <SecondaryButton className="w-full" onClick={abandonBranch}>
                放弃私人定制
              </SecondaryButton>
            </Card>
          ) : (
            <Card className="space-y-4">
              <div className="text-base font-semibold text-[#0a0a0a]">部门版说明</div>
              <div className="rounded-[24px] border border-[#ececec] bg-white px-5 py-5 text-sm leading-7 text-[#525252]">
                部门版不提供“放弃本次雇佣”的主出口，避免正在推进的部门资产突然失联。可以暂存、回退，但不能直接弃置主流程。
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
