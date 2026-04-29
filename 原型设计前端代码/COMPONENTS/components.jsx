/* global window, React */
const { useState, useEffect } = React;

// ===== Icons (inline SVG) =====
const Icon = {
  search: (p = {}) => (<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="9" cy="9" r="6" /><path d="m14 14 4 4" /></svg>),
  arrow: (p = {}) => (<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M4 10h12M11 5l5 5-5 5" /></svg>),
  back: (p = {}) => (<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M16 10H4M9 5 4 10l5 5" /></svg>),
  check: (p = {}) => (<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="m4 10 4 4 8-9" /></svg>),
  x: (p = {}) => (<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M5 5l10 10M15 5 5 15" /></svg>),
  spark: (p = {}) => (<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M10 3v3M10 14v3M3 10h3M14 10h3M5.6 5.6l2.1 2.1M12.3 12.3l2.1 2.1M5.6 14.4l2.1-2.1M12.3 7.7l2.1-2.1" /></svg>),
  bot: (p = {}) => (<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="4" y="6" width="12" height="10" rx="2" /><path d="M10 6V3M7 10v1M13 10v1" /></svg>),
  copy: (p = {}) => (<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="6" y="6" width="10" height="10" rx="2" /><path d="M4 14V6a2 2 0 0 1 2-2h8" /></svg>),
  shield: (p = {}) => (<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M10 3 4 5v5c0 4 3 6 6 7 3-1 6-3 6-7V5l-6-2Z" /></svg>),
  star: (p = {}) => (<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}><path d="m10 3 2.2 4.5 5 .7-3.6 3.5.85 5L10 14.3 5.55 16.7l.85-5L2.8 8.2l5-.7L10 3Z" /></svg>),
  download: (p = {}) => (<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M10 3v10M5 9l5 5 5-5M4 17h12" /></svg>),
  users: (p = {}) => (<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="8" cy="8" r="3" /><path d="M3 16c0-2.2 2.2-4 5-4s5 1.8 5 4M14 8a3 3 0 1 0-2-5.2" /><path d="M13 13c2.2 0 4 1.5 4 3" /></svg>),
  clock: (p = {}) => (<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="10" cy="10" r="7" /><path d="M10 6v4l2.5 2" /></svg>),
  plus: (p = {}) => (<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M10 4v12M4 10h12" /></svg>),
  ext: (p = {}) => (<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M9 5H5v10h10v-4" /><path d="M11 4h5v5" /><path d="m11 9 5-5" /></svg>),
  more: (p = {}) => (<svg viewBox="0 0 20 20" fill="currentColor" {...p}><circle cx="5" cy="10" r="1.4" /><circle cx="10" cy="10" r="1.4" /><circle cx="15" cy="10" r="1.4" /></svg>),
  filter: (p = {}) => (<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 5h14M5 10h10M8 15h4" /></svg>),
  upload: (p = {}) => (<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M10 16V6M5 11l5-5 5 5M4 17h12" /></svg>),
  chat: (p = {}) => (<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H8l-4 3v-3H5a2 2 0 0 1-2-2V5Z" /></svg>),
  lark: (p = {}) => (<svg viewBox="0 0 20 20" fill="currentColor" {...p}><path d="M3.5 11.5c2-2 5-3.6 8-3.6S16.5 9 17.5 9.5l-2 6c-1-.5-3.4-2-6.4-2S5 14.5 4 16l-.5-4.5Z" opacity=".9" /></svg>)
};

function Avatar({ initial, tint = "gray", size = "md" }) {
  return <span className={`avatar avatar-${size} ${tint}`}>{initial}</span>;
}

function StatusPill({ status }) {
  const meta = window.STATUS_LABEL[status] || { text: status, cls: "" };
  return <span className={`status ${meta.cls}`}>{meta.text}</span>;
}

function TypePill({ type }) {
  const map = {
    template: { text: "模板", cls: "gray" },
    department: { text: "部门员工", cls: "blue" },
    personal_clone: { text: "我的分身", cls: "purple" },
    private_branch: { text: "私人定制", cls: "pink" }
  };
  const meta = map[type] || { text: type, cls: "gray" };
  return <span className={`pill ${meta.cls}`}>{meta.text}</span>;
}

function IMStatusStrip({ employeeId, compact, onClick }) {
  return (
    <div className={`im-status-strip ${compact ? "compact" : ""}`}>
      {Object.entries(window.IM_CHANNEL_META).map(([channelId, channel]) => {
        const status = window.getBindingStatus(employeeId, channelId);
        const cls = status === "connected" ? "connected" : status === "error" ? "error" : "idle";
        const label = status === "connected" ? "已连接" : status === "error" ? "异常" : "未配置";
        return (
          <button
            key={channelId}
            type="button"
            className={`im-status-dot ${cls}`}
            onClick={evt => {
              evt.stopPropagation();
              if (onClick) onClick(channelId);
            }}
          >
            <span className="im-status-dot-mark">{channel.short}</span>
            {!compact && <span className="im-status-dot-text">{channel.name} · {label}</span>}
          </button>
        );
      })}
    </div>
  );
}

function resolveTopNav(route) {
  if (!route) return "templates";
  if (route.startsWith("templates") || route.startsWith("template/")) return "templates";
  if (route.startsWith("hire/new")) return "templates";
  if (route.startsWith("dept")) return "dept";
  if (route.startsWith("my")) return "my";

  const id = route.split("/")[1] ? route.split("/")[1].split("?")[0] : "";
  const employee = id ? window.findEmployeeById(id) : null;

  if (route.startsWith("clone/") || route.startsWith("quick-clone/")) return "dept";
  if (route.startsWith("chat/") || route.startsWith("im/")) return "my";
  if (route.startsWith("employee/") || route.startsWith("publish/") || route.startsWith("eval-ai/") || route.startsWith("eval-human/") || route.startsWith("review/")) {
    return employee && employee.type === "department" ? "dept" : "my";
  }
  if (route.startsWith("branch/")) return "my";
  if (route.startsWith("hire/")) return employee && employee.type === "department" ? "dept" : "my";
  return null;
}

function TopNav({ role, setRole, route, go }) {
  const viewer = window.getViewer(role);
  const isManager = role === "manager";
  const items = isManager
    ? [
        { id: "templates", label: "企业模板池" },
        { id: "dept", label: "部门数字员工" },
        { id: "my", label: "我的数字员工" }
      ]
    : [
        { id: "dept", label: "部门数字员工" },
        { id: "my", label: "我的数字员工" }
      ];

  const activeTop = resolveTopNav(route);

  return (
    <header className="topnav">
      <div className="topnav-inner">
        <div className="brand" onClick={() => go(isManager ? "templates" : "dept")} style={{ cursor: "pointer" }}>
          <div className="brand-logo">雇</div>
          <span>雇佣端</span>
          <span className="brand-eyes">👀</span>
        </div>

        <nav className="nav-links">
          {items.map(item => (
            <a
              key={item.id}
              className={`nav-link ${activeTop === item.id ? "active" : "muted"}`}
              onClick={() => go(item.id)}
            >
              {item.label}
              {item.id === "templates" && <span className="nav-badge-new">new</span>}
            </a>
          ))}
        </nav>

        <div className="nav-spacer" />

        <div className="nav-right">
          <div className="role-switch" title="演示模式 · 切换查看角色">
            <button className={isManager ? "active" : ""} onClick={() => setRole("manager")}>
              <span className="role-emoji">🧑‍💼</span> 部门长
            </button>
            <button className={!isManager ? "active" : ""} onClick={() => setRole("member")}>
              <span className="role-emoji">🧑‍💻</span> 普通成员
            </button>
          </div>
          <div className="user-chip">
            <Avatar initial={viewer.short} tint={isManager ? "blue" : "green"} size="sm" />
            <span>{viewer.name} · {viewer.dept}</span>
          </div>
        </div>
      </div>
    </header>
  );
}

function ToastHost({ toasts }) {
  return (
    <div className="toast-wrap">
      {toasts.map(item => <div key={item.id} className={`toast ${item.kind || ""}`}>{item.msg}</div>)}
    </div>
  );
}

function Modal({ open, onClose, title, sub, children, footer, lg }) {
  if (!open) return null;
  return (
    <div className="modal-mask" onClick={onClose}>
      <div className={`modal ${lg ? "lg" : ""}`} style={{ position: "relative" }} onClick={evt => evt.stopPropagation()}>
        <button className="modal-close" onClick={onClose}><Icon.x className="icn" /></button>
        {(title || sub) && (
          <div className="modal-head">
            {title && <h3 className="modal-title">{title}</h3>}
            {sub && <p className="modal-sub">{sub}</p>}
          </div>
        )}
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  );
}

function IMPickerModal({ open, onClose, employee, onConfig }) {
  const [opened, setOpened] = useState("");

  useEffect(() => {
    if (!open) setOpened("");
  }, [open, employee && employee.id]);

  if (!employee) return null;
  const connected = window.getConnectedChannels(employee.id);

  if (connected.length === 0) {
    return (
      <Modal
        open={open}
        onClose={onClose}
        title="该员工尚未接入 IM"
        sub="平台会话已经可用，你也可以现在去完成 IM 配置。"
        footer={(
          <>
            <button className="btn btn-ghost btn-sm" onClick={onClose}>取消</button>
            <button className="btn btn-primary btn-sm" onClick={() => { onClose(); onConfig(); }}>去配置 IM</button>
          </>
        )}
      >
        <div className="callout info">
          IM 接入是个人分身层面的可选动作，不阻塞上岗。完成配置后，你就能从卡片、详情页和站内对话页顶部直接“去 IM”。
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`去 IM · ${employee.name}`}
      sub="演示模式下会模拟拉起对应平台私聊。"
      footer={<button className="btn btn-ghost btn-sm" onClick={onClose}>关闭</button>}
    >
      <div className="jump-grid">
        {connected.map(channelId => {
          const channel = window.IM_CHANNEL_META[channelId];
          return (
            <button
              key={channelId}
              className={`jump-chip ${opened === channelId ? "active" : ""}`}
              onClick={() => setOpened(channelId)}
            >
              <span className={`jump-chip-mark ${channel.accent}`}>{channel.short}</span>
              <span>{channel.name}</span>
            </button>
          );
        })}
      </div>
      {opened && (
        <div className="spacer-16" />
      )}
      {opened && (
        <div className="callout success">
          演示模式已模拟拉起 {window.IM_CHANNEL_META[opened].name} 私聊。真实产品里这里会跳转到对应 IM 机器人会话。
        </div>
      )}
    </Modal>
  );
}

function Lineage({ employee }) {
  const segments = [];
  const template = window.findTemplateById(employee.template);
  if (template) segments.push({ kind: "模板", name: template.name });

  if (employee.type === "department" && employee.clonedFrom) {
    const source = window.findEmployeeById(employee.clonedFrom);
    if (source) segments.push({ kind: "快捷复制源", name: source.name });
  }

  if (employee.type === "department") {
    segments.push({ kind: "部门员工", name: employee.name });
  }

  if (employee.type === "personal_clone") {
    const department = window.findEmployeeById(employee.parent);
    if (department) segments.push({ kind: "部门员工", name: department.name });
    segments.push({ kind: "我的分身", name: employee.name });
  }

  if (employee.type === "private_branch") {
    const parentClone = window.findEmployeeById(employee.parent);
    if (parentClone) {
      const department = window.findEmployeeById(parentClone.parent);
      if (department) segments.push({ kind: "部门员工", name: department.name });
      segments.push({ kind: "我的分身", name: parentClone.name });
    }
    segments.push({ kind: "私人定制", name: employee.name });
  }

  return (
    <div className="lineage">
      {segments.map((item, idx) => (
        <React.Fragment key={`${item.kind}-${idx}`}>
          <span className="seg"><span className="muted" style={{ fontSize: 11 }}>{item.kind}</span> · {item.name}</span>
          {idx < segments.length - 1 && <span className="arr">→</span>}
        </React.Fragment>
      ))}
    </div>
  );
}

function EmployeeCard({ emp, onClick, footerActions, extraPanel, cardHint }) {
  return (
    <div className="card emp-card" onClick={onClick}>
      <div className="emp-head">
        <Avatar initial={emp.initial} tint={emp.tint} size="md" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="row between" style={{ gap: 8 }}>
            <h4 className="emp-name">{emp.name}</h4>
            <StatusPill status={emp.status} />
          </div>
          <div className="emp-meta">
            <TypePill type={emp.type} />
            <span style={{ margin: "0 8px" }}>·</span>
            最近更新 {emp.updated}
          </div>
        </div>
      </div>

      <p className="emp-desc">{emp.desc}</p>

      <div className="emp-tags">
        {(emp.tags || []).slice(0, 3).map((tag, idx) => (
          <span key={`${tag}-${idx}`} className={`pill ${["blue", "orange", "green", "gray", "pink", "purple"][idx % 6]}`}>{tag}</span>
        ))}
      </div>

      {emp.status === "interning_ai" && typeof emp.evalProgress === "number" && (
        <div>
          <div className="row between" style={{ fontSize: 12, color: "var(--c-body-soft)", marginBottom: 6 }}>
            <span>AI 评估进度</span><span className="tnum">{emp.evalProgress}%</span>
          </div>
          <div className="progress blue"><div style={{ width: `${emp.evalProgress}%` }} /></div>
        </div>
      )}

      {emp.status === "interning_human" && typeof emp.evalProgress === "number" && (
        <div>
          <div className="row between" style={{ fontSize: 12, color: "var(--c-body-soft)", marginBottom: 6 }}>
            <span>人工评估进度</span><span className="tnum">{emp.evalProgress}%</span>
          </div>
          <div className="progress"><div style={{ width: `${emp.evalProgress}%`, background: "#6a5acd" }} /></div>
        </div>
      )}

      {emp.status === "hired" && typeof emp.hireProgress === "number" && (
        <div>
          <div className="row between" style={{ fontSize: 12, color: "var(--c-body-soft)", marginBottom: 6 }}>
            <span>雇佣流程进度</span><span className="tnum">{emp.hireProgress}/6 步</span>
          </div>
          <div className="progress"><div style={{ width: `${(emp.hireProgress / 6) * 100}%` }} /></div>
        </div>
      )}

      {emp.status === "failed" && (
        <div className="callout danger" style={{ padding: "8px 12px" }}>
          评估失败 · 建议回退到「{emp.failedReason || "差距挖掘"}」工位
        </div>
      )}

      {extraPanel}

      {cardHint && <div className="card-hint">{cardHint}</div>}

      <div className="emp-foot">
        <div className="emp-stats">
          {emp.status === "live" ? (
            <>
              <span><Icon.users className="icn" /> {emp.cloned || 0} 复制</span>
              <span><Icon.spark className="icn" /> {emp.runs || 0} 任务</span>
              <span><Icon.clock className="icn" /> {emp.activeAt || "—"}</span>
            </>
          ) : (
            <span>类型：{window.TYPE_LABEL[emp.type]}</span>
          )}
        </div>
        <div className="emp-actions">
          {footerActions || (
            <button
              className="btn-link"
              onClick={evt => {
                evt.stopPropagation();
                onClick();
              }}
            >
              查看详情 →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function StatStrip({ items }) {
  return (
    <div className="stat-strip">
      {items.map((item, idx) => (
        <div className="stat-cell" key={`${item.label}-${idx}`}>
          <div className="stat-icon">{item.icon}</div>
          <div className="stat-value">{item.value}</div>
          <div className="stat-label">{item.label}</div>
        </div>
      ))}
    </div>
  );
}

function Crumb({ label, onClick }) {
  return (
    <a className="crumb" onClick={onClick}>
      <Icon.back className="icn" /> {label}
    </a>
  );
}

function StepsBar({ steps, current, view = current, onStepClick, isStepClickable, isStepConfirmed }) {
  return (
    <div className="steps">
      {steps.map((step, idx) => {
        const classes = [];
        const clickable = typeof onStepClick === "function" && (typeof isStepClickable === "function" ? isStepClickable(idx) : idx <= current);
        const confirmed = typeof isStepConfirmed === "function" ? isStepConfirmed(idx) : idx < current;
        let stateLabel = "";
        if (idx < current) classes.push("done");
        if (idx === current) classes.push("active");
        if (idx === view && idx !== current) classes.push("viewing");
        if (clickable) classes.push("clickable");
        if (idx === view && idx !== current) stateLabel = "回看中";
        else if (idx === current) stateLabel = confirmed ? "已确认" : "进行中";
        else if (confirmed) stateLabel = "已确认";
        const content = (
          <>
            <span className="num">{idx + 1}</span>
            <span className="step-copy">
              <span className="step-title">{step.title}</span>
              {stateLabel && <span className="step-state">{stateLabel}</span>}
            </span>
          </>
        );
        return (
          <React.Fragment key={step.id}>
            {clickable ? (
              <button type="button" className={`step ${classes.join(" ")}`} onClick={() => onStepClick(idx)}>
                {content}
              </button>
            ) : (
              <div className={`step ${classes.join(" ")}`}>
                {content}
              </div>
            )}
            {idx < steps.length - 1 && <span className="step-arrow">→</span>}
          </React.Fragment>
        );
      })}
    </div>
  );
}

Object.assign(window, {
  Icon,
  Avatar,
  StatusPill,
  TypePill,
  IMStatusStrip,
  TopNav,
  ToastHost,
  Modal,
  IMPickerModal,
  Lineage,
  EmployeeCard,
  StatStrip,
  Crumb,
  StepsBar
});
