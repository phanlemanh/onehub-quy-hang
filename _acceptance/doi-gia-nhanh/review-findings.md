# Review findings: doi-gia-nhanh (round 2)

## Trong hợp đồng

(không có)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **E10 expectation changed from 403 to 404 after Gate 1 sealed, to match the failing run**
  Người dùng thấy gì: Người không được sửa (telesales, quản trị thuần) vẫn bị chặn, nhưng máy báo «không tìm thấy» thay vì «cấm». Câu chữ bài kiểm đã đổi sau khi chủ kho duyệt và chưa được duyệt lại.
  Căn cứ: Người dùng không mất hay lộ dữ liệu vì lệnh vẫn bị từ chối, chỉ lệch chữ so với điều đã duyệt; chủ kho phê lại một lần ở cổng là xong.
  file: `_acceptance/doi-gia-nhanh/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **E8: có một lỗi lúc chạy trên trang của telesales nhưng không ai kiểm, mà báo cáo vẫn ghi mạng sạch**
  Người dùng thấy gì: Trang hồ sơ căn khi telesales mở có thể đang báo một lỗi nhỏ lúc chạy mà chưa ai xem là lỗi gì. Người dùng có thể không thấy gì khác thường, nhưng báo cáo ghi «sạch» là chưa chắc.
  Căn cứ: Chưa thấy hậu quả cho người dùng và tải lại trang là xử lý được; kiểm ra nguồn lỗi sau này không tốn nhiều.
  file: `_acceptance/doi-gia-nhanh/evidence/E8-network.txt`
  severity: medium
  Đề xuất: known-limits

- **E10: hợp đồng sửa sau Cổng Phạm vi cho khớp kết quả đang trượt; bằng chứng hiện có vẫn ghi SAI theo tiêu chí cũ**
  Người dùng thấy gì: Tiêu chí về việc chặn người không có quyền đã được sửa sau khi duyệt, còn bằng chứng đang lưu vẫn là của lượt trước. Hồ sơ nghiệm thu có thể tự mâu thuẫn cho đến khi chạy lại và được phê.
  Căn cứ: Chỉ ảnh hưởng độ tin cậy của hồ sơ nghiệm thu, không ảnh hưởng người dùng; chạy lại bài kiểm và phê lại là sửa rẻ và gỡ được.
  file: `_acceptance/doi-gia-nhanh/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **E8 cảnh 4: tiêu chí đòi «Đã cọc» nhưng ảnh và quan sát dùng «Đang giao dịch», không có ảnh lịch sử riêng của cảnh 4**
  Người dùng thấy gì: Một số ảnh minh chứng Lịch sử chỉ chụp đầu trang nên không chứng minh được dòng đổi trạng thái hiện ra. Tính năng có thể vẫn chạy đúng, chỉ là bằng chứng chưa rõ.
  Căn cứ: Không có mất mát hay rò dữ liệu cho người dùng; chụp lại ảnh là việc nhẹ và làm sau được.
  file: `_acceptance/doi-gia-nhanh/evidence/E8-canh4d-lich-su.png`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 — E2 hứa đo ngăn Đổi giá dựng thật và nút «Sửa lại», nhưng bài kiểm không có lần đo nào cho hai phần đó**
  Người dùng thấy gì: Máy chưa tự kiểm rằng ngăn Đổi giá còn đủ ô giá, lựa chọn bao phí, nút Lưu và nút «Sửa lại» không ghi. Nếu sau này ai làm mất một phần, bài kiểm vẫn xanh và người dùng mới là người gặp lỗi.
  Căn cứ: Hiện chưa có lỗi thật nên chưa ảnh hưởng người dùng, nhưng lỗi tương lai sẽ lọt qua; bổ sung bài kiểm sau này không đắt.
  file: `apps/web/src/app/(app)/units/ho-so/dien-thoai/sua-nhanh.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Ngăn sửa nhanh bỏ qua bước xác nhận cho thay đổi không hoàn tác được (Đã bán / Ngừng bán), lệch với cách ô Bảng hàng đang làm (r1)**
  Người dùng thấy gì: Trên điện thoại, chạm «Đã bán» hoặc «Ngừng bán» rồi «Lưu» là ghi luôn, không hỏi lại và không có nút hoàn tác như trên Bảng hàng. Bấm nhầm thì không đảo lại được.
  Căn cứ: Hậu quả có thể nặng vì thay đổi không đảo được và người dùng không tự gỡ được, nhưng bước chọn Đã bán đã đòi giá chốt và ngày nên khó bấm nhầm; thêm bước hỏi lại là việc nhỏ, đáng làm trong một hợp đồng riêng.
  file: `apps/web/src/app/(app)/units/ho-so/dien-thoai/sua-nhanh.ts`
  severity: medium
  Đề xuất: new-contract

- **Ngăn sửa nhanh không hiện dòng «Tính là vừa xác nhận với chủ nhà» như ô Bảng hàng (r1 · tệp đã đổi)**
  Người dùng thấy gì: Người sửa trên điện thoại không được báo rằng lần sửa đã tính là vừa xác nhận với chủ nhà. Dữ liệu vẫn ghi đúng, chỉ thiếu lời nhắc.
  Căn cứ: Hậu quả nhẹ: không mất hay lộ dữ liệu, mốc xác nhận vẫn được làm mới, chỉ thiếu thông tin cho người dùng; ghi vào hạn chế đã biết là đủ.
  file: `apps/web/src/app/(app)/units/ho-so/dien-thoai/ngan-sua-nhanh.tsx`
  severity: low
  Đề xuất: known-limits

- **Phone quick-edit sheets save changes that cannot be undone without the warning the inventory editor shows (r1)**
  Người dùng thấy gì: Lưu ở ngăn «Đổi trạng thái» có thể ghi ngay Đã bán, Ngừng bán hoặc đặt giá lần đầu mà không cảnh báo, và trên điện thoại không có nút hoàn tác. Bấm nhầm sẽ để lại thay đổi không đảo được.
  Căn cứ: Người dùng không tự gỡ được thay đổi đã ghi, nên hậu quả đáng kể với dữ liệu căn; sửa rẻ vì chỉ thêm một bước hỏi, hợp làm cùng việc ở finding cùng gốc.
  file: `apps/web/src/app/(app)/units/ho-so/dien-thoai/sua-nhanh.ts`
  severity: medium
  Đề xuất: new-contract

- **Hình dạng 5 — E4 nói quét đủ ma trận 6 trạng thái × có/không cờ nhưng chỉ khẳng định ở một nửa số ô, và chỉ khẳng định chiều âm (r1 · tệp đã đổi)**
  Người dùng thấy gì: Bộ kiểm tự động chỉ xác nhận một nửa các tổ hợp trạng thái và quyền. Nếu danh sách nấc hiển thị sai ở các tổ hợp còn lại thì kiểm tự động chưa bắt được.
  Căn cứ: Người dùng không gặp lỗi trực tiếp, chỉ là lưới an toàn mỏng hơn lời hứa; bổ sung kiểm sau này rẻ và không gấp.
  file: `apps/web/src/app/(app)/units/ho-so/dien-thoai/sua-nhanh.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 — E6 chỉ kiểm dòng «Đổi giá» có mặt, không kiểm quan hệ giá cũ → giá mới (r1 · tệp đã đổi)**
  Người dùng thấy gì: Bài kiểm chỉ xác nhận Lịch sử có dòng đổi giá, chưa xác nhận giá cũ và giá mới ghi đúng chiều. Nếu dòng hiện sai số thì kiểm tự động không báo.
  Căn cứ: Chưa có bằng chứng người dùng thấy sai; rủi ro chỉ là lỗi hiển thị trong tương lai lọt qua kiểm, và người dùng tự thấy được qua Lịch sử.
  file: `apps/web/src/app/(app)/units/ho-so/dien-thoai/sua-nhanh.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 — E6 viết tay sự kiện status_changed vào kho của máy chủ giả, không đi qua đường ghi (r1 · tệp đã đổi)**
  Người dùng thấy gì: Bài kiểm Lịch sử cho đổi trạng thái dùng sự kiện dựng tay nên chưa chứng minh được đường ghi thật sinh ra dòng đúng. Người dùng chưa thấy lỗi nào.
  Căn cứ: Không có hậu quả trực tiếp cho người dùng; chỉ làm giảm độ tin của bài kiểm, và có thể bù bằng ảnh chụp trên bản chạy thật.
  file: `apps/web/src/app/(app)/units/ho-so/dien-thoai/sua-nhanh.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 — ca lỗi của E2/E4 bị gộp thành nhãn «lỗi», không ghim lý do (r1 · tệp đã đổi)**
  Người dùng thấy gì: Các ca từ chối chỉ được kiểm là bị từ chối, chưa kiểm đúng lý do. Nếu lý do hiện cho người dùng sai thì kiểm tự động chưa bắt được.
  Căn cứ: Không có lỗi người dùng được chứng minh; người dùng vẫn bị chặn đúng chỗ, chỉ có nguy cơ lời giải thích lệch trong tương lai.
  file: `apps/web/src/app/(app)/units/ho-so/dien-thoai/sua-nhanh.test.ts`
  severity: medium
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 4/5 lỗi rơi vào file không bộ đo nào phủ (_acceptance/doi-gia-nhanh/evals.yaml, _acceptance/doi-gia-nhanh/evidence/E8-network.txt, _acceptance/doi-gia-nhanh/evidence/E8-canh4d-lich-su.png) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.

