/* global window, React */
const { useState: _useStateH, useMemo: _useMemoH } = React;

// ===== Hire Flow (六步部门版雇佣) =====
function HirePage({ id, tpl, go, toast }) {
  // Determine source: continuing existing hired emp, or starting new from template
  const existing = id ? window.findEmployeeById(id) : null;
  const template = tpl ? window.findTemplateById(tpl) : (existing ? window.findTemplateById(existing.template) : window.TEMPLATES[0]);
  const isBranchFlow = !!existing && existing.type === "private_branch";
  const backTo = isBranchFlow ? "my" : "dept";

  const [step, setStep] = _useStateH(existing ? Math.min(existing.hireProgress || 0, 5) : 0);
  const [confirmed, setConfirmed] = _useStateH(() => {
    const init = {};
    const upTo = existing ? existing.hireProgress || 0 : 0;
    for (let i = 0; i < upTo; i++) init[window.HIRE_STEPS[i].id] = true;
    return init;
  });
  const [chat, setChat] = _useStateH([
    { who: "bot", text: `你好，我是雇佣教练。我们将基于「${template.name}」模板，分六步完成部门版雇佣。每一步我都会汇总「已确认结果」让你检查。准备好我们就开始第 1 步。` }
  ]);
  const [draft, setDraft] = _useStateH("");

  const cur = window.HIRE_STEPS[step];

  const allDone = Object.keys(confirmed).length === window.HIRE_STEPS.length;

  function confirmStep() {
    setConfirmed({ ...confirmed, [cur.id]: true });
    setChat(c => [...c, { who: "me", text: "确认本步结果" }, { who: "bot", text: stepBotReply(step + 1) }]);
    if (existing) window.updateEmployee(existing.id, { hireProgress: Math.min(step + 1, window.HIRE_STEPS.length), updated: "刚刚" });
    if (step < 5) setStep(step + 1);
    toast("已确认 · 进入下一步");
  }

  function stepBotReply(nextIdx) {
    if (nextIdx >= window.HIRE_STEPS.length) return "六步全部确认完成。我会把已沉淀的中间产物汇总为完整实例配置，下一步进入 AI 评估。";
    const s = window.HIRE_STEPS[nextIdx];
    return `进入第 ${nextIdx + 1} 步「${s.title}」。${s.hint}。我先抛几个问题，你回我关键词或贴材料就行。`;
  }

  function send() {
    if (!draft.trim()) return;
    setChat(c => [...c, { who: "me", text: draft }, { who: "bot", text: "明白了，我会沉淀到右侧的「已确认结果」面板里。" }]);
    setDraft("");
  }

  return (
    <div className="page">
      <window.Crumb label={`返回${isBranchFlow ? "我的数字员工" : "部门数字员工"}`} onClick={() => go(backTo)} />

      <div className="page-header">
        <div>
          <h1 className="page-title">{isBranchFlow ? "私有分支定制" : "部门版雇佣"} · <em>{template.name}</em></h1>
          <p className="page-sub">
            {isBranchFlow
              ? "这里复用与部门版一致的六步流程，最终发布目标改为“我的数字员工”里的私人定制分支。"
              : "六步流程按步骤生成并确认中间产物。支持保存退出，从「部门数字员工 / 已雇佣」恢复。"}
          </p>
        </div>
        <div className="row">
          <button className="btn btn-ghost btn-sm" onClick={() => { toast("已保存草稿"); go(backTo); }}>保存退出</button>
          {allDone
            ? <button className="btn btn-primary btn-sm" onClick={() => go(`eval-ai/${existing ? existing.id : "de_lead_2024"}`)}>进入 AI 评估 →</button>
            : <button className="btn btn-primary btn-sm" onClick={confirmStep}>确认本步结果 →</button>}
        </div>
      </div>

      <window.StepsBar steps={window.HIRE_STEPS} current={step}/>

      <div className="split">
        {/* Coach */}
        <div className="coach">
          <div className="coach-head">
            <window.Avatar initial="教" tint="solidblue" size="sm" />
            <div>
              <div>雇佣教练</div>
              <div style={{fontSize:11, color:"var(--c-body-soft)", fontWeight:400}}>当前步骤：{cur.title}</div>
            </div>
          </div>
          <div className="coach-body">
            {chat.map((m, i) => (
              <div key={i} className={`bubble ${m.who}`}>
                {m.text}
                {i === chat.length - 1 && m.who === "bot" && step === 0 && !confirmed[cur.id] && (
                  <div className="quick">
                    <button onClick={() => setDraft("覆盖研发部门的招聘场景，主要任务是 JD 撰写与简历筛选")}>覆盖招聘场景</button>
                    <button onClick={() => setDraft("目标用户是 HRBP 与团队负责人")}>目标用户</button>
                    <button onClick={() => setDraft("适配度高，主要要补充本司面试评估表")}>适配度反馈</button>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="coach-input">
            <input value={draft} onChange={e => setDraft(e.target.value)}
                   placeholder="回复教练 · 也可以在右侧直接编辑已确认结果"
                   onKeyDown={e => e.key === "Enter" && send()} />
            <button className="btn btn-primary btn-sm" onClick={send}>发送</button>
          </div>
        </div>

        {/* Artifact */}
        <div className="artifact">
          <h4>当前步骤产物 · {cur.title}</h4>
          <ArtifactBlock stepId={cur.id} confirmed={!!confirmed[cur.id]} />

          <div className="spacer-16"/>
          <h4>历史已确认</h4>
          {window.HIRE_STEPS.map((s, i) => i < step && (
            <div key={s.id} className="block confirmed">
              <div className="row between" style={{marginBottom:6}}>
                <strong style={{fontSize:13}}>第 {i+1} 步 · {s.title}</strong>
                <span className="pill green dot">已确认</span>
              </div>
              <div style={{fontSize:12.5, color:"var(--c-body)"}}>{s.hint}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ArtifactBlock({ stepId, confirmed }) {
  if (stepId === "scene") return (
    <div className={`block ${confirmed ? "confirmed" : ""}`}>
      <dl className="kv">
        <dt>目标场景</dt><dd>研发部招聘 · 后端 / 算法</dd>
        <dt>目标用户</dt><dd>HRBP、团队负责人</dd>
        <dt>主要任务</dt><dd>JD 撰写、简历筛选、面试纪要</dd>
        <dt>模板适配</dt><dd>★★★★☆ 主要补充面试评估表</dd>
      </dl>
    </div>
  );
  if (stepId === "gap") return (
    <div className={`block ${confirmed ? "confirmed" : ""}`}>
      <div style={{fontWeight:600, marginBottom:8, fontSize:13}}>知识缺口</div>
      <div className="row wrap" style={{gap:6, marginBottom:10}}>
        <span className="pill orange">研发部职级体系</span>
        <span className="pill orange">面试评估表 v3</span>
      </div>
      <div style={{fontWeight:600, marginBottom:8, fontSize:13}}>能力缺口 / 外部系统</div>
      <div className="row wrap" style={{gap:6, marginBottom:10}}>
        <span className="pill blue">招聘 ATS · Moka</span>
        <span className="pill blue">飞书日历</span>
      </div>
      <div style={{fontWeight:600, marginBottom:8, fontSize:13}}>禁做边界</div>
      <div className="cap-list">
        <div className="cap cant"><span className="check">×</span>不直接对外发送 offer</div>
        <div className="cap cant"><span className="check">×</span>不替代背调</div>
      </div>
    </div>
  );
  if (stepId === "persona") return (
    <div className={`block ${confirmed ? "confirmed" : ""}`}>
      <dl className="kv">
        <dt>角色定位</dt><dd>研发部门内部 HR 助理</dd>
        <dt>语气风格</dt><dd>专业、克制、对候选人保持尊重</dd>
        <dt>越界事项</dt><dd>不评论候选人个人特征 / 不替代决策</dd>
      </dl>
    </div>
  );
  if (stepId === "knowledge") return (
    <div className={`block ${confirmed ? "confirmed" : ""}`}>
      <div style={{fontWeight:600, marginBottom:8, fontSize:13}}>已上传材料</div>
      <div className="row wrap" style={{gap:6, marginBottom:10}}>
        <span className="file-chip">📄 招聘流程.pdf <span className="ok">已解析</span></span>
        <span className="file-chip">📄 面试评估表 v3.docx <span className="ok">已解析</span></span>
        <span className="file-chip">📄 职级体系.xlsx <span className="muted">解析中…</span></span>
      </div>
      <div style={{fontWeight:600, margin:"6px 0 8px", fontSize:13}}>知识结构预览</div>
      <div style={{fontSize:12.5, color:"var(--c-body)", lineHeight:1.7}}>
        招聘流程 → 面试评估表 → 职级标准 → 常见 FAQ。检测到 1 处缺失：薪资 band 仅覆盖到 P7。
      </div>
    </div>
  );
  if (stepId === "ability") return (
    <div className={`block ${confirmed ? "confirmed" : ""}`}>
      <div className="cap-list">
        <div className="cap"><span className="check">✓</span>根据岗位要求生成 JD 草稿</div>
        <div className="cap"><span className="check">✓</span>解析简历并按招聘标准排序候选人</div>
        <div className="cap"><span className="check">✓</span>整理面试录音为结构化纪要</div>
        <div className="cap cant"><span className="check">×</span>不发送 offer</div>
      </div>
    </div>
  );
  if (stepId === "external") return (
    <div className={`block ${confirmed ? "confirmed" : ""}`}>
      <dl className="kv" style={{gridTemplateColumns:"110px 1fr"}}>
        <dt>Moka ATS</dt><dd><span className="pill green dot">连通正常</span></dd>
        <dt>飞书日历</dt><dd><span className="pill green dot">连通正常</span></dd>
        <dt>企业邮箱</dt><dd><span className="pill orange dot">凭证待补</span></dd>
      </dl>
    </div>
  );
  return null;
}

Object.assign(window, { HirePage });
