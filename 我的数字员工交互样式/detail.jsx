/* global React */
/* Employee detail page — opened by clicking a card. */
const { useState: useDetailState } = React;

// Per-employee detail enrichment. Falls back to sensible defaults.
const DETAIL_DATA = {
  "zhaopin-li": {
    dept: "研发部",
    owner: "李部门长",
    version: "v1.0",
    rounds: 42,
    lastError: 0,
    source: [
      { kind: "模板", label: "HR 助手" },
      { kind: "部门员工", label: "招聘小慧" },
      { kind: "部门分身", label: "招聘小慧 · 李工" },
    ],
    can: [
      { ok: true,  text: "根据岗位要求生成 JD 草稿" },
      { ok: true,  text: "解析简历并按招聘标准排序候选人" },
      { ok: true,  text: "整理面试录音为结构化纪要" },
      { ok: true,  text: "回答员工常见的福利、考勤、入离调转问题" },
      { ok: false, text: "不直接对外发送 offer 与合同" },
      { ok: false, text: "不替代调薪或法律意见" },
    ],
    note: "已上岗实例可以直接进入站内对话，个人资产还可以按需配置 IM 并从平台拉起。",
  },
  "shichang-xiaotu": {
    dept: "研发部",
    owner: "李部门长",
    version: "v0.4 (评估)",
    rounds: 6,
    lastError: 0,
    source: [
      { kind: "模板", label: "市场动态助手" },
      { kind: "部门员工", label: "市场小图" },
      { kind: "部门分身", label: "市场小图 · 我的版" },
    ],
    can: [
      { ok: true,  text: "聚合每周市场动态并生成摘要" },
      { ok: true,  text: "按品类筛选竞品事件" },
      { ok: false, text: "未通过评估前不直接对外推送" },
    ],
    note: "人工评估中：输出仅你可见；通过评估后将自动上岗。",
  },
  "zhaopin-offer": {
    dept: "研发部",
    owner: "李部门长",
    version: "v0.7 (评估)",
    rounds: 8,
    lastError: 0,
    source: [
      { kind: "模板", label: "HR 助手" },
      { kind: "部门员工", label: "招聘小慧" },
      { kind: "部门分身", label: "招聘小慧 · 李工" },
      { kind: "私人定制", label: "招聘小慧 · 我的 Offer 版" },
    ],
    can: [
      { ok: true,  text: "测算 offer 现金 / 期权 / 签字费方案" },
      { ok: true,  text: "生成谈判脚本草稿" },
      { ok: false, text: "评估期内禁止直接对候选人发送" },
    ],
    note: "AI 评估中：仅你可见，进度达 100% 后会请求人工评估。",
  },
  "xingye-xiaoyan": {
    dept: "研发部",
    owner: "李部门长",
    version: "v1.2",
    rounds: 19,
    lastError: 1,
    source: [
      { kind: "模板", label: "行业研究助手" },
      { kind: "部门员工", label: "行业小研" },
      { kind: "部门分身", label: "行业小研 · 李工" },
    ],
    can: [
      { ok: true,  text: "AI Infra 赛道周报推送" },
      { ok: true,  text: "公开招投标监控" },
      { ok: true,  text: "公司公开材料梳理" },
      { ok: false, text: "不引用未授权的付费数据库" },
    ],
    note: "通过企业微信推送，订阅项可在 IM 接入区配置。",
  },
  "zhaopin-xiaozhao": {
    dept: "研发部",
    owner: "李部门长",
    version: "v1.0",
    rounds: 14,
    lastError: 0,
    source: [
      { kind: "模板", label: "HR 助手" },
      { kind: "部门员工", label: "招聘小慧" },
      { kind: "部门分身", label: "招聘小慧 · 李工" },
      { kind: "私人定制", label: "招聘小慧 · 校招专版" },
    ],
    can: [
      { ok: true,  text: "校招简历筛选与排序" },
      { ok: true,  text: "组织面试官分配与时间表" },
      { ok: true,  text: "校招专属面试题分发" },
      { ok: false, text: "不直接代发 offer" },
    ],
    note: "私人定制版本：基于部门分身定制了校招场景的题库与排序权重。",
  },
  "wenan-xiaoshu": {
    dept: "研发部",
    owner: "李部门长",
    version: "v0.9",
    rounds: 5,
    lastError: 2,
    source: [
      { kind: "模板", label: "对外写作助手" },
      { kind: "部门员工", label: "文案小书" },
      { kind: "部门分身", label: "文案小书 · 李工" },
    ],
    can: [
      { ok: true,  text: "把会议纪要整理成对外文稿" },
      { ok: true,  text: "客户邮件 / 内部通告改写" },
      { ok: false, text: "近期错误率超过阈值，已转入已退役" },
    ],
    note: "已退役：会话功能已关闭。重新启用后将进入 AI 评估，再次上岗。",
  },
};

const IM_PROVIDERS = [
  { key: "feishu",   name: "飞书", mark: "飞", method: "WebSocket 长连接", lastSync: "今天 14:08" },
  { key: "dingtalk", name: "钉钉", mark: "钉", method: "URL 回调",          lastSync: "昨天 18:22" },
  { key: "wecom",    name: "企微", mark: "企", method: "尚未完成接入",       lastSync: null },
];

function DetailIcon({ name }) {
  const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" };
  switch (name) {
    case "back":
      return <svg viewBox="0 0 24 24" {...stroke}><path d="M15 18l-6-6 6-6"/></svg>;
    case "arrow-right":
      return <svg viewBox="0 0 24 24" {...stroke}><path d="M5 12h14M13 5l7 7-7 7"/></svg>;
    case "check":
      return <svg viewBox="0 0 24 24" {...stroke}><path d="M5 12l4 4 10-10"/></svg>;
    case "x":
      return <svg viewBox="0 0 24 24" {...stroke}><path d="M6 6l12 12M18 6L6 18"/></svg>;
    case "users":
      return <svg viewBox="0 0 24 24" {...stroke}>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
      </svg>;
    case "clock":
      return <svg viewBox="0 0 24 24" {...stroke}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>;
    case "shield":
      return <svg viewBox="0 0 24 24" {...stroke}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
    case "sparkle":
      return <svg viewBox="0 0 24 24" {...stroke}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8"/></svg>;
    case "tag":
      return <svg viewBox="0 0 24 24" {...stroke}><path d="M3 12l9 9 9-9-9-9H3v9z"/><circle cx="7.5" cy="7.5" r="1.5" fill="currentColor" stroke="none"/></svg>;
    case "info":
      return <svg viewBox="0 0 24 24" {...stroke}><circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v5h1"/></svg>;
    default:
      return null;
  }
}

function SourceChain({ source }) {
  return (
    <div className="source-chain">
      {source.map((s, i) => (
        <React.Fragment key={i}>
          <span className={"source-node " + (i === source.length - 1 ? "last" : "")}>
            <span className="source-kind">{s.kind}</span>
            <span className="source-label">{s.label}</span>
          </span>
          {i < source.length - 1 && (
            <span className="source-sep"><DetailIcon name="arrow-right"/></span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

function MoreMenu({ items }) {
  const [open, setOpen] = useDetailState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);
  return (
    <div className="more-menu" ref={ref}>
      <button
        type="button"
        className={"action-ghost more-btn " + (open ? "open" : "")}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span>更多</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
             strokeLinecap="round" strokeLinejoin="round"
             className={"more-chev " + (open ? "open" : "")}>
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </button>
      {open && (
        <div className="more-menu-pop">
          {items.map((it, i) => (
            <button
              key={i}
              type="button"
              className={"more-item " + (it.danger ? "danger" : "")}
              onClick={() => { setOpen(false); it.onClick && it.onClick(); }}
            >
              {it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function DetailActions({ emp, onReEnable, onRemove, onStartChat, onGoIM }) {
  const status = emp.status;
  if (status === "live") {
    return (
      <div className="action-stack">
        <button className="action-primary" onClick={onStartChat}>开始对话</button>
        <button className="action-ghost" onClick={onGoIM}>去 IM</button>
        <MoreMenu items={[
          { label: "私人定制" },
          { label: "退役", danger: true },
        ]}/>
      </div>
    );
  }
  if (status === "evaluating") {
    return (
      <div className="action-stack">
        <button className="action-primary"><span>进入 AI 评估</span><DetailIcon name="arrow-right"/></button>
        <button className="action-ghost">查看进度</button>
        <button className="action-ghost subtle">终止评估</button>
      </div>
    );
  }
  if (status === "humanEval") {
    return (
      <div className="action-stack">
        <button className="action-primary"><span>进入人工评估</span><DetailIcon name="arrow-right"/></button>
        <button className="action-ghost">查看进度</button>
        <button className="action-ghost subtle">终止评估</button>
      </div>
    );
  }
  if (status === "pending") {
    return (
      <div className="action-stack">
        <button className="action-primary" onClick={() => onReEnable && onReEnable(emp.id)}>
          <span>重新启用</span><DetailIcon name="arrow-right"/>
        </button>
        <button className="action-ghost subtle" onClick={() => onRemove && onRemove(emp.id)}>删除卡片</button>
      </div>
    );
  }
  return null;
}

function CapabilitiesIntro({ emp, d }) {
  const [open, setOpen] = useDetailState(false);
  const list = d.can || [];
  const PREVIEW = 3;
  const showAll = open || list.length <= PREVIEW;
  const visible = showAll ? list : list.slice(0, PREVIEW);
  const hidden  = list.length - PREVIEW;

  return (
    <section className="detail-card intro-card">
      <div className="detail-card-head">
        <h3>员工介绍</h3>
        <div className="intro-quickstats">
          <IntroStat icon="sparkle" value={d.rounds} label="累计对话"/>
          <IntroStat icon="clock"   value={emp.lastUpdate} label="上次操作"/>
          <IntroStat icon="shield"  value={d.lastError ?? 0} label="最近错误"/>
          <IntroStat icon="tag"     value={d.version} label="实例版本"/>
        </div>
      </div>

      <ul className={"capability-list " + (showAll ? "" : "clamped")}>
        {visible.map((c, i) => (
          <li key={i} className={c.ok ? "ok" : "no"}>
            <span className="cap-icon"><DetailIcon name={c.ok ? "check" : "x"}/></span>
            <span>{c.text}</span>
          </li>
        ))}
      </ul>

      {list.length > PREVIEW && (
        <button
          type="button"
          className="intro-toggle"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
        >
          <span>{open ? "收起" : `全部展开·还有 ${hidden} 项`}</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
               strokeLinecap="round" strokeLinejoin="round"
               className={"intro-chev " + (open ? "open" : "")}>
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </button>
      )}

      {d.note && (
        <div className="detail-note compact">
          <DetailIcon name="info"/>
          <div>
            <div className="detail-note-title">状态承接说明</div>
            <div className="detail-note-text">{d.note}</div>
          </div>
        </div>
      )}
    </section>
  );
}

function IntroStat({ icon, value, label }) {
  return (
    <div className="intro-stat">
      <div className="intro-stat-icon"><DetailIcon name={icon}/></div>
      <div className="intro-stat-text">
        <div className="intro-stat-value">{value ?? "—"}</div>
        <div className="intro-stat-label">{label}</div>
      </div>
    </div>
  );
}

function DetailPage({ emp, onBack, onReEnable, onRemove, onOpenImConfig, onConfigurePlatform, onStartChat, onGoIM, statusMap }) {
  const d = DETAIL_DATA[emp.id] || {};
  const s = statusMap[emp.status];

  const handleReEnable = (id) => {
    onReEnable && onReEnable(id);
    onBack && onBack(); // 重新启用后回到列表，让用户看到新的状态
  };
  const handleRemove = (id) => {
    onRemove && onRemove(id);
    onBack && onBack();
  };

  return (
    <div className="detail-page">
      <button className="detail-back" onClick={onBack}>
        <DetailIcon name="back"/>
        <span>返回 我的数字员工</span>
      </button>

      {/* ============= header card ============= */}
      <section className="detail-hero">
        <div className="detail-hero-main">
          <div className={"detail-avatar av-" + emp.avatarTone}>{emp.initial}</div>
          <div className="detail-hero-text">
            <div className="detail-title-row">
              <h1 className="detail-name">{emp.name}</h1>
              <span className={"status-dot " + s.cls}><span className="dot"/>{s.label}</span>
              <span className={"sub-pill " + (emp.role === "部门分身" ? "role-mine" : "role-custom")}>
                {emp.role}
              </span>
            </div>
            <div className="detail-meta">
              所属部门 {d.dept || "—"}
              <span className="dot-sep">·</span>
              Owner {d.owner || "—"}
              <span className="dot-sep">·</span>
              最近更新 {emp.lastUpdate}
            </div>
            <p className="detail-desc">{emp.desc}</p>
          </div>
        </div>
        <DetailActions emp={emp} onReEnable={handleReEnable} onRemove={handleRemove} onStartChat={onStartChat} onGoIM={onGoIM}/>
      </section>

      {/* ============= unified intro card ============= */}
      <CapabilitiesIntro emp={emp} d={d}/>

      {/* ============= IM zone — 评估中不展示，与卡片保持一致 ============= */}
      {emp.status !== "evaluating" && emp.status !== "humanEval" && (
        <section className="detail-card im-zone">
          <div className="detail-card-head">
            <h3>IM 接入区</h3>
          </div>
          <div className="im-grid">
            {IM_PROVIDERS.map((p) => {
              const connected = emp.im[p.key] === "connected";
              return (
                <div key={p.key} className={"im-card " + (connected ? "on" : "off")}>
                  <div className="im-card-head">
                    <div className="im-card-mark">{p.mark}</div>
                    <div className="im-card-name">{p.name}</div>
                    <div className="im-card-state">
                      <span className={"li-badge " + (connected ? "live" : "pending")}>
                        {connected ? "已连接" : "未配置"}
                      </span>
                    </div>
                  </div>
                  <div className="im-card-meta">
                    {connected
                      ? <>{p.method}{p.lastSync && <> · 今天 {p.lastSync.replace("今天 ", "")}</>}</>
                      : "尚未完成接入"}
                  </div>
                  <button
                    className="action-ghost small"
                    onClick={() => {
                      if (connected) {
                        window.__launchIM__ && window.__launchIM__(p.key);
                      } else {
                        onConfigurePlatform && onConfigurePlatform(p.key);
                      }
                    }}
                  >
                    {connected ? `去 ${p.name}` : "配置 IM"}
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

function DetailStat({ icon, value, label, big }) {
  return (
    <div className={"detail-stat " + (big ? "big" : "")}>
      <div className="detail-stat-icon"><DetailIcon name={icon}/></div>
      <div className="detail-stat-value">{value ?? "—"}</div>
      <div className="detail-stat-label">{label}</div>
    </div>
  );
}

// Expose to other scripts
window.DetailPage = DetailPage;
