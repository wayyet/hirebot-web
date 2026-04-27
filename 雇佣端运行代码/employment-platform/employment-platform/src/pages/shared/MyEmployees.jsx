import { useDeferredValue, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { visibleMyInstances } from '../../lib/prototype.js'
import { useApp } from '../../store.jsx'
import {
  Card,
  EmptyState,
  FeishuGuideModal,
  FilterTabs,
  PageHero,
  Pill,
  PrimaryButton,
  SearchInput,
  SquircleAvatar,
  StatusPill,
  TypePill
} from '../../components/UI.jsx'

export default function MyEmployees() {
  const { user, instances } = useApp()
  const navigate = useNavigate()
  const mine = useMemo(() => visibleMyInstances(user, instances), [instances, user])
  const [keyword, setKeyword] = useState('')
  const [status, setStatus] = useState('all')
  const [type, setType] = useState('all')
  const [guideInstance, setGuideInstance] = useState(null)
  const deferredKeyword = useDeferredValue(keyword)

  const filtered = useMemo(
    () =>
      mine.filter((instance) => {
        const matchesStatus = status === 'all' || instance.status === status
        const matchesType = type === 'all' || instance.instanceType === type
        const matchesKeyword =
          deferredKeyword.trim() === '' ||
          [instance.displayName, instance.summary, ...(instance.abilityTags || [])]
            .join(' ')
            .toLowerCase()
            .includes(deferredKeyword.trim().toLowerCase())
        return matchesStatus && matchesType && matchesKeyword
      }),
    [deferredKeyword, mine, status, type]
  )

  return (
    <div className="space-y-4">
      <PageHero
        eyebrow="个人资产视图"
        title="我的数字员工"
        subtitle="这里只展示当前登录用户本人拥有的“我的分身”和“私人定制”。部门员工不会出现在这里，避免个人资产和团队资产混在一起。"
        stats={[
          { label: '我的实例总数', value: mine.length, hint: '含历史状态' },
          { label: '已上岗', value: mine.filter((instance) => instance.status === 'live').length, hint: '可去飞书使用' },
          {
            label: '异常实例',
            value: mine.filter((instance) => instance.status === 'failed').length,
            hint: '需进入 Review 或继续处理'
          }
        ]}
      />

      <Card className="space-y-5">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto_auto]">
          <SearchInput
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="搜索我的分身、私人定制或来源能力"
          />
          <FilterTabs
            items={[
              { label: '全部状态', value: 'all' },
              { label: '已上岗', value: 'live' },
              { label: '待处理', value: 'failed' },
              { label: '历史', value: 'retired' }
            ]}
            current={status}
            onChange={setStatus}
          />
          <FilterTabs
            items={[
              { label: '全部类型', value: 'all' },
              { label: '我的分身', value: 'personal_clone' },
              { label: '私人定制', value: 'private_branch' }
            ]}
            current={type}
            onChange={setType}
          />
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            title="当前筛选条件下没有结果"
            description="如果你还没有任何分身，可以先回到“部门数字员工”复制一个 live 母版。"
            action={
              <PrimaryButton onClick={() => navigate(user.role === 'lead' ? '/lead/department' : '/staff/department')}>
                去部门数字员工
              </PrimaryButton>
            }
          />
        ) : (
          <div className="grid gap-4">
            {filtered.map((instance) => (
              <div
                key={instance.id}
                className="rounded-[28px] border border-[#ececec] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
                  <div className="flex items-center gap-4">
                    <SquircleAvatar initial={instance.avatarInitial} tone={instance.avatarTone} size="lg" />
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="text-lg font-semibold text-[#0a0a0a]">{instance.displayName}</div>
                        <TypePill type={instance.instanceType} />
                        <StatusPill status={instance.status} />
                      </div>
                      <div className="mt-2 text-sm leading-7 text-[#525252]">{instance.summary}</div>
                    </div>
                  </div>

                  <div className="grid flex-1 gap-3 md:grid-cols-3">
                    {[
                      { label: '来源关系', value: instance.sourceInstanceId ? '来自上游实例复制' : '直接创建' },
                      { label: '最近活跃', value: instance.recentActive },
                      { label: '最近评估', value: instance.latestEvaluation?.highlight || '—' }
                    ].map((item) => (
                      <div key={item.label} className="rounded-[18px] bg-[#fafafa] px-4 py-4">
                        <div className="text-xs text-[#8b8b92]">{item.label}</div>
                        <div className="mt-2 text-sm font-medium leading-6 text-[#0a0a0a]">{item.value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {instance.abilityTags.map((tag) => (
                    <Pill key={tag} tone={instance.avatarTone}>
                      {tag}
                    </Pill>
                  ))}
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <PrimaryButton onClick={() => navigate(`/instances/${instance.id}`)}>查看详情</PrimaryButton>
                  {instance.status === 'live' && <SecondaryButton onClick={() => setGuideInstance(instance)}>去飞书使用</SecondaryButton>}
                  {instance.status === 'failed' && (
                    <SecondaryButton onClick={() => navigate(`/review/${instance.id}`)}>继续雇佣</SecondaryButton>
                  )}
                  {instance.status === 'retired' && (
                    <SecondaryButton onClick={() => navigate(`/instances/${instance.id}`)}>查看历史</SecondaryButton>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <FeishuGuideModal instance={guideInstance} onClose={() => setGuideInstance(null)} />
    </div>
  )
}
