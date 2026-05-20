// Demo script — sequential steps. Each step mutates state in App via a reducer-like action.
// Steps progress when user clicks "下一步" in demo bar, or by clicking specific in-page actions.

const SCRIPT = [
  // ─── Step 0: initial assistant greeting ────────────────────────────────────
  {
    id: 'greet',
    actions: [
      { type: 'msg', role: 'assistant', text: '你好，我是实例配置助手。告诉我你想搭建什么样的 Agent，我会一步步帮你准备资料、技能和外部系统对接。' },
    ],
    hint: '助手已就绪',
  },

  // ─── Step 1: user describes scenario ───────────────────────────────────────
  {
    id: 'scenario',
    actions: [
      { type: 'msg', role: 'user', text: '我想做一个售后客服 Agent，给一线客服当助手用，处理退换货咨询和订单问题。' },
      { type: 'delay', ms: 600 },
      { type: 'msg', role: 'assistant', text: '明白了。售后客服场景通常需要这几类资料：产品手册、退换货政策、常见问题 FAQ。如果还涉及订单状态查询，还会需要对接订单系统。\n\n请告诉我你手头有哪些资料？' },
    ],
    hint: '已识别业务场景',
  },

  // ─── Step 2: user lists materials → stage 1 todos appear ───────────────────
  {
    id: 'materials-listed',
    actions: [
      { type: 'msg', role: 'user', text: '我有产品手册 PDF、退换货政策文档、还有一份历史工单导出的 Excel。' },
      { type: 'delay', ms: 800 },
      { type: 'msg', role: 'assistant', text: '好的，我帮你登记成 3 条资料待办，请逐项上传或确认资料源。' },
      { type: 'addTodo', stage: 1, todo: {
        id: 'mat-1', icon: 'Doc', title: '产品手册 PDF',
        desc: '建议拆分章节后入库，便于按产品类目检索',
        tag: 'PDF · 知识库'
      }},
      { type: 'addTodo', stage: 1, todo: {
        id: 'mat-2', icon: 'Doc', title: '退换货政策文档',
        desc: '识别为政策类资料，建议作为高优先级答复依据',
        tag: 'DOCX · 政策'
      }},
      { type: 'addTodo', stage: 1, todo: {
        id: 'mat-3', icon: 'Doc', title: '历史工单数据',
        desc: '可作为 FAQ 训练源，提取高频问题与标准答复',
        tag: 'XLSX · 工单'
      }},
    ],
    hint: '阶段 ① 生成 3 条待办',
  },

  // ─── Step 3: assistant prompts confirmation ────────────────────────────────
  {
    id: 'await-confirms',
    actions: [
      { type: 'msg', role: 'assistant', text: '我在右侧列了 3 条资料待办。请在每条上传/选择资料源后点"确认可用"，我会在你确认第一条后开始推断技能。' },
    ],
    hint: '请在右侧确认资料',
    waitFor: { confirmed: { stage: 1, count: 1 } },
  },

  // ─── Step 4: after first confirm, generate skill todos (stage 2) ───────────
  {
    id: 'skills-inferred',
    auto: true, // auto-trigger when waitFor met
    actions: [
      { type: 'msg', role: 'assistant', text: '资料生效了。根据已确认资料，我推断需要这几项技能，请审核：' },
      { type: 'addTodo', stage: 2, todo: {
        id: 'skl-1', icon: 'Sparkle', title: '政策问答',
        desc: '基于退换货政策回答用户问题，命中政策原文则附引用',
        tag: 'RAG · 已绑定政策资料'
      }},
      { type: 'addTodo', stage: 2, todo: {
        id: 'skl-2', icon: 'Sparkle', title: '产品手册检索',
        desc: '按产品名/型号检索手册段落，支持多轮追问',
        tag: 'RAG · 已绑定手册'
      }},
      { type: 'addTodo', stage: 2, todo: {
        id: 'skl-3', icon: 'Sparkle', title: 'FAQ 自动答复',
        desc: '匹配历史工单标准问，置信度 ≥0.85 直接回答',
        tag: '相似匹配 · 已绑定工单'
      }},
    ],
    hint: '阶段 ② 已推断技能',
  },

  // ─── Step 5: user adds more requirement → triggers external system ─────────
  {
    id: 'external-needed',
    actions: [
      { type: 'msg', role: 'user', text: '还需要让客服能查到客户的订单状态和物流。' },
      { type: 'delay', ms: 700 },
      { type: 'msg', role: 'assistant', text: '查询订单与物流需要对接两个外部系统。我已在阶段 ③ 创建配置项，请填写接入信息。' },
      { type: 'addTodo', stage: 2, todo: {
        id: 'skl-4', icon: 'Sparkle', title: '订单状态查询',
        desc: '通过订单号或客户手机号查询订单状态，依赖外部系统',
        tag: '函数调用 · 待对接'
      }},
      { type: 'addTodo', stage: 3, todo: {
        id: 'sys-1', icon: 'Server', title: '订单中心 OMS',
        desc: '查询订单详情、状态、收货地址',
        tag: 'REST API',
        form: 'oms'
      }},
      { type: 'addTodo', stage: 3, todo: {
        id: 'sys-2', icon: 'Server', title: '物流追踪平台',
        desc: '根据运单号查询物流轨迹',
        tag: 'REST API',
        form: 'logistics'
      }},
    ],
    hint: '阶段 ③ 生成外部系统配置',
  },

  // ─── Step 6: prompt to complete everything ─────────────────────────────────
  {
    id: 'final-prompt',
    actions: [
      { type: 'msg', role: 'assistant', text: '请把剩余待办全部确认完成，三个阶段都满足后，"生成实例包"按钮会自动激活。' },
    ],
    hint: '完成所有阶段以解锁生成',
  },
];

// Form definitions for external system todos
const FORMS = {
  oms: {
    title: '订单中心 OMS · 接入配置',
    subtitle: '填写 OMS 系统的接入信息，用于订单状态查询技能',
    fields: [
      { id: 'name', label: '系统名称', type: 'text', required: true, default: '订单中心 OMS', hint: '在 Agent 中展示的名称' },
      { id: 'baseUrl', label: '服务地址', type: 'text', required: true, placeholder: 'https://oms.example.com/api/v1', monospace: true },
      { id: 'auth', label: '鉴权方式', type: 'select', required: true, options: ['Bearer Token', 'API Key (Header)', 'OAuth 2.0', 'IP 白名单'], default: 'Bearer Token' },
      { id: 'token', label: 'Token / API Key', type: 'password', required: true, placeholder: '••••••••••••', hint: '密文存储，仅在调用时解密' },
      { id: 'timeout', label: '超时时间 (ms)', type: 'number', default: '3000', col: 'half' },
      { id: 'rate', label: '调用频次上限 (QPS)', type: 'number', default: '10', col: 'half' },
    ],
  },
  logistics: {
    title: '物流追踪平台 · 接入配置',
    subtitle: '填写物流系统接入信息，用于运单轨迹查询',
    fields: [
      { id: 'name', label: '系统名称', type: 'text', required: true, default: '物流追踪平台' },
      { id: 'provider', label: '物流服务商', type: 'select', required: true, options: ['顺丰', '京东物流', '菜鸟裹裹', '通用 REST', '自建系统'], default: '通用 REST' },
      { id: 'baseUrl', label: '服务地址', type: 'text', required: true, placeholder: 'https://tracking.example.com/api', monospace: true },
      { id: 'auth', label: '鉴权方式', type: 'select', required: true, options: ['API Key (Header)', 'Bearer Token', '签名 (HMAC)'], default: 'API Key (Header)' },
      { id: 'token', label: 'API Key', type: 'password', required: true, placeholder: '••••••••••••' },
    ],
  },
};

window.SCRIPT = SCRIPT;
window.FORMS = FORMS;
