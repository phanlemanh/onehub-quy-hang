### S4 round 1 — wf_a9267440-8be (23 agent, 89,724 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| ui:E10 | claude-sonnet-5-5 | 76 | 31,130 | 154 | 10,966,369 | 335 |
| synthesize:report | claude-sonnet-5-5 | 2 | 9,671 | 4 | 33,234 | 52 |
| review:measurement | claude-opus-5-5 | 6 | 7,720 | 12 | 204,706 | 78 |
| review:conventions | claude-opus-5-5 | 9 | 7,192 | 18 | 412,780 | 77 |
| review:bugs | claude-opus-5-5 | 6 | 6,183 | 14 | 153,261 | 64 |
| baseline:diffBase | claude-sonnet-5-5 | 3 | 4,885 | 6 | 42,250 | 111 |
| triage | claude-sonnet-5-5 | 2 | 4,679 | 4 | 18,461 | 31 |
| machine:npm test -w @quy-hang/web | claude-haiku-5-5 | 2 | 2,220 | 4 | 15,200 | 10 |
| machine:npm run db:migrate && npm run db:test | claude-haiku-5-5 | 2 | 2,172 | 4 | 15,204 | 18 |
| machine:npm test -w @quy-hang/core | claude-haiku-5-5 | 2 | 1,909 | 4 | 12,060 | 10 |
| refute:isolation.test.mjs | claude-sonnet-5-5 | 5 | 1,728 | 10 | 69,896 | 20 |
| refute:muc-anh.test.ts | claude-sonnet-5-5 | 5 | 1,511 | 10 | 68,880 | 18 |
| machine:npm test -w @quy-hang/api | claude-haiku-5-5 | 2 | 1,177 | 4 | 15,200 | 67 |
| machine:npm run lint | claude-haiku-5-5 | 2 | 1,056 | 4 | 15,209 | 10 |
| refute:photos.test.ts | claude-sonnet-5-5 | 3 | 1,005 | 6 | 29,555 | 11 |
| machine:npm test -w @quy-hang/connect | claude-haiku-5-5 | 2 | 906 | 4 | 15,227 | 7 |
| machine:npm run test:hooks | claude-haiku-5-5 | 2 | 845 | 4 | 15,215 | 10 |
| refute:tai-len.test.ts | claude-sonnet-5-5 | 3 | 844 | 6 | 32,296 | 10 |
| refute:tai-len.test.ts | claude-sonnet-5-5 | 3 | 702 | 6 | 27,193 | 9 |
| machine:npm run typecheck | claude-haiku-5-5 | 2 | 689 | 4 | 15,213 | 10 |
| refute:photos.test.ts | claude-sonnet-5-5 | 2 | 607 | 4 | 13,906 | 7 |
| machine:npm test -w @quy-hang/ui-lint | claude-haiku-5-5 | 2 | 544 | 4 | 15,233 | 16 |
| capture:provenance | claude-sonnet-5-5 | 2 | 349 | 4 | 10,879 | 4 |


wall: 444s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 4,885 | 42,250 | 111 | 08:42:50 | 08:44:41 |
| machine | 9 | 11,518 | 133,761 | 130 | 08:42:50 | 08:45:00 |
| ui | 1 | 31,130 | 10,966,369 | 335 | 08:42:50 | 08:48:25 |
| review | 3 | 21,095 | 770,747 | 79 | 08:42:50 | 08:44:09 |
| triage | 1 | 4,679 | 18,461 | 32 | 08:48:25 | 08:48:57 |
| refute | 6 | 6,397 | 241,726 | 21 | 08:48:57 | 08:49:18 |
| capture | 1 | 349 | 10,879 | 4 | 08:49:18 | 08:49:23 |
| synthesize | 1 | 9,671 | 33,234 | 52 | 08:49:23 | 08:50:14 |

- **claude-sonnet-5-5**: 11 agent · 106 calls · out 57,111 · in 214 · cache_read 11,312,919 · cache_create 403,253
- **claude-opus-5-5**: 3 agent · 21 calls · out 21,095 · in 44 · cache_read 770,747 · cache_create 179,351
- **claude-haiku-5-5**: 9 agent · 18 calls · out 11,518 · in 36 · cache_read 133,761 · cache_create 122,936

### S4 round 2 — wf_248a720f-423 (17 agent, 60,902 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| ui:E10 | claude-sonnet-5-5 | 43 | 21,991 | 88 | 5,673,325 | 234 |
| synthesize:report | claude-sonnet-5-5 | 4 | 7,119 | 8 | 115,996 | 46 |
| review:conventions | claude-opus-5-5 | 8 | 4,979 | 18 | 227,923 | 53 |
| baseline:diffBase | claude-sonnet-5-5 | 3 | 4,909 | 6 | 41,362 | 109 |
| review:bugs | claude-opus-5-5 | 6 | 4,196 | 12 | 149,581 | 44 |
| review:measurement | claude-opus-5-5 | 4 | 3,308 | 8 | 67,730 | 34 |
| machine:npm run db:migrate && npm run db:test | claude-haiku-5-5 | 2 | 2,222 | 4 | 14,748 | 18 |
| machine:npm test -w @quy-hang/web | claude-haiku-5-5 | 2 | 2,179 | 4 | 14,744 | 10 |
| machine:npm test -w @quy-hang/core | claude-haiku-5-5 | 2 | 1,786 | 4 | 11,604 | 9 |
| triage | claude-sonnet-5-5 | 2 | 1,764 | 4 | 14,713 | 15 |
| machine:npm test -w @quy-hang/ui-lint | claude-haiku-5-5 | 2 | 1,741 | 4 | 14,883 | 19 |
| machine:npm run lint | claude-haiku-5-5 | 2 | 1,075 | 4 | 14,927 | 10 |
| machine:npm run test:hooks | claude-haiku-5-5 | 2 | 931 | 4 | 14,933 | 8 |
| machine:npm test -w @quy-hang/connect | claude-haiku-5-5 | 2 | 856 | 4 | 14,909 | 6 |
| machine:npm test -w @quy-hang/api | claude-haiku-5-5 | 2 | 837 | 4 | 14,744 | 66 |
| machine:npm run typecheck | claude-haiku-5-5 | 2 | 638 | 4 | 14,931 | 10 |
| capture:provenance | claude-sonnet-5-5 | 2 | 371 | 4 | 10,895 | 6 |


wall: 301s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 4,909 | 41,362 | 109 | 08:55:58 | 08:57:48 |
| machine | 9 | 12,265 | 130,423 | 128 | 08:55:58 | 08:58:07 |
| ui | 1 | 21,991 | 5,673,325 | 234 | 08:55:58 | 08:59:52 |
| review | 3 | 12,483 | 445,234 | 53 | 08:55:58 | 08:56:51 |
| triage | 1 | 1,764 | 14,713 | 15 | 08:59:52 | 09:00:07 |
| capture | 1 | 371 | 10,895 | 6 | 09:00:07 | 09:00:13 |
| synthesize | 1 | 7,119 | 115,996 | 46 | 09:00:13 | 09:00:59 |

- **claude-sonnet-5-5**: 5 agent · 54 calls · out 36,154 · in 110 · cache_read 5,856,291 · cache_create 289,005
- **claude-opus-5-5**: 3 agent · 18 calls · out 12,483 · in 38 · cache_read 445,234 · cache_create 119,771
- **claude-haiku-5-5**: 9 agent · 18 calls · out 12,265 · in 36 · cache_read 130,423 · cache_create 119,243

