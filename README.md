# 雇佣平台 · 前端代码包

> 基于 `03-雇佣端详细需求规格说明书.md` 实现的前端原型,React + Vite + Tailwind,**前端可用代码,后端纯 mock**。

## 启动

```bash
npm install
npm run dev
```

浏览器自动打开 http://localhost:5173

> 一切都在浏览器里跑,不需要任何后端服务。

## 我能在哪里看到什么

启动后,顶部右上角的"角色切换器"是演示入口。两个角色配套两条菜单:

| 角色 | 菜单 | 对应文档章节 |
|------|------|-----|
| **部门长 张明** | 工作台 / 模板池 / 我的部门版 / 反馈聚合 | § 4 § 5 § 6 § 10 |
| **普通职员 王小芳** | 工作台 / 浏览部门版 / 我的分身 | § 3.5 § 5 § 6.3 § 9 |

### 部门长完整流程
1. **工作台** → 看自己管理的所有部门版状态
2. **模板池** → 浏览全局/本企业模板,点开看详情
3. **从模板调教部门版** → 进入**调教向导**(`HireWizard.jsx`,核心)
   - 六大步骤:场景匹配 → 差距挖掘 → manifest → ontology → skill → cli
   - AI 评估(自动 + 进度可视化)
   - 失败 Review(6 个回退按钮,推荐项标橙色)
   - 人工评估(部门长丢真实案例)
   - IM 绑定(注册飞书 bot 身份)
   - 上岗确认
4. **我的部门版** → 列表管理,可重新调教/退役
5. **反馈聚合** → 部门内成员反馈聚合(只看聚合,不能下钻)

### 普通职员完整流程
1. **浏览部门版** → 只看到本部门、live 状态的
2. **一键复制 3 步**:确认 → 设个人对外身份 → 自动注册飞书 bot(2 秒模拟,真实 SLA P95 ≤ 30s)
3. **飞书私聊体验** → 模拟 IM 界面,bot 基于关键词回复
4. **评分弹窗 + 反馈提交** → 评分给自己,反馈结构化跨级到部门长
5. **私有分支** → 简化版六步,通过后切换飞书 bot 路由(不创建新 bot)

## 架构

```
src/
├─ main.jsx                  入口
├─ App.jsx                   路由分发(根据 user.role)
├─ store.jsx                 全局状态 React Context(user / instances / feedbacks / toast)
├─ components/
│   ├─ Shell.jsx             布局壳:顶部 bar + 左侧菜单 + 角色切换
│   └─ UI.jsx                复用组件:Stepper / Avatar / Chip / Card / ChatBubble
├─ mock/
│   ├─ seed.js               种子数据:模板、实例、反馈、调教脚本、评估用例
│   └─ api.js                Mock 后端,所有调用 Promise + setTimeout
├─ pages/lead/               部门长页面 6 个
└─ pages/staff/              普通职员页面 6 个
```

### 技术栈
- **React 18 + react-router-dom 6**
- **Vite 5** 极速开发
- **Tailwind CDN**(故意不引入 PostCSS,确保 npm install 后即用)
- **状态管理**:React Context(不引入 zustand/redux,避免依赖膨胀)

## Mock 与真实接入

`src/mock/api.js` 中的函数签名严格对齐文档 § 12 接口规格:

| 函数 | 对应接口 |
|------|---------|
| `fetchTemplates` / `fetchTemplateById` | § 12.1.1 / § 12.1.2 |
| `startCoach` / `postCoachMessage` | § 12.2.1 |
| `startEvaluation` / `fetchEvalProgress` | § 12.2.2 |
| `clonePersonalInstance` | § 12.2.3(关键:P95 ≤ 30s) |
| `registerBotIdentity` / `retireBotIdentity` | § 12.3.1 / § 12.3.4 |
| `checkDisplayNameUnique` | § 11.2 |
| `sendFeishuMessage` | § 9.4 飞书消息回复路径 |
| `submitRating` / `submitFeedback` | § 10 反馈链路 |

**真实接入**:把 `mock/api.js` 中的函数体替换为 fetch 调用,函数签名保持不变,业务页面无需改动。例如:

```js
export async function fetchTemplates(query) {
  const res = await fetch('/api/templates?' + new URLSearchParams(query))
  return res.json()
}
```

## 关键设计决策(对应文档约束)

| 约束 | 实现位置 |
|------|---------|
| 部门长不可见模板源代码 | `TemplateDetail.jsx` 右侧"权限说明"卡 |
| 雇佣端不创建/派生模板 | `TemplatePool.jsx` 无"创建模板"按钮 |
| 浏览部门版只显示 live + 本部门 | `BrowseDept.jsx` 中 `filter` 双重条件 |
| 复制分身跳过六大步骤 | `CloneFlow.jsx` 只 3 步,直接调 `clonePersonalInstance` |
| 私有分支不可二次分支 | `MyClones.jsx` 中 `instance_type === 'personal_clone'` 才显示按钮;`PrivateBranch.jsx` 进入时校验 |
| 部门长不可下钻反馈具体内容 | `FeedbackCenter.jsx` 右侧醒目"隐私边界"卡片 |
| 私有分支评估通过后切换 bot 路由(不新增 bot) | `PrivateBranch.jsx` 的 `passSelfEval`,复用 `bot_identity_id` |
| 显示名同 owner 唯一 | IM 绑定提交前调 `checkDisplayNameUnique` |
| 评估失败 Review 提供 6 个回退入口 | `HireWizard.jsx` Review 阶段的 6 按钮(`reviewBackTo`) |
| 部门长不可放弃实习的情绪保护 | `HireWizard.jsx` "放弃此次雇佣" 用 confirm |

## 演示数据

启动后两个预置用户:
- **部门长 张明** 已雇佣 3 个部门版:客服小张(live)/ 售后小李(live)/ 投诉处理小赵(调教中)
- **普通职员 王小芳** 已有 3 个分身,其中 1 个是私有分支

切换角色无需登录,不污染对方的数据。

## 不在范围(故意省略)

为聚焦 MVP 核心,以下功能未实现(均对应文档 § 14 不做项):
- 群聊机器人(应用级配置忽略群消息)
- 实时反馈仪表盘(MVP 只做静态周报)
- 跨企业模板交换
- 自定义评分维度
- A/B 测试不同 bot 版本
