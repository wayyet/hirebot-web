/* global React */
/* Single-employee focused chat page — split layout:
   - Left: conversation history with file upload
   - Right: files produced by this conversation
*/
const { useState: useChatState, useEffect: useChatEffect, useRef: useChatRef, useMemo: useChatMemo } = React;

/* ---------- per-employee mock output files ---------- */
const CHAT_OUTPUTS = {
  "zhaopin-li": [
    { id: "f1", name: "候选人简历摘要 · 张同学.pdf", kind: "pdf", size: "284 KB", time: "今天 09:15", from: "对候选人 1 的项目经历总结" },
    { id: "f2", name: "面试题清单 · 后端 P6.docx",   kind: "doc", size: "92 KB",  time: "今天 09:17", from: "搜推方向加分/减分提醒" },
    { id: "f3", name: "候选人对比表.xlsx",          kind: "xls", size: "31 KB",  time: "今天 11:02", from: "三位候选人横向对比" },
    { id: "f4", name: "邀约话术 · 张同学.md",        kind: "md",  size: "6 KB",   time: "今天 14:05", from: "下午 4 点的一面邀约" },
  ],
  "xingye-xiaoyan": [
    { id: "f1", name: "AI Infra 周报 · 第 21 周.pdf", kind: "pdf", size: "1.2 MB", time: "周一 08:00", from: "本周推送" },
    { id: "f2", name: "金融 PoC 原文档.docx",         kind: "doc", size: "420 KB", time: "周一 09:22", from: "对 H20 替代方案的展开" },
    { id: "f3", name: "招标监控清单.csv",             kind: "csv", size: "12 KB",  time: "今天 08:00", from: "新加入监控的银行" },
  ],
  "zhaopin-xiaozhao": [
    { id: "f1", name: "校招终面名单 · 三期.xlsx",    kind: "xls", size: "180 KB", time: "今天 11:30", from: "Top 5 候选人导出" },
    { id: "f2", name: "实习生专属题 · 分布式系统.md", kind: "md",  size: "9 KB",   time: "今天 11:42", from: "添加到面试题库" },
  ],
};

/* ---------- helpers ---------- */
function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
function inferKind(name) {
  const ext = (name.split(".").pop() || "").toLowerCase();
  if (["pdf"].includes(ext)) return "pdf";
  if (["doc","docx"].includes(ext)) return "doc";
  if (["xls","xlsx","csv"].includes(ext)) return "xls";
  if (["md","txt"].includes(ext)) return "md";
  if (["png","jpg","jpeg","gif","webp"].includes(ext)) return "img";
  if (["mp3","wav","m4a"].includes(ext)) return "audio";
  return "file";
}
const FILE_TONE = {
  pdf:   { tone: "pink",   label: "PDF" },
  doc:   { tone: "blue",   label: "DOC" },
  xls:   { tone: "green",  label: "XLS" },
  md:    { tone: "purple", label: "MD"  },
  csv:   { tone: "green",  label: "CSV" },
  img:   { tone: "amber",  label: "IMG" },
  audio: { tone: "amber",  label: "AUD" },
  file:  { tone: "neutral",label: "FILE"},
};

function ChatIcon({ name }) {
  const s = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" };
  switch (name) {
    case "back":  return <svg viewBox="0 0 24 24" {...s}><path d="M15 18l-6-6 6-6"/></svg>;
    case "send":  return <svg viewBox="0 0 24 24" {...s} strokeWidth="2"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>;
    case "clip":  return <svg viewBox="0 0 24 24" {...s}><path d="M21 12.5L12 21a5.5 5.5 0 0 1-7.8-7.8L13 4.4a3.7 3.7 0 0 1 5.2 5.2L9.6 18.2a1.8 1.8 0 0 1-2.6-2.6l8-8"/></svg>;
    case "file":  return <svg viewBox="0 0 24 24" {...s}><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/></svg>;
    case "download": return <svg viewBox="0 0 24 24" {...s}><path d="M12 4v12M6 12l6 6 6-6"/><path d="M4 21h16"/></svg>;
    case "x":     return <svg viewBox="0 0 24 24" {...s} strokeWidth="1.8"><path d="M6 6l12 12M18 6L6 18"/></svg>;
    case "im":    return <svg viewBox="0 0 24 24" {...s}><path d="M21 11.5a8.4 8.4 0 0 1-8.4 8.4 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.7A8.4 8.4 0 1 1 21 11.5z"/></svg>;
    case "trash": return <svg viewBox="0 0 24 24" {...s}><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>;
    case "search":return <svg viewBox="0 0 24 24" {...s} strokeWidth="1.8"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>;
    case "empty": return (
      <svg viewBox="0 0 64 64" fill="none">
        <rect x="14" y="14" width="36" height="44" rx="4" stroke="currentColor" strokeWidth="1.6"/>
        <path d="M20 26h24M20 34h24M20 42h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
        <circle cx="48" cy="14" r="6" fill="currentColor" opacity="0.15"/>
      </svg>
    );
    default: return null;
  }
}

function FileTypeChip({ kind }) {
  const t = FILE_TONE[kind] || FILE_TONE.file;
  return <span className={"file-chip tone-" + t.tone}>{t.label}</span>;
}

/* ---------- chat page ---------- */
function ChatPage({ emp, initialThread, onBack, statusMap }) {
  const [messages, setMessages] = useChatState(() => initialThread || []);
  const [draft, setDraft] = useChatState("");
  const [attachments, setAttachments] = useChatState([]); // staged uploads not yet sent
  const [outputFiles, setOutputFiles] = useChatState(() => CHAT_OUTPUTS[emp.id] || []);
  const [query, setQuery] = useChatState("");

  const streamRef = useChatRef(null);
  const textareaRef = useChatRef(null);
  const fileInputRef = useChatRef(null);

  useChatEffect(() => {
    const el = streamRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  useChatEffect(() => {
    const t = textareaRef.current;
    if (!t) return;
    t.style.height = "auto";
    t.style.height = Math.min(t.scrollHeight, 160) + "px";
  }, [draft]);

  const handleUploadClick = () => fileInputRef.current?.click();
  const handleFiles = (e) => {
    const files = Array.from(e.target.files || []);
    const next = files.map((f, i) => ({
      id: "u" + Date.now() + "-" + i,
      name: f.name,
      size: formatSize(f.size),
      kind: inferKind(f.name),
    }));
    setAttachments((prev) => [...prev, ...next]);
    e.target.value = "";
  };
  const removeAttachment = (id) =>
    setAttachments((prev) => prev.filter((a) => a.id !== id));

  const nowText = () => {
    const d = new Date();
    return `今天 ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
  };

  const send = () => {
    const text = draft.trim();
    if (!text && attachments.length === 0) return;
    const userMsg = {
      role: "user",
      text: text || "(已上传附件)",
      time: nowText(),
      files: attachments,
    };
    setMessages((m) => [...m, userMsg]);
    setDraft("");
    setAttachments([]);

    // Simulated reply + maybe produce a file
    setTimeout(() => {
      const replyMap = {
        "zhaopin-li": "收到。我去整理后端 P6 的候选人材料，1 分钟内反馈。",
        "shichang-xiaotu": "好的，我汇总后给你看。",
        "xingye-xiaoyan": "我加入观察池，下周一更新。",
        "zhaopin-xiaozhao": "好的，校招专版正在准备。",
        "wenan-xiaoshu": "明白，我重写一版你看看。",
      };
      const reply = {
        role: "agent",
        text: replyMap[emp.id] || "好的，我马上处理。",
        time: nowText(),
      };
      setMessages((m) => [...m, reply]);

      // 25% chance to produce a new file
      if (Math.random() < 0.25) {
        const newFile = {
          id: "f-gen-" + Date.now(),
          name: `自动整理_${nowText().replace(/[^0-9]/g, "")}.md`,
          kind: "md",
          size: "8 KB",
          time: "刚刚",
          from: "针对你的最近一条消息",
          fresh: true,
        };
        setOutputFiles((L) => [newFile, ...L]);
      }
    }, 700);
  };

  const onKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const clearHistory = () => {
    if (!window.confirm("清空与该数字员工的全部会话历史？此操作不可撤销。")) return;
    setMessages([]);
  };

  const visibleFiles = useChatMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return outputFiles;
    return outputFiles.filter((f) => f.name.toLowerCase().includes(q));
  }, [outputFiles, query]);

  return (
    <div className="chatpage">
      <button className="detail-back" onClick={onBack}>
        <ChatIcon name="back"/><span>返回 我的数字员工</span>
      </button>

      <div className="chatpage-grid">
        {/* ============== LEFT: conversation ============== */}
        <section className="chat-panel">
          <header className="chat-panel-head">
            <div className={"avatar-chip av-" + emp.avatarTone}>{emp.initial}</div>
            <div className="chat-panel-titles">
              <div className="chat-panel-name">
                {emp.name}
                <span className={"status-dot " + statusMap[emp.status].cls}>
                  <span className="dot"/>{statusMap[emp.status].label}
                </span>
              </div>
              <div className="chat-panel-sub">
                站内会话与外部 IM 独立上下文，历史记录按 <code>instance_id + user_id</code> 隔离。
              </div>
            </div>
            <div className="chat-panel-actions">
              <button className="action-ghost small"><ChatIcon name="im"/>去 IM</button>
              <button className="action-ghost small subtle" onClick={clearHistory}>
                <ChatIcon name="trash"/>清空历史
              </button>
            </div>
          </header>

          <div className="chat-panel-stream" ref={streamRef}>
            {messages.length === 0 && (
              <div className="chat-empty">
                <ChatIcon name="empty"/>
                <div className="chat-empty-title">还没有历史</div>
                <div className="chat-empty-sub">和 {emp.name} 开始一段新的对话吧。</div>
              </div>
            )}
            {messages.map((m, i) => {
              if (m.role === "system") {
                return <div key={i} className="msg system"><div className="msg-bubble">{m.text}</div></div>;
              }
              return (
                <div key={i} className={"msg " + m.role}>
                  <div className={"avatar-chip " + (m.role === "agent" ? "av-" + emp.avatarTone : "")}>
                    {m.role === "agent" ? emp.initial : "李"}
                  </div>
                  <div className="msg-col">
                    {m.files && m.files.length > 0 && (
                      <div className="msg-files">
                        {m.files.map((f) => (
                          <div className="msg-file" key={f.id}>
                            <FileTypeChip kind={f.kind}/>
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

          {/* composer */}
          <div className="chat-panel-composer">
            {attachments.length > 0 && (
              <div className="attach-row">
                {attachments.map((a) => (
                  <div className="attach-chip" key={a.id}>
                    <FileTypeChip kind={a.kind}/>
                    <span className="attach-name">{a.name}</span>
                    <span className="attach-size">{a.size}</span>
                    <button className="attach-remove" onClick={() => removeAttachment(a.id)}>
                      <ChatIcon name="x"/>
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
                placeholder="输入你的问题，Enter 发送，Shift+Enter 换行"
              />
              <div className="composer-foot">
                <div className="composer-tools">
                  <button className="tool-btn" title="上传附件" onClick={handleUploadClick}>
                    <ChatIcon name="clip"/>
                  </button>
                  <input
                    type="file" multiple
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    onChange={handleFiles}
                  />
                  <span className="composer-hint">支持上传 PDF / Word / Excel / 图片 等，单次 ≤ 20MB</span>
                </div>
                <button
                  className="send-btn"
                  disabled={!draft.trim() && attachments.length === 0}
                  onClick={send}
                >
                  发送 <ChatIcon name="send"/>
                </button>
              </div>
            </div>
            <div className="composer-foot-hint">
              默认保留最近 50 条站内消息，重新进入页面可继续上次对话。
            </div>
          </div>
        </section>

        {/* ============== RIGHT: produced files ============== */}
        <aside className="output-panel">
          <header className="output-head">
            <div className="output-titles">
              <h3>本会话产出</h3>
              <span className="output-count">{outputFiles.length} 个文件</span>
            </div>
            <div className="output-search">
              <ChatIcon name="search"/>
              <input
                type="text"
                placeholder="搜索产出文件"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </header>
          <div className="output-list">
            {visibleFiles.length === 0 ? (
              <div className="output-empty">
                <ChatIcon name="empty"/>
                <div className="output-empty-title">
                  {query ? "没有匹配的文件" : "暂未产出文件"}
                </div>
                <div className="output-empty-sub">
                  {query ? "换个关键词试试" : "对话过程中由数字员工生成的文件会出现在这里。"}
                </div>
              </div>
            ) : (
              visibleFiles.map((f) => (
                <div className={"output-card " + (f.fresh ? "fresh" : "")} key={f.id}>
                  <FileTypeChip kind={f.kind}/>
                  <div className="output-card-body">
                    <div className="output-card-name">{f.name}</div>
                    <div className="output-card-meta">
                      <span>{f.size}</span>
                      <span>·</span>
                      <span>{f.time}</span>
                    </div>
                    {f.from && <div className="output-card-from">来自：{f.from}</div>}
                  </div>
                  <button className="output-card-action" title="下载">
                    <ChatIcon name="download"/>
                  </button>
                </div>
              ))
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

window.ChatPage = ChatPage;
window.__CHAT_OUTPUTS__ = CHAT_OUTPUTS;
window.__FILE_TONE__ = FILE_TONE;
window.__inferKind__ = inferKind;
window.__formatSize__ = formatSize;
