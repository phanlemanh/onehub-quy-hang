### S4 round 1 — wf_19b72da6-690 (19 agent, 50,133 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| review:measurement | claude-opus-5-5 | 7 | 8,428 | 14 | 199,549 | 85 |
| synthesize:report | claude-sonnet-5-5 | 2 | 8,068 | 4 | 25,300 | 42 |
| review:bugs | claude-opus-5-5 | 9 | 7,329 | 18 | 276,560 | 84 |
| review:conventions | claude-opus-5-5 | 6 | 5,115 | 12 | 136,153 | 54 |
| triage | claude-sonnet-5-5 | 2 | 3,079 | 4 | 15,105 | 22 |
| baseline:diffBase | claude-sonnet-5-5 | 2 | 3,052 | 4 | 14,161 | 18 |
| machine:npm run db:migrate && npm run db:test | claude-haiku-5-5 | 2 | 1,989 | 4 | 13,976 | 11 |
| refute:listings.test.ts | claude-sonnet-5-5 | 7 | 1,699 | 14 | 83,590 | 23 |
| machine:npm test -w @quy-hang/ui-lint | claude-haiku-5-5 | 2 | 1,517 | 4 | 13,980 | 8 |
| refute:listing.test.ts | claude-sonnet-5-5 | 6 | 1,444 | 12 | 75,986 | 19 |
| machine:npm test -w @quy-hang/api | claude-haiku-5-5 | 2 | 1,422 | 4 | 13,972 | 68 |
| machine:npm test -w @quy-hang/core | claude-haiku-5-5 | 2 | 1,230 | 4 | 13,972 | 6 |
| refute:listings.test.ts | claude-sonnet-5-5 | 5 | 1,217 | 10 | 54,114 | 14 |
| machine:npm run test:hooks | claude-haiku-5-5 | 2 | 977 | 4 | 13,962 | 9 |
| refute:listings.test.ts | claude-sonnet-5-5 | 4 | 968 | 8 | 40,814 | 11 |
| machine:npm test -w @quy-hang/connect | claude-haiku-5-5 | 2 | 822 | 4 | 13,974 | 5 |
| machine:npm run lint | claude-haiku-5-5 | 2 | 730 | 4 | 13,956 | 7 |
| machine:npm run typecheck | claude-haiku-5-5 | 2 | 695 | 4 | 13,960 | 8 |
| capture:provenance | claude-sonnet-5-5 | 2 | 352 | 4 | 9,624 | 5 |


wall: 204s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 3,052 | 14,161 | 18 | 00:10:49 | 00:11:07 |
| machine | 8 | 9,382 | 111,752 | 112 | 00:10:49 | 00:12:42 |
| review | 3 | 20,872 | 612,262 | 86 | 00:10:49 | 00:12:15 |
| triage | 1 | 3,079 | 15,105 | 22 | 00:12:42 | 00:13:03 |
| refute | 4 | 5,328 | 254,504 | 23 | 00:13:03 | 00:13:26 |
| capture | 1 | 352 | 9,624 | 5 | 00:13:26 | 00:13:31 |
| synthesize | 1 | 8,068 | 25,300 | 42 | 00:13:31 | 00:14:13 |

- **claude-opus-5-5**: 3 agent · 22 calls · out 20,872 · in 44 · cache_read 612,262 · cache_create 146,856
- **claude-sonnet-5-5**: 8 agent · 30 calls · out 19,879 · in 60 · cache_read 318,694 · cache_create 151,738
- **claude-haiku-5-5**: 8 agent · 16 calls · out 9,382 · in 32 · cache_read 111,752 · cache_create 93,451

### S4 round 2 — wf_2867e3d0-66b (18 agent, 29,799 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 2 | 6,011 | 4 | 23,306 | 33 |
| baseline:diffBase | claude-sonnet-5-5 | 2 | 3,343 | 4 | 14,160 | 18 |
| review:measurement | claude-opus-5-5 | 4 | 2,402 | 8 | 53,615 | 38 |
| review:bugs | claude-opus-5-5 | 4 | 2,334 | 10 | 54,362 | 44 |
| review:conventions | claude-opus-5-5 | 3 | 2,083 | 6 | 27,525 | 31 |
| machine:npm run db:migrate && npm run db:test | claude-haiku-5-5 | 2 | 2,025 | 4 | 13,975 | 12 |
| machine:npm test -w @quy-hang/ui-lint | claude-haiku-5-5 | 2 | 1,454 | 4 | 13,979 | 8 |
| machine:npm test -w @quy-hang/core | claude-haiku-5-5 | 2 | 1,297 | 4 | 13,971 | 7 |
| machine:npm test -w @quy-hang/api | claude-haiku-5-5 | 2 | 1,294 | 4 | 10,831 | 68 |
| triage | claude-sonnet-5-5 | 2 | 1,230 | 4 | 13,024 | 11 |
| refute:listings.test.ts | claude-sonnet-5-5 | 2 | 1,065 | 4 | 12,733 | 11 |
| machine:npm test -w @quy-hang/connect | claude-haiku-5-5 | 2 | 1,048 | 4 | 13,973 | 6 |
| machine:npm run test:hooks | claude-haiku-5-5 | 2 | 947 | 4 | 13,961 | 8 |
| machine:npm run lint | claude-haiku-5-5 | 2 | 797 | 4 | 13,955 | 7 |
| refute:listings.test.ts | claude-sonnet-5-5 | 2 | 748 | 4 | 12,783 | 8 |
| machine:npm run typecheck | claude-haiku-5-5 | 2 | 698 | 4 | 13,959 | 8 |
| refute:listings.test.ts | claude-sonnet-5-5 | 3 | 684 | 6 | 25,055 | 8 |
| capture:provenance | claude-sonnet-5-5 | 2 | 339 | 4 | 9,623 | 4 |


wall: 171s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 3,343 | 14,160 | 18 | 00:18:48 | 00:19:07 |
| machine | 8 | 9,560 | 108,604 | 112 | 00:18:48 | 00:20:40 |
| review | 3 | 6,819 | 135,502 | 48 | 00:18:48 | 00:19:36 |
| triage | 1 | 1,230 | 13,024 | 11 | 00:20:40 | 00:20:51 |
| refute | 3 | 2,497 | 50,571 | 12 | 00:20:51 | 00:21:03 |
| capture | 1 | 339 | 9,623 | 4 | 00:21:03 | 00:21:07 |
| synthesize | 1 | 6,011 | 23,306 | 33 | 00:21:07 | 00:21:40 |

- **claude-sonnet-5-5**: 7 agent · 15 calls · out 13,420 · in 30 · cache_read 110,684 · cache_create 128,589
- **claude-opus-5-5**: 3 agent · 11 calls · out 6,819 · in 24 · cache_read 135,502 · cache_create 64,127
- **claude-haiku-5-5**: 8 agent · 16 calls · out 9,560 · in 32 · cache_read 108,604 · cache_create 96,620

