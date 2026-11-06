### S4 round 1 — wf_2d58b17a-454 (16 agent, 33,423 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| review:bugs | claude-opus-5-5 | 10 | 6,121 | 20 | 316,259 | 69 |
| synthesize:report | claude-sonnet-5-5 | 2 | 4,440 | 4 | 22,561 | 27 |
| review:conventions | claude-opus-5-5 | 9 | 3,744 | 20 | 237,170 | 47 |
| baseline:diffBase | claude-sonnet-5-5 | 3 | 3,374 | 6 | 39,209 | 163 |
| review:measurement | claude-opus-5-5 | 4 | 2,686 | 8 | 75,865 | 30 |
| machine:node _acceptance/va-deploy-csdl-tam/thu/ | claude-haiku-5-5 | 2 | 2,303 | 4 | 16,032 | 12 |
| machine:npm test -w @quy-hang/api | claude-haiku-5-5 | 2 | 2,118 | 4 | 16,002 | 10 |
| machine:npm run db:migrate && npm run db:test | claude-haiku-5-5 | 2 | 1,778 | 4 | 16,006 | 138 |
| machine:npm run lint | claude-haiku-5-5 | 2 | 1,584 | 4 | 15,986 | 19 |
| triage | claude-sonnet-5-5 | 2 | 1,289 | 4 | 14,238 | 12 |
| machine:npm run test:hooks | claude-haiku-5-5 | 2 | 978 | 4 | 15,992 | 11 |
| machine:npm test -w @quy-hang/connect | claude-haiku-5-5 | 2 | 842 | 4 | 16,004 | 6 |
| machine:npm test -w @quy-hang/ui-lint | claude-haiku-5-5 | 2 | 652 | 4 | 16,010 | 39 |
| machine:npm run typecheck | claude-haiku-5-5 | 2 | 598 | 4 | 15,990 | 24 |
| machine:npm test -w @quy-hang/core | claude-haiku-5-5 | 2 | 581 | 4 | 12,813 | 8 |
| capture:provenance | claude-sonnet-5-5 | 2 | 335 | 4 | 11,603 | 5 |


wall: 199s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 3,374 | 39,209 | 163 | 13:43:55 | 13:46:38 |
| machine | 9 | 11,434 | 140,835 | 139 | 13:43:55 | 13:46:14 |
| review | 3 | 12,551 | 629,294 | 71 | 13:43:55 | 13:45:06 |
| triage | 1 | 1,289 | 14,238 | 12 | 13:46:16 | 13:46:28 |
| capture | 1 | 335 | 11,603 | 5 | 13:46:40 | 13:46:45 |
| synthesize | 1 | 4,440 | 22,561 | 27 | 13:46:47 | 13:47:14 |

- **claude-opus-5-5**: 3 agent · 23 calls · out 12,551 · in 48 · cache_read 629,294 · cache_create 120,391
- **claude-sonnet-5-5**: 4 agent · 9 calls · out 9,438 · in 18 · cache_read 87,611 · cache_create 92,599
- **claude-haiku-5-5**: 9 agent · 18 calls · out 11,434 · in 36 · cache_read 140,835 · cache_create 128,914

### S4 round 2 — wf_f8f8cb3f-612 (16 agent, 38,739 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| review:conventions | claude-opus-5-5 | 8 | 5,609 | 16 | 247,037 | 64 |
| synthesize:report | claude-sonnet-5-5 | 2 | 5,392 | 4 | 24,819 | 30 |
| review:measurement | claude-opus-5-5 | 3 | 4,222 | 6 | 41,881 | 47 |
| review:bugs | claude-opus-5-5 | 7 | 3,800 | 14 | 194,153 | 48 |
| baseline:diffBase | claude-sonnet-5-5 | 3 | 3,374 | 6 | 42,511 | 160 |
| triage | claude-sonnet-5-5 | 2 | 2,835 | 4 | 16,382 | 20 |
| machine:node _acceptance/va-deploy-csdl-tam/thu/ | claude-haiku-5-5 | 2 | 2,512 | 4 | 16,022 | 11 |
| machine:npm run db:migrate && npm run db:test | claude-haiku-5-5 | 2 | 2,278 | 4 | 15,996 | 131 |
| machine:npm test -w @quy-hang/ui-lint | claude-haiku-5-5 | 2 | 1,804 | 4 | 16,000 | 38 |
| machine:npm run lint | claude-haiku-5-5 | 2 | 1,551 | 4 | 15,976 | 17 |
| machine:npm test -w @quy-hang/core | claude-haiku-5-5 | 2 | 1,527 | 4 | 15,992 | 8 |
| machine:npm test -w @quy-hang/api | claude-haiku-5-5 | 2 | 1,020 | 4 | 15,992 | 6 |
| machine:npm run test:hooks | claude-haiku-5-5 | 2 | 945 | 4 | 15,982 | 10 |
| machine:npm test -w @quy-hang/connect | claude-haiku-5-5 | 2 | 849 | 4 | 15,994 | 5 |
| machine:npm run typecheck | claude-haiku-5-5 | 2 | 685 | 4 | 15,980 | 16 |
| capture:provenance | claude-sonnet-5-5 | 2 | 336 | 4 | 11,593 | 5 |


wall: 199s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 3,374 | 42,511 | 160 | 13:50:43 | 13:53:23 |
| machine | 9 | 13,171 | 143,934 | 131 | 13:50:43 | 13:52:54 |
| review | 3 | 13,631 | 483,071 | 64 | 13:50:43 | 13:51:46 |
| triage | 1 | 2,835 | 16,382 | 20 | 13:52:56 | 13:53:16 |
| capture | 1 | 336 | 11,593 | 5 | 13:53:25 | 13:53:30 |
| synthesize | 1 | 5,392 | 24,819 | 30 | 13:53:32 | 13:54:02 |

- **claude-opus-5-5**: 3 agent · 18 calls · out 13,631 · in 36 · cache_read 483,071 · cache_create 114,645
- **claude-sonnet-5-5**: 4 agent · 9 calls · out 11,937 · in 18 · cache_read 95,305 · cache_create 93,657
- **claude-haiku-5-5**: 9 agent · 18 calls · out 13,171 · in 36 · cache_read 143,934 · cache_create 126,200

