### S4 round 1 — wf_e6701548-0a1 (19 agent, 67,026 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| review:bugs | claude-opus-5-5 | 22 | 12,286 | 46 | 1,074,062 | 170 |
| review:conventions | claude-opus-5-5 | 11 | 8,934 | 24 | 425,026 | 103 |
| review:measurement | claude-opus-5-5 | 8 | 8,473 | 16 | 227,797 | 120 |
| synthesize:report | claude-sonnet-5-5 | 4 | 7,757 | 8 | 101,521 | 44 |
| triage | claude-sonnet-5-5 | 3 | 5,652 | 6 | 36,648 | 35 |
| baseline:diffBase | claude-sonnet-5-5 | 3 | 4,414 | 6 | 38,332 | 33 |
| judge:E9:domain-correctness | claude-sonnet-5-5 | 4 | 2,521 | 8 | 69,305 | 18 |
| judge:E9:spec-alignment | claude-sonnet-5-5 | 4 | 2,380 | 8 | 78,981 | 18 |
| judge:E9:operational-feasibility | claude-sonnet-5-5 | 4 | 2,296 | 8 | 79,348 | 17 |
| machine:npm test -w @quy-hang/core | claude-haiku-5-5 | 2 | 2,231 | 4 | 13,981 | 11 |
| machine:node --test "_acceptance/nang-kit-2-36-0 | claude-haiku-5-5 | 2 | 1,627 | 4 | 14,009 | 23 |
| machine:npm test -w @quy-hang/ui-lint | claude-haiku-5-5 | 2 | 1,581 | 4 | 13,989 | 9 |
| machine:npm test -w @quy-hang/api | claude-haiku-5-5 | 2 | 1,565 | 4 | 13,981 | 68 |
| machine:R="${CLAUDE_PLUGIN_ROOT:-$(node packages | claude-haiku-5-5 | 2 | 1,090 | 4 | 14,053 | 9 |
| machine:npm run test:hooks | claude-haiku-5-5 | 2 | 1,054 | 4 | 10,831 | 13 |
| machine:npm test -w @quy-hang/connect | claude-haiku-5-5 | 2 | 1,035 | 4 | 13,983 | 7 |
| machine:npm run lint | claude-haiku-5-5 | 2 | 994 | 4 | 13,965 | 11 |
| machine:npm run typecheck | claude-haiku-5-5 | 2 | 797 | 4 | 13,969 | 8 |
| capture:provenance | claude-sonnet-5-5 | 2 | 339 | 4 | 9,630 | 4 |


wall: 256s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 4,414 | 38,332 | 33 | 01:39:56 | 01:40:29 |
| machine | 9 | 11,974 | 122,761 | 128 | 01:39:56 | 01:42:04 |
| judge | 3 | 7,197 | 227,634 | 19 | 01:39:56 | 01:40:15 |
| review | 3 | 29,693 | 1,726,885 | 172 | 01:39:56 | 01:42:48 |
| triage | 1 | 5,652 | 36,648 | 35 | 01:42:48 | 01:43:23 |
| capture | 1 | 339 | 9,630 | 4 | 01:43:23 | 01:43:27 |
| synthesize | 1 | 7,757 | 101,521 | 44 | 01:43:27 | 01:44:12 |

- **claude-opus-5-5**: 3 agent · 41 calls · out 29,693 · in 86 · cache_read 1,726,885 · cache_create 171,190
- **claude-sonnet-5-5**: 7 agent · 24 calls · out 25,359 · in 48 · cache_read 413,765 · cache_create 194,573
- **claude-haiku-5-5**: 9 agent · 18 calls · out 11,974 · in 36 · cache_read 122,761 · cache_create 109,361

### S4 round 2 — wf_254e61cc-a5e (19 agent, 56,575 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| review:bugs | claude-opus-5-5 | 16 | 9,965 | 32 | 604,388 | 131 |
| synthesize:report | claude-sonnet-5-5 | 3 | 8,512 | 6 | 57,869 | 56 |
| review:measurement | claude-opus-5-5 | 10 | 8,271 | 20 | 292,731 | 93 |
| baseline:diffBase | claude-sonnet-5-5 | 3 | 4,376 | 6 | 38,674 | 33 |
| review:conventions | claude-opus-5-5 | 7 | 3,629 | 14 | 178,546 | 46 |
| judge:E9:domain-correctness | claude-sonnet-5-5 | 4 | 2,853 | 8 | 71,284 | 18 |
| judge:E9:spec-alignment | claude-sonnet-5-5 | 4 | 2,833 | 8 | 74,004 | 19 |
| judge:E9:operational-feasibility | claude-sonnet-5-5 | 3 | 2,712 | 6 | 43,664 | 18 |
| machine:npm test -w @quy-hang/core | claude-haiku-5-5 | 2 | 2,464 | 4 | 14,179 | 10 |
| machine:npm test -w @quy-hang/ui-lint | claude-haiku-5-5 | 2 | 1,683 | 4 | 14,187 | 9 |
| machine:node --test "_acceptance/nang-kit-2-36-0 | claude-haiku-5-5 | 2 | 1,681 | 4 | 14,207 | 20 |
| machine:npm test -w @quy-hang/api | claude-haiku-5-5 | 2 | 1,617 | 4 | 14,179 | 69 |
| triage | claude-sonnet-5-5 | 2 | 1,041 | 4 | 12,513 | 9 |
| machine:npm run test:hooks | claude-haiku-5-5 | 2 | 1,011 | 4 | 11,029 | 8 |
| machine:npm run lint | claude-haiku-5-5 | 2 | 998 | 4 | 14,163 | 10 |
| machine:R="${CLAUDE_PLUGIN_ROOT:-$(node packages | claude-haiku-5-5 | 2 | 864 | 4 | 14,251 | 6 |
| machine:npm run typecheck | claude-haiku-5-5 | 2 | 832 | 4 | 14,167 | 9 |
| machine:npm test -w @quy-hang/connect | claude-haiku-5-5 | 2 | 815 | 4 | 14,181 | 5 |
| capture:provenance | claude-sonnet-5-5 | 2 | 418 | 4 | 9,828 | 4 |


wall: 202s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 4,376 | 38,674 | 33 | 02:46:12 | 02:46:44 |
| machine | 9 | 11,965 | 124,543 | 120 | 02:46:12 | 02:48:11 |
| judge | 3 | 8,398 | 188,952 | 21 | 02:46:12 | 02:46:32 |
| review | 3 | 21,865 | 1,075,665 | 132 | 02:46:12 | 02:48:24 |
| triage | 1 | 1,041 | 12,513 | 9 | 02:48:24 | 02:48:33 |
| capture | 1 | 418 | 9,828 | 4 | 02:48:33 | 02:48:38 |
| synthesize | 1 | 8,512 | 57,869 | 56 | 02:48:38 | 02:49:34 |

- **claude-opus-5-5**: 3 agent · 33 calls · out 21,865 · in 66 · cache_read 1,075,665 · cache_create 147,465
- **claude-sonnet-5-5**: 7 agent · 21 calls · out 22,745 · in 42 · cache_read 307,836 · cache_create 191,659
- **claude-haiku-5-5**: 9 agent · 18 calls · out 11,965 · in 36 · cache_read 124,543 · cache_create 111,245

