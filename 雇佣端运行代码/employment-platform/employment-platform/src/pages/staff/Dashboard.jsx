import { useNavigate } from 'react-router-dom'
import { useApp } from '../../store.jsx'
import { Card, PageHeader, Avatar, Chip, PrimaryBtn } from '../../components/UI.jsx'

export default function StaffDashboard() {
  const { user, instances } = useApp()
  const navigate = useNavigate()
  const mine = instances.filter(i => i.owner_user_id === user.id && i.instance_type !== 'department' && i.status !== 'retired')
  const totalMsg = mine.reduce((a, b) => a + (b.msg_count || 0), 0)
  const avgRating = mine.length ? (mine.reduce((a, b) => a + (b.avg_rating || 0), 0) / mine.length).toFixed(1) : '—'

  return (
    <Card>
      <PageHeader
        title={`${user.department} · ${user.name}`}
        subtitle="普通职员"
        right={<PrimaryBtn role="staff" onClick={() => navigate('/staff/browse')}>+ 浏览部门版,复制分身 →</PrimaryBtn>}
      />
      <div className="p-6 grid grid-cols-3 gap-4">
        <Stat label="我的分身数" value={mine.length} />
        <Stat label="本周对话次数" value={totalMsg} />
        <Stat label="我的平均评分" value={`★ ${avgRating}`} />
      </div>
      <div className="px-6 pb-6">
        <div className="text-sm font-medium mb-3">我的数字员工</div>
        {mine.length === 0 ? (
          <div className="text-sm text-slate-500 text-center py-12 bg-slate-50 rounded">
            还没有分身。<button onClick={() => navigate('/staff/browse')} className="text-emerald-600 ml-2">→ 去浏览部门版</button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {mine.map(inst => (
              <div key={inst.instance_id}
                onClick={() => navigate(`/staff/chat/${inst.instance_id}`)}
                className="border rounded p-4 hover:shadow-md cursor-pointer transition">
                <div className="flex justify-between items-start mb-2">
                  <Avatar initial={inst.display_avatar_initial} color={inst.avatar_color} />
                  <Chip tone={inst.instance_type === 'private_branch' ? 'purple' : 'emerald'}>
                    {inst.instance_type === 'private_branch' ? '私有分支' : 'live'}
                  </Chip>
                </div>
                <div className="font-medium text-sm">{inst.display_name}</div>
                <div className="text-xs text-slate-500 mt-1 line-clamp-2">{inst.summary}</div>
                <div className="flex justify-between items-center mt-3 pt-3 border-t text-xs text-slate-500">
                  <span>本周 {inst.msg_count || 0} 次对话</span>
                  <span>★ {inst.avg_rating}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}

function Stat({ label, value }) {
  return (
    <div className="bg-slate-50 rounded p-4">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
    </div>
  )
}
