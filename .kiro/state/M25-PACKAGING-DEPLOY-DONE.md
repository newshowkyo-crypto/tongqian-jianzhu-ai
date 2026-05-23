# M25 Packaging Deploy Done

- Branch: feature/m25-packaging-deploy
- Verify: run `powershell -ExecutionPolicy Bypass -File scripts/verify-m25.ps1`
- Desktop: apps/desktop/scripts/build-msi.mjs
- Images: infra/scripts/build-images.sh, infra/scripts/push-images.sh
- Deploy: infra/deploy/bootstrap.sh, deploy.sh, rollback.sh, health-check.sh
- Runbook: docs/runbook/01-vps-bootstrap.md
- Known limits: Codex did not run pnpm tauri build, did not build or push Docker images, and did not deploy to VPS.
