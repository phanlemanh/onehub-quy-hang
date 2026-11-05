# Thiết kế: va-ho-so-lien-he — vá màn Liên hệ (Ngoài-22 và AC-2 thấp của hàng 103)

Ngày 05/11/2026 · dãy L · hạng T2 · hàng vá (luật đợt 72). Đặt trong hồ sơ vì `docs/**` nằm ngoài vùng của hàng.

## 1. Vì sao

Ở Cổng Bằng chứng hàng 103 (`man-lien-he`), chủ kho chọn «mở hợp đồng mới» cho Ngoài-22: bảng vai trong
`packages/api/test-db/man-lien-he.test.ts` ghi «dùng chung cho ba đường» nhưng chỉ chạy ở tìm theo số (không đếm ô) và mở
số; đường xem hồ sơ chỉ có một ca (Đầu chủ khác → 404). Một lỗi quyền ở đường xem hồ sơ — ví dụ người đã mất vai Đầu chủ
vẫn đọc được hồ sơ chủ nhà mình từng giữ — lọt qua bộ kiểm. Chủ nhà là lớp `source` (bất biến 2).

Cùng lượt chấm 4 của 103 có một phát hiện mức thấp trong hợp đồng (AC-2): `them()` ở
`apps/web/src/app/(app)/contacts/vung.tsx` chỉ xét «còn con trỏ, danh sách đang hiện». Trong 250 ms chờ gõ sau khi đổi bộ
lọc, danh sách cũ vẫn hiện và con trỏ cũ vẫn còn, nên «Xem thêm» gửi con trỏ của bộ lọc cũ kèm bộ lọc mới; kết quả về sau
lượt đọc của bộ lọc mới thì đè danh sách mới bằng danh sách cũ (closure) cộng một trang lạc lọc.

## 2. Cách làm

**Ma trận vai (Ngoài-22).** Tệp kiểm mới `packages/api/test-db/man-lien-he/ma-tran-vai.test.ts` (vùng của hàng — không sửa
tệp kiểm của 103). Một bảng viết trước — bảng kỳ vọng của AC-1 trong `contract.md`: chín người × hai liên hệ chủ nhà
(«giu» của người giữ còn vai, «mat» của người giữ đã mất vai) → đọc được / chặn / vai ngoài màn / 401. Bảng áp cho cả bốn
đường đọc của màn; mỗi ô một assert:

| Ô | Danh sách | Tìm theo số | Xem hồ sơ | Mở số |
|---|---|---|---|---|
| đọc được | có liên hệ | `{contactId}` | 200, đúng liên hệ | số rõ, +1 sự kiện mở số |
| chặn (có vai màn) | không có | `{held, holderName}` | 404, thân bằng thân của mã không có | 404 cùng thân, +0 sự kiện |
| vai ngoài màn | 403 | 403 `listing-agent-required` | 404 cùng thân | 404 cùng thân, +0 sự kiện |
| không cookie | 401 | 401 | 401 | 401, +0 sự kiện |

Bộ đếm ô so với tích kích thước bảng (4 × 9 × 2 = 72); bảng phải có cả ô đọc được lẫn ô chặn ở mỗi liên hệ. Người, lead,
liên hệ dựng qua đường ghi thật của sàn thử (`sanMoi`, `nhap`, `nhip`), vai đổi qua `PATCH /company/members`.

**«Xem thêm» (AC-2).** Luật thuần mới `apps/web/src/app/(app)/contacts/xem-them.ts`: `khoaLoc` (chuỗi tìm đã cắt,
loại, dấu, lượt thử lại) · `conTroXemThem(trang, khoa, dangHien)` chỉ trả con trỏ khi trang cuối thuộc đúng bộ lọc đang
theo · `duocNoi(guiLuc, hienTai)` chỉ nối khi lượt đọc và bộ lọc lúc gửi vẫn là hiện tại. `vung.tsx` giữ trang cuối
kèm khoá bộ lọc (thay con trỏ trần), lấy con trỏ qua `conTroXemThem`, nối qua `duocNoi` vào danh sách hiện tại (dạng hàm
của `setDs`), không vào danh sách trong closure. Bài kiểm `xem-them.test.ts` phát lại kịch bản lỗi trên luật thuần, kèm
luật cũ chạy cùng kịch bản để chứng đó là kịch bản lỗi.

## 3. Không đổi

API, quyền, migration, giao diện nhìn thấy (chữ, khối, bố cục) của màn Liên hệ. Không đổi tệp kiểm và tệp màn của 103 ngoài
`vung.tsx`.

## 4. Lối đã loại

- Sửa bảng `VAI` trong `man-lien-he.test.ts` của 103 — tệp ngoài vùng của hàng; tệp mới phủ đủ ba đường, chú thích cũ của
  103 để lại (ghi ở Out of scope).
- (Phản biện S1 lật lối này) Bỏ lượt nhìn màn vì kẽ hở 250 ms — lượt nhìn màn chặn được mạng (giữ phản hồi «Xem thêm»
  tới sau danh sách mới), nên thứ tự ép được; AC-3 có thêm một lượt nhìn màn có chặn mạng.
- Đặt `setDs({kieu: "dang-tai"})` ngay khi bộ lọc đổi — đổi cách màn hiện trong lúc gõ (nháy trạng thái tải mỗi phím),
  là đổi giao diện ngoài phạm vi hàng vá.
