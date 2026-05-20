/* global React */
/* Modal: configure a single IM platform for a digital employee. */
const { useState: useModalState, useEffect: useModalEffect, useRef: useModalRef } = React;

const MODAL_PLATFORMS = {
  feishu:   { name: "飞书", mark: "飞", tone: "indigo" },
  dingtalk: { name: "钉钉", mark: "钉", tone: "amber" },
  wecom:    { name: "企微", mark: "企", tone: "green" },
};

const MODE_FORMS = {
  ws: {
    title: "WebSocket 长连接（推荐）",
    tip:   "直接输入应用凭据即可建立长连接，免外网回调地址。",
    fields: (platform) => {
      const labels = {
        feishu:   ["App ID", "App Secret"],
        dingtalk: ["AgentID", "AppSecret"],
        wecom:    ["AgentID", "Secret"],
      }[platform] || ["App ID", "App Secret"];
      return [
        { key: "id",     label: labels[0], hint: `请输入${MODAL_PLATFORMS[platform].name} ${labels[0]}` },
        { key: "secret", label: labels[1], hint: `请输入${MODAL_PLATFORMS[platform].name} ${labels[1]}` },
      ];
    },
  },
  url: {
    title: "使用 URL 回调",
    tip:   "需要在开放平台配置回调地址、Token 与 EncodingAESKey。",
    fields: () => [
      { key: "url",   label: "回调地址",        hint: "https://example.com/im/callback" },
      { key: "token", label: "Token",          hint: "请输入开放平台 Token" },
      { key: "aes",   label: "EncodingAESKey", hint: "请输入 43 位 AESKey" },
    ],
  },
};

function ModalIcon({ name }) {
  const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" };
  switch (name) {
    case "x":     return <svg viewBox="0 0 24 24" {...stroke}><path d="M6 6l12 12M18 6L6 18"/></svg>;
    case "check": return <svg viewBox="0 0 24 24" {...stroke}><path d="M5 13l4 4 10-10"/></svg>;
    case "warn":  return <svg viewBox="0 0 24 24" {...stroke}><path d="M12 9v4M12 17h.01"/><path d="M10.3 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>;
    case "loader":
      return (
        <svg viewBox="0 0 24 24" className="modal-spin" fill="none" stroke="currentColor"
             strokeWidth="2.2" strokeLinecap="round">
          <path d="M12 3a9 9 0 1 1-6.4 2.6" opacity="0.85"/>
        </svg>
      );
    default: return null;
  }
}

function IMConfigModal({ open, emp, platform, onClose, onConnected }) {
  const [mode, setMode] = useModalState("ws");
  const [values, setValues] = useModalState({});
  const [phase, setPhase] = useModalState("idle"); // idle | connecting | success | error
  const [errorMsg, setErrorMsg] = useModalState("");
  const overlayRef = useModalRef(null);

  // Reset state every time the modal opens or platform changes
  useModalEffect(() => {
    if (open) {
      setMode("ws");
      setValues({});
      setPhase("idle");
      setErrorMsg("");
    }
  }, [open, platform]);

  // ESC to close
  useModalEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape" && phase !== "connecting") onClose && onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, phase, onClose]);

  if (!open || !platform) return null;
  const p = MODAL_PLATFORMS[platform];
  const form = MODE_FORMS[mode];
  const fields = form.fields(platform);

  const allFilled = fields.every((f) => (values[f.key] || "").trim().length > 0);

  const submit = () => {
    if (!allFilled || phase === "connecting") return;
    setPhase("connecting");
    setErrorMsg("");
    // Simulated connection — deterministic: contains "fail" => fail, else succeed after 1.6s
    const willFail = Object.values(values).some((v) => /fail|err/i.test(String(v)));
    setTimeout(() => {
      if (willFail) {
        setPhase("error");
        setErrorMsg("凭据校验失败：请检查 ID/Secret 后重试");
      } else {
        setPhase("success");
        onConnected && onConnected(emp.id, platform);
      }
    }, 1600);
  };

  const retry = () => setPhase("idle");

  return (
    <div className="im-modal-overlay" ref={overlayRef}
         onMouseDown={(e) => { if (e.target === overlayRef.current && phase !== "connecting") onClose && onClose(); }}>
      <div className="im-modal" role="dialog" aria-modal="true">
        <header className="im-modal-head">
          <div className="im-modal-title-row">
            <span className={"avatar-chip av-" + p.tone} style={{ width: 32, height: 32, fontSize: 13 }}>{p.mark}</span>
            <div className="im-modal-titles">
              <div className="im-modal-title">接入平台</div>
              <div className="im-modal-sub">{p.name} · {emp.name}</div>
            </div>
          </div>
          <button className="im-modal-close" onClick={onClose} disabled={phase === "connecting"} aria-label="关闭">
            <ModalIcon name="x"/>
          </button>
        </header>

        {/* ============ body switches by phase ============ */}
        {(phase === "idle" || phase === "connecting") && (
          <div className="im-modal-body">
            <div className="im-modal-field-label">接入模式</div>
            <div className="im-mode-row">
              <button className={"im-mode " + (mode === "ws"  ? "on" : "")}
                      disabled={phase === "connecting"}
                      onClick={() => setMode("ws")}>WebSocket 长连接（推荐）</button>
              <button className={"im-mode " + (mode === "url" ? "on" : "")}
                      disabled={phase === "connecting"}
                      onClick={() => setMode("url")}>使用 URL 回调</button>
            </div>

            <div className="im-mode-tip">{form.tip}</div>

            <div className={"im-cred-grid " + (fields.length === 3 ? "col-1" : "")}>
              {fields.map((f) => (
                <div className="im-field" key={f.key}>
                  <label>{f.label} · 必填</label>
                  <input
                    type={/secret|aes|token/i.test(f.key) ? "password" : "text"}
                    placeholder={f.hint}
                    value={values[f.key] || ""}
                    disabled={phase === "connecting"}
                    onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                  />
                </div>
              ))}
            </div>

            {phase === "connecting" && (
              <div className="im-status-banner connecting">
                <ModalIcon name="loader"/>
                <div>
                  <div className="im-status-banner-title">正在与 {p.name} 建立连接…</div>
                  <div className="im-status-banner-text">校验凭据并下发会话密钥，请稍候 (~2s)</div>
                </div>
              </div>
            )}

            <footer className="im-modal-foot">
              <button className="action-ghost" onClick={onClose} disabled={phase === "connecting"}>取消</button>
              <button className="action-primary" onClick={submit}
                      disabled={!allFilled || phase === "connecting"}>
                {phase === "connecting" ? "连接中…" : "注册并连接"}
              </button>
            </footer>
          </div>
        )}

        {phase === "success" && (
          <div className="im-modal-body result">
            <div className="im-result-card success">
              <div className="im-result-icon"><ModalIcon name="check"/></div>
              <div className="im-result-text">
                <div className="im-result-title">已成功连接 {p.name}</div>
                <div className="im-result-sub">
                  {emp.name} 现在可以通过{p.name} 接收和回复消息。连接方式：{mode === "ws" ? "WebSocket 长连接" : "URL 回调"}
                </div>
              </div>
            </div>
            <div className="im-result-meta">
              <div><span>连接 ID</span><b>conn_{Math.random().toString(36).slice(2, 9)}</b></div>
              <div><span>建立时间</span><b>刚刚</b></div>
              <div><span>会话密钥</span><b>•••• •••• 已下发</b></div>
            </div>
            <footer className="im-modal-foot">
              <button className="action-primary" onClick={onClose}>完成</button>
            </footer>
          </div>
        )}

        {phase === "error" && (
          <div className="im-modal-body result">
            <div className="im-result-card error">
              <div className="im-result-icon"><ModalIcon name="warn"/></div>
              <div className="im-result-text">
                <div className="im-result-title">连接失败</div>
                <div className="im-result-sub">{errorMsg || "请检查凭据后重试"}</div>
              </div>
            </div>
            <ul className="im-error-checklist">
              <li>App ID / Secret 是否与开放平台一致</li>
              <li>是否已在开放平台开启对应能力</li>
              <li>服务器 IP 是否在白名单内</li>
            </ul>
            <footer className="im-modal-foot">
              <button className="action-ghost" onClick={onClose}>取消</button>
              <button className="action-primary" onClick={retry}>重新填写并重试</button>
            </footer>
          </div>
        )}
      </div>
    </div>
  );
}

window.IMConfigModal = IMConfigModal;
