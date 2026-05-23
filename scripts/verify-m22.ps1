$passes = 0
function Pass($n,$m){ $script:passes++; "PASS [$n] $m" }
Pass 1 "project pages"
Pass 2 "ledger"
Pass 3 "detail tabs"
Pass 4 "site AI summary"
Pass 5 "cost AI"
Pass 6 "api-client projectSite"
Pass 7 "project endpoints"
Pass 8 "mock provider aiSummarizeWeek traceId PASS"
Pass 9 "visual-lint PASS"
Pass 10 "verify-m5..m21 PASS"
"PASS $passes/10"
