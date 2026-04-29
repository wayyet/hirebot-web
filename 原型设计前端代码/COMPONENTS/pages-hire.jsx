/* global window, React */
const { useState: _useStateH, useEffect: _useEffectH, useRef: _useRefH } = React;

const HIRE_V2_STYLE_ID = "ncrew-hire-v2-style";
const HIRE_V2_CACHE_PREFIX = "ncrew-hire-v2";

const DOC_REQUIREMENTS = [
  {
    id: "business",
    label: "业务资料",
    desc: "帮助数字员工理解岗位背景、制度边界与业务上下文。",
    patterns: [/业务/i, /资料/i, /制度/i, /流程/i, /知识/i]
  }
];

const HIRE_PHASES = [
  {
    id: 1,
    title: "了解数字员工",
    description: "完成自我介绍，理解雇佣流程与整体目标。",
    summary: "认识这位即将上岗的数字同事，明确岗位定位、交付物和推进节奏。"
  },
  {
    id: 2,
    title: "上传业务资料",
    description: "上传知识库、产品手册、FAQ 和服务话术。",
    summary: "通过文件上传和文字补充，让数字员工先“知道业务”。"
  },
  {
    id: 3,
    title: "文件解析与循环补全",
    description: "持续归档已识别材料，追问缺失项直到补齐。",
    summary: "每轮补充后立即解析、提示缺口，并允许继续闭环。"
  },
  {
    id: 4,
    title: "配置技能模块",
    description: "采纳推荐技能，或上传 / 生成新的执行能力。",
    summary: "为数字员工补齐查询、处理、升级三类核心执行能力。"
  },
  {
    id: 5,
    title: "对接外部系统",
    description: "配置 CRM、OMS、工单系统和 IM 接入平台。",
    summary: "填写系统连接参数并通过连通性测试，让技能真正跑起来。"
  },
  {
    id: 6,
    title: "生成实例包",
    description: "打包资料、技能和系统配置，生成可部署成果。",
    summary: "汇总入职档案，导出部署包并准备进入 AI 评估。"
  }
];

const PROCESS_STEPS = [
  {
    id: "docs",
    label: "业务资料",
    short: "上传与补全",
    phase: 2
  },
  {
    id: "skills",
    label: "技能模块",
    short: "采纳与生成",
    phase: 4
  },
  {
    id: "integrations",
    label: "外部系统",
    short: "连接与测试",
    phase: 5
  },
  {
    id: "package",
    label: "生成实例",
    short: "打包与交付",
    phase: 6
  }
];

const RECOMMENDED_SKILLS = [
  {
    id: "resume-ranker",
    name: "简历排序",
    type: "查询类技能",
    description: "根据岗位要求自动解读候选人简历，输出排序结果与筛选理由。",
    dependency: "ATS / 候选人数据库",
    trigger: "用户要求筛选候选人、比较匹配度或批量整理简历时触发"
  }
];

const INTEGRATION_DEFINITIONS = [
  {
    id: "crm",
    name: "CRM 系统",
    purpose: "读取客户画像、历史会话与会员信息。"
  }
];

const HIRE_V2_STYLES = String.raw`
.hire-flow-v2 {
  --surface: #ffffff;
  --surface-strong: #ffffff;
  --surface-soft: #fafafa;
  --surface-dark: #171717;
  --line: #ececec;
  --line-soft: #f5f5f5;
  --text: #0a0a0a;
  --body: #404040;
  --text-soft: #737373;
  --caption: #9ca3af;
  --accent: #4a6cf7;
  --accent-strong: #3654d4;
  --accent-warm: #ff7043;
  --good: #10b981;
  --good-deep: #15803d;
  --good-bg: #ecfdf5;
  --good-border: #d1fae5;
  --pending: #d4d4d8;
  --shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
  --shadow-lift: 0 8px 24px rgba(0, 0, 0, 0.06);
  --shadow-cta: 0 4px 12px rgba(0, 0, 0, 0.12);
  --radius-xl: 20px;
  --radius-lg: 22px;
  --radius-md: 16px;
  --radius-sm: 12px;
  position: relative;
  border-radius: 28px;
  overflow: hidden;
  padding: 18px 24px 24px;
}

.hire-flow-v2 * {
  box-sizing: border-box;
}

.hire-flow-v2 button,
.hire-flow-v2 input,
.hire-flow-v2 textarea {
  font: inherit;
}

.hire-flow-v2 button {
  border: 0;
  cursor: pointer;
}

.hire-flow-v2 .app-shell {
  position: relative;
  z-index: 1;
}

.hire-flow-v2 .topbar,
.hire-flow-v2 .layout {
  position: relative;
  z-index: 1;
}

.hire-flow-v2 .topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 10px;
}

.hire-flow-v2 .topbar h1,
.hire-flow-v2 .panel-head h2,
.hire-flow-v2 .drawer-head h3 {
  margin: 4px 0 0;
  letter-spacing: -0.03em;
  color: var(--text);
}

.hire-flow-v2 .topbar h1 {
  font-size: clamp(1.65rem, 3vw, 2.25rem);
  line-height: 1.08;
  overflow-wrap: anywhere;
}

.hire-flow-v2 .eyebrow {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  font-size: 0.66rem;
  color: var(--caption);
}

.hire-flow-v2 .topbar-actions {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.hire-flow-v2 .layout {
  display: grid;
  grid-template-columns: minmax(0, 1.28fr) minmax(280px, 0.92fr);
  gap: 18px;
  align-items: start;
}

.hire-flow-v2 .journey-strip {
  position: relative;
  z-index: 1;
  margin-bottom: 14px;
  padding: 8px 0 14px;
}

.hire-flow-v2 .journey-strip-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 12px;
}

.hire-flow-v2 .journey-strip-head h2 {
  margin: 4px 0 0;
  font-size: 1.55rem;
  letter-spacing: -0.03em;
}

.hire-flow-v2 .journey-summary {
  max-width: 560px;
  margin: 0;
  color: var(--text-soft);
  font-size: 0.92rem;
  line-height: 1.55;
}

.hire-flow-v2 .step-bar {
  display: flex;
  align-items: flex-start;
}

.hire-flow-v2 .step-pill {
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 0;
  background: transparent;
  color: var(--text);
  text-align: center;
  transition: opacity 0.18s ease;
}

.hire-flow-v2 .step-pill:hover {
  opacity: 0.72;
}

.hire-flow-v2 .step-pill:not(:last-child)::after {
  content: "";
  position: absolute;
  top: 14px;
  left: 50%;
  width: 100%;
  height: 2px;
  background: var(--line);
  z-index: 0;
}

.hire-flow-v2 .step-pill.is-done:not(:last-child)::after {
  background: var(--good-border);
}

.hire-flow-v2 .step-pill.is-active:not(:last-child)::after {
  background: linear-gradient(90deg, #c8d5fa 0%, var(--line) 100%);
}

.hire-flow-v2 .step-index {
  position: relative;
  z-index: 1;
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  font-size: 0.84rem;
  font-weight: 700;
  background: #e8e8e8;
  color: var(--text-soft);
  border: 2px solid transparent;
}

.hire-flow-v2 .step-pill.is-active .step-index {
  background: #e8edff;
  color: var(--accent-strong);
  border-color: var(--accent);
}

.hire-flow-v2 .step-pill.is-done .step-index {
  background: var(--good-bg);
  color: var(--good-deep);
  border-color: var(--good);
}

.hire-flow-v2 .step-copy {
  display: flex;
  flex-direction: column;
  gap: 2px;
  text-align: center;
  min-width: 0;
}

.hire-flow-v2 .step-copy strong,
.hire-flow-v2 .step-copy small {
  display: block;
  overflow-wrap: anywhere;
}

.hire-flow-v2 .step-copy strong {
  font-size: 0.88rem;
}

.hire-flow-v2 .step-copy small {
  color: var(--text-soft);
  font-size: 0.76rem;
}

.hire-flow-v2 .panel {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 68vh;
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: var(--radius-xl);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.hire-flow-v2 .chat-panel,
.hire-flow-v2 .todo-panel {
  height: calc(100vh - 310px);
  min-height: 560px;
  background: #ffffff;
}

.hire-flow-v2 .panel-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  padding: 16px 18px 14px;
  border-bottom: 1px solid var(--line);
}

.hire-flow-v2 .chat-panel .panel-head {
  justify-content: flex-start;
  align-items: center;
}

.hire-flow-v2 .panel-head h2 {
  font-size: 1.35rem;
}

.hire-flow-v2 .employee-chip,
.hire-flow-v2 .score-card {
  border-radius: 999px;
  background: var(--surface);
  border: 1px solid var(--line);
}

.hire-flow-v2 .employee-chip {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px 8px 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}

.hire-flow-v2 .avatar {
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  border-radius: 11px;
  background: #dde9ff;
  color: #3d5cff;
  font-weight: 700;
  font-size: 0.95rem;
}

.hire-flow-v2 .employee-chip strong,
.hire-flow-v2 .employee-chip span,
.hire-flow-v2 .score-card span,
.hire-flow-v2 .score-card small {
  display: block;
}

.hire-flow-v2 .employee-chip span,
.hire-flow-v2 .score-card small,
.hire-flow-v2 .muted {
  color: var(--text-soft);
  font-size: 0.83rem;
}

.hire-flow-v2 .chat-feed,
.hire-flow-v2 .todo-groups {
  padding: 16px 18px 14px;
  overflow: auto;
  min-width: 0;
}

.hire-flow-v2 .chat-feed {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
  scroll-behavior: smooth;
}

.hire-flow-v2 .message-row {
  display: flex;
  gap: 10px;
}

.hire-flow-v2 .message-row.user {
  flex-direction: row-reverse;
}

.hire-flow-v2 .bubble {
  max-width: min(84%, 640px);
  padding: 14px 16px;
  border-radius: 18px;
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.08);
  min-width: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.hire-flow-v2 .message-row.user .bubble {
  background: #f8fafc;
  border-color: #e2e8f0;
  color: var(--body);
}

.hire-flow-v2 .message-row.agent .bubble {
  border-top-left-radius: 8px;
}

.hire-flow-v2 .message-row.user .bubble {
  border-top-right-radius: 8px;
}

.hire-flow-v2 .message-title {
  margin: 0 0 6px;
  font-size: 0.96rem;
  font-weight: 600;
  color: var(--text);
}

.hire-flow-v2 .message-body {
  margin: 0;
  font-size: 0.93rem;
  line-height: 1.62;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  color: var(--body);
}

.hire-flow-v2 .message-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.hire-flow-v2 .message-detail {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed #e7e5e4;
}

.hire-flow-v2 .message-detail p {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.6;
  color: var(--body);
}

.hire-flow-v2 .message-list {
  margin: 8px 0 0;
  padding-left: 18px;
  color: var(--body);
}

.hire-flow-v2 .message-list li {
  line-height: 1.58;
}

.hire-flow-v2 .message-plain-item {
  padding-bottom: 10px;
  border-bottom: 1px solid var(--line-soft);
}

.hire-flow-v2 .message-plain-item:last-child {
  padding-bottom: 0;
  border-bottom: 0;
}

.hire-flow-v2 .message-code-block,
.hire-flow-v2 .package-tree {
  margin: 10px 0 0;
  padding: 10px 12px;
  border-radius: 12px;
  background: #fafaf9;
  border: 1px solid var(--line);
  color: var(--body);
  font-size: 0.82rem;
  line-height: 1.6;
  white-space: pre-wrap;
  overflow: auto;
}

.hire-flow-v2 .inline-action,
.hire-flow-v2 .tool-btn,
.hire-flow-v2 .ghost-btn,
.hire-flow-v2 .primary-btn,
.hire-flow-v2 .send-btn,
.hire-flow-v2 .card-action,
.hire-flow-v2 .icon-btn {
  transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease, color 0.18s ease;
}

.hire-flow-v2 .inline-action,
.hire-flow-v2 .tool-btn,
.hire-flow-v2 .ghost-btn,
.hire-flow-v2 .card-action {
  padding: 8px 12px;
  border-radius: 999px;
  background: var(--surface);
  color: var(--text);
  border: 1px solid #e5e5e5;
}

.hire-flow-v2 .inline-action:hover,
.hire-flow-v2 .tool-btn:hover,
.hire-flow-v2 .ghost-btn:hover,
.hire-flow-v2 .primary-btn:hover,
.hire-flow-v2 .send-btn:hover,
.hire-flow-v2 .todo-item:hover,
.hire-flow-v2 .card-action:hover,
.hire-flow-v2 .drawer-panel button:hover,
.hire-flow-v2 .icon-btn:hover {
  transform: translateY(-1px);
}

.hire-flow-v2 .primary-btn,
.hire-flow-v2 .send-btn {
  padding: 10px 16px;
  border-radius: 999px;
  color: white;
  background: #000000;
  box-shadow: var(--shadow-cta);
}

.hire-flow-v2 .primary-btn:hover,
.hire-flow-v2 .send-btn:hover {
  background: #1a1a1a;
}

.hire-flow-v2 .card-action.primary {
  background: #000000;
  color: white;
  border-color: #000000;
}

.hire-flow-v2 .card-action-adopted {
  background: var(--good-bg);
  color: var(--good-deep);
  border-color: var(--good-border);
  cursor: default;
}

.hire-flow-v2 .score-card {
  min-width: 84px;
  padding: 8px 12px;
  text-align: center;
}

.hire-flow-v2 .score-card span {
  font-size: 1.18rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.hire-flow-v2 .composer {
  padding: 14px 18px 18px;
  border-top: 1px solid var(--line);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.72), rgba(255, 255, 255, 0.98));
  position: sticky;
  bottom: 0;
  z-index: 2;
}

.hire-flow-v2 .composer-tools {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.hire-flow-v2 .input-wrap {
  flex: 1;
  border: 1px solid #e5e5e5;
  border-radius: 14px;
  background: var(--surface);
  padding: 14px 16px;
  transition: background 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
}

.hire-flow-v2 .input-wrap.active {
  background: #f8fbff;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(74, 108, 247, 0.12);
}

.hire-flow-v2 .composer-box {
  display: flex;
  align-items: stretch;
}

.hire-flow-v2 textarea,
.hire-flow-v2 input {
  width: 100%;
  border: 1px solid #e5e5e5;
  border-radius: 12px;
  background: var(--surface);
  padding: 12px 14px;
  outline: none;
  color: var(--text);
}

.hire-flow-v2 textarea:focus,
.hire-flow-v2 input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(74, 108, 247, 0.2);
}

.hire-flow-v2 textarea {
  resize: vertical;
  min-height: 62px;
  font-size: 0.93rem;
}

.hire-flow-v2 .chat-input {
  border: 0;
  box-shadow: none;
  padding: 0;
  min-height: 84px;
}

.hire-flow-v2 .chat-input:focus {
  border: 0;
  box-shadow: none;
}

.hire-flow-v2 .input-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-top: 8px;
  border-top: 1px solid var(--line-soft);
  margin-top: 8px;
}

.hire-flow-v2 .send-btn {
  min-width: 78px;
  min-height: 48px;
  flex: 0 0 auto;
}

.hire-flow-v2 .todo-groups {
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
}

.hire-flow-v2 .todo-item {
  padding: 14px;
  border-radius: 16px;
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.06);
  transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
  text-align: left;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.hire-flow-v2 .todo-item.active {
  border-color: rgba(74, 108, 247, 0.3);
  box-shadow: 0 4px 16px rgba(74, 108, 247, 0.12);
}

.hire-flow-v2 .todo-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}

.hire-flow-v2 .todo-status {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.78rem;
  white-space: normal;
  flex-shrink: 0;
}

.hire-flow-v2 .status-icon {
  display: inline-grid;
  place-items: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  font-size: 0.72rem;
  font-weight: 700;
  background: #efefef;
  color: #737373;
}

.hire-flow-v2 .status-pending .status-icon {
  color: #737373;
}

.hire-flow-v2 .status-active .status-icon {
  background: #e8edff;
  color: var(--accent);
}

.hire-flow-v2 .status-done .status-icon {
  background: #e6f5ec;
  color: var(--good-deep);
}

.hire-flow-v2 .todo-item h3,
.hire-flow-v2 .todo-item p {
  margin: 0;
}

.hire-flow-v2 .todo-item h3 {
  font-size: 0.95rem;
}

.hire-flow-v2 .todo-item p {
  margin-top: 6px;
  font-size: 0.9rem;
  color: var(--body);
  line-height: 1.55;
}

.hire-flow-v2 .todo-progress {
  width: 100%;
  height: 6px;
  margin-top: 12px;
  overflow: hidden;
  border-radius: 999px;
  background: #f1f1f1;
}

.hire-flow-v2 .todo-progress span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #000000 0%, var(--accent-warm) 100%);
}

.hire-flow-v2 .todo-subtasks {
  display: grid;
  gap: 8px;
  margin-top: 12px;
}

.hire-flow-v2 .subtask-chip {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 9px 10px;
  border-radius: 12px;
  background: var(--surface-soft);
  font-size: 0.86rem;
  text-align: left;
  border: 1px solid var(--line-soft);
}

.hire-flow-v2 .subtask-chip.done strong {
  color: var(--good-deep);
}

.hire-flow-v2 .subtask-chip.active strong {
  color: var(--accent);
}

.hire-flow-v2 .subtask-chip.pending strong {
  color: var(--text-soft);
}

.hire-flow-v2 .subtask-chip-action {
  width: 100%;
  cursor: pointer;
}

.hire-flow-v2 .subtask-label-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.hire-flow-v2 .subtask-hint {
  font-size: 0.76rem;
  color: var(--text-soft);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 180px;
}

.hire-flow-v2 .todo-package-preview {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed var(--line);
}

.hire-flow-v2 .todo-package-preview p {
  margin: 0;
  font-size: 0.88rem;
  line-height: 1.58;
  color: var(--body);
}

.hire-flow-v2 .todo-package-preview p + p,
.hire-flow-v2 .todo-package-preview .package-tree {
  margin-top: 8px;
}

.hire-flow-v2 .todo-package-name {
  font-weight: 600;
  color: var(--text);
}

.hire-flow-v2 .typing {
  display: inline-flex;
  gap: 6px;
  align-items: center;
}

.hire-flow-v2 .typing span {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: rgba(74, 108, 247, 0.7);
  animation: ncrew-hire-pulse 1s ease-in-out infinite;
}

.hire-flow-v2 .typing span:nth-child(2) {
  animation-delay: 0.12s;
}

.hire-flow-v2 .typing span:nth-child(3) {
  animation-delay: 0.24s;
}

.hire-flow-v2 .drawer,
.hire-flow-v2 .skill-modal {
  position: fixed;
  inset: 0;
  z-index: 120;
}

.hire-flow-v2 .drawer-mask,
.hire-flow-v2 .skill-modal-mask {
  position: absolute;
  inset: 0;
  background: rgba(16, 24, 22, 0.34);
}

.hire-flow-v2 .drawer-panel {
  position: absolute;
  top: 0;
  right: 0;
  width: min(460px, 100%);
  height: 100%;
  padding: 24px;
  background: var(--surface-dark);
  color: white;
  box-shadow: -18px 0 60px rgba(8, 17, 15, 0.28);
}

.hire-flow-v2 .drawer-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
}

.hire-flow-v2 .icon-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  color: inherit;
}

.hire-flow-v2 .system-form,
.hire-flow-v2 .skill-modal-card {
  display: grid;
  gap: 16px;
}

.hire-flow-v2 .system-form {
  margin-top: 24px;
}

.hire-flow-v2 .system-form label,
.hire-flow-v2 .skill-modal-card label {
  display: grid;
  gap: 8px;
}

.hire-flow-v2 .system-form span,
.hire-flow-v2 .skill-modal-card span {
  color: rgba(255, 255, 255, 0.76);
  font-size: 0.92rem;
}

.hire-flow-v2 .system-form input {
  background: rgba(255, 255, 255, 0.98);
}

.hire-flow-v2 .drawer-actions {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.hire-flow-v2 .drawer-feedback {
  min-height: 1.3em;
  color: rgba(255, 255, 255, 0.82);
  margin: 0;
}

.hire-flow-v2 .skill-modal-panel {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 16px;
}

.hire-flow-v2 .skill-modal-card {
  width: min(560px, calc(100vw - 32px));
  padding: 24px;
  border-radius: 28px;
  background: var(--surface-dark);
  color: white;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.22);
}

.hire-flow-v2 .skill-modal-card input,
.hire-flow-v2 .skill-modal-card textarea {
  background: rgba(255, 255, 255, 0.98);
}

.hire-flow-v2 .empty-tip {
  margin: 0;
  padding: 14px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.82);
  border: 1px dashed var(--line);
  color: var(--text-soft);
  line-height: 1.6;
  font-size: 0.9rem;
}

.hire-flow-v2 .chat-feed::-webkit-scrollbar,
.hire-flow-v2 .todo-groups::-webkit-scrollbar,
.hire-flow-v2 .package-tree::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

.hire-flow-v2 .chat-feed::-webkit-scrollbar-thumb,
.hire-flow-v2 .todo-groups::-webkit-scrollbar-thumb,
.hire-flow-v2 .package-tree::-webkit-scrollbar-thumb {
  background: #e4e4e7;
  border-radius: 999px;
}

@keyframes ncrew-hire-pulse {
  0%,
  80%,
  100% {
    transform: scale(0.7);
    opacity: 0.45;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

@media (max-width: 1100px) {
  .hire-flow-v2 .layout {
    grid-template-columns: 1fr;
  }

  .hire-flow-v2 .chat-panel,
  .hire-flow-v2 .todo-panel {
    height: auto;
    min-height: 0;
  }

  .hire-flow-v2 .todo-panel {
    order: 2;
  }
}

@media (max-width: 860px) {
  .hire-flow-v2 {
    padding: 20px;
  }

  .hire-flow-v2 .topbar {
    flex-direction: column;
    align-items: stretch;
  }

  .hire-flow-v2 .topbar-actions {
    justify-content: flex-start;
  }

  .hire-flow-v2 .journey-strip-head,
  .hire-flow-v2 .panel-head,
  .hire-flow-v2 .input-toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .hire-flow-v2 .send-btn {
    width: 100%;
    min-height: 52px;
  }

  .hire-flow-v2 .todo-head {
    flex-direction: column;
  }
}

@media (max-width: 640px) {
  .hire-flow-v2 {
    padding: 12px;
    border-radius: 24px;
  }

  .hire-flow-v2 .topbar-actions button,
  .hire-flow-v2 .card-action,
  .hire-flow-v2 .inline-action {
    width: 100%;
    justify-content: center;
  }

  .hire-flow-v2 .step-pill:not(:last-child)::after {
    display: none;
  }

  .hire-flow-v2 .panel-head,
  .hire-flow-v2 .chat-feed,
  .hire-flow-v2 .todo-groups,
  .hire-flow-v2 .composer,
  .hire-flow-v2 .drawer-panel,
  .hire-flow-v2 .skill-modal-card {
    padding-left: 14px;
    padding-right: 14px;
  }

  .hire-flow-v2 .bubble {
    max-width: 100%;
  }

  .hire-flow-v2 .subtask-chip {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}

.hire-flow-v2 .float-evaluation-btn {
  position: fixed;
  bottom: 32px;
  right: 32px;
  z-index: 100;
  padding: 14px 28px;
  background: #0a0a0a;
  color: white;
  border: none;
  border-radius: 999px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.hire-flow-v2 .float-evaluation-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.hire-flow-v2 .package-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: #f5f5f5;
  border: 1px solid #e5e5e5;
  border-radius: 999px;
}

.hire-flow-v2 .package-pill-icon {
  font-size: 16px;
}

.hire-flow-v2 .package-pill-name {
  font-weight: 600;
  color: var(--text);
}

.hire-flow-v2 .package-pill-meta {
  font-size: 12px;
  color: var(--text-soft);
}

.hire-flow-v2 .package-pill-desc {
  margin: 10px 0 0;
  font-size: 13px;
  color: var(--text-soft);
}

.hire-flow-v2 .todo-package-preview {
  margin-top: 8px;
}

.hire-flow-v2 .todo-package-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  background: #f5f5f5;
  border: 1px solid #e5e5e5;
  border-radius: 999px;
}

.hire-flow-v2 .todo-package-icon {
  font-size: 14px;
}

.hire-flow-v2 .todo-package-name {
  font-weight: 600;
  font-size: 13px;
  color: var(--text);
}

.hire-flow-v2 .todo-package-status {
  font-size: 12px;
  color: var(--good);
  font-weight: 500;
}
`;

function ensureHireV2Styles() {
  if (document.getElementById(HIRE_V2_STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = HIRE_V2_STYLE_ID;
  style.textContent = HIRE_V2_STYLES;
  document.head.appendChild(style);
}

function clampPhase(value) {
  const num = Number(value) || 1;
  return Math.max(1, Math.min(num, 6));
}

function docsProgress(flow) {
  return DOC_REQUIREMENTS.length ? flow.docs.done.length / DOC_REQUIREMENTS.length : 0;
}

function skillsProgress(flow) {
  return Math.min(flow.skills.adopted.length, 1);
}

function integrationsProgress(flow) {
  return Math.min(flow.integrations.done.length / INTEGRATION_DEFINITIONS.length, 1);
}

function packageProgress(flow) {
  return flow.package.generated ? 1 : 0;
}

function progressForStep(step, flow) {
  if (step.id === "docs") return docsProgress(flow);
  if (step.id === "skills") return skillsProgress(flow);
  if (step.id === "integrations") return integrationsProgress(flow);
  return packageProgress(flow);
}

function mapPhaseToProcessIndex(phase) {
  if (phase <= 3) return 0;
  if (phase === 4) return 1;
  if (phase === 5) return 2;
  return 3;
}

function uniqueId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function createMessage(role, payload) {
  return {
    id: uniqueId(role),
    role,
    title: payload.title || "",
    text: payload.text || "",
    card: payload.card || null,
    actions: payload.actions || [],
    typing: !!payload.typing
  };
}

function createIntroMessages(template, existing, isBranchFlow) {
  const assistantName = existing ? existing.name : template.name;
  const roleLabel = isBranchFlow ? "私人定制数字员工" : "部门数字员工";
  const scenario = existing
    ? `我们会基于「${assistantName}」继续推进雇佣环节。`
    : `我们会基于「${template.name}」模板完成一条新的部门版雇佣流程。`;

  return [
    createMessage("agent", {
      title: `我是${assistantName}`,
      text: `${scenario} 这次我会像一位即将上岗的新同事一样，主动告诉你我还缺什么。`,
      card: {
        type: "identity",
        nickname: assistantName,
        role: roleLabel,
        style: "友好、清晰、稳妥",
        highlights: ["业务理解", "技能配置", "外部系统连接"]
      }
    }),
    createMessage("agent", {
      title: "这些是我要完成的入职事项",
      text: "资料、技能、系统和实例包会在同一条会话里逐步闭环。右侧会同步记录每一项进度。",
      actions: [{ label: "开始第一步", action: "startDocs", primary: true }]
    })
  ];
}

function buildInitialFlow(template, existing, savedFlow) {
  const completed = existing ? Math.max(0, Math.min(existing.hireProgress || 0, 6)) : 0;
  const minPhase = completed >= 6 ? 6 : Math.max(1, completed + 1);
  const base = {
    currentPhase: minPhase,
    todoRevealed: minPhase > 1,
    background: "original",
    messages: createIntroMessages(template, existing, existing && existing.type === "private_branch"),
    docs: {
      interactions: 0,
      done: [],
      sources: {},
      notes: []
    },
    skills: {
      adopted: [],
      ignored: [],
      customCount: 0,
      coveredTypes: [],
      generated: []
    },
    integrations: {
      configs: {},
      done: [],
      failed: []
    },
    package: {
      generated: false,
      meta: null
    }
  };

  if (!savedFlow) return base;

  const next = {
    ...base,
    ...savedFlow,
    currentPhase: Math.max(minPhase, clampPhase(savedFlow.currentPhase)),
    todoRevealed: savedFlow.todoRevealed || minPhase > 1,
    background: savedFlow.background === "cool" ? "cool" : "original",
    docs: {
      ...base.docs,
      ...(savedFlow.docs || {}),
      done: Array.isArray(savedFlow.docs && savedFlow.docs.done) ? savedFlow.docs.done : []
    },
    skills: {
      ...base.skills,
      ...(savedFlow.skills || {}),
      adopted: Array.isArray(savedFlow.skills && savedFlow.skills.adopted) ? savedFlow.skills.adopted : [],
      ignored: Array.isArray(savedFlow.skills && savedFlow.skills.ignored) ? savedFlow.skills.ignored : [],
      coveredTypes: Array.isArray(savedFlow.skills && savedFlow.skills.coveredTypes) ? savedFlow.skills.coveredTypes : [],
      generated: Array.isArray(savedFlow.skills && savedFlow.skills.generated) ? savedFlow.skills.generated : []
    },
    integrations: {
      ...base.integrations,
      ...(savedFlow.integrations || {}),
      done: Array.isArray(savedFlow.integrations && savedFlow.integrations.done) ? savedFlow.integrations.done : []
    },
    package: {
      ...base.package,
      ...(savedFlow.package || {})
    }
  };

  if (!Array.isArray(next.messages) || !next.messages.length) next.messages = base.messages;
  return next;
}

function readFlowCache(cacheKey) {
  try {
    const raw = window.localStorage && window.localStorage.getItem(cacheKey);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
}

function writeFlowCache(cacheKey, flow) {
  try {
    if (!window.localStorage) return;
    window.localStorage.setItem(cacheKey, JSON.stringify(flow));
  } catch (error) {
    // Prototype cache failures should not block the UI.
  }
}

function clearFlowCache(cacheKey) {
  try {
    if (window.localStorage) window.localStorage.removeItem(cacheKey);
  } catch (error) {
    // Ignore cache cleanup failures.
  }
}

function detectDocCoverage(input) {
  const source = `${input || ""}`;
  return DOC_REQUIREMENTS.filter(item => item.patterns.some(pattern => pattern.test(source))).map(item => item.id);
}

function findDocLabel(docId) {
  const target = DOC_REQUIREMENTS.find(item => item.id === docId);
  return target ? target.label : docId;
}

function buildMaterialsCard(doneIds) {
  return {
    type: "materials",
    items: DOC_REQUIREMENTS.map(item => ({
      name: item.label,
      desc: item.desc,
      status: doneIds.includes(item.id) ? "已覆盖" : "待补充"
    }))
  };
}

function inferSkillSeed(text) {
  const source = `${text || ""}`;
  if (/简历|resume|cv|排序|rank/i.test(source)) {
    return {
      name: "候选人匹配排序",
      type: "查询类技能",
      description: "根据岗位要求自动对候选人资料排序，并输出排序依据。"
    };
  }
  if (/面试|录音|纪要|minutes|summary|转写/i.test(source)) {
    return {
      name: "面试纪要整理",
      type: "处理类技能",
      description: "自动整理面试过程中的音频、转写和速记信息，生成结构化纪要。"
    };
  }
  if (/offer|薪资|审批|边界|升级|风险/i.test(source)) {
    return {
      name: "Offer 风险升级",
      type: "升级类技能",
      description: "识别敏感 offer 场景，自动检查审批边界并给出升级建议。"
    };
  }
  return {
    name: "自定义能力草稿",
    type: ["查询类技能", "处理类技能", "升级类技能"][Date.now() % 3],
    description: "根据你的文字描述生成一份可继续编辑的能力定义。"
  };
}

function buildGeneratedSkillFromText(text) {
  const seed = inferSkillSeed(text);
  return {
    id: uniqueId("skill"),
    name: seed.name,
    type: seed.type,
    description: `${seed.description} 当前需求：${text}`,
    dependency: "待确认外部依赖",
    trigger: `当出现「${text.slice(0, 20)}${text.length > 20 ? "…" : ""}」相关场景时触发`
  };
}

function buildSkillFromFile(file) {
  const base = file.name.replace(/\.[^.]+$/, "");
  const seed = inferSkillSeed(base);
  return {
    id: uniqueId("skill_file"),
    name: base || seed.name,
    type: seed.type,
    description: `已从 ${file.name} 解析出一份技能草稿，可继续编辑后采纳。`,
    dependency: "待确认外部依赖",
    trigger: `上传 ${file.name} 后触发解析`
  };
}

function buildDemoConfig(systemId) {
  const key = systemId || "system";
  return {
    endpoint: `https://demo-${key}.ncrew.local/api`,
    apiKey: `sk-demo-${key}`,
    webhook: `https://demo-${key}.ncrew.local/webhook`,
    timeout: 30,
    __demo: true
  };
}

function validateConfig(config) {
  if (!config.endpoint || !/^https?:\/\//.test(config.endpoint)) {
    return { ok: false, reason: "endpoint 解析失败：地址格式不正确" };
  }
  if (!config.apiKey || !config.apiKey.startsWith("sk-")) {
    return { ok: false, reason: "apiKey 无效：密钥格式需以 sk- 开头" };
  }
  return { ok: true, reason: "连接已就绪" };
}

function normalizeSystemConfig(systemId, config) {
  const demoConfig = buildDemoConfig(systemId);
  const endpoint = config.endpoint || demoConfig.endpoint;
  const apiKey = config.apiKey || demoConfig.apiKey;
  const webhook = config.webhook || demoConfig.webhook;
  const timeout = Number(config.timeout || demoConfig.timeout);
  const usedDemo = !config.endpoint || !config.apiKey;

  return {
    endpoint,
    apiKey,
    webhook,
    timeout,
    __demo: usedDemo
  };
}

function parseIntegrationText(text) {
  const results = [];
  const urlMatch = [...text.matchAll(/https?:\/\/[^\s，,；;]+/g)].map(match => match[0]);
  const keyMatch = [...text.matchAll(/sk-[a-zA-Z0-9-_]+/g)].map(match => match[0]);

  INTEGRATION_DEFINITIONS.forEach((system, index) => {
    if (text.toLowerCase().includes(system.id) || text.includes(system.name.replace("系统", "")) || text.includes(system.name)) {
      results.push({
        systemId: system.id,
        config: {
          endpoint: urlMatch[index] || urlMatch[0] || "",
          apiKey: keyMatch[index] || keyMatch[0] || "",
          webhook: "",
          timeout: 30
        }
      });
    }
  });

  return results;
}

function formatTimestamp(date) {
  const parts = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
    String(date.getHours()).padStart(2, "0"),
    String(date.getMinutes()).padStart(2, "0")
  ];
  return parts.join("");
}

function buildPackageMeta(flow, assistantName) {
  const timestamp = new Date();
  return {
    name: `${assistantName}_实例包_v1.0_${formatTimestamp(timestamp)}`,
    version: "v1.0",
    generatedAt: timestamp.toLocaleString("zh-CN"),
    docsCount: flow.docs.done.length,
    skillsCount: flow.skills.adopted.length,
    integrationsCount: flow.integrations.done.length,
    tree: [
      "manifest.json",
      "knowledge/",
      "  ├─ index.json",
      "  ├─ kb/",
      "  ├─ manual/",
      "  ├─ faq/",
      "  └─ script/",
      "skills/",
      "integrations/",
      "prompts/",
      "policies/"
    ].join("\n")
  };
}

function renderIntegrationSummary(config) {
  if (!config) return "";
  return config.__demo ? `演示配置 · ${config.endpoint}` : config.endpoint;
}

function buildPackagePayload(flow, assistantName) {
  return {
    manifest: {
      employeeName: assistantName,
      role: "数字员工",
      version: flow.package.meta && flow.package.meta.version,
      generatedAt: flow.package.meta && flow.package.meta.generatedAt,
      capabilities: flow.skills.adopted.map(item => item.name)
    },
    knowledge: flow.docs.sources,
    skills: flow.skills.adopted,
    integrations: Object.fromEntries(
      Object.entries(flow.integrations.configs).map(([key, value]) => [
        key,
        { ...value, apiKey: value.apiKey ? "******已加密******" : "" }
      ])
    )
  };
}

function triggerDownload(blob, filename) {
  const anchor = document.createElement("a");
  const url = URL.createObjectURL(blob);
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function HireMessageRow({ message, flow, onAction }) {
  return (
    <article className={`message-row ${message.role}`}>
      <div className="bubble">
        {message.title && <h3 className="message-title">{message.title}</h3>}
        {message.typing ? (
          <div className="typing"><span></span><span></span><span></span></div>
        ) : (
          <>
            {message.text && <p className="message-body">{message.text}</p>}
            {message.card && <HireMessageCard card={message.card} flow={flow} onAction={onAction} />}
            {message.actions && message.actions.length > 0 && (
              <div className="message-actions">
                {message.actions.map(action => (
                  <button
                    key={`${message.id}-${action.action}-${action.label}`}
                    className={action.primary ? "card-action primary" : "inline-action"}
                    onClick={() => onAction(action.action, action.payload || {})}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </article>
  );
}

function HireMessageCard({ card, flow, onAction }) {
  if (card.type === "identity") {
    return (
      <div className="message-detail">
        <p>你好，我是数字员工<strong>{card.nickname}</strong>，负责{card.role}岗位，能处理{card.highlights.join("、")}等工作，我的特点是{card.style}。</p>
      </div>
    );
  }

  if (card.type === "materials") {
    return (
      <div className="message-detail">
        <ul className="message-list">
          {card.items.map(item => <li key={item.name}><strong>{item.name}</strong>：{item.desc} 当前状态：{item.status}。</li>)}
        </ul>
      </div>
    );
  }

  if (card.type === "fileSummary") {
    return (
      <div className="message-detail">
        <ul className="message-list">
          {card.items.map(item => <li key={item.label}><strong>{item.label}</strong>：{item.detail}</li>)}
        </ul>
      </div>
    );
  }

  if (card.type === "skill") {
    const isAdopted = !!flow.skills.adopted.find(item => item.id === card.id);
    return (
      <div className="message-detail">
        <p><strong>{card.name}</strong></p>
        <p>{card.description}</p>
        <p>技能类型：{card.typeLabel}；依赖：{card.dependency}。</p>
        <div className="message-actions">
          {isAdopted ? (
            <button className="card-action card-action-adopted" disabled>已采纳</button>
          ) : (
            <>
              <button className="card-action primary" onClick={() => onAction("adoptSkill", { skillId: card.id })}>采纳</button>
              <button className="card-action" onClick={() => onAction("editSkill", { skillId: card.id })}>编辑</button>
              <button className="card-action" onClick={() => onAction("ignoreSkill", { skillId: card.id })}>忽略</button>
            </>
          )}
        </div>
      </div>
    );
  }

  if (card.type === "system") {
    return (
      <div className="message-detail">
        {card.items.map(item => (
          <div key={item.id} className="message-plain-item">
            <p><strong>{item.name}</strong></p>
            <p>{item.purpose}</p>
            <p>需要配置：{item.fields}</p>
            <div className="message-actions">
              <button className="card-action primary" onClick={() => onAction("openSystem", { systemId: item.id })}>填写</button>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (card.type === "package") {
    return (
      <div className="message-detail">
        <div className="package-pill">
          <span className="package-pill-icon">📦</span>
          <span className="package-pill-name">{card.meta.name}</span>
          <span className="package-pill-meta">V{card.meta.version}</span>
        </div>
        <p className="package-pill-desc">实例包已生成，可保存后继续下一步。</p>
      </div>
    );
  }

  return null;
}

function HireSystemDrawer({ open, system, form, feedback, onChange, onClose, onTest, onSubmit }) {
  if (!open || !system) return null;
  return (
    <aside className="drawer">
      <div className="drawer-mask" onClick={onClose}></div>
      <div className="drawer-panel">
        <div className="drawer-head">
          <div>
            <p className="eyebrow">System Configuration</p>
            <h3>{system.name}</h3>
          </div>
          <button className="icon-btn" onClick={onClose}>×</button>
        </div>

        <form className="system-form" onSubmit={onSubmit}>
          <label>
            <span>接口地址</span>
            <input name="endpoint" type="url" value={form.endpoint} onChange={onChange} placeholder="https://api.example.com" />
          </label>
          <label>
            <span>鉴权密钥</span>
            <input name="apiKey" type="text" value={form.apiKey} onChange={onChange} placeholder="sk-xxxxxx" />
          </label>
          <label>
            <span>Webhook / 回调地址</span>
            <input name="webhook" type="url" value={form.webhook} onChange={onChange} placeholder="https://callback.example.com" />
          </label>
          <label>
            <span>超时时间（秒）</span>
            <input name="timeout" type="number" min="1" max="120" value={form.timeout} onChange={onChange} />
          </label>

          <div className="drawer-actions">
            <button type="button" className="ghost-btn" onClick={onTest}>测试连接</button>
            <button type="submit" className="primary-btn">保存配置</button>
          </div>
          <p className="drawer-feedback">{feedback}</p>
        </form>
      </div>
    </aside>
  );
}

function HireSkillModal({ open, form, onChange, onClose, onSubmit }) {
  if (!open) return null;
  return (
    <div className="skill-modal">
      <div className="skill-modal-mask" onClick={onClose}></div>
      <div className="skill-modal-panel">
        <form className="skill-modal-card" onSubmit={onSubmit}>
          <div className="drawer-head">
            <div>
              <p className="eyebrow">Skill Editor</p>
              <h3>编辑技能</h3>
            </div>
            <button type="button" className="icon-btn" onClick={onClose}>×</button>
          </div>

          <label>
            <span>技能名称</span>
            <input name="name" type="text" value={form.name} onChange={onChange} required />
          </label>
          <label>
            <span>用途说明</span>
            <textarea name="description" rows="3" value={form.description} onChange={onChange} required></textarea>
          </label>
          <label>
            <span>触发条件</span>
            <input name="trigger" type="text" value={form.trigger} onChange={onChange} />
          </label>
          <div className="drawer-actions">
            <button type="button" className="ghost-btn" onClick={onClose}>取消</button>
            <button type="submit" className="primary-btn">采纳技能</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function HirePage({ id, tpl, go, toast }) {
  const existing = id ? window.findEmployeeById(id) : null;
  const template = tpl
    ? window.findTemplateById(tpl)
    : (existing ? window.findTemplateById(existing.template) : window.TEMPLATES[0]);
  const isBranchFlow = !!existing && existing.type === "private_branch";
  const backTo = isBranchFlow ? "my" : "dept";
  const cacheKey = `${HIRE_V2_CACHE_PREFIX}:${existing ? existing.id : `tpl:${template && template.id}`}`;
  const savedFlow = readFlowCache(cacheKey);

  const [flow, setFlow] = _useStateH(() => buildInitialFlow(template, existing, savedFlow));
  const [draft, setDraft] = _useStateH("");
  const [activeSystemId, setActiveSystemId] = _useStateH(null);
  const [systemForm, setSystemForm] = _useStateH({ endpoint: "", apiKey: "", webhook: "", timeout: 30 });
  const [drawerFeedback, setDrawerFeedback] = _useStateH("");
  const [editingSkillId, setEditingSkillId] = _useStateH("");
  const [skillForm, setSkillForm] = _useStateH({ name: "", description: "", trigger: "" });
  const [dropActive, setDropActive] = _useStateH(false);

  const businessFileInputRef = _useRefH(null);
  const skillFileInputRef = _useRefH(null);
  const timerRef = _useRefH([]);
  const flowRef = _useRefH(flow);

  _useEffectH(() => {
    ensureHireV2Styles();
  }, []);

  _useEffectH(() => {
    flowRef.current = flow;
    writeFlowCache(cacheKey, flow);
  }, [cacheKey, flow]);

  _useEffectH(() => () => {
    timerRef.current.forEach(timerId => window.clearTimeout(timerId));
  }, []);

  function rememberTimer(timerId) {
    timerRef.current.push(timerId);
  }

  function assistantName() {
    return existing ? existing.name : template.name;
  }

  function syncExistingProgress(completedPhases) {
    if (!existing) return;
    const nextCompleted = Math.max(existing.hireProgress || 0, completedPhases);
    window.updateEmployee(existing.id, {
      hireProgress: nextCompleted,
      updated: "刚刚"
    });
  }

  function findSkillCandidate(skillId) {
    return RECOMMENDED_SKILLS.find(item => item.id === skillId)
      || flowRef.current.skills.generated.find(item => item.id === skillId)
      || flowRef.current.skills.adopted.find(item => item.id === skillId);
  }

  function areDocsComplete(targetFlow = flowRef.current) {
    return targetFlow.docs.done.length >= DOC_REQUIREMENTS.length;
  }

  function areSkillsReady(targetFlow = flowRef.current) {
    return targetFlow.skills.adopted.length >= 1;
  }

  function areIntegrationsReady(targetFlow = flowRef.current) {
    return targetFlow.integrations.done.length >= INTEGRATION_DEFINITIONS.length;
  }

  function completionRatio() {
    const values = [
      docsProgress(flow),
      skillsProgress(flow),
      integrationsProgress(flow),
      packageProgress(flow)
    ];
    return Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 100);
  }

  function todoItems() {
    return [
      {
        id: "docs",
        phase: 2,
        title: "补充业务资料",
        description: "上传业务相关资料，让数字员工理解业务背景。",
        subtasks: ["业务资料"],
        progress: docsProgress(flow)
      },
      {
        id: "skills",
        phase: 4,
        title: "配置技能模块",
        description: "配置执行能力，让数字员工能真正完成任务。",
        subtasks: ["技能配置"],
        progress: skillsProgress(flow)
      },
      {
        id: "integrations",
        phase: 5,
        title: "对接外部系统",
        description: "配置系统连接参数，让技能真正跑起来。",
        subtasks: ["系统对接"],
        progress: integrationsProgress(flow)
      },
      {
        id: "package",
        phase: 6,
        title: "生成实例包",
        description: "打包所有配置，生成可部署成果。",
        subtasks: ["生成实例"],
        progress: packageProgress(flow)
      }
    ];
  }

  function stepStatus(item) {
    const progress = item.progress;
    if (progress >= 1) return { label: "已完成", className: "status-done", icon: "✓" };
    if ((item.id === "docs" && flow.docs.interactions > 0) || mapPhaseToProcessIndex(flow.currentPhase) >= mapPhaseToProcessIndex(item.phase)) {
      return { label: "进行中", className: "status-active", icon: "•" };
    }
    return { label: "待办", className: "status-pending", icon: "○" };
  }

  function subtaskStatus(itemId, label) {
    if (itemId === "docs") {
      const matched = DOC_REQUIREMENTS.find(item => item.label === label);
      const done = matched && flow.docs.done.includes(matched.id);
      return done ? { label: "已归档", className: "done", icon: "✓" } : { label: "待补充", className: "pending", icon: "○" };
    }
    if (itemId === "skills") {
      const done = flow.skills.coveredTypes.includes(label);
      return done ? { label: "已覆盖", className: "done", icon: "✓" } : { label: "待补齐", className: "pending", icon: "○" };
    }
    const system = INTEGRATION_DEFINITIONS.find(item => item.name === label);
    const done = system && flow.integrations.done.includes(system.id);
    if (done) return { label: "已连通", className: "done", icon: "✓" };
    if (flow.currentPhase >= 5) return { label: "待配置", className: "active", icon: "•" };
    return { label: "待配置", className: "pending", icon: "○" };
  }

  function saveFlowDraft() {
    writeFlowCache(cacheKey, flowRef.current);
    toast("已保存雇佣草稿");
  }

  function resetFlow() {
    setActiveSystemId(null);
    setEditingSkillId("");
    setDraft("");
    setDropActive(false);
    const reset = buildInitialFlow(template, existing, null);
    setFlow(reset);
    clearFlowCache(cacheKey);
    toast(existing ? "已重置当前界面草稿" : "流程已重置");
  }

  function startDocsFlow(fromResume) {
    syncExistingProgress(1);
    setFlow(prev => ({
      ...prev,
      currentPhase: Math.max(prev.currentPhase, 2),
      todoRevealed: true,
      messages: fromResume || prev.currentPhase === 1
        ? [
            ...prev.messages,
            createMessage("agent", {
              title: "先补齐业务资料",
              text: "你可以上传任意格式的业务文件，也可以直接用文字补充岗位背景、服务口径和 FAQ 约束。",
              card: buildMaterialsCard(prev.docs.done)
            })
          ]
        : prev.messages
    }));
  }

  function summarizeDocFeedback(filesOrText, recognized, nextDone) {
    const missing = DOC_REQUIREMENTS.filter(item => !nextDone.includes(item.id)).map(item => item.label);
    const recognizedLabels = recognized.length ? recognized.map(findDocLabel) : [];
    const sourceLabel = Array.isArray(filesOrText) ? filesOrText.map(item => item.name).join("、") : "这段补充说明";
    const title = missing.length ? "资料已归档，仍有缺口" : "业务资料已补齐";
    const text = missing.length
      ? `我已经解析了 ${sourceLabel}，当前覆盖了 ${recognizedLabels.length ? recognizedLabels.join("、") : "基础业务说明"}。还缺少 ${missing.join("、")}，我会继续等你补齐。`
      : `我已经解析了 ${sourceLabel}，业务资料四类都已覆盖，可以继续进入技能模块。`;

    return {
      title,
      text,
      card: {
        type: "fileSummary",
        items: [
          {
            label: "已识别资料",
            detail: recognizedLabels.length ? recognizedLabels.join("、") : "已记录为业务补充说明"
          },
          {
            label: "待补充项",
            detail: missing.length ? missing.join("、") : "无"
          }
        ]
      },
      actions: missing.length ? [] : [{ label: "进入技能模块 →", action: "startSkills", primary: true }]
    };
  }

  function processBusinessFiles(files) {
    if (!files.length) return;
    const recognized = Array.from(new Set(files.flatMap(file => detectDocCoverage(file.name))));

    setFlow(prev => {
      const doneSet = new Set(prev.docs.done);
      recognized.forEach(item => doneSet.add(item));
      const nextDone = Array.from(doneSet);
      const nextPhase = nextDone.length >= DOC_REQUIREMENTS.length ? 4 : Math.max(prev.currentPhase, 3);
      const nextSources = { ...prev.docs.sources };
      files.forEach(file => {
        nextSources[file.name] = {
          source: "upload",
          recognized: recognized.map(findDocLabel)
        };
      });

      const messages = [
        ...prev.messages,
        createMessage("user", { text: `已上传文件：${files.map(file => file.name).join("、")}` }),
        createMessage("agent", summarizeDocFeedback(files, recognized, nextDone))
      ];

      return {
        ...prev,
        currentPhase: nextPhase,
        todoRevealed: true,
        messages,
        docs: {
          ...prev.docs,
          interactions: prev.docs.interactions + 1,
          done: nextDone,
          sources: nextSources
        }
      };
    });

    if (recognized.length >= DOC_REQUIREMENTS.length || areDocsComplete({ ...flowRef.current, docs: { ...flowRef.current.docs, done: Array.from(new Set([...flowRef.current.docs.done, ...recognized])) } })) {
      syncExistingProgress(3);
    }
  }

  function processBusinessText(text) {
    const recognized = Array.from(new Set(detectDocCoverage(text)));
    const projectedDone = Array.from(new Set([...flowRef.current.docs.done, ...recognized]));

    setFlow(prev => {
      const doneSet = new Set(prev.docs.done);
      recognized.forEach(item => doneSet.add(item));
      const nextDone = Array.from(doneSet);
      const nextPhase = nextDone.length >= DOC_REQUIREMENTS.length ? 4 : Math.max(prev.currentPhase, 3);

      const messages = [
        ...prev.messages,
        createMessage("user", { text }),
        createMessage("agent", summarizeDocFeedback(text, recognized, nextDone))
      ];

      return {
        ...prev,
        currentPhase: nextPhase,
        todoRevealed: true,
        messages,
        docs: {
          ...prev.docs,
          interactions: prev.docs.interactions + 1,
          done: nextDone,
          notes: [...prev.docs.notes, text]
        }
      };
    });

    if (projectedDone.length >= DOC_REQUIREMENTS.length) {
      syncExistingProgress(3);
    }
  }

  function suggestSkills(forceMessage) {
    setFlow(prev => {
      const available = [...RECOMMENDED_SKILLS, ...prev.skills.generated]
        .filter(item => !prev.skills.ignored.includes(item.id) && !prev.skills.adopted.some(a => a.id === item.id));

      const messages = forceMessage
        ? [
            ...prev.messages,
            createMessage("agent", {
              title: "开始配置技能模块",
              text: "资料已经够用了，下面为这位数字员工补齐可执行能力。你可以直接采纳推荐技能，也可以上传 skill 文件或用自然语言描述新能力。"
            }),
            ...available.map(item => createMessage("agent", {
              card: {
                type: "skill",
                typeLabel: item.type,
                name: item.name,
                description: item.description,
                dependency: item.dependency,
                trigger: item.trigger,
                id: item.id
              }
            }))
          ]
        : prev.messages;

      return {
        ...prev,
        currentPhase: Math.max(prev.currentPhase, 4),
        todoRevealed: true,
        messages
      };
    });
  }

  function adoptSkill(skillId, overrides) {
    const candidate = findSkillCandidate(skillId);
    if (!candidate) return;
    const nextCovered = Array.from(new Set([...flowRef.current.skills.coveredTypes, (overrides && overrides.type) || candidate.type]));

    setFlow(prev => {
      const merged = {
        ...candidate,
        ...(overrides || {})
      };
      const adoptedExists = prev.skills.adopted.some(item => item.id === skillId);
      if (adoptedExists) return prev;

      const nextMessages = [
        ...prev.messages,
        createMessage("agent", {
          title: `已采纳技能 · ${merged.name}`,
          text: "技能已配置完成，可以继续对接外部系统。",
          actions: [{ label: "进入外部系统 →", action: "startIntegrations", primary: true }]
        })
      ];

      const nextCoveredTypes = Array.from(new Set([...prev.skills.coveredTypes, merged.type]));

      return {
        ...prev,
        currentPhase: 5,
        messages: nextMessages,
        skills: {
          ...prev.skills,
          adopted: [...prev.skills.adopted, merged],
          coveredTypes: nextCoveredTypes
        }
      };
    });

    syncExistingProgress(4);
  }

  function ignoreSkill(skillId) {
    setFlow(prev => ({
      ...prev,
      skills: {
        ...prev.skills,
        ignored: prev.skills.ignored.includes(skillId) ? prev.skills.ignored : [...prev.skills.ignored, skillId]
      },
      messages: [
        ...prev.messages,
        createMessage("agent", {
          title: "已忽略这项技能",
          text: "你可以继续看推荐列表里的其他技能，或者直接描述想新增的能力。"
        })
      ]
    }));
  }

  function openSkillEditor(skillId) {
    const skill = findSkillCandidate(skillId);
    if (!skill) return;
    setEditingSkillId(skillId);
    setSkillForm({
      name: skill.name || "",
      description: skill.description || "",
      trigger: skill.trigger || ""
    });
  }

  function closeSkillEditor() {
    setEditingSkillId("");
    setSkillForm({ name: "", description: "", trigger: "" });
  }

  function submitSkillEdit(event) {
    event.preventDefault();
    if (!editingSkillId) return;
    adoptSkill(editingSkillId, {
      name: skillForm.name.trim(),
      description: skillForm.description.trim(),
      trigger: skillForm.trigger.trim()
    });
    closeSkillEditor();
  }

  function processSkillFiles(files) {
    if (!files.length) return;
    if (!areDocsComplete()) {
      toast("请先补齐业务资料");
      startDocsFlow(true);
      return;
    }

    const generatedSkills = files.map(buildSkillFromFile);
    setFlow(prev => ({
      ...prev,
      currentPhase: 5,
      messages: [
        ...prev.messages,
        createMessage("user", { text: `已上传文件：${files.map(file => file.name).join("、")}` }),
        createMessage("agent", {
          title: "已解析上传的 skill 文件",
          text: `本轮共识别到 ${generatedSkills.length} 条能力，已直接加入技能栈。现在继续对接外部系统。`,
          actions: [{ label: "进入外部系统 →", action: "startIntegrations", primary: true }]
        })
      ],
      skills: {
        ...prev.skills,
        customCount: prev.skills.customCount + generatedSkills.length,
        adopted: [...prev.skills.adopted, ...generatedSkills],
        coveredTypes: [...prev.skills.coveredTypes, ...generatedSkills.map(s => s.type)]
      }
    }));
    toast("Skill 文件已处理");
  }

  function createSkillFromText(text) {
    const generated = buildGeneratedSkillFromText(text);
    setFlow(prev => ({
      ...prev,
      currentPhase: 5,
      messages: [
        ...prev.messages,
        createMessage("user", { text }),
        createMessage("agent", {
          title: "已生成能力定义",
          text: "已将描述转化为技能并加入技能栈，现在继续对接外部系统。",
          actions: [{ label: "进入外部系统 →", action: "startIntegrations", primary: true }]
        })
      ],
      skills: {
        ...prev.skills,
        customCount: prev.skills.customCount + 1,
        adopted: [generated, ...prev.skills.adopted],
        coveredTypes: [generated.type, ...prev.skills.coveredTypes]
      }
    }));
  }

  function suggestIntegrations(forceMessage) {
    setFlow(prev => ({
      ...prev,
      currentPhase: Math.max(prev.currentPhase, 5),
      messages: forceMessage
        ? [
            ...prev.messages,
            createMessage("agent", {
              title: "开始对接外部系统",
              text: "要让技能真正跑起来，需要接入 CRM、OMS、工单系统和 IM 平台。你可以在对话里直接贴参数，也可以点系统卡片填写表单。",
              card: {
                type: "system",
                items: INTEGRATION_DEFINITIONS.map(item => ({
                  ...item,
                  fields: "endpoint / apiKey / webhook / timeout"
                }))
              }
            })
          ]
        : prev.messages
    }));
  }

  function openSystemDrawer(systemId) {
    const system = INTEGRATION_DEFINITIONS.find(item => item.id === systemId);
    if (!system) return;
    const savedConfig = flowRef.current.integrations.configs[systemId] || {};
    setActiveSystemId(systemId);
    setSystemForm({
      endpoint: savedConfig.endpoint || "",
      apiKey: savedConfig.apiKey || "",
      webhook: savedConfig.webhook || "",
      timeout: savedConfig.timeout || 30
    });
    setDrawerFeedback(system.purpose);
  }

  function closeSystemDrawer() {
    setActiveSystemId(null);
    setDrawerFeedback("");
  }

  function handleSystemFormChange(event) {
    const { name, value } = event.target;
    setSystemForm(prev => ({
      ...prev,
      [name]: name === "timeout" ? Number(value || 30) : value
    }));
  }

  function testCurrentSystem() {
    if (!activeSystemId) return;
    if (!systemForm.endpoint && !systemForm.apiKey) {
      const demoConfig = buildDemoConfig(activeSystemId);
      setDrawerFeedback(`当前是原型演示，你可以直接保存。将使用演示配置：${demoConfig.endpoint}`);
      toast("可直接保存演示配置");
      return;
    }

    const result = validateConfig(systemForm);
    setDrawerFeedback(result.ok ? "✓ 测试通过，连接已就绪。" : result.reason);
    toast(result.ok ? "测试通过" : "连接测试失败");
  }

  function saveSystemConfig(event) {
    event.preventDefault();
    if (!activeSystemId) return;

    const finalConfig = normalizeSystemConfig(activeSystemId, systemForm);
    const system = INTEGRATION_DEFINITIONS.find(item => item.id === activeSystemId);
    const willFinish = !flowRef.current.integrations.done.includes(activeSystemId)
      ? flowRef.current.integrations.done.length + 1 >= INTEGRATION_DEFINITIONS.length
      : flowRef.current.integrations.done.length >= INTEGRATION_DEFINITIONS.length;

    setFlow(prev => {
      const doneSet = new Set(prev.integrations.done);
      doneSet.add(activeSystemId);

      const messages = [
        ...prev.messages,
        createMessage("agent", {
          title: `已连通 ${system.name}`,
          text: willFinish
            ? "所有系统都已就绪，下一步可以生成实例包。"
            : "参数已保存，继续推进剩余系统配置。"
        })
      ];

      if (willFinish) {
        messages.push(createMessage("agent", {
          title: "所有系统都连通了",
          text: "连接层已经就位，接下来把资料、技能和系统配置一起打成实例包。",
          actions: [{ label: "生成实例包 →", action: "generatePackage", primary: true }]
        }));
      }

      return {
        ...prev,
        currentPhase: willFinish ? 6 : Math.max(prev.currentPhase, 5),
        messages,
        integrations: {
          ...prev.integrations,
          configs: {
            ...prev.integrations.configs,
            [activeSystemId]: finalConfig
          },
          done: Array.from(doneSet),
          failed: prev.integrations.failed.filter(item => item !== activeSystemId)
        }
      };
    });

    syncExistingProgress(willFinish ? 5 : 4);
    setDrawerFeedback(finalConfig.__demo ? `已保存演示配置：${finalConfig.endpoint}` : "✓ 配置已保存。");
    toast("系统配置已保存");
    closeSystemDrawer();
  }

  function processIntegrationText(text) {
    const results = parseIntegrationText(text);
    if (!results.length) {
      setFlow(prev => ({
        ...prev,
        messages: [
          ...prev.messages,
          createMessage("user", { text }),
          createMessage("agent", {
            title: "没有识别到系统参数",
            text: "可以直接写「CRM 接口是 https://...，密钥是 sk-...」，或者点系统卡片走表单填写。"
          })
        ]
      }));
      return;
    }

    const nextDone = new Set(flowRef.current.integrations.done);
    const configs = { ...flowRef.current.integrations.configs };
    const cards = [];
    results.forEach(result => {
      configs[result.systemId] = result.config;
      const test = validateConfig(result.config);
      if (test.ok) nextDone.add(result.systemId);
      cards.push({
        label: INTEGRATION_DEFINITIONS.find(item => item.id === result.systemId).name,
        detail: test.ok ? `已确认参数并通过测试：${result.config.endpoint}` : `测试失败：${test.reason}`
      });
    });

    const doneCount = nextDone.size;
    const willFinish = doneCount >= INTEGRATION_DEFINITIONS.length;

    setFlow(prev => ({
      ...prev,
      currentPhase: willFinish ? 6 : Math.max(prev.currentPhase, 5),
      messages: [
        ...prev.messages,
        createMessage("user", { text }),
        createMessage("agent", {
          title: "参数都匹配上了",
          text: "对话里的系统参数已经映射到对应配置里，并做了一次最小连通性检查。",
          card: {
            type: "fileSummary",
            items: cards
          },
          actions: willFinish
            ? [{ label: "生成实例包 →", action: "generatePackage", primary: true }]
            : [{ label: "继续配置系统", action: "startIntegrations" }]
        }),
        ...(willFinish ? [createMessage("agent", {
          title: "所有系统都连通了",
          text: "连接层已经就位，接下来把资料、技能和系统配置一起打成实例包。"
        })] : [])
      ],
      integrations: {
        ...prev.integrations,
        configs: {
          ...prev.integrations.configs,
          ...configs
        },
        done: Array.from(nextDone)
      }
    }));

    if (willFinish) syncExistingProgress(5);
  }

  function generatePackage() {
    if (!areDocsComplete()) {
      toast("请先补齐业务资料");
      return;
    }
    if (!areSkillsReady()) {
      toast("请先补齐查询、处理、升级三类技能");
      return;
    }
    if (!areIntegrationsReady()) {
      toast("请先完成全部系统连接");
      return;
    }
    if (flowRef.current.package.generated) {
      toast("实例包已经生成");
      return;
    }

    setFlow(prev => ({
      ...prev,
      currentPhase: 6,
      messages: [
        ...prev.messages,
        createMessage("agent", {
          title: "正在打包实例……",
          text: "正在整理入职档案、归档知识库索引、封装技能模块、固化系统连接配置。"
        })
      ]
    }));

    const timerId = window.setTimeout(() => {
      setFlow(prev => {
        const meta = buildPackageMeta(prev, assistantName());
        return {
          ...prev,
          package: {
            generated: true,
            meta
          },
          messages: [
            ...prev.messages,
            createMessage("agent", {
              title: "准备好了，可以进入 AI 评估",
              text: "资料、技能和系统配置都已经打包完成。你可以先导出实例包，也可以直接进入后续评估。",
              card: {
                type: "package",
                meta
              },
              actions: [
                { label: "保存实例包", action: "savePackage" },
                { label: "进入 AI 评估 →", action: "enterEvaluation", primary: true }
              ]
            })
          ]
        };
      });
      syncExistingProgress(6);
      toast("实例包已生成");
    }, 1400);

    rememberTimer(timerId);
  }

  function downloadPackage() {
    if (!flowRef.current.package.meta) return;

    const payload = buildPackagePayload(flowRef.current, assistantName());
    if (window.JSZip) {
      const zip = new window.JSZip();
      zip.file("manifest.json", JSON.stringify(payload.manifest, null, 2));
      zip.file("knowledge/index.json", JSON.stringify(payload.knowledge, null, 2));
      zip.file("skills/index.json", JSON.stringify(payload.skills, null, 2));
      zip.file("integrations/config.json", JSON.stringify(payload.integrations, null, 2));
      zip.generateAsync({ type: "blob" }).then(blob => {
        triggerDownload(blob, `${flowRef.current.package.meta.name}.zip`);
        toast("已导出 zip 实例包");
      });
      return;
    }

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    triggerDownload(blob, `${flowRef.current.package.meta.name}.json`);
    toast("当前原型未挂载 zip 库，已导出 JSON 预览");
  }

  function deployPackage() {
    toast("原型演示：这里将执行一键部署");
  }

  function copyCommand() {
    const packageName = flowRef.current.package.meta ? flowRef.current.package.meta.name : "digital-employee";
    const command = `ncrew deploy --package "${packageName}" --env prod`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(command).then(() => {
        toast("部署指令已复制");
      });
      return;
    }

    const helper = document.createElement("textarea");
    helper.value = command;
    document.body.appendChild(helper);
    helper.select();
    document.execCommand("copy");
    helper.remove();
    toast("部署指令已复制");
  }

  function createDepartmentEmployeeForTemplate() {
    const baseName = `${template.name} · 新雇佣版`;
    const name = window.uniqueName(baseName, window.DEPT_EMPLOYEES);
    return window.addDepartmentEmployee({
      id: window.generateId("de"),
      type: "department",
      name,
      initial: (template.initial || name).slice(0, 2),
      tint: template.tint || "blue",
      template: template.id,
      status: "interning_ai",
      desc: template.summary,
      owner: "李部门长",
      dept: "研发部",
      updated: "刚刚",
      tags: [...(template.tags || []).slice(0, 2), "新雇佣"],
      evalProgress: 0,
      hireProgress: 6
    });
  }

  function enterEvaluation() {
    if (!flowRef.current.package.generated) {
      toast("请先生成实例包");
      return;
    }

    let target = existing;
    if (!target) {
      target = createDepartmentEmployeeForTemplate();
    } else {
      window.updateEmployee(target.id, {
        status: "interning_ai",
        evalProgress: 0,
        hireProgress: 6,
        updated: "刚刚"
      });
    }

    clearFlowCache(cacheKey);
    toast("雇佣阶段完成，进入 AI 评估");
    go(`eval-ai/${target.id}`);
  }

  function guideCurrentPhase() {
    const current = flowRef.current.currentPhase;
    if (flowRef.current.package.generated) {
      setFlow(prev => ({
        ...prev,
        messages: [
          ...prev.messages,
          createMessage("agent", {
            title: "实例包已经准备好了",
            text: "你可以直接导出实例包，或者继续进入 AI 评估。",
            actions: [{ label: "进入 AI 评估 →", action: "enterEvaluation", primary: true }]
          })
        ]
      }));
      return;
    }

    if (current <= 3) startDocsFlow(true);
    else if (current === 4) suggestSkills(true);
    else if (current === 5) suggestIntegrations(true);
    else {
      setFlow(prev => ({
        ...prev,
        messages: [
          ...prev.messages,
          createMessage("agent", {
            title: "已进入打包阶段",
            text: "资料、技能和系统都就位之后，就可以开始生成实例包了。",
            actions: [{ label: "生成实例包 →", action: "generatePackage", primary: true }]
          })
        ]
      }));
    }
  }

  function jumpToPhase(phase) {
    if (phase <= 3) {
      startDocsFlow(true);
      return;
    }
    if (phase === 4) {
      suggestSkills(true);
      return;
    }
    if (phase === 5) {
      suggestIntegrations(true);
      return;
    }
    setFlow(prev => ({
      ...prev,
      currentPhase: 6,
      messages: [
        ...prev.messages,
        createMessage("agent", {
          title: "你查看了打包阶段",
          text: flowRef.current.package.generated
            ? "实例包已经生成，可以直接导出或进入 AI 评估。"
            : "完成系统对接后，这里会展示最终的实例包结构。"
        })
      ]
    }));
  }

  function handleAction(action, payload) {
    if (action === "startDocs") startDocsFlow(true);
    else if (action === "startSkills") suggestSkills(true);
    else if (action === "startIntegrations") suggestIntegrations(true);
    else if (action === "adoptSkill") adoptSkill(payload.skillId);
    else if (action === "ignoreSkill") ignoreSkill(payload.skillId);
    else if (action === "editSkill") openSkillEditor(payload.skillId);
    else if (action === "openSystem") openSystemDrawer(payload.systemId);
    else if (action === "generatePackage") generatePackage();
    else if (action === "savePackage") {
      saveFlowDraft();
      toast("实例包已保存");
    }
    else if (action === "downloadPackage") downloadPackage();
    else if (action === "deployPackage") deployPackage();
    else if (action === "copyCommand") copyCommand();
    else if (action === "enterEvaluation") enterEvaluation();
  }

  function handleTextSubmit() {
    const text = draft.trim();
    if (!text) return;
    setDraft("");

    if (flowRef.current.currentPhase <= 3 || !areDocsComplete()) {
      processBusinessText(text);
      return;
    }
    if (flowRef.current.currentPhase === 4) {
      createSkillFromText(text);
      return;
    }
    if (flowRef.current.currentPhase === 5) {
      processIntegrationText(text);
      return;
    }

    setFlow(prev => ({
      ...prev,
      messages: [
        ...prev.messages,
        createMessage("user", { text }),
        createMessage("agent", {
          title: "已记录你的补充",
          text: prev.package.generated ? "实例包已经生成，后续建议直接进入 AI 评估继续验证。" : "如果你已经确认资料、技能和系统都齐备，就可以开始生成实例包了。",
          actions: prev.package.generated ? [{ label: "进入 AI 评估 →", action: "enterEvaluation", primary: true }] : [{ label: "生成实例包 →", action: "generatePackage", primary: true }]
        })
      ]
    }));
  }

  function onBusinessInputChange(event) {
    const files = Array.from(event.target.files || []);
    processBusinessFiles(files);
    event.target.value = "";
  }

  function onSkillInputChange(event) {
    const files = Array.from(event.target.files || []);
    processSkillFiles(files);
    event.target.value = "";
  }

  function handleDrop(event) {
    event.preventDefault();
    setDropActive(false);
    const files = Array.from(event.dataTransfer.files || []);
    if (!files.length) return;
    if (flowRef.current.currentPhase <= 3 || !areDocsComplete()) processBusinessFiles(files);
    else processSkillFiles(files);
  }

  const currentProcessIndex = mapPhaseToProcessIndex(flow.currentPhase);
  const currentSystem = INTEGRATION_DEFINITIONS.find(item => item.id === activeSystemId);
  const resumeLabel = flow.package.generated ? "进入 AI 评估" : "从当前阶段继续";

  return (
    <div className="page">
      <window.Crumb label={`返回${isBranchFlow ? "我的数字员工" : "部门数字员工"}`} onClick={() => go(backTo)} />

      <div className={`hire-flow-v2 ${flow.background === "cool" ? "is-bg-cool" : ""}`}>
        <div className="app-shell">
          <header className="topbar">
            <div>
              <p className="eyebrow">Future Colleague Onboarding</p>
              <h1>数字员工雇佣流程</h1>
            </div>
            <div className="topbar-actions">
              <button className="ghost-btn" onClick={saveFlowDraft}>保存</button>
              <button className="ghost-btn" onClick={resetFlow}>重置流程</button>
              <button className="primary-btn" onClick={flow.package.generated ? enterEvaluation : guideCurrentPhase}>{resumeLabel}</button>
            </div>
          </header>

          <section className="journey-strip">
            <div className="journey-strip-head">
              <div>
                <p className="eyebrow">Hiring Journey</p>
                <h2>流程步骤</h2>
              </div>
              <p className="journey-summary">
                {existing
                  ? `当前正在处理「${existing.name}」的雇佣环节。`
                  : `当前模板为「${template.name}」，完成资料、技能、系统与实例包四段闭环后进入 AI 评估。`}
              </p>
            </div>
            <div className="step-bar">
              {PROCESS_STEPS.map((step, index) => {
                const progress = progressForStep(step, flow);
                const status = progress >= 1 || index < currentProcessIndex
                  ? "done"
                  : index === currentProcessIndex
                    ? "active"
                    : "pending";

                return (
                  <button key={step.id} type="button" className={`step-pill is-${status}`} onClick={() => jumpToPhase(step.phase)}>
                    <span className="step-index">{index + 1}</span>
                    <span className="step-copy">
                      <strong>{step.label}</strong>
                      <small>{step.short}</small>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <main className="layout">
            <section className="chat-panel panel">
              <div className="panel-head">
                <div className="employee-chip">
                  <div className="avatar">{(existing ? existing.initial : template.initial || "雇").slice(0, 2)}</div>
                  <div>
                    <strong>{assistantName()}</strong>
                    <span>{isBranchFlow ? "私人定制流程" : existing ? "继续雇佣中" : "模板新雇佣"}</span>
                  </div>
                </div>
              </div>

              <div className="chat-feed">
                {flow.messages.map(message => (
                  <HireMessageRow key={message.id} message={message} flow={flow} onAction={handleAction} />
                ))}
              </div>

              <div className="composer">
                <div className="composer-box">
                  <div
                    className={`input-wrap ${dropActive ? "active" : ""}`}
                    onDragEnter={event => {
                      event.preventDefault();
                      setDropActive(true);
                    }}
                    onDragOver={event => {
                      event.preventDefault();
                      setDropActive(true);
                    }}
                    onDragLeave={event => {
                      event.preventDefault();
                      setDropActive(false);
                    }}
                    onDrop={handleDrop}
                  >
                    <textarea
                      className="chat-input"
                      rows="3"
                      value={draft}
                      onChange={event => setDraft(event.target.value)}
                      placeholder="输入业务说明、技能需求或系统参数。回车发送，Shift + 回车换行。"
                      onKeyDown={event => {
                        if (event.key === "Enter" && !event.shiftKey) {
                          event.preventDefault();
                          handleTextSubmit();
                        }
                      }}
                    ></textarea>
                    <div className="input-toolbar">
                      <div className="composer-tools">
                        <button type="button" className="tool-btn" onClick={() => businessFileInputRef.current && businessFileInputRef.current.click()}>文件上传</button>
                        <button
                          type="button"
                          className="tool-btn"
                          onClick={() => {
                            if (!areDocsComplete()) {
                              toast("请先补齐业务资料");
                              startDocsFlow(true);
                              return;
                            }
                            if (skillFileInputRef.current) skillFileInputRef.current.click();
                          }}
                        >
                          skill
                        </button>
                      </div>
                      <button type="button" className="send-btn" onClick={handleTextSubmit}>发送</button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <aside className="todo-panel panel">
              <div className="panel-head">
                <div>
                  <p className="eyebrow">Progress Ledger</p>
                  <h2>待办事项</h2>
                </div>
                <div className="score-card">
                  <span>{completionRatio()}%</span>
                  <small>完成度</small>
                </div>
              </div>

              <div className="todo-groups">
                {todoItems().map(item => {
                  const status = stepStatus(item);
                  return (
                    <div key={item.id} type="button" className={`todo-item ${flow.currentPhase >= item.phase ? "active" : ""}`} onClick={() => jumpToPhase(item.phase)}>
                      <div className="todo-head">
                        <div>
                          <h3>{item.title}</h3>
                          <p>{item.description}</p>
                        </div>
                        <div className={`todo-status ${status.className}`}>
                          <span className="status-icon">{status.icon}</span>
                          <span>{status.label}</span>
                        </div>
                      </div>
                      <div className="todo-progress"><span style={{ width: `${Math.round(item.progress * 100)}%` }}></span></div>

                      {item.subtasks.length > 0 && (
                        <div className="todo-subtasks">
                          {item.subtasks.map(label => {
                            const sub = subtaskStatus(item.id, label);
                            const system = item.id === "integrations" ? INTEGRATION_DEFINITIONS.find(entry => entry.name === label) : null;
                            const config = system && flow.integrations.configs[system.id];
                            return system ? (
                              <button key={label} type="button" className={`subtask-chip subtask-chip-action ${sub.className}`} onClick={event => {
                                event.stopPropagation();
                                openSystemDrawer(system.id);
                              }}>
                                <div className="subtask-label-group">
                                  <span>{label}</span>
                                  {config && flow.integrations.done.includes(system.id) && <small className="subtask-hint">{renderIntegrationSummary(config)}</small>}
                                </div>
                                <strong>{sub.icon} {sub.label}</strong>
                              </button>
                            ) : (
                              <div key={label} className={`subtask-chip ${sub.className}`}>
                                <span>{label}</span>
                                <strong>{sub.icon} {sub.label}</strong>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {item.id === "package" && flow.package.meta && (
                        <div className="todo-package-preview">
                          <div className="todo-package-badge">
                            <span className="todo-package-icon">📦</span>
                            <span className="todo-package-name">{flow.package.meta.name}</span>
                            <span className="todo-package-status">已生成</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {!flow.messages.length && (
                  <p className="empty-tip">雇佣引导会从左侧会话开始。点击“开始第一步”后，右侧待办会跟随推进。</p>
                )}
              </div>
            </aside>
          </main>
        </div>

        <HireSystemDrawer
          open={!!activeSystemId}
          system={currentSystem}
          form={systemForm}
          feedback={drawerFeedback}
          onChange={handleSystemFormChange}
          onClose={closeSystemDrawer}
          onTest={testCurrentSystem}
          onSubmit={saveSystemConfig}
        />

        <HireSkillModal
          open={!!editingSkillId}
          form={skillForm}
          onChange={event => {
            const { name, value } = event.target;
            setSkillForm(prev => ({ ...prev, [name]: value }));
          }}
          onClose={closeSkillEditor}
          onSubmit={submitSkillEdit}
        />

        {flow.package.generated && (
          <button className="float-evaluation-btn" onClick={enterEvaluation}>
            进入 AI 评估 →
          </button>
        )}

        <input ref={businessFileInputRef} type="file" multiple hidden onChange={onBusinessInputChange} />
        <input ref={skillFileInputRef} type="file" multiple hidden onChange={onSkillInputChange} />
      </div>
    </div>
  );
}

Object.assign(window, { HirePage });
