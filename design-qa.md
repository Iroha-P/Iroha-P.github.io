# GradLoop 项目页设计验收

日期：2026-10-10。

## 比较目标与证据

- source visual truth：`C:\Users\UserX\.codex\generated_images\019fe23c-5575-76a1-9a1b-bbe650b4bc8c\exec-c07ae5a7-443c-419d-b7ca-7f2e1bd2604c.png`，用户选择的第 1 个显示结果。
- 来源尺寸：1435 × 1096 像素。
- 参考图保留副本：`D:\project\00_总控\reports\gradloop-project-page-20261010\selected-reference.png`，不改动原生成文件。
- 实现：`http://127.0.0.1:8796/projects/gradloop/`。
- 验收视口：1435 × 1096 CSS px；deviceScaleFactor=1；实现截图同为 1435 × 1096 像素；没有密度缩放。
- 状态：首屏、未悬停、弹窗关闭、已加载字体；不把生成稿的模拟 UI 当作模型运行证据。
- 浏览器：内置浏览器连接失败；Owner 单独批准本地 Playwright 验收后，使用 Chrome 新隔离上下文。不读取登录资料、Cookie 或既有用户配置。
- 最终全图比较：`D:\project\00_总控\reports\gradloop-project-page-20261010\comparison-full-pass2.png`（左设计稿，右实现）。
- 最终局部比较：同目录 `comparison-type-pass2.png`；另生成 `comparison-hero-pass2.png` 便于复查。已打开完整与文字局部组合图，不以独立图片浏览冒充并排比较。
- 最终实现截图：同目录 `gradloop-1435-pass2.png`、`gradloop-1435-full-pass2.png`、`gradloop-390-pass2.png` 和 `gradloop-menu-pass2.png`。已实际查看这四个对应状态及完整长页。
- 可复查数据：同目录 `qa-results-pass2.json` 和 `browser-qa.cjs`；运行命令为 `node browser-qa.cjs pass2`。脚本使用机器已有的 Playwright、Sharp 和 Chrome，不新增仓库依赖。

## Findings / 第一轮

- [P2] 导航整体偏右。设计稿三个内容链接在中部，GitHub 靠右；实现把四个链接都推到右侧。修复：导航主体按容器 40% 起始排布，GitHub 自动占据右端，手机恢复正常文档流。
- [P2] 闭环条带存在浏览器默认列表外边距，高度约 212px，导致下一节明显下移。修复：清除 `ol` block margin，条带内间距对齐约 175px；首个叙事区顶部间距调整为 44px。
- [P2] 首屏 CTA 宽度和蓝色副标题字号偏小。修复：按目标宽度约 242/206px 设置响应式最小宽度，副标题 25px，保留较窄断点的自适应。

## 必查五项

- 字体：Manrope / Noto Sans SC、Phosphor / Phosphor-Fill 已实际加载，标题权重 800、双行英文名；没有截字。第二轮对照通过；25px 蓝色副标题与行动按钮已复验。
- 间距：主体 64px 页边距与 40/60 首屏分栏已建立。第二轮闭环条带为 175.59px，首屏结束于约 735px（设计稿约 732px）；导航中部链接、右端 GitHub 与下一节起始关系已在组合图复验。
- 色彩：白底、深色字、蓝色主行动和绿色闭环强调；小号绿色标签采用更深色以改善对比。
- 图像：使用原始品牌标志、真实公开合成问答截图和独立生成的栅格背景；没有 CSS/SVG 绘制的替代图像。
- 文案：保留正式名称与主张；为诚实性将生成稿的 RAGSDK/BM25 概述改为 BM25 基线，并明确真实 RAGSDK 未验证。原图界面字体相对生成稿更小是实际产品截图约束，通过可键盘操作的完整截图弹窗补充阅读，不伪造产品界面或推理结果。

## 已执行交互与回归

第一轮与第二轮均检查 13 个宽度 320/360/390/680/681/768/900/901/1024/1200/1280/1435/1440：无水平溢出，标题未截断，可见图像已加载。第二轮结果已再次用 Node 断言核对 13 组记录，而非只依赖截图观感。

已验证：桌面锚点、手机导航开关/Escape/焦点返回/点选自动关闭、截图弹窗开关/Escape/焦点返回/滚动恢复、无 JavaScript 导航与原图链接、减少动态效果、作品集进入详情并返回。浏览器 pageerror/console error 均为 0。没有调用 Demo 的推理 API。

代码质量：`node --test tests/*.test.cjs` 21/21 通过；`node --check script.js`、`node --check projects/gradloop/script.js` 与 `git diff --check` 通过。独立只读审查未发现阻塞问题；另以临时 VM 检查修饰键链接和无 dialog 支持的降级路径。没有把这些静态或浏览器检查当作模型推理验收。

## 比较历史与结论

1. 第一轮组合图发现以上三个 P2；代码修复已应用。
2. 第二轮在相同视口与截图密度重新捕获：三个 P2 均已修复；完整组合图、文字局部组合图、手机首屏、展开导航和桌面完整页面已重新查看；交互与全量回归通过。
3. 未发现剩余 P0/P1/P2。通过仅针对该静态项目页的设计与功能验收，不表示 RAGSDK/音视频/模型实验获得新的验证，也不表示已合并或上线。

## Follow-up Polish

- 原始品牌 PNG 的浅色底和生成稿的形状有微小不同，保留原标志，不重新生成品牌。
- [P3 / 接受的差异] 背景弧带、字形细节与生成稿存在轻微不同；静态实现不追求生成图片的逐像素复刻。真实产品截图文字密度与生成稿不同，是刻意保留的真实性边界，不通过改画 UI 消除。
- 正文比设计稿多的实现边界和双仓说明是选定首屏以下的实际展示内容，不冒称设计稿已包含这些状态。

final result: passed
