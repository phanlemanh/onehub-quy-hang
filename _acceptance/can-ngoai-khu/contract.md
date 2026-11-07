---
schema_version: 1
feature: "Hàng tạo được trên lô thấp tầng trong khu và trên nhà, đất ngoài khu định danh bằng địa chỉ chuẩn; căn ngoài khu là bản ghi của sàn, sàn khác không thấy, và hàng cũ gấp lại ra đúng như trước"
slug: can-ngoai-khu
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [api, sdk, db]
status: draft
approved_by:
approved_at:
design_doc: docs/superpowers/specs/2026-11-07-can-ngoai-khu-design.md
---

# Acceptance Contract: can-ngoai-khu

## Context

Hàng 76 (`LH5`): sự kiện tạo hàng bắt buộc toà và cột toà của bảng hàng không được trống, nên nhà phố, biệt thự, đất —
trong khu thấp tầng hay ngoài khu — không tạo được hàng. ADR-0016 quyết định 3 (ba cách định danh căn), 4 (căn ngoài khu
thuộc sàn), 5 (địa chỉ chuẩn và khoá). Bất biến chạm: 1 (bảng mới của công ty, luật theo dòng), 2 (khoá nguồn vẫn bị từ
chối), 4 (không trường mới nào ra trang khách ở vòng này).

Source input: `docs/plan/lo-trinh.json` hàng 76 · `_acceptance/can-ngoai-khu/opportunity.md` · `docs/adr/0016-moi-loai-hinh.md`
· `docs/adr/0008-loi-hang-va-su-kien.md` · `packages/core/src/listing/events.ts` · `packages/db/migrations/004_loi_hang_va_su_kien.sql`.

Từ dùng trong tiêu chí: **ba dạng** của sự kiện tạo hàng — có toà (`buildingName`), lô (`subdivisionName` + `blockName` +
`unitNumber`), ngoài khu (`offCompoundUnitId`); **khoá nguồn** là `ownerName`, `ownerPhone`, `floorPrice`,
`titleDeedPhoto`; **căn ngoài khu** là một dòng của bảng căn ngoài khu của sàn.

## Criteria

- AC-1: Given bảng payload `created` viết trước — mỗi dạng một payload đủ, mỗi dạng thiếu từng khoá bắt buộc, mọi cặp
  hai dạng trộn nhau, mỗi dạng thêm một khoá lạ và thêm từng khoá nguồn — When lõi kiểm khuôn, Then payload đủ không lỗi;
  mỗi payload còn lại ra đúng danh sách lỗi viết trước (đường dẫn khoá và lý do), khoá nguồn mang lý do «thông tin chủ nhà
  không vào hàng».
- AC-2: Given dãy sự kiện mẫu của hàng cũ (chỉ mang `buildingName`) và ảnh bản tính ghim trước vòng này, When gấp bằng lõi
  sau vòng, Then mọi khoá cũ của bản tính bằng ảnh ghim và ba khoá mới là `null`; và dãy sự kiện của hàng lô, hàng ngoài
  khu gấp ra đúng khu, dãy, lô, mã căn ngoài khu, toà `null`.
- AC-3: Given một sàn, When tạo căn ngoài khu qua API bằng địa chỉ đọc chắc cho mỗi loại hình Townhouse, Single Family
  Residence, Unimproved Land, Then 201, căn mang loại hình, mã tỉnh, mã xã, tên đường, số nhà, khoá địa chỉ lõi tính; và
  gửi lại cùng địa chỉ viết dạng khác mà cùng khoá (chữ hoa thường, «số», tên phường cũ) → 200 trả đúng căn ấy, số căn của
  sàn không tăng.
- AC-4: Given địa chỉ đọc chưa chắc — cần người chọn xã, thiếu tỉnh, thiếu xã, thiếu đường, tên chưa có trong danh mục —
  và loại hình ngoài ba giá trị, When tạo căn ngoài khu, Then 400 nêu đúng phần thiếu hay loại hình sai; không dòng nào được
  ghi.
- AC-5: Given địa chỉ đọc chắc mà thiếu số nhà, When tạo căn ngoài khu, Then theo Hỏi-2 đã chốt ở Cổng Phạm vi (khuyến
  nghị: 201, khoá địa chỉ `null`; gửi lại cùng chữ → căn mới, không gộp).
- AC-6: Given hai sàn A và B cùng tạo căn ngoài khu cùng một địa chỉ, When mỗi sàn đọc, Then mỗi sàn một căn khác mã; sàn A
  đọc căn của B, hay tạo hàng trỏ mã căn của B, nhận đúng phản hồi như với một mã không tồn tại, không dòng nào được ghi;
  và người cùng sàn không có Bảng hàng tạo hay đọc căn ngoài khu → bị từ chối như với hàng, không dòng nào được ghi.
- AC-7: Given bộ kiểm cách ly, When chạy, Then bảng căn ngoài khu bật và ép luật theo dòng; vai API của sàn A không đọc,
  không thêm, không sửa dòng của sàn B; phiên không có Bảng hàng đọc 0 dòng của chính sàn; chỉ mục duy nhất theo (sàn,
  khoá) chặn dòng trùng khoá trong một sàn và cho hai sàn cùng khoá; khoá ngoại ghép chặn hàng của sàn A trỏ căn của sàn B
  ở tầng dữ liệu.
- AC-8: Given một sàn có căn ngoài khu mỗi loại hình và một lô (khu, dãy, lô) của khu mẫu thấp tầng, When tạo hàng qua
  `POST /api/v1/listings` cho từng căn (bốn hàng), Then 201, đọc lại hàng ra đúng dạng định danh, trạng thái «Chưa đủ để
  rao», toà `null`; hàng có toà vẫn tạo như cũ.
- AC-9: Given lệnh tạo hàng ba dạng và lệnh tạo căn ngoài khu mang thêm từng khoá nguồn, When gửi qua API, Then 400 nêu
  khoá ấy; không dòng hàng, sự kiện hay căn nào được ghi.
- AC-10: Given bảng hàng có hàng cũ, hàng lô, hàng ngoài khu, When xoá trắng bảng hàng rồi gấp lại từ bảng sự kiện, Then
  từng cột của từng hàng bằng bảng cũ, kể cả ba cột mới; và bộ kiểm hiện có (lõi, API, cách ly, đồng bộ, kiểm kiểu toàn kho)
  xanh trong cùng lượt.

## Coverage

Quét không gian (skill morphological-scan, preset entity-feature). Chân sản phẩm: ADR-0016 quyết định 3–5 và mã hiện có
[SUY-TỪ-REPO: docs/adr/0016-moi-loai-hinh.md, packages/core/src/listing/events.ts].

- Trục A — dạng định danh: có toà | lô | ngoài khu. [thước CE: ba dạng của khuôn `created`]
- Trục B — loại hình: Condominium | Townhouse | Single Family Residence | Unimproved Land. [thước CE: `PROPERTY_SUBTYPE_FIELDS`]
- Trục C — đọc địa chỉ: chắc đủ | chắc thiếu số nhà | cần người chọn | thiếu phần | chưa có trong danh mục. [thước CE:
  `trangThai` và `thieu` của `docDiaChi`]
- Trục D — ranh giới: cùng sàn có Bảng hàng | cùng sàn không Bảng hàng | khác sàn. [thước CE: luật theo dòng và `app.works_listings()`]
- Trục E — đời sự kiện: sự kiện cũ | sự kiện mới. [thước CE: dãy sự kiện đã ghi trước vòng]

Core: A×khuôn ở AC-1 · A×E ở AC-2, AC-10 · B(ba thấp tầng)×C(chắc đủ) ở AC-3 · C(chưa chắc) ở AC-4 · C(thiếu số nhà) ở
AC-5 · D ở AC-6, AC-7 · A×B ở AC-8 · khoá nguồn ở AC-1, AC-9. Later: lên Đang bán cho lô và căn ngoài khu (Hỏi-1), kiểm
trùng theo khoá (hàng 77), hiện theo loại hình (hàng 79), luật ẩn (hàng 80). Never: danh mục chung nhận căn từ lead.

## Đường đo

- Thước: tạo được hàng Townhouse, Single Family Residence, Unimproved Land qua lệnh API · số từ: bộ kiểm API · bảo đảm bởi:
  AC-3, AC-8
- Thước: căn ngoài khu cùng khoá địa chỉ trong một sàn là một căn · số từ: bộ kiểm API và cách ly · bảo đảm bởi: AC-3,
  AC-7
- Thước: bảng căn ngoài khu bật và ép luật theo dòng, có ca trong bộ kiểm cách ly · số từ: bộ kiểm cách ly · bảo đảm bởi:
  AC-6, AC-7
- Thước: xoá trắng bảng hàng rồi gấp lại ra đúng bảng cũ, kể cả sự kiện cũ mang buildingName · số từ: bộ kiểm gấp lại ·
  bảo đảm bởi: AC-2, AC-10
- Thước: payload mang khoá nguồn vẫn bị từ chối · số từ: lõi và API · bảo đảm bởi: AC-1, AC-9

## Out of scope

- Lên Đang bán cho hàng lô và hàng ngoài khu — ảnh căn khoá theo toà + mã (Hỏi-1).
- Kiểm trùng lead và hàng mở theo khoá địa chỉ (hàng 77); màn theo loại hình (hàng 79); luật ẩn số nhà, mã lô (hàng 80);
  nhập file thấp tầng (hàng 78).
- Nạp phần thấp tầng của dữ liệu mẫu vào cơ sở dữ liệu — đề nghị hàng riêng.
- Ràng buộc duy nhất «một hàng mở trên một căn» ở tầng dữ liệu (ADR-0026).
- Kiểm lô có trong danh mục khi tạo hàng lô — cùng luật với toà hôm nay.
- Sửa, gộp, xoá căn ngoài khu sau khi tạo.

## Notes
