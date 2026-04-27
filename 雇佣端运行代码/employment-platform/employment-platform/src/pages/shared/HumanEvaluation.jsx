import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { findInstance } from '../../lib/prototype.js'
import { useApp } from '../../store.jsx'
import { Card, PageHero, Pill, PrimaryButton, SecondaryButton, StepCallout } from '../../components/UI.jsx'

export default function HumanEvaluation() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { instances, updateInstance, completePrivateBranchLaunch, showToast } = useApp()
  const instance = findInstance(instances, id)
  const tasks = instance?.humanEvaluation?.tasks || []
  const [selectedId, setSelectedId] = useState(tasks[0]?.id)
  const [switching, setSwitching] = useState(false)

  const selectedTask = useMemo(
    () => tasks.find((task) => task.id === selectedId) || tasks[0],
    [selectedId, tasks]
  )

  if (!instance || !instance.humanEvaluation) {
    return (
      <Card>
        <div className="text-center text-sm text-[#6f6f78]">当前实例没有人工评估数据。</div>
      </Card>
    )
  }

  function patchTask(taskId, judge) {
    updateInstance(instance.id, (current) => ({
      ...current,
      humanEvaluation: {
        ...current.humanEvaluation,
        tasks: current.humanEvaluation.tasks.map((task) =>
          task.id === taskId ? { ...task, judge } : task
        )
      }
    }))
  }

  const judgedCount = tasks.filter((task) => task.judge !== 'pending').length
  const failCount = tasks.filter((task) => task.judge === 'fail').length

  function passEvaluation(force = false) {
    if (!force && judgedCount < 2) {
      showToast('至少完成 2 个场景判断后再提交')
      return
    }
    if (instance.instanceType === 'private_branch') {
      setSwitching(true)
      window.setTimeout(() => {
        completePrivateBranchLaunch(instance.id)
        setSwitching(false)
        navigate(`/instances/${instance.id}`)
      }, 1600)
      return
    }
    updateInstance(instance.id, {
      status: 'interning_human',
      updatedAt: '刚刚',
      recentActive: '人工评估通过，等待飞书配置',
      latestEvaluation: {
        aiScore: instance.aiEvaluation?.score || 84,
        humanScore: 4.7,
        highlight: force ? '强制上岗已确认，等待飞书配置。' : '人工评估通过，可进入飞书身份配置。'
      }
    })
    navigate(`/identity/${instance.id}`)
  }

  function failEvaluation() {
    updateInstance(instance.id, {
      status: 'failed',
      updatedAt: '刚刚',
      recentActive: '等待 Review',
      latestEvaluation: {
        aiScore: instance.aiEvaluation?.score || 68,
        humanScore: 3.4,
        highlight: '人工评估未通过，建议回到相应工位继续雇佣。'
      }
    })
    navigate(`/review/${instance.id}`)
  }

  return (
    <div className="space-y-4">
      <PageHero
        eyebrow="人工评估页"
        title={`人工评估「${instance.displayName}」`}
        subtitle="这一步评的是目标数字员工本身，而不是继续和 AI 评估专家对话。评估者需要按场景轮次完成判断，再决定上岗、回退或强制上岗。"
        actions={
          <>
            <SecondaryButton onClick={() => navigate(`/instances/${instance.id}`)}>返回详情</SecondaryButton>
            <PrimaryButton onClick={() => passEvaluation(false)}>
              {instance.instanceType === 'private_branch' ? '通过并切换路由' : '通过并进入飞书配置'}
            </PrimaryButton>
          </>
        }
        stats={[
          { label: '已判断场景', value: `${judgedCount} / ${tasks.length}` },
          { label: '风险场景', value: failCount, hint: '存在 fail 时建议回 Review' },
          { label: '当前对象', value: instance.instanceType === 'private_branch' ? '私人定制 owner 自评' : '部门长人工评估' }
        ]}
      />

      {switching && (
        <Card>
          <StepCallout
            title="正在切换原 bot 路由"
            description="私有分支通过后不会新增飞书联系人，而是把原分身的底层消息路由切到新版本。"
            tone="emerald"
          />
        </Card>
      )}

      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr_0.85fr]">
        <Card className="space-y-4">
          <div className="text-base font-semibold text-[#0a0a0a]">场景任务区</div>
          <div className="space-y-3">
            {tasks.map((task) => (
              <button
                key={task.id}
                onClick={() => setSelectedId(task.id)}
                className={`w-full rounded-[22px] border px-4 py-4 text-left transition ${
                  selectedTask?.id === task.id
                    ? 'border-black bg-black text-white shadow-[0_10px_26px_rgba(0,0,0,0.12)]'
                    : 'border-[#ececec] bg-white hover:border-[#d4d4d8] hover:bg-[#fafafa]'
                }`}
              >
                <div className="text-sm font-medium">{task.title}</div>
                <div className={`mt-2 text-xs leading-6 ${selectedTask?.id === task.id ? 'text-white/78' : 'text-[#8b8b92]'}`}>
                  {task.objective}
                </div>
                <div className="mt-3">
                  <Pill
                    tone={
                      task.judge === 'pass'
                        ? 'emerald'
                        : task.judge === 'fail'
                          ? 'rose'
                          : task.judge === 'risk'
                            ? 'amber'
                            : 'slate'
                    }
                  >
                    {task.judge === 'pending' ? '待判断' : task.judge === 'pass' ? '通过' : task.judge === 'fail' ? '不通过' : '有风险'}
                  </Pill>
                </div>
              </button>
            ))}
          </div>
        </Card>

        <Card className="space-y-4">
          <div className="text-base font-semibold text-[#0a0a0a]">会话预览区</div>
          <div className="space-y-3">
            {selectedTask?.transcript.map((item, index) => (
              <div key={`${item.role}-${index}`} className="rounded-[20px] bg-[#fafafa] px-4 py-4 text-sm leading-7 text-[#525252]">
                <div className="mb-1 text-xs text-[#8b8b92]">
                  {item.role === 'user' ? '场景输入' : item.role === 'bot' ? '数字员工回复' : '系统调用'}
                </div>
                {item.text}
              </div>
            ))}
          </div>

          <div className="rounded-[24px] border border-[#ececec] bg-white p-5">
            <div className="text-sm font-semibold text-[#0a0a0a]">工具调用摘要</div>
            <div className="mt-3 space-y-3">
              {selectedTask?.toolLog.map((item) => (
                <div key={item} className="rounded-[18px] bg-[#f7f9ff] px-4 py-3 text-sm text-[#425466]">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card className="space-y-4">
          <div className="text-base font-semibold text-[#0a0a0a]">综合报告区</div>
          <StepCallout
            title="场景判断"
            description="每个场景都应该被明确标记为通过 / 有风险 / 不通过。若仍有高风险或未评估场景，强制上岗必须走二次确认。"
            tone="amber"
          />
          <div className="flex flex-wrap gap-2">
            <SecondaryButton onClick={() => patchTask(selectedTask.id, 'pass')}>当前场景通过</SecondaryButton>
            <SecondaryButton onClick={() => patchTask(selectedTask.id, 'risk')}>当前场景有风险</SecondaryButton>
            <SecondaryButton onClick={() => patchTask(selectedTask.id, 'fail')}>当前场景不通过</SecondaryButton>
          </div>

          <div className="rounded-[24px] border border-[#ececec] bg-[#fafafa] p-5 text-sm leading-7 text-[#525252]">
            已判断 {judgedCount} 个场景，其中 {failCount} 个明确不通过。
            {failCount > 0 ? ' 建议先去 Review 选择回退工位。' : ' 若关键场景都达标，可以进入下一步。'}
          </div>

          <div className="space-y-3">
            <PrimaryButton className="w-full" onClick={() => passEvaluation(false)}>
              {instance.instanceType === 'private_branch' ? '通过并切换路由' : '通过并进入飞书配置'}
            </PrimaryButton>
            <SecondaryButton className="w-full" onClick={failEvaluation}>
              修改配置后重评 / 去 Review
            </SecondaryButton>
            <SecondaryButton
              className="w-full"
              onClick={() => {
                if (window.confirm('仍存在未评估或高风险场景，确认强制上岗吗？')) {
                  passEvaluation(true)
                }
              }}
            >
              强制上岗
            </SecondaryButton>
          </div>
        </Card>
      </div>
    </div>
  )
}
