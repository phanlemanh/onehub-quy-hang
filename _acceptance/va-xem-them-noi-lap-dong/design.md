# Thiết kế: va-xem-them-noi-lap-dong — «Xem thêm» không lặp dòng sau khi gõ rồi xoá nhanh ô tìm

Ngày 08/11/2026 · dãy L · hạng T2 · hàng vá, đã quyết (Ngoài-1 của `khung-ho-so-lien-he`, PR #199; sổ
`_acceptance/khung-ho-so-lien-he/decisions.jsonl` d-20261108T024501Z-24). Đặt trong hồ sơ vì `docs/**` nằm ngoài vùng
của hàng.

## 1. Vì sao

Câu giao của hàng: «sau khi bấm «Xem thêm» mà gõ rồi xoá nhanh ô tìm, lần «Xem thêm» kế tiếp nối đúng trang sau — không
hiện lặp dòng của trang trước, con trỏ trang không quay về trang 1 khi ô tìm trở lại như cũ».

Gốc lỗi ở `apps/web/src/app/(app)/contacts/vung.tsx`, hiệu ứng đọc danh sách. Kịch bản (bộ lọc rỗng, gọi là K0):

1. Mở màn: máy chủ trao trang 1 (`dau`, khoá K0, con trỏ c1). Bảng hiện 50 dòng, trang cuối {K0, c1}.
2. Bấm «Xem thêm»: gửi c1, trang 2 về và được nối — bảng 100 dòng, trang cuối {K0, c2}.
3. Gõ «a»: khoá Ka khác khoá bảng đang có (K0) nên hẹn đọc sau 250 ms.
4. Xoá «a» trước 250 ms: khoá trở lại K0, bằng khoá bảng đang có, nên lượt này KHÔNG đọc lại (đúng — bảng vẫn là dữ liệu
   K0). Nhưng nhánh không-đọc gán `trangDung = khoaLuot === dau?.khoa ? dau : null` — tức trang 1 của máy chủ — rồi đặt
   trang cuối về {K0, c1}.
5. Bấm «Xem thêm»: gửi c1 lần nữa, trang 2 về lần hai và được nối (con trỏ trang cuối khớp) — 50 dòng lặp.

Nhánh dự phòng «`khoaLuot === dau?.khoa ? dau`» có để lượt mở màn (trang cuối còn rỗng) nhận con trỏ của trang máy chủ.
Ở mọi lượt sau, nó đặt sai: bảng đang hiện nhiều trang hơn `dau`.

## 2. Cách làm

Luật thuần mới trong `apps/web/src/app/(app)/contacts/xem-them.ts`, cạnh `conTroXemThem` và `duocNoi`:

- `trangTuMayChu(dau)` — trang cuối lúc mở màn: trang máy chủ trao thì {khoá của nó, con trỏ của nó}, không có thì rỗng.
- `trangKhiKhongDoc(hienTai, dauMoi, khoaLuot)` — trang cuối sau một lượt không đọc lại: máy chủ VỪA trao trang mới đúng
  bộ lọc này thì lấy con trỏ của trang ấy (bảng vừa được thay bằng trang ấy); không thì GIỮ trang cuối đang có. Không bao
  giờ quay về trang máy chủ cũ.

`vung.tsx`: trang cuối và con trỏ trang cuối đã nối khởi đầu bằng `trangTuMayChu(dau)` (thay cho nhánh dự phòng); nhánh
không-đọc dùng `trangKhiKhongDoc`. Con trỏ «Xem thêm» vẫn lấy qua `conTroXemThem`, trang về vẫn chỉ nối khi `duocNoi`.
Chữ, khối, bố cục và mọi đường đọc khác của màn không đổi.

Mọi chỗ đặt trang cuối sau lúc khởi đầu (nhánh không đọc lại, nhánh đọc lại sau 250 ms, `them()`) đi qua một hàm
`datTrang` đổi cùng lúc trạng thái trang cuối, bản ref của nó (để hiệu ứng đọc trang cuối hiện tại, không lấy từ closure) và
`tiepHienTai` — ba chỗ giữ con trỏ không lệch nhau.

Bài kiểm `xem-them.test.ts` thêm một bộ phát lại hiệu ứng đọc và «Xem thêm» dựng trên luật thật của màn (`khoaLoc`,
`canDocLan`, `conTroXemThem`, `duocNoi`, `trangTuMayChu`) và nhận trang máy chủ mới theo đối tượng như `vung.tsx`; luật nhánh
không đọc lại thay được, để chạy cả luật cũ trên cùng kịch bản. Ca: gõ-xoá rồi «Xem thêm» (110 dòng, không trùng, đúng thứ
tự; luật cũ lặp 50) · hai lần «Xem thêm» liền (bốn trang, 160 dòng) · gõ-xoá trong lúc trang đang về · vẽ lại cùng trang máy
chủ và trang máy chủ mới · bảng ca của `trangKhiKhongDoc`. Bộ phát lại là mô hình viết tay của hiệu ứng; quan hệ giữa nó và
`vung.tsx` (cách tính `dauMoi`, thay bảng cùng lượt) do eval đọc E3 soi trên mã thật, và lượt nhìn màn E6 chứng trên màn chạy.

Gõ-xoá trong lúc một trang «Xem thêm» đang về: hai lượt đọc mới làm trang ấy bị bỏ khi về (luật lượt đọc của
`va-ho-so-lien-he`, giữ nguyên) — trang cuối vẫn là trang trước, lần bấm kế gửi lại cùng con trỏ và nối trang ấy một lần.
Không lặp dòng; người dùng bấm thêm một lần.

## 3. Không đổi

API, quyền, migration, chữ và bố cục màn Liên hệ; luật «đổi bộ lọc trong 250 ms» và «bấm hai lần trước khi trang về» của
`va-ho-so-lien-he` (năm ca cũ của `xem-them.test.ts` phải còn xanh).

## 4. Lối đã loại

- Luôn đọc lại khi ô tìm trở về như cũ (bỏ tối ưu «bảng đã đúng bộ lọc») — bảng nhảy về trang 1, mất các trang người dùng
  đã mở và tốn một lượt đọc; câu giao đòi lần «Xem thêm» kế nối đúng trang sau, tức giữ các trang đã mở.
- Chỉ bỏ nhánh dự phòng mà không khởi đầu trang cuối từ trang máy chủ — lượt mở màn mất con trỏ, «Xem thêm» không bấm được
  ở lần mở đầu tiên.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: mở Liên hệ → «Xem thêm» (trang 2 nối) → gõ rồi xoá ô tìm trong 250 ms → «Xem thêm» (trang 3 nối) (điểm ra: danh
  sách dài thêm, không dòng lặp)
- Biên: hết trang sau lần nối — nút «Xem thêm» ẩn như cũ; ô tìm gõ chậm hơn 250 ms — bảng đọc lại từ trang 1 như cũ
- Lỗi & quay lại: không đổi so với bản trước (lỗi đọc hiện «Thử lại» của danh sách)

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Liên hệ (`/contacts`) | tìm và mở một người liên hệ | nhà Liên hệ ở vỏ / hồ sơ người cạnh bảng |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-lienhe-them-sau-go-xoa | Liên hệ | danh sách đủ các trang đã mở, mỗi người một dòng, nút «Xem thêm» khi còn trang | bấm «Xem thêm» nối trang kế |
| ST-lienhe-het-trang | Liên hệ | danh sách đủ, không nút «Xem thêm» | chọn người |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Gõ ô tìm chờ 250 ms rồi đọc (không đổi); gõ rồi trả ô tìm về như cũ trong 250 ms thì không đọc lại và giữ các trang đã mở.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `DanhSachLienHe`, `KhungLienHe`, `HoSoNguoi` | dùng | không đổi — hàng vá chỉ sửa luật con trỏ |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: giữ nguyên khuôn của màn Liên hệ (`design/patterns/lien-he.md`); hàng vá không đổi giao diện, không cần tra mẫu.
### 7. Thẻ việc

| Trường | Giá trị |
|---|---|
| Ai dùng | Đầu chủ, Trưởng nhóm |
| Việc chính | tìm một người liên hệ trong danh sách dài và mở hồ sơ |
| Tần suất | mỗi ngày nhiều lần |
| Số bản ghi | hàng trăm trở lên |
| Thiết bị | cả hai |
<!-- UX-SPEC-TEMPLATE>>> -->
