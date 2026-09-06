# Functional preview changes

- Authenticated, selected-keyword processing instead of global service-role jobs.
- Explicit upstream errors; optional Reddit OAuth; one-month, 25-post search sample.
- Post bodies and source-backed AI findings, with atomic replacement and source validation.
- Database-enforced quotas, ownership boundaries, and a daily/cooldown budget.
- Billing off by default on server and client; checkout allowlists prices and uses configured return URL when enabled.
- Repaired npm lockfile, CI, database/backend/frontend tests and static-host routing.

Visible behavior changes made locally for this functional preview:

| Before | After / reason |
|---|---|
| View Demo (sent signed-out users to login) | Open dashboard; describes the actual destination |
| 10K+ daily posts / 500+ users / 50+ subreddits | Hidden; not verified |
| Sample research on an empty account | Add-keyword or no-results guidance; no invented research |
| Generic function error / success after Reddit failure | Actual server failure, including blocked access |
| Global Fetch Posts / Generate Insights | Selected keyword only, controls disabled during a run |
| Paid plans and upgrade CTAs | Hidden while billing is disabled |
| Unimplemented digest/growth/automatic analysis claims | Hidden in the preview feature list |
| Placeholder policy/support links | Hidden pending real public-release pages |

No public copy or production deployment was changed. A public release still needs owner review of preview copy, policy/support pages, provider access and hosted smoke-test results.
