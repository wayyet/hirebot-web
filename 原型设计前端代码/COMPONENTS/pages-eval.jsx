/* global window, React */
const { useState: _useStateE, useEffect: _useEffectE } = React;

// ===== AI Evaluation Mock Data =====
const EVAL_ONTOLOGY_STATUS = {
  isReady: true,
  dimensions: [
    { id: 'dim_func', name: '功能完整性', weight: 0.25, threshold: 60, status: 'ready' },
    { id: 'dim_interact', name: '交互质量', weight: 0.30, threshold: 60, status: 'ready' },
    { id: 'dim_process', name: '流程合规', weight: 0.15, threshold: 60, status: 'ready' },
    { id: 'dim_problem', name: '问题解决', weight: 0.20, threshold: 60, status: 'ready' },
    { id: 'dim_tool', name: '工具调用正确性', weight: 0.10, threshold: 0, status: 'ready' },
  ],
  criticalRequirements: [
    { id: 'critical_ticket', name: '必须创建工单', status: 'ready' },
  ],
  source: '雇佣流程资料解析',
};

const EVAL_SCENARIOS = [
  { id: 's1', name: '电商商品质量申诉处理', status: 'ready', testCaseCount: 2, source: 'hiring_process' },
  { id: 's2', name: '退款处理流程', status: 'ready', testCaseCount: 1, source: 'hiring_process' },
  { id: 's3', name: '用户投诉升级处理', status: 'ready', testCaseCount: 1, source: 'hiring_process' },
];

const EVAL_TEST_CASE = {
  id: 'TC-001',
  scenarioName: '电商商品质量申诉处理',
  input: '用户申请，某某商品质量有问题，要求退货退款',
  expectedBehavior: [
    { step: 1, action: '安抚用户', criteria: '语气友好，表达歉意' },
    { step: 2, action: '判断退换标准', criteria: '查询商品信息，判断是否符合退换条件' },
    { step: 3, action: '决策处理方式', criteria: '根据规则决策退货/换货/拒绝' },
    { step: 4, action: '登记工单', criteria: '调用工单系统，记录处理结果' },
  ],
  dimensions: [
    { name: '功能完整性', weight: '25%' },
    { name: '交互质量', weight: '30%' },
    { name: '流程合规', weight: '15%' },
    { name: '问题解决', weight: '30%' },
    { name: '工具调用正确性', weight: '动态' },
  ],
};

const EVAL_EXECUTION_TRACE = {
  logs: [
    { type: 'thought', time: '0:00:03', content: '用户情绪激动，需要先安抚，再处理问题。' },
    { type: 'message', time: '0:00:08', role: 'assistant', content: '您好，非常理解您的困扰，商品出现质量问题确实让人着急。我是您的专属客服，马上为您处理这个问题，请您放心。' },
    { type: 'tool_call', time: '0:00:15', tool: 'query_product_info', params: { product_id: 'PROD-12345' }, result: { return_eligible: true }, success: true },
    { type: 'thought', time: '0:00:20', content: '商品在保修期内，符合退换条件。用户情绪激动，应快速处理。' },
    { type: 'tool_call', time: '0:00:28', tool: 'create_ticket', params: { user_id: 'USER-67890', issue_type: 'quality_problem', resolution: 'refund' }, result: { ticket_id: 'WO-20260418-001' }, success: true },
    { type: 'message', time: '0:00:35', role: 'assistant', content: '已经为您登记了退货退款申请，工单号 WO-20260418-001。预计 3 个工作日内退款到账，请您留意。' },
  ],
  summary: { total_tool_calls: 2, success_rate: 1.0, execution_time: '35s' },
};

const EVAL_ITERATIONS = [
  {
    round: 1,
    score: 48,
    passed: false,
    dimensions: [
      { name: '功能完整性', weight: '25%', score: 45, threshold: 60, ontologyId: 'dim_func', status: '不合格' },
      { name: '交互质量', weight: '30%', score: 50, threshold: 60, ontologyId: 'dim_interact', status: '不合格' },
      { name: '流程合规', weight: '15%', score: 48, threshold: 60, ontologyId: 'dim_process', status: '不合格' },
      { name: '问题解决', weight: '20%', score: 49, threshold: 60, ontologyId: 'dim_problem', status: '不合格' },
      { name: '工具调用正确性', weight: '10%', score: 40, threshold: '动态', ontologyId: 'dim_tool', status: '不合格' },
    ],
    issues: [
      { id: 'ISS-001', title: '未按照流程执行必要步骤', impact: '业务无法推进', severity: '严重' },
      { id: 'ISS-002', title: '工具调用错误/遗漏', impact: '无工单记录、无法追溯', severity: '高' },
    ],
    modifications: [
      {
        id: 'MOD-001',
        type: 'system_prompt',
        title: 'Prompt 增强 - 增加流程强制规则',
        before: '你是销售跟进助理，负责处理商机信息。',
        after: '你是销售跟进助理。你必须按顺序执行：① 判断优先级 → ② 生成提醒 → ③ 推送负责人 → ④ 更新 CRM，每步不可跳过。',
        expectedGain: '流程合规性 +20',
      },
    ],
    ontologySource: {
      roleTypeId: 'role_cs_001',
      roleName: 'customer_service',
      dimensionsQueried: EVAL_ONTOLOGY_STATUS.dimensions,
      criticalRequirementsQueried: EVAL_ONTOLOGY_STATUS.criticalRequirements,
    },
  },
  {
    round: 2,
    score: 66,
    passed: false,
    dimensions: [
      { name: '功能完整性', weight: '25%', score: 63, threshold: 60, ontologyId: 'dim_func', status: '不合格' },
      { name: '交互质量', weight: '30%', score: 68, threshold: 60, ontologyId: 'dim_interact', status: '良好' },
      { name: '流程合规', weight: '15%', score: 58, threshold: 60, ontologyId: 'dim_process', status: '不合格' },
      { name: '问题解决', weight: '20%', score: 70, threshold: 60, ontologyId: 'dim_problem', status: '良好' },
      { name: '工具调用正确性', weight: '10%', score: 55, threshold: '动态', ontologyId: 'dim_tool', status: '不合格' },
    ],
    issues: [
      { id: 'ISS-003', title: '工具调用时机错误', impact: '未核实信息就调用退款接口', severity: '中' },
    ],
    modifications: [
      {
        id: 'MOD-002',
        type: 'tool_config',
        title: '工具调用顺序约束',
        before: '无调用顺序约束',
        after: 'create_ticket 必须在 query_product_info 成功后才可调用，否则返回错误提示',
        expectedGain: '工具调用正确性 +25',
      },
    ],
    ontologySource: {
      roleTypeId: 'role_cs_001',
      roleName: 'customer_service',
      dimensionsQueried: EVAL_ONTOLOGY_STATUS.dimensions,
      criticalRequirementsQueried: EVAL_ONTOLOGY_STATUS.criticalRequirements,
    },
  },
  {
    round: 3,
    score: 85,
    passed: true,
    dimensions: [
      { name: '功能完整性', weight: '25%', score: 90, threshold: 60, ontologyId: 'dim_func', status: '优秀' },
      { name: '交互质量', weight: '30%', score: 82, threshold: 60, ontologyId: 'dim_interact', status: '良好' },
      { name: '流程合规', weight: '15%', score: 88, threshold: 60, ontologyId: 'dim_process', status: '优秀' },
      { name: '问题解决', weight: '20%', score: 80, threshold: 60, ontologyId: 'dim_problem', status: '良好' },
      { name: '工具调用正确性', weight: '10%', score: 95, threshold: '动态', ontologyId: 'dim_tool', status: '优秀' },
    ],
    issues: [],
    modifications: [],
    ontologySource: {
      roleTypeId: 'role_cs_001',
      roleName: 'customer_service',
      dimensionsQueried: EVAL_ONTOLOGY_STATUS.dimensions,
      criticalRequirementsQueried: EVAL_ONTOLOGY_STATUS.criticalRequirements,
    },
  },
];

const EVAL_CHAT_MESSAGES = [
  { id: 'm0', type: 'system', content: '评估专家已就绪，开始检查本体和用例...', time: '14:30:00' },
  { id: 'm0b', type: 'system', content: '本体检查完成：评估维度 5 个、红线 1 个均已就绪 ✓', time: '14:30:01' },
  { id: 'm0c', type: 'confirm_standards', content: '考题和判卷标准已就绪', time: '14:30:02' },
  { id: 'm1', type: 'system', content: '考题已确认，开始执行第 1 轮评估...', time: '14:30:03' },
  { id: 'm2', type: 'assistant', content: '我已获取前置流程的评估用例，共解析到 3 个场景：\n\n• **电商商品质量申诉处理** — 已生成 2 个测试用例 ✓\n• **退款处理流程** — 已生成 1 个测试用例 ✓\n• **用户投诉升级处理** — 已生成 1 个测试用例 ✓\n\n评估本体（维度、规则、红线）均已就绪，开始执行测试。', time: '14:30:05' },
  { id: 'm6', type: 'assistant', content: '正在执行测试用例 TC-001（电商商品质量申诉处理）...\n\n目标员工沙箱已创建，测试输入已注入。', time: '14:30:25' },
  { id: 'm7', type: 'iteration_summary', content: '第 1 轮评估完成', score: 48, passed: false, issues: ['未按照流程执行必要步骤', '工具调用错误/遗漏'], time: '14:31:00' },
  { id: 'm8', type: 'assistant', content: '第 1 轮评估完成，综合评分 **48/100**，AI 判定：**不合格** ❌\n\n**发现严重问题：**\n• 未按照流程执行必要步骤 — 业务无法推进\n• 工具调用错误/遗漏 — 无工单记录\n\n**已自动生成修改方案：**\n修改 System Prompt，增加流程强制规则，确保所有步骤按序执行。\n\n正在应用修改，准备第 2 轮评估...', time: '14:31:05' },
  { id: 'm9', type: 'system', content: '修改已应用，开始执行第 2 轮评估...', time: '14:31:30' },
  { id: 'm10', type: 'iteration_summary', content: '第 2 轮评估完成', score: 66, passed: false, issues: ['工具调用时机错误'], time: '14:32:00' },
  { id: 'm11', type: 'assistant', content: '第 2 轮评估完成，综合评分 **66/100**，AI 判定：**不合格** ❌\n\n**发现问题：**\n• 工具调用时机错误 — 未核实信息就调用退款接口\n\n**已自动生成修改方案：**\n调整工具调用顺序约束，create_ticket 必须在 query_product_info 成功后才可调用。\n\n正在应用修改，准备第 3 轮评估...', time: '14:32:05' },
  { id: 'm12', type: 'system', content: '修改已应用，开始执行第 3 轮评估...', time: '14:32:30' },
  { id: 'm13', type: 'iteration_summary', content: '第 3 轮评估完成', score: 85, passed: true, time: '14:33:00' },
  { id: 'm14', type: 'assistant', content: '第 3 轮评估完成，综合评分 **85/100**，AI 判定：**合格** ✓\n\n所有评估维度均已达标，该数字员工具备上岗能力。\n\n**训练过程总结：**\n• 第 1 轮（48分）→ 修改 Prompt 增加流程强制规则\n• 第 2 轮（66分）→ 调整工具调用顺序约束\n• 第 3 轮（85分）→ 通过评估\n\n可返回员工详情办理转正。', time: '14:33:05' },
  { id: 'm15', type: 'final_result', content: '评估训练已完成，员工通过评估', time: '14:33:10' },
];

const EVAL_STEPS = ['本体检查', '确认考题', '执行测试', '评估判分'];

// ===== Score Trend Chart =====
function EvalScoreTrendChart({ iterations }) {
  const W = 320;
  const H = 100;
  const PAD = { top: 12, right: 16, bottom: 20, left: 28 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const scores = iterations.map(it => it.score);
  const maxX = Math.max(iterations.length - 1, 1);
  const passingScore = 75;

  const px = i => PAD.left + (i / maxX) * innerW;
  const py = s => PAD.top + innerH - (s / 100) * innerH;

  const pathD = scores.map((s, i) => `${i === 0 ? 'M' : 'L'} ${px(i)} ${py(s)}`).join(' ');
  const areaD = `${pathD} L ${px(scores.length - 1)} ${PAD.top + innerH} L ${PAD.left} ${PAD.top + innerH} Z`;
  const thresholdY = py(passingScore);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 100 }}>
      {[0, 25, 50, 75, 100].map(v => (
        <line key={v} x1={PAD.left} y1={py(v)} x2={W - PAD.right} y2={py(v)} stroke="#f1f5f9" strokeWidth="1" />
      ))}
      <line x1={PAD.left} y1={thresholdY} x2={W - PAD.right} y2={thresholdY} stroke="#22c55e" strokeWidth="1.5" strokeDasharray="4 3" />
      <text x={W - PAD.right + 2} y={thresholdY + 3} fontSize="9" fill="#22c55e">合格线 75</text>
      <path d={areaD} fill="#6366f1" fillOpacity="0.08" />
      <path d={pathD} fill="none" stroke="#6366f1" strokeWidth="2" strokeLinejoin="round" />
      {scores.map((s, i) => {
        const passed = iterations[i].passed;
        return (
          <g key={i}>
            <circle cx={px(i)} cy={py(s)} r="4" fill={passed ? '#22c55e' : '#6366f1'} stroke="white" strokeWidth="1.5" />
            <text x={px(i)} y={py(s) - 8} textAnchor="middle" fontSize="10" fontWeight="600" fill={passed ? '#16a34a' : '#6366f1'}>
              {s}
            </text>
            <text x={px(i)} y={PAD.top + innerH + 14} textAnchor="middle" fontSize="9" fill="#94a3b8">
              第{i + 1}轮
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ===== Summary Report Panel =====
function EvalSummaryReportPanel({ iterations }) {
  const finalIteration = iterations[iterations.length - 1];
  const firstIteration = iterations[0];
  const improvement = finalIteration.score - firstIteration.score;

  const allModifications = iterations.flatMap(it =>
    it.modifications.map(mod => ({ round: it.round, ...mod }))
  );

  const dimensionNames = ['功能完整性', '交互质量', '流程合规', '问题解决', '工具调用正确性'];

  return (
    <div className="eval-summary-panel">
      <div className={`eval-result-box ${finalIteration.passed ? 'passed' : 'failed'}`}>
        <div className={`eval-result-icon ${finalIteration.passed ? 'passed' : 'failed'}`}>
          {finalIteration.passed ? '✓' : '×'}
        </div>
        <div className={`eval-result-title ${finalIteration.passed ? 'passed' : 'failed'}`}>
          {finalIteration.passed ? '评估通过' : '训练失败'}
        </div>
        <p className="eval-result-desc">
          第 {iterations.length} 轮达到{finalIteration.passed ? '合格线' : '最大轮次'}，综合得分 {finalIteration.score} 分
        </p>
      </div>

      <div className="eval-stats-grid">
        <div className="eval-stat-box">
          <div className="eval-stat-value indigo">{iterations.length}</div>
          <div className="eval-stat-label">训练轮次</div>
        </div>
        <div className="eval-stat-box">
          <div className={`eval-stat-value ${improvement > 0 ? 'green' : 'red'}`}>
            {improvement > 0 ? '+' : ''}{improvement}
          </div>
          <div className="eval-stat-label">分数提升</div>
        </div>
        <div className="eval-stat-box">
          <div className="eval-stat-value amber">{allModifications.length}</div>
          <div className="eval-stat-label">修改次数</div>
        </div>
      </div>

      <div className="eval-section">
        <div className="eval-section-title">得分趋势</div>
        <div className="eval-chart-wrap">
          <EvalScoreTrendChart iterations={iterations} />
        </div>
      </div>

      <div className="eval-section">
        <div className="eval-section-title">维度得分对比</div>
        <div className="eval-dim-table">
          <table>
            <thead>
              <tr>
                <th>维度</th>
                {iterations.map(it => <th key={it.round}>第{it.round}轮</th>)}
                <th className="green">目标</th>
              </tr>
            </thead>
            <tbody>
              {dimensionNames.map(dimName => {
                const scoresByRound = iterations.map(it =>
                  it.dimensions.find(d => d.name === dimName)?.score || 0
                );
                const finalScore = scoresByRound[scoresByRound.length - 1];
                const reached = finalScore >= 75;
                return (
                  <tr key={dimName}>
                    <td>{dimName}</td>
                    {scoresByRound.map((score, i) => (
                      <td key={i} className={i === scoresByRound.length - 1 ? (reached ? 'green' : 'red') : ''}>
                        {score}
                        {i > 0 && score > scoresByRound[i-1] && <span className="arrow-up">↑</span>}
                      </td>
                    ))}
                    <td className="gray">75</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {allModifications.length > 0 && (
        <div className="eval-section">
          <div className="eval-section-title">修改历史</div>
          <div className="eval-mod-list">
            {allModifications.map(mod => (
              <div key={mod.id} className="eval-mod-card">
                <div className="eval-mod-head">
                  <span className="eval-mod-round">{mod.round}</span>
                  <span className="eval-mod-title">{mod.title}</span>
                  <span className="eval-mod-type">
                    {mod.type === 'system_prompt' ? 'Prompt' : mod.type === 'tool_config' ? '工具' : 'Few-shot'}
                  </span>
                </div>
                <div className="eval-mod-diff">
                  <div className="eval-mod-before">
                    <div className="eval-mod-label red">修改前</div>
                    <div>{mod.before}</div>
                  </div>
                  <div className="eval-mod-after">
                    <div className="eval-mod-label green">修改后</div>
                    <div>{mod.after}</div>
                  </div>
                </div>
                <div className="eval-mod-gain">预期效果：{mod.expectedGain}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="eval-conclusion">
        <div className="eval-conclusion-title">总结</div>
        <p>
          该数字员工经过 <strong>{iterations.length} 轮训练</strong>，从初始 <strong>{firstIteration.score} 分</strong> 提升至
          <strong className={finalIteration.passed ? 'green' : 'red'}> {finalIteration.score} 分</strong>，
          {finalIteration.passed ? '已达到合格标准，具备上岗能力。' : '未能达到合格标准，建议人工介入调整或重新设计。'}
        </p>
        {!finalIteration.passed && (
          <p className="amber">训练已达到最大轮次限制，系统自动停止。</p>
        )}
      </div>
    </div>
  );
}

// ===== Chat Message Components =====
function EvalChatMessage({ msg }) {
  if (msg.type === 'system') {
    return (
      <div className="eval-msg-system">
        <span>{msg.time} · {msg.content}</span>
      </div>
    );
  }

  if (msg.type === 'confirm_standards') {
    return (
      <div className="eval-msg-confirm">
        <div className="eval-msg-confirm-head">
          <span className="eval-msg-confirm-icon">📋</span>
          <span className="eval-msg-confirm-title">考题确认（已自动确认）</span>
          <span className="eval-msg-confirm-check">✓</span>
        </div>
        <p className="eval-msg-confirm-desc">评估大纲和测试用例均已就绪，以下是本次评估的内容：</p>

        <div className="eval-msg-confirm-section">
          <div className="eval-msg-confirm-label">测试用例 ({EVAL_SCENARIOS.length} 个)</div>
          <div className="eval-msg-confirm-cases">
            {EVAL_SCENARIOS.map(s => (
              <div key={s.id} className="eval-msg-confirm-case">
                <span>{s.name}</span>
                <span className="eval-msg-confirm-case-count">{s.testCaseCount} 用例</span>
              </div>
            ))}
          </div>
        </div>

        <div className="eval-msg-confirm-section">
          <div className="eval-msg-confirm-label">判卷标准</div>
          <div className="eval-msg-confirm-table">
            <table>
              <thead>
                <tr><th>维度</th><th>权重</th><th>合格线</th></tr>
              </thead>
              <tbody>
                {EVAL_ONTOLOGY_STATUS.dimensions.map(d => (
                  <tr key={d.id}>
                    <td>{d.name}</td>
                    <td>{(d.weight * 100).toFixed(0)}%</td>
                    <td>{d.threshold === 0 ? '动态' : d.threshold + '分'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="eval-msg-confirm-redline">
          <span className="eval-msg-confirm-redline-icon">⚠</span>
          <span className="eval-msg-confirm-redline-title">红线</span>
          <span className="eval-msg-confirm-redline-content">
            {EVAL_ONTOLOGY_STATUS.criticalRequirements.map(c => c.name).join('、')} → 触发直接不合格
          </span>
        </div>

        <div className="eval-msg-confirm-auto">已自动确认通过，开始执行测试...</div>
      </div>
    );
  }

  if (msg.type === 'iteration_summary') {
    return (
      <div className={`eval-msg-summary ${msg.passed ? 'passed' : 'failed'}`}>
        <span className={`eval-msg-summary-icon ${msg.passed ? 'passed' : 'failed'}`}>
          {msg.passed ? '✓' : '×'}
        </span>
        <span className="eval-msg-summary-text">{msg.content}</span>
        <span className={`eval-msg-summary-score ${msg.passed ? 'passed' : 'failed'}`}>{msg.score}</span>
        <span className="eval-msg-summary-total">/100</span>
        {msg.issues && msg.issues.length > 0 && (
          <div className="eval-msg-summary-issues">
            {msg.issues.map((issue, i) => (
              <span key={i} className="eval-msg-summary-issue">{issue}</span>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (msg.type === 'final_result') {
    return (
      <div className="eval-msg-final">
        <span className="eval-msg-final-icon">✓</span>
        <div>
          <div className="eval-msg-final-title">评估训练完成</div>
          <div className="eval-msg-final-desc">员工已通过评估，可办理转正上岗</div>
        </div>
      </div>
    );
  }

  if (msg.type === 'user') {
    return (
      <div className="eval-msg-user">
        <div className="eval-msg-user-bubble">{msg.content}</div>
      </div>
    );
  }

  // assistant
  return (
    <div className="eval-msg-assistant">
      <div className="eval-msg-assistant-bubble">
        {msg.content.split('**').map((part, i) =>
          i % 2 === 1 ? <strong key={i}>{part}</strong> : part
        )}
      </div>
    </div>
  );
}

// ===== Test Case Panel =====
function EvalTestCasePanel() {
  return (
    <div className="eval-testcase-panel">
      <div className="eval-testcase-header">
        <div className="eval-testcase-name">场景: {EVAL_TEST_CASE.scenarioName}</div>
        <div className="eval-testcase-id">ID: {EVAL_TEST_CASE.id}</div>
      </div>
      <div className="eval-testcase-section">
        <div className="eval-testcase-label">测试输入</div>
        <div className="eval-testcase-input">{EVAL_TEST_CASE.input}</div>
      </div>
      <div className="eval-testcase-section">
        <div className="eval-testcase-label">预期行为序列</div>
        <div className="eval-testcase-steps">
          {EVAL_TEST_CASE.expectedBehavior.map(step => (
            <div key={step.step} className="eval-testcase-step">
              <span className="eval-testcase-step-num">{step.step}</span>
              <div>
                <div className="eval-testcase-step-action">{step.action}</div>
                <div className="eval-testcase-step-criteria">{step.criteria}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="eval-testcase-section">
        <div className="eval-testcase-label">评估维度</div>
        <div className="eval-testcase-dims">
          {EVAL_TEST_CASE.dimensions.map(d => (
            <span key={d.name} className="eval-testcase-dim">{d.name} {d.weight}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ===== Trace Panel =====
function EvalTracePanel() {
  return (
    <div className="eval-trace-panel">
      <div className="eval-trace-summary">
        <span>工具调用: {EVAL_EXECUTION_TRACE.summary.total_tool_calls} 次</span>
        <span className="green">成功率: {(EVAL_EXECUTION_TRACE.summary.success_rate * 100).toFixed(0)}%</span>
        <span>耗时: {EVAL_EXECUTION_TRACE.summary.execution_time}</span>
      </div>
      {EVAL_EXECUTION_TRACE.logs.map((log, i) => (
        <div key={i} className={`eval-trace-log ${log.type}`}>
          {log.type === 'thought' && (
            <>
              <div className="eval-trace-log-head">
                <span className="eval-trace-log-icon thought">⚡</span>
                <span className="eval-trace-log-label thought">思考</span>
                <span className="eval-trace-log-time">{log.time}</span>
              </div>
              <p>{log.content}</p>
            </>
          )}
          {log.type === 'message' && (
            <>
              <div className="eval-trace-log-head">
                <span className="eval-trace-log-icon message">💬</span>
                <span className="eval-trace-log-label message">{log.role === 'assistant' ? '回复' : '用户'}</span>
                <span className="eval-trace-log-time">{log.time}</span>
              </div>
              <p>{log.content}</p>
            </>
          )}
          {log.type === 'tool_call' && (
            <>
              <div className="eval-trace-log-head">
                <span className="eval-trace-log-icon tool">🔧</span>
                <span className="eval-trace-log-label tool">工具调用: {log.tool}</span>
                <span className={`eval-trace-log-status ${log.success ? 'success' : 'fail'}`}>
                  {log.success ? '✓' : '×'}
                </span>
                <span className="eval-trace-log-time">{log.time}</span>
              </div>
              <div className="eval-trace-log-code">params: {JSON.stringify(log.params)}</div>
              <div className="eval-trace-log-result">result: {JSON.stringify(log.result)}</div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}

// ===== Report Panel =====
function EvalReportPanel({ iteration }) {
  const dimColor = (score, threshold) => {
    const t = typeof threshold === 'number' ? threshold : 60;
    return score >= t ? 'green' : score >= 60 ? 'amber' : 'red';
  };

  return (
    <div className="eval-report-panel">
      {iteration.ontologySource && (
        <div className="eval-report-source">
          <div className="eval-report-source-label">评估标准来源</div>
          <div className="eval-report-source-content">
            本体图谱: {iteration.ontologySource.roleTypeId} ({iteration.ontologySource.roleName})
          </div>
        </div>
      )}

      <div className={`eval-report-score-box ${iteration.passed ? 'passed' : 'failed'}`}>
        <div className={`eval-report-score ${iteration.passed ? 'passed' : 'failed'}`}>
          {iteration.score}
        </div>
        <div className="eval-report-score-label">综合评分</div>
        <span className={`eval-report-badge ${iteration.passed ? 'passed' : 'failed'}`}>
          {iteration.passed ? '✓ AI 判定：合格' : '× AI 判定：不合格'}
        </span>
      </div>

      <div className="eval-report-section">
        <div className="eval-report-section-label">维度评分</div>
        <div className="eval-report-dims">
          {iteration.dimensions.map(d => (
            <div key={d.name} className="eval-report-dim">
              <div className="eval-report-dim-head">
                <span>{d.name}</span>
                <span className={`eval-report-dim-score ${dimColor(d.score, d.threshold)}`}>{d.score}</span>
              </div>
              <div className="eval-report-dim-bar">
                <div className={`eval-report-dim-fill ${dimColor(d.score, d.threshold)}`} style={{ width: `${d.score}%` }} />
              </div>
              <div className="eval-report-dim-foot">
                <span>权重 {d.weight}</span>
                <span>合格线: {typeof d.threshold === 'number' ? d.threshold + '分' : d.threshold}</span>
                <span className={dimColor(d.score, d.threshold)}>{d.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {iteration.issues.length > 0 && (
        <div className="eval-report-section">
          <div className="eval-report-section-label red">发现的问题</div>
          <div className="eval-report-issues">
            {iteration.issues.map(issue => (
              <div key={issue.id} className="eval-report-issue">
                <div className="eval-report-issue-head">
                  <div>
                    <div className="eval-report-issue-title">{issue.title}</div>
                    <div className="eval-report-issue-impact">影响：{issue.impact}</div>
                  </div>
                  <span className={`eval-report-issue-severity ${issue.severity}`}>{issue.severity}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {iteration.modifications.length > 0 && (
        <div className="eval-report-section">
          <div className="eval-report-section-label indigo">本轮修改方案</div>
          <div className="eval-report-mods">
            {iteration.modifications.map(mod => (
              <div key={mod.id} className="eval-report-mod">
                <div className="eval-report-mod-title">{mod.title}</div>
                <span className="eval-report-mod-type">
                  {mod.type === 'system_prompt' ? 'System Prompt' : mod.type === 'tool_config' ? '工具配置' : 'Few-shot'}
                </span>
                <div className="eval-report-mod-diff">
                  <div>
                    <div className="eval-report-mod-label red">修改前</div>
                    <div className="eval-report-mod-before">{mod.before}</div>
                  </div>
                  <div>
                    <div className="eval-report-mod-label green">修改后</div>
                    <div className="eval-report-mod-after">{mod.after}</div>
                  </div>
                </div>
                <div className="eval-report-mod-gain">预期提升：{mod.expectedGain}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ===== Progress Bar =====
function EvalProgressBar({ currentIteration, maxIterations, currentStep }) {
  const stepProgress = ((currentStep + 1) / EVAL_STEPS.length) * 100;

  return (
    <div className="eval-progress-bar">
      <div className="eval-progress-head">
        <div className="eval-progress-iter">
          <span className="eval-progress-iter-label">第 {currentIteration}/{maxIterations} 评训轮次</span>
          {currentIteration > 1 && (
            <span className="eval-progress-iter-done">已完成 {currentIteration - 1} 轮 ✓</span>
          )}
        </div>
        <span className="eval-progress-percent">总进度 {Math.round((currentIteration / maxIterations) * 100)}%</span>
      </div>
      <div className="eval-progress-track">
        <div className="eval-progress-fill" style={{ width: `${stepProgress}%` }} />
      </div>
      <div className="eval-progress-steps">
        {EVAL_STEPS.map((label, i) => (
          <div key={i} className="eval-progress-step">
            <div className={`eval-progress-step-pill ${i < currentStep ? 'done' : i === currentStep ? 'active' : 'pending'}`}>
              {i < currentStep && <span className="eval-progress-step-check">✓</span>}
              {i === currentStep && <span className="eval-progress-step-spinner">⟳</span>}
              {label}
              {(i === 0 || i === 1) && currentStep > i && <span className="eval-progress-step-auto">⚡</span>}
            </div>
            {i < EVAL_STEPS.length - 1 && <span className="eval-progress-step-arrow">→</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== Scenarios Panel =====
function EvalScenariosPanel() {
  const ontologyReady = EVAL_ONTOLOGY_STATUS.isReady;
  const scenariosReady = EVAL_SCENARIOS.every(s => s.status === 'ready');
  const allReady = ontologyReady && scenariosReady;

  return (
    <div className="eval-scenarios-panel">
      <div className="eval-scenarios-ontology">
        <div className="eval-scenarios-ontology-title">评估大纲</div>
        <div className="eval-scenarios-ontology-items">
          <div className="eval-scenarios-ontology-item">
            <span className={`eval-scenarios-dot ${ontologyReady ? 'green' : 'amber'}`} />
            <span>评估维度</span>
            <span className="eval-scenarios-count">{EVAL_ONTOLOGY_STATUS.dimensions.length} 个</span>
            {ontologyReady && <span className="eval-scenarios-check">✓</span>}
          </div>
          <div className="eval-scenarios-ontology-item">
            <span className={`eval-scenarios-dot ${ontologyReady ? 'green' : 'amber'}`} />
            <span>一票否决项</span>
            <span className="eval-scenarios-count">{EVAL_ONTOLOGY_STATUS.criticalRequirements.length} 个</span>
            {ontologyReady && <span className="eval-scenarios-check">✓</span>}
          </div>
        </div>
      </div>

      <div className="eval-scenarios-section">
        <div className="eval-scenarios-section-title">测试场景 ({EVAL_SCENARIOS.length} 个)</div>
        <div className="eval-scenarios-list">
          {EVAL_SCENARIOS.map(s => (
            <div key={s.id} className="eval-scenarios-item">
              <span className={`eval-scenarios-dot ${s.status === 'ready' ? 'green' : 'amber'}`} />
              <span className="eval-scenarios-name">{s.name}</span>
              {s.status === 'ready' ? (
                <span className="eval-scenarios-ready">✓ {s.testCaseCount} 用例</span>
              ) : (
                <span className="eval-scenarios-warn">缺失</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className={`eval-scenarios-status ${allReady ? 'ready' : 'warn'}`}>
        <span className={`eval-scenarios-status-icon ${allReady ? 'ready' : 'warn'}`}>
          {allReady ? '✓' : '⚠'}
        </span>
        <span>{allReady ? '本体和用例均已就绪，可开始评估' : '本体或用例缺失，需补充后才能继续'}</span>
      </div>
    </div>
  );
}

// ===== AI Evaluation Page =====
function AIEvalPage({ id, go, toast }) {
  const e = window.findEmployeeById(id) || window.DEPT_EMPLOYEES[2];
  const [artifactTab, setArtifactTab] = _useStateE('report');
  const [chatInput, setChatInput] = _useStateE('');
  const [rightCollapsed, setRightCollapsed] = _useStateE(false);
  const [selectedRound, setSelectedRound] = _useStateE(3);
  const [showSummaryModal, setShowSummaryModal] = _useStateE(false);

  const trainingCompleted = true;
  const currentIteration = EVAL_ITERATIONS.find(it => it.round === selectedRound) || EVAL_ITERATIONS[2];

  const TABS = [
    { key: 'testcase', label: '测试用例' },
    { key: 'trace', label: 'Trace' },
    { key: 'report', label: '评估报告' },
  ];

  return (
    <div className="page eval-page">
      <div className="eval-topbar">
        <button className="eval-back" onClick={() => go(`employee/${e.id}`)}>
          <window.Icon.back className="icn" />
          返回
        </button>
        <div className="eval-topbar-divider" />
        <div>
          <h1 className="eval-topbar-title">AI 评估训练</h1>
          <p className="eval-topbar-sub">{e.name} · {e.desc || '数字员工'}</p>
        </div>
        <div className="eval-topbar-actions">
          {trainingCompleted && (
            <button className="btn btn-primary btn-sm" onClick={() => setShowSummaryModal(true)}>
              查看综合报告
            </button>
          )}
        </div>
      </div>

      <div className="eval-progress-wrap">
        <EvalProgressBar currentIteration={3} maxIterations={30} currentStep={3} />
      </div>

      <div className="eval-main">
        <div className="eval-chat-panel">
          <div className="eval-scenarios-wrap">
            <EvalScenariosPanel />
          </div>
          <div className="eval-messages">
            {EVAL_CHAT_MESSAGES.map(msg => (
              <EvalChatMessage key={msg.id} msg={msg} />
            ))}
          </div>
          <div className="eval-input">
            <button className="eval-input-attach">
              <window.Icon.upload className="icn" />
            </button>
            <input
              value={chatInput}
              onChange={evt => setChatInput(evt.target.value)}
              placeholder="回复评估专家..."
            />
            <button className="eval-input-send">
              <window.Icon.arrow className="icn" />
            </button>
          </div>
        </div>

        <div className={`eval-artifact-panel ${rightCollapsed ? 'collapsed' : ''}`}>
          {rightCollapsed ? (
            <button className="eval-artifact-expand" onClick={() => setRightCollapsed(false)}>
              <window.Icon.arrow className="icn" style={{ transform: 'rotate(90deg)' }} />
            </button>
          ) : (
            <>
              <div className="eval-artifact-head">
                <div className="eval-artifact-round">
                  <span className="eval-artifact-round-label">轮次</span>
                  <select value={selectedRound} onChange={e => setSelectedRound(Number(e.target.value))}>
                    {EVAL_ITERATIONS.map(it => (
                      <option key={it.round} value={it.round}>
                        第 {it.round} 轮 ({it.score}分{it.passed ? ' ✓' : ''})
                      </option>
                    ))}
                  </select>
                </div>
                <button className="eval-artifact-collapse" onClick={() => setRightCollapsed(true)}>
                  <window.Icon.arrow className="icn" style={{ transform: 'rotate(-90deg)' }} />
                </button>
              </div>

              <div className="eval-artifact-tabs">
                {TABS.map(tab => (
                  <button
                    key={tab.key}
                    className={`eval-artifact-tab ${artifactTab === tab.key ? 'active' : ''}`}
                    onClick={() => setArtifactTab(tab.key)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="eval-artifact-content">
                {artifactTab === 'testcase' && <EvalTestCasePanel />}
                {artifactTab === 'trace' && <EvalTracePanel />}
                {artifactTab === 'report' && <EvalReportPanel iteration={currentIteration} />}
              </div>
            </>
          )}
        </div>
      </div>

      {showSummaryModal && (
        <div className="eval-modal-mask" onClick={() => setShowSummaryModal(false)}>
          <div className="eval-modal" onClick={e => e.stopPropagation()}>
            <div className="eval-modal-head">
              <span className="eval-modal-icon">✓</span>
              <h2 className="eval-modal-title">评估训练综合报告</h2>
              <div className="eval-modal-actions">
                <button className="btn btn-primary btn-sm" onClick={() => setShowSummaryModal(false)}>
                  下载报告
                </button>
                <button className="eval-modal-close" onClick={() => setShowSummaryModal(false)}>
                  ×
                </button>
              </div>
            </div>
            <div className="eval-modal-body">
              <EvalSummaryReportPanel iterations={EVAL_ITERATIONS} />
            </div>
          </div>
        </div>
      )}

      <div className="eval-footer">
        <button className="btn btn-ghost" onClick={() => go(`review/${e.id}`)}>有问题 · 去 Review</button>
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
  );
}

// ===== Human Evaluation Mock Data =====
const HUMAN_SCENARIOS = [
  { scenario_id: 'HS-001', scenario_name: '投诉处理', status: 'completed', verdict: 'passed', verdict_comment: '语气友好，问题解决完整，流程合规', message_count: 6, started_at: '14:00', completed_at: '14:15' },
  { scenario_id: 'HS-002', scenario_name: '功能建议', status: 'completed', verdict: 'passed', verdict_comment: '记录建议，回复及时，跟进计划清晰', message_count: 4, started_at: '14:15', completed_at: '14:25' },
  { scenario_id: 'HS-003', scenario_name: '售后咨询', status: 'completed', verdict: 'failed', verdict_comment: '回复不够详细，未提供具体解决方案', message_count: 5, started_at: '14:25', completed_at: '14:35' },
];

const HUMAN_MESSAGES = [
  { message_id: 'div1', scenario_id: null, role: 'system', type: 'scenario_divider', content: '进入场景1：投诉处理', timestamp: '14:00' },
  { message_id: 'm1', scenario_id: 'HS-001', role: 'user', content: '我要投诉，这个商品太烂了，我要退货', timestamp: '14:01' },
  { message_id: 'm2', scenario_id: 'HS-001', role: 'assistant', content: '非常抱歉给您带来不便，我马上为您处理退货申请。请问您的订单号是多少？', timestamp: '14:01:15', trace: {
    thoughts: [{ content: '用户情绪激动，需要先安抚，再处理退货请求', timestamp: '14:01:10' }],
    tool_calls: [{ tool_name: 'query_product_info', parameters: { product_id: 'P-12345' }, result: { return_eligible: true }, success: true, duration_ms: 120, timestamp: '14:01:12' }]
  }},
  { message_id: 'm3', scenario_id: 'HS-001', role: 'user', content: '订单号是 20240418001', timestamp: '14:02' },
  { message_id: 'm4', scenario_id: 'HS-001', role: 'assistant', content: '已查询到您的订单，商品符合退货条件。我已为您创建退货工单（WO-20240418-001），预计3个工作日内退款到账。', timestamp: '14:02:30', trace: {
    thoughts: [{ content: '订单信息确认，商品符合退货条件，创建工单', timestamp: '14:02:20' }],
    tool_calls: [{ tool_name: 'create_ticket', parameters: { order_id: '20240418001', type: 'return' }, result: { ticket_id: 'WO-20240418-001' }, success: true, duration_ms: 200, timestamp: '14:02:25' }]
  }},
  { message_id: 'm5', scenario_id: 'HS-001', role: 'user', content: '好的，谢谢', timestamp: '14:03' },
  { message_id: 'm6', scenario_id: 'HS-001', role: 'assistant', content: '不客气，还有其他可以帮助您的吗？', timestamp: '14:03:15' },
  { message_id: 'vr1', scenario_id: 'HS-001', role: 'system', type: 'verdict_request', content: '场景「投诉处理」的对话已达到可判定阶段。数字员工已完成：安抚用户 → 查询订单 → 创建工单 → 确认处理', timestamp: '14:05', submitted: true, submittedVerdict: 'passed', submittedComment: '语气友好，问题解决完整，流程合规' },
  { message_id: 'div2', scenario_id: null, role: 'system', type: 'scenario_divider', content: '进入场景2：功能建议', timestamp: '14:15' },
  { message_id: 'm7', scenario_id: 'HS-002', role: 'user', content: '我要建议增加一键导出订单数据的功能', timestamp: '14:16' },
  { message_id: 'm8', scenario_id: 'HS-002', role: 'assistant', content: '感谢您的建议！我已将「一键导出订单数据」功能建议提交给产品团队，预计在下周的产品评审中讨论。您可以关注产品更新公告获取后续进展。', timestamp: '14:16:30', trace: {
    thoughts: [{ content: '用户提出功能建议，需要记录并提交给产品团队', timestamp: '14:16:20' }],
    tool_calls: [{ tool_name: 'submit_suggestion', parameters: { suggestion: '一键导出订单数据', category: 'feature' }, result: { suggestion_id: 'SUG-001' }, success: true, duration_ms: 150, timestamp: '14:16:25' }]
  }},
  { message_id: 'm9', scenario_id: 'HS-002', role: 'user', content: '你们什么时候能做出来？', timestamp: '14:17' },
  { message_id: 'm10', scenario_id: 'HS-002', role: 'assistant', content: '产品团队通常在评审后1-2周内会给出是否采纳的决定。如果采纳，开发周期约2-4周。我会持续跟进并在有进展时通知您。', timestamp: '14:17:30' },
  { message_id: 'vr2', scenario_id: 'HS-002', role: 'system', type: 'verdict_request', content: '场景「功能建议」的对话已达到可判定阶段。数字员工已完成：记录建议 → 提交产品团队 → 回复跟进计划', timestamp: '14:18', submitted: true, submittedVerdict: 'passed', submittedComment: '记录建议，回复及时，跟进计划清晰' },
  { message_id: 'div3', scenario_id: null, role: 'system', type: 'scenario_divider', content: '进入场景3：售后咨询', timestamp: '14:25' },
  { message_id: 'm11', scenario_id: 'HS-003', role: 'user', content: '请问这个产品的保修期是多久？', timestamp: '14:26' },
  { message_id: 'm12', scenario_id: 'HS-003', role: 'assistant', content: '您好，关于保修期的问题，不同产品有不同的保修政策。', timestamp: '14:26:30', trace: { thoughts: [{ content: '用户咨询保修期，需要查询具体产品信息', timestamp: '14:26:20' }], tool_calls: [] }},
  { message_id: 'm13', scenario_id: 'HS-003', role: 'user', content: '我是昨天买的那个蓝牙耳机', timestamp: '14:27' },
  { message_id: 'm14', scenario_id: 'HS-003', role: 'assistant', content: '蓝牙耳机的保修期一般是1年，具体您可以查看购买时的说明。', timestamp: '14:27:30' },
  { message_id: 'm15', scenario_id: 'HS-003', role: 'user', content: '如果坏了怎么修？', timestamp: '14:28' },
  { message_id: 'm16', scenario_id: 'HS-003', role: 'assistant', content: '如果出现问题，您可以联系售后客服进行处理。', timestamp: '14:28:30' },
  { message_id: 'vr3', scenario_id: 'HS-003', role: 'system', type: 'verdict_request', content: '场景「售后咨询」的对话已达到可判定阶段。数字员工已完成：回复保修政策 → 确认产品类型 → 提供售后渠道', timestamp: '14:30', submitted: true, submittedVerdict: 'failed', submittedComment: '回复不够详细，未提供具体解决方案' },
  { message_id: 'ob1', scenario_id: null, role: 'system', type: 'onboarding_request', content: '所有场景评估已完成，请做出上岗判定。', timestamp: '14:35', submitted: true, submittedOnboarding: 'force', submittedComment: '虽然售后咨询不合格，但主要场景通过，可以上岗观察' },
];

// ===== Human Evaluation Sub Components =====
function HumanScenarioProgressBar({ scenarios }) {
  const completed = scenarios.filter(s => s.status === 'completed').length;
  const total = scenarios.length;
  const progress = Math.round((completed / total) * 100);

  return (
    <div className="human-progress-bar">
      <div className="human-progress-steps">
        {scenarios.map((s, i) => (
          <div key={s.scenario_id} className="human-progress-step">
            <div className={`human-progress-pill ${s.status === 'completed' ? (s.verdict === 'passed' ? 'passed' : 'failed') : 'pending'}`}>
              {s.status === 'completed' ? (s.verdict === 'passed' ? '✓' : '×') : '⏳'}
              {s.scenario_name}
            </div>
            {i < scenarios.length - 1 && <span className="human-progress-arrow">→</span>}
          </div>
        ))}
      </div>
      <div className="human-progress-track">
        <div className="human-progress-fill" style={{ width: `${progress}%` }} />
        <span className="human-progress-label">{completed}/{total} 完成 ({progress}%)</span>
      </div>
    </div>
  );
}

function HumanScenarioNavigator({ scenarios, currentScenarioId, onNavigate }) {
  return (
    <div className="human-scenario-nav">
      <div className="human-scenario-nav-title">评估场景</div>
      <div className="human-scenario-nav-list">
        {scenarios.map(s => (
          <button
            key={s.scenario_id}
            className={`human-scenario-nav-item ${currentScenarioId === s.scenario_id ? 'active' : ''}`}
            onClick={() => onNavigate(s.scenario_id)}
          >
            {s.status === 'completed' ? (s.verdict === 'passed' ? '✓' : '×') : '⏳'}
            <span className="human-scenario-nav-name">{s.scenario_name}</span>
            <span className="human-scenario-nav-count">{s.message_count}条</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function HumanChatMessage({ msg, scenarios, onVerdictSubmit, onOnboardingSubmit }) {
  if (msg.type === 'scenario_divider') {
    return (
      <div className="human-msg-divider">
        <span>═══ {msg.content} ═══</span>
      </div>
    );
  }

  if (msg.type === 'verdict_request') {
    if (msg.submitted) {
      return (
        <div className="human-msg-verdict-submitted">
          <div className="human-msg-verdict-head submitted">
            <span className="human-msg-verdict-icon submitted">✓</span>
            <span className="human-msg-verdict-title submitted">场景评估判定（已完成）</span>
          </div>
          <p className="human-msg-verdict-desc">{msg.content}</p>
          <div className={`human-msg-verdict-result ${msg.submittedVerdict}`}>
            {msg.submittedVerdict === 'passed' ? '✓' : '×'}
            <span>{msg.submittedVerdict === 'passed' ? '合格' : '不合格'}</span>
            {msg.submittedComment && <span className="human-msg-verdict-comment">— {msg.submittedComment}</span>}
          </div>
        </div>
      );
    }

    return (
      <div className="human-msg-verdict-request">
        <div className="human-msg-verdict-head request">
          <span className="human-msg-verdict-icon request">⚠</span>
          <span className="human-msg-verdict-title request">场景评估判定</span>
          <span className="human-msg-verdict-badge">必选</span>
        </div>
        <p className="human-msg-verdict-desc">{msg.content}</p>
        <HumanVerdictPanel messageId={msg.message_id} onSubmit={onVerdictSubmit} />
      </div>
    );
  }

  if (msg.type === 'onboarding_request') {
    const passed = scenarios.filter(s => s.verdict === 'passed').length;
    const total = scenarios.length;
    const allPassed = passed === total;

    if (msg.submitted) {
      return (
        <div className="human-msg-onboarding-submitted">
          <div className="human-msg-onboarding-head submitted">
            <span className="human-msg-onboarding-icon submitted">✓</span>
            <span className="human-msg-onboarding-title submitted">上岗判定（已完成）</span>
          </div>
          <div className={`human-msg-onboarding-result ${msg.submittedOnboarding === 'onboard' || msg.submittedOnboarding === 'force' ? 'passed' : 'failed'}`}>
            {msg.submittedOnboarding === 'onboard' || msg.submittedOnboarding === 'force' ? '✓' : '×'}
            <span>{msg.submittedOnboarding === 'onboard' ? '上岗' : msg.submittedOnboarding === 'force' ? '强制上岗' : '不上岗'}</span>
            {msg.submittedComment && <span className="human-msg-onboarding-comment">— {msg.submittedComment}</span>}
          </div>
        </div>
      );
    }

    return (
      <div className="human-msg-onboarding-request">
        <div className="human-msg-onboarding-head request">
          <span className="human-msg-onboarding-icon request">👤</span>
          <span className="human-msg-onboarding-title request">上岗判定</span>
          <span className="human-msg-onboarding-badge">必选</span>
        </div>

        <div className="human-msg-onboarding-summary">
          <div className="human-msg-onboarding-summary-title">评估结果汇总</div>
          <div className="human-msg-onboarding-summary-grid">
            {scenarios.map(s => (
              <div key={s.scenario_id} className="human-msg-onboarding-summary-item">
                {s.verdict === 'passed' ? '✓' : '×'}
                <span>{s.scenario_name}</span>
              </div>
            ))}
          </div>
          <div className="human-msg-onboarding-summary-foot">
            <span>通过率: <strong className={allPassed ? 'green' : 'red'}>{passed}/{total}</strong></span>
            <span className={allPassed ? 'green' : 'amber'}>{allPassed ? '✅ 全部合格' : '⚠️ 存在不合格场景'}</span>
          </div>
        </div>

        <p className="human-msg-onboarding-desc">所有场景评估已完成。请根据评估结果，决定该数字员工是否上岗。</p>

        <HumanOnboardingPanel messageId={msg.message_id} allPassed={allPassed} onSubmit={onOnboardingSubmit} />
      </div>
    );
  }

  if (msg.role === 'user') {
    return (
      <div className="human-msg-user">
        <div className="human-msg-user-bubble">{msg.content}</div>
      </div>
    );
  }

  if (msg.role === 'system') {
    return (
      <div className="human-msg-system">
        <span>{msg.content}</span>
      </div>
    );
  }

  return (
    <div className="human-msg-assistant">
      <div className="human-msg-assistant-bubble">
        {msg.content}
        {msg.trace && msg.trace.tool_calls && msg.trace.tool_calls.length > 0 && (
          <div className="human-msg-assistant-tools">
            <span>🔧 调用了 {msg.trace.tool_calls.length} 个工具</span>
          </div>
        )}
      </div>
    </div>
  );
}

function HumanVerdictPanel({ messageId, onSubmit }) {
  const [verdict, setVerdict] = _useStateE(null);
  const [comment, setComment] = _useStateE('');

  return (
    <div className="human-verdict-panel">
      <div className="human-verdict-buttons">
        <button className={`human-verdict-btn ${verdict === 'passed' ? 'passed active' : ''}`} onClick={() => setVerdict('passed')}>
          <span className="human-verdict-btn-icon">✓</span>
          <span className="human-verdict-btn-label">合格</span>
        </button>
        <button className={`human-verdict-btn ${verdict === 'failed' ? 'failed active' : ''}`} onClick={() => setVerdict('failed')}>
          <span className="human-verdict-btn-icon">×</span>
          <span className="human-verdict-btn-label">不合格</span>
        </button>
      </div>
      <div className="human-verdict-comment">
        <label>判定备注（可选）</label>
        <input value={comment} onChange={e => setComment(e.target.value)} placeholder="填写判定原因..." />
      </div>
      <button
        className={`human-verdict-submit ${verdict ? (verdict === 'passed' ? 'passed' : 'failed') : 'disabled'}`}
        onClick={() => verdict && onSubmit && onSubmit(verdict, comment, messageId)}
        disabled={!verdict}
      >
        确认判定
      </button>
    </div>
  );
}

function HumanOnboardingPanel({ messageId, allPassed, onSubmit }) {
  const [decision, setDecision] = _useStateE(null);
  const [comment, setComment] = _useStateE('');

  return (
    <div className="human-onboarding-panel">
      {allPassed ? (
        <div className="human-onboarding-buttons">
          <button className={`human-onboarding-btn ${decision === 'onboard' ? 'passed active' : ''}`} onClick={() => setDecision('onboard')}>
            <span className="human-onboarding-btn-icon">✓</span>
            <span className="human-onboarding-btn-label">上岗</span>
            <span className="human-onboarding-btn-desc">数字员工符合上岗要求</span>
          </button>
          <button className={`human-onboarding-btn ${decision === 'reject' ? 'failed active' : ''}`} onClick={() => setDecision('reject')}>
            <span className="human-onboarding-btn-icon">×</span>
            <span className="human-onboarding-btn-label">不上岗</span>
            <span className="human-onboarding-btn-desc">评估结果存疑，暂不上岗</span>
          </button>
        </div>
      ) : (
        <div className="human-onboarding-buttons-v">
          <button className={`human-onboarding-btn-v ${decision === 'reject' ? 'failed active' : ''}`} onClick={() => setDecision('reject')}>
            <span className="human-onboarding-btn-icon">×</span>
            <span>不上岗 — 存在不合格场景，暂不上岗</span>
          </button>
          <button className={`human-onboarding-btn-v ${decision === 'force' ? 'amber active' : ''}`} onClick={() => setDecision('force')}>
            <span className="human-onboarding-btn-icon amber">🛡</span>
            <span>强制上岗 — 存在不合格场景，但仍要求上岗</span>
          </button>
        </div>
      )}
      <div className="human-onboarding-comment">
        <label>判定备注（可选）</label>
        <input value={comment} onChange={e => setComment(e.target.value)} placeholder="填写判定原因..." />
      </div>
      <button
        className={`human-onboarding-submit ${decision ? (decision === 'onboard' || decision === 'force' ? 'passed' : 'failed') : 'disabled'}`}
        onClick={() => decision && onSubmit && onSubmit(decision, comment, messageId)}
        disabled={!decision}
      >
        确认决定
      </button>
    </div>
  );
}

function HumanTracePanel({ messages, currentScenarioId }) {
  const scenarioMessages = messages.filter(m => m.scenario_id === currentScenarioId && m.trace);
  const traces = scenarioMessages.flatMap(m => m.trace ? [{ msg_id: m.message_id, ...m.trace }] : []);

  if (traces.length === 0) {
    return <div className="human-trace-empty">当前场景暂无执行过程数据</div>;
  }

  return (
    <div className="human-trace-panel">
      {traces.flatMap(t => [
        ...t.thoughts.map(th => (
          <div key={`th-${th.timestamp}`} className="human-trace-thought">
            <div className="human-trace-thought-head">
              <span className="human-trace-thought-icon">⚡</span>
              <span className="human-trace-thought-label">思考</span>
              <span className="human-trace-time">{th.timestamp}</span>
            </div>
            <p>{th.content}</p>
          </div>
        )),
        ...t.tool_calls.map(tc => (
          <div key={`tc-${tc.timestamp}`} className="human-trace-tool">
            <div className="human-trace-tool-head">
              <span className="human-trace-tool-icon">🔧</span>
              <span className="human-trace-tool-label">工具: {tc.tool_name}</span>
              {tc.success ? '✓' : '×'}
              <span className="human-trace-time">{tc.duration_ms}ms</span>
            </div>
            <div className="human-trace-tool-params">params: {JSON.stringify(tc.parameters)}</div>
            <div className="human-trace-tool-result">result: {JSON.stringify(tc.result)}</div>
          </div>
        ))
      ])}
    </div>
  );
}

function HumanConversationPanel({ messages, currentScenarioId }) {
  const scenarioMessages = messages.filter(m => m.scenario_id === currentScenarioId && m.role !== 'system');

  if (scenarioMessages.length === 0) {
    return <div className="human-conversation-empty">当前场景暂无对话记录</div>;
  }

  return (
    <div className="human-conversation-panel">
      {scenarioMessages.map(m => (
        <div key={m.message_id} className={`human-conversation-msg ${m.role}`}>
          <div className="human-conversation-time">{m.timestamp}</div>
          <div className="human-conversation-bubble">{m.content}</div>
        </div>
      ))}
    </div>
  );
}

function HumanReportPanel({ currentScenario }) {
  return (
    <div className="human-report-panel">
      <div className="human-report-header">
        <div className="human-report-name">场景: {currentScenario?.scenario_name}</div>
        <div className="human-report-status">状态: {currentScenario?.status === 'completed' ? '已完成' : '进行中'}</div>
      </div>
      <div className="human-report-count">
        <label>对话轮数</label>
        <div className="human-report-count-value">6 轮</div>
      </div>
      {currentScenario?.verdict && (
        <div className={`human-report-verdict ${currentScenario.verdict}`}>
          {currentScenario.verdict === 'passed' ? '✓' : '×'}
          <span>{currentScenario.verdict === 'passed' ? '合格' : '不合格'}</span>
          {currentScenario.verdict_comment && <p>{currentScenario.verdict_comment}</p>}
        </div>
      )}
    </div>
  );
}

function generateHumanReportHtml(scenarios, employee) {
  const passed = scenarios.filter(s => s.verdict === 'passed').length;
  const failed = scenarios.filter(s => s.verdict === 'failed').length;
  const total = scenarios.length;
  const allPassed = passed === total && scenarios.every(s => s.status === 'completed');
  const passRate = Math.round((passed / total) * 100);
  const now = new Date().toLocaleString('zh-CN');

  const styles = `
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; padding: 40px; color: #334155; }
    .container { max-width: 800px; margin: 0 auto; background: #fff; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.1); }
    .header { text-align: center; padding: 32px; border-radius: 16px 16px 0 0; }
    .header.passed { background: linear-gradient(135deg, #dcfce7, #bbf7d0); border-bottom: 3px solid #16a34a; }
    .header.amber { background: linear-gradient(135deg, #fef3c7, #fde68a); border-bottom: 3px solid #f59e0b; }
    .icon { font-size: 48px; margin-bottom: 16px; }
    .title { font-size: 24px; font-weight: 700; margin: 0 0 8px; }
    .subtitle { font-size: 14px; color: #64748b; }
    .stats { display: flex; justify-content: space-around; padding: 24px; background: #f1f5f9; }
    .stat { text-align: center; }
    .stat-value { font-size: 32px; font-weight: 700; }
    .stat-value.indigo { color: #4f46e5; }
    .stat-value.green { color: #16a34a; }
    .stat-value.red { color: #dc2626; }
    .stat-value.amber { color: #f59e0b; }
    .stat-label { font-size: 12px; color: #64748b; margin-top: 4px; }
    .rate-bar { padding: 24px; background: #f1f5f9; }
    .rate-label { font-size: 14px; margin-bottom: 8px; }
    .rate-track { height: 12px; background: #e2e8f0; border-radius: 6px; }
    .rate-fill { height: 100%; border-radius: 6px; }
    .rate-fill.green { background: linear-gradient(90deg, #16a34a, #22c55e); }
    .rate-fill.amber { background: linear-gradient(90deg, #f59e0b, #fbbf24); }
    .rate-fill.red { background: linear-gradient(90deg, #dc2626, #ef4444); }
    .rate-mark { font-size: 12px; color: #16a34a; margin-top: 8px; }
    .scenarios { padding: 24px; }
    .scenarios-title { font-size: 16px; font-weight: 700; margin-bottom: 16px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; }
    .scenario-card { background: #f8fafc; border-radius: 12px; padding: 16px; margin-bottom: 16px; border: 1px solid #e2e8f0; }
    .scenario-card.passed { border-left: 4px solid #16a34a; }
    .scenario-card.failed { border-left: 4px solid #dc2626; }
    .scenario-head { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
    .scenario-icon { font-size: 20px; }
    .scenario-name { font-weight: 600; }
    .scenario-badge { padding: 4px 12px; border-radius: 16px; font-size: 12px; font-weight: 600; }
    .scenario-badge.passed { background: #dcfce7; color: #16a34a; }
    .scenario-badge.failed { background: #fee2e2; color: #dc2626; }
    .scenario-time { font-size: 12px; color: #94a3b8; }
    .scenario-stats { display: flex; gap: 24px; margin-bottom: 12px; }
    .scenario-stat { text-align: center; }
    .scenario-stat strong { font-size: 18px; }
    .scenario-stat label { font-size: 12px; color: #64748b; }
    .dims { margin-bottom: 12px; }
    .dims-title { font-size: 12px; color: #64748b; margin-bottom: 8px; }
    .dim { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
    .dim-name { width: 80px; font-size: 12px; }
    .dim-bar { flex: 1; height: 8px; background: #e2e8f0; border-radius: 4px; }
    .dim-fill { height: 100%; border-radius: 4px; }
    .dim-fill.green { background: #22c55e; }
    .dim-fill.red { background: #ef4444; }
    .dim-value { width: 60px; font-size: 12px; text-align: right; }
    .comment { padding: 12px; border-radius: 8px; font-size: 12px; }
    .comment.passed { background: #dcfce7; }
    .comment.failed { background: #fee2e2; }
    .comment-title { font-weight: 600; margin-bottom: 4px; }
    .conclusion { padding: 24px; border-radius: 12px; margin: 24px; }
    .conclusion.passed { background: linear-gradient(135deg, #dcfce7, #d1fae5); }
    .conclusion.amber { background: linear-gradient(135deg, #fef3c7, #fde68a); }
    .conclusion-icon { font-size: 24px; }
    .conclusion-title { font-weight: 700; margin: 8px 0; }
    .conclusion-text { font-size: 14px; line-height: 1.6; }
    .footer { text-align: center; padding: 24px; color: #94a3b8; font-size: 12px; border-top: 1px solid #e2e8f0; }
  `;

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>人工评估综合报告 - ${employee.name}</title>
  <style>${styles}</style>
</head>
<body>
  <div class="container">
    <div class="header ${allPassed ? 'passed' : 'amber'}">
      <div class="icon">${allPassed ? '✓' : '⚠'}</div>
      <h1 class="title">${allPassed ? '人工评估通过' : '部分场景未通过'}</h1>
      <p class="subtitle">${employee.name} · ${employee.desc || '数字员工'} · 评估时间: ${now}</p>
    </div>

    <div class="stats">
      <div class="stat"><div class="stat-value indigo">${total}</div><div class="stat-label">评估场景</div></div>
      <div class="stat"><div class="stat-value green">${passed}</div><div class="stat-label">通过场景</div></div>
      <div class="stat"><div class="stat-value red">${failed}</div><div class="stat-label">未通过场景</div></div>
      <div class="stat"><div class="stat-value ${passRate >= 100 ? 'green' : passRate >= 80 ? 'amber' : 'red'}">${passRate}%</div><div class="stat-label">通过率</div></div>
    </div>

    <div class="rate-bar">
      <div class="rate-label">通过率 ${passRate}%</div>
      <div class="rate-track"><div class="rate-fill ${passRate >= 100 ? 'green' : passRate >= 80 ? 'amber' : 'red'}" style="width: ${passRate}%"></div></div>
      <div class="rate-mark">合格线 100%</div>
    </div>

    <div class="scenarios">
      <div class="scenarios-title">场景评估详情</div>
      ${scenarios.map(s => `
      <div class="scenario-card ${s.verdict}">
        <div class="scenario-head">
          <span class="scenario-icon">${s.verdict === 'passed' ? '✓' : '×'}</span>
          <span class="scenario-name">${s.scenario_name}</span>
          <span class="scenario-badge ${s.verdict}">${s.verdict === 'passed' ? '合格' : '不合格'}</span>
          <span class="scenario-time">${s.started_at} - ${s.completed_at}</span>
        </div>
        <div class="scenario-stats">
          <div class="scenario-stat"><strong class="indigo">${s.message_count}</strong><label>对话轮数</label></div>
          <div class="scenario-stat"><strong class="${s.verdict === 'passed' ? 'green' : 'red'}">${s.verdict === 'passed' ? '100%' : '0%'}</strong><label>场景通过率</label></div>
          <div class="scenario-stat"><strong>15min</strong><label>评估耗时</label></div>
        </div>
        <div class="dims">
          <div class="dims-title">评估维度</div>
          ${['交互质量', '问题解决', '流程合规', '响应时效'].map(dim => `
          <div class="dim">
            <span class="dim-name">${dim}</span>
            <div class="dim-bar"><div class="dim-fill ${s.verdict === 'passed' ? 'green' : 'red'}" style="width: ${s.verdict === 'passed' ? '85%' : '40%'}"></div></div>
            <span class="dim-value ${s.verdict === 'passed' ? 'green' : 'red'}">${s.verdict === 'passed' ? '良好' : '待改进'}</span>
          </div>
          `).join('')}
        </div>
        <div class="comment ${s.verdict}">
          <div class="comment-title">判定备注</div>
          <p>${s.verdict_comment || '无备注'}</p>
        </div>
      </div>
      `).join('')}
    </div>

    <div class="conclusion ${allPassed ? 'passed' : 'amber'}">
      <span class="conclusion-icon">${allPassed ? '✓' : '⚠'}</span>
      <div class="conclusion-title">评估结论</div>
      <p class="conclusion-text">
        该数字员工经过人工评估，共测试 <strong>${total} 个场景</strong>，其中 <strong style="color:#16a34a">${passed} 个合格</strong>
        ${failed > 0 ? `，<strong style="color:#dc2626">${failed} 个不合格</strong>` : ''}。
        ${allPassed
          ? '所有场景均已通过评估，数字员工具备上岗能力，建议安排上岗。'
          : '存在不合格场景，建议修改配置后重新评估，或由审核人员决定是否强制上岗。'}
      </p>
    </div>

    <div class="footer">
      <p>本报告由 Ncrew Hire 系统自动生成 · ${now}</p>
    </div>
  </div>
</body>
</html>`;
}

function HumanComprehensiveReport({ scenarios, onConfirmOnboarding, onModifyConfig, onForceOnboarding }) {
  const passed = scenarios.filter(s => s.verdict === 'passed').length;
  const failed = scenarios.filter(s => s.verdict === 'failed').length;
  const total = scenarios.length;
  const allPassed = passed === total && scenarios.every(s => s.status === 'completed');
  const passRate = Math.round((passed / total) * 100);

  return (
    <div className="human-report-modal-content">
      <div className={`human-report-modal-header ${allPassed ? 'passed' : 'amber'}`}>
        <div className={`human-report-modal-icon ${allPassed ? 'passed' : 'amber'}`}>
          {allPassed ? '✓' : '⚠'}
        </div>
        <div className="human-report-modal-title">
          {allPassed ? '人工评估通过' : '部分场景未通过'}
        </div>
        <p>共评估 {total} 个场景，通过 {passed} 个，通过率 {passRate}%</p>
      </div>

      <div className="human-report-stats">
        <div className="human-report-stat"><span className="indigo">{total}</span><label>评估场景</label></div>
        <div className="human-report-stat"><span className="green">{passed}</span><label>通过场景</label></div>
        <div className="human-report-stat"><span className="red">{failed}</span><label>未通过场景</label></div>
        <div className="human-report-stat"><span className={passRate >= 100 ? 'green' : passRate >= 80 ? 'amber' : 'red'}>{passRate}%</span><label>通过率</label></div>
      </div>

      <div className="human-report-rate-bar">
        <div className="human-report-rate-label">通过率 {passRate}%</div>
        <div className="human-report-rate-track">
          <div className={`human-report-rate-fill ${passRate >= 100 ? 'green' : passRate >= 80 ? 'amber' : 'red'}`} style={{ width: `${passRate}%` }} />
        </div>
        <div className="human-report-rate-mark"><span className="green">合格线 100%</span></div>
      </div>

      <div className="human-report-scenarios">
        <label>场景评估详情</label>
        <div className="human-report-scenarios-list">
          {scenarios.map(s => (
            <div key={s.scenario_id} className={`human-report-scenario-card ${s.verdict}`}>
              <div className="human-report-scenario-head">
                {s.verdict === 'passed' ? '✓' : '×'}
                <span className="human-report-scenario-name">{s.scenario_name}</span>
                <span className={`human-report-scenario-badge ${s.verdict}`}>
                  {s.verdict === 'passed' ? '合格' : '不合格'}
                </span>
                <span className="human-report-scenario-time">{s.started_at} - {s.completed_at}</span>
              </div>
              <div className="human-report-scenario-stats">
                <div><strong className="indigo">{s.message_count}</strong><label>对话轮数</label></div>
                <div><strong className={s.verdict === 'passed' ? 'green' : 'red'}>{s.verdict === 'passed' ? '100%' : '0%'}</strong><label>场景通过率</label></div>
                <div><strong>15min</strong><label>评估耗时</label></div>
              </div>
              <div className="human-report-scenario-dims">
                <label>评估维度</label>
                {['交互质量', '问题解决', '流程合规', '响应时效'].map(dim => (
                  <div key={dim} className="human-report-scenario-dim">
                    <span>{dim}</span>
                    <div className="human-report-scenario-dim-bar">
                      <div className={`human-report-scenario-dim-fill ${s.verdict === 'passed' ? 'green' : 'red'}`} style={{ width: s.verdict === 'passed' ? '85%' : '40%' }} />
                    </div>
                    <span className={s.verdict === 'passed' ? 'green' : 'red'}>{s.verdict === 'passed' ? '良好' : '待改进'}</span>
                  </div>
                ))}
              </div>
              <div className={`human-report-scenario-comment ${s.verdict}`}>
                <label>判定备注</label>
                <p>{s.verdict_comment || '无备注'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={`human-report-conclusion ${allPassed ? 'passed' : 'amber'}`}>
        {allPassed ? '✓' : '⚠'}
        <label>评估结论</label>
        <p>该数字员工经过人工评估，共测试 <strong>{total} 个场景</strong>，其中 <strong className="green">{passed} 个合格</strong>
        {failed > 0 && <>，<strong className="red">{failed} 个不合格</strong></>}。
        {allPassed
          ? '所有场景均已通过评估，数字员工具备上岗能力，建议安排上岗。'
          : '存在不合格场景，建议修改配置后重新评估，或由审核人员决定是否强制上岗。'}
        </p>
      </div>

      <div className="human-report-actions">
        <button className={`human-report-action-primary ${allPassed ? '' : 'disabled'}`} onClick={onConfirmOnboarding} disabled={!allPassed}>
          ✓ 确认上岗 — 所有场景均已通过评估
        </button>
        {!allPassed && (
          <>
            <button className="human-report-action-secondary" onClick={onModifyConfig}>
              🔧 修改配置重新评估
            </button>
            <button className="human-report-action-amber" onClick={onForceOnboarding}>
              🛡 强制上岗 — 存在不合格场景，但仍要求上岗
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ===== Human Evaluation Page =====
function HumanEvalPage({ id, go, toast }) {
  const e = window.findEmployeeById(id) || window.DEPT_EMPLOYEES[1];
  const [scenarios, setScenarios] = _useStateE(HUMAN_SCENARIOS);
  const [messages, setMessages] = _useStateE(HUMAN_MESSAGES);
  const [currentScenarioId, setCurrentScenarioId] = _useStateE('HS-002');
  const [chatInput, setChatInput] = _useStateE('');
  const [artifactTab, setArtifactTab] = _useStateE('conversation');
  const [rightCollapsed, setRightCollapsed] = _useStateE(false);
  const [showReportModal, setShowReportModal] = _useStateE(false);
  const [onboardingSubmitted, setOnboardingSubmitted] = _useStateE(false);

  const allCompleted = scenarios.every(s => s.status === 'completed');
  const hasOnboardingRequest = messages.some(m => m.type === 'onboarding_request');
  const showReportButton = allCompleted && (hasOnboardingRequest || onboardingSubmitted);

  const currentScenario = scenarios.find(s => s.scenario_id === currentScenarioId) || scenarios[0];

  const TABS = [
    { key: 'conversation', label: '对话记录' },
    { key: 'trace', label: 'Trace' },
    { key: 'report', label: '评估报告' },
  ];

  return (
    <div className="page human-page">
      <div className="human-topbar">
        <button className="human-back" onClick={() => go(`employee/${e.id}`)}>
          <window.Icon.back className="icn" />
          返回
        </button>
        <div className="human-topbar-divider" />
        <div>
          <h1 className="human-topbar-title">人工评估</h1>
          <p className="human-topbar-sub">{e.name} · {e.desc || '数字员工'}</p>
        </div>
        <div className="human-topbar-badges">
          <span className="human-badge green">AI 评估已通过</span>
          <span className="human-badge indigo">人工评估进行中</span>
          {showReportButton && (
            <button className="btn btn-primary btn-sm" onClick={() => setShowReportModal(true)}>
              查看综合报告
            </button>
          )}
        </div>
      </div>

      <div className="human-progress-wrap">
        <HumanScenarioProgressBar scenarios={scenarios} />
      </div>

      <div className="human-main">
        <div className="human-chat-panel">
          <div className="human-nav-wrap">
            <HumanScenarioNavigator
              scenarios={scenarios}
              currentScenarioId={currentScenarioId}
              onNavigate={setCurrentScenarioId}
            />
          </div>
          <div className="human-messages">
            {messages.map(msg => (
              <HumanChatMessage
                key={msg.message_id}
                msg={msg}
                scenarios={scenarios}
                onVerdictSubmit={(verdict, comment, messageId) => {
                  setMessages(prev => prev.map(m =>
                    m.message_id === messageId
                      ? { ...m, submitted: true, submittedVerdict: verdict, submittedComment: comment }
                      : m
                  ));
                  setScenarios(prev => prev.map(s =>
                    s.scenario_id === currentScenarioId
                      ? { ...s, status: 'completed', verdict, verdict_comment: comment }
                      : s
                  ));
                  toast(`场景判定已提交: ${verdict === 'passed' ? '合格' : '不合格'}`);
                }}
                onOnboardingSubmit={(decision, comment, messageId) => {
                  setOnboardingSubmitted(true);
                  setMessages(prev => prev.map(m =>
                    m.message_id === messageId
                      ? { ...m, submitted: true, submittedOnboarding: decision, submittedComment: comment }
                      : m
                  ));
                  setShowReportModal(true);
                  toast(`上岗判定已提交: ${decision === 'onboard' ? '上岗' : decision === 'force' ? '强制上岗' : '不上岗'}`);
                }}
              />
            ))}
          </div>
          <div className="human-input">
            <input
              value={chatInput}
              onChange={evt => setChatInput(evt.target.value)}
              placeholder={hasOnboardingRequest ? "请先完成上岗判定..." : "输入消息与数字员工对话..."}
              disabled={hasOnboardingRequest}
            />
            <button className="human-input-send" disabled={hasOnboardingRequest}>
              <window.Icon.arrow className="icn" />
            </button>
            {!hasOnboardingRequest && (
              <button className="human-input-end" onClick={() => toast("场景评估已结束")}>
                结束评估
              </button>
            )}
          </div>
        </div>

        <div className={`human-artifact-panel ${rightCollapsed ? 'collapsed' : ''}`}>
          {rightCollapsed ? (
            <button className="human-artifact-expand" onClick={() => setRightCollapsed(false)}>
              <window.Icon.arrow className="icn" style={{ transform: 'rotate(90deg)' }} />
            </button>
          ) : (
            <>
              <div className="human-artifact-head">
                <div className="human-artifact-scenario">
                  <label>场景:</label>
                  <select value={currentScenarioId} onChange={e => setCurrentScenarioId(e.target.value)}>
                    {scenarios.map(s => (
                      <option key={s.scenario_id} value={s.scenario_id}>
                        {s.scenario_name} ({s.status === 'completed' ? (s.verdict === 'passed' ? '✓' : '×') : '⏳'})
                      </option>
                    ))}
                  </select>
                </div>
                <button className="human-artifact-collapse" onClick={() => setRightCollapsed(true)}>
                  <window.Icon.arrow className="icn" style={{ transform: 'rotate(-90deg)' }} />
                </button>
              </div>

              <div className="human-artifact-tabs">
                {TABS.map(tab => (
                  <button
                    key={tab.key}
                    className={`human-artifact-tab ${artifactTab === tab.key ? 'active' : ''}`}
                    onClick={() => setArtifactTab(tab.key)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="human-artifact-content">
                {artifactTab === 'conversation' && <HumanConversationPanel messages={messages} currentScenarioId={currentScenarioId} />}
                {artifactTab === 'trace' && <HumanTracePanel messages={messages} currentScenarioId={currentScenarioId} />}
                {artifactTab === 'report' && <HumanReportPanel currentScenario={currentScenario} />}
              </div>
            </>
          )}
        </div>
      </div>

      {showReportModal && (
        <div className="human-modal-mask" onClick={() => setShowReportModal(false)}>
          <div className="human-modal" onClick={e => e.stopPropagation()}>
            <div className="human-modal-head">
              <span className="human-modal-icon">✓</span>
              <h2 className="human-modal-title">人工评估综合报告</h2>
              <button className="human-modal-download" onClick={() => {
                const reportHtml = generateHumanReportHtml(scenarios, e);
                const blob = new Blob([reportHtml], { type: 'text/html;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `人工评估报告_${e.name}_${new Date().toISOString().slice(0,10)}.html`;
                a.click();
                URL.revokeObjectURL(url);
                toast('报告已下载');
              }}>
                ⬇ 下载报告
              </button>
              <button className="human-modal-close" onClick={() => setShowReportModal(false)}>
                ×
              </button>
            </div>
            <div className="human-modal-body">
              <HumanComprehensiveReport
                scenarios={scenarios}
                onConfirmOnboarding={() => {
                  setShowReportModal(false);
                  toast("人工评估通过 · 进入发布确认");
                  go(`publish/${e.id}`);
                }}
                onModifyConfig={() => setShowReportModal(false)}
                onForceOnboarding={() => {
                  setShowReportModal(false);
                  toast("强制上岗 · 进入发布确认");
                  go(`publish/${e.id}`);
                }}
              />
            </div>
          </div>
        </div>
      )}
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