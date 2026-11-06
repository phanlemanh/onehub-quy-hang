---
schema_version: 1
feature: "Quản trị sàn đặt tỉ lệ thuế phí và định nghĩa «bao phí» của sàn ở mục «Thuế phí» của Cài đặt sàn; giá bao phí ghi sau lúc đổi mang định nghĩa mới, giá đã lưu giữ định nghĩa lúc tính kèm ngày; người xem giá thấy giá ấy tính theo định nghĩa ngày nào; sàn khác không bị ảnh hưởng"
slug: thue-phi
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [ui, api]
status: implemented
approved_by: Manh Phan
approved_at: 2026-11-06T01:35:13Z
design_doc: docs/superpowers/specs/2026-11-06-thue-phi-design.md
---

# Acceptance Contract: thue-phi

## Context

Hàng 49 của lộ trình (dãy Q, đợt `dau-khach-nhap`), mã phạm vi P12; Cổng Đáng ký 05/11 (build). Hạng lộ trình ghi T2;
hồ sơ lên T3 vì cần migration 050 (`packages/db/**` thuộc `t3_paths`). Đứng trên sổ điểm #8–#11 (hàng 81), lối chung cấu
hình (hàng 82), lõi giá về tay (hàng 28) và khuôn màn Cài đặt sàn (màn mẫu hàng 48). Bất biến chạm: **1 — cách ly giữa
công ty** (bảng mới `listing_price_fee_basis` bật luật theo dòng, ca mới ở bộ kiểm cách ly). Không chạm bất biến 2, 3, 4:
mọi điểm và dấu thuộc lớp `company_internal`, không ra trang khách.

Source input: `docs/plan/lo-trinh.json` hàng 49 · `_acceptance/thue-phi/opportunity.md` · Tham chiếu §8 luật 12, 13 ·
`docs/architecture/so-diem-bien-thien.md` #8–#11 · thiết kế `docs/superpowers/specs/2026-11-06-thue-phi-design.md`

## Criteria

- **AC-1** — Màn Thuế phí hiện đủ ba khoản, định nghĩa và nguồn.
  Given quản trị sàn mẫu ở Cài đặt › Sàn [Tên] › Thuế phí, sàn đã đổi Môi giới thành 1,5, các điểm khác chưa đổi,
  When mở mục,
  Then màn có đúng ba dòng theo thứ tự Thuế thu nhập cá nhân · Lệ phí trước bạ · Môi giới; mỗi dòng có công tắc «Tính vào
  giá bao phí» đang bật theo `fee.inclusion`; tỉ lệ hiện 2% · 0,5% · 1,5%; dòng Môi giới mang «Đã đổi · <người> · <ngày>»,
  hai dòng kia «Mặc định»; thuế và lệ phí ghi «theo luật» và không có ô sửa tỉ lệ (Hỏi-1).

- **AC-2** — Lưu một lần qua lối chung, có nhật ký; sai thì không ghi. (cross-layer)
  Given quản trị sàn ở màn, giá trị đang áp là mặc định,
  When đặt Môi giới 2 và tắt Lệ phí trước bạ khỏi bao phí rồi bấm Lưu,
  Then một lần PATCH `/api/v1/company/settings` gửi đúng hai khoá `fee.brokerage_pct = 2` và `fee.inclusion =
  [personalIncomeTax, brokerageFee]`; toast «Đã lưu · áp cho giá ghi từ bây giờ»; tải lại giữ giá trị; nhật ký thêm hai sự
  kiện ghi người và vai; Môi giới 6 hay tắt cả ba khoản thì không lưu được, lý do gắn đúng dòng, cấu hình không đổi.

- **AC-3** — Vai khác không đặt được thuế phí.
  Given người mang vai Trưởng nhóm, Đầu chủ, Đầu khách hay Telesales của sàn mẫu (không company_admin),
  When mở `/settings/fees` hay gửi PATCH bất kỳ khoá `fee.*`,
  Then màn chuyển về Cá nhân kèm câu «Mục này chỉ quản trị sàn mở được»; API trả 403 và cấu hình không đổi.

- **AC-4** — Mỗi giá bao phí mang định nghĩa của sàn lúc ghi, ở mọi lối; giá đã lưu không đổi. (cross-layer)
  Given sàn A đang áp mặc định, căn X có giá bao phí ghi lúc t1,
  When quản trị đổi Môi giới 2 và tắt Lệ phí trước bạ ở t2, rồi giá bao phí của căn Y được ghi lần lượt qua sửa trên ô, nhập
  file và đồng bộ trên máy, và căn Z ghi giá không bao phí,
  Then mỗi sự kiện giá bao phí của Y có đúng một dấu: khoản `[personalIncomeTax, brokerageFee]`, tỉ lệ 200 · 50 · 200 phần
  vạn, ngày tính = lúc giá vào máy chủ (kể cả sự kiện làm lúc mất mạng trước t2 và đẩy lên sau t2 — dấu mang định nghĩa
  đang áp lúc vào máy chủ); dấu của X vẫn là định nghĩa mặc định với ngày t1; Z không có dấu; vai API không ghi, sửa hay
  xoá được dấu. Phần trăm môi giới đầu chủ sửa cho một lần tính trên máy tính cuộc gọi không vào dấu (máy tính không ghi gì
  — đã chốt ở hàng 28); dấu là định nghĩa của sàn.

- **AC-5** — Giá ghi trước hàng này có dấu định nghĩa mặc định.
  Given cơ sở dữ liệu có sự kiện giá bao phí ghi trước migration 050,
  When chạy migration (hai lần),
  Then mỗi sự kiện ấy có đúng một dấu mang mặc định sản phẩm (ba khoản, 200 · 50 · 100) và ngày tính bằng lúc ghi sự kiện;
  sự kiện giá không bao phí không có dấu; lần chạy thứ hai không thêm dòng.

- **AC-6** — Sàn khác không bị ảnh hưởng.
  Given sàn A đã đổi định nghĩa, sàn B chưa đổi,
  When giá bao phí của một căn sàn B được ghi, và người sàn B đọc dấu,
  Then dấu của B mang mặc định sản phẩm; người sàn B không đọc được dấu hay cấu hình phí của sàn A; người sàn A không đọc
  được dấu của sàn B.

- **AC-7** — Người xem giá thấy giá tính theo định nghĩa ngày nào. (cross-layer)
  Given căn có giá bao phí 3 tỷ ghi khi định nghĩa là mặc định, sau đó sàn đổi Môi giới 2,
  When đầu chủ của căn mở hồ sơ căn,
  Then dòng giá có dòng phụ «Tính theo định nghĩa ngày <dd/mm/yyyy của lúc ghi>: Thuế TNCN 2% · Trước bạ 0,5% · Môi giới 1%
  — về tay 2,895 tỷ» (về tay theo dấu, không theo 2% hiện hành); `GET /api/v1/listings/{id}/fee-basis` trả đúng dấu ấy; căn
  không bao phí hay chưa có giá không có dòng phụ và lối trả `null`.

- **AC-8** — Màn cuộc gọi tính theo định nghĩa hiện hành của sàn. (cross-layer)
  Given sàn đã tắt Lệ phí trước bạ và đặt Môi giới 2,
  When đầu chủ mở màn cuộc gọi khai thác với giá bao phí 3 tỷ,
  Then máy tính bao phí ↔ về tay hiện hai khoản (Thuế thu nhập cá nhân 2% · Môi giới 2%), về tay 2,88 tỷ; ô phần trăm môi
  giới mở với 2; so giá toà quy về tay theo cùng định nghĩa.

- **AC-9** — Lõi tính theo tập khoản; mặc định ở cơ sở dữ liệu khớp lõi.
  Given định nghĩa bất kỳ trong bảy tập con khác rỗng của ba khoản,
  When tính về tay và giá bao phí từ về tay,
  Then khoản ngoài định nghĩa không trừ và không hiện; hai chiều tính khớp nhau trên mọi tập; mặc định trong hàm SQL của
  migration 050 bằng đúng mặc định của sổ điểm ở lõi (đổi một bên thì bài đỏ nêu khoá).

- **AC-10** — Điều đang đúng đã ghi.
  Given hàng xong,
  When đọc Tham chiếu và sổ điểm,
  Then Tham chiếu §12 có dòng 06/11 cho thuế phí (dấu định nghĩa ở cơ sở dữ liệu, ngày tính, màn) và dòng Cài đặt sàn ở §10
  ghi Thuế phí đã có màn; sổ điểm #10, #11 ghi đã kiểm văn bản 06/11 và nguồn.

## Coverage

Trục (quét entity-feature, bản thiết kế §Quét không gian): ca người (quản trị · vai khác · sàn khác) × lối ghi giá (sửa
trên ô · cuộc gọi · nhập file · đồng bộ · hoàn tác · giá cũ) × điều kiện giá (bao phí · không bao phí · chưa giá) × chỗ xem
(Cài đặt · hồ sơ căn · cuộc gọi · Bảng hàng · trang khách). Thước CE: luật 12, 13 của Tham chiếu §8; sổ #8–#11; các lối ghi
`price_changed` đang có trong `packages/api/src` (sửa trên ô, nhập, hoàn tác nhập, đồng bộ). Màn cuộc gọi ghi giá qua lối
sửa của hàng (AC-4 phủ bằng dấu ở cơ sở dữ liệu, không phủ riêng từng màn). Bảng hàng và trang khách ngoài phạm vi (Out of
scope). Điền dấu mặc định cho giá cũ (AC-5) là Hỏi-3 ở Cổng Phạm vi. Phạm vi «người xem giá» của ngưỡng (hồ sơ căn và màn
cuộc gọi; Bảng hàng sau hàng 46) là Hỏi-4.

## Đường đo

- Ngưỡng ở `opportunity.md` là câu `bat_khi` của hàng, từng vế một đường đo: «Quản trị sàn đặt tỉ lệ và định nghĩa» →
  AC-1, AC-2 (E1, E2a, E2b) · «giá tính sau lúc đổi dùng tỉ lệ mới» → AC-4, AC-8 (E4, E8, E8b) · «giá đã lưu giữ nguyên
  kèm ngày tính» → AC-4, AC-5 (E4, E5) · «người xem giá thấy giá ấy tính theo tỉ lệ của ngày nào» → AC-7 (E7a–c; phạm vi
  người xem theo Hỏi-4) · «sàn khác không bị ảnh hưởng» → AC-6 (E6). Timebox của ngưỡng chưa khai — người khai ở Cổng Giá
  trị.

## Out of scope

- Bảng hàng hiện ngày tính của giá — vùng hàng 46 đang mở; Later (Hỏi-4 ở Cổng Phạm vi).
- So giá toà quy về tay bằng dấu riêng từng căn — vòng này dùng định nghĩa hiện hành của sàn (AC-8); Later.
- Giá chủ muốn của lead mang dấu định nghĩa; Later.
- Đầu chủ đặt môi giới riêng từng căn (ghi đè dưới sàn của #9); Later.
- Ngưỡng hỏi lại khi đổi giá (#7, cột màn 49) — người đọc ở Bảng hàng thuộc vùng hàng 46; Later.
- Lệ phí trước bạ tính trên bảng giá đất thay vì giá; Later.
- Tỉ lệ hay định nghĩa ra trang khách — Never (lớp `company_internal`).

## Notes
