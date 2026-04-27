import { useNavigate } from 'react-router-dom'
import { useApp } from '../../store.jsx'
import { Card, PageHeader, Avatar, Chip, PrimaryBtn } from '../../components/UI.jsx'

export default function MyClones() {
  const { user, instances, removeInstance, showToast } = useApp()
  const navigate = useNavigate()
  const mine = instances.filter(i =>
    i.owner_user_id === user.id &&
    i.instance_type !== 'department'
  )

  function retire(inst) {
    const isPrivateBranch = inst.instance_type === 'private_branch'
    const action = isPrivateBranch ? '废弃私有分支' : '退役分身'
    if (!confirm(`确定${action}「${inst.display_name}」?`)) return
    removeInstance(inst.instance_id)
    showToast(`已${action}`)
  }

  return (
    <Card>
      <PageHeader
        title="我的数字员工"
        subtitle={`共 ${mine.filter(i => i.status !== 'retired').length} 个活跃 · ${mine.filter(i => i.instance_type === 'private_branch').length} 个私有分支`}
        right={<PrimaryBtn role="staff" onClick={() => navigate('/staff/browse')}>+ 复制新分身</PrimaryBtn>}
      />
      <div className="p-6 space-y-3">
        {mine.length === 0 ? (
          <div className="text-center text-sm text-slate-500 py-12">
            还没有分身。<button onClick={() => navigate('/staff/browse')} className="text-emerald-600 ml-2">→ 去浏览部门版</button>
          </div>
        ) : mine.map(inst => (
          <div key={inst.instance_id} className={`border rounded-lg p-4 flex items-center gap-4 ${inst.status === 'retired' ? 'opacity-50' : ''}`}>
            <Avatar initial={inst.display_avatar_initial} color={inst.avatar_color} size="lg" />
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium">{inst.display_name}</span>
                {inst.status !== 'retired' && <Chip tone="emerald">live</Chip>}
                {inst.status === 'retired' && <Chip tone="slate">已退役</Chip>}
                <Chip tone={inst.instance_type === 'private_branch' ? 'purple' : 'blue'}>
                  {inst.instance_type === 'private_branch' ? '私有分支' : '个人分身'}
                </Chip>
              </div>
              <div className="text-xs text-slate-500 mt-1">{inst.summary} · {inst.msg_count || 0} 次对话</div>
            </div>
            {inst.status !== 'retired' && (
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <span>★ {inst.avg_rating}</span>
                <button className="text-blue-600 text-xs" onClick={() => navigate(`/staff/chat/${inst.instance_id}`)}>对话</button>
                {/* 关键约束:私有分支不能再分支(防止无限套娃 § 6.3) */}
                {inst.instance_type === 'personal_clone' && (
                  <button className="text-purple-600 text-xs" onClick={() => navigate(`/staff/branch/${inst.instance_id}`)}>
                    创建私有分支 →
                  </button>
                )}
                <button className="text-rose-500 text-xs" onClick={() => retire(inst)}>
                  {inst.instance_type === 'private_branch' ? '废弃私有分支' : '退役'}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  )
}
