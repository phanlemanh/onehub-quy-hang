### S4 round 1 — wf_bebb1de8-ea7 (17 agent, 33,767 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 2 | 5,228 | 4 | 24,852 | 30 |
| baseline:diffBase | claude-sonnet-5-5 | 3 | 4,253 | 6 | 42,036 | 37 |
| review:bugs | claude-opus-5-5 | 5 | 3,682 | 10 | 95,934 | 38 |
| review:conventions | claude-opus-5-5 | 5 | 3,499 | 10 | 89,617 | 36 |
| review:measurement | claude-opus-5-5 | 4 | 2,700 | 8 | 65,850 | 28 |
| triage | claude-sonnet-5-5 | 2 | 2,465 | 4 | 16,528 | 19 |
| machine:npm test -w @quy-hang/api | claude-haiku-5-5 | 2 | 2,154 | 4 | 16,188 | 11 |
| machine:npm test -w @quy-hang/ui-lint | claude-haiku-5-5 | 2 | 1,854 | 4 | 16,196 | 38 |
| machine:npm run lint | claude-haiku-5-5 | 2 | 1,463 | 4 | 16,172 | 17 |
| machine:node _acceptance/moi-truong-that/thu/kie | claude-haiku-5-5 | 2 | 1,032 | 4 | 16,210 | 7 |
| machine:npm run test:hooks | claude-haiku-5-5 | 2 | 1,014 | 4 | 16,178 | 11 |
| machine:node _acceptance/va-thuoc-ci-ho-so-moi-t | claude-haiku-5-5 | 2 | 960 | 4 | 16,235 | 17 |
| machine:node _acceptance/va-thuoc-ci-ho-so-moi-t | claude-haiku-5-5 | 2 | 927 | 4 | 16,231 | 6 |
| machine:npm test -w @quy-hang/core | claude-haiku-5-5 | 2 | 773 | 4 | 12,999 | 17 |
| machine:npm test -w @quy-hang/connect | claude-haiku-5-5 | 2 | 725 | 4 | 16,190 | 4 |
| machine:npm run typecheck | claude-haiku-5-5 | 2 | 705 | 4 | 16,176 | 20 |
| capture:provenance | claude-sonnet-5-5 | 2 | 333 | 4 | 11,789 | 5 |


wall: 185s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 4,253 | 42,036 | 37 | 07:50:09 | 07:50:46 |
| machine | 10 | 11,607 | 158,775 | 126 | 07:50:09 | 07:52:15 |
| review | 3 | 9,881 | 251,401 | 39 | 07:50:09 | 07:50:48 |
| triage | 1 | 2,465 | 16,528 | 19 | 07:52:17 | 07:52:36 |
| capture | 1 | 333 | 11,789 | 5 | 07:52:37 | 07:52:42 |
| synthesize | 1 | 5,228 | 24,852 | 30 | 07:52:44 | 07:53:13 |

- **claude-sonnet-5-5**: 4 agent · 9 calls · out 12,279 · in 18 · cache_read 95,205 · cache_create 98,014
- **claude-opus-5-5**: 3 agent · 14 calls · out 9,881 · in 28 · cache_read 251,401 · cache_create 86,097
- **claude-haiku-5-5**: 10 agent · 20 calls · out 11,607 · in 40 · cache_read 158,775 · cache_create 141,876

### S4 round 2 — wf_4631bfb5-29b (16 agent, 40,052 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| review:bugs | claude-opus-5-5 | 9 | 6,704 | 18 | 256,406 | 70 |
| review:measurement | claude-opus-5-5 | 11 | 6,349 | 22 | 281,741 | 75 |
| synthesize:report | claude-sonnet-5-5 | 2 | 4,800 | 4 | 23,675 | 27 |
| review:conventions | claude-opus-5-5 | 9 | 4,478 | 18 | 259,086 | 55 |
| baseline:diffBase | claude-sonnet-5-5 | 3 | 3,727 | 6 | 40,593 | 41 |
| triage | claude-sonnet-5-5 | 2 | 2,531 | 4 | 17,199 | 26 |
| machine:npm test -w @quy-hang/api | claude-haiku-5-5 | 2 | 2,162 | 4 | 16,267 | 11 |
| machine:npm test -w @quy-hang/ui-lint | claude-haiku-5-5 | 2 | 1,710 | 4 | 16,275 | 36 |
| machine:npm run lint | claude-haiku-5-5 | 2 | 1,594 | 4 | 16,251 | 17 |
| machine:npm test -w @quy-hang/core | claude-haiku-5-5 | 2 | 1,546 | 4 | 13,078 | 19 |
| machine:node _acceptance/va-thuoc-ci-ho-so-moi-t | claude-haiku-5-5 | 2 | 996 | 4 | 16,310 | 6 |
| machine:npm run test:hooks | claude-haiku-5-5 | 2 | 896 | 4 | 16,257 | 11 |
| machine:npm test -w @quy-hang/connect | claude-haiku-5-5 | 2 | 871 | 4 | 16,269 | 5 |
| machine:node _acceptance/va-thuoc-ci-ho-so-moi-t | claude-haiku-5-5 | 2 | 682 | 4 | 16,314 | 10 |
| machine:npm run typecheck | claude-haiku-5-5 | 2 | 668 | 4 | 16,255 | 15 |
| capture:provenance | claude-sonnet-5-5 | 2 | 338 | 4 | 11,868 | 4 |


wall: 202s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 3,727 | 40,593 | 41 | 08:21:46 | 08:22:27 |
| machine | 9 | 11,125 | 143,276 | 140 | 08:21:46 | 08:24:05 |
| review | 3 | 17,531 | 797,233 | 77 | 08:21:46 | 08:23:02 |
| triage | 1 | 2,531 | 17,199 | 26 | 08:24:07 | 08:24:33 |
| capture | 1 | 338 | 11,868 | 4 | 08:24:35 | 08:24:39 |
| synthesize | 1 | 4,800 | 23,675 | 27 | 08:24:41 | 08:25:08 |

- **claude-opus-5-5**: 3 agent · 29 calls · out 17,531 · in 58 · cache_read 797,233 · cache_create 127,050
- **claude-sonnet-5-5**: 4 agent · 9 calls · out 11,396 · in 18 · cache_read 93,335 · cache_create 96,270
- **claude-haiku-5-5**: 9 agent · 18 calls · out 11,125 · in 36 · cache_read 143,276 · cache_create 129,020

### S4 round 3 — wf_e31feebf-0f5 (16 agent, 35,194 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| review:bugs | claude-opus-5-5 | 7 | 4,805 | 14 | 153,708 | 50 |
| synthesize:report | claude-sonnet-5-5 | 2 | 4,626 | 4 | 26,525 | 26 |
| review:conventions | claude-opus-5-5 | 8 | 4,625 | 16 | 209,719 | 50 |
| baseline:diffBase | claude-sonnet-5-5 | 3 | 3,759 | 6 | 43,993 | 34 |
| review:measurement | claude-opus-5-5 | 4 | 3,334 | 8 | 61,067 | 36 |
| triage | claude-sonnet-5-5 | 2 | 2,601 | 4 | 20,970 | 19 |
| machine:npm test -w @quy-hang/api | claude-haiku-5-5 | 2 | 1,954 | 4 | 16,303 | 11 |
| machine:npm test -w @quy-hang/ui-lint | claude-haiku-5-5 | 2 | 1,847 | 4 | 16,311 | 34 |
| machine:npm run lint | claude-haiku-5-5 | 2 | 1,675 | 4 | 16,287 | 16 |
| machine:npm test -w @quy-hang/core | claude-haiku-5-5 | 2 | 1,546 | 4 | 16,303 | 18 |
| machine:npm run test:hooks | claude-haiku-5-5 | 2 | 954 | 4 | 16,293 | 9 |
| machine:node _acceptance/va-thuoc-ci-ho-so-moi-t | claude-haiku-5-5 | 2 | 904 | 4 | 16,346 | 6 |
| machine:npm test -w @quy-hang/connect | claude-haiku-5-5 | 2 | 853 | 4 | 16,305 | 5 |
| machine:npm run typecheck | claude-haiku-5-5 | 2 | 717 | 4 | 16,291 | 15 |
| machine:node _acceptance/va-thuoc-ci-ho-so-moi-t | claude-haiku-5-5 | 2 | 661 | 4 | 16,350 | 9 |
| capture:provenance | claude-sonnet-5-5 | 2 | 333 | 4 | 14,950 | 5 |


wall: 172s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 3,759 | 43,993 | 34 | 08:26:06 | 08:26:40 |
| machine | 9 | 11,111 | 146,789 | 119 | 08:26:06 | 08:28:05 |
| review | 3 | 12,764 | 424,494 | 50 | 08:26:06 | 08:26:56 |
| triage | 1 | 2,601 | 20,970 | 19 | 08:28:06 | 08:28:25 |
| capture | 1 | 333 | 14,950 | 5 | 08:28:26 | 08:28:31 |
| synthesize | 1 | 4,626 | 26,525 | 26 | 08:28:33 | 08:28:58 |

- **claude-opus-5-5**: 3 agent · 19 calls · out 12,764 · in 38 · cache_read 424,494 · cache_create 101,816
- **claude-sonnet-5-5**: 4 agent · 9 calls · out 11,319 · in 18 · cache_read 106,438 · cache_create 81,356
- **claude-haiku-5-5**: 9 agent · 18 calls · out 11,111 · in 36 · cache_read 146,789 · cache_create 126,147

