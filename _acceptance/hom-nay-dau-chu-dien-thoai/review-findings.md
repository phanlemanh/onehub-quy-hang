# Review findings: hom-nay-dau-chu-dien-thoai (round 3)

## Trong hợp đồng

- **Bài E1 «rẽ khổ» đo một hàm màn hình không dùng: laDienThoai/MOC_DIEN_THOAI không phải chỗ thật quyết định khổ**
  file: `apps/web/src/app/(app)/today/mobile/goi.ts:9`
  severity: medium
  AC: AC-1
  source: conventions
  detail: Màn chọn giữa điện thoại và máy tính bằng `useIsMobile()` (hom-nay-dau-chu.tsx, dòng ~506, `const dienThoai = useIsMobile()`), và hook này giữ mốc 768 riêng của nó. `laDienThoai` và `MOC_DIEN_THOAI` trong goi.ts chỉ được gọi ở goi.test.ts (grep ngoài các tệp test không ra chỗ dùng nào). Vì vậy bài «E1 rẽ khổ: dưới 768 là điện thoại… (5 khổ)» vẫn xanh kể cả khi `useIsMobile` hay màn đổi mốc hoặc đổi cách rẽ khổ. Bài này đo một bản sao của luật, trái với nguyên tắc của lượt S4-r2 là «mọi chạm qua hàm thuần, bài đo gọi thật». Mốc 768 cũng bị viết hai lần (goi.ts và hooks/use-mobile.ts). Cần cho màn rẽ khổ qua cùng một hàm hoặc hằng mà bài kiểm gọi, hoặc bỏ hàm này và đo thẳng `useIsMobile`.
  rationale: AC-1 đòi màn rẽ đúng ở mốc 768 px, mà bài đo rẽ khổ chỉ đo một bản sao của luật nên không chứng minh được AC-1.

- **Hình dạng 1 — Đo CHỈ DẪN thay vì ĐẦU RA: E1 rẽ khổ đo hàm laDienThoai mà màn không đọc**
  file: `apps/web/src/app/(app)/today/mobile/goi.test.ts:18`
  severity: high
  AC: AC-1
  source: measurement
  detail: Test «E1 rẽ khổ» (goi.test.ts:18-31) chạy ma trận 5 khổ 375/390/767/768/1440 qua `laDienThoai(r)` của goi.ts:10. Hàm này không được gọi ở đâu ngoài test (grep apps/web/src chỉ ra chỗ định nghĩa). Màn thật chọn bản điện thoại hay lưới bằng `const dienThoai = useIsMobile()` ở hom-nay-dau-chu.tsx:512, mà useIsMobile có mốc riêng `MOBILE_BREAKPOINT = 768` ở hooks/use-mobile. Vì vậy ma trận AC-1 chỉ kiểm một hàm phụ không nối vào đâu, không kiểm đường rẽ thật. Đổi mốc của useIsMobile hay bỏ hẳn nhánh rẽ thì E1 vẫn xanh.
  rationale: Ma trận 5 khổ là bằng chứng cho AC-1 nhưng đo hàm không nối vào màn, nên đổi mốc thật vẫn xanh.

- **Hình dạng 2 — Fixture viết tay đúng khuôn bên đọc: hàm lam/ghiKetQua giả thay cho cách nối thật của màn**
  file: `apps/web/src/app/(app)/today/mobile/danh-sach.test.ts:100`
  severity: medium
  AC: AC-5
  source: measurement
  detail: evals E6 hứa «Còn · giữ giá» gọi hàm ghi của kho trên máy (cùng hàm máy tính dùng), và E5 hứa chọn việc khác gọi đúng hàm của nút cùng tên ở máy tính. lechBam (dòng 99-104) tự viết `lam: (x) => ... { onClick: () => g.push(`lam:${x}`) }`, còn lechChon (dòng 157) tự viết `ghiKetQua: (x) => g.push(`ghi:${x}`)`, rồi so với chuỗi `lam:con-giu-gia` hay `ghi:da-goi` do chính các hàm giả đó sinh ra. Cách nối thật từ mã việc sang hành động máy tính (lamCan/lamLead/ghiKetQua trong theCua ở hom-nay-dau-chu.tsx:514-534, ví dụ `con-giu-gia` → `hd.conGiuGia`) không đi qua test nào. Nếu theCua nối «Còn · giữ giá» sang hàm khác thì E5/E6 vẫn xanh.
  rationale: AC-5 đòi chọn việc thì ghi như nút cùng tên ở máy tính, mà bài đo dùng hàm giả nên không chứng minh được việc nối thật.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **moSoChu gộp 403 «không phải đầu chủ giữ căn» vào lời «Căn chưa có số chủ — mở hồ sơ để ghi số»**
  Người dùng thấy gì: Nếu căn vừa được giao cho người khác mà màn chưa cập nhật, đầu chủ chạm «Gọi» sẽ nghe bảo căn chưa có số chủ, thay vì biết căn không còn của mình.
  Căn cứ: Chỉ sai lời báo trong tình huống hiếm, không lộ số chủ và không mất dữ liệu; tải lại màn là thấy đúng, nên chấp nhận và ghi lại.
  file: `apps/web/src/app/(app)/today/mobile/mo-so-chu.ts`
  severity: low
  Đề xuất: known-limits

- **moSoChu gộp 403 (không còn giữ căn) và 404 (không thấy căn) thành «Căn chưa có số chủ», đầu chủ được chỉ sai việc phải làm**
  Người dùng thấy gì: Khi căn không còn của mình hoặc không còn tồn tại, đầu chủ vẫn bị bảo đi ghi số chủ, nên có thể mở hồ sơ một căn không phải việc của mình rồi mất công.
  Căn cứ: Hậu quả nhẹ là chỉ dẫn gây nhầm, quyền truy cập vẫn bị chặn đúng và không lộ dữ liệu; người dùng tải lại là hết, sửa sau cũng không đắt.
  file: `apps/web/src/app/(app)/today/mobile/mo-so-chu.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 — Assertion âm tính đứng một mình, không ghim thông điệp: mở số chủ trả 404**
  Người dùng thấy gì: Nếu lời báo khi căn chưa có số chủ bị đổi nhầm sang lời khác, bài kiểm vẫn không báo động, nên người dùng có thể thấy câu sai mà không ai hay.
  Căn cứ: Chỉ ảnh hưởng chữ báo lỗi trong tình huống hiếm, không mất dữ liệu; dễ phát hiện và sửa sau với chi phí thấp.
  file: `apps/web/src/app/(app)/today/mobile/goi.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 — Chiều đỏ âm tính không ghim thông điệp: E1 bản sao đảo thứ tự nhóm**
  Người dùng thấy gì: Bộ so thứ tự nhóm có thể chưa chứng minh được mình bắt đúng lỗi đảo nhóm, nên một lần đảo thứ tự giữa điện thoại và máy tính có thể lọt.
  Căn cứ: Là điểm yếu của bài kiểm chứ không phải lỗi người dùng thấy ngay; chiều xanh vẫn so thứ tự thật, và vá sau rẻ.
  file: `apps/web/src/app/(app)/today/mobile/danh-sach.test.ts`
  severity: medium
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).

