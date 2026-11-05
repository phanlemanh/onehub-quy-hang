# Review findings: va-gui-can-da-go (round 1)

## Trong hợp đồng

- **E4 nói «chạy migrate lần hai không áp 037 lại» nhưng bài thử không chạy migrate lần hai, và phép đếm luôn bằng 1**
  file: `packages/db/tests/isolation.test.mjs:2444`
  severity: medium
  AC: AC-4
  source: conventions
  detail: evals.yaml E4 (và AC-4 ở card-plain) hứa: «chạy migrate lần hai trong cùng ca không áp 037 lại (schema_migrations có đúng một dòng 037)». Ca «gửi căn đã gỡ (037): hàm giữ chữ ký và quyền» không gọi lại migrate.mjs. Nó chỉ đếm `select count(*) from schema_migrations where name like '037_%'` = 1. Trong packages/db/scripts/migrate.mjs:22, `schema_migrations.name` là `primary key`, nên phép đếm này chỉ ra 0 hoặc 1. Nó không bao giờ đỏ khi 037 bị áp lại. Lần áp lại sẽ lỗi ở câu insert trùng khoá chứ không sinh thêm dòng. Vì vậy assert này không chứng minh được điều E4 mô tả: thiếu chiều đỏ cho vế «không áp lại», bằng chứng của AC-4 không khớp vật thật. Vế prosecdef, search_path và quyền vẫn có thực.
  rationale: AC-4 nêu rõ chạy db:migrate hai lần thì lần hai không áp lại; bằng chứng không đo vế này nên AC-4 chưa được chứng minh.

- **E4 says it checks that re-running migrate does not re-apply 037, but the test never runs migrate a second time**
  file: `_acceptance/va-gui-can-da-go/evals.yaml:36`
  severity: low
  AC: AC-4
  source: bugs
  detail: E4's expected text says: «chạy migrate lần hai trong cùng ca không áp 037 lại (schema_migrations có đúng một dòng 037, assert)». The matching test in packages/db/tests/isolation.test.mjs («gửi căn đã gỡ (037): hàm giữ chữ ký và quyền») does not run migrate again. It only runs `select count(*) from schema_migrations where name like '037_%'` once and checks that the count is 1. That count is 1 after the first migrate regardless of whether a second run would skip 037. So the run-twice idempotency claim in AC-4 (and in card-plain.json: «chạy cập nhật hai lần không áp lại») is never actually tested, and E4 can pass while that claim stays unproven. Fix: either run the migrator a second time inside the test and assert the count is still 1, or narrow the wording of E4 and AC-4 to what the test checks. The migration itself has no correctness bug: 037 adds only the `voided` condition to both functions and keeps the signature, security definer, empty search_path, grants and error codes the same as 021 and 031. `listings.voided` is `not null default false`, so `not l.voided` never meets a NULL.
  rationale: Cùng vấn đề vế chạy hai lần của AC-4: lời hứa không được kiểm bằng lần chạy thứ hai.

- **Hình dạng 3 — assert «chuỗi có mặt» trong khi lời hứa là giá trị: search_path chỉ kiểm có khoá, không kiểm rỗng**
  file: `packages/db/tests/isolation.test.mjs:2439`
  severity: medium
  AC: AC-4
  source: measurement
  detail: AC-4 hứa hai hàm giữ `search_path` RỖNG (037 viết `set search_path = ''`). Assert `(r.proconfig ?? []).some((x) => x.startsWith("search_path="))` chỉ kiểm khoá có mặt, nên vẫn qua nếu 037 đổi thành `set search_path = public` hoặc `public, pg_temp`. Đó chính là trường hợp tấn công search_path mà luật này dựng ra để chặn. Lời hứa nói về giá trị (proconfig phải chứa đúng `search_path=""`), còn phép đo chỉ kiểm chuỗi tiền tố có mặt.
  rationale: AC-4 hứa hai hàm giữ search_path rỗng; assert chỉ kiểm khoá có mặt nên không chứng minh được giá trị rỗng.

- **Hình dạng 4 — assertion âm tính không đỏ được: «037 áp đúng một lần» không chạy migrate lần hai và luôn qua nhờ khoá chính**
  file: `packages/db/tests/isolation.test.mjs:2444`
  severity: medium
  AC: AC-4
  source: measurement
  detail: Theo AC-4, chạy `npm run db:migrate` hai lần thì lần hai không áp lại; E4 ghi rõ «chạy migrate lần hai trong cùng ca không áp 037 lại». Ca kiểm không gọi migrate lần nào. Nó chỉ đếm `select count(*) from schema_migrations where name like '037_%'` rồi `assert.equal(n, 1)`. Theo packages/db/scripts/migrate.mjs:22, `schema_migrations.name` là `primary key`, nên số dòng này không bao giờ lớn hơn 1. Như vậy assert không thể đỏ vì chuyện «áp lại», chỉ đỏ khi 037 chưa áp. Phép đo không có chiều đối chứng (không chạy migrate lần hai rồi so trạng thái trước và sau), nên hành vi được hứa không được đo.
  rationale: AC-4 yêu cầu chạy migrate hai lần mà lần hai không áp lại; assert không có chiều đối chứng nên không đo hành vi này.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

Không có mục nào.

## Chưa adversarial-verify (refuter chết)

Không có mục nào.

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
