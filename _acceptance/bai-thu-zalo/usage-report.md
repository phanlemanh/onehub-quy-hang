### S4 round 1 — wf_ce56e099-f2f (18 agent, 84,996 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 4 | 16,224 | 8 | 120,114 | 101 |
| review:measurement | claude-opus-5-5 | 6 | 12,241 | 12 | 167,465 | 121 |
| review:bugs | claude-opus-5-5 | 9 | 11,988 | 18 | 355,423 | 122 |
| review:conventions | claude-opus-5-5 | 16 | 9,517 | 32 | 724,547 | 111 |
| ui:E8 | claude-sonnet-5-5 | 17 | 7,821 | 36 | 1,359,628 | 94 |
| triage | claude-sonnet-5-5 | 2 | 7,600 | 4 | 17,703 | 54 |
| judge:E10:domain-correctness | claude-sonnet-5-5 | 2 | 2,921 | 4 | 10,512 | 24 |
| judge:E10:spec-alignment | claude-sonnet-5-5 | 2 | 2,586 | 4 | 14,017 | 21 |
| machine:node --test "_acceptance/bai-thu-zalo/th | claude-haiku-5-5 | 2 | 2,291 | 4 | 13,799 | 10 |
| judge:E10:operational-feasibility | claude-sonnet-5-5 | 2 | 2,203 | 4 | 14,019 | 18 |
| baseline:diffBase | claude-sonnet-5-5 | 2 | 2,120 | 4 | 12,940 | 14 |
| refute:chay.mjs | claude-sonnet-5-5 | 3 | 1,710 | 6 | 24,882 | 22 |
| machine:npm test -w @quy-hang/core | claude-haiku-5-5 | 2 | 1,384 | 4 | 10,633 | 8 |
| machine:npm run test:hooks | claude-haiku-5-5 | 2 | 1,233 | 4 | 13,775 | 10 |
| refute:chay.mjs | claude-sonnet-5-5 | 2 | 1,088 | 4 | 12,611 | 11 |
| machine:npm test -w @quy-hang/connect | claude-haiku-5-5 | 2 | 940 | 4 | 13,775 | 6 |
| machine:npm test -w @quy-hang/api | claude-haiku-5-5 | 2 | 797 | 4 | 13,773 | 5 |
| capture:provenance | claude-sonnet-5-5 | 2 | 332 | 4 | 9,458 | 6 |


wall: 306s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 2,120 | 12,940 | 14 | 06:10:15 | 06:10:30 |
| machine | 5 | 6,645 | 65,755 | 29 | 06:10:15 | 06:10:45 |
| ui | 1 | 7,821 | 1,359,628 | 94 | 06:10:15 | 06:11:49 |
| judge | 3 | 7,710 | 38,548 | 24 | 06:10:15 | 06:10:39 |
| review | 3 | 33,746 | 1,247,435 | 123 | 06:10:15 | 06:12:19 |
| triage | 1 | 7,600 | 17,703 | 54 | 06:12:19 | 06:13:13 |
| refute | 2 | 2,798 | 37,493 | 22 | 06:13:13 | 06:13:35 |
| capture | 1 | 332 | 9,458 | 6 | 06:13:35 | 06:13:41 |
| synthesize | 1 | 16,224 | 120,114 | 101 | 06:13:41 | 06:15:21 |

- **claude-sonnet-5-5**: 10 agent · 38 calls · out 44,605 · in 78 · cache_read 1,595,884 · cache_create 261,642
- **claude-opus-5-5**: 3 agent · 31 calls · out 33,746 · in 62 · cache_read 1,247,435 · cache_create 215,092
- **claude-haiku-5-5**: 5 agent · 10 calls · out 6,645 · in 20 · cache_read 65,755 · cache_create 60,723

### S4 round 2 — wf_b74ab5ec-95a (17 agent, 54,400 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 6 | 11,871 | 12 | 203,027 | 75 |
| ui:E8 | claude-sonnet-5-5 | 13 | 6,489 | 28 | 985,184 | 59 |
| review:conventions | claude-opus-5-5 | 13 | 6,465 | 26 | 371,335 | 73 |
| review:bugs | claude-opus-5-5 | 7 | 5,254 | 14 | 140,913 | 59 |
| review:measurement | claude-opus-5-5 | 8 | 3,969 | 16 | 157,889 | 46 |
| judge:E10:operational-feasibility | claude-sonnet-5-5 | 3 | 3,556 | 8 | 38,605 | 26 |
| judge:E10:spec-alignment | claude-sonnet-5-5 | 2 | 2,893 | 4 | 14,023 | 21 |
| judge:E10:domain-correctness | claude-sonnet-5-5 | 2 | 2,659 | 4 | 14,023 | 19 |
| baseline:diffBase | claude-sonnet-5-5 | 2 | 2,101 | 4 | 16,219 | 13 |
| machine:node --test "_acceptance/bai-thu-zalo/th | claude-haiku-5-5 | 2 | 2,088 | 4 | 13,805 | 9 |
| triage | claude-sonnet-5-5 | 2 | 1,287 | 4 | 16,554 | 12 |
| machine:npm run test:hooks | claude-haiku-5-5 | 2 | 1,208 | 4 | 13,810 | 9 |
| machine:npm test -w @quy-hang/core | claude-haiku-5-5 | 2 | 1,173 | 4 | 13,779 | 7 |
| refute:chay.mjs | claude-sonnet-5-5 | 3 | 1,080 | 6 | 25,154 | 10 |
| machine:npm test -w @quy-hang/api | claude-haiku-5-5 | 2 | 1,025 | 4 | 13,779 | 7 |
| machine:npm test -w @quy-hang/connect | claude-haiku-5-5 | 2 | 947 | 4 | 13,822 | 6 |
| capture:provenance | claude-sonnet-5-5 | 2 | 335 | 4 | 12,617 | 6 |


wall: 176s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 2,101 | 16,219 | 13 | 06:35:09 | 06:35:22 |
| machine | 5 | 6,441 | 68,995 | 28 | 06:35:09 | 06:35:37 |
| ui | 1 | 6,489 | 985,184 | 59 | 06:35:09 | 06:36:08 |
| judge | 3 | 9,108 | 66,651 | 27 | 06:35:09 | 06:35:36 |
| review | 3 | 15,688 | 670,137 | 73 | 06:35:09 | 06:36:22 |
| triage | 1 | 1,287 | 16,554 | 12 | 06:36:22 | 06:36:34 |
| refute | 1 | 1,080 | 25,154 | 10 | 06:36:34 | 06:36:44 |
| capture | 1 | 335 | 12,617 | 6 | 06:36:44 | 06:36:49 |
| synthesize | 1 | 11,871 | 203,027 | 75 | 06:36:49 | 06:38:04 |

- **claude-sonnet-5-5**: 9 agent · 35 calls · out 32,271 · in 74 · cache_read 1,325,406 · cache_create 280,294
- **claude-opus-5-5**: 3 agent · 28 calls · out 15,688 · in 56 · cache_read 670,137 · cache_create 104,325
- **claude-haiku-5-5**: 5 agent · 10 calls · out 6,441 · in 20 · cache_read 68,995 · cache_create 57,843

