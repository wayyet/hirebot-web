import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../store.jsx'
import { Card, PageHeader, Avatar, Chip, PrimaryBtn } from '../../components/UI.jsx'

export default function BrowseDept() {
  const { user, instances } = useApp()
  const navigate = useNavigate()
  const [q, setQ] = useState('')

  // 关键约束:只显示本部门、status=live 的部门版
  const visible = instances.filter(i =>
    i.instance_type === 'department' &&
    i.status === 'live' &&
    i.department_id === user.departmentId &&
    (q === '' || i.display_name.includes(q) || i.summary.includes(q))
  )

  return (
    <Card>
      <PageHeader
        title="本部门可雇佣的数字员工"
        subtitle={`${user.department} · 仅显示已上岗的部门版`}
      />
      <div className="px-6 py-4 border-b">
        <input value={q} onChange={e => setQ(e.target.value)}
          className="w-full border rounded px-3 py-2 text-sm"
          placeholder="🔍 找一个能帮我处理订单查询的员工...输入关键词" />
      </div>
      <div className="p-6 grid grid-cols-2 gap-4">
        {visible.length === 0 ? (
          <div className="col-span-2 text-center text-sm text-slate-500 py-12">
            本部门暂无可用的数字员工。请联系部门长。
          </div>
        ) : visible.map(inst => (
          <div key={inst.instance_id} className="border rounded-lg p-5 hover:shadow-md transition">
            <div className="flex items-start gap-4">
              <Avatar initial={inst.display_avatar_initial} color={inst.avatar_color} size="lg" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className="font-medium">{inst.display_name}</div>
                  <Chip tone="emerald">live</Chip>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">{user.department}版 · 由部门长调教</div>
                <div className="text-sm text-slate-700 mt-2 leading-relaxed">{inst.summary}</div>
                <div className="flex justify-between items-center mt-3 text-xs text-slate-500">
                  <span>已被 {inst.cloned_count} 人复制 · 平均 ★ {inst.avg_rating}</span>
                  <PrimaryBtn role="staff" onClick={() => navigate(`/staff/clone/${inst.instance_id}`)}>+ 复制分身</PrimaryBtn>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
