---
schema_version: 1
feature: "Đầu chủ mở bảng hàng có cả căn hộ, nhà phố và đất, lọc và nhóm theo loại hình, và thấy cột, hồ sơ căn đúng trường của từng loại — không cột tầng, trục cho đất"
slug: bang-hang-theo-loai-hinh
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui, api]
status: implemented
design_doc: docs/superpowers/specs/2026-11-08-bang-hang-theo-loai-hinh-design.md
approved_by: Manh Phan
approved_at: 2026-11-08
---

# Acceptance Contract: bang-hang-theo-loai-hinh

## Context

Hàng 79 của lộ trình (dãy X, đợt `dau-khach-nhap`; LH9 của đợt moi-loai-hinh-3110). Đứng trên 14, 17, 72–76 và 105. Lõi đã
có bảng trường theo loại hình (`PROPERTY_SUBTYPE_FIELDS`, ADR-0016 quyết định 2); Bảng hàng và hồ sơ căn còn chỉ biết căn
hộ, hàng lô và hàng ngoài khu (hàng 76) lên bảng với loại căn «Chưa rõ» và không mở được hồ sơ. Bất biến chạm: 1 (đường đọc
căn ngoài khu của sàn dưới luật theo dòng sẵn có) — không bảng, không migration mới; không dữ liệu nào ra ngoài sàn.

Source input: `docs/plan/lo-trinh.json` hàng 79 · `_acceptance/bang-hang-theo-loai-hinh/opportunity.md` · thiết kế
`docs/superpowers/specs/2026-11-08-bang-hang-theo-loai-hinh-design.md`

Bộ dữ liệu đo: bộ mẫu hàng 5 (căn hộ) và bộ mẫu thấp tầng hàng 73 (`packages/db/seed/mau-thap-tang/du-lieu-mau-thap-tang.json`:
năm dãy LK, SH, BT, DN và 14 căn ngoài khu) — đọc, không sửa.

## Criteria

- **AC-1** — Mỗi dòng mang loại hình và đúng trường của loại hình, theo dạng hàng.
  Given danh mục toà của bộ mẫu hàng 5, danh mục dãy và các căn ngoài khu của bộ mẫu thấp tầng,
  When ghép mỗi hàng — căn hộ trong toà, lô của mỗi dãy, căn ngoài khu mỗi loại hình — thành một dòng Bảng hàng,
  Then dòng mang loại hình RESO của căn (căn hộ từ toà, lô từ dãy, ngoài khu từ căn ngoài khu của sàn), mỗi trường trong
  `PROPERTY_SUBTYPE_FIELDS` của loại hình ấy mang giá trị của nguồn (hay «chưa rõ» khi nguồn không có), mọi trường loại hình
  không dùng đánh dấu «không có»; hàng không tìm thấy nguồn là loại hình «Chưa rõ»; và khi đọc mạng lỗi, bản giữ trên máy
  của dãy và căn ngoài khu cho cùng kết quả. Ma trận viết trước: 3 dạng × 4 loại hình (căn hộ chỉ dạng toà) + 2 ca chưa rõ.

- **AC-2** — Bộ cột theo loại hình có trong dòng đã lọc.
  Given mọi tập con khác rỗng của bốn loại hình (15 tập) và tập dòng rỗng,
  When Bảng hàng dựng bộ cột từ dòng đã lọc,
  Then cột hiện = cột chung + hợp các trường của loại hình có mặt; toàn đất không có Tầng, Hướng, Loại căn, Diện tích sàn;
  toàn căn hộ hiện ĐÚNG danh sách cột của nhánh chính trước vòng này (ghim viết trước); cột người tắt ở menu Cột vẫn tắt;
  và cột vị trí theo Hỏi-1 đã chốt ở Cổng Phạm vi (khuyến nghị: một cột, tiêu đề «Toà» khi mọi dòng đã lọc là căn hộ,
  «Vị trí» khi có loại khác; ô của hàng căn hộ là toà, hàng lô «Khu · Dãy», hàng ngoài khu là địa chỉ đã gõ).

- **AC-3** — Ô không dùng khác ô chưa rõ.
  Given bảng trộn căn hộ và đất,
  When đọc chữ ô, chép ô và lọc số trên cột Tầng và cột Diện tích đất,
  Then ô của trường mà loại hình dòng không dùng là chuỗi rỗng (hiện trống, chép ra rỗng, lọc số không khớp); ô của trường
  dùng mà chưa có số là «—».

- **AC-4** — Lọc theo loại hình.
  Given bảng trộn bốn loại hình và một hàng chưa rõ loại hình,
  When lọc cột Loại hình theo từng giá trị,
  Then chỉ dòng của giá trị ấy còn lại; lựa chọn là giá trị RESO, chữ hiện là Căn hộ · Nhà phố · Biệt thự · Đất (đọc qua
  hàm đặt tên của lõi); hàng chưa rõ lọc được dưới «Chưa rõ». (Vế «cách gọi riêng của sàn» thu ra Known limits — chủ kho
  08/11.)

- **AC-5** — Nhóm theo loại hình.
  Given bảng trộn bốn loại hình,
  When chọn nhóm «Loại hình» và «Loại hình → Toà», và mở một góc nhìn đã lưu trước vòng này,
  Then nhóm theo loại hình đếm đúng số căn mỗi nhóm; nhóm mặc định vẫn Toà → Loại căn; ở cấp Loại căn, dòng đất đọc nhãn
  loại hình thay «Chưa rõ»; góc nhìn đã lưu nhận cách nhóm mới, góc nhìn cũ đọc như cũ.

- **AC-6** — Hồ sơ căn theo loại hình.
  Given hàng lô mỗi loại hình và hàng ngoài khu mỗi loại hình trên máy,
  When mở hồ sơ từ dòng Bảng hàng,
  Then hồ sơ mở theo hàng (không tìm theo toà), mục thuộc tính hiện Loại hình và đúng bộ trường của loại hình — đất: Diện
  tích đất, Mặt tiền, Lộ giới, không Tầng, Trục, Toà; căn hộ giữ đúng mục thuộc tính hôm nay.

- **AC-7** — Máy chủ trao loại hình của lô và căn ngoài khu, trong sàn. (cross-layer)
  Given danh mục lô mẫu cấp cho máy chủ, và hai sàn A, B mỗi sàn có căn ngoài khu,
  When đọc `GET /api/v1/catalog` và `GET /api/v1/off-compound-units`,
  Then danh mục mang dãy của mỗi khu với lô và trường thấp tầng, khuôn chép chặt (khoá lạ hay khoá nguồn trong gói vào không
  lọt ra), danh mục lô mặc định cho dãy rỗng; danh sách căn ngoài khu chỉ có căn của sàn đang làm (sàn A không thấy căn của
  B), mỗi căn mã, loại hình, địa chỉ đã gõ, không khoá nguồn; người không làm việc với Bảng hàng không đọc được.

- **AC-8** — Trên màn đang chạy. (cross-layer)
  Given sàn mẫu có căn hộ của bộ hàng 5 và hàng trên căn ngoài khu mỗi loại hình (nhà phố, biệt thự, đất), máy tính
  1440 × 900,
  When đầu chủ mở Bảng hàng, lọc Loại hình = Đất, rồi nhóm theo Loại hình và mở hồ sơ một căn đất,
  Then lúc lọc đất không có cột Tầng, Hướng, Loại căn; có Diện tích đất, Mặt tiền, Lộ giới; nhóm hiện số căn mỗi loại; cột hồ
  sơ hiện Loại hình Đất và không có Tầng.

- **AC-9** — Trang thử nhanh-tuc-thi hết ngoại lệ có hạn.
  Given bản đồ khuôn nhóm Bảng hàng ghi ngoại lệ có hạn của trang thử `/proto/nhanh-tuc-thi` tới hàng 79,
  When hàng này xong,
  Then theo Hỏi-2 đã chốt ở Cổng Phạm vi (khuyến nghị: chuyển — bỏ ngoại lệ, trang ở chỗ cũ chịu luật bố cục như mọi màn),
  bản đồ khuôn không còn ngoại lệ có hạn nào trỏ hàng 79, lint của kho xanh, và bài kiểm bố cục đỏ nếu ngoại lệ ấy quay lại
  sau khi hàng 79 gộp.

- **AC-10** — Tham chiếu ghi điều đang đúng mới. (judgment)
  Given `docs/product/tham-chieu.md`,
  When đọc sau vòng này,
  Then có một dòng mới ở Sổ quyết định ghi: Bảng hàng và hồ sơ căn hiện cột, trường theo loại hình từ bảng của lõi, lọc và
  nhóm theo loại hình, ô không dùng khác ô chưa rõ.

## Coverage

Quét không gian theo năm trục (morphological, preset entity-feature):

- Trục A — loại hình: Condominium | Townhouse | Single Family Residence | Unimproved Land | chưa rõ. [thước CE:
  `PROPERTY_SUBTYPE_FIELDS` 4 dòng + ca vắng nguồn]
- Trục B — dạng hàng: có toà | lô | ngoài khu. [thước CE: ba dạng của khuôn `created`, hàng 76]
- Trục C — tập dòng đã lọc: rỗng | một loại | trộn. [thước CE: 15 tập con khác rỗng + rỗng]
- Trục D — việc trên màn: bộ cột | chữ ô · chép | lọc | nhóm · góc nhìn | hồ sơ. [thước CE: năm việc của câu giao]
- Trục E — nguồn: mạng | bản giữ trên máy | sàn khác. [thước CE: KH-bh-tren-may + bất biến 1]

Core → AC-1..AC-10. Later: bảng thẻ điện thoại theo loại hình; nạp lô mẫu vào cơ sở dữ liệu; chỗ lưu trường thấp tầng của
căn ngoài khu. Never: sự kiện tạo hàng mang loại hình (ADR-0016 quyết định 1).

## Đường đo

- Thước: hàng mỗi dạng × loại hình lên bảng với đúng loại hình và đúng trường · số từ: bộ kiểm web · bảo đảm bởi: AC-1
- Thước: lọc toàn đất không còn cột tầng, hướng, loại căn · số từ: bộ kiểm web và màn đang chạy · bảo đảm bởi: AC-2, AC-8
- Thước: lọc, nhóm theo loại hình đếm đúng · số từ: bộ kiểm web · bảo đảm bởi: AC-4, AC-5
- Thước: hồ sơ đất không có Tầng, Trục · số từ: bộ kiểm web và màn đang chạy · bảo đảm bởi: AC-6, AC-8
- Thước: trang thử hết ngoại lệ có hạn · số từ: lint của kho · bảo đảm bởi: AC-9

## Out of scope

- Bảng thẻ trên điện thoại (`inventory/cards/`) theo loại hình.
- Nạp lô, căn ngoài khu, hàng của bộ mẫu thấp tầng vào cơ sở dữ liệu (đề nghị hàng riêng từ hàng 76); lô đo ở lớp ghép.
- Chỗ lưu diện tích, số tầng, mặt tiền, lộ giới của căn ngoài khu — ô của nó «—».
- Sửa thuộc tính trên ô; mức đủ và trường bắt buộc khi Sẵn sàng bán theo loại hình.
- Luật ẩn theo loại hình trên trang khách (hàng 80).

## Notes

- Known limits — chủ kho chọn ở lượt chấm 1, 08/11 (nguyên văn «Thu, mở hàng sau»): chữ cột Loại hình chưa theo cách gọi riêng
  của sàn — tập đóng của Cách gọi (hàng 45) chưa có loại hình; cột đọc qua hàm đặt tên của lõi nên tự nhận tên riêng khi lõi mở.
  Mở hàng sau «loại hình trong Cách gọi».

- Hỏi-1 (cột vị trí), Hỏi-2 (trang thử), Hỏi-3 (duyệt phần nhìn bằng chữ và hình), Hỏi-4 (để ngoài điện thoại và chỗ lưu
  trường thấp tầng của căn ngoài khu) chờ Cổng Phạm vi; khuyến nghị ở sổ quyết định.
- Sau vòng này người dùng thật thấy: căn hộ như hôm nay cộng cột Loại hình; hàng ngoài khu đúng loại hình, địa chỉ, nhưng
  Diện tích đất, Số tầng, Mặt tiền, Lộ giới là «—» (chưa có chỗ lưu); hàng lô vẫn «Chưa rõ» loại hình tới khi danh mục có
  dãy thật (LH11) — danh mục lô của bản thật đang rỗng theo Hỏi-1 hàng 74.
- Timebox của ô cơ hội để «…» ở Cổng Đáng: ngưỡng chết theo hết timebox chưa đo được — đọc theo hạn xong của giám sát.
