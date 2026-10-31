---
schema_version: 1
feature: Kho có bản đồ khuôn cho các nhóm màn đã có — Cài đặt sàn, Xác thực, trang tạm, trạng thái trống · lỗi · báo — và mỗi nhóm một khuôn có khe mà mọi màn của nhóm dựng qua
slug: ban-do-khuon-nhom-da-co
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: approved
design_doc: docs/superpowers/specs/2026-10-31-ban-do-khuon-nhom-da-co-design.md
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-10-31T08:57:51Z
---

# Acceptance Contract: ban-do-khuon-nhom-da-co

## Context

Hàng 58 của lộ trình (đợt `ban-do-khuon-3110`, mã QK1; dãy D của đợt điều phối nen-2). Quỹ hàng thử bản đồ khuôn dạng
«khai trước khi lệch»: `docs/design/vo-va-ia.md` §2 là bản đồ bằng lời; hàng này biến phần thuộc bốn nhóm đã có màn
thật thành bốn tệp `design/patterns/<nhóm>.md` máy đọc được, thêm bộ đọc bản đồ và lệnh kiểm ở `packages/ui-lint`, và
đưa mọi màn hiện có của bốn nhóm về dựng qua khuôn của nhóm. Răng theo diff là hàng 59, ảnh đối chiếu là hàng 60.

Source input: `docs/plan/lo-trinh.json` hàng 58 · `_acceptance/ban-do-khuon-nhom-da-co/opportunity.md` · trang tri thức
`docs/tri-thuc/wiki/dot/ban-do-khuon-3110.md` · finding kit §11.3 (bản chép ở
`docs/tri-thuc/raw/2026-10-31-ban-do-khuon-thu-nghiem/`) · thiết kế
`docs/superpowers/specs/2026-10-31-ban-do-khuon-nhom-da-co-design.md`

## Criteria

- AC-1: Given kho sau hàng này, When bộ đọc bản đồ đọc `design/patterns/`, Then có đúng bốn tệp `xac-thuc`,
  `cai-dat-san`, `trang-tam`, `trang-thai`; mỗi tệp đủ chín khoá của §11.3 (nhom, doi_tuong, khuon {ten, nhap},
  nhan_dien, mau_dang_chay {tep, duong, trang_thai}, khe_bat_buoc, cam_ngoai_khuon, ngoai_le, luat) đúng kiểu, `nhom`
  bằng tên tệp, và bộ đọc trả 0 lỗi.
- AC-2: Given một bản sao bản đồ bị làm hỏng đúng một chỗ, When bộ đọc đọc nó, Then nó báo lỗi gọi tên tệp và trường
  cho từng ca: thiếu khoá · ngoại lệ thiếu `ly_do` · `khuon.nhap` không có tệp · khuôn không xuất `khuon.ten` · khe không
  phải tham số của khuôn · màn mẫu không khớp `nhan_dien` · khối cấm không thành phần nào xuất · mã luật không có trong
  thân · dòng frontmatter ngoài tập con đọc được · một tệp thuộc hai nhóm màn không ngoại lệ; bản sao nguyên vẹn thì 0
  lỗi.
- AC-3: Given ba nhóm đơn vị màn (`xac-thuc`, `cai-dat-san`, `trang-tam`), When kiểm cây thật, Then mọi tệp khớp
  `nhan_dien` trừ ngoại lệ đã khai có gốc mọi JSX trả về là khuôn của nhóm, nhập từ đúng tệp khuôn, đủ khe bắt buộc —
  0 lệch, danh sách tệp mỗi nhóm khớp bảng tên tệp viết trước (xác thực 3, cài đặt sàn 1 + 2 ngoại lệ, trang tạm 11);
  và trên bản sao, gốc là `<main>` tự dựng như Người dùng trước hàng này, gốc là `Frame`, `Khung` cùng tên nhập từ tệp khác, hay thiếu khe `title` đều thành một lệch gọi tên tệp, nhóm và điều
  lệch.
- AC-4: Given nhóm `trang-thai` (đơn vị phần tử), When kiểm cây thật, Then 0 lệch: chuông trống, trang tạm, lỗi thao tác
  và «không quyền» ở Người dùng đều dựng `TrangThai`; trên bản sao, `<p role="alert">` trần, `Empty` dùng ngoài tệp
  khuôn, hay `TrangThai` thiếu `kind` đều thành lệch có tên, và hai dạng lệch cũ của Người dùng (`<p role="alert"
  className="text-sm text-destructive">`) bị bắt — còn `FieldError role="alert"`, `CommandEmpty` và tệp ngoài
  `nhan_dien` không bị báo. Giới hạn khai: dòng chữ trần không mang `role` và không dùng khối cấm thì bộ quét không
  thấy.
- AC-5: Given lệnh `node packages/ui-lint/ban-do-khuon.mjs`, When chạy trên cây thật, Then in đúng một dòng mỗi nhóm
  `<nhóm>: N tệp theo khuôn · k ngoại lệ · 0 lệch` (nhóm đơn vị phần tử đếm «chỗ» thay «tệp») và thoát 0; trên bản sao có lệch thì thoát 1 và mỗi lệch một dòng
  `<tệp>: <nhóm> — <điều lệch>`; `--json` in một đối tượng JSON đọc lại được có cùng số.
- AC-6: Given người mẫu `hai-san@` ở Sàn mẫu B (sàn chỉ có một quản trị) và người mẫu `dau-chu@` không phải quản trị,
  When mở Cài đặt sàn → Người dùng ở khổ 1440 và 375, rồi `hai-san@` tự gỡ vai Quản trị của mình (Sửa → Lưu) và tự
  «Rời sàn», Then màn nằm trong vỏ với đúng một khung (không tự kéo cao cả màn), tiêu đề và danh sách người như trước;
  API trả 409 `last-admin` cho cả hai thao tác và mỗi lần màn hiện một khối báo đỏ «Sàn cần ít nhất một quản trị.»;
  `dau-chu@` thấy khối báo «Chỉ quản trị sàn xem được trang này.» (cross-layer)
- AC-7: Given các màn còn lại của bốn nhóm — đăng nhập (cả khi gõ sai mã), chọn sàn, một trang tạm, chuông trống — When
  mở ở khổ 1440 và 375, Then bố cục, chữ và khung như trước hàng này (chỉ đổi phần dựng bên trong), đọc được ở sáng và
  tối.
- AC-8: Given bốn tệp bản đồ và `docs/design/vo-va-ia.md`, When một tác tử mới đọc chúng để dựng một màn của nhóm, Then
  mỗi tệp nói khi nào dùng và khi nào KHÔNG dùng khuôn, mỗi mã luật có một câu luật, mỗi ngoại lệ có lý do đọc hiểu được;
  `vo-va-ia.md` §2 trỏ sang bản đồ và nói tệp nào giữ gì. (judgment)

## Coverage

Quét morphological-scan, preset entity-feature, cho thực thể «nhóm màn trong bản đồ khuôn». Chân sản phẩm: trang tri
thức đợt [SUY-TỪ-REPO: docs/tri-thuc/wiki/dot/ban-do-khuon-3110.md], `vo-va-ia.md` §2–§4 [SUY-TỪ-REPO:
docs/design/vo-va-ia.md], màn hiện có [SUY-TỪ-REPO: apps/web/src/app]. Chân ngành: khuôn có khe theo đối tượng
[NGÀNH: finding kit §11.3 — hai kho thử crm và Quỹ hàng]; thành phần trạng thái dùng chung của hệ thiết kế [NGÀNH cận
kề: shadcn `Empty`, ReUI `Alert`]. Đủ-để-bắt-đầu: lệch lọt đầu tiên khi dùng thật đưa ngược vào trục «nhóm».

- Trục vật: tệp bản đồ (AC-1) | bộ đọc từ chối sai khuôn (AC-2) | lệnh tóm tắt (AC-5) | chữ cho người và tác tử (AC-8)
  [thước CE: chín khoá §11.3]
- Trục nhóm × cách kiểm: ba nhóm đơn vị màn (AC-3) | nhóm trạng thái đơn vị phần tử (AC-4) [thước CE: bảng màn hiện có
  đếm từ `apps/web/src/app` — 3 + 1 + 2 ngoại lệ + 11]
- Trục hai chiều của thước: cây thật xanh (AC-3, AC-4) | bản sao lệch đỏ có tên (AC-2, AC-3, AC-4) | ca phải im
  (`FieldError`, `CommandEmpty`, tệp ngoài nhóm — AC-4) [thước CE: §11.5 của finding]
- Trục nhìn thấy: màn đổi bên trong (AC-6) | màn chỉ khai vào bản đồ (AC-7) [thước CE: khổ 1440 và 375, sáng và tối]
- Later: răng theo diff và lint cấm nhập (hàng 59); ảnh màn mới cạnh màn mẫu, luật nhóm mới (hàng 60); khuôn chờ tải và
  toast khi có màn dùng.
- Never: khuôn cho nhóm chưa có màn thật — trái luật «khuôn sinh cùng màn đầu tiên của nhóm».

## Đường đo

- Ngưỡng ô cơ hội «mỗi nhóm một tệp đủ trường §11.3, đọc được bằng máy; ngoại lệ nào cũng có lý do; mọi màn hiện có của
  bốn nhóm dựng khuôn ở gốc» — số từ lệnh `node packages/ui-lint/ban-do-khuon.mjs` (số nhóm, tệp theo khuôn, ngoại lệ,
  lệch; 0 lỗi đọc) · AC-1, AC-2 bảo đảm phần «đủ trường, ngoại lệ có lý do»; AC-3, AC-4 phần «dựng khuôn ở gốc»; AC-5
  bảo đảm lệnh có và in đúng số.

## Out of scope

- Răng giữ khuôn: lint cấm nhập theo vùng, bài quét theo diff, «chỉ sửa docs thì im» — hàng 59.
- Ảnh màn mới cạnh màn mẫu ở bước thiết kế; luật «màn đầu của nhóm mới tạo mục bản đồ» trong `vo-va-ia.md` và skill
  `quy-hang-ui` — hàng 60.
- Khuôn cho nhóm chưa có màn (bảng hàng, hồ sơ căn, Hôm nay, ô nhận lead, cuộc gọi…), cho chờ tải và toast.
- Chuyển thể khối đích `auth-15` và `solution-users-8` — việc riêng (ADR-0005, ADR-0006).

> Out of scope = scope-truth (Gate 1 duyệt mục này). Rationale/trade-off từng mục → 1 entry `descope` trong `decisions.jsonl`.

## Notes

- Bất biến chạm: không bất biến nào — hàng chỉ đổi cách dựng giao diện và thêm công cụ kiểm; không bảng, không API.
- Giới hạn đã khai (AC-4): dòng chữ trần không mang `role` và không dùng khối cấm thì bộ quét trạng thái không thấy —
  ví dụ dạng cũ «Chỉ quản trị sàn xem được trang này» trong thẻ `<p>` không role. Hàng này sửa chỗ ấy bằng tay; bài kiểm
  không bắt được lần lặp lại.
- Bề ngoài mới của khối báo (đỏ cho lỗi, thường cho báo) lần đầu nhìn thấy ở Cổng Bằng chứng (ảnh E6); mọi chỗ trình
  trạng thái đi qua một tệp `TrangThai`, nên đổi bề ngoài là sửa một tệp.
- Timebox: ô cơ hội để «…»; hàng chạy trong đợt nen-2 (hạn 600 phút từ lúc dãy D nhận việc).
- `don_vi` là khoá thêm ngoài §11.3 cho nhóm trạng thái (thiết kế, mục «Hai cách kiểm») — điểm báo về kit.
- Dãy D chạy dev ở cổng 3473, Postgres 5553 (`quy-hang-db-D`).
