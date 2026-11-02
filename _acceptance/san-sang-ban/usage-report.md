### S4 round 1 — wf_d386cf28-42d (24 agent, 80,029 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| ui:E8 | claude-sonnet-5-5 | 65 | 24,275 | 132 | 9,370,482 | 272 |
| synthesize:report | claude-sonnet-5-5 | 3 | 6,971 | 6 | 67,208 | 38 |
| review:bugs | claude-opus-5-5 | 12 | 6,468 | 26 | 511,420 | 72 |
| review:conventions | claude-opus-5-5 | 13 | 5,594 | 28 | 435,754 | 63 |
| review:measurement | claude-opus-5-5 | 6 | 5,552 | 12 | 139,500 | 57 |
| triage | claude-sonnet-5-5 | 2 | 4,502 | 4 | 16,755 | 34 |
| baseline:diffBase | claude-sonnet-5-5 | 3 | 4,334 | 6 | 39,852 | 36 |
| machine:npm run db:migrate && npm run db:test | claude-haiku-5-5 | 2 | 2,221 | 4 | 14,820 | 19 |
| machine:npm test -w @quy-hang/web | claude-haiku-5-5 | 2 | 1,927 | 4 | 14,816 | 9 |
| judge:E9:spec-alignment | claude-sonnet-5-5 | 4 | 1,834 | 10 | 65,783 | 16 |
| machine:npm test -w @quy-hang/ui-lint | claude-haiku-5-5 | 2 | 1,811 | 4 | 14,824 | 20 |
| judge:E9:operational-feasibility | claude-sonnet-5-5 | 3 | 1,798 | 6 | 43,798 | 15 |
| machine:npm test -w @quy-hang/core | claude-haiku-5-5 | 2 | 1,713 | 4 | 11,676 | 9 |
| refute:san-sang-ban.db-test.mts | claude-sonnet-5-5 | 5 | 1,640 | 10 | 64,064 | 19 |
| judge:E9:domain-correctness | claude-sonnet-5-5 | 2 | 1,554 | 4 | 11,605 | 12 |
| refute:san-sang.test.ts | claude-sonnet-5-5 | 4 | 1,282 | 8 | 41,652 | 16 |
| machine:npm run lint | claude-haiku-5-5 | 2 | 1,081 | 4 | 14,821 | 11 |
| machine:npm run test:hooks | claude-haiku-5-5 | 2 | 1,052 | 4 | 14,806 | 9 |
| machine:npm test -w @quy-hang/connect | claude-haiku-5-5 | 2 | 1,032 | 4 | 14,818 | 7 |
| machine:npm run test:db -w @quy-hang/web | claude-haiku-5-5 | 2 | 921 | 4 | 14,822 | 8 |
| refute:lenh.test.ts | claude-sonnet-5-5 | 3 | 758 | 6 | 28,820 | 10 |
| machine:npm run typecheck | claude-haiku-5-5 | 2 | 708 | 4 | 14,825 | 12 |
| machine:npm test -w @quy-hang/api | claude-haiku-5-5 | 2 | 665 | 4 | 14,816 | 66 |
| capture:provenance | claude-sonnet-5-5 | 2 | 336 | 4 | 10,491 | 7 |


wall: 372s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 4,334 | 39,852 | 36 | 16:14:29 | 16:15:05 |
| machine | 10 | 13,131 | 145,044 | 134 | 16:14:29 | 16:16:44 |
| ui | 1 | 24,275 | 9,370,482 | 272 | 16:14:29 | 16:19:01 |
| judge | 3 | 5,186 | 121,186 | 18 | 16:14:29 | 16:14:47 |
| review | 3 | 17,614 | 1,086,674 | 73 | 16:14:29 | 16:15:42 |
| triage | 1 | 4,502 | 16,755 | 34 | 16:19:01 | 16:19:35 |
| refute | 3 | 3,680 | 134,536 | 21 | 16:19:35 | 16:19:56 |
| capture | 1 | 336 | 10,491 | 7 | 16:19:56 | 16:20:04 |
| synthesize | 1 | 6,971 | 67,208 | 38 | 16:20:04 | 16:20:41 |

- **claude-sonnet-5-5**: 11 agent · 96 calls · out 49,284 · in 196 · cache_read 9,760,510 · cache_create 400,590
- **claude-opus-5-5**: 3 agent · 31 calls · out 17,614 · in 66 · cache_read 1,086,674 · cache_create 165,065
- **claude-haiku-5-5**: 10 agent · 20 calls · out 13,131 · in 40 · cache_read 145,044 · cache_create 132,068

### S4 round 2 — wf_10b8c1e3-a56 (18 agent, 31,949 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 4 | 6,543 | 8 | 102,923 | 44 |
| judge:E9:domain-correctness | claude-sonnet-5-5 | 4 | 2,651 | 10 | 58,257 | 20 |
| review:bugs | claude-opus-5-5 | 9 | 2,372 | 18 | 191,641 | 27 |
| review:conventions | claude-opus-5-5 | 6 | 2,255 | 12 | 102,283 | 24 |
| machine:npm test -w @quy-hang/api | claude-haiku-5-5 | 2 | 2,251 | 4 | 14,833 | 70 |
| machine:npm test -w @quy-hang/web | claude-haiku-5-5 | 2 | 2,129 | 4 | 14,833 | 11 |
| judge:E9:operational-feasibility | claude-sonnet-5-5 | 3 | 1,845 | 8 | 35,978 | 16 |
| judge:E9:spec-alignment | claude-sonnet-5-5 | 3 | 1,779 | 8 | 36,425 | 14 |
| machine:npm test -w @quy-hang/core | claude-haiku-5-5 | 2 | 1,739 | 4 | 11,693 | 8 |
| machine:npm run test:db -w @quy-hang/web | claude-haiku-5-5 | 2 | 1,562 | 4 | 14,839 | 11 |
| review:measurement | claude-opus-5-5 | 5 | 1,354 | 10 | 81,774 | 15 |
| machine:npm run lint | claude-haiku-5-5 | 2 | 1,207 | 4 | 14,817 | 11 |
| machine:npm run test:hooks | claude-haiku-5-5 | 2 | 1,052 | 4 | 14,823 | 10 |
| machine:npm test -w @quy-hang/connect | claude-haiku-5-5 | 2 | 905 | 4 | 14,835 | 6 |
| machine:npm run typecheck | claude-haiku-5-5 | 2 | 731 | 4 | 14,821 | 13 |
| machine:npm test -w @quy-hang/ui-lint | claude-haiku-5-5 | 2 | 666 | 4 | 14,841 | 16 |
| triage | claude-sonnet-5-5 | 2 | 571 | 4 | 12,756 | 6 |
| capture:provenance | claude-sonnet-5-5 | 2 | 337 | 4 | 10,487 | 4 |


wall: 190s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| machine | 9 | 12,242 | 130,335 | 134 | 16:24:21 | 16:26:35 |
| judge | 3 | 6,275 | 130,660 | 20 | 16:24:21 | 16:24:41 |
| review | 3 | 5,981 | 375,698 | 28 | 16:24:21 | 16:24:49 |
| triage | 1 | 571 | 12,756 | 6 | 16:26:35 | 16:26:42 |
| capture | 1 | 337 | 10,487 | 4 | 16:26:42 | 16:26:46 |
| synthesize | 1 | 6,543 | 102,923 | 44 | 16:26:46 | 16:27:31 |

- **claude-sonnet-5-5**: 6 agent · 18 calls · out 13,726 · in 42 · cache_read 256,826 · cache_create 165,577
- **claude-opus-5-5**: 3 agent · 20 calls · out 5,981 · in 40 · cache_read 375,698 · cache_create 75,357
- **claude-haiku-5-5**: 9 agent · 18 calls · out 12,242 · in 36 · cache_read 130,335 · cache_create 118,619

