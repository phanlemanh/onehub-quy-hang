# Review findings: trang-nhom-moi-gioi (round 2)

## Trong hợp đồng

- **Hình dạng 4 — phép kiểm âm-tính không thể đỏ: «048 áp đúng một lần» đếm trên cột khoá chính**
  AC: AC-9
  file: `packages/db/tests/isolation.test.mjs:3626`
  severity: medium
  source: measurement
  detail: `select count(*) from schema_migrations where name like '048_%'` rồi `assert.equal(n, 1, "048 áp đúng một lần")`. Trong packages/db/scripts/migrate.mjs:22, cột `schema_migrations.name` là `primary key`, nên đã áp 048 thì số đếm luôn bằng 1, dù bộ migrate có chạy lại 048 hay không. Bài không chạy migrate lần hai và không có đối chứng chứng minh phép kiểm có thể đỏ. E9 trong evals.yaml hứa «lệnh migrate chạy hai lần không áp lại 048», nhưng bài này không đo điều đó.
  rationale: AC-9 đòi chạy migrate hai lần mà lần hai không áp lại, và phép kiểm này không đo được điều đó.

- **Hình dạng 4 — phép kiểm âm-tính trùng lặp, không ghim giá trị: E4 hứa trong JSON không còn '40', bài chỉ grep tên khoá**
  AC: AC-4
  file: `packages/core/src/sharing/trang-moi-gioi.test.ts:52`
  severity: medium
  source: measurement
  detail: `assert.ok(!/"mucChia"/.test(JSON.stringify(an)))` chỉ lặp lại phép `Object.hasOwn(an, "mucChia") === false` ở dòng ngay trên. Nếu lõi để giá trị 40 lọt ra dưới khoá khác (ví dụ `commissionSplitPct`, hoặc trong `dau`/`dong`), cả hai phép kiểm vẫn xanh. E4 trong evals.yaml hứa «JSON.stringify của thân không chứa '40' ở khoá nào liên quan mức chia», nhưng không phép kiểm nào tìm chính giá trị ấy. Đối chứng dương (`than(false,40).mucChia === 40`) chỉ cho thấy khoá có mặt, không cho thấy bộ dò giá trị bắt được chỗ lọt.
  rationale: AC-4 đòi thân trả không còn mức chia khi sàn ẩn, mà phép kiểm chỉ dò tên khoá chứ không dò giá trị.

- **Hình dạng 4 — chỉ kiểm khác nhau, không ghim giá trị mong đợi: ô giá của căn đã bán**
  AC: AC-1
  file: `packages/core/src/sharing/trang-moi-gioi.test.ts:70`
  severity: medium
  source: measurement
  detail: Lời hứa của ca (comment ngay trên) là «căn đã bán … ô giá là ô trống của bảng», nhưng bài chỉ có `assert.notEqual(than.dong[0][iGia], than.dong[2][iGia])`. Nếu ô giá của căn đã bán là một giá sai hay giá cũ, miễn khác ô của căn 0, bài vẫn xanh. Bài không ghim `than.dong[2][iGia]` bằng ô trống mong đợi ("—" hoặc ""). Phép kiểm đối chứng `banBan.listPrice === undefined` chỉ chạy trên banRaNgoai, không chạm vào ô của bảng.
  rationale: AC-1 đòi căn đã bán không có giá theo luật giá ra, mà phép kiểm chỉ so sánh khác nhau chứ không ghim ô trống.

- **Hình dạng 3 — lời hứa là quan hệ với banRaNgoai, bài lại hardcode kết quả theo vị trí**
  AC: AC-1
  file: `packages/api/test-db/trang-nhom-moi-gioi/trang-moi-gioi.test.ts:113`
  severity: low
  source: measurement
  detail: E1 trong evals.yaml hứa «mỗi dòng so khoá giá của căn trong thân với kết quả banRaNgoai của chính căn ấy». Bài lại viết `assert.equal(coGia, i !== 2)`, tức hằng số theo vị trí, không gọi banRaNgoai cho từng căn. Nếu luật giá ra đổi (ví dụ căn đã cọc cũng ẩn giá), bài đỏ hoặc xanh theo bảng viết tay chứ không theo quan hệ đã hứa giữa route và luật ẩn.
  rationale: AC-1 đòi giá theo đúng luật giá ra của banRaNgoai, mà bài so với bảng viết tay theo vị trí.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Branch adds a second copy of the fee-item set, its labels and its default instead of using @quy-hang/core/fees**
  Người dùng thấy gì: Hiện trang môi giới vẫn hiện đúng các khoản phí. Nếu sau này sàn đổi bộ khoản phí hay tên gọi, trang môi giới có thể lệch so với màn Cài đặt phí cho tới khi có người sửa thêm một chỗ.
  Căn cứ: Hôm nay người dùng không thấy gì sai, rủi ro chỉ xuất hiện khi bộ khoản phí đổi, và sửa sau vẫn rẻ nên ghi lại là đủ.
  file: `packages/core/src/sharing/trang-moi-gioi.ts`
  severity: medium
  Đề xuất: known-limits

- **Share-level 'Bao phí' snapshot can contradict the per-price stamp that migration 050 already stores**
  Người dùng thấy gì: Nếu sàn đổi định nghĩa phí sau khi một giá đã được nhập, trang môi giới có thể ghi giá đó đã gồm các khoản mà thực ra lúc tính giá chưa gồm. Môi giới có thể hiểu sai giá đã gồm những phí nào.
  Căn cứ: Có thể làm môi giới bên ngoài hiểu sai giá, nhưng chỉ khi sàn đã đổi định nghĩa phí giữa chừng, và muốn khớp từng giá thì phải làm thành một tính năng riêng.
  file: `packages/api/src/contacts/prospects.ts`
  severity: medium
  Đề xuất: new-contract

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
