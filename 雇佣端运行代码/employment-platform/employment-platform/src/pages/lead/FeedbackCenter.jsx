import { useState } from 'react'
import { useApp } from '../../store.jsx'
import { Card, PageHeader, Chip } from '../../components/UI.jsx'

export default function FeedbackCenter() {
  const { user, instances, feedbacks } = useApp()
  const [filter, setFilter] = useState('30')
  const [instanceId, setInstanceId] = useState('all')
  const myDept = instances.filter(i => i.owner_user_id === user.id && i.instance_type === 'department')
  const myFeedbacks = feedbacks.filter(f => instanceId === 'all' || f.instance_id === instanceId)

  return (
    <Card>
      <PageHeader
        title="部门反馈聚合中心"
        subtitle={`共 ${feedbacks.length} 条反馈 · ${feedbacks.filter(f => f.status === 'pending').length} 条待处理`}
        right={
          <div className="flex gap-2">
            <select value={instanceId} onChange={e => setInstanceId(e.target.value)} className="border rounded px-2 py-1 text-sm">
              <option value="all">全部部门版</option>
              {myDept.map(i => <option key={i.instance_id} value={i.instance_id}>{i.display_name}</option>)}
            </select>
            <select value={filter} onChange={e => setFilter(e.target.value)} className="border rounded px-2 py-1 text-sm">
              <option value="7">近 7 天</option>
              <option value="30">近 30 天</option>
              <option value="90">近 90 天</option>
            </select>
          </div>
        }
      />
      <div className="p-6 grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-5">
          <div className="grid grid-cols-3 gap-3">
            <Stat label="总评分次数" value="348" />
            <Stat label="平均评分" value="★ 4.5" />
            <Stat label="活跃分身" value="24/24" />
          </div>

          <div className="border rounded p-4">
            <div className="text-sm font-medium mb-3">评分分布</div>
            <div className="space-y-1.5 text-xs">
              {[
                { label: '★5', pct: 62, count: 216, color: 'bg-emerald-500' },
                { label: '★4', pct: 26, count: 90, color: 'bg-emerald-400' },
                { label: '★3', pct: 8, count: 28, color: 'bg-amber-400' },
                { label: '★2', pct: 3, count: 10, color: 'bg-amber-500' },
                { label: '★1', pct: 1, count: 4, color: 'bg-rose-500' }
              ].map(r => (
                <div key={r.label} className="flex items-center gap-2">
                  <span className="w-8">{r.label}</span>
                  <div className="flex-1 bg-slate-100 rounded h-4">
                    <div className={`${r.color} h-full rounded`} style={{ width: `${r.pct}%` }}></div>
                  </div>
                  <span className="w-16 text-right">{r.count} ({r.pct}%)</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border rounded p-4">
            <div className="flex justify-between items-center mb-3">
              <div className="text-sm font-medium">部门成员反馈列表</div>
              <div className="text-xs text-slate-500">{myFeedbacks.filter(f => f.status === 'pending').length} 待处理</div>
            </div>
            <div className="space-y-2">
              {myFeedbacks.map(f => (
                <FeedbackItem key={f.feedback_id} feedback={f} />
              ))}
              {myFeedbacks.length === 0 && (
                <div className="text-sm text-slate-500 text-center py-8">暂无反馈</div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4 text-sm">
          <div className="border rounded p-4 bg-amber-50 border-amber-200">
            <div className="text-sm font-medium mb-2 text-amber-900">⚠️ 隐私边界</div>
            <div className="text-xs text-amber-800 leading-relaxed">
              您看到的是聚合反馈,无法下钻到部门成员的具体对话内容。这是平台保护成员隐私的硬规则。如需深入了解,请直接联系反馈提交者。
            </div>
          </div>
          <div className="border rounded p-4">
            <div className="text-sm font-medium mb-2">🔄 反馈处理路径</div>
            <div className="text-xs text-slate-600 leading-relaxed space-y-1">
              <div>① 调教类 → 您重新调教部门版</div>
              <div>② 模板类 → 上报模板生产团队(平台一)</div>
              <div className="text-amber-600 mt-2">反馈不可跨级,职员只能反馈给您</div>
            </div>
          </div>
          <div className="border rounded p-4">
            <div className="text-sm font-medium mb-2">📊 周报订阅</div>
            <div className="text-xs text-slate-600 mb-2">每周一 9:00 通过飞书发送</div>
            <Chip tone="emerald">已订阅</Chip>
          </div>
        </div>
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

function FeedbackItem({ feedback: f }) {
  const tones = {
    pending: { border: 'border-amber-400', bg: 'bg-amber-50', tag: 'amber', label: '待处理' },
    escalated: { border: 'border-blue-400', bg: 'bg-blue-50', tag: 'blue', label: '已上报' },
    resolved: { border: 'border-slate-300', bg: 'bg-slate-50', tag: 'slate', label: '已处理' }
  }
  const t = tones[f.status] || tones.pending
  return (
    <div className={`border-l-4 ${t.border} ${t.bg} px-3 py-2 rounded-r`}>
      <div className="flex justify-between items-center">
        <div className="text-xs text-slate-500">来自 {f.from_user_name} · {f.created_at}</div>
        <Chip tone={t.tag}>{t.label}</Chip>
      </div>
      <div className="text-sm mt-1">{f.content}</div>
      {f.status === 'pending' && (
        <div className="flex gap-3 mt-2 text-xs">
          <button className="text-blue-600">→ 重新调教(差距挖掘)</button>
          <button className="text-slate-500">→ 上报生产团队</button>
          <button className="text-slate-500">忽略</button>
        </div>
      )}
    </div>
  )
}
