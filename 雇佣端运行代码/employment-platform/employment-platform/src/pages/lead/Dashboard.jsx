import { useNavigate } from 'react-router-dom'
import { useApp } from '../../store.jsx'
import { Card, PageHeader, Avatar, Chip, PrimaryBtn, STATUS_TONE, STATUS_LABEL } from '../../components/UI.jsx'

export default function LeadDashboard() {
  const { user, instances, feedbacks } = useApp()
  const navigate = useNavigate()
  const myDept = instances.filter(i => i.owner_user_id === user.id && i.instance_type === 'department')
  const live = myDept.filter(i => i.status === 'live')
  const interning = myDept.filter(i => i.status === 'interning_ai' || i.status === 'interning_human')
  const totalClones = instances.filter(i => i.instance_type === 'personal_clone' && myDept.some(d => d.instance_id === i.from_instance_id)).length
  const avgRating = live.length ? (live.reduce((a, b) => a + (b.avg_rating || 0), 0) / live.length).toFixed(1) : '—'
  const pendingFeedbacks = feedbacks.filter(f => f.status === 'pending').length

  return (
    <div className="space-y-4">
      <Card>
        <PageHeader
          title={`${user.department} · ${user.name}`}
          subtitle="部门长 · 飞书已认证"
          right={<PrimaryBtn role="lead" onClick={() => navigate('/lead/templates')}>+ 新雇佣</PrimaryBtn>}
        />
        <div className="p-6 grid grid-cols-4 gap-4">
          <Stat label="部门版数字员工" value={myDept.length} sub={`${live.length} 已上岗 · ${interning.length} 调教中`} subTone="emerald" />
          <Stat label="部门内分身总数" value={totalClones} sub="本周 +8" />
          <Stat label="部门版平均评分" value={`${avgRating}/5`} sub="近 30 天" />
          <Stat label="待处理反馈" value={pendingFeedbacks} sub="待您处理" subTone="amber" valueTone="amber" />
        </div>
        <div className="px-6 pb-6">
          <div className="text-sm font-medium mb-3">我管理的部门版</div>
          <div className="space-y-2">
            {myDept.length === 0 ? (
              <div className="text-sm text-slate-500 text-center py-8">还没有部门版,从模板池开始第一次雇佣</div>
            ) : myDept.map(inst => (
              <div key={inst.instance_id} className="border rounded p-3 flex justify-between items-center hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <Avatar initial={inst.display_avatar_initial} color={inst.avatar_color} size="md" />
                  <div>
                    <div className="text-sm font-medium">{inst.display_name} · {user.department}版</div>
                    <div className="text-xs text-slate-500">{inst.summary}{inst.cloned_count > 0 ? ` · 已被 ${inst.cloned_count} 人复制使用` : ''}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Chip tone={STATUS_TONE[inst.status]}>{STATUS_LABEL[inst.status]}</Chip>
                  {inst.status === 'live' ? (
                    <button className="text-xs text-blue-600" onClick={() => navigate('/lead/instances')}>管理 ›</button>
                  ) : (
                    <button className="text-xs text-blue-600" onClick={() => navigate(`/lead/hire/${inst.based_on_template_id}?resume=${inst.instance_id}`)}>继续调教 ›</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}

function Stat({ label, value, sub, valueTone = 'slate', subTone = 'slate' }) {
  const valueColor = valueTone === 'amber' ? 'text-amber-600' : 'text-slate-900'
  const subColor = { emerald: 'text-emerald-600', amber: 'text-amber-600', slate: 'text-slate-500' }[subTone]
  return (
    <div className="bg-slate-50 rounded p-4">
      <div className="text-xs text-slate-500">{label}</div>
      <div className={`text-2xl font-semibold mt-1 ${valueColor}`}>{value}</div>
      {sub && <div className={`text-xs mt-1 ${subColor}`}>{sub}</div>}
    </div>
  )
}
