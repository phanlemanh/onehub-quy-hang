# Review findings: ban-do-khuon-nhom-da-co

## Trong hợp đồng

- **Page-template check ignores conditional returns, so a wrong root can pass**
  file: `packages/ui-lint/lib/ban-do.mjs:706`
  severity: medium
  AC: AC-3
  source: bugs
  detail: For page groups, kiemCay only removes parentheses from each return value and then keeps plain JSX elements. A return like `cond ? <main/> : <MucCaiDat/>` or `x && <Frame/>` is a ConditionalExpression or BinaryExpression, so the filter at line 706 drops it without checking it. The design spec ("MỌI lệnh return trả JSX đều có gốc là khuon.ten") and AC-3 require every JSX return to be checked. Reproduced on a temporary copy of the tree: in settings/users/page.tsx I added an early `return <MucCaiDat title="a">b</MucCaiDat>` and changed the main return to `cookie === "y" ? (<main className="min-h-svh">x</main>) : (<MucCaiDat …>)`. `node packages/ui-lint/ban-do-khuon.mjs --root <copy>` printed "cai-dat-san: 1 tệp theo khuôn · 0 lệch" and exited 0. The self-built <main min-h-svh> that this row exists to catch passes silently. If the ternary is the only return, the file is instead reported as "không trả JSX", which is the wrong reason. Fix: unwrap ConditionalExpression (both branches) and `&&`/`||`/`??` (right side) recursively before checking the root.
  rationale: AC-3 đòi gốc của MỌI JSX trả về phải là khuôn của nhóm và gốc <main> tự dựng phải thành lệch; trả về có điều kiện lọt qua nghĩa là AC-3 thất bại.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Status scan misses aliased imports and role={"alert"} in braces**
  Người dùng thấy gì: Một người viết màn mới nếu đổi tên khối báo trống khi nhập, hoặc viết vai báo lỗi theo kiểu khác, thì bộ kiểm không bắt được và màn có thể hiện khối báo sai kiểu mà không ai hay.
  Căn cứ: Chỉ ảnh hưởng người viết màn sau này chứ không làm hỏng màn hiện có, ca hiếm, và sửa lại được bất cứ lúc nào khi thấy lọt; nên ghi giới hạn rồi tiếp tục.
  file: `packages/ui-lint/lib/ban-do.mjs`
  severity: medium
  Đề xuất: known-limits

- **Blocked components listed for page groups are never checked**
  Người dùng thấy gì: Bản đồ nói rõ có những khối không được đặt trong màn Cài đặt, Xác thực và trang tạm, nhưng bộ kiểm không chặn; một màn mới có thể lồng thêm khung hoặc thẻ và người dùng thấy giao diện thừa viền hoặc lồng khung.
  Căn cứ: Hậu quả chỉ là giao diện kém gọn ở màn mới, không mất hay lộ dữ liệu, và hàng 59 đã dự kiến làm phần răng giữ khuôn nên gộp vào đó rẻ hơn sửa riêng.
  file: `packages/ui-lint/lib/ban-do.mjs`
  severity: low
  Đề xuất: new-contract

- **Members page only handles 403, so other API errors break the page**
  Người dùng thấy gì: Khi tải danh sách người dùng của sàn gặp lỗi khác ngoài việc không có quyền (mất mạng, máy chủ lỗi), màn có thể hiện hỏng hoặc trống thay vì báo «tải thất bại».
  Căn cứ: Không mất hay lộ dữ liệu, người dùng tự gỡ bằng cách tải lại trang, và lỗi này đã có từ trước nên ghi lại để làm sau trong một việc riêng.
  file: `apps/web/src/app/settings/users/page.tsx`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
