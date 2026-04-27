/* global window, React */
const { useState, useEffect, useRef, useCallback } = React;

// ===== Icons (inline SVG) =====
const Icon = {
  search: (p={}) => (<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="9" cy="9" r="6"/><path d="m14 14 4 4"/></svg>),
  arrow: (p={}) => (<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M4 10h12M11 5l5 5-5 5"/></svg>),
  back: (p={}) => (<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M16 10H4M9 5 4 10l5 5"/></svg>),
  check: (p={}) => (<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="m4 10 4 4 8-9"/></svg>),
  x: (p={}) => (<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M5 5l10 10M15 5 5 15"/></svg>),
  spark: (p={}) => (<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M10 3v3M10 14v3M3 10h3M14 10h3M5.6 5.6l2.1 2.1M12.3 12.3l2.1 2.1M5.6 14.4l2.1-2.1M12.3 7.7l2.1-2.1"/></svg>),
  bot: (p={}) => (<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="4" y="6" width="12" height="10" rx="2"/><path d="M10 6V3M7 10v1M13 10v1"/></svg>),
  copy: (p={}) => (<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="6" y="6" width="10" height="10" rx="2"/><path d="M4 14V6a2 2 0 0 1 2-2h8"/></svg>),
  shield: (p={}) => (<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M10 3 4 5v5c0 4 3 6 6 7 3-1 6-3 6-7V5l-6-2Z"/></svg>),
  star: (p={}) => (<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}><path d="m10 3 2.2 4.5 5 .7-3.6 3.5.85 5L10 14.3 5.55 16.7l.85-5L2.8 8.2l5-.7L10 3Z"/></svg>),
  download: (p={}) => (<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M10 3v10M5 9l5 5 5-5M4 17h12"/></svg>),
  users: (p={}) => (<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="8" cy="8" r="3"/><path d="M3 16c0-2.2 2.2-4 5-4s5 1.8 5 4M14 8a3 3 0 1 0-2-5.2"/><path d="M13 13c2.2 0 4 1.5 4 3"/></svg>),
  clock: (p={}) => (<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="10" cy="10" r="7"/><path d="M10 6v4l2.5 2"/></svg>),
  plus: (p={}) => (<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M10 4v12M4 10h12"/></svg>),
  ext: (p={}) => (<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M9 5H5v10h10v-4"/><path d="M11 4h5v5"/><path d="m11 9 5-5"/></svg>),
  more: (p={}) => (<svg viewBox="0 0 20 20" fill="currentColor" {...p}><circle cx="5" cy="10" r="1.4"/><circle cx="10" cy="10" r="1.4"/><circle cx="15" cy="10" r="1.4"/></svg>),
  filter: (p={}) => (<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 5h14M5 10h10M8 15h4"/></svg>),
  upload: (p={}) => (<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M10 16V6M5 11l5-5 5 5M4 17h12"/></svg>),
  chat: (p={}) => (<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H8l-4 3v-3H5a2 2 0 0 1-2-2V5Z"/></svg>),
  lark: (p={}) => (<svg viewBox="0 0 20 20" fill="currentColor" {...p}><path d="M3.5 11.5c2-2 5-3.6 8-3.6S16.5 9 17.5 9.5l-2 6c-1-.5-3.4-2-6.4-2S5 14.5 4 16l-.5-4.5Z" opacity=".9"/></svg>)
};

// ===== Avatar =====
function Avatar({ initial, tint = "gray", size = "md" }) {
  return <span className={`avatar avatar-${size} ${tint}`}>{initial}</span>;
}

// ===== Status pill =====
function StatusPill({ status }) {
  const meta = window.STATUS_LABEL[status] || { text: status, cls: "" };
  return <span className={`status ${meta.cls}`}>{meta.text}</span>;
}

// ===== Type pill =====
function TypePill({ type }) {
  const map = {
    template: { text: "模板", cls: "gray" },
    department: { text: "部门员工", cls: "blue" },
    personal_clone: { text: "我的分身", cls: "purple" },
    private_branch: { text: "私人定制", cls: "pink" }
  };
  const m = map[type] || { text: type, cls: "gray" };
  return <span className={`pill ${m.cls}`}>{m.text}</span>;
}

// ===== Top navigation =====
function TopNav({ role, setRole, route, go }) {
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

  const activeTop = (() => {
    if (!route) return null;
    if (route.startsWith("templates") || route.startsWith("template/")) return "templates";
    if (route.startsWith("dept")) return "dept";
    if (route.startsWith("my")) return "my";
    if (route.startsWith("employee/")) return null;
    return null;
  })();

  return (
    <header className="topnav">
      <div className="topnav-inner">
        <div className="brand" onClick={() => go(isManager ? "templates" : "dept")} style={{cursor:"pointer"}}>
          <div className="brand-logo">雇</div>
          <span>雇佣端</span>
          <span className="brand-eyes">👀</span>
        </div>
        <nav className="nav-links">
          {items.map(it => (
            <a key={it.id}
               className={`nav-link ${activeTop === it.id ? "active" : "muted"}`}
               onClick={() => go(it.id)}>
              {it.label}
              {it.id === "templates" && <span className="nav-badge-new">new</span>}
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
            <Avatar initial={isManager ? "李" : "王"} tint={isManager ? "blue" : "green"} size="sm" />
            <span>{isManager ? "李部门长 · 研发部" : "王成员 · 研发部"}</span>
          </div>
        </div>
      </div>
    </header>
  );
}

// ===== Toast system =====
function ToastHost({ toasts }) {
  return (
    <div className="toast-wrap">
      {toasts.map(t => <div key={t.id} className={`toast ${t.kind || ""}`}>{t.msg}</div>)}
    </div>
  );
}

// ===== Modal shell =====
function Modal({ open, onClose, title, sub, children, footer, lg }) {
  if (!open) return null;
  return (
    <div className="modal-mask" onClick={onClose}>
      <div className={`modal ${lg ? "lg" : ""}`} style={{position:"relative"}} onClick={(e) => e.stopPropagation()}>
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

// ===== Lark guide modal — 飞书使用引导弹层 =====
function LarkGuideModal({ open, onClose, employee }) {
  if (!employee) return null;
  return (
    <Modal open={open} onClose={onClose}
      title="去飞书使用"
      sub="数字员工只在飞书一对一私聊中正式使用，本页不做主生产对话。"
      footer={
        <>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>稍后</button>
          <button className="btn btn-primary btn-sm" onClick={onClose}>已复制 · 打开飞书</button>
        </>
      }>
      <div className="lark-preview">
        <div className="lark-bar">
          <Avatar initial={employee.initial} tint={employee.tint} size="md" />
          <div>
            <div className="name">{employee.name}</div>
            <div className="desc">@ {employee.dept || "研发部"} · 数字员工</div>
          </div>
        </div>
        <div className="spacer-12" />
        <ol style={{margin:0, paddingLeft:18, color:"var(--c-body)", lineHeight:1.7, fontSize:13.5}}>
          <li>打开飞书，搜索 <strong>{employee.name}</strong> 这个机器人。</li>
          <li>进入一对一私聊窗口，直接用自然语言下达任务。</li>
          <li>群聊不会响应；任何对外发送都将以你本人的身份登记。</li>
        </ol>
      </div>
    </Modal>
  );
}

// ===== Lineage row =====
function Lineage({ employee }) {
  const segs = [];
  segs.push({ kind: "模板", name: (window.findTemplateById(employee.template) || {}).name || "—" });
  if (employee.type === "department") segs.push({ kind: "部门员工", name: employee.name });
  if (employee.type === "personal_clone") {
    const dep = window.DEPT_EMPLOYEES.find(d => d.id === employee.parent);
    if (dep) segs.push({ kind: "部门员工", name: dep.name });
    segs.push({ kind: "我的分身", name: employee.name });
  }
  if (employee.type === "private_branch") {
    const pc = window.MY_EMPLOYEES.find(d => d.id === employee.parent);
    if (pc) {
      const dep = window.DEPT_EMPLOYEES.find(d => d.id === pc.parent);
      if (dep) segs.push({ kind: "部门员工", name: dep.name });
      segs.push({ kind: "我的分身", name: pc.name });
    }
    segs.push({ kind: "私人定制", name: employee.name });
  }
  return (
    <div className="lineage">
      {segs.map((s, i) => (
        <React.Fragment key={i}>
          <span className="seg"><span className="muted" style={{fontSize:11}}>{s.kind}</span> · {s.name}</span>
          {i < segs.length - 1 && <span className="arr">→</span>}
        </React.Fragment>
      ))}
    </div>
  );
}

// ===== Employee Card =====
function EmployeeCard({ emp, onClick, primary }) {
  return (
    <div className="card emp-card" onClick={onClick}>
      <div className="emp-head">
        <Avatar initial={emp.initial} tint={emp.tint} size="md" />
        <div style={{flex:1, minWidth:0}}>
          <div className="row between" style={{gap:8}}>
            <h4 className="emp-name">{emp.name}</h4>
            <StatusPill status={emp.status} />
          </div>
          <div className="emp-meta">
            <TypePill type={emp.type} />
            <span style={{margin:"0 8px"}}>·</span>
            最近更新 {emp.updated}
          </div>
        </div>
      </div>
      <p className="emp-desc">{emp.desc}</p>
      <div className="emp-tags">
        {(emp.tags || []).slice(0, 3).map((t, i) => (
          <span key={i} className={`pill ${["blue","orange","green","gray","pink","purple"][i % 6]}`}>{t}</span>
        ))}
      </div>

      {emp.status === "interning_ai" && typeof emp.evalProgress === "number" && (
        <div>
          <div className="row between" style={{fontSize:12, color:"var(--c-body-soft)", marginBottom:6}}>
            <span>AI 评估进度</span><span className="tnum">{emp.evalProgress}%</span>
          </div>
          <div className="progress blue"><div style={{width: `${emp.evalProgress}%`}}/></div>
        </div>
      )}
      {emp.status === "interning_human" && typeof emp.evalProgress === "number" && (
        <div>
          <div className="row between" style={{fontSize:12, color:"var(--c-body-soft)", marginBottom:6}}>
            <span>人工评估进度</span><span className="tnum">{emp.evalProgress}%</span>
          </div>
          <div className="progress"><div style={{width: `${emp.evalProgress}%`, background:"#6a5acd"}}/></div>
        </div>
      )}
      {emp.status === "hired" && typeof emp.hireProgress === "number" && (
        <div>
          <div className="row between" style={{fontSize:12, color:"var(--c-body-soft)", marginBottom:6}}>
            <span>雇佣流程进度</span><span className="tnum">{emp.hireProgress}/6 步</span>
          </div>
          <div className="progress"><div style={{width: `${(emp.hireProgress/6)*100}%`}}/></div>
        </div>
      )}
      {emp.status === "failed" && (
        <div className="callout danger" style={{padding:"8px 12px"}}>
          评估失败 · 建议回退到「{emp.failedReason || "差距挖掘"}」工位
        </div>
      )}

      <div className="emp-foot">
        <div className="emp-stats">
          {emp.status === "live" && (
            <>
              <span><Icon.users className="icn"/> {emp.cloned || 0} 复制</span>
              <span><Icon.spark className="icn"/> {emp.runs || 0} 任务</span>
              <span><Icon.clock className="icn"/> {emp.activeAt || "—"}</span>
            </>
          )}
          {emp.status !== "live" && (
            <span>类型：{window.TYPE_LABEL[emp.type]}</span>
          )}
        </div>
        <button className="btn-link" onClick={(e) => { e.stopPropagation(); onClick(); }}>查看详情 →</button>
      </div>
    </div>
  );
}

// ===== Stat strip =====
function StatStrip({ items }) {
  return (
    <div className="stat-strip">
      {items.map((it, i) => (
        <div className="stat-cell" key={i}>
          <div className="stat-icon">{it.icon}</div>
          <div className="stat-value">{it.value}</div>
          <div className="stat-label">{it.label}</div>
        </div>
      ))}
    </div>
  );
}

// ===== Crumb =====
function Crumb({ label, onClick }) {
  return (
    <a className="crumb" onClick={onClick}>
      <Icon.back className="icn" /> {label}
    </a>
  );
}

// ===== Steps display for hire flow =====
function StepsBar({ steps, current }) {
  return (
    <div className="steps">
      {steps.map((s, i) => {
        const cls = i < current ? "done" : i === current ? "active" : "";
        return (
          <React.Fragment key={s.id}>
            <div className={`step ${cls}`}>
              <span className="num">{i + 1}</span>
              <span>{s.title}</span>
            </div>
            {i < steps.length - 1 && <span className="step-arrow">→</span>}
          </React.Fragment>
        );
      })}
    </div>
  );
}

Object.assign(window, {
  Icon, Avatar, StatusPill, TypePill, TopNav, ToastHost, Modal, LarkGuideModal,
  Lineage, EmployeeCard, StatStrip, Crumb, StepsBar
});
