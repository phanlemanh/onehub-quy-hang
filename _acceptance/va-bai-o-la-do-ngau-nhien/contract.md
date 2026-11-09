---
schema_version: 1
feature: "Bài kiểm sổ chi phí AI của ô lạ không còn đỏ ngẫu nhiên vì mã máy và giờ ghi, mà vẫn đỏ khi số điện thoại lọt vào sổ dưới bất kỳ dạng nào."
slug: va-bai-o-la-do-ngau-nhien
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [test]
status: implemented
design_doc: docs/superpowers/specs/2026-11-09-va-bai-o-la-do-ngau-nhien-design.md
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-11-09T03:22:46Z
---

# Acceptance Contract: va-bai-o-la-do-ngau-nhien

## Context

Phép kiểm ở `packages/api/test-db/imports/o-la.test.ts` tìm `0900` và `011` trên toàn văn dòng sổ `ai_usage`, gồm cả mã
sàn, mã dòng, mã người và giờ ghi. Đo trước khi sửa: 2 lần đỏ trong 200 lần chạy liên tiếp. Ngày 08–09/11 bài này đỏ hai
lần không liên quan tới thay đổi nào, một lần làm bước triển khai trên main bị bỏ qua.

Source input: hàng `va-bai-o-la-do-ngau-nhien` (`docs/plan/lo-trinh.json`) · giao từ giám sát đợt dau-khach-nhap. Bất biến
2 của `AGENTS.md` không được yếu đi.

## Criteria

- **AC-1** — Given một dòng sổ có `011` ở mã dòng, giờ ghi, tiền, thời lượng và số token, còn mã người đúng bằng người đang
  đăng nhập, When phép kiểm đọc dòng đó, Then không báo gì; và chính dòng ấy khiến phép kiểm cũ báo đỏ.
- **AC-2** — Given số mẫu lọt vào trường chữ của sổ ở từng dạng — có khoảng trắng, liền, dấu chấm, gạch nối, đầu `+84`, đầu
  `84` — When phép kiểm đọc dòng đó, Then báo đỏ, gọi đúng tên trường, xếp là số đầy đủ.
- **AC-3** — Given chỉ phần đầu `0900` hoặc phần đuôi `011` lọt vào trường chữ, kể cả đuôi viết rời, When phép kiểm đọc dòng
  đó, Then báo đỏ, gọi đúng tên trường, xếp là một phần số.
- **AC-4** — Given mã người của dòng không phải người đang đăng nhập mà mang số mẫu hay phần đuôi, hoặc trường số mang đủ số
  mẫu, When phép kiểm đọc dòng đó, Then báo đỏ gọi đúng tên trường: trường được bỏ qua không thành lỗ hổng.
- **AC-5** — Given hai vạn dòng do Postgres sinh qua mặc định của bảng và đọc bằng đúng biểu thức của bài kiểm, giờ ghi có đủ
  biến thể (đủ sáu chữ số lẻ, ít hơn sáu, không có phần lẻ), When chạy cả hai phép kiểm, Then phép kiểm mới không đỏ dòng nào,
  phép kiểm cũ đỏ ít nhất một dòng.
- **AC-6** — Given đường ghi sổ thật qua API với gói có số điện thoại, When đường ghi bị sửa trong bản sao cho lọt số vào
  sổ, Then ca kiểm của đường ấy đỏ với thông báo «sổ chứa chuỗi số»; khi đường ghi nguyên vẹn thì xanh.
- **AC-7** — Given bản sao cây, When hàm kiểm bị sửa thành luôn báo sạch, hoặc bị bỏ phần loại trường máy, Then ca đối chứng
  đỏ với đúng thông điệp đã ghim cho mỗi kiểu phá.
- **AC-8** — Given bài kiểm đã sửa, When chạy ca của đường ghi sổ 300 lần trên Postgres thử, Then cả 300 lần xanh. Với tỉ lệ
  đỏ đo trước khi sửa là 1%, xác suất bài chưa sửa xanh cả 300 lần là khoảng 5%.
- **AC-9** — Given nhánh này, When so với nhánh chính, Then mọi tệp đổi nằm trong danh sách viết trước: hai tệp bài kiểm, thư
  mục hồ sơ, `_acceptance/config.yaml` (thêm lệnh đo), tài liệu thiết kế và kế hoạch của hàng, lộ trình, hai tệp sinh; không
  tệp mã sản phẩm, job CI, script gốc hay rào nào đổi.
- **AC-10** — Given từng cột của một dòng sổ thật đọc từ Postgres, cộng một cột giả chưa có trong sổ, When cột đó mang số mẫu
  hay phần đuôi ở dạng chuỗi, hay mang số mẫu trong mảng, hay (với cột số) mang số mẫu ở dạng số, Then phép kiểm báo đỏ gọi
  đúng tên cột, kể cả `id`, `company_id`, `created_at` khi sai dạng và `user_id` khi không phải người đang đăng nhập. Số
  phần tử ma trận bằng số assert.

## Coverage

Trục: dạng số (đầy đủ có dấu phân cách · liền · đầu quốc gia · đầu số · đuôi · đuôi viết rời) × loại trường (trường chữ tự
do · trường máy đúng dạng · trường máy sai dạng · mã người sai chủ · trường số · mảng · cột chưa có) × chiều (đỏ · xanh). AC-2
và AC-3 phủ dạng số trên trường chữ, AC-4 phủ mã người sai chủ và trường số, AC-10 phủ mọi cột thật, trường máy sai dạng,
mảng và cột chưa có, AC-1 phủ trường máy đúng dạng ở chiều xanh, AC-5 phủ giá trị ngẫu nhiên do Postgres sinh. Không gian nhỏ và
đóng nên không chạy quét hình thái — xem dòng sổ «bỏ coverage-scan».

## Out of scope

- Không sửa mã sản phẩm, migration hay cột của sổ `ai_usage`.
- Không rà các bài kiểm khác có cùng kiểu tìm chuỗi trên toàn văn dòng.
- Không đổi job CI, không đổi cách bước triển khai xử lý một lần đỏ.

## Notes

Mã dòng, mã sàn và giờ ghi do cơ sở dữ liệu sinh, câu ghi sổ không truyền ba cột này, nên phép kiểm không dò số bên trong
chúng khi chúng đúng dạng (tài liệu thiết kế, mục «Giới hạn có chủ ý»).

Phép kiểm ghép chữ số của một trường trước khi so, nên một tên mô hình mang ngày có thể trùng đầu số hay đuôi. Lỗi đó đỏ
tất định ngay khi đổi mô hình, không phải đỏ ngẫu nhiên.

Lệnh đo dùng Postgres thử riêng ở cổng 5588, cổng ghim trong `_acceptance/config.yaml` theo nếp các hồ sơ khác.
