# 第三方资源与来源

本仓库原创部分的 AGPL-3.0-only 许可不替代以下资源各自的许可。

| 资源 | 用途 | 许可和保留文件 |
| --- | --- | --- |
| KaTeX 0.19.1 与数学字体 | 公式排版 | MIT；`src/vendor/katex/LICENSE.txt` |
| fflate 0.8.2 | 独立 HTML 解压公式、样式和界面脚本 | MIT；`src/vendor/fflate/LICENSE` |
| Amicro 原预设 | 动效参考及本地改写 | MIT；`src/vendor/AMICRO-LICENSE.txt`、`src/vendor/amicro-presets-original.ts` |
| Penrose 楼梯原 SVG | 章节示意图的矢量来源 | 作者公开领域声明及来源信息见 `src/vendor/PENROSE-SOURCE.txt` |

Osborne–Rubinstein《Models in Microeconomic Theory》为学习主线和引用来源。仓库不包含教材 PDF 或课堂 PPT；章节名、印刷页码和原题条件用于定位与核对，网站讲解与图形由项目自主编写。教材版权和其开放获取许可仍由原著及出版方说明约束。

离线解压器取自 [fflate](https://github.com/101arrowz/fflate) 的 `gunzipSync`。在临时 npm 目录安装 `fflate@0.8.2` 和 `esbuild@0.25.12`，放入 `src/vendor/fflate/entry.mjs` 后可通过 `esbuild entry.mjs --bundle --minify --platform=browser --format=iife --outfile=gunzip.min.js` 复现。
