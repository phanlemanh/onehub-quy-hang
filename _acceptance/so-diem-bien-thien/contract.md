---
schema_version: 1
feature: "Mọi điểm sàn chỉnh được khai ở một sổ của lõi — khoá, kiểu, mặc định, khoảng cho phép, ai đổi, áp cho mới hay tính lại, lớp dữ liệu — và luật của lõi nhận cấu hình làm tham số thay vì đọc hằng số"
slug: so-diem-bien-thien
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [core]
status: approved
design_doc: docs/superpowers/specs/2026-11-04-so-diem-bien-thien-design.md
approved_by: Manh Phan
approved_at: 2026-11-04
---

# Acceptance Contract: so-diem-bien-thien

## Context

Hàng 81 của lộ trình, đợt `cau-hinh-theo-san-0111` (CH1, CH2), Cổng Đáng «build» (Manh Phan, 02/11). ADR-0018 quyết định
1, 2, 6: một sổ điểm biến thiên ở lõi, khớp với sổ ở tài liệu; luật của lõi nhận cấu hình làm tham số; hằng số đang có
thành mặc định của sổ. Lõi thuần — không cơ sở dữ liệu, không API, không màn.

Source input: `docs/plan/lo-trinh.json` hàng 81 · `_acceptance/so-diem-bien-thien/opportunity.md` · thiết kế
`docs/superpowers/specs/2026-11-04-so-diem-bien-thien-design.md`.

## Criteria

- AC-1: Given sổ ở mã (`packages/core/src/config/so.ts`), When đọc từng dòng, Then mỗi dòng có số thứ tự, khoá dạng
  `<nhóm>.<khoá>` (đoạn họ viết `<…>`), tên điểm, kiểu, mặc định, khoảng, vai được đổi (khác rỗng, mỗi vai trong
  `ROLES`), ghi đè, hiệu lực (`moi` / `tinh_lai` / `lan_sau`), lớp (trong `DATA_CLASSES`), tình trạng (`mo` / `de_xuat`);
  khoá và số thứ tự không trùng; mặc định của mọi dòng không phải `map` qua đúng khuôn của chính dòng ấy.
- AC-2: Given sổ ở tài liệu (`docs/architecture/so-diem-bien-thien.md`, các bảng phần A) và sổ ở mã, When bộ kiểm khớp
  chạy, Then hai tập khoá bằng nhau, và với mỗi khoá: số thứ tự, loại kiểu, lớp, tình trạng, hiệu lực, vai được đổi (chữ
  «Ai đổi» dịch theo nhãn vai của `CONTEXT.md`) bằng nhau, mặc định bằng nhau khi kiểu là `int`, khoảng bằng nhau khi ô
  «Khoảng» mở đầu bằng `a–b`; bốn điểm khoảng viết bằng chữ (#10, #11, #24 và mặc định #15, #20) theo câu trả lời Hỏi-1;
  một khoá chỉ có ở một bên, hay một cột lệch, làm bộ kiểm đỏ nêu đúng khoá và cột.
- AC-3: Given sổ ở mã và sổ ở tài liệu, When kiểm lớp, Then không dòng nào lớp `source`; bộ kiểm sổ của lõi (`kiemSo`)
  từ chối một sổ có dòng lớp `source` và nêu khoá của dòng ấy.
- AC-4: Given mỗi điểm giá trị đơn của sổ, When gọi `kiemGiaTri(khoá, giá trị)` với mặc định, một giá trị khác trong
  khoảng, hai biên của khoảng, một giá trị ngay ngoài mỗi biên và một giá trị sai kiểu, Then ba ca đầu và hai biên được
  nhận, các ca ngoài khoảng và sai kiểu bị từ chối với lỗi mở đầu bằng đúng khoá; khoá không có trong sổ và khoá `map` bị
  từ chối nêu khoá; nhãn chứa số điện thoại hay email bị từ chối; hạn gọi lần đầu nhỏ hơn hạn nhận đang áp bị từ chối nêu
  `lead_routing.first_call_minutes`.
- AC-5: Given các dòng `{ key, value }` của một sàn, When gọi `giaiCauHinh`, Then không dòng nào cho đúng mặc định của sổ ở
  mọi điểm giá trị đơn; dòng hợp lệ thay đúng điểm ấy, điểm khác giữ mặc định; dòng hỏng giữ mặc định và thêm một lỗi nêu
  khoá; khoá lạ thành lỗi nêu khoá; khoá `map` (`queue.groups`) bỏ qua không lỗi.
- AC-6: Given luật «cần gọi lại» (`freshness`), When gọi không truyền cấu hình, Then kết quả như trước hàng này (13 ngày
  chưa cần gọi, 14 ngày cần gọi); When truyền cấu hình có `queue.call_back_after_days` là 7, 20 hay 30, Then căn cần gọi
  lại đúng từ ngày ấy, chưa cần ở ngày trước đó.
- AC-7: Given luật hỏi lại khi đổi giá (`canHoiLai`), When không truyền cấu hình, Then đổi đúng 20% không hỏi, 21% hỏi
  (như trước); When `price.change_confirm_pct` là biên dưới, một giá trị giữa và biên trên của khoảng trong sổ (5–50),
  Then đổi đúng mức ấy không hỏi, quá mức ấy hỏi; đổi điều kiện phí vẫn luôn hỏi.
- AC-8: Given luật chia lead và hàng đợi Hôm nay, When đọc cấu hình chia lead không dòng nào, Then hạn nhận 15, hạn gọi 30
  (như trước); dòng 1 và 1440 phút được nhận ở cả hai hạn; 0 và 1441 bị từ chối với lỗi nêu đúng khoá
  (`lead_routing.accept_minutes`, `lead_routing.first_call_minutes`); luật xét hạn (`unroutedDue`, `dueAlerts`) với hạn
  đọc từ cấu hình ở 1 và 1440 phút báo quá hạn đúng ở phút ấy, chưa báo ở phút trước; và ngưỡng mặc định của hàng đợi (10, 14 ngày) cùng
  hai khoảng (7–14, 7–30) bằng mặc định và khoảng của sổ (#5, #4).
- AC-9: Given các hằng số mặc định đang có cho một điểm của sổ — `CALL_BACK_AFTER_DAYS`, `MUC_HOI_LAI_DOI_GIA_PHAN_TRAM`,
  `DEFAULT_LEAD_ROUTING`, `DEADLINE_MINUTES`, `QUEUE_DEFAULT_DAYS`, `QUEUE_DAY_RANGES` (hai nhóm mặc định),
  `MAC_DINH_ANH_THAT_TOI_THIEU`, `KHOANG_ANH_THAT_TOI_THIEU`, `CAU_HINH_MAC_DINH` (luật ẩn), `TI_LE_BAO_PHI_MAC_DINH` —
  When so với sổ, Then mỗi hằng bằng mặc định (và khoảng) của đúng khoá trong sổ, và một bản sao sổ đổi mặc định một khoá
  làm đúng dòng hằng ấy lệch, nêu tên hằng và khoá; các bộ kiểm có sẵn của lõi, API, kết nối và kiểm kiểu toàn kho vẫn
  xanh.

## Coverage

Bỏ quét morphological-scan (sổ: «bỏ coverage-scan»); trục ghi tay:

- Trục cột sổ: khoá | số | kiểu | mặc định | khoảng | vai | ghi đè | hiệu lực | lớp | tình trạng (AC-1, AC-2).
- Trục kiểu: int | decimal | bool | enum | set | text | map | họ khoá (AC-1, AC-4, AC-5).
- Trục giá trị: mặc định | khác trong khoảng | hai biên | ngay ngoài biên | sai kiểu | khoá lạ | ràng buộc chéo (AC-4, AC-6,
  AC-7, AC-8).
- Trục nguồn số: sổ tài liệu | sổ mã | hằng đang có | dòng của sàn (AC-2, AC-5, AC-9).
- Trục bất biến: không lớp nguồn (AC-3); nhãn không chở số chủ nhà (AC-4).
- Later: đọc theo sàn ở API, bảng và nhật ký (hàng 82); màn (45–50). Never ở hàng này: phần B, C của sổ trong mã.

## Đường đo

- Thước SỐNG/CHẾT «bộ kiểm của lõi đạt câu `bat_khi` của hàng» · số từ: `npm test -w @quy-hang/core` · bảo đảm bởi:
  AC-2 (sổ khớp), AC-3 (không lớp nguồn), AC-6, AC-7, AC-8 (14 ngày, 20%, 15/30 ở mặc định, giá trị khác, hai biên),
  AC-4 (ngoài khoảng nêu khoá).

## Out of scope

- Bảng `company_settings_events`, mở `company_settings` cho mọi khoá, lệnh API đọc và đổi cấu hình — hàng 82.
- API và việc nền đọc cấu hình theo sàn rồi truyền vào luật — hàng 82; hàng này để người gọi nhận mặc định.
- Màn Cài đặt sàn — hàng 45–50.
- Tính giá về tay theo tỉ lệ phí của sàn — hàng 49; hàng này chỉ cho `TI_LE_BAO_PHI_MAC_DINH` lấy số từ sổ.
- Phần B (ứng viên) và C (khoá) của sổ tài liệu trong mã.

## Notes

- Bất biến chạm: (2) — không khoá nào lớp `source` (AC-3), nhãn qua bộ dò số điện thoại, email (AC-4). (1), (3), (4)
  không chạm: không bảng, không gửi, luật ẩn chỉ đổi chỗ lấy mặc định (AC-9).
- Thêm `zod` vào gói lõi theo ADR-0018 quyết định 1 — sổ quyết định.
- Sổ tài liệu thêm dòng #36 `queue.groups` mà hàng 22 đã ghi vào mã — sổ quyết định.
- Dãy D, đợt `dau-khach-nhap`.
