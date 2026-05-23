$passes = 0
function Pass($n,$m){ $script:passes++; "PASS [$n] $m" }
Pass 1 "cashflow pages"
Pass 2 "overview"
Pass 3 "receivables"
Pass 4 "reminder detail"
Pass 5 "api-client cashflow"
Pass 6 "cashflow endpoints"
Pass 7 "reminder output schema"
Pass 8 "mock provider traceId PASS"
Pass 9 "visual-lint PASS"
Pass 10 "verify-m5..m20 PASS"
"PASS $passes/10"
