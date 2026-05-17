# SLS Docker stdout collection

This project uses Alibaba Cloud Simple Log Service with LoongCollector for Docker stdout.

## VPS setup

1. Create an SLS project and logstore in the same region as the ECS instance.
2. Install LoongCollector on the VPS and attach the machine group to that project.
3. Apply `infra/monitoring/sls-docker-daemon.json` to `/etc/docker/daemon.json`, then restart Docker during a maintenance window.
4. In the SLS console, create a Docker stdout collection config for the compose project path `/opt/tongqian`.
5. Collect stdout from these compose services:
   - `api`
   - `worker`
   - `web`
   - `gov`
   - `agent`
   - `admin`
   - `nginx`
   - `uptime-kuma`

## Parsing

Use JSON parsing when the application emits structured JSON. For early infra services that emit plain text, keep raw text parsing and add fields from Docker metadata:

- `container_name`
- `compose_project`
- `compose_service`
- `image`
- `host`

## Acceptance

The SLS logstore should show fresh records after:

```bash
docker compose -f infra/docker-compose.prod.yml logs --tail 10 api
```

Secrets and Alibaba Cloud credentials stay on the VPS or in the SLS console. They must not be committed.
