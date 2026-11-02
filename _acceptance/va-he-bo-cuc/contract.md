---
schema_version: 1
feature: Vá Hệ bố cục — mỗi mục của Hôm nay ở cột thứ hai mở đúng chỗ của nó, mục chưa có chỗ thì báo rõ, không mục nào bấm mà không phản hồi
slug: va-he-bo-cuc
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: implemented
design_doc: docs/superpowers/specs/2026-11-02-va-he-bo-cuc-design.md
approved_by: Manh Phan
approved_at: 2026-11-02
---

# Acceptance Contract: va-he-bo-cuc

## Context

Hàng 91 (`he-bo-cuc`) cho nhà Hôm nay một cột thứ hai liệt năm hàng đợi của bộ nhóm mặc định, mỗi mục trỏ
`/today#<mã nhóm>` mà màn Hôm nay không có chỗ nào mang mã ấy: bấm không phản hồi, mục không bao giờ sáng. Chủ kho chọn
«mở hợp đồng mới» ở Cổng Bằng chứng hàng 91 (Ngoài-6). Hàng này cho mục mở đúng nhóm trên Hôm nay theo đường mở lead đã có
của hàng 26, và báo một dòng khi mục không có chỗ.

## Criteria

- AC-1: Given đầu chủ có việc ở một nhóm đang gập, When bấm mục của nhóm ấy ở cột thứ hai, Then địa chỉ thành
  `/today?nhom=<mã>`, nhóm ấy mở, dòng nhóm được chọn và nằm trong khung nhìn; nhóm khác giữ trạng thái mở hay gập. Đúng
  cho mọi nhóm có việc trong năm nhóm mặc định. Người kiêm Đầu chủ và Telesales được xử như đầu chủ. Given tải nguội
  `/today?nhom=<mã>` (tải lại trang, mở thẳng địa chỉ), When lưới còn đang tải, Then chưa có dòng báo, chưa chọn dòng nào;
  When tải xong, Then như khi bấm.
- AC-2: Given cột thứ hai của Hôm nay, When địa chỉ là `/today?nhom=<mã>`, Then đúng một mục mang `aria-current="page"` —
  mục có mã ấy; địa chỉ `/today` trần hay tham số bị bỏ qua thì không mục nào mang nó. Mỗi mục là liên kết tới
  `/today?nhom=<mã của chính nó>`, không mục nào còn trỏ `#`.
- AC-3: Given đầu chủ và một nhóm không có việc hôm nay, When mở `/today?nhom=<mã nhóm ấy>`, Then màn hiện đúng một dòng
  báo «Hôm nay không có việc ở «<nhãn nhóm>»», lưới giữ nguyên các nhóm có việc; mở sang nhóm có việc thì dòng báo mất.
- AC-4: Given người không có vai Đầu chủ (chỉ Telesales, hay chỉ Trưởng nhóm), Then theo lối người chọn ở dòng sổ Hỏi-1
  (gate1). Lối báo rõ (khuyến nghị): cột vẫn liệt năm mục; When mở `/today?nhom=<mã của bộ nhóm>`, Then đầu màn hiện đúng
  một dòng báo «Hàng đợi «<nhãn nhóm>» chỉ có ở Hôm nay của đầu chủ», phần còn lại của màn như khi mở `/today` trần. Lối
  ẩn: cột Hôm nay của người ấy không có mục hàng đợi nào mà có một dòng «Hàng đợi có ở Hôm nay của đầu chủ»; mở thẳng
  `/today?nhom=<mã>` vẫn ra dòng báo như lối báo rõ.
- AC-5: Given tham số `nhom` sai khuôn mã nhóm của lõi (rỗng, chữ hoa, dấu, quá 40 ký tự), When mở Hôm nay, Then màn như
  `/today` trần: không dòng báo, không mục nào sáng. Given mã đúng khuôn mà không có trong bộ nhóm đang dùng (sàn tắt
  nhóm, mã lạ), Then người mở — đầu chủ hay không — thấy một dòng báo «Không có hàng đợi này ở Hôm nay của bạn».
- AC-6: Given địa chỉ có cả `lead=<id>` và `nhom=<mã>`, When mở Hôm nay, Then đường mở lead của hàng 26 chạy như cũ (mở
  nhóm chứa lead, chọn dòng lead) và tham số `nhom` bị bỏ qua; các ca kiểm của đường mở lead vẫn đạt.
- AC-7: Given các tệp giao diện hàng này chạm, When chạy lint của kho và sàn thiết kế, Then mức nợ giao diện giữ 0, không
  mã màu thô, kiểm chuẩn khuôn không lệch mới; dòng báo dùng khuôn `TrangThai` đã có, không khối mới.

## Coverage

Bốn trục, quét tay (sổ quyết định, dòng «bỏ coverage-scan»):

| Trục | Giá trị | AC |
|---|---|---|
| Nhóm | năm nhóm mặc định | AC-1, AC-2 |
| Chỗ của nhóm | có việc · không việc · không có trong bộ nhóm | AC-1, AC-3, AC-5 |
| Vai | đầu chủ · đầu chủ kiêm telesales · không đầu chủ | AC-1, AC-4 |
| Tham số | `nhom` đúng · sai khuôn · lạ · cùng `lead` · vắng | AC-2, AC-5, AC-6 |
| Khổ | 1440 · 1024 (có cột) | AC-1 |

Ô bỏ: khổ 375 — điện thoại không có cột thứ hai (Out of scope).

## Out of scope

- Bộ nhóm riêng của sàn và số đếm theo nhóm ở cột thứ hai — hàng 42.
- Mục ở cột thứ hai của các nhà khác (Đã gửi, Cài đặt sàn, Đội).
- Hôm nay của trưởng nhóm — hàng 42.
- Điện thoại (375): không có cột thứ hai.
- Giữ cột hồ sơ đang mở khi bấm mục nhóm — mục là liên kết tới `/today?nhom=<mã>`, cột hồ sơ đóng như khi vào Hôm nay.

## Notes

- Ngoài-1 (máy định tuyến 2026-11-02, đề xuất S4 known-limits): Khi danh sách lead giao cho bạn tải lỗi (mất mạng, máy chủ trục trặc), bấm mục «Lead mới» ở cột bên vẫn hiện «Hôm nay không có việc ở «Lead mới»» cạnh dòng báo lỗi tải. Trang nói là không có việc trong khi thật ra chưa biết. — `apps/web/src/app/(app)/today/hom-nay-dau-chu.tsx`
- Ngoài-2 (máy định tuyến 2026-11-02, đề xuất S4 known-limits): Người dùng không gặp lỗi nào hôm nay: người kiêm đầu chủ vẫn được xử như đầu chủ. Nhưng nếu sau này ai đó đổi cách nhận biết vai, bài kiểm vẫn xanh và có thể để lọt một người kiêm đầu chủ bị báo sai là «chỉ có ở Hôm nay của đầu chủ». — `apps/web/src/app/(app)/today/mo-nhom.test.ts`
- Ngoài-3 (máy định tuyến 2026-11-02, đề xuất S4 known-limits): Chỉ một trong năm hàng đợi được kiểm tự động về việc mở đúng nhóm khi bấm; bốn hàng đợi còn lại nếu sau này hỏng thì bài kiểm không tự báo. Hiện chưa thấy hàng đợi nào bấm sai. — `apps/web/src/app/(app)/today/mo-nhom.test.ts`
