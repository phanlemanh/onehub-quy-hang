---
schema_version: 1
feature: "Quản trị sàn đặt tên riêng cho loại hình ở Cài đặt › Cách gọi, neo vào giá trị RESO; Bảng hàng và hồ sơ căn hiện tên ấy, xoá tên riêng thì về tên mặc định."
slug: loai-hinh-trong-cach-goi
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui, api, config]
status: draft
design_doc: docs/superpowers/specs/2026-11-09-loai-hinh-trong-cach-goi-design.md
---

# Acceptance Contract: loai-hinh-trong-cach-goi

## Context

Known limits của hàng 79 `bang-hang-theo-loai-hinh`: chữ cột Loại hình chưa theo cách gọi riêng vì tập đóng của Cách gọi (hàng 45)
chưa có loại hình. Chủ kho 08/11: «Thu, mở hàng sau». Sàn thêm nhãn, không thêm nghĩa: căn vẫn lưu giá trị RESO.

## Criteria

- **AC-1** — Màn Cách gọi có mục Loại hình.
  Given sàn chưa đặt tên riêng nào,
  When quản trị sàn mở Cài đặt › Sàn › Cách gọi,
  Then có dòng tên trường «Loại hình» và đúng bốn dòng giá trị neo vào Condominium, Townhouse, Single Family Residence, Unimproved Land với tên mặc định Căn hộ, Nhà phố, Biệt thự, Đất; tập giá trị khớp đúng bảng loại hình của lõi.

- **AC-2** — Lưu tên riêng neo vào giá trị RESO. (cross-layer)
  Given quản trị sàn A,
  When lưu tên «Liền kề» cho Townhouse,
  Then đọc lại thấy tên ấy kèm cờ tên riêng, loại hình đã lưu của căn bằng nhau trước và sau lượt lưu tên, sàn B không thấy; neo vào giá trị ngoài bốn giá trị RESO bị từ chối với lý do nêu giá trị đó.

- **AC-3** — Chặn tên trùng và chữ sai. (cross-layer)
  Given màn Cách gọi hoặc lượt lưu thẳng vào máy chủ,
  When tên riêng của một loại hình trùng tên đang hiện hay tên mặc định của loại hình khác, hoặc rỗng, dài hơn 40 ký tự, chứa số điện thoại,
  Then ô báo lỗi, «Lưu» khoá, máy chủ trả 400 nêu lý do; giá trị có dấu cách (Single Family Residence) lưu và đọc lại đúng như giá trị không có dấu cách.

- **AC-4** — Bảng hàng hiện tên riêng.
  Given sàn đặt tên riêng cho Townhouse và Unimproved Land,
  When xem Bảng hàng,
  Then ô cột Loại hình, lựa chọn của ô lọc, nhãn nhóm theo loại hình và cấp Loại căn của đất hiện tên riêng; sắp theo cột này đi theo chữ đang hiện; hàng chưa rõ loại hình vẫn hiện «Chưa rõ»; lọc chọn tên riêng ra đúng các hàng của giá trị RESO đó; đổi tên trường thì tiêu đề cột đổi theo (tên các cách nhóm giữ chữ mặc định, như cách nhóm theo Toà hôm nay).

- **AC-5** — Hồ sơ căn hiện tên riêng.
  Given sàn đặt tên riêng và đặt tên trường,
  When mở hồ sơ căn hộ, hàng lô, căn ngoài khu,
  Then dòng loại hình trong thuộc tính và đầu cột hiện tên riêng, tiêu đề dòng hiện tên trường riêng; hàng chưa rõ loại hình hiện «—».

- **AC-6** — Mọi chỗ mở hồ sơ dùng cùng tên.
  Given sàn đã đặt tên riêng,
  When mở hồ sơ cạnh Bảng hàng, trong bảng thẻ, toàn màn theo mã căn, và ở cột hồ sơ của Hôm nay,
  Then cả bốn chỗ hiện cùng tên riêng.

- **AC-7** — Xoá tên riêng thì về mặc định. (cross-layer)
  Given loại hình đang có tên riêng,
  When quản trị bấm «Trả về mặc định» rồi lưu, hoặc từ vựng đọc hỏng,
  Then Bảng hàng và hồ sơ hiện lại tên mặc định; căn không đổi dữ liệu.

- **AC-8** — Tên riêng loại hình không ra ngoài công ty.
  Given sàn đặt tên riêng cho loại hình và người nhận có khoá ra `propertySubType`,
  When dựng từ vựng cho trang khách hay bản xuất,
  Then từ vựng ra ngoài không chở tên trường hay tên giá trị của loại hình; tên của điều kiện phí vẫn đi như cũ.

- **AC-9** — Trên màn đang chạy.
  Given sàn mẫu có căn hộ, căn ngoài khu nhà phố và đất, máy tính 1440 × 900,
  When quản trị đặt tên riêng cho Nhà phố và Căn hộ ở màn Cách gọi, rồi đầu chủ đăng nhập mở Bảng hàng, hồ sơ một nhà phố cạnh bảng, hồ sơ toàn màn một căn hộ, cột hồ sơ ở Hôm nay, rồi quản trị trả về mặc định,
  Then đầu chủ thấy đúng tên riêng ở từng chỗ, và thấy lại tên mặc định sau khi trả về mặc định.

## Coverage

- Trục A — trạng thái tên: mặc định (AC-1) | tên riêng (AC-2, AC-4, AC-5) | đã trả về mặc định (AC-7) | bị từ chối (AC-2, AC-3). [thước CE: luồng hàng 45 và `chan-trung-ten-gia-tri`]
- Trục B — mặt hiện: màn Cách gọi (AC-1, AC-3) | Bảng hàng: ô, lọc, sắp, nhóm (AC-4) | hồ sơ căn (AC-5, AC-6) | ngoài công ty (AC-8). [thước CE: mọi nơi đọc `nhanLoaiHinh`, `LOAI_HINH`, `tuVungRaNgoai`]
- Trục C — dạng hàng: căn hộ, hàng lô, căn ngoài khu (AC-5, AC-9) | chưa rõ loại hình (AC-4, AC-5). [thước CE: ba dạng của khuôn hàng 76, ca «Chưa rõ» hàng 79]
- Trục D — chỗ mở hồ sơ: cạnh bảng | bảng thẻ | toàn màn | Hôm nay (AC-6, AC-9). [thước CE: bốn lời gọi `CotHoSo` trong mã]

## Đường đo

- Thước: quản trị đổi tên một loại hình ở Cách gọi, cột Loại hình và hồ sơ căn hiện tên mới; xoá tên riêng thì về tên mặc định · số từ: bộ kiểm web và màn đang chạy · bảo đảm bởi: AC-4, AC-5, AC-7, AC-9

## Out of scope

- Một giá trị RESO nhiều tên riêng (Liền kề và Shophouse cùng là nhà phố) — theo Hỏi-1, mở hàng riêng khi có sàn thật cần.
- Tên loại hình trên trang khách và bản xuất: hai mặt này hôm nay không hiện loại hình.
- Tên loại hình trên thẻ điện thoại của Bảng hàng: thẻ chưa có ô loại hình.
- Nhập Excel nhận tên riêng làm giá trị loại hình.
- Thêm giá trị loại hình ngoài RESO, sàn tắt bớt giá trị (ADR-0016, can-ngoai-khu Hỏi-3).

## Notes
