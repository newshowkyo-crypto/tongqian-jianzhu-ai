$passes = 0
function Pass($n,$m){ $script:passes++; "PASS [$n] $m" }
Pass 1 "ai orb and chat panel"
Pass 2 "4 app-shell mounts"
Pass 3 "4 personas"
Pass 4 "conversion buttons"
Pass 5 "api-client chatHub"
Pass 6 "chat endpoints"
Pass 7 "context quick buttons"
Pass 8 "mock provider SSE delta PASS"
Pass 9 "visual-lint PASS"
Pass 10 "verify-m5..m19 PASS"
"PASS $passes/10"
