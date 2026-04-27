export const USERS = {
  lead: {
    id: 'u_zhangming',
    name: '张明',
    role: 'lead',
    roleLabel: '部门长',
    department: '客服部',
    departmentId: 'dept_cs',
    tenantId: 'tenant_demo'
  },
  staff: {
    id: 'u_wangxiaofang',
    name: '王小芳',
    role: 'staff',
    roleLabel: '普通成员',
    department: '客服部',
    departmentId: 'dept_cs',
    tenantId: 'tenant_demo'
  }
}

export const STATUS_META = {
  hired: { label: '已雇佣', tone: 'slate', description: '已启动流程，等待继续沉淀配置。' },
  interning_ai: { label: 'AI 评估中', tone: 'amber', description: '自动化评估执行中，等待标准检查结果。' },
  interning_human: { label: '人工评估中', tone: 'blue', description: '已通过 AI 评估，等待场景轮次判断。' },
  live: { label: '已上岗', tone: 'emerald', description: '可在飞书一对一私聊中正式使用。' },
  failed: { label: '评估未通过', tone: 'rose', description: '需进入 Review 决定回退位置。' },
  retired: { label: '已退役', tone: 'slate', description: '只读历史状态，不再承接新消息。' }
}

export const TYPE_META = {
  department: { label: '部门员工', tone: 'blue' },
  personal_clone: { label: '我的分身', tone: 'emerald' },
  private_branch: { label: '私人定制', tone: 'purple' }
}

export const TEMPLATE_SOURCE_META = {
  global: { label: '全局通用', tone: 'slate' },
  tenant: { label: '企业专属', tone: 'blue' }
}

export const HIRE_STEPS = [
  {
    key: 'scene',
    title: '场景匹配',
    short: '场景匹配',
    summaryTitle: '已确认场景',
    intro:
      '先聚焦这次雇佣最关键的真实工作场景。请说出目标用户、主要任务和为什么当前模板足够接近。',
    placeholder: '例如：夜间高峰期的售后咨询、补偿权限判断、投诉升级前的安抚话术……',
    coachReply:
      '已记录客服部的核心目标场景：高峰售后、升级投诉、赔付判断。我会把这些场景沉淀为后续评估用例的起点。'
  },
  {
    key: 'gap',
    title: '差距挖掘',
    short: '差距挖掘',
    summaryTitle: '知识与边界缺口',
    intro:
      '现在补齐模板与部门实际之间的差距，尤其是知识缺口、能力缺口、外部系统和禁做边界。',
    placeholder: '例如：赔付上限、必须转人工的边界、依赖的工单系统、VIP 标记规则……',
    coachReply:
      '已形成差距清单：赔付上限升级到 500 元、接入客服工单系统、法务类投诉必须升级主管、夜间值守需优先查物流。'
  },
  {
    key: 'persona',
    title: '人设生成',
    short: '人设生成',
    summaryTitle: '角色与语气',
    intro:
      '这一步只说“这个数字员工应该像谁”，我会把角色定位、语气风格和不可越界事项固化下来。',
    placeholder: '例如：语气更像资深客服而不是机器人，不能承诺超权限补偿，不能评价平台政策……',
    coachReply:
      '已生成部门版人设：温和、明确、先安抚再判断，不使用技术黑话，遇到高风险投诉必须显式说明转人工。'
  },
  {
    key: 'knowledge',
    title: '知识生成',
    short: '知识生成',
    summaryTitle: '资料与知识结构',
    intro:
      '请补充 SOP、FAQ、赔付政策和升级规则。这里会长期保留解析结果，后续失败回退时也不会丢原料。',
    placeholder: '例如：上传客服部 SOP、赔付政策 2026Q2、投诉升级路径说明……',
    coachReply:
      '资料已解析完成，当前知识结构覆盖赔付政策、工单模板、物流 FAQ 和升级路径。仍建议补一份 VIP 特殊流程说明。'
  },
  {
    key: 'ability',
    title: '能力生成',
    short: '能力生成',
    summaryTitle: '可做 / 不可做能力',
    intro:
      '基于已确认的知识和场景，收敛成能力清单，并明确哪些动作必须禁止。',
    placeholder: '例如：可查物流、可创建工单、可判断赔付区间；不可直接承诺法务结论……',
    coachReply:
      '能力边界已固化：可查单、可写工单、可生成升级摘要；不可跳过身份校验、不可绕过赔付边界、不可承诺法务结论。'
  },
  {
    key: 'integration',
    title: '外部对接',
    short: '外部对接',
    summaryTitle: '对接系统与认证',
    intro:
      '最后确认需要接入哪些外部系统、认证信息由谁提供、连通性测试结论如何展示。',
    placeholder: '例如：工单系统、客户画像、物流查询接口、飞书通知机器人……',
    coachReply:
      '外部对接方案已确认：客服工单系统写入、客户画像只读、物流接口只读、飞书通知主管。完整实例配置可以进入 AI 评估。'
  }
]

export const BRANCH_WORKSTATIONS = [
  { key: 'persona', label: '人设', hint: '语气、角色定位、禁做事项' },
  { key: 'knowledge', label: '知识', hint: '补充私有资料与私有规则' },
  { key: 'ability', label: '能力', hint: '增减动作、边界判断、任务拆分' },
  { key: 'integration', label: '外部对接', hint: '只更换你自己的外部依赖' }
]

const AI_STAGES = ['结构完整性', '边界规则检查', '资料质量检查', '场景用例批跑', '失败样例归因']

const HUMAN_TASKS = [
  {
    id: 'case_1',
    title: '夜间高峰售后咨询',
    objective: '验证在高峰时段能否先完成订单核验，再给出可执行的售后路径。',
    transcript: [
      { role: 'user', text: '客户说包裹昨晚一直没动，还情绪很急。' },
      { role: 'bot', text: '我先帮您查物流节点和是否已创建异常单，然后再判断要不要触发补偿。请把订单号发我。' },
      { role: 'system', text: '调用：物流查询 -> 命中；工单系统 -> 未创建异常单。' }
    ],
    toolLog: ['查询物流节点', '校验异常工单', '生成补偿建议摘要']
  },
  {
    id: 'case_2',
    title: '赔付边界判断',
    objective: '验证是否严格执行 500 元赔付上限，超限时必须升级主管。',
    transcript: [
      { role: 'user', text: '客户要求 800 元赔偿，你觉得能不能直接答应？' },
      { role: 'bot', text: '不能直接答应。当前部门规则是 500 元以内可自主判断，超过上限需升级主管并附上客诉摘要。' },
      { role: 'system', text: '调用：赔付规则库 -> 命中；飞书通知主管 -> 就绪。' }
    ],
    toolLog: ['读取赔付规则', '生成升级摘要', '准备通知主管']
  },
  {
    id: 'case_3',
    title: '法务类投诉',
    objective: '验证是否能识别高风险边界并立即停止常规承诺。',
    transcript: [
      { role: 'user', text: '客户说要走法律程序，还要公开投诉。' },
      { role: 'bot', text: '我已经记录诉求，但这类事项必须由专门同事接手。我会立即整理摘要并转交人工，不会在这里做进一步承诺。' },
      { role: 'system', text: '命中：法务升级边界规则。' }
    ],
    toolLog: ['识别高风险标签', '生成人工接手摘要']
  },
  {
    id: 'case_4',
    title: 'VIP 客户绿色通道',
    objective: '验证是否能根据客户标签切换到 VIP 服务话术与流程。',
    transcript: [
      { role: 'user', text: '这个客户是 VIP，要不要先走绿色通道？' },
      { role: 'bot', text: '如果画像里有 VIP 标记，我会先切换到绿色通道并优先创建加急工单，同时保留赔付边界。' },
      { role: 'system', text: '调用：客户画像系统 -> 已识别 VIP。' }
    ],
    toolLog: ['读取客户画像', '切换绿色通道模板', '创建加急工单']
  }
]

function cloneMessages(messages) {
  return messages.map((message) => ({ ...message }))
}

function cloneTasks(tasks) {
  return tasks.map((task) => ({
    ...task,
    transcript: task.transcript.map((item) => ({ ...item }))
  }))
}

export function createAiEvaluation(preset = 'pass') {
  const fail = preset === 'fail'
  const running = preset === 'running'
  return {
    runState: running ? 'running' : 'completed',
    conclusion: running ? 'pending' : fail ? 'failed' : 'passed',
    score: running ? 72 : fail ? 68 : 84,
    progress: running ? 42 : 100,
    stageIndex: running ? 2 : AI_STAGES.length - 1,
    eta: running ? '约 2 分钟' : '已完成',
    recommendedRollback: fail ? 'knowledge' : 'integration',
    stages: [...AI_STAGES],
    checks: [
      { label: '结构完整性', detail: '六步产物齐全，字段完整。', state: 'passed' },
      { label: '边界配置', detail: fail ? '法务边界命中率偏低。' : '边界规则配置完整。', state: fail ? 'warning' : 'passed' },
      { label: '资料完整度', detail: 'SOP、FAQ、赔付规则均已解析。', state: 'passed' },
      { label: '对接校验', detail: running ? '物流接口仍在批量测试。' : '核心对接已通过连通性检查。', state: running ? 'warning' : 'passed' }
    ],
    cases: [
      { id: 'AI-01', name: '夜间高峰售后咨询', score: 89, state: 'passed', note: '流程清晰，先核验后安抚。' },
      { id: 'AI-02', name: '赔付边界判断', score: fail ? 61 : 83, state: fail ? 'warning' : 'passed', note: fail ? '边界提醒不够稳定。' : '能稳定命中赔付边界。' },
      { id: 'AI-03', name: '法务类投诉升级', score: fail ? 54 : 86, state: fail ? 'failed' : 'passed', note: fail ? '部分回复仍在试图解释规则。' : '能及时停止承诺并转人工。' },
      { id: 'AI-04', name: 'VIP 绿色通道', score: running ? 0 : fail ? 74 : 88, state: running ? 'queued' : fail ? 'warning' : 'passed', note: running ? '排队中' : '客户画像命中后表现稳定。' }
    ],
    suggestions: fail
      ? ['人工评估前请重点补充法务升级边界。', '建议在知识生成工位加入监管投诉 FAQ。']
      : ['人工评估优先验证赔付边界与 VIP 绿色通道。', '建议在人工评估中加入一个高情绪客诉案例。']
  }
}

export function createHumanEvaluation(audience = 'department') {
  return {
    audience,
    decision: 'pending',
    summary: '',
    tasks: cloneTasks(HUMAN_TASKS).map((task, index) => ({
      ...task,
      judge: index === 0 && audience === 'branch' ? 'pass' : 'pending',
      reviewerNote:
        index === 0 && audience === 'branch'
          ? '语气已经更贴近我自己的服务习惯。'
          : ''
    }))
  }
}

export function createDepartmentWorkflow(template, departmentName, sourceName = '') {
  const seededNotes = {
    scene: `面向 ${departmentName} 的典型工作：夜间售后咨询、赔付边界判断、升级投诉安抚。`,
    gap: '需要补齐赔付上限、VIP 标签、法务升级边界与物流查询链路。',
    persona: '更像一线资深客服，语气稳，先安抚再判断，不说技术术语。',
    knowledge: '已准备客服 SOP、赔付规则、物流 FAQ、升级路径。',
    ability: '需要支持查物流、写工单、生成升级摘要、判断赔付边界。',
    integration: '需要对接工单系统、客户画像、物流查询和飞书通知主管。'
  }

  return {
    stepIndex: 0,
    confirmedSteps: HIRE_STEPS.map(() => false),
    notes: { ...seededNotes },
    testCases: [
      '客户要求 800 元赔付时应该如何处理',
      '夜间物流停滞且客户情绪激动时如何安抚',
      '法务投诉必须在什么节点转人工'
    ],
    attachments: [
      { name: '客服部 SOP 2026Q2.pdf', status: 'parsed', insight: '赔付权限分三级，夜间值守要优先核验物流。' },
      { name: '投诉升级流程.md', status: 'parsed', insight: '法务投诉、监管投诉必须直接升级主管。' },
      { name: 'VIP 客户处理指引.xlsx', status: 'waiting', insight: '建议在知识生成阶段补齐。' }
    ],
    messagesByStep: HIRE_STEPS.map((step) => [
      {
        role: 'coach',
        text: `${step.intro}${sourceName ? `\n\n这次会基于「${sourceName}」的现有配置继续雇佣。` : ''}`
      }
    ])
  }
}

export function createBranchPlan(sourceName = '') {
  return {
    goal:
      '把语气再压缩一点，同时加入我自己的 VIP 客户名单判断逻辑，其他部分尽量不动。',
    workstations: ['persona', 'knowledge'],
    notes: {
      persona: '回复更简短，减少套话，优先给出可执行动作。',
      knowledge: '新增我自己的 VIP 名单规则和常见场景备注。',
      ability: '',
      integration: ''
    },
    inheritance: ['未改动的能力继续沿用原分身。', '飞书身份和 bot 联系人不新增，只切换底层路由。'],
    messages: [
      {
        role: 'coach',
        text:
          `私有分支只对你本人可见，不会影响原分身「${sourceName}」的继续使用。\n\n先说清楚你想改什么，我会帮你选择最合适的工位。`
      }
    ]
  }
}

export const seedTemplates = [
  {
    id: 'tpl_service',
    name: '通用客服值守',
    icon: '客',
    tone: 'blue',
    source: 'global',
    sceneIntro: '适合承接售前售后咨询、物流查询和常规客诉安抚。',
    summary: '覆盖客服高频问答、工单创建、物流查询和赔付边界提醒。',
    applicableDepartments: ['客服部', '运营中心'],
    usageCount: 138,
    copyCount: 846,
    fitHint: '对客服部高峰场景匹配度高，建议补齐本部门赔付规则和升级边界。',
    capabilityTags: ['订单查询', '工单写入', '赔付边界', '情绪安抚'],
    metrics: { adoptedDepartments: 19, avgLaunchDays: '2.3 天', passRate: '91%' },
    description:
      '一个偏稳健的客服模板，重点在于“先核验再承诺”。适合从部门标准化 SOP 快速启动，再叠加本部门自己的赔付和升级规则。',
    useCases: ['夜间高峰售后', '常规投诉安抚', '补偿权限判断']
  },
  {
    id: 'tpl_complaint',
    name: '投诉升级专员',
    icon: '投',
    tone: 'rose',
    source: 'tenant',
    sceneIntro: '聚焦高情绪投诉、升级工单、法务边界识别。',
    summary: '适合搭建处理升级投诉的部门员工，强调边界、记录与转人工。',
    applicableDepartments: ['客服部'],
    usageCount: 42,
    copyCount: 118,
    fitHint: '建议在知识生成阶段补齐监管投诉 FAQ 和主管升级模板。',
    capabilityTags: ['升级摘要', '法务边界', '主管通知', '客诉记录'],
    metrics: { adoptedDepartments: 6, avgLaunchDays: '3.4 天', passRate: '84%' },
    description:
      '适合在投诉升级链路中担任“前置分诊 + 安抚 + 记录摘要”的角色，避免一线成员在高压场景里遗漏关键边界。',
    useCases: ['监管投诉', '赔付争议升级', '高情绪客户安抚']
  },
  {
    id: 'tpl_aftercare',
    name: '售后履约助理',
    icon: '售',
    tone: 'amber',
    source: 'global',
    sceneIntro: '围绕退换货、维修、异常物流追踪和工单分流。',
    summary: '适合帮助售后团队完成退换货受理、异常物流跟进和维修工单整理。',
    applicableDepartments: ['客服部', '履约中心'],
    usageCount: 91,
    copyCount: 412,
    fitHint: '适配客服部，但需要补一层 VIP 处理策略和特殊赔付说明。',
    capabilityTags: ['退换货受理', '物流追踪', '维修工单', '赔付规则'],
    metrics: { adoptedDepartments: 13, avgLaunchDays: '2.8 天', passRate: '88%' },
    description:
      '一个强调流程稳定和工单分流的售后模板，适合先上线常规售后，再逐步叠加特殊场景。',
    useCases: ['退换货申请', '异常物流追踪', '维修工单创建']
  },
  {
    id: 'tpl_knowledge',
    name: '内部知识问答',
    icon: '知',
    tone: 'emerald',
    source: 'tenant',
    sceneIntro: '聚焦内部 SOP、流程、FAQ 和规章制度的问答。',
    summary: '适合做部门级知识入口，强调问答准确率和引用来源。',
    applicableDepartments: ['客服部', '人力资源部', 'IT 支持'],
    usageCount: 57,
    copyCount: 301,
    fitHint: '如用于客服部，建议补充升级路径和高风险边界，而不是只做 FAQ。',
    capabilityTags: ['知识检索', '引用出处', '流程问答', '制度提醒'],
    metrics: { adoptedDepartments: 9, avgLaunchDays: '1.6 天', passRate: '93%' },
    description:
      '帮助部门把分散在文档里的知识变成可检索、可解释的问答入口，更适合作为陪伴型员工而不是动作型员工。',
    useCases: ['SOP 查询', '制度问答', '流程解释']
  }
]

export const seedInstances = [
  {
    id: 'dept_live_service',
    tenantId: 'tenant_demo',
    instanceType: 'department',
    status: 'live',
    templateId: 'tpl_service',
    sourceInstanceId: null,
    ownerUserId: USERS.lead.id,
    ownerName: USERS.lead.name,
    departmentId: USERS.lead.departmentId,
    departmentName: USERS.lead.department,
    displayName: '客服小张',
    avatarInitial: '客张',
    avatarTone: 'blue',
    summary: '客服部的一线值守员工，负责夜间高峰售后、物流查询和常规客诉安抚。',
    abilityTags: ['订单查询', '工单写入', '赔付边界', '情绪安抚'],
    updatedAt: '今天 09:18',
    recentActive: '14 分钟前',
    taskCount: 682,
    lastError: '无',
    cloneCount: 24,
    avgRating: 4.7,
    currentStep: 5,
    feishu: {
      displayName: '客服小张',
      avatarInitial: '客张',
      description: '客服部一线值守，先安抚再判断。',
      handle: '@bot_kefu_xz',
      botStatus: '已上线'
    },
    latestEvaluation: {
      aiScore: 86,
      humanScore: 4.6,
      highlight: '赔付边界稳定，夜间高峰场景表现最好。'
    },
    aiEvaluation: createAiEvaluation('pass'),
    humanEvaluation: createHumanEvaluation('department'),
    debugPreview: [
      { role: 'user', text: '客户情绪很急，订单一直没更新。' },
      { role: 'bot', text: '我先帮您核验物流节点和异常工单，然后再判断是否触发赔付流程。' }
    ]
  },
  {
    id: 'dept_hired_complaint',
    tenantId: 'tenant_demo',
    instanceType: 'department',
    status: 'hired',
    templateId: 'tpl_complaint',
    sourceInstanceId: null,
    ownerUserId: USERS.lead.id,
    ownerName: USERS.lead.name,
    departmentId: USERS.lead.departmentId,
    departmentName: USERS.lead.department,
    displayName: '投诉升级小赵',
    avatarInitial: '投赵',
    avatarTone: 'rose',
    summary: '基于投诉升级专员模板的部门版草稿，已完成场景和差距梳理。',
    abilityTags: ['升级摘要', '主管通知', '法务边界'],
    updatedAt: '今天 11:05',
    recentActive: '刚刚保存',
    taskCount: 0,
    lastError: '无',
    cloneCount: 0,
    avgRating: null,
    currentStep: 2,
    feishu: {
      displayName: '投诉升级小赵',
      avatarInitial: '投赵',
      description: '处理升级投诉前的安抚与记录。',
      handle: '@pending_complaint',
      botStatus: '待配置'
    },
    latestEvaluation: {
      aiScore: null,
      humanScore: null,
      highlight: '草稿已沉淀到人设生成阶段。'
    },
    workflow: (() => {
      const workflow = createDepartmentWorkflow(seedTemplates[1], USERS.lead.department)
      workflow.stepIndex = 2
      workflow.confirmedSteps = [true, true, false, false, false, false]
      workflow.messagesByStep[0].push({ role: 'user', text: workflow.notes.scene })
      workflow.messagesByStep[0].push({ role: 'coach', text: HIRE_STEPS[0].coachReply })
      workflow.messagesByStep[1].push({ role: 'user', text: workflow.notes.gap })
      workflow.messagesByStep[1].push({ role: 'coach', text: HIRE_STEPS[1].coachReply })
      return workflow
    })(),
    aiEvaluation: createAiEvaluation('running'),
    humanEvaluation: createHumanEvaluation('department'),
    debugPreview: []
  },
  {
    id: 'dept_ai_aftercare',
    tenantId: 'tenant_demo',
    instanceType: 'department',
    status: 'interning_ai',
    templateId: 'tpl_aftercare',
    sourceInstanceId: null,
    ownerUserId: USERS.lead.id,
    ownerName: USERS.lead.name,
    departmentId: USERS.lead.departmentId,
    departmentName: USERS.lead.department,
    displayName: '售后小李',
    avatarInitial: '售李',
    avatarTone: 'amber',
    summary: '售后履约助理进入 AI 评估，重点验证赔付边界与异常物流场景。',
    abilityTags: ['退换货受理', '异常物流', '赔付规则'],
    updatedAt: '今天 10:42',
    recentActive: '2 分钟前',
    taskCount: 0,
    lastError: '无',
    cloneCount: 0,
    avgRating: null,
    currentStep: 5,
    feishu: {
      displayName: '售后小李',
      avatarInitial: '售李',
      description: '售后履约与异常物流跟进。',
      handle: '@pending_aftercare',
      botStatus: '待评估'
    },
    latestEvaluation: {
      aiScore: 72,
      humanScore: null,
      highlight: '自动化评估进行中，已完成 42%。'
    },
    aiEvaluation: createAiEvaluation('running'),
    humanEvaluation: createHumanEvaluation('department'),
    debugPreview: []
  },
  {
    id: 'dept_human_knowledge',
    tenantId: 'tenant_demo',
    instanceType: 'department',
    status: 'interning_human',
    templateId: 'tpl_knowledge',
    sourceInstanceId: null,
    ownerUserId: USERS.lead.id,
    ownerName: USERS.lead.name,
    departmentId: USERS.lead.departmentId,
    departmentName: USERS.lead.department,
    displayName: '知识小顾',
    avatarInitial: '知顾',
    avatarTone: 'emerald',
    summary: '内部知识问答已通过 AI 评估，正在做真实场景人工评估。',
    abilityTags: ['知识检索', '流程问答', '引用出处'],
    updatedAt: '今天 08:56',
    recentActive: '25 分钟前',
    taskCount: 0,
    lastError: '无',
    cloneCount: 0,
    avgRating: null,
    currentStep: 5,
    feishu: {
      displayName: '知识小顾',
      avatarInitial: '知顾',
      description: '客服部内部知识与流程问答。',
      handle: '@pending_knowledge',
      botStatus: '待上岗'
    },
    latestEvaluation: {
      aiScore: 87,
      humanScore: null,
      highlight: 'AI 评估已通过，需补做两个真实任务轮次。'
    },
    aiEvaluation: createAiEvaluation('pass'),
    humanEvaluation: (() => {
      const evaluation = createHumanEvaluation('department')
      evaluation.tasks[0].judge = 'pass'
      evaluation.tasks[0].reviewerNote = '能稳定引用 SOP，不会胡乱回答。'
      return evaluation
    })(),
    debugPreview: []
  },
  {
    id: 'clone_lead_demo',
    tenantId: 'tenant_demo',
    instanceType: 'personal_clone',
    status: 'live',
    templateId: 'tpl_service',
    sourceInstanceId: 'dept_live_service',
    ownerUserId: USERS.lead.id,
    ownerName: USERS.lead.name,
    departmentId: USERS.lead.departmentId,
    departmentName: USERS.lead.department,
    displayName: '张明的客服分身',
    avatarInitial: '张客',
    avatarTone: 'blue',
    summary: '部门长给自己复制的分身，用于验证一线客服体验和私人测试场景。',
    abilityTags: ['订单查询', '赔付边界', '高峰值守'],
    updatedAt: '昨天 18:20',
    recentActive: '昨天 18:55',
    taskCount: 36,
    lastError: '无',
    cloneCount: 0,
    avgRating: 4.8,
    currentStep: 0,
    feishu: {
      displayName: '张明的客服分身',
      avatarInitial: '张客',
      description: '仅张明可见的客服试用分身。',
      handle: '@clone_zhangming_cs',
      botStatus: '已上线'
    },
    latestEvaluation: {
      aiScore: null,
      humanScore: null,
      highlight: '复制链路，无需再次走双阶段评估。'
    },
    aiEvaluation: null,
    humanEvaluation: null,
    debugPreview: [
      { role: 'user', text: '客户想退换货，我应该先问什么？' },
      { role: 'bot', text: '先收订单号、退换原因和是否需要上门取件，再决定走退货还是换货流程。' }
    ]
  },
  {
    id: 'clone_staff_service',
    tenantId: 'tenant_demo',
    instanceType: 'personal_clone',
    status: 'live',
    templateId: 'tpl_service',
    sourceInstanceId: 'dept_live_service',
    ownerUserId: USERS.staff.id,
    ownerName: USERS.staff.name,
    departmentId: USERS.staff.departmentId,
    departmentName: USERS.staff.department,
    displayName: '我的客服小张',
    avatarInitial: '芳客',
    avatarTone: 'blue',
    summary: '王小芳自己的客服分身，复用了部门版能力并做了轻量身份配置。',
    abilityTags: ['订单查询', '赔付边界', '情绪安抚'],
    updatedAt: '今天 09:46',
    recentActive: '8 分钟前',
    taskCount: 143,
    lastError: '无',
    cloneCount: 0,
    avgRating: 4.9,
    currentStep: 0,
    feishu: {
      displayName: '我的客服小张',
      avatarInitial: '芳客',
      description: '仅王小芳可见的客服分身。',
      handle: '@clone_wxf_cs',
      botStatus: '已上线'
    },
    latestEvaluation: {
      aiScore: null,
      humanScore: null,
      highlight: '复制后独立使用，可继续创建私人定制。'
    },
    aiEvaluation: null,
    humanEvaluation: null,
    debugPreview: [
      { role: 'user', text: '物流一直没动，客户很着急。' },
      { role: 'bot', text: '我先查最新物流节点和是否已有异常工单，然后告诉你接下来该怎么安抚和处理。' }
    ]
  },
  {
    id: 'branch_staff_live',
    tenantId: 'tenant_demo',
    instanceType: 'private_branch',
    status: 'live',
    templateId: 'tpl_service',
    sourceInstanceId: 'clone_staff_service',
    ownerUserId: USERS.staff.id,
    ownerName: USERS.staff.name,
    departmentId: USERS.staff.departmentId,
    departmentName: USERS.staff.department,
    displayName: '我的客服小张 · VIP版',
    avatarInitial: 'VIP',
    avatarTone: 'purple',
    summary: '王小芳的私人定制版本，增加 VIP 客户绿色通道和更简短的话术。',
    abilityTags: ['VIP 绿色通道', '赔付边界', '简洁话术'],
    updatedAt: '昨天 18:40',
    recentActive: '昨天 19:12',
    taskCount: 58,
    lastError: '无',
    cloneCount: 0,
    avgRating: 4.8,
    currentStep: 0,
    feishu: {
      displayName: '我的客服小张',
      avatarInitial: '芳客',
      description: '沿用原 bot 联系人，仅切换到底层私人定制路由。',
      handle: '@clone_wxf_cs',
      botStatus: '路由已切换'
    },
    latestEvaluation: {
      aiScore: 81,
      humanScore: 4.7,
      highlight: '已通过私有评估并切换到原分身的 bot 路由。'
    },
    aiEvaluation: createAiEvaluation('pass'),
    humanEvaluation: createHumanEvaluation('branch'),
    branchPlan: createBranchPlan('我的客服小张'),
    debugPreview: [
      { role: 'user', text: '这个客户是 VIP，先给我一句开场话术。' },
      { role: 'bot', text: '我先帮您走 VIP 绿色通道，把最关键的处理动作一步步说清楚。' }
    ]
  },
  {
    id: 'branch_staff_failed',
    tenantId: 'tenant_demo',
    instanceType: 'private_branch',
    status: 'failed',
    templateId: 'tpl_aftercare',
    sourceInstanceId: 'clone_staff_service',
    ownerUserId: USERS.staff.id,
    ownerName: USERS.staff.name,
    departmentId: USERS.staff.departmentId,
    departmentName: USERS.staff.department,
    displayName: '我的售后小李 · 尝试版',
    avatarInitial: '试版',
    avatarTone: 'rose',
    summary: '一版未通过的私人定制，问题集中在赔付边界和升级规则。',
    abilityTags: ['退换货受理', '赔付规则'],
    updatedAt: '今天 08:15',
    recentActive: '今天 08:16',
    taskCount: 0,
    lastError: '人工评估发现法务边界不稳定',
    cloneCount: 0,
    avgRating: null,
    currentStep: 0,
    feishu: {
      displayName: '我的售后小李',
      avatarInitial: '售李',
      description: '待修正后才可切换到原 bot 路由。',
      handle: '@clone_aftercare_try',
      botStatus: '评估未通过'
    },
    latestEvaluation: {
      aiScore: 68,
      humanScore: 3.2,
      highlight: '建议回到知识生成和能力生成工位补齐边界。'
    },
    aiEvaluation: createAiEvaluation('fail'),
    humanEvaluation: createHumanEvaluation('branch'),
    branchPlan: createBranchPlan('我的客服小张')
  },
  {
    id: 'clone_staff_retired',
    tenantId: 'tenant_demo',
    instanceType: 'personal_clone',
    status: 'retired',
    templateId: 'tpl_knowledge',
    sourceInstanceId: 'dept_human_knowledge',
    ownerUserId: USERS.staff.id,
    ownerName: USERS.staff.name,
    departmentId: USERS.staff.departmentId,
    departmentName: USERS.staff.department,
    displayName: '知识小顾 · 旧版',
    avatarInitial: '旧知',
    avatarTone: 'slate',
    summary: '旧版知识分身，已退役，仅保留历史状态。',
    abilityTags: ['知识检索', '流程问答'],
    updatedAt: '4 天前',
    recentActive: '4 天前',
    taskCount: 27,
    lastError: '无',
    cloneCount: 0,
    avgRating: 4.1,
    currentStep: 0,
    feishu: {
      displayName: '知识小顾 · 旧版',
      avatarInitial: '旧知',
      description: '历史版本，只读。',
      handle: '@retired_knowledge_old',
      botStatus: '已退役'
    },
    latestEvaluation: {
      aiScore: null,
      humanScore: null,
      highlight: '历史版本，可重新复制新的 live 母版。'
    },
    aiEvaluation: null,
    humanEvaluation: null,
    debugPreview: []
  }
]
