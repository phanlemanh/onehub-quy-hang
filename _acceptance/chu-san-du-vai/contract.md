---
schema_version: 1
feature: "Trao Quản trị sàn — ở công cụ mở sàn hay màn Người dùng — là trao luôn bốn vai làm việc, gỡ bớt được; Trưởng nhóm kéo theo vai của thành viên: một luật «vai kéo theo vai», không đổi luật theo dòng, không đổi vai của ai đang có."
slug: chu-san-du-vai
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [ui, api]
status: approved
design_doc: docs/superpowers/specs/2026-11-08-chu-san-du-vai-design.md
approved_by: Manh Phan
approved_at: 2026-11-08
---

# Acceptance Contract: chu-san-du-vai

## Context

Người mở sàn mới chỉ mang vai Quản trị sàn nên đăng nhập là ngõ cụt (audit sàn mới ngày 0, mục 3b). Chủ kho chốt cách B
06/11 (Tham chiếu §12) và mở rộng thành luật «vai kéo theo vai» 08/11 (H-33). T3 vì chạm `packages/db/scripts/**`. Bất biến
2 (chủ nhà không rời công ty) không nới: người thấy chủ nhà vẫn trong sàn, mỗi lần mở số một vết.

Source input: hàng `chu-san-du-vai` (`docs/plan/lo-trinh.json`) · ô `opportunity.md` · yêu cầu H-33

## Criteria

- **AC-1** — Một bảng «vai kéo theo vai» ở lõi quyết điều gì được tích sẵn.
  Given bảng kéo theo ở `packages/core/src/access/goi-vai.json` và ma trận viết trước đủ năm vai × bật, tắt × đã có và chưa
  có vai kéo theo,
  When gọi `doiVaiKhiTich` cho từng ca,
  Then bật Quản trị sàn cho ra đủ năm vai, bật Trưởng nhóm thêm đúng các vai bảng khai, bật vai không có dòng chỉ thêm vai
  ấy; tắt một vai chỉ bớt đúng vai ấy và không kéo lại vai đã gỡ; danh sách không trùng; bảng chỉ chứa mã trong năm vai.

- **AC-2** — Người đầu tiên của sàn mới mang đủ năm vai; sàn đang chạy không đổi. (cross-layer)
  Given Postgres của dãy và công cụ mở sàn,
  When mở một sàn mới, chạy lại đúng lệnh ấy, và mở sàn cùng tên khi đã có sàn đang chạy với một người chỉ mang Quản trị sàn,
  Then người đầu tiên của sàn mới có đúng năm vai lấy từ bảng ở lõi; chạy lại không thêm, không bớt vai; người của sàn đang
  chạy giữ nguyên vai đang có.

- **AC-3** — Màn Người dùng tích sẵn và cho gỡ bớt. (cross-layer)
  Given quản trị sàn đang ở Cài đặt › Sàn › Người dùng trên bản đang chạy,
  When mở hộp Mời, tích Quản trị sàn, bỏ tích Telesales rồi mời; mở hộp Sửa của một người chỉ mang Telesales, tích Trưởng nhóm
  rồi lưu; và mở hộp Sửa của một người đang mang đủ năm vai, bỏ tích bốn vai làm việc rồi lưu,
  Then sau khi tích Quản trị sàn cả năm ô đều tích và ô vừa bỏ không tự tích lại; hộp có dòng mô tả nói về vai đi kèm; đọc lại
  trên cơ sở dữ liệu: người mới đúng bốn vai đã chọn (không Telesales), người chỉ mang Telesales có thêm đúng các vai Trưởng
  nhóm kéo theo, người đủ năm vai còn đúng Quản trị sàn; dòng người ở danh sách hiện đúng các vai ấy.

- **AC-4** — Máy chủ lưu đúng điều được gửi.
  Given API `POST` và `PATCH` thành viên trên Postgres của dãy,
  When POST với vai chỉ gồm `company_admin`, POST đủ năm vai, và PATCH một người đang mang đủ năm vai xuống chỉ `company_admin`,
  Then đọc lại đúng mảng đã gửi: không tự thêm vai, và PATCH thay thế chứ không gộp vào vai cũ.

- **AC-5** — Người mang đủ vai thấy mọi nhà và nút tạo. (cross-layer)
  Given bảng nhà, nút theo vai ở lõi, và một sàn mới mở bằng công cụ mở sàn trên Postgres của dãy,
  When dựng vỏ cho người mang đủ năm vai, và người đầu tiên của sàn mới đăng nhập trên bản đang chạy,
  Then có Hôm nay, Bảng hàng, Đã gửi, Liên hệ, Đội, Cài đặt và các nút «+ Lead», Nhập Excel, Xuất; người chỉ mang Quản trị sàn
  vẫn chỉ có Cài đặt.

- **AC-6** — Thấy chủ nhà cả sàn, mỗi lần mở số một vết; người chỉ cấu hình vẫn không thấy. (cross-layer)
  Given một sàn có căn của người khác giữ, một người mang đủ năm vai và một người chỉ mang Quản trị sàn,
  When mỗi người đọc chủ nhà và mở số của căn ấy qua API,
  Then người mang đủ vai đọc được và mỗi lần mở số thêm đúng một dòng vết; người chỉ mang Quản trị sàn nhận từ chối của
  đường đọc nguồn với mã ghim sẵn, không có dòng vết nào, và cùng phiên ấy đọc được danh sách Người dùng (phiên hợp lệ).

- **AC-7** — Luật theo dòng giữ nguyên và điều đang đúng được ghi lại.
  Given diff của nhánh so với nhánh chính và tài liệu sản phẩm,
  When đọc,
  Then không có migration mới; Tham chiếu §2, §6, §9 không còn ghi «chưa dựng» cho việc này và §12 có dòng ngày dựng;
  ADR-0010 và ADR-0011 có mục sửa đổi nêu cách B.

- **AC-8** — Giao diện đúng khuôn của nhóm Cài đặt sàn.
  Given các tệp giao diện vòng này chạm,
  When chạy lưới khuôn và sàn thiết kế,
  Then không có dòng lệch mới và không có mã màu thô.

## Coverage

| Đường trao vai | Bật | Tắt / gỡ bớt | Chạy lại | Sàn đang chạy |
|---|---|---|---|---|
| Bảng ở lõi | AC-1 | AC-1 | không áp dụng — hàm thuần | không áp dụng — hàm thuần |
| Công cụ mở sàn | AC-2 | không áp dụng — công cụ chỉ thêm | AC-2 | AC-2 |
| Màn Người dùng | AC-3 (Mời, Sửa) | AC-3 (Mời, Sửa) | không áp dụng — mỗi lần là một thao tác | AC-3 (người có sẵn vai) |
| API thành viên | AC-4 | AC-4 (PATCH thay thế) | không áp dụng — ghi đè | AC-4 |

| Hệ quả quyền | Mang đủ vai | Chỉ cấu hình |
|---|---|---|
| Nhà và nút | AC-5 | AC-5 |
| Xem chủ nhà | AC-6 | AC-6 |
| Vết mở số | AC-6 | AC-6 (không có vết) |

Thước CE: bản audit sàn mới ngày 0 mục 3b và bảng nhà theo vai Tham chiếu §9. Xem dòng về quét độ phủ trong sổ.

## Đường đo

Ngưỡng «người đầu tiên của sàn mới thấy đủ nhà và nút» đo bằng một lần mở sàn thử trên bản thật sau khi lên, trong 1 ngày:
giám sát trình chủ kho chạy `van-hanh:mo-san` với sàn tên «[Thử] đủ vai» và email của chính chủ kho, đăng nhập bằng mã email
như người dùng thật, kết quả ghi vào sổ quyết định của hồ sơ; sàn thử giữ lại với nhãn «[Thử]» (không có đường xoá sàn).
AC-2 và AC-5 bảo đảm phần máy. «Tích Quản trị sàn thì bốn vai tích sẵn, gỡ bớt lưu đúng» do AC-3. «Mỗi lần mở số vẫn một vết»
do AC-6. «Sàn đang chạy không đổi vai ai» do AC-2 và AC-7 (không migration).

## Out of scope

- Đổi hàm chia lead hay quyền giữ căn theo vai: đi theo vai Đầu chủ như hiện hành.
- Bước gợi ý sau khi mở sàn (tạo vùng, mời người, nhập bảng hàng cũ) và các chỗ gãy khác của bản audit ngày 0.
- Cho từng sàn tự đặt bảng kéo theo (Hỏi-4).
- Đổi vai của người đang có trên các sàn đang chạy.

## Notes

- `packages/db/tests/mo-san.test.mjs` đổi kỳ vọng ở các chỗ ghi người mở sàn chỉ mang `company_admin`; từng dòng nêu ở Cổng Bằng chứng.
