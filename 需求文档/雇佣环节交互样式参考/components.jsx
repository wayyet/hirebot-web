// Sub-components for the prototype.
const { useState, useEffect, useRef, useMemo } = React;

// ─── Chat pane ────────────────────────────────────────────────────────────────
function ChatPane({ messages, typing, onSend, suggestions, busy }) {
  const [draft, setDraft] = useState('');
  const bodyRef = useRef(null);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [messages.length, typing]);

  const submit = () => {
    if (!draft.trim()) return;
    onSend(draft.trim());
    setDraft('');
  };

  return (
    <div className="chat">
      <div className="chat-head">
        <div>
          <h2>对话 · 业务描述</h2>
          <div className="sub">用自然语言描述场景，助手会自动识别资料、技能与外部系统</div>
        </div>
        <span className="pill"><span className="dot"></span>Haiku 4.5</span>
      </div>

      <div className="chat-body" ref={bodyRef}>
        {messages.map((m, i) => (
          <div key={i} className={`msg ${m.role}`}>
            {m.role !== 'system' && (
              <div className="msg-meta">{m.role === 'user' ? '你' : '配置助手'}</div>
            )}
            <div className="msg-bubble">{m.text}</div>
          </div>
        ))}
        {typing && (
          <div className="msg assistant">
            <div className="msg-meta">配置助手</div>
            <div className="msg-bubble"><span className="typing"><span></span><span></span><span></span></span></div>
          </div>
        )}
      </div>

      <div className="chat-foot">
        {suggestions && suggestions.length > 0 && (
          <div className="chat-suggest">
            {suggestions.map((s, i) => (
              <button key={i} className="chip-btn" onClick={() => onSend(s)} disabled={busy}>{s}</button>
            ))}
          </div>
        )}
        <div className="composer">
          <textarea
            placeholder="例：我想做一个售后客服 Agent，需要查询订单和处理退换货咨询…"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); } }}
            rows={1}
          />
          <button className="send" onClick={submit} disabled={!draft.trim() || busy} title="发送 (Enter)">
            <Icon.Send className="icon-svg" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Todo row ─────────────────────────────────────────────────────────────────
function TodoRow({ todo, onConfirm, onUnconfirm, onOpenForm, onRemove, isNew }) {
  const IconCmp = Icon[todo.icon] || Icon.Doc;
  const confirmed = !!todo.confirmed;

  return (
    <div className={`todo ${confirmed ? 'confirmed' : ''} ${isNew ? 'new' : ''}`}>
      <div className="todo-icon">
        {confirmed ? <Icon.Check className="icon-svg" /> : <IconCmp className="icon-svg" />}
      </div>
      <div className="todo-main">
        <div className="todo-title">
          {todo.title}
          {todo.tag && <span className="todo-tag">{todo.tag}</span>}
        </div>
        <div className="todo-desc">{todo.desc}</div>
      </div>
      <div className="todo-actions">
        {confirmed ? (
          <>
            <span className="todo-confirmed-tag"><Icon.Check className="icon-svg" /> 已确认</span>
            <button className="todo-btn ghost" onClick={() => onUnconfirm(todo.id)} title="撤销">撤销</button>
          </>
        ) : todo.form ? (
          <button className="todo-btn primary" onClick={() => onOpenForm(todo)}>
            <Icon.Plug className="icon-svg" /> 填写配置
          </button>
        ) : (
          <>
            <button className="todo-btn" onClick={() => onOpenForm({ ...todo, _upload: true })}>
              <Icon.Upload className="icon-svg" /> 上传
            </button>
            <button className="todo-btn primary" onClick={() => onConfirm(todo.id)}>
              确认可用
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Stage card ───────────────────────────────────────────────────────────────
function StageCard({ stage, todos, expanded, onToggle, locked, onConfirm, onUnconfirm, onOpenForm, newIds }) {
  const total = todos.length;
  const done = todos.filter(t => t.confirmed).length;
  const allDone = total > 0 && done === total;
  const hasAny = total > 0;
  const someConfirmed = done > 0;

  let status, statusLbl;
  if (locked) { status = 'locked'; statusLbl = '等待前序'; }
  else if (allDone && hasAny) { status = 'complete'; statusLbl = `已完成 ${done}/${total}`; }
  else if (someConfirmed) { status = 'active'; statusLbl = `进行中 ${done}/${total}`; }
  else if (hasAny) { status = 'pending'; statusLbl = `待确认 ${total}`; }
  else { status = ''; statusLbl = '待生成'; }

  const cardClass = [
    'stage-card',
    allDone && hasAny ? 'complete' : '',
    !allDone && hasAny ? 'active' : '',
    locked && !hasAny ? 'locked' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={cardClass}>
      <div className="stage-head" onClick={onToggle} style={{cursor:'pointer'}}>
        <div className="stage-num">{stage.num}</div>
        <div className="stage-meta">
          <div className="stage-title">
            {stage.title}
            <span className={`stage-status ${status}`}>{statusLbl}</span>
          </div>
          <div className="stage-desc">{stage.desc}</div>
        </div>
        <button className="stage-toggle" onClick={(e)=>{e.stopPropagation();onToggle();}}>
          <Icon.Chevron className="icon-svg" style={{transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)', transition:'transform .15s'}} />
        </button>
      </div>
      {expanded && (
        <div className={`stage-body ${!hasAny ? 'empty' : ''}`}>
          {!hasAny && (
            <div className="stage-empty">
              {locked ? '等待前序阶段确认后自动生成…' : stage.emptyHint}
            </div>
          )}
          {todos.map(t => (
            <TodoRow
              key={t.id}
              todo={t}
              isNew={newIds.has(t.id)}
              onConfirm={onConfirm}
              onUnconfirm={onUnconfirm}
              onOpenForm={onOpenForm}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Final stage / generate button ────────────────────────────────────────────
function FinalCard({ stats, canGenerate, onGenerate, generated, expanded, onToggle }) {
  return (
    <div className={`stage-card ${generated ? 'complete' : (canGenerate ? 'active' : '')} ${!canGenerate && !generated ? 'locked' : ''}`}>
      <div className="stage-head" onClick={onToggle} style={{cursor:'pointer'}}>
        <div className="stage-num">④</div>
        <div className="stage-meta">
          <div className="stage-title">
            生成实例包
            <span className={`stage-status ${generated ? 'complete' : (canGenerate ? 'active' : '')}`}>
              {generated ? '已生成' : (canGenerate ? '可生成' : '等待前序')}
            </span>
          </div>
          <div className="stage-desc">前三阶段所有待办 100% 完成后，手动触发打包</div>
        </div>
        <button className="stage-toggle" onClick={(e)=>{e.stopPropagation();onToggle();}}>
          <Icon.Chevron className="icon-svg" style={{transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)', transition:'transform .15s'}} />
        </button>
      </div>
      {expanded && (
        <div className="stage-body" style={{paddingLeft:58}}>
          <div className="final-grid">
            <div className={`final-stat ${stats[0].done === stats[0].total && stats[0].total>0 ? 'ok' : 'warn'}`}>
              <div className="num">{stats[0].done}<span style={{color:'var(--ink-4)',fontSize:14,fontWeight:500}}> / {stats[0].total||0}</span></div>
              <div className="lbl">① 资料</div>
            </div>
            <div className={`final-stat ${stats[1].done === stats[1].total && stats[1].total>0 ? 'ok' : 'warn'}`}>
              <div className="num">{stats[1].done}<span style={{color:'var(--ink-4)',fontSize:14,fontWeight:500}}> / {stats[1].total||0}</span></div>
              <div className="lbl">② 技能</div>
            </div>
            <div className={`final-stat ${stats[2].done === stats[2].total && stats[2].total>0 ? 'ok' : 'warn'}`}>
              <div className="num">{stats[2].done}<span style={{color:'var(--ink-4)',fontSize:14,fontWeight:500}}> / {stats[2].total||0}</span></div>
              <div className="lbl">③ 外部系统</div>
            </div>
          </div>
          {generated ? (
            <>
              <button className="final-btn" style={{background:'var(--success)'}} disabled>
                <Icon.CheckCircle className="icon-svg-lg" /> 实例包已生成 · agent-customer-svc-v1.zip
              </button>
              <div className="final-hint">
                <Icon.Bolt className="icon-svg" style={{color:'var(--accent)'}} />
                下一步可进入沙箱测试，或部署到生产环境
              </div>
            </>
          ) : (
            <>
              <button className="final-btn" disabled={!canGenerate} onClick={onGenerate}>
                {canGenerate ? <><Icon.Package className="icon-svg-lg" /> 生成实例包</> : <><Icon.Lock className="icon-svg" /> 完成前序待办后可用</>}
              </button>
              <div className="final-hint">
                <Icon.Bolt className="icon-svg" />
                硬性校验：3 个阶段所有待办须 100% 确认
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Form modal (external system / upload) ────────────────────────────────────
function FormModal({ todo, onClose, onSave }) {
  const isUpload = todo._upload;
  const formDef = !isUpload && todo.form ? FORMS[todo.form] : null;

  const [values, setValues] = useState(() => {
    if (isUpload) return { file: '' };
    const init = {};
    if (formDef) formDef.fields.forEach(f => { init[f.id] = f.default || ''; });
    return init;
  });
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  if (isUpload) {
    return (
      <div className="modal-bg" onClick={onClose}>
        <div className="modal" onClick={(e)=>e.stopPropagation()}>
          <div className="modal-head">
            <div>
              <h3>上传 · {todo.title}</h3>
              <div className="sub">将文件拖入下方区域，或选择本地文件 / 知识库</div>
            </div>
            <button className="modal-x" onClick={onClose}><Icon.X className="icon-svg" /></button>
          </div>
          <div className="modal-body">
            <div style={{
              border:'2px dashed var(--line)', borderRadius:12, padding:'34px 16px', textAlign:'center',
              background:'var(--surface-2)', display:'flex', flexDirection:'column', alignItems:'center', gap:10
            }}>
              <Icon.Upload className="icon-svg-lg" style={{width:24,height:24,color:'var(--ink-3)'}} />
              <div style={{fontSize:13.5, fontWeight:500}}>拖拽文件到此处</div>
              <div style={{fontSize:11.5, color:'var(--ink-3)'}}>支持 PDF · DOCX · XLSX · MD · TXT，单文件 ≤ 50MB</div>
              <div style={{display:'flex',gap:8,marginTop:6}}>
                <button className="btn secondary" onClick={()=>setValues({file:'选择的文件.pdf · 4.2 MB'})}>选择本地文件</button>
                <button className="btn secondary">从知识库选择</button>
              </div>
              {values.file && (
                <div style={{marginTop:10, padding:'8px 12px', background:'var(--surface)', border:'1px solid var(--line)', borderRadius:8, fontSize:12, display:'flex',alignItems:'center',gap:8}}>
                  <Icon.Doc className="icon-svg" /> {values.file}
                </div>
              )}
            </div>
            <div style={{fontSize:11.5, color:'var(--ink-3)', display:'flex',alignItems:'center',gap:6}}>
              <Icon.Sparkle className="icon-svg" />
              上传后助手会自动解析并入库，约 30 秒
            </div>
          </div>
          <div className="modal-foot">
            <button className="btn secondary" onClick={onClose}>取消</button>
            <button className="btn primary" disabled={!values.file} onClick={()=>onSave(todo.id, values)}>确认入库</button>
          </div>
        </div>
      </div>
    );
  }

  if (!formDef) return null;

  const isValid = formDef.fields.filter(f => f.required).every(f => values[f.id] && String(values[f.id]).trim());

  const runTest = () => {
    setTesting(true);
    setTestResult(null);
    setTimeout(() => {
      setTesting(false);
      setTestResult({ ok: true, latency: 86 + Math.floor(Math.random()*40) });
    }, 1100);
  };

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={(e)=>e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <h3>{formDef.title}</h3>
            <div className="sub">{formDef.subtitle}</div>
          </div>
          <button className="modal-x" onClick={onClose}><Icon.X className="icon-svg" /></button>
        </div>
        <div className="modal-body">
          {(() => {
            const rows = [];
            const fields = formDef.fields;
            let i = 0;
            while (i < fields.length) {
              const f = fields[i];
              if (f.col === 'half' && fields[i+1] && fields[i+1].col === 'half') {
                rows.push(
                  <div className="field-row" key={f.id}>
                    <FieldEl f={f} value={values[f.id]} onChange={(v)=>setValues({...values,[f.id]:v})} />
                    <FieldEl f={fields[i+1]} value={values[fields[i+1].id]} onChange={(v)=>setValues({...values,[fields[i+1].id]:v})} />
                  </div>
                );
                i += 2;
              } else {
                rows.push(<FieldEl key={f.id} f={f} value={values[f.id]} onChange={(v)=>setValues({...values,[f.id]:v})} />);
                i += 1;
              }
            }
            return rows;
          })()}

          {testResult && (
            <div style={{
              padding:'10px 12px', borderRadius:10,
              background: testResult.ok ? 'var(--success-soft)' : '#fde7e5',
              color: testResult.ok ? 'var(--success)' : 'var(--danger)',
              border:`1px solid ${testResult.ok ? 'rgba(16,178,124,.2)' : 'rgba(226,85,77,.2)'}`,
              fontSize:12.5, display:'flex',alignItems:'center',gap:8
            }}>
              <Icon.CheckCircle className="icon-svg" />
              {testResult.ok ? `连通正常 · 响应 ${testResult.latency}ms · 鉴权通过` : '连通失败，请检查地址与鉴权'}
            </div>
          )}
        </div>
        <div className="modal-foot">
          <button className="btn secondary" onClick={runTest} disabled={!isValid || testing}>
            {testing ? '测试中…' : '测试连通'}
          </button>
          <div style={{flex:1}}></div>
          <button className="btn secondary" onClick={onClose}>取消</button>
          <button className="btn primary" disabled={!isValid} onClick={()=>onSave(todo.id, values)}>保存并确认</button>
        </div>
      </div>
    </div>
  );
}

function FieldEl({ f, value, onChange }) {
  return (
    <div className="field">
      <label className="field-label">
        {f.label}
        {f.required && <span className="req">*</span>}
      </label>
      {f.type === 'select' ? (
        <select value={value} onChange={(e)=>onChange(e.target.value)}>
          {f.options.map(o => <option key={o}>{o}</option>)}
        </select>
      ) : f.type === 'textarea' ? (
        <textarea rows={3} value={value} onChange={(e)=>onChange(e.target.value)} placeholder={f.placeholder} />
      ) : (
        <input
          type={f.type === 'password' ? 'password' : f.type === 'number' ? 'number' : 'text'}
          value={value}
          onChange={(e)=>onChange(e.target.value)}
          placeholder={f.placeholder}
          style={f.monospace ? {fontFamily:'JetBrains Mono, monospace', fontSize:12.5} : {}}
        />
      )}
      {f.hint && <div className="field-hint">{f.hint}</div>}
    </div>
  );
}

window.ChatPane = ChatPane;
window.TodoRow = TodoRow;
window.StageCard = StageCard;
window.FinalCard = FinalCard;
window.FormModal = FormModal;
