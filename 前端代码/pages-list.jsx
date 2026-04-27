/* global window, React */
const { useState: _useState1, useMemo } = React;

// ===== Templates Pool =====
function TemplatesPage({ go }) {
  const [q, setQ] = _useState1("");
  const list = window.TEMPLATES.filter(t => !q || t.name.includes(q) || t.summary.includes(q));
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">收录 <em>{window.TEMPLATES.length}</em> 个数字员工模板，雇佣开箱即用</h1>
          <p className="page-sub">从模板池开始一次完整的部门版雇佣流程。模板只能浏览和选择，不在雇佣端生产。</p>
        </div>
      </div>

      <div className="searchbar">
        <window.Icon.search />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="搜索模板名称、场景、能力关键词" />
        <button className="btn btn-primary">探索全部模板</button>
      </div>

      <div className="spacer-24"/>

      <div className="row between" style={{marginBottom:14}}>
        <div className="subtabs">
          <button className="subtab active">全部</button>
          <button className="subtab">全局通用</button>
          <button className="subtab">企业专属</button>
          <button className="subtab">研发部高频</button>
        </div>
        <span className="muted" style={{fontSize:12}}>共 {list.length} 个模板</span>
      </div>

      <div className="grid grid-3">
        {list.map(t => (
          <div key={t.id} className="card emp-card" onClick={() => go(`template/${t.id}`)}>
            <div className="emp-head">
              <window.Avatar initial={t.initial} tint={t.tint} size="md" />
              <div style={{flex:1, minWidth:0}}>
                <div className="row between">
                  <h4 className="emp-name">{t.name}</h4>
                  <span className={`pill ${t.source === "全局通用" ? "blue" : "purple"}`}>{t.source}</span>
                </div>
                <div className="emp-meta">适用：{t.sectors.join(" / ")}</div>
              </div>
            </div>
            <p className="emp-desc">{t.summary}</p>
            <div className="emp-tags">
              {t.tags.map((tag, i) => (<span key={i} className={`pill ${i % 2 ? "orange" : "blue"}`}>{tag}</span>))}
            </div>
            <div className="emp-foot">
              <div className="emp-stats">
                <span><window.Icon.users className="icn"/> {t.used} 部门已用</span>
                <span><window.Icon.download className="icn"/> {t.cloned} 复制</span>
              </div>
              <button className="btn-link">查看详情 →</button>
            </div>
          </div>
        ))}
      </div>

      <div className="spacer-24"/>
      <div className="muted" style={{textAlign:"center", fontSize:13}}>📝 模板池只展示企业可雇佣的数字员工模板，新增模板由构建端统一生产。</div>
    </div>
  );
}

// ===== Department Employees =====
function DeptPage({ role, go }) {
  const isManager = role === "manager";
  const tabs = isManager
    ? [
        { id: "live", label: "已上岗", filter: e => e.status === "live" },
        { id: "intern", label: "待实习", filter: e => e.status === "interning_ai" || e.status === "interning_human" },
        { id: "hired", label: "已雇佣", filter: e => e.status === "hired" || e.status === "failed" }
      ]
    : [{ id: "live", label: "已上岗", filter: e => e.status === "live" }];

  const [tab, setTab] = _useState1("live");
  const [subtab, setSubtab] = _useState1("ai");
  const cur = tabs.find(t => t.id === tab) || tabs[0];

  let list = window.DEPT_EMPLOYEES.filter(cur.filter);
  if (tab === "intern" && isManager) {
    list = list.filter(e => subtab === "ai" ? e.status === "interning_ai" : e.status === "interning_human");
  }

  const counts = {
    live: window.DEPT_EMPLOYEES.filter(e => e.status === "live").length,
    intern: window.DEPT_EMPLOYEES.filter(e => e.status === "interning_ai" || e.status === "interning_human").length,
    hired: window.DEPT_EMPLOYEES.filter(e => e.status === "hired" || e.status === "failed").length
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">部门数字员工 · <em>研发部</em></h1>
          <p className="page-sub">
            {isManager
              ? "查看并管理本部门的数字员工。已雇佣 / 待实习 / 已上岗 由顶部 tab 切换。"
              : "本部门已上岗的数字员工，复制一份给自己即可在飞书中使用。"}
          </p>
        </div>
        {isManager && (
          <button className="btn btn-primary" onClick={() => go("templates")}>
            <window.Icon.plus className="icn"/> 从模板雇佣
          </button>
        )}
      </div>

      <div className="tabs">
        {tabs.map(t => (
          <a key={t.id} className={`tab ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>
            {t.label} <span className="tab-count tnum">{counts[t.id]}</span>
          </a>
        ))}
      </div>

      {isManager && tab === "intern" && (
        <div className="subtabs">
          <button className={`subtab ${subtab === "ai" ? "active" : ""}`} onClick={() => setSubtab("ai")}>AI 评估</button>
          <button className={`subtab ${subtab === "human" ? "active" : ""}`} onClick={() => setSubtab("human")}>人工评估</button>
        </div>
      )}

      {list.length === 0 ? (
        <div className="empty">
          <div className="ic">🌱</div>
          <h4>当前没有该状态的数字员工</h4>
          <p>{isManager ? "去模板池开始一次新雇佣，或切换到其他状态查看。" : "等部门长完成上岗，这里就会出现可复制的数字员工。"}</p>
        </div>
      ) : (
        <div className="grid grid-3">
          {list.map(e => (
            <window.EmployeeCard key={e.id} emp={e} onClick={() => go(`employee/${e.id}`)} />
          ))}
        </div>
      )}
    </div>
  );
}

// ===== My Employees =====
function MyPage({ role, go }) {
  const [filter, setFilter] = _useState1("all");
  const list = window.MY_EMPLOYEES.filter(e => {
    if (filter === "all") return true;
    if (filter === "live") return e.status === "live";
    if (filter === "evaluating") return e.status === "interning_ai" || e.status === "interning_human";
    if (filter === "branch") return e.type === "private_branch";
    return true;
  });

  const totals = {
    all: window.MY_EMPLOYEES.length,
    live: window.MY_EMPLOYEES.filter(e => e.status === "live").length,
    evaluating: window.MY_EMPLOYEES.filter(e => e.status === "interning_ai" || e.status === "interning_human").length,
    branch: window.MY_EMPLOYEES.filter(e => e.type === "private_branch").length
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">我的数字员工</h1>
          <p className="page-sub">这里只有你本人拥有的「我的分身」与「私人定制」，他人不可见。</p>
        </div>
        <button className="btn btn-ghost" onClick={() => go("dept")}>
          去部门数字员工 复制一个 →
        </button>
      </div>

      <div className="grid" style={{gridTemplateColumns:"repeat(4, 1fr)", marginBottom:24}}>
        <window.StatStrip items={[
          { icon: <window.Icon.users />, value: <span className="tnum">{totals.all}</span>, label: "实例总数" },
          { icon: <window.Icon.bot />, value: <span className="tnum">{totals.live}</span>, label: "已上岗" },
          { icon: <window.Icon.spark />, value: <span className="tnum">{totals.evaluating}</span>, label: "评估中" },
          { icon: <window.Icon.shield />, value: <span className="tnum">{totals.branch}</span>, label: "私人定制" },
          { icon: <window.Icon.clock />, value: <span className="tnum">0</span>, label: "异常" }
        ]} />
      </div>

      <div className="subtabs">
        <button className={`subtab ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>全部</button>
        <button className={`subtab ${filter === "live" ? "active" : ""}`} onClick={() => setFilter("live")}>已上岗</button>
        <button className={`subtab ${filter === "evaluating" ? "active" : ""}`} onClick={() => setFilter("evaluating")}>评估中</button>
        <button className={`subtab ${filter === "branch" ? "active" : ""}`} onClick={() => setFilter("branch")}>私人定制</button>
      </div>

      <div className="grid grid-3">
        {list.map(e => (
          <window.EmployeeCard key={e.id} emp={e} onClick={() => go(`employee/${e.id}`)} />
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { TemplatesPage, DeptPage, MyPage });
