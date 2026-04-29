# Discovery Sub-Skills — 内部设计约定

## 概览

本目录包含 4 个预置子 skill，由 `digital-employee-discovery` 主 skill 在雇佣流程中隐式触发。

```
manifest-skill    ← Round 2 确认后触发
ontology-skill    ← Round 3 确认后触发
generator-skill   ← Round 4 确认后触发
cli-skill         ← Round 5 确认后触发
```

## 注册与初始化执行顺序

4 个子 skill 在系统初始化时注册，不在主 skill 的 SKILL.md 中显式声明。主 skill 按 round 隐式触发，用户无法直接调用。

### 初始化执行顺序（Round 0 开始前）

在 discovery 会话正式启动（Round 0）之前，系统按以下顺序执行一次预初始化：

```
1. generator-skill  →  从模板已有能力定义中产出初始能力清单（capability_list）
2. ontology-skill   →  基于初始能力清单，定义精确的初始本体切片（ontology_slice）
```

**顺序不可颠倒。** generator-skill 必须先于 ontology-skill 执行。

**原因：** ontology-skill 使用能力清单作为范围锚点，确保本体切片只收录能力实际需要的概念（最小充分切片原则）。若 ontology-skill 先于 generator-skill 运行，切片范围无法对齐能力边界，会导致概念遗漏或过度收录。

初始化完成后，session state 中 `capability_list` 和 `ontology_slice` 均有初始值，discovery 会话从 Round 0 开始时已有可用上下文。后续各 round 的触发会在此基础上局部更新，而非从空白状态开始。

## 两阶段自由度规则

子 skill 的"随时可调用"能力受主 skill 的会话状态约束：

### 阶段一：首次完整通过（`first_pass_in_progress`）

- 六步必须从 Round 0 依序执行至 Round 6
- 子 skill 可在当前 round 内因用户修改被**多次触发**（例如用户在 Round 2 内反复调整人设）
- 子 skill **不能被用户跳轮触发**——Round 3 的 ontology-skill 不能在 Round 2 尚未完成时运行
- 状态由主 skill 维护，子 skill 本身无状态

### 阶段二：首次完整通过后（`first_pass_complete`）

- 用户可在会话框随时追加说明，修正任意步骤内容
- 主 skill 识别补充内容所属 round，触发对应子 skill 重新运行
- 子 skill 幂等执行：读取最新 session context，返回更新后的结构化数据
- 主 skill 将更新数据合并入 session state，标记 `draft_updated`
- 所有 round 的子 skill 均可在此阶段被重新触发，无顺序限制

## 子 skill 设计约束

| 约束 | 说明 |
|---|---|
| 无状态 | 子 skill 不持有任何状态，所有状态由主 skill 的 session state 维护 |
| 返回结构化数据 | 所有子 skill 返回 JSON 对象，不生成文档 |
| 部分输出合法 | context 不完整时返回 partial 输出 + gaps 列表，不抛出错误 |
| 不与用户交互 | 子 skill 不产生任何面向用户的输出，所有交互由主 skill 承担 |
| 幂等 | 相同 context 多次调用产生相同输出 |

## Session State 关键字段

主 skill 维护以下状态字段，子 skill 从中读取输入、将输出写回：

```json
{
  "first_pass_complete": false,
  "rounds_completed": [],
  "manifest": null,
  "ontology_slice": null,
  "capability_list": null,
  "cli_spec": null,
  "draft_updated": false
}
```

子 skill 的输出写入对应顶层字段（`manifest` / `ontology_slice` / `capability_list` / `cli_spec`），主 skill 在 Round 6 时将四个字段汇总为最终简报。
