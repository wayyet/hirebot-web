# 数字员工全流程 Skills 树状结构

---

## 阶段一：雇佣流程

### employment-coach-conversation (雇佣教练对话引导)

| 属性 | 值 |
|------|-----|
| 版本 | 1.0.0 |
| 类别 | hiring_guidance |
| 职责 | 三阶段对话引导，沉淀 handoff todo，触发下游加工 skill；横切配置治理 |
| 依赖工具 | 无（纯对话 + 状态机） |
| 输入 | 模板 config/*.md、用户文件/描述、表单凭据（不接触） |
| 输出 | handoff todo、`<dispatch>`信号、soul/identity/agent 修改、复核提议 |
| 执行模式 | continuous |

#### 下游加工 Skills（由 employment-coach-conversation 调度）

##### ontology_extraction (本体提取)

| 属性 | 值 |
|------|-----|
| 版本 | 1.0.0 |
| 类别 | knowledge_extraction |
| 职责 | 从资料提取员工本体 + 评估本体，写入知识图谱 |
| 依赖工具 | document_parser（间接） |
| 输入 | handoff todo（含源文件路径、目标说明） |
| 输出 | ontology/*.json、graph.jsonl、schema.yaml、user_summary |
| 执行模式 | single_pass |

##### skill_generation (技能生成)

| 属性 | 值 |
|------|-----|
| 版本 | 1.0.0 |
| 类别 | code_generation |
| 职责 | 根据 skill 定义生成可执行的数字员工 Skill 文件 |
| 依赖工具 | 无（文件写入） |
| 输入 | handoff todo（skill_name、description、trigger、expected_output）或用户上传的现成 skill 文件 |
| 输出 | skills/<name>.yaml、user_summary |
| 执行模式 | single_pass |

##### external_config (外部系统配置)

| 属性 | 值 |
|------|-----|
| 版本 | 1.0.0 |
| 类别 | integration |
| 职责 | 生成外部系统调用配置（端点、字段映射、认证类型） |
| 依赖工具 | 表单凭据（平台直传，skill 不接触） |
| 输入 | handoff todo（category、objective、target_system、auth_kind、required_fields） |
| 输出 | external/<system>_config.yaml、user_summary |
| 执行模式 | single_pass |

#### 横切辅助 Skill

##### diagnosis (诊断)

| 属性 | 值 |
|------|-----|
| 版本 | 1.0.0 |
| 类别 | quality_assurance |
| 职责 | 只读评估完备性差距，产出诊断 todo，与 handoff todo 合并展示 |
| 依赖工具 | 无（只读沙箱） |
| 输入 | 沙箱当前产出（ontology/、skills/、external/）、完备性清单 |
| 输出 | diagnostic_todo_list（带 level:必需/推荐/可选） |
| 执行模式 | single_pass（每次下游回传后触发） |

---

## 阶段二：AI评估流程

### scenario_parser (场景解析)

| 属性 | 值 |
|------|-----|
| 版本 | 1.0.0 |
| 类别 | evaluation |
| 职责 | 从场景素材生成结构化测试用例 + 评估本体图谱实体 |
| 依赖工具 | document_parser |
| 输入 | 员工模板、技能描述、用户上传场景素材 |
| 输出 | test_cases、ontology 实体（graph.jsonl 追加） |
| 执行模式 | single_pass |

### test_executor (测试执行)

| 属性 | 值 |
|------|-----|
| 版本 | 1.0.0 |
| 类别 | evaluation |
| 职责 | 创建目标员工沙箱，注入测试用例，捕获执行过程，清理沙箱 |
| 依赖工具 | sandbox_create、sandbox_delete、sandbox_send_message、trace_read |
| 输入 | test_case、员工模板 ID、evaluation_session_id |
| 输出 | execution_trace（logs + summary）、沙箱生命周期状态 |
| 执行模式 | sequential |

### evaluator (评估判分)

| 属性 | 值 |
|------|-----|
| 版本 | 1.0.0 |
| 类别 | evaluation |
| 职责 | 查询评估本体，按维度/权重/红线多维度判分，生成评估报告 |
| 依赖工具 | ontology_query、evaluation_report |
| 输入 | test_case、execution_trace、role_type |
| 输出 | evaluation_report（得分、合格判定、改进建议、本体来源） |
| 执行模式 | single_pass |

### training_advisor (训练建议)

| 属性 | 值 |
|------|-----|
| 版本 | 1.0.0 |
| 类别 | evaluation |
| 职责 | 不合格时生成改进建议（prompt 增强、few-shot 等），管理训练反馈循环 |
| 依赖工具 | evaluation_report |
| 输入 | evaluation_report（is_passed=false）、员工配置快照 |
| 输出 | improvement_suggestions、training_iteration_record、人工审核请求 |
| 执行模式 | single_pass |

---

## 阶段三：人工评估流程

### human_evaluation (人工评估)

| 属性 | 值 |
|------|-----|
| 版本 | 1.0.0 |
| 类别 | evaluation |
| 职责 | 注入目标沙箱，管理场景轮次、结束时机判定、收集人工判定、生成综合报告 |
| 依赖工具 | evaluation_report |
| 输入 | 场景列表（来自 AI 评估）、目标员工沙箱 |
| 输出 | scenario_verdicts、comprehensive_report、上岗状态变更 |
| 执行模式 | continuous |

---

## 流程图

```
雇佣流程
    │
    ├── employment-coach-conversation (雇佣教练)
    │       │
    │       ├──→ ontology_extraction (本体提取)
    │       ├──→ skill_generation (技能生成)
    │       ├──→ external_config (外部配置)
    │       └───→ diagnosis (诊断) ─── 横切辅助
    │
    ▼
AI评估流程
    │
    ├── scenario_parser (场景解析)
    ├── test_executor (测试执行)
    ├── evaluator (评估判分)
    └── training_advisor (训练建议) ─── 不合格时触发
    │
    ▼
人工评估流程
    │
    └── human_evaluation (人工评估) → 上岗
```
