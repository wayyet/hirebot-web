// ─── Types ───────────────────────────────────────────────────────────────────

export type LifecycleStatus = '待AI评估' | '待人工评估' | '待启动' | '实习中' | '已转正' | '离职中' | '已归档'

export type EvalPhase =
  | 'pending_materials'  // step 1: 等待提交评估资料
  | 'generating_cases'   // step 2: Planner-Agent 生成测试用例
  | 'executing'          // step 3: 沙箱执行测试
  | 'evaluating'         // step 4: Evaluator-Agent 评分
  | 'retraining'         // step 4→2 loop: 重新训练中
  | 'pending_review'     // step 5: 等待人工审核
  | 'passed'             // step 6: 评估通过
  | 'eval_failed'        // 达到最大轮次，训练失败
export type GroupStatus = '活跃' | '低活跃' | '异常' | '已关闭'
export type EscalationReason = '超出权限' | '能力不足' | '用户要求' | '任务失败'
export type EscalationStatus = 'pending' | 'handled' | 'timeout'
export type WorkItemType = 'escalation' | 'config' | 'evaluation' | 'routine'

export interface EscalationRequest {
  id: string
  employeeId: string
  employeeName: string
  requestTime: string
  reason: EscalationReason
  context: string
  escalatedTo: string
  status: EscalationStatus
  priority: 'high' | 'medium' | 'low'
  imGroupId?: string
  imGroupName?: string
  imMessageLink?: string
}

export interface WorkItem {
  id: string
  type: WorkItemType
  title: string
  employeeId: string
  employeeName: string
  priority: 'high' | 'medium' | 'low'
  createdAt: string
  dueAt?: string
  description?: string
  escalationId?: string // 如果是转人工类型，关联到 EscalationRequest
}

export interface Template {
  id: string
  name: string
  oneLiner: string
  shortValueSummary: string
  primaryIndustry: string
  primaryFunction: string
  coreCapabilities: string[]
  readinessHint: string
  trustSignal: string
  onboardingRequirementLevel: '低' | '中' | '高'
  estimatedTimeToFirstValue: string
  topBenefits: string[]
  providerName: string
  versionLabel: string
  hotScore: number
  graduationRate: number
  inScopeItems: string[]
  outOfScopeItems: string[]
  requiredSystems: string[]
  optionalSystems?: string[]
  applicableScenes?: {
    enterpriseSize: string
    useScenes: string
    teamConfig: string
  }
  successCases: string[]
  relatedTemplates: string[]
}

export interface DigitalEmployee {
  id: string
  nickname: string
  roleName: string
  sourceTemplate: string
  sourceTemplateId: string
  lifecycleStatus: LifecycleStatus
  stageSummary: string
  primarySignal: string
  signalLevel: 'ok' | 'warn' | 'error'
  owningTeam: string
  createdAt: string
  internshipStartAt?: string
  graduatedAt?: string
  tasksDone: number
  tasksTotal: number
  satisfactionScore?: number
  pendingActions: string[]
  capabilities: { name: string; ready: boolean }[]
  evalPhase?: EvalPhase
  evalIteration?: number      // 当前已完成的评估轮次数
  evalMaxIterations?: number  // 最大训练轮次，默认 30
  isConfigured?: boolean      // 是否已完成雇佣配置（生成用例）
}

export interface CollaborationGroup {
  id: string
  groupName: string
  businessPurpose: string
  imPlatform: string
  imGroupId: string // IM 平台的群组 ID，用于 Deep Link
  memberCount: number
  digitalEmployeeCount: number
  recentActivityTime: string
  collaborationVolume7d: number
  status: GroupStatus
  primarySignal: string
  members: { name: string; role: string; isDigital: boolean; joinedAt: string; lastActive: string }[]
}

// ─── Templates Mock ───────────────────────────────────────────────────────────

export const templates: Template[] = [
  {
    id: 't001',
    name: '销售跟进助理',
    oneLiner: '自动追踪商机进度，帮销售团队不漏单',
    shortValueSummary: '整合 CRM 与 IM，主动提醒跟进节点，生成通话纪要，让销售专注成交而非记录',
    primaryIndustry: '通用',
    primaryFunction: '销售',
    coreCapabilities: ['商机追踪', '自动提醒', '通话纪要', 'CRM 同步'],
    readinessHint: '接入 CRM 后即可上手',
    trustSignal: '转正率 89% · 平均 3 天出首价值',
    onboardingRequirementLevel: '低',
    estimatedTimeToFirstValue: '3 天',
    topBenefits: ['减少 60% 手工录入', '商机漏跟率降低 40%', '周报自动生成'],
    providerName: 'NCrew 官方',
    versionLabel: 'v2.3',
    hotScore: 98,
    graduationRate: 89,
    inScopeItems: ['自动追踪商机状态并在关键节点提醒销售', '会议与通话后自动生成跟进纪要', '将跟进结果同步写回 CRM 字段', '识别沉默商机并主动触发唤醒任务', '按销售阶段生成下一步行动建议'],
    outOfScopeItems: ['定价决策与报价审批', '合同条款审核', '客户信用与资质评估', '替代销售与客户直接沟通'],
    requiredSystems: ['CRM 系统（Salesforce / 纷享销客 / HubSpot）', '企业 IM（飞书 / 企微）'],
    optionalSystems: ['录音转写工具（科大讯飞 / 讯飞会议）', '邮件系统（Gmail / Outlook）'],
    applicableScenes: {
      enterpriseSize: '中小企业、B2B 销售团队、SaaS 公司',
      useScenes: '销售日常跟进、商机管理、销售周报自动化',
      teamConfig: '有 CRM 系统、销售团队 5 人以上、有明确销售阶段定义',
    },
    successCases: ['某 SaaS 公司销售团队 30 人，接入后月漏单率从 18% 降至 4%'],
    relatedTemplates: ['t003', 't005'],
  },
  {
    id: 't002',
    name: '客服智能分流',
    oneLiner: '让人工坐席专注复杂问题，简单问题交给 TA',
    shortValueSummary: '基于意图识别自动分类工单，处理常见问题，超出能力边界时无缝转人工',
    primaryIndustry: '通用',
    primaryFunction: '客服',
    coreCapabilities: ['意图识别', '工单分类', '自动回复', '转人工'],
    readinessHint: '需上传 FAQ 知识库',
    trustSignal: '转正率 76% · 平均 5 天出首价值',
    onboardingRequirementLevel: '中',
    estimatedTimeToFirstValue: '5 天',
    topBenefits: ['承接 70% 标准化咨询', '响应速度提升 5x', '坐席满意度提升'],
    providerName: 'NCrew 官方',
    versionLabel: 'v1.8',
    hotScore: 92,
    graduationRate: 76,
    inScopeItems: ['智能识别客户意图并分类路由', '从知识库自动检索匹配答案', '多轮对话上下文理解与追问', '情绪识别与安抚话术切换', '自动工单分类和优先级判断', '标准化回复模板应用与发送'],
    outOfScopeItems: ['不处理涉及退款的敏感问题', '不做产品功能承诺', '不处理法律相关咨询', '复杂技术问题需升级人工'],
    requiredSystems: ['客服系统（Zendesk / 飞书工单 / 小鱼易连）', '产品知识库 - 产品手册、FAQ 文档、常见问题解答'],
    optionalSystems: ['沟通渠道配置 - 邮件、在线聊天、工单系统', '服务标准文档 - SLA 标准、升级路径、回复模板'],
    applicableScenes: {
      enterpriseSize: '中小企业、电商平台、SaaS 公司',
      useScenes: '售前咨询、产品使用指导、简单故障排查',
      teamConfig: '有客服团队、使用 CRM 系统、有标准化流程',
    },
    successCases: ['某电商平台接入后，客服人均处理量提升 2.3 倍'],
    relatedTemplates: ['t004'],
  },
  {
    id: 't003',
    name: '合同审核助理',
    oneLiner: '逐条核查合同风险点，让法务聚焦谈判',
    shortValueSummary: '解析合同文本，对照企业红线条款库，输出风险标注与修改建议',
    primaryIndustry: '通用',
    primaryFunction: '法务',
    coreCapabilities: ['合同解析', '风险标注', '条款对比', '修改建议'],
    readinessHint: '需上传企业标准合同模板与红线条款',
    trustSignal: '转正率 71% · 平均 7 天出首价值',
    onboardingRequirementLevel: '高',
    estimatedTimeToFirstValue: '7 天',
    topBenefits: ['审核效率提升 3x', '漏风险率降低 65%', '标准化留存'],
    providerName: 'NCrew 官方',
    versionLabel: 'v1.2',
    hotScore: 85,
    graduationRate: 71,
    inScopeItems: ['解析合同文本并提取结构化条款', '与企业标准合同模板逐条比对', '识别风险条款并标注风险等级', '生成结构化审核报告与修改建议', '高风险条款自动升级通知法务负责人'],
    outOfScopeItems: ['不出具正式法律意见书', '不代表企业签署任何文件', '不处理诉讼及仲裁相关事务', '超出权限的争议条款须由法务负责人裁决'],
    requiredSystems: ['企业文件存储（飞书云文档 / 企业网盘）', '法务知识库 - 标准合同模板、红线条款库'],
    optionalSystems: ['合同管理系统（DocuSign / 法大大）', '审批流程系统（飞书审批 / 钉钉审批）'],
    applicableScenes: {
      enterpriseSize: '中大型企业、有法务团队的公司',
      useScenes: '采购合同初审、合作协议审核、供应商合同批量处理',
      teamConfig: '有内部法务团队、有标准合同模板库、合同量 10 份/月以上',
    },
    successCases: ['某制造企业法务部，合同初审周期从 3 天压缩至 4 小时'],
    relatedTemplates: ['t001'],
  },
  {
    id: 't004',
    name: '数据报表生成员',
    oneLiner: '每日自动生成业务报表，再也不用等数据同学',
    shortValueSummary: '对接数据源，按预设模板定时生成报表，推送给指定负责人，支持自然语言追问',
    primaryIndustry: '通用',
    primaryFunction: '数据分析',
    coreCapabilities: ['数据拉取', '报表生成', '定时推送', '追问分析'],
    readinessHint: '需配置数据源权限',
    trustSignal: '转正率 82% · 平均 2 天出首价值',
    onboardingRequirementLevel: '中',
    estimatedTimeToFirstValue: '2 天',
    topBenefits: ['日报自动化', '数据追问零等待', '口径统一'],
    providerName: 'NCrew 官方',
    versionLabel: 'v3.1',
    hotScore: 94,
    graduationRate: 82,
    inScopeItems: ['按预设模板定时拉取数据源', '自动生成图文并茂的业务报表', '将报表推送给指定负责人', '支持自然语言追问数据细节', '关键指标异常时触发预警通知'],
    outOfScopeItems: ['不做数据治理与数据清洗', '不承担数仓建模工作', '不处理含隐私的个人敏感数据', '不替代 BI 工程师做探索性分析'],
    requiredSystems: ['数据源访问权限（BI 系统 / 数据库 / 数据平台）', '企业 IM（推送报表用）'],
    optionalSystems: ['报表模板库', '邮件系统（邮件分发报表）'],
    applicableScenes: {
      enterpriseSize: '中大型企业、运营数据驱动型团队',
      useScenes: '日报/周报/月报自动化、指标监控、跨团队数据同步',
      teamConfig: '有数据源访问权限、有固定的报表消费方、指标口径已统一',
    },
    successCases: ['某零售集团运营团队，日报生成时间从 2 小时变为 0 分钟'],
    relatedTemplates: ['t002'],
  },
  {
    id: 't005',
    name: '招聘初筛助理',
    oneLiner: '批量筛简历，让 HR 只看真正值得谈的候选人',
    shortValueSummary: '解析简历关键信息，按岗位 JD 评分排序，标注重点，支持批量初试邀约',
    primaryIndustry: '通用',
    primaryFunction: '人力资源',
    coreCapabilities: ['简历解析', 'JD 匹配评分', '初试邀约', '面试安排'],
    readinessHint: '上传 JD 即可开始',
    trustSignal: '转正率 68% · 平均 1 天出首价值',
    onboardingRequirementLevel: '低',
    estimatedTimeToFirstValue: '1 天',
    topBenefits: ['初筛时间减少 80%', '匹配精度提升', 'HR 精力解放'],
    providerName: 'NCrew 官方',
    versionLabel: 'v2.0',
    hotScore: 88,
    graduationRate: 68,
    inScopeItems: ['批量解析简历并提取结构化信息', '按岗位 JD 对候选人打分排序', '标注简历亮点与风险项', '生成初试邀约话术并批量发送', '面试日程安排与提醒'],
    outOfScopeItems: ['不做终面与 offer 评估', '不参与薪酬谈判', '不执行背景调查', '不代替 HR 做最终录用决策'],
    requiredSystems: ['岗位 JD 文档', '邮箱 / IM（用于发送邀约）'],
    optionalSystems: ['ATS 系统（Workday / 北森 / 招聘宝）', '面试评分表模板'],
    applicableScenes: {
      enterpriseSize: '中大型企业、校招季高峰期团队',
      useScenes: '社招简历初筛、校招批量处理、猎头候选人评估',
      teamConfig: '有明确岗位 JD、HR 团队 3 人以上、月均收到简历 50 份以上',
    },
    successCases: ['某互联网公司 HR 团队，校招季初筛效率提升 6 倍'],
    relatedTemplates: ['t001'],
  },
  {
    id: 't006',
    name: '内容运营助手',
    oneLiner: '多平台内容排期、生成与发布，一个人顶三个',
    shortValueSummary: '按内容日历自动生成草稿、协调审核，完成后按平台规范发布',
    primaryIndustry: '互联网',
    primaryFunction: '市场营销',
    coreCapabilities: ['内容生成', '排期管理', '多平台发布', '数据回收'],
    readinessHint: '需配置平台授权与内容风格指南',
    trustSignal: '转正率 73% · 平均 4 天出首价值',
    onboardingRequirementLevel: '中',
    estimatedTimeToFirstValue: '4 天',
    topBenefits: ['内容产出量 3x', '发布零遗漏', '数据自动汇总'],
    providerName: 'NCrew 官方',
    versionLabel: 'v1.5',
    hotScore: 80,
    graduationRate: 73,
    inScopeItems: ['按内容日历自动生成文章/图文草稿', '协调内容审核流程并追踪进度', '按平台规范完成多渠道定时发布', '收集各平台互动数据并汇总报告', '基于数据反馈优化内容方向建议'],
    outOfScopeItems: ['不制定品牌策略与年度内容规划', '不执行付费广告投放', '不处理舆情危机公关', '不替代创意团队做原创策划'],
    requiredSystems: ['内容平台 API（微信公众号 / 小红书 / 抖音）', '内容审核流程系统（飞书审批 / 企微审批）'],
    optionalSystems: ['内容管理平台（ContentCal / 蒲公英）', '数据分析工具（友盟 / 神策）'],
    applicableScenes: {
      enterpriseSize: '中小企业、品牌团队、MCN 机构',
      useScenes: '多平台内容同步发布、内容日历执行、数据复盘',
      teamConfig: '有内容运营团队、多平台账号已授权、内容风格指南已定义',
    },
    successCases: ['某品牌团队，月均内容产出从 20 篇增至 65 篇'],
    relatedTemplates: ['t004'],
  },
  {
    id: 't007',
    name: '财务对账助手',
    oneLiner: '自动核对账单，把财务从每月 3 天对账中解放出来',
    shortValueSummary: '对接银行流水与 ERP 系统，自动完成账单匹配、差异标注与异常预警，生成可审计的对账报告',
    primaryIndustry: '通用',
    primaryFunction: '财务',
    coreCapabilities: ['账单匹配', '差异识别', '异常预警', '对账报告'],
    readinessHint: '需配置银行与 ERP 数据源权限',
    trustSignal: '转正率 84% · 平均 2 天出首价值',
    onboardingRequirementLevel: '中',
    estimatedTimeToFirstValue: '2 天',
    topBenefits: ['月对账耗时从 3 天→4 小时', '漏账率接近 0', '报告自动生成'],
    providerName: 'NCrew 官方',
    versionLabel: 'v2.1',
    hotScore: 91,
    graduationRate: 84,
    inScopeItems: ['自动拉取银行流水与 ERP 账单数据', '按规则逐笔匹配，标注匹配状态', '识别金额差异、重复入账、缺失凭证等异常', '生成结构化对账报告，支持导出 Excel', '高金额差异自动推送预警给财务负责人'],
    outOfScopeItems: ['不执行实际转账或付款操作', '不出具正式财务报表', '不处理税务申报与合规事项', '汇率换算以当日中间价为准，不保证精确'],
    requiredSystems: ['银行流水数据（网银导出 / 银企直连）', 'ERP 系统（用友 / 金蝶 / SAP）'],
    optionalSystems: ['财务共享平台', '企业 IM（推送预警）'],
    applicableScenes: {
      enterpriseSize: '中大型企业、多账户管理团队',
      useScenes: '月度对账、银企核对、多主体合并核算',
      teamConfig: '有独立财务团队、ERP 系统已上线、月均账单量 500 条以上',
    },
    successCases: ['某制造企业财务部，月度对账从 3 人 3 天压缩为 1 人半天'],
    relatedTemplates: ['t004'],
  },
  {
    id: 't008',
    name: '项目进度追踪员',
    oneLiner: '里程碑异动第一时间感知，让项目延期不再成既成事实',
    shortValueSummary: '自动同步项目管理工具数据，识别延期风险，按责任人推送提醒，生成项目周报',
    primaryIndustry: '通用',
    primaryFunction: '项目管理',
    coreCapabilities: ['进度同步', '风险识别', '定向提醒', '周报生成'],
    readinessHint: '接入项目管理工具即可启动',
    trustSignal: '转正率 79% · 平均 3 天出首价值',
    onboardingRequirementLevel: '低',
    estimatedTimeToFirstValue: '3 天',
    topBenefits: ['延期感知提前 3-5 天', 'PM 汇报准备时间减少 70%', '责任链路清晰'],
    providerName: 'NCrew 官方',
    versionLabel: 'v1.9',
    hotScore: 87,
    graduationRate: 79,
    inScopeItems: ['实时同步项目管理工具中的任务与里程碑状态', '识别即将逾期（72 小时内）的任务并发送提醒', '分析关键路径，预判整体项目延期风险', '每周自动生成项目进展周报，推送给 PM 和干系人', '跨项目资源占用冲突检测'],
    outOfScopeItems: ['不代替 PM 做项目决策与优先级排期', '不处理项目预算管理', '不执行任务分配与人员调配', '不参与需求评审与验收'],
    requiredSystems: ['项目管理工具（Jira / 飞书项目 / Teambition）', '企业 IM（推送提醒与周报）'],
    optionalSystems: ['日历系统（里程碑日历同步）', '汇报模板文档库'],
    applicableScenes: {
      enterpriseSize: '中大型企业、研发团队、多项目并行团队',
      useScenes: '研发项目跟进、交付里程碑管理、跨团队协同',
      teamConfig: '有项目管理工具、项目数量 3 个以上、有固定周报接收方',
    },
    successCases: ['某互联网公司研发团队，季度交付达成率从 68% 提升至 89%'],
    relatedTemplates: ['t001', 't004'],
  },
  {
    id: 't009',
    name: '员工入职引导员',
    oneLiner: '让新员工第一天就感受到专业，HR 不再手忙脚乱',
    shortValueSummary: '自动触发入职清单、收集材料、开通系统权限，全程引导新员工完成入职流程',
    primaryIndustry: '通用',
    primaryFunction: '人力资源',
    coreCapabilities: ['入职清单', '材料收集', '权限申请', '进度追踪'],
    readinessHint: '配置 HR 系统与 IT 工单接口后即可启动',
    trustSignal: '转正率 81% · 平均 1 天出首价值',
    onboardingRequirementLevel: '低',
    estimatedTimeToFirstValue: '1 天',
    topBenefits: ['HR 入职耗时减少 60%', '新员工漏配率降至 0', '体验评分提升'],
    providerName: 'NCrew 官方',
    versionLabel: 'v2.0',
    hotScore: 83,
    graduationRate: 81,
    inScopeItems: ['新员工报到当天自动触发欢迎消息与入职清单', '逐步引导收集身份证、学历、劳动合同等入职材料', '自动提交 IT 工单申请账号、邮箱、系统权限', '追踪各环节完成状态，逾期自动催促', '入职满 7/30 天自动发送关怀问卷'],
    outOfScopeItems: ['不做薪酬谈判与 offer 确认', '不替代 HR 做背景调查', '不处理外籍员工签证相关事务', '试用期评估须由用人部门主管完成'],
    requiredSystems: ['HR 系统（Workday / 北森 / 飞书人事）', '企业 IM（与新员工沟通）'],
    optionalSystems: ['IT 工单系统（Jira Service / 钉钉工单）', '电子签平台（法大大 / DocuSign）'],
    applicableScenes: {
      enterpriseSize: '中大型企业、快速扩张团队',
      useScenes: '社招入职流程、校招批量入职、跨城市远程入职',
      teamConfig: '有 HR 信息系统、月均新员工 5 人以上、入职流程已标准化',
    },
    successCases: ['某快消公司 HR 团队，校招季 200 人入职，HR 专员工作量降低 55%'],
    relatedTemplates: ['t005'],
  },
  {
    id: 't010',
    name: '会议纪要助手',
    oneLiner: '开完会 5 分钟内拿到纪要，待办事项自动分发',
    shortValueSummary: '接入会议录音，自动转写、提炼决议与行动项，按责任人推送确认，存入知识库',
    primaryIndustry: '通用',
    primaryFunction: '行政效率',
    coreCapabilities: ['语音转写', '要点提炼', '待办分发', '知识沉淀'],
    readinessHint: '接入录音工具或会议平台即可',
    trustSignal: '转正率 88% · 平均 1 天出首价值',
    onboardingRequirementLevel: '低',
    estimatedTimeToFirstValue: '1 天',
    topBenefits: ['纪要准备时间减少 90%', '行动项追踪落地率提升 40%', '知识积累自动化'],
    providerName: 'NCrew 官方',
    versionLabel: 'v3.0',
    hotScore: 96,
    graduationRate: 88,
    inScopeItems: ['对接会议录音（腾讯会议 / 飞书会议 / 讯飞录音）进行自动转写', '提炼会议背景、讨论要点、决议结果与行动项', '按责任人将待办事项推送至 IM，并设置截止日期', '会议纪要结构化存入团队知识库', '跟踪待办完成情况，逾期自动提醒'],
    outOfScopeItems: ['不处理涉密会议内容', '不代替参会人做决策确认', '转写准确率受录音质量影响，方言场景需人工复核', '不执行行动项，只负责追踪'],
    requiredSystems: ['录音转写工具（腾讯会议 / 飞书会议 / 科大讯飞）', '企业 IM（待办分发）'],
    optionalSystems: ['知识管理系统（飞书知识库 / Notion / Confluence）', '项目管理工具（行动项同步）'],
    applicableScenes: {
      enterpriseSize: '各规模企业均适用',
      useScenes: '周会纪要、客户拜访记录、决策会议存档',
      teamConfig: '有线上会议工具、会议频率高（每周 5 场以上）、有明确行动项跟踪需求',
    },
    successCases: ['某咨询公司，顾问每周节省 2 小时会后整理时间，行动项落实率从 61% 升至 87%'],
    relatedTemplates: ['t008'],
  },
  {
    id: 't011',
    name: '供应链风险预警员',
    oneLiner: '提前感知供应商异动，让断供危机消灭在萌芽阶段',
    shortValueSummary: '监控供应商交货、质量、舆情与资质数据，识别风险信号，触发提前预警与备货建议',
    primaryIndustry: '制造 / 零售',
    primaryFunction: '供应链',
    coreCapabilities: ['交货监控', '质检异常', '舆情扫描', '备货建议'],
    readinessHint: '需对接采购系统与供应商数据',
    trustSignal: '转正率 72% · 平均 7 天出首价值',
    onboardingRequirementLevel: '高',
    estimatedTimeToFirstValue: '7 天',
    topBenefits: ['断供事件减少 50%', '风险感知提前 2 周', '采购决策有数据支撑'],
    providerName: 'NCrew 官方',
    versionLabel: 'v1.3',
    hotScore: 78,
    graduationRate: 72,
    inScopeItems: ['实时同步供应商交货率、质量检测结果数据', '监控供应商企业公开舆情与工商变更信息', '识别交货延迟、质量下滑、资质到期等风险信号', '生成供应商风险评分并推送预警报告', '触发备货建议与备选供应商启用流程'],
    outOfScopeItems: ['不执行采购合同签署', '不直接联系供应商进行谈判', '舆情数据依赖公开信息，内部经营信息无法覆盖', '最终供应商切换决策须采购团队人工确认'],
    requiredSystems: ['采购管理系统（SAP / 用友 / 自研系统）', '质量检测系统（QMS）'],
    optionalSystems: ['企业征信数据源（天眼查 API / 启信宝）', '企业 IM（推送预警）'],
    applicableScenes: {
      enterpriseSize: '中大型制造企业、零售连锁、跨境电商',
      useScenes: '核心供应商日常监控、采购季风险管理、供应链韧性提升',
      teamConfig: '有采购管理系统、关键供应商超过 20 家、有专职供应链团队',
    },
    successCases: ['某汽车零部件企业，关键物料断供次数从每季度 4 次降至 0 次'],
    relatedTemplates: ['t007'],
  },
  {
    id: 't012',
    name: '竞品情报助手',
    oneLiner: '每周自动汇总竞品动态，让你的决策比竞对快一步',
    shortValueSummary: '定期抓取竞品官网、发布日志、社媒动态与招聘信息，提炼战略信号，生成情报简报',
    primaryIndustry: '互联网 / 通用',
    primaryFunction: '市场营销',
    coreCapabilities: ['信息采集', '信号提炼', '趋势对比', '情报简报'],
    readinessHint: '配置监控目标与关键词即可启动',
    trustSignal: '转正率 75% · 平均 3 天出首价值',
    onboardingRequirementLevel: '低',
    estimatedTimeToFirstValue: '3 天',
    topBenefits: ['情报收集效率 5x', '战略信号不遗漏', '简报自动到达决策层'],
    providerName: 'NCrew 官方',
    versionLabel: 'v1.7',
    hotScore: 82,
    graduationRate: 75,
    inScopeItems: ['定期采集竞品官网更新、产品发布、价格变动', '监控竞品社媒账号发布内容与互动数据', '分析竞品招聘信息，推断战略方向与投入重点', '对比自身与竞品的功能差异，生成对照表', '每周输出竞品情报简报，推送给管理层与产品团队'],
    outOfScopeItems: ['不采集竞品内部非公开数据', '不进行任何违反平台 ToS 的爬虫行为', '情报分析为辅助参考，战略决策须人工研判', '不承诺情报的完整性与实时性'],
    requiredSystems: ['竞品监控目标列表（URL / 账号 / 关键词）', '企业 IM（简报推送）'],
    optionalSystems: ['知识管理系统（情报存档）', '内部产品文档（功能对比基准）'],
    applicableScenes: {
      enterpriseSize: '初创到中大型企业均适用',
      useScenes: '产品规划参考、竞品定价监控、市场进入决策',
      teamConfig: '有明确的竞品清单（3-10 个）、有产品或市场团队作为情报消费方',
    },
    successCases: ['某 SaaS 公司，产品团队提前 3 周感知到竞对功能发布，完成差异化调整'],
    relatedTemplates: ['t006', 't004'],
  },
  {
    id: 't013',
    name: '采购询价助手',
    oneLiner: '批量询价、自动比价，采购周期缩短一半',
    shortValueSummary: '根据需求清单批量联系供应商获取报价，结构化比价分析，推荐性价比最优方案',
    primaryIndustry: '通用',
    primaryFunction: '采购',
    coreCapabilities: ['批量询价', '报价收集', '比价分析', '推荐报告'],
    readinessHint: '上传供应商名录与采购需求即可启动',
    trustSignal: '转正率 77% · 平均 2 天出首价值',
    onboardingRequirementLevel: '低',
    estimatedTimeToFirstValue: '2 天',
    topBenefits: ['询价效率提升 3x', '比价漏项率降至 0', '成本节约可视化'],
    providerName: 'NCrew 官方',
    versionLabel: 'v1.6',
    hotScore: 85,
    graduationRate: 77,
    inScopeItems: ['根据采购清单批量发送询价邮件 / IM 消息给供应商', '结构化收集并整理各供应商报价与交期', '按价格、交期、质量资质等多维度生成比价表', '标注历史价格趋势，识别异常高价', '输出采购推荐方案报告，供采购专员决策'],
    outOfScopeItems: ['不代替采购专员签署合同', '不执行付款操作', '供应商资质核实须采购团队人工确认', '涉及战略采购与框架协议的谈判须由采购总监主导'],
    requiredSystems: ['供应商名录与联系方式', '邮件系统 / IM（发送询价）'],
    optionalSystems: ['采购管理系统（录入比价结果）', '历史采购价格数据库'],
    applicableScenes: {
      enterpriseSize: '中小企业、电商 / 零售、制造企业采购部门',
      useScenes: '日常物资采购、项目物料询价、年框前比价',
      teamConfig: '有明确供应商名录、采购需求频率高（每月 3 次以上）',
    },
    successCases: ['某电商公司运营部，每次采购询价耗时从 2 天缩短至半天，年节省采购成本约 8%'],
    relatedTemplates: ['t011'],
  },
]

// ─── Digital Employees Mock ───────────────────────────────────────────────────

export const digitalEmployees: DigitalEmployee[] = [
  {
    id: 'e006',
    nickname: '小营',
    roleName: '内容运营助手',
    sourceTemplate: '内容运营助手',
    sourceTemplateId: 't006',
    lifecycleStatus: '待AI评估',
    stageSummary: '已提交岗位素材，等待进入评估流程',
    primarySignal: '待操作：开始评估',
    signalLevel: 'warn',
    owningTeam: '市场部',
    createdAt: '2026-04-18',
    tasksDone: 0,
    tasksTotal: 0,
    pendingActions: ['上传内容风格指南', '配置平台授权'],
    capabilities: [
      { name: '内容生成', ready: false },
      { name: '排期管理', ready: false },
      { name: '多平台发布', ready: false },
      { name: '数据回收', ready: false },
    ],
    evalPhase: 'pending_materials',
    evalIteration: 0,
  },
  {
    id: 'e007',
    nickname: '小表',
    roleName: '数据报表生成员',
    sourceTemplate: '数据报表生成员',
    sourceTemplateId: 't004',
    lifecycleStatus: '待AI评估',
    stageSummary: '已上传数据源配置，准备开始评估训练',
    primarySignal: '待操作：开始评估',
    signalLevel: 'warn',
    owningTeam: '财务部',
    createdAt: '2026-04-19',
    tasksDone: 0,
    tasksTotal: 0,
    pendingActions: ['确认报表模板格式'],
    capabilities: [
      { name: '数据拉取', ready: false },
      { name: '报表生成', ready: false },
      { name: '定时推送', ready: false },
      { name: '追问分析', ready: false },
    ],
    evalPhase: 'pending_materials',
    evalIteration: 0,
  },
  {
    id: 'e001',
    nickname: '小追',
    roleName: '销售跟进助理',
    sourceTemplate: '销售跟进助理',
    sourceTemplateId: 't001',
    lifecycleStatus: '已转正',
    stageSummary: '已稳定运行 32 天，本周处理 47 个商机跟进',
    primarySignal: '运行正常',
    signalLevel: 'ok',
    owningTeam: '华东销售团队',
    createdAt: '2026-02-10',
    internshipStartAt: '2026-02-11',
    graduatedAt: '2026-03-05',
    tasksDone: 312,
    tasksTotal: 320,
    satisfactionScore: 4.7,
    pendingActions: [],
    capabilities: [
      { name: '商机追踪', ready: true },
      { name: '自动提醒', ready: true },
      { name: '通话纪要', ready: true },
      { name: 'CRM 同步', ready: true },
    ],
    evalPhase: 'passed',
    evalIteration: 2,
  },
  {
    id: 'e002',
    nickname: '小筛',
    roleName: '客服智能分流',
    sourceTemplate: '客服智能分流',
    sourceTemplateId: 't002',
    lifecycleStatus: '待人工评估',
    stageSummary: 'AI评估已通过，等待人工评估确认上岗',
    primarySignal: '待操作：执行人工评估',
    signalLevel: 'ok',
    owningTeam: '客服中心',
    createdAt: '2026-04-08',
    internshipStartAt: '2026-04-08',
    tasksDone: 0,
    tasksTotal: 0,
    satisfactionScore: undefined,
    pendingActions: [],
    capabilities: [
      { name: '意图识别', ready: true },
      { name: '工单分类', ready: true },
      { name: '自动回复', ready: true },
      { name: '转人工', ready: true },
    ],
    evalPhase: 'passed',
    evalIteration: 2,
  },
  {
    id: 'e003',
    nickname: '小审',
    roleName: '合同审核助理',
    sourceTemplate: '合同审核助理',
    sourceTemplateId: 't003',
    lifecycleStatus: '实习中',
    stageSummary: '实习第 3 天，红线条款库已上传，等待管理员配置文档系统权限',
    primarySignal: '待操作：配置文档系统权限',
    signalLevel: 'error',
    owningTeam: '法务部',
    createdAt: '2026-04-13',
    internshipStartAt: '2026-04-13',
    tasksDone: 5,
    tasksTotal: 40,
    satisfactionScore: undefined,
    pendingActions: ['配置文档系统只读权限', '完成 2 份合同试审并确认'],
    capabilities: [
      { name: '合同解析', ready: true },
      { name: '风险标注', ready: true },
      { name: '条款对比', ready: false },
      { name: '修改建议', ready: false },
    ],
    evalPhase: 'executing',
    evalIteration: 1,
  },
  {
    id: 'e004',
    nickname: '小报',
    roleName: '数据报表生成员',
    sourceTemplate: '数据报表生成员',
    sourceTemplateId: 't004',
    lifecycleStatus: '已转正',
    stageSummary: '已自主运行 61 天，每日准时生成 5 份报表',
    primarySignal: '运行正常',
    signalLevel: 'ok',
    owningTeam: '运营中心',
    createdAt: '2026-02-01',
    internshipStartAt: '2026-02-02',
    graduatedAt: '2026-02-20',
    tasksDone: 410,
    tasksTotal: 415,
    satisfactionScore: 4.9,
    pendingActions: [],
    capabilities: [
      { name: '数据拉取', ready: true },
      { name: '报表生成', ready: true },
      { name: '定时推送', ready: true },
      { name: '追问分析', ready: true },
    ],
    evalPhase: 'passed',
    evalIteration: 1,
  },
  {
    id: 'e005',
    nickname: '小招',
    roleName: '招聘初筛助理',
    sourceTemplate: '招聘初筛助理',
    sourceTemplateId: 't005',
    lifecycleStatus: '离职中',
    stageSummary: '员工已离职，工作已交接',
    primarySignal: '已离职',
    signalLevel: 'ok',
    owningTeam: 'HR 团队',
    createdAt: '2026-04-15',
    tasksDone: 0,
    tasksTotal: 0,
    satisfactionScore: undefined,
    pendingActions: [],
    capabilities: [
      { name: '简历解析', ready: true },
      { name: 'JD 匹配评分', ready: true },
      { name: '初试邀约', ready: true },
      { name: '面试安排', ready: true },
    ],
    evalPhase: 'passed',
    evalIteration: 1,
  },
]

// ─── Collaboration Groups Mock ────────────────────────────────────────────────

export const collaborationGroups: CollaborationGroup[] = [
  {
    id: 'g001',
    groupName: '华东销售作战群',
    businessPurpose: '整合销售线索、商机跟进与客户资料，支持华东区 Q2 冲刺',
    imPlatform: '飞书',
    imGroupId: 'oc_a5b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6', // 飞书群组 ID
    memberCount: 12,
    digitalEmployeeCount: 1,
    recentActivityTime: '10 分钟前',
    collaborationVolume7d: 238,
    status: '活跃',
    primarySignal: '运行正常，小追本周处理 47 次跟进',
    members: [
      { name: '张明', role: '销售总监', isDigital: false, joinedAt: '2026-02-10', lastActive: '今天' },
      { name: '李晓华', role: '销售经理', isDigital: false, joinedAt: '2026-02-10', lastActive: '今天' },
      { name: '小追', role: '销售跟进助理', isDigital: true, joinedAt: '2026-02-11', lastActive: '5 分钟前' },
    ],
  },
  {
    id: 'g002',
    groupName: '客服运营协同群',
    businessPurpose: '客服分流协作，处理工单升级与知识库更新',
    imPlatform: '飞书',
    imGroupId: 'oc_b6c7d8e9f0g1h2i3j4k5l6m7n8o9p0q1', // 飞书群组 ID
    memberCount: 8,
    digitalEmployeeCount: 1,
    recentActivityTime: '1 小时前',
    collaborationVolume7d: 156,
    status: '活跃',
    primarySignal: '注意：小筛有 3 个问题类型分流准确率偏低',
    members: [
      { name: '王芳', role: '客服主管', isDigital: false, joinedAt: '2026-04-08', lastActive: '今天' },
      { name: '小筛', role: '客服智能分流', isDigital: true, joinedAt: '2026-04-08', lastActive: '1 小时前' },
    ],
  },
  {
    id: 'g003',
    groupName: '法务合同评审群',
    businessPurpose: '合同初审协作，法务与业务方共同确认风险点',
    imPlatform: '企业微信',
    imGroupId: 'wrOgQhDgAAUwcEaEAAAA', // 企业微信群组 ID
    memberCount: 5,
    digitalEmployeeCount: 1,
    recentActivityTime: '3 天前',
    collaborationVolume7d: 12,
    status: '低活跃',
    primarySignal: '低活跃：小审权限未配置，已暂停工作 3 天',
    members: [
      { name: '陈律', role: '法务总监', isDigital: false, joinedAt: '2026-04-13', lastActive: '3 天前' },
      { name: '小审', role: '合同审核助理', isDigital: true, joinedAt: '2026-04-13', lastActive: '3 天前' },
    ],
  },
  {
    id: 'g004',
    groupName: '运营数据看板群',
    businessPurpose: '每日运营数据自动播报与异常预警',
    imPlatform: '飞书',
    imGroupId: 'oc_c7d8e9f0g1h2i3j4k5l6m7n8o9p0q1r2', // 飞书群组 ID
    memberCount: 15,
    digitalEmployeeCount: 1,
    recentActivityTime: '今天 08:00',
    collaborationVolume7d: 35,
    status: '活跃',
    primarySignal: '运行正常，每日准时推送 5 份报表',
    members: [
      { name: '刘总', role: 'COO', isDigital: false, joinedAt: '2026-02-01', lastActive: '今天' },
      { name: '小报', role: '数据报表生成员', isDigital: true, joinedAt: '2026-02-02', lastActive: '今天 08:00' },
    ],
  },
]

// ─── Escalation Requests Mock ─────────────────────────────────────────────────

export const escalationRequests: EscalationRequest[] = [
  {
    id: 'esc001',
    employeeId: 'e002',
    employeeName: '小筛',
    requestTime: '2026-04-17 14:23',
    reason: '用户要求',
    context: '用户张三在客服群中要求退款 5000 元，理由是产品质量问题。小筛判断此退款金额超出自动处理范围，需要客服主管确认。',
    escalatedTo: '王芳（客服主管）',
    status: 'pending',
    priority: 'high',
    imGroupId: 'g002',
    imGroupName: '客服运营协同群',
    imMessageLink: 'feishu://open?groupId=oc_b6c7d8e9f0g1h2i3j4k5l6m7n8o9p0q1&messageId=msg_001',
  },
  {
    id: 'esc002',
    employeeId: 'e003',
    employeeName: '小审',
    requestTime: '2026-04-17 10:15',
    reason: '能力不足',
    context: '在审核"XX公司服务协议"时，发现第 8 条付款条款与企业标准模板差异较大，小审置信度仅 52%，建议法务总监人工确认。',
    escalatedTo: '陈律（法务总监）',
    status: 'pending',
    priority: 'high',
    imGroupId: 'g003',
    imGroupName: '法务合同评审群',
    imMessageLink: 'wecom://open?groupId=wrOgQhDgAAUwcEaEAAAA&messageId=msg_002',
  },
  {
    id: 'esc003',
    employeeId: 'e002',
    employeeName: '小筛',
    requestTime: '2026-04-16 16:45',
    reason: '超出权限',
    context: '用户李四要求查看其他部门的工单处理记录，小筛当前权限仅限本部门数据，已升级给客服主管。',
    escalatedTo: '王芳（客服主管）',
    status: 'handled',
    priority: 'medium',
    imGroupId: 'g002',
    imGroupName: '客服运营协同群',
  },
  {
    id: 'esc004',
    employeeId: 'e001',
    employeeName: '小追',
    requestTime: '2026-04-15 09:30',
    reason: '超出权限',
    context: '客户王总要求特殊折扣 25%，超出小追的审批权限（最高 15%），已升级给销售总监。',
    escalatedTo: '张明（销售总监）',
    status: 'handled',
    priority: 'high',
    imGroupId: 'g001',
    imGroupName: '华东销售作战群',
  },
]

// ─── Work Items Mock ──────────────────────────────────────────────────────────

export const workItems: WorkItem[] = [
  // 转人工请求
  {
    id: 'wi001',
    type: 'escalation',
    title: '客户要求退款审批',
    employeeId: 'e002',
    employeeName: '小筛',
    priority: 'high',
    createdAt: '2026-04-17 14:23',
    dueAt: '2026-04-17 18:00',
    description: '用户张三要求退款 5000 元，需要客服主管确认',
    escalationId: 'esc001',
  },
  {
    id: 'wi002',
    type: 'escalation',
    title: '合同条款需要法务确认',
    employeeId: 'e003',
    employeeName: '小审',
    priority: 'high',
    createdAt: '2026-04-17 10:15',
    dueAt: '2026-04-17 17:00',
    description: '付款条款与标准模板差异较大，置信度 52%',
    escalationId: 'esc002',
  },
  
  // 配置缺口
  {
    id: 'wi003',
    type: 'config',
    title: '配置文档系统只读权限',
    employeeId: 'e003',
    employeeName: '小审',
    priority: 'high',
    createdAt: '2026-04-13',
    description: '需要管理员配置文档系统访问权限才能开始合同审核',
  },
  {
    id: 'wi004',
    type: 'config',
    title: '上传招聘 JD 文件',
    employeeId: 'e005',
    employeeName: '小招',
    priority: 'medium',
    createdAt: '2026-04-15',
    description: '上传岗位 JD 后才能启动简历筛选',
  },
  {
    id: 'wi005',
    type: 'config',
    title: '补充未覆盖 FAQ 3 条',
    employeeId: 'e002',
    employeeName: '小筛',
    priority: 'medium',
    createdAt: '2026-04-16',
    description: '有 3 个高频问题尚未在知识库中覆盖',
  },
  
  // 评估关注
  {
    id: 'wi006',
    type: 'evaluation',
    title: '完成 2 份合同试审并确认',
    employeeId: 'e003',
    employeeName: '小审',
    priority: 'high',
    createdAt: '2026-04-13',
    description: '实习期评估：需要完成 2 份合同试审',
  },
  {
    id: 'wi007',
    type: 'evaluation',
    title: '确认转人工阈值',
    employeeId: 'e002',
    employeeName: '小筛',
    priority: 'medium',
    createdAt: '2026-04-16',
    description: '当前转人工阈值可能过于保守，建议调整',
  },
  
  // 常规待办
  {
    id: 'wi008',
    type: 'routine',
    title: '确认初试邀约模板',
    employeeId: 'e005',
    employeeName: '小招',
    priority: 'medium',
    createdAt: '2026-04-15',
    description: '确认初试邀约的邮件模板',
  },
  {
    id: 'wi009',
    type: 'routine',
    title: '完成工作交接',
    employeeId: 'e001',
    employeeName: '销售跟进助理',
    priority: 'medium',
    createdAt: '2026-04-10',
    description: '离职流程：交接进行中的商机',
  },
]
