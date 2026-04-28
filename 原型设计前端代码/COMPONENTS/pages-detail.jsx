/* global window, React */
const { useState: _useState2 } = React;

function TemplateDetailPage({ id, go, role }) {
  const template = window.findTemplateById(id);
  if (!template) return null;

  return (
    <div className="page page-narrow">
      <window.Crumb label="返回模板池" onClick={() => go("templates")} />

      <div className="card card-pad detail-hero">
        <div className="row" style={{ gap: 16, alignItems: "flex-start" }}>
          <window.Avatar initial={template.initial} tint={template.tint} size="xl" />
          <div style={{ flex: 1 }}>
            <span className="eyebrow">{template.source}</span>
            <h2 style={{ margin: "6px 0 0", fontSize: 28, fontWeight: 600 }}>{template.name}</h2>
            <div className="muted" style={{ marginTop: 8, fontSize: 13 }}>适用：{template.sectors.join(" / ")} · 已生成部门版 {template.used} 个</div>
            <p style={{ marginTop: 14, color: "var(--c-body)", lineHeight: 1.65 }}>{template.summary}</p>
          </div>
          {role === "manager" && (
            <button className="btn btn-primary" onClick={() => go(`hire/new?tpl=${template.id}`)}>
              <window.Icon.spark className="icn" /> 雇佣
            </button>
          )}
        </div>
      </div>

      <div className="spacer-24" />

      <div className="grid" style={{ gridTemplateColumns: "1.8fr 1fr", gap: 20 }}>
        <div className="card card-pad">
          <h3 className="section-h">能力清单</h3>
          <div className="cap-list">
            {template.capabilities.map(item => (
              <div key={item} className="cap"><span className="check">✓</span><span>{item}</span></div>
            ))}
            {template.cants.map(item => (
              <div key={item} className="cap cant"><span className="check">×</span><span>{item}</span></div>
            ))}
          </div>
        </div>

        <div className="card card-pad">
          <h3 className="section-h">模板概览</h3>
          <div className="kv">
            <dt>来源</dt><dd>{template.source}</dd>
            <dt>适配部门</dt><dd>{template.sectors.join(" / ")}</dd>
            <dt>部门采用</dt><dd className="tnum">{template.used}</dd>
            <dt>被复制数</dt><dd className="tnum">{template.cloned}</dd>
          </div>
          <div className="divider" />
          <div className="callout info">
            从这里发起雇佣会自动带入 `template_id`。模板池的搜索条件和滚动位置会保留在原型里。
          </div>
        </div>
      </div>
    </div>
  );
}

function buildEmployeeActions(employee, role, go, toast, setJumpPicker) {
  const isManager = role === "manager";
  const viewer = window.getViewer(role);
  const isOwner = employee.owner === viewer.name;
  const actions = [];

  if (employee.type === "department") {
    if (employee.status === "hired") actions.push({ label: "继续雇佣", primary: true, go: () => go(`hire/${employee.id}`) });
    if (employee.status === "interning_ai") actions.push({ label: "查看 AI 评估", primary: true, go: () => go(`eval-ai/${employee.id}`) });
    if (employee.status === "interning_human") actions.push({ label: "查看人工评估", primary: true, go: () => go(`eval-human/${employee.id}`) });
    if (employee.status === "live") {
      if (isManager) {
        actions.push({ label: "重新雇佣", primary: true, go: () => go(`hire/${employee.id}`) });
        actions.push({ label: "快捷复制", go: () => go(`quick-clone/${employee.id}`) });
        actions.push({ label: "复制一个给自己", go: () => go(`clone/${employee.id}`) });
      } else {
        actions.push({ label: "创建分身", primary: true, go: () => go(`clone/${employee.id}`) });
      }
    }
  } else {
    if (employee.status === "live" && isOwner) {
      actions.push({ label: "开始对话", primary: true, go: () => go(`chat/${employee.id}`) });
      if (window.getConnectedChannels(employee.id).length) actions.push({ label: "去 IM", go: () => setJumpPicker(true) });
      actions.push({ label: "配置 IM", go: () => go(`im/${employee.id}`) });
      if (employee.type === "personal_clone") actions.push({ label: "创建私有分支", go: () => go(`branch/${employee.id}`) });
      actions.push({
        label: "退役",
        go: () => {
          window.updateEmployee(employee.id, { status: "retired", updated: "刚刚", activeAt: "—" });
          toast("已退役，仍可从历史记录中查看");
          go("my");
        }
      });
    }
    if ((employee.status === "interning_ai" || employee.status === "interning_human") && isOwner) {
      actions.push({
        label: employee.status === "interning_ai" ? "查看 AI 评估" : "查看人工评估",
        primary: true,
        go: () => go(employee.status === "interning_ai" ? `eval-ai/${employee.id}` : `eval-human/${employee.id}`)
      });
    }
  }

  if (employee.status === "failed") {
    actions.push({ label: "查看评估报告", primary: true, go: () => go(`review/${employee.id}`) });
    actions.push({ label: "继续雇佣", go: () => go(`hire/${employee.id}`) });
  }

  if (employee.status === "retired") {
    actions.push({ label: "查看历史", primary: true, go: () => go(`employee/${employee.id}`) });
    if (employee.parent) actions.push({ label: "重新复制", go: () => go(`clone/${employee.parent}`) });
  }

  return actions;
}

function EmployeeDetailPage({ id, role, go, toast }) {
  const employee = window.findEmployeeById(id);
  const [jumpPicker, setJumpPicker] = _useState2(false);
  if (!employee) return null;

  const viewer = window.getViewer(role);
  const isOwner = employee.owner === viewer.name;
  const template = window.findTemplateById(employee.template) || {};
  const backTo = employee.type === "department" ? "dept" : "my";

  if (employee.type === "private_branch" && !isOwner) {
    return (
      <div className="page page-narrow">
        <window.Crumb label="返回我的数字员工" onClick={() => go("my")} />
        <div className="empty">
          <div className="ic">🔒</div>
          <h4>该私有分支仅 owner 可见</h4>
          <p>你可以回到“我的数字员工”查看自己拥有的分身和私人定制。</p>
        </div>
      </div>
    );
  }

  const actions = buildEmployeeActions(employee, role, go, toast, setJumpPicker);

  return (
    <div className="page">
      <window.Crumb label={`返回 ${employee.type === "department" ? "部门数字员工" : "我的数字员工"}`} onClick={() => go(backTo)} />

      <div className="card card-pad detail-hero">
        <div className="row" style={{ gap: 18, alignItems: "flex-start" }}>
          <window.Avatar initial={employee.initial} tint={employee.tint} size="xl" />
          <div style={{ flex: 1 }}>
            <div className="row wrap" style={{ gap: 10 }}>
              <h2 style={{ margin: 0, fontSize: 28, fontWeight: 600 }}>{employee.name}</h2>
              <window.StatusPill status={employee.status} />
              <window.TypePill type={employee.type} />
            </div>
            <div className="muted" style={{ marginTop: 8, fontSize: 13 }}>
              所属部门 {employee.dept || viewer.dept} · Owner {employee.owner} · 最近更新 {employee.updated}
            </div>
            <p style={{ marginTop: 14, color: "var(--c-body)", lineHeight: 1.65 }}>{employee.desc}</p>

            <div className="divider" />
            <h4 className="muted" style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 500 }}>来源关系</h4>
            <window.Lineage employee={employee} />
          </div>

          <div className="detail-actions">
            {actions.map(action => (
              <button key={action.label} className={`btn ${action.primary ? "btn-primary" : "btn-ghost"}`} onClick={action.go}>
                {action.label}
                {action.primary && <window.Icon.arrow className="icn" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="spacer-24" />

      <div className="split">
        <div className="card card-pad">
          <h3 className="section-h">能力简介</h3>
          <div className="cap-list">
            {(template.capabilities || []).slice(0, 4).map(item => (
              <div key={item} className="cap"><span className="check">✓</span><span>{item}</span></div>
            ))}
            {(template.cants || []).slice(0, 2).map(item => (
              <div key={item} className="cap cant"><span className="check">×</span><span>{item}</span></div>
            ))}
          </div>

          <div className="divider" />
          <div className="callout info">
            详情页只展示业务可读的能力和边界，不暴露底层 Skill 文件。主动作会根据当前实例状态自动切换。
          </div>
        </div>

        <div className="card card-pad">
          <h3 className="section-h">运行状态</h3>
          {employee.status === "live" ? (
            <window.StatStrip items={[
              { icon: <window.Icon.spark />, value: <span className="tnum">{employee.runs || 0}</span>, label: "累计对话轮次" },
              { icon: <window.Icon.users />, value: <span className="tnum">{employee.cloned || 0}</span>, label: "被复制" },
              { icon: <window.Icon.clock />, value: employee.activeAt || "—", label: "最近活跃" },
              { icon: <window.Icon.shield />, value: <span className="tnum">0</span>, label: "最近错误" },
              { icon: <window.Icon.bot />, value: "v1.0", label: "实例版本" }
            ]} />
          ) : (
            <div className="callout info">
              该实例尚未上岗，当前以元数据、流程状态和回退入口为主。{employee.type !== "department" && !isOwner && "你不是 owner，不展示会话历史。"}
            </div>
          )}

          <div className="spacer-16" />
          <div className="callout success">
            <span style={{ fontSize: 18 }}>🛡️</span>
            <div>
              <div style={{ fontWeight: 600, color: "var(--c-near-black)" }}>状态承接说明</div>
              <div style={{ color: "var(--c-body)", marginTop: 4 }}>
                {employee.status === "live"
                  ? "已上岗实例可以直接进入站内对话，个人资产还可以按需配置 IM 并从平台拉起。"
                  : employee.status === "interning_ai"
                    ? "AI 评估通过后才允许进入人工评估。"
                    : employee.status === "interning_human"
                      ? "人工评估通过后进入发布确认，不再把 IM 配置当成上岗前置条件。"
                      : "失败时通过 Review 选择回退工位，已上传原料会保留。"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {employee.type !== "department" && (
        <>
          <div className="spacer-24" />
          <div className="card card-pad">
            <div className="row between wrap" style={{ marginBottom: 14 }}>
              <h3 className="section-h" style={{ marginBottom: 0 }}>IM 接入区</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => go(`im/${employee.id}`)}>前往多平台 IM 配置</button>
            </div>

            <div className="grid grid-3">
              {Object.entries(window.IM_CHANNEL_META).map(([channelId, channel]) => {
                const binding = window.getBinding(employee.id, channelId);
                const status = window.getBindingStatus(employee.id, channelId);
                const statusText = status === "connected" ? "已连接" : status === "error" ? "配置异常" : "未配置";
                const actionLabel = status === "connected" ? `去 ${channel.name}` : status === "error" ? "重新配置" : "配置 IM";

                return (
                  <div key={channelId} className="status-panel">
                    <div className="row between" style={{ alignItems: "flex-start" }}>
                      <div className="row" style={{ gap: 10 }}>
                        <span className={`jump-chip-mark ${channel.accent}`}>{channel.short}</span>
                        <div>
                          <div style={{ fontWeight: 600 }}>{channel.name}</div>
                          <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>{binding ? `${binding.methodId === "callback" ? "URL 回调" : "WebSocket 长连接"} · ${binding.connectedAt}` : "尚未完成接入"}</div>
                        </div>
                      </div>
                      <span className={`pill ${status === "connected" ? "green" : status === "error" ? "pink" : "gray"} dot`}>{statusText}</span>
                    </div>
                    <div className="spacer-16" />
                    <button className="btn btn-ghost btn-sm" onClick={() => status === "connected" ? setJumpPicker(true) : go(`im/${employee.id}`)}>
                      {actionLabel}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      <window.IMPickerModal
        open={jumpPicker}
        employee={employee}
        onClose={() => setJumpPicker(false)}
        onConfig={() => go(`im/${employee.id}`)}
      />
    </div>
  );
}

Object.assign(window, { TemplateDetailPage, EmployeeDetailPage });
