# 主页内容核查 · 2026-10-09

## 展示范围

定位为“大模型应用开发 · Agent · 多模态”。新增 GradLoop 应用案例和两个独立公开仓库入口，保留 MultiModal-QC、AIRI Memory Agent、MiniBox、Code Island 与 Image2 Local Studio。沿用原有视觉、截图、字体与布局，仅补充索引状态、Fork 标识并修正中等屏宽下的栅格溢出风险。

## 新增内容的公开依据

- [GradLoop 应用 README](https://github.com/Iroha-P/gradloop-ragsdk-omni/blob/ad9aafdd79e4e7fbbd4fc6984e507c282eec62db/README.md)：RAG、LangGraph、FastAPI/SSE、人工确认、有限重试与公开合成语料演示边界。RAGSDK 适配不等于当前真实后端已使用 RAGSDK。
- [GradLoop 模型实验报告](https://github.com/Iroha-P/gradloop-ragsdk-omni-training/blob/0364c69f5a9116f927932867dc22d370bb696a87/docs/stage-b-npu-results-2026-07-29.md)：Ascend Base 与一步 LoRA 各 10/10 synthetic smoke；固定 5 例评测未提升，结论为保留 Base。smoke 不代表模型质量提升。
- [新增截图的公开源文件](https://github.com/Iroha-P/gradloop-ragsdk-omni/blob/ad9aafdd79e4e7fbbd4fc6984e507c282eec62db/docs/assets/demo-public-qa.png)：复制到 `assets/gradloop-public-qa.png`，Git blob SHA 为 `395016e4997e5707b1754fc567e6a6fc6f6d2909`，与公开源文件一致。
- [MultiModal-QC 公开 README](https://github.com/Iroha-P/MultiModal-QC/blob/main/README.md)：核对保留的 n=173、Accuracy 89.02%、F1 0.893 与 ROUGE-L 0.249 指标。本轮未重新运行模型或训练。

## 实际验证

- `node --check script.js`：通过。
- `node --test tests/portfolio.test.cjs`：14/14 通过；覆盖内容保留、案例编号、本地图片、公开索引排序、私有/归档过滤、Fork 标识、链接安全、API 成功/失败和离线回退。
- `git diff --check`：通过。
- 本地静态站点 + 独立无登录态的 headless Chromium：360、390、768、1152、1280、1440 px 均无横向溢出或被裁切的案例内容，六个案例与九个内置项目可见，图片加载正常，无页面 JavaScript 错误或本地静态资源缺失。
- 实际点击首屏“查看项目案例”，确认锚点跳转和正常动效下的 reveal 展示。

应用内浏览器连接失败后使用现有本地浏览器进行验证，没有安装新依赖或改动用户浏览器配置。检查服务与浏览器已关闭。

## 发布边界

GitHub Pages 当前使用 `main` 的仓库根目录。本变更通过独立分支交付；未合入 `main` 前，线上主页不包含这些更新。没有改动其他项目仓库、GitHub 个人资料、模型服务或付费接口。
