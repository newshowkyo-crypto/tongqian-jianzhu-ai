# GitHub 建筑 AI 开源生态扫描（2026-05-23）

> 扫描范围：2025-05 至 2026-05 前后仍活跃或被近一年内容引用的 GitHub 建筑 AI、法律 AI、RFP/项目管理 AI、Agent Skills 项目。仅看 README/搜索摘要，不下载代码。

## 1. 扫描方法

关键词组合：

1. `github construction AI agent contract review`
2. `github construction AI tender bidding LLM`
3. `github BIM AI assistant construction`
4. `github 建筑 AI 招标 合同 大模型`
5. `github construction skills agents claude`
6. `github construction project management AI 2025`
7. `github construction cost estimation AI LLM`
8. `github 工程造价 AI 大模型 开源`

读取方式：每个查询取搜索结果前列，优先 GitHub README 摘要、项目主页摘要、近一年 crawl/published 信息；不 clone、不跑、不看源码。

## 2. 直接对标的 3 个项目（最相关）

| 项目 | Star / 活跃度 | 技术栈 | 核心功能 | 对标 | 可吸收点 |
|---|---:|---|---|---|---|
| [datadrivenconstruction/DDC_Skills_for_AI_Agents_in_Construction](https://github.com/datadrivenconstruction/DDC_Skills_for_AI_Agents_in_Construction) | 搜索显示为 DDC Skill 库，近 3 个月被 AgentSkillsRepo 收录 | Skills / Markdown / Agent workflow | 建筑行业 AI Agent 技能库，覆盖 BIM、造价、排程、文档控制 | 高：Prompt/Skill 库 | 把 BIM、造价、排程、文档控制拆成 `apps/api/src/prompts` 可审计 skill |
| [datadrivenconstruction/OpenConstructionERP](https://github.com/datadrivenconstruction/OpenConstructionERP) | README 摘要显示 728 commits，搜索页显示 3 周前发布 | FastAPI / TS / desktop / BIM / BOQ | 开源施工估算平台，BOQ、4D/5D、CAD/BIM takeoff、AI estimate | 高：造价、项目、投标 | 借鉴 BOQ 分层、55k cost item、AI estimate disclaimer 和自托管叙事 |
| [datadrivenconstruction/OpenConstructionEstimate-DDC-CWICR](https://github.com/datadrivenconstruction/OpenConstructionEstimate-DDC-CWICR) | 搜索摘要显示 55,719 work items、27,672 resources | Data / Qdrant / n8n / AI instructions | 多语言施工成本数据库和 AI automation workflow | 高：造价知识库 | 后续 M28+ 可做中文 GB/T 50500 语义检索和清单匹配 |

## 3. 部分对标的 5 个项目（可参考）

| 项目 | 技术栈 | 核心功能 | 对标程度 | 可吸收点 |
|---|---|---|---|---|
| [MoAshour93/ConstructionAI](https://github.com/MoAshour93/ConstructionAI) | Python / notebooks / RAG | 建筑行业 GenAI 与开源 LLM 演示 | 中 | 用作销售 demo 参考，不直接复用 |
| [OssamaLouati/Legal-AI_Project](https://github.com/OssamaLouati/Legal-AI_Project) | Next.js / Flask / NLP | 法律文档分析、CUAD、风险抽取 | 中 | M14/M27 可吸收“问答式条款理解 + 风险解释” |
| [EverseDevelopment/ZoidbergAI.Addin](https://github.com/EverseDevelopment/ZoidbergAI.Addin) | C# / Revit Addin | AI BIM assistant，用 prompt 执行 Revit 动作 | 中 | 长期可参考桌面端/BIM 插件接口 |
| [aws-samples/aws-genai-rfpassistant](https://github.com/aws-samples/aws-genai-rfpassistant) | TypeScript / Python / AWS CDK / Bedrock | RFP 助手，RAG + 向量库 + Bedrock | 中 | 招标文件问答、RFP 多文件检索结构 |
| [Taskosaur/Taskosaur](https://github.com/Taskosaur/Taskosaur) | Full-stack app / BYO LLM | 对话式项目管理任务执行 | 低-中 | 可参考 M19 派单、M22 项目现场的自然语言任务执行 |

补充观察：

- [evolsb/claude-legal-skill](https://github.com/evolsb/claude-legal-skill)：合同 review skill，强在 checklist、market benchmark、red flag scan，适合借鉴 Prompt 结构。
- [safetyAI/ChatSafetyAI](https://github.com/safetyAI/ChatSafetyAI)：施工安全 ChatGPT，适合 M22 安全巡检知识卡。
- [ghbalf/freecad-ai](https://github.com/ghbalf/freecad-ai)：FreeCAD AI workbench，适合长期图纸/BIM 操作方向。

## 4. 框架级（多 Agent / Skill 系统）

| 项目 | 类型 | 结论 |
|---|---|---|
| [camel-ai/owl](https://github.com/camel-ai/owl) | 通用多 Agent 协作框架 | 可参考多 Agent 编排，但不建议现在重构 ai-gateway |
| [ashishpatel26/500-AI-Agents-Projects](https://github.com/ashishpatel26/500-AI-Agents-Projects) | Agent 用例集合 | 用于找灵感，不作为生产依赖 |
| [prime-vector/open-agent-spec](https://github.com/prime-vector/open-agent-spec) | Agent YAML spec | 可参考声明式 Agent 配置，但当前 PromptTemplate 已足够 |
| [OneWave-AI/claude-skills](https://github.com/onewave-ai/claude-skills) | Claude Skills 集合 | 可参考 skill 包结构和安装体验 |
| [calimero-network/ai-code-reviewer](https://github.com/calimero-network/ai-code-reviewer) | 多模型 review agent | 可参考共识评分，用于规则候选 confidence 二次校验 |

判断：同乾方略短期不重构 `ai-gateway` 去抱通用框架。原因是当前最大价值在中国建筑业务语料、权限审计、点数扣费、tenant 隔离和 admin 审核闭环；通用框架会增加不可控依赖。建议只吸收 Skill/Prompt 组织方式、共识评分和 RAG 检索结构。

## 5. 给万婷婷的 5 条建议

1. 先抄 DDC 造价 Skill。
2. 建 30 个中文施工 Skill。
3. 不碰 AGPL 代码复用。
4. 销售对比 OpenConstructionERP。
5. ai-gateway 暂不重构。

## 6. 扫描来源索引

- DDC Skills: https://github.com/datadrivenconstruction/DDC_Skills_for_AI_Agents_in_Construction
- OpenConstructionERP: https://github.com/datadrivenconstruction/OpenConstructionERP
- DDC CWICR: https://github.com/datadrivenconstruction/OpenConstructionEstimate-DDC-CWICR
- ConstructionAI: https://github.com/MoAshour93/ConstructionAI
- Legal-AI_Project: https://github.com/OssamaLouati/Legal-AI_Project
- ZoidbergAI.Addin: https://github.com/EverseDevelopment/ZoidbergAI.Addin
- AWS RFP Assistant: https://github.com/aws-samples/aws-genai-rfpassistant
- Taskosaur: https://github.com/Taskosaur/Taskosaur
- OWL: https://github.com/camel-ai/owl
- Claude Legal Skill: https://github.com/evolsb/claude-legal-skill
