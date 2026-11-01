### S4 vòng 1 — wf_19898dcf-5d7 (22 agent, 130,902 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| ui:E5b | claude-sonnet-5-5 | 29 | 22,914 | 58 | 3,371,960 | 494 |
| ui:E5 | claude-sonnet-5-5 | 35 | 21,877 | 72 | 4,096,526 | 396 |
| ui:E3 | claude-sonnet-5-5 | 31 | 19,548 | 64 | 3,666,067 | 258 |
| ui:E5c | claude-sonnet-5-5 | 28 | 14,052 | 58 | 3,231,566 | 212 |
| review:bugs | claude-opus-5-5 | 11 | 9,056 | 24 | 423,706 | 106 |
| synthesize:report | claude-sonnet-5-5 | 3 | 7,931 | 6 | 66,374 | 43 |
| review:measurement | claude-opus-5-5 | 10 | 7,196 | 22 | 430,311 | 83 |
| review:conventions | claude-opus-5-5 | 14 | 6,611 | 30 | 546,647 | 81 |
| baseline:diffBase | claude-sonnet-5-5 | 3 | 5,186 | 6 | 42,640 | 41 |
| triage | claude-sonnet-5-5 | 2 | 2,512 | 4 | 15,360 | 18 |
| machine:npm test -w @quy-hang/api | claude-haiku-5-5 | 2 | 2,259 | 4 | 15,005 | 70 |
| machine:npm test -w @quy-hang/web | claude-haiku-5-5 | 2 | 2,032 | 4 | 15,005 | 8 |
| machine:npm test -w @quy-hang/core | claude-haiku-5-5 | 2 | 1,728 | 4 | 11,865 | 8 |
| machine:npm run test:hooks | claude-haiku-5-5 | 3 | 1,386 | 8 | 30,680 | 11 |
| machine:node _acceptance/va-sua-tren-o/thu/ranh- | claude-haiku-5-5 | 2 | 1,131 | 4 | 15,034 | 6 |
| refute:tren-o.tsx | claude-sonnet-5-5 | 3 | 1,120 | 6 | 31,697 | 11 |
| machine:npm run lint | claude-haiku-5-5 | 2 | 1,021 | 4 | 14,989 | 10 |
| machine:npm test -w @quy-hang/connect | claude-haiku-5-5 | 2 | 822 | 4 | 15,030 | 5 |
| machine:R="${CLAUDE_PLUGIN_ROOT:-$(node packages | claude-haiku-5-5 | 2 | 811 | 4 | 15,079 | 6 |
| machine:npm test -w @quy-hang/ui-lint | claude-haiku-5-5 | 2 | 736 | 4 | 15,036 | 16 |
| machine:npm run typecheck | claude-haiku-5-5 | 2 | 643 | 4 | 14,993 | 9 |
| capture:provenance | claude-sonnet-5-5 | 2 | 330 | 4 | 10,677 | 4 |


wall: 573s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 5,186 | 42,640 | 41 | 05:29:04 | 05:29:44 |
| machine | 10 | 12,569 | 162,716 | 129 | 05:29:04 | 05:31:12 |
| ui | 4 | 78,391 | 14,366,119 | 496 | 05:29:04 | 05:37:20 |
| review | 3 | 22,863 | 1,400,664 | 107 | 05:29:04 | 05:30:51 |
| triage | 1 | 2,512 | 15,360 | 18 | 05:37:20 | 05:37:38 |
| refute | 1 | 1,120 | 31,697 | 11 | 05:37:38 | 05:37:49 |
| capture | 1 | 330 | 10,677 | 4 | 05:37:49 | 05:37:53 |
| synthesize | 1 | 7,931 | 66,374 | 43 | 05:37:53 | 05:38:36 |

- **claude-sonnet-5-5**: 9 agent · 136 calls · out 95,470 · in 278 · cache_read 14,532,867 · cache_create 619,755
- **claude-opus-5-5**: 3 agent · 35 calls · out 22,863 · in 76 · cache_read 1,400,664 · cache_create 190,302
- **claude-haiku-5-5**: 10 agent · 21 calls · out 12,569 · in 44 · cache_read 162,716 · cache_create 132,700

### S4 vòng 2 — wf_34b1b99a-812 (19 agent, 129,321 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| ui:E5b | claude-sonnet-5-5 | 40 | 32,703 | 80 | 5,065,399 | 670 |
| ui:E5 | claude-sonnet-5-5 | 34 | 29,761 | 68 | 4,171,390 | 380 |
| ui:E3 | claude-sonnet-5-5 | 32 | 26,999 | 64 | 3,884,505 | 353 |
| ui:E5c | claude-sonnet-5-5 | 39 | 16,108 | 80 | 4,625,892 | 228 |
| synthesize:report | claude-sonnet-5-5 | 4 | 7,191 | 8 | 103,669 | 43 |
| review:bugs | claude-opus-5-5 | 8 | 3,989 | 18 | 204,792 | 46 |
| machine:npm test -w @quy-hang/web | claude-haiku-5-5 | 2 | 2,238 | 4 | 14,904 | 9 |
| machine:npm test -w @quy-hang/ui-lint | claude-haiku-5-5 | 2 | 1,724 | 4 | 14,980 | 19 |
| review:conventions | claude-opus-5-5 | 5 | 1,154 | 10 | 85,701 | 17 |
| machine:npm run lint | claude-haiku-5-5 | 2 | 1,006 | 4 | 14,888 | 9 |
| machine:npm run test:hooks | claude-haiku-5-5 | 2 | 933 | 4 | 14,928 | 9 |
| machine:npm test -w @quy-hang/connect | claude-haiku-5-5 | 2 | 903 | 4 | 14,940 | 5 |
| machine:npm test -w @quy-hang/api | claude-haiku-5-5 | 2 | 900 | 4 | 14,904 | 66 |
| triage | claude-sonnet-5-5 | 2 | 881 | 4 | 13,776 | 8 |
| machine:R="${CLAUDE_PLUGIN_ROOT:-$(node packages | claude-haiku-5-5 | 2 | 781 | 4 | 14,978 | 5 |
| machine:npm test -w @quy-hang/core | claude-haiku-5-5 | 2 | 637 | 4 | 14,904 | 5 |
| machine:npm run typecheck | claude-haiku-5-5 | 2 | 621 | 4 | 11,752 | 9 |
| review:measurement | claude-opus-5-5 | 2 | 464 | 4 | 19,529 | 7 |
| capture:provenance | claude-sonnet-5-5 | 2 | 328 | 4 | 11,328 | 5 |


wall: 726s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| machine | 9 | 9,743 | 131,178 | 123 | 05:39:43 | 05:41:46 |
| ui | 4 | 105,571 | 17,747,186 | 670 | 05:39:43 | 05:50:53 |
| review | 3 | 5,607 | 310,022 | 48 | 05:39:44 | 05:40:32 |
| triage | 1 | 881 | 13,776 | 8 | 05:50:53 | 05:51:01 |
| capture | 1 | 328 | 11,328 | 5 | 05:51:01 | 05:51:06 |
| synthesize | 1 | 7,191 | 103,669 | 43 | 05:51:06 | 05:51:49 |

- **claude-sonnet-5-5**: 7 agent · 153 calls · out 113,971 · in 308 · cache_read 17,875,959 · cache_create 572,098
- **claude-opus-5-5**: 3 agent · 15 calls · out 5,607 · in 32 · cache_read 310,022 · cache_create 84,466
- **claude-haiku-5-5**: 9 agent · 18 calls · out 9,743 · in 36 · cache_read 131,178 · cache_create 118,722

