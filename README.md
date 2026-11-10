# 中级微观经济学动态图谱

以 Osborne–Rubinstein《Models in Microeconomic Theory》为主线的中文学习网站。课程页用生活情境引入，再用连续动画展示条件、选择和结果；习题页单独讲清可套用的推理与计算步骤。

网站目前按 20 章、90 节组织。这里公开的是可维护的生成源码。教材 PDF、课堂 PPT、个人 Obsidian 笔记、部署账号配置和构建后的大体积页面包均未收入仓库。

全书有 90 个小节和 151 道章末题。从目录选择一个问题，每次翻到下一步，只读一个条件、看一次变化或做一步推理。章末习题推到最后，会展开整份可照写的答案，每行旁边都有解题思路，点击还能回看相应画面。[打开全书随题图解](https://microeconomics-atlas-mingze.synb636.chatgpt.site/learn)

## 市场入口

从男孩身后望进集市，移动鼠标可以看见近处人物与远处拱廊的相对位移。在空白处停留片刻，会从二十章中抽出一张可拖动的模型图。每轮各章出现一次，六秒无操作后小图消散。手机轻点市场画面，键盘可选「随机看一张图」并用方向键调整。[进入市场](https://microeconomics-atlas-mingze.synb636.chatgpt.site/market)

场景与人物是为本项目生成的两张独立插画。图线、坐标、标注和课程链接由 `src/cover.cjs` 生成，构图与视差分别在 `src/cover.css` 和 `src/cover.js`。分层响应指针的方式参考了 Parallax.js，场景标记连接到内容的方式参考了 Codrops 的交互商场地图。[分层视差示例](https://github.com/wagerfield/parallax/blob/master/examples/pages/hoveronly.html) · [Interactive 3D Mall Map](https://github.com/codrops/Interactive3DMallMap) · [指针图像与消散参考](https://github.com/codrops/ImageTrailEffects)

## 本地运行

需要 Node.js 18 或更新版本，以及 Python 3（仅用于本地预览和部分数学核验）。无需安装 npm 依赖。

```sh
npm run build
npm run preview
```

然后打开 `http://127.0.0.1:8799/`。构建结果位于 `dist/`；课程页提供可离线打开的独立 HTML 下载。打开原版网站：[中微动态模型图谱](https://microeconomics-atlas-mingze.synb636.chatgpt.site/)。

## 核验

```sh
npm run test:math
node test-guided.cjs
npm run validate
```

`test-*.mjs` 是各知识点的纯模型回归脚本，可按需运行。原开发过程中的本机浏览器截图和报告未公开；这些脚本与报告中的本机绝对路径不属于可复用源码。

## 源码结构

- `src/`：经济模型、课程叙事、可视化、导航、样式和随站分发的第三方资源。
- `src/guided/` 保存全书的情境、逐步画面、解答与迁移题。每章独立维护，课程页和离线 HTML 共用同一份数据。
- `build.cjs`：从同一份源码生成全站页面和独立 HTML 下载。
- `src/book-outline.json`、`src/section-audits.json`：章节清单与逐节来源核对记录。
- `coverage.json`：已有知识点的覆盖索引；“已整理”不等于“已掌握”。

题目和图中的“教材原例”与“本站自主构造”按页面标注区分。动画中的有限数值例子不能代替一般证明；具体条件和边界以页面讲解及原著为准。[原著出版方入口](https://doi.org/10.11647/OBP.0204)。

## 许可与贡献

本仓库的原创程序、界面和原创讲解采用 [GNU AGPL-3.0-only](LICENSE)。修改后作为网站向他人提供时，应按该许可提供相应源码。第三方资源保留各自许可，见 [THIRD_PARTY.md](THIRD_PARTY.md)；本许可不覆盖原著或课堂课件。

欢迎通过 Issue 报告模型、公式、来源或手机排版问题。提交修改时请保留原例与自主示例的来源区分，并附上能复现问题的条件。
