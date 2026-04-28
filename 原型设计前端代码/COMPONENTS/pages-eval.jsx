/* global window, React */
const { useState: _useStateE, useEffect: _useEffectE } = React;

// ===== AI Evaluation Page =====
function AIEvalPage({ id, go, toast }) {
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
