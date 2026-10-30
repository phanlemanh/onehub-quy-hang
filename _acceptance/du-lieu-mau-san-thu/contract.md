---
schema_version: 1
feature: Bộ dữ liệu mẫu của một sàn thử — một dự án căn hộ, hai mẫu file bảng hàng Excel, lead và chủ nhà giả — sinh từ khuôn của bảng hàng thật, mọi bản ghi mang nhãn mẫu
slug: du-lieu-mau-san-thu
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [cli, db]
status: verified
approved_by: Manh Phan
approved_at: 2026-10-31
design_doc: _acceptance/du-lieu-mau-san-thu/design.md
---

# Acceptance Contract: du-lieu-mau-san-thu

## Context

Hàng 5 của lộ trình: một lệnh dựng sàn thử với dữ liệu giả để đội dựng và thử tính năng trước khi có người dùng thật
(Mạnh 29/10). Bộ dữ liệu sinh tất định từ một hạt giống; phần ghi được vào bảng hiện có thì nạp vào cơ sở dữ liệu, phần
còn lại (danh mục, hàng, chủ nhà, lead) nằm trong tệp chờ các hàng dựng bảng.

Source input: `docs/plan/lo-trinh.json` hàng 5 · `_acceptance/du-lieu-mau-san-thu/opportunity.md`

## Criteria

- AC-1: Given cùng hạt giống, When lệnh sinh chạy hai lần trong hai tiến trình riêng, Then bộ dữ liệu và hai tệp Excel
  trùng nhau từng byte, và trùng tệp đã commit trong kho; đổi hạt giống thì bộ dữ liệu khác.
- AC-2: Given bộ dữ liệu, hai tệp Excel và các dòng đã nạp vào cơ sở dữ liệu, When quét toàn văn, Then mọi số điện thoại
  có dạng `0900 000 0xx`, mọi email thuộc miền `mau.quy-hang.test`, mọi tên người và tên sàn mở đầu bằng «[Mẫu]»; chèn
  một số hay tên khác dạng vào bản sao thì bài quét đỏ.
- AC-3: Given mọi loại bản ghi (sàn, người, căn, chủ nhà, hàng, lead, dòng của hai file Excel, dòng cơ sở dữ liệu), When
  kiểm nhãn, Then bản ghi nào cũng mang nhãn mẫu, đếm theo từng loại khớp số bản ghi của loại đó.
- AC-4: Given danh mục mẫu, When đọc bằng khuôn danh mục của `packages/connect`, Then khuôn nhận không lỗi; mã căn duy
  nhất; tầng, trục và toà đọc từ mã căn khớp thuộc tính của căn.
- AC-5: Given hàng, chủ nhà và lead mẫu, When kiểm theo luật Tham chiếu §4 và §5, Then đủ sáu trạng thái chuẩn; mỗi căn
  tối đa một hàng đang mở; mọi căn của một chủ nhà cùng một đầu chủ; có ít nhất một lead trên căn đã có hàng mở và một
  lead mang số của chủ nhà đã có.
- AC-6: Given hai mẫu file Excel, When đọc lại từng tệp, Then mỗi dòng ứng đúng một hàng mẫu và giá trị từng ô bằng giá
  trị của hàng đó theo cách ghi của mẫu (giá, điều kiện phí, trạng thái); hai mẫu khác nhau về tiêu đề, thứ tự cột và cách
  ghi giá trị.
- AC-7: Given Postgres đã áp mọi migration và chưa có dữ liệu mẫu, When chạy lệnh nạp, Then có sàn thử, sáu người mẫu với
  đúng vai, hai khu là hai toà, đầu chủ phụ trách khu của mình; chạy lệnh nạp lần nữa thì số dòng và nội dung không đổi.
- AC-8: Given dữ liệu mẫu đã nạp cùng một sàn khác và một tài khoản khác không phải mẫu, When chạy lệnh xoá một lần, Then
  không còn dòng nào mang nhãn mẫu ở mọi bảng đã nạp, còn sàn và tài khoản kia nguyên vẹn; nạp lại sau đó cho đúng dữ
  liệu như lần đầu.

## Coverage

Quét bằng tay theo bốn trục — bảng ở `design.md` mục «Không gian đã quét»; lý do không dùng bộ quét: d-20261030T170512Z-6 trong
`decisions.jsonl`.

- Trục A — loại bản ghi: sàn | người | căn | chủ nhà | hàng | lead | dòng file A | dòng file B | dòng cơ sở dữ liệu [thước
  CE: Tham chiếu §4 «Đối tượng»] → AC-2, AC-3
- Trục B — tính chất của ngưỡng: tất định | không dữ liệu thật | nhãn mẫu | xoá được một lần [thước CE: `bat_khi` của hàng
  5] → AC-1, AC-2, AC-3, AC-8
- Trục C — luật của khuôn: khuôn danh mục | sáu trạng thái | một hàng mở mỗi căn | một chủ một đầu chủ | ca trùng của lead
  [thước CE: Tham chiếu §4, §5 · `packages/connect/src/catalog-feed.ts`] → AC-4, AC-5
- Trục D — đích: tệp trong kho | cơ sở dữ liệu [thước CE: Kiến trúc §0, migrations 001–003] → AC-1, AC-6, AC-7, AC-8

## Đường đo

- Thước: sinh lại hai lần ra cùng dữ liệu · số từ: băm SHA-256 của ba tệp đầu ra qua hai tiến trình và so với tệp trong
  kho · bảo đảm bởi: AC-1
- Thước: không tên hay số điện thoại thật · số từ: quét toàn văn bộ dữ liệu, chuỗi của hai tệp Excel và các dòng đã nạp ·
  bảo đảm bởi: AC-2
- Thước: mọi bản ghi mang nhãn mẫu và xoá được một lần · số từ: đếm nhãn theo loại bản ghi; đếm dòng mẫu trước và sau
  lệnh xoá trên Postgres dãy · bảo đảm bởi: AC-3, AC-8

## Out of scope

- Bảng danh mục, hàng, chủ nhà, lead trong cơ sở dữ liệu và việc nạp chúng — đi cùng các hàng 8, 9–10, 11, 24; các hàng
  ấy đọc `packages/db/seed/mau/du-lieu-mau.json`.
- Ảnh mẫu, tin rao ngoài, số liệu thị trường.
- Dự án thật cho sàn thử — chủ kho chọn sau.
- Chặn riêng cho môi trường thật khi chạy lệnh xoá — kho chưa có môi trường thật.

## Notes

- Ranh giới của hàng: `_acceptance/du-lieu-mau-san-thu/**`, `packages/db/seed/**`; không migration, không sửa
  `package-lock.json`.
- Tiêu đề cột của hai mẫu file là tiêu đề soạn từ Tham chiếu, chưa từ file thật (T-10); có file thật thì sinh lại. Mở bằng Excel thật không có thước máy — máy đọc lại bằng thư viện chuẩn của Python, ảnh tiêu đề trình ở Cổng Bằng chứng.
- Dòng lệnh chạy bài kiểm `executors.script.du_lieu_mau` thêm vào `_acceptance/config.yaml` theo yêu cầu T-9 (giám sát duyệt).
