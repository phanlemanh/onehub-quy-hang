## Trong hợp đồng

- **Hình dạng 4 (âm tính một mình, không đối chứng dương) và lệch khuôn: bài quét rò rỉ chủ nhà ở E9 quét giá trị không phải tên và số thật của các căn**
  file: `_acceptance/doi-dau-chu-hang-loat/thu/chay-ui.mjs:20`
  severity: high
  AC: AC-3
  detail: Dòng 20 khai `MOC_CHU = ["[Mẫu] Chủ nhà X", "[Mẫu] Chủ nhà Y"]`, dòng 98 lấy `lo = MOC_CHU.filter((m) => hop.text.includes(m))` và ghi `loChuNha: lo`. Hai chuỗi này chỉ là `contacts.full_name` mà dung-h.mjs --mau (dòng 65-66) chèn vào. Tên chủ nhà thật của 5 căn nằm ở `listing_owners.owner_name` và số điện thoại do nap-hang.mjs (dòng 57-59) ghi qua PUT …/owner (`cn?.ten`, `cn?.soDienThoai` hoặc `0900 000 0${10+i}`). Hai giá trị đó không có trong danh sách quét, và bài cũng không quét số điện thoại nào. Bước E9 trong evals.yaml hứa quét bốn giá trị «[Tên] C1-mau», «[Tên] C2-mau», «0900 000 011», «0900 000 012», nhưng dữ liệu nạp ở dãy H không hề chứa bốn giá trị này. Kịch bản cũng không có đối chứng dương nào (cài một mồi vào DOM rồi xem có bị bắt không), nên `loChuNha: []` luôn ra rỗng bất kể hộp hỏi có làm lộ chủ nhà hay không.
  rationale: AC-3 đòi không chữ nào của tên hay số chủ nhà có trong hộp hỏi; bài quét E9 không quét đúng giá trị nên không chứng minh được AC này.
  source: measurement

- **Hình dạng 5 (tuyên quét cả lớp nhưng chỉ có vài điểm): ca «chỉ trưởng nhóm gọi được ba hàm» chỉ kiểm hai hàm**
  file: `packages/db/tests/isolation.test.mjs:2690`
  severity: medium
  AC: AC-1
  detail: Tên ca là `đổi đầu chủ: chỉ trưởng nhóm gọi được ba hàm`, E6 cũng hứa «người không phải trưởng nhóm gọi ba hàm → từ chối». Thế nhưng vòng `for (const ai of [LH.DC1, LH.TS, LH.QT])` chỉ gọi `expectError` cho `app.preview_listing_agent_reassignment` và `app.reassign_listing_agents`. Không có ô nào gọi `app.undo_listing_agent_reassignment` bằng vai không phải trưởng nhóm. Tập vai cũng thiếu đầu khách, trong khi ma trận 6 tổ hợp của E1/E1c có vai này. Như vậy ở lớp cơ sở dữ liệu, ma trận vai × hàm chỉ có 3×2 = 6 ô trên 3×3 hoặc 4×3 ô mà tên ca tuyên bố. Nếu hàm hoàn tác thiếu kiểm vai thì ca này vẫn xanh.
  rationale: AC-1 đòi từ chối người không có vai Trưởng nhóm cho cả ba lệnh, mà ca kiểm bỏ sót lệnh hoàn tác.
  source: measurement

- **Hình dạng 1 (đo mã nguồn thay vì đầu ra): thông báo 10 giây kèm «Hoàn tác» và nhãn ô chọn người nhận được kiểm bằng regex trên mã nguồn**
  file: `apps/web/src/app/(app)/inventory/bulk/doi-dau-chu.test.ts:109`
  severity: medium
  AC: AC-4
  detail: Dòng 109 chỉ dò chuỗi trong mã nguồn: `assert.match(doc("hop-doi-dau-chu.tsx"), /duration: THOI_GIAN_HOAN_TAC, action: \{ label: "Hoàn tác"/)`. Bài không gọi `toast` rồi đọc thời lượng và hành động thật. Dòng 158 làm tương tự cho lời hứa «ô chọn người nhận hiện tên đầu chủ, không hiện mã người» bằng regex `<Select value=\{nhan\} items=\{dauChu.map(...label: d.displayName...)\}/`, không dựng thành phần rồi đọc chữ hiển thị. Chỉ cần đổi cách viết (tách biến, đổi thứ tự prop) là bài đỏ dù hành vi không đổi. Ngược lại, khi hành vi sai mà chuỗi vẫn khớp (ví dụ SelectValue không dùng `items` để dựng nhãn) thì bài vẫn xanh. Lời hứa nằm ở đầu ra, còn phép đo nhắm vào chữ trong mã.
  rationale: AC-4 đòi thông báo hiện 10 giây kèm «Hoàn tác»; phép đo chỉ dò chữ trong mã, không đo hành vi thật.
  source: measurement

- **Hình dạng 4 (âm tính một mình, không đối chứng dương): bài nút tắt khi mất mạng không đối chứng với nút khi có mạng đã dựng**
  file: `apps/web/src/app/(app)/inventory/bulk/doi-dau-chu.test.ts:37`
  severity: low
  AC: AC-7
  detail: Ca `E1b mất mạng: nút dựng ở trạng thái tắt kèm lời` chỉ dựng `coMang: false` rồi `assert.match(html, /disabled=""/)`. Không có ca nào dựng `coMang: true` để khẳng định HTML không có `disabled`. `coNut` ở dòng 26 chỉ kiểm có chữ «Đổi đầu chủ», còn `trangThaiNut(true)` ở dòng 64 chỉ là hàm thuần, không phải nút đã dựng. Vì thế nếu nút luôn ở trạng thái tắt (ví dụ `disabled` gắn cứng) thì mọi bài E1b vẫn xanh.
  rationale: AC-7 đòi lệnh tắt khi mất mạng; bài kiểm không có đối chứng nên nút luôn tắt vẫn qua.
  source: measurement

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Lối hoàn tác ghi vào căn mà không kiểm trục ai thấy hàng; bảng đường chạm hàng có lối này nhưng không có ca kiểm nào**
  Người dùng thấy gì: Nếu một căn bị chuyển sang «Chỉ tôi» sau lần đổi, trưởng nhóm vẫn có thể hoàn tác và đổi đầu chủ của căn mình không còn xem được.
  Căn cứ: Hiếm gặp (cần đổi chế độ xem giữa chừng) nhưng làm lộ quyền trên căn người dùng không thấy; sửa sau không mất dữ liệu nhưng cần hợp đồng riêng vì chạm luật ai thấy hàng.
  file: `packages/api/src/listings/doi-dau-chu.ts`
  severity: medium
  Đề xuất: new-contract

- **Mã lỗi quá trần 200 căn trả 400, lệch quy ước lỗi quá trần của nghiệp vụ đang trả 422**
  Người dùng thấy gì: Người dùng không thấy khác biệt: lời «Tối đa 200 căn một lần» vẫn hiện và không căn nào bị đổi.
  Căn cứ: Chỉ lệch quy ước nội bộ giữa các loại lỗi, không ảnh hưởng người dùng; hợp đồng đã chốt mã này nên đổi chỉ tốn công mà không có lợi.
  file: `packages/api/src/errors.ts`
  severity: low
  Đề xuất: wont-fix

- **Hoàn tác trả liên hệ chủ nhà cho người đã mất vai Đầu chủ, trong khi căn của chủ ấy bị bỏ qua — vỡ luật một chủ một đầu chủ**
  Người dùng thấy gì: Nếu đầu chủ cũ đã nghỉ hoặc mất vai trước khi hoàn tác, liên hệ chủ nhà trả về người đó trong khi căn vẫn ở người nhận, nên liên hệ không ai thấy được và thông báo đếm lệch.
  Căn cứ: Chỉ xảy ra khi người giữ cũ rời sàn trong lúc hoàn tác, nhưng để lại liên hệ mồ côi khó tự phát hiện; sửa cần chạm migration nên nên đi hợp đồng riêng.
  file: `packages/db/migrations/027_doi_dau_chu.sql`
  severity: medium
  Đề xuất: new-contract

- **Không tải được danh sách đầu chủ thì hộp đổi đầu chủ im lặng, ô chọn người nhận rỗng và không báo lỗi**
  Người dùng thấy gì: Khi mạng chập chờn lúc mở hộp, ô chọn người nhận trống và nút đổi tắt mà không có lời giải thích; người dùng chỉ biết đóng và mở lại.
  Căn cứ: Không mất hay lộ dữ liệu, người dùng tự gỡ bằng cách mở lại hộp; chỉ gây khó hiểu nhất thời.
  file: `apps/web/src/app/(app)/inventory/bulk/hop-doi-dau-chu.tsx`
  severity: low
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
