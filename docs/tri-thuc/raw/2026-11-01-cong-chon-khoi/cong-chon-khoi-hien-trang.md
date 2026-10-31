# Cổng chọn khối — hiện trạng (nháp 1/11)

Nháp để bàn với chủ kho, chưa phải điều đang đúng. Câu hỏi: khi một màn cần khối, ba lối **trong kho · trong ReUI · vẽ
mới** được so ở đâu, ai quyết, bằng chứng nhất quán là gì, khối chọn từ ReUI về có vào kho không, lần sau có dùng lại
được không. Khảo sát trên `origin/main` `4661f8d` và nhánh dãy B (`claude/dcdv-b-0f1aee`, hàng 14 chưa gộp).

## Trả lời ngắn

| Câu hỏi | Hôm nay |
| --- | --- |
| Ba lối so ở đâu? | **Một lần, theo lô**: 30/10 chủ kho chọn trên kho ReUI cho 21 màn một lúc (ADR-0002, `vo-va-ia.md` §2, cột «Khối đích» và «Phương án phụ»). Từ đó mỗi hàng chỉ đi theo khối đích; không có chỗ so ba lối theo màn. |
| Ai quyết? | Lần lô: chủ kho. Theo hàng: tác tử theo khối đích, rơi bậc thì tự ghi vào «Chỗ hở»; cài khối Pro do giám sát duyệt (hàng 14, yêu cầu B-2). Chủ kho thấy khối ở Cổng Phạm vi chỉ khi có câu hỏi kỹ thuật kèm theo (hàng 14 Hỏi-1: cờ kiểu chặt). |
| Bằng chứng nhất quán? | Lint `quy-hang-ui` (11 luật, nợ trần 0) · bài quét khuôn (khối cấm, khe, màn ngoài bản đồ) · ảnh đối chiếu màn mới cạnh màn mẫu cùng nhóm, 1440 và 375. Không có bằng chứng «lối đã chọn hơn hai lối kia». |
| Khối ReUI về có vào kho? | Có, ở hai chỗ: tệp chuyển thể nằm tại chỗ dùng (thư mục cài `components/blocks/` không giữ) và một dòng ở `catalog.md` «Khối đã chuyển thể». Màn đầu của nhóm mới sinh khuôn ở `design/patterns/<nhóm>.md`. |
| Lần sau dùng lại? | Trong cùng nhóm: **có, máy giữ** (khuôn + răng). Khác nhóm: chỉ bằng chữ — bậc 2 của thang đọc `catalog.md` và cột «Phương án phụ»; không có sổ tra theo khối hay archetype. |

## Điều đã có · chỗ hở · bằng chứng

| # | Điều đã có | Chỗ hở | Bằng chứng |
| --- | --- | --- | --- |
| 1 | Thang dùng lại bảy bậc: cần không → khối đã chọn / đã chuyển thể → khối ReUI khác → `c-*` → thành phần → ghép → tự viết | Ba lối của chủ kho nằm lẫn trong bảy bậc (bậc 2 = trong kho; 3–5 = ReUI; 6–7 = vẽ mới). Thang là luật cho tác tử, không phải chỗ trình người | `.claude/rules/giao-dien.md`; ADR-0002 quyết định 1 |
| 2 | Bản chọn khối theo lô cho 21 màn, kèm phương án phụ và danh sách tránh | Chọn trên ảnh xem trước của ReUI, trước khi có dữ liệu thật; không có hạn xem lại khi màn đến lượt | `vo-va-ia.md` §2 (21 dòng), §4 |
| 3 | Rơi xuống ghép được ghi ở «Chỗ hở» (13 dòng) | Rơi bậc không thành quyết định trình ai: hàng 24 xuống bậc 6 «khi có khoá ReUI» mà sổ quyết định của hồ sơ không có dòng nào. 4 chỗ «tạm» chờ khối Pro (đăng nhập `auth-15`, ô nhận lead `form-2`, trống · lỗi · báo `empty-state-*`, người dùng `solution-users-8`) — **khoá ReUI đã có trên máy** (hàng 14 cài khối Pro `data-grid-editing-6` ngày 31/10) mà không ai được nhắc trả | `vo-va-ia.md` §3; `_acceptance/o-nhan-lead/decisions.jsonl` (không dòng nào nói bậc 6); `apps/web/.env.local` có `REUI_LICENSE_KEY` |
| 4 | Nghi thức `design-pass` có bước phân kỳ: ≥2 hướng thì bày hướng có tên, động cơ, đánh đổi, ghim lời khuyên trên vật | Cả hai màn đã qua design-pass ghi `divergence: skipped` vì khối đích đã chốt → bước so lối không bao giờ mở cho khối | `_acceptance/o-nhan-lead/design-pass.md`; `_acceptance/bang-hang-kieu-sheet/design-pass.md` (nhánh B) |
| 5 | Ảnh đối chiếu màn mới · màn mẫu cùng nhóm, gửi kèm thẻ Cổng Phạm vi | **Màn đầu của nhóm mới so với chính nó** — đúng lúc chọn khối thì ảnh không chứng gì. Không so khác nhóm (Bảng hàng có giống vỏ, giống Cài đặt sàn không) | `doi-chieu/ke-hoach.json` của hàng 14: `tep_moi` = `mau.tep` = `inventory/page.tsx` |
| 6 | Bản đồ khuôn 5 nhóm trên main (+ `bang-hang` ở nhánh B); răng chặn khối cấm, màn ngoài bản đồ | Bản đồ xếp theo **nhóm màn**, không theo **khối**: không trả lời «khối X đã dùng ở đâu, cho archetype nào, ai duyệt, bản ReUI nào» | `design/patterns/*.md`; `packages/ui-lint/ban-do-khuon.mjs` |
| 7 | `catalog.md` «Khối đã chuyển thể» | 1 dòng trên main (`app-shell-8`), 2 ở nhánh B. Không có ảnh chuẩn, ngày duyệt, người duyệt, phiên bản ReUI; kiểm chuẩn chỉ đếm thành phần đã cài, không đếm khối | `.agents/skills/quy-hang-ui/catalog.md`; `packages/ui-lint/kiem-chuan.mjs` |
| 8 | Số đo vòng giao diện (`so-do-vong.mjs`): tệp theo khuôn, răng bắt, lệch lọt | Chưa vòng màn nào ghi: hàng 24 và 14 không có `khuon-so-do.json`; hàng 60 có, toàn số 0. `lech-lot.md` chưa có dòng | `_acceptance/vong-giao-dien-qua-ban-do/khuon-so-do.json` |
| 9 | Cổng Phạm vi là chỗ chủ kho đã ngồi sẵn | Thẻ Cổng Phạm vi hàng 14 không có dòng nào về chọn khối; kit chưa in ảnh lên thẻ (mục chờ KH2, KH3 của kit) | `card-plain.json` của commit `da87d48` (nhánh B) |

## Ba hàng nền đã gộp

- **58 — bản đồ khuôn nhóm đã có** (`ban-do-khuon-nhom-da-co`): bốn nhóm `xac-thuc`, `cai-dat-san`, `trang-tam`,
  `trang-thai`, mỗi nhóm một khuôn có khe. Nhóm thứ năm `o-nhan-lead` sinh ở hàng 24.
- **59 — răng giữ khuôn** (`rang-giu-khuon`): luật lint `ban-do-khuon` chặn nhập khối cấm; bài quét khuôn trong
  `npm run lint`.
- **60 — vòng giao diện qua bản đồ** (`vong-giao-dien-qua-ban-do`): luật «nhóm mới tạo mục bản đồ trong chính vòng ấy»,
  ảnh đối chiếu, số đo vòng.

Ba hàng giữ **nhất quán sau khi đã chọn**. Chưa hàng nào giữ **việc chọn**.

## Các hàng màn đang chạy

| Hàng | Khối đích | Đã làm | Ai quyết khối |
| --- | --- | --- | --- |
| 14 Bảng hàng (nhánh B, chờ ký Cổng Bằng chứng) | `data-grid-editing-6` (Pro) | Cài nguyên bản, chuyển thể chỉ đọc; sinh nhóm `bang-hang`; sửa một dòng bản cài cho qua cờ kiểu chặt | Khối: lô 30/10 + ADR-0004 (bài thử 5.000 dòng). Cài Pro: giám sát (B-2). Sửa bản cài: chủ kho ở Cổng Phạm vi (Hỏi-1) |
| 24 Ô nhận lead (đã gộp) | `form-2` (Pro) | Không cài khối; ghép bậc 6 trong khuôn `KhungLead`; ghi «khi có khoá ReUI» | Tác tử, không dòng quyết định |
| 25 Chia lead (nhánh L) | — | Lõi và migration, chưa chạm giao diện | — |

## Lối thiết kế cổng để bàn

Ràng buộc: không thêm lượt gọi người — cổng đặt ở chỗ chủ kho đã ngồi (Cổng Phạm vi), máy dựng vật trước.

| Lối | Là gì | Giá | Được | Mất |
| --- | --- | --- | --- | --- |
| **A. Thẻ ba lối ở Cổng Phạm vi** | Khi vòng chạm một **ô chưa có khuôn** (màn đầu nhóm mới, đổi khối đích, hay rơi xuống ghép / tự viết), design-pass buộc mở phân kỳ ba lối: *Trong kho* (khuôn / khối đã chuyển thể gần nhất), *ReUI* (1–2 khối, ảnh xem trước tra bằng MCP), *Vẽ mới* (ghép). Mỗi lối một ảnh cùng khổ, một câu đánh đổi, lời khuyên của máy ghim trên trang; gửi kèm thẻ Cổng Phạm vi. Màn đi khuôn sẵn thì không mở | ~1 hàng T2: thêm chế độ ba lối vào bộ đối chiếu, luật ở `giao-dien.md` và skill | Chủ kho thấy và duyệt từng lựa chọn khối; 0 lượt gọi thêm | Máy phải dựng 2–3 bản nháp mỗi ô mới — tốn giờ máy |
| **B. Sổ khối của kho** | Mỗi khối đã duyệt một mục máy đọc cạnh bản đồ khuôn: nguồn ReUI và phiên bản, tệp chuyển thể, archetype, nhóm đang dùng, ảnh chuẩn, ngày và người duyệt. Bậc 2 của thang tra sổ; kiểm chuẩn đỏ khi khối cài mà thiếu mục | ~1 hàng T2, chạm `packages/ui-lint` | «Trong kho» thành lối tra được; lần sau dùng lại khác nhóm | Thêm một sổ phải giữ; trùng một phần với `catalog.md` (gộp vào đó thì rẻ hơn) |
| **C. Luật khi nào được vẽ mới** | Rơi xuống ghép / tự viết phải ghi: đã tra gì trên ReUI (truy vấn + ba kết quả gần nhất), vì sao không đứng, hạn xem lại (ví dụ «khi có khoá Pro»). Máy đỏ khi «Chỗ hở» thiếu một trong ba; hạn tới thì nhắc ở lượt cắt | Nhỏ — đi kèm A | Chặn rơi bậc im lặng như hàng 24 | Thêm chữ cho mỗi lần ghép |
| **D. Bảng chọn khối theo đợt** | Như 30/10 nhưng lặp mỗi đợt: lúc mở đợt máy dựng bảng ba lối cho mọi màn của đợt, chủ kho ký một lần ở Cổng Đáng | Nhỏ cho người; vừa cho máy | Một lần ngồi cho cả đợt | Chọn trước khi có dữ liệu thật — lặp lại chỗ hở #2 |
| **E. Cổng chọn khối riêng** | Một cổng mới trước Cổng Phạm vi | Thêm một lượt gọi mỗi hàng giao diện | Tách bạch | Trái ràng buộc số 1 (tần suất gọi người) — không khuyên |

**Khuyến nghị của máy: A + C ngay, B gộp vào `catalog.md` thay vì sổ mới.** Căn cứ: chỗ hở lớn nhất là #4 và #5 — bước
so lối có sẵn trong kit mà luôn bị bỏ, và ảnh đối chiếu im đúng lúc chọn khối; A sửa cả hai mà không thêm lượt gọi. C rẻ
và chặn đúng lỗi đã xảy ra (hàng 24). B cần cho «lần sau dùng lại», nhưng nâng `catalog.md` thêm cột (archetype, ảnh
chuẩn, ngày duyệt, người duyệt, phiên bản) và cho kiểm chuẩn đếm khối là đủ, không cần sổ thứ ba.

Việc nợ thấy được khi khảo sát, đứng riêng với thiết kế cổng: bốn chỗ «tạm chờ khoá ReUI» (#3) nay đã cài được khối Pro.
