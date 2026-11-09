wf_4d2e1579-90f: 16 agent
label                                        model              calls       out        in  cache_read     s
review:bugs                                  claude-opus-5-5        6    19,414        14     241,409   199
review:measurement                           claude-opus-5-5        5    14,462        12     174,043   138
review:conventions                           claude-opus-5-5        5    12,955        12     184,670   143
synthesize:report                            claude-sonnet-5-5      2     4,922         4      23,871    34
baseline:diffBase                            claude-sonnet-5-5      3     3,708         6      42,009    47
machine:export DATABASE_URL=${DATABASE_URL:- claude-haiku-5-5       2     2,137         4      16,997    19
machine:npm test -w @quy-hang/api            claude-haiku-5-5       2     2,118         4      16,856    12
triage                                       claude-sonnet-5-5      2     1,935         4      17,041    18
machine:npm run lint                         claude-haiku-5-5       2     1,598         4      16,840    21
refute:va-moc.test.ts                        claude-sonnet-5-5      2     1,415         4      12,838    15
machine:npm run test:hooks                   claude-haiku-5-5       2       954         4      16,846    14
machine:npm test -w @quy-hang/core           claude-haiku-5-5       2       798         4      16,856    26
machine:npm test -w @quy-hang/ui-lint        claude-haiku-5-5       2       751         4      16,864    66
machine:npm run typecheck                    claude-haiku-5-5       2       658         4      16,844    21
machine:npm test -w @quy-hang/connect        claude-haiku-5-5       2       605         4      13,669     6
capture:provenance                           claude-sonnet-5-5      2       351         4      12,467     8
— wall 290s theo vai trò —
  baseline       1 agent · out     3,708 · wall    47s · 22:38:16 → 22:39:02
  machine        8 agent · out     9,619 · wall   184s · 22:38:16 → 22:41:19
  review         3 agent · out    46,831 · wall   200s · 22:38:16 → 22:41:36
  triage         1 agent · out     1,935 · wall    18s · 22:41:39 → 22:41:58
  refute         1 agent · out     1,415 · wall    15s · 22:42:01 → 22:42:16
  capture        1 agent · out       351 · wall     8s · 22:42:20 → 22:42:28
  synthesize     1 agent · out     4,922 · wall    34s · 22:42:31 → 22:43:05
— tổng theo model —
  claude-opus-5-5: 3 agent · 16 calls · out 46,831 · in 38 · cache_read 600,122 · cache_create 233,866
  claude-sonnet-5-5: 5 agent · 11 calls · out 12,331 · in 22 · cache_read 108,226 · cache_create 119,227
  claude-haiku-5-5: 8 agent · 16 calls · out 9,619 · in 32 · cache_read 131,772 · cache_create 122,960
  TỔNG: 16 agent · 43 calls · out 68,781 · in 92 · cache_read 840,120
