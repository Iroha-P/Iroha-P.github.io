# 孙伟茗 · Wednesday / Iroha-P

大模型应用开发、Agent 工程与多模态项目作品集。

[主页](https://iroha-p.github.io/) · [GitHub](https://github.com/Iroha-P)

## 项目主线

- **GradLoop**：证据约束的 RAG 学习与面试训练 Agent，使用 LangGraph 工作流、FastAPI/SSE、人工确认与有限重试。[应用仓](https://github.com/Iroha-P/gradloop-ragsdk-omni)与[模型实验仓](https://github.com/Iroha-P/gradloop-ragsdk-omni-training)独立维护；公开 Demo 仅用合成语料，不代替真实模型推理验证。
- **MultiModal-QC**：Qwen2-VL + QLoRA 工业图文质检，保留传统分类基线、指标与 Agent Pipeline。
- **AIRI Memory Agent**：本地优先的长期记忆、RAG、知识审核与 LoRA 候选数据链路。
- **MiniBox**：GPT-SoVITS、LLM 与 ESP32-S3 组成的角色语音交互闭环。
- **Code Island / Image2 Local Studio**：AI Coding 状态与权限工具、本地生图与可复用 Prompt Skills。

不将 Fork 当作原创项目，不将 smoke 通过当作模型质量提升。GradLoop 的 Ascend 实验结论见[固定评测报告](https://github.com/Iroha-P/gradloop-ragsdk-omni-training/blob/main/docs/stage-b-npu-results-2026-07-29.md)。

## 本地检查

纯 HTML/CSS/JavaScript，无构建依赖。安装 Node.js 后执行：

```sh
node --check script.js
node --check projects/gradloop/script.js
node --test tests/*.test.cjs
```

使用静态 HTTP 服务预览仓库根目录。`localhost` / `127.0.0.1` 使用 2026-10-09 核对的内置公开项目索引；线上尝试同步 GitHub API，失败时保留内置索引并提示时效。成功同步不会重新加入已缺失、私有或归档的仓库。

## 发布与内容维护

GradLoop 的独立项目页位于 `projects/gradloop/`，使用原始品牌标志、真实公开合成界面与独立背景素材；与功能 Demo 和模型实验仓分开。主页提供详情入口，不在作品集启动模型或存储上传资料。

使用当前 GitHub Pages 配置发布，不引入新托管平台。内容变更先走独立分支；合入 Pages 配置的发布分支后才会改变线上主页。

新增案例时同时核对公开 README、验证报告与真实截图；保留模型、数据集、样本量与验证边界。不上传私有数据、凭据、模型权重或运行日志。
