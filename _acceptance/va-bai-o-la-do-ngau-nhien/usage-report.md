### S4 round 1 — wf_4c6880ec-b8e (18 agent, 74,038 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| review:measurement | claude-opus-5-5 | 4 | 15,503 | 8 | 102,255 | 150 |
| review:bugs | claude-opus-5-5 | 6 | 15,107 | 14 | 213,762 | 150 |
| review:conventions | claude-opus-5-5 | 6 | 14,495 | 12 | 226,762 | 145 |
| synthesize:report | claude-sonnet-5-5 | 2 | 7,057 | 4 | 27,820 | 38 |
| baseline:diffBase | claude-sonnet-5-5 | 3 | 4,916 | 6 | 44,116 | 43 |
| triage | claude-sonnet-5-5 | 2 | 3,800 | 4 | 18,008 | 26 |
| machine:npm test -w @quy-hang/ui-lint | claude-haiku-5-5 | 2 | 1,816 | 4 | 16,411 | 42 |
| machine:npm test -w @quy-hang/core | claude-haiku-5-5 | 2 | 1,628 | 4 | 13,098 | 21 |
| machine:npm run lint | claude-haiku-5-5 | 2 | 1,615 | 4 | 16,387 | 19 |
| machine:npm test -w @quy-hang/connect | claude-haiku-5-5 | 2 | 1,449 | 4 | 16,405 | 8 |
| machine:export DATABASE_URL=postgres://postgres: | claude-haiku-5-5 | 2 | 1,269 | 4 | 16,478 | 10 |
| machine:npm run test:hooks | claude-haiku-5-5 | 2 | 1,240 | 4 | 16,393 | 15 |
| machine:node _acceptance/va-bai-o-la-do-ngau-nhi | claude-haiku-5-5 | 2 | 924 | 4 | 16,440 | 17 |
| machine:node _acceptance/va-bai-o-la-do-ngau-nhi | claude-haiku-5-5 | 2 | 884 | 4 | 16,440 | 7 |
| machine:npm test -w @quy-hang/api | claude-haiku-5-5 | 2 | 727 | 4 | 16,403 | 7 |
| machine:node _acceptance/va-bai-o-la-do-ngau-nhi | claude-haiku-5-5 | 2 | 638 | 4 | 16,442 | 76 |
| machine:npm run typecheck | claude-haiku-5-5 | 2 | 627 | 4 | 16,391 | 19 |
| capture:provenance | claude-sonnet-5-5 | 2 | 343 | 4 | 11,891 | 6 |


wall: 229s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 4,916 | 44,116 | 43 | 04:44:24 | 04:45:08 |
| machine | 11 | 12,817 | 177,288 | 144 | 04:44:24 | 04:46:48 |
| review | 3 | 45,105 | 542,779 | 151 | 04:44:25 | 04:46:56 |
| triage | 1 | 3,800 | 18,008 | 26 | 04:46:59 | 04:47:25 |
| capture | 1 | 343 | 11,891 | 6 | 04:47:28 | 04:47:34 |
| synthesize | 1 | 7,057 | 27,820 | 38 | 04:47:36 | 04:48:14 |

- **claude-opus-5-5**: 3 agent · 16 calls · out 45,105 · in 34 · cache_read 542,779 · cache_create 191,339
- **claude-sonnet-5-5**: 4 agent · 9 calls · out 16,116 · in 18 · cache_read 101,835 · cache_create 104,576
- **claude-haiku-5-5**: 11 agent · 22 calls · out 12,817 · in 44 · cache_read 177,288 · cache_create 155,904

### S4 round 2 — wf_27844aec-359 (18 agent, 77,791 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| review:bugs | claude-opus-5-5 | 9 | 19,221 | 20 | 581,269 | 289 |
| review:measurement | claude-opus-5-5 | 5 | 16,676 | 10 | 146,071 | 162 |
| review:conventions | claude-opus-5-5 | 6 | 16,547 | 14 | 274,296 | 170 |
| synthesize:report | claude-sonnet-5-5 | 3 | 6,433 | 6 | 65,544 | 40 |
| baseline:diffBase | claude-sonnet-5-5 | 3 | 4,915 | 6 | 44,091 | 47 |
| triage | claude-sonnet-5-5 | 2 | 3,569 | 4 | 17,272 | 26 |
| machine:npm test -w @quy-hang/core | claude-haiku-5-5 | 2 | 1,601 | 4 | 13,091 | 20 |
| machine:npm run lint | claude-haiku-5-5 | 2 | 1,582 | 4 | 16,380 | 18 |
| machine:export DATABASE_URL=postgres://postgres: | claude-haiku-5-5 | 2 | 1,376 | 4 | 16,471 | 9 |
| machine:node _acceptance/va-bai-o-la-do-ngau-nhi | claude-haiku-5-5 | 2 | 1,062 | 4 | 16,433 | 21 |
| machine:node _acceptance/va-bai-o-la-do-ngau-nhi | claude-haiku-5-5 | 2 | 793 | 4 | 16,433 | 6 |
| machine:npm run test:hooks | claude-haiku-5-5 | 2 | 739 | 4 | 16,386 | 12 |
| machine:node _acceptance/va-bai-o-la-do-ngau-nhi | claude-haiku-5-5 | 2 | 732 | 4 | 16,435 | 81 |
| machine:npm test -w @quy-hang/connect | claude-haiku-5-5 | 2 | 596 | 4 | 16,398 | 4 |
| machine:npm run typecheck | claude-haiku-5-5 | 2 | 586 | 4 | 16,384 | 17 |
| machine:npm test -w @quy-hang/ui-lint | claude-haiku-5-5 | 2 | 515 | 4 | 16,404 | 41 |
| machine:npm test -w @quy-hang/api | claude-haiku-5-5 | 2 | 508 | 4 | 16,396 | 6 |
| capture:provenance | claude-sonnet-5-5 | 2 | 340 | 4 | 11,884 | 6 |


wall: 370s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 4,915 | 44,091 | 47 | 09:21:50 | 09:22:37 |
| machine | 11 | 10,090 | 177,211 | 135 | 09:21:50 | 09:24:04 |
| review | 3 | 52,444 | 1,001,636 | 290 | 09:21:50 | 09:26:40 |
| triage | 1 | 3,569 | 17,272 | 26 | 09:26:42 | 09:27:08 |
| capture | 1 | 340 | 11,884 | 7 | 09:27:10 | 09:27:17 |
| synthesize | 1 | 6,433 | 65,544 | 41 | 09:27:19 | 09:27:59 |

- **claude-opus-5-5**: 3 agent · 20 calls · out 52,444 · in 44 · cache_read 1,001,636 · cache_create 252,936
- **claude-sonnet-5-5**: 4 agent · 10 calls · out 15,257 · in 20 · cache_read 138,791 · cache_create 104,840
- **claude-haiku-5-5**: 11 agent · 22 calls · out 10,090 · in 44 · cache_read 177,211 · cache_create 156,386

