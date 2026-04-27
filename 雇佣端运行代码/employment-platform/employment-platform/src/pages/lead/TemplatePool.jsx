import { useDeferredValue, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TEMPLATE_SOURCE_META } from '../../mock/seed.js'
import { useApp } from '../../store.jsx'
import {
  Card,
  FilterTabs,
  PageHero,
  Pill,
  PrimaryButton,
  SearchInput,
  SquircleAvatar
} from '../../components/UI.jsx'

export default function TemplatePool() {
  const { templates } = useApp()
  const navigate = useNavigate()
  const [keyword, setKeyword] = useState('')
  const [source, setSource] = useState('all')
  const deferredKeyword = useDeferredValue(keyword)

  const filtered = useMemo(
    () =>
      templates.filter((template) => {
        const matchesKeyword =
          deferredKeyword.trim() === '' ||
          [template.name, template.summary, template.sceneIntro, ...(template.capabilityTags || [])]
            .join(' ')
            .toLowerCase()
            .includes(deferredKeyword.trim().toLowerCase())
        const matchesSource = source === 'all' || template.source === source
        return matchesKeyword && matchesSource
      }),
    [deferredKeyword, source, templates]
  )

  return (
    <div className="space-y-4">
      <PageHero
        eyebrow="部门长入口"
        title="企业模板池"
        subtitle="这里只负责浏览现成模板并发起部门版雇佣，不提供新增模板、派生模板或编辑模板源码的入口。"
        stats={[
          { label: '模板总数', value: templates.length, hint: '全局模板 + 企业模板' },
          {
            label: '企业专属',
            value: templates.filter((template) => template.source === 'tenant').length,
            hint: '更贴近当前组织流程'
          },
          {
            label: '常用模板',
            value: [...templates].sort((a, b) => b.usageCount - a.usageCount)[0]?.name || '—',
            hint: '本租户最近使用频率最高'
          }
        ]}
      />

      <Card className="space-y-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1">
            <SearchInput
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="搜索模板名称、适用场景、能力标签"
            />
          </div>
          <FilterTabs
            items={[
              { label: '全部来源', value: 'all' },
              { label: '全局通用', value: 'global' },
              { label: '企业专属', value: 'tenant' }
            ]}
            current={source}
            onChange={setSource}
          />
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          {filtered.map((template) => {
            const sourceMeta = TEMPLATE_SOURCE_META[template.source]
            return (
              <button
                key={template.id}
                onClick={() => navigate(`/templates/${template.id}`)}
                className="group rounded-[28px] border border-[#ececec] bg-white p-5 text-left shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition hover:-translate-y-[1px] hover:shadow-[0_18px_36px_rgba(15,23,42,0.08)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <SquircleAvatar initial={template.icon} tone={template.tone} size="lg" />
                    <div>
                      <div className="text-lg font-semibold text-[#0a0a0a]">{template.name}</div>
                      <div className="mt-1 text-sm text-[#6f6f78]">{template.sceneIntro}</div>
                    </div>
                  </div>
                  <Pill tone={sourceMeta.tone}>{sourceMeta.label}</Pill>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  {[
                    { label: '适用部门', value: template.applicableDepartments.join(' / ') },
                    { label: '已雇佣次数', value: `${template.usageCount} 次` },
                    { label: '被复制次数', value: `${template.copyCount} 次` }
                  ].map((item) => (
                    <div key={item.label} className="rounded-[20px] bg-[#fafafa] px-4 py-3">
                      <div className="text-xs text-[#8b8b92]">{item.label}</div>
                      <div className="mt-2 text-sm font-medium text-[#0a0a0a]">{item.value}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {template.capabilityTags.map((tag) => (
                    <Pill key={tag} tone={template.tone}>
                      {tag}
                    </Pill>
                  ))}
                </div>

                <div className="mt-5 flex items-center justify-between rounded-[22px] border border-[#ececec] bg-[#fffdf8] px-4 py-4">
                  <div>
                    <div className="text-xs text-[#8b8b92]">适配建议</div>
                    <div className="mt-2 text-sm leading-6 text-[#525252]">{template.fitHint}</div>
                  </div>
                  <PrimaryButton className="shrink-0">查看模板详情</PrimaryButton>
                </div>
              </button>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <div className="rounded-[24px] border border-dashed border-[#d9d9de] bg-white/70 px-6 py-12 text-center text-sm text-[#6f6f78]">
            当前筛选条件下没有匹配模板，换一个关键词或来源试试。
          </div>
        )}
      </Card>
    </div>
  )
}
