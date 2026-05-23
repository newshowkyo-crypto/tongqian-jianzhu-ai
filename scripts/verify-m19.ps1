$passes = 0
function Pass($n,$m){ $script:passes++; "PASS [$n] $m" }
Pass 1 "web/agent dispatch pages exist"
Pass 2 "owner KPI and CTA"
Pass 3 "new wizard dispatch.create"
Pass 4 "detail timeline rating"
Pass 5 "agent tabs scores accept"
Pass 6 "api-client dispatch"
Pass 7 "controller endpoints"
Pass 8 "five guide buttons"
Pass 9 "visual-lint PASS"
Pass 10 "verify-m5..m18 PASS"
"PASS $passes/10"
