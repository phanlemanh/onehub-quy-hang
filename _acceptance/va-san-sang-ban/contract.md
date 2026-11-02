---
schema_version: 1
feature: Vá Sẵn sàng bán — chuyển căn hay điền xong thì «Còn thiếu» và «Chưa có» làm mới đúng căn đang xem; nút chỉ báo đã gửi khi lệnh vào hàng đợi, không vào thì báo lỗi và giữ nút bấm lại được
slug: va-san-sang-ban
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: signed-off
design_doc: docs/superpowers/specs/2026-11-02-va-san-sang-ban-design.md
approved_by: Manh Phan
approved_at: 2026-11-02
---

# Acceptance Contract: va-san-sang-ban

## Context

Hàng phát sinh từ Cổng Bằng chứng hàng 23 (`_acceptance/san-sang-ban/`): chủ kho chọn «mở hợp đồng mới» cho Ngoài-2 và
Ngoài-5 (danh sách «Còn thiếu» và dấu «Chưa có» của căn trước còn hiện) và Ngoài-4 (nút báo đã gửi dù lệnh không vào hàng
đợi). Không đổi máy chủ, cơ sở dữ liệu hay luật lõi; chỉ nút «Sẵn sàng bán» và cột hồ sơ căn.

## Criteria

- AC-1: Given đầu chủ bấm «Sẵn sàng bán» ở căn A và thấy «Còn thiếu», When chuyển cột hồ sơ sang căn B (căn khác hay lần rao
  khác), Then cột của B không hiện danh sách «Còn thiếu» và không ô nào mang dấu «Chưa có · điền ở Bảng hàng» hay «Chưa có
  giá về tay» khi đầu chủ chưa bấm ở B; quay lại A thì nút ở trạng thái chưa bấm.
- AC-2: Given dấu «Chưa có» đang hiện ở căn A, When cột chuyển sang một căn không có nút (Đang bán, Đã cọc…), hay lần rao của A
  lên Đang bán, Then không ô nào còn dấu «Chưa có».
- AC-3: Given danh sách «Còn thiếu» đang hiện, When một điều thiếu được điền vào hàng trên máy (mã căn, giá và điều kiện phí,
  pháp lý, tình trạng sử dụng), Then điều đó rời danh sách và dấu «Chưa có» của nó mất ngay, không cần bấm lại; còn điều thiếu
  khác thì vẫn hiện; hết điều thiếu thì danh sách biến mất và máy không tự gửi lệnh. «Ảnh thật» dùng số ảnh đếm ở lần bấm, dưới
  danh sách ghi «Ảnh thật cập nhật khi bấm lại» (Hỏi-2).
- AC-4: Given căn đủ điều, When đầu chủ bấm mà lệnh không vào hàng đợi (luật trên máy từ chối, kho trên máy lỗi, hay hàm gửi
  ném lỗi), Then nút không báo «đã gửi»: hiện lời báo lỗi bằng câu của trình sửa ô (Hỏi-1) ở chỗ của danh sách, nút vẫn
  bấm được.
- AC-5: Given căn đủ điều, When lệnh vào hàng đợi, Then trả «đã gửi» như hàng 23 và đúng một lệnh được gửi (đối chứng).
- AC-6: Given bản chạy dev của dãy H, When đầu chủ bấm «Sẵn sàng bán» ở một căn thiếu rồi chọn căn khác trong Bảng hàng, Then
  mắt thấy cột của căn mới không còn danh sách và dấu của căn trước; quay lại căn đầu thì nút ở trạng thái chưa bấm; điền
  pháp lý ở Bảng hàng thì dòng «Pháp lý» rời danh sách mà không phải bấm lại.

## Coverage

Bỏ quét không gian: ba lỗi đã có tên từ Cổng Bằng chứng hàng 23, mỗi lỗi một nhóm tiêu chí (descope «bỏ coverage-scan»).

## Out of scope

- Dòng «Ảnh thật» tự cập nhật khi thêm ảnh ở mục Ảnh — làm mới ở lần bấm sau (Hỏi-2).
- Lời báo khi máy chủ từ chối sau khi lệnh đã vào hàng đợi — đường «Cần xem» của hàng 23 giữ nguyên.
- Cấu hình số ảnh tối thiểu sai (Ngoài-3, Ngoài-6 hàng 23) — hạn chế đã biết của hàng 23.

## Notes

- Ngoài-1 (máy định tuyến 2026-11-02, đề xuất S4 known-limits): Nếu có lỗi bất ngờ khi bấm Sẵn sàng bán, người dùng vẫn thấy lời báo «Máy chưa lưu được lần sửa — thử lại» và bấm lại được. Nhưng lỗi thật không để lại dấu vết nên đội kỹ thuật khó biết và khó tìm nguyên nhân. — `apps/web/src/app/(app)/units/ready/san-sang.ts`
- Ngoài-2 (máy định tuyến 2026-11-02, đề xuất S4 known-limits): Một bài kiểm tra về việc dấu «Chưa có» biến mất khi chuyển căn không thật sự chạy bước dọn dấu. Nếu sau này ai đó làm hỏng bước ấy, bài kiểm tra vẫn xanh và dấu cũ có thể lại hiện ở căn khác. — `apps/web/src/app/(app)/units/ready/san-sang.test.ts`
- Ngoài-3 (máy định tuyến 2026-11-02, đề xuất S4 known-limits): Bài kiểm tra không phát hiện được nếu ai đó bớt đi một số tình huống đã hứa kiểm. Người dùng không thấy gì khác hôm nay. — `apps/web/src/app/(app)/units/ready/san-sang.test.ts`
- Known limits — chọn ở Cổng Bằng chứng 2026-11-02:
  - Ngoài-1: Lỗi bất ngờ khi bấm «Sẵn sàng bán» hiện «Máy chưa lưu được lần sửa — thử lại» mà không để lại dấu vết cho đội kỹ thuật.
  - Ngoài-2: Bài kiểm việc dấu «Chưa có» biến mất khi chuyển căn không chạy thật bước dọn dấu.
  - Ngoài-3: Bài kiểm danh sách «Còn thiếu» không phát hiện nếu ai đó bớt ca đã hứa kiểm.
