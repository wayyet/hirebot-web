import { useState, useMemo } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import {
  ArrowLeft, Send, Paperclip, CheckCircle, XCircle, AlertTriangle,
  ChevronDown, ChevronRight, Package, Loader2, FileText, BarChart2,
  Zap, MessageSquare, Upload, Download,
} from 'lucide-react'
import { digitalEmployees as mockEmployees } from '../mock/data'
import { loadUserEmployees } from '../utils/storage'

// ─── Mock Data ────────────────────────────────────────────────────────────────

// 评估本体状态（v0.8 新增）
const MOCK_ONTOLOGY_STATUS = {
  isReady: true,
  dimensions: [
    { id: 'dim_func', name: '功能完整性', weight: 0.25, threshold: 60, status: 'ready' as const },
    { id: 'dim_interact', name: '交互质量', weight: 0.30, threshold: 60, status: 'ready' as const },
    { id: 'dim_process', name: '流程合规', weight: 0.15, threshold: 60, status: 'ready' as const },
    { id: 'dim_problem', name: '问题解决', weight: 0.20, threshold: 60, status: 'ready' as const },
    { id: 'dim_tool', name: '工具调用正确性', weight: 0.10, threshold: 0, status: 'ready' as const },
  ],
  criticalRequirements: [
    { id: 'critical_ticket', name: '必须创建工单', status: 'ready' as const },
  ],
  source: '雇佣流程资料解析',
}

const MOCK_SCENARIOS = [
  { id: 's1', name: '电商商品质量申诉处理', status: 'ready' as const, testCaseCount: 2, source: 'hiring_process' as const },
  { id: 's2', name: '退款处理流程', status: 'ready' as const, testCaseCount: 1, source: 'hiring_process' as const },
  { id: 's3', name: '用户投诉升级处理', status: 'ready' as const, testCaseCount: 1, source: 'hiring_process' as const },
]

const MOCK_TEST_CASE = {
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
}

const MOCK_EXECUTION_TRACE = {
  logs: [
    { type: 'thought', time: '0:00:03', content: '用户情绪激动，需要先安抚，再处理问题。' },
    { type: 'message', time: '0:00:08', role: 'assistant', content: '您好，非常理解您的困扰，商品出现质量问题确实让人着急。我是您的专属客服，马上为您处理这个问题，请您放心。' },
    { type: 'tool_call', time: '0:00:15', tool: 'query_product_info', params: { product_id: 'PROD-12345' }, result: { return_eligible: true }, success: true },
    { type: 'thought', time: '0:00:20', content: '商品在保修期内，符合退换条件。用户情绪激动，应快速处理。' },
    { type: 'tool_call', time: '0:00:28', tool: 'create_ticket', params: { user_id: 'USER-67890', issue_type: 'quality_problem', resolution: 'refund' }, result: { ticket_id: 'WO-20260418-001' }, success: true },
    { type: 'message', time: '0:00:35', role: 'assistant', content: '已经为您登记了退货退款申请，工单号 WO-20260418-001。预计 3 个工作日内退款到账，请您留意。' },
  ],
  summary: { total_tool_calls: 2, success_rate: 1.0, execution_time: '35s' },
}

const MOCK_ITERATIONS = [
  {
    round: 1,
    score: 48,
    passed: false,
    dimensions: [
      { name: '功能完整性', weight: '25%', score: 45, threshold: 60, ontologyId: 'dim_func', status: '不合格' as const },
      { name: '交互质量', weight: '30%', score: 50, threshold: 60, ontologyId: 'dim_interact', status: '不合格' as const },
      { name: '流程合规', weight: '15%', score: 48, threshold: 60, ontologyId: 'dim_process', status: '不合格' as const },
      { name: '问题解决', weight: '20%', score: 49, threshold: 60, ontologyId: 'dim_problem', status: '不合格' as const },
      { name: '工具调用正确性', weight: '10%', score: 40, threshold: '动态', ontologyId: 'dim_tool', status: '不合格' as const },
    ],
    issues: [
      { id: 'ISS-001', title: '未按照流程执行必要步骤', impact: '业务无法推进', severity: '严重' as const },
      { id: 'ISS-002', title: '工具调用错误/遗漏', impact: '无工单记录、无法追溯', severity: '高' as const },
    ],
    modifications: [
      {
        id: 'MOD-001',
        type: 'system_prompt' as const,
        title: 'Prompt 增强 - 增加流程强制规则',
        before: '你是销售跟进助理，负责处理商机信息。',
        after: '你是销售跟进助理。你必须按顺序执行：① 判断优先级 → ② 生成提醒 → ③ 推送负责人 → ④ 更新 CRM，每步不可跳过。',
        expectedGain: '流程合规性 +20',
      },
    ],
    ontologySource: {
      roleTypeId: 'role_cs_001',
      roleName: 'customer_service',
      dimensionsQueried: MOCK_ONTOLOGY_STATUS.dimensions,
      criticalRequirementsQueried: MOCK_ONTOLOGY_STATUS.criticalRequirements,
    },
  },
  {
    round: 2,
    score: 66,
    passed: false,
    dimensions: [
      { name: '功能完整性', weight: '25%', score: 63, threshold: 60, ontologyId: 'dim_func', status: '不合格' as const },
      { name: '交互质量', weight: '30%', score: 68, threshold: 60, ontologyId: 'dim_interact', status: '良好' as const },
      { name: '流程合规', weight: '15%', score: 58, threshold: 60, ontologyId: 'dim_process', status: '不合格' as const },
      { name: '问题解决', weight: '20%', score: 70, threshold: 60, ontologyId: 'dim_problem', status: '良好' as const },
      { name: '工具调用正确性', weight: '10%', score: 55, threshold: '动态', ontologyId: 'dim_tool', status: '不合格' as const },
    ],
    issues: [
      { id: 'ISS-003', title: '工具调用时机错误', impact: '未核实信息就调用退款接口', severity: '中' as const },
    ],
    modifications: [
      {
        id: 'MOD-002',
        type: 'tool_config' as const,
        title: '工具调用顺序约束',
        before: '无调用顺序约束',
        after: 'create_ticket 必须在 query_product_info 成功后才可调用，否则返回错误提示',
        expectedGain: '工具调用正确性 +25',
      },
    ],
    ontologySource: {
      roleTypeId: 'role_cs_001',
      roleName: 'customer_service',
      dimensionsQueried: MOCK_ONTOLOGY_STATUS.dimensions,
      criticalRequirementsQueried: MOCK_ONTOLOGY_STATUS.criticalRequirements,
    },
  },
  {
    round: 3,
    score: 85,
    passed: true,
    dimensions: [
      { name: '功能完整性', weight: '25%', score: 90, threshold: 60, ontologyId: 'dim_func', status: '优秀' as const },
      { name: '交互质量', weight: '30%', score: 82, threshold: 60, ontologyId: 'dim_interact', status: '良好' as const },
      { name: '流程合规', weight: '15%', score: 88, threshold: 60, ontologyId: 'dim_process', status: '优秀' as const },
      { name: '问题解决', weight: '20%', score: 80, threshold: 60, ontologyId: 'dim_problem', status: '良好' as const },
      { name: '工具调用正确性', weight: '10%', score: 95, threshold: '动态', ontologyId: 'dim_tool', status: '优秀' as const },
    ],
    issues: [],
    modifications: [],
    ontologySource: {
      roleTypeId: 'role_cs_001',
      roleName: 'customer_service',
      dimensionsQueried: MOCK_ONTOLOGY_STATUS.dimensions,
      criticalRequirementsQueried: MOCK_ONTOLOGY_STATUS.criticalRequirements,
    },
  },
]

// ─── Score Trend Chart ────────────────────────────────────────────────────────

function ScoreTrendChart({ iterations }: { iterations: typeof MOCK_ITERATIONS }) {
  const W = 320
  const H = 100
  const PAD = { top: 12, right: 16, bottom: 20, left: 28 }
  const innerW = W - PAD.left - PAD.right
  const innerH = H - PAD.top - PAD.bottom

  const scores = iterations.map(it => it.score)
  const maxX = Math.max(iterations.length - 1, 1)
  const passingScore = 75

  const px = (i: number) => PAD.left + (i / maxX) * innerW
  const py = (s: number) => PAD.top + innerH - (s / 100) * innerH

  const pathD = scores.map((s, i) => `${i === 0 ? 'M' : 'L'} ${px(i)} ${py(s)}`).join(' ')
  const areaD = `${pathD} L ${px(scores.length - 1)} ${PAD.top + innerH} L ${PAD.left} ${PAD.top + innerH} Z`

  const thresholdY = py(passingScore)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 100 }}>
      {/* Grid lines */}
      {[0, 25, 50, 75, 100].map(v => (
        <line key={v} x1={PAD.left} y1={py(v)} x2={W - PAD.right} y2={py(v)} stroke="#f1f5f9" strokeWidth="1" />
      ))}

      {/* Passing score line */}
      <line x1={PAD.left} y1={thresholdY} x2={W - PAD.right} y2={thresholdY} stroke="#22c55e" strokeWidth="1.5" strokeDasharray="4 3" />
      <text x={W - PAD.right + 2} y={thresholdY + 3} fontSize="9" fill="#22c55e">合格线 75</text>

      {/* Area fill */}
      <path d={areaD} fill="#6366f1" fillOpacity="0.08" />

      {/* Line */}
      <path d={pathD} fill="none" stroke="#6366f1" strokeWidth="2" strokeLinejoin="round" />

      {/* Dots + labels */}
      {scores.map((s, i) => {
        const passed = iterations[i].passed
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
        )
      })}
    </svg>
  )
}

// ─── Generate Report HTML ──────────────────────────────────────────────────────

function generateReportHTML(iterations: typeof MOCK_ITERATIONS): string {
  const finalIteration = iterations[iterations.length - 1]
  const firstIteration = iterations[0]
  const improvement = finalIteration.score - firstIteration.score
  const allModifications = iterations.flatMap(it =>
    it.modifications.map(mod => ({ round: it.round, ...mod }))
  )
  const dimensionNames = ['功能完整性', '交互质量', '流程合规', '问题解决', '工具调用正确性']
  const now = new Date().toLocaleString('zh-CN')

  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>数字员工评估训练报告</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px 20px; background: #f8fafc; }
    h1 { color: #1e293b; font-size: 24px; margin-bottom: 8px; }
    h2 { color: #475569; font-size: 16px; margin: 24px 0 12px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; }
    .meta { color: #64748b; font-size: 14px; margin-bottom: 32px; }
    .result-box { background: ${finalIteration.passed ? '#f0fdf4' : '#fef2f2'}; border: 2px solid ${finalIteration.passed ? '#86efac' : '#fca5a5'}; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px; }
    .result-title { font-size: 20px; font-weight: bold; color: ${finalIteration.passed ? '#166534' : '#dc2626'}; }
    .result-score { font-size: 36px; font-weight: bold; color: ${finalIteration.passed ? '#16a34a' : '#ef4444'}; margin: 8px 0; }
    .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
    .stat-box { background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; text-align: center; }
    .stat-value { font-size: 24px; font-weight: bold; color: #4f46e5; }
    .stat-label { color: #64748b; font-size: 12px; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; margin-bottom: 24px; }
    th, td { padding: 12px; text-align: center; border: 1px solid #e2e8f0; }
    th { background: #f1f5f9; color: #64748b; font-weight: 500; }
    .score-pass { color: #16a34a; font-weight: bold; }
    .score-fail { color: #ef4444; font-weight: bold; }
    .modification { background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 12px; }
    .modification-header { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
    .modification-round { width: 24px; height: 24px; background: #e0e7ff; color: #4338ca; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px; }
    .modification-title { font-weight: 500; color: #1e293b; }
    .modification-type { background: #e0e7ff; color: #4338ca; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 500; margin-left: auto; }
    .modification-diff { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .diff-before { background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 12px; }
    .diff-after { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 12px; }
    .diff-label { font-size: 11px; font-weight: 500; margin-bottom: 4px; }
    .diff-label-before { color: #dc2626; }
    .diff-label-after { color: #16a34a; }
    .conclusion { background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; }
    .conclusion-title { font-weight: 500; color: #475569; margin-bottom: 8px; }
    .warning { color: #d97706; margin-top: 12px; }
  </style>
</head>
<body>
  <h1>数字员工评估训练报告</h1>
  <p class="meta">生成时间：${now}</p>

  <div class="result-box">
    <div class="result-title">${finalIteration.passed ? '✅ 评估通过' : '❌ 训练失败'}</div>
    <div class="result-score">${finalIteration.score} 分</div>
    <p>第 ${iterations.length} 轮达到${finalIteration.passed ? '合格线' : '最大轮次'}</p>
  </div>

  <div class="stats-grid">
    <div class="stat-box">
      <div class="stat-value">${iterations.length}</div>
      <div class="stat-label">训练轮次</div>
    </div>
    <div class="stat-box">
      <div class="stat-value" style="color: ${improvement > 0 ? '#16a34a' : '#ef4444'}">${improvement > 0 ? '+' : ''}${improvement}</div>
      <div class="stat-label">分数提升</div>
    </div>
    <div class="stat-box">
      <div class="stat-value" style="color: #d97706">${allModifications.length}</div>
      <div class="stat-label">修改次数</div>
    </div>
  </div>

  <h2>维度得分对比</h2>
  <table>
    <thead>
      <tr>
        <th style="text-align:left">维度</th>
        ${iterations.map(it => `<th>第${it.round}轮</th>`).join('')}
        <th style="color:#16a34a">目标</th>
      </tr>
    </thead>
    <tbody>
      ${dimensionNames.map(dimName => {
        const scoresByRound = iterations.map(it =>
          it.dimensions.find(d => d.name === dimName)?.score || 0
        )
        const finalScore = scoresByRound[scoresByRound.length - 1]
        const reached = finalScore >= 75
        return `
          <tr>
            <td style="text-align:left">${dimName}</td>
            ${scoresByRound.map((score, i) => `
              <td class="${i === scoresByRound.length - 1 ? (reached ? 'score-pass' : 'score-fail') : ''}">
                ${score}${i > 0 && score > scoresByRound[i-1] ? ' ↑' : ''}
              </td>
            `).join('')}
            <td>75</td>
          </tr>
        `
      }).join('')}
    </tbody>
  </table>

  ${allModifications.length > 0 ? `
    <h2>修改历史</h2>
    ${allModifications.map(mod => `
      <div class="modification">
        <div class="modification-header">
          <span class="modification-round">${mod.round}</span>
          <span class="modification-title">${mod.title}</span>
          <span class="modification-type">${mod.type === 'system_prompt' ? 'Prompt' : mod.type === 'tool_config' ? '工具' : 'Few-shot'}</span>
        </div>
        <div class="modification-diff">
          <div class="diff-before">
            <div class="diff-label diff-label-before">修改前</div>
            <div>${mod.before}</div>
          </div>
          <div class="diff-after">
            <div class="diff-label diff-label-after">修改后</div>
            <div>${mod.after}</div>
          </div>
        </div>
        <p style="color:#4338ca;margin-top:8px;font-size:12px">预期效果：${mod.expectedGain}</p>
      </div>
    `).join('')}
  ` : ''}

  <h2>结论</h2>
  <div class="conclusion">
    <div class="conclusion-title">📋 总结</div>
    <p>该数字员工经过 <strong>${iterations.length} 轮训练</strong>，从初始 <strong>${firstIteration.score} 分</strong> 提升至 <strong style="color:${finalIteration.passed ? '#16a34a' : '#ef4444'}">${finalIteration.score} 分</strong>，${finalIteration.passed ? '已达到合格标准，具备上岗能力。' : '未能达到合格标准，建议人工介入调整或重新设计。'}</p>
    ${!finalIteration.passed ? '<p class="warning">⚠️ 训练已达到最大轮次限制，系统自动停止。</p>' : ''}
  </div>
</body>
</html>
  `
}

function downloadReport(iterations: typeof MOCK_ITERATIONS) {
  const html = generateReportHTML(iterations)
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `评估训练报告_${new Date().toISOString().slice(0, 10)}.html`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// ─── Summary Report Panel ─────────────────────────────────────────────────────

function SummaryReportPanel({ iterations }: { iterations: typeof MOCK_ITERATIONS }) {
  const finalIteration = iterations[iterations.length - 1]
  const firstIteration = iterations[0]
  const improvement = finalIteration.score - firstIteration.score

  const allModifications = iterations.flatMap(it =>
    it.modifications.map(mod => ({ round: it.round, ...mod }))
  )

  const dimensionNames = ['功能完整性', '交互质量', '流程合规', '问题解决', '工具调用正确性']

  return (
    <div className="p-3 space-y-4 text-xs">
      {/* Header */}
      <div className={`text-center rounded-xl p-4 ${finalIteration.passed ? 'bg-emerald-50 border-2 border-emerald-200' : 'bg-red-50 border-2 border-red-200'}`}>
        <div className={`w-10 h-10 rounded-full mx-auto flex items-center justify-center mb-2 ${finalIteration.passed ? 'bg-emerald-500' : 'bg-red-400'}`}>
          {finalIteration.passed ? <CheckCircle size={20} className="text-white" /> : <XCircle size={20} className="text-white" />}
        </div>
        <div className={`text-xl font-black mb-0.5 ${finalIteration.passed ? 'text-emerald-600' : 'text-red-500'}`}>
          {finalIteration.passed ? '评估通过' : '训练失败'}
        </div>
        <p className="text-slate-500">
          第 {iterations.length} 轮达到{finalIteration.passed ? '合格线' : '最大轮次'}，综合得分 {finalIteration.score} 分
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white border border-slate-200 rounded-lg p-2.5 text-center">
          <div className="text-lg font-black text-indigo-600">{iterations.length}</div>
          <div className="text-slate-500">训练轮次</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-2.5 text-center">
          <div className={`text-lg font-black ${improvement > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            {improvement > 0 ? '+' : ''}{improvement}
          </div>
          <div className="text-slate-500">分数提升</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-2.5 text-center">
          <div className="text-lg font-black text-amber-600">{allModifications.length}</div>
          <div className="text-slate-500">修改次数</div>
        </div>
      </div>

      {/* Score Trend */}
      <div>
        <div className="font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
          <BarChart2 size={12} />
          得分趋势
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-3">
          <ScoreTrendChart iterations={iterations} />
        </div>
      </div>

      {/* Dimension Comparison Table */}
      <div>
        <div className="font-semibold text-slate-700 mb-2">维度得分对比</div>
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="text-left px-3 py-2 font-medium">维度</th>
                {iterations.map(it => (
                  <th key={it.round} className="text-center px-2 py-2 font-medium">
                    第{it.round}轮
                  </th>
                ))}
                <th className="text-center px-2 py-2 font-medium text-emerald-600">目标</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dimensionNames.map(dimName => {
                const scoresByRound = iterations.map(it =>
                  it.dimensions.find(d => d.name === dimName)?.score || 0
                )
                const finalScore = scoresByRound[scoresByRound.length - 1]
                const target = 75
                const reached = finalScore >= target

                return (
                  <tr key={dimName}>
                    <td className="px-3 py-2 text-slate-700">{dimName}</td>
                    {scoresByRound.map((score, i) => (
                      <td key={i} className={`text-center px-2 py-2 font-bold ${
                        i === scoresByRound.length - 1
                          ? reached ? 'text-emerald-600' : 'text-red-500'
                          : 'text-slate-600'
                      }`}>
                        {score}
                        {i > 0 && score > scoresByRound[i-1] && (
                          <span className="text-emerald-400 ml-0.5">↑</span>
                        )}
                      </td>
                    ))}
                    <td className="text-center px-2 py-2 text-slate-400">{target}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modification History */}
      <div>
        <div className="font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
          <Zap size={12} />
          修改历史
        </div>
        <div className="space-y-2">
          {allModifications.map(mod => (
            <div key={mod.id} className="bg-white border border-slate-200 rounded-lg p-2.5">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold flex items-center justify-center">
                  {mod.round}
                </span>
                <span className="font-medium text-slate-700">{mod.title}</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-indigo-100 text-indigo-600 rounded font-semibold ml-auto">
                  {mod.type === 'system_prompt' ? 'Prompt' : mod.type === 'tool_config' ? '工具' : 'Few-shot'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-red-50 border border-red-100 rounded p-2">
                  <div className="text-[10px] text-red-600 font-medium mb-0.5">修改前</div>
                  <div className="text-red-700 leading-relaxed">{mod.before}</div>
                </div>
                <div className="bg-emerald-50 border border-emerald-100 rounded p-2">
                  <div className="text-[10px] text-emerald-600 font-medium mb-0.5">修改后</div>
                  <div className="text-emerald-700 leading-relaxed">{mod.after}</div>
                </div>
              </div>
              <div className="text-indigo-500 mt-1.5 text-[10px]">预期效果：{mod.expectedGain}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Conclusion */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
        <div className="font-semibold text-slate-700 mb-1.5">📋 结论</div>
        <p className="text-slate-600 leading-relaxed">
          该数字员工经过 <strong>{iterations.length} 轮训练</strong>，
          从初始 <strong>{firstIteration.score} 分</strong> 提升至
          <strong className={finalIteration.passed ? 'text-emerald-600' : 'text-red-500'}>
            {finalIteration.score} 分
          </strong>，
          {finalIteration.passed ? '已达到合格标准，具备上岗能力。' : '未能达到合格标准，建议人工介入调整或重新设计。'}
        </p>
        {!finalIteration.passed && (
          <p className="text-amber-600 mt-1.5">
            ⚠️ 训练已达到最大轮次限制，系统自动停止。
          </p>
        )}
      </div>
    </div>
  )
}

// 消息类型定义（v0.8 新增 confirm_standards）
type MockMessageType = 'system' | 'assistant' | 'confirm_standards' | 'request_input' | 'iteration_summary' | 'final_result' | 'user'

interface MockChatMessage {
  id: string
  type: MockMessageType
  content: string
  time: string
  score?: number
  passed?: boolean
  issues?: string[]
}

const MOCK_CHAT_MESSAGES: MockChatMessage[] = [
  // v0.8: 本体检查自动通过
  {
    id: 'm0',
    type: 'system',
    content: '评估专家已就绪，开始检查本体和用例...',
    time: '14:30:00',
  },
  {
    id: 'm0b',
    type: 'system',
    content: '本体检查完成：评估维度 5 个、红线 1 个均已就绪 ✓',
    time: '14:30:01',
  },
  // v0.8: 考题确认卡片（自动通过）
  {
    id: 'm0c',
    type: 'confirm_standards',
    content: '考题和判卷标准已就绪',
    time: '14:30:02',
  },
  {
    id: 'm1',
    type: 'system',
    content: '考题已确认，开始执行第 1 轮评估...',
    time: '14:30:03',
  },
  {
    id: 'm2',
    type: 'assistant',
    content: '我已获取前置流程的评估用例，共解析到 3 个场景：\n\n• **电商商品质量申诉处理** — 已生成 2 个测试用例 ✅\n• **退款处理流程** — 已生成 1 个测试用例 ✅\n• **用户投诉升级处理** — 已生成 1 个测试用例 ✅\n\n评估本体（维度、规则、红线）均已就绪，开始执行测试。',
    time: '14:30:05',
  },
  {
    id: 'm6',
    type: 'assistant',
    content: '正在执行测试用例 TC-001（电商商品质量申诉处理）...\n\n目标员工沙箱已创建，测试输入已注入。',
    time: '14:30:25',
  },
  {
    id: 'm7',
    type: 'iteration_summary',
    content: '第 1 轮评估完成',
    score: 48,
    passed: false,
    issues: ['未按照流程执行必要步骤', '工具调用错误/遗漏'],
    time: '14:31:00',
  },
  {
    id: 'm8',
    type: 'assistant',
    content: '第 1 轮评估完成，综合评分 **48/100**，AI 判定：**不合格** ❌\n\n**发现严重问题：**\n• 未按照流程执行必要步骤 — 业务无法推进\n• 工具调用错误/遗漏 — 无工单记录\n\n**已自动生成修改方案：**\n修改 System Prompt，增加流程强制规则，确保所有步骤按序执行。\n\n正在应用修改，准备第 2 轮评估...',
    time: '14:31:05',
  },
  {
    id: 'm9',
    type: 'system',
    content: '修改已应用，开始执行第 2 轮评估...',
    time: '14:31:30',
  },
  {
    id: 'm10',
    type: 'iteration_summary',
    content: '第 2 轮评估完成',
    score: 66,
    passed: false,
    issues: ['工具调用时机错误'],
    time: '14:32:00',
  },
  {
    id: 'm11',
    type: 'assistant',
    content: '第 2 轮评估完成，综合评分 **66/100**，AI 判定：**不合格** ❌\n\n**发现问题：**\n• 工具调用时机错误 — 未核实信息就调用退款接口\n\n**已自动生成修改方案：**\n调整工具调用顺序约束，create_ticket 必须在 query_product_info 成功后才可调用。\n\n正在应用修改，准备第 3 轮评估...',
    time: '14:32:05',
  },
  {
    id: 'm12',
    type: 'system',
    content: '修改已应用，开始执行第 3 轮评估...',
    time: '14:32:30',
  },
  {
    id: 'm13',
    type: 'iteration_summary',
    content: '第 3 轮评估完成',
    score: 85,
    passed: true,
    time: '14:33:00',
  },
  {
    id: 'm14',
    type: 'assistant',
    content: '第 3 轮评估完成，综合评分 **85/100**，AI 判定：**合格** ✅\n\n所有评估维度均已达标，该数字员工具备上岗能力。\n\n**训练过程总结：**\n• 第 1 轮（48分）→ 修改 Prompt 增加流程强制规则\n• 第 2 轮（66分）→ 调整工具调用顺序约束\n• 第 3 轮（85分）→ 通过评估\n\n可返回员工详情办理转正。',
    time: '14:33:05',
  },
  {
    id: 'm15',
    type: 'final_result',
    content: '评估训练已完成，员工通过评估',
    time: '14:33:10',
  },
]

// ─── Sub Components ───────────────────────────────────────────────────────────

// v0.8: 进度条步骤增加本体检查和确认考题（自动通过，仅展示）
const EVAL_STEPS = ['本体检查', '确认考题', '执行测试', '评估判分']
type EvalStep = 0 | 1 | 2 | 3

function ProgressBar({ currentIteration, maxIterations, currentStep }: {
  currentIteration: number
  maxIterations: number
  currentStep: EvalStep
}) {
  const stepProgress = ((currentStep + 1) / EVAL_STEPS.length) * 100

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-slate-800">第 {currentIteration}/{maxIterations} 评训轮次</span>
          {currentIteration > 1 && (
            <span className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">
              已完成 {currentIteration - 1} 轮 ✓
            </span>
          )}
        </div>
        <span className="text-xs text-slate-400">总进度 {Math.round((currentIteration / maxIterations) * 100)}%</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-1.5 mb-3">
        <div className="bg-indigo-500 h-1.5 rounded-full transition-all" style={{ width: `${stepProgress}%` }} />
      </div>
      <div className="flex items-center gap-1 overflow-x-auto">
        {EVAL_STEPS.map((label, i) => (
          <div key={i} className="flex items-center">
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
              i < currentStep ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
              i === currentStep ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
              'bg-slate-50 text-slate-400 border border-slate-200'
            }`}>
              {i < currentStep ? <CheckCircle size={11} /> : i === currentStep ? <Loader2 size={11} className="animate-spin" /> : null}
              {label}
              {/* v0.8: 本体检查和确认考题自动通过，展示小标记 */}
              {i === 0 && currentStep > 0 && <span className="text-emerald-400">⚡</span>}
              {i === 1 && currentStep > 1 && <span className="text-emerald-400">⚡</span>}
            </div>
            {i < EVAL_STEPS.length - 1 && <ChevronRight size={12} className="text-slate-300 mx-0.5" />}
          </div>
        ))}
      </div>
    </div>
  )
}

// v0.8: 已提取场景展示区 + 本体状态
function ScenariosPanel() {
  const ontologyReady = MOCK_ONTOLOGY_STATUS.isReady
  const scenariosReady = MOCK_SCENARIOS.every(s => s.status === 'ready')
  const allReady = ontologyReady && scenariosReady

  return (
    <div className="border border-slate-200 rounded-xl p-3 mb-3 bg-slate-50/50">
      {/* 本体状态区 */}
      <div className="mb-3 pb-3 border-b border-slate-200">
        <div className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1.5">
          <BarChart2 size={12} />
          评估大纲
        </div>
        <div className="space-y-1">
          {/* 评估维度 */}
          <div className="flex items-center gap-2 text-xs">
            <span className={`w-1.5 h-1.5 rounded-full ${ontologyReady ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            <span className="text-slate-600">评估维度</span>
            <span className="text-slate-400 ml-auto">{MOCK_ONTOLOGY_STATUS.dimensions.length} 个</span>
            {ontologyReady && <CheckCircle size={10} className="text-emerald-500" />}
          </div>
          {/* 红线 */}
          <div className="flex items-center gap-2 text-xs">
            <span className={`w-1.5 h-1.5 rounded-full ${ontologyReady ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            <span className="text-slate-600">一票否决项</span>
            <span className="text-slate-400 ml-auto">{MOCK_ONTOLOGY_STATUS.criticalRequirements.length} 个</span>
            {ontologyReady && <CheckCircle size={10} className="text-emerald-500" />}
          </div>
        </div>
      </div>

      {/* 场景列表 */}
      <div className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1.5">
        <Package size={12} />
        测试场景（{MOCK_SCENARIOS.length} 个）
      </div>
      <div className="space-y-1.5">
        {MOCK_SCENARIOS.map(s => (
          <div key={s.id} className="flex items-center gap-2 text-xs">
            <span className={`w-1.5 h-1.5 rounded-full ${s.status === 'ready' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            <span className="text-slate-700">{s.name}</span>
            {s.status === 'ready' ? (
              <span className="ml-auto text-emerald-600 font-medium">✅ {s.testCaseCount} 用例</span>
            ) : (
              <span className="ml-auto text-amber-600 font-medium">⚠️ 缺失</span>
            )}
          </div>
        ))}
      </div>

      {/* 整体状态 */}
      <div className={`mt-3 pt-3 border-t border-slate-200 flex items-center gap-2 text-xs ${allReady ? 'text-emerald-600' : 'text-amber-600'}`}>
        {allReady ? <CheckCircle size={12} /> : <AlertTriangle size={12} />}
        <span className="font-medium">{allReady ? '本体和用例均已就绪，可开始评估' : '本体或用例缺失，需补充后才能继续'}</span>
      </div>
    </div>
  )
}

function ChatMessage({ msg }: { msg: MockChatMessage }) {
  if (msg.type === 'system') {
    return (
      <div className="flex justify-center my-2">
        <span className="text-xs text-slate-400 bg-slate-50 px-3 py-1 rounded-full">
          {msg.time} · {msg.content}
        </span>
      </div>
    )
  }

  // v0.8: 考题确认卡片（自动通过，仅展示）
  if (msg.type === 'confirm_standards') {
    return (
      <div className="my-3 border border-indigo-200 bg-indigo-50 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <FileText size={14} className="text-indigo-600" />
          <span className="text-xs font-bold text-indigo-700">📋 考题确认（已自动确认）</span>
          <CheckCircle size={12} className="text-emerald-500 ml-auto" />
        </div>
        <p className="text-xs text-slate-600 mb-3">评估大纲和测试用例均已就绪，以下是本次评估的内容：</p>

        {/* 测试用例 */}
        <div className="mb-3">
          <div className="text-xs font-semibold text-slate-600 mb-1.5">▸ 测试用例 ({MOCK_SCENARIOS.length} 个)</div>
          <div className="space-y-1">
            {MOCK_SCENARIOS.map(s => (
              <div key={s.id} className="bg-white border border-slate-100 rounded-lg p-2 flex items-center gap-2">
                <span className="text-xs font-medium text-slate-700">{s.name}</span>
                <span className="text-xs text-slate-400 ml-auto">{s.testCaseCount} 用例</span>
              </div>
            ))}
          </div>
        </div>

        {/* 判卷标准 */}
        <div className="mb-3">
          <div className="text-xs font-semibold text-slate-600 mb-1.5">▸ 判卷标准</div>
          <div className="bg-white border border-slate-100 rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="text-left px-3 py-2 font-medium">维度</th>
                  <th className="text-center px-3 py-2 font-medium">权重</th>
                  <th className="text-center px-3 py-2 font-medium">合格线</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {MOCK_ONTOLOGY_STATUS.dimensions.map(d => (
                  <tr key={d.id}>
                    <td className="px-3 py-2 text-slate-700">{d.name}</td>
                    <td className="text-center px-3 py-2 text-slate-600">{(d.weight * 100).toFixed(0)}%</td>
                    <td className="text-center px-3 py-2 text-slate-600">{d.threshold === 0 ? '动态' : d.threshold + '分'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 红线 */}
        <div className="bg-red-50 border border-red-100 rounded-lg p-2 mb-2">
          <div className="flex items-center gap-1.5 mb-1">
            <AlertTriangle size={10} className="text-red-500" />
            <span className="text-xs font-semibold text-red-600">红线</span>
          </div>
          <div className="text-xs text-red-700">
            {MOCK_ONTOLOGY_STATUS.criticalRequirements.map(c => c.name).join('、')} → 触发直接不合格
          </div>
        </div>

        <div className="text-xs text-slate-400">
          ⚡ 已自动确认通过，开始执行测试...
        </div>
      </div>
    )
  }

  if (msg.type === 'request_input') {
    return (
      <div className="my-3 border border-amber-200 bg-amber-50 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle size={14} className="text-amber-600" />
          <span className="text-xs font-bold text-amber-700">需要补充资料</span>
        </div>
        <p className="text-sm text-slate-700 mb-3">{msg.content}</p>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 bg-amber-600 text-white text-xs rounded-lg font-medium hover:bg-amber-700 flex items-center gap-1">
            <Upload size={11} /> 上传文件
          </button>
          <button className="px-3 py-1.5 border border-amber-300 text-amber-700 text-xs rounded-lg font-medium hover:bg-amber-100">
            直接回复
          </button>
        </div>
      </div>
    )
  }

  if (msg.type === 'iteration_summary') {
    return (
      <div className="flex justify-center my-3">
        <div className={`flex flex-col items-center px-4 py-2 rounded-xl border ${
          msg.passed ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center gap-2">
            {msg.passed ? <CheckCircle size={16} className="text-emerald-500" /> : <XCircle size={16} className="text-red-500" />}
            <span className={`text-sm font-bold ${msg.passed ? 'text-emerald-700' : 'text-red-700'}`}>{msg.content}</span>
            <span className={`text-2xl font-black ${msg.passed ? 'text-emerald-600' : 'text-red-500'}`}>{msg.score}</span>
            <span className="text-xs text-slate-400">/100</span>
          </div>
          {msg.issues && msg.issues.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {msg.issues.map((issue, i) => (
                <span key={i} className="text-xs text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                  {issue}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  if (msg.type === 'final_result') {
    return (
      <div className="flex justify-center my-4">
        <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl px-6 py-4 flex items-center gap-3">
          <CheckCircle size={24} className="text-emerald-500" />
          <div>
            <div className="font-bold text-emerald-700">评估训练完成</div>
            <div className="text-sm text-emerald-600">员工已通过评估，可办理转正上岗</div>
          </div>
        </div>
      </div>
    )
  }

  if (msg.type === 'user') {
    return (
      <div className="flex justify-end my-2">
        <div className="max-w-[80%] bg-indigo-600 text-white rounded-xl px-4 py-2.5 text-sm leading-relaxed">
          {msg.content}
        </div>
      </div>
    )
  }

  // assistant
  return (
    <div className="flex my-2">
      <div className="max-w-[85%] bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 leading-relaxed whitespace-pre-line">
        {msg.content.split('**').map((part, i) =>
          i % 2 === 1 ? <strong key={i}>{part}</strong> : part
        )}
      </div>
    </div>
  )
}

function TestCasePanel() {
  return (
    <div className="p-3 space-y-3 text-xs">
      <div className="bg-slate-50 rounded-lg p-3">
        <div className="font-semibold text-slate-600 mb-1">场景: {MOCK_TEST_CASE.scenarioName}</div>
        <div className="text-slate-500">ID: {MOCK_TEST_CASE.id}</div>
      </div>
      <div>
        <div className="font-semibold text-slate-600 mb-1.5">测试输入</div>
        <div className="bg-amber-50 border border-amber-100 rounded-lg p-2.5 text-amber-800">{MOCK_TEST_CASE.input}</div>
      </div>
      <div>
        <div className="font-semibold text-slate-600 mb-1.5">预期行为序列</div>
        <div className="space-y-1">
          {MOCK_TEST_CASE.expectedBehavior.map(step => (
            <div key={step.step} className="flex items-start gap-2 bg-white border border-slate-100 rounded-lg p-2">
              <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold shrink-0">{step.step}</span>
              <div>
                <div className="font-medium text-slate-700">{step.action}</div>
                <div className="text-slate-400">{step.criteria}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className="font-semibold text-slate-600 mb-1.5">评估维度</div>
        <div className="flex flex-wrap gap-1.5">
          {MOCK_TEST_CASE.dimensions.map(d => (
            <span key={d.name} className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-medium">
              {d.name} {d.weight}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

function TracePanel() {
  return (
    <div className="p-3 space-y-2 text-xs">
      <div className="flex items-center gap-2 mb-2 bg-slate-50 rounded-lg p-2">
        <span className="text-slate-500">工具调用: {MOCK_EXECUTION_TRACE.summary.total_tool_calls} 次</span>
        <span className="text-emerald-600">成功率: {(MOCK_EXECUTION_TRACE.summary.success_rate * 100).toFixed(0)}%</span>
        <span className="text-slate-500">耗时: {MOCK_EXECUTION_TRACE.summary.execution_time}</span>
      </div>
      {MOCK_EXECUTION_TRACE.logs.map((log, i) => (
        <div key={i} className={`border rounded-lg p-2.5 ${
          log.type === 'thought' ? 'border-violet-100 bg-violet-50/50' :
          log.type === 'tool_call' ? 'border-blue-100 bg-blue-50/50' :
          'border-slate-100 bg-white'
        }`}>
          {log.type === 'thought' && (
            <>
              <div className="flex items-center gap-1.5 mb-1">
                <Zap size={10} className="text-violet-500" />
                <span className="font-semibold text-violet-700">思考</span>
                <span className="text-slate-400 ml-auto">{log.time}</span>
              </div>
              <p className="text-slate-600">{log.content}</p>
            </>
          )}
          {log.type === 'message' && (
            <>
              <div className="flex items-center gap-1.5 mb-1">
                <MessageSquare size={10} className="text-slate-500" />
                <span className="font-semibold text-slate-600">{log.role === 'assistant' ? '回复' : '用户'}</span>
                <span className="text-slate-400 ml-auto">{log.time}</span>
              </div>
              <p className="text-slate-600">{log.content}</p>
            </>
          )}
          {log.type === 'tool_call' && (
            <>
              <div className="flex items-center gap-1.5 mb-1">
                <Zap size={10} className="text-blue-500" />
                <span className="font-semibold text-blue-700">工具调用: {log.tool}</span>
                {log.success ? <CheckCircle size={10} className="text-emerald-500 ml-1" /> : <XCircle size={10} className="text-red-500 ml-1" />}
                <span className="text-slate-400 ml-auto">{log.time}</span>
              </div>
              <div className="bg-white border border-slate-100 rounded p-1.5 font-mono text-[10px] text-slate-500">
                params: {JSON.stringify(log.params)}
              </div>
              <div className="bg-emerald-50 border border-emerald-100 rounded p-1.5 font-mono text-[10px] text-emerald-700 mt-1">
                result: {JSON.stringify(log.result)}
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  )
}

function ReportPanel({ iteration, packageName }: { iteration: typeof MOCK_ITERATIONS[0]; packageName?: string }) {
  const dimColor = (score: number, threshold: number | string) => {
    const t = typeof threshold === 'number' ? threshold : 60
    return score >= t ? 'text-emerald-600' : score >= 60 ? 'text-amber-500' : 'text-red-500'
  }
  const dimBg = (score: number, threshold: number | string) => {
    const t = typeof threshold === 'number' ? threshold : 60
    return score >= t ? 'bg-emerald-500' : score >= 60 ? 'bg-amber-400' : 'bg-red-400'
  }

  return (
    <div className="p-3 space-y-3 text-xs">
      {/* 评估标准来源 */}
      {iteration.ontologySource && (
        <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-200">
          <div className="flex items-center gap-1.5 mb-1.5">
            <BarChart2 size={10} className="text-slate-400" />
            <span className="font-semibold text-slate-600">评估标准来源</span>
          </div>
          <div className="text-slate-500 space-y-1">
            <div>本体图谱: {iteration.ontologySource.roleTypeId} ({iteration.ontologySource.roleName})</div>
            {packageName && (
              <div className="flex items-center gap-1">
                <span className="text-indigo-400">●</span>
                <span className="font-mono text-indigo-600">{packageName}</span>
                <span className="text-slate-400">/ skill + ontology + config</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className={`text-center rounded-xl p-4 ${iteration.passed ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'}`}>
        <div className={`text-4xl font-black mb-1 ${iteration.passed ? 'text-emerald-600' : 'text-red-500'}`}>
          {iteration.score}
        </div>
        <div className="text-sm text-slate-500 mb-1">综合评分</div>
        {iteration.passed ? (
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 border border-emerald-200 px-3 py-1 rounded-full">✅ AI 判定：合格</span>
        ) : (
          <span className="text-xs font-semibold text-red-600 bg-red-100 border border-red-200 px-3 py-1 rounded-full">❌ AI 判定：不合格</span>
        )}
      </div>

      <div>
        <div className="font-semibold text-slate-600 mb-2">维度评分</div>
        <div className="space-y-2">
          {iteration.dimensions.map(d => (
            <div key={d.name} className="bg-white border border-slate-100 rounded-lg p-2.5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-slate-600">{d.name}</span>
                <span className={`font-black text-sm ${dimColor(d.score, d.threshold)}`}>{d.score}</span>
              </div>
              <div className="bg-slate-100 rounded-full h-1.5">
                <div className={`h-1.5 rounded-full ${dimBg(d.score, d.threshold)}`} style={{ width: `${d.score}%` }} />
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-slate-400">权重 {d.weight}</span>
                {/* v0.8: 显示合格线 */}
                <span className="text-slate-400">合格线: {typeof d.threshold === 'number' ? d.threshold + '分' : d.threshold}</span>
                <span className={dimColor(d.score, d.threshold)}>{d.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {iteration.issues.length > 0 && (
        <div>
          <div className="font-semibold text-red-700 mb-1.5 flex items-center gap-1.5">
            <XCircle size={12} />
            发现的问题
          </div>
          <div className="space-y-1.5">
            {iteration.issues.map(issue => (
              <div key={issue.id} className="bg-red-50 border border-red-100 rounded-lg p-2.5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium text-red-700">{issue.title}</div>
                    <div className="text-red-500 mt-0.5">影响：{issue.impact}</div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    issue.severity === '严重' ? 'bg-red-200 text-red-700' :
                    issue.severity === '高' ? 'bg-orange-200 text-orange-700' :
                    'bg-yellow-200 text-yellow-700'
                  }`}>{issue.severity}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {iteration.modifications.length > 0 && (
        <div>
          <div className="font-semibold text-indigo-700 mb-1.5 flex items-center gap-1.5">
            <Zap size={12} />
            本轮修改方案
          </div>
          <div className="space-y-1.5">
            {iteration.modifications.map(mod => (
              <div key={mod.id} className="bg-indigo-50 border border-indigo-100 rounded-lg p-2.5">
                <div className="font-medium text-indigo-700 mb-1">{mod.title}</div>
                <div className="text-[10px] font-semibold px-2 py-0.5 bg-indigo-100 text-indigo-600 rounded inline-block mb-1.5">
                  {mod.type === 'system_prompt' ? 'System Prompt' : mod.type === 'tool_config' ? '工具配置' : 'Few-shot'}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-[10px] text-red-600 font-medium mb-0.5">修改前</div>
                    <div className="text-[10px] bg-red-50 border border-red-100 rounded p-2 text-red-700 leading-relaxed">{mod.before}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-emerald-600 font-medium mb-0.5">修改后</div>
                    <div className="text-[10px] bg-emerald-50 border border-emerald-100 rounded p-2 text-emerald-700 leading-relaxed">{mod.after}</div>
                  </div>
                </div>
                <div className="text-indigo-500 mt-1.5">预期提升：{mod.expectedGain}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type ArtifactTab = 'testcase' | 'trace' | 'report'

export default function EvaluationPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [artifactTab, setArtifactTab] = useState<ArtifactTab>('report')
  const [chatInput, setChatInput] = useState('')
  const [rightCollapsed, setRightCollapsed] = useState(false)
  const [selectedRound, setSelectedRound] = useState(3)
  const [showSummaryModal, setShowSummaryModal] = useState(false)

  // 训练是否完成（最后一轮通过或达到最大轮次）
  const trainingCompleted = true

  // 从 router state 或 localStorage 读取实例包名
  const packageName = useMemo<string | undefined>(() => {
    const fromState = (location.state as { packageName?: string } | null)?.packageName
    if (fromState) return fromState
    if (!id) return undefined
    try {
      const stored = localStorage.getItem(`ncrew_instance_package_${id}`)
      if (stored) return (JSON.parse(stored) as { packageName: string }).packageName
    } catch { /* ignore */ }
    return undefined
  }, [id, location.state])

  const userEmployees = loadUserEmployees()
  const allEmployees = [...mockEmployees, ...userEmployees]
  const e = allEmployees.find(emp => emp.id === id)

  const currentIteration = MOCK_ITERATIONS.find(it => it.round === selectedRound) || MOCK_ITERATIONS[2]

  if (!e) return <div className="flex items-center justify-center h-full text-slate-400">员工不存在</div>

  const TABS: { key: ArtifactTab; label: string; icon: typeof FileText }[] = [
    { key: 'testcase', label: '测试用例', icon: FileText },
    { key: 'trace', label: 'Trace', icon: Zap },
    { key: 'report', label: '评估报告', icon: BarChart2 },
  ]

  return (
    <div className="flex flex-col h-[calc(100vh-57px)] bg-slate-50">
      {/* Top bar */}
      <div className="border-b border-slate-200 bg-white px-6 py-3 flex items-center gap-4 shrink-0">
        <button onClick={() => navigate(`/instances/${id}`)} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
          <ArrowLeft size={14} />
          返回
        </button>
        <div className="h-4 w-px bg-slate-200" />
        <div>
          <h1 className="text-sm font-bold text-slate-800">AI 评估训练</h1>
          <p className="text-xs text-slate-400">{e.nickname} · {e.roleName}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {trainingCompleted && (
            <button
              onClick={() => setShowSummaryModal(true)}
              className="px-3 py-1.5 bg-emerald-600 text-white text-xs rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center gap-1.5"
            >
              <FileText size={12} />
              查看综合报告
            </button>
          )}
        </div>
      </div>

      {/* Progress bar - v0.8: 4 steps */}
      <div className="px-6 pt-4 shrink-0">
        <ProgressBar currentIteration={3} maxIterations={30} currentStep={3} />
      </div>

      {/* Main content: left chat + right artifacts */}
      <div className="flex-1 flex gap-4 px-6 pb-6 min-h-0">
        {/* Left: Chat */}
        <div className="flex-1 flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden min-w-0">
          {/* Scenarios */}
          <div className="px-4 pt-4 shrink-0">
            <ScenariosPanel />
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 pb-2">
            {MOCK_CHAT_MESSAGES.map(msg => (
              <ChatMessage key={msg.id} msg={msg} />
            ))}
          </div>

          {/* Input area */}
          <div className="border-t border-slate-100 px-4 py-3 shrink-0">
            <div className="flex items-center gap-2">
              <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                <Paperclip size={16} />
              </button>
              <input
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder="回复评估专家..."
                className="flex-1 px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-300 focus:bg-white transition-all"
              />
              <button className="p-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Right: Artifacts */}
        <div className={`${rightCollapsed ? 'w-10' : 'w-[360px]'} flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden shrink-0 transition-all duration-200`}>
          {rightCollapsed ? (
            <button onClick={() => setRightCollapsed(false)} className="w-full h-full flex items-center justify-center hover:bg-slate-50">
              <ChevronDown size={16} className="text-slate-400 -rotate-90" />
            </button>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center justify-between px-3 py-2.5 border-b border-slate-100 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-600">轮次</span>
                  <select
                    value={selectedRound}
                    onChange={e => setSelectedRound(Number(e.target.value))}
                    className="text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1 outline-none focus:border-indigo-300"
                  >
                    {MOCK_ITERATIONS.map(it => (
                      <option key={it.round} value={it.round}>
                        第 {it.round} 轮 ({it.score}分{it.passed ? ' ✓' : ''})
                      </option>
                    ))}
                  </select>
                </div>
                <button onClick={() => setRightCollapsed(true)} className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded">
                  <ChevronDown size={14} className="rotate-90" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-slate-100 shrink-0">
                {TABS.map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setArtifactTab(tab.key)}
                    className={`flex-1 flex items-center justify-center gap-1 py-2 text-xs font-medium border-b-2 transition-all ${
                      artifactTab === tab.key
                        ? 'text-indigo-600 border-indigo-600'
                        : 'text-slate-400 border-transparent hover:text-slate-600'
                    }`}
                  >
                    <tab.icon size={11} />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div className="flex-1 overflow-y-auto">
                {artifactTab === 'testcase' && <TestCasePanel />}
                {artifactTab === 'trace' && <TracePanel />}
                {artifactTab === 'report' && <ReportPanel iteration={currentIteration} packageName={packageName} />}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Summary Report Modal */}
      {showSummaryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowSummaryModal(false)}>
          <div
            className="bg-white rounded-2xl w-[600px] max-h-[80vh] overflow-hidden shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-emerald-500" />
                <h2 className="text-base font-bold text-slate-800">评估训练综合报告</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => downloadReport(MOCK_ITERATIONS)}
                  className="px-3 py-1.5 bg-indigo-600 text-white text-xs rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-1.5"
                >
                  <Download size={12} />
                  下载报告
                </button>
                <button
                  onClick={() => setShowSummaryModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <XCircle size={16} />
                </button>
              </div>
            </div>
            {/* Modal content */}
            <div className="max-h-[calc(80vh-60px)] overflow-y-auto">
              <SummaryReportPanel iterations={MOCK_ITERATIONS} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
