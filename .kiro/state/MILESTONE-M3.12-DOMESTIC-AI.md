# MILESTONE M3.12 DOMESTIC AI

Date: 2026-05-21

M3.12 domestic flagship routing is implemented.

## Final Provider Matrix

- Deep reasoning: DeepSeek direct `deepseek-reasoner`
- Daily text and government/SOE assistant: Aliyun DashScope `qwen3-max`
- Vision/OCR/image understanding: Aliyun DashScope `qwen3-vl-max`
- Embedding/RAG/semantic cache: DashScope `text-embedding-v3` plus DashVector when enabled
- Deprecated: OpenRouter / Claude / GPT / B.AI are not callable

## Verification

- Typecheck passed for `@tongqian/types`, `@tongqian/api`, `@tongqian/api-client`, `@tongqian/web`, `@tongqian/admin`, `@tongqian/worker`.
- Lint passed for `@tongqian/api`, `@tongqian/api-client`, `@tongqian/web`, `@tongqian/admin`, `@tongqian/worker`.
- API build passed.

## Files Touched

- AI routing and provider router
- Government domestic-only guard
- AI prompt model metadata
- Health and metrics reporting
- Env templates
- API client credential fixtures and AI mock copy
- Real AI test specs
- Worker morning briefing model tag
- Web owner persona model tag

Next milestone can focus on running the real DashScope key path once `ALIYUN_DASHSCOPE_API_KEY` is present in the target environment and DashVector is opened.
