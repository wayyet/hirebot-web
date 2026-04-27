import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { HIRE_STEPS, createAiEvaluation } from '../../mock/seed.js'
import { findInstance, findTemplate } from '../../lib/prototype.js'
import { useApp } from '../../store.jsx'
import {
  Card,
  ConversationBubble,
  PageHero,
  Pill,
  PrimaryButton,
  ProgressSteps,
  QuietButton,
  SecondaryButton,
  StepCallout
} from '../../components/UI.jsx'

function summaryForStep(stepKey, notes) {
  return notes[stepKey] || '等待确认'
}

export default function HireWizard() {
  const { draftId } = useParams()
  const navigate = useNavigate()
  const { instances, templates, updateInstance, showToast } = useApp()
  const draft = findInstance(instances, draftId)
  const template = draft ? findTemplate(templates, draft.templateId) : null
  const [input, setInput] = useState('')

  const workflow = draft?.workflow
  const currentStepIndex = workflow?.stepIndex || 0
  const currentStep = HIRE_STEPS[currentStepIndex]
  const currentMessages = workflow?.messagesByStep?.[currentStepIndex] || []

  const stepSummaryCards = useMemo(
    () =>
      HIRE_STEPS.map((step, index) => ({
        title: step.summaryTitle,
        value: summaryForStep(step.key, workflow?.notes || {}),
        confirmed: workflow?.confirmedSteps?.[index]
      })),
    [workflow]
  )

  if (!draft || draft.instanceType !== 'department') {
    return (
      <Card>
        <div className="text-center text-sm text-[#6f6f78]">当前雇佣草稿不存在。</div>
      </Card>
    )
  }

  function patchWorkflow(updater) {
    updateInstance(draft.id, (instance) => ({
      ...instance,
      workflow: updater(instance.workflow)
    }))
  }

  function saveCurrentNote(nextValue) {
    patchWorkflow((current) => ({
      ...current,
      notes: {
        ...current.notes,
        [currentStep.key]: nextValue
      }
    }))
  }

  function sendMessage() {
    if (!input.trim()) return
    const reply = HIRE_STEPS[currentStepIndex].coachReply
    patchWorkflow((current) => ({
      ...current,
      messagesByStep: current.messagesByStep.map((messages, index) =>
        index === currentStepIndex
          ? [...messages, { role: 'user', text: input.trim() }, { role: 'coach', text: reply }]
          : messages
      )
    }))
    setInput('')
  }

  function confirmStep() {
    patchWorkflow((current) => ({
      ...current,
      confirmedSteps: current.confirmedSteps.map((flag, index) => (index === currentStepIndex ? true : flag))
    }))
    showToast(`已确认「${currentStep.title}」结果`)
  }

  function previousStep() {
    if (currentStepIndex === 0) return
    patchWorkflow((current) => ({
      ...current,
      stepIndex: current.stepIndex - 1
    }))
  }

  function nextStep() {
    if (!workflow.confirmedSteps[currentStepIndex]) {
      showToast('请先确认当前步骤结果，再进入下一步')
      return
    }
    if (currentStepIndex === HIRE_STEPS.length - 1) {
      updateInstance(draft.id, (instance) => ({
        ...instance,
        status: 'interning_ai',
        currentStep: HIRE_STEPS.length - 1,
        updatedAt: '刚刚',
        recentActive: '进入 AI 评估',
        latestEvaluation: {
          aiScore: 72,
          humanScore: null,
          highlight: '六步确认完成，已汇总为完整实例配置。'
        },
        aiEvaluation: createAiEvaluation('running'),
        workflow: {
          ...instance.workflow,
          stepIndex: currentStepIndex
        }
      }))
      navigate(`/ai-evaluation/${draft.id}`)
      return
    }

    patchWorkflow((current) => ({
      ...current,
      stepIndex: current.stepIndex + 1
    }))
  }

  function saveAndExit() {
    updateInstance(draft.id, {
      status: 'hired',
      currentStep: currentStepIndex,
      updatedAt: '刚刚',
      recentActive: '草稿已保存'
    })
    showToast('草稿已保存，可从“部门数字员工 > 已雇佣”继续处理')
    navigate('/lead/department')
  }

  return (
    <div className="space-y-4">
      <PageHero
        eyebrow="部门版雇佣页"
        title={`为 ${draft.departmentName} 雇佣「${template?.name || draft.displayName}」`}
        subtitle="六步流程会逐步沉淀场景、差距、人设、知识、能力和外部对接。每一步都必须确认中间产物，避免最后一次性生成。"
        actions={
          <>
            <SecondaryButton onClick={saveAndExit}>保存退出</SecondaryButton>
            <PrimaryButton onClick={nextStep}>
              {currentStepIndex === HIRE_STEPS.length - 1 ? '完成六步确认并进入 AI 评估' : `继续到「${HIRE_STEPS[currentStepIndex + 1].title}」`}
            </PrimaryButton>
          </>
        }
        stats={[
          { label: '当前草稿', value: draft.displayName },
          { label: '当前步骤', value: `${currentStepIndex + 1} / ${HIRE_STEPS.length}`, hint: currentStep.title },
          { label: '测试用例沉淀', value: workflow.testCases.length, hint: '后续会直接进入评估' }
        ]}
      />

      <ProgressSteps
        steps={HIRE_STEPS}
        currentIndex={currentStepIndex}
        confirmed={workflow.confirmedSteps}
      />

      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="space-y-5">
          <div className="flex items-start justify-between gap-4 border-b border-[#f2f2f2] pb-4">
            <div>
              <div className="text-lg font-semibold text-[#0a0a0a]">{currentStep.title}</div>
              <div className="mt-2 text-sm leading-7 text-[#6f6f78]">{currentStep.intro}</div>
            </div>
            <Pill tone="blue">{workflow.confirmedSteps[currentStepIndex] ? '已确认' : '待确认'}</Pill>
          </div>

          <div className="space-y-3">
            {currentMessages.map((message, index) => (
              <ConversationBubble key={`${message.role}-${index}`} role={message.role} text={message.text} />
            ))}
          </div>

          <div className="rounded-[24px] border border-[#ececec] bg-[#fafafa] p-4">
            <div className="text-sm font-medium text-[#0a0a0a]">当前步骤记录</div>
            <textarea
              value={workflow.notes[currentStep.key]}
              onChange={(event) => saveCurrentNote(event.target.value)}
              rows={6}
              className="mt-3 w-full rounded-[18px] border border-[#e5e5e5] bg-white px-4 py-3 text-sm leading-7 text-[#0a0a0a] outline-none focus:border-[#4a6cf7] focus:ring-4 focus:ring-[#dde5ff]"
              placeholder={currentStep.placeholder}
            />
          </div>

          <div className="rounded-[24px] border border-[#ececec] bg-white p-4">
            <div className="text-sm font-medium text-[#0a0a0a]">继续和雇佣教练补细节</div>
            <div className="mt-3 flex flex-col gap-3">
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                rows={3}
                className="w-full rounded-[18px] border border-[#e5e5e5] bg-white px-4 py-3 text-sm leading-7 text-[#0a0a0a] outline-none focus:border-[#4a6cf7] focus:ring-4 focus:ring-[#dde5ff]"
                placeholder={currentStep.placeholder}
              />
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-[#8b8b92]">
                  用户不直接操作 manifest / ontology / skill 等技术对象，系统会自动翻译为业务语言。
                </div>
                <PrimaryButton onClick={sendMessage}>发送给雇佣教练</PrimaryButton>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <QuietButton onClick={previousStep} className={currentStepIndex === 0 ? 'pointer-events-none opacity-40' : ''}>
              返回上一步
            </QuietButton>
            <div className="flex flex-wrap gap-3">
              <SecondaryButton onClick={confirmStep}>确认当前结果</SecondaryButton>
              <PrimaryButton onClick={nextStep}>
                {currentStepIndex === HIRE_STEPS.length - 1 ? '进入 AI 评估' : '下一步'}
              </PrimaryButton>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="space-y-4">
            <div className="text-base font-semibold text-[#0a0a0a]">右侧产物区</div>
            <div className="grid gap-3">
              {stepSummaryCards.map((item) => (
                <div
                  key={item.title}
                  className="rounded-[20px] border border-[#ececec] bg-[#fafafa] px-4 py-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-medium text-[#0a0a0a]">{item.title}</div>
                    <Pill tone={item.confirmed ? 'emerald' : 'slate'}>{item.confirmed ? '已确认' : '待确认'}</Pill>
                  </div>
                  <div className="mt-3 text-sm leading-7 text-[#525252]">{item.value}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="space-y-4">
            <div className="text-base font-semibold text-[#0a0a0a]">附件与解析状态</div>
            <div className="space-y-3">
              {workflow.attachments.map((attachment) => (
                <div key={attachment.name} className="rounded-[20px] bg-white px-4 py-4 shadow-[0_6px_18px_rgba(15,23,42,0.04)]">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-medium text-[#0a0a0a]">{attachment.name}</div>
                    <Pill tone={attachment.status === 'parsed' ? 'emerald' : 'amber'}>
                      {attachment.status === 'parsed' ? '已解析' : '待补充'}
                    </Pill>
                  </div>
                  <div className="mt-2 text-sm leading-7 text-[#6f6f78]">{attachment.insight}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="space-y-4">
            <div className="text-base font-semibold text-[#0a0a0a]">测试用例沉淀区</div>
            <div className="space-y-3">
              {workflow.testCases.map((item) => (
                <div key={item} className="rounded-[18px] bg-[#fffdf8] px-4 py-3 text-sm leading-7 text-[#525252]">
                  {item}
                </div>
              ))}
            </div>
            <StepCallout
              title="为什么这里要提前沉淀真实任务"
              description="这些任务会直接进入 AI 评估与人工评估，不需要等到全部流程结束后再重新回忆。"
              tone="amber"
            />
          </Card>
        </div>
      </div>
    </div>
  )
}
