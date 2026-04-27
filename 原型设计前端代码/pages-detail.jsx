/* global window, React */
const { useState: _useState2 } = React;

// ===== Template Detail =====
function TemplateDetailPage({ id, go, role }) {
  const t = window.findTemplateById(id);
  if (!t) return null;
  return (
    <div className="page page-narrow">
      <window.Crumb label="返回模板池" onClick={() => go("templates")} />
      <div className="card card-pad">
        <div className="row" style={{gap:16}}>
          <window.Avatar initial={t.initial} tint={t.tint} size="xl" />
          <div style={{flex:1}}>
            <h2 style={{margin:0, fontSize:24, fontWeight:600}}>{t.name}</h2>
            <div className="muted" style={{marginTop:6, fontSize:13}}>
              <span className={`pill ${t.source === "全局通用" ? "blue" : "purple"}`}>{t.source}</span>
              <span style={{marginLeft:10}}>适用：{t.sectors.join(" / ")}</span>
            </div>
            <p style={{marginTop:12, color:"var(--c-body)", lineHeight:1.6}}>{t.summary}</p>
          </div>
          {role === "manager" && (
            <button className="btn btn-primary" onClick={() => go(`hire/new?tpl=${t.id}`)}>
              <window.Icon.spark className="icn"/> 雇佣
            </button>
          )}
        </div>
      </div>

      <div className="spacer-24"/>
      <div className="grid" style={{gridTemplateColumns:"2fr 1fr", gap:20}}>
        <div className="card card-pad">
          <h3 className="section-h">能力清单</h3>
          <div className="cap-list">
            {t.capabilities.map((c, i) => (
              <div key={i} className="cap"><span className="check">✓</span><span>{c}</span></div>
            ))}
            {t.cants.map((c, i) => (
              <div key={`x${i}`} className="cap cant"><span className="check">×</span><span>{c}</span></div>
            ))}
          </div>
        </div>
        <div className="card card-pad">
          <h3 className="section-h">使用情况</h3>
          <div className="kv">
            <dt>已生成部门版</dt><dd className="tnum">{t.used}</dd>
            <dt>累计被复制</dt><dd className="tnum">{t.cloned}</dd>
            <dt>最近版本</dt><dd className="tnum">v 2.4.1</dd>
            <dt>更新时间</dt><dd>4 月 18 日</dd>
          </div>
          <div className="divider"/>
          <div className="callout info" style={{fontSize:12.5}}>
            从此页发起雇佣会自动带入 template_id，返回时保留搜索关键词。
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== Employee Detail (action dispatcher) =====
function EmployeeDetailPage({ id, role, go, openLark }) {
  const e = window.findEmployeeById(id);
  if (!e) return null;
  const isManager = role === "manager";
  const isOwner = (e.owner === "李部门长" && isManager) || (e.owner === "王成员" && !isManager);
  const tpl = window.findTemplateById(e.template) || {};

  // primary actions matrix
  const actions = [];
  if (e.status === "hired" && e.type === "department") actions.push({ label: "继续雇佣", primary: true, go: () => go(`hire/${e.id}`) });
  if (e.status === "interning_ai") actions.push({ label: "查看 AI 评估", primary: true, go: () => go(`eval-ai/${e.id}`) });
  if (e.status === "interning_human") actions.push({ label: "查看人工评估", primary: true, go: () => go(`eval-human/${e.id}`) });
  if (e.status === "live") {
    actions.push({ label: "去飞书使用", primary: true, go: () => openLark(e) });
    if (e.type === "department") {
      if (isManager) {
        actions.push({ label: "复制一个给自己", go: () => go(`clone/${e.id}`) });
        actions.push({ label: "重新雇佣", go: () => go(`hire/${e.id}`) });
      } else {
        actions.push({ label: "创建分身", primary: true, go: () => go(`clone/${e.id}`) });
      }
    }
    if (e.type === "personal_clone" && isOwner) {
      actions.push({ label: "创建私人定制", go: () => go(`branch/${e.id}`) });
    }
  }
  if (e.status === "failed") {
    actions.push({ label: "查看评估报告", primary: true, go: () => go(`eval-ai/${e.id}`) });
    actions.push({ label: "去 Review", go: () => go(`review/${e.id}`) });
    actions.push({ label: "继续雇佣", go: () => go(`hire/${e.id}`) });
  }
  if (e.status === "retired") {
    actions.push({ label: "查看历史", go: () => {} });
    actions.push({ label: e.type === "department" ? "重新雇佣" : "重新复制", go: () => go(`clone/${e.parent || e.id}`) });
  }

  const backTo = e.type === "department" ? "dept" : "my";

  return (
    <div className="page">
      <window.Crumb label={`返回 ${e.type === "department" ? "部门数字员工" : "我的数字员工"}`} onClick={() => go(backTo)} />

      <div className="card card-pad">
        <div className="row" style={{gap:18, alignItems:"flex-start"}}>
          <window.Avatar initial={e.initial} tint={e.tint} size="xl" />
          <div style={{flex:1}}>
            <div className="row" style={{gap:10}}>
              <h2 style={{margin:0, fontSize:24, fontWeight:600}}>{e.name}</h2>
              <window.StatusPill status={e.status} />
              <window.TypePill type={e.type} />
            </div>
            <div className="muted" style={{marginTop:8, fontSize:13}}>
              所属部门 {e.dept || "研发部"} · Owner {e.owner} · 最近更新 {e.updated}
            </div>
            <p style={{marginTop:12, color:"var(--c-body)", lineHeight:1.6}}>{e.desc}</p>
          </div>
          <div style={{display:"flex", flexDirection:"column", gap:8, alignItems:"flex-end"}}>
            {actions.map((a, i) => (
              <button key={i} className={`btn ${a.primary ? "btn-primary" : "btn-ghost"}`} onClick={a.go}>
                {a.label} {a.primary && <window.Icon.arrow className="icn"/>}
              </button>
            ))}
          </div>
        </div>

        <div className="divider"/>
        <h4 className="muted" style={{margin:"0 0 10px", fontSize:13, fontWeight:500}}>来源关系</h4>
        <window.Lineage employee={e} />
      </div>

      <div className="spacer-24"/>

      <div className="split">
        <div className="card card-pad">
          <h3 className="section-h">能力简介</h3>
          <div className="cap-list">
            {(tpl.capabilities || []).slice(0, 4).map((c, i) => (
              <div key={i} className="cap"><span className="check">✓</span><span>{c}</span></div>
            ))}
            {(tpl.cants || []).slice(0, 2).map((c, i) => (
              <div key={`x${i}`} className="cap cant"><span className="check">×</span><span>{c}</span></div>
            ))}
          </div>
          <div className="divider"/>
          <h4 className="muted" style={{margin:"0 0 10px", fontSize:13, fontWeight:500}}>飞书身份</h4>
          <div className="lark-bar">
            <window.Avatar initial={e.initial} tint={e.tint} size="md" />
            <div>
              <div className="name">{e.name}</div>
              <div className="desc">{e.desc.slice(0, 36)}…</div>
            </div>
            <div style={{flex:1}}/>
            <span className={`pill ${e.status === "live" ? "green" : "gray"}`}>
              {e.status === "live" ? "● 已注册" : "未启用"}
            </span>
          </div>
        </div>

        <div className="card card-pad">
          <h3 className="section-h">运行状态</h3>
          {e.status === "live" ? (
            <window.StatStrip items={[
              { icon: <window.Icon.spark/>, value: <span className="tnum">{e.runs || 0}</span>, label: "累计任务" },
              { icon: <window.Icon.users/>, value: <span className="tnum">{e.cloned || 0}</span>, label: "被复制" },
              { icon: <window.Icon.clock/>, value: e.activeAt || "—", label: "最近活跃" },
              { icon: <window.Icon.shield/>, value: <span className="tnum">0</span>, label: "近 7 日错误" },
              { icon: <window.Icon.bot/>, value: "v 1.0", label: "实例版本" }
            ]} />
          ) : (
            <div className="callout info">
              该实例尚未上岗，仅展示元数据与流程进度。{!isOwner && "你不是 Owner，会话明细对你不可见。"}
            </div>
          )}

          <div className="spacer-16"/>
          <div className="callout success">
            <span style={{fontSize:18}}>🛡️</span>
            <div>
              <div style={{fontWeight:600, color:"var(--c-near-black)"}}>评估门槛已通过</div>
              <div style={{color:"var(--c-body)", marginTop:4}}>
                {e.status === "live" ? "AI 评估、人工评估均已通过；上岗前已完成飞书身份配置。" :
                 e.status === "interning_ai" ? "AI 评估进行中。通过后才允许进入人工评估。" :
                 e.status === "interning_human" ? "人工评估进行中。用户不能跳过人工评估直接上岗。" :
                 "评估流程未完成，状态以详情为准。"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { TemplateDetailPage, EmployeeDetailPage });
