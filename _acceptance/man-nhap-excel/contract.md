---
schema_version: 1
feature: "Màn Nhập Excel (65b): Đầu chủ — hay Trưởng nhóm nhập hộ — chọn tệp bảng hàng cũ, màn đọc tệp trong trình duyệt, ghép cột, cho thấy từng ô sẽ ghi gì, cho sửa ô và bỏ dòng, xem thử trên máy chủ từng dòng thành gì, rồi ghi qua đường ghi lần nhập của hàng 65a"
slug: man-nhap-excel
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui, api]
status: draft
design_doc: docs/superpowers/specs/2026-11-04-man-nhap-excel-design.md
---

# Acceptance Contract: man-nhap-excel

## Context

Hàng `man-nhap-excel` (65b) của lộ trình, tách ở G-4 (giám sát 03/11): màn cho đường ghi lần nhập của hàng 65a
(`nhap-excel-xem-truoc-ghi`, đã gộp PR #105). Cổng Đáng: build (chủ kho 04/11). Đứng trên hàng 64 (lõi nhập tất định) và
65a (API `/api/v1/imports`). Màn dùng đúng mã lõi `@quy-hang/core/import` mà máy chủ dùng; tệp gốc không rời trình duyệt.

Hạng: máy suy **T2** (không chạm `t3_paths`). Bất biến chạm: 2 (thông tin chủ nhà không rời công ty — màn không gửi giá
trị lớp nguồn ra ngoài đường ghi 65a), 1 (cách ly — đi qua API đã có luật theo dòng).

Source input: ô cơ hội `_acceptance/man-nhap-excel/opportunity.md` · thiết kế
`docs/superpowers/specs/2026-11-04-man-nhap-excel-design.md` · `docs/architecture/nhap-du-lieu.md` §1, §2, §9, §10 ·
`docs/design/vo-va-ia.md` §2 (Nhập Excel, khối đích `solution-crm-6`).

## Criteria

- AC-1: Given bộ tệp thử của hàng 64 (mau-a.xlsx, mau-b.xlsx, các csv UTF-8 có BOM và Windows-1258) và một tệp xlsx nén do
  `exceljs` ghi (chuỗi dùng chung, hai trang tính), When bộ đọc tệp của màn đọc, Then lưới ô bằng đúng lưới lõi đọc từ cùng
  dữ liệu, trang tính chọn được theo tên; tệp .xls, tệp hỏng, tệp quá 10 MB hay quá 5.000 dòng ra lỗi có tên tiếng Việt,
  không ném ra ngoài.
- AC-2: Given mỗi tệp của bộ thử hàng 64, When đường ống của màn chạy (đọc bảng → phân loại cột → kế hoạch từ điển → áp kế
  hoạch), Then dấu từng ô (giữ nguyên · máy sửa · cần người · chặn) và đếm theo dấu bằng đúng đầu ra của lõi trên cùng tệp
  — màn không có luật riêng.
- AC-3: Given bước ghép cột, When người đổi đích một cột, Then kế hoạch kiểm lại ngay: cột lớp nguồn (số chủ, tên chủ, giá
  đáy) đổi sang trường không phải lớp nguồn thì có lỗi nêu cột và trường, nút Tiếp khoá; đổi về đích hợp lệ thì hết lỗi;
  ô mẫu của cột lớp nguồn chỉ hiện hình dạng, không hiện giá trị.
- AC-4: Given bước xem trước, When người sửa một ô «cần người» hay «chặn» thành giá trị hợp lệ, hay bỏ một dòng, Then dấu
  của ô tính lại bằng lõi, giá trị gửi lên là giá trị người sửa, dòng bỏ gửi `skip: true`; sau mọi thay đổi, nút ghi khoá
  tới khi xem thử lại.
- AC-5: Given một tệp 450 dòng trên Postgres thật, When màn gửi bản xem thử mọi gói (≤ 200 dòng) rồi ghi đúng các gói ấy
  qua đúng hàm gọi API của màn, Then bốn số trên nút ghi («căn mới · cập nhật · tin bổ sung · bỏ») bằng tổng kết quả bản
  ghi, và bản xem thử không để lại hàng hay dòng nhập nào. (cross-layer)
- AC-6: Given tệp có cột số chủ, tên chủ, giá đáy, When màn đi hết năm bước, Then thân yêu cầu mở lần nhập (kế hoạch, tiêu
  đề, toà và mã căn) không mang giá trị lớp nguồn nào của tệp; giá trị lớp nguồn chỉ có trong ô của gói dòng gửi tới
  `/api/v1/imports/{id}/rows`; màn không gọi địa chỉ nào khác ngoài API nhập, danh mục và (Hỏi-2) đầu chủ của sàn.
- AC-7: Given gói ghi thứ hai lỗi mạng, When người bấm «Thử lại», Then gói một giữ kết quả, màn gửi lại đúng gói hai, và số
  hàng tạo trên cơ sở dữ liệu bằng số căn mới của bản xem thử — không nhân đôi. (cross-layer)
- AC-8: Given người dùng ở sàn, When mở Nhập Excel, Then Đầu chủ và Trưởng nhóm vào được; vai khác thấy trạng thái «không có
  quyền» và màn không gọi API nhập; Trưởng nhóm phải chọn một đầu chủ của sàn trước khi Tiếp, và mọi dòng gửi
  `agentUserId` của người được chọn — danh sách đầu chủ đọc từ máy chủ chỉ cho vai nhập, chỉ trả mã người và tên.
  (cross-layer)
- AC-9: Given tệp mẫu của sàn thử, When người dùng đi năm bước trên màn đang chạy ở khổ 1440 và 375, Then thấy: ghép cột máy
  ghép sẵn, lưới xem trước có dấu và lý do, bảng trùng có hành động và lý do từng dòng, tóm tắt «Ghi N căn mới, cập nhật M,
  tin bổ sung K, bỏ J», và màn kết quả có lối về Bảng hàng; các trạng thái rỗng, lỗi, không quyền đi qua khuôn trạng thái.
- AC-10: Given màn mới, When chạy lưới giao diện, Then màn thuộc nhóm khuôn mới `nhap-excel` (rời trang tạm có ghi ngoại lệ),
  0 lệch khuôn mới, mức nợ giao diện 0, khối chuyển thể có dòng ở danh mục, và trang ba lối của vòng qua bài kiểm.

## Coverage

Quét không gian tiêu chí (preset entity-feature × test-matrix, skill morphological-scan):

- Trục **bước của luồng**: tải tệp | ghép cột | xem trước | trùng | tóm tắt và ghi [thước CE: `vo-va-ia.md` §2 năm bước,
  `solution-crm-6` — AC-1, AC-3, AC-4, AC-5, AC-9]
- Trục **dạng tệp**: xlsx một trang | xlsx nhiều trang, chuỗi dùng chung | csv UTF-8 BOM | csv Windows-1258 | .xls | hỏng
  | quá cỡ [thước CE: `nhap-du-lieu.md` §9 bộ thử, §10 — AC-1]
- Trục **lớp dữ liệu đi ra**: danh mục | hàng chia sẻ được | nội bộ | nguồn [thước CE: bất biến 2, `FIELD_CLASS` — AC-3, AC-6]
- Trục **người nhập**: Đầu chủ | Trưởng nhóm | vai khác [thước CE: ADR-0011, `navigation.ts` — AC-8]
- Trục **mạng và lặp**: thông | lỗi giữa gói | thử lại [thước CE: §6 «gửi lại không nhân đôi», hàng 65a — AC-5, AC-7]
- Trục **khổ**: 1440 | 375 [thước CE: ADR-0024 «Luồng nhiều bước» — AC-9]

## Đường đo

- «xem thử bằng ghi» — tổng bốn số của bản xem thử so với bản ghi trên cùng tệp: AC-5.
- «lỗi lọt ≤ 0,5%», «cần người ≤ 10% lần đầu» — tỷ lệ của đường ống màn trên mau-a, mau-b so với ngưỡng (E2, ca «ngưỡng
  Cổng Đáng trên tệp mẫu»); AC-2 bảo đảm màn ra đúng số lõi trên cả bộ thử.
- «0 giá trị nguồn rời trình duyệt ngoài đường ghi»: AC-6.
- «một Đầu chủ thử nhập từ đầu tới đã ghi không cần hỏi ai»: đo ở phiên nghiệm thu (Cổng Giá trị), không phải bài máy.

## Out of scope

- Tác tử AI lập kế hoạch, ô lạ, từ điển của sàn — hàng 68–71.
- Nhớ mẫu nhập của sàn — hàng 67; hoàn tác cả lần nhập — hàng 66.
- Google Sheets (`nhap-du-lieu.md` §10 «sau»); đọc tệp .xls (Hỏi-1).
- Tiếp tục một lần nhập dở sau khi đóng trang; gộp hai dòng trùng trong file (dòng sau bỏ, như hàng 65a).
- Lối vào Nhập Excel trên điện thoại (menu điện thoại chỉ có + Lead).

## Notes

- Vùng: `apps/web/src/app/(app)/imports/**`, `apps/web/src/components/khoi/solution-crm-6/**`, `apps/web/src/lib/nhap/**`,
  `design/patterns/nhap-excel.md`, `packages/api/src/imports/**` (chỉ khi Hỏi-2 chọn route đầu chủ),
  `packages/api/test-db/imports/**`; chạm thêm theo yêu cầu G-12 (giám sát duyệt): `apps/web/package.json`,
  `package-lock.json` (chỉ `npm install exceljs -w apps/web`), thành phần cài bằng shadcn CLI, `design/patterns/trang-tam.md`
  (ngoại lệ), `.agents/skills/quy-hang-ui/catalog.md`, `docs/design/vo-va-ia.md`, `CONTEXT.md`, `docs/product/tham-chieu.md`
  (chỉ thêm dòng).
