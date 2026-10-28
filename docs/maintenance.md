# 作品集内容与发布维护

[返回仓库首页](../README.md) · [在线作品集](https://iroha-p.github.io/)

本仓库是静态作品集。功能 Demo 与模型实验由各自仓库维护，作品集不启动模型，也不上传资料。

## 本地预览与检查

纯 HTML/CSS/JavaScript，无构建依赖。安装 Node.js 后，在仓库根目录执行：

```sh
node --check script.js
node --check projects/gradloop/script.js
node --test tests/*.test.cjs
```

使用静态 HTTP 服务预览仓库根目录。`localhost` / `127.0.0.1` 使用 2026-10-09 核对的内置公开项目索引；线上尝试同步 GitHub API，失败时保留内置索引并提示时效。成功同步不会重新加入已缺失、私有或归档的仓库。

## 项目内容

- **GradLoop**：证据约束的 RAG 学习与面试训练 Agent，使用 LangGraph 工作流、FastAPI/SSE、人工确认与有限重试。[应用仓](https://github.com/Iroha-P/gradloop-ragsdk-omni)与[模型实验仓](https://github.com/Iroha-P/gradloop-ragsdk-omni-training)独立维护；公开 Demo 仅用合成语料，不代替真实模型推理验证。
- **MultiModal-QC**：Qwen2-VL + QLoRA 工业图文质检，保留传统分类基线、指标与 Agent Pipeline。
- **AIRI Memory Agent**：基于 AIRI 的扩展，本地优先的长期记忆、RAG、知识审核与 LoRA 候选数据链路。
- **MiniBox**：GPT-SoVITS、LLM 与 ESP32-S3 组成的角色语音交互闭环。
- **Code Island / Image2 Local Studio**：AI Coding 状态与权限工具、本地生图与可复用 Prompt Skills。

不将 Fork 当作原创项目，不将 smoke 通过当作模型质量提升。GradLoop 的 Ascend 实验结论见[固定评测报告](https://github.com/Iroha-P/gradloop-ragsdk-omni-training/blob/main/docs/stage-b-npu-results-2026-07-29.md)。

## GradLoop 技术页面

独立介绍位于 `projects/gradloop/`，共四个原生可跳转页面，共享 CSS 与导航脚本：

- [项目与架构](../projects/gradloop/index.html)：产品定位、六层职责与技术章节入口。
- [知识与 RAG](../projects/gradloop/rag.html)：数据契约、摄取、隐私分区、题库、BM25 / 门控与 RAGSDK 适配。
- [Agent 工作流](../projects/gradloop/agent.html)：真实状态图、固定工具、人工中断、checkpoint、学习状态与 SSE。
- [模型与评测](../projects/gradloop/models.html)：来源关联划分、Ascend Base / LoRA、协议差异、文档 Worker 与人工双评。

采用原始品牌标志、真实公开合成界面和独立蓝绿色调，借鉴既有项目页的排版与阅读节奏，不复制其他项目的素材。技术事实链接锁定应用公开提交 `ad9aafdd79e4e7fbbd4fc6984e507c282eec62db` 与 Training 公开提交 `0364c69f5a9116f927932867dc22d370bb696a87`；历史实验、fixture 与待验收项分别标明。主页保留详情入口。

四页包含 7 幅可访问的原生图示：问答架构、隐私摄取、检索后端、七意图路由、人工中断恢复、来源组件划分与 Base / LoRA 冻结比较；配合能力边界、门控和人工双评表格。流程图是静态 HTML/CSS，不依赖绘图库；比较图保留零值与无提升结论，不把示意图当作实机截图。手机自动纵向排列，表格支持键盘横向滚动，精确节点清单可展开。

## 内容更新约定

新增案例时同时核对公开 README、验证报告与真实截图；保留模型、数据集、样本量与验证边界。不上传私有数据、凭据、模型权重或运行日志。

README 图文总览复用 `assets/` 中的现有公开图片；区分应用界面与项目展示页，不把展示页图片当作模型推理成功的证据。项目介绍链接进入相应 Pages 页面，源码与评测链接进入相应仓库。

## 发布

使用当前 GitHub Pages 配置发布，不引入新托管平台。内容变更先走独立分支；合入 Pages 配置的发布分支后才会改变线上主页。

相关记录：[内容更新记录](content-update-20261009.md) · [视觉验收记录](../design-qa.md)。
