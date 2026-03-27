<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# NEXUS: Omni-Stream Financial Core

**NEXUS** 是一个基于 AI 的自主金融群体智能引擎。它通过 **125 个专业 AI 智能体**对多个市场标的进行多维度深度分析，并由一个由 6 位顶级专家组成的**投资委员会**进行最终辩论，输出投资决策建议。

> **NEXUS** is an autonomous financial swarm intelligence engine powered by Google Gemini. It deploys 125 specialized AI agents to analyze up to 20 market targets across multiple dimensions, culminating in a 6-expert Investment Committee debate and a final investment verdict.

View your app in AI Studio: https://ai.studio/apps/drive/1VccBQAEf1QRHxUEMqVij11rJt5CUEhQ6

---

## 🧠 这个项目是做什么的？ (What does this project do?)

NEXUS 模拟了一家顶级对冲基金的完整研究流程，分三个阶段运行：

### 阶段一：股票筛选 (Stock Selection)
用户输入投资主题或标准（例如"AI 算力"或"新能源汽车"），系统自动从 A 股/港股/美股中筛选出最多 20 个候选标的。

### 阶段二：多维度公司分析 (Per-Company Deep Dive)
针对每家公司，以下 **6 个专业智能体**从不同视角并行展开分析：

| 智能体 | 职责 |
|--------|------|
| 🟢 **阿尔法猎手 (Alpha Hunter)** | 寻找成长股和超额收益机会，计算戴维斯双击潜力 |
| 🔴 **法务风控官 (Risk Forensic)** | 做空视角，识别财务造假和治理风险 |
| 🟡 **周期量化专家 (Cycle Master)** | 判断行业和估值周期位置 |
| 🔵 **战略护城河顾问 (The Strategist)** | 分析商业模式和长期竞争壁垒 |
| 🟣 **筹码结构分析师 (Market Structure)** | 研究资金流向、机构持仓和市场情绪 |
| 🩷 **情报调查员 (The Scout)** | 挖掘最新新闻、内部动态和草根情报 |

### 阶段三：元审查与终局裁决 (Meta-Review & Final Verdict)
7 位**审查委员会**专家（基本面、情绪、风控、宏观、组合、大宗商品、情报）汇总所有分析，进行交叉辩论，最终输出**投资委员会裁决报告**，包含：
- 推荐买入/减持/回避的标的
- 最优投资组合配置建议
- 风险警示清单

---

## 🚀 本地运行 (Run Locally)

**前提条件 (Prerequisites):** Node.js

1. 安装依赖 (Install dependencies):
   ```bash
   npm install
   ```
2. 在 [.env.local](.env.local) 中配置你的 Gemini API Key:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```
3. 启动开发服务器 (Run the app):
   ```bash
   npm run dev
   ```

---

## 🛠 技术栈 (Tech Stack)

- **前端 (Frontend):** React 19 + TypeScript + Vite
- **AI 引擎 (AI Engine):** Google Gemini (via `@google/genai`)
- **UI 组件:** Lucide React, react-markdown, remark-gfm
- **导出 (Export):** html2pdf.js
