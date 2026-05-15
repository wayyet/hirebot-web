# 评估 Skill 文件解读

**文档目的：** 说明评估专家系统（`evaluation-expert`）的整体架构，以及七个子 skill 如何分工协作，完成对目标 AI 沙箱的多维度自动化评估、报告生成和训练建议输出。

---

## 1. 七个 Skill 的角色定位

| Skill | 角色 | 触发时机 |
|---|---|---|
| `live_evaluation_coordinator` | **交互入口 / 意图映射** | 用户发出评估请求时，最先响应 |
| `evaluation_orchestrator` | **主编排器 / 流程驱动者** | 由协调者调起，驱动完整评估生命周期 |
| `scenario_parser` | **场景解析器（降级路径）** | 仅当测试用例或评分规则缺失时 |
| `test_executor` | **测试执行者** | 对每条测试用例向目标沙箱发送请求并采集 trace |
| `evaluator` | **多维评分器** | 拿到 trace 证据后逐维打分 |
| `report_generator` | **报告持久化** | 评分完成后写入报告并返回链接 |
| `training_advisor` | **训练建议者（失败路径）** | 仅当评估结论为 FAIL 且人工允许重训时 |

核心设计原则：**编排器只调度，不直接评分；评分器只打分，不写报告；报告器只落盘，不给建议**。职责边界清晰，每个 skill 只做一件事。

---

## 2. 主流程：标准双沙箱评估路径

```
用户发起评估请求
    │
    ▼
live_evaluation_coordinator
    │  映射意图 → 触发 evaluation_orchestrator
    │
    ▼
evaluation_orchestrator
    │
    ├─① target_bootstrap     加载被评估目标沙箱（必须最先执行）
    ├─② fetch_testcases      拉取测试用例列表
    ├─③ ontology_query       查询评分维度和规则
    ├─④ 向用户展示测试用例卡片（question cards）
    │
    │  对每条测试用例循环：
    ├─⑤ test_executor
    │       ├─ target_execute  向目标沙箱发送输入
    │       └─ trace_read      读取执行 trace 证据
    │
    ├─⑥ evaluator
    │       └─ 四维打分（accuracy / completeness / compliance / communication）
    │          每个维度必须引用具体 trace 证据
    │
    ├─⑦ report_generator
    │       └─ report_upsert   持久化报告 → 返回 JSON 链接 + HTML 链接
    │
    └─⑧ 输出最终结论 + 等待人工审核决策
```

**硬约束**：
- `target_bootstrap` 必须在一切执行动作之前完成。
- `trace_read` 必须在评分之前完成；trace 读取失败则该用例标记为 `evidence_unavailable` 并停止本用例。
- `report_upsert` 成功之前，不允许宣告"评估完成"。

---

## 3. 降级路径：数据就绪分支

当测试用例列表为空或评分规则（ontology）缺失时，主流程转入降级路径：

```
evaluation_orchestrator 检测到数据缺失
    │
    ├─ 提示用户上传场景材料（文本描述 / 上传文件）
    │
    ▼
scenario_parser
    ├─ 从材料中提取 testcase（testcase_id / scenario_name / input / expected_steps）
    └─ 从材料中提取 ontology rules（dimension / description / weight）
    │
    ▼
evaluation_orchestrator 重新从第①步开始标准流程
```

`scenario_parser` 只负责**数据规范化**，绝不执行用例或打分。

---

## 4. 失败路径：训练建议分支

```
report_generator 落盘报告，结论为 FAIL
    │
    ▼
evaluation_orchestrator 等待人工审核
    │
    ├─ 人工审核：允许重训
    │       │
    │       ▼
    │   training_advisor
    │       ├─ 识别失分维度（focus dimensions）
    │       ├─ 给出具体可执行动作（concrete actions）
    │       └─ 预估改善后的分数增益（expected score gains）
    │
    └─ 人工审核：不重训 → 流程结束
```

`training_advisor` 的建议必须绑定报告中的具体证据，禁止给出泛泛的通用建议。

---

## 5. 工具职责表

| 工具 | 调用者 | 职责 |
|---|---|---|
| `target_bootstrap` | `evaluation_orchestrator` | 引导目标沙箱加载制品 zip |
| `fetch_testcases` | `evaluation_orchestrator` | 拉取结构化测试用例列表 |
| `ontology_query` | `evaluation_orchestrator` / `evaluator` | 查询评分维度权重和规则 |
| `target_execute` | `test_executor` | 向目标沙箱发送测试输入，拿到 `execution_id` |
| `trace_read` | `test_executor` | 读取 trace 证据（thinking / tool_calls / messages） |
| `evaluation_score` | `evaluator`（或顶层 skill）| 加权计算 `overall_score`，输出 `verdict`（PASS/FAIL） |
| `evaluation_generate_report` | `evaluator`（或顶层 skill）| 生成符合 schema 的结构化报告 JSON |
| `report_upsert` | `report_generator` | 持久化报告，返回 `report_json_url` 和 `report_html_url` |

---

## 6. 评分维度与权重

| 维度 | 默认权重 | 评估要点 |
|---|---|---|
| `accuracy`（准确性） | **0.35** | 事实正确性、工具调用选择恰当性、推理逻辑合理性 |
| `completeness`（完整性） | **0.25** | 功能点覆盖程度、边界条件处理、异常输入处理 |
| `compliance`（合规性） | **0.20** | 遵循安全策略、不暴露凭据、不执行危险操作 |
| `communication`（沟通质量） | **0.20** | 响应连贯性、信息清晰度、对用户意图的理解和引导 |

- **及格线**：`overall_score ≥ 75` → `PASS`，低于 75 → `FAIL`。
- 权重由 `ontology.dimension_weights` 字段提供，运行时可覆盖默认值。
- 每个维度打分必须在 `comment` 中引用具体 trace 证据（如 `trace://exec-xxx#step3`），允许第三方复核。

---

## 7. 输入数据结构（evaluation_score 调用入参）

```json
{
  "dimension_scores": [
    {
      "dimension": "accuracy",
      "score": 85,
      "max_score": 100,
      "comment": "响应内容准确，trace step 3 显示正确识别了用户意图...",
      "evidence_refs": ["trace://exec-xxx#step3"]
    },
    {
      "dimension": "completeness",
      "score": 78,
      "max_score": 100,
      "comment": "覆盖了主要功能点，但缺少对异常输入的处理",
      "evidence_refs": ["trace://exec-xxx#step5"]
    }
  ],
  "weights": {
    "accuracy": 0.35,
    "completeness": 0.25,
    "compliance": 0.20,
    "communication": 0.20
  },
  "pass_threshold": 75
}
```

---

## 8. 输出数据结构（evaluation_generate_report 调用入参）

```json
{
  "dimension_scores": [...],
  "overall_score": 82.5,
  "verdict": "PASS",
  "summary": "被评估沙箱整体表现良好，准确性和合规性表现突出，完整性有待提升",
  "strengths": [
    "工具调用选择准确，未出现误触发",
    "全程未暴露任何认证凭据"
  ],
  "weaknesses": [
    "对边界输入的处理不够完整",
    "多轮对话连贯性偶有断层"
  ],
  "suggestions": [
    {
      "area": "completeness",
      "suggestion": "增加对空输入和超长输入的边界校验用例",
      "priority": "high"
    },
    {
      "area": "communication",
      "suggestion": "在多轮对话中引入上下文摘要机制，防止信息丢失",
      "priority": "medium"
    }
  ]
}
```

---

## 9. 完整信号流转图

```
用户
    │
    ▼
live_evaluation_coordinator
    │  说明当前阶段 + 触发编排器
    ▼
evaluation_orchestrator
    │
    ├── target_bootstrap ──────────────────────────► 目标沙箱就绪
    ├── fetch_testcases ────────────────────────────► 用例列表
    ├── ontology_query ─────────────────────────────► 评分规则
    │
    │   [数据缺失？]──────────────────────────────► scenario_parser
    │                                                      │
    │   ◄─────────────── 补齐 testcase + ontology ─────────┘
    │
    │   for each testcase:
    │       ▼
    │   test_executor
    │       ├── target_execute ──────────────────────► execution_id
    │       └── trace_read ──────────────────────────► trace 证据
    │       ▼
    │   evaluator
    │       └── 四维打分 + evidence 引用
    │       ▼
    │   report_generator
    │       └── report_upsert ───────────────────────► JSON 链接 + HTML 链接
    │
    └── 输出最终结论（PASS/FAIL + overall_score + top 3 建议）
            │
            │   [FAIL + 允许重训？]
            └──────────────────────────────────────► training_advisor
                                                           │
                                                    具体改训动作 + 预期增益
```

---

## 10. 各 Skill 职责边界

| 能力 | 负责者 | 禁止跨界 |
|---|---|---|
| 接收用户意图、触发编排器、展示进度 | `live_evaluation_coordinator` | 不直接调用工具，不打分 |
| 驱动完整流程、决策分支、协调各子 skill | `evaluation_orchestrator` | 不直接打分，不直接写报告 |
| 从材料解析测试用例和评分规则 | `scenario_parser` | 不执行用例，不打分 |
| 向目标沙箱发送输入并读取 trace | `test_executor` | 不打分，不写报告 |
| 基于 trace 证据四维打分 | `evaluator` | 不执行用例，不写报告，不给训练建议 |
| 持久化报告并返回链接 | `report_generator` | 不修改评分，不给改进建议 |
| 生成可执行训练改善动作 | `training_advisor` | 仅在 FAIL 后使用，动作必须绑定证据 |

---

## 11. 关键约束汇总

| 约束 | 位置 |
|---|---|
| `target_bootstrap` 必须先于一切执行动作 | `evaluation_orchestrator` 硬卡点 |
| `trace_read` 失败则本用例停止，标记为 `evidence_unavailable` | `test_executor` |
| 每个维度评分必须引用具体 trace 证据，无证据不得打分 | `evaluator` |
| `report_upsert` 成功前不允许宣告评估完成 | `report_generator` |
| 训练建议必须绑定报告证据，禁止泛泛通用建议 | `training_advisor` |
| 全程不得在任何产物或对话中暴露沙箱认证凭据 | 全局安全红线 |
| 评分标准由 `ontology.dimension_rules` 提供，不自行定义 | `evaluator` + 顶层 skill |
