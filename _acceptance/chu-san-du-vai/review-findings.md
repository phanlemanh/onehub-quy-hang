# Review findings: chu-san-du-vai (round 1)

## Trong hợp đồng

- **Hình 3 — Assert «chuỗi có mặt» trong khi lời hứa là quan hệ: nút tạo Lead đo bằng toàn bộ chữ của trang**
  AC: AC-5
  file: `_acceptance/chu-san-du-vai/thu/chay-ui.mjs:142`
  severity: medium
  source: measurement
  detail: Ca dau-tien-nut lấy `document.body.innerText` (dòng 131, 141) rồi xét `lead: chu.includes("Lead")`, `xuat: chu.includes("Xuất")`. Lời hứa của E5b là quan hệ «người đủ năm vai CÓ nút tạo Lead trong menu Tạo», nhưng phép đo chỉ hỏi chữ có mặt ở đâu đó trên trang. Người đủ năm vai mở /today luôn thấy chữ «Lead» từ nội dung trang: tiêu đề «Lead đã nhập» (`leads/mine/khung.tsx:15`, vùng telesales) và thẻ số «Lead quá hạn» (`today/truong-nhom.tsx:195`). Vì vậy `lead` vẫn true khi nút chính `new_lead` biến mất. Phép đo cần khoanh vào phần tử: `[aria-label="Tạo"]` hoặc `[role=menu]`, so nhãn từng mục. Ca chi-cau-hinh cũng không đo nút tạo vắng, nên phép đo này không có đối chứng ở người chỉ cấu hình.

- **Hình 4 — Assertion âm-tính-một-mình: bao404 false không bao giờ đỏ được trên trang «không thấy» của app**
  AC: AC-5
  file: `_acceptance/chu-san-du-vai/thu/chay-ui.mjs:147`
  severity: medium
  source: measurement
  detail: Ca dau-tien-bang-hang lấy `bao404: body.innerText.includes("404")` và E5b mong `bao404 false` (evals.yaml dòng 77). Trang không thấy của app trong vỏ (`apps/web/src/app/(app)/not-found.tsx`) chỉ in «Không thấy trang này» và không có chuỗi «404», nên điều kiện này false cả khi trang hỏng thật. Không có đối chứng dương: điều kiện chờ chỉ là `[data-slot=sidebar-inset]` (dòng 145), vỏ vẫn có phần tử này khi nội dung là trang không thấy, và không ca nào xác nhận bảng hàng đã dựng. Vế `url /inventory` chỉ bắt được đường redirect về /today. Cần ghim chữ thật của trang không thấy, kèm một dấu hiệu dương là lưới bảng hàng đã hiện.

- **Hình 5 — Tuyên quét lớp nhưng chỉ có điểm-case: ma trận bật không đủ «năm vai × đã có, chưa có» và không ghim số phần tử**
  AC: AC-1
  file: `packages/core/src/access/goi-vai.test.ts:20`
  severity: medium
  source: measurement
  detail: Dòng 1 và evals.yaml dòng 8 tuyên «ma trận viết trước đủ năm vai × bật, tắt × đã có, chưa có vai kéo theo». Mảng `BAT` (dòng 20-30) là 9 dòng chép tay, không đủ tích: company_admin và team_lead mỗi vai 3 dòng, còn telesales, listing_agent, buyer_agent mỗi vai 1 dòng. Trạng thái «đã có ĐỦ vai kéo theo» vắng ở cả hai vai có gói: company_admin với đủ bốn vai, team_lead với cả listing_agent và buyer_agent. Vòng lặp dòng 31 không có assert nào đối chiếu số dòng với tích `ROLES × trạng thái` (mẫu P105), nên bớt một dòng hay thêm vai mới vào `ROLES` vẫn xanh. Riêng vế tắt (dòng 40) sinh từ `TAT_CA` nên không dính lỗi này.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Bảng «vai kéo theo vai» giữ cứng nhưng chưa có dòng điều khoá ở Sổ điểm biến thiên**
  Người dùng thấy gì: Quy tắc vai đi kèm đã chạy đúng, chỉ là sổ liệt kê các chỗ cố định của sản phẩm chưa có dòng nói về nó. Người dùng không thấy khác biệt.
  Căn cứ: Chỉ là thiếu một dòng ghi chép nội bộ, không ảnh hưởng người dùng, và bổ sung sau rất rẻ.
  file: `packages/core/src/access/goi-vai.ts`
  severity: medium
  Đề xuất: known-limits

- **E1 khai đối chứng đỏ «thiếu một vai kéo theo» mà ca «bảng hợp lệ» không bắt được**
  Người dùng thấy gì: Hồ sơ nghiệm thu mô tả một phép chặn mà thực tế do ca kiểm khác đảm nhận. Sản phẩm vẫn chạy đúng.
  Căn cứ: Chỉ là lời mô tả trong hồ sơ chưa khớp, hành vi người dùng không đổi và sửa câu chữ rất rẻ.
  file: `_acceptance/chu-san-du-vai/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **E1 ghi một đối chứng đỏ không tồn tại: bảng thiếu vai kéo theo vẫn được coi là hợp lệ**
  Người dùng thấy gì: Hồ sơ nghiệm thu khai một phép chặn không có đúng như mô tả; việc mất vai vẫn bị ca khác bắt. Người dùng không bị ảnh hưởng.
  Căn cứ: Không ảnh hưởng người dùng và có lưới khác đỡ, sửa chỉ là chỉnh câu chữ hoặc thêm một kiểm tra nhỏ.
  file: `_acceptance/chu-san-du-vai/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **Bài kiểm mở sàn so bảng với chính nó: bảng mất một vai thì E2 vẫn xanh**
  Người dùng thấy gì: Nếu ai đó lỡ xoá một vai khỏi bảng, bài kiểm mở sàn không tự báo, nhưng các bài kiểm khác sẽ báo. Người dùng hiện không bị ảnh hưởng.
  Căn cứ: Đã có lưới khác bắt lỗi này nên rủi ro thấp, và thêm danh sách viết cứng rất rẻ.
  file: `packages/db/tests/mo-san.test.mjs`
  severity: low
  Đề xuất: known-limits

- **Khoá dựng chỗ thử không được nhả khi tiến trình bị ngắt, mọi lần chạy sau hỏng**
  Người dùng thấy gì: Khi một lần chạy thử bị ngắt giữa chừng, các lần chạy sau phải chờ rồi báo lỗi cho tới khi gỡ khoá tay. Chỉ ảnh hưởng người chấm, không ảnh hưởng người dùng sản phẩm.
  Căn cứ: Chỉ làm vướng người chạy thử, tự gỡ được bằng cách xoá khoá, không mất dữ liệu.
  file: `_acceptance/chu-san-du-vai/thu/dung-q.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình 4 — Assertion âm-tính-một-mình: «bảng hợp lệ» không có đối chứng thiếu vai kéo theo mà E1 tuyên bố**
  Người dùng thấy gì: Một phép chặn nêu trong hồ sơ thực tế do ca kiểm khác đảm nhận, thông điệp báo lỗi kém rõ hơn. Người dùng không bị ảnh hưởng.
  Căn cứ: Lỗi mất vai vẫn bị bắt ở nơi khác nên hậu quả nhẹ, sửa rẻ.
  file: `packages/core/src/access/goi-vai.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình 4 — Assertion âm-tính-một-mình: vaiLech rỗng so với kỳ vọng rút từ chính nguồn bên ghi, đối chứng «bảng thiếu vai» không chạy đúng điều E2 khai**
  Người dùng thấy gì: Bài kiểm mở sàn không tự bắt được trường hợp bảng vai bị mất một vai, các bài kiểm khác sẽ bắt. Người dùng không bị ảnh hưởng.
  Căn cứ: Có lưới khác đỡ và sửa rẻ nên hậu quả nhẹ.
  file: `packages/db/tests/mo-san.test.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình 2 — Fixture viết tay: đối chứng người chỉ cấu hình trong ca Postgres dùng mảng vai gõ tay, không đọc lại qua /me**
  Người dùng thấy gì: Một phần kiểm tra người chỉ làm cấu hình dùng dữ liệu gõ tay thay vì đọc từ hệ thống, nên có thể không bắt lỗi ở đường đọc quyền. Các bài kiểm khác vẫn đo đường thật.
  Căn cứ: Có lưới khác đo đường thật cho cùng điều này, rủi ro thấp.
  file: `packages/api/test-db/chu-san-du-vai/du-vai.test.ts`
  severity: low
  Đề xuất: known-limits

- **Hình 2 — Fixture viết tay: ca «mở hộp Sửa, không bấm ô nào» gọi hàm bằng đầu vào mà hộp thật không bao giờ tạo ra**
  Người dùng thấy gì: Một ca kiểm nhỏ về hộp Sửa dùng đầu vào gõ tay thay vì thao tác thật. Bài nhìn màn vẫn đọc trạng thái hộp thật.
  Căn cứ: Hành vi người dùng đã có bài nhìn màn đo, ca này chỉ là lớp phụ nên rủi ro thấp.
  file: `apps/web/src/app/(app)/settings/users/vai-trong-hop.test.ts`
  severity: low
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 2/12 lỗi rơi vào file không bộ đo nào phủ (_acceptance/chu-san-du-vai/evals.yaml) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
