### S4 round 1 — wf_cd2ff9d1-93d (15 agent, 37,517 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| review:measurement | claude-opus-5-5 | 5 | 5,642 | 10 | 115,272 | 66 |
| synthesize:report | claude-sonnet-5-5 | 2 | 5,412 | 4 | 25,802 | 30 |
| review:bugs | claude-opus-5-5 | 9 | 5,244 | 18 | 357,708 | 73 |
| review:conventions | claude-opus-5-5 | 7 | 4,415 | 14 | 265,195 | 67 |
| baseline:diffBase | claude-sonnet-5-5 | 3 | 4,296 | 6 | 40,649 | 112 |
| triage | claude-sonnet-5-5 | 2 | 2,754 | 4 | 15,957 | 20 |
| machine:npm run lint | claude-haiku-5-5 | 2 | 2,027 | 4 | 15,573 | 16 |
| machine:npm test -w @quy-hang/ui-lint | claude-haiku-5-5 | 2 | 1,783 | 4 | 15,597 | 26 |
| machine:npm test -w @quy-hang/core | claude-haiku-5-5 | 2 | 1,503 | 4 | 12,449 | 8 |
| refute:khuon.test.ts | claude-sonnet-5-5 | 3 | 1,035 | 6 | 27,030 | 11 |
| machine:npm run test:hooks | claude-haiku-5-5 | 2 | 939 | 4 | 15,579 | 10 |
| machine:npm test -w @quy-hang/connect | claude-haiku-5-5 | 2 | 821 | 4 | 15,591 | 5 |
| machine:npm run typecheck | claude-haiku-5-5 | 2 | 697 | 4 | 15,577 | 13 |
| machine:npm test -w @quy-hang/api | claude-haiku-5-5 | 2 | 532 | 4 | 15,589 | 66 |
| capture:provenance | claude-sonnet-5-5 | 2 | 417 | 4 | 11,239 | 7 |


wall: 234s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 4,296 | 40,649 | 112 | 02:17:09 | 02:19:01 |
| machine | 7 | 8,302 | 105,955 | 157 | 02:17:09 | 02:19:45 |
| review | 3 | 15,301 | 738,175 | 78 | 02:17:09 | 02:18:27 |
| triage | 1 | 2,754 | 15,957 | 20 | 02:19:47 | 02:20:08 |
| refute | 1 | 1,035 | 27,030 | 11 | 02:20:10 | 02:20:22 |
| capture | 1 | 417 | 11,239 | 7 | 02:20:24 | 02:20:31 |
| synthesize | 1 | 5,412 | 25,802 | 30 | 02:20:33 | 02:21:03 |

- **claude-opus-5-5**: 3 agent · 21 calls · out 15,301 · in 42 · cache_read 738,175 · cache_create 186,423
- **claude-sonnet-5-5**: 5 agent · 12 calls · out 13,914 · in 24 · cache_read 120,677 · cache_create 114,126
- **claude-haiku-5-5**: 7 agent · 14 calls · out 8,302 · in 28 · cache_read 105,955 · cache_create 93,752

### S4 round 2 — wf_380397ab-5f6 (13 agent, 20,505 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 2 | 4,408 | 4 | 27,276 | 27 |
| review:bugs | claude-opus-5-5 | 5 | 2,557 | 10 | 81,593 | 35 |
| review:conventions | claude-opus-5-5 | 4 | 2,388 | 8 | 57,405 | 29 |
| machine:npm test -w @quy-hang/api | claude-haiku-5-5 | 2 | 2,103 | 4 | 15,568 | 69 |
| machine:npm run lint | claude-haiku-5-5 | 2 | 2,069 | 4 | 15,552 | 15 |
| machine:npm test -w @quy-hang/core | claude-haiku-5-5 | 2 | 1,526 | 4 | 15,568 | 8 |
| triage | claude-sonnet-5-5 | 2 | 1,138 | 4 | 14,415 | 11 |
| review:measurement | claude-opus-5-5 | 3 | 1,086 | 6 | 34,105 | 20 |
| machine:npm run test:hooks | claude-haiku-5-5 | 2 | 864 | 4 | 15,558 | 9 |
| machine:npm test -w @quy-hang/connect | claude-haiku-5-5 | 2 | 845 | 4 | 15,570 | 6 |
| machine:npm run typecheck | claude-haiku-5-5 | 2 | 646 | 4 | 15,556 | 15 |
| machine:npm test -w @quy-hang/ui-lint | claude-haiku-5-5 | 2 | 537 | 4 | 15,576 | 23 |
| capture:provenance | claude-sonnet-5-5 | 2 | 338 | 4 | 14,215 | 6 |


wall: 208s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| machine | 7 | 8,590 | 108,948 | 158 | 02:22:38 | 02:25:17 |
| review | 3 | 6,031 | 173,103 | 35 | 02:22:38 | 02:23:14 |
| triage | 1 | 1,138 | 14,415 | 11 | 02:25:19 | 02:25:29 |
| capture | 1 | 338 | 14,215 | 6 | 02:25:32 | 02:25:38 |
| synthesize | 1 | 4,408 | 27,276 | 27 | 02:25:40 | 02:26:07 |

- **claude-sonnet-5-5**: 3 agent · 6 calls · out 5,884 · in 12 · cache_read 55,906 · cache_create 63,072
- **claude-opus-5-5**: 3 agent · 12 calls · out 6,031 · in 24 · cache_read 173,103 · cache_create 66,635
- **claude-haiku-5-5**: 7 agent · 14 calls · out 8,590 · in 28 · cache_read 108,948 · cache_create 90,517

