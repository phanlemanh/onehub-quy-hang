# Ảnh căn ba ngăn — thiết kế (hàng 18, dãy H)

Hàng 18 của lộ trình (`docs/plan/lo-trinh.json`, mã phạm vi D6, màn P0 M5): đầu chủ kéo hoặc dán ảnh từ Zalo trên máy
tính vào hồ sơ căn và xếp vào ba ngăn; ngăn nội bộ không bao giờ ra ngoài, không lưu trên máy. Đứng trên hàng 11 (đầu
chủ giữ căn, lớp nguồn) và hàng 17 (cột hồ sơ căn). Hạng T3: thêm migration 012 (giữ chỗ từ lúc mở đợt) và ADR-0014.

Căn cứ đã chốt: Tham chiếu §2 («đường chính là kéo hoặc dán ảnh từ Zalo trên máy tính vào hồ sơ căn»), §5 dòng Ảnh
(«Ba ngăn: gửi được · tự có từ mã · nội bộ … Ngăn nội bộ không bao giờ ra ngoài, không lưu trên máy»), luật 27–28,
ghi chép 28/10 «Ảnh căn» (`docs/product/ghi-chep/2026-10-28-desktop-app.md`), Kiến trúc §1 («Kho ảnh hai vùng: vùng gửi
được (bản thu nhỏ) và vùng nội bộ (link ngắn hạn, không lưu đệm)»), luật đợt 20.

## 1. Người dùng thấy gì

Cột hồ sơ căn (hàng 17) thêm mục **Ảnh** ngay dưới giá và mức đủ, ba thẻ:

| Thẻ | Ai thấy | Có gì |
|---|---|---|
| **Gửi được** (số ảnh) | Mọi thành viên sàn đọc được hàng | Ảnh thật của đội, bản nhẹ dạng lưới; ảnh bìa đánh dấu; nhãn «Ảnh thật · <ngày>» hoặc «Ảnh mẫu» |
| **Tự có từ mã** | Mọi người | Mặt bằng, ảnh view lấy từ danh mục căn; danh mục chưa mang ảnh thì một dòng nói rõ |
| **Nội bộ** (số ảnh) | Đầu chủ giữ căn và trưởng nhóm | Sổ, hợp đồng, giấy tờ; người khác thấy thẻ khoá «Chỉ người giữ căn và trưởng nhóm xem», không số đếm |

- **Kéo vào**: kéo một hay nhiều ảnh (từ Zalo máy tính, Finder) thả vào mục Ảnh → ảnh vào ngăn của thẻ đang mở. Thả
  thẳng lên tên thẻ «Nội bộ» thì vào ngăn nội bộ.
- **Dán**: Ctrl/⌘+V khi con trỏ không ở ô nhập chữ → ảnh trong bộ nhớ tạm vào ngăn của thẻ đang mở.
- Mỗi ảnh đang tải hiện ô chờ với tên tệp; xong thì thành bản nhẹ. Lỗi một ảnh không chặn ảnh khác.
- Trên mỗi ảnh (menu ba chấm): Đặt làm ảnh bìa · Đánh dấu / bỏ «Ảnh mẫu» · Chuyển sang Nội bộ (hay sang Gửi được) ·
  Xoá khỏi căn (hỏi lại). Kéo để đổi thứ tự trong ngăn Gửi được. Bấm ảnh mở bản lớn.
- Không thêm được khi: không phải JPEG/PNG/WebP · quá 10 MB · mất mạng («Cần mạng để thêm ảnh» — ảnh không được giữ lại
  trên máy để gửi sau, Hỏi-5) · không phải đầu chủ giữ căn hay trưởng nhóm (mục Ảnh không có vùng thả, chỉ xem).

Toàn màn `/units/<mã>` dùng cùng mục Ảnh (cùng `CotHoSo`).

## 2. Mô hình dữ liệu (migration 012, ADR-0014)

Ảnh **thuộc căn** của sàn — `(company_id, building_name, unit_number)` — không thuộc lần rao (luật 27: «Ảnh thuộc căn,
lần rao chọn ảnh»). Việc lần rao chọn ảnh hiện là hàng sau (23, 32).

- `unit_photos` — mỗi ảnh một dòng: `id`, `company_id`, `building_name`, `unit_number`, `compartment`
  (`shareable` | `internal`), `display_order`, `is_cover`, `is_sample`, `taken_at` (ngày chụp, có thể trống),
  `content_type` (`image/jpeg|png|webp`), `byte_size` (≤ 10 485 760), `width`, `height`, `added_by`, `added_at`,
  `removed_at`, `removed_by`. Xoá: byte hai biến thể xoá hẳn, dòng ảnh giữ dấu đã xoá (Hỏi-6). Ràng buộc: ảnh nội bộ không là ảnh bìa, không là «Ảnh mẫu»; một ảnh bìa mỗi căn (chỉ mục
  một phần trên ảnh còn hiệu lực).
- `unit_photo_files` — byte của ảnh: `(company_id, photo_id, variant)`, `variant` ∈ `original` | `thumb`. Luật đọc
  theo dòng như ảnh của nó.
- `unit_photo_events` — sự kiện chỉ thêm (`added`, `compartment_changed`, `reordered`, `cover_set`, `sample_set`,
  `removed`), ai và lúc nào. Chặn sửa, xoá như hai bảng nguồn của hàng 11.
- `app.can_see_unit_internal(building, unit)` — security definer: căn có hàng ở sàn đang làm, và người là trưởng nhóm,
  hoặc là đầu chủ giữ căn (`can_see_source`) của lần rao mới nhất của căn. Cùng luật với `canSeeUnitInternal` ở lõi,
  bộ kiểm cách ly đo cả hai bằng một bảng ca.
- Luật theo dòng (`enable` + `force`): đọc ảnh và byte ngăn `shareable` khi cùng sàn; ngăn `internal` thêm điều kiện
  `can_see_unit_internal`. Thêm, sửa: cùng sàn **và** `can_see_unit_internal` ở mọi ngăn (Hỏi-4). Vai `quy_hang_app`
  không có quyền `delete` trên `unit_photos`; byte của ảnh đã xoá bị xoá hẳn khỏi `unit_photo_files` trong cùng lệnh
  (Hỏi-6). Trưởng nhóm là mọi trưởng nhóm của sàn, như `can_see_source` của hàng 11; căn chưa có lần rao thì chỉ trưởng
  nhóm thấy ngăn nội bộ.

### Nơi giữ byte (Hỏi-1)

Khuyến nghị: **giữ byte trong Postgres** của dự án Quỹ hàng (bảng `unit_photo_files`), sau một giao diện `KhoAnh`
(`ghi`, `doc`) ở API để đổi sang Supabase Storage khi số ảnh lớn. Vì sao: không thêm dịch vụ, không khoá mới, không có
link công khai nào tồn tại; ngăn nội bộ được chặn bằng chính luật theo dòng của cơ sở dữ liệu (bất biến 2 — chặn ở lõi
và kho dữ liệu, không ở giao diện), và bộ kiểm cách ly đo được trên Postgres dãy. Giá: dung lượng cơ sở dữ liệu (gói
Free 500 MB; ước 300 KB/ảnh gốc + 40 KB bản nhẹ → khoảng 1 400 ảnh). Lối khác: Supabase Storage kho riêng tư + link ký
ngắn hạn (đúng bảng stack Kiến trúc §3) — cần hai khoá mới ở Vercel, lượt chấm trên máy không chạm được kho thật.

## 3. Đường ảnh đi

1. Trình duyệt nhận tệp (thả, dán), kiểm loại và cỡ ở lõi (`kiemTepAnh`), đọc ngày chụp EXIF của JPEG nếu có
   (`docNgayChup`, mã thuần, không thư viện), vẽ bản nhẹ cạnh dài 480 px bằng canvas (WebP, vắng thì JPEG).
2. Gửi `POST /api/v1/units/photos` (multipart: bản gốc nguyên byte, bản nhẹ, toà, mã căn, ngăn, ngày chụp). API kiểm
   lại loại (byte đầu tệp, không tin phần mở rộng), cỡ, quyền; ghi ảnh + hai byte + sự kiện `added` trong một giao dịch.
3. Danh sách: `GET /api/v1/units/photos?toa=&ma=` trả ảnh người xem được (luật theo dòng lọc), kèm `noiBo: "an"` khi
   người xem không thấy ngăn nội bộ. Ảnh: `GET /api/v1/units/photos/{id}/{thumb|original}` — ngăn nội bộ trả
   `Cache-Control: private, no-store`; ngăn gửi được `private, max-age=300`. Không có đường dẫn công khai.
4. Đổi ngăn, thứ tự, bìa, ảnh mẫu, xoá: `PATCH /api/v1/units/photos/{id}` và `DELETE` (đặt `removed_at`), mỗi lệnh
   một sự kiện.

**Không lưu trên máy**: ảnh và danh sách ảnh không đi qua bộ đồng bộ, không vào IndexedDB, không vào hàng đợi ghi (ghi
trên máy trước là luật của hàng, không của ảnh — ảnh cần mạng). Ngăn nội bộ: byte chỉ ở bộ nhớ trang, trình duyệt
không giữ đệm (no-store). Luật khuôn KH-hs-tren-may của nhóm Hồ sơ căn thêm ngoại lệ có tên cho mục Ảnh.

**Không ra ngoài**: lõi có `anhRaNgoai(anh)` — hàm duy nhất mọi cửa ra (trang khách, gửi ảnh + tin, phát hàng — hàng
sau) dùng để chọn ảnh; nó bỏ mọi ảnh có lớp `source` (ngăn nội bộ ánh xạ lớp `source`, trần `never_leaves_company` của
`data-classes.ts`, không sửa tệp ấy). Ảnh mẫu ra được, kèm nhãn.

## 4. Ngăn «Tự có từ mã»

Danh mục dùng chung (hàng 63, `packages/connect`) hiện chưa mang trường ảnh nào; thêm trường là đổi khuôn của gói
connect (T3, hàng 10). Thẻ «Tự có từ mã» vẫn hiện, đọc ảnh danh mục qua `anhDanhMuc(dongDanhMuc)` — hôm nay luôn rỗng —
và nói «Danh mục chưa có mặt bằng, ảnh view cho căn này». Khi khuôn danh mục có ảnh, chỉ hàm ấy đổi.

## 5. Đối chiếu ngành (luật đợt mới, RESO Media)

| Quỹ hàng | RESO DD 2.0 (resource Media) | Ngành môi giới VN | Lệch |
|---|---|---|---|
| Ảnh căn `unit_photos` | `Media` (MediaKey) | ảnh căn, ảnh sổ | RESO gắn Media vào bản ghi Property (lần rao) qua `ResourceName`/`ResourceRecordKey`; Quỹ hàng gắn vào **căn** theo luật 27 → **Hỏi-2** |
| `display_order` | `Order` | thứ tự ảnh | — |
| `is_cover` | `PreferredPhotoYN` | ảnh bìa | — |
| `content_type` | `MediaType` / `MimeType` | — | — |
| `width`, `height`, `byte_size` | `ImageWidth`, `ImageHeight`, `ImageSizeDescription` | — | — |
| `compartment` gửi được / nội bộ | `Permission` (lookup: Public, Private, Agent Only, Office Only…) | «ảnh gửi khách» / «giấy tờ nội bộ» | Ngăn là trường riêng của Quỹ hàng (ba ngăn có ngăn danh mục); ánh xạ ra Permission khi có cửa ra RESO |
| `is_sample` | — (gần `MediaCategory`) | «ảnh mẫu dự án» | Không có trường RESO tương đương — tên riêng |
| `taken_at` | `MediaModificationTimestamp` (gần, không cùng nghĩa) | «ngày chụp» | Ngày chụp là đặc trưng nghiệp vụ (độ tươi ảnh) — tên riêng |
| ngăn Tự có từ mã | `MediaCategory` = Floor Plan / Photo trên bản ghi danh mục | mặt bằng theo trục, view | Danh mục chưa mang ảnh |

## 6. Ranh giới mã

- `packages/core/src/photos/` — kiểu, `kiemTepAnh`, `docNgayChup`, `nhanAnh`, `sapXep`, `anhRaNgoai`, `anhDanhMuc`,
  `canSeeUnitInternal`; xuất qua `@quy-hang/core/photos` (thêm dòng ở `core/index.ts`).
- `packages/api/src/photos/` — `routes.ts`, `store.ts`, `kho.ts` (giao diện `KhoAnh`, bản Postgres); thêm dòng đăng ký
  ở `app.ts`, mã lỗi ở `errors.ts`.
- `packages/db/migrations/012_anh_can.sql`; ca mới trong `packages/db/tests/isolation.test.mjs`.
- `apps/web/src/app/(app)/units/photos/` — `muc-anh.tsx` (mục Ảnh), `tai-len.ts` (thả, dán, vẽ bản nhẹ, gửi);
  `units/ho-so/cot-ho-so.tsx` thêm một dòng gắn mục.
- `apps/web/src/app/(app)/proto/anh-can-ba-ngan/` — trang bấm được của bước thiết kế, gỡ khi màn thật qua Cổng Bằng chứng.
- `design/patterns/ho-so-can.md` — ngoại lệ KH-hs-tren-may cho mục Ảnh, luật mới KH-hs-anh-noi-bo.
- `docs/adr/0014-kho-anh.md`; Tham chiếu §12 một dòng; `CONTEXT.md` thêm «Ảnh căn», «Ngăn ảnh» (tệp bảo vệ — xin
  `cham-tep`).

## Đặc tả UX

<!-- ux-spec:start -->
### Khuôn IA đã chọn + căn cứ

Mục trong hồ sơ (record detail section) với thẻ con — giữ khối đích `solution-crm-4` của hồ sơ căn (`vo-va-ia.md` §2:
Hồ sơ căn «2, M5 · 17–19, 23»). Lưới ảnh theo ví dụ ReUI `c-sortable-7` (Frame + Sortable, đã cài `sortable`); vùng thả
ghép từ thành phần đã cài (bậc 6) — khối `c-file-upload-8` dùng Card, trái luật một họ khung trong Frame.

### Màn và trạng thái

| Trạng thái | Thấy gì |
|---|---|
| Trống (ngăn Gửi được) | «Kéo ảnh từ Zalo vào đây, hoặc dán bằng ⌘V» + nút «Chọn ảnh» |
| Đang tải | Ô chờ với tên tệp và thanh tiến độ |
| Có ảnh | Lưới bản nhẹ 3 cột (cột hồ sơ) / 5 cột (toàn màn); ảnh bìa có nhãn «Bìa» |
| Lỗi một ảnh | Ô đỏ với lý do («Không phải ảnh», «Ảnh quá 10 MB», «Không gửi được — thử lại»), nút bỏ |
| Mất mạng | Vùng thả tắt, dòng «Cần mạng để thêm ảnh»; ảnh đã thấy vẫn hiện nếu trình duyệt còn bản nhẹ (ngăn gửi được) |
| Không có quyền thêm | Lưới chỉ xem, không vùng thả |
| Ngăn nội bộ bị khoá | Thẻ «Nội bộ» có biểu tượng khoá, nội dung «Chỉ người giữ căn và trưởng nhóm xem» |
| Tự có từ mã, danh mục trống | «Danh mục chưa có mặt bằng, ảnh view cho căn này» |

### Luồng chính

Đầu chủ mở căn trên Bảng hàng → cột hồ sơ → kéo ba ảnh từ Zalo vào mục Ảnh → ba ô chờ → ba bản nhẹ → kéo một ảnh lên
đầu → menu → Đặt làm ảnh bìa → thả ảnh sổ lên thẻ «Nội bộ».
<!-- ux-spec:end -->

## Ngoài phạm vi

Lần rao chọn ảnh hiện (23, 32) · che vùng (19) · gửi ảnh + tin, trang khách (32, 33) · chụp ảnh trên điện thoại, chia
sẻ từ Zalo điện thoại · ảnh danh mục từ Invest (đổi khuôn connect, hàng 10) · xem ảnh khi mất mạng · ảnh tính vào mức đủ
(23) · Supabase Storage (khi Hỏi-1 chọn lối khác, hoặc khi dung lượng vượt — ADR-0014).
