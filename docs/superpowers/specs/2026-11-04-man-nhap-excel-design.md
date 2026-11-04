# Màn Nhập Excel (hàng man-nhap-excel, 65b) — thiết kế

Ngày 04/11. Ô cơ hội: `_acceptance/man-nhap-excel/opportunity.md` (Cổng Đáng: build, chủ kho 04/11). Đứng trên hàng 65a
`nhap-excel-xem-truoc-ghi` (đường ghi lần nhập, gộp PR #105) và hàng 64 `nhap-loi-tat-dinh` (lõi nhập tất định).
Nguồn: `docs/architecture/nhap-du-lieu.md` §1, §2, §6, §9, §10; `docs/design/vo-va-ia.md` §2 dòng Nhập Excel; ADR-0011.

## 1. Việc

Đầu chủ (hay Trưởng nhóm nhập hộ đầu chủ) chọn một tệp bảng hàng cũ trên máy. Màn đọc tệp **trong trình duyệt**, ghép
cột vào trường của căn, cho thấy từng ô sẽ ghi gì (giữ nguyên · máy sửa · cần người · chặn), cho sửa ô và bỏ dòng, gửi
bản xem thử lên máy chủ để biết từng dòng sẽ thành gì (căn mới · cập nhật · tin bổ sung · bỏ, kèm lý do), rồi bấm ghi.
Con số trên nút ghi là con số máy chủ trả ở bản xem thử của đúng các dòng ấy.

## 2. Luồng dữ liệu

```
tệp (máy người nhập) ─ exceljs / parseCsv ─▶ Grid ─ readTable ─▶ Table ─ classifyColumns ─▶ lớp cột
                                                       │
                       planFromDictionary ─▶ kế hoạch ─┤◀─ người đổi đích cột (validatePlan mỗi lần đổi)
                                                       ▼
                         applyPlan(table, plan, {today, catalog từ GET /api/v1/catalog}) ─▶ dấu từng ô
                                                       │◀─ người sửa ô (đổi giá trị thô) · bỏ dòng
                                                       ▼
   POST /api/v1/imports (tên tệp, băm SHA-256, trang tính, tiêu đề, kế hoạch, toà + mã căn mọi dòng)
   POST /imports/{id}/rows dryRun:true  — từng gói ≤ 200 dòng ─▶ hành động + lý do từng dòng, đếm bốn số
   POST /imports/{id}/rows dryRun:false — từng gói, tuần tự ─▶ kết quả (gửi lại gói lỗi mạng trả đúng kết quả cũ)
```

- Tệp gốc không lên máy chủ. Thứ lên máy chủ đúng như hàng 65a đã khai: kế hoạch (máy chủ từ chối kế hoạch mang dữ liệu
  cá nhân), tiêu đề, toà + mã căn, rồi ô thô của dòng khi gửi gói — cùng đường mà máy chủ áp lại kế hoạch.
- Lõi chạy ở trình duyệt là **cùng mã** `@quy-hang/core/import` mà máy chủ chạy; màn không có luật riêng.
- Đọc xlsx: `exceljs` (G-4), nạp lười (chỉ khi người chọn tệp xlsx) để không nặng các màn khác. Tệp nhiều trang tính
  → chọn trang tính (trường `sheet` của API). csv: `decodeText` + `parseCsv` của lõi.
- Băm SHA-256 của tệp bằng `crypto.subtle` — máy chủ chỉ nhận băm.

## 3. Năm bước (khuôn solution-crm-6, bố cục «Luồng nhiều bước» của ADR-0024)

1. **Tải tệp** — kéo thả hay chọn; xlsx hoặc csv; trang tính; Trưởng nhóm chọn đầu chủ giữ căn (Hỏi-2).
2. **Ghép cột** — mỗi cột: tiêu đề, giá trị mẫu (cột lớp nguồn hiện hình dạng, không hiện giá trị), lớp cột, đích
   (trường chuẩn theo `FIELD_LABEL` · giữ làm ghi chú · bỏ có lý do). Lỗi `validatePlan` hiện ngay dưới cột, nút Tiếp
   khoá tới khi hết lỗi.
3. **Xem trước** — lưới data-grid: mỗi ô mang dấu và lý do («máy sửa: 3,2 tỷ → 3200000000»); lọc «cần người · chặn»;
   sửa ô tại chỗ (đổi giá trị thô rồi áp lại kế hoạch cho dòng ấy); bỏ dòng. Đếm theo dấu ở đầu lưới.
4. **Trùng** — máy gửi bản xem thử mọi gói; bảng từng dòng: hành động + lý do (`LY_DO_DONG_NHAP`); đếm bốn số. Bỏ thêm
   dòng ở đây thì gửi lại bản xem thử.
5. **Tóm tắt** — «Ghi N căn mới, cập nhật M, tin bổ sung K, bỏ J»; bấm ghi → tiến độ theo gói → kết quả + lối về Bảng hàng.

## 4. Quyền và thiết bị

- Lối vào đã có: nút «Nhập Excel» của menu Tạo hiện cho Đầu chủ và Trưởng nhóm (`packages/core/src/navigation.ts`). Màn
  kiểm cùng `navigationFor(roles).actions.includes("import")`; vai khác thấy trạng thái «không có quyền». Máy chủ kiểm lại.
- Điện thoại: menu điện thoại không có Nhập Excel (`MOBILE_ACTIONS`). Mở thẳng địa chỉ trên điện thoại thì bố cục mở ngăn
  toàn màn như mọi «Luồng nhiều bước» (ADR-0024); không thêm lối vào.

## 5. Ngoài phạm vi

Tác tử AI lập kế hoạch (hàng 68–71) · nhớ mẫu nhập của sàn (67) · hoàn tác lần nhập (66) · Google Sheets
(`nhap-du-lieu.md` §10 «sau») · tiếp tục một lần nhập dở sau khi đóng trang · gộp hai dòng trùng trong file (dòng sau bỏ,
như 65a) · .xls (Hỏi-1).

## 6. Đối chiếu ngành

Nguồn: `docs/product/doi-chieu-nganh.md` §11 (tra 03/11, hàng 65a). Cả hai sản phẩm nhập **liên hệ**; nhập bảng hàng
**chưa kiểm**. Khối đích `solution-crm-6` có đúng năm bước tải · ghép · xem trước · trùng · tóm tắt.

| Năng lực | RESO | Follow Up Boss | Lofty | Ta định làm | Ta cứng — họ cấu hình |
| --- | --- | --- | --- | --- | --- |
| Ghép cột | tên trường theo Data Dictionary (`UnitNumber`, `BuildingName`…) | người ghép mỗi lần ([nguồn](https://help.followupboss.com/hc/en-us/articles/4402323033751)) | máy ghép, người soát ([nguồn](https://help.lofty.com/hc/en-us/articles/360001710831)) | máy ghép bằng từ điển, người soát và đổi | không — người đổi được |
| Cột không khớp | — | vào Notes hoặc Custom Field | chưa kiểm | giữ làm ghi chú / bỏ có lý do | không |
| Trùng bản ghi đã có | — | không đổi người giữ, báo Added · Updated · Duplicate | giữ người giữ; **chủ tài khoản chỉnh cách đè** ([nguồn](https://help.lofty.com/hc/en-us/articles/360054872172)) | luật trùng của lõi: người nhập giữ → cập nhật; người khác giữ → tin bổ sung; màn chỉ trình | **có** — Hỏi-4 |
| Cỡ một lần | — | chưa kiểm | 10.000 dòng một lượt | 5.000 dòng, gói 200 | không (giới hạn nền tảng, không phải nghĩa) |

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: menu Tạo › Nhập Excel → chọn tệp → ghép cột (máy ghép sẵn) → xem trước → trùng (máy gửi xem thử) → tóm tắt →
  bấm «Ghi N căn» → kết quả (điểm ra: Bảng hàng)
- Biên: tệp không có dòng nào; tệp nhiều trang tính; mọi dòng bị bỏ (nút ghi khoá, nói vì sao); vai không có quyền;
  Trưởng nhóm chưa chọn đầu chủ; tệp hơn 5.000 dòng (từ chối, nói chia tệp).
- Lỗi & quay lại: tệp hỏng hay sai loại → báo ở bước 1, chọn tệp khác; kế hoạch sai → lỗi dưới cột, sửa đích; mạng lỗi
  khi xem thử hay ghi → báo, «Thử lại» gửi lại đúng gói (máy chủ trả kết quả cũ, không nhân đôi); Lùi về mọi bước trước
  giữ lựa chọn; rời trang giữa chừng → hỏi xác nhận.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Nhập Excel (`/imports/new`) | Đưa căn từ một tệp bảng tính vào Quỹ hàng, thấy trước từng ô và từng dòng sẽ thành gì | menu Tạo / Bảng hàng |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-nhap-chon-tep | Nhập Excel | Ô kéo thả «Kéo tệp .xlsx hay .csv vào đây», giới hạn loại và cỡ | Chọn tệp |
| ST-nhap-dang-doc | Nhập Excel | «Đang đọc tệp…» trong ô tệp | Chờ / Bỏ tệp |
| ST-nhap-tep-loi | Nhập Excel | TrangThai lỗi: «Không đọc được tệp này» + lý do (sai loại, hỏng, .xls) | Chọn tệp khác |
| ST-nhap-tep-rong | Nhập Excel | TrangThai rỗng: «Tệp chưa có dòng nào» | Chọn tệp khác |
| ST-nhap-ghep-loi | Nhập Excel | Lỗi dưới cột («Cột số chủ không ghép được vào …»), Tiếp khoá | Đổi đích cột |
| ST-nhap-xem-truoc | Nhập Excel | Lưới ô có dấu, đếm theo dấu, lọc cần người · chặn | Sửa ô, bỏ dòng, Tiếp |
| ST-nhap-dang-xem-thu | Nhập Excel | «Đang hỏi máy chủ… gói 2/5» | Chờ |
| ST-nhap-trung | Nhập Excel | Bảng từng dòng: hành động + lý do; bốn số | Bỏ dòng, Tiếp |
| ST-nhap-xem-thu-loi | Nhập Excel | TrangThai lỗi + «Thử lại» | Thử lại |
| ST-nhap-khong-gi-de-ghi | Nhập Excel | «Không dòng nào sẽ được ghi» + lý do nhiều nhất, nút ghi khoá | Lùi |
| ST-nhap-dang-ghi | Nhập Excel | Tiến độ theo gói «Đã ghi 200/740» | Chờ |
| ST-nhap-ghi-loi | Nhập Excel | Gói lỗi, gói đã ghi giữ nguyên, «Thử lại gói 3» | Thử lại |
| ST-nhap-xong | Nhập Excel | «Đã ghi N căn mới, cập nhật M, tin bổ sung K, bỏ J» | Mở Bảng hàng |
| ST-nhap-khong-quyen | Nhập Excel | TrangThai báo: «Chỉ Đầu chủ và Trưởng nhóm nhập được» | Về Hôm nay |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Loại tệp: .xlsx, .csv; cỡ tối đa 10 MB; tối đa 5.000 dòng một lần.
- Gói ≤ 200 dòng; xem thử và ghi gửi tuần tự, một gói một lần.
- Nút ghi mang số của bản xem thử; đổi gì sau bản xem thử (sửa ô, bỏ dòng) thì phải xem thử lại trước khi ghi.
- Cột lớp nguồn ở bước ghép chỉ hiện hình dạng («số điện thoại · 10 chữ số»), không hiện giá trị.
- Khổ máy tính; 375px theo bố cục «Luồng nhiều bước» (ngăn toàn màn).

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `solution-crm-6` | dùng (chuyển thể) | Khối đích ở `vo-va-ia.md` §2, đúng năm bước |
| `BoCuc kieu="luong-nhieu-buoc"`, `DauMan`, `TrangThai` | dùng | Hệ bố cục ADR-0024, khuôn trạng thái |
| `data-grid` của ReUI | dùng | Lưới xem trước nhiều dòng (luật `no-raw-table`) |
| Đọc tệp (`exceljs`) | tạo | Lõi không có bộ đọc xlsx (hàng 64 để lại cho màn) |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: wizard
Căn cứ: luồng hiển nhiên — `vo-va-ia.md` §2 đã chốt archetype «Wizard», bố cục «Luồng nhiều bước», khối `solution-crm-6`
năm bước; FUB, Lofty cũng nhập CSV bằng wizard ánh xạ cột (doi-chieu-nganh §11).
### 7. Thẻ việc

| Trường | Giá trị |
|---|---|
| Ai dùng | Đầu chủ; Trưởng nhóm nhập hộ |
| Việc chính | Đưa bảng hàng cũ trong tệp thành căn trong Quỹ hàng mà không ghi sai |
| Tần suất | hiếm |
| Số bản ghi | hàng trăm trở lên |
| Thiết bị | máy tính |
<!-- UX-SPEC-TEMPLATE>>> -->

## 7. Câu hỏi cho chủ kho (Cổng Phạm vi)

- **Hỏi-1 — tệp .xls (Excel đời cũ).** `nhap-du-lieu.md` §10 ghi bản đầu nhận cả .xls; `exceljs` không đọc .xls.
  Khuyến nghị: hàng này nhận .xlsx và .csv; chọn .xls thì báo «Mở bằng Excel → Lưu thành .xlsx». Lối khác: thêm thư viện
  thứ hai đọc .xls (SheetJS) — giá: một phụ thuộc lớn nữa, bản trên npm đã ngưng vá lỗi bảo mật.
- **Hỏi-2 — Trưởng nhóm nhập hộ.** ADR-0011 cho Trưởng nhóm nhập cho đầu chủ; API 65a nhận `agentUserId` từng dòng nhưng
  Trưởng nhóm chưa có chỗ đọc danh sách đầu chủ của sàn (route thành viên chỉ cho quản trị). Khuyến nghị: thêm một route
  đọc «đầu chủ của sàn» (mã người, tên) cho vai nhập, màn cho Trưởng nhóm chọn **một** đầu chủ cho cả tệp. Lối khác: hàng
  này chỉ Đầu chủ nhập cho mình, Trưởng nhóm thấy «sắp có» — giá: Trưởng nhóm chưa nhập hộ được tới hàng sau.
- **Hỏi-3 — lối giao diện.** Trang ba lối (Trong kho · ReUI · Vẽ mới) gửi kèm thẻ. Khuyến nghị: ReUI — chuyển thể
  `solution-crm-6`, khối đích đã chốt ở `vo-va-ia.md`.
- **Hỏi-4 — cách xử dòng trùng hàng đã có (ta cứng, Lofty cho chủ tài khoản chỉnh).** Khuyến nghị: giữ cứng ở hàng này —
  lý do «quyền và an toàn»: không lần nhập nào đè hàng của đầu chủ khác (luật 20, đã chốt ở hàng 65a); màn chỉ trình hành
  động máy chủ trả. Lối khác: cho sàn chọn cách xử trùng ở Cài đặt sàn — giá: thêm một điều khoá thành tham số của sàn và
  một hàng việc cho đường ghi 65a.
