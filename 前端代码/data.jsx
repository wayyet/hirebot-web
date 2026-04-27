/* global window */
// === Mock data + small store ===

const TINTS = ["green","orange","blue","purple","pink","gray"];

const TEMPLATES = [
  {
    id: "tpl_hr_assist",
    name: "HR 助手",
    initial: "H",
    tint: "blue",
    source: "全局通用",
    summary: "覆盖招聘 JD 撰写、候选人筛选、面试纪要整理等高频 HR 场景，开箱即可基于本部门制度做微调。",
    sectors: ["HR", "招聘", "员工关系"],
    used: 128,
    cloned: 312,
    capabilities: [
      "根据岗位要求生成 JD 草稿",
      "解析简历并按招聘标准排序候选人",
      "整理面试录音为结构化纪要",
      "回答员工常见的福利、考勤、入离调转问题"
    ],
    cants: [
      "不直接对外发送 offer 与合同",
      "不替代背调或法律意见"
    ],
    tags: ["AI增强","信息处理"]
  },
  {
    id: "tpl_contract",
    name: "合同审核员",
    initial: "C",
    tint: "purple",
    source: "企业专属",
    summary: "面向法务和业务部门，按企业合同模板与红线规则审阅合同条款，标注风险点并给出修改建议。",
    sectors: ["法务", "采购", "销售"],
    used: 64,
    cloned: 89,
    capabilities: [
      "对照企业合同红线检查条款",
      "标注风险条款并给出修订建议",
      "比对供应商合同与往期版本差异",
      "导出审阅报告供律师复核"
    ],
    cants: [
      "不替代律师签署",
      "不提供管辖法域之外的意见"
    ],
    tags: ["信息处理","工具"]
  },
  {
    id: "tpl_qa",
    name: "客服质检员",
    initial: "Q",
    tint: "green",
    source: "全局通用",
    summary: "对客服会话和录音做合规与服务质量质检，按企业话术体系打分并产出改进建议。",
    sectors: ["客服", "运营"],
    used: 91,
    cloned: 204,
    capabilities: [
      "按话术规范对会话打分",
      "识别敏感词与违规承诺",
      "汇总每日质检报告",
      "为客服员工生成个人辅导建议"
    ],
    cants: [
      "不直接处罚员工",
      "不修改 CRM 工单"
    ],
    tags: ["信息处理","工具"]
  },
  {
    id: "tpl_lead",
    name: "销售线索分析师",
    initial: "L",
    tint: "orange",
    source: "全局通用",
    summary: "从企业 CRM、官网表单、活动签到中聚合线索，做意向分级、ICP 匹配与每日洞察推送。",
    sectors: ["销售", "市场"],
    used: 47,
    cloned: 138,
    capabilities: [
      "汇总多渠道线索并去重",
      "按 ICP 给线索打分分级",
      "每日推送高意向客户名单",
      "生成销售跟进话术建议"
    ],
    cants: [
      "不直接联系客户",
      "不修改公海规则"
    ],
    tags: ["AI增强","工具"]
  },
  {
    id: "tpl_research",
    name: "行业研究员",
    initial: "R",
    tint: "pink",
    source: "企业专属",
    summary: "围绕指定行业做信息聚合、竞争格局拆解、关键事件追踪，并产出周报供管理层阅读。",
    sectors: ["战略", "市场"],
    used: 33,
    cloned: 70,
    capabilities: [
      "采集公开行业信息",
      "拆解竞争对手动态",
      "撰写行业月报与观察",
      "回答行业基础问题"
    ],
    cants: [
      "不发布对外文章",
      "不进行交易性建议"
    ],
    tags: ["信息处理","AI增强"]
  },
  {
    id: "tpl_finops",
    name: "费控审核员",
    initial: "F",
    tint: "gray",
    source: "全局通用",
    summary: "审核员工报销与请款单据，按企业差旅、招待、采购规则提示异常并标注合规风险。",
    sectors: ["财务", "行政"],
    used: 22,
    cloned: 41,
    capabilities: [
      "校验报销单据完整性",
      "对照差旅与招待标准提示异常",
      "汇总月度预算执行情况",
      "回答员工常见报销问题"
    ],
    cants: [
      "不直接审批付款",
      "不替代税务申报"
    ],
    tags: ["信息处理","开发工具"]
  }
];

// Department-version employees (部门员工) — what's in 部门数字员工
// statuses: hired | interning_ai | interning_human | live | failed | retired
const DEPT_EMPLOYEES = [
  {
    id: "de_hr_2024",
    type: "department",
    name: "招聘小慧",
    initial: "招",
    tint: "blue",
    template: "tpl_hr_assist",
    status: "live",
    desc: "面向研发与产品部门的招聘场景，熟悉本司 JD 模板与面试评估表。",
    owner: "李部门长",
    dept: "研发部",
    updated: "2 小时前",
    tags: ["AI增强","HR"],
    runs: 128,
    cloned: 12,
    activeAt: "刚刚"
  },
  {
    id: "de_contract_2024",
    type: "department",
    name: "合同小审",
    initial: "审",
    tint: "purple",
    template: "tpl_contract",
    status: "interning_human",
    desc: "面向研发部供应商与外采合同，已加载企业合同模板与红线清单。",
    owner: "李部门长",
    dept: "研发部",
    updated: "今天 11:24",
    tags: ["信息处理"],
    runs: 0,
    cloned: 0,
    evalProgress: 62
  },
  {
    id: "de_qa_2024",
    type: "department",
    name: "服务小检",
    initial: "检",
    tint: "green",
    template: "tpl_qa",
    status: "interning_ai",
    desc: "覆盖售前售后双场景质检，已接入会话样本与企业话术规范。",
    owner: "李部门长",
    dept: "研发部",
    updated: "今天 09:08",
    tags: ["信息处理"],
    runs: 0,
    cloned: 0,
    evalProgress: 38
  },
  {
    id: "de_lead_2024",
    type: "department",
    name: "线索小掘",
    initial: "掘",
    tint: "orange",
    template: "tpl_lead",
    status: "hired",
    desc: "对接企业 CRM 与官网表单，待完善 ICP 评分规则。",
    owner: "李部门长",
    dept: "研发部",
    updated: "昨天",
    tags: ["AI增强","工具"],
    runs: 0,
    cloned: 0,
    hireProgress: 4 // step index
  },
  {
    id: "de_research_2024",
    type: "department",
    name: "行业小研",
    initial: "研",
    tint: "pink",
    template: "tpl_research",
    status: "live",
    desc: "覆盖企业服务、AI 基础设施两条赛道。",
    owner: "李部门长",
    dept: "研发部",
    updated: "3 天前",
    tags: ["信息处理"],
    runs: 86,
    cloned: 5,
    activeAt: "1 小时前"
  },
  {
    id: "de_finops_2024",
    type: "department",
    name: "费控小核",
    initial: "核",
    tint: "gray",
    template: "tpl_finops",
    status: "failed",
    desc: "AI 评估发现差旅边界判定不一致，需要回退到差距挖掘工位。",
    owner: "李部门长",
    dept: "研发部",
    updated: "昨天 17:42",
    tags: ["信息处理"],
    runs: 0,
    cloned: 0,
    failedReason: "差距挖掘"
  }
];

// 我的数字员工 — owned by current user (mix of clones, branches, and dept-owned for 部门长)
const MY_EMPLOYEES = [
  {
    id: "pc_hr_li",
    type: "personal_clone", // 我的分身
    name: "招聘小慧 · 李工",
    initial: "李",
    tint: "blue",
    parent: "de_hr_2024",
    parentName: "招聘小慧",
    template: "tpl_hr_assist",
    status: "live",
    desc: "我的招聘助手，记得我经常招后端 / 算法两类岗位。",
    owner: "李部门长",
    updated: "今天 14:08",
    tags: ["我的分身","HR"],
    runs: 42,
    activeAt: "12 分钟前"
  },
  {
    id: "pb_hr_li_offer",
    type: "private_branch", // 私人定制
    name: "招聘小慧 · 我的 Offer 版",
    initial: "Of",
    tint: "purple",
    parent: "pc_hr_li",
    parentName: "招聘小慧 · 李工",
    template: "tpl_hr_assist",
    status: "interning_ai",
    desc: "在我的分身基础上，定制了 offer 谈判话术与薪资测算逻辑。",
    owner: "李部门长",
    updated: "今天 10:30",
    tags: ["私人定制"],
    evalProgress: 71,
    runs: 0
  },
  {
    id: "pc_research_li",
    type: "personal_clone",
    name: "行业小研 · 李工",
    initial: "研",
    tint: "pink",
    parent: "de_research_2024",
    parentName: "行业小研",
    template: "tpl_research",
    status: "live",
    desc: "每周一早上把 AI Infra 赛道周报推送到我的飞书。",
    owner: "李部门长",
    updated: "昨天",
    tags: ["我的分身"],
    runs: 19,
    activeAt: "今天 08:00"
  },
  {
    id: "pc_qa_old",
    type: "personal_clone",
    name: "客服小检 · 旧版",
    initial: "旧",
    tint: "gray",
    parent: "de_qa_2024",
    parentName: "服务小检",
    template: "tpl_qa",
    status: "retired",
    desc: "已退役，使用记录可作为历史对照。",
    owner: "李部门长",
    updated: "上月 28 日",
    tags: ["历史"],
    runs: 230,
    activeAt: "—"
  }
];

const STATUS_LABEL = {
  hired: { text: "已雇佣", cls: "hired", desc: "等待进入评估" },
  interning_ai: { text: "AI 评估中", cls: "ai", desc: "AI 自动化评估" },
  interning_human: { text: "人工评估中", cls: "human", desc: "用户在飞书轮次评估" },
  live: { text: "已上岗", cls: "live", desc: "可在飞书私聊使用" },
  failed: { text: "评估失败", cls: "failed", desc: "等待 Review 决策" },
  retired: { text: "已退役", cls: "retired", desc: "只读" }
};

const TYPE_LABEL = {
  template: "模板",
  department: "部门员工",
  personal_clone: "我的分身",
  private_branch: "私人定制"
};

// Hire flow steps
const HIRE_STEPS = [
  { id: "scene", title: "场景匹配", hint: "目标场景 / 用户 / 任务 / 模板适配度" },
  { id: "gap", title: "差距挖掘", hint: "知识缺口 / 能力缺口 / 外部系统 / 禁做边界" },
  { id: "persona", title: "人设生成", hint: "角色定位 / 语气 / 不可越界事项" },
  { id: "knowledge", title: "知识生成", hint: "资料上传 / 解析结果 / 知识结构预览" },
  { id: "ability", title: "能力生成", hint: "能力清单 / 可做与不可做边界" },
  { id: "external", title: "外部对接", hint: "系统清单 / 认证 / 连通性测试" }
];

// Department + my employees combined helper
function findEmployeeById(id) {
  return DEPT_EMPLOYEES.find(e => e.id === id) || MY_EMPLOYEES.find(e => e.id === id);
}
function findTemplateById(id) {
  return TEMPLATES.find(t => t.id === id);
}

Object.assign(window, {
  TEMPLATES, DEPT_EMPLOYEES, MY_EMPLOYEES,
  STATUS_LABEL, TYPE_LABEL, HIRE_STEPS, TINTS,
  findEmployeeById, findTemplateById
});
