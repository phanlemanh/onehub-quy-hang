---
schema_version: 1
feature: "Đường API mẫu bảng hàng và mẫu bài của sàn (/api/v1/company/templates/export, /posts) và dữ liệu mẫu đã lưu dùng tên trường tiếng Anh; mẫu sàn đã lưu bằng tên cũ vẫn đọc và xuất được, lần lưu kế ghi tên mới"
slug: mau-api-ten-truong-tieng-anh
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [api]
status: machine-cleared
design_doc: docs/superpowers/specs/2026-11-07-mau-api-ten-truong-tieng-anh-design.md
approved_by: Manh Phan
approved_at: 2026-11-07
---

# Acceptance Contract: mau-api-ten-truong-tieng-anh

## Context

Ngoài-8 của `mau-bang-hang-va-bai` (#191): hai đường `/api/v1/company/templates/export`, `/posts` và dữ liệu mẫu lưu ở
`company_settings` mang tên trường tiếng Việt (`ten`, `cot`, `dau`, `cuoi`), trái luật kho «Code, API, tên bảng tiếng
Anh». Chủ kho chọn «mở hợp đồng mới» ở Cổng Bằng chứng 07/11. Tên mới: `name`, `columns`, `opening`, `closing`. Không
migration — hạng T2: dòng đã lưu dạng cũ vẫn đọc được, lần lưu kế ghi dạng mới. Thiết kế:
`docs/superpowers/specs/2026-11-07-mau-api-ten-truong-tieng-anh-design.md`. Dữ liệu mẫu: `[Tên]`, `0900 000 0xx`.

## Criteria

### AC-1: Đọc mẫu bảng hàng ra tên mới
- **Given** sàn có mẫu bảng hàng đã lưu bằng tên mới
- **When** một thành viên sàn gọi `GET /api/v1/company/templates/export`
- **Then** mỗi mẫu trong `templates` có đúng ba khoá `id`, `name`, `columns`; không khoá `ten`, `cot`; schema OpenAPI
  `ExportTemplates` khai đúng ba khoá ấy

### AC-2: Đọc mẫu bài ra tên mới
- **Given** sàn có mẫu bài Zalo và Facebook đã lưu bằng tên mới
- **When** một thành viên sàn gọi `GET /api/v1/company/templates/posts`
- **Then** mỗi kênh trong `templates` có đúng hai khoá `opening`, `closing`; không khoá `dau`, `cuoi`; schema OpenAPI
  `PostTemplates` khai đúng hai khoá ấy

### AC-3: Ghi bằng tên mới, lưu bằng tên mới
- **Given** Quản trị sàn
- **When** `PUT` mẫu bảng hàng và mẫu bài bằng tên mới
- **Then** trả 200 với bản vừa lưu, và dòng `company_settings` của hai khoá chỉ mang tên mới

### AC-4: Ghi bằng tên cũ bị từ chối, nêu tên đúng
- **Given** Quản trị sàn
- **When** `PUT` một lần lưu có một mẫu dùng tên cũ (`ten`, `cot`, `dau` hay `cuoi`) hay khoá lạ khác
- **Then** trả 400, `reason` nêu khoá sai và — với tên cũ — tên đúng; không ghi phần nào của lần lưu ấy

### AC-5: Mẫu đã lưu bằng tên cũ vẫn đọc được
- **Given** dòng `company_settings` của sàn còn mẫu bảng hàng và mẫu bài dạng cũ (ghi trước vòng này)
- **When** gọi `GET` hai đường
- **Then** trả đủ mọi mẫu ở tên mới với cùng tên, cùng cột theo thứ tự, cùng lời; `errors` rỗng; dòng có cả tên cũ lẫn
  tên mới thì tên mới thắng

### AC-6: Xuất và Gửi dùng được mẫu dạng cũ
- **Given** mẫu dạng cũ như AC-5
- **When** Đầu chủ xuất bảng hàng theo mẫu ấy, và người gửi mở màn Gửi
- **Then** bảng xuất ra đúng cột của mẫu theo thứ tự, bài Zalo và tin soạn sẵn mang đúng lời mở đầu và lời kết — như
  khi mẫu lưu bằng tên mới

### AC-7: Lần lưu kế chuyển sang tên mới, không mất mẫu
- **Given** mẫu dạng cũ như AC-5, Quản trị mở màn Mẫu
- **When** lưu lại (có hay không sửa)
- **Then** dòng `company_settings` chỉ còn tên mới và giữ đủ mọi mẫu cùng nội dung

### AC-8: Quyền, cách ly và luật ẩn không đổi
- **Given** hai sàn, các vai của sàn
- **When** vai khác Quản trị `PUT`, hay sàn này đọc mẫu
- **Then** vai khác bị 403; sàn này không thấy mẫu của sàn kia; bảng và bài theo mẫu vẫn qua luật ẩn của người nhận (bộ
  kiểm rò rỉ của mẫu xanh)

## Coverage

Quét tay theo khuôn morphological-scan (preset entity-feature), không gian nhỏ:

- Trục **đường**: export | posts [thước CE: hai đường của `registerMauSanRoutes`] — AC-1..AC-5
- Trục **chiều**: đọc API | ghi API | đọc khi dùng (Xuất, Gửi) | màn Mẫu đọc rồi ghi [thước CE: các nơi gọi `docMauBang`,
  `docMauBai`, `kiemMauBang`, `kiemMauBai`] — AC-1..AC-7
- Trục **dạng dữ liệu vào**: tên mới | tên cũ | lẫn cả hai | khoá lạ | sai khuôn [thước CE: dạng lưu trước và sau vòng] —
  AC-3, AC-4, AC-5
- Trục **bất biến**: quyền | cách ly | luật ẩn [thước CE: bất biến 1, 4 của AGENTS.md] — AC-8

## Đường đo

Ngưỡng SỐNG ở `opportunity.md`. Mỗi vế trỏ tới tiêu chí và bài đo:
- API và dữ liệu lưu chỉ dùng tên trường tiếng Anh — AC-1, AC-2, AC-3, AC-4 · E1, E2, E3, E4;
- mẫu đã lưu bằng tên cũ vẫn đọc, sửa và xuất được, không mất mẫu — AC-5, AC-6, AC-7 · E5, E5b, E6, E6b, E6c, E7, E7b, E7c.

Không thêm số đo mới.

## Out of scope

- Đổi tên hàm, biến, kiểu nội bộ tiếng Việt khác của kho (`MauBang`, `docMauBang`…) — chỉ tên trường của khuôn lưu và API.
- Migration chuyển dữ liệu dạng cũ; bỏ đường đọc kép — để hàng sau khi mọi sàn đã lưu lại.
- Màn Mẫu báo mẫu hỏng thay vì lặng lẽ bỏ khi lưu — hàng kế `man-mau-bao-mau-hong` (Ngoài-9 của #191).
- Đổi khoá sổ điểm `export.templates`, `share.post_templates`, khoá kênh hay đường API.

## Notes

- Không đổi chữ, bố cục hay trạng thái nào trên màn: không đặc tả UX, không lượt nhìn màn (sổ S1); bài dựng màn E6c, E7c
  so chữ hiển thị giữa dạng lưu cũ và mới.
- Hỏi-1 (chuyển dữ liệu: không migration, hạng T2 — khuyến nghị) và Hỏi-2 (ghi bằng tên cũ: từ chối — khuyến nghị) chờ
  chủ kho ở Cổng Phạm vi; hợp đồng soạn theo khuyến nghị.
- Theo Hỏi-2: Quản trị đang mở màn Mẫu từ trước lúc phát hành bấm lưu thì bị báo lỗi, tải lại trang rồi lưu lại.
- Ngoài-1 (máy định tuyến 2026-11-07, đề xuất S4 known-limits): Nếu ai đó gửi lên mẫu có một khoá lạ trùng tên một thuộc tính sẵn có của hệ thống, lần lưu vẫn bị từ chối đúng, nhưng lời báo lỗi kèm một gợi ý tên đúng vô nghĩa. Dữ liệu của sàn không bị hỏng. — `packages/core/src/export/mau-san.ts`
  - Đã sửa trước lượt 2 (commit 77c9906c, ca kiểm `constructor`/`toString` ở f2a12613); mục còn trong sổ vì lượt 2 mang
    nó theo nhãn «r1 · tệp đã đổi» — lượt 2 chấm trên bản đã sửa, PASS.
