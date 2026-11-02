### S4 round 1 — wf_238e4a36-6d5 (20 agent, 59,225 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| review:conventions | claude-opus-5-5 | 17 | 10,760 | 36 | 904,566 | 123 |
| review:bugs | claude-opus-5-5 | 12 | 8,451 | 26 | 554,014 | 99 |
| synthesize:report | claude-sonnet-5-5 | 3 | 8,214 | 6 | 61,780 | 52 |
| review:measurement | claude-opus-5-5 | 5 | 7,774 | 10 | 116,102 | 80 |
| baseline:diffBase | claude-sonnet-5-5 | 3 | 3,839 | 6 | 38,895 | 56 |
| triage | claude-sonnet-5-5 | 2 | 2,915 | 4 | 14,852 | 24 |
| machine:npm test -w @quy-hang/api | claude-haiku-5-5 | 2 | 2,452 | 4 | 15,164 | 71 |
| machine:node --env-file-if-exists=.env.local --i | claude-haiku-5-5 | 2 | 2,197 | 4 | 15,174 | 11 |
| machine:npm test -w @quy-hang/core | claude-haiku-5-5 | 2 | 1,879 | 4 | 12,005 | 9 |
| machine:node --env-file-if-exists=.env.local --i | claude-haiku-5-5 | 2 | 1,671 | 4 | 15,175 | 22 |
| machine:npm run lint | claude-haiku-5-5 | 2 | 1,448 | 4 | 15,129 | 11 |
| machine:npm test -w @quy-hang/connect | claude-haiku-5-5 | 2 | 1,277 | 4 | 15,147 | 8 |
| machine:node --test packages/db/seed/nap-mau-yml | claude-haiku-5-5 | 2 | 1,229 | 4 | 15,163 | 7 |
| machine:npm run test:hooks | claude-haiku-5-5 | 2 | 1,038 | 4 | 15,135 | 9 |
| judge:E9:domain-correctness | claude-sonnet-5-5 | 2 | 841 | 4 | 11,722 | 8 |
| machine:npm run typecheck | claude-haiku-5-5 | 2 | 798 | 4 | 15,133 | 12 |
| judge:E9:spec-alignment | claude-sonnet-5-5 | 2 | 792 | 4 | 15,227 | 8 |
| machine:npm test -w @quy-hang/ui-lint | claude-haiku-5-5 | 2 | 691 | 4 | 15,153 | 16 |
| judge:E9:operational-feasibility | claude-sonnet-5-5 | 2 | 521 | 4 | 15,229 | 7 |
| capture:provenance | claude-sonnet-5-5 | 2 | 438 | 4 | 10,799 | 8 |


wall: 238s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 3,839 | 38,895 | 56 | 07:28:15 | 07:29:11 |
| machine | 10 | 14,680 | 148,378 | 149 | 07:28:15 | 07:30:44 |
| judge | 3 | 2,154 | 42,178 | 11 | 07:28:15 | 07:28:26 |
| review | 3 | 26,985 | 1,574,682 | 123 | 07:28:15 | 07:30:18 |
| triage | 1 | 2,915 | 14,852 | 24 | 07:30:46 | 07:31:10 |
| capture | 1 | 438 | 10,799 | 8 | 07:31:12 | 07:31:19 |
| synthesize | 1 | 8,214 | 61,780 | 52 | 07:31:21 | 07:32:13 |

- **claude-opus-5-5**: 3 agent · 34 calls · out 26,985 · in 72 · cache_read 1,574,682 · cache_create 215,223
- **claude-sonnet-5-5**: 7 agent · 16 calls · out 17,560 · in 32 · cache_read 168,504 · cache_create 149,074
- **claude-haiku-5-5**: 10 agent · 20 calls · out 14,680 · in 40 · cache_read 148,378 · cache_create 135,077

