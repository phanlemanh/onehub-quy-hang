# Thiết kế — bang-hang-danh-sach-chi-tiet (hàng 105)

Hàng 105 (dãy D, đợt `dau-khach-nhap`, luật đợt 60). Gốc: chủ kho chọn lối C ở phiên đánh giá ngăn hồ sơ căn (nguyên văn
«Chọn C», 05/11) — `docs/design/danh-gia-ngan-chi-tiet-can.md` mục 5 «Nếu chọn C, đổi gì». Đứng trên 14 (Bảng hàng), 17 (hồ
sơ căn cột phải), 91 (hệ bố cục). Tách khỏi hàng 79, chạy trước 79; mọi màn «Danh sách – chi tiết» sau này (103, 79, 99,
100, 102) dựng trên bố cục này (luật đợt 62). Thêm theo giám sát đợt: cột «Đầu chủ» trên Bảng hàng — chủ kho chọn «Thu AC-4,
cột sau» ở hàng 89 (`d-20261105T035554Z-21`).

## Hình

1. **Bố cục «Danh sách – chi tiết» đổi nhánh chi tiết sang cột kéo chia.** `BoCuc` kiểu `danh-sach-chi-tiet` có `cotPhu` dựng
   `ResizablePanelGroup` ngang (khối nguồn `app-shell-11`): thân bên trái (`minSize` 35%), cột chi tiết bên phải mặc định 38%,
   kéo 28–50%. Cột cao từ đỉnh vùng làm việc (ngang tiêu đề khung «Bảng hàng») tới đáy khung nhìn; thanh trên của vỏ (gõ mã
   căn, +Lead, đồng bộ, chuông, tài khoản) giữ nguyên ở trên. Nhóm panel luôn dựng để bảng không dựng lại khi cột mở hay
   đóng (giữ lọc, nhóm, cuộn — như `bang-co-ho-so.tsx` hôm nay).
2. **Ngăn nổi `NganNoi` giữ** cho ngăn báo, lọc trên điện thoại và Luồng nhiều bước; prop `chiTiet` của `BoCuc` thôi mở ngăn
   nổi cho danh sách – chi tiết trên máy tính. Lead đã nhập và Đã gửi khai bố cục này nhưng chưa mở chi tiết — không màn nào
   đang chạy đổi theo.
3. **Bảng hàng vào bố cục.** `/inventory` dựng bằng `BoCuc kieu="danh-sach-chi-tiet"`: thân là khối Bảng hàng (Frame của
   bảng), `cotPhu` là hồ sơ căn (`CotHoSo` trong `KhungHoSoCan cot`, ruột `solution-crm-4` đang chạy). Bảng hàng rời ngoại
   lệ có hạn ở `design/patterns/bang-hang.md`.
4. **Không cuộn trang.** Khung Bảng hàng (có và không có cột hồ sơ) vừa khung nhìn ở 1440 × 900 và 1280 × 800 — hôm nay cao
   hơn ~16 điểm (đánh giá mục 2). Bảng cuộn trong khung, trang không cuộn.
5. **Cột «Đầu chủ».** Bảng hàng có thêm cột «Đầu chủ»: tên thành viên đang giữ căn, đọc từ khoá đầu chủ của dòng trong kho
   trên máy (`listAgentKey`, hàng 89 d-20261104T235026Z-14) đối với danh sách thành viên của sàn; căn chưa có đầu chủ để trống
   «—». Đổi đầu chủ (gán một căn hay hàng loạt) thì cột đổi theo một lần kéo của bộ đồng bộ, không tải lại trang. Cột mặc định
   hiện, ẩn được ở trình đơn Cột như cột khác (Hỏi-1).
6. **Điện thoại không đổi**: `?unit=` mở hồ sơ toàn màn, bảng thẻ giữ nguyên; phóng to vẫn mở `/units/<mã>`.
7. **Tài liệu.** ADR-0024 thêm mục «Sửa đổi 05/11» (quyết định 2: khối nguồn danh sách – chi tiết `sheet-9` → `app-shell-11`
   cột kéo chia + ruột `solution-crm-4`; quyết định 13: «cột kéo chia cao hết vùng làm việc, bảng vẫn bấm được») — không viết
   đè; Tham chiếu §12 thêm dòng 05/11; `docs/design/vo-va-ia.md` dòng «Hồ sơ căn, cột phải», `design/patterns/ho-so-can.md` và
   ngoại lệ ở `bang-hang.md` hết lệch nhau. Catalog thêm dòng `@reui/app-shell-11`.
8. **Vùng tệp.** `components/bo-cuc/**`, `units/ho-so/**`, `inventory/*.tsx`, `inventory/cot.ts*`; KHÔNG chạm `inventory/bulk/**`
   (hàng 89). Không chạm cơ sở dữ liệu, trần dữ liệu, rào — T2.

## Đối chiếu ngành (ADR-0022)

| Năng lực | RESO | Sản phẩm khác | Ta định làm | Ta viết cứng — họ cho cấu hình |
|---|---|---|---|---|
| Chi tiết bản ghi cạnh bảng | không có (giao diện) | Notion: side peek / center peek / full page, chủ không gian chọn mặc định theo góc nhìn ([Notion 20/07/2022](https://www.notion.com/releases/2022-07-20)); Airtable: record detail kéo đổi rộng, nhớ theo trình duyệt ([Airtable](https://support.airtable.com/docs/airtable-interface-layout-record-detail)); Salesforce Split View đứng cạnh ([Salesforce Ben](https://www.salesforceben.com/your-complete-guide-to-salesforce-split-view/)) | cột đứng cạnh kéo chia 28–50% cho mọi màn danh sách – chi tiết | **có**: kiểu mở (cạnh / nổi / trang) cố định theo bố cục; Notion cho chủ không gian chọn → Hỏi-2 |
| Cột người giữ bản ghi | `ListAgentKey` | Smartsheet, Airtable: cột người giữ là cột thường, người xem ẩn hay hiện ([Smartsheet 05/2025](https://www.smartsheet.com/content-center/expanded-row-details-attachments-and-conversations-table-view-now-generally)); HubSpot «Contact owner» là thuộc tính hiện trên bảng ([HubSpot KB](https://knowledge.hubspot.com/records/preview-a-record), chưa kiểm phần cột) | cột «Đầu chủ» đọc `listAgentKey`, ẩn được ở trình đơn Cột | không: ẩn hiện theo người như cột khác; mặc định hiện → Hỏi-1 |

## Đặc tả UX

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: Bảng hàng → bấm một dòng → cột hồ sơ mở bên phải, bảng co sang trái → sửa ảnh, giá, mã → bấm dòng khác (cột đổi
  căn, bảng giữ lọc, cuộn) → đóng cột (điểm ra: Bảng hàng toàn bề rộng).
- Biên: kéo mép cột chạm 28% hay 50% thì dừng; màn 1280 vẫn thấy 4 cột bảng và nhóm nút Nhóm · Lọc · Cột · Xuất; căn chưa có
  đầu chủ hiện «—» ở cột Đầu chủ.
- Lỗi & quay lại: hồ sơ lỗi tải → trạng thái lỗi trong cột kèm «Thử lại», bảng vẫn dùng được; mất mạng → dải ngoại tuyến của
  bố cục, bảng và cột đọc kho trên máy.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Bảng hàng có hồ sơ cạnh bên | làm việc trên một căn mà vẫn thấy cả bảng | điều hướng «Bảng hàng», gõ mã căn, Hôm nay / `/units/<mã>` khi phóng to |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-bang-hang-dong | Bảng hàng | bảng toàn bề rộng, không cột hồ sơ | bấm dòng |
| ST-bang-hang-mo | Bảng hàng | cột hồ sơ 38% cao hết vùng làm việc, bảng co trái, thanh công cụ thấy đủ | sửa căn, bấm dòng khác, kéo chia, đóng |
| ST-bang-hang-cho-tai | Bảng hàng | khung chờ của bố cục trong cột hồ sơ | chờ |
| ST-bang-hang-loi-ho-so | Bảng hàng | lỗi tải hồ sơ trong cột, «Thử lại» | thử lại / đóng cột |
| ST-bang-hang-dien-thoai | Bảng hàng (điện thoại) | bảng thẻ; `?unit=` mở hồ sơ toàn màn | như hôm nay |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Kéo chia 28–50%, mặc định 38%; bảng `minSize` 35%. Cột đứng cạnh, không lớp phủ — bảng luôn bấm được.
- Breakpoint `md`: dưới `md` không dựng cột (điện thoại giữ hồ sơ toàn màn).

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `app-shell-11` (cột chi tiết kéo chia) | ghép | khối ReUI cho lối C, cùng tỉ lệ 38 / 28–50 với cột đang chạy |
| `resizable` (đã cài) | dùng | phần kéo chia đang chạy ở `bang-co-ho-so.tsx` |
| `solution-crm-4` (ruột hồ sơ) | dùng | ruột hồ sơ căn đang chạy, không đổi |
| `data-grid` cột «Đầu chủ» | mở rộng | thêm một cột vào bảng đang chạy |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: đã tra ở `docs/design/danh-gia-ngan-chi-tiet-can.md` §3 — ReUI Pro (16 khối, `app-shell-11` cột đứng cạnh), Smartsheet,
Salesforce Split View, Material list-detail: lối đứng cạnh cho việc làm lâu; chủ kho chọn C.
### 7. Thẻ việc

| Trường | Giá trị |
|---|---|
| Ai dùng | Đầu chủ (cả Đầu khách, Trưởng nhóm có Bảng hàng) |
| Việc chính | đi lần lượt các căn, sửa hồ sơ từng căn mà vẫn thấy bảng, lọc, nhóm |
| Tần suất | mỗi ngày nhiều lần |
| Số bản ghi | hàng trăm trở lên |
| Thiết bị | máy tính (điện thoại không đổi) |
<!-- UX-SPEC-TEMPLATE>>> -->
