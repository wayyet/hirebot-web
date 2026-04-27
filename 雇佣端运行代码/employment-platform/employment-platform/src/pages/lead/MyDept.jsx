import { useNavigate } from 'react-router-dom'
import { useApp } from '../../store.jsx'
import { Card, PageHeader, Avatar, Chip, PrimaryBtn, STATUS_TONE, STATUS_LABEL } from '../../components/UI.jsx'

export default function MyDept() {
  const { user, instances, removeInstance, templates, showToast } = useApp()
  const navigate = useNavigate()
  const myDept = instances.filter(i => i.owner_user_id === user.id && i.instance_type === 'department')

  function retire(inst) {
    if (!confirm(`确定退役「${inst.display_name}」?\n退役后所有该部门版的分身将不可再用。`)) return
    removeInstance(inst.instance_id)
    showToast('已退役')
  }

  return (
    <Card>
      <PageHeader
        title="我管理的部门版数字员工"
        subtitle={`共 ${myDept.length} 个 · ${myDept.filter(i => i.status === 'live').length} 已上岗`}
        right={<PrimaryBtn role="lead" onClick={() => navigate('/lead/templates')}>+ 新雇佣</PrimaryBtn>}
      />
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-xs text-slate-500">
          <tr>
            <th className="text-left px-6 py-3 font-medium">数字员工</th>
            <th className="text-left py-3 font-medium">基于模板</th>
            <th className="text-left py-3 font-medium">状态</th>
            <th className="text-left py-3 font-medium">分身使用</th>
            <th className="text-left py-3 font-medium">平均评分</th>
            <th className="text-left py-3 font-medium">最近调教</th>
            <th className="text-left py-3 pr-6 font-medium">操作</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {myDept.length === 0 ? (
            <tr><td colSpan="7" className="text-center py-12 text-slate-500">还没有部门版</td></tr>
          ) : myDept.map(inst => {
            const tpl = templates.find(t => t.id === inst.based_on_template_id)
            return (
              <tr key={inst.instance_id} className="hover:bg-slate-50">
                <td className="px-6 py-3">
                  <div className="flex items-center gap-2">
                    <Avatar initial={inst.display_avatar_initial} color={inst.avatar_color} size="sm" />
                    <span>{inst.display_name}</span>
                  </div>
                </td>
                <td>{tpl?.name} {tpl?.version}</td>
                <td><Chip tone={STATUS_TONE[inst.status]}>{STATUS_LABEL[inst.status]}</Chip></td>
                <td>{inst.cloned_count > 0 ? `${inst.cloned_count} 人` : '—'}</td>
                <td>{inst.avg_rating ? `★ ${inst.avg_rating}` : '—'}</td>
                <td className="text-xs text-slate-500">{inst.last_trained_at}</td>
                <td className="pr-6">
                  {inst.status === 'live' && (
                    <>
                      <button className="text-blue-600 text-xs mr-2" onClick={() => navigate(`/lead/hire/${inst.based_on_template_id}?retrain=${inst.instance_id}`)}>重新调教</button>
                      <button className="text-rose-500 text-xs" onClick={() => retire(inst)}>退役</button>
                    </>
                  )}
                  {(inst.status === 'interning_ai' || inst.status === 'interning_human') && (
                    <>
                      <button className="text-blue-600 text-xs mr-2" onClick={() => navigate(`/lead/hire/${inst.based_on_template_id}?resume=${inst.instance_id}`)}>继续</button>
                      <button className="text-slate-500 text-xs" onClick={() => retire(inst)}>放弃</button>
                    </>
                  )}
                  {inst.status === 'retired' && <button className="text-slate-500 text-xs">查看历史</button>}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </Card>
  )
}
