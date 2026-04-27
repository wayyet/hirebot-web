// ==== Mock API ====
// 对应文档 § 12 接口规格,所有调用返回 Promise + 模拟网络延迟
// 真实接入后,把这里替换为 fetch / axios 调用即可,函数签名保持不变

import { seedTemplates } from './seed.js'

const delay = (ms = 300) => new Promise(r => setTimeout(r, ms))
const uid = (prefix) => `${prefix}_${Math.random().toString(36).slice(2, 8)}`

// § 12.1.1 GET /api/templates - 模板池查询
export async function fetchTemplates(query = {}) {
  await delay(200)
  return { code: 0, data: seedTemplates }
}

// § 12.1.2 GET /api/templates/{id}
export async function fetchTemplateById(id) {
  await delay(200)
  return { code: 0, data: seedTemplates.find(t => t.id === id) }
}

// § 12.2.1 POST /api/coach/start - 启动 digital_employee_discovery
// mode: 'hire_department' | 'hire_personal_clone' | 'hire_private_branch'
export async function startCoach({ mode, based_on_template_id, based_on_instance_id }) {
  await delay(800)
  const sandbox_id = uid('sb')
  return { code: 0, data: { sandbox_id, mode, started_at: Date.now() } }
}

// 模拟教练对话(单步)- 简化版,真实环境是 SSE 流
export async function postCoachMessage({ sandbox_id, step, message }) {
  await delay(900 + Math.random() * 600)
  // 返回模拟的下一条 AI 回复(真实环境由 LLM 实时生成)
  const replies = {
    scene_match: '收到,我已记录这两个场景,正进入下一步差距挖掘。',
    gap_dig: '理解,差距已记录。我会把"补偿上限"和"工单系统"在后续工位中写入。',
    manifest: 'manifest 已生成。已写入耐心、同理心、SOP 升级路径等关键描述。',
    ontology: '正在结构化您上传的文档。SOP/政策/FAQ 已识别完成。',
    skill: '能力清单已生成,共 4 个核心 skill。',
    cli: '外部对接配置完成。即将进入评估阶段。'
  }
  return { code: 0, data: { reply: replies[step] || '收到,继续。' } }
}

// § 12.2.2 POST /api/evaluator/start - 启动 AI 评估
export async function startEvaluation({ instance_id, test_case_set_id }) {
  await delay(500)
  return { code: 0, data: { eval_id: uid('eval'), started_at: Date.now() } }
}

// 模拟拉取评估进度(真实环境是 SSE/WebSocket 推送)
export async function fetchEvalProgress(eval_id) {
  await delay(300)
  return { code: 0, data: { progress: Math.min(100, (window.__evalProgress__ || 0) + 25) } }
}

// 提交人工评估
export async function submitHumanEval({ instance_id, cases, decision }) {
  await delay(400)
  return { code: 0, data: { passed: decision === 'pass' } }
}

// 复制分身(快照式独立 § 3.3)
export async function clonePersonalInstance({ from_instance_id, display_name, display_avatar, display_description }) {
  await delay(2000) // 真实场景含沙箱启动 P95 ≤ 30s,此处模拟 2s
  return {
    code: 0,
    data: {
      instance_id: uid('inst_clone'),
      bot_identity_id: uid('bot'),
      feishu_bot_handle: uid('fh'),
      display_name, display_avatar, display_description,
      status: 'live'
    }
  }
}

// § 12.3.1 POST /api/feishu/bot-identity - 注册飞书 bot 身份
export async function registerBotIdentity({ instance_id, display_name, display_avatar, display_description }) {
  await delay(800)
  return {
    code: 0,
    data: {
      bot_identity_id: uid('bot'),
      feishu_bot_handle: uid('fh'),
      registered_at: Date.now()
    }
  }
}

// § 12.3.4 DELETE /api/feishu/bot-identity/{id} - 退役 bot
export async function retireBotIdentity(bot_identity_id) {
  await delay(400)
  return { code: 0 }
}

// 校验同 owner 下 display_name 唯一性 (§ 11.2 关键约束)
export async function checkDisplayNameUnique({ owner_user_id, display_name }) {
  await delay(150)
  // 此处简化,真实环境查 BOT_IDENTITY 表
  return { code: 0, data: { unique: true } }
}

// 给某条对话评分
export async function submitRating({ instance_id, conversation_id, rating, comment }) {
  await delay(300)
  return { code: 0 }
}

// 提交反馈
export async function submitFeedback(payload) {
  await delay(400)
  return { code: 0, data: { feedback_id: uid('fb') } }
}

// 模拟飞书消息 - 用户发送、bot 回复
export async function sendFeishuMessage({ instance_id, text }) {
  await delay(800 + Math.random() * 1500) // 模拟模型推理 P95 ≤ 8s
  // 极简的回复策略,基于关键词模式 - 真实环境是 LLM
  const replies = [
    { match: ['SO', 'SF', '订单'], reply: (t) => `已为您查到订单状态:\n\n📦 已发货\n承运商:顺丰\n当前位置:深圳福田中转站\n预计到达:明天下午\n\n还有什么我可以帮您的?` },
    { match: ['投诉', '不满', '差评'], reply: () => '非常抱歉给您带来困扰。我先了解一下具体情况,可以告诉我订单号吗?同时请放心,我们会按公司规定保障您的权益。' },
    { match: ['退款', '退货', '退换'], reply: () => '我帮您处理退换货。需要您提供:\n① 订单号\n② 退换原因\n③ 是否需要上门取件\n\n收到信息后我会立刻为您生成工单。' },
    { match: ['SQL', '数据', '报表'], reply: () => '帮您生成 SQL:\n```sql\nSELECT date, count(*) FROM orders\nWHERE created_at >= NOW() - INTERVAL 7 DAY\nGROUP BY date;\n```\n是否需要我执行并返回结果?' },
    { match: ['评分', '/评分'], reply: () => '感谢您愿意评分!请使用顶部"⭐ 评分"按钮对最近一次回复打分。' }
  ]
  const matched = replies.find(r => r.match.some(k => text.includes(k)))
  const reply = matched ? matched.reply(text) : `收到您的消息。我会基于已学习的部门 SOP 为您处理。能再多告诉我一些上下文吗?`
  return { code: 0, data: { reply, message_id: uid('msg'), at: Date.now() } }
}

// 退役实例
export async function retireInstance(instance_id) {
  await delay(400)
  return { code: 0 }
}
