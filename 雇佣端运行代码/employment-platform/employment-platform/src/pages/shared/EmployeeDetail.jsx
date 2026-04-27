import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  canAccessInstance,
  canCreateBranch,
  findInstance,
  findTemplate,
  getLineage,
  isOwner,
  leadCanCloneForSelf,
  roleHome,
  staffCanClone
} from '../../lib/prototype.js'
import { useApp } from '../../store.jsx'
import {
  Card,
  DetailList,
  FeishuGuideModal,
  PageHero,
  Pill,
  PrimaryButton,
  SecondaryButton,
  SquircleAvatar,
  StatusPill,
  TypePill
} from '../../components/UI.jsx'

export default function EmployeeDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const {
    user,
    instances,
    templates,
    createDepartmentDraft,
    createPrivateBranchDraft,
    retireInstance,
    showToast
  } = useApp()
  const instance = findInstance(instances, id)
  const template = instance ? findTemplate(templates, instance.templateId) : null
  const [guideOpen, setGuideOpen] = useState(false)

  const lineage = useMemo(
    () => (instance ? getLineage(instance, instances, templates) : []),
    [instance, instances, templates]
  )

  if (!instance || !canAccessInstance(user, instance)) {
    return (
      <Card>
        <div className="text-center text-sm text-[#6f6f78]">当前实例不存在，或者你没有查看这个实例的权限。</div>
      </Card>
    )
  }

  const owner = isOwner(user, instance)

  function rehire() {
    const draftId = createDepartmentDraft({
      templateId: instance.templateId,
      sourceInstanceId: instance.id
    })
    if (draftId) navigate(`/hire/${draftId}`)
  }

  function createBranch() {
    const draftId = createPrivateBranchDraft(instance.id)
    if (draftId) navigate(`/branch/${draftId}`)
  }

  function handleRetire() {
    const label = instance.instanceType === 'private_branch' ? '放弃私人定制' : '退役'
    if (!window.confirm(`确定要${label}「${instance.displayName}」吗？`)) return
    retireInstance(instance.id)
    showToast(`${label}已完成`)
    navigate(roleHome(user.role))
  }

  function renderActions() {
    if (instance.status === 'hired' && instance.instanceType === 'department') {
      return <PrimaryButton onClick={() => navigate(`/hire/${instance.id}`)}>继续雇佣</PrimaryButton>
    }

    if (instance.status === 'interning_ai') {
      return <PrimaryButton onClick={() => navigate(`/ai-evaluation/${instance.id}`)}>查看 AI 评估</PrimaryButton>
    }

    if (instance.status === 'interning_human') {
      return <PrimaryButton onClick={() => navigate(`/human-evaluation/${instance.id}`)}>查看人工评估</PrimaryButton>
    }

    if (instance.status === 'failed') {
      return (
        <div className="flex flex-wrap gap-3">
          <PrimaryButton onClick={() => navigate(`/review/${instance.id}`)}>查看评估报告</PrimaryButton>
          <SecondaryButton onClick={() => navigate(`/review/${instance.id}`)}>继续雇佣</SecondaryButton>
        </div>
      )
    }

    if (instance.status === 'retired') {
      return (
        <div className="flex flex-wrap gap-3">
          {instance.instanceType === 'department' ? (
            <PrimaryButton onClick={rehire}>重新雇佣</PrimaryButton>
          ) : instance.sourceInstanceId ? (
            <PrimaryButton onClick={() => navigate(`/instances/${instance.sourceInstanceId}`)}>查看历史来源</PrimaryButton>
          ) : null}
        </div>
      )
    }

    if (instance.instanceType === 'department' && instance.status === 'live') {
      if (staffCanClone(user, instance)) {
        return <PrimaryButton onClick={() => navigate(`/clone/${instance.id}`)}>创建分身</PrimaryButton>
      }
      if (leadCanCloneForSelf(user, instance)) {
        return (
          <div className="flex flex-wrap gap-3">
            <PrimaryButton onClick={rehire}>重新雇佣</PrimaryButton>
            <SecondaryButton onClick={() => navigate(`/clone/${instance.id}`)}>复制一个给自己</SecondaryButton>
          </div>
        )
      }
    }

    if (instance.instanceType === 'personal_clone' && instance.status === 'live') {
      return (
        <div className="flex flex-wrap gap-3">
          <PrimaryButton onClick={() => setGuideOpen(true)}>去飞书使用</PrimaryButton>
          {canCreateBranch(user, instance) && <SecondaryButton onClick={createBranch}>创建私人定制</SecondaryButton>}
          <SecondaryButton onClick={handleRetire}>退役</SecondaryButton>
        </div>
      )
    }

    if (instance.instanceType === 'private_branch' && instance.status === 'live') {
      return (
        <div className="flex flex-wrap gap-3">
          <PrimaryButton onClick={() => setGuideOpen(true)}>去飞书使用</PrimaryButton>
          <SecondaryButton onClick={handleRetire}>退役</SecondaryButton>
        </div>
      )
    }

    return null
  }

  return (
    <div className="space-y-4">
      <PageHero
        eyebrow="数字员工详情"
        title={instance.displayName}
        subtitle={instance.summary}
        actions={
          <>
            <SecondaryButton onClick={() => navigate(-1)}>返回上一页</SecondaryButton>
            {renderActions()}
          </>
        }
        stats={[
          { label: '实例类型', value: instance.instanceType === 'department' ? '部门员工' : instance.instanceType === 'personal_clone' ? '我的分身' : '私人定制' },
          { label: '当前状态', value: instance.status === 'live' ? '已上岗' : instance.status === 'failed' ? '评估未通过' : instance.status },
          { label: 'owner', value: instance.ownerName, hint: instance.instanceType === 'department' ? '负责配置与管理' : '仅 owner 可见和操作' }
        ]}
      />

      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="space-y-6">
          <div className="flex items-start gap-4">
            <SquircleAvatar initial={instance.avatarInitial} tone={instance.avatarTone} size="xl" />
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <TypePill type={instance.instanceType} />
                <StatusPill status={instance.status} />
                {template && <Pill tone={template.tone}>{template.name}</Pill>}
              </div>
              <div className="mt-3 text-sm leading-7 text-[#525252]">{instance.summary}</div>
              <div className="mt-4 flex flex-wrap gap-2">
                {instance.abilityTags.map((tag) => (
                  <Pill key={tag} tone={instance.avatarTone}>
                    {tag}
                  </Pill>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="text-base font-semibold text-[#0a0a0a]">来源关系</div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              {lineage.map((item, index) => (
                <div key={`${item.kind}-${item.id}`} className="flex items-center gap-3">
                  <div className="rounded-full border border-[#ececec] bg-white px-4 py-2 text-sm text-[#0a0a0a] shadow-[0_4px_12px_rgba(15,23,42,0.04)]">
                    {item.label}
                  </div>
                  {index < lineage.length - 1 && <span className="text-[#9ca3af]">→</span>}
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="text-base font-semibold text-[#0a0a0a]">运行状态</div>
            <div className="mt-4">
              <DetailList
                items={[
                  { label: '最近活跃时间', value: instance.recentActive },
                  { label: '累计任务数', value: `${instance.taskCount}` },
                  { label: '最近错误', value: instance.lastError },
                  { label: '最近一次评估', value: instance.latestEvaluation?.highlight || '暂无' }
                ]}
              />
            </div>
          </div>

          <div>
            <div className="text-base font-semibold text-[#0a0a0a]">飞书身份区</div>
            <div className="mt-4 rounded-[24px] border border-[#ececec] bg-[#fafafa] p-5">
              <div className="flex items-center gap-4">
                <SquircleAvatar initial={instance.feishu.avatarInitial} tone={instance.avatarTone} size="lg" />
                <div>
                  <div className="text-lg font-semibold text-[#0a0a0a]">{instance.feishu.displayName}</div>
                  <div className="mt-1 text-sm text-[#6f6f78]">{instance.feishu.description}</div>
                  <div className="mt-2 text-xs text-[#8b8b92]">
                    {instance.feishu.handle} · {instance.feishu.botStatus}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="space-y-4">
            <div className="text-base font-semibold text-[#0a0a0a]">基本信息区</div>
            <DetailList
              items={[
                { label: '所属部门', value: instance.departmentName },
                { label: 'owner', value: instance.ownerName },
                { label: '最近更新时间', value: instance.updatedAt },
                { label: '母版模板', value: template?.name || '—' }
              ]}
            />
          </Card>

          <Card className="space-y-4">
            <div className="text-base font-semibold text-[#0a0a0a]">操作区</div>
            <div className="rounded-[24px] border border-[#ececec] bg-[#fafafa] p-5">
              <div className="text-sm leading-7 text-[#525252]">
                详情页是统一动作分发页。列表页不再承担复杂按钮，所有状态承接、继续处理和去飞书使用都从这里进入。
              </div>
              <div className="mt-4 flex flex-wrap gap-3">{renderActions()}</div>
            </div>
          </Card>

          <Card className="space-y-4">
            <div className="text-base font-semibold text-[#0a0a0a]">
              {owner ? '历史会话 / 调试预览' : '权限边界提示'}
            </div>
            {owner ? (
              (instance.debugPreview || []).length === 0 ? (
                <div className="rounded-[24px] border border-dashed border-[#d9d9de] bg-white/70 px-5 py-8 text-sm text-[#6f6f78]">
                  当前没有可展示的调试消息。正式使用请从“去飞书使用”进入一对一私聊。
                </div>
              ) : (
                <div className="space-y-3">
                  {instance.debugPreview.map((message, index) => (
                    <div key={`${message.role}-${index}`} className="rounded-[20px] bg-[#fafafa] px-4 py-4 text-sm leading-7 text-[#525252]">
                      <div className="mb-1 text-xs text-[#8b8b92]">{message.role === 'user' ? '你' : '数字员工'}</div>
                      {message.text}
                    </div>
                  ))}
                </div>
              )
            ) : (
              <div className="rounded-[24px] border border-[#fde5bf] bg-[#fff8ef] px-5 py-5 text-sm leading-7 text-[#9a6420]">
                部门长查看团队内部门员工时，只展示元数据、状态和配置，不展示成员与数字员工的私聊内容。私有分支详情仅 owner 可见。
              </div>
            )}
          </Card>
        </div>
      </div>

      <FeishuGuideModal instance={guideOpen ? instance : null} onClose={() => setGuideOpen(false)} />
    </div>
  )
}
