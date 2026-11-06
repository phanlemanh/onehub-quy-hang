# Review findings: va-pool-ket-noi

## Trong hợp đồng

- **The pool budget misses the second set of pools that the proxy creates for itself**
  AC: AC-2
  file: `apps/web/src/lib/api.ts:17`
  severity: medium
  source: bugs
  detail: The budget test checks SO_PHIEN_BAN_DU_KIEN (3) × (POOL_DANH_TINH.max + POOL_UNG_DUNG.max = 4) + KHACH_KHAC (2) = 14 < 15. It assumes each deployment has exactly one copy of getApi()'s `cached`. But apps/web/src/proxy.ts calls getApi() on every page request that carries a session cookie, through refreshSessionCookie (/api/v1/auth/get-session, and /api/v1/me when the session is lost). The proxy is built as a separate entry with its own module graph. Evidence from the build: .next/server/functions-config-manifest.json lists `/_middleware` with runtime nodejs. The api.ts code containing `search_path=identity` exists in two separate chunks: `[root-of-the-server]__17fx33fllskwd._.js`, loaded by middleware.js, and `_0bx8m61rj77rq._.js`, used by the app. On Vercel, `/_middleware` is deployed as its own function. So each deployment really has one more pool set: the proxy's identity pool uses up to 2 connections, and the app pool can also open connections. The real total is about 3 × 6 + 2 = 20 > 15. That is exactly the pooler exhaustion this fix is meant to prevent, while the AC-2 test still passes because the formula leaves the proxy out.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Neither pool listens for 'error': when the pooler drops an idle connection, pg-pool throws an uncaught error**
  Người dùng thấy gì: Khi hệ thống cơ sở dữ liệu cắt một kết nối đang rảnh, máy chủ có thể bị sập một lượt. Người dùng sẽ gặp trang lỗi và phải tải lại hoặc bấm Thử lại.
  Căn cứ: Hậu quả nhẹ đến vừa, không mất dữ liệu và người dùng tự khắc phục được bằng tải lại; lỗi có từ trước nên nên làm thành việc riêng, sửa rẻ.
  file: `apps/web/src/lib/api.ts`
  severity: medium
  Đề xuất: new-contract

- **dung-su-co --dung does not respawn the switch when the PID file is stale, so the test setup looks stuck as 'TẮT'**
  Người dùng thấy gì: Chỉ ảnh hưởng người chạy thử: nếu lần thử trước chết giữa chừng, lần sau chỗ thử có thể kẹt ở trạng thái tắt và bước hồi phục thất bại dù sản phẩm không lỗi. Người dùng cuối không gặp gì.
  Căn cứ: Không chạm đến người dùng thật, chỉ gây khó chịu cho người chạy thử và xoá tệp cũ là qua; sửa không đáng công.
  file: `_acceptance/va-pool-ket-noi/thu/dung-su-co.mjs`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 5 — tuyên quét LỚP «không ai nuốt lỗi đọc phiên» nhưng bộ dò chỉ bắt một điểm-case cú pháp (`.catch(` cùng dòng với readMe)**
  Người dùng thấy gì: Bài kiểm tự động có thể bỏ sót một số cách viết khiến lỗi hạ tầng bị coi là chưa đăng nhập, nên sau này người dùng có thể bị đá về màn đăng nhập oan khi nghẽn mà không ai hay.
  Căn cứ: Hiện chưa có chỗ nào sai thật, chỉ là lưới an toàn cho tương lai còn thưa; ghi lại là đủ và tăng cường lưới khi có thay đổi lớn.
  file: `_acceptance/va-pool-ket-noi/thu/noi-goi.test.mjs`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
