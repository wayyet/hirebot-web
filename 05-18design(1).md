# 设计系统灵感来源：BAOBAO 报报后台

## 1. 视觉主题与氛围

报报后台是少见的"化妆品工业 SaaS"声音 — 它既不走 ERP 的冷蓝灰表格,也不走美妆电商的少女粉糖霜,而是把整张画布交给一层**雾面奶白底色 + 漂浮的橙色氤氲光晕**:底色定格在 `#F5F5F7`,在它之上由三团 `#FF5E0F` 的高斯模糊光球缓慢漂移(`blur(120px)` + `mix-blend-multiply`),让画布像化妆品柜台后的灯箱,而不是工厂车间的荧光灯。这是它招牌的第一笔。

招牌的第二笔是**毛玻璃漂浮面板**。侧边栏、卡片、BAOBAO 助手抽屉全部用 `bg-white/30 backdrop-blur-xl` + `border-white/40` 处理,让组件像一片片半透明亚克力浮在橙光之上;这种"暖光底 + 雾化玻璃 + 极细高光描边"的叠层是品牌的第二招 — 一旦把面板换成实色白卡片立刻丢掉 BAOBAO 的味道,变回 Ant Design。

招牌的第三笔是**工业本体的严肃语义反差**。在这层柔光毛玻璃之上,任务派发工作台展示的是"岗位 > 人员 > 设备/生产线"的硬本体层级:置信度百分比、进度条、SHA 校验、SOP 解析状态,全部用近黑 `#1E293B` 数据字 + 单线图标 + `tabular-nums` 等宽数字呈现。柔光是氛围,数据是骨架 — 这种"美妆灯箱 + 工业仪表"的张力,正是报报区别于其他车间 MES 的人格特征。

整体氛围一句话:**雾面奶白上的橙色灯箱,半透明亚克力里藏着工业仪表**。

**关键特征:**
- 整页底色 `#F5F5F7`,叠加 3 团 `#FF5E0F` 高斯模糊光球 + `animate-blob` 缓慢漂移,贯穿全屏不留死角
- 所有主面板使用 `bg-white/30 backdrop-blur-xl` + `border-white/40` 的毛玻璃语言,不用实色卡片
- 品牌橙 `#FF5E0F` 同时承担 CTA 填充、激活态指示、关键数据高亮三种角色,是本系统**唯一**的强彩色
- 字母/图标头像/Logo 用方角圆角(8-12px),与岗位/设备/产线的本体卡片一致
- 标签按本体类型配淡彩底:岗位橙、人员蓝、设备绿、产线紫、异常红
- 数据字使用 `tabular-nums`,让置信度 `87.3%`、SHA `a1b2c3` 在弹窗里左缘不跳
- 置信度进度条永远配数字 + 颜色阶梯:>90 绿 / 70-90 橙 / <70 红,不允许只有色条没数字
- 二次确认弹窗强制配"覆盖/合并"双 Radio + 默认安全项预选,绝不允许危险操作单按钮直通
- 侧边栏 BAOBAO 助手用半透明抽屉 + 分页快捷功能组,不用全屏遮罩

## 2. 色彩体系与角色

### 主色

- **BAOBAO Orange**(`#FF5E0F`):主 CTA 实色填充、激活 tab 下划线、置信度高亮、品牌 logo 实色。是整套系统**唯一**承担强调任务的彩色,绝不让位给蓝紫绿。
- **Orange Soft**(`#FF5E0F` @ 20% alpha):背景光晕、Hover 态轻填充、激活态侧边栏底色。
- **Industrial Ink**(`#1E293B`):所有大标题、数据字、岗位编号。**不是纯黑** — Slate 800 的深蓝灰,在奶白毛玻璃上有工业仪表的金属感而不刺眼。
- **Mist White**(`#F5F5F7`):整页底色,不是 `#ffffff` — 一丝灰让橙光晕有"穿透感"。

### 玻璃面板

- **Glass Surface**(`rgba(255, 255, 255, 0.30)` + `backdrop-blur: 24px`):所有主面板、侧边栏、弹窗外壳。
- **Glass Surface Strong**(`rgba(255, 255, 255, 0.55)` + `backdrop-blur: 32px`):弹窗、抽屉、需要更高内容对比的容器。
- **Glass Border**(`rgba(255, 255, 255, 0.40)`):毛玻璃面板的高光描边,模拟亚克力边缘折光。
- **Glass Border Inner**(`rgba(0, 0, 0, 0.06)`):面板内部行分隔线,几乎隐形。

### 本体类型色(Ontology Tints)

每种本体实体配一种淡彩,贯穿标签、头像、卡片角标。

- **岗位 Orange**:底 `#FFE8D9` / 字 `#C2410C`。承担"职责/角色"语义。
- **人员 Blue**:底 `#DBEAFE` / 字 `#1E40AF`。承担"操作者/责任人"语义。
- **设备 Green**:底 `#D1FAE5` / 字 `#047857`。承担"物理资产/产能单元"语义。
- **产线 Purple**:底 `#EDE9FE` / 字 `#6D28D9`。承担"流程/工序串"语义。
- **车间 Slate**:底 `#E2E8F0` / 字 `#334155`。承担"空间/组织"中性容器。

### 状态色

- **Success Green**(`#10B981`)/ 底 `#ECFDF5`:同步成功、解析完成、置信度 ≥ 90%。
- **Warn Amber**(`#F59E0B`)/ 底 `#FEF3C7`:缺失实体提示横幅、增量合并默认态、置信度 70-89%。
- **Danger Red**(`#EF4444`)/ 底 `#FEE2E2`:覆盖模式警告、解析失败、置信度 < 70%。
- **Info Blue**(`#3B82F6`)/ 底 `#DBEAFE`:BAOBAO 助手提示、历史记录条目。

### 中性色阶

- **Heading**(`#1E293B`):标题、岗位名、设备编号。
- **Body**(`#475569`):正文、卡片描述。
- **Body Soft**(`#64748B`):副标题、置信度标签、时间戳。
- **Caption**(`#94A3B8`):占位符、图标默认色、面包屑分隔符。
- **Disabled**(`#CBD5E1`):禁用按钮、未激活 tab。

### 边框

- **Border Glass**(`rgba(255, 255, 255, 0.40)`):毛玻璃外描边。
- **Border Hairline**(`rgba(30, 41, 59, 0.08)`):卡片内部、表格行分隔。
- **Border Input**(`#E2E8F0`):输入框、Ghost 按钮常规边。
- **Border Focus**(`#FF5E0F`):聚焦态边框,配 `rgba(255,94,15,0.20)` 3px 外发光环。

### 阴影色

- **Shadow Float**(`rgba(15, 23, 42, 0.06)`):毛玻璃面板默认投影,极淡。
- **Shadow Lift**(`rgba(15, 23, 42, 0.10)`):Hover 抬起态。
- **Shadow Modal**(`rgba(15, 23, 42, 0.16)`):弹窗、确认对话框。
- **Shadow CTA**(`rgba(255, 94, 15, 0.32)`):橙色按钮 Hover 时的橙色色温投影 — 系统中**唯一**带色阴影。

## 3. 字体排印规则

### 字体族

- **Primary**:`-apple-system, "PingFang SC", "HarmonyOS Sans SC", "Microsoft YaHei", system-ui, sans-serif` — 让中文在不同操作系统上落到最合适的系统字。
- **Mono**:`"SF Mono", "JetBrains Mono", Menlo, monospace` — 用于 SHA、岗位编号、SOP 版本号、置信度百分比。
- **Numerals**:所有数据字段、置信度、进度条数值必须 `font-variant-numeric: tabular-nums`。

### 层级

| 角色 | 字重 | 尺寸 | 行高 | 备注 |
|------|------|------|------|------|
| Page Title | 700 | 28px | 1.30 | 工作台主标题"任务派发工作台" |
| Section Heading | 600 | 20px | 1.35 | 区块标题"计划下发与同步" |
| Card Heading | 600 | 16px | 1.40 | 卡片标题、岗位名 |
| Sub-heading | 500 | 14px | 1.45 | 步骤名"岗位解析 > 人员同步 > 物理映射" |
| Body | 400 | 14px | 1.55 | 正文段落、说明文字 |
| Caption | 400 | 12px | 1.45 | 时间戳、占位符 |
| Stat Number | 600 | 24px | 1.20 | 弹窗中置信度大数字,`tabular-nums` |
| Stat Number Inline | 600 | 14px | 1.20 | 卡片内数据 `87.3%`,`tabular-nums` |
| Tag / Pill | 500 | 12px | 1.20 | 标签药丸文字 |
| Code | 500 | 13px | 1.50 | 等宽,SHA、岗位编号 |
| Button | 500 | 14px | 1.0 | 按钮文字 |

### 原则

- **字重四档主义**:400/500/600/700,不用 800/900 极重,避免与橙色 CTA 抢视觉。
- **数据字独立排印**:所有置信度、进度、版本号必须 mono + tabular-nums,与中文标题在视觉上做明确分离 — 工业仪表感的来源。
- **本体名加粗**:岗位名、设备编号、产线名一律 600,与正文叙述形成节奏。
- **不用全大写**:即便是 SHA 或编号,保持原大小写。

## 4. 组件样式

### 按钮

**主 CTA(橙色实色)**
- 背景:`#FF5E0F`
- 文字:`#FFFFFF`,500 字重,14px
- 内边距:10px 20px(高度约 40px)
- 圆角:10px(**不是完全药丸** — 工业气质需要轻方角)
- Hover:背景深一档 `#E54E00` + `box-shadow: 0 8px 20px rgba(255,94,15,0.32)`
- 用于:"下发计划"、"确认覆盖"、"开始解析"、"补充上传"

**Ghost 按钮(毛玻璃描边)**
- 背景:`rgba(255, 255, 255, 0.40)` + `backdrop-blur: 12px`
- 文字:`#1E293B`,500 字重,14px
- 边框:`1px solid rgba(255, 255, 255, 0.60)`
- Hover:背景 `rgba(255, 255, 255, 0.60)`

**Danger 按钮(红色描边白底)**
- 背景:`#FFFFFF`
- 文字:`#DC2626`,500 字重
- 边框:`1px solid #FCA5A5`
- 用于:"完全覆盖"模式选择按钮的次态(主态仍要走橙色 CTA + 二次确认)

### 毛玻璃面板(Glass Panel)

- 背景:`rgba(255, 255, 255, 0.30)`
- 后置滤镜:`backdrop-filter: blur(24px)`
- 边框:`1px solid rgba(255, 255, 255, 0.40)`
- 圆角:16px
- 阴影:`0 8px 32px rgba(15, 23, 42, 0.06)`
- 内边距:24px
- 用于:所有主区块、侧边栏、卡片外壳

### 侧边栏(Sidebar)

- 宽度:折叠 80px / 展开 256px,Motion `spring` 切换
- 背景:`rgba(255, 255, 255, 0.30)` + `backdrop-blur-xl`
- 右侧边:`1px solid rgba(255, 255, 255, 0.40)`
- 导航项:Hover 时背景 `rgba(255, 94, 15, 0.08)`;激活时背景 `rgba(255, 94, 15, 0.16)` + 左侧 3px 橙色圆角 indicator + 文字色 `#FF5E0F`

### BAOBAO 助手抽屉

- 右侧抽屉,宽 360px,从右滑入
- 背景:`rgba(255, 255, 255, 0.55)` + `backdrop-blur: 32px`
- 顶部:BAOBAO logo + 一句话欢迎语
- 中部:分页快捷功能组,每页 2x2 网格,4 个圆角方块按钮(80x80px,`bg-white/40`,Hover `bg-white/70`)
- 底部:页码圆点指示器 + 翻页箭头
- 关闭按钮:右上角 `X`,Caption 灰

### 本体卡片(Ontology Card)

- 容器:Glass Panel
- 顶部色条:左上贴 4px 圆角的本体类型彩条(岗位橙 / 人员蓝 / 设备绿 / 产线紫)
- 头像/图标:方角圆角 10px,淡彩底配同色系深色 icon
- 标题:600 / 16px / `#1E293B`
- 副标题:400 / 12px / `#64748B`
- 标签行:本体类型标签 + 状态标签
- 缺失态(警告):整卡背景叠 `rgba(245, 158, 11, 0.08)`,边框换 `1px solid #FCD34D`,右上角 ⚠ + "缺失" 黄色药丸,底部出现"上传补充文件 / 手动填写"两个 Ghost 按钮

### 标签药丸(Pill Tag)

- 内边距:3px 10px
- 圆角:999px
- 字体:12px / 500
- 无边框、无阴影
- 多变体(详见第 2 节本体类型色 + 状态色)

### 置信度条(Confidence Bar)

- 容器:水平进度条,高 6px,圆角 999px,底色 `rgba(30,41,59,0.08)`
- 填充色阶:
  - ≥ 90:`#10B981`
  - 70-89:`#F59E0B`
  - < 70:`#EF4444`
- 右侧紧贴大号数字 `87.3%`,Mono + tabular-nums,字色与填充色同步
- 用于:动态确认弹窗、SOP 解析进度、岗位匹配结果

### 进度条(Progress)

- 高度:8px
- 圆角:999px
- 底色:`rgba(30,41,59,0.08)`
- 填充:橙色 `#FF5E0F`,带 `linear-gradient(90deg, #FF5E0F, #FF8A4C)` 微光
- 顶部右侧标签:`步骤 2 / 3`,500 / 12px / `#64748B`

### 三步走流程(Step Stripe)

用于"计划下发与同步"左侧布局。

- 三步水平排列:岗位解析 > 人员同步 > 物理映射
- 每步圆形序号(28x28px):未到 — Caption 灰底 + 灰字;进行中 — 橙底白字 + 外发光 `0 0 0 4px rgba(255,94,15,0.20)`;完成 — 绿底白字 + ✓
- 步骤间连接线:`2px` 虚线;已完成段实色橙
- 步骤标题:600 / 14px
- 步骤副本:400 / 12px / Body Soft

### 二次确认弹窗(Confirm Modal)

- 容器:Glass Surface Strong,圆角 16px,内边距 28px,最大宽 480px
- 标题:`⚠ 确认补充上传策略`,600 / 18px / `#1E293B`
- 模式选择:两张并排单选卡片
  - **增量合并(默认选中)**:左卡片,蓝边 `#3B82F6` + 蓝色 Radio,描述"仅向缺失类别注入数据,原有内容完整保留"
  - **完全覆盖**:右卡片,红边 `#FCA5A5`,描述"清空所有现有数据并以新文件为准 — 不可恢复"
- 数据概况面板:Glass 子卡,缺失类别行用 ⚠ + 琥珀色 `#F59E0B` 高亮,正常行用本体类型色点
- 底部 CTA:Ghost "取消" + 橙色实色"确认下发"
- 当用户选择"完全覆盖"时,确认按钮变 Danger 红色 + 文字改"确认覆盖,我已知晓风险"

### 缺失实体全局横幅(Missing Banner)

- 顶部宽条,Glass Surface + 琥珀色 `rgba(245, 158, 11, 0.12)` 叠层
- 边框:`1px solid #FCD34D`
- 圆角:12px
- 左侧:⚠ 琥珀 icon + 文案"检测到 2 个本体类别尚未解析:生产线、设备资产"
- 右侧:Ghost "上传补充文件" + Ghost "手动填写"

### 历史记录按钮 / 列表

- 按钮:Ghost 按钮 + `History` icon,常驻流程控制区右侧
- 列表抽屉:右侧 400px Glass 抽屉,按时间倒序排列
- 单条:时间戳(Mono / Caption) + 计划名 + 发布人(蓝色人员标签) + 状态药丸(成功/失败/部分成功) + 右侧 `查看详情 →`

### 输入与表单

- 边框:`1px solid #E2E8F0`
- 圆角:10px
- 背景:`rgba(255, 255, 255, 0.60)`
- 聚焦:边框 `#FF5E0F` + `box-shadow: 0 0 0 3px rgba(255,94,15,0.20)`
- 占位符:`#94A3B8`

### 数据表格

- 表头:`rgba(255, 255, 255, 0.40)` + `backdrop-blur` + 600 / 13px / `#475569`
- 行高:48px
- 行分隔:`1px solid rgba(30,41,59,0.06)`
- Hover 行:`rgba(255, 94, 15, 0.04)`
- 行内操作:仅 icon 按钮,Hover 显示文字 tooltip

## 5. 布局原则

### 间距体系

- 基础单位:4px
- 完整刻度:4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80
- 面板内边距:24px
- 面板间距:16-24px
- 主区块上下间距:32-48px(比 SkillHub 紧凑 — 后台系统信息密度更高)

### 网格与容器

- 全屏布局:左侧 80/256px 侧边栏 + 右侧主内容区,内容区无最大宽度封顶(铺满)
- 工作台主区:`grid-cols-12` + `gap-6`
- "计划下发与同步":左 7 列(三步走) + 右 5 列(流程控制 + 历史记录)
- 弹窗:居中,最大宽 480-720px

### 留白哲学

奶白底 + 橙光晕本身就是"动态留白" — 即使主区块紧凑排列,光晕的漂移让画面始终有呼吸。这让后台系统的高密度信息(表格、置信度、本体卡片堆叠)不显压迫。区块间 32-48px 的间隙比常规 B 端管理后台(16-24px)略宽,是品牌从容感的来源。

### 圆角刻度

- Micro(4px):色条 indicator、小色块
- Standard(10px):按钮、输入框、本体头像
- Comfortable(12px):全局横幅、进度容器
- Relaxed(16px):Glass 面板、弹窗
- Pill(999px):标签、进度条本体、状态药丸

## 6. 层深与高度

| 级别 | 处理 | 用途 |
|------|------|------|
| Flat (Level 0) | 无阴影 | 正文文字、表格行内容 |
| Ambient (Level 1) | 橙色 blob blur(120px) @ 20% alpha | 全屏氛围背景 |
| Float (Level 2) | `0 8px 32px rgba(15,23,42,0.06)` | Glass 面板默认 |
| Lift (Level 3) | `0 12px 40px rgba(15,23,42,0.10)` | Hover、抽屉 |
| Modal (Level 4) | `0 24px 64px rgba(15,23,42,0.16)` | 二次确认弹窗、BAOBAO 助手 |
| CTA Glow (Level 5) | `0 8px 20px rgba(255,94,15,0.32)` | 橙色按钮 Hover,**唯一带色阴影** |
| Focus Ring | `0 0 0 3px rgba(255,94,15,0.20)` | 输入框/按钮聚焦态 |

**阴影哲学**:报报后台的层深由"毛玻璃 + 橙光晕"这两层环境光共同营造,真正的投影只在 Hover 和 Modal 才出场。这与 Material Design 多层硬投影的设计哲学相反 — 报报靠环境光分层,不靠投影硬切。橙色 CTA 的色温投影是唯一例外:它需要在浅色毛玻璃上锚住自己,并向用户暗示"这是会发生变更的关键操作"。

## 7. 该做与不该做

### 该做

- 整页背景使用 `#F5F5F7` 底色 + 3 团 `#FF5E0F` 高斯模糊光球 + `animate-blob` 漂移
- 所有主面板使用 `bg-white/30 backdrop-blur-xl border-white/40` 的毛玻璃语言
- 主 CTA 永远用橙色 `#FF5E0F` 实色填充 + 10px 圆角(轻方角,不是完全药丸)
- 数据字、置信度、SHA、版本号全部 mono + `tabular-nums`
- 置信度按色阶染色 + 必须配数字,绝不只有色条
- 本体类型严格对应配色:岗位橙 / 人员蓝 / 设备绿 / 产线紫 / 车间灰
- 危险操作(完全覆盖)必须 Danger 红 + 二次确认 + 默认预选安全项(增量合并)
- BAOBAO 助手用半透明抽屉 + 分页快捷功能组,而不是底部弹窗或全屏遮罩
- 流程控制区永远配"历史记录"按钮,让用户能回溯过往发布
- 标题用 `#1E293B`(Slate 800)而不是纯黑,保留工业仪表的金属感

### 不该做

- 不要把橙光晕限制在 hero 或 banner — 它必须铺满全屏才有 BAOBAO 的味道
- 不要把主 CTA 做成完全药丸(`border-radius: 999px`)— 那是消费级产品的语气,后台系统用 10px 方角
- 不要给主 CTA 加描边 — 它就是一块实色橙
- 不要用蓝/绿/紫作 CTA 填充 — 这些颜色只用于本体类型标识和状态指示
- 不要把毛玻璃面板换成实色白卡片 — 一旦换实色立刻变 Ant Design
- 不要用纯黑 `#000000` 作标题 — 永远是 `#1E293B` 起步
- 不要给本体卡片堆叠多种彩色边框 — 一个本体只配一种类型色
- 不要在置信度条上只画色条不写数字 — 工业仪表必须可读
- 不要让"完全覆盖"成为默认或单按钮直通 — 永远是 Radio 二选一 + 默认增量合并
- 不要用红色作品牌色或装饰色 — 红色仅留给"覆盖警告 / 失败 / 异常"三种危险语义
- 不要在卡片内嵌套大量 emoji — emoji 只在 BAOBAO 助手对话气泡和全局横幅 ⚠ 处出现

## 8. 响应式行为

### 断点

| 名称 | 宽度 | 关键变化 |
|------|------|----------|
| Tablet | 768-1024px | 侧边栏强制折叠为 80px;12 列网格塌陷为 8 列;三步走改为竖排 |
| Desktop | 1024-1440px | 侧边栏可展开;主区域 12 列;标准布局 |
| Wide | 1440-1920px | 主区域内嵌最大宽 1600px;两侧自然留白 |
| Ultra | >1920px | 主区域封顶 1800px;BAOBAO 助手默认常驻不收起 |

### 触摸目标

- 主 CTA:最小 40px 高度
- 侧边栏导航项:48px 行高
- 本体头像:32px / 40px / 56px 三档(列表 / 卡片 / 详情)
- 表格行操作 icon:32x32px 触摸热区

### 折叠策略

- 三步走流程:水平 → 竖排(<1024px)
- 计划下发左右分栏:7+5 → 单列堆叠(<1024px)
- 二次确认弹窗模式选择:并排 2 列 → 上下堆叠(<640px)
- 历史记录抽屉:400px → 全屏 Sheet(<768px)
- BAOBAO 助手抽屉:360px → 全屏 Sheet(<768px)

### 动画与运动

- 侧边栏展开/收起:Motion `spring`,`stiffness: 300, damping: 30`
- Blob 光球漂移:`animate-blob` 7s 循环,延迟错位 0/2s/4s
- 弹窗/抽屉:Motion `fade + slide`,`duration: 0.2s, ease: [0.16, 1, 0.3, 1]`
- 置信度条/进度条:`width` 过渡 `duration: 0.6s, ease-out`
- Hover 抬起:`transform` 不位移,只改阴影和背景透明度(避免毛玻璃跳动)

## 9. 代理提示指南

### Quick Color Reference

- Primary CTA: BAOBAO Orange (`#FF5E0F`)
- CTA Hover: Deep Orange (`#E54E00`)
- CTA Glow: `rgba(255, 94, 15, 0.32)`
- Page background: Mist White (`#F5F5F7`) + 3 个 `#FF5E0F` blur(120px) 光球
- Glass panel: `rgba(255,255,255,0.30)` + `backdrop-blur-xl` + `border rgba(255,255,255,0.40)`
- Heading: Industrial Ink (`#1E293B`)
- Body: Slate (`#475569`)
- Body Soft: Slate Muted (`#64748B`)
- Caption: Slate Light (`#94A3B8`)
- Ontology tints: 岗位 `#FFE8D9/#C2410C` / 人员 `#DBEAFE/#1E40AF` / 设备 `#D1FAE5/#047857` / 产线 `#EDE9FE/#6D28D9` / 车间 `#E2E8F0/#334155`
- States: Success `#10B981` / Warn `#F59E0B` / Danger `#EF4444` / Info `#3B82F6`

### Example Component Prompts

- "Create a glass panel: `background: rgba(255,255,255,0.30)`, `backdrop-filter: blur(24px)`, `border: 1px solid rgba(255,255,255,0.40)`, `border-radius: 16px`, `box-shadow: 0 8px 32px rgba(15,23,42,0.06)`, padding 24px. Place it on a page with `background: #F5F5F7` and 3 absolutely-positioned `#FF5E0F` blurred blobs (blur 120px, opacity 0.20, mix-blend multiply, animated with a 7s drift loop)."

- "Build a confirmation modal for the supplemental upload flow. Container: glass surface strong (white 55% + blur 32px), `border-radius: 16px`, padding 28px, max-width 480px. Title row: amber ⚠ icon + bold 18px '确认补充上传策略'. Body: two side-by-side radio cards. Left card (default selected): blue border `#3B82F6`, label '增量合并', sub '仅向缺失类别注入数据,原有内容完整保留'. Right card: red border `#FCA5A5`, label '完全覆盖', sub '清空所有现有数据并以新文件为准 — 不可恢复'. Below: a glass sub-panel listing data categories — missing rows highlighted with amber ⚠ and `#F59E0B` text. Footer: ghost '取消' + orange `#FF5E0F` solid '确认下发' (which switches to red Danger style if 完全覆盖 is selected)."

- "Design an ontology card for a 岗位 (post): glass panel with a 4px-radius left-edge stripe in `#FF5E0F`. Inside: a 40px squircle icon (radius 10px, background `#FFE8D9`, icon `#C2410C`), title 600/16px `#1E293B`, subtitle 400/12px `#64748B`, a row of pill tags (post-orange `#FFE8D9`/`#C2410C` + status pill). Use tabular-nums for any embedded numbers."

- "Build a confidence bar: 6px-height rounded rail (`rgba(30,41,59,0.08)`), fill color stepped by value: ≥90 green `#10B981`, 70-89 amber `#F59E0B`, <70 red `#EF4444`. To the right, place the percentage number in mono font with `tabular-nums`, same color as the fill. Animate width transition over 0.6s ease-out."

- "Create the three-step stripe '岗位解析 > 人员同步 > 物理映射' for the plan dispatch panel. Three circular step badges (28px) horizontally arranged with dashed connector lines between them. Pending: gray bg + caption text. In-progress: orange `#FF5E0F` bg + white number + 4px outer glow `rgba(255,94,15,0.20)`. Done: green `#10B981` bg + white ✓. Below each badge: 600/14px step title + 400/12px description in `#64748B`."

- "Build the BAOBAO assistant drawer (360px wide, slides in from right). Background: glass surface strong (white 55% + blur 32px). Top: BAOBAO logo + greeting line. Middle: a paginated 2x2 grid of quick-action tiles (80x80px each, `bg-white/40`, rounded 12px, hover `bg-white/70`, icon + label). Bottom: dot pagination indicator + arrow buttons. Top-right: close X in caption gray."

### Iteration Guide

1. Always apply the page-wide `#F5F5F7` background with 3 animated `#FF5E0F` blur blobs. 报报后台 is unrecognizable without the orange ambient glow.
2. Primary CTA is always solid `#FF5E0F` with `border-radius: 10px` (not full pill). Never use blue/green/purple for CTA fills — they belong to ontology types.
3. Headings use `#1E293B` (Slate 800), not `#000000`. The dark slate gives an industrial-instrument feel that pure black cannot.
4. All panels use glass styling: `bg-white/30 + backdrop-blur-xl + border-white/40`. Never replace with solid white cards.
5. Ontology cards have a left-edge color stripe matching the ontology type (post-orange / person-blue / device-green / line-purple / workshop-gray).
6. Tags are pill-shaped with no border, using ontology tint pairs.
7. Confidence bars and progress bars MUST display the number alongside the color fill — instruments must be readable.
8. All numeric displays use mono font + `font-variant-numeric: tabular-nums`.
9. Dangerous operations (完全覆盖) require radio-card selection (默认 increment merge) + secondary confirmation. Never expose a one-click destructive button.
10. Shadows are nearly invisible (alpha 0.06-0.16). The orange CTA is the only element that gets a colored glow shadow `rgba(255,94,15,0.32)` on hover.

---

> **暗色模式说明**:当前系统仅提供浅色模式。如未来需推导暗色:底色改为 `#0F172A`(slate 900),光球改为 `#FF5E0F` @ 30% alpha + `blur(160px)` 让橙光在深底更显灼热;玻璃面板改为 `rgba(30,41,59,0.40)` + `border rgba(255,255,255,0.08)`;标题改 `#F1F5F9`;主 CTA 维持 `#FF5E0F` 实色(在深底上对比度更高,不必反转)。
