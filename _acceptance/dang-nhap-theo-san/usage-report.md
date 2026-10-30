### S4 round 1 — wf_dc5ecebe-95a (13 agent, 83,660 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| review:measurement | claude-opus-5-5 | 9 | 14,408 | 18 | 318,686 | 147 |
| review:bugs | claude-opus-5-5 | 18 | 14,311 | 36 | 848,204 | 155 |
| ui:E10 | claude-sonnet-5-5 | 44 | 13,365 | 90 | 4,142,464 | 214 |
| review:conventions | claude-opus-5-5 | 19 | 12,369 | 38 | 797,419 | 133 |
| synthesize:report | claude-sonnet-5-5 | 6 | 11,985 | 12 | 207,628 | 77 |
| triage | claude-sonnet-5-5 | 2 | 7,103 | 4 | 18,463 | 47 |
| baseline:diffBase | claude-sonnet-5-5 | 2 | 2,530 | 4 | 13,438 | 15 |
| machine:npm run db:migrate && npm run db:test | claude-haiku-5-5 | 2 | 2,188 | 4 | 13,772 | 9 |
| machine:npm test -w @quy-hang/api | claude-haiku-5-5 | 2 | 1,479 | 4 | 13,768 | 68 |
| machine:npm test -w @quy-hang/core | claude-haiku-5-5 | 2 | 1,365 | 4 | 13,805 | 7 |
| machine:npm run test:hooks | claude-haiku-5-5 | 2 | 1,211 | 4 | 13,795 | 8 |
| machine:npm test -w @quy-hang/connect | claude-haiku-5-5 | 2 | 909 | 4 | 13,807 | 5 |
| capture:provenance | claude-sonnet-5-5 | 2 | 437 | 4 | 9,445 | 5 |


wall: 343s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 2,530 | 13,438 | 15 | 06:02:34 | 06:02:49 |
| machine | 5 | 7,152 | 68,947 | 88 | 06:02:34 | 06:04:02 |
| ui | 1 | 13,365 | 4,142,464 | 214 | 06:02:34 | 06:06:08 |
| review | 3 | 41,088 | 1,964,309 | 156 | 06:02:34 | 06:05:10 |
| triage | 1 | 7,103 | 18,463 | 47 | 06:06:08 | 06:06:55 |
| capture | 1 | 437 | 9,445 | 5 | 06:06:55 | 06:07:00 |
| synthesize | 1 | 11,985 | 207,628 | 77 | 06:07:00 | 06:08:17 |

- **claude-opus-5-5**: 3 agent · 46 calls · out 41,088 · in 92 · cache_read 1,964,309 · cache_create 189,527
- **claude-sonnet-5-5**: 5 agent · 56 calls · out 35,420 · in 114 · cache_read 4,391,438 · cache_create 237,938
- **claude-haiku-5-5**: 5 agent · 10 calls · out 7,152 · in 20 · cache_read 68,947 · cache_create 58,638

### S4 round 2 — wf_1348a28a-f58 (16 agent, 63,010 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| ui:E10 | claude-sonnet-5-5 | 43 | 13,568 | 88 | 4,016,910 | 231 |
| review:conventions | claude-opus-5-5 | 23 | 10,658 | 46 | 869,373 | 120 |
| synthesize:report | claude-sonnet-5-5 | 5 | 9,837 | 10 | 170,622 | 70 |
| review:bugs | claude-opus-5-5 | 13 | 7,725 | 26 | 366,448 | 79 |
| review:measurement | claude-opus-5-5 | 8 | 4,217 | 16 | 214,739 | 45 |
| triage | claude-sonnet-5-5 | 2 | 3,232 | 4 | 13,801 | 25 |
| baseline:diffBase | claude-sonnet-5-5 | 2 | 2,564 | 4 | 13,435 | 16 |
| machine:npm run db:migrate && npm run db:test | claude-haiku-5-5 | 2 | 2,440 | 4 | 13,757 | 10 |
| machine:npm test -w @quy-hang/ui-lint | claude-haiku-5-5 | 2 | 1,698 | 4 | 13,959 | 8 |
| machine:npm test -w @quy-hang/api | claude-haiku-5-5 | 2 | 1,424 | 4 | 10,613 | 67 |
| machine:npm test -w @quy-hang/core | claude-haiku-5-5 | 2 | 1,371 | 4 | 13,887 | 7 |
| machine:npm run test:hooks | claude-haiku-5-5 | 2 | 1,222 | 4 | 13,909 | 9 |
| machine:npm run typecheck | claude-haiku-5-5 | 2 | 922 | 4 | 13,939 | 8 |
| machine:npm test -w @quy-hang/connect | claude-haiku-5-5 | 2 | 915 | 4 | 13,921 | 5 |
| machine:npm run lint | claude-haiku-5-5 | 2 | 784 | 4 | 13,967 | 6 |
| capture:provenance | claude-sonnet-5-5 | 2 | 433 | 4 | 9,795 | 5 |


wall: 331s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 2,564 | 13,435 | 16 | 07:38:55 | 07:39:11 |
| machine | 8 | 10,776 | 107,952 | 110 | 07:38:55 | 07:40:45 |
| ui | 1 | 13,568 | 4,016,910 | 231 | 07:38:55 | 07:42:45 |
| review | 3 | 22,600 | 1,450,560 | 120 | 07:38:55 | 07:40:54 |
| triage | 1 | 3,232 | 13,801 | 25 | 07:42:45 | 07:43:10 |
| capture | 1 | 433 | 9,795 | 5 | 07:43:10 | 07:43:15 |
| synthesize | 1 | 9,837 | 170,622 | 70 | 07:43:15 | 07:44:25 |

- **claude-sonnet-5-5**: 5 agent · 54 calls · out 29,634 · in 110 · cache_read 4,224,563 · cache_create 240,323
- **claude-opus-5-5**: 3 agent · 44 calls · out 22,600 · in 88 · cache_read 1,450,560 · cache_create 140,512
- **claude-haiku-5-5**: 8 agent · 16 calls · out 10,776 · in 32 · cache_read 107,952 · cache_create 96,853

