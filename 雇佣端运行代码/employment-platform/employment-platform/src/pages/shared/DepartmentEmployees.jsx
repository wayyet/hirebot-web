import { useDeferredValue, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { countByStatus, tabLabelForLead, visibleDepartmentInstances } from '../../lib/prototype.js'
import { useApp } from '../../store.jsx'
import {
  Card,
  EmptyState,
  FilterTabs,
  PageHero,
  Pill,
  PrimaryButton,
  SearchInput,
  SquircleAvatar,
  StatusPill
} from '../../components/UI.jsx'

export default function DepartmentEmployees() {
  const { user, instances } = useApp()
  const navigate = useNavigate()
  const [keyword, setKeyword] = useState('')
  const [tab, setTab] = useState(user.role === 'lead' ? 'hired' : 'live')
  const deferredKeyword = useDeferredValue(keyword)

  const all = useMemo(() => visibleDepartmentInstances(user, instances), [instances, user])
  const visible = useMemo(
    () =>
      all.filter((instance) => {
        const inTab = user.role === 'lead' ? instance.status === tab : instance.status === 'live'
        const matchesKeyword =
          deferredKeyword.trim() === '' ||
          [instance.displayName, instance.summary, ...(instance.abilityTags || [])]
            .join(' ')
            .toLowerCase()
            .includes(deferredKeyword.trim().toLowerCase())
        return inTab && matchesKeyword
      }),
    [all, deferredKeyword, tab, user.role]
  )

  const leadTabs = [
    { label: `已雇佣 (${countByStatus(all, 'hired')})`, value: 'hired' },
    { label: `AI 评估 (${countByStatus(all, 'interning_ai')})`, value: 'interning_ai' },
    { label: `人工评估 (${countByStatus(all, 'interning_human')})`, value: 'interning_human' },
    { label: `已上岗 (${countByStatus(all, 'live')})`, value: 'live' }
  ]

  return (
    <div className="space-y-4">
      <PageHero
        eyebrow={user.role === 'lead' ? '统一主入口' : '成员视图'}
        title="部门数字员工"
        subtitle={
          user.role === 'lead'
            ? '同一个模块名承接全部部门员工资产。部门长可以看到已雇佣、待实习和已上岗的完整状态范围，失败实例通过详情页与 Review 承接。'
            : '普通成员在这里仅看到本部门已上岗的部门员工。复制、上岗和后续使用都从这里进入，不再暴露复杂的雇佣流程。'
        }
        stats={[
          { label: '部门总量', value: all.length, hint: `${user.department} 当前可见` },
          { label: '已上岗', value: countByStatus(all, 'live'), hint: '可复制 / 可使用' },
          {
            label: user.role === 'lead' ? '待处理' : '你的角色边界',
            value: user.role === 'lead' ? countByStatus(all, 'hired') + countByStatus(all, 'interning_ai') + countByStatus(all, 'interning_human') : '只看 live',
            hint: user.role === 'lead' ? '包含已雇佣与待实习' : '不进入模板池和六步流程'
          }
        ]}
      />

      <Card className="space-y-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex-1">
            <SearchInput
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="搜索名称、场景或能力标签"
            />
          </div>
          {user.role === 'lead' ? (
            <FilterTabs items={leadTabs} current={tab} onChange={setTab} />
          ) : (
            <div className="rounded-full border border-[#d1fae5] bg-[#ecfdf5] px-4 py-2 text-sm text-[#157347]">
              成员视图只展示已上岗母版
            </div>
          )}
        </div>

        {visible.length === 0 ? (
          <EmptyState
            title={`当前没有${user.role === 'lead' ? tabLabelForLead(tab) : '可复制'}的部门员工`}
            description={user.role === 'lead' ? '可以从企业模板池发起新的部门版雇佣，或调整筛选条件。' : '等部门长完成上岗后，这里会自动出现可复制母版。'}
            action={
              user.role === 'lead' ? (
                <PrimaryButton onClick={() => navigate('/lead/templates')}>去模板池发起雇佣</PrimaryButton>
              ) : null
            }
          />
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {visible.map((instance) => (
              <button
                key={instance.id}
                onClick={() => navigate(`/instances/${instance.id}`)}
                className="rounded-[28px] border border-[#ececec] bg-white p-5 text-left shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition hover:-translate-y-[1px] hover:shadow-[0_18px_36px_rgba(15,23,42,0.08)]"
              >
                <div className="flex items-start gap-4">
                  <SquircleAvatar initial={instance.avatarInitial} tone={instance.avatarTone} size="lg" />
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="text-lg font-semibold text-[#0a0a0a]">{instance.displayName}</div>
                      <StatusPill status={instance.status} />
                    </div>
                    <div className="mt-2 text-sm leading-7 text-[#525252]">{instance.summary}</div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {instance.abilityTags.map((tag) => (
                        <Pill key={tag} tone={instance.avatarTone}>
                          {tag}
                        </Pill>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  {[
                    { label: '最近更新', value: instance.updatedAt },
                    { label: '最近活跃', value: instance.recentActive },
                    { label: '查看详情', value: '进入统一动作分发页' }
                  ].map((item) => (
                    <div key={item.label} className="rounded-[18px] bg-[#fafafa] px-4 py-4">
                      <div className="text-xs text-[#8b8b92]">{item.label}</div>
                      <div className="mt-2 text-sm font-medium text-[#0a0a0a]">{item.value}</div>
                    </div>
                  ))}
                </div>
              </button>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
