import { useNavigate, useParams } from 'react-router-dom'
import { TEMPLATE_SOURCE_META } from '../../mock/seed.js'
import { useApp } from '../../store.jsx'
import { Card, DetailList, PageHero, Pill, PrimaryButton, SecondaryButton, SquircleAvatar } from '../../components/UI.jsx'
import { findTemplate } from '../../lib/prototype.js'

export default function TemplateDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { templates, createDepartmentDraft } = useApp()
  const template = findTemplate(templates, id)

  if (!template) {
    return (
      <Card>
        <div className="text-center text-sm text-[#6f6f78]">模板不存在。</div>
      </Card>
    )
  }

  const sourceMeta = TEMPLATE_SOURCE_META[template.source]

  function startHire() {
    const draftId = createDepartmentDraft({ templateId: template.id })
    if (draftId) navigate(`/hire/${draftId}`)
  }

  return (
    <div className="space-y-4">
      <PageHero
        eyebrow="模板详情"
        title={template.name}
        subtitle={template.description}
        actions={
          <>
            <SecondaryButton onClick={() => navigate(-1)}>返回模板池</SecondaryButton>
            <PrimaryButton onClick={startHire}>用此模板开始雇佣</PrimaryButton>
          </>
        }
        stats={[
          { label: '适用部门', value: template.applicableDepartments.join(' / ') },
          { label: '已被雇佣', value: `${template.usageCount} 次`, hint: '跨部门累计' },
          { label: '分身复制', value: `${template.copyCount} 次`, hint: '来自 live 部门员工' }
        ]}
      />

      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="space-y-6">
          <div className="flex items-start gap-4">
            <SquircleAvatar initial={template.icon} tone={template.tone} size="xl" />
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Pill tone={sourceMeta.tone}>{sourceMeta.label}</Pill>
                <Pill tone={template.tone}>建议先做部门级雇佣</Pill>
              </div>
              <div className="mt-3 text-sm leading-7 text-[#525252]">{template.summary}</div>
            </div>
          </div>

          <div className="rounded-[24px] border border-[#ececec] bg-[#fafafa] px-5 py-5">
            <div className="text-sm font-semibold text-[#0a0a0a]">适配提示</div>
            <div className="mt-3 text-sm leading-7 text-[#525252]">{template.fitHint}</div>
          </div>

          <div>
            <div className="text-sm font-semibold text-[#0a0a0a]">能力清单</div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {template.capabilityTags.map((tag) => (
                <div key={tag} className="rounded-[20px] border border-[#ececec] bg-white px-4 py-4 shadow-[0_6px_18px_rgba(15,23,42,0.04)]">
                  <div className="text-sm font-medium text-[#0a0a0a]">{tag}</div>
                  <div className="mt-2 text-xs leading-6 text-[#6f6f78]">
                    上线后会以业务语言在详情页展示，不暴露 manifest、ontology、skill 等底层技术对象。
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="text-sm font-semibold text-[#0a0a0a]">典型适用场景</div>
            <div className="mt-4 space-y-3">
              {template.useCases.map((item) => (
                <div key={item} className="rounded-[20px] bg-[#fffdf8] px-4 py-4 text-sm leading-7 text-[#525252]">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card className="space-y-6">
          <div>
            <div className="text-sm font-semibold text-[#0a0a0a]">模板概览</div>
            <div className="mt-4">
              <DetailList
                items={[
                  { label: '模板来源', value: sourceMeta.label },
                  { label: '适用部门', value: template.applicableDepartments.join(' / ') },
                  { label: '平均启动周期', value: template.metrics.avgLaunchDays },
                  { label: 'AI 评估通过率', value: template.metrics.passRate }
                ]}
              />
            </div>
          </div>

          <div className="rounded-[24px] border border-[#d1fae5] bg-[#ecfdf5] px-5 py-5 text-sm leading-7 text-[#157347]">
            <div className="font-medium">权限说明</div>
            <div className="mt-2">
              你可以查看模板概览、能力和适配提示，但不能在雇佣端直接修改模板源码，也不能从这里派生出新模板。
            </div>
          </div>

          <div className="rounded-[24px] border border-[#ececec] bg-white px-5 py-5">
            <div className="text-sm font-semibold text-[#0a0a0a]">作为雇佣起点时会发生什么</div>
            <div className="mt-3 space-y-3 text-sm leading-7 text-[#525252]">
              <p>1. 系统会为当前部门创建一个“已雇佣”草稿实例。</p>
              <p>2. 部门长进入六步雇佣页，逐步确认场景、差距、人设、知识、能力和外部对接。</p>
              <p>3. 六步确认完成后，自动进入 AI 评估，再进入人工评估和飞书身份配置。</p>
            </div>
          </div>

          <PrimaryButton className="w-full justify-center" onClick={startHire}>
            用此模板开始雇佣
          </PrimaryButton>
        </Card>
      </div>
    </div>
  )
}
