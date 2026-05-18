# 04 AI Gateway - Tasks

## 浠诲姟鎬绘暟锛?8

## Phase A锛氬熀纭€绫诲瀷 + Prisma schema锛? 涓級

- [x] **A1** 鍦?`packages/types/src/ai-task/` 琛ュ叏 PromptTemplate / TierContext / AiRequest / AiResponse 鎺ュ彛
  - 楠屾敹锛氫笟鍔″彲 `import type { PromptTemplate } from '@tongqian/types'`

- [x] **A2** 鍦?`prisma/schema.prisma` 娣诲姞 4 涓〃锛欰iTask / AiCostLog / AiProviderHealth / AiExportAudit + migration
  - 楠屾敹锛歚pnpm db:migrate` 閫氳繃

## Phase B锛氱紦瀛?+ 淇＄敤妗╋紙2 涓級

- [x] **B1** 瀹炵幇 `cache/exact-cache.service.ts`锛圧edis锛? `cache/semantic-cache.service.ts`锛圖ashVector锛屽厛妗?+ 绠€鏄?cosine锛?
  - 楠屾敹锛歭ookup / set 娴嬭瘯瑕嗙洊

- [x] **B2** 瀹炵幇 `credit/pre-charge.service.ts` / `commit.service.ts` / `refund.service.ts`锛坕dempotent锛屽厛鐢?in-memory 瀹炵幇锛屽悗鐢?[`08-credit-system`] 鏇挎崲涓虹湡瀹?DB锛?
  - 楠屾敹锛歅BT 閫氳繃锛氬悓 idempotencyKey 閲嶅璋冪敤缁撴灉涓€鑷?

## Phase C锛歋anitizer锛? 涓級

- [x] **C1** 瀹炵幇 `sanitizer/sanitizer.service.ts` + 6 绫绘娴嬪櫒锛堝叕鍙稿悕 / 浜哄悕 / 椤圭洰鍚?/ 鑱旂郴鏂瑰紡 / 閲戦 / 鍦板潃 / 韬唤璇?/ 閾惰鍗?/ 缁熶竴绀句細淇＄敤浠ｇ爜锛?
  - 楠屾敹锛歅BT 寮哄埗 unmask(mask(x)) === x

- [x] **C2** 瀹炵幇 `audit/ai-export-audit.service.ts`锛堝啓 ai_export_audit 琛級
  - 楠屾敹锛氭瘡娆¤劚鏁忚皟鐢ㄥ繀鍐?1 琛屽璁?

## Phase D锛歅rovider + 璺敱锛? 涓級

- [x] **D1** 瀹炵幇 `providers/ai-provider.interface.ts` + 4 涓?Provider 瀹炵幇锛堥樋閲岀櫨鐐?/ 鐏北鏂硅垷 / OpenRouter / B.AI锛?
  - 楠屾敹锛氭瘡涓?Provider 瀹炵幇 invoke / health锛沵ock 妯″紡鍙€氳繃鍗曟祴

- [x] **D2** 瀹炵幇 `providers/provider-router.service.ts`锛堟寜 priority + 鍋ュ悍閫?provider + failover锛? `providers/health-monitor.worker.ts`锛坈ron 姣?1min锛?
  - 楠屾敹锛氬崟涓€ provider 閿欒鐜?30% 鑷姩鍒囧鐢?+ 鍐欎紒涓氬井淇″憡璀?

- [x] **D3** 瀹炵幇 `routing/routing.service.ts`锛堜换鍔?鈫?妯″瀷 鈫?provider 鏄犲皠锛屾敮鎸?system_configs 鍚庡彴瑕嗙洊锛? `routing/default-routing.ts`
  - 楠屾敹锛?0+ AiTaskType 鍏ㄦ湁榛樿鏄犲皠锛涘悗鍙版敼 `ai.routing.contract.review.pro` 60s 鍐呯敓鏁?

## Phase E锛歍ier + Output锛? 涓級

- [x] **E1** 瀹炵幇 `tier-resolver.service.ts`锛堣В鏋?PromptTemplate.tier 鍑芥暟锛?
  - 楠屾敹锛歅BT 寮哄埗 Tier 鍗曡皟鎬?

- [x] **E2** 瀹炵幇 `output-validator.service.ts`锛? 寮哄埗瑕佺礌 + zod 鏍￠獙锛岄噸璇?鈮?2 娆★級
  - 楠屾敹锛歅BT 寮哄埗 4 瑕佺礌瀹屾暣鎬?

- [x] **E3** 瀹炵幇 `safety-filter.service.ts`锛堣緭鍑烘晱鎰熻瘝 + 绾㈢嚎琛ㄨ堪妫€娴嬶紝鍛戒腑閲嶇敓鎴?1 娆★級
  - 楠屾敹锛歅BT 寮哄埗绾㈢嚎琛ㄨ堪鎷︽埅

## Phase F锛歅rompt + Tier 娉ㄥ叆锛? 涓級

- [x] **F1** 瀹炵幇 `prompt-builder.service.ts` + `routing/tier-prompt-injector.ts`
  - 楠屾敹锛氭寜 tier 娉ㄥ叆寮曞鏂囨 + few-shot 鎷艰姝ｇ‘

## Phase G锛氶檺娴?+ 缂栨帓锛? 涓級

- [x] **G1** 瀹炵幇 `apps/api/src/common/guards/ai-rate-limit.guard.ts`锛圧edis 璁℃暟鍣紝3 缁达細鐢ㄦ埛 / 绉熸埛 / 鍏ㄥ钩鍙帮級
  - 楠屾敹锛氳秴闃堝€艰繑鍥?429 + Retry-After

- [x] **G2** 瀹炵幇 `orchestrator.service.ts` + `ai-gateway.service.ts`锛? 姝ヤ富娴佺▼缂栨帓锛?
  - 楠屾敹锛氬崟鍏冩祴璇曡鐩栨瘡姝?+ e2e 鍦烘櫙 1锛堝悎鍚屽鏌ラ棴鐜級閫氳繃

## Phase H锛氭垚鏈?+ 寮傛锛? 涓級

- [x] **H1** 瀹炵幇 `cost-meter.service.ts` + `apps/admin` 鎴愭湰浠〃鐩?API锛坄GET /api/v1/admin/cost/profit-margin`锛?
  - 楠屾敹锛氭瘺鍒?鈮?70% 鐩戞帶鍙鍖?

- [x] **H2** 瀹炵幇 BullMQ 寮傛浠诲姟闃熷垪锛坄apps/worker/src/jobs/ai-task.job.ts`锛? SSE 杩涘害鎺ㄩ€?
  - 楠屾敹锛氶暱浠诲姟锛? 3s锛夎嚜鍔ㄥ叆闃?+ client SSE 鏀跺埌杩涘害

## Phase I锛氱ず渚?Prompt锛? 涓級

- [x] **I1** 瀹炵幇 1 涓ず渚?Prompt锛坈ontract-review-basic锛変綔涓?PromptTemplate 妯℃澘鑼冨紡
  - 楠屾敹锛? 澶ф潃鎵嬮攺 spec 鎾板啓鏃跺彲鍙傜収鏈寖寮?

## 瀹屾垚鏍囧噯

- 鉁?涓氬姟浠ｇ爜 grep 涓嶅埌 OpenAI / Anthropic SDK 鐩存帴 import锛圕I 寮哄埗锛?
- 鉁?`aiGateway.invoke({...})` 鍙 5 澶ф潃鎵嬮攺璋冪敤
- 鉁?鍏ㄩ儴 PBT 寮哄埗椤归€氳繃
- 鉁?e2e 鍦烘櫙 1锛堝悎鍚屽鏌ラ棴鐜級閫氳繃
- 鉁?姣涘埄鐩戞帶 鈮?70%


---

## V4 IMPROVEMENTS 鏂板浠诲姟锛堟紡娲?6 鍗曞鎴?AI 鎴愭湰涓婇檺锛?

- [x] **04-IMP-1** UserDailyCost / TenantMonthlyCost 妯″瀷 + cron 5min 绱
- [x] **04-IMP-2** cost-cap-enforcer.service.ts锛堣皟鐢ㄥ墠蹇呮煡涓婇檺锛?
- [x] **04-IMP-3** auto-downgrade.service.ts锛堣嚜鍔ㄥ垏澶囩敤妯″瀷锛?
- [x] **04-IMP-4** 绔欏唴淇?+ 鐭俊閫氱煡瀹㈡埛锛圴4 BR-325 璇氬疄鍛婄煡锛?
- [x] **04-IMP-5** PBT锛氫换鎰忚皟鐢ㄥ繀鏌ヤ笂闄?+ 闄嶇骇杈撳嚭宸窛 鈮?30%
- [x] **04-IMP-6** admin 鍚庡彴闃堝€煎彲璋冿紙鎸夋。浣?/ VIP锛?
- [x] **04-IMP-7** e2e锛氭垚鏈疮璁?鈫?瑙﹀彂闄嶇骇 鈫?瀹㈡埛鍛婄煡 鈫?鍗囨。寮曞

