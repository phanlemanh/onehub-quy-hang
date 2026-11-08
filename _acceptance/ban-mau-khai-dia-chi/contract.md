---
schema_version: 1
feature: "Mỗi trang bản mẫu khai một địa chỉ màn thật nó đứng thay; vỏ lấy nhà, tiêu đề điện thoại, tab dưới và mục sáng cột thứ hai theo địa chỉ ấy; bộ quét bản đồ khuôn coi khu proto là khu bản mẫu riêng và đỏ khi trang bản mẫu không khai địa chỉ"
slug: ban-mau-khai-dia-chi
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: implemented
design_doc: docs/superpowers/specs/2026-11-08-ban-mau-khai-dia-chi-design.md
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-11-08T16:35:41Z
---

# Acceptance Contract: ban-mau-khai-dia-chi

## Context

Bản mẫu chạy ở `/proto/<tên>` nên vỏ không biết nhà, ảnh trình chủ kho thiếu vỏ (`docs/plan/ra-soat-ban-mau.md` §1, 14 hồ sơ).
«Khai địa chỉ» = trang đặt `<KhaiDiaChi duong="…" />`. «Khu bản mẫu» = `apps/web/src/app/(app)/proto/**`. «Bộ quét» =
`packages/ui-lint/ban-do-khuon.mjs`, chạy trong `npm run lint`.

Source input: hàng `ban-mau-khai-dia-chi` (`docs/plan/lo-trinh.json`) · thiết kế ở `design_doc`.

## Criteria

- **AC-1** — Trên máy tính, bản mẫu có vỏ như màn thật.
  Given đăng nhập vai có Bảng hàng, khổ 1440x900,
  When mở `/proto/nhanh-tuc-thi` (khai `/inventory`) và mở `/inventory`,
  Then cả hai có thanh trên, nhà Bảng hàng sáng, cột thứ hai cùng các mục, cùng mục sáng.

- **AC-2** — Trên điện thoại, bản mẫu có tiêu đề và tab như màn thật.
  Given khổ 375x812,
  When mở `/proto/nhanh-tuc-thi` và `/inventory`,
  Then cả hai cùng tiêu đề «Bảng hàng», cùng tab dưới đang sáng.

- **AC-3** — Vỏ lấy địa chỉ khai đúng phạm vi.
  Given hàm `duongCuaVo`,
  When đường đang chạy thuộc khu bản mẫu và có địa chỉ khai hợp lệ,
  Then vỏ dùng địa chỉ khai kể cả tham số; đường ngoài khu (trừ trang mẫu sống), không khai, hoặc khai địa chỉ không thuộc nhà
  nào thì vỏ giữ đường thật và tham số thật — màn thật ở `/today?nhom=<mã>` vẫn sáng đúng mục.

- **AC-4** — Mục sáng theo địa chỉ khai, không theo mặc định.
  Given trang khai `/settings/labels` và trang khai `/today?nhom=<mã>`,
  When tính mục sáng của cột thứ hai,
  Then sáng đúng «Cách gọi» và đúng mục nhóm ấy; tham số `?loi=` của đường thật không làm đổi mục sáng.

- **AC-5** — Trang mẫu sống vẫn đúng sau khi nâng từ nhà lên địa chỉ.
  Given `/mau/he-bo-cuc` ở các bố cục,
  When tải mã,
  Then vỏ sáng đúng nhà của bố cục và có cột thứ hai, kiểm kiểu xanh, không còn prop `nhaMau`.

- **AC-6** — Khu bản mẫu ra khỏi Trang tạm, không khai ngoại lệ từng trang.
  Given cây của vòng,
  When chạy bộ quét,
  Then trang trong khu không thuộc nhóm Trang tạm, không báo «màn ngoài bản đồ», Trang tạm không còn dòng ngoại lệ proto; trang
  ngoài khu thiếu khuôn vẫn đỏ như cũ.

- **AC-7** — Trang bản mẫu không khai địa chỉ thì đỏ.
  Given một bản sao có trang trong khu thiếu `KhaiDiaChi`, khai bằng biến, hoặc khai địa chỉ không thuộc nhà nào,
  When chạy bộ quét,
  Then đỏ, nêu đúng tệp và lý do; trang khai đúng thì xanh.

- **AC-8** — Sổ design-pass ghi địa chỉ thật.
  Given một bản sao có `proto/<slug>` và hồ sơ `<slug>` đang mở với `design-pass.md`,
  When sổ không chứa địa chỉ khai,
  Then bộ quét đỏ nêu sổ ấy; sổ có địa chỉ hoặc hồ sơ đã ký thì xanh.

- **AC-9** — Ba trang đang có khai địa chỉ và cấu hình nghiệm thu không đổi.
  Given cây của vòng,
  When chạy `npm run lint` và so `_acceptance/config.yaml` với điểm rẽ khỏi nhánh chính,
  Then lint xanh, tệp cấu hình không đổi.

## Coverage

Trục: phần vỏ (nhà · cột thứ hai · mục sáng · tiêu đề · tab) × khổ (máy tính · điện thoại) × kiểu đường (khu bản mẫu · màn thật ·
trang mẫu sống) × lời khai (đúng · thiếu · biến · sai nhà). Mục tiêu đo: AC-1, AC-2 phủ phần vỏ × khổ; AC-3 phủ kiểu đường × lời
khai ở lõi; AC-4 phủ mục sáng; AC-5 phủ trang mẫu sống; AC-6 đến AC-8 phủ bộ quét. Không gian nhỏ và đóng nên không chạy quét
hình thái — xem dòng sổ «bỏ coverage-scan».

## Out of scope

- Đổi `design_pass.proto_route` hay bất kỳ dòng nào của `_acceptance/config.yaml`.
- Chụp lại ảnh của hồ sơ đã ký; sửa kit nghiệm thu.
- HTML máy chủ của khu bản mẫu có sẵn cột thứ hai trước khi trang chạy trên trình duyệt.
- Nhà của màn thật Nhập Excel, Ô nhận lead.
- Bỏ luật đợt 73: `LUAT.md` chỉ giám sát được sửa; thợ báo trong tin xong, giám sát bỏ sau khi gộp.

## Notes
