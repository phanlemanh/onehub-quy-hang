---
schema_version: 1
feature: "Màn Mẫu của Cài đặt › Sàn báo cho Quản trị khi mẫu bảng hàng hay mẫu bài đã lưu có chỗ không đọc được, nói rõ chỗ nào; lần lưu kế không lặng lẽ xoá các chỗ ấy mà Quản trị biết trước điều sẽ xảy ra"
slug: man-mau-bao-mau-hong
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: machine-cleared
design_doc: docs/superpowers/specs/2026-11-07-man-mau-bao-mau-hong-design.md
approved_by: Manh Phan
approved_at: 2026-11-08
---

# Acceptance Contract: man-mau-bao-mau-hong

## Context

Ngoài-9 của `mau-bang-hang-va-bai` (#191): màn Mẫu vứt `errors` mà hai đường đọc mẫu trả về, nên chỗ hỏng trong mẫu đã
lưu bị bỏ khỏi danh sách mà Quản trị không biết, và lần lưu kế xoá hẳn chúng. Chủ kho chọn «mở hợp đồng mới» ở Cổng
Bằng chứng 07/11. Vòng chỉ chạm web (màn Mẫu); API và lõi không đổi — hạng T2. Thiết kế:
`docs/superpowers/specs/2026-11-07-man-mau-bao-mau-hong-design.md`. Dữ liệu mẫu: `[Tên]`, `0900 000 0xx`.

## Criteria

### AC-1: Tab Mẫu bảng hàng báo chỗ hỏng
- **Given** mẫu bảng hàng đã lưu của sàn có chỗ không đọc được (một mẫu bị bỏ, hay một cột bị bỏ khỏi mẫu)
- **When** Quản trị mở tab Mẫu bảng hàng
- **Then** đầu tab có một khối báo nói số chỗ, liệt từng chỗ bằng một câu (mẫu thứ mấy đã lưu, vì sao; cột nêu bằng nhãn
  như «Người giữ»), và nói lần lưu kế sẽ bỏ hẳn những chỗ này, các mẫu khác giữ nguyên

### AC-2: Tab Mẫu bài báo chỗ hỏng
- **Given** mẫu bài đã lưu có chỗ không đọc được (kênh lạ, lời sai khuôn, cả khoá sai khuôn)
- **When** Quản trị mở tab Mẫu bài
- **Then** đầu tab có khối báo như AC-1, kênh nêu bằng tên «Zalo», «Facebook» hay câu chung khi kênh lạ

### AC-3: Lời cho người, không khoá kỹ thuật
- **Given** mọi dạng lỗi mà bộ đọc của lõi phát ra cho hai loại mẫu
- **When** màn dựng câu báo
- **Then** không câu nào mang khoá kỹ thuật (`export.templates`, `share.post_templates`, `[n]`, tên khoá cột hay tên
  trường tiếng Anh); dòng lạ khuôn thành câu chung, không bị bỏ

### AC-4: Không chỗ hỏng thì không báo
- **Given** mẫu đã lưu đọc được trọn
- **When** Quản trị mở hai tab
- **Then** không có khối báo chỗ hỏng; mọi trạng thái khác của tab (đang tải, trống, lỗi đọc, đã lưu) như trước

### AC-5: Lưu bỏ đúng những chỗ đã báo
- **Given** mẫu đã lưu có chỗ hỏng như AC-1, AC-2
- **When** Quản trị lưu một mẫu (sửa, thêm hay xoá một mẫu khác)
- **Then** dòng lưu mới giữ đủ mọi mẫu đọc được cùng nội dung, chỉ bỏ những chỗ đã báo; màn đọc lại và khối báo mất

### AC-6: Chỉ Quản trị thấy, không rò phần nội bộ
- **Given** các vai của sàn và luật ẩn
- **When** vai khác mở mục Mẫu, hay trang dựng khối báo
- **Then** vai khác vẫn về Cá nhân như trước; mã nguồn màn qua bộ kiểm rò rỉ của trang (`*.ro-ri.test.ts`) xanh

### AC-7: Quản trị nhìn thấy khối báo trên màn thật
- **Given** sàn mẫu có mẫu bảng hàng và mẫu bài hỏng nạp sẵn
- **When** Quản trị mở Cài đặt › Sàn › Mẫu trên bản đang chạy
- **Then** hai tab hiện khối báo đúng số chỗ và câu; lưu một mẫu thì khối báo của tab ấy mất, các mẫu đọc được còn đủ

## Coverage

Quét tay theo khuôn morphological-scan (preset entity-feature):

- Trục **loại mẫu**: mẫu bảng hàng | mẫu bài [thước CE: hai điểm #26, #27] — AC-1, AC-2
- Trục **dạng chỗ hỏng**: cả khoá sai khuôn | mẫu bị bỏ | cột bị bỏ | quá 20 mẫu | kênh lạ | lời sai khuôn [thước CE: các
  dòng `loi.push` của `docMauBang`, `docMauBai`] — AC-1, AC-2, AC-3
- Trục **trạng thái tab**: đang tải | trống | lỗi đọc | có chỗ hỏng | không chỗ hỏng | đã lưu [thước CE: `TrangThaiMauSan`
  + câu sau khi lưu] — AC-1, AC-4, AC-5
- Trục **vai**: Quản trị | vai khác [thước CE: `chanMucSan`] — AC-6

## Đường đo

Ngưỡng SỐNG ở `opportunity.md`. Mỗi vế trỏ tới tiêu chí và bài đo:
- thấy ngay mẫu nào có chỗ không đọc được và vì sao — AC-1, AC-2, AC-3, AC-7 · E1, E2, E3, E7;
- lần lưu kế không bỏ chỗ ấy mà không được báo trước — AC-5, AC-7 · E5, E5b, E5c, E7.

Không thêm số đo mới.

## Out of scope

- Sửa chỗ hỏng ngay trên màn (khôi phục cột, đổi tên trùng) — Quản trị sửa bằng hộp sửa sẵn có sau khi lưu.
- Báo chỗ hỏng của tab Mẫu nhập (mẫu file nhập) — khuôn đọc khác, hàng 50.
- Báo chỗ hỏng ở hộp Xuất và màn Gửi (người dùng không phải Quản trị) — họ chỉ thấy mẫu đọc được.
- Đổi đường API hay lời lỗi của lõi.

## Notes

- Hỏi-1 (lưu khi còn chỗ hỏng: báo trước rồi bỏ — khuyến nghị; chỗ hỏng mất vĩnh viễn ở lần lưu đầu), Hỏi-2 (lời báo
  dựng ở web — khuyến nghị) và Hỏi-3 (duyệt bằng chữ, nhìn màn ở Cổng Bằng chứng — khuyến nghị) chờ chủ kho ở Cổng Phạm
  vi; hợp đồng soạn theo khuyến nghị.
- Ngoài-2 (máy định tuyến 2026-11-07, đề xuất S4 known-limits): Bài kiểm tra rò rỉ cho khối báo mẫu hỏng có thể vẫn xanh dù khối báo không hiện, nên có thể không đo gì. Hiện chưa có thông tin nội bộ nào bị lộ ra. — `apps/web/src/app/(app)/settings/templates/mau-san.ro-ri.test.ts`
- Ngoài-3 (máy định tuyến 2026-11-07, đề xuất S4 known-limits): Nếu sau này lõi đổi lời lỗi, năm lý do bỏ mẫu có thể rơi về câu chung mà bài kiểm tra vẫn xanh. Hiện người dùng vẫn thấy lời báo đúng. — `apps/web/src/app/(app)/settings/templates/bao-hong.test.ts`
- Ngoài-4 (máy định tuyến 2026-11-07, đề xuất S4 known-limits): Bài kiểm rò rỉ cho khối báo mẫu hỏng hiện không thể phát hiện nếu sau này câu báo vô tình chép nội dung nội bộ của căn. Hôm nay màn vẫn đúng, nhưng lưới an toàn ở chỗ này mỏng hơn vẻ ngoài. — `apps/web/src/app/(app)/settings/templates/mau-san.ro-ri.test.ts`
- Ngoài-5 (máy định tuyến 2026-11-07, đề xuất S4 known-limits): Nếu sau này đổi chữ của khối báo, bài kiểm vẫn xanh dù khối báo có thể lại hiện cả khi mẫu không hỏng. Hiện người dùng chưa gặp lỗi nào. — `apps/web/src/app/(app)/settings/templates/bao-hong.test.ts`
- Ngoài-6 (máy định tuyến 2026-11-07, đề xuất S4 known-limits): Nếu về sau lõi thêm một lý do mới khiến mẫu bị bỏ, màn sẽ báo bằng câu chung và không bài kiểm nào nhắc phải viết câu riêng. Người dùng vẫn được báo, chỉ là câu kém rõ. — `apps/web/src/app/(app)/settings/templates/bao-hong.test.ts`
- Ngoài-8 (máy định tuyến 2026-11-07, đề xuất S4 known-limits): Nếu phía API sau này đổi dạng danh sách chỗ hỏng, màn sẽ im lặng không báo gì mà không bài kiểm nào đỏ. Quản trị khi đó mất lời cảnh báo trước khi lưu. — `apps/web/src/app/(app)/settings/templates/bao-hong.test.ts`
- Ngoài-4, Ngoài-5, Ngoài-6, Ngoài-8 là mục lượt 1, đã siết trước lượt 2 (commit fc1a8b62: bài rò rỉ có chiều đỏ, E4 ghim
  chữ khối báo và role=status, ma trận theo từng lý do của khuôn lõi, đáp GET thật qua trangThaiTuDap); lượt 2 mang chúng
  theo nhãn «r1 · tệp đã đổi» và chấm trên bản đã siết, PASS. Ngoài-2, Ngoài-3 là chỗ hụt còn lại của chính các bài vừa siết.
