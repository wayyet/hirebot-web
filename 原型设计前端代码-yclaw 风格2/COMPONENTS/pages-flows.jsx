/* global window, React */
const { useState: _useStateF, useEffect: _useEffectF } = React;

const CHAT_STORE_KEY = "ncrew.chat.history.v1";

const IM_SCHEMAS = {
  lark: {
    title: "飞书",
    intro: "输入飞书应用凭据以将此数字员工绑定到飞书机器人。App ID 和 App Secret 为必填项。",
    methods: {
      websocket: {
        label: "WebSocket 长连接（推荐）",
        help: "通过长连接方式接收飞书事件，适合开箱即用接入。",
        steps: ["校验 App ID / App Secret", "建立 WebSocket 长连接", "注册实例绑定", "同步连接状态"],
        fields: [
          { key: "appId", label: "App ID", required: true, placeholder: "请输入飞书自建应用 app_id" },
          { key: "appSecret", label: "App Secret", required: true, placeholder: "请输入飞书自建应用 app_secret" }
        ]
      },
      callback: {
        label: "使用 URL 回调",
        help: "回调模式下需要额外提供 Encrypt Key 和可选的 Verification Token。",
        steps: ["校验回调凭据", "注册 Webhook URL", "验证 Encrypt Key", "同步连接状态"],
        fields: [
          { key: "appId", label: "App ID", required: true, placeholder: "请输入飞书自建应用 app_id" },
          { key: "appSecret", label: "App Secret", required: true, placeholder: "请输入飞书自建应用 app_secret" },
          { key: "encryptKey", label: "Encrypt Key", required: true, placeholder: "请输入 Encrypt Key" },
          { key: "verificationToken", label: "Verification Token", required: false, placeholder: "可选，未填写则按默认验签" }
        ],
        webhookPath: "feishu"
      }
    }
  },
  dingding: {
    title: "钉钉",
    intro: "输入钉钉机器人凭据以将此数字员工绑定到钉钉机器人。App ID 和 App Secret 为必填项。",
    methods: {
      websocket: {
        label: "WebSocket 长连接（推荐）",
        help: "长连接模式适合快速接入，不需要额外配置回调网关。",
        steps: ["校验 ClientID / Secret", "建立 WebSocket 长连接", "注册实例绑定", "同步连接状态"],
        fields: [
          { key: "appId", label: "App ID", required: true, placeholder: "请输入钉钉 ClientID（App Key）" },
          { key: "appSecret", label: "App Secret", required: true, placeholder: "请输入钉钉 App Secret" }
        ]
      },
      callback: {
        label: "使用 URL 回调",
        help: "回调模式支持补充 Token 与 AES Key，适合已有企业回调网关。",
        steps: ["校验回调凭据", "注册 Webhook URL", "验证 Encrypt Key / AES Key", "同步连接状态"],
        fields: [
          { key: "appId", label: "App ID", required: true, placeholder: "请输入钉钉 ClientID" },
          { key: "appSecret", label: "App Secret", required: true, placeholder: "请输入钉钉 App Secret" },
          { key: "encryptKey", label: "Encrypt Key", required: true, placeholder: "请输入消息加密密钥" },
          { key: "token", label: "Token", required: false, placeholder: "可选，签名校验 Token" },
          { key: "aesKey", label: "AES Key", required: false, placeholder: "可选，消息体 AES 解密密钥" }
        ],
        webhookPath: "dingtalk"
      }
    }
  },
  wecom: {
    title: "企微",
    intro: "选择连接方式并输入对应凭据，以将此数字员工绑定到企微 AIBot。",
    methods: {
      websocket: {
        label: "WebSocket 长连接（推荐）",
        help: "直接输入 AgentID 与 Secret 即可建立企微长连接。",
        steps: ["校验 AgentID / Secret", "建立 WebSocket 长连接", "注册实例绑定", "同步连接状态"],
        fields: [
          { key: "appId", label: "App ID", required: true, placeholder: "请输入企微 AgentID" },
          { key: "appSecret", label: "App Secret", required: true, placeholder: "请输入企微应用 Secret" }
        ]
      },
      callback: {
        label: "使用 URL 回调",
        help: "URL 回调模式只需要 Token 与 EncodingAESKey 完成验签。",
        steps: ["校验回调凭据", "注册 Webhook URL", "验证 Token / EncodingAESKey", "同步连接状态"],
        fields: [
          { key: "token", label: "Token", required: true, placeholder: "请输入回调 Token" },
          { key: "encodingAesKey", label: "EncodingAESKey", required: true, placeholder: "请输入 EncodingAESKey" }
        ],
        webhookPath: "wecom"
      }
    }
  }
};

function buildConnectSteps(channelId, methodId) {
  return IM_SCHEMAS[channelId].methods[methodId].steps.map(name => ({ name, done: false }));
}

function readChatStore() {
  if (window.__NCREW_CHAT_HISTORY__) return window.__NCREW_CHAT_HISTORY__;
  try {
    const raw = window.localStorage && window.localStorage.getItem(CHAT_STORE_KEY);
    window.__NCREW_CHAT_HISTORY__ = raw ? JSON.parse(raw) : {};
  } catch (err) {
    window.__NCREW_CHAT_HISTORY__ = {};
  }
  return window.__NCREW_CHAT_HISTORY__;
}

function writeChatStore(nextStore) {
  window.__NCREW_CHAT_HISTORY__ = nextStore;
  try {
    if (window.localStorage) window.localStorage.setItem(CHAT_STORE_KEY, JSON.stringify(nextStore));
  } catch (err) {}
}

function chatKey(employeeId, viewerName) {
  return `${employeeId}::${viewerName}`;
}

function createSeedHistory(employee, viewerName) {
  return [
    {
      who: "bot",
      text: `你好，我是 ${employee.name}。这里是 ${viewerName} 的站内对话视角，我们可以先从当前最重要的任务开始。`,
      at: "刚刚"
    }
  ];
}

function getChatHistory(employee, viewerName) {
  const store = readChatStore();
  const key = chatKey(employee.id, viewerName);
  return store[key] || createSeedHistory(employee, viewerName);
}

function saveChatHistory(employeeId, viewerName, messages) {
  const store = readChatStore();
  writeChatStore({ ...store, [chatKey(employeeId, viewerName)]: messages.slice(-50) });
}

function formatMessageTime() {
  try {
    return new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
  } catch (err) {
    return "现在";
  }
}

function buildBotReply(employee, prompt) {
  if (prompt.includes("JD") || prompt.includes("岗位")) {
    return `可以，我会基于 ${employee.name} 当前沉淀的规则先给你一个结构化岗位草稿，再把必须补充的边界条件列成 Todo。`;
  }
  if (prompt.includes("周报") || prompt.includes("汇总")) {
    return `收到，我会先整理成三段：核心结论、关键变化、后续建议，这样你复制到周报里会更快。`;
  }
  if (prompt.includes("候选人") || prompt.includes("简历")) {
    return "我会先按岗位契合度、关键经验和潜在风险分层，再把需要人工复核的几份单独标出来。";
  }
  return "我已经收到这条任务，会先按你当前分身的规则组织答案；如果涉及边界不清的地方，我会先提示你确认。";
}

function IMConfigPage({ id, go, toast }) {
  const employee = window.findEmployeeById(id);
  const [jumpPicker, setJumpPicker] = _useStateF(false);
  const [bindings, setBindings] = _useStateF(employee ? window.getEmployeeBindings(employee.id) : {});
  const [channelId, setChannelId] = _useStateF(employee ? (window.getConnectedChannels(employee.id)[0] || "lark") : "lark");
  const [methodId, setMethodId] = _useStateF(() => {
    if (!employee) return "websocket";
    const existing = window.getBinding(employee.id, window.getConnectedChannels(employee.id)[0] || "lark");
    return existing ? existing.methodId : "websocket";
  });
  const [form, setForm] = _useStateF(() => {
    if (!employee) return {};
    const existing = window.getBinding(employee.id, window.getConnectedChannels(employee.id)[0] || "lark");
    return existing ? { ...existing.form } : {};
  });
  const [phase, setPhase] = _useStateF(0);
  const [steps, setSteps] = _useStateF(buildConnectSteps(channelId, methodId));

  if (!employee) return null;

  if (employee.type === "department") {
    return (
      <div className="page page-narrow">
        <window.Crumb label="返回详情" onClick={() => go(`employee/${employee.id}`)} />
        <div className="empty">
          <div className="ic">🔁</div>
          <h4>部门员工不配置 IM</h4>
          <p>IM 接入属于个人分身层面的可选动作。先复制一个分身给自己，再到 IM 配置页完成飞书 / 钉钉 / 企微绑定。</p>
        </div>
      </div>
    );
  }

  const schema = IM_SCHEMAS[channelId];
  const method = schema.methods[methodId];
  const currentBinding = bindings[channelId];
  const currentStatus = currentBinding ? (currentBinding.status || "connected") : "unconfigured";
  const connectedCount = window.getConnectedChannels(employee.id).length;
  const webhookUrl = method.webhookPath ? `https://{platform}/im/${method.webhookPath}/webhook/${employee.id}` : "";

  function restoreFromBinding(binding) {
    setMethodId(binding ? binding.methodId : "websocket");
    setForm(binding ? { ...binding.form } : {});
    setPhase(0);
    setSteps(buildConnectSteps(channelId, binding ? binding.methodId : "websocket"));
  }

  function handleSwitchChannel(nextChannelId) {
    if (phase === 1 || nextChannelId === channelId) return;
    const nextBinding = bindings[nextChannelId];
    const nextMethod = nextBinding ? nextBinding.methodId : "websocket";
    setChannelId(nextChannelId);
    setMethodId(nextMethod);
    setForm(nextBinding ? { ...nextBinding.form } : {});
    setPhase(0);
    setSteps(buildConnectSteps(nextChannelId, nextMethod));
  }

  function handleSwitchMethod(nextMethodId) {
    if (phase === 1 || nextMethodId === methodId) return;
    setMethodId(nextMethodId);
    setForm({});
    setPhase(0);
    setSteps(buildConnectSteps(channelId, nextMethodId));
  }

  function handleFieldChange(key, value) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  function removeCurrentBinding() {
    const next = window.removeEmployeeBinding(employee.id, channelId);
    setBindings(next);
    setForm({});
    setPhase(0);
    setSteps(buildConnectSteps(channelId, "websocket"));
    setMethodId("websocket");
    toast(`${schema.title} 绑定已解除`);
  }

  function startConnect() {
    const missing = method.fields.find(field => field.required && !(form[field.key] || "").trim());
    if (missing) {
      toast(`${missing.label} 必填`);
      return;
    }

    const nextSteps = buildConnectSteps(channelId, methodId);
    setPhase(1);
    setSteps(nextSteps);

    let pointer = 0;
    const timer = setInterval(() => {
      setSteps(prev => prev.map((item, idx) => (idx === pointer ? { ...item, done: true } : item)));
      pointer += 1;
      if (pointer >= nextSteps.length) {
        clearInterval(timer);
        setTimeout(() => {
          window.saveEmployeeBinding(employee.id, channelId, {
            channelId,
            methodId,
            form: { ...form },
            status: "connected",
            connectedAt: window.formatNow()
          });
          const nextBindings = window.getEmployeeBindings(employee.id);
          setBindings(nextBindings);
          setPhase(2);
          toast(`${schema.title} 已连接`);
        }, 350);
      }
    }, 500);
  }

  return (
    <div className="page">
      <window.Crumb label="返回详情" onClick={() => go(`employee/${employee.id}`)} />

      <div className="page-header hero-header">
        <div>
          <span className="eyebrow">多平台 IM 接入</span>
          <h1 className="page-title">IM 配置 · <em>{employee.name}</em></h1>
          <p className="page-sub">每个平台独立配置，支持 WebSocket 长连接和 URL 回调两种方式。上岗后 IM 接入是可选步骤，不阻塞站内对话使用。</p>
        </div>
      </div>

      <div className="split">
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="card card-pad">
            <h3 className="section-h">平台选择</h3>
            <div className="channel-tabbar">
              {Object.keys(IM_SCHEMAS).map(key => {
                const status = bindings[key] ? (bindings[key].status || "connected") : "unconfigured";
                return (
                  <button key={key} className={`channel-tab ${channelId === key ? "active" : ""}`} onClick={() => handleSwitchChannel(key)}>
                    <span className={`jump-chip-mark ${window.IM_CHANNEL_META[key].accent}`}>{window.IM_CHANNEL_META[key].short}</span>
                    <span>{window.IM_CHANNEL_META[key].name}</span>
                    <span className={`pill ${status === "connected" ? "green" : status === "error" ? "pink" : "gray"} dot`}>{status === "connected" ? "已连接" : status === "error" ? "异常" : "未配置"}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="card card-pad">
            <h3 className="section-h">当前状态</h3>
            <div className="status-panel">
              <div className="row between" style={{ alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{schema.title}</div>
                  <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>{schema.intro}</div>
                </div>
                <span className={`pill ${currentStatus === "connected" ? "green" : currentStatus === "error" ? "pink" : "gray"} dot`}>
                  {currentStatus === "connected" ? "已连接" : currentStatus === "error" ? "配置异常" : "未配置"}
                </span>
              </div>
              <div className="spacer-16" />
              <dl className="mini-kv">
                <dt>绑定对象</dt><dd>{employee.name}</dd>
                <dt>连接方式</dt><dd>{currentBinding ? (currentBinding.methodId === "callback" ? "URL 回调" : "WebSocket 长连接") : "尚未选择"}</dd>
                <dt>最近连接</dt><dd>{currentBinding ? currentBinding.connectedAt : "—"}</dd>
                <dt>已连接平台</dt><dd><span className="tnum">{connectedCount}</span> 个</dd>
              </dl>
            </div>

            <div className="spacer-16" />
            <div className="callout info">
              已连接平台之间互不影响。重新注册只会更新当前平台，不会覆盖其他平台的凭据。
            </div>
          </div>
        </div>

        <div className="card card-pad">
          {phase !== 1 && (
            <>
              <h3 className="section-h">接入模式</h3>
              <div className="subtabs">
                {Object.entries(schema.methods).map(([key, item]) => (
                  <button key={key} className={`subtab ${methodId === key ? "active" : ""}`} onClick={() => handleSwitchMethod(key)}>
                    {item.label}
                  </button>
                ))}
              </div>
              <div className="callout info">{method.help}</div>

              <div className="spacer-16" />
              <h3 className="section-h">凭证表单</h3>
              <div className="field-grid">
                {method.fields.map(field => (
                  <div key={field.key} className={`form-row ${method.fields.length % 2 === 1 && method.fields.indexOf(field) === method.fields.length - 1 ? "field-span-2" : ""}`}>
                    <label>{field.label} <span className="muted">· {field.required ? "必填" : "可选"}</span></label>
                    <input type="text" value={form[field.key] || ""} placeholder={field.placeholder} onChange={evt => handleFieldChange(field.key, evt.target.value)} />
                  </div>
                ))}
              </div>

              {webhookUrl && (
                <>
                  <div className="spacer-12" />
                  <div className="inline-panel">
                    <div className="inline-panel-title">Webhook URL</div>
                    <div className="file-chip" style={{ width: "100%", justifyContent: "space-between" }}>
                      <span>{webhookUrl}</span>
                      <span className="ok">一键复制</span>
                    </div>
                  </div>
                </>
              )}

              <div className="spacer-16" />
              <div className="row between wrap">
                <div className="row wrap" style={{ gap: 8 }}>
                  {currentBinding && <button className="btn btn-ghost btn-sm" onClick={() => setJumpPicker(true)}>去 IM</button>}
                  {currentBinding && <button className="btn btn-danger-ghost btn-sm" onClick={removeCurrentBinding}>解除绑定</button>}
                </div>
                <div className="row wrap" style={{ gap: 8 }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => go(`employee/${employee.id}`)}>取消</button>
                  <button className="btn btn-primary btn-sm" onClick={startConnect}>
                    {currentBinding ? "保存并重连" : "注册并连接"} <window.Icon.arrow className="icn" />
                  </button>
                </div>
              </div>
            </>
          )}

          {phase === 1 && (
            <>
              <h3 className="section-h">连接中…</h3>
              <div className="status-panel">
                <div className="row between" style={{ alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{schema.title} · {method.label}</div>
                    <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>正在建立连接，请保持当前配置不变。</div>
                  </div>
                  <span className="pill blue">连接中</span>
                </div>
              </div>
              <div className="spacer-16" />
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {steps.map((item, idx) => (
                  <div key={`${item.name}-${idx}`} className="flow-step">
                    <span>{item.name}</span>
                    {item.done ? <span className="pill green dot">已完成</span> : <span className="pill gray">进行中</span>}
                  </div>
                ))}
              </div>
            </>
          )}

          {phase === 2 && (
            <>
              <h3 className="section-h">连接成功</h3>
              <div className="callout success">
                <span style={{ fontSize: 18 }}>🛡️</span>
                <div>当前实例已成功绑定到 {schema.title}，后续可以直接从卡片、详情页或站内对话页顶部“去 IM”。</div>
              </div>
              <div className="spacer-16" />
              <div className="row between wrap">
                <button className="btn btn-ghost btn-sm" onClick={() => { restoreFromBinding(window.getBinding(employee.id, channelId)); setBindings(window.getEmployeeBindings(employee.id)); }}>查看已连接配置</button>
                <div className="row wrap" style={{ gap: 8 }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => setJumpPicker(true)}>去 IM</button>
                  <button className="btn btn-primary btn-sm" onClick={() => go(`chat/${employee.id}`)}>开始对话 <window.Icon.arrow className="icn" /></button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <window.IMPickerModal open={jumpPicker} employee={employee} onClose={() => setJumpPicker(false)} onConfig={() => { setJumpPicker(false); }} />
    </div>
  );
}

function PublishPage({ id, role, go, toast }) {
  const employee = window.findEmployeeById(id);
  const [phase, setPhase] = _useStateF(employee && employee.status === "live" ? 2 : 0);
  const [doneCount, setDoneCount] = _useStateF(employee && employee.status === "live" ? 3 : 0);
  if (!employee) return null;

  const isDepartment = employee.type === "department";
  const viewer = window.getViewer(role);
  const steps = isDepartment
    ? ["发布到部门员工列表", "启动运行时", "状态切为 live"]
    : ["确认上岗身份", "启动运行时", "状态切为 live"];

  function start() {
    setPhase(1);
    let pointer = 0;
    const timer = setInterval(() => {
      pointer += 1;
      setDoneCount(pointer);
      if (pointer >= steps.length) {
        clearInterval(timer);
        window.updateEmployee(employee.id, { status: "live", updated: "刚刚", activeAt: "刚刚", owner: employee.owner || viewer.name });
        setTimeout(() => {
          setPhase(2);
          toast(isDepartment ? "部门员工已发布" : "分身已上岗");
        }, 250);
      }
    }, 550);
  }

  return (
    <div className="page page-narrow">
      <window.Crumb label="返回详情" onClick={() => go(`employee/${employee.id}`)} />

      <div className="page-header hero-header">
        <div>
          <span className="eyebrow">{isDepartment ? "发布确认页" : "个人上岗确认页"}</span>
          <h1 className="page-title">{isDepartment ? "发布到部门员工列表" : "确认分身上岗"}</h1>
          <p className="page-sub">
            {isDepartment
              ? "部门员工发布后会出现在“部门数字员工”列表中，成员可复制后在站内会话或 IM 中使用。"
              : "个人分身上岗后平台会话立即可用，IM 配置改为可选动作。"}
          </p>
        </div>
      </div>

      <div className="card card-pad">
        <div className="row" style={{ gap: 16, alignItems: "center" }}>
          <window.Avatar initial={employee.initial} tint={employee.tint} size="xl" />
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: 0, fontSize: 22, fontWeight: 600 }}>{employee.name}</h3>
            <div className="muted" style={{ marginTop: 6, fontSize: 13 }}>{employee.desc}</div>
          </div>
          <window.TypePill type={employee.type} />
        </div>

        <div className="divider" />

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {steps.map((item, idx) => (
            <div key={item} className="flow-step">
              <span>{item}</span>
              {doneCount > idx
                ? <span className="pill green dot">已完成</span>
                : phase === 1 && doneCount === idx
                  ? <span className="pill blue">进行中</span>
                  : <span className="pill gray">等待</span>}
            </div>
          ))}
        </div>

        {phase === 0 && (
          <>
            <div className="spacer-16" />
            <div className="callout info">
              {isDepartment
                ? "发布动作不会展开任何 IM 配置。成员之后复制分身时再各自决定是否接入飞书 / 钉钉 / 企微。"
                : "上岗后你会先获得站内对话入口，IM 配置保留为完成后的可选引导。"}
            </div>
            <div className="spacer-16" />
            <div className="row" style={{ justifyContent: "flex-end", gap: 8 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => go(`employee/${employee.id}`)}>取消</button>
              <button className="btn btn-primary btn-sm" onClick={start}>{isDepartment ? "发布到部门列表" : "确认上岗"} <window.Icon.arrow className="icn" /></button>
            </div>
          </>
        )}

        {phase === 2 && (
          <>
            <div className="spacer-16" />
            <div className="callout success">
              <span style={{ fontSize: 18 }}>🎉</span>
              <div>
                {isDepartment
                  ? "新员工已发布到部门列表。下一步建议你先复制一个自己的分身，体验真实使用路径。"
                  : "你的分身已上岗，站内对话已经就绪。你可以立即开聊，或之后再补配 IM。"}
              </div>
            </div>
            <div className="spacer-16" />
            <div className="row between wrap">
              {isDepartment
                ? <button className="btn btn-ghost btn-sm" onClick={() => go("dept")}>稍后再说</button>
                : <button className="btn btn-ghost btn-sm" onClick={() => go(`im/${employee.id}`)}>配置 IM</button>}
              {isDepartment
                ? <button className="btn btn-primary btn-sm" onClick={() => go(`clone/${employee.id}`)}>立即创建我的分身 <window.Icon.arrow className="icn" /></button>
                : <button className="btn btn-primary btn-sm" onClick={() => go(`chat/${employee.id}`)}>立即开始对话 <window.Icon.arrow className="icn" /></button>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ClonePage({ id, role, go, toast }) {
  const source = window.findEmployeeById(id) || window.DEPT_EMPLOYEES[0];
  const viewer = window.getViewer(role);
  const [step, setStep] = _useStateF(0);
  const [name, setName] = _useStateF(`${source.name} · ${viewer.short}工`);
  const [initial, setInitial] = _useStateF(viewer.short);
  const [desc, setDesc] = _useStateF("我的个人版本，记得我的工作偏好和常用输出格式。");

  function submit() {
    if (!name.trim()) {
      toast("display_name 必填");
      return;
    }

    const mine = window.getMyEmployeesForRole(role);
    const unique = window.uniqueName(name, mine);
    const created = window.addMyEmployee({
      id: window.generateId("pc"),
      type: "personal_clone",
      name: unique,
      initial: (initial || viewer.short).slice(0, 2),
      tint: source.tint,
      parent: source.id,
      parentName: source.name,
      template: source.template,
      status: "hired",
      desc,
      owner: viewer.name,
      updated: "刚刚",
      tags: ["我的分身"],
      runs: 0
    });

    toast("分身草稿已创建，进入上岗确认");
    go(`publish/${created.id}`);
  }

  return (
    <div className="page page-narrow">
      <window.Crumb label="返回部门数字员工" onClick={() => go("dept")} />

      <div className="page-header hero-header">
        <div>
          <span className="eyebrow">两步复制向导</span>
          <h1 className="page-title">复制为我的分身 · <em>{source.name}</em></h1>
          <p className="page-sub">复制流程只保留必要字段，不进入雇佣教练，也不进入双阶段评估。完成后直接进入上岗确认。</p>
        </div>
      </div>

      <div className="steps">
        {["确认复制", "配置个人信息并上岗"].map((item, idx) => (
          <React.Fragment key={item}>
            <div className={`step ${idx < step ? "done" : idx === step ? "active" : ""}`}>
              <span className="num">{idx + 1}</span>
              <span>{item}</span>
            </div>
            {idx < 1 && <span className="step-arrow">→</span>}
          </React.Fragment>
        ))}
      </div>

      <div className="card card-pad">
        {step === 0 && (
          <>
            <div className="row" style={{ gap: 16 }}>
              <window.Avatar initial={source.initial} tint={source.tint} size="xl" />
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0, fontSize: 22, fontWeight: 600 }}>{source.name}</h3>
                <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>母版来自 {(window.findTemplateById(source.template) || {}).name} 模板</div>
                <p style={{ marginTop: 12, color: "var(--c-body)" }}>{source.desc}</p>
              </div>
            </div>
            <div className="divider" />
            <div className="callout info">
              复制后会生成一个与你部门母版相互独立的个人实例。它直接继承部门员工的评估结果，不需要重新走 AI / 人工评估。
            </div>
            <div className="row" style={{ justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => go("dept")}>取消</button>
              <button className="btn btn-primary btn-sm" onClick={() => setStep(1)}>下一步 <window.Icon.arrow className="icn" /></button>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <h3 className="section-h">配置个人信息</h3>
            <div className="field-grid">
              <div className="form-row">
                <label>display_name</label>
                <input type="text" value={name} onChange={evt => setName(evt.target.value)} />
              </div>
              <div className="form-row">
                <label>display_avatar</label>
                <input type="text" value={initial} onChange={evt => setInitial(evt.target.value)} placeholder="可选，默认沿用你的简称" />
              </div>
              <div className="form-row field-span-2">
                <label>display_description</label>
                <textarea value={desc} onChange={evt => setDesc(evt.target.value)} />
              </div>
            </div>
            <div className="callout success">
              上岗完成后平台会话立即可用；IM 配置会放到完成后的引导里，不在本向导内展开。
            </div>
            <div className="row" style={{ justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setStep(0)}>上一步</button>
              <button className="btn btn-primary btn-sm" onClick={submit}>创建并去上岗确认 <window.Icon.arrow className="icn" /></button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function QuickClonePage({ id, go, toast }) {
  const source = window.findEmployeeById(id) || window.DEPT_EMPLOYEES[0];
  const [name, setName] = _useStateF(`${source.name} · 新分工版`);
  const [initial, setInitial] = _useStateF(source.initial);
  const [desc, setDesc] = _useStateF(`${source.desc} 新员工继承原员工评估结果，发布后直接可用。`);
  const [phase, setPhase] = _useStateF(0);
  const [created, setCreated] = _useStateF(null);
  const currentLive = window.DEPT_EMPLOYEES.filter(item => item.status === "live");

  function createNow() {
    if (!name.trim()) {
      toast("display_name 必填");
      return;
    }
    if (currentLive.some(item => item.name === name.trim())) {
      toast("部门 live 员工中已存在同名，请换一个名称");
      return;
    }

    setPhase(1);
    setTimeout(() => {
      const next = window.addDepartmentEmployee({
        id: window.generateId("de"),
        type: "department",
        name: name.trim(),
        initial: (initial || source.initial).slice(0, 2),
        tint: source.tint,
        template: source.template,
        status: "live",
        desc,
        owner: "李部门长",
        dept: "研发部",
        updated: "刚刚",
        tags: ["快捷复制"],
        cloned: 0,
        runs: 0,
        activeAt: "刚刚",
        clonedFrom: source.id
      });
      setCreated(next);
      setPhase(2);
      toast("新部门员工已上岗");
    }, 1200);
  }

  return (
    <div className="page page-narrow">
      <window.Crumb label="返回部门数字员工" onClick={() => go("dept")} />

      <div className="page-header hero-header">
        <div>
          <span className="eyebrow">部门长快捷复制</span>
          <h1 className="page-title">基于 <em>{source.name}</em> 一键复制新的部门员工</h1>
          <p className="page-sub">快捷复制只允许来源于 `live` 的部门员工。新实例继承评估结果，不需要重新走评估，创建后直接上岗。</p>
        </div>
      </div>

      <div className="card card-pad">
        {phase !== 2 && (
          <>
            <div className="row" style={{ gap: 16 }}>
              <window.Avatar initial={source.initial} tint={source.tint} size="xl" />
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0, fontSize: 22, fontWeight: 600 }}>{source.name}</h3>
                <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>源员工 · 已上岗 · 继承评估结果</div>
                <p style={{ marginTop: 12, color: "var(--c-body)" }}>{source.desc}</p>
              </div>
            </div>

            <div className="divider" />

            <div className="field-grid">
              <div className="form-row">
                <label>display_name</label>
                <input type="text" value={name} onChange={evt => setName(evt.target.value)} />
              </div>
              <div className="form-row">
                <label>display_avatar</label>
                <input type="text" value={initial} onChange={evt => setInitial(evt.target.value)} />
              </div>
              <div className="form-row field-span-2">
                <label>display_description</label>
                <textarea value={desc} onChange={evt => setDesc(evt.target.value)} />
              </div>
            </div>

            <div className="callout info">
              创建后两个部门员工相互独立，后续修改任意一个都不会影响另一个。
            </div>

            <div className="spacer-16" />

            {phase === 1 && (
              <div className="flow-step-list">
                <div className="flow-step"><span>复制源实例配置</span><span className="pill green dot">已完成</span></div>
                <div className="flow-step"><span>创建新的部门员工</span><span className="pill blue">进行中</span></div>
                <div className="flow-step"><span>状态切为 live</span><span className="pill gray">等待</span></div>
              </div>
            )}

            {phase === 0 && (
              <div className="row" style={{ justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => go("dept")}>取消</button>
                <button className="btn btn-primary btn-sm" onClick={createNow}>创建并发布 <window.Icon.arrow className="icn" /></button>
              </div>
            )}
          </>
        )}

        {phase === 2 && created && (
          <>
            <div className="callout success">
              <span style={{ fontSize: 18 }}>🎉</span>
              <div>新部门员工 <strong style={{ color: "var(--c-near-black)" }}>{created.name}</strong> 已上岗。</div>
            </div>
            <div className="spacer-16" />
            <div className="row between wrap">
              <button className="btn btn-ghost btn-sm" onClick={() => go("dept")}>稍后再说</button>
              <button className="btn btn-primary btn-sm" onClick={() => go(`clone/${created.id}`)}>立即复制一个分身来体验 <window.Icon.arrow className="icn" /></button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function BranchPage({ id, role, go, toast }) {
  const source = window.findEmployeeById(id);
  const viewer = window.getViewer(role);
  const [name, setName] = _useStateF(source ? `${source.name} · 私人定制版` : "");
  const [diff, setDiff] = _useStateF("我希望它在保持原有能力的基础上，更懂我的工作节奏和输出格式。");
  const [stations, setStations] = _useStateF({ persona: true, knowledge: true, ability: true, external: false });

  if (!source) return null;

  if (source.type === "private_branch") {
    return (
      <div className="page page-narrow">
        <window.Crumb label="返回我的数字员工" onClick={() => go("my")} />
        <div className="empty">
          <div className="ic">⛔</div>
          <h4>私有分支不能再创建二级分支</h4>
          <p>你可以继续雇佣这个私有分支，或回到原分身重新发起新的定制。</p>
        </div>
      </div>
    );
  }

  function toggle(key) {
    setStations(prev => ({ ...prev, [key]: !prev[key] }));
  }

  function createDraft() {
    const picked = Object.keys(stations).filter(key => stations[key]);
    if (!name.trim()) {
      toast("私有分支名称必填");
      return;
    }
    if (!picked.length) {
      toast("至少选择一个要调整的工位");
      return;
    }

    const created = window.addMyEmployee({
      id: window.generateId("pb"),
      type: "private_branch",
      name: name.trim(),
      initial: name.trim().slice(0, 2),
      tint: source.tint,
      parent: source.id,
      parentName: source.name,
      template: source.template,
      status: "hired",
      desc: diff,
      owner: viewer.name,
      updated: "刚刚",
      tags: ["私人定制"],
      branchStations: picked,
      hireProgress: 0
    });

    toast("已创建私有分支草稿，进入六步定制流程");
    go(`hire/${created.id}`);
  }

  return (
    <div className="page page-narrow">
      <window.Crumb label="返回我的数字员工" onClick={() => go("my")} />

      <div className="page-header hero-header">
        <div>
          <span className="eyebrow">私有分支定制</span>
          <h1 className="page-title">基于 <em>{source.name}</em> 创建仅自己可见的分支</h1>
          <p className="page-sub">入口页只负责说明差异目标和定制范围；真正的定制过程复用六步雇佣页。失败时可以放弃，原分身继续可用。</p>
        </div>
      </div>

      <div className="card card-pad">
        <h3 className="section-h">原分身信息</h3>
        <div className="row" style={{ gap: 14 }}>
          <window.Avatar initial={source.initial} tint={source.tint} size="lg" />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600 }}>{source.name}</div>
            <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>最近活跃 {source.activeAt || source.updated} · 累计任务 <span className="tnum">{source.runs || 0}</span></div>
          </div>
          <window.StatusPill status={source.status} />
        </div>

        <div className="divider" />

        <div className="form-row">
          <label>私有分支名称</label>
          <input type="text" value={name} onChange={evt => setName(evt.target.value)} />
        </div>

        <div className="form-row">
          <label>差异目标</label>
          <textarea value={diff} onChange={evt => setDiff(evt.target.value)} />
        </div>

        <div className="divider" />

        <h3 className="section-h">选择要调整的工位</h3>
        <div className="grid grid-2">
          {[
            { key: "persona", title: "人设生成", desc: "调整角色定位、语气与不可越界事项" },
            { key: "knowledge", title: "知识生成", desc: "替换或追加你的私有资料" },
            { key: "ability", title: "能力生成", desc: "新增能力或收紧边界" },
            { key: "external", title: "外部对接", desc: "替换外部系统连接配置" }
          ].map(item => (
            <div key={item.key} className="card emp-card" style={{ padding: 18, gap: 8, borderColor: stations[item.key] ? "var(--c-near-black)" : "var(--c-border)" }} onClick={() => toggle(item.key)}>
              <div className="row between">
                <div style={{ fontWeight: 600 }}>{item.title}</div>
                {stations[item.key] && <span className="pill green dot">已选</span>}
              </div>
              <div className="muted" style={{ fontSize: 12.5 }}>{item.desc}</div>
            </div>
          ))}
        </div>

        <div className="spacer-16" />

        <div className="callout info">
          接下来会进入与部门版雇佣一致的六步流程。不同点只在于起点换成你的分身，最终发布目标换成“我的数字员工”中的私有分支。
        </div>

        <div className="row between wrap" style={{ marginTop: 16 }}>
          <button className="btn btn-danger-ghost btn-sm" onClick={() => { toast("已取消本次定制，原分身保持不变"); go("my"); }}>放弃定制</button>
          <button className="btn btn-primary btn-sm" onClick={createDraft}>进入六步定制 <window.Icon.arrow className="icn" /></button>
        </div>
      </div>
    </div>
  );
}

function ChatPage({ id, role, go, toast }) {
  const employee = window.findEmployeeById(id);
  const viewer = window.getViewer(role);
  const [messages, setMessages] = _useStateF(employee ? getChatHistory(employee, viewer.name) : []);
  const [draft, setDraft] = _useStateF("");
  const [typing, setTyping] = _useStateF(false);
  const [jumpPicker, setJumpPicker] = _useStateF(false);
  if (!employee) return null;

  const isOwner = employee.owner === viewer.name;
  const canChat = employee.status === "live" && isOwner;

  _useEffectF(() => {
    if (employee) saveChatHistory(employee.id, viewer.name, messages);
  }, [employee && employee.id, viewer.name, messages]);

  function send() {
    if (!draft.trim() || !canChat || typing) return;
    const text = draft.trim();
    const next = [...messages, { who: "me", text, at: formatMessageTime() }];
    setMessages(next);
    setDraft("");
    setTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, { who: "bot", text: buildBotReply(employee, text), at: formatMessageTime() }]);
      setTyping(false);
    }, 700);
  }

  function clearHistory() {
    if (!window.confirm("确认清空当前站内对话历史？这不会影响外部 IM 中的聊天记录。")) return;
    const seed = createSeedHistory(employee, viewer.name);
    setMessages(seed);
    toast("站内对话历史已清空");
  }

  return (
    <div className="page">
      <window.Crumb label="返回我的数字员工" onClick={() => go("my")} />

      <div className="card card-pad chat-shell">
        <div className="chat-head">
          <div className="row" style={{ gap: 14 }}>
            <window.Avatar initial={employee.initial} tint={employee.tint} size="lg" />
            <div>
              <div className="row wrap" style={{ gap: 10 }}>
                <h2 style={{ margin: 0, fontSize: 24, fontWeight: 600 }}>{employee.name}</h2>
                <window.StatusPill status={employee.status} />
              </div>
              <div className="muted" style={{ fontSize: 13, marginTop: 6 }}>站内会话与外部 IM 独立上下文，历史记录按 `instance_id + user_id` 隔离。</div>
            </div>
          </div>

          <div className="row wrap" style={{ gap: 8 }}>
            {window.getConnectedChannels(employee.id).length > 0
              ? <button className="btn btn-ghost btn-sm" onClick={() => setJumpPicker(true)}>去 IM</button>
              : <button className="btn btn-ghost btn-sm" onClick={() => go(`im/${employee.id}`)}>接入 IM</button>}
            <button className="btn btn-ghost btn-sm" onClick={clearHistory}>清空历史</button>
          </div>
        </div>

        {!canChat ? (
          <div className="empty" style={{ marginTop: 16 }}>
            <div className="ic">💬</div>
            <h4>该实例当前不可进入站内对话</h4>
            <p>{employee.status !== "live" ? "员工尚未上岗，先完成发布确认。" : "只有实例 owner 才能看到并继续这段站内会话。"}</p>
          </div>
        ) : (
          <>
            <div className="chat-history">
              {messages.map((item, idx) => (
                <div key={`${item.at}-${idx}`} className={`chat-message ${item.who === "me" ? "me" : "bot"}`}>
                  <div className="chat-meta">{item.who === "me" ? "你" : employee.name} · {item.at}</div>
                  <div className={`chat-bubble ${item.who === "me" ? "me" : "bot"}`}>{item.text}</div>
                </div>
              ))}
              {typing && (
                <div className="chat-message bot">
                  <div className="chat-meta">{employee.name} · 输入中</div>
                  <div className="chat-bubble bot chat-typing">正在整理回答…</div>
                </div>
              )}
            </div>

            <div className="chat-compose">
              <textarea
                value={draft}
                onChange={evt => setDraft(evt.target.value)}
                placeholder="输入你的问题，Enter 发送，Shift+Enter 换行"
                onKeyDown={evt => {
                  if (evt.key === "Enter" && !evt.shiftKey) {
                    evt.preventDefault();
                    send();
                  }
                }}
              />
              <div className="row between wrap" style={{ marginTop: 12 }}>
                <div className="muted" style={{ fontSize: 12 }}>默认保留最近 50 条站内消息，重新进入页面可继续上次对话。</div>
                <button className="btn btn-primary btn-sm" onClick={send} disabled={!draft.trim() || typing}>发送</button>
              </div>
            </div>
          </>
        )}
      </div>

      <window.IMPickerModal
        open={jumpPicker}
        employee={employee}
        onClose={() => setJumpPicker(false)}
        onConfig={() => {
          setJumpPicker(false);
          go(`im/${employee.id}`);
        }}
      />
    </div>
  );
}

Object.assign(window, {
  IMConfigPage,
  PublishPage,
  ClonePage,
  QuickClonePage,
  BranchPage,
  ChatPage
});
