/* global window, React */
const { useState: _useState1 } = React;

function TemplatesPage({ go }) {
  const [query, setQuery] = _useState1("");
  const [source, setSource] = _useState1("all");

  const list = window.TEMPLATES.filter(item => {
    const sourceMatched = source === "all" ? true : item.source === source;
    const queryMatched = !query || item.name.includes(query) || item.summary.includes(query) || item.sectors.join(" ").includes(query);
    return sourceMatched && queryMatched;
  });

  return (
    <div className="page">
      <div className="page-header hero-header">
        <div>
          <span className="eyebrow">部门长入口</span>
          <h1 className="page-title">从模板池出发，完成一条完整的 <em>部门版雇佣</em> 流程</h1>
          <p className="page-sub">这里不生产模板，只负责选择已有模板并进入正式雇佣。页面动作收敛为搜索、查看详情、发起雇佣。</p>
        </div>
      </div>

      <div className="searchbar">
        <window.Icon.search />
        <input value={query} onChange={evt => setQuery(evt.target.value)} placeholder="搜索模板名称、场景、能力关键词" />
        <button className="btn btn-primary">探索全部模板</button>
      </div>

      <div className="spacer-24" />

      <div className="row between" style={{ marginBottom: 14 }}>
        <div className="subtabs">
          <button className={`subtab ${source === "all" ? "active" : ""}`} onClick={() => setSource("all")}>全部</button>
          <button className={`subtab ${source === "全局通用" ? "active" : ""}`} onClick={() => setSource("全局通用")}>全局通用</button>
          <button className={`subtab ${source === "企业专属" ? "active" : ""}`} onClick={() => setSource("企业专属")}>企业专属</button>
        </div>
        <span className="muted" style={{ fontSize: 12 }}>共 {list.length} 个模板</span>
      </div>

      <div className="grid grid-3">
        {list.map(item => (
          <div key={item.id} className="card emp-card" onClick={() => go(`template/${item.id}`)}>
            <div className="emp-head">
              <window.Avatar initial={item.initial} tint={item.tint} size="md" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="row between">
                  <h4 className="emp-name">{item.name}</h4>
                  <span className={`pill ${item.source === "全局通用" ? "blue" : "purple"}`}>{item.source}</span>
                </div>
                <div className="emp-meta">适用：{item.sectors.join(" / ")}</div>
              </div>
            </div>

            <p className="emp-desc">{item.summary}</p>

            <div className="emp-tags">
              {item.tags.map((tag, idx) => <span key={`${item.id}-${tag}`} className={`pill ${idx % 2 ? "orange" : "blue"}`}>{tag}</span>)}
            </div>

            <div className="emp-foot">
              <div className="emp-stats">
                <span><window.Icon.users className="icn" /> {item.used} 部门已用</span>
                <span><window.Icon.download className="icn" /> {item.cloned} 复制</span>
              </div>
              <button className="btn-link" onClick={evt => { evt.stopPropagation(); go(`template/${item.id}`); }}>查看详情 →</button>
            </div>
          </div>
        ))}
      </div>

      <div className="spacer-24" />
      <div className="muted" style={{ textAlign: "center", fontSize: 13 }}>📝 模板池只展示企业可雇佣的模板，新增模板统一由构建端生产。</div>
    </div>
  );
}

function DeptPage({ role, go }) {
  const isManager = role === "manager";
  const [query, setQuery] = _useState1("");
  const [tab, setTab] = _useState1("live");
  const [subtab, setSubtab] = _useState1("ai");

  const tabs = isManager
    ? [
        { id: "hired", label: "已雇佣", filter: item => item.status === "hired" || item.status === "failed" },
        { id: "intern", label: "待实习", filter: item => item.status === "interning_ai" || item.status === "interning_human" },
        { id: "live", label: "已上岗", filter: item => item.status === "live" }
      ]
    : [{ id: "live", label: "已上岗", filter: item => item.status === "live" }];

  const currentTab = tabs.find(item => item.id === tab) || tabs[tabs.length - 1];
  let list = window.DEPT_EMPLOYEES.filter(currentTab.filter);

  if (tab === "intern" && isManager) {
    list = list.filter(item => (subtab === "ai" ? item.status === "interning_ai" : item.status === "interning_human"));
  }

  if (query.trim()) {
    list = list.filter(item => item.name.includes(query) || item.desc.includes(query) || (item.tags || []).join(" ").includes(query));
  }

  const counts = {
    hired: window.DEPT_EMPLOYEES.filter(item => item.status === "hired" || item.status === "failed").length,
    intern: window.DEPT_EMPLOYEES.filter(item => item.status === "interning_ai" || item.status === "interning_human").length,
    live: window.DEPT_EMPLOYEES.filter(item => item.status === "live").length
  };

  return (
    <div className="page">
      <div className="page-header hero-header">
        <div>
          <span className="eyebrow">{isManager ? "团队资产总览" : "部门可复制员工"}</span>
          <h1 className="page-title">部门数字员工 · <em>研发部</em></h1>
          <p className="page-sub">
            {isManager
              ? "部门长视角下统一管理已雇佣、待实习、已上岗三个阶段；所有卡片先进入详情，再由详情页分发下一步动作。"
              : "普通成员只看到已上岗结果集。进入详情后可以一键创建自己的分身。"}
          </p>
        </div>
        {isManager && (
          <button className="btn btn-primary" onClick={() => go("templates")}>
            <window.Icon.plus className="icn" /> 从模板雇佣
          </button>
        )}
      </div>

      <div className="searchbar">
        <window.Icon.search />
        <input value={query} onChange={evt => setQuery(evt.target.value)} placeholder="搜索员工名称、能力标签、所属场景" />
        <button className="btn btn-primary" onClick={() => setQuery("")}>清空筛选</button>
      </div>

      <div className="spacer-24" />

      <div className="tabs">
        {tabs.map(item => (
          <a key={item.id} className={`tab ${tab === item.id ? "active" : ""}`} onClick={() => setTab(item.id)}>
            {item.label} <span className="tab-count tnum">{counts[item.id]}</span>
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
          <h4>当前没有符合筛选条件的数字员工</h4>
          <p>{isManager ? "去模板池开始一次新雇佣，或切换到其他状态查看。" : "等部门长完成上岗后，这里就会出现可复制员工。"}</p>
        </div>
      ) : (
        <div className="grid grid-3">
          {list.map(employee => {
            // 待实习状态的员工点击卡片直接进入对应的评估页面
            const handleClick = () => {
              if (employee.status === "interning_ai") {
                go(`eval-ai/${employee.id}`);
              } else if (employee.status === "interning_human") {
                go(`eval-human/${employee.id}`);
              } else {
                go(`employee/${employee.id}`);
              }
            };
            return (
            <window.EmployeeCard
              key={employee.id}
              emp={employee}
              onClick={handleClick}
              cardHint={isManager && employee.status === "live" ? `已上岗员工支持"快捷复制"，但卡片主动作仍然统一进入详情页。` : (!isManager ? "卡片进入详情页后可创建你的个人分身。" : "")}
              footerActions={(
                <div className="action-row">
                  {isManager && employee.status === "live" && (
                    <button className="btn btn-ghost btn-sm" onClick={evt => { evt.stopPropagation(); go(`quick-clone/${employee.id}`); }}>
                      快捷复制
                    </button>
                  )}
                  {employee.status === "interning_ai" && (
                    <button className="btn btn-primary btn-sm" onClick={evt => { evt.stopPropagation(); go(`eval-ai/${employee.id}`); }}>
                      进入 AI 评估
                    </button>
                  )}
                  {employee.status === "interning_human" && (
                    <button className="btn btn-primary btn-sm" onClick={evt => { evt.stopPropagation(); go(`eval-human/${employee.id}`); }}>
                      进入人工评估
                    </button>
                  )}
                  {employee.status !== "interning_ai" && employee.status !== "interning_human" && (
                    <button className="btn-link" onClick={evt => { evt.stopPropagation(); go(`employee/${employee.id}`); }}>查看详情 →</button>
                  )}
                </div>
              )}
            />
          )})}
        </div>
      )}
    </div>
  );
}

function MyPage({ role, go }) {
  const viewer = window.getViewer(role);
  const [filter, setFilter] = _useState1("all");
  const [jumpEmployee, setJumpEmployee] = _useState1(null);
  const employees = window.getMyEmployeesForRole(role);

  const list = employees.filter(item => {
    if (filter === "all") return true;
    if (filter === "live") return item.status === "live";
    if (filter === "evaluating") return item.status === "interning_ai" || item.status === "interning_human";
    if (filter === "branch") return item.type === "private_branch";
    if (filter === "failed") return item.status === "failed";
    return true;
  });

  const totals = {
    all: employees.length,
    live: employees.filter(item => item.status === "live").length,
    evaluating: employees.filter(item => item.status === "interning_ai" || item.status === "interning_human").length,
    branch: employees.filter(item => item.type === "private_branch").length,
    failed: employees.filter(item => item.status === "failed").length
  };

  function renderFooter(employee) {
    const connected = window.getConnectedChannels(employee.id).length > 0;

    if (employee.status === "live") {
      return (
        <div className="action-row">
          <button className="btn btn-primary btn-sm" onClick={evt => { evt.stopPropagation(); go(`chat/${employee.id}`); }}>
            开始对话
          </button>
          <button className="btn btn-ghost btn-sm" onClick={evt => { evt.stopPropagation(); connected ? setJumpEmployee(employee) : go(`im/${employee.id}`); }}>
            {connected ? "去 IM" : "配置 IM"}
          </button>
          <button className="btn-link" onClick={evt => { evt.stopPropagation(); go(`employee/${employee.id}`); }}>详情</button>
        </div>
      );
    }

    if (employee.status === "interning_ai" || employee.status === "interning_human") {
      const targetRoute = employee.status === "interning_ai" ? `eval-ai/${employee.id}` : `eval-human/${employee.id}`;
      const label = employee.status === "interning_ai" ? "进入 AI 评估" : "进入人工评估";
      return (
        <div className="action-row">
          <button className="btn btn-primary btn-sm" onClick={evt => { evt.stopPropagation(); go(targetRoute); }}>
            {label}
          </button>
          <button className="btn btn-ghost btn-sm" onClick={evt => { evt.stopPropagation(); go(`employee/${employee.id}`); }}>查看进度</button>
        </div>
      );
    }

    if (employee.status === "failed") {
      return (
        <div className="action-row">
          <button className="btn btn-ghost btn-sm" onClick={evt => { evt.stopPropagation(); go(`review/${employee.id}`); }}>查看报告</button>
          <button className="btn-link" onClick={evt => { evt.stopPropagation(); go(`employee/${employee.id}`); }}>继续雇佣</button>
        </div>
      );
    }

    return (
      <div className="action-row">
        <button className="btn btn-ghost btn-sm" onClick={evt => { evt.stopPropagation(); go(`employee/${employee.id}`); }}>查看历史</button>
        {employee.parent && <button className="btn-link" onClick={evt => { evt.stopPropagation(); go(`clone/${employee.parent}`); }}>重新复制</button>}
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header hero-header">
        <div>
          <span className="eyebrow">{viewer.name} 的个人资产</span>
          <h1 className="page-title">我的数字员工</h1>
          <p className="page-sub">这里只展示你本人拥有的"我的分身"和"私人定制"。`live` 卡片主动作统一改为"开始对话"，直接进入站内会话。</p>
        </div>
        <button className="btn btn-ghost" onClick={() => go("dept")}>
          去部门数字员工 复制一个 →
        </button>
      </div>

      <window.StatStrip items={[
        { icon: <window.Icon.users />, value: <span className="tnum">{totals.all}</span>, label: "实例总数" },
        { icon: <window.Icon.bot />, value: <span className="tnum">{totals.live}</span>, label: "已上岗" },
        { icon: <window.Icon.spark />, value: <span className="tnum">{totals.evaluating}</span>, label: "评估中" },
        { icon: <window.Icon.shield />, value: <span className="tnum">{totals.branch}</span>, label: "私人定制" },
        { icon: <window.Icon.clock />, value: <span className="tnum">{totals.failed}</span>, label: "待处理" }
      ]} />

      <div className="spacer-24" />

      <div className="subtabs">
        <button className={`subtab ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>全部</button>
        <button className={`subtab ${filter === "live" ? "active" : ""}`} onClick={() => setFilter("live")}>已上岗</button>
        <button className={`subtab ${filter === "evaluating" ? "active" : ""}`} onClick={() => setFilter("evaluating")}>评估中</button>
        <button className={`subtab ${filter === "branch" ? "active" : ""}`} onClick={() => setFilter("branch")}>私人定制</button>
        <button className={`subtab ${filter === "failed" ? "active" : ""}`} onClick={() => setFilter("failed")}>待回退</button>
      </div>

      {list.length === 0 ? (
        <div className="empty">
          <div className="ic">🗂</div>
          <h4>当前筛选下没有你的个人资产</h4>
          <p>先去"部门数字员工"复制一个 `live` 员工给自己，回来这里就能开始对话或继续定制。</p>
        </div>
      ) : (
        <div className="grid grid-3">
          {list.map(employee => {
            // 待实习状态的员工点击卡片直接进入对应的评估页面
            const handleClick = () => {
              if (employee.status === "live") {
                go(`chat/${employee.id}`);
              } else if (employee.status === "interning_ai") {
                go(`eval-ai/${employee.id}`);
              } else if (employee.status === "interning_human") {
                go(`eval-human/${employee.id}`);
              } else {
                go(`employee/${employee.id}`);
              }
            };
            return (
            <window.EmployeeCard
              key={employee.id}
              emp={employee}
              onClick={handleClick}
              extraPanel={(
                <div className="inline-panel">
                  <div className="inline-panel-title">IM 接入状态</div>
                  <window.IMStatusStrip employeeId={employee.id} onClick={() => setJumpEmployee(employee)} />
                </div>
              )}
              cardHint={employee.status === "live" ? "主动作已切换为站内对话；详情和 IM 配置保留为次要动作。" : ""}
              footerActions={renderFooter(employee)}
            />
          )})}
        </div>
      )}

      <window.IMPickerModal
        open={!!jumpEmployee}
        employee={jumpEmployee}
        onClose={() => setJumpEmployee(null)}
        onConfig={() => {
          const current = jumpEmployee;
          setJumpEmployee(null);
          if (current) go(`im/${current.id}`);
        }}
      />
    </div>
  );
}

Object.assign(window, { TemplatesPage, DeptPage, MyPage });
