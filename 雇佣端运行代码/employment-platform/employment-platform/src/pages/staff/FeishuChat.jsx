import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../../store.jsx'
import { Card, Avatar, PrimaryBtn } from '../../components/UI.jsx'
import * as api from '../../mock/api.js'

export default function FeishuChat() {
  const { instanceId } = useParams()
  const { user, instances, addFeedback, showToast } = useApp()
  const navigate = useNavigate()
  const inst = instances.find(i => i.instance_id === instanceId)
  const [messages, setMessages] = useState([
    { role: 'system', text: `今天 ${new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}` }
  ])
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const [showRating, setShowRating] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const chatEnd = useRef(null)

  useEffect(() => {
    chatEnd.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, thinking])

  if (!inst) return <Card><div className="p-6 text-center text-slate-500">分身不存在</div></Card>

  async function send() {
    const text = input.trim()
    if (!text) return
    setMessages(prev => [...prev, { role: 'me', text }])
    setInput('')
    setThinking(true)
    const res = await api.sendFeishuMessage({ instance_id: inst.instance_id, text })
    setMessages(prev => [...prev, { role: 'bot', text: res.data.reply, message_id: res.data.message_id }])
    setThinking(false)
  }

  async function submitRating(rating, comment) {
    const lastBot = [...messages].reverse().find(m => m.role === 'bot')
    if (!lastBot) return showToast('暂无可评分的回复')
    await api.submitRating({ instance_id: inst.instance_id, conversation_id: lastBot.message_id, rating, comment })
    setShowRating(false)
    showToast(`已提交 ★${rating} 评分`)
  }

  async function submitFeedback(payload) {
    await api.submitFeedback(payload)
    addFeedback({
      feedback_id: 'fb_' + Math.random().toString(36).slice(2, 6),
      instance_id: inst.instance_id,
      from_user_id: user.id,
      from_user_name: user.name,
      ...payload,
      status: 'pending',
      created_at: '刚刚'
    })
    setShowFeedback(false)
    showToast('反馈已提交给部门长')
  }

  return (
    <Card>
      <div className="border-b px-6 py-4 flex justify-between items-center">
        <button onClick={() => navigate('/staff/clones')} className="text-sm text-slate-400">‹ 返回我的分身</button>
        <div className="text-xs text-slate-500">飞书 IM 镜像视图(模拟)</div>
      </div>
      <div className="p-6 max-w-3xl mx-auto">
        <div className="device-frame">
          {/* Feishu Header */}
          <div className="bg-slate-100 px-4 py-3 border-b flex items-center gap-3 rounded-t-xl">
            <Avatar initial={inst.display_avatar_initial} color={inst.avatar_color} size="md" />
            <div className="flex-1">
              <div className="text-sm font-medium">{inst.display_name}</div>
              <div className="text-xs text-slate-500">数字员工 · 在线</div>
            </div>
            <div className="text-slate-400">···</div>
          </div>

          {/* Chat */}
          <div className="bg-white p-4 space-y-3" style={{ minHeight: 380, maxHeight: 480, overflowY: 'auto' }}>
            {messages.map((m, i) => {
              if (m.role === 'system') return <div key={i} className="text-xs text-center text-slate-400">— {m.text} —</div>
              if (m.role === 'me') return (
                <div key={i} className="flex justify-end gap-2">
                  <div className="bg-blue-500 text-white px-3 py-2 rounded-lg text-sm max-w-[75%] whitespace-pre-wrap">{m.text}</div>
                </div>
              )
              return (
                <div key={i} className="flex gap-2">
                  <Avatar initial={inst.display_avatar_initial} color={inst.avatar_color} size="sm" />
                  <div className="bg-slate-100 px-3 py-2 rounded-lg text-sm max-w-[75%] leading-relaxed whitespace-pre-wrap">{m.text}</div>
                </div>
              )
            })}
            {thinking && (
              <div className="flex gap-2">
                <Avatar initial={inst.display_avatar_initial} color={inst.avatar_color} size="sm" />
                <div className="bg-slate-100 px-3 py-2 rounded-lg text-sm pulse-soft">正在思考...</div>
              </div>
            )}
            <div ref={chatEnd} />
          </div>

          {/* Quick actions */}
          <div className="bg-white px-4 py-2 border-t flex gap-2">
            <button onClick={() => setShowRating(true)} className="text-xs bg-amber-100 text-amber-700 rounded px-3 py-1">⭐ 评分最近回复</button>
            <button onClick={() => setShowFeedback(true)} className="text-xs bg-slate-100 text-slate-600 rounded px-3 py-1">/反馈</button>
            <button className="text-xs bg-slate-100 text-slate-600 rounded px-3 py-1">/帮助</button>
          </div>

          {/* Input */}
          <div className="bg-white border-t p-3 flex gap-2 rounded-b-xl">
            <input value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') send() }}
              className="flex-1 border rounded px-3 py-2 text-sm" placeholder="发消息..." />
            <button onClick={send} disabled={thinking}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 rounded text-sm disabled:bg-slate-300">发送</button>
          </div>
        </div>
        <div className="text-xs text-slate-500 mt-3 text-center leading-relaxed">
          沙箱冷启动延迟会回复"正在思考..."后追加真实回复 · 群聊消息忽略 · 文件类型暂拒收(MVP)
        </div>
      </div>

      {/* 评分弹窗 (B6) */}
      {showRating && <RatingModal onCancel={() => setShowRating(false)} onSubmit={submitRating} lastReply={[...messages].reverse().find(m => m.role === 'bot')?.text} />}

      {/* 反馈弹窗 (B7) */}
      {showFeedback && <FeedbackModal onCancel={() => setShowFeedback(false)} onSubmit={submitFeedback} />}
    </Card>
  )
}

// ============ 评分弹窗(B6) ============
function RatingModal({ onCancel, onSubmit, lastReply }) {
  const [rating, setRating] = useState(4)
  const [comment, setComment] = useState('')
  const emojis = ['😞', '😐', '🙂', '😊', '🤩']

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
        <div className="text-sm font-medium mb-3">为最近一次回复打分</div>
        {lastReply && (
          <div className="bg-slate-50 rounded p-3 text-xs text-slate-600 mb-4 leading-relaxed line-clamp-3">"{lastReply}"</div>
        )}
        <div className="text-sm font-medium mb-2">这次回复满意吗?</div>
        <div className="flex justify-center gap-2 mb-3">
          {emojis.map((e, i) => (
            <button key={i} onClick={() => setRating(i + 1)}
              className={`w-12 h-12 border-2 rounded text-2xl ${rating === i + 1 ? 'border-amber-400 bg-amber-50' : 'border-slate-200 hover:border-amber-300'}`}>{e}</button>
          ))}
        </div>
        <div className="text-xs text-center text-slate-500 mb-4">★{rating} · {['不满意', '一般', '基本满意', '满意', '非常满意'][rating - 1]}</div>
        <div className="text-xs text-slate-500 mb-1">补充说明(可选,文字内容仅你可见)</div>
        <textarea value={comment} onChange={e => setComment(e.target.value)} rows={3}
          className="w-full border rounded text-sm p-2" placeholder="比如:话术不错,但建议加上价格信息" />
        <div className="flex gap-2 mt-4">
          <button onClick={onCancel} className="flex-1 border rounded py-2 text-sm">取消</button>
          <button onClick={() => onSubmit(rating, comment)} className="flex-1 bg-blue-600 text-white rounded py-2 text-sm">提交</button>
        </div>
        <div className="text-xs text-slate-500 mt-3 text-center leading-relaxed">
          📌 你的评分用于自己决定要不要持续使用 / 创建私有分支。聚合的星级会汇报给部门长,但具体评论不会被部门长看到。
        </div>
      </div>
    </div>
  )
}

// ============ 反馈弹窗(B7) ============
function FeedbackModal({ onCancel, onSubmit }) {
  const [type, setType] = useState('training_issue')
  const [content, setContent] = useState('')

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full">
        <div className="text-sm font-medium mb-3">提交反馈给部门长</div>
        <div className="mb-4">
          <div className="text-xs text-slate-500 mb-2">反馈类型</div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { v: 'training_issue', label: '😞 调教问题', desc: '回答方式、语气、知识缺失' },
              { v: 'template_defect', label: '⚠️ 模板缺陷', desc: '这个模板本身就不行' },
              { v: 'suggestion', label: '💡 改进建议', desc: '希望增加什么能力' }
            ].map(o => (
              <button key={o.v} onClick={() => setType(o.v)}
                className={`border-2 rounded p-3 text-left text-sm ${type === o.v ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-400'}`}>
                <div className="font-medium">{o.label}</div>
                <div className="text-xs text-slate-500 mt-1">{o.desc}</div>
              </button>
            ))}
          </div>
        </div>
        <div className="mb-4">
          <div className="text-xs text-slate-500 mb-2">具体描述 <span className="text-rose-500">*</span></div>
          <textarea value={content} onChange={e => setContent(e.target.value)} rows={4}
            className="w-full border rounded px-3 py-2 text-sm" placeholder="描述具体的问题或建议..." />
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded p-3 text-xs text-amber-800 mb-4 leading-relaxed">
          <div className="font-medium mb-1">⚠️ 隐私边界</div>
          反馈到达部门长时不会附带你的具体对话内容,只有你写在反馈里的文字会被看到。
        </div>
        <div className="flex gap-2">
          <button onClick={onCancel} className="flex-1 border rounded py-2 text-sm">取消</button>
          <button onClick={() => content.trim() && onSubmit({ feedback_type: type, content, rating: null })}
            disabled={!content.trim()}
            className="flex-1 bg-blue-600 disabled:bg-slate-300 text-white rounded py-2 text-sm">提交反馈给部门长</button>
        </div>
      </div>
    </div>
  )
}
