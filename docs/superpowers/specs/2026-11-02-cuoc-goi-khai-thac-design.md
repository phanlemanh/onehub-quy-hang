# Chế độ cuộc gọi khai thác (hàng 28) — thiết kế

Hàng 28 của lộ trình, dãy D, mã L5, phác thảo KD1 (Tham chiếu §10, P0). Đứng trên hàng 22 (Hôm nay của đầu chủ) và
hàng 24 (ô nhận lead); hàng 29 (gọi ép giá đợt hai) và 30 (bấm Gọi để điện thoại quay số) đứng trên nó.

**Câu giao:** Đầu chủ mở chế độ cuộc gọi của một lead trên máy tính: thẻ lead so giá với toà, danh sách hỏi chọn bằng
phím, tính giá bao phí ↔ về tay; ghi xong thì mức đủ tự tính lại.

## 1. Bất biến chạm

- **Bất biến 2 (chủ nhà không rời công ty):** màn là nội bộ của sàn, không hiện số chủ nhà, giá đáy hay ảnh sổ — chỉ đọc
  lead qua `GET /api/v1/leads/assigned/{leadId}` (không cột số) và hàng từ kho trên máy (bộ đồng bộ đã chặn khoá nguồn).
- **Bất biến 3 (người bấm gửi):** không có gì gửi đi; hàng 30 lo quay số.
- **Bất biến 1, 4:** không bảng mới, không đường ra ngoài công ty. Không migration.

## 2. Đối chiếu RESO và ngành

Nguồn sản phẩm: [Đối chiếu ngành §10](../../product/doi-chieu-nganh.md#10-chế-độ-cuộc-gọi-kịch-bản-kết-quả-gọi-lý-do-mất).

| Năng lực / đối tượng | RESO | Lofty · KW Command | Ta làm | Ta viết cứng — họ cho cấu hình |
| --- | --- | --- | --- | --- |
| Danh sách hỏi trong cuộc gọi | Không có (RESO mô tả hàng, không mô tả cuộc gọi) | Lofty: kịch bản gọi do người viết, hiện cạnh dialer ([Call Scripts](https://help.lofty.com/hc/en-us/articles/360000306052-Call-Scripts)); KW: stage mang checklist do người, đội đặt ([Pipelines](https://answers.kw.com/hc/en-us/articles/55206011386643-Customize-Your-Opportunity-Pipelines)) | Năm mục của mức đủ (luật 16) | Năm mục giữ cứng — là mẫu số của mức đủ (nghĩa chuẩn để so giữa sàn); lựa chọn trong mục → **Hỏi-2** |
| Tình trạng sử dụng | `OccupantType`: Owner · Tenant · Vacant | chưa kiểm | Chủ ở · Đang cho thuê · Trống, neo ba mã RESO | Bộ lựa chọn → **Hỏi-2** |
| Nội thất | `Furnished`: Furnished · Partially · Unfurnished · Negotiable | chưa kiểm | Đủ đồ · Cơ bản · Thô, neo Furnished · Partially · Unfurnished | Bộ lựa chọn → **Hỏi-2** |
| Pháp lý | Không có (đặc trưng Việt Nam) | chưa kiểm | Có sổ · Đang làm sổ · Hợp đồng mua bán | Bộ lựa chọn → **Hỏi-2** |
| Tài chính (khoản vay trên căn) | `CurrentFinancing` gần nhất, nghĩa khác (cách mua) | chưa kiểm | Không vay · Đang vay | Bộ lựa chọn → **Hỏi-2** |
| Giá chủ báo | `ListPrice` | — | Giá kèm điều kiện phí (luật 7) | — |
| Giá về tay | Không có (gần nhất: bảng «seller net sheet» ngoài RESO) | chưa kiểm | Máy tính hai chiều, ba khoản phí | Ba tỉ lệ → **Hỏi-3** (sàn đặt ở hàng 49) |
| So giá với toà | Không có (CMA nằm ngoài RESO) | chưa kiểm | Cùng toà, cùng số phòng ngủ, quy về tay | Tập căn đem so → **Hỏi-4** |

Chỗ lệch với Tham chiếu: bảng đường dẫn ghi `/units/<mã>/call` — lead chỉ biết toà chưa có mã căn → **Hỏi-1**.

## 3. Thiết kế

### 3.1 Lõi (`packages/core`)

- `pricing/ve-tay.ts` — `TI_LE_BAO_PHI_MAC_DINH` (phần vạn: thuế thu nhập cá nhân 200, lệ phí trước bạ 50, môi giới 100;
  «mặc định của sàn — sẽ vào sổ điểm biến thiên»). `tinhVeTay(gia, dieuKien, tiLe)` → `{ veTay, khoan: [{ma, tiLe, dong}] }`:
  bao phí thì mỗi khoản = làm tròn(giá × tỉ lệ / 10 000), về tay = giá − tổng; không bao phí thì về tay = giá, không khoản
  nào. `giaBaoPhiTuVeTay(veTay, tiLe)` → giá bao phí nhỏ nhất có về tay ≥ số đã cho. Mọi phép tính bằng số nguyên đồng.
- `pricing/so-gia.ts` — `soGiaToa({ can, cacCan, tiLe })`: lọc theo luật Hỏi-4 (hằng `SO_GIA_NAC` = Active, Pending),
  quy từng căn về tay, trả dải `{ thap, giua, cao }` (giữa là trung vị), danh sách dòng xếp theo về tay giảm dần, vị trí
  căn đang gọi `{ veTay, lechPhanTram }` so với giữa. Không trường «gợi ý».
- `listing/danh-sach-hoi.ts` — `DANH_SACH_HOI`: năm mục theo `COMPLETENESS_ITEMS`, mỗi mục nhãn và bộ lựa chọn mặc định
  (Hỏi-2) kèm mã RESO khi có; mục giá đi riêng (chữ giá + điều kiện phí). Một bài kiểm giữ khoá mục trùng đúng
  `COMPLETENESS_ITEMS`.

### 3.2 API (`packages/api/src/today`)

`GET /api/v1/leads/assigned/{leadId}` (mới, cạnh `GET /api/v1/leads/assigned`): một lead giao cho chính người gọi, bất kể
nhóm của bộ đang áp — sau «Đã gọi» lead rời nhóm Lead mới nên danh sách không còn trả nó, mà chế độ cuộc gọi vẫn phải đọc
được. Cùng bản `AssignedLeadView` cộng ba khoá: `listPrice` (số đồng), `feeInclusion`, `listingId` (hồ sơ căn tạo từ lead
qua `lead_listings`, chưa có thì `null`). Lead không giao cho mình, đã bỏ hay đã trả lại → 404; vai không phải Đầu chủ →
403. Dựng từng khoá tường minh, không cột số. Danh sách cũ không đổi.

### 3.3 Màn (`apps/web/src/app/(app)/units/call/`)

- `page.tsx` — `/units/call?lead=<mã>`; chỉ vai Đầu chủ (vai khác → không thấy trang). Khuôn `KhungCuocGoi` (nhóm mới
  `cuoc-goi`, luật 18 của đợt: `design/patterns/cuoc-goi.md` tạo trong vòng).
- Ba cột trên máy tính theo KD1 (lối chốt ở Cổng Phạm vi qua trang ba lối): **thẻ lead** (toà · căn, thuộc tính tự điền
  từ danh mục, chủ nhà muốn — giá kèm điều kiện phí, nhu cầu, nấc, nút «Đã gọi») · **danh sách hỏi** (năm nhóm, mỗi
  nhóm một hàng lựa chọn có phím, mức đủ «x/5» và «Còn thiếu: …» ở đầu) · **tính giá + so giá toà**.
- Ghi: mỗi lựa chọn ghi một sự kiện `details_changed` / `price_changed` qua `useSuaHang` (bộ đồng bộ trên máy — mất mạng
  vẫn ghi, gửi sau); mức đủ tính bằng `completeness` của lõi trên bản trên máy nên đổi ngay. Lead chưa có hồ sơ: câu trả
  lời đầu tiên gọi `POST /api/v1/leads/<mã>/listing` rồi kéo kho và ghi (Hỏi-5); 409 «lead đã có hàng» thì đọc lại
  `listingId` từ `leads/assigned/{leadId}`.
- Giá: ô chữ đọc bằng `docGia` («Hiểu là …»), điều kiện phí chọn bằng phím; hỏi lại theo `canHoiLai` (luật 7, như sửa
  trên ô); hồ sơ chưa có giá thì gợi ý giá của lead, Enter là ghi.
- Hôm nay: dòng lead thêm nút «Gọi» mở `/units/call?lead=<mã>`.

## 4. Đường đo

Thước của Cổng Đáng: thời gian lead → cuộc gọi đầu. Số từ `leads.first_called_at − coalesce(routed_at, created_at)` —
đã có từ hàng 22/25; vòng này thêm một lối ghi mốc ấy ngay trong chế độ cuộc gọi (nút «Đã gọi» của thẻ lead, AC-2).

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: Hôm nay → nút «Gọi» trên dòng lead → `/units/call?lead=<mã>` → bấm «Đã gọi» khi chủ nhấc máy → đi danh sách
  hỏi bằng phím (Tab nhóm kế, 1–3 chọn) → gõ giá chủ báo, chọn điều kiện phí → xem về tay và dải toà → Ctrl+Enter «Xong
  cuộc gọi» (điểm ra: Hôm nay).
- Biên: lead chỉ biết toà (không thuộc tính căn, so cả toà); toà chưa có căn có giá (khối so giá nói rõ); lead đã có hồ
  sơ (đọc giá trị sẵn có); giá trị cũ ngoài bộ lựa chọn (hiện nguyên, đánh dấu); mất mạng (ghi trên máy, chỉ báo đồng bộ).
- Lỗi & quay lại: lead không còn của mình / không thấy → báo + «Về Hôm nay»; tạo hồ sơ lỗi → báo ở nhóm, lựa chọn chưa ghi,
  bấm lại được; giá chưa hiểu → báo ngay dưới ô, không ghi; «Đã gọi» 409 → câu lý do ở thẻ.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Chế độ cuộc gọi khai thác | Ghi những gì chủ nhà nói trong một cuộc gọi, vừa nghe vừa gõ | Hôm nay (nút «Gọi») / Hôm nay |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-cuoc-goi-dang-tai | Cuộc gọi | Skeleton đúng ba cột | Chờ |
| ST-cuoc-goi-khong-thay | Cuộc gọi | «Không thấy lead này trong việc của bạn» | «Về Hôm nay» |
| ST-cuoc-goi-loi-tai | Cuộc gọi | «Chưa tải được lead — kiểm mạng rồi thử lại» | «Thử lại» |
| ST-cuoc-goi-chua-ho-so | Cuộc gọi | Danh sách hỏi trống, dòng «Câu trả lời đầu tiên tạo hồ sơ căn cho lead này», mức đủ 0/5 | Trả lời nhóm đầu |
| ST-cuoc-goi-mac-dinh | Cuộc gọi | Ba cột, mức đủ x/5, còn thiếu | Đi danh sách hỏi |
| ST-cuoc-goi-du | Cuộc gọi | Mức đủ 5/5, «Đã đủ năm mục» | Ctrl+Enter về Hôm nay |
| ST-cuoc-goi-toa-trong | Cuộc gọi | Khối so giá: «Toà chưa có căn cùng loại có giá» | Không |
| ST-cuoc-goi-mat-mang | Cuộc gọi | Chỉ báo đồng bộ «Chưa gửi — mất mạng»; lựa chọn vẫn ghi trên máy | Tiếp tục |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Phím: Tab / Shift+Tab đổi nhóm (vòng), 1–3 chọn lựa chọn của nhóm đang đứng, Delete xoá câu trả lời của nhóm, Ctrl+Enter
  «Xong cuộc gọi»; phím số không bắt khi con trỏ đang ở ô chữ (giá, môi giới %).
- Giá theo cách nói của nghề (`docGia`); đổi quá 20% hay đổi điều kiện phí thì hỏi lại kèm giá cũ → mới (`canHoiLai`).
- Máy tính: sửa ô nào thì ô kia tính lại; môi giới % sửa được (0–10, bước 0,1), không lưu.
- Khổ: máy tính ≥1280 ba cột; dưới `lg` xếp một cột theo thứ tự thẻ lead → danh sách hỏi → tính giá (bản điện thoại là
  hàng K1–K4, dự phòng).

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `Frame`, `FramePanel` | dùng | Họ khung màn vận hành |
| `ToggleGroup` + `Kbd` | ghép | Hàng lựa chọn có phím (dòng «Chỗ hở» Chế độ cuộc gọi, vo-va-ia §3) |
| `number-field` | dùng | Hai ô giá nối hai chiều của máy tính |
| `Badge` -light | dùng | Nấc lead, cờ «Đã hỏi / Chưa hỏi» |
| `Table` | dùng | Bảng căn cùng loại trong toà (nhỏ, trong Frame) |
| `Progress` | dùng | Dải thấp – giữa – cao của toà |
| `TrangThai`, `Skeleton` | dùng | Trống, lỗi, đang tải |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: luồng hiển nhiên — một bản ghi (lead/căn) mở toàn màn với các vùng chi tiết, vào từ danh sách việc Hôm nay và trở
về đó; bản phác KD1 của chủ kho đã vẽ đúng dáng này, không tra mẫu thêm.
<!-- UX-SPEC-TEMPLATE>>> -->

## 5. Ngoài vòng

Kết quả gọi bốn nút (H/G/B/K — hàng 22 và 29), lịch sử trả giá và giá đáy (hàng 29), đồng hồ cuộc gọi và quay số (hàng
30), tin rao công khai bên ngoài (cần dữ liệu Invest), «chủ còn căn nào» (cần đọc liên hệ chủ nhà — hàng riêng), các nhóm
hỏi chưa có trường (ngân hàng, tất toán, thời gian ra hàng, lịch xem, ghi chú cuộc gọi), lưu định nghĩa bao phí và phí
môi giới từng căn (hàng 49), bản điện thoại.

## 6. Câu hỏi ở Cổng Phạm vi

Hỏi-1 đường dẫn · Hỏi-2 bộ lựa chọn của danh sách hỏi · Hỏi-3 ba tỉ lệ thuế phí · Hỏi-4 tập căn đem so · Hỏi-5 lúc tạo
hồ sơ căn của lead. Khuyến nghị và lối khác ở `_acceptance/cuoc-goi-khai-thac/decisions.jsonl`.
