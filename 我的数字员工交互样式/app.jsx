/* global React, ReactDOM */
const { useState, useRef, useEffect, useMemo } = React;
const { employees, conversations: initialConvos } = window.__DATA__;

/* ---------------- icons ---------------- */
const I = {
  users: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  robot: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="8" width="18" height="12" rx="3"/>
      <path d="M12 8V4"/>
      <circle cx="12" cy="3" r="1"/>
      <circle cx="9" cy="14" r="1" fill="currentColor"/>
      <circle cx="15" cy="14" r="1" fill="currentColor"/>
    </svg>
  ),
  spark: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8"/>
    </svg>
  ),
  shield: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  clock: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9"/>
      <path d="M12 7v5l3 2"/>
    </svg>
  ),
  grid: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3"  width="7" height="7" rx="1"/>
      <rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/>
      <rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  ),
  list: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 6h13M8 12h13M8 18h13"/>
      <circle cx="4" cy="6"  r="1" fill="currentColor"/>
      <circle cx="4" cy="12" r="1" fill="currentColor"/>
      <circle cx="4" cy="18" r="1" fill="currentColor"/>
    </svg>
  ),
  search: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7"/>
      <path d="M21 21l-4.3-4.3"/>
    </svg>
  ),
  lock: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="11" width="16" height="10" rx="2"/>
      <path d="M8 11V7a4 4 0 0 1 8 0v4"/>
    </svg>
  ),
  info: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9"/>
      <path d="M12 8h.01M11 12h1v5h1"/>
    </svg>
  ),
  send: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 2L11 13"/>
      <path d="M22 2l-7 20-4-9-9-4 20-7z"/>
    </svg>
  ),
  paperclip: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.5L12 21a5.5 5.5 0 0 1-7.8-7.8L13 4.4a3.7 3.7 0 0 1 5.2 5.2L9.6 18.2a1.8 1.8 0 0 1-2.6-2.6l8-8"/>
    </svg>
  ),
  emoji: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9"/>
      <path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/>
    </svg>
  ),
  more: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="5"  cy="12" r="1" fill="currentColor"/>
      <circle cx="12" cy="12" r="1" fill="currentColor"/>
      <circle cx="19" cy="12" r="1" fill="currentColor"/>
    </svg>
  ),
  pin: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v6M9 8h6l2 6H7l2-6zM12 14v8"/>
    </svg>
  ),
};

/* ---------------- top nav ---------------- */
function TopNav() {
  const [role, setRole] = useState("manager");
  return (
    <nav className="nav">
      <div className="brand">
        <div className="brand-mark">雇</div>
        <span>雇佣端</span>
        <span className="brand-eyes">··</span>
      </div>
      <div className="nav-tabs">
        <div className="nav-tab">
          企业模板池
          <span className="new-pill">new</span>
        </div>
        <div className="nav-tab">部门数字员工</div>
        <div className="nav-tab active">我的数字员工</div>
      </div>
      <div className="role-switch">
        <button className={role === "manager" ? "on" : ""} onClick={() => setRole("manager")}>
          <span>👤</span>部门长
        </button>
        <button className={role === "member" ? "on" : ""} onClick={() => setRole("member")}>
          <span>👥</span>普通成员
        </button>
      </div>
      <div className="user-chip">
        <div className="avatar">李</div>
        <span>李部门长 · 研发部</span>
      </div>
    </nav>
  );
}

/* ---------------- stats ---------------- */
function Stats() {
  const stats = [
    { icon: I.users, value: 4, label: "实例总数" },
    { icon: I.robot, value: 2, label: "已上岗" },
    { icon: I.spark, value: 1, label: "评估中" },
    { icon: I.shield, value: 1, label: "私人定制" },
    { icon: I.clock, value: 0, label: "待处理" },
  ];
  return (
    <div className="stats">
      {stats.map((s, i) => (
        <div className="stat" key={i}>
          <div className="stat-icon">{s.icon}</div>
          <div className="stat-value">{s.value}</div>
          <div className="stat-label">{s.label}</div>
        </div>
      ))}
    </div>
  );
}

/* ---------------- filters + view toggle ---------------- */
function Toolbar({ filter, setFilter, view, setView, counts }) {
  const allItems = [
    { key: "全部", count: counts.all },
    { key: "已上岗", count: counts.live },
    { key: "实习中", count: counts.intern },
    { key: "私人定制", count: counts.custom },
    { key: "已退役", count: counts.pending },
  ];
  // 在列表 · 会话模式下，只展示「全部」页签：在说明只有已上岗的员工才能会话，
  // 透过左侧列表头部的「已上岗」徽标体现。
  const items = view === "list"
    ? allItems.filter((i) => i.key === "全部")
    : allItems;
  return (
    <div className="toolbar">
      <div className="filters">
        {items.map((f) => (
          <button
            key={f.key}
            className={"filter " + (filter === f.key ? "on" : "")}
            onClick={() => setFilter(f.key)}
          >
            <span>{f.key}</span>
            <span className="filter-count">{f.count}</span>
          </button>
        ))}
      </div>
      <div className="view-toggle">
        <button className={view === "card" ? "on" : ""} onClick={() => setView("card")}>
          {I.grid}卡片
        </button>
        <button className={view === "list" ? "on" : ""} onClick={() => setView("list")}>
          {I.list}列表 · 会话
        </button>
      </div>
    </div>
  );
}

/* ---------------- card view ---------------- */
const statusMap = {
  live: { label: "已上岗", cls: "status-live" },
  evaluating: { label: "AI 评估中", cls: "status-eval" },
  humanEval: { label: "人工评估中", cls: "status-eval" },
  pending: { label: "已退役", cls: "status-pending" },
};
const tagClass = { HR: "tag-hr", 情报: "tag-info", 写作: "tag-writing" };

function ImPill({ name, state }) {
  const labelMap = { connected: "已连接", unset: "未配置" };
  const initialMap = { feishu: "飞", dingtalk: "钉", wecom: "企" };
  const nameMap = { feishu: "飞书", dingtalk: "钉", wecom: "企微" };
  return (
    <span className={"im-pill " + (state === "connected" ? "connected" : "")}>
      <span style={{ width: 14, textAlign: "center" }}>{initialMap[name]}</span>
      {nameMap[name]} · {labelMap[state]}
    </span>
  );
}

function ImStrip({ im }) {
  const [open, setOpen] = useState(false);
  const order = ["feishu", "dingtalk", "wecom"];
  const nameMap = { feishu: "飞书", dingtalk: "钉钉", wecom: "企微" };
  const initialMap = { feishu: "飞", dingtalk: "钉", wecom: "企" };
  const connected = order.filter((k) => im[k] === "connected").length;
  return (
    <div className={"im-strip " + (open ? "open" : "")}>
      <button
        type="button"
        className="im-strip-head"
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        aria-expanded={open}
      >
        <span className="im-strip-label">IM 接入</span>
        <span className="im-dots">
          {order.map((k) => (
            <span
              key={k}
              className={"im-dot " + (im[k] === "connected" ? "on" : "off")}
              title={`${nameMap[k]} · ${im[k] === "connected" ? "已连接" : "未配置"}`}
            />
          ))}
        </span>
        <span className="im-strip-summary">{connected}/3 已接入</span>
        <svg className="im-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </button>
      {open && (
        <ul className="im-strip-list">
          {order.map((k) => {
            const on = im[k] === "connected";
            return (
              <li key={k} className={on ? "on" : "off"}>
                <span className="im-app">
                  <span className="im-app-mark">{initialMap[k]}</span>
                  {nameMap[k]}
                </span>
                <span className="im-state">
                  <span className={"im-dot " + (on ? "on" : "off")}/>
                  {on ? "已连接" : "未配置"}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function Card({ emp, onReEnable, onRemove, onOpen, onStartChat, onGoIM }) {
  const s = statusMap[emp.status];
  const isLive   = emp.status === "live";
  const isAiEval = emp.status === "evaluating";
  const isHumanEval = emp.status === "humanEval";
  const isRetired = emp.status === "pending";
  const stop = (fn) => (e) => { e.stopPropagation(); fn && fn(); };
  return (
    <div className="card" onClick={() => onOpen && onOpen(emp.id)} role="button" tabIndex={0}>
      <div className="card-head">
        <div className={"avatar-chip av-" + emp.avatarTone}>{emp.initial}</div>
        <div className="card-head-text">
          <div className="card-name">
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{emp.name}</span>
            <span className={"status-dot " + s.cls}>
              <span className="dot"/>{s.label}
            </span>
          </div>
          <div className="card-sub">
            <span className={"sub-pill " + (emp.role === "部门分身" ? "role-mine" : "role-custom")}>{emp.role}</span>
            <span>· 最近更新 {emp.lastUpdate}</span>
          </div>
        </div>
      </div>

      <p className="card-desc">{emp.desc}</p>

      {isAiEval && (
        <div className="progress">
          <div className="progress-head">
            <span>AI 评估进度</span>
            <span>{emp.progress}%</span>
          </div>
          <div className="progress-track">
            <div className="progress-bar" style={{ width: emp.progress + "%" }}/>
          </div>
        </div>
      )}

      {!isAiEval && !isHumanEval && <ImStrip im={emp.im}/>}

      <div className="card-foot">
        <div className="last-op">
          <div className="last-op-label">上次操作</div>
          <div className="last-op-time">{emp.lastUpdate}</div>
        </div>
        <div className="foot-actions">
          {isLive && (
            <>
              <button className="btn-ghost" onClick={(e) => { e.stopPropagation(); onGoIM && onGoIM(emp.id); }}>去 IM</button>
              <button className="btn-primary" onClick={(e) => { e.stopPropagation(); onStartChat && onStartChat(emp.id); }}>开始对话</button>
            </>
          )}
          {isAiEval && (
            <button className="btn-primary" onClick={(e) => e.stopPropagation()}>进入 AI 评估</button>
          )}
          {isHumanEval && (
            <button className="btn-primary" onClick={(e) => e.stopPropagation()}>进入人工评估</button>
          )}
          {isRetired && (
            <>
              <button className="btn-ghost danger" onClick={stop(() => onRemove && onRemove(emp.id))}>删除卡片</button>
              <button className="btn-primary" onClick={stop(() => onReEnable && onReEnable(emp.id))}>重新启用</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function CardView({ list, onReEnable, onRemove, onOpen, onStartChat, onGoIM }) {
  return (
    <div className="grid">
      {list.map((e) => <Card key={e.id} emp={e} onReEnable={onReEnable} onRemove={onRemove} onOpen={onOpen} onStartChat={onStartChat} onGoIM={onGoIM}/>)}
    </div>
  );
}

/* ---------------- list + chat view ---------------- */
function FileChip({ kind }) {
  const tone = window.__FILE_TONE__ || { file: { tone: "neutral", label: "FILE" }};
  const t = tone[kind] || tone.file;
  return <span className={"file-chip tone-" + t.tone}>{t.label}</span>;
}

function ListChatView({ list, requestedActiveId, onRequestConsumed, onGoIM }) {
  // Only employees who are 已上岗 can be conversed with.
  const chatable = useMemo(() => list.filter((e) => e.status === "live"), [list]);
  const [activeId, setActiveId] = useState(requestedActiveId || chatable[0]?.id);
  const [query, setQuery] = useState("");
  const [convos, setConvos] = useState(initialConvos);
  const [draft, setDraft] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [showOutput, setShowOutput] = useState(false);
  const [outputs, setOutputs] = useState(() => window.__CHAT_OUTPUTS__ || {});
  const [outputQuery, setOutputQuery] = useState("");
  const streamRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  // When a card or detail page requests opening this employee, pick it up
  useEffect(() => {
    if (requestedActiveId) {
      setActiveId(requestedActiveId);
      onRequestConsumed && onRequestConsumed();
    }
    // eslint-disable-next-line
  }, [requestedActiveId]);

  // Ensure active employee is still in chatable list
  useEffect(() => {
    if (!chatable.find((e) => e.id === activeId) && chatable[0]) setActiveId(chatable[0].id);
  }, [chatable, activeId]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return chatable;
    return chatable.filter((e) => e.name.toLowerCase().includes(q) || (e.tag||"").toLowerCase().includes(q));
  }, [chatable, query]);

  const active = chatable.find((e) => e.id === activeId) || chatable[0];
  const thread = convos[activeId] || [];
  const activeOutputs = outputs[activeId] || [];
  const visibleOutputs = useMemo(() => {
    const q = outputQuery.trim().toLowerCase();
    if (!q) return activeOutputs;
    return activeOutputs.filter((f) => f.name.toLowerCase().includes(q));
  }, [activeOutputs, outputQuery]);

  // Auto-scroll to bottom when switching threads or sending
  useEffect(() => {
    const el = streamRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [activeId, thread.length]);

  // Auto-grow textarea
  useEffect(() => {
    const t = textareaRef.current;
    if (!t) return;
    t.style.height = "auto";
    t.style.height = Math.min(t.scrollHeight, 120) + "px";
  }, [draft]);

  const lastMsgPreview = (id) => {
    const msgs = convos[id] || [];
    for (let i = msgs.length - 1; i >= 0; i--) {
      if (msgs[i].role !== "system") {
        const prefix = msgs[i].role === "user" ? "你：" : "";
        return prefix + msgs[i].text.replace(/\n/g, " ");
      }
    }
    return "暂无消息";
  };
  const lastMsgTime = (id) => {
    const msgs = convos[id] || [];
    return msgs[msgs.length - 1]?.time || "";
  };

  const handleUploadClick = () => fileInputRef.current?.click();
  const handleFiles = (e) => {
    const files = Array.from(e.target.files || []);
    const next = files.map((f, i) => ({
      id: "u" + Date.now() + "-" + i,
      name: f.name,
      size: (window.__formatSize__ || ((n) => n + " B"))(f.size),
      kind: (window.__inferKind__ || (() => "file"))(f.name),
    }));
    setAttachments((prev) => [...prev, ...next]);
    e.target.value = "";
  };
  const removeAttachment = (id) =>
    setAttachments((prev) => prev.filter((a) => a.id !== id));

  const send = () => {
    const text = draft.trim();
    if ((!text && attachments.length === 0) || !active) return;
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    const userMsg = {
      role: "user",
      text: text || "(已上传附件)",
      time: `今天 ${hh}:${mm}`,
      files: attachments,
    };
    setConvos((prev) => ({ ...prev, [active.id]: [...(prev[active.id] || []), userMsg] }));
    setDraft("");
    setAttachments([]);

    setTimeout(() => {
      const replies = {
        "zhaopin-li": "收到。我现在去拉，预计 1 分钟内反馈。",
        "zhaopin-offer": "已记录。等本轮 AI 评估完成后会重新跑算。",
        "xingye-xiaoyan": "好的，我加入本周观察池。",
        "wenan-xiaoshu": "明白，我重写一版你看看。",
      };
      const r = replies[active.id] || "好的，我马上处理。";
      const t2 = new Date();
      const h2 = String(t2.getHours()).padStart(2, "0");
      const m2 = String(t2.getMinutes()).padStart(2, "0");
      setConvos((prev) => ({
        ...prev,
        [active.id]: [...(prev[active.id] || []), { role: "agent", text: r, time: `今天 ${h2}:${m2}` }],
      }));

      // 25% chance to produce a file
      if (Math.random() < 0.25) {
        const newFile = {
          id: "f-gen-" + Date.now(),
          name: `自动整理_${h2}${m2}.md`,
          kind: "md",
          size: "8 KB",
          time: "刚刚",
          from: "针对你的最近一条消息",
          fresh: true,
        };
        setOutputs((prev) => ({ ...prev, [active.id]: [newFile, ...(prev[active.id] || [])] }));
      }
    }, 850);
  };

  const onKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const folderIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"/>
      <circle cx="17" cy="14" r="2.2" fill="currentColor" opacity="0.18"/>
    </svg>
  );

  return (
    <div className={"split " + (showOutput ? "with-output" : "")}>
      {/* LEFT: employee list */}
      <aside className="list-pane">
        <div className="list-head">
          <div className="list-title">
            <h3>我的数字员工</h3>
            <span className="list-tag-live">
              <span className="dot"/>只含已上岗
            </span>
          </div>
          <div className="search">
            {I.search}
            <input
              type="text"
              placeholder="搜索数字员工 / 标签"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="list-scroll">
          {visible.map((e) => (
            <div
              key={e.id}
              className={"list-item " + (e.id === active?.id ? "active" : "")}
              onClick={() => setActiveId(e.id)}
            >
              <div className={"avatar-chip av-" + e.avatarTone}>{e.initial}</div>
              <div className="li-body">
                <div className="li-row1">
                  <div className="li-name">{e.name}</div>
                  <div className="li-time">{lastMsgTime(e.id)}</div>
                </div>
                <div className="li-row2">
                  <div className="li-preview">{lastMsgPreview(e.id)}</div>
                  {e.role === "私人定制" && (
                    <span className="li-badge custom">私人定制</span>
                  )}
                </div>
              </div>
            </div>
          ))}
          {visible.length === 0 && (
            <div style={{ textAlign: "center", color: "var(--ink-4)", fontSize: 13, padding: 40 }}>
              没有匹配的数字员工
            </div>
          )}
        </div>
      </aside>

      {/* MIDDLE: chat pane */}
      <section className="chat-pane">
        {active && (
          <>
            <header className="chat-head">
              <div className={"avatar-chip av-" + active.avatarTone}>{active.initial}</div>
              <div className="chat-head-meta">
                <div className="chat-head-name">
                  {active.name}
                </div>
                <div className="chat-head-sub">
                  <span>{active.role}</span>
                  {active.tag && <span>· {active.tag}</span>}
                  <span>· 最近更新 {active.lastUpdate}</span>
                </div>
              </div>
              <div className="chat-head-actions">
                <button
                  className={"output-toggle " + (showOutput ? "on" : "")}
                  title={showOutput ? "收起会话产出面板" : "展开会话产出面板"}
                  onClick={() => setShowOutput((v) => !v)}
                >
                  {folderIcon}
                  <span>产出</span>
                  {activeOutputs.length > 0 && (
                    <span className="output-toggle-count">{activeOutputs.length}</span>
                  )}
                  <svg
                    className={"output-toggle-chev " + (showOutput ? "open" : "")}
                    viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
                  >
                    <path d={showOutput ? "M9 6l6 6-6 6" : "M15 6l-6 6 6 6"}/>
                  </svg>
                </button>
              </div>
            </header>

            <div className="chat-stream" ref={streamRef}>
              {thread.map((m, i) => {
                if (m.role === "system") {
                  return (
                    <div key={i} className="msg system">
                      <div className="msg-bubble">{m.text}</div>
                    </div>
                  );
                }
                return (
                  <div key={i} className={"msg " + m.role}>
                    <div className={"avatar-chip " + (m.role === "agent" ? "av-" + active.avatarTone : "")}>
                      {m.role === "agent" ? active.initial : "李"}
                    </div>
                    <div className="msg-col">
                      {m.files && m.files.length > 0 && (
                        <div className="msg-files">
                          {m.files.map((f) => (
                            <div className="msg-file" key={f.id}>
                              <FileChip kind={f.kind}/>
                              <div className="msg-file-meta">
                                <div className="msg-file-name">{f.name}</div>
                                <div className="msg-file-sub">{f.size}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      {m.text && <div className="msg-bubble">{m.text}</div>}
                      <div className="msg-time">{m.time}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="composer">
              {attachments.length > 0 && (
                <div className="attach-row">
                  {attachments.map((a) => (
                    <div className="attach-chip" key={a.id}>
                      <FileChip kind={a.kind}/>
                      <span className="attach-name">{a.name}</span>
                      <span className="attach-size">{a.size}</span>
                      <button className="attach-remove" onClick={() => removeAttachment(a.id)}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="composer-box">
                <textarea
                  ref={textareaRef}
                  rows="1"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={onKey}
                  placeholder={`和 ${active.name} 说点什么… (Enter 发送，Shift+Enter 换行)`}
                />
                <div className="composer-foot">
                  <div className="composer-tools">
                    <button className="tool-btn" title="上传附件" onClick={handleUploadClick}>
                      {I.paperclip}
                    </button>
                    <input
                      type="file"
                      multiple
                      ref={fileInputRef}
                      style={{ display: "none" }}
                      onChange={handleFiles}
                    />
                    <span className="composer-hint">支持上传 PDF / Word / Excel / 图片 等，单次 ≤ 20MB</span>
                  </div>
                  <button className="send-btn" disabled={!draft.trim() && attachments.length === 0} onClick={send}>
                    发送 {I.send}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </section>

      {/* RIGHT: output panel (toggleable) */}
      {showOutput && active && (
        <aside className="output-panel">
          <header className="output-head">
            <div className="output-titles">
              <h3>本会话产出</h3>
              <span className="output-count">{activeOutputs.length} 个文件</span>
            </div>
            <div className="output-search">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
              <input
                type="text"
                placeholder="搜索产出文件"
                value={outputQuery}
                onChange={(e) => setOutputQuery(e.target.value)}
              />
            </div>
          </header>
          <div className="output-list">
            {visibleOutputs.length === 0 ? (
              <div className="output-empty">
                <svg viewBox="0 0 64 64" fill="none">
                  <rect x="14" y="14" width="36" height="44" rx="4" stroke="currentColor" strokeWidth="1.6"/>
                  <path d="M20 26h24M20 34h24M20 42h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                  <circle cx="48" cy="14" r="6" fill="currentColor" opacity="0.15"/>
                </svg>
                <div className="output-empty-title">{outputQuery ? "没有匹配的文件" : "暂未产出文件"}</div>
                <div className="output-empty-sub">
                  {outputQuery ? "换个关键词试试" : "对话过程中由数字员工生成的文件会出现在这里。"}
                </div>
              </div>
            ) : (
              visibleOutputs.map((f) => (
                <div className={"output-card " + (f.fresh ? "fresh" : "")} key={f.id}>
                  <FileChip kind={f.kind}/>
                  <div className="output-card-body">
                    <div className="output-card-name">{f.name}</div>
                    <div className="output-card-meta">
                      <span>{f.size}</span><span>·</span><span>{f.time}</span>
                    </div>
                    {f.from && <div className="output-card-from">来自：{f.from}</div>}
                  </div>
                  <button className="output-card-action" title="下载">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4v12M6 12l6 6 6-6"/><path d="M4 21h16"/></svg>
                  </button>
                </div>
              ))
            )}
          </div>
        </aside>
      )}
    </div>
  );
}

/* ---------------- root ---------------- */
function App() {
  const [filter, setFilter] = useState("全部");
  const [view, setView] = useState("card");
  const [empList, setEmpList] = useState(employees);
  const [detailId, setDetailId] = useState(null);
  const [imCfgId, setImCfgId] = useState(null);
  const [chatEmpId, setChatEmpId] = useState(null);
  const [goImEmpId, setGoImEmpId] = useState(null);
  const [modalState, setModalState] = useState({ open: false, empId: null, platform: null });

  const openConfigure = (empId, platform) => setModalState({ open: true, empId, platform });
  const closeModal = () => setModalState((s) => ({ ...s, open: false }));
  const markConnected = (empId, platform) =>
    setEmpList((L) => L.map((e) =>
      e.id === empId ? { ...e, im: { ...e.im, [platform]: "connected" } } : e
    ));

  // 从卡片或详情页点「开始对话」时：切到列表 · 会话视图 + 选中该员工
  const startChat = (empId) => {
    setDetailId(null);
    setView("list");
    setChatEmpId(empId);
  };

  const reEnable = (id) =>
    setEmpList((L) => L.map((e) => (e.id === id ? { ...e, status: "live", lastUpdate: "刚刚重新启用" } : e)));
  const remove = (id) =>
    setEmpList((L) => L.filter((e) => e.id !== id));

  const list = useMemo(() => {
    // 在列表模式下只能选到可对话的员工，面包调整为已上岗。
    const pool = view === "list" ? empList.filter((e) => e.status === "live") : empList;
    if (filter === "全部") return pool;
    if (filter === "已上岗") return pool.filter((e) => e.status === "live");
    if (filter === "实习中") return pool.filter((e) => e.status === "evaluating" || e.status === "humanEval");
    if (filter === "私人定制") return pool.filter((e) => e.role === "私人定制");
    if (filter === "已退役") return pool.filter((e) => e.status === "pending");
    return pool;
  }, [filter, view, empList]);

  const counts = useMemo(() => {
    const pool = view === "list" ? empList.filter((e) => e.status === "live") : empList;
    return {
      all:        pool.length,
      live:       pool.filter((e) => e.status === "live").length,
      intern:     pool.filter((e) => e.status === "evaluating" || e.status === "humanEval").length,
      custom:     pool.filter((e) => e.role === "私人定制").length,
      pending:    pool.filter((e) => e.status === "pending").length,
    };
  }, [view, empList]);

  // 切换视图后，当前页签在新视图下计数为 0 则回退到「全部」
  useEffect(() => {
    if (view === "list") {
      const ok = (
        (filter === "全部" && counts.all > 0) ||
        (filter === "已上岗" && counts.live > 0) ||
        (filter === "实习中" && counts.intern > 0) ||
        (filter === "私人定制" && counts.custom > 0) ||
        (filter === "已退役" && counts.pending > 0)
      );
      if (!ok) setFilter("全部");
    }
  }, [view, filter, counts]);

  // 会话已并入 列表 · 会话 视图（chat.jsx 仅作为 CHAT_OUTPUTS 等工具的承载）

  // IM 配置页
  if (imCfgId) {
    const emp = empList.find((e) => e.id === imCfgId);
    if (emp) {
      return (
        <>
          <TopNav/>
          <main className="page detail-shell">
            <IMConfigPage emp={emp} onBack={() => setImCfgId(null)}/>
          </main>
        </>
      );
    }
  }

  // 详情页：点击卡片后进入
  if (detailId) {
    const emp = empList.find((e) => e.id === detailId);
    if (emp) {
      return (
        <>
          <TopNav/>
          <main className="page detail-shell">
            <DetailPage
              emp={emp}
              onBack={() => setDetailId(null)}
              onReEnable={reEnable}
              onRemove={remove}
              onOpenImConfig={() => setImCfgId(emp.id)}
              onStartChat={() => startChat(emp.id)}
              onGoIM={() => setGoImEmpId(emp.id)}
              onConfigurePlatform={(platform) => {
                if (emp.im[platform] === "connected") return; // 已连接 → 看作跳转去 IM，不开弹窗
                openConfigure(emp.id, platform);
              }}
              statusMap={statusMap}
            />
          </main>
          <IMConfigModal
            open={modalState.open}
            emp={empList.find((e) => e.id === modalState.empId)}
            platform={modalState.platform}
            onClose={closeModal}
            onConnected={markConnected}
          />
        </>
      );
    }
  }

  return (
    <>
      <TopNav/>
      <main className="page">
        <div className="page-head">
          <div>
            <h1 className="title">我的数字员工</h1>
          </div>
          <button className="copy-btn">新增员工</button>
        </div>

        <Toolbar filter={filter} setFilter={setFilter} view={view} setView={setView} counts={counts}/>

        {view === "card"
          ? <CardView list={list} onReEnable={reEnable} onRemove={remove} onOpen={setDetailId} onStartChat={startChat} onGoIM={setGoImEmpId}/>
          : <ListChatView list={list} requestedActiveId={chatEmpId} onRequestConsumed={() => setChatEmpId(null)} onGoIM={setGoImEmpId}/>}
      </main>
      <GoIMModal
        open={!!goImEmpId}
        emp={empList.find((e) => e.id === goImEmpId)}
        onClose={() => setGoImEmpId(null)}
      />
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
