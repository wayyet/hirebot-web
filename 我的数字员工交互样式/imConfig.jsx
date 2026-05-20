/* global React */
/* IM platform configuration page for a digital employee. */
const { useState: useIMState } = React;

const IM_PLATFORMS = [
  {
    key: "feishu",
    name: "飞书",
    mark: "飞",
    tone: "indigo",
    method: "WebSocket 长连接",
    fields: [
      { key: "appId",     label: "App ID",     hint: "请输入飞书 App ID" },
      { key: "appSecret", label: "App Secret", hint: "请输入飞书 App Secret" },
    ],
    tip: "推荐使用 WebSocket 长连接，免外网回调可用。",
  },
  {
    key: "dingtalk",
    name: "钉钉",
    mark: "钉",
    tone: "amber",
    method: "URL 回调",
    fields: [
      { key: "agentId", label: "AgentId", hint: "请输入钉钉 AgentId" },
      { key: "secret",  label: "AppSecret", hint: "请输入钉钉 AppSecret" },
    ],
    tip: "URL 回调需在钉钉开放平台设置事件订阅地址。",
  },
  {
    key: "wecom",
    name: "企微",
    mark: "企",
    tone: "green",
    method: "WebSocket 长连接",
    fields: [
      { key: "appId",     label: "App ID",     hint: "请输入企微 AgentID" },
      { key: "appSecret", label: "App Secret", hint: "请输入企微应用 Secret" },
    ],
    tip: "直接输入 AgentID 与 Secret 即可建立企微长连接。",
  },
];

const MODE_OPTIONS = [
  { key: "ws",  label: "WebSocket 长连接（推荐）" },
  { key: "url", label: "使用 URL 回调" },
];

function IMConfigIcon({ name }) {
  const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" };
  switch (name) {
    case "back":
      return <svg viewBox="0 0 24 24" {...stroke}><path d="M15 18l-6-6 6-6"/></svg>;
    case "arrow-right":
      return <svg viewBox="0 0 24 24" {...stroke}><path d="M5 12h14M13 5l7 7-7 7"/></svg>;
    default:
      return null;
  }
}

function IMConfigPage({ emp, onBack }) {
  const [activeKey, setActiveKey] = useIMState(
    // start at first unconnected, fallback to first
    (IM_PLATFORMS.find((p) => emp.im[p.key] !== "connected") || IM_PLATFORMS[0]).key
  );
  const [mode, setMode] = useIMState("ws");
  const [form, setForm] = useIMState({});

  const active = IM_PLATFORMS.find((p) => p.key === activeKey);
  const connectedCount = IM_PLATFORMS.filter((p) => emp.im[p.key] === "connected").length;
  const isConnected = emp.im[active.key] === "connected";

  const setField = (k, v) => setForm((f) => ({ ...f, [activeKey]: { ...(f[activeKey] || {}), [k]: v } }));
  const values = form[activeKey] || {};

  return (
    <div className="im-config-page">
      <button className="detail-back" onClick={onBack}>
        <IMConfigIcon name="back"/>
        <span>返回详情</span>
      </button>

      <header className="im-cfg-head">
        <span className="eyebrow">多平台 IM 接入</span>
        <h1 className="im-cfg-title">
          IM 配置 <span className="im-cfg-title-accent">· {emp.name}</span>
        </h1>
        <p className="im-cfg-sub">
          每个平台独立配置，支持 WebSocket 长连接和 URL 回调两种方式。上岗后 IM 接入是可选步骤，不阻塞站内对话使用。
        </p>
      </header>

      <div className="im-cfg-body">
        {/* ============ left ============ */}
        <div className="im-cfg-left">
          <section className="detail-card">
            <div className="detail-card-head"><h3>平台选择</h3></div>
            <div className="im-pick-list">
              {IM_PLATFORMS.map((p) => {
                const on = emp.im[p.key] === "connected";
                const isActive = p.key === activeKey;
                return (
                  <button
                    key={p.key}
                    type="button"
                    className={"im-pick " + (isActive ? "active " : "") + (on ? "connected" : "")}
                    onClick={() => setActiveKey(p.key)}
                  >
                    <span className={"avatar-chip av-" + p.tone} style={{width: 30, height: 30, fontSize: 12}}>{p.mark}</span>
                    <span className="im-pick-name">{p.name}</span>
                    <span className={"li-badge " + (on ? "live" : "pending")}>
                      {on ? "已连接" : "未配置"}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="detail-card">
            <div className="detail-card-head"><h3>当前状态</h3></div>
            <div className="im-status-box">
              <div className="im-status-head">
                <div className="im-status-name">{active.name}</div>
                <span className={"li-badge " + (isConnected ? "live" : "pending")}>
                  {isConnected ? "已连接" : "未配置"}
                </span>
              </div>
              <div className="im-status-desc">
                选择连接方式并输入对应凭据，以将此数字员工绑定到{active.name} AIBot。
              </div>
              <dl className="im-status-table">
                <div><dt>绑定对象</dt><dd>{emp.name}</dd></div>
                <div><dt>连接方式</dt><dd>{isConnected ? active.method : "尚未选择"}</dd></div>
                <div><dt>最近连接</dt><dd>{isConnected ? "今天 14:08" : "—"}</dd></div>
                <div><dt>已连接平台</dt><dd>{connectedCount} 个</dd></div>
              </dl>
            </div>
          </section>

          <div className="im-cfg-footnote">
            已连接平台之间互不影响。重新注册只会更新当前平台，不会覆盖其他平台的凭据。
          </div>
        </div>

        {/* ============ right ============ */}
        <div className="im-cfg-right">
          <section className="detail-card">
            <div className="detail-card-head"><h3>接入模式</h3></div>
            <div className="im-mode-row">
              {MODE_OPTIONS.map((m) => (
                <button
                  key={m.key}
                  type="button"
                  className={"im-mode " + (mode === m.key ? "on" : "")}
                  onClick={() => setMode(m.key)}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <div className="im-mode-tip">{active.tip}</div>

            <div className="im-cred-section">
              <div className="im-cred-title">凭证表单</div>
              <div className="im-cred-grid">
                {active.fields.map((f) => (
                  <div className="im-field" key={f.key}>
                    <label>{f.label} · 必填</label>
                    <input
                      type="text"
                      placeholder={f.hint}
                      value={values[f.key] || ""}
                      onChange={(e) => setField(f.key, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="im-cfg-actions">
              <button className="action-ghost" onClick={onBack}>取消</button>
              <button className="action-primary">
                <span>注册并连接</span>
                <IMConfigIcon name="arrow-right"/>
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

window.IMConfigPage = IMConfigPage;
