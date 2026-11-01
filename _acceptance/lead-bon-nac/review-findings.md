# Review findings: lead-bon-nac

## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Hôm nay rẽ nhánh theo tên vai thay vì đọc bảng vai của lõi**
  Người dùng thấy gì: Hiện nay telesales thấy đúng vùng «Lead đã nhập» và vai khác thấy chỗ tạm như cũ. Nếu sau này thêm vai mới được nhập lead, màn Hôm nay có thể không hiện vùng này cho vai đó cho tới khi sửa riêng.
  Căn cứ: Hiện chưa gây sai cho ai, chỉ có nguy cơ lệch khi đổi bảng vai về sau, và sửa lúc đó rẻ.
  file: `apps/web/src/app/(app)/today/page.tsx`
  severity: medium
  Đề xuất: known-limits

- **Mọi lỗi 409 khi gửi lại đều hiện thành «Lead này đã được gửi lại.»**
  Người dùng thấy gì: Khi gửi lại bị từ chối vì lead chưa bị trả lại hoặc chưa chọn sàn, telesales vẫn đọc câu «Lead này đã được gửi lại», là câu không đúng lý do. Không mất dữ liệu, chỉ gây khó hiểu.
  Căn cứ: Nhẹ: không mất hay lộ dữ liệu, các tình huống này hiếm và người dùng tải lại là thấy đúng trạng thái.
  file: `apps/web/src/app/(app)/leads/mine/nguon-that.tsx`
  severity: low
  Đề xuất: known-limits

- **Every 409 from resubmit shows «Lead này đã được gửi lại», and the list is not reloaded**
  Người dùng thấy gì: Khi mở hai tab hoặc trạng thái đã đổi, dòng vẫn hiện «Trả lại» cùng ô nhập số, bấm lại vẫn ra cùng lỗi cho tới khi người dùng tải lại trang.
  Căn cứ: Nhẹ: không mất hay lộ dữ liệu, người dùng tự gỡ được bằng cách tải lại trang, và tình huống chỉ xảy ra khi dùng nhiều tab.
  file: `apps/web/src/app/(app)/leads/mine/nguon-that.tsx`
  severity: low
  Đề xuất: known-limits

- **Resubmit succeeds but a failed list reload is silently ignored**
  Người dùng thấy gì: Nếu gửi lại thành công nhưng lúc tải lại danh sách bị lỗi mạng, màn không báo gì và dòng cũ vẫn hiện «Trả lại», khiến telesales tưởng chưa gửi được.
  Căn cứ: Hiếm gặp, lead mới đã được tạo đúng, không mất dữ liệu và tải lại trang là thấy đúng trạng thái.
  file: `apps/web/src/app/(app)/leads/mine/lead-da-nhap.tsx`
  severity: low
  Đề xuất: wont-fix

- **A JSON parse error in lay() or the 400 branch is not caught, so the screen spins forever or the button stays disabled**
  Người dùng thấy gì: Khi đường truyền trả về trang lạ thay vì dữ liệu, màn có thể quay tải mãi không hiện «Thử lại», hoặc nút «Sửa số và gửi lại» bị khoá. Người dùng phải tải lại trang.
  Căn cứ: Chỉ xảy ra khi hạ tầng trung gian hỏng, không mất hay lộ dữ liệu và tải lại trang là gỡ được.
  file: `apps/web/src/app/(app)/leads/mine/nguon-that.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 — tuyên quét LỚP («mỗi nhóm») nhưng chỉ có điểm-case; nhóm màn mới lead-cua-toi không có ca nào**
  Người dùng thấy gì: Người dùng cuối không thấy gì khác. Chỉ là luật giữ khuôn giao diện của màn «lead của tôi» chưa được máy thử, nên nếu ai lỡ phá khuôn màn này thì máy có thể không báo.
  Căn cứ: Không ảnh hưởng người dùng hiện tại; chỉ là lưới an toàn cho thay đổi sau, và bổ sung ca kiểm sau này rẻ.
  file: `packages/ui-lint/tests/rang-giu-khuon.test.mjs`
  severity: low
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 6/6 lỗi rơi vào file không bộ đo nào phủ (apps/web/src/app/(app)/today/page.tsx, apps/web/src/app/(app)/leads/mine/nguon-that.tsx, apps/web/src/app/(app)/leads/mine/lead-da-nhap.tsx, packages/ui-lint/tests/rang-giu-khuon.test.mjs) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
