# 体验优化轮次交接文档（2026-11-15 · Experience Pass）

- **分支**：`antigravity/experience-pass-2026-11-15`
- **基线提交**：`ebdd150e055da8737dceac51c78f196244387598`（`main` v148）
- **交接清单来源**：`output/中微网站交付/2026-11-15-Antigravity体验优化交接`（`UX01`–`UX11`，共 11 项）
- **状态说明**：本分支已完成实现、构建、本地 CLI 与真实浏览器（Chrome via Playwright）自动化验收与人工截图核对；尚未合并 `main`，未发布至 GitHub 公开分支或线上站点，待 Codex 复核。

---

## 一、11 项体验优化实现总览（UX01–UX11）

| 编号 | 优先级 | 实现内容与效果 | 核心修改文件 |
|---|---|---|---|
| **UX01** | P0 | 首屏优先呈现“本步要回答什么”(`.step-task`)、一句话结论摘要(`summary`) 与因果图景(`.visual-pane`)，长推导与完整细节收入可折叠 `<details class="guided-detail">`；手机端（`<=799px` / `<=650px`）收紧 `.condition-card` 与折叠高度，确保首屏看到关键图与结论。 | `src/guided/unit-flow.cjs`, `src/guided/build.cjs`, `src/guided/style.css`, `src/guided/ch07.cjs`, `src/guided/ch10.cjs`, `src/guided/ch18.mjs`, `src/guided/ch19.mjs` |
| **UX02** | P0 | 解除 `#answer` 直达锁定（允许直接访问 `learn-p*.html#answer` 查看完整手写答卷与旁注），在步骤顶部导航与正文保留直达入口，并在每条答卷旁注新增 `回到本步推理 ↗` 反向锚点；保留 `?step=`、`#given-N`、`#scene-2`、`#proof-1-2`、`#answer-row-N` 旧链接兼容。 | `src/guided/player.js`, `src/guided/unit-flow.cjs`, `src/guided/build.cjs`, `test-guided-conditions-browser.cjs` |
| **UX03** | P0 | 在停靠条件卡顶部新增上下文引用条 `#condition-cite`（含高亮跳转 `.cite-locate`），高亮当前步骤实际引用的 `.condition-text li.is-cited` 与 `.condition-table tr.is-cited`；为全书 240 单元补齐关键词/符号自动匹配 `matchGivenItems` 回退；无 JS 时保留 `.step-cite-inline` 内联条件提示。 | `src/guided/unit-flow.cjs`, `src/guided/build.cjs`, `src/guided/player.js`, `src/guided/style.css` |
| **UX04** | P0 | 为 `s7.4`（豆浆筛选杯量/净好处图）、`s10.2`（米豆预算与需求缺口条）、`s18.2`（暂留匹配追踪舞台）构建领域因果图景并去除冗余状态格（`hideGrid: true`）；跨步切换使用 Web Animations API 对 `[data-token]` 与 `[data-bar-key]`（含 `barAxis="y"`）执行连续位置/长度过渡，严格尊重 `prefers-reduced-motion` 与 `data-motion="reduced"`，快速连点取消旧动画。 | `src/guided/figure.cjs`, `src/guided/player.js`, `src/guided/style.css`, `src/guided/ch07.cjs`, `src/guided/ch10.cjs`, `src/guided/ch18.mjs` |
| **UX05** | P1 | 在生活理解版（`.unit-nav` / `.guide-pager`）、4h 速通版（`.formal-crosslinks` / `review-N.html`）、独立保险课（`insurance-3-9.html`）与经典实验页（`lesson-*.html`）之间建立同一小节/题号/命题的双向直达链接。 | `src/guided/build.cjs`, `src/review/formal-render.cjs`, `src/review/build.cjs`, `src/frontend-shell.cjs`, `src/insurance-lesson/page.html` |
| **UX06** | P1 | 新建全书 347 条跨路线搜索索引（章、小节、习题、命题、引理、第三次作业，含中英文缩写如 `WARP`、`VCG`、`HW3`、`命题17.1`），在 `learn.html`、`formula-4h.html`、`catalog.html`、`exercises.html` 提供纯离线即时直达结果与备选路线链接。 | `src/study-index.cjs`, `src/study-assistant.js`, `src/guided/directory.cjs`, `src/formula-route.cjs`, `build.cjs` |
| **UX07** | P1 | 基于 `localStorage`（`micro-atlas-study-v1`）保存本机阅读位置与主动掌握标记（`已看过` / `还没懂` / `已独立做过`），在首页目录页提供 `#study-resume` 继续阅读条、按状态筛选及 JSON 导出/清空；显式 URL Hash 优先于恢复记录；本地存储受限/无痕时优雅降级不报错。 | `src/guided/player.js`, `src/study-assistant.js`, `src/guided/directory.cjs`, `src/guided/build.cjs`, `build.cjs` |
| **UX08** | P1 | 将 `formula-4h.html` 改为可执行复习路线，保持 20 章与总计 240 分钟分配不变，增加单章“标记过完”按钮、未完成章节筛选与实时进度统计（`已完成 X / 20 章 · Y / 240 分钟`）及下一步推荐；与各章 `review-N.html` 顶部切换按钮双向同步。 | `src/formula-route.cjs`, `src/formula-route.css`, `src/review/build.cjs`, `src/study-assistant.js` |
| **UX09** | P1 | 为重点迁移题（`s7.4`、`s10.2`、`s17.1`、`s17.3`、`p17.1`、`s18.2`、`p19.3`）配置按错误选项触发的针对性误区诊断、不剧透的“只看提示”按钮、重选提示；未单独配置的题保留通用约束核对反馈；首次答对与订正后通过分开记录（`firstCorrect` 不可被二次订正覆盖）。 | `src/guided/unit-flow.cjs`, `src/guided/player.js`, `src/guided/ch07.cjs`, `src/guided/ch10.cjs`, `src/guided/ch17.mjs`, `src/guided/ch18.mjs`, `src/guided/ch19.mjs` |
| **UX10** | P2 | 在图解页底部增加 `#step-share-bar`：`复制本步链接`、`复制纠错模板`（生成纯 Markdown 位置与视口信息，不含任何本地路径 `/Users/`），以及仅由用户主动点击触发的 GitHub 新建 Issue 链接。 | `src/guided/build.cjs`, `src/guided/player.js`, `src/guided/style.css` |
| **UX11** | P2 | 在 `review-N.html` 每组公式旁生成按当前公式 token 过滤的轻量可折叠“本式符号”表与“用到前提 ↑ / 核对适用条件 ↑”锚点，支持一键定位本节/本命题假设条件；打印模式下隐藏交互按钮、展开折叠内容并确保完整步骤/答卷可见。 | `src/review/formal-render.cjs`, `src/frontend.css`, `src/guided/style.css` |

---

## 二、测试调整与兼容性说明

1. **`test-guided-conditions-browser.cjs`（第 216–221 行）**：
   - **旧行为**：此前产品锁定 `url + '#answer'` 自动重定向回 `#proof-1`。
   - **新行为**：按 `UX02` 要求开放 `#answer` 考前直达入口，因此在 `homeworkJourney` 中将断言更新为直接访问 `url + '#answer'` 时 `#answer` 可见且完整展示 `unit.proof.length` 行答卷。
2. **`build.cjs` 与 `src/standalone-style.cjs` / `src/guided/build.cjs` 离线打包体积优化**：
   - 修复了 `downloads/*.html` 内引用 `review-N.html` 等相对路径导致 `validate-pack.cjs` 报 829 个本地缺失引用的问题（在 `build.cjs` 独立单页重写规则中补充 `catalog|formula-4h|review-[\w-]+`）。
   - 对 261 个引导图解单页的内联 CSS/player 运行时和 829 个离线模型页内联非经济呈现代码做了无损空白压缩/共享 gzip 打包，使 `dist/` 总扩展体积保持在 `254.60 MiB`（低于 `256 MiB` 上限），所有可阅读模型源码与公式保持完整。
3. **未改动的数学与受保护文件**：
   - 保留 `ANTIGRAVITY_HANDOFF.md`、`art/`、`src/sky-*` 原样未追踪，未清理或提交。
   - 所有模型数学计算函数、边界案例、经典交互模拟器、`section-audits.json` 原始教材 `sourceSha256` 均保持不变；由于引导页/展示层脚本更新，`src/section-audits.json` 中指向共享 UI 文件的 `codeFiles` 哈希按预期与当前工作区源码不再一致（`auditedSections: 0`，未伪造刷新哈希）。

---

## 三、全量验证结果（均于最终代码改动后实测通过）

- `node build.cjs`：90 节、27 引擎、295 编号条目构建通过。
- `node test-guided.cjs`：20 章、90 节、151 习题、240 单元、822 图景、805 推导、29 坐标系、11 关系图通过。
- `node test-guided-flow.cjs`：240 单元锚点、条件引用溯源与 503 条答卷行通过。
- `node test-formal-review.cjs`：90 节、82 命题/引理、288 公式、1646 符号、993 推导步、4h 240 分钟校验及纯度检查通过。
- `node test-review-library.cjs` / `node test-explanation-review.cjs` / `node test-clarity-boundaries.mjs`：通过。
- `node test-math.cjs`：10243 项检查、540 语义夹具、829 自包含离线页通过。
- `node validate-pack.cjs`：1505 文件、254.60 MiB、11820 本地链接、`missing: []`、`privatePaths: []` 通过。
- `node test-offline-unpack.cjs`：829 离线页浏览器解包校验通过。
- `NODE_PATH=... node test-guided-conditions-browser.cjs --require-browser`：16 项浏览器条件/离线/动效/手机检查全数 PASS。
- `NODE_PATH=... node test-classic-conditions-browser.cjs` & `node test-textbook-entry-browser.cjs`：390/1280/1440/320 键盘与触屏、减少动效与无 JS 检查全数 PASS。
- `PLAYWRIGHT_CHANNEL=chrome NODE_PATH=... node src/insurance-lesson/test-flow.cjs`：1440/320 JS 开/关与响应式检查 PASS。
- `NODE_PATH=... node test-experience-ux-browser.cjs`（新增 `UX01`–`UX11` 端到端浏览器验收）：1440×900、390×844、320×844、667×375 横屏、连点 10 次、实时切换 `reducedMotion`、`localStorage` 阻断降级、诊断重试、剪贴板/隐私模板及打印模式全数 PASS。

---

## 四、实测截图清单与已知限制

- 截图目录：`docs/reviews/2026-11-15-experience-pass/screenshots/`
  - `_learn-s7-4_scene-2-{1440,390,320}.png`
  - `_learn-s18-2_scene-3-{1440,390,320}.png`
  - `_learn-p19-3_answer-{1440,390}.png`
  - `_formula-4h-{1440,390}.png`
  - `learn-search-ux06-1440.png`
  - `s7-4-practice-ux09-1440.png`
  - `review-7-ux11-1440.png`
- **已知限制**：
  1. 目前所有浏览器验收均为本地自动化测试与作者视角截图审阅，尚无真实同学试用记录，因此交接中不做任何“理解提升百分比”等主观效果宣称。
  2. `UX09` 按选项定制错误诊断重点覆盖 7 个高频样板与机制题，其余单元使用统一约束回退提示，后续可按需逐题扩展 `practiceDiagnostics`。
  3. 本轮修改导致 `section-audits.json` 的 UI 代码哈希校验失效（当前 `auditedSections: 0`），需由 Codex 复核无误后统一决定是否刷新审核哈希。
