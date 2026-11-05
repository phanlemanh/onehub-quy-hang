# Thiết kế: mau-nhap-va-bai (hàng 50) — màn Mẫu nhập: Quản trị sàn xem, sửa, xoá mẫu file nhập đã nhớ

Ngày 05/11/2026 · dãy L · hạng T3 (bảng mới) · vùng do giám sát khai (L-33). Đặt trong hồ sơ vì `docs/**` ngoài vùng.

## 1. Vì sao, và phạm vi sau khi tách

Câu giao của hàng 50 gồm ba loại mẫu. Khảo sát mã (05/11): cả ba chưa có chỗ lưu — mẫu file nhập là dẫn xuất chỉ-đọc
từ kế hoạch các lần nhập đã ghi (`packages/api/src/imports/store.ts` `mauCuaSan`, hàng 67); mẫu bảng hàng và mẫu bài là
hằng của lõi (`packages/core/src/export/mau.ts`, `export/bai.ts`, `sharing/tin.ts`). Giám sát duyệt tách (L-33): hàng 50
làm **màn «Mẫu nhập» + mẫu file nhập** — một kết quả trọn; mẫu bảng hàng và mẫu bài theo kênh thành hàng kế. Chủ kho đã ký
Cổng Đáng cho cả ba loại, nên tách là câu hỏi ở Cổng Phạm vi (Hỏi-1).

## 2. Mô hình: bộ nhớ dẫn xuất + sổ sửa của quản trị

Giữ nguyên nguồn học của hàng 67 (mọi lần nhập đã ghi dạy mẫu, ADR-0011 qđ 6). Thêm **bảng chỉ-thêm `import_templates`**
(tên theo sổ điểm số 25, `packages/core/src/config/so.ts`) ghi mỗi lần quản trị sửa hay xoá một cột đã nhớ:

| Cột | Ý |
|---|---|
| `company_id`, `id` | khoá; luật theo dòng `app.current_company_id()` (bất biến 1) |
| `header_key` | khoá tiêu đề của lõi (`khoaMau`) — không ô, không dòng, không tên tệp |
| `action` | `set` · `delete` |
| `target`, `transform`, `value_map` | đích, phép biến đổi, bảng quy đổi mới (chỉ khi `set`) |
| `edited_by`, `edited_at` | người sửa, lúc sửa (mặc định `app.current_user_id()`, `now()`) |

Đọc mẫu = gộp **cột rút từ lần nhập đã ghi** với **dòng sổ sửa**, mỗi khoá giữ mục MỚI NHẤT theo thời điểm: mục mới nhất
là `delete` thì khoá không còn trong mẫu (cột ấy đi từ điển ở lần nhập kế); một lần nhập ghi SAU lần xoá dạy lại khoá ấy
như thường. **Mốc so của lần nhập là lúc MỞ** (`imports.created_at` — lúc kế hoạch được lập, như `mauCuaSan` của hàng 67
đang dùng), không phải lúc ghi: lần nhập mở TRƯỚC một lần sửa/xoá rồi ghi SAU đó vẫn thua bản sửa, vì kế hoạch của nó lập
trên mẫu cũ — bản sửa của quản trị không bị lần nhập đang dở ghi đè im lặng. Hàm thuần mới ở `packages/core/src/import/memory/` (`apSuaMau`) cạnh `gopMau`, `mauCuaSan` gọi nó — nên
`GET /api/v1/imports/templates` (đường màn nhập đọc, hàng 67) trả mẫu đã sửa mà màn nhập không đổi một dòng.

Vì sao không «vật hoá» mẫu thành bảng một-dòng-mỗi-khoá: phải chép logic `khoaMau`/`taoMau` vào migration để nạp lại các
lần nhập đã có, và đổi đường ghi lần nhập (`writeBatch`) — chạm vùng hàng 66/67. Sổ sửa chỉ-thêm không đổi đường ghi, giữ
lịch sử ai sửa gì (sự kiện cấu hình chỉ thêm, ADR-0018), và xoá là một dòng chứ không xoá dữ liệu.

**Ràng buộc ghi** (lõi `kiemSuaMau`, máy chủ chặn trước khi ghi, cơ sở dữ liệu chặn lần nữa): `target` phải là đích hợp lệ
của kế hoạch (`validatePlan` của lõi); `value_map` chỉ nhận ở trường giá trị đóng không thuộc lớp nguồn (`nhoBangQuyDoi`
— cùng luật hàng 67, bộ nhớ không giữ giá trị cột nguồn hay tên người); `delete` không mang đích. Chèn chỉ khi người ghi có
vai `company_admin` (`app.member_has_role`) — chính sách chèn của luật theo dòng. Bảng có thêm ràng buộc: `delete` thì `target`, `transform`, `value_map` rỗng; `set`
thì `target` khác rỗng; `value_map` chỉ khác rỗng khi `target` thuộc năm trường giá trị đóng của lõi (`TRUONG_CACH_GOI`:
`standardStatus`, `feeInclusion`, `directionFaces`, `buildingName`, `subdivisionName` — không trường nào thuộc lớp nguồn),
nên cả SQL chèn thẳng cũng không đưa được bảng quy đổi của cột chủ nhà vào sổ mẫu. Vai `quy_hang_app` chỉ có `select`,
`insert`: không sửa, không xoá dòng sổ.

**Lần nhập đã xong không đổi:** lần nhập lưu trọn kế hoạch vào `imports.plan` lúc mở và `writeBatch` đọc lại chính bản
ấy (khảo sát 05/11), nên sửa mẫu không chạm lần nhập nào đã mở hay đã ghi; hoàn tác lần nhập cũ vẫn theo kế hoạch cũ.

## 3. API (`packages/api/src/templates/**`, đăng ký một dòng ở `app.ts` — xin `cham-tep` L-34)

- `GET /api/v1/company/import-templates` → mỗi khoá: `headerKey`, `target`, `transform?`, `valueMap?`, `nguon`
  (`{kieu:"lan-nhap", importId, at}` hay `{kieu:"sua", editedBy (tên), at}`), sắp theo khoá.
- Khoá tiêu đề đi trong đường dẫn ở dạng mã hoá URL (`encodeURIComponent`); khoá có dấu, khoảng trắng, «/», «(m²)» phải
  sửa và xoá đúng khoá.
- `PUT /api/v1/company/import-templates/{headerKey}` `{target, transform?, valueMap?}` → 200 mẫu mới của khoá; sai luật
  400 `invalid-payload` kèm lý do; khoá không có trong mẫu hiện tại → 404.
- `DELETE /api/v1/company/import-templates/{headerKey}` → 204; khoá không có → 404.
- Chưa đăng nhập 401; vai khác `company_admin` 403 `admin-required` (cùng lối `settings/routes.ts`).

## 4. Không đổi

Đường ghi lần nhập, hoàn tác, màn nhập Excel (chỉ đọc mẫu qua đường cũ), từ điển giá trị của sàn (hàng 45/70), mẫu bảng
hàng và mẫu bài (hàng kế), nhãn mục «Mẫu nhập» ở cột Cài đặt (`cai-dat.ts` đã có).

## Đặc tả UX

### 1. Luồng

- Suôn sẻ: Cài đặt › Sàn [Tên] › Mẫu nhập → bảng các cột đã nhớ (tiêu đề → trường, phép biến đổi, quy đổi, nguồn) →
  «Sửa» một dòng mở hộp sửa (chọn trường, phép biến đổi, quy đổi khi trường giá trị đóng) → Lưu → dòng hiện bản mới, nguồn
  «Sửa bởi [Tên] · dd/mm» (điểm ra: cùng màn).
- Xoá: «Xoá» một dòng → hộp xác nhận «Lần nhập sau, cột “[tiêu đề]” sẽ ghép lại từ đầu» → dòng biến mất.
- Biên: sàn chưa có lần nhập nào → trạng thái trống; người không quản trị mở `/settings/templates` → về Cá nhân kèm câu
  báo «Mục này chỉ quản trị sàn mở được» (lối `chanMucSan`).
- Lỗi & quay lại: tải lỗi → khối lỗi + «Thử lại»; lưu bị từ chối (400) → hộp giữ mở, hiện lý do dưới ô; lưu lỗi mạng →
  hộp giữ mở, «Chưa lưu được — thử lại».

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Mẫu nhập (`/settings/templates`) | Xem và chỉnh cách sàn ghép các cột đã gặp khi nhập Excel | Cột Cài đặt nhóm Sàn / cùng màn |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-mau-dang-tai | Mẫu nhập | dòng khung xương trong bảng | chờ |
| ST-mau-trong | Mẫu nhập | «Chưa có mẫu nào — mẫu tự nhớ sau lần nhập Excel đầu tiên của sàn.» | mở Nhập Excel (đầu chủ, trưởng nhóm làm) |
| ST-mau-loi | Mẫu nhập | «Chưa tải được mẫu — thử lại» + nút Thử lại | Thử lại |
| ST-mau-khong-quyen | Cá nhân | câu báo «Mục này chỉ quản trị sàn mở được» | ở Cá nhân |
| ST-mau-luu-loi | Hộp sửa | lý do dưới ô (400) hay «Chưa lưu được — thử lại» | sửa ô / thử lại |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Ô «Quy đổi» chỉ hiện khi trường đích là trường giá trị đóng (Trạng thái, Điều kiện phí, Hướng, Toà, Dự án); đổi đích
  sang trường khác thì quy đổi bị bỏ, hộp nói rõ trước khi lưu.
- Chỉ máy tính (nhập Excel là việc máy tính, Tham chiếu dòng 264); khổ hẹp hiện bảng cuộn trong khung, không cuộn trang ngang.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `MucCaiDat` (khuôn cai-dat-san) | dùng | khuôn bắt buộc của mọi mục Cài đặt sàn |
| Bảng (DataGrid đã cài, như màn Người dùng) | dùng | danh sách vài chục dòng có cột |
| Hộp sửa + hộp xác nhận (Dialog / ConfirmDialog đã cài) | dùng | cùng nếp màn Người dùng |
| `TrangThai` | dùng | trạng thái trống, lỗi, không quyền |

Khối ReUI mới (nếu cần) chọn ở S3 khi công cụ ReUI nối lại; khuôn và thành phần đã cài đủ cho bản này.

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: một danh sách cột đã nhớ, sửa từng dòng trong hộp — luồng hiển nhiên, cùng nếp màn Người dùng của nhóm cai-dat-san;
không tra mẫu thị trường.

### 7. Thẻ việc

| Trường | Giá trị |
|---|---|
| Ai dùng | Quản trị sàn |
| Việc chính | Sửa hay xoá cách sàn ghép một cột Excel đã gặp, để lần nhập sau ghép đúng |
| Tần suất | hiếm |
| Số bản ghi | vài chục |
| Thiết bị | máy tính |
