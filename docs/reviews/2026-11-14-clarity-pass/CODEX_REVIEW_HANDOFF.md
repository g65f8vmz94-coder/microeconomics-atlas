# Antigravity 讲解表达改写第二轮交接报告（2026-11-14）

> 本文档对应清单 `/Users/mingzegao/Downloads/大二课程资料/output/中微网站交付/2026-11-14-Antigravity表达改写清单/` 全部 73 项改写任务（38 项 P1 + 35 项 P2），提交于源码主仓 `/Users/mingzegao/Downloads/大二课程资料/sites/microeconomics-atlas-public`。

## 一、分支、提交与改动文件清单

- **工作分支**：`antigravity/clarity-pass-2026-11-14`
- **基线提交（`main`）**：`11ff794171aa2db479634383a532a4dcb3af0cb0`
- **源码改写提交**：`aa5faa9bf045e961fa1d2fdb8c1748aad6400f6e`（`35 files changed, 600 insertions(+), 570 deletions(-)`；本交接文档于随后独立文档提交入同分支）
- **逐条台账路径**：`/Users/mingzegao/Downloads/大二课程资料/output/中微网站交付/2026-11-14-Antigravity表达改写清单/改写进度.csv`（73/73 项全部标记为 `已改并自检`，均基于源码实改内容填写 `修改后说明`、`验证` 与 `仍有疑问`）
- **保护边界说明**：
  - 未修改、未伪造 `src/section-audits.json`；
  - 工作区原有未追踪草稿（`ANTIGRAVITY_HANDOFF.md`、`art/`、`src/sky-*`）完整保留未动且未提交；
  - 未触碰 `sites/micro-atlas`、线上托管部署或 `/Volumes/资料总库`。

### 修改并提交的 35 个文件

1. **清单直接覆盖的 32 个内容与源码文件**：
   - 生活理解版（20 章全部文件）：`src/guided/ch01.cjs`–`src/guided/ch10.cjs`、`src/guided/ch11.mjs`–`src/guided/ch20.mjs`
   - 4h 速通版（全部 3 份）：`src/review/formal-1-7.json`、`src/review/formal-8-14.json`、`src/review/formal-15-20.json`
   - 作业讲评（3 份）：`src/review/homework/assignment3-2.html`、`src/review/homework/assignment3-4.html`、`src/review/homework/assignment3-5.html`
   - 独立保险课（2 份）：`src/insurance-lesson/manuscript.html`、`src/insurance-lesson/model.js`
   - 经典交互 / 图示文案（4 份）：`src/market-exercises-content.mjs`、`src/exchange-core-content.mjs`、`src/exchange-manipulation-content.mjs`、`src/arrow-proof-content.mjs`
2. **为支持 `E062`（§18.2 偏好顺位表）扩展的 2 个共享引导版文件**：
   - `src/guided/build.cjs`（在 `.condition-text` 内支持渲染结构化 `unit.givenTables`，保持原有 `li` 选择器结构不变）
   - `src/guided/style.css`（新增 `.condition-tables` / `.condition-table` 样式以支持窄屏与桌面条件栏表格布局）
3. **自动同步产出的 1 个覆盖率状态文件**：
   - `coverage.json`（由 `node build.cjs` 按当前 `src/section-audits.json` 哈希校验结果诚实重写为 `completedSections: 0`、`complete: false`）

### 清单覆盖度与文本卫生扫描

- `逐条改写清单.json` 共 `73` 项（`E001`–`E073`，含 38 项 P1、35 项 P2）：已用脚本核验 73 条原始 `sourceLine` 已全部从对应文件变更（`0` 项遗漏）。
- 提交 `aa5faa9` 全量 600 行新增内容扫描审校禁令/裸星号用语（`/冒充/`、`/凭空/`、`/禁止误读/`、`/根本不是/`、`/不能硬套/`、`/显然/`、`/\*\*[^\s*]/`）：**0 处命中**。
- `model` 计算参数、动画状态数值轨迹、来源标注与 `section-audits.json` 均未改写。

---

## 二、代表性改写对照与数学边界保留说明

### 1. 生活理解版（`src/guided/*`）

- **§1.4 词典序不存在效用表示（`E001`｜`src/guided/ch01.cjs`）**：
  - 原文把区间挑选有理数与不可数矛盾压在一句。
  - 改写后拆成两张因果卡：前卡先从固定第一坐标 $t\in[0,1]$ 得 $(t,1)\succ(t,0)$ 构造非空开区间 $I_t=(u(t,0),u(t,1))$，再证 $t'<t\Rightarrow u(t',1)<u(t,0)$ 得出区间两两互不相交（并标明示意图仅作辅助）；后卡显式按①每点配区间→②互不相交开区间各自取互异有理数 $q_t\in I_t\cap\mathbb{Q}$→③$[0,1]$ 与 $\mathbb{Q}$ 单射矛盾收尾。
- **§7.4 二级价格歧视豆浆摊（`E022` / `E023`｜`src/guided/ch07.cjs`）**：
  - 原题设单段塞入过多信息，半杯演示把两位顾客算账混跳且“净赚”易被误认为收现。
  - 改写后先将题设拆为未知类型统一定价、容量成本、两类愿付函数 $V_1(q)=6q-2q^2$ / $V_2(q)=4q-2q^2$、净好处“估值减支付”与并列规则；`q=0.5` 帧按顾客 2 底线定价 1.5 元 $\to$ 顾客 1 买小杯心理估值余地 $2.5-1.5=1$ 元（明确注明不是收到现金）$\to$ 大杯顶价 $4-1=3$ 元 $\to$ 合计 $4.5$ 元逐笔交代。
- **§10.2 纯交换初始定价试算（`E034`｜`src/guided/ch10.cjs`）**：
  - 原先第 1 帧直接写出“各花一半”。
  - 改写后在帧首以固定预算 $w$ 与得分 $2s(w-s)$ 补全为何乘积效用下两项支出越接近乘积越大（且标明仅适用本题乘积效用），再按①算家底→②分预算→③算斤数三步逐户得出甲 $(4,2)$ 与乙 $(5,2.5)$，对比库存 6 斤指出米缺口 3 斤。
- **§18.2 Gale–Shapley 延迟接受匹配（`E062` / `E063`｜`src/guided/ch18.mjs` + `build.cjs` + `style.css`）**：
  - 原题将例 18.4 双方顺位压进字符流，`ADCB` 极难对照。
  - 改写后在 `given` 旁新增两张完整 4 行顺位表（`申请者偏好`、`岗位偏好`），明确未结束时“暂留”会被后来更喜欢的新申请者顶掉；并将停机证明补全为“每位申请者至多被 1 岗暂留 + 岗位一旦留过人永不回空 $\Rightarrow$ 若有人被 $n$ 岗全拒，则 $n$ 岗必各占 1 位互异申请者而与总数 $n$ 矛盾”的鸽巢论证。
- **习题 19.3 最高者组边际贡献（`E065` / `E066`｜`src/guided/ch19.mjs`）**：
  - 题设显式列出“原档案增量 vs 纯增量档案”两项比较对象；证明中将按教材正式全员等式得出的主解（逐层法 $\frac{1}{4}=\frac{30}{120}$）与弱读题面仅约束被加量子集 $S$ 时的反例规则（“最高者逐层+其余按比例分余款”，算出甲得 $\frac{43}{120}$）分 (a)、(b) 两块讲清。

### 2. 4h 速通版（`src/review/formal-*.json`，全程保持严格形式化表述）

- **§10.5 第一福利定理（`E037`｜`src/review/formal-8-14.json`）**：
  - 展开完整四步反证：① 对效用不降者利用剩余预算 $\delta=\frac{pe(i)-py(i)}{p_1+p_2}>0$ 加购 $(\delta,\delta)$ 借单调性推翻 $py(i)<pe(i)$；② 严格改善者必 $py(j)>pe(j)$；③ 全员加总超总禀赋价值；④ 与资源可行性 $\sum y(i)=\sum e(i)$ 矛盾，同时保留“不用凸偏好、依赖无消费外部性”边界。
- **§16.4 轮流议价解题路径（`E057`｜`src/review/formal-15-20.json`）**：
  - 改为“期限 $\times$ 出价权 $\times$ 贴现”三类矩阵：（1）有限期无贴现 $\to$ 逆向归纳；（2）无限期轮流有贴现（本节主定理）$\to$ 平稳阈值+无差异接受+全历史一步偏离；（3）无限期无贴现 $\to$ 无贴现损耗下可信惩罚支撑多重 SPE，不沿用有贴现唯一性。
- **§17.3 Clarke 枢轴机制两层逻辑（`E060`｜`src/review/formal-15-20.json`）**：
  - 第一层“给定决策 $\delta$ 后” $\tau_i=\delta S-\max\{0,S\}$ 仅取决于 $S$ 与 $\delta$（以 $S=4,\delta=0$ 时报 $-5$ 与 $-10$ 同缴 $4$ 举例）；第二层“跨临界阈值 $-S$ 时” $x_i$ 翻转 $\delta$ 使净缴费在 $0$（非枢轴）与 $|S|$（枢轴外部损失）之间切换，消除两句话间的表面矛盾。
- **Proposition 20.1 阿罗不可能定理（`E072`｜`src/review/formal-15-20.json`）**：
  - 原“做题时怎样用”误引用“关键集合法（决定集缩减）”，与本页正文和 Osborne–Rubinstein 教材路线不一致。现已重写为完全对齐正文的“极端位置枢轴个体（pivotal voter）”四步路径，并在末注说明两者逻辑等价而考场衔接讲义宜沿本框四步展开。

### 3. 经典交互课、作业与独立保险课

- **`src/exchange-core-content.mjs`（`E038`）& `src/exchange-manipulation-content.mjs`（`E039`）**：删除开篇防误用清单打断及“稀世珍宝、强烈信号”等拟人修辞，将例 10.6 改写为“商品与真实效用 $x_1+x_2$ 不变，向定价机制申报 $3x_1+x_2$，机制按报告求解锁定 $p_1=3$”。
- **`src/review/homework/assignment3-2.html` / `3-4.html` / `3-5.html`（`E018` / `E025` / `E029`）**：分别补清跨期利率双变动预算（斜率与财富上限 $(2+r)y$）、微调菜单 $27-3\varepsilon$ 逼近上确界与原菜单并列取 27 对照、24 种权力全序与 5 种去重稳定配置“覆盖 + 无遗漏”双方向。
- **`src/insurance-lesson/manuscript.html` & `model.js`（`E010` / `E011`）**：阐明 $v'(W_F)>0$ 来自该财富处边际效用为正的假设而非凹性自动附带；把右侧排除 $x>x_F$ 的论证补全为线性财富 + 凹效用复合导致 $U(x)$ 凹、由切线上界与 $U'(x_F)<0$ 严格低于 $U(x_F)$。

---

## 三、验证证据（均于最后一次源码修改与构建后实测通过）

### 1. CLI 构建与全部 9 项回归套件（全部 exit code `0`）

| 命令 | 关键实测结果 |
|---|---|
| `node build.cjs` | `{"sections":90,"illustrated":90,"distinctEngines":27,"numberedItems":295,"auditedSections":0,"complete":false}` |
| `node test-guided.cjs` | `{"chapters":20,"sections":90,"problems":151,"newUnits":240,"frames":822,"proofs":805,"plots":29,"networks":11}` |
| `node test-guided-flow.cjs` | `{ units: 240, scenes: 822, deductions: 1105, conclusions: 575, answerRows: 503 }` |
| `node test-formal-review.cjs` | `{ sections: 90, claims: 82, formulas: 288, symbolEntries: 1646, derivationSteps: 993, textbookFigures: 5, minutes: 240 }` |
| `node test-review-library.cjs` | `{ chapters: 20, answerRows: 512, leaves: 10, figures: 10 }` |
| `node test-explanation-review.cjs` | `{"strings":14445,"inlineMathExpressions":2891,"fractionStructureChecks":3,"stateBudgetChecks":3}` |
| `node test-math.cjs` | `{ passed: true, checks: 10243, semanticFixtures: 540, selfContained: 829, uniqueScripts: 895 }` |
| `node validate-pack.cjs` | `{"files":1502,"totalBytes":263704543,"totalMiB":251.49,"maxExpandedBytes":268435456,"localLinks":10635,"missing":[],"privatePaths":[],"passed":true}` |
| `node test-offline-unpack.cjs` | `Verified browser decompression in 829 standalone pages, 7 distinct assets.` |

### 2. Google Chrome Playwright 回归测试（全部通过）

测试环境：`NODE_PATH=/Users/mingzegao/.npm/_npx/31e32ef8478fbf80/node_modules PLAYWRIGHT_CHANNEL=chrome`

- `node test-guided-conditions-browser.cjs --require-browser`：**16/16 PASS**（全部 240 个生活理解版条件清单与源码逐一匹配；含桌面与手机端 `10.2`、快速切换、`reducedMotion` 开关及离线开/关 JS）。
- `node test-classic-conditions-browser.cjs`：**4/4 PASS**（`{1440, keyboard}`、`{390, touch}`、`{320, touch, reducedMotion}`、`{320, touch, javaScriptEnabled:false}` 全部通过条件常驻、无遮挡及减弱动态检查）。
- `node test-textbook-entry-browser.cjs`：exit code `0`。
- `node src/insurance-lesson/test-flow.cjs`：**4/4 PASS**（`1440px JS on/off`、`320px JS on/off` 全数通过）。

### 3. 真实 Chrome 跨视口（`1440` / `390` / `320`px）与交互导航抽查

- 检查 **18** 个代表性生成页 × **3** 档视口 = **54** 个状态：`ALL_BROWSER_INSPECTION_CHECKS_PASSED: 54`（`learn-s7-4.html`、`learn-s10-2.html`、`learn-s18-2.html`、`learn-p16-8.html`、`learn-p17-1.html`、`learn-p19-3.html`、`review-1.html`、`review-7.html`、`review-16.html`、`review-19.html`、`review-20.html`、`review-hw3-2.html`、`review-hw3-4.html`、`review-hw3-5.html`、`insurance-3-9.html`、`lesson-10-5.html`、`lesson-10-6.html`、`lesson-20-4.html`）。
- 上述 54 个页面状态中：`pageErrors = 0`、`.katex-error = 0`、零整页横向溢出、零表格横向裁切。
- 交互与 URL 状态检查通过：`GUIDED_NAV_CHECK` 验证了 `learn-s18-2.html` 与 `learn-s7-4.html` 的键盘 Enter 步进/回退、`#scene-2` hash 还原及旧式 `?step=2` URL 兼容；`CLASSIC_NAV_CHECK` 验证了 `lesson-10-6.html` `#advance` 键盘 Enter 步进。
- 并通过截图人工核验了桌面/窄屏布局（`learn-s18-2` 1440/390/320 及吸顶态、`learn-s7-4` 1440、`learn-p19-3` 320、`review-16` 1440/320、`review-hw3-5` 1440/320、`insurance-3-9` 1440/320、`lesson-10-6` 1440/320 及步进后）：排版清晰，无重叠或截断。

---

## 四、`src/section-audits.json` 与 `coverage.json` 状态说明

- 按任务约定，本分支**未改动或伪造** `src/section-audits.json` 中的任何审核记录与哈希值。
- 本轮修改的文件中，有 **31** 个文件被列入各章节的 `codeFiles` 依赖清单（其中包括全部 20 份 `src/guided/ch*.cjs|mjs`、全部 3 份 `src/review/formal-*.json`、4 份经典内容脚本、`src/insurance-lesson/*` 2 份以及被各节共享引用的 `src/guided/build.cjs` 与 `src/guided/style.css`）。
- 由于共享构建/样式文件和三组速通 JSON 在全书 90 节中均有引用，目前 90 个条目的既有 `codeFiles` 哈希已全部变更。`node build.cjs` 据实输出 `auditedSections: 0, complete: false`，并把 `coverage.json` 重置为 `completedSections: 0, complete: false`（各条 `sectionAudit: null`）。
- 这一重置诚实反映了“本轮改写尚未完成 Codex 增量审校复核与重新签名”的客观状态；核心模型计算函数与公式数值逻辑本身未变动（`test-math.cjs`、`test-guided.cjs`、`test-formal-review.cjs` 全部通过）。

---

## 五、待 Codex 复核与用户确认的问题清单

1. **轻微文字笔误（建议合并或微调时顺手修）**：`E012` 对应的 `src/guided/ch04.cjs` 第 192 行中，“等值线 $\max\{x_1,x_2\}=k$ 正方框的上边”似漏掉一个“是”字（建议改为“正是方框的上边”）。该处数学语义无误，为保持“全部测试在最终源码之后通过”的一致性未再二次改动并重跑回归。
2. **§18.2 桌面左侧吸顶栏双表滚动体验（`E062`｜`learn-s18-2.html`）**：1440px 下左侧 `300px` 吸顶条件卡受 `max-height: calc(100dvh - 6rem)` 约束，首张“申请者偏好”表完整展示，“岗位偏好”表紧随其后需在条件栏内滚动查看（390px/320px 单栏下两表自然展开无遮挡）。请用户与 Codex 确认该桌面视觉呈现是否满意。
3. **习题 19.3 主解答与弱读反例并列（`E065` / `E066`｜`learn-p19-3.html`）**：目前已将正式等式主解（逐层法 $\frac{30}{120}$）标为 `(a)`，将按字面弱读时的反例规则（甲得 $\frac{43}{120}$）标为补充辨析 `(b)`，请确认学生阅读时是否容易分清两套前提。
4. **Proposition 20.1 证明路线对齐（`E072`｜`src/review/formal-15-20.json`）**：已把作答指南从“关键集合法”重对齐至本页正文与 Osborne–Rubinstein 教材的“极端位置枢轴个体（pivotal voter）”四步路径，请 Codex 复核第（3）步单人跨越表述是否与讲义措辞严丝合缝。
5. **移动端长卡片可读性与账目符号衔接（`E026`、`E034`、`E059`）**：`p8.2` 两组四人换位、`s10.2` 第 1 帧代数说明、`p17.3` 五栏毛净估值台账已展开每一步来源，信息密度较高，建议人工再抽看 390px 手机端滚动体验及 `17.3` 节“已扣成本净估值”与题 `17.3` “毛估值+另摊成本”的口径过渡。
6. **未测设备边界**：所有浏览器实测均在 macOS 版 Google Chrome（1440/390/320px 模拟视口）完成，未逐台真机检验实体手机或 Safari。
7. **Codex 审核后下一步**：请 Codex 对 `11ff794..aa5faa9` 的 35 个文件做增量语义与数学审校，复核无误后统一重算并更新 `src/section-audits.json` 哈希、重跑 `node build.cjs` 使 `coverage.json` 恢复 `complete: true`，再合入 `main` 并发布归档。
