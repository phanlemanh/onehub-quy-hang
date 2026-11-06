---
schema_version: 1
feature: "Bộ đọc địa chỉ đọc đúng tên đường dạng «Đường số N»: chữ «số» trong tên đường không bị lấy làm số nhà, hai đường số khác nhau không bao giờ ra cùng khoá, mọi cách viết của cùng một đường số ra cùng khoá, và khoá cũ của bộ thử hàng 73 không đổi"
slug: va-duong-so-n
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [sdk]
status: signed-off
approved_by: Manh Phan
approved_at: 2026-11-06
design_doc: _acceptance/va-duong-so-n/design.md
---

# Acceptance Contract: va-duong-so-n

## Context

Hàng vá va-duong-so-n (Ngoài-2 của hàng 75 `dia-chi-chuan`, chủ kho chọn «mở hợp đồng mới» 05/11). Bộ tách số nhà ở
`packages/core/src/address/chuan-hoa.ts` lấy chữ «số» trong «Đường số 5» làm dấu số nhà: tên đường mất số, «12 Đường số 5»
và «12 Đường số 7» ra cùng khoá mà vẫn báo «chuẩn», «Số 10 Đường số 5» ra số nhà 5. Vòng này sửa bộ tách và cách chuẩn hoá
tên đường cho khoá; phải xong trước khi hàng 76 lưu khoá. Bất biến chạm: không (lõi thuần, không dữ liệu chủ nhà).

Source input: `docs/plan/lo-trinh.json` hàng va-duong-so-n · `_acceptance/va-duong-so-n/opportunity.md` ·
`_acceptance/dia-chi-chuan/review-findings.md` (mục «Đường số N» bị đọc thành số nhà) · bộ thử hàng 73
(`packages/db/seed/mau-thap-tang/`).

## Criteria

- AC-1: Given ma trận viết trước tiền tố đường («Đường», «đường», «ĐƯỜNG», «Đ.», «Đg», «Duong», «Phố») × dạng số nhà («12
  <tiền tố> số 5», «Số 12 <tiền tố> số 5», «số 12, <tiền tố> số 5», «sn 12 <tiền tố> số 5», «<tiền tố> số 5 số 12», «số 3
  hẻm 45/12 <tiền tố> số 5», «số 3 ngách 12 ngõ 45 <tiền tố> số 5»), When tách số nhà, Then số nhà là số của nhà (12, hay
  45/12/3 cho hai dòng hẻm, ngõ) và tên đường là đúng «<tiền tố> số 5» như người gõ.
- AC-2: Given tên đường số không kèm số nhà («<tiền tố> số 5» với mọi tiền tố của AC-1, «hẻm 45 Đường số 5») và địa chỉ trọn
  «Đường số 5, Phường Bến Thành, TP.HCM», When tách và đọc, Then không có số nhà; địa chỉ trọn ra thiếu đúng phần số nhà,
  trạng thái «thieu», không khoá.
- AC-3: Given địa chỉ trọn «<số nhà> Đường số N, Phường Bến Thành, TP.HCM» với N từ 1 tới 30 và 5A, số nhà 12, 45/12/3, 7A,
  When đọc, Then mọi dòng ra «chuan» có khoá, và hai dòng khác đường hay khác số nhà không bao giờ cùng khoá — kể cả cặp
  «12 Đường số 5» · «12 Đường số 7».
- AC-4: Given cách viết của cùng một đường («Đường số 5», «đường Số 5», «ĐƯỜNG SỐ 5», «Đ. số 5», «Đg số 5», «Duong so 5»,
  «Phố số 5», «Đường số5», «Đường số 05») trong cùng địa chỉ trọn với số nhà 12, When đọc, Then mọi cách viết ra cùng một
  khoá `79|26743|so 5|12`; tên đường không có chữ «số» («Đường 5», «Đường 3 Tháng 2», «Đường 30/4») giữ dạng chuẩn hoá
  như hàng 75.
- AC-5: Given 86 cách viết của bộ thử hàng 73 và ảnh khoá chụp bằng bộ đọc trước khi vá (`anh-truoc-va.json`), When đọc bằng
  bộ đọc sau vá, Then mọi cách viết ra đúng số nhà, tên đường, tên đường chuẩn hoá, khoá và trạng thái của ảnh; bộ kiểm của
  hàng 75 vẫn xanh trong cùng lượt.
- AC-6: Given chữ cái «D» đứng một mình trước «số N» mà không phải viết tắt của «Đường» («Lô D số 12 Nguyễn Trãi», «Khu D
  số 12 Nguyễn Trãi», «Block D, số 12 Nguyễn Trãi», «lô d số 12 Nguyễn Trãi»), When tách số nhà, Then số nhà là 12 như bộ đọc
  hàng 75; còn «Đ. số 5», «Đ số 5», «đ số 5» (viết tắt bằng chữ «đ» hay có dấu chấm) vẫn là tên đường số.

## Coverage

Quét không gian (skill morphological-scan, preset test-matrix). Chân sản phẩm: mục Ngoài-2 của hàng 75, bộ tách số nhà và
bộ chuẩn hoá tên đường hiện có [SUY-TỪ-REPO: _acceptance/dia-chi-chuan/review-findings.md,
packages/core/src/address/chuan-hoa.ts]. Chân ngành: RESO `StreetName`/`StreetNumber`, USPS Publication 28 giữ số thứ tự
đường trong tên đường [NGÀNH: design.md §Đối chiếu ngành].

- Trục A — tiền tố đường: Đường | đường | ĐƯỜNG | Đ. | Đg | Duong | Phố | không tiền tố. [thước CE: bộ tiền tố của `tenDuongChuan`]
- Trục B — dạng số nhà: đứng đầu | «số» trước | «số» có dấu phẩy | «sn» | «số» sau tên đường | hẻm | ngõ-ngách | không số nhà. [thước CE: ma trận số nhà hàng 75]
- Trục C — cách viết số của đường: «số N» | «sốN» | «số 0N» | N có chữ cái | tên không chữ «số» («N» trơn, «3 Tháng 2»). [thước CE: dạng số nhà `\d+[a-z]?`]
- Trục D — mặt: bộ tách | đọc trọn có khoá | khoá cũ của bộ thử. [thước CE: các hàm xuất của vùng]

Core: A×B ở AC-1 · B(không số) ở AC-2 · C×khác đường ở AC-3 · A×C cùng đường ở AC-4 · D(khoá cũ) ở AC-5. Later: «Đường N» ≡ «Đường số N»;
«Hẻm số N», «Ngõ số N»; tên «Số N» không tiền tố; «Quốc lộ N», «Tỉnh lộ N». Never: đoán đường khi chữ mơ hồ.

## Đường đo

- Thước: «Đường số 5» và «Đường số 7» cùng số nhà không bao giờ ra cùng khoá · số từ: ma trận 31 đường × 3 số nhà đọc trọn,
  đếm cặp trùng khoá · bảo đảm bởi: AC-3
- Thước: «Số 10 Đường số 5» ra số nhà 10, tên đường «Đường số 5» · số từ: ma trận tiền tố × dạng số nhà · bảo đảm bởi: AC-1,
  AC-2
- Thước: địa chỉ hàng 75 đã đọc đúng vẫn ra đúng khoá cũ · số từ: 86 cách viết so với ảnh trước vá · bảo đảm bởi: AC-5

## Out of scope

- «Đường 5» (không chữ «số») chưa coi là cùng đường với «Đường số 5» (theo Hỏi-1 của Cổng Phạm vi) — gộp hai cách viết là nghĩa sản phẩm, cần dữ
  liệu thật; khoá hai dạng hiện khác nhau (một nhà có thể ra hai khoá, không bao giờ hai nhà ra một khoá).
- «Hẻm số N», «Ngõ số N», «Kiệt số N» — tên hẻm có chữ «số»; để vòng sau khi có địa chỉ thật dạng ấy.
- Tên đường «Số N» không có tiền tố đường («12 Số 5») — mơ hồ giữa số nhà và tên đường, không đoán.
- «Quốc lộ», «Tỉnh lộ», «Đường tỉnh» kèm số.
- Ba giới hạn đã biết của hàng 75 (gõ liền không dấu phẩy với phường có «Thành», chữ tổ hợp) — không đổi ở vòng này.
- Lưu khoá, kiểm trùng ngoài khu — hàng 76.

## Notes

- Ngoài-2 (máy định tuyến 2026-11-05, đề xuất S4 known-limits): Hiện người dùng không gặp gì. Về sau, khi gói được mở ra, một lập trình viên có thể dùng nhầm hàm phá thử và dựng lại lỗi «Đường số N» bị đọc thành số nhà. — `packages/core/src/address/chuan-hoa.ts`
- Ngoài-3 (máy định tuyến 2026-11-05, đề xuất S4 known-limits): Cùng một đường viết «số 05 nối dài» hay «số 5 nối dài» có thể ra hai khoá, nên có thể bị coi là hai đường khác nhau khi kiểm trùng. Hai nhà khác nhau không bao giờ bị gộp nhầm. — `packages/core/src/address/chuan-hoa.ts`
- Known limits — chọn ở Cổng Bằng chứng 2026-11-06:
  - Ngoài-2: Hàm dùng để phá thử của bộ tách số nhà đang lộ ra ngoài gói địa chỉ; cần ẩn trước khi hàng 76 mở gói cho bên gọi.
  - Ngoài-3: «Đường số 05 nối dài» và «Đường số 5 nối dài» ra hai khoá khác nhau — một nhà có thể ra hai khoá, không bao giờ hai nhà ra một khoá.
  - Ngoài-1 (vòng 2): Cùng ý Ngoài-3 vòng 1 — «Đường số 05 nối dài» và «Đường số 5 nối dài» ra hai khoá khác nhau.
  - Ngoài-2 (vòng 2): «Lô Đ số 12» (chữ Đ có dấu làm ký hiệu lô, khu) bị báo thiếu số nhà, vì «Đ» trùng cách viết tắt «Đường»; người dùng nhập lại số nhà.
