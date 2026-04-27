/* global window, React */
const { useState: _useStateF } = React;

// ===== Lark identity / onboarding page =====
function OnboardPage({ id, go, toast }) {
  const e = window.findEmployeeById(id) || window.DEPT_EMPLOYEES[1];
  const [name, setName] = _useStateF(e.name);
  const [desc, setDesc] = _useStateF(e.desc.slice(0, 60));
  const [phase, setPhase] = _useStateF(0); // 0 form, 1 progress, 2 done
  const [steps, setSteps] = _useStateF([
    { name: "bot 注册", done: false },
    { name: "身份写入", done: false },
    { name: "沙箱启动", done: false },
    { name: "状态切为 live", done: false }
  ]);

  function start() {
    if (!name.trim()) { toast("display_name 必填"); return; }
    setPhase(1);
    let i = 0;
    const t = setInterval(() => {
      setSteps(s => s.map((x, idx) => idx === i ? { ...x, done: true } : x));
      i++;
      if (i >= 4) { clearInterval(t); setTimeout(() => setPhase(2), 400); }
    }, 700);
  }

  return (
    <div className="page page-narrow">
      <window.Crumb label="返回详情" onClick={() => go(`employee/${e.id}`)} />
      <div className="page-header">
        <div>
          <h1 className="page-title">飞书身份配置与上岗</h1>
          <p className="page-sub">配置数字员工在飞书的对外身份并完成 bot 注册。修改对外身份不会触发重新评估。</p>
        </div>
      </div>

      <div className="split">
        <div className="card card-pad">
          <h3 className="section-h">飞书预览</h3>
          <div className="lark-preview">
            <div className="lark-bar">
              <window.Avatar initial={(name || "?").slice(0,1)} tint={e.tint} size="lg" />
              <div>
                <div className="name">{name || "未填写"}</div>
                <div className="desc">{desc || "请填写 description"}</div>
              </div>
            </div>
            <div className="spacer-12"/>
            <div className="muted" style={{fontSize:12}}>预览将在飞书一对一私聊窗口中以这个身份展示。</div>
          </div>

          <div className="spacer-16"/>
          <div className="callout info">
            该数字员工只在飞书一对一私聊中正式使用。群聊不会响应，对外发送以你本人身份登记。
          </div>
        </div>

        <div className="card card-pad">
          {phase === 0 && (
            <>
              <h3 className="section-h">对外身份</h3>
              <div className="form-row">
                <label>display_name <span className="muted">· 必填，同 owner 下唯一</span></label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className="form-row">
                <label>display_avatar</label>
                <div className="row" style={{gap:8}}>
                  {window.TINTS.map(t => (
                    <button key={t} className="avatar avatar-md" style={{padding:0}}
                            onClick={() => {}}>
                      <window.Avatar initial={(name || "?").slice(0,1)} tint={t} size="md" />
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-row">
                <label>display_description</label>
                <textarea value={desc} onChange={e => setDesc(e.target.value)} />
                <span className="hint">在飞书机器人卡片上展示，建议 60 字以内。</span>
              </div>
              <div className="row" style={{justifyContent:"flex-end", gap:8}}>
                <button className="btn btn-ghost" onClick={() => go(`employee/${e.id}`)}>取消</button>
                <button className="btn btn-primary" onClick={start}>注册并上岗 <window.Icon.arrow className="icn"/></button>
              </div>
            </>
          )}

          {phase === 1 && (
            <>
              <h3 className="section-h">上岗中…</h3>
              <div style={{display:"flex", flexDirection:"column", gap:14}}>
                {steps.map((s, i) => (
                  <div key={i} className="row between" style={{padding:"10px 14px", border:"1px solid var(--c-border-row)", borderRadius:12}}>
                    <span style={{fontSize:13}}>{s.name}</span>
                    {s.done
                      ? <span className="pill green dot">已完成</span>
                      : <span className="pill gray">{steps.findIndex(x => !x.done) === i ? "进行中" : "等待"}</span>}
                  </div>
                ))}
              </div>
            </>
          )}

          {phase === 2 && (
            <>
              <h3 className="section-h">🎉 上岗成功</h3>
              <div className="callout success">
                <span style={{fontSize:18}}>🛡️</span>
                <div>
                  <strong style={{color:"var(--c-near-black)"}}>{name}</strong> 已上岗。现在你可以去飞书一对一私聊使用。
                </div>
              </div>
              <div className="spacer-16"/>
              <div className="row" style={{justifyContent:"flex-end", gap:8}}>
                <button className="btn btn-ghost" onClick={() => go(`employee/${e.id}`)}>查看详情</button>
                <button className="btn btn-primary" onClick={() => { toast("跳转飞书…"); }}>
                  去飞书使用 <window.Icon.arrow className="icn"/>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ===== Clone wizard 三步 =====
function ClonePage({ id, go, toast }) {
  const src = window.findEmployeeById(id) || window.DEPT_EMPLOYEES[0];
  const [step, setStep] = _useStateF(0);
  const [name, setName] = _useStateF(`${src.name} · 我的`);
  const [desc, setDesc] = _useStateF("我的个人版本，记得我的工作偏好。");
  const [phaseSteps, setPhaseSteps] = _useStateF(0);

  function next() {
    if (step === 1) {
      if (!name.trim()) { toast("display_name 必填"); return; }
      setStep(2);
      let i = 0;
      const t = setInterval(() => {
        setPhaseSteps(p => p + 1);
        i++; if (i >= 3) clearInterval(t);
      }, 700);
      return;
    }
    setStep(step + 1);
  }

  return (
    <div className="page page-narrow">
      <window.Crumb label="返回部门数字员工" onClick={() => go("dept")} />
      <div className="page-header">
        <div>
          <h1 className="page-title">复制为我的分身 · <em>{src.name}</em></h1>
          <p className="page-sub">复制是极简流程，三步完成。不进入雇佣教练对话，不进入双阶段评估。</p>
        </div>
      </div>

      <div className="steps">
        {["确认复制", "配置个人对外身份", "绑定并上岗"].map((s, i) => (
          <React.Fragment key={s}>
            <div className={`step ${i < step ? "done" : i === step ? "active" : ""}`}>
              <span className="num">{i + 1}</span>
              <span>{s}</span>
            </div>
            {i < 2 && <span className="step-arrow">→</span>}
          </React.Fragment>
        ))}
      </div>

      <div className="card card-pad">
        {step === 0 && (
          <>
            <div className="row" style={{gap:16}}>
              <window.Avatar initial={src.initial} tint={src.tint} size="xl"/>
              <div style={{flex:1}}>
                <h3 style={{margin:0, fontSize:20, fontWeight:600}}>{src.name}</h3>
                <div className="muted" style={{fontSize:13, marginTop:4}}>母版来自 {(window.findTemplateById(src.template) || {}).name} 模板</div>
                <p style={{marginTop:10, color:"var(--c-body)", fontSize:14}}>{src.desc}</p>
              </div>
            </div>
            <div className="divider"/>
            <div className="callout info">
              <div>
                <strong style={{color:"var(--c-near-black)"}}>复制后是独立实例</strong> ——
                你的对话不会回流给部门版，他人也看不到你的会话明细。
              </div>
            </div>
            <div className="row" style={{justifyContent:"flex-end", gap:8, marginTop:16}}>
              <button className="btn btn-ghost" onClick={() => go("dept")}>取消</button>
              <button className="btn btn-primary" onClick={next}>开始复制 <window.Icon.arrow className="icn"/></button>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <h3 className="section-h">配置个人对外身份</h3>
            <div className="form-row">
              <label>display_name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="form-row">
              <label>display_description</label>
              <textarea value={desc} onChange={e => setDesc(e.target.value)} />
            </div>
            <div className="row" style={{justifyContent:"flex-end", gap:8}}>
              <button className="btn btn-ghost" onClick={() => setStep(0)}>上一步</button>
              <button className="btn btn-primary" onClick={next}>绑定并上岗 <window.Icon.arrow className="icn"/></button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h3 className="section-h">绑定并上岗</h3>
            <div style={{display:"flex", flexDirection:"column", gap:14}}>
              {["注册 bot", "启动运行时", "状态切为 live"].map((s, i) => (
                <div key={i} className="row between" style={{padding:"10px 14px", border:"1px solid var(--c-border-row)", borderRadius:12}}>
                  <span style={{fontSize:13}}>{s}</span>
                  {phaseSteps > i
                    ? <span className="pill green dot">已完成</span>
                    : phaseSteps === i
                      ? <span className="pill blue">进行中</span>
                      : <span className="pill gray">等待</span>}
                </div>
              ))}
            </div>
            {phaseSteps >= 3 && (
              <>
                <div className="spacer-16"/>
                <div className="callout success">
                  <span style={{fontSize:18}}>🎉</span>
                  <div><strong style={{color:"var(--c-near-black)"}}>{name}</strong> 已上岗，去飞书私聊就能用。</div>
                </div>
                <div className="row" style={{justifyContent:"flex-end", gap:8, marginTop:16}}>
                  <button className="btn btn-primary" onClick={() => { toast("已切换到我的数字员工"); go("my"); }}>
                    去我的数字员工 <window.Icon.arrow className="icn"/>
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ===== Private branch customization =====
function BranchPage({ id, go, toast }) {
  const src = window.findEmployeeById(id) || window.MY_EMPLOYEES[0];
  const [diff, setDiff] = _useStateF("我希望它在 offer 谈判时自动套用 P7 薪资 band，并避免主动提到福利细节。");
  const [stations, setStations] = _useStateF({ persona: false, knowledge: true, ability: true, external: false });

  function toggle(k) { setStations(s => ({ ...s, [k]: !s[k] })); }
  const picked = Object.entries(stations).filter(([,v]) => v);

  return (
    <div className="page page-narrow">
      <window.Crumb label="返回我的数字员工" onClick={() => go("my")} />
      <div className="page-header">
        <div>
          <h1 className="page-title">私人定制 · 基于 <em>{src.name}</em></h1>
          <p className="page-sub">在不破坏原分身的前提下完成个性化定制。失败可放弃，不影响原分身。</p>
        </div>
      </div>

      <div className="card card-pad">
        <h3 className="section-h">原分身信息</h3>
        <div className="row" style={{gap:14}}>
          <window.Avatar initial={src.initial} tint={src.tint} size="lg"/>
          <div style={{flex:1}}>
            <div style={{fontWeight:600}}>{src.name}</div>
            <div className="muted" style={{fontSize:12}}>最近活跃 {src.activeAt || src.updated} · 累计任务 <span className="tnum">{src.runs}</span></div>
          </div>
          <window.StatusPill status={src.status}/>
        </div>
      </div>

      <div className="spacer-16"/>
      <div className="card card-pad">
        <h3 className="section-h">差异目标 <span className="hint">先说清楚你想改什么</span></h3>
        <div className="form-row">
          <textarea value={diff} onChange={e => setDiff(e.target.value)} />
        </div>
      </div>

      <div className="spacer-16"/>
      <div className="card card-pad">
        <h3 className="section-h">选择要调整的工位 <span className="hint">未选工位继续沿用原分身</span></h3>
        <div className="grid grid-2">
          {[
            { k: "persona", t: "人设", d: "调整角色定位、语气与不可越界事项" },
            { k: "knowledge", t: "知识", d: "追加或替换私有资料" },
            { k: "ability", t: "能力", d: "新增能力或收紧边界" },
            { k: "external", t: "外部对接", d: "替换外部系统连接信息" }
          ].map(s => (
            <div key={s.k}
                 onClick={() => toggle(s.k)}
                 className="card emp-card"
                 style={{cursor:"pointer", padding:18, gap:6, borderColor: stations[s.k] ? "var(--c-near-black)" : "var(--c-border)"}}>
              <div className="row between">
                <div style={{fontWeight:600}}>{s.t}</div>
                {stations[s.k] && <span className="pill green dot">已选</span>}
              </div>
              <div className="muted" style={{fontSize:12.5}}>{s.d}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="spacer-16"/>
      <div className="card card-pad">
        <h3 className="section-h">继承说明</h3>
        <div className="callout info">
          只对你勾选的 {picked.length} 个工位做精简追问。其余继续沿用原分身。私有分支不能再创建二级分支。评估通过后将替换原 bot 的底层路由，不新增飞书联系人。
        </div>
      </div>

      <div className="spacer-24"/>
      <div className="row between">
        <button className="btn btn-danger-ghost" onClick={() => { toast("已放弃定制 · 原分身保持不变"); go("my"); }}>放弃定制</button>
        <button className="btn btn-primary" disabled={picked.length === 0}
                onClick={() => { toast("已生成实例配置 · 进入 AI 评估"); go(`eval-ai/${src.id}`); }}>
          生成实例并进入 AI 评估 <window.Icon.arrow className="icn"/>
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { OnboardPage, ClonePage, BranchPage });
