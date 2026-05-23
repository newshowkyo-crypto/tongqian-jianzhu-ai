# 同乾方略 VPS 部署 SOP

## 0. 目标
1. 本 SOP 面向阿里云华东 1 的干净 Ubuntu 22.04 ECS。
2. 目标是让同乾方略 · 建筑 AI 经营管家在一台 VPS 上完成首发演练。
3. 运维人员只需要按顺序执行，不需要改代码。
4. 所有真实凭证优先通过 `/admin/credentials` 管理。
5. 服务器上的 `.env.prod` 只保留启动所需 P0 环境变量。
6. ICP 备案通过后填写 `ICP_RECORD_NO`，M24 已支持页面和系统配置读取。
7. 未备案前只做内测和演练，不对公网正式销售。
8. 每次部署都必须能回滚到 `prod-previous`。
9. 每次上线前都要跑 `infra/deploy/health-check.sh`。
10. 每次上线后都要看 `deploy.log` 和 Uptime Kuma。

## 1. ECS 规格
1. 区域选择华东 1。
2. 镜像选择 Ubuntu 22.04 LTS。
3. 起步规格建议 4C8G。
4. 系统盘建议 50GB SSD。
5. 后续客户增长后再拆分数据库。
6. 安全组开放 22、80、443。
7. 22 端口只允许运维固定 IP。
8. 80 用于 HTTP 和证书签发。
9. 443 用于正式 HTTPS。
10. 不开放 PostgreSQL 和 Redis 到公网。

## 2. SSH 登录
1. 在本地保存 ECS 私钥。
2. 执行 `ssh root@服务器公网 IP`。
3. 首次登录后立即更新系统。
4. 执行 `apt update && apt upgrade -y`。
5. 创建 deploy 用户。
6. 执行 `adduser deploy`。
7. 执行 `usermod -aG sudo deploy`。
8. 把公钥写入 `/home/deploy/.ssh/authorized_keys`。
9. 确认 deploy 用户能免密登录。
10. 禁止 root 密码登录。

## 3. 初始化脚本
1. 用 deploy 用户登录服务器。
2. 下载 `infra/deploy/bootstrap.sh`。
3. 可以用对象存储链接执行。
4. 示例：`curl -sSL https://your-bucket.com/bootstrap.sh | bash`。
5. 脚本会检查 Ubuntu 22.04。
6. 脚本会安装 Docker。
7. 脚本会安装 docker compose plugin。
8. 脚本会安装 git、jq、curl。
9. 脚本会配置 ufw。
10. 脚本会创建 `/opt/tongqian`。

## 4. 拉取代码
1. bootstrap 会拉取 GitHub 仓库。
2. 仓库路径是 `/opt/tongqian`。
3. 如果目录已有 `.git`，脚本不会覆盖。
4. 如果需要更新代码，进入目录执行 `git pull`。
5. 发布机不直接开发代码。
6. 发布机只执行 deploy 脚本。
7. 发布机不要保存本地未提交改动。
8. 发布前确认当前分支是 main 或发布 tag。
9. 发布前确认 `infra/docker-compose.prod.yml` 存在。
10. 发布前确认 `infra/deploy/health-check.sh` 存在。

## 5. 环境变量
1. 复制 `.env.example` 为 `.env.prod`。
2. bootstrap 已自动创建缺省文件。
3. 必填 `POSTGRES_PASSWORD`。
4. 必填 `REDIS_PASSWORD`。
5. 必填 `JWT_SECRET`。
6. 必填 `MASTER_ENCRYPTION_KEY`。
7. 必填 `ACR_REGISTRY`。
8. 必填 `ACR_USERNAME`。
9. 必填 `ACR_PASSWORD`。
10. ICP 通过后填写 `ICP_RECORD_NO` 或在后台系统配置写入。

## 6. 凭证策略
1. P0 凭证不要写进 Git。
2. P0 凭证不要放进 Dockerfile。
3. P0 凭证不要放进 GitHub Actions 日志。
4. DeepSeek key 在 `/admin/credentials` 测试。
5. OpenRouter key 在 `/admin/credentials` 测试。
6. 阿里云百炼 key 在 `/admin/credentials` 测试。
7. OSS key 在 `/admin/credentials` 测试。
8. SMS key 在 `/admin/credentials` 测试。
9. 微信公众号 key 在 `/admin/credentials` 测试。
10. 真实模式切换前必须保留审计记录。

## 7. ACR 镜像
1. 进入阿里云容器镜像服务。
2. 创建命名空间 `tongqian`。
3. 创建 7 个镜像仓库。
4. 仓库名是 api。
5. 仓库名是 worker。
6. 仓库名是 web。
7. 仓库名是 admin。
8. 仓库名是 agent。
9. 仓库名是 gov。
10. 仓库名是 nginx。

## 8. 部署命令
1. 进入 `/opt/tongqian`。
2. 执行 `./infra/deploy/deploy.sh prod-latest`。
3. 脚本先登录 ACR。
4. 脚本会标记 prod-latest 为 prod-previous。
5. 脚本会拉取新镜像。
6. 脚本会执行 compose up。
7. 脚本会等待健康检查。
8. 脚本会调用 health-check。
9. 脚本会写入 `/opt/tongqian/deploy.log`。
10. 如果失败，立即执行 rollback。

## 9. 健康检查
1. API 检查 `http://127.0.0.1:4000/health`。
2. Web 检查 `http://127.0.0.1:3000/api/health`。
3. Admin 检查 `http://127.0.0.1:3010/api/health`。
4. Agent 检查 `http://127.0.0.1:3011/api/health`。
5. Gov 检查 `http://127.0.0.1:3012/api/health`。
6. Nginx 检查 `http://127.0.0.1/healthz`。
7. 六个端点都返回 200 才算通过。
8. 任一端点失败都不继续上线。
9. 查看 `docker compose ps`。
10. 查看 `docker logs tqj-prod-api --tail=100`。

## 10. DNS 和 SSL
1. 域名解析到 ECS 公网 IP。
2. 主站建议 `www.tongqianjianzhu.com`。
3. 后台建议 `admin.tongqianjianzhu.com`。
4. 智能管家端建议 `agent.tongqianjianzhu.com`。
5. 政企端建议 `gov.tongqianjianzhu.com`。
6. 证书可以用 acme.sh。
7. 证书签发前确认 80 端口可访问。
8. 证书文件挂载到 nginx。
9. 自动续期任务必须启用。
10. 证书续期后 reload nginx。

## 11. ICP 备案
1. 未备案前不要正式开放公网经营。
2. ICP 材料在 `/admin/onboarding/icp` 维护。
3. 阿里云备案控制台提交材料。
4. 审核通常需要 7 到 21 天。
5. 通过后拿到备案号。
6. 备案号写入 `ICP_RECORD_NO`。
7. 备案号也可写入 `system_configs.icp_record`。
8. 前台页脚会读取备案号。
9. 备案主体必须与公司信息一致。
10. 备案变更后要同步更新后台。

## 12. 备份
1. 每天 03:00 执行数据库备份。
2. 备份命令使用 `pg_dump`。
3. 备份文件写入 `/opt/tongqian/data/backup`。
4. 备份后同步到 OSS。
5. Redis 使用 appendonly。
6. OSS 缓存目录定期清理。
7. 保留最近 7 天本地备份。
8. 保留最近 30 天远端备份。
9. 每周做一次恢复演练。
10. 恢复演练要记录到运维日志。

## 13. 灰度发布
1. 首发阶段先内部灰度。
2. 手动调整 nginx upstream 权重。
3. 先模拟 5% 流量。
4. 观察 15 分钟。
5. 再扩大到 25%。
6. 观察错误率。
7. 再扩大到 50%。
8. 最后扩大到 100%。
9. 如果错误率上升，立即回滚。
10. 灰度记录写入 deploy.log。

## 14. 回滚
1. 回滚命令是 `./infra/deploy/rollback.sh`。
2. 回滚使用 `prod-previous` tag。
3. 回滚前确认 previous 镜像存在。
4. 回滚后立即跑 health-check。
5. 回滚后查看 API 日志。
6. 回滚后查看 Nginx 日志。
7. 回滚后通知客户成功。
8. 回滚原因写入事故记录。
9. 修复后重新构建新 tag。
10. 不要在故障中手工改容器内部文件。

## 15. 监控
1. Uptime Kuma 容器随 compose 启动。
2. 给六个端点配置探针。
3. API 探针间隔 30 秒。
4. Web 探针间隔 30 秒。
5. Admin 探针间隔 30 秒。
6. Agent 探针间隔 30 秒。
7. Gov 探针间隔 30 秒。
8. Nginx 探针间隔 30 秒。
9. 告警通知接入企业微信。
10. 每天早上检查一次监控面板。

## 16. 日志
1. API 日志看 `docker logs tqj-prod-api`。
2. Worker 日志看 `docker logs tqj-prod-worker`。
3. Nginx 日志看容器标准输出。
4. 数据库日志只在排障时查看。
5. 不在日志里打印真实凭证。
6. 不在日志里打印用户原文合同。
7. 不在日志里打印身份证号。
8. 审计日志不得删除。
9. 故障排查完成后写复盘。
10. 复盘归档到 docs/runbook。

## 17. 安全
1. 禁止数据库公网访问。
2. 禁止 Redis 公网访问。
3. 禁止把 SSH 私钥放服务器仓库。
4. 禁止把 ACR 密码写入脚本。
5. 禁止把模型 key 写入脚本。
6. 禁止跳过审批流写操作。
7. 禁止删除审计日志。
8. 禁止把用户原文直接发海外模型。
9. 禁止临时关闭防火墙忘记恢复。
10. 禁止使用弱口令。

## 18. 首发验收
1. 访问主站首页。
2. 访问后台登录页。
3. 访问智能管家端。
4. 访问政企端。
5. 调用 API health。
6. 登录后台查看上线引导。
7. 检查凭证真实模式。
8. 检查 ICP 状态。
9. 检查业务底料准备度。
10. 记录验收结果。

## 19. 三条命令
1. 第一条命令初始化服务器。
2. `curl -sSL https://your-bucket.com/bootstrap.sh | bash`
3. 第二条命令部署镜像。
4. `./infra/deploy/deploy.sh prod-latest`
5. 第三条命令检查健康。
6. `./infra/deploy/health-check.sh`
7. 三条命令都成功后才进入人工验收。
8. 人工验收通过后再切 DNS。
9. DNS 生效后观察 30 分钟。
10. 观察无异常后宣布上线。

## 20. 责任分工
1. 创始人负责购买 ECS。
2. 创始人负责申请 EV 证书。
3. 创始人负责备案主体材料。
4. 运维客服负责执行 bootstrap。
5. 运维客服负责执行 deploy。
6. 运维客服负责执行 health-check。
7. 客户成功负责冒烟验收。
8. 客户成功负责记录客户影响。
9. 技术侧负责 CI 镜像构建。
10. 技术侧负责回滚支持。
## 21. Line-by-line execution checklist
1. Confirm ECS region is cn-hangzhou or target region.
2. Confirm Ubuntu release is 22.04.
3. Confirm deploy user can sudo.
4. Confirm root password login is disabled.
5. Confirm SSH key login works.
6. Confirm security group exposes 22 only to office IP.
7. Confirm security group exposes 80.
8. Confirm security group exposes 443.
9. Confirm PostgreSQL is not public.
10. Confirm Redis is not public.
11. Confirm /opt/tongqian exists.
12. Confirm repository clone exists.
13. Confirm .env.prod exists.
14. Confirm POSTGRES_PASSWORD is set.
15. Confirm REDIS_PASSWORD is set.
16. Confirm JWT_SECRET is set.
17. Confirm MASTER_ENCRYPTION_KEY is set.
18. Confirm ACR_REGISTRY is set.
19. Confirm ACR_USERNAME is set.
20. Confirm ACR_PASSWORD is set.
21. Confirm ICP_RECORD_NO is empty before approval.
22. Confirm ICP_RECORD_NO is filled after approval.
23. Confirm /admin/credentials can be opened.
24. Confirm DeepSeek credential test result is visible.
25. Confirm OpenRouter credential test result is visible.
26. Confirm DashScope credential test result is visible.
27. Confirm OSS credential test result is visible.
28. Confirm SMS credential test result is visible.
29. Confirm WeChat credential test result is visible.
30. Confirm credential switches create audit rows.
31. Confirm docker version works.
32. Confirm docker compose version works.
33. Confirm jq version works.
34. Confirm curl version works.
35. Confirm git version works.
36. Confirm ACR login works.
37. Confirm api image can pull.
38. Confirm worker image can pull.
39. Confirm web image can pull.
40. Confirm admin image can pull.
41. Confirm agent image can pull.
42. Confirm gov image can pull.
43. Confirm nginx image can pull.
44. Confirm postgres volume path exists.
45. Confirm redis volume path exists.
46. Confirm backup path exists.
47. Confirm uptime-kuma path exists.
48. Confirm compose file validates.
49. Confirm deploy script is executable.
50. Confirm rollback script is executable.
51. Confirm health-check script is executable.
52. Confirm bootstrap script is archived in OSS.
53. Confirm deploy starts postgres.
54. Confirm deploy starts redis.
55. Confirm deploy starts api.
56. Confirm deploy starts worker.
57. Confirm deploy starts web.
58. Confirm deploy starts admin.
59. Confirm deploy starts agent.
60. Confirm deploy starts gov.
61. Confirm deploy starts nginx.
62. Confirm deploy starts uptime-kuma.
63. Confirm postgres is healthy.
64. Confirm redis is healthy.
65. Confirm api is healthy.
66. Confirm worker liveness is healthy.
67. Confirm web is healthy.
68. Confirm admin is healthy.
69. Confirm agent is healthy.
70. Confirm gov is healthy.
71. Confirm nginx is healthy.
72. Confirm api health endpoint returns 200.
73. Confirm web health endpoint returns 200.
74. Confirm admin health endpoint returns 200.
75. Confirm agent health endpoint returns 200.
76. Confirm gov health endpoint returns 200.
77. Confirm nginx healthz returns 200.
78. Confirm deploy log was appended.
79. Confirm API logs have no secrets.
80. Confirm worker logs have no secrets.
81. Confirm nginx logs have no secrets.
82. Confirm database migration state is expected.
83. Confirm Redis appendonly is enabled.
84. Confirm backup cron is installed.
85. Confirm backup cron runs at 03:00.
86. Confirm backup files are encrypted at rest.
87. Confirm backup upload to OSS is configured.
88. Confirm restore drill owner is assigned.
89. Confirm DNS A record points to ECS.
90. Confirm SSL certificate is issued.
91. Confirm SSL auto-renew is configured.
92. Confirm nginx reload after renewal is configured.
93. Confirm WAF policy is enabled.
94. Confirm DDoS protection is enabled.
95. Confirm rate limit is enabled.
96. Confirm admin path access policy is reviewed.
97. Confirm Uptime Kuma is reachable privately.
98. Confirm Uptime Kuma probes are configured.
99. Confirm alert channel is connected.
100. Confirm on-call contact is updated.
101. Confirm product smoke test owner is assigned.
102. Confirm customer success smoke test owner is assigned.
103. Confirm operations smoke test owner is assigned.
104. Confirm main site opens.
105. Confirm admin login opens.
106. Confirm agent portal opens.
107. Confirm gov portal opens.
108. Confirm AI gateway health is reviewed.
109. Confirm billing hooks stay in mock until credentials pass.
110. Confirm ICP page shows current status.
111. Confirm fuel progress page loads.
112. Confirm launch onboarding page loads.
113. Confirm launch onboarding is not green unless all steps pass.
114. Confirm logs are retained.
115. Confirm audit logs are retained.
116. Confirm no manual DB edits were made.
117. Confirm rollback tag exists.
118. Confirm rollback command was rehearsed.
119. Confirm rollback health check passed.
120. Confirm incident template exists.
121. Confirm release note is drafted.
122. Confirm customer notice is drafted.
123. Confirm maintenance window is booked.
124. Confirm internal announcement is sent.
125. Confirm gray release percentage starts at 5.
126. Confirm gray release observation lasts 15 minutes.
127. Confirm error rate threshold is documented.
128. Confirm latency threshold is documented.
129. Confirm conversion critical path is tested.
130. Confirm upload critical path is tested.
131. Confirm contract review critical path is tested.
132. Confirm tender flow critical path is tested.
133. Confirm qualification flow critical path is tested.
134. Confirm dispatch flow critical path is tested.
135. Confirm cashflow flow critical path is tested.
136. Confirm report flow critical path is tested.
137. Confirm project site flow critical path is tested.
138. Confirm admin credentials flow is tested.
139. Confirm admin ICP flow is tested.
140. Confirm admin fuel flow is tested.
141. Confirm admin onboarding flow is tested.
142. Confirm no TODO blocks release.
143. Confirm no plaintext credential in Git.
144. Confirm no overseas model receives raw user documents.
145. Confirm sanitizer remains enabled.
146. Confirm tenant guard remains enabled.
147. Confirm permission guard remains enabled.
148. Confirm approval flow remains enabled.
149. Confirm audit write remains enabled.
150. Confirm deploy operator signs off.
151. Confirm founder signs off.
152. Confirm customer success signs off.
153. Confirm rollback owner signs off.
154. Confirm DNS switch owner signs off.
155. Confirm SSL owner signs off.
156. Confirm ICP owner signs off.
157. Confirm ACR owner signs off.
158. Confirm EV certificate owner signs off.
159. Confirm ECS billing alarm is enabled.
160. Confirm disk usage alarm is enabled.
161. Confirm CPU alarm is enabled.
162. Confirm memory alarm is enabled.
163. Confirm HTTP 5xx alarm is enabled.
164. Confirm queue backlog alarm is enabled.
165. Confirm database connection alarm is enabled.
166. Confirm Redis connection alarm is enabled.
167. Confirm backup failure alarm is enabled.
168. Confirm certificate expiry alarm is enabled.
169. Confirm domain expiry alarm is enabled.
170. Confirm launch decision is recorded.
171. Confirm launch time is recorded.
172. Confirm deployed tag is recorded.
173. Confirm deployed commit is recorded.
174. Confirm compose service list is recorded.
175. Confirm image digest list is recorded.
176. Confirm health-check output is recorded.
177. Confirm rollback output is recorded.
178. Confirm known limitations are recorded.
179. Confirm next actions are recorded.
180. Confirm release is complete.
