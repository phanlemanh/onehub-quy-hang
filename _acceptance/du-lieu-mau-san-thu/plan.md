# Kế hoạch thi công: dữ liệu mẫu của sàn thử

Hồ sơ `_acceptance/du-lieu-mau-san-thu/` (T3, Cổng Phạm vi duyệt 2026-10-31). Kế hoạch đặt trong hồ sơ, không ở
`docs/superpowers/plans/`, vì ranh giới của hàng chỉ gồm `_acceptance/du-lieu-mau-san-thu/**` và `packages/db/seed/**`.

**Mục tiêu:** một lệnh sinh bộ dữ liệu mẫu tất định và hai file bảng hàng Excel; một lệnh nạp và xoá phần ghi được vào
cơ sở dữ liệu hiện có.

**Kiến trúc:** hàm thuần sinh dữ liệu từ hạt giống → hai bộ chiếu ra hai mẫu file → bộ ghi xlsx tối thiểu → lệnh ghi
tệp vào `packages/db/seed/mau/` → lệnh nạp và xoá trên kết nối chủ. Không phụ thuộc mới (Node 24 chạy thẳng `.ts`
của `packages/connect`; `zlib.crc32` có sẵn).

**Kiểm cả gói:** `node --test "packages/db/seed/*.test.mjs"` (khoá `executors.script.du_lieu_mau`) với
`DATABASE_URL` tới Postgres dãy T (5547; vắng thì bài kiểm lùi về đó như hàng bài thử đồng bộ).

**Luật đo mới:** mỗi ca kiểm đi cùng phá thử trên bản sao trong thư mục tạm, đỏ với thông điệp ghim như `evals.yaml`.

## Task 1 — Bộ sinh dữ liệu

- Files: `packages/db/seed/du-lieu-mau.mjs`, `packages/db/seed/du-lieu-mau.test.mjs` (ca AC-3, AC-4, AC-5 phần dữ liệu)
- Làm: bộ sinh giả ngẫu nhiên tự viết (mulberry32 từ hạt giống); `sinhDuLieuMau({ hatGiong })` trả sàn, sáu người,
  danh mục khuôn `CatalogFeed` (2 toà × 15 tầng × 6 trục, mã `A-12.05`), 30 chủ nhà, 40 hàng phủ sáu trạng thái,
  12 lead có hai ca trùng; mọi bản ghi `nhan: "Mẫu"`. Kèm các hàm kiểm thuần `kiemNhan`, `kiemKhuonDanhMuc`,
  `kiemLuatThamChieu` trả danh sách lỗi có tên, để bài kiểm dùng cho cả vật lành lẫn bản sao bị phá.
- Kiểm: `node --test --test-name-pattern "AC-3|AC-4|AC-5" packages/db/seed/du-lieu-mau.test.mjs`
- Phục vụ: E3, E4, E5 · independent: false

## Task 2 — Bộ ghi và đọc xlsx

- Files: `packages/db/seed/xlsx.mjs`, `packages/db/seed/doc-xlsx.py`
- Làm: `ghiXlsx(sheets)` → Buffer zip lưu không nén, giờ DOS cố định, chuỗi nội tuyến (`inlineStr`), số là ô số;
  `docXlsx(buf)` cho mã. Bộ đọc độc lập bằng Python (`zipfile` + `xml.etree`, chạy `python3 -I`) in JSON các dòng —
  bài kiểm E2, E6 đọc qua bộ này, không qua mã của `xlsx.mjs`.
- Kiểm: ca «xlsx đọc lại» — ghi một bảng có chữ có dấu và số lớn, Python đọc ra đúng; phá: cắt một byte ở bản sao →
  Python thoát khác 0.
- Phục vụ: E2, E6 · independent: false

## Task 3 — Hai mẫu file bảng hàng

- Files: `packages/db/seed/mau-file.mjs`, ca AC-6 trong `du-lieu-mau.test.mjs`
- Làm: mẫu A «Sheet đầu chủ» (tiêu đề viết tắt, giá tỷ, `BP`/`KBP`); mẫu B «file đầy đủ» (tiêu đề đủ chữ, giá đồng,
  «Đã gồm phí»/«Chưa gồm phí», cột khác thứ tự). Mỗi mẫu là bảng cột → hàm chiếu từ một hàng; bài kiểm dùng chính
  bảng ấy để so từng ô.
- Kiểm: `node --test --test-name-pattern "AC-6" packages/db/seed/du-lieu-mau.test.mjs`
- Phục vụ: E6 · independent: false

## Task 4 — Lệnh sinh và tệp trong kho

- Files: `packages/db/seed/sinh.mjs`, `packages/db/seed/mau/du-lieu-mau.json`, `mau/mau-a.xlsx`, `mau/mau-b.xlsx`,
  ca AC-1 và AC-2 trong `du-lieu-mau.test.mjs`
- Làm: `sinh.mjs [--ra <thư mục>] [--hat <số>] [--kiem]`; JSON ghi khoá theo thứ tự cố định, kết dòng `\n`. `--kiem`
  so đầu ra sinh lại với tệp trong kho, thoát 1 «lệch tệp trong kho».
- Kiểm: `node --test --test-name-pattern "AC-1|AC-2" packages/db/seed/du-lieu-mau.test.mjs` (AC-2 phần cơ sở dữ liệu
  chờ Task 5)
- Phục vụ: E1, E2 · independent: false

## Task 5 — Lệnh nạp và xoá

- Files: `packages/db/seed/nap.mjs`, ca AC-7, AC-8 và AC-2/AC-3 phần cơ sở dữ liệu trong `du-lieu-mau.test.mjs`
- Làm: `--nap` trong một giao dịch: tạo sàn «[Mẫu] Sàn thử» nếu chưa có, sáu tài khoản `@mau.quy-hang.test`
  (`on conflict do nothing`), thành viên với vai đặt bằng đúng ma trận (ghi đè, không cộng dồn), khu Toà A/B, khu phụ
  trách. `--xoa` trong một giao dịch: xoá sàn tên đúng «[Mẫu] Sàn thử» (dây chuyền thành viên, khu, khu phụ trách), rồi
  xoá tài khoản email kết thúc `@mau.quy-hang.test` không còn thuộc sàn nào. Mọi câu xoá mang một trong hai điều kiện.
  Hàm `napMau(client, duLieu)` / `xoaMau(client)` xuất ra để bài kiểm gọi bản sao bị phá.
- Kiểm: `node --test --test-name-pattern "AC-7|AC-8|AC-2|AC-3" packages/db/seed/du-lieu-mau.test.mjs` trên 5547,
  rồi `npm run db:test` (bộ kiểm cách ly vẫn xanh).
- Phục vụ: E2, E3, E7, E8 · independent: false

## Task 6 — Hoàn tất

- Files: `packages/db/seed/README.md` (cách chạy ba lệnh, nói rõ chỉ chạy trên Postgres của dãy hay máy)
- Kiểm: cả gói + `npm run typecheck && npm run lint` (lint không chạm `.mjs` ngoài cấu hình thì ghi lại)
- Phục vụ: mọi E · independent: false

Thứ tự: 1 → 2 → 3 → 4 → 5 → 6, tuần tự — mỗi task dùng đầu ra của task trước, nên không chạy song song.
