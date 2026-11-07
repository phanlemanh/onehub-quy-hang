# Mẫu của sàn: tên trường tiếng Anh — thiết kế

Hàng `mau-api-ten-truong-tieng-anh` (lộ trình), mở từ Ngoài-8 của `mau-bang-hang-va-bai` (#191): chủ kho chọn «mở hợp
đồng mới» ở Cổng Bằng chứng 07/11 (sổ `d-20261107T114018Z-45`). Hạng T2: không migration, không đổi trần lớp dữ liệu.

## Vấn đề

Hai đường `GET`/`PUT /api/v1/company/templates/export` và `/posts` cùng dữ liệu lưu ở `company_settings`
(`export.templates`, `share.post_templates`) đang mang tên trường tiếng Việt: `{ id, ten, cot }` và `{ dau, cuoi }`.
AGENTS.md: «Code, API, tên bảng tiếng Anh». Mọi đường khác của `/api/v1` dùng camelCase tiếng Anh (`contactTypes`,
`ownerPhone`…). Đổi càng sớm càng rẻ: đường mới gộp hôm nay, chưa bên ngoài nào gọi.

## Tên mới

| Cũ | Mới | Căn cứ |
|---|---|---|
| `ten` | `name` | camelCase tiếng Anh như các đường `/api/v1` khác |
| `cot` | `columns` | cùng lý do; giá trị cột (`unitNumber`, `listPrice`…) đã theo RESO, giữ nguyên |
| `dau` | `opening` | Tham chiếu §12 07/11: «Mẫu bài là lời mở đầu và lời kết» |
| `cuoi` | `closing` | như trên |

`id`, khoá kênh `zalo`/`facebook`, khoá sổ điểm `export.templates`/`share.post_templates` và hai đường giữ nguyên.

## Đối chiếu ngành

Vòng này chỉ đổi tên trường của khuôn đã ký ở `mau-bang-hang-va-bai`; không thêm tập đóng, không giữ cứng điều gì mới —
không có dòng «ta cứng — họ cấu hình».

| Năng lực | RESO | Follow Up Boss | KW Command | Ta làm | Ta cứng — họ cấu hình |
|---|---|---|---|---|---|
| Tên trường của mẫu bài, mẫu bảng trên API | không có đối tượng mẫu | Text Template có tên và thân chữ ([nguồn](https://help.followupboss.com/hc/en-us/articles/4403022689303-Text-Template-Scripts)); tên trường API chưa kiểm | chưa kiểm | tên camelCase tiếng Anh, giá trị cột giữ tên RESO đã có | không |

## Cách làm

- **Một khuôn.** Kiểu ở lõi (`MauBang`, `LoiMauBai` trong `packages/core/src/export/mau-san.ts`) đổi trường sang tên mới;
  API, kho lưu và web cùng dùng kiểu ấy — không lớp dịch ở giữa. Tên hàm, tên biến nội bộ giữ như kho đang viết.
- **Ghi chặt.** `kiemMauBang`, `kiemMauBai` (ghi qua `PUT`) chỉ nhận tên mới. Khoá lạ — kể cả tên cũ — bị từ chối nguyên
  khối, lý do nêu khoá và tên đúng: `export.templates[0]: khoá lạ «ten» — dùng «name»`. Như khuôn `.strict()` của
  `packages/connect`: không lặng lẽ bỏ trường.
- **Đọc khoan dung hai dạng.** `docMauBang`, `docMauBai` (đọc khi dùng: GET, Xuất, Gửi) nhận cả dạng cũ đã lưu: một mẫu
  thiếu `name` mà có `ten` thì lấy `ten`; tương tự `columns`/`cot`, `opening`/`dau`, `closing`/`cuoi`. Có cả hai thì tên
  mới thắng. Đọc dạng cũ không phải lỗi — `errors` không thêm dòng. Đầu ra luôn ở tên mới.
- **Chuyển dần, không migration.** Dòng dạng cũ nằm yên tới lần Quản trị lưu kế: màn Mẫu đọc (đã ra tên mới) rồi ghi
  nguyên khối bằng tên mới. Không mẫu nào mất ở lượt đó.
- **Lý do lỗi** của lõi đổi theo tên mới (`export.templates[1].name: …`, `share.post_templates.zalo.opening: …`); màn Mẫu
  dịch lý do sang câu cho người (`lyDoChoNguoi`) — đổi phần khớp theo tên mới.

## Vì sao không chuyển dữ liệu bằng migration

Migration viết lại JSON trong `company_settings` vẫn đòi đọc được cả hai dạng trong lúc triển khai (mã cũ và mới cùng
chạy quanh lúc phát hành), nên đường đọc kép phải có dù sao; migration chỉ cộng thêm việc, nâng hạng lên T3, và để lại
một dòng nhật ký đổi không có người đổi. Sau khi mọi sàn đã lưu lại (hoặc khi một hàng sau cần), một migration dọn có thể
bỏ đường đọc kép.

## Tệp chạm

- `packages/core/src/export/mau-san.ts` (+ test), `export/index.ts`, `export/bai.ts`, `sharing/tin.ts` (+ test),
  `redaction/mau-san.ro-ri.test.ts`.
- `packages/api/src/mau-san/routes.ts` (schema OpenAPI), `store.ts`; `packages/api/test-db/mau-bang-hang-va-bai/mau.test.ts`
  (đổi tên trong ca cũ) và ca mới ở `packages/api/test-db/mau-api-ten-truong-tieng-anh/`.
- `apps/web/src/app/(app)/settings/templates/` (mau-san.ts, vung-mau-bang.tsx, vung-mau-bai.tsx, test);
  `apps/web/src/app/(app)/inventory/` (mau-xuat-san.ts, phat-hang/mau.ts, chuyen-dong.ts, hop-thoai.tsx, test);
  `apps/web/src/app/(app)/shares/new/` (gui.ts, man-gui.tsx, test).

## Câu hỏi cho chủ kho

- **Hỏi-1 · Chuyển dữ liệu đã lưu.** Khuyến nghị: không migration (hạng T2), đọc được cả dạng cũ, lần lưu kế ghi dạng
  mới. Lối khác: migration viết lại mọi dòng ngay (hạng T3, thêm Cổng kế hoạch, viết lại dữ liệu thật của mọi sàn).
- **Hỏi-2 · Ghi bằng tên cũ.** Khuyến nghị: từ chối, lý do nêu tên đúng. Giá: Quản trị đang mở màn Mẫu từ trước lúc phát
  hành bấm lưu bị báo lỗi, tải lại rồi lưu. Lối khác: nhận cả hai tên khi ghi — API mang hai bộ tên tới khi có hàng bỏ.

## Màn

Không đổi chữ, bố cục hay trạng thái nào trên màn: bỏ đặc tả UX và lượt nhìn màn (sổ S1). Bài dựng màn (E6c, E7c) so chữ
hiển thị của màn Mẫu, ô «Cột theo» và tin màn Gửi giữa dạng lưu cũ và mới.
