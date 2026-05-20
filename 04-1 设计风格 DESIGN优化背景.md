# 设计系统灵感来源：SkillHub

## 1. 视觉主题与氛围

SkillHub 是一种少见的中国互联网工具站设计声音 — 它不靠密集卡片网格和品牌主色边框压住页面，而是把整张画布交给一条**清冷到通透的纵向冰蓝渐变**：顶部是薄荷冰蓝（`#a9d4ea` 附近），向下过渡经过淡蓝（`#cfe8f4`），落至近乎纯白（`#f8fbfc`），再收尾于柔和冰蓝（`#d8eef7`）。叠加双层白色径向光斑 — 左下 18% 处和右上 88% 处各一 — 如同阳光穿透云层的散射效果。整条渐变贯穿全页，卡片如同漂浮在晨雾里的冰晶，而不是钉在表格里的格子。这是它招牌的第一笔。

招牌的第二笔是**纯黑药丸按钮**。在那条清冷的冰蓝渐变之上，"通过对话安装""探索全部技能""+ 发布 Skill"全部用 `#000000` 实色填充，圆角拉到完全药丸（半径等于半个按钮高度）。这种"清冷背景 + 极硬黑按钮"的对比是品牌的第二招 — 把 CTA 换成品牌蓝立刻就不像 SkillHub 了。绝大多数面向开发者的中文站点会把品牌色作为 CTA 填充以求"专业感"，SkillHub 选择把品牌蓝 `#4a6cf7` 留给标题里的关键词高亮和外链，CTA 永远归于黑。

招牌的第三笔是**贯穿全站的搭子温度**。Hero 标题里 "SkillHub" 后面跟着一对小卡通眼睛 👀，导航 "AI 搭子" 上挂着橙色小 `new` 角标，"下载热榜🔥" 的火苗 emoji，页脚那句不务正业的"📝 谨此向 ClawHub 和 OpenClaw 项目致以诚挚谢意"。在一个面向 AI 玩家和开发者的工具站上，这种"搭子感"本身就是反常规 — 同类产品（ClawHub、Smithery 等）走的是冷色密集的开发者审美，SkillHub 选择了消费级 App 的语气。

整体氛围一句话：**冰蓝色的通透，带搭子感**。

**关键特征：**
- 纵向冰蓝渐变贯穿整页（`#a9d4ea` `#cfe8f4` `#eef7fa` `#f8fbfc` `#d8eef7`），配合双径向白色光斑
- 纯黑药丸按钮（`#000000`，半径 999px）作为主 CTA，不让位
- 标题用 SkillHub 蓝（约 `#4a6cf7`）做单词高亮，正文维持近黑 `#0a0a0a`
- 卡片纯白（`#ffffff`）配 1px 极淡边框 `#ececec` 和近乎隐形的阴影 `rgba(0,0,0,0.04)`，圆角 20px
- 字母头像是 iOS 风方角圆角（约 10-12px）配淡彩底，**不是圆形**
- 标签是无边框药丸，按品类配淡彩：`AI增强` 蓝、`信息处理` 橙、`工具` 绿、`开发工具` 灰
- 主标题字重 700，区块标题 600，彻底拒绝 Stripe 式 300 的"耳语权威"
- 数字使用 `tabular-nums` 让 `38.3万`、`1.0千` 在卡片里左对齐时不跳
- emoji 作为段落装饰常态出现（🔥、📝、🛡️、⚡），不藏不躲
- 所有 tab 用 2px 黑色下划线作为激活态，不靠色块或填充

## 2. 色彩体系与角色

### 主色

- **Pure Black**（`#000000`）：所有主 CTA 按钮的实色填充、Logo 文字、最强强调文本。是对清冷渐变最强烈的反差锚点。
- **SkillHub Blue**（`#4a6cf7`）：标题中的关键词高亮（"SkillHub"）、外链文字（`ClawHub↗`、`查看报告↗`）、品牌方形图标的实色填充、字母头像底为蓝色时的字。一种偏冷、略带紫调的中等饱和蓝 — 不是 Stripe 紫的奢华，也不是 Twitter 蓝的清脆，是更"科技产品"的工程蓝。
- **Pure White**（`#ffffff`）：所有卡片、安装提示框、输入框的表面色。在冰蓝渐变背景上提供清晰的边界。

### 渐变与氛围

- **Mint Ice**（`#a9d4ea`）：页面渐变的顶部起点。薄荷冰蓝的清冷基调。
- **Soft Sky**（`#cfe8f4`）：渐变中段过渡色。淡蓝，如天空的滤镜效果。
- **Frost White**（`#eef7fa` / `#f8fbfc`）：渐变中段至顶部。几乎透明的冰白。
- **Ice Blue End**（`#d8eef7`）：渐变的底部收尾。柔和的冰蓝。
- **Page Gradient**：
  ```css
  background:
    radial-gradient(ellipse 70% 45% at 18% 60%, rgba(255,255,255,0.95) 0%, rgba(245,250,252,0.75) 35%, rgba(221,239,247,0.35) 70%, transparent 100%),
    radial-gradient(ellipse 60% 45% at 88% 42%, rgba(255,255,255,0.75) 0%, rgba(235,247,252,0.45) 45%, transparent 100%),
    linear-gradient(180deg, #a9d4ea 0%, #cfe8f4 28%, #eef7fa 54%, #f8fbfc 70%, #d8eef7 100%);
  ```
  — 整页背景，不是 hero 局部。双径向白色光斑增强层次感。

### 标签底色（Tag Tints）

- **Tag Blue**：底 `#e8edff` / 字 `#4a6cf7`。`AI增强` 类技术标签。
- **Tag Orange**：底 `#fef1e3` / 字 `#c47a26`。`信息处理` 类标签。
- **Tag Green**：底 `#e6f5ec` / 字 `#15803d`。`工具` 类标签。
- **Tag Gray**：底 `#efefef` / 字 `#525252`。`开发工具` 类中性标签。
- **Tag Pink**：底 `#fde2e8` / 字 `#be185d`。`浏览器自动化` 类强调标签。

### 字母头像底色（Avatar Tints）

头像永远是淡彩底配同色系深字，方角圆角约 10-12px，**不是圆形**。

- **Avatar Green**：底 `#dcf2e3` / 字 `#0e8e4e`
- **Avatar Orange**：底 `#fef0d8` / 字 `#c47a26`
- **Avatar Gray**：底 `#ececec` / 字 `#666666`
- **Avatar Blue**：底 `#dde9ff` / 字 `#3d5cff`
- **Avatar Purple**：底 `#e6e2fa` / 字 `#6a5acd`
- **Avatar Pink**：底 `#fde2e2` / 字 `#be3a4a`
- **Avatar Solid Blue**（`#4a6cf7`）：少数官方/精选标识用实色填充配白字。
- **Avatar Solid Purple**（`#6a5acd`）：腾讯文档等品牌图标用实色紫填充配白字。

### 中性色阶

- **Heading**（`#0a0a0a`）：所有大标题、卡片标题、技能名。**不是纯黑** — 留一丝温度让它在冰蓝背景上不刺眼。
- **Body**（`#404040`）：正文段落、说明文字。
- **Body Soft**（`#737373`）：副标题、安装提示框正文、统计数值的标签。
- **Caption**（`#9ca3af`）：搜索框占位符、统计图标、面包屑分隔符。
- **Disabled**（`#d4d4d8`）：禁用按钮文字、未激活 tab 文字、空态图标。

### 状态色

- **Success Green**（`#10b981`）：安全检测圆点、成功状态指示。
- **Success Green Bg**（`#ecfdf5`）：整段"安全检测"提示框的浅薄荷底。
- **Success Green Border**（`#d1fae5`）：上述底色配套的边框。
- **Success Text**（`#15803d`）：状态药丸内的深绿文字。
- **Accent Orange**（`#ff7043`）：导航 `new` 角标的橙红文字。无背景，纯文字 + 字重提升。
- **Feedback Magenta**（`#be3a8a`）：右侧悬浮"建议反馈"按钮的字色。
- **Feedback Magenta Bg**（`#fde0e7`）：上述按钮的粉底。

### 表面与边框

- **Surface**（`#ffffff`）：卡片、面板、输入框背景。
- **Surface Soft**（`#fafafa`）：嵌套代码盒底色（在白卡片内部）。
- **Border Subtle**（`#ececec`）：卡片默认边框、tab 分隔线、统计行分隔线。**几乎隐形** — 不是为视觉切分，是为 1px 的工程感。
- **Border Hover**（`#d4d4d8`）：悬停态边框略加深。
- **Border Input**（`#e5e5e5`）：输入框、ghost 按钮的常规边框。
- **Border Row**（`#f5f5f5`）：卡片内部行间分隔线，比 `#ececec` 更淡。

### 阴影色

- **Shadow Card**（`rgba(0, 0, 0, 0.04)`）：卡片默认阴影色。极淡，几乎是颗粒感的氛围光。
- **Shadow Lift**（`rgba(0, 0, 0, 0.06)`）：悬停或抬起时的稍深阴影。
- **Shadow CTA**（`rgba(0, 0, 0, 0.12)`）：黑色按钮悬停时投下的微暗影 — 整套系统中**唯一**alpha 超过 0.06 的阴影。

## 3. 字体排印规则

### 字体族

- **Primary**：`-apple-system, "PingFang SC", "HarmonyOS Sans SC", "Microsoft YaHei", system-ui, sans-serif` — 站点优先调用系统字体，让中文在 macOS/iOS 上自动落到苹方，在 HarmonyOS 设备上落到鸿蒙黑，在 Windows 落到雅黑。
- **Latin Display**：英文部分（`SkillHub`、`Find Skills`、`AI`）观感更紧凑、字怀略小，疑似走 `Inter`、`DM Sans` 或系统 `system-ui` 中的英文部分。落到字体栈应为 `"Inter", -apple-system, sans-serif`。
- **Monospace**：代码片段（`npx skills find [query]`）使用等宽 `"SF Mono", "JetBrains Mono", Menlo, monospace`，配淡灰底盒。
- **Numerals**：所有统计数字（`38.3万`、`1.0千`、`2.9千`）必须使用 `font-variant-numeric: tabular-nums`，保证对齐。

### 层级

| 角色 | 字重 | 尺寸 | 行高 | 字间距 | 备注 |
|------|------|------|------|--------|------|
| Display Hero | 700 | 48px (3.0rem) | 1.25 | -0.5px | Hero 主标题"装上这个 SkillHub..." |
| Section Heading | 600 | 32px (2.0rem) | 1.30 | -0.2px | 区块标题"收录 3.5 万 个 Skills..." |
| Page Title | 600 | 28px (1.75rem) | 1.30 | -0.2px | 详情页技能名 "Find Skills" |
| Sub-heading | 600 | 18px (1.125rem) | 1.40 | 0 | 章节小标题 "When to Use This Skill" |
| Card Heading | 600 | 16px (1.0rem) | 1.40 | 0 | 三栏卡片标题"下载热榜""为你推荐""最近上新" |
| Body Large | 400 | 16px (1.0rem) | 1.55 | 0 | Hero 副标题、安装提示正文、详情页描述 |
| Body | 400 | 14px (0.875rem) | 1.50 | 0 | 卡片描述、技能名 |
| Stat Number | 600 | 18px (1.125rem) | 1.20 | 0 | 详情页统计数 `38.3万`，`tabular-nums` |
| Stat Label | 400 | 12px (0.75rem) | 1.40 | 0 | 统计数下方说明 `下载量` |
| Tag / Pill | 500 | 12px (0.75rem) | 1.20 | 0 | 标签药丸内文字 `AI增强` |
| Caption | 400 | 12px (0.75rem) | 1.40 | 0 | 时间戳、占位符、面包屑 |
| Code Inline | 500 | 13px (0.81rem) | 1.50 | 0 | 等宽，配 `#fafafa` 底盒 + 4px 圆角 |
| Button | 500 | 14-15px | 1.0 | 0 | 主/次 CTA 文字尺寸 |
| Nav Link | 500 | 14px (0.875rem) | 1.0 | 0 | 顶部导航 `热榜`、`全部技能` |

### 原则

- **字重四档主义**：层级靠 400/500/600/700 四档字重区分，不用斜体、不用全大写、不用衬线对比。这让中文段落保持一种"现代办公文档"的克制，避开 SaaS 站常见的字重狂欢。
- **标题不轻不疯**：Hero 用 700（不像 Stripe 的 300），因为更轻的字重在中文里会失去骨架；但比起多数中国 B 端站点动辄 800/900 的极重标题，700 仍属克制。
- **数字等宽是硬规则**：所有统计数字（下载量、收藏数、版本号）必须 `tabular-nums`，让 `38.3万` 和 `1.0千` 在垂直堆叠时左缘对齐。
- **行高分级**：标题 1.20-1.30 紧凑，正文 1.50-1.55 宽松。让"标题—正文—标签"形成视觉节奏，不靠 margin 硬撑。
- **不用全大写**：`Find Skills`、`SkillHub` 保持原大小写，不强制 ALLCAPS，不强制 Title Case。

## 4. 组件样式

### 按钮

**主 CTA（黑色药丸）**
- 背景：`#000000`
- 文字：`#ffffff`，500 字重，14-15px
- 内边距：12px 22px（高度约 44-48px）
- 圆角：999px（完全药丸）
- 边框：无
- 图标：左侧可选小图标（对话气泡、`</>` 代码符号），与文字间距 8px
- 悬停：背景 `#1a1a1a` + `box-shadow: 0 4px 12px rgba(0,0,0,0.12)`
- 用于：所有主操作（"通过对话安装"、"探索全部技能"、"+ 发布 Skill"、"Try it"）

**Ghost 按钮（白底描边）**
- 背景：`#ffffff`
- 文字：`#0a0a0a`，500 字重，14-15px
- 内边距：12px 22px
- 圆角：999px
- 边框：`1px solid #e5e5e5`
- 悬停：背景 `#fafafa`，边框 `#d4d4d8`
- 用于："命令行安装"、"登录"

### 搜索栏 + 黑色 CTA 复合控件

- 容器：白色药丸 `border-radius: 999px`，左侧搜索图标 + 输入区，右侧紧贴一个黑色药丸 CTA 按钮（"探索全部技能"），整体宽度约 720-840px
- 输入区背景：`#ffffff`
- 边框：`1px solid #e5e5e5`
- 占位符：`#9ca3af`，14px

### 卡片与容器

**三栏列表卡片**
- 背景：`#ffffff`
- 边框：`1px solid #ececec`
- 圆角：20px
- 阴影：`0 4px 16px rgba(0, 0, 0, 0.04)`
- 内边距：24px 20px
- 标题区：粗体 16-18px + 可选 emoji（🔥）
- 行间距：每个 skill 行约 14-18px 垂直内边距，行间用 `1px solid #f5f5f5` 分隔
- 悬停：阴影加深至 `0 8px 24px rgba(0,0,0,0.06)`，无位移

**安装提示框（Tabbed Code Block）**
- 容器：白底 `#ffffff`，圆角 16px，边框 `1px solid #ececec`
- 顶部 tab 行：两个 tab "安装 SkillHub 并设为优先技能安装源 ⚡"、"安装 SkillHub"
  - 激活：黑色文字 `#0a0a0a` + 底部 2px 黑下划线
  - 未激活：灰文字 `#737373`，无下划线
- 内容区：浅灰盒 `#fafafa`，圆角 12px，等宽字体显示提示词
- 右上角复制图标：`#737373`，悬停变 `#0a0a0a`

### 字母头像（Avatar Squircle）

- 尺寸：32px × 32px（卡片列表内）/ 56px × 56px（详情页）
- 圆角：10px（列表）/ 12px（详情页）— **不是圆形**，是 iOS App Icon 风格的方角
- 背景：淡彩（参见第 2 节 Avatar Tints）
- 文字：单大写字母（`S`、`F`、`G`、`M`、`A`），同色系深字，500 字重
- 例外：少数实色头像（蓝、紫）配白字

### 标签药丸（Pill Tag）

- 内边距：3px 10px
- 圆角：999px
- 字体：12px / 500 / 行高 1.2
- 多变体（详见第 2 节 Tag Tints）
- **不带阴影，不带边框** — 仅靠底色定位
- 例：`AI增强` `信息处理` `工具` `开发工具`

### 统计行（Stat Strip）

- 5 列等宽，水平排列
- 每列内：图标（顶部，灰色 `#9ca3af`，24px 线性图标）+ 数值（中央，18px 600 字重 `tabular-nums`）+ 标签（底部，12px 灰 `#737373`）
- 列间分隔：`1px solid #ececec`，仅在中间有，两端无
- 容器：圆角 12px，`1px solid #ececec`，无阴影或极轻

### 安全检测面板（Success Callout）

- 背景：`#ecfdf5`
- 边框：`1px solid #d1fae5`
- 圆角：12px
- 内边距：20px 24px
- 标题：`🛡️ 安全检测`，黑色 16px 600 字重
- 实验室子卡片：白底 `#ffffff` + `1px solid #d1fae5`，圆角 8px，水平排列，内含实验室名 + 绿色状态药丸
- 状态药丸：`● 安全，无风险`，绿圆点 `#10b981` + 深绿文字 `#15803d`，**无背景**
- 右侧链接：`查看报告 ↗`，蓝色 `#4a6cf7`

### Tab 导航（Section Tabs）

- 排列：水平等距，间距约 32px
- 字体：14-15px / 500 / `#0a0a0a`（激活）或 `#737373`（非激活）
- 激活指示器：底部 `2px solid #0a0a0a` 下划线，仅在激活 tab 下方
- 容器底部：整条 `1px solid #ececec` 分隔线
- 用于：详情页 `概述 / 安装方式 / 版本历史`

### 输入与表单

- 边框：`1px solid #e5e5e5`
- 圆角：药丸状 999px（搜索框）/ 8px（文本域）
- 聚焦：`box-shadow: 0 0 0 3px rgba(74,108,247,0.2)` + 边框 `#4a6cf7`
- 标签：`#404040`，14px
- 文本：`#0a0a0a`
- 占位符：`#9ca3af`

### 导航

- 容器：白色背景 + 极轻底部边框 `1px solid #ececec`，高度约 64px
- Logo：左侧 32px 卡通星形吉祥物 + `SkillHub` 文字（600 字重）
- 链接：水平排列，14px / 500 / `#0a0a0a`，间距约 32-40px
- 角标：链接旁可挂 `new` 橙色小角标（`#ff7043` 文字，无背景）
- 右侧 CTA：黑色药丸 "+ 发布 Skill" + 白色药丸 "登录"（未登录态）或圆形头像（已登录态）

### 链接文字

- 主链接（外链）：`#4a6cf7` + 后缀 `↗` 小箭头
- 链接默认无下划线
- 悬停：下划线显现

### 装饰元素

**emoji 装饰**
- 标题装饰：`SkillHub` 后跟 1.5em 大小的 `👀`（眼睛装饰）
- 段落 emoji：`🔥`（热榜）、`📝`（致谢）、`🛡️`（安全）、`⚡`（强调）
- 角标用文字 `new` 而非 emoji，橙红色 `#ff7043`

**致谢段落**
- 居中，灰色 `#9ca3af`，14px / 400，前置 `📝` emoji
- 无边框、无背景，纯文本浮在冰蓝渐变上

**右侧悬浮反馈条**
- 位置：固定在视口右边缘
- 背景：`#fde0e7`
- 文字：竖排（`writing-mode: vertical-rl`）`建议反馈`
- 颜色：`#be3a8a`
- 圆角：左侧 12px，右侧 0
- 字体：12px / 500

## 5. 布局原则

### 间距体系

- 基础单位：4px
- 完整刻度：4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128 px
- 卡片内边距：20-24px
- 卡片间距：16-24px
- 区块上下间距：64-96px（区块之间留出大块呼吸空间）
- 文字行间距由 `line-height` 处理，不靠 margin

### 网格与容器

- 最大内容宽度：约 1200px（在大屏明显居中带左右大边距）
- 头部导航：内宽与内容容器对齐
- Hero：单列居中，标题最大宽度约 18-20em，副标题约 30em
- 三栏卡片：等宽自动分配（`grid-template-columns: repeat(3, 1fr)`），列间距 16-20px
- 详情页：单列居中，最大宽度约 880-960px

### 留白哲学

冰蓝渐变底色本身就是留白 — 不是空白，是"有色的通透空"。这让大块未填内容仍然不显单调。卡片之间的间距比卡片内容密度大得多，造成"内容岛屿"漂浮在晨雾里的感觉，而不是表格。区块间 64-96px 的大间隙是品牌从容感的来源 — 比 SaaS 站常见的 32-48px 区块间距明显大一档。双径向白色光斑增强了这种通透感，如同阳光穿透云层的散射效果。

### 圆角刻度

- Micro（4px）：内联代码盒、状态指示小元素
- Standard（8-10px）：字母头像、小卡片（实验室子卡）
- Comfortable（12px）：tab 容器、安装提示框内的代码盒、安全检测面板
- Relaxed（16px）：安装提示框外壳、详情页统计行
- Generous（20px）：三栏列表卡片
- Pill（999px）：所有按钮、所有标签、搜索框

## 6. 层深与高度

| 级别 | 处理 | 用途 |
|------|------|------|
| Flat (Level 0) | 无阴影 | 段落正文、内联文字、tab 文字 |
| Subtle (Level 1) | `0 1px 2px rgba(0,0,0,0.03)` | 安装提示框内的代码盒 |
| Card (Level 2) | `0 4px 16px rgba(0,0,0,0.04)` | 三栏列表卡片、详情页统计行、安全检测面板 |
| Lift (Level 3) | `0 8px 24px rgba(0,0,0,0.06)` | 卡片悬停态、搜索栏 |
| CTA (Level 4) | `0 4px 12px rgba(0,0,0,0.12)` | 黑色按钮悬停态投下的微暗影 |
| Focus Ring | `0 0 0 3px rgba(74, 108, 247, 0.2)` | 输入框/按钮键盘聚焦态 |

**阴影哲学**：SkillHub 的阴影系统是**几乎不存在的**。所有阴影都用极低 alpha（0.03-0.06）的纯黑色，模糊大、扩散小、Y 偏移小。这与 Stripe 的多层蓝调阴影是相反的设计哲学 — SkillHub 不靠阴影制造层级，而靠**清冷的冰蓝渐变背景 + 双径向白色光斑 + 纯白卡片**的色彩对比来分层。当背景本身已经是通透光的，阴影只需要存在感而不是力度。值得注意的是黑色 CTA 是唯一获得稍强阴影的元素 — `rgba(0,0,0,0.12)` 让它在悬停时产生"按下"的物理反馈，因为黑色按钮在冰蓝渐变背景上需要被锚住。

### 装饰性层深

- 整页冰蓝渐变背景 + 双径向白色光斑是一种"虚拟深度" — 顶部冷、底部暖，左下和右上有白色散射光斑，造成多层次的通透感
- 安全检测面板用浅薄荷底色 + 浅薄荷边框，制造一种"嵌入式"感而不需要阴影
- 顶部导航底部 1px 极淡边框是唯一的"分层硬线" — 不靠阴影或背景色变化

## 7. 该做与不该做

### 该做

- 使用冰蓝渐变 + 双径向白色光斑作为整页背景：
  ```css
  background:
    radial-gradient(ellipse 70% 45% at 18% 60%, rgba(255,255,255,0.95) 0%, rgba(245,250,252,0.75) 35%, rgba(221,239,247,0.35) 70%, transparent 100%),
    radial-gradient(ellipse 60% 45% at 88% 42%, rgba(255,255,255,0.75) 0%, rgba(235,247,252,0.45) 45%, transparent 100%),
    linear-gradient(180deg, #a9d4ea 0%, #cfe8f4 28%, #eef7fa 54%, #f8fbfc 70%, #d8eef7 100%);
  ```
  不只是 hero 区
- 主 CTA 永远用纯黑 `#000000` + 完全药丸 `border-radius: 999px`
- 卡片用 `border-radius: 20px` + `1px solid #ececec` + 极淡阴影 `0 4px 16px rgba(0,0,0,0.04)`
- 字母头像用方角圆角（10-12px）配淡彩底，按字母对应一种色系（S 绿、F 灰、G 灰、M 蓝、A 粉等）
- 在标题中用 `#4a6cf7` 高亮关键词（"SkillHub"、产品名）
- 标题用 `#0a0a0a` 而不是 `#000000`，留一丝温度
- 标签用药丸 chip + 同色系淡彩底（蓝/橙/绿/灰/粉），不带边框
- 数字使用 `font-variant-numeric: tabular-nums` 让统计对齐
- 在合适处使用 emoji 作为段落装饰（🔥、🛡️、📝、⚡、👀）
- 链接外链后追加 `↗` 小箭头

### 不该做

- 不要把渐变限制在 hero 区 — 它必须贯穿整页才有 SkillHub 的味道
- 不要把主 CTA 做成圆角矩形（`border-radius: 8px` 或 12px）— 必须是完全药丸
- 不要给主 CTA 加边框或描边 — 它就是一块纯黑实色
- 不要用品牌蓝 `#4a6cf7` 作 CTA 填充 — 蓝色只用于关键词高亮、链接、个别图标
- 不要把字母头像做成圆形 — iOS 风格方角是品牌识别点
- 不要给卡片加深阴影或彩色阴影 — 阴影是几乎隐形的中性灰
- 不要用纯黑 `#000000` 作正文标题 — 永远是 `#0a0a0a` 起步
- 不要在中文标题里用 300/400 极轻字重 — 中文需要 600+ 才有骨架
- 不要把标签做成有边框的色块 — 必须是无边框的淡彩底药丸
- 不要在卡片里堆叠彩色 emoji 装饰 — emoji 只在标题级和段落引导处出现
- 不要用红色作为强调或品牌色 — SkillHub 的强调系统是冷蓝 + 暖橙的搭子组合，红色不在调色板里

## 8. 响应式行为

### 断点

| 名称 | 宽度 | 关键变化 |
|------|------|----------|
| Mobile | <640px | 单列堆叠，hero 字号 32px，导航折叠为 hamburger |
| Tablet | 640-1024px | 三栏卡片塌陷为单列或 2 栏，hero 字号 36-40px |
| Desktop | 1024-1440px | 三栏卡片维持，hero 字号 44-48px |
| Wide | >1440px | 容器封顶 1200px，两侧自然留白 |

### 触摸目标

- 主 CTA 按钮：最小高度 44px（移动端），桌面端约 44-48px
- 标签药丸：高度 24-28px，水平内边距留足以保证 32px+ 触摸热区
- 字母头像：32px（列表）至 56px（详情）
- 顶部导航链接：垂直内边距 12-16px 保证 44px 触摸热区

### 折叠策略

- Hero 字号：48px → 36px → 32px 三档收缩
- 三栏卡片：3 列 → 2 列（>768px）→ 1 列（<640px）
- 顶部导航文字链接折叠为 hamburger（<768px）
- 安装提示框 tab 行可水平滚动（<480px）
- 详情页统计行从 5 列等分变为 2 列网格（<640px）
- 区块间距 64-96px → 40-48px（移动端）

### 图像与图标行为

- 字母头像保持 1:1 比例，等比缩放
- emoji 装饰保持原尺寸，不缩放
- 安装提示代码盒：横向滚动（不换行），保留等宽字体
- Logo 吉祥物：在小屏只显示图标不显示文字

## 9. 代理提示指南

### Quick Color Reference

- Primary CTA: Pure Black (`#000000`)
- CTA Hover: Near Black (`#1a1a1a`)
- Brand highlight: SkillHub Blue (`#4a6cf7`)
- Background gradient:
  ```css
  background:
    radial-gradient(ellipse 70% 45% at 18% 60%, rgba(255,255,255,0.95) 0%, rgba(245,250,252,0.75) 35%, rgba(221,239,247,0.35) 70%, transparent 100%),
    radial-gradient(ellipse 60% 45% at 88% 42%, rgba(255,255,255,0.75) 0%, rgba(235,247,252,0.45) 45%, transparent 100%),
    linear-gradient(180deg, #a9d4ea 0%, #cfe8f4 28%, #eef7fa 54%, #f8fbfc 70%, #d8eef7 100%);
  ```
- Surface (cards): Pure White (`#ffffff`)
- Heading text: Near Black (`#0a0a0a`)
- Body text: Dark Gray (`#404040`)
- Muted text: Medium Gray (`#737373`)
- Caption: Light Gray (`#9ca3af`)
- Border: Subtle Gray (`#ececec`)
- Success: Green (`#10b981`) on `#ecfdf5` panel bg
- Tag tints: blue `#e8edff` / orange `#fef1e3` / green `#e6f5ec` / gray `#efefef` / pink `#fde2e8`

### Example Component Prompts

- "Create a hero section over a full-page ice-blue gradient background with dual radial white light spots. The gradient should be `linear-gradient(180deg, #a9d4ea 0%, #cfe8f4 28%, #eef7fa 54%, #f8fbfc 70%, #d8eef7 100%)` applied to `body`, plus two radial gradients at 18% 60% and 88% 42%. Headline at 48px weight 700 color `#0a0a0a`, with a single keyword highlighted in `#4a6cf7`. Subtitle 16px weight 400 color `#737373`. Below it, a row of two pill buttons: primary is solid `#000000` with white text and `border-radius: 999px`, padding 12px 22px; secondary is white with `1px solid #e5e5e5` border, dark text, same pill radius. Above the headline, place a small white pill badge with `1px solid #ececec` border containing the line '🔥 专为中国用户优化的 AI Skills 社区'."

- "Build a 3-column card grid with white cards. Each card: `background: #ffffff`, `border: 1px solid #ececec`, `border-radius: 20px`, `box-shadow: 0 4px 16px rgba(0,0,0,0.04)`, padding 24px 20px. Card title 16px weight 600 black with optional emoji prefix (e.g. 🔥 or no emoji). Inside, list rows separated by `1px solid #f5f5f5`, each row containing a 32px squircle avatar (radius 10px, pastel tint background like `#dcf2e3` with darker letter `#0e8e4e` 500 weight) + skill name 14px weight 600 + tag pill below + tabular numerals for stats `☆ 2.9千  ↓ 52.1万` in 12px gray `#9ca3af`."

- "Design a tag pill: `border-radius: 999px`, padding 3px 10px, font 12px weight 500, no border, no shadow. Use these tint pairs: AI/tech tags use `#e8edff` background with `#4a6cf7` text; processing tags use `#fef1e3` with `#c47a26`; tool tags use `#e6f5ec` with `#15803d`; neutral dev tags use `#efefef` with `#525252`; browser-automation tags use `#fde2e8` with `#be185d`."

- "Create a success callout panel: `background: #ecfdf5`, `border: 1px solid #d1fae5`, `border-radius: 12px`, padding 20px 24px. Title row with 🛡️ emoji + bold black 16px text reading '安全检测'. Inside, two horizontally-arranged white sub-cards (`background: #ffffff`, `border: 1px solid #d1fae5`, `border-radius: 8px`, padding 12px 16px) each containing a lab name on left ('科恩实验室') and a status pill on right reading `● 安全，无风险` with green dot `#10b981` and dark green text `#15803d`. Right edge of each sub-card has a small link `查看报告 ↗` in `#4a6cf7`."

- "Build a search bar with attached black pill CTA. Container is a single rounded pill `border-radius: 999px` of white background with `1px solid #e5e5e5`, total width ~720px. Left side has a search icon (`#9ca3af`) and input with placeholder color `#9ca3af` at 14px reading '搜索 skill 名称、描述'. Right side is a black pill button (`#000000`, white text, 14px weight 500, padding 12px 22px) flush against the right edge of the container, reading '探索全部技能' with a small icon prefix."

- "Create a stats strip: a single rounded container with `1px solid #ececec` and `border-radius: 12px`, divided into 5 equal columns separated by `1px solid #ececec`. Each column contains an outlined gray icon `#9ca3af` 24px on top, a bold number like `38.3万` at 18px weight 600 black with `font-variant-numeric: tabular-nums` in the middle, and a 12px gray label `#737373` at the bottom (`下载量`)."

### Iteration Guide

1. Always apply the page-wide ice-blue gradient with dual radial white spots to `body`. SkillHub is unrecognizable without it.
2. Primary CTA is always pure black (`#000000`) with `border-radius: 999px`. Never use the brand blue for CTA fills.
3. Headings use `#0a0a0a`, not `#000000`. The 6% lift adds warmth on the ice-blue background.
4. Use SkillHub Blue `#4a6cf7` only for: keyword highlights inside headings, hyperlinks, brand-mark icons, focused state outlines. Never as a button background.
5. Cards = white + `border-radius: 20px` + `1px solid #ececec` + nearly-invisible shadow `0 4px 16px rgba(0,0,0,0.04)`.
6. Tags are pill-shaped with no border and pastel-tinted backgrounds. Match background tint to text color family.
7. Avatars are 10-12px radius squircles, NOT circles. Use pastel tint + darker letter from same color family.
8. All numerical displays use `font-variant-numeric: tabular-nums`.
9. Use emoji decorations (🔥 🛡️ 📝 ⚡ 👀) sparingly at section headers and inline accents — never inside cards or buttons themselves.
10. Shadows are nearly invisible — `rgba(0,0,0,0.03-0.06)`. The black CTA is the only element that gets `0.12` shadow alpha and only on hover.

---

> **暗色模式说明**：源站当前未提供暗色模式。`preview-dark.html` 中的暗色令牌为合理推导：渐变改为深色冰蓝调（深蓝 #0d1926 → 冰蓝灰 #1a2a3a → 深灰蓝 #0f1a24），表面 `#171717`，文字 `#fafafa`/`#a3a3a3`，**主 CTA 反转为白色药丸**（黑色在暗背景上会消失，必须反转），品牌蓝维持 `#4a6cf7` 作为高亮（在暗背景上仍有足够对比度）。
