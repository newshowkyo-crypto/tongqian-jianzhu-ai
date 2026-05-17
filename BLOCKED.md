# BLOCKED: 01-I2 Deploy Duration Verification

- Task: `01-I2`
- Status: blocked
- Blocked at: `2026-05-18T03:38:00+08:00`
- Requirement: verify VPS deploy duration <= 15 minutes, including canary rollout.

## What Passed

- Local DoD passed after deploy workflow changes:
  - `pnpm typecheck`
  - `pnpm lint`
  - `pnpm test`
  - `pnpm build`
- Image build workflow passed for the latest attempts.
- CI workflow passed for the latest attempts.
- `deploy-prod.yml` now routes production deploy through `infra/deploy/canary.sh`.
- `infra/deploy/ensure-env.sh` now auto-generates missing P2 runtime keys on the VPS deploy path without committing secrets.

## Failed Attempts

1. `6cc38acc533932ec9de18464fbe79dd275ea8102`
   - Deploy run: https://github.com/newshowkyo-crypto/tongqian-jianzhu-ai/actions/runs/25999899024
   - Result: failure
   - Duration: 11s

2. `8459c1253e2135fff2558232e1a06e5aaef4117a`
   - Deploy run: https://github.com/newshowkyo-crypto/tongqian-jianzhu-ai/actions/runs/26000093629
   - Result: failure
   - Duration: 15s

3. `0270c50a5a9a07683678133dff714b5dfa391a24`
   - Build Images: success
   - CI: success
   - Deploy run: https://github.com/newshowkyo-crypto/tongqian-jianzhu-ai/actions/runs/26000657542
   - Result: failure
   - Duration: 10s

## Last Known Failure Surface

The deploy job fails in the GitHub Actions VPS SSH deploy phase before any canary duration can be measured. Public API access exposes job status but not private job logs; local direct SSH from this workstation also fails with `Permission denied (publickey,...)`, so Codex cannot inspect `/opt/tongqian` or the masked deploy log from here.

## User Action Required

Provide one of the following:

- The `Deploy over SSH` log excerpt from the latest failed run, with secrets masked.
- A working local SSH private key for `deploy@101.132.191.128`.
- Temporary GitHub Actions log access/token for this repo so Codex can read the failed job logs.

After that, resume from `01-I2`.
