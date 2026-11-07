---
schema_version: 1
feature: "Công cụ chụp màn dùng chung của các lượt chấm (cdp.mjs) luôn tắt Chrome do chính nó mở, kể cả khi tác tử chấm hết giờ hay bị ngắt: ghi PID, bắt tín hiệu thoát, dọn hồ sơ tạm; không còn Chrome chạy ẩn mồ côi sau lượt chấm."
slug: va-cdp-tat-chrome
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [cli]
status: machine-cleared
design_doc: _acceptance/va-cdp-tat-chrome/design.md
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-11-06T04:27:42Z
---

# Acceptance Contract: va-cdp-tat-chrome

## Context

Hàng vá dãy D (đợt `dau-khach-nhap`, D-21, giám sát quyết). `_acceptance/bang-hang-kieu-sheet/thu/cdp.mjs` mở Chrome
không đầu cho 30 chỗ thử của các hồ sơ nhưng chỉ tắt nó khi lời gọi tự gọi `dong()`, và cả khi ấy chỉ gửi SIGTERM. Dãy B đo
05/11: bốn Chrome mồ côi giữ ~850 MB lúc máy áp lực bộ nhớ mức 2. Vòng chỉ sửa `cdp.mjs`, giữ nguyên API `moChrome()` →
`trang()` / `dong()`. «Chrome của lượt» = nhóm tiến trình Chrome do `moChrome()` mở, nhận ra bằng thư mục hồ sơ tạm của nó.

Source input: hàng `va-cdp-tat-chrome` (`docs/plan/lo-trinh.json`) · thiết kế `_acceptance/va-cdp-tat-chrome/design.md`

## Criteria

- **AC-1** — Đóng thường thì Chrome tắt hẳn và hồ sơ tạm biến mất.
  Given một tiến trình gọi `moChrome()` và mở một trang,
  When nó gọi `dong()` rồi chạy tiếp,
  Then trong 5 giây không còn tiến trình nào mang thư mục hồ sơ tạm của lượt, thư mục ấy không còn trên đĩa, dòng sổ PID
  của lượt không còn, tiến trình canh của lượt không còn; tiến trình gọi vẫn sống và gọi `dong()` lần nữa không lỗi.

- **AC-2** — Lời gọi thoát mà không chờ `dong()` xong thì Chrome vẫn tắt và mã thoát không đổi.
  Given một tiến trình gọi `moChrome()`,
  When nó thoát thường không gọi `dong()`, chết vì một lỗi chưa bắt, hoặc gọi `dong()` rồi `process.exit(0)` /
  `process.exit(3)` ngay không chờ,
  Then trong 5 giây không còn tiến trình nào mang thư mục hồ sơ tạm, thư mục, dòng sổ và tiến trình canh không còn; mã thoát
  của tiến trình gọi giữ như không có công cụ (0 cho thoát thường, 1 cho lỗi chưa bắt, 0 và 3 cho `process.exit`), và
  công cụ không in gì thêm ra stderr.

- **AC-3** — Tác tử chấm ngắt mềm (SIGTERM, SIGINT, SIGHUP) thì Chrome tắt và lời gọi vẫn thoát.
  Given một tiến trình gọi `moChrome()` đang chờ,
  When nó nhận SIGTERM, SIGINT hoặc SIGHUP,
  Then trong 5 giây không còn tiến trình mang thư mục hồ sơ tạm, thư mục, dòng sổ và tiến trình canh không còn; tiến trình gọi không có bộ
  bắt riêng thì thoát với mã 128 + số hiệu tín hiệu (143, 130, 129); tiến trình gọi có bộ bắt riêng thì bộ bắt riêng vẫn
  chạy và mã thoát là mã nó chọn.

- **AC-4** — Tác tử chấm ngắt cứng (SIGKILL) thì Chrome vẫn tắt.
  Given một tiến trình gọi `moChrome()` đang chờ,
  When nó bị SIGKILL,
  Then trong 5 giây không còn tiến trình mang thư mục hồ sơ tạm, thư mục, dòng sổ và tiến trình canh không còn.

- **AC-5** — Mồ côi cũ được dọn ở lần mở sau, không kill nhầm PID đã tái dùng, không xoá đường lạ.
  Given sổ PID của cây có bốn dòng mà tiến trình gọi đã chết: (a) PID Chrome còn sống với đúng thư mục hồ sơ đã ghi;
  (b) PID ghi trong sổ là một tiến trình KHÁC đang sống (dòng lệnh không mang thư mục); (c) PID Chrome đã chết nhưng thư mục
  hồ sơ `qh-b-chrome-*` dưới thư mục tạm của hệ thống còn trên đĩa; (d) PID đã chết và đường thư mục trỏ ra ngoài thư mục
  tạm,
  When một lời gọi mới chạy `moChrome()`,
  Then (a) Chrome mồ côi tắt, thư mục của nó bị xoá; (b) tiến trình khác vẫn sống; (c) thư mục bị xoá; (d) đường ngoài thư
  mục tạm còn nguyên; cả bốn dòng sổ không còn.

- **AC-6** — Lời gọi cũ chạy như trước.
  Given một lời gọi dùng `moChrome()` → `trang(rong, cao)` → `tinh` / `chup` → `dong()` như 30 chỗ thử hiện có,
  When nó mở `about:blank` khổ 800×600, đọc `innerWidth` và chụp một ảnh,
  Then `innerWidth` là 800, ảnh là PNG khác rỗng, và `dong()` trả về không cần `await`.

## Coverage

Bỏ quét không gian — xem dòng sổ «bỏ coverage-scan». Không gian của vòng là danh sách lối kết thúc của tiến trình gọi, đã
liệt trọn: gọi `dong()` (AC-1) · thoát thường không `dong()`, lỗi chưa bắt, `dong()` rồi `process.exit` ngay (AC-2) · ba tín
hiệu mềm, có và không có bộ bắt riêng (AC-3) · SIGKILL (AC-4) · mồ côi của lượt trước — Chrome còn sống, PID tái dùng,
Chrome đã chết còn hồ sơ, đường lạ (AC-5) · không hồi quy API (AC-6). Mỗi lối tắt có một phép đo chiều đỏ chạy trên bản
`cdp.mjs` của nhánh chính trước vòng (E7, mười hai ca — thêm ca bộ bắt riêng cài bằng `once` trước khi mở Chrome, lượt chấm 2), và mỗi ca E1–E5 có đối chứng dương trước bước tắt. Người canh
(tiến trình mới của vòng) được đo tắt ở mọi lối.

## Out of scope

- Gỡ cách dò `ps` tự vá của `luat-chia-lead/thu/chay-ui.mjs` và `luat-chia-lead-cap-han-hong/thu/chay-ui.mjs` — để nguyên,
  chạy cạnh bản sửa; gỡ là việc của hàng vá có vùng đó.
- Máy dev (`next dev`) mồ côi của chỗ thử — việc của từng `dung-*.mjs`, không phải công cụ chụp màn.
- Sửa 30 tệp gọi `cdp.mjs` — API không đổi nên không tệp nào phải sửa.
- Chrome mở bởi công cụ khác (MCP trình duyệt, chrome-devtools) — không qua `cdp.mjs`.

## Notes

- Mọi phép đo chạy Chrome thật trên máy (`CHROME_PATH` hay đường mặc định); không có Chrome thì bộ đo thoát 2 với câu
  «không có Chrome» — không ra xanh giả.
- Ngoài-1 (máy định tuyến 2026-11-06, đề xuất S4 known-limits): Nếu một lượt chấm viết chờ việc đóng Chrome xong rồi mới làm tiếp (ví dụ ghi báo cáo), phần sau đó có thể bị bỏ qua mà không báo lỗi gì. Chrome vẫn được tắt đúng, và các lượt chấm hiện có không dùng cách viết này. — `_acceptance/bang-hang-kieu-sheet/thu/cdp.mjs`
- Ngoài-2 (máy định tuyến 2026-11-06, đề xuất S4 known-limits): Bài tự kiểm có thể báo đạt về việc tiến trình canh đã tắt dù thực ra chưa đo được là nó từng chạy. Công cụ thật vẫn tắt Chrome đúng, chỉ là bài kiểm ở một ca yếu hơn mong muốn. — `_acceptance/va-cdp-tat-chrome/thu/kiem-tat-chrome.mjs`
