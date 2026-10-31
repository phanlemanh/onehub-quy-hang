# Gõ mã căn ra thuộc tính căn — thiết kế (hàng 9)

Hồ sơ `_acceptance/danh-muc-go-ma-can/` · lộ trình hàng 9 (nền, dãy D, đợt nen-2) · đứng trên hàng 5 (dữ liệu mẫu) và
hàng 8 (lõi hàng). Tham chiếu §1 «gõ mã căn là đủ thông tin», §4 dòng «Danh mục», §11 «Tỉ lệ mã căn tự điền được».

## Việc

Đầu chủ gõ mã căn — viết kiểu nào cũng được, miễn đúng cách đọc mã của dự án — và nhận lại thuộc tính căn từ danh mục:
dự án, toà, tầng, trục, diện tích, số phòng ngủ, hướng, mã căn chuẩn, mã định danh căn (UPI). Mã đọc được mà danh mục
chưa có thì báo «chưa có trong danh mục» và không trả thuộc tính nào. Chuỗi không đọc được theo cách đọc của dự án nào
thì báo «mã không đúng cách đọc của dự án» kèm mẫu mã của từng dự án.

Hàng này dựng **lõi đọc mã** (`packages/core/src/catalog/`) và **một đường đọc API**
(`GET /api/v1/catalog/units/{code}`, `packages/api/src/catalog/`). Chưa có màn: ô «Gõ mã căn» của vỏ ứng dụng nối vào
đường này ở hàng có màn hồ sơ căn.

## Câu hỏi đã trả lời ở vòng này (Hỏi-1, Hỏi-2 — giám sát đợt trả theo khuyến nghị, chủ kho đổi được ở Cổng Phạm vi)

- **Hỏi-1 — dự án dùng thử đầu tiên.** Vòng này chạy trên dự án mẫu có nhãn của hàng 5 («[Mẫu] Dự án căn hộ thử»,
  Toà A/B, 15 tầng × 6 trục, mã kiểu `A-12.06`). Dự án thật chọn khi pháp lý rà xong và nạp danh mục thật. Cách đọc mã là
  dữ liệu theo dự án — thêm dự án là thêm một dòng cách đọc, không đổi mã.
- **Hỏi-2 — danh mục căn lấy từ đâu.** Vòng này chỉ dựng cổng đọc danh mục và chạy trên danh mục mẫu (khuôn
  `CatalogFeed`). Nguồn danh mục thật theo đề xuất Tham chiếu §12 (Excel của sàn thử + phần Invest không đến từ S08);
  bảng danh mục dùng chung và nhận gói Invest là hàng 10 (đang park).

## Câu hỏi chờ chủ kho ở Cổng Phạm vi (từ phản biện context sạch)

- **Hỏi-3 — bản thật phục vụ danh mục mẫu?** Khuyến nghị: có, ở mọi môi trường, tới khi hàng 10 nạp danh mục thật — bản
  thật chỉ có dữ liệu mẫu tới khi pháp lý rà (ADR-0009); hai tuần thử cần danh mục thật nên phải đứng sau hàng 10. Lối
  khác: chỉ bật đường ở môi trường máy và bản xem trước; bản thật trả «chưa có danh mục» — thêm một AC và một cờ.
- **Hỏi-4 — hạng T2 hay T3?** Khuyến nghị: T2 — không đổi trần lớp nào, chỉ khai mười trường ra thuộc lớp `catalog` đã
  có; không bảng, không migration, không kết nối. Lối khác: T3 theo hàng lộ trình — thêm Cổng 1.5 duyệt kế hoạch.

## Phương án

### Lõi (`packages/core/src/catalog/`)

- **Cách đọc mã (`UnitCodeRule`)** — dữ liệu, không phải mã riêng từng dự án: `{ projectKey, example, buildingPattern,
  floorWidth, stackWidth, template }` — `template` là mẫu dựng mã chuẩn, vd `{b}-{f}.{s}` cho dự án mẫu, `{b}-{f}{s}`
  cho dự án mã kiểu `T1-0805`. Một hàm đọc chung:
  1. chuẩn hoá chuỗi gõ: NFKC, bỏ khoảng trắng hai đầu, chữ hoa;
  2. tách `toà · tầng · trục`: toà theo `buildingPattern`; giữa các phần chấp nhận `-`, `.`, `/`, `_`, khoảng trắng hoặc
     không có gì; có dấu phân cách thì tầng và trục được thiếu số 0 đầu (`a 12 6`); viết liền (`A1206`) thì trục đúng
     `stackWidth` chữ số, phần còn lại là tầng;
  3. dựng mã chuẩn theo `template`, tầng đủ `floorWidth`, trục đủ `stackWidth` chữ số (`A-12.06`).
  Bảng cách đọc `UNIT_CODE_RULES` hiện có đúng một dòng cho dự án mẫu. Dự án không có dòng cách đọc thì chỉ khớp đúng mã
  danh mục sau chuẩn hoá (không đoán cách tách).
- **Đối chiếu cách đọc với danh mục (`checkRuleAgainstProject`)** — mọi căn của dự án: mã danh mục đọc được, mã chuẩn đọc
  ra bằng chính mã danh mục, toà/tầng/trục đọc ra khớp toà/tầng/trục danh mục ghi. Trả danh sách lệch; rỗng mới là khớp.
- **Tra (`lookupUnit`)** — vào: chỉ mục danh mục, chuỗi gõ, dự án (tuỳ chọn). Ra một trong bốn:
  `found` (một căn, đủ thuộc tính — trường danh mục trống trả `null`, không đoán từ căn khác) · `not_in_catalog` (mã chuẩn
  đọc được, không căn nào) · `unreadable` (không cách đọc nào đọc được, kèm mẫu mã từng dự án) · `ambiguous` (không chọn
  dự án mà mã khớp căn ở hơn một dự án — trả danh sách ứng viên, không chọn hộ).
- **Trường ra là lớp danh mục** — `UNIT_ATTRIBUTE_FIELDS` khai mười trường ra, mỗi trường thuộc lớp `catalog` (trần
  `external`). Kết quả tra không mang trường nào khác.
- Lõi không phụ thuộc `packages/connect`: kiểu dữ liệu danh mục khai theo cấu trúc, cùng hình với `CatalogFeed`.

### API (`packages/api/src/catalog/`)

- `GET /api/v1/catalog/units/{code}?project=<projectKey>` — đọc, không ghi. Cổng vào như đường hàng: chưa đăng nhập 401
  `unauthenticated`; chưa thuộc sàn 403 `no-company`; nhiều sàn chưa chọn 409 `select-company`; thành viên sàn ở **mọi
  vai** đọc được (danh mục dùng chung, ra ngoài được — Tham chiếu §4; telesales nhập lead cũng cần «gõ mã căn là tự
  điền», §11 «Vào»). `project` không có trong danh mục → 404 `not-found`. Bốn kết cục tra đều là 200 với `status` trong
  thân — chúng là kết quả, không phải lỗi.
- Danh mục: nguồn là gói danh mục mẫu của hàng 5 (`packages/db/seed/mau/du-lieu-mau.json`, khoá `danhMuc`), nạp một lần
  khi dựng đường. Hàm đăng ký nhận danh mục làm tham số (mặc định gói mẫu) để hàng 10 thay bằng bảng dùng chung mà không
  đổi đường. Không bảng, không migration ở hàng này.
- Đăng ký đường: thêm một dòng import và một dòng `registerCatalogRoutes(api, deps)` vào `app.ts` (luật 12 — chỉ thêm
  dòng, yêu cầu D-1 đã duyệt); lõi xuất qua một dòng `export * from "./catalog"` ở `packages/core/src/index.ts`.

### Đường đo — tỉ lệ mã căn tự điền được (Tham chiếu §11)

`packages/api/src/catalog/do-ti-le.ts` (lệnh `node --import tsx …`): hàm đo nhận danh mục, cách đọc và một bảng đáp án
`{ mã gõ, UPI đúng }`; tra từng mã, in số tự điền đúng / tổng (so UPI), số «chưa có» của bộ ngoài danh mục và số điền
đoán (phải 0). Lệnh dựng bảng đáp án từ gói mẫu — 40 hàng theo UPI gói ghi, 7 lead có mã theo toà + mã căn — cộng năm
kiểu viết lại của mỗi mã. Bài kiểm của AC-10 dựng bảng đáp án riêng, không qua hàm đọc mã, rồi gọi cùng hàm đo. Thước
của ngưỡng ở ô cơ hội; đo trên mã thật của hai tuần thử để cho hàng 10.

## Đã loại

- **Bảng danh mục dùng chung trong cơ sở dữ liệu ngay vòng này** — cần migration (ngoài ranh giới dãy, T3) và đụng câu
  «danh mục là bảng không theo sàn» chưa ai chốt; là việc của hàng 10.
- **Đoán thuộc tính khi danh mục thiếu** (lấy diện tích của căn cùng trục tầng khác) — trái ngưỡng «không điền đoán».
- **Gợi ý mã gần đúng («ý bạn là A-12.06?»)** — Later: cần màn để hiện, và dễ thành điền đoán.
- **Chuẩn hoá chung mọi dự án bằng tách theo ranh chữ/số** — `A1206` không tách được thành tầng/trục nếu không biết bề
  rộng trục; cách đọc phải là của dự án.

## Bất biến chạm

(1) cách ly — không bảng mới; đường đọc đi qua `resolveCompany` (đọc dưới luật theo dòng) như mọi đường; danh mục là dữ
liệu dùng chung, không theo sàn. (2) chủ nhà — kết quả tra chỉ mang trường lớp `catalog`; gói mẫu có cả phần chủ nhà
mẫu nhưng đường chỉ nạp khoá `danhMuc`. (3), (4) không chạm.

## Đặc tả UX

Bỏ — hàng này không có màn (ledger: «bỏ đặc-tả-UX»). Ô «Gõ mã căn» đã có ở vỏ ứng dụng; nối vào đường này cùng màn hồ sơ
căn.
