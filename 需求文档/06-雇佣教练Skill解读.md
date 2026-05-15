# 雇佣教练 Skill 文件解读

**文档目的：** 说明主雇佣流程（`employment-coach-conversation`）如何通过 Handoff 机制调用本体提取、技能生成和外部对接三个下游 skill，以及各 skill 的职责边界与信号流转方式。

---

## 1. 四个 Skill 的角色定位

| Skill | 角色 | 写入目录 | 阶段 |
|---|---|---|---|
| `employment-coach-conversation` | **指挥官 / 对话引导者** | 不直接写产物目录；只维护 Handoff 工单 + 更新 config 文件 | 全程在线 |
| `ontology-extraction` | **本体提取执行者** | `ontology/` | 阶段一：资料 |
| `skill-generation` | **技能生成执行者** | `skills/<skill_slug>/` | 阶段二：技能 |
| `external-config` | **外部系统配置执行者** | `external/` | 阶段三：外部 |

核心设计原则：**雇佣教练只发信号，不直接执行**。它把用户输入整理成结构化 Handoff 工单，由下游 skill 按工单执行，执行完再回传结果给雇佣教练复述给用户。

---

## 2. 主流程：三阶段顺序解锁

```
阶段一：资料
  用户上传业务文档 / 描述业务场景
  雇佣教练 → 维护 material Handoff todo
  → dispatch → ontology-extraction 抽取本体切片
  → dispatch_callback → 用户确认
  → 阶段一完成

阶段二：技能
  用户描述"它要会做什么"
  雇佣教练 → 维护 skill Handoff todo
  → dispatch → skill-generation 生成技能包
  → dispatch_callback → 用户确认
  → 阶段二完成

阶段三：外部
  用户描述"它要能调什么外部系统"
  雇佣教练 → 维护 external Handoff todo
  → dispatch → external-config 生成配置草案
  → dispatch_callback → 用户确认
  → 阶段三完成
```

**硬卡点规则**：前置阶段必须完全闭环（所有 Handoff todo 进入 `confirmed`）才能解锁下一阶段。雇佣教练不允许跳步或并行推进。

---

## 3. Handoff 工单机制（Dispatch 协议）

### 3.1 Handoff 工单结构

每一条 Handoff 工单是下游 skill 的可执行任务单，核心字段：

```yaml
session_id: session_20260508_001      # 会话 ID，贯穿全程
handoff_id: m_cs_rules_001           # 工单唯一 ID（m=material / s=skill / e=external）
kind: handoff_todo
stage: material | skill | external   # 对应三个阶段
target_skill: ontology-extraction | skill-generation | external-config
status: drafting | ready_to_dispatch | dispatched | dirty | confirmed | needs_review | dismissed
payload: {...}                        # 具体的执行内容（见各阶段说明）
acceptance: "..."                     # 下游产物必须满足的验收条件
```

### 3.2 工单状态流转

```
drafting          → 信息不完整，还在收集
ready_to_dispatch → 信息已够，等用户说"先这些"就可以发出
dispatched        → 已发给下游，等回传
dirty             → 发出后用户又改了，需要重发
confirmed         → 下游回传 + 用户确认，闭环完成
needs_review      → 上游规则变了，需要复核
dismissed         → 用户取消
```

### 3.3 Dispatch 触发条件

用户说出"先这些"/"就这些"/"可以了"等确认语，且当前阶段所有活跃工单都处于 `ready_to_dispatch`（无 `drafting`、`dispatched`、`needs_review` 阻塞项），雇佣教练才发出 dispatch 信号。

---

## 4. 阶段一：调用本体提取（ontology-extraction）

### 4.1 触发方式

雇佣教练通过以下信号调起 ontology-extraction：

```yaml
dispatch:
  target: ontology-extraction
  handoff_ids: [m_cs_rules_001, m_cs_style_001]
  mode: incremental   # incremental = 增量合并; full_replace = 全量替换
```

### 4.2 Handoff payload 结构（阶段一）

```yaml
payload:
  objective: "抽取《非标退货处理规则》里的判定条件、处置档位、分流触发条件"
  source_files: [非标退货处理规则.docx]
  scene_hint: customer_service   # 场景类型提示
  category: 决策规则              # 本体分类
  mode: incremental
```

### 4.3 ontology-extraction 执行过程

1. 校验工单：只处理 `stage=material`、`target_skill=ontology-extraction`、`status=ready_to_dispatch | dirty` 的工单
2. 读取 `payload.source_files` 中的资料文件
3. 围绕 `objective` 构造**最小语义闭包**（concepts / relations / constraints / sources）
4. 同时输出两份产物：
   - `ontology/<topic>.slice.json`：工程消费格式（codegen / prompt 编排用）
   - `ontology/<topic>.slice.md`：人工评审格式

### 4.4 回传结构

```yaml
dispatch_callback:
  source_dispatch_target: ontology-extraction
  handoff_ids: [m_cs_rules_001]
  user_summary: "已从这批资料中抽出退货判定条件和处置档位；结果已写入 ontology，并标出仍需确认的边界。"
  artifacts:
    - path: ontology/return-policy.slice.json
    - path: ontology/return-policy.slice.md
  todo_results:
    - handoff_id: m_cs_rules_001
      status: success | warning | failed | skipped
      validation: PASS | WARNING | FAIL
  status: success | partial | failed
```

雇佣教练拿到回传后，把 `user_summary` 用业务语言复述给用户，等用户确认后把工单标为 `confirmed`，才解锁阶段二。

---

## 5. 阶段二：调用技能生成（skill-generation）

### 5.1 触发方式

```yaml
dispatch:
  target: skill-generation
  handoff_ids: [s_refund_init_001]
```

### 5.2 Handoff payload 结构（阶段二）

```yaml
payload:
  skills:
    - origin: template_package          # 来源：模板包 / 对话 / 上传文件
      generation_action: reuse_existing # reuse_existing = 复用已有; generate_new = 新生成
      skill_name: 订单状态查询
      skill_description: 根据订单号查询订单状态和物流进度
      trigger: 用户询问订单状态 / 物流进度
      expected_output: 一条状态回复 + 下一步建议
      existing_skill_slug: order-status-query     # 仅 reuse_existing 时填
      existing_artifact_path: skills/order-status-query/SKILL.md

    - origin: conversation
      generation_action: generate_new   # 需要新生成
      skill_name: 退货资格初判
      skill_description: 判断是否符合退货条件并把结论回给用户
      trigger: 出现退货 / 退款等关键词且匹配到具体订单
      expected_output: 一条回复（含结论 + 依据）+ 工单流转建议
```

**关键设计**：`payload.skills` 必须是**完整技能清单**，同时包含模板包已有的 skill（标记 `reuse_existing`）和本轮新增的 skill（标记 `generate_new`）。新生成的 skill 才会进入生成流程，已有的 skill 只记录引用不重复生成。

### 5.3 skill-generation 执行过程

1. 分流：Handoff 路径 / 直接路径 / 模糊路径
2. 将 `payload.skills[]` 归一为 **SkillSpec 中间模型**（统一 name / description / triggers / capabilities / boundaries）
3. 按模板渲染 `SKILL.md` + `metadata.json`
4. 质量校验：完整性、可触发性、可执行性、安全性、自包含性
5. 落盘到 `skills/<skill_slug>/`

### 5.4 产物目录结构

```
skills/<skill_slug>/
  SKILL.md              # 业务技能说明（面向运行时和人工审阅）
  metadata.json         # 完整 SkillSpec + 质量门 + 版本信息
  references/
    source-digest.md    # 输入来源归档
    extraction-notes.md # 能力提炼说明
    quality-report.md   # 质量校验结果
  contracts/            # 可选：当 ontology projection 信息足够时生成
    projections/ontology-extraction/...
```

### 5.5 回传结构

```yaml
dispatch_callback:
  source_dispatch_target: skill-generation
  user_summary: "已新增 1 个技能：退货资格初判；订单状态查询复用已有 skill。"
  todo_results:
    - handoff_id: s_refund_init_001
      status: success
      skill_results:
        - skill_name: 订单状态查询
          generation_action: reuse_existing
          status: reused
        - skill_name: 退货资格初判
          generation_action: generate_new
          status: success
          artifact: skills/seven-day-return-initial-check/SKILL.md
```

---

## 6. 阶段三：调用外部系统对接（external-config）

### 6.1 触发方式

```yaml
dispatch:
  target: external-config
  handoff_ids: [e_crm_read_001]
```

### 6.2 Handoff payload 结构（阶段三）

```yaml
payload:
  external_capabilities:
    - kind: normal                  # normal = 正常能力; skip = 用户明确不接外部系统
      category: read                # read / write / notify / search / transform
      objective: "退货咨询时从 CRM 拉指定订单的状态、客户等级、商品类型"
      target_system: 销售易 CRM
      integration_methods: [mcp]   # mcp / cli / http_api / sdk / webhook / manual
      linked_skills: [s_refund_init_001]  # 依赖哪些上游 skill Handoff id
      auth_kind: API Key            # 认证类型，只描述类型不写实际值
      required_fields: [order_id, created_at, status, customer_tier, product_category]
```

**安全红线**：token / 密钥 / 密码 / API Key 等真实凭据绝不在 Handoff payload 里出现。`auth_kind` 只表示凭据类型，实际值只能通过系统层的安全表单通道传入。

### 6.3 external-config 执行过程

1. 入口校验（stage / target_skill / status / payload 字段合法性）
2. 凭据扫描（检测 payload 中是否混入疑似凭据，发现则阻断）
3. 系统归一化（`target_system` → `system_slug`，同一系统多条能力合并）
4. 能力建模（生成 capability 草案，保留字段映射占位和凭据槽位引用）
5. 落盘到 `external/` 目录

### 6.4 产物目录结构

```
external/
  external-config.index.json        # 总索引：所有能力、系统、skip 记录
  systems/
    xiaoshouyi-crm.json             # 按系统聚合：认证形式 + 凭据槽位 + 能力列表
  capabilities/
    e_crm_read_001.json             # 每条 Handoff todo 的配置草案
  README.md                         # 人工审阅说明（不含任何真实凭据）
```

### 6.5 回传结构

```yaml
dispatch_callback:
  source_dispatch_target: external-config
  user_summary: "已生成销售易 CRM 的订单读取配置初稿，包含字段占位；凭据需要在右侧表单补齐。"
  todo_results:
    - handoff_id: e_crm_read_001
      status: success
      credential_slots:
        - credential_slot: xiaoshouyi-crm-api-key
          secret_ref: EXTERNAL_XIAOSHOUYI_CRM_API_KEY
          binding_status: pending   # 凭据待用户在表单里填写
```

---

## 7. 完整信号流转图

```
用户说话
    │
    ▼
employment-coach-conversation
    │  识别到可形成工单的内容
    │  ① 先调用 Handoff tool (action=upsert/patch) 记录工单
    │  ② 再给用户一句业务反馈
    │
    │  用户说"先这些"（阶段一）
    ├──► <dispatch target=ontology-extraction>
    │         │
    │         ▼
    │    ontology-extraction
    │    读取资料 → 抽取切片 → 写 ontology/
    │         │
    │         ▼
    │    dispatch_callback（含 user_summary + artifacts）
    │         │
    │         ▼
    ├──── 雇佣教练复述结果 → 用户确认
    │    工单状态: dispatched → confirmed
    │
    │  阶段一完成 → 解锁阶段二
    │
    │  用户说"先这些"（阶段二）
    ├──► <dispatch target=skill-generation>
    │         │
    │         ▼
    │    skill-generation
    │    SkillSpec 归一 → 渲染模板 → 质量校验 → 写 skills/
    │         │
    │         ▼
    │    dispatch_callback
    │         │
    │         ▼
    ├──── 雇佣教练复述结果 → 用户确认
    │    工单状态: dispatched → confirmed
    │
    │  阶段二完成 → 解锁阶段三
    │
    │  用户说"先这些"（阶段三）
    └──► <dispatch target=external-config>
              │
              ▼
         external-config
         能力建模 → 凭据槽位生成 → 写 external/
              │
              ▼
         dispatch_callback
              │
              ▼
         雇佣教练复述结果 → 用户确认凭据路径
         工单状态: dispatched → confirmed

         阶段三完成 → 进入实例打包（阶段四，不在本 skill 范围内）
```

---

## 8. 各 Skill 职责边界

| 能力 | 负责者 | 禁止跨界 |
|---|---|---|
| 引导对话、收集信息、维护 Handoff 工单 | `employment-coach-conversation` | 不直接写 ontology / skills / external |
| 更新 SOUL.md / IDENTITY.md / AGENTS.md | `employment-coach-conversation`（`<config_governance_patch>`） | MEMORY.md 永不修改 |
| 从业务资料抽取本体切片 | `ontology-extraction` | 不直接做 skill 生成或外部配置 |
| 生成业务技能包（SKILL.md） | `skill-generation` | 不修改 config / ontology / external |
| 生成外部系统配置草案 | `external-config` | 不收集真实凭据；不写 skills / ontology |
| 实例打包（阶段四） | 主 skill 自身 | 不在三个下游 skill 范围内 |

---

## 9. 关键约束汇总

| 约束 | 位置 |
|---|---|
| 前置阶段未完成时不创建下一阶段 Handoff 工单 | employment-coach-conversation 阶段硬卡点 |
| 雇佣教练不直接输出本体结构、skill 定义或外部配置内容 | employment-coach-conversation 禁止越权 |
| 下游 skill 只处理 `ready_to_dispatch` 或 `dirty` 状态的工单 | 三个下游 skill 均一致 |
| 产物必须同时有 `.md`（人读）和 `.json`（工程消费）两份 | ontology-extraction |
| `payload.skills[]` 必须同时包含复用项和新增项 | skill-generation |
| 真实凭据只能通过系统层安全表单通道传入，绝不出现在 payload | external-config + employment-coach-conversation |
| Handoff tool 调用先于对话输出，不能只在对话里复述 | employment-coach-conversation 全局原则 |
