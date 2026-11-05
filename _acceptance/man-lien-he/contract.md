---
schema_version: 1
feature: "Đầu chủ và trưởng nhóm mở màn Liên hệ, tìm một người bằng tên hay số, thấy đủ cơ hội và căn của người ấy, mở số và gọi trong tối đa ba chạm"
slug: man-lien-he
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [ui, api, db]
status: implemented
design_doc: docs/superpowers/specs/2026-11-05-man-lien-he-design.md
approved_by: Manh Phan
approved_at: 2026-11-05
---

# Acceptance Contract: man-lien-he

## Context

Hàng 103 của lộ trình (dãy L, đợt `dau-khach-nhap`), Cổng Đáng: build (Manh Phan 05/11), sau hàng 85 (dữ liệu liên hệ).
Mô hình ba lớp Lead · Liên hệ · Cơ hội theo ADR-0021 sửa đổi 05/11 (chủ kho «Áp ba lớp»). Vỏ danh sách – chi tiết theo lối C
khi hàng 105 gộp (luật đợt 62); 103 không sửa `components/bo-cuc/**`. Đọc mới ở `packages/api/src/contacts/read/**`, không sửa
tệp contacts có sẵn (luật 58, hàng 89). Migration `036` (giám sát cấp, L-28) → T3.

Source input: `_acceptance/man-lien-he/opportunity.md` · `bao-cao-kham-pha.md` · `lead-va-lien-he.md` · thiết kế
`docs/superpowers/specs/2026-11-05-man-lien-he-design.md`.

Từ ngữ: «liên hệ» = một người (RESO `Contacts`); «dấu Lead» = liên hệ chưa nói chuyện hai chiều; «cơ hội phía chủ» = bản ghi
lead; «cơ hội phía khách» = nhu cầu khách; «pha» = bảng pha ở lõi (thiết kế §Mô hình); «người đọc được» = người giữ còn vai
Đầu chủ, hoặc trưởng nhóm của sàn.

## Criteria

- **AC-1** (cross-layer) — Given người có vai Đầu chủ hay Trưởng nhóm, When mở Liên hệ, Then thấy danh sách liên hệ mình đọc được
  (đầu chủ: người mình giữ; trưởng nhóm: mọi liên hệ của sàn), mỗi dòng có tên, loại, dấu Lead / Liên hệ, người giữ, số cơ hội
  mở (cơ hội có pha khác «Đã đóng», đếm đúng phần người xem thấy ở hồ sơ — đầu chủ không đếm cơ hội phía khách), số căn; thân API không có số điện thoại, giá đáy hay ảnh sổ; người chỉ có vai Telesales, Đầu khách hay Quản trị sàn không
  thấy nhà Liên hệ và `GET /api/v1/contacts` trả 403.
- **AC-2** (cross-layer) — Given danh sách, When lọc theo loại (Chủ bán · Chủ cho thuê · Người mua · Người thuê), theo dấu, hay gõ
  một phần tên (không dấu cũng khớp), Then chỉ còn đúng các liên hệ khớp; hơn 50 liên hệ thì tải tiếp theo trang, không trùng
  không sót.
- **AC-3** (cross-layer) — Given người xem gõ một số điện thoại, When tìm, Then số của liên hệ mình đọc được ra đúng liên hệ ấy;
  số của liên hệ mình không đọc được trả «Đã có trong sàn — [Tên người giữ] đang giữ», không tên chủ, không số, không mã liên hệ;
  số không có trả «Không tìm thấy»; số thuộc sàn khác trả như số không có; số không nằm trên URL.
- **AC-4** (cross-layer) — Given một liên hệ, When mở hồ sơ, Then thấy tên, loại, dấu, người giữ và các số đã che (nhãn, số chính,
  ba số cuối); thân API không có số rõ.
- **AC-5** (cross-layer) — Given hồ sơ, When người đọc được chạm «Hiện số» trên một số, Then số rõ hiện cùng nút «Gọi» (`tel:`),
  một sự kiện mở số được ghi (người, lúc, liên hệ, số) và phản hồi mang `Cache-Control: no-store`; người không đọc được, hay số
  không thuộc liên hệ, nhận 404 một thân như nhau và không sự kiện nào được ghi; trên máy tính, từ nhà Liên hệ tới cuộc gọi tối đa ba chạm (dòng → Hiện số → Gọi; gõ tìm
  không tính chạm — điểm đếm theo Hỏi-7).
- **AC-6** (cross-layer) — Given một chủ có lead và hàng, When mở hồ sơ, Then khối «Cơ hội» liệt mỗi lead của họ là một cơ hội
  phía chủ (Bán · Cho thuê, căn, pha theo bảng pha) và khối «Căn» liệt mọi hàng gắn chủ ấy; chủ có từ hai căn hiện đúng một hồ sơ
  liệt đủ các căn; lead đã Lên bảng mang pha đọc từ trạng thái hàng và trỏ tới hồ sơ căn.
- **AC-7** (cross-layer) — Given một liên hệ có nhu cầu khách, When trưởng nhóm mở hồ sơ, Then khối «Cơ hội» có thêm cơ hội phía
  khách (Mua · Thuê, đầu khách giữ, pha, số Lần gửi); đầu chủ mở cùng hồ sơ thì không thấy phần phía khách.
- **AC-8** (cross-layer) — Given hồ sơ, When xem «Dòng thời gian», Then thấy tối đa 50 sự kiện mới trước, gộp từ lead (nhập,
  nhận, gọi, trả lại), hàng (tạo, đổi trạng thái, đổi giá rao), mở số, và — với trưởng nhóm — nhu cầu khách; không sự kiện nào
  mang số hay giá đáy.
- **AC-9** (cross-layer) — Given sàn A và sàn B, When người sàn A tìm số hay mở số của liên hệ sàn B qua hàm mới, Then không nhận
  được gì (cùng thân như không có) và không sự kiện nào được ghi; bảng sự kiện mở số bật luật cách ly theo dòng; bộ kiểm cách ly
  có ca hai chiều cho hai hàm và bảng mới, kèm đối chứng dương trong sàn mình.
- **AC-10** — Given màn mới, When kiểm kho, Then màn dựng trong `<BoCuc kieu="danh-sach-chi-tiet">` không sửa
  `components/bo-cuc/**`, hồ sơ dựng khuôn nhóm mới `design/patterns/lien-he.md`, có đủ trạng thái tải · trống · không khớp ·
  người khác giữ · lỗi (qua `TrangThai`), `npm run lint` xanh, điện thoại 375 không cuộn ngang, Tham chiếu ghi «Màn Liên hệ —
  Đã dựng (hàng 103)».

## Coverage

Quét `morphological-scan` preset entity-feature trên «Liên hệ» (báo cáo khám phá §4): trục **vòng đời** (tạo · trùng · gộp ·
sửa · tổ chức · lưu trữ / xoá · xuất) × **vai × phạm vi** (telesales · đầu chủ · đầu khách · trưởng nhóm · quản trị) × **nối
sang** (căn · lead · nhu cầu khách · Lần gửi · mở số · lịch xem) × **thời gian** (dòng thời gian · việc kế · nguội · lịch sử).
Thước CE: RESO `Contacts`, `ContactListings`; Follow Up Boss, BoldTrail, Lofty, KW Command (nguồn ở báo cáo). Core → AC-1…AC-10;
Later / Never → Out of scope. Mỗi vai một dòng ở AC-1; mỗi nối sang một AC (AC-6 căn + lead, AC-7 nhu cầu khách + Lần gửi, AC-5
mở số, AC-8 dòng thời gian; lịch xem chưa dựng); cross-cutting quyền dữ liệu ở AC-3, AC-5, AC-9.

## Đường đo

- «Tìm ra một chủ bằng tên hay số và gọi được trong tối đa ba chạm» — đo trong phiên nghiệm thu bằng quan sát; vật bảo đảm: AC-3
  (tìm theo số), AC-5 (ba chạm, sự kiện mở số ghi người và lúc — đếm lần mở số từ hồ sơ trong hai tuần thử).
- «Chủ có từ hai căn hiện đúng một hồ sơ đủ cơ hội» — đếm `listing_owners` theo `contact_id` có từ hai hàng, so với số hồ sơ liệt
  đủ căn; vật bảo đảm: AC-6.
- «Vai không được đọc vẫn thấy số chủ» (ngưỡng chết) — vật bảo đảm: AC-1, AC-4, AC-5, AC-9; bộ kiểm rò rỉ và cách ly.

## Out of scope

- Sửa tên, thêm số, đổi số chính; gộp tay và tách liên hệ (đường ghi contacts đang do hàng 89 sửa — hàng sau).
- Thêm liên hệ tay, nhập danh bạ, xuất danh sách liên hệ (xuất số chủ không bao giờ làm — bất biến 2).
- Danh sách lưu, nhãn, việc kế, liên hệ nguội, quan hệ giữa liên hệ (hàng sau theo báo cáo khám phá §6).
- Đường vào từ hồ sơ căn, Lead đã nhập, Đã gửi sang hồ sơ người (luật 62 — đề xuất thành hàng sau).
- Đổi chữ «lead» trên các màn khác sang «Cơ hội» (hàng 106).
- Màn Liên hệ cho telesales, đầu khách, quản trị sàn; «Khách của tôi» cho đầu khách (hàng sau).
- Căn cứ giữ số và yêu cầu xoá theo Luật Bảo vệ dữ liệu cá nhân 2025 (hàng «Quyền chủ thể dữ liệu»).

## Notes

- Bất biến chạm: 1 (hàm `security definer` mới — lọc sàn trong hàm, ca cách ly), 2 (số chỉ trả cho người đọc được, không ra
  ngoài công ty, ghi sự kiện), 4 không chạm (không trang khách).
- Lối C: vỏ dùng bố cục đang có; khi hàng 105 gộp, cột hồ sơ tự thành cột kéo chia — không sửa 103.
