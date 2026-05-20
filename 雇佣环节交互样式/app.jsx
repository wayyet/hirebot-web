// Main App: orchestrates script playback, state, and renders both panes.
const { useState: uS, useEffect: uE, useRef: uR, useMemo: uM, useCallback: uC } = React;

const STAGES = [
  { num: '①', key: 1, title: '上传资料', desc: '会话中描述业务场景、上传文件、提及资料需求时，每识别到一类资料即产生一条待办', emptyHint: '在左侧描述业务场景或资料需求，我会自动登记…' },
  { num: '②', key: 2, title: '补齐技能', desc: '基于①阶段已确认资料自动推断；用户在会话中补充技能需求时也可新增', emptyHint: '阶段①确认资料后，会自动推断所需技能…' },
  { num: '③', key: 3, title: '配置外部系统', desc: '会话中提及外部系统、接口或集成需求时触发，每个系统对应一条待办，通过表单收集信息', emptyHint: '提及订单查询、CRM、外部API等会触发…' },
];

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#5b6bff",
  "density": "regular",
  "showDemo": true
}/*EDITMODE-END*/;

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // Apply tweaks
  uE(() => {
    document.documentElement.style.setProperty('--accent', t.accent);
    const accentInk = adjustColor(t.accent, -18);
    const accentSoft = adjustColor(t.accent, 38, true);
    document.documentElement.style.setProperty('--accent-ink', accentInk);
    document.documentElement.style.setProperty('--accent-soft', accentSoft);
  }, [t.accent]);

  // ─── State ────────────────────────────────────────────────────────────────
  const [messages, setMessages] = uS([]);
  const [typing, setTyping] = uS(false);
  const [busy, setBusy] = uS(false);
  const [todosByStage, setTodos] = uS({ 1: [], 2: [], 3: [] });
  const [expanded, setExpanded] = uS({ 1: true, 2: true, 3: true, 4: true });
  const [stepIdx, setStepIdx] = uS(0);
  const [newIds, setNewIds] = uS(new Set());
  const [formTodo, setFormTodo] = uS(null);
  const [generated, setGenerated] = uS(false);

  // ─── Helpers ──────────────────────────────────────────────────────────────
  const pushMsg = (role, text) => setMessages(m => [...m, { role, text }]);

  const flashNew = (id) => {
    setNewIds(s => new Set([...s, id]));
    setTimeout(() => setNewIds(s => { const n = new Set(s); n.delete(id); return n; }), 700);
  };

  const runStep = uC(async (idx) => {
    const step = SCRIPT[idx];
    if (!step) return;
    setBusy(true);
    for (const a of step.actions) {
      if (a.type === 'msg') {
        if (a.role === 'assistant') {
          setTyping(true);
          await sleep(700);
          setTyping(false);
        } else {
          await sleep(150);
        }
        pushMsg(a.role, a.text);
      } else if (a.type === 'delay') {
        await sleep(a.ms || 300);
      } else if (a.type === 'addTodo') {
        await sleep(250);
        setTodos(prev => ({ ...prev, [a.stage]: [...prev[a.stage], a.todo] }));
        flashNew(a.todo.id);
      }
      await sleep(80);
    }
    setBusy(false);
    setStepIdx(idx + 1);
  }, []);

  // Auto-trigger steps that have waitFor conditions satisfied
  uE(() => {
    if (busy) return;
    const next = SCRIPT[stepIdx];
    if (!next || !next.auto) return;
    const prev = SCRIPT[stepIdx - 1];
    if (!prev || !prev.waitFor) return;
    const w = prev.waitFor.confirmed;
    if (w) {
      const done = (todosByStage[w.stage] || []).filter(t => t.confirmed).length;
      if (done >= w.count) runStep(stepIdx);
    }
  }, [todosByStage, stepIdx, busy, runStep]);

  // ─── Actions ──────────────────────────────────────────────────────────────
  const advance = () => {
    if (stepIdx >= SCRIPT.length) return;
    if (busy) return;
    // Check waitFor on previous step
    const prev = SCRIPT[stepIdx - 1];
    if (prev && prev.waitFor && !SCRIPT[stepIdx].auto) {
      // Still advance manually; demo bar is "skip"
    }
    runStep(stepIdx);
  };

  const resetDemo = () => {
    setMessages([]); setTyping(false); setBusy(false);
    setTodos({ 1: [], 2: [], 3: [] });
    setStepIdx(0); setGenerated(false); setNewIds(new Set());
    setTimeout(() => runStep(0), 100);
  };

  // Start demo on mount
  uE(() => { runStep(0); /* eslint-disable-next-line */ }, []);

  const confirmTodo = (id) => {
    setTodos(prev => {
      const next = { ...prev };
      for (const k of Object.keys(next)) {
        next[k] = next[k].map(t => t.id === id ? { ...t, confirmed: true } : t);
      }
      return next;
    });
  };
  const unconfirmTodo = (id) => {
    setTodos(prev => {
      const next = { ...prev };
      for (const k of Object.keys(next)) {
        next[k] = next[k].map(t => t.id === id ? { ...t, confirmed: false, payload: undefined } : t);
      }
      return next;
    });
  };

  const openForm = (todo) => setFormTodo(todo);
  const saveForm = (id, payload) => {
    setTodos(prev => {
      const next = { ...prev };
      for (const k of Object.keys(next)) {
        next[k] = next[k].map(t => t.id === id ? { ...t, confirmed: true, payload } : t);
      }
      return next;
    });
    setFormTodo(null);
  };

  // ─── User-typed messages (free input) ─────────────────────────────────────
  const handleSend = async (text) => {
    if (busy) return;
    pushMsg('user', text);
    setBusy(true);
    setTyping(true);
    await sleep(800);
    setTyping(false);
    // Smart routing — keyword matching for demo input outside the script
    const lower = text.toLowerCase();
    if (lower.match(/订单|物流|crm|api|系统|接口/) && todosByStage[3].length === 0) {
      pushMsg('assistant', '识别到需要对接外部系统。我已在阶段 ③ 创建配置项，请填写接入信息。');
      const t = { id: `sys-${Date.now()}`, icon: 'Server', title: '订单中心 OMS', desc: '查询订单详情与状态', tag: 'REST API', form: 'oms' };
      setTodos(prev => ({ ...prev, 3: [...prev[3], t] }));
      flashNew(t.id);
    } else if (lower.match(/技能|能力|功能/)) {
      pushMsg('assistant', '我已根据描述新增了一条技能待办，请在右侧审核。');
      const t = { id: `skl-${Date.now()}`, icon: 'Sparkle', title: '自定义技能', desc: '根据用户描述生成的技能项', tag: '函数调用' };
      setTodos(prev => ({ ...prev, 2: [...prev[2], t] }));
      flashNew(t.id);
    } else if (lower.match(/资料|文档|手册|文件|知识/)) {
      pushMsg('assistant', '我已新增一条资料待办，请上传或确认资料源。');
      const t = { id: `mat-${Date.now()}`, icon: 'Doc', title: '业务资料', desc: '根据用户补充识别的资料类型', tag: '待分类' };
      setTodos(prev => ({ ...prev, 1: [...prev[1], t] }));
      flashNew(t.id);
    } else {
      pushMsg('assistant', '收到。如果想继续推进，可以告诉我具体的资料、技能或外部系统需求；或点击底部"下一步"查看演示流程。');
    }
    setBusy(false);
  };

  // ─── Computed ─────────────────────────────────────────────────────────────
  const stats = [1,2,3].map(k => ({
    total: todosByStage[k].length,
    done: todosByStage[k].filter(x => x.confirmed).length,
  }));
  const canGenerate = stats.every(s => s.total > 0 && s.done === s.total);
  const totalDone = stats.reduce((a,b) => a + b.done, 0);
  const totalTodos = stats.reduce((a,b) => a + b.total, 0);
  const progress = totalTodos === 0 ? 0 : Math.round(totalDone / totalTodos * 100);

  // Suggestions in chat based on stage
  let suggestions = [];
  if (messages.length === 1) {
    suggestions = ['我想做一个售后客服 Agent', '搭建一个 HR 招聘助手', '内部知识库问答机器人'];
  } else if (stats[0].total > 0 && stats[0].done === 0) {
    // First materials posted but none confirmed
    suggestions = [];
  } else if (todosByStage[3].length === 0 && stats[1].total > 0) {
    suggestions = ['还需要查询订单状态', '需要对接企业微信发送通知'];
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="app">
      <div className="topbar">
        <div className="brand">
          <div className="logo">A</div>
          实例配置助手
          <span style={{color:'var(--ink-4)', fontWeight:400, marginLeft:8}}>· 售后客服 Agent</span>
        </div>
        <div className="meta">
          <span>进度 {totalDone}/{totalTodos}</span>
          <span className="pill"><span className="dot"></span>{generated ? '已生成' : (canGenerate ? '待生成' : '配置中')}</span>
        </div>
      </div>

      <div className="stage">
        <ChatPane
          messages={messages}
          typing={typing}
          onSend={handleSend}
          suggestions={suggestions}
          busy={busy}
        />

        <div className="workflow">
          <div className="wf-head">
            <div>
              <h2>工作流 · 4 阶段</h2>
              <div className="sub">前 3 个阶段累计 100% 确认后，可生成实例包</div>
            </div>
            <div className="wf-progress">
              <span>{progress}%</span>
              <div className="seg"><div className="fill" style={{width:`${progress}%`}}></div></div>
            </div>
          </div>

          <div className="wf-body">
            {STAGES.map((s, i) => {
              const stageTodos = todosByStage[s.key];
              const locked = i > 0 && stats.slice(0, i).every(x => x.total === 0) && stageTodos.length === 0;
              return (
                <StageCard
                  key={s.key}
                  stage={s}
                  todos={stageTodos}
                  expanded={expanded[s.key]}
                  onToggle={() => setExpanded({ ...expanded, [s.key]: !expanded[s.key] })}
                  locked={locked}
                  onConfirm={confirmTodo}
                  onUnconfirm={unconfirmTodo}
                  onOpenForm={openForm}
                  newIds={newIds}
                />
              );
            })}

            <FinalCard
              stats={stats}
              canGenerate={canGenerate}
              generated={generated}
              onGenerate={() => setGenerated(true)}
              expanded={expanded[4]}
              onToggle={() => setExpanded({ ...expanded, 4: !expanded[4] })}
            />
          </div>
        </div>
      </div>

      {formTodo && <FormModal todo={formTodo} onClose={() => setFormTodo(null)} onSave={saveForm} />}

      {t.showDemo && (
        <div className="demo-bar">
          <span className="lbl"><span className="dot"></span>演示脚本</span>
          <span style={{color:'rgba(255,255,255,.55)',fontSize:11}}>
            {stepIdx}/{SCRIPT.length}
          </span>
          <button onClick={advance} disabled={busy || stepIdx >= SCRIPT.length} className="primary">
            {stepIdx === 0 ? '开始演示' : stepIdx >= SCRIPT.length ? '已完成' : '下一步 →'}
          </button>
          <button onClick={resetDemo}><Icon.Reset className="icon-svg" style={{verticalAlign:-3}} /></button>
        </div>
      )}

      <TweaksPanel title="Tweaks">
        <TweakSection label="主题" />
        <TweakColor label="主色" value={t.accent}
          options={['#5b6bff','#7c5cff','#0ea5e9','#10b27c','#f97316','#e2554d']}
          onChange={(v)=>setTweak('accent', v)} />
        <TweakSection label="演示" />
        <TweakToggle label="显示演示控制条" value={t.showDemo}
          onChange={(v)=>setTweak('showDemo', v)} />
        <TweakButton label="重置演示" onClick={resetDemo} />
      </TweaksPanel>
    </div>
  );
}

// ─── Utilities ────────────────────────────────────────────────────────────────
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function adjustColor(hex, percent, alphaSoft) {
  if (!hex || hex[0] !== '#') return hex;
  const num = parseInt(hex.slice(1), 16);
  let r = (num >> 16) & 0xff, g = (num >> 8) & 0xff, b = num & 0xff;
  if (alphaSoft) {
    // mix with white
    const w = percent / 100;
    r = Math.round(r + (255 - r) * (1 - w));
    g = Math.round(g + (255 - g) * (1 - w));
    b = Math.round(b + (255 - b) * (1 - w));
  } else {
    const f = (percent < 0 ? 0 : 255);
    const p = Math.abs(percent) / 100;
    r = Math.round(r + (f - r) * p);
    g = Math.round(g + (f - g) * p);
    b = Math.round(b + (f - b) * p);
  }
  return '#' + [r,g,b].map(v => v.toString(16).padStart(2,'0')).join('');
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
