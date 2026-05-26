# ADR-AUTO: Revert M39 Gov Positioning Mistake

Date: 2026-05-26

## Context

M39 incorrectly simplified `apps/gov` into an individual office surface and removed declarations/funds pages. That conflicts with the 23 gov-soe workspace scope.

## Decision

Restore `apps/gov` as a government engineering administrator and central/state-owned enterprise engineering office workspace. The valid gov modules are policy learning, official document AI, project sourcing, policy fund battle map, and debt/financing consultation entry.

## Constraints

- Gov AI routing must use China-hosted providers only.
- Gov pages must not use gamification mechanics.
- Official documents require watermark, user trace, timestamp, IP, and six-year audit retention.
- Personal certificate monitor, exam radar, personal document library, and "personal office user" positioning are removed.

## Consequences

Building-company modules remain in `apps/web`; intelligent steward modules remain in `apps/agent`; gov stays focused on policy, documents, sourcing, funds, and compliance.
