/* global window, React */
const { useState: _useStateE, useEffect: _useEffectE } = React;

// ===== AI Evaluation Page =====
function AIEvalPageLegacy({ id, go, toast }) {
  const e = window.findEmployeeById(id) || window.DEPT_EMPLOYEES[2];
  const [progress, setProgress] = _useStateE(e.evalProgress || 0);
  const [running, setRunning] = _useStateE(progress > 0 && progress < 100);

  _useEffectE(() => {
    if (!running) return;
    const t = setInterval(() => {
      setProgress(p => {
        const np = Math.min(100, p + 6);
        if (np >= 100) { setRunning(false); }
        return np;
      });
    }, 600);
    return () => clearInterval(t);
  }, [running]);

  const checks = [
    { name: "结构完整性", val: 100, ok: true },
    { name: "边界配置", val: 100, ok: true },
    { name: "资料完整度", val: 92, ok: true },
    { name: "对接校验", val: 88, ok: true }
  ];
  const cases = [
    { name: "JD 撰写 · 后端高级", score: 92, ok: true },
    { name: "简历筛选 · 算法岗", score: 88, ok: true },
    { name: "面试纪要整理", score: 76, ok: true },
    { name: "薪资 band 询问", score: 58, ok: false }
  ];

  const passed = progress >= 100;

  return (
    <div className="page">
      <window.Crumb label="返回详情" onClick={() => go(`employee/${e.id}`)} />
      <div className="page-header">
        <div>
          <h1 className="page-title">AI 评估 · <em>{e.name}</em></h1>
          <p className="page-sub">输入对象是六步雇佣全部确认后的完整实例配置。AI 评估通过才能进入人工评估。</p>
        </div>
        <div className="row">
          {!passed
            ? <button className="btn btn-primary" onClick={() => setRunning(true)} disabled={running}>{running ? "评估中…" : "继续评估"}</button>
            : <>
                <button className="btn btn-ghost" onClick={() => go(`review/${e.id}`)}>有问题 · 去 Review</button>
                <button className="btn btn-primary" onClick={() => { toast("AI 评估通过 · 进入人工评估"); go(`eval-human/${e.id}`); }}>
                  进入人工评估 <window.Icon.arrow className="icn"/>
                </button>
              </>}
        </div>
      </div>

      <div className="card card-pad">
        <div className="row between" style={{marginBottom:10}}>
          <strong>整体进度</strong>
          <span className="muted tnum">{progress}% · {running ? "进行中" : passed ? "已完成" : "暂停"}</span>
        </div>
        <div className="progress blue"><div style={{width: `${progress}%`}}/></div>
        <div className="row" style={{marginTop:14, gap:24, fontSize:13, color:"var(--c-body-soft)"}}>
          <span>📦 已收集 24 项标准</span>
          <span>🧪 测试用例 36 个</span>
          <span>⏱ 预计剩余 {running ? "00:36" : "—"}</span>
        </div>
        <div className="spacer-12"/>
        <div className="callout info">
          衔接检查已通过，当前评估基于完整实例配置继续执行。若雇佣阶段缺失本体测试用例，原型会在这里提示补充生成路径。
        </div>
      </div>

      <div className="spacer-24"/>

      <div className="split">
        <div className="card card-pad">
          <h3 className="section-h">标准检查</h3>
          {checks.map((c, i) => (
            <div key={i} style={{marginBottom:14}}>
              <div className="row between" style={{fontSize:13, marginBottom:6}}>
                <span>{c.name}</span><span className="tnum">{c.val}%</span>
              </div>
              <div className="progress green"><div style={{width: `${c.val}%`}}/></div>
            </div>
          ))}
        </div>
        <div className="card card-pad">
          <h3 className="section-h">测试用例 · 抽样</h3>
          {cases.map((c, i) => (
            <div key={i} className="row between" style={{padding:"10px 0", borderBottom:"1px solid var(--c-border-row)", fontSize:13}}>
              <span>{c.name}</span>
              <span className={`pill ${c.ok ? "green" : "orange"} dot`}>
                {c.ok ? `通过 · ${c.score}` : `偏低 · ${c.score}`}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="spacer-24"/>
      <div className="card card-pad">
        <h3 className="section-h">训练建议</h3>
        <ul style={{margin:0, paddingLeft:18, color:"var(--c-body)", lineHeight:1.8, fontSize:13.5}}>
          <li>「薪资 band 询问」得分偏低，建议在差距挖掘工位补充 P8/P9 薪资规则。</li>
          <li>面试纪要整理对长录音表现稳定，可在人工评估侧重 1 小时以上场景。</li>
          <li>外部系统连通性正常，重点观察 Moka 推送回流的时延。</li>
        </ul>
      </div>
    </div>
  );
}

const AI_EVAL_STEPS = [
  { id: "train", title: "培训" },
  { id: "assess", title: "评估" },
  { id: "intern", title: "实习" },
  { id: "live", title: "上岗" }
];

const AI_EVAL_LOGS = [
  { role: "planner", label: "规划器", text: "分析上传材料，构建训练契约与能力边界。" },
  { role: "planner", label: "规划器", text: "识别高频任务、边界场景和外部系统依赖。" },
  { role: "generator", label: "生成器", text: "生成基础问答、投诉处理和多轮协同训练样本。" },
  { role: "generator", label: "生成器", text: "补齐边缘样本，覆盖 FAQ 缺口与流程分支。" },
  { role: "evaluator", label: "评估员", text: "按训练契约复核样本质量，检测知识缺口。" },
  { role: "evaluator", label: "评估员", text: "已完成补齐迭代，进入模拟考试。" }
];

const AI_EVAL_CASES = [
  { name: "JD 撰写 · 高级算法工程师", score: 94, summary: "结构完整，边界提示明确。" },
  { name: "简历筛选 · 后端候选人", score: 92, summary: "排序逻辑稳定，理由充分。" },
  { name: "面试纪要整理", score: 89, summary: "多轮信息抽取准确。" },
  { name: "福利政策问答", score: 86, summary: "回答口径统一，引用规范。" },
  { name: "差旅报销边界", score: 90, summary: "异常场景处理稳定。" },
  { name: "候选人 offer 追问", score: 84, summary: "能识别需转人工的敏感场景。" },
  { name: "历史 FAQ 复用", score: 88, summary: "检索结果匹配度高。" },
  { name: "跨系统状态查询", score: 81, summary: "调用链完整，耗时略高。" }
];

const AI_EVAL_DIMENSIONS = [
  { name: "技能覆盖率", score: 94, threshold: 85 },
  { name: "回答准确性", score: 89, threshold: 85 },
  { name: "语义一致性", score: 91, threshold: 80 },
  { name: "边缘场景处理", score: 88, threshold: 75 }
];

const AI_EVAL_ROUNDS = [
  { round: 1, score: 48, note: "初始样本覆盖不足" },
  { round: 2, score: 66, note: "补齐流程规则与工具调用顺序" },
  { round: 3, score: 88, note: "完成定向强化，达到通过线" }
];

const AI_EVAL_SUGGESTIONS = [
  "重点继续补充薪资 band、offer 谈判等高敏感资料。",
  "将真实 FAQ 的更新周期接入训练回流，减少陈旧答案。",
  "人工评估阶段重点观察长对话稳定性与转人工时机。"
];

function aiEvalPhaseFromProgress(progress) {
  if (progress >= 100) return "report";
  if (progress >= 74) return "exam";
  if (progress > 0) return "training";
  return "materials";
}

function aiEvalStepIndex(phase) {
  return phase === "materials" || phase === "training" ? 0 : 1;
}

function aiEvalFormatSize(size) {
  if (size >= 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(size / 1024))} KB`;
}

function aiEvalMakeFile(name, size) {
  return {
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name,
    size,
    status: "已解析"
  };
}

function aiEvalGreeting(phase, count) {
  if (phase === "materials") {
    return "先把技能文档和本地切片补齐，我会把这次 AI 评估拆成训练、考试和报告三个阶段。";
  }
  if (phase === "training") {
    return "三个智能体正在自主协作中。你现在可以旁观训练日志，不需要手动介入。";
  }
  if (phase === "exam") {
    return `模拟考试已开始，当前会按 ${count} 个测试用例逐项验证能力边界。`;
  }
  return "训练和考试已经完成。请先查看报告，再决定进入人工评估还是回退 Review。";
}

function aiEvalReply(phase, text) {
  if (text.includes("资料") || text.includes("材料")) {
    return "优先补充 SOP、FAQ、历史案例和边界规则，训练质量会明显更稳定。";
  }
  if (text.includes("进度") || text.includes("多久")) {
    return phase === "training"
      ? "训练阶段正在按规划器 → 生成器 → 评估员顺序推进，很快会进入模拟考试。"
      : phase === "exam"
        ? "模拟考试正在逐条跑用例，结束后会自动汇总成评估报告。"
        : "当前已经到了报告阶段，可以直接查看结论。";
  }
  if (text.includes("人工") || text.includes("下一步")) {
    return "AI 评估通过后就能沿用现有流程进入人工评估，其他环节不会改动。";
  }
  return "我会继续按照当前阶段推进。如果你想确认某个风险点，可以直接问我材料、边界或下一步。";
}

function AIEvalPage({ id, go, toast }) {
  const e = window.findEmployeeById(id) || window.DEPT_EMPLOYEES[2];
  const baseProgress = Math.max(0, Math.min(100, Number(e.evalProgress) || 0));
  const initialPhase = aiEvalPhaseFromProgress(baseProgress);
  const initialDoneCount = initialPhase === "report"
    ? AI_EVAL_CASES.length
    : initialPhase === "exam"
      ? Math.max(1, Math.floor(((baseProgress - 74) / 26) * AI_EVAL_CASES.length))
      : 0;

  const skillInputRef = React.useRef(null);
  const sliceInputRef = React.useRef(null);
  const chatEndRef = React.useRef(null);
  const logsEndRef = React.useRef(null);

  const [phase, setPhase] = _useStateE(initialPhase);
  const [progress, setProgress] = _useStateE(baseProgress);
  const [skillFiles, setSkillFiles] = _useStateE(
    baseProgress > 0
      ? [
          aiEvalMakeFile("客服话术规范 V3.pdf", 512000),
          aiEvalMakeFile("退换货 SOP.docx", 164000)
        ]
      : []
  );
  const [sliceFiles, setSliceFiles] = _useStateE(
    baseProgress > 0
      ? [
          aiEvalMakeFile("历史对话样本.csv", 228000),
          aiEvalMakeFile("FAQ 知识切片.json", 86000)
        ]
      : []
  );
  const [logs, setLogs] = _useStateE(
    baseProgress > 0
      ? AI_EVAL_LOGS.slice(0, Math.max(2, Math.min(AI_EVAL_LOGS.length, Math.floor(baseProgress / 16))))
      : []
  );
  const [examDoneCount, setExamDoneCount] = _useStateE(initialDoneCount);
  const [chatMessages, setChatMessages] = _useStateE([]);
  const [chatInput, setChatInput] = _useStateE("");

  const examScore = examDoneCount
    ? Math.round(
        AI_EVAL_CASES.slice(0, examDoneCount).reduce((sum, item) => sum + item.score, 0) / examDoneCount
      )
    : 0;

  _useEffectE(() => {
    setChatMessages([
      { id: `bot_${phase}`, who: "bot", text: aiEvalGreeting(phase, AI_EVAL_CASES.length) }
    ]);
  }, [phase]);

  _useEffectE(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  _useEffectE(() => {
    if (logsEndRef.current) logsEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [logs, phase]);

  _useEffectE(() => {
    if (typeof window.updateEmployee === "function") {
      window.updateEmployee(e.id, { evalProgress: Math.round(progress) });
    }
  }, [e.id, progress]);

  _useEffectE(() => {
    if (phase !== "training" || progress >= 74) return;
    const timer = setInterval(() => {
      setLogs(prev => (prev.length < AI_EVAL_LOGS.length ? [...prev, AI_EVAL_LOGS[prev.length]] : prev));
      setProgress(prev => Math.min(74, prev + (prev < 50 ? 5 : 4)));
    }, 900);
    return () => clearInterval(timer);
  }, [phase, progress]);

  _useEffectE(() => {
    if (phase !== "training" || progress < 74) return;
    const timer = setTimeout(() => setPhase("exam"), 700);
    return () => clearTimeout(timer);
  }, [phase, progress]);

  _useEffectE(() => {
    if (phase !== "exam" || examDoneCount >= AI_EVAL_CASES.length) return;
    const timer = setTimeout(() => {
      const nextDoneCount = Math.min(AI_EVAL_CASES.length, examDoneCount + 1);
      setExamDoneCount(nextDoneCount);
      setProgress(74 + Math.round((nextDoneCount / AI_EVAL_CASES.length) * 26));
    }, 950);
    return () => clearTimeout(timer);
  }, [phase, examDoneCount]);

  _useEffectE(() => {
    if (phase !== "exam" || examDoneCount < AI_EVAL_CASES.length) return;
    const timer = setTimeout(() => {
      setProgress(100);
      setPhase("report");
    }, 700);
    return () => clearTimeout(timer);
  }, [phase, examDoneCount]);

  function addFiles(list, setter) {
    const files = Array.from(list || []).map(file => ({
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      name: file.name,
      size: file.size,
      status: "解析中"
    }));
    if (!files.length) return;
    setter(prev => [...prev, ...files]);
    files.forEach(file => {
      setTimeout(() => {
        setter(prev => prev.map(item => (item.id === file.id ? { ...item, status: "已解析" } : item)));
      }, 800);
    });
  }

  function removeFile(id, setter) {
    setter(prev => prev.filter(item => item.id !== id));
  }

  function startTraining() {
    if (!skillFiles.length && !sliceFiles.length) {
      toast("请先上传训练材料");
      return;
    }
    setLogs([]);
    setExamDoneCount(0);
    setProgress(Math.max(8, progress));
    setPhase("training");
  }

  function resetTraining() {
    setPhase("materials");
    setProgress(0);
    setLogs([]);
    setExamDoneCount(0);
    setSkillFiles([]);
    setSliceFiles([]);
    toast("已回到训练准备阶段");
  }

  function sendChat() {
    const text = chatInput.trim();
    if (!text) return;
    setChatMessages(prev => [...prev, { id: `user_${Date.now()}`, who: "user", text }]);
    setChatInput("");
    setTimeout(() => {
      setChatMessages(prev => [
        ...prev,
        { id: `bot_reply_${Date.now()}`, who: "bot", text: aiEvalReply(phase, text) }
      ]);
    }, 420);
  }

  function agentStatus(agent) {
    if (phase === "materials") return "waiting";
    if (phase === "training") {
      if (agent === "planner") return progress < 26 ? "running" : "done";
      if (agent === "generator") return progress < 26 ? "waiting" : progress < 54 ? "running" : "done";
      return progress < 54 ? "waiting" : progress < 74 ? "running" : "done";
    }
    return "done";
  }

  const remainingLabel = phase === "report"
    ? "已完成"
    : phase === "exam"
      ? "00:12"
      : phase === "training"
        ? "00:38"
        : "待开始";

  return (
    <div className="page">
      <window.Crumb label="返回详情" onClick={() => go(`employee/${e.id}`)} />

      <div className="page-header hero-header">
        <div>
          <span className="eyebrow">AI 评估训练</span>
          <h1 className="page-title">AI 评估 · <em>{e.name}</em></h1>
          <p className="page-sub">仅替换 AI 训练与评估体验。人工评估、Review 和发布仍沿用现有流程。</p>
        </div>
        <div className="row wrap">
          {phase === "report" ? (
            <>
              <button className="btn btn-ghost" onClick={() => go(`review/${e.id}`)}>有问题，去 Review</button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  toast("AI 评估通过 · 进入人工评估");
                  go(`eval-human/${e.id}`);
                }}
              >
                进入人工评估 <window.Icon.arrow className="icn" />
              </button>
            </>
          ) : (
            <button
              className="btn btn-primary"
              onClick={phase === "materials" ? startTraining : () => setPhase(phase)}
              disabled={phase === "exam"}
            >
              {phase === "materials" ? "开始训练" : phase === "exam" ? "评估中" : "继续训练"}
            </button>
          )}
        </div>
      </div>

      <div className="card card-pad">
        <window.StepsBar steps={AI_EVAL_STEPS} current={aiEvalStepIndex(phase)} />
        <div className="row wrap" style={{ marginTop: 14, gap: 12 }}>
          <span className="pill blue dot">当前阶段 · {phase === "materials" ? "上传材料" : phase === "training" ? "自主训练" : phase === "exam" ? "模拟考试" : "评估报告"}</span>
          <span className="pill gray">测试用例 {AI_EVAL_CASES.length} 条</span>
          <span className="pill gray">剩余时间 {remainingLabel}</span>
        </div>
      </div>

      <div className="spacer-24" />

      <div className="ai-eval-shell">
        <div className="coach ai-eval-coach">
          <div className="coach-head">
            <window.Icon.bot className="icn" />
            培训助手
          </div>
          <div className="coach-body">
            {chatMessages.map(msg => (
              <div key={msg.id} className={`bubble ${msg.who === "bot" ? "bot" : "me"}`}>
                {msg.text}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div className="coach-input">
            <input
              value={chatInput}
              onChange={evt => setChatInput(evt.target.value)}
              onKeyDown={evt => {
                if (evt.key === "Enter") {
                  evt.preventDefault();
                  sendChat();
                }
              }}
              placeholder="可以追问材料、进度或下一步..."
            />
            <button className="btn btn-primary btn-sm" onClick={sendChat} disabled={!chatInput.trim()}>
              发送
            </button>
          </div>
        </div>

        <div className="artifact ai-eval-artifact">
          {phase === "materials" && (
            <div className="artifact-section">
              <div className="artifact-title-row">
                <div>
                  <h4>上传培训材料</h4>
                  <div className="artifact-sub">把技能文档和历史样本补齐后，再开始这轮 AI 训练。</div>
                </div>
                <button className="btn btn-primary btn-sm" onClick={startTraining} disabled={!skillFiles.length && !sliceFiles.length}>
                  开始训练
                </button>
              </div>

              <input
                ref={skillInputRef}
                type="file"
                multiple
                style={{ display: "none" }}
                onChange={evt => {
                  addFiles(evt.target.files, setSkillFiles);
                  evt.target.value = "";
                }}
              />
              <input
                ref={sliceInputRef}
                type="file"
                multiple
                style={{ display: "none" }}
                onChange={evt => {
                  addFiles(evt.target.files, setSliceFiles);
                  evt.target.value = "";
                }}
              />

              <div className="ai-eval-upload-grid">
                <button className="ai-eval-upload-card" onClick={() => skillInputRef.current && skillInputRef.current.click()}>
                  <window.Icon.upload className="icn" />
                  <strong>上传技能文档</strong>
                  <span>SOP、应答规范、岗位边界</span>
                </button>
                <button className="ai-eval-upload-card" onClick={() => sliceInputRef.current && sliceInputRef.current.click()}>
                  <window.Icon.copy className="icn" />
                  <strong>上传本地切片</strong>
                  <span>FAQ、历史对话、业务案例</span>
                </button>
              </div>

              <div className="split">
                <div className="inline-panel">
                  <div className="inline-panel-title">技能文档</div>
                  <div className="ai-eval-file-list">
                    {skillFiles.length ? skillFiles.map(file => (
                      <div key={file.id} className="ai-eval-file-row">
                        <div>
                          <div className="ai-eval-file-name">{file.name}</div>
                          <div className="ai-eval-file-meta">{aiEvalFormatSize(file.size)} · {file.status}</div>
                        </div>
                        <button className="btn-link" onClick={() => removeFile(file.id, setSkillFiles)}>移除</button>
                      </div>
                    )) : <div className="muted">还没有上传技能文档</div>}
                  </div>
                </div>

                <div className="inline-panel">
                  <div className="inline-panel-title">本地切片</div>
                  <div className="ai-eval-file-list">
                    {sliceFiles.length ? sliceFiles.map(file => (
                      <div key={file.id} className="ai-eval-file-row">
                        <div>
                          <div className="ai-eval-file-name">{file.name}</div>
                          <div className="ai-eval-file-meta">{aiEvalFormatSize(file.size)} · {file.status}</div>
                        </div>
                        <button className="btn-link" onClick={() => removeFile(file.id, setSliceFiles)}>移除</button>
                      </div>
                    )) : <div className="muted">还没有上传本地切片</div>}
                  </div>
                </div>
              </div>

              <div className="callout info">
                本阶段只准备训练材料，不改动后续人工评估和发布流程。
              </div>
            </div>
          )}

          {phase === "training" && (
            <div className="artifact-section">
              <div className="artifact-title-row">
                <div>
                  <h4>多智能体自主训练</h4>
                  <div className="artifact-sub">规划器、生成器、评估员按契约接力协作，你只需要观察过程。</div>
                </div>
                <span className="pill blue dot">{progress}%</span>
              </div>

              <div className="progress blue"><div style={{ width: `${progress}%` }} /></div>

              <div className="ai-eval-agent-grid">
                {[
                  { key: "planner", title: "规划器", meta: "TrainingSpec" },
                  { key: "generator", title: "生成器", meta: "TrainingSamples" },
                  { key: "evaluator", title: "评估员", meta: "EvalReport" }
                ].map(agent => (
                  <div key={agent.key} className={`ai-eval-agent-card ${agentStatus(agent.key)}`}>
                    <div className="ai-eval-agent-head">
                      <strong>{agent.title}</strong>
                      <span>{agent.meta}</span>
                    </div>
                    <div className={`pill ${agentStatus(agent.key) === "done" ? "green" : agentStatus(agent.key) === "running" ? "blue" : "gray"} dot`}>
                      {agentStatus(agent.key) === "done" ? "已完成" : agentStatus(agent.key) === "running" ? "运行中" : "等待中"}
                    </div>
                  </div>
                ))}
              </div>

              <div className="ai-eval-terminal">
                {logs.map((item, index) => (
                  <div key={`${item.label}_${index}`} className="ai-eval-log">
                    <span className={`ai-eval-log-tag ${item.role}`}>{item.label}</span>
                    <span>{item.text}</span>
                  </div>
                ))}
                <div ref={logsEndRef} />
              </div>

              <div className="split">
                <div className="inline-panel">
                  <div className="inline-panel-title">阶段产物</div>
                  <div className="ai-eval-artifact-stack">
                    <div className={`ai-eval-mini-card ${progress >= 26 ? "ready" : ""}`}>TrainingSpec · 5 模块 / 120 迭代轮次</div>
                    <div className={`ai-eval-mini-card ${progress >= 54 ? "ready" : ""}`}>TrainingSamples · 104 条训练样本</div>
                    <div className={`ai-eval-mini-card ${progress >= 70 ? "ready" : ""}`}>EvalReport · 4 个质量维度</div>
                  </div>
                </div>
                <div className="inline-panel">
                  <div className="inline-panel-title">训练观察点</div>
                  <div className="ai-eval-note-list">
                    <div>已自动带入实例包、能力边界和上传材料。</div>
                    <div>当检测到边缘知识缺口时，会触发定向补齐迭代。</div>
                    <div>训练结束后自动切换到模拟考试，不需要跳页。</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {phase === "exam" && (
            <div className="artifact-section">
              <div className="artifact-title-row">
                <div>
                  <h4>模拟考试中</h4>
                  <div className="artifact-sub">按训练产物自动抽样测试，逐条验证能力是否稳定。</div>
                </div>
                <span className="pill blue dot">{progress}%</span>
              </div>

              <div className="progress blue"><div style={{ width: `${progress}%` }} /></div>

              <div className="callout info">
                当前平均分 <strong>{examScore || "--"}</strong>，通过线为 75 分。
              </div>

              <div className="ai-eval-case-list">
                {AI_EVAL_CASES.map((item, index) => {
                  const status = index < examDoneCount ? "done" : index === examDoneCount ? "running" : "pending";
                  return (
                    <div key={item.name} className="ai-eval-case-row">
                      <div>
                        <div className="ai-eval-file-name">{item.name}</div>
                        <div className="ai-eval-file-meta">{item.summary}</div>
                      </div>
                      <span className={`pill ${status === "done" ? "green" : status === "running" ? "blue" : "gray"} dot`}>
                        {status === "done" ? `${item.score} 分` : status === "running" ? "评估中" : "待执行"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {phase === "report" && (
            <div className="artifact-section">
              <div className="ai-eval-summary">
                <div className="ai-eval-score">{examScore}</div>
                <div>
                  <h4 style={{ marginBottom: 6 }}>AI 评估通过</h4>
                  <div className="artifact-sub" style={{ marginBottom: 12 }}>
                    训练与模拟考试均已完成，可以继续进入现有的人工评估流程。
                  </div>
                  <div className="row wrap">
                    <span className="pill green dot">综合得分 {examScore}</span>
                    <span className="pill gray">模拟用例 {AI_EVAL_CASES.length} 条</span>
                    <span className="pill gray">训练轮次 {AI_EVAL_ROUNDS.length} 轮</span>
                  </div>
                </div>
              </div>

              <div className="split">
                <div className="inline-panel">
                  <div className="inline-panel-title">训练轮次</div>
                  <div className="ai-eval-round-grid">
                    {AI_EVAL_ROUNDS.map(round => (
                      <div key={round.round} className={`ai-eval-round-card ${round.score >= 75 ? "pass" : ""}`}>
                        <strong>第 {round.round} 轮</strong>
                        <div className="ai-eval-round-score">{round.score}</div>
                        <span>{round.note}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="inline-panel">
                  <div className="inline-panel-title">评估维度</div>
                  <div className="ai-eval-dim-list">
                    {AI_EVAL_DIMENSIONS.map(item => (
                      <div key={item.name} className="ai-eval-dim-row">
                        <div className="row between" style={{ marginBottom: 6 }}>
                          <span>{item.name}</span>
                          <span className="tnum">{item.score} / {item.threshold}</span>
                        </div>
                        <div className="progress green"><div style={{ width: `${item.score}%` }} /></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="inline-panel">
                <div className="inline-panel-title">继续关注</div>
                <div className="ai-eval-note-list">
                  {AI_EVAL_SUGGESTIONS.map(item => <div key={item}>{item}</div>)}
                </div>
              </div>

              <div className="row between wrap" style={{ marginTop: 4 }}>
                <button className="btn btn-ghost" onClick={resetTraining}>补充材料后重练</button>
                <div className="row wrap">
                  <button className="btn btn-ghost" onClick={() => go(`review/${e.id}`)}>有问题，去 Review</button>
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      toast("AI 评估通过 · 进入人工评估");
                      go(`eval-human/${e.id}`);
                    }}
                  >
                    进入人工评估 <window.Icon.arrow className="icn" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ===== Human Evaluation Page =====
function HumanEvalPage({ id, go, toast }) {
  const e = window.findEmployeeById(id) || window.DEPT_EMPLOYEES[1];
  const [decisions, setDecisions] = _useStateE({ s1: null, s2: null, s3: null });
  const allDone = Object.values(decisions).every(v => v !== null);
  const allPass = Object.values(decisions).every(v => v === "pass");

  const scenes = [
    {
      key: "s1", title: "场景 1 · JD 撰写 · 高级算法工程师", weight: "高频",
      transcript: [
        { who: "user", text: "帮我写一份高级算法工程师 JD，重点是大模型 RAG 方向。" },
        { who: "bot", text: "好的。已结合本司职级 P7+ 与算法岗位标准，给你一份 JD 草稿，重点强调 RAG 工程经验、向量库与评估指标。需要我同时附上福利描述吗？" }
      ]
    },
    {
      key: "s2", title: "场景 2 · 简历筛选 · 后端候选人", weight: "高频",
      transcript: [
        { who: "user", text: "把这批 28 份简历按和后端 P6 岗位的契合度排序。" },
        { who: "bot", text: "已按企业架构能力、稳定性经验、协作沟通三个维度打分，前 8 位候选人输出在表格里。其中候选人 #14 的项目背景与岗位相关度最高。" }
      ]
    },
    {
      key: "s3", title: "场景 3 · 薪资范围咨询", weight: "边界",
      transcript: [
        { who: "user", text: "如果给候选人开 P8，薪资 band 大概是多少？" },
        { who: "bot", text: "我目前的薪资 band 资料只覆盖到 P7。建议你直接咨询 HRBP 或在差距挖掘里补充 P8 资料。" }
      ]
    }
  ];

  function decide(key, v) { setDecisions(d => ({ ...d, [key]: v })); }

  return (
    <div className="page">
      <window.Crumb label="返回详情" onClick={() => go(`employee/${e.id}`)} />
      <div className="page-header">
        <div>
          <h1 className="page-title">人工评估 · <em>{e.name}</em></h1>
          <p className="page-sub">人工评估的对象是数字员工，不是评估专家本身。每个场景都需要明确判定通过或不通过。</p>
        </div>
        <div className="row">
          <button className="btn btn-ghost" onClick={() => go(`review/${e.id}`)}>打回 Review</button>
          {!allDone
            ? <button className="btn btn-primary" disabled>请先完成每个场景判定</button>
            : allPass
              ? <button className="btn btn-primary" onClick={() => { toast("人工评估通过 · 进入发布确认"); go(`publish/${e.id}`); }}>通过并上岗 <window.Icon.arrow className="icn"/></button>
              : <button className="btn btn-primary" onClick={() => go(`review/${e.id}`)}>有不通过 · 进入 Review</button>}
        </div>
      </div>

      {scenes.map(sc => (
        <div key={sc.key} className="card card-pad" style={{marginBottom:16}}>
          <div className="row between" style={{marginBottom:12}}>
            <div>
              <div style={{fontWeight:600, fontSize:15}}>{sc.title}</div>
              <div className="muted" style={{fontSize:12, marginTop:2}}>权重：{sc.weight} · 任务来自雇佣阶段沉淀的测试用例</div>
            </div>
            <div className="row" style={{gap:6}}>
              <button className={`subtab ${decisions[sc.key] === "pass" ? "active" : ""}`}
                      onClick={() => decide(sc.key, "pass")}>✓ 通过</button>
              <button className={`subtab ${decisions[sc.key] === "fail" ? "active" : ""}`}
                      style={decisions[sc.key] === "fail" ? {background:"#b3263c", borderColor:"#b3263c"} : {}}
                      onClick={() => decide(sc.key, "fail")}>× 不通过</button>
            </div>
          </div>
          <div style={{display:"flex", flexDirection:"column", gap:8}}>
            {sc.transcript.map((m, i) => (
              <div key={i} className={`run-line ${m.who === "bot" ? "bot" : ""}`}>
                <window.Avatar initial={m.who === "user" ? "评" : e.initial} tint={m.who === "user" ? "gray" : e.tint} size="sm" />
                <div style={{flex:1}}>
                  <div style={{fontSize:11, color:"var(--c-body-soft)", marginBottom:2}}>{m.who === "user" ? "评估人" : e.name}</div>
                  <div style={{fontSize:13.5, color:"var(--c-near-black)"}}>{m.text}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="card card-pad">
        <h3 className="section-h">综合报告</h3>
        <div className="row" style={{gap:24}}>
          <div>
            <div className="muted" style={{fontSize:12}}>整体得分</div>
            <div style={{fontSize:32, fontWeight:600}} className="tnum">{allPass ? "88" : allDone ? "72" : "—"}</div>
          </div>
          <div style={{flex:1}}>
            <div className="muted" style={{fontSize:12, marginBottom:6}}>评估结论</div>
            <div style={{fontSize:14, lineHeight:1.6}}>
              {allDone
                ? (allPass ? "所有场景通过，可进入 IM 通道配置并上岗。" : "存在场景未通过，建议进入 Review 决定回退工位。强制上岗需要二次确认。")
                : "请先在上方完成每个场景的人工判定。"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== Review Page =====
function ReviewPage({ id, go, toast }) {
  const e = window.findEmployeeById(id) || window.DEPT_EMPLOYEES[5];
  const [pick, setPick] = _useStateE(e.failedReason || "差距挖掘");
  const isBranch = e.type === "private_branch";

  return (
    <div className="page page-narrow">
      <window.Crumb label="返回详情" onClick={() => go(`employee/${e.id}`)} />
      <div className="page-header">
        <div>
          <h1 className="page-title">Review · <em>{e.name}</em></h1>
          <p className="page-sub">评估失败后选择回退到哪个工位继续雇佣。已上传原料保留，生成结果将被重算。</p>
        </div>
      </div>

      <div className="card card-pad">
        <h3 className="section-h">失败摘要</h3>
        <div className="row" style={{gap:24}}>
          <div><div className="muted" style={{fontSize:12}}>整体得分</div><div className="tnum" style={{fontSize:28, fontWeight:600}}>62</div></div>
          <div><div className="muted" style={{fontSize:12}}>低分维度</div><div style={{fontSize:14}}>差距挖掘 · 边界条件</div></div>
          <div><div className="muted" style={{fontSize:12}}>连续失败</div><div className="tnum" style={{fontSize:14}}>1 次</div></div>
        </div>
        <div className="spacer-12"/>
        <div className="callout danger">
          差旅边界判定与企业差旅标准存在偏差：8 个测试用例中有 3 个对「招待标准」给出了过宽的解读。
        </div>
      </div>

      <div className="spacer-24"/>

      <div className="card card-pad">
        <h3 className="section-h">选择回退工位 <span className="hint">已确认的步骤将保留产物</span></h3>
        <div className="grid grid-3">
          {window.HIRE_STEPS.map(s => (
            <div key={s.id}
                 className="card emp-card"
                 style={{cursor:"pointer", padding:18, gap:8, borderColor: pick === s.title ? "var(--c-near-black)" : "var(--c-border)"}}
                 onClick={() => setPick(s.title)}>
              <div style={{fontWeight:600}}>{s.title}</div>
              <div className="muted" style={{fontSize:12}}>{s.hint}</div>
              {pick === s.title && <span className="pill green dot" style={{alignSelf:"flex-start"}}>已选择</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="spacer-24"/>
      <div className="row between">
        <div className="row" style={{gap:8}}>
          {isBranch && (
            <button className="btn btn-danger-ghost" onClick={() => { toast("已放弃私有分支，原分身继续可用"); go("my"); }}>
              放弃私有分支
            </button>
          )}
          <button className="btn btn-ghost" onClick={() => go(`employee/${e.id}`)}>取消</button>
        </div>
        <button className="btn btn-primary" onClick={() => { toast(`已回退到「${pick}」工位`); go(`hire/${e.id}`); }}>
          回到「{pick}」继续雇佣 <window.Icon.arrow className="icn"/>
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { AIEvalPage, HumanEvalPage, ReviewPage });
