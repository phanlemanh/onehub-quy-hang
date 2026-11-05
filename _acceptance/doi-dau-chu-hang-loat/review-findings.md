## Trong hợp đồng

- **Hình dạng 4 (assertion âm tính đứng một mình): bài E3 quét số điện thoại chủ nhà nhưng chưa bao giờ ghi số đó vào cơ sở dữ liệu**
  AC: AC-3
  file: `packages/api/test-db/doi-dau-chu/doi-dau-chu.test.ts:151`
  severity: high
  source: measurement
  detail: Danh sách MOC_CHU có bốn chuỗi số «0900000011», «0900 000 011», «0900000012», «0900 000 012», và dòng `assert.deepEqual(quetLo(than), [], ...)` khẳng định bản xem trước không chứa chúng. Nhưng hàm dựng dữ liệu chuNha chỉ ghi full_name vào contacts và owner_name vào listing_owners. Không có dòng nào trong contact_phones hay bất kỳ cột số điện thoại nào, cả tệp không có câu insert số nào. Vì vậy với bốn chuỗi số, assertion âm tính đúng một cách hiển nhiên: dù bản xem trước có nối thẳng bảng số của chủ nhà thì bài vẫn xanh. Bài «đối chứng dương» chỉ chứng minh bộ quét bắt được chuỗi chèn tay; nó không chứng minh số đó có trong dữ liệu nguồn. evals E3 hứa «cài tên và số riêng cho từng chủ … rồi quét đúng bốn giá trị ấy», nhưng code mới làm một nửa: chỉ cài tên.

- **Hình dạng 3 (khẳng định chuỗi có mặt trong khi lời hứa là quan hệ): E1b đo nút «Đổi đầu chủ» bằng cách tìm lời gọi canReassignListingAgents(vai) trong mã nguồn**
  AC: AC-1
  file: `apps/web/src/app/(app)/inventory/bulk/doi-dau-chu.test.ts:13`
  severity: medium
  source: measurement
  detail: evals E1b hứa thanh dựng mục «Đổi đầu chủ» khi và chỉ khi hàm quyền của lõi trả true. Đây là quan hệ giữa kết quả hàm và việc nút có hiện hay không. lechQuyen chỉ dùng regex kiểm ba điều: chuỗi `canReassignListingAgents(vai)` có trong hop-doi-dau-chu.tsx, chuỗi `{doiDauChu.nut}` có trong thanh.tsx, và không có chuỗi 'team_lead'. Một bản sao vẫn gọi hàm nhưng bỏ dòng `if (!duoc) return { nut: null, hop: null }` (dòng 98 của hop-doi-dau-chu.tsx), hoặc đảo điều kiện, vẫn qua cả ba kiểm. Vế «chỉ khi» không có bài đo nào: không gọi useDoiDauChu với vai false để xem nút có bằng null không. Chiều đỏ chỉ thử chèn chuỗi 'team_lead', không thử bỏ điều kiện chặn.

- **Hình dạng 3 (khẳng định chuỗi có mặt trong khi lời hứa là quan hệ): «kéo lại ngay sau đổi và sau hoàn tác» được đo bằng cách đếm chuỗi trong mã nguồn**
  AC: AC-4
  file: `apps/web/src/app/(app)/inventory/bulk/doi-dau-chu.test.ts:87`
  severity: low
  source: measurement
  detail: Bài «E4b sau đổi và sau hoàn tác, bộ đồng bộ kéo lại ngay» chỉ đếm số lần chuỗi `await bd.thuNgay()` xuất hiện trong hop-doi-dau-chu.tsx và đòi bằng 2. Lời hứa là thứ tự: lệnh kéo lại chạy sau khi đổi thành công và sau khi hoàn tác thành công. Đếm chuỗi không ràng buộc hai lần gọi nằm ở hai nhánh đó. Nếu chuyển cả hai lời gọi vào cùng một nhánh, hoặc đặt trước lệnh gọi API, bài vẫn xanh. Lời khẳng định thời lượng thông báo cũng là regex trên mã nguồn (`duration: THOI_GIAN_HOAN_TAC, action: { label: "Hoàn tác"`), không đo thông báo thật được dựng ra.

- **Hình dạng 4 (assertion âm tính không có đối chứng): ca hoàn tác chéo sàn ở E6 không phân biệt được hoàn tác có chạy hay không**
  AC: AC-6
  file: `packages/api/test-db/doi-dau-chu/doi-dau-chu.test.ts:281`
  severity: low
  source: measurement
  detail: Lần đổi lanA của sàn A được tạo bằng lệnh đổi sang chính d1 (`userId: d1.userId`) trên căn vốn do d1 giữ, tức là một lần đổi không làm gì. Lời khẳng định cuối `dauChuCua(a.companyId, ca.can[0]) === d1.userId` nhằm chứng minh «không dòng nào của A đổi». Với lệnh hoàn tác lanA từ sàn B, trạng thái trước và sau đều là d1, nên nếu hoàn tác chéo sàn lọt qua thì lời khẳng định này vẫn xanh. Chỉ còn mã 404 đứng một mình. Người giữ liên hệ của A cũng không được kiểm sau ba lệnh của sàn B.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Undo gives an owner contact back to a former agent while that agent's listing is skipped**
  Người dùng thấy gì: Nếu đầu chủ cũ đã rời sàn hoặc mất vai trước khi hoàn tác, liên hệ chủ nhà vẫn có thể được trả về cho người đó trong khi căn thì ở lại với người nhận mới.
  Căn cứ: Chỉ xảy ra khi người cũ rời sàn trong 10 giây hoàn tác, hiếm và nhẹ, không mất dữ liệu; trưởng nhóm gán lại được bằng tay.
  file: `packages/db/migrations/027_doi_dau_chu.sql`
  severity: medium
  Đề xuất: known-limits

- **Agent list fails to load and the dialog shows no error: empty picker, old holders shown as «Đầu chủ khác»**
  Người dùng thấy gì: Khi danh sách đầu chủ không tải được, hộp hỏi hiện ô chọn người nhận trống, tên người giữ cũ thành «Đầu chủ khác» và không có lời giải thích vì sao không bấm đổi được.
  Căn cứ: Chỉ gặp khi mạng hoặc máy chủ lỗi giữa chừng, không mất dữ liệu, mở lại hộp hỏi là thử lại được.
  file: `apps/web/src/app/(app)/inventory/bulk/hop-doi-dau-chu.tsx`
  severity: low
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
