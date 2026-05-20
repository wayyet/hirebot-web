/* global React */
/* "去 IM" demo modal — picks which connected platform to launch. */
const { useEffect: useGoIMEffect } = React;

const GO_IM_PLATFORMS = [
  { key: "feishu",   name: "飞书", mark: "飞", tone: "indigo", scheme: "feishu://"   },
  { key: "dingtalk", name: "钉钉", mark: "钉", tone: "amber",  scheme: "dingtalk://" },
  { key: "wecom",    name: "企微", mark: "企", tone: "green",  scheme: "wxwork://"   },
];

// Try to launch the platform's native client.
// Falls back gracefully if the URL scheme isn't registered.
window.__launchIM__ = function launchIM(platformKey) {
  const p = GO_IM_PLATFORMS.find((x) => x.key === platformKey);
  if (!p) return;
  // Iframe trick avoids navigating the page away if the scheme isn't registered.
  const f = document.createElement("iframe");
  f.style.display = "none";
  f.src = p.scheme;
  document.body.appendChild(f);
  // Cleanup after a moment.
  setTimeout(() => { try { document.body.removeChild(f); } catch (_) {} }, 1200);
  // Also try direct location for browsers that ignore iframe deep-links
  try { window.location.href = p.scheme; } catch (_) {}
};

function GoIMModal({ open, emp, onClose }) {
  useGoIMEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose && onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !emp) return null;
  const connected = GO_IM_PLATFORMS.filter((p) => emp.im[p.key] === "connected");

  return (
    <div className="go-im-overlay"
         onMouseDown={(e) => { if (e.target === e.currentTarget) onClose && onClose(); }}>
      <div className="go-im-modal" role="dialog" aria-modal="true">
        <header className="go-im-head">
          <div className="go-im-titles">
            <div className="go-im-title">去 IM · {emp.name}</div>
            <div className="go-im-sub">演示模式下会模拟拉起对应平台私聊。</div>
          </div>
          <button className="go-im-close" onClick={onClose} aria-label="关闭">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
                 strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 6l12 12M18 6L6 18"/>
            </svg>
          </button>
        </header>

        <div className="go-im-body">
          {connected.length > 0 ? (
            <div className="go-im-options">
              {connected.map((p) => (
                <button
                  key={p.key}
                  className="go-im-option"
                  onClick={() => {
                    window.__launchIM__ && window.__launchIM__(p.key);
                    onClose && onClose();
                  }}
                >
                  <span className={"avatar-chip av-" + p.tone}
                        style={{ width: 26, height: 26, fontSize: 12, borderRadius: 8 }}>
                    {p.mark}
                  </span>
                  <span className="go-im-option-name">{p.name}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="go-im-empty">
              该数字员工还没有连接任何 IM 平台。请先在详情页的「IM 接入区」配置一个。
            </div>
          )}
        </div>

        <footer className="go-im-foot">
          <button className="action-ghost" onClick={onClose}>关闭</button>
        </footer>
      </div>
    </div>
  );
}

window.GoIMModal = GoIMModal;
