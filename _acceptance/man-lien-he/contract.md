---
schema_version: 1
feature: "Đầu chủ và trưởng nhóm mở màn Liên hệ, tìm một người bằng tên hay số, thấy đủ cơ hội và căn của người ấy, mở số và gọi trong tối đa ba chạm"
slug: man-lien-he
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [ui, api, db]
status: signed-off
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
- **AC-11** (thêm sau Cổng Phạm vi, luật đợt 68 — chủ kho duyệt khi ký) — Given nhà Liên hệ trên máy tính, When mở, Then
  cột thứ hai mặc định mở với sáu mục Tất cả liên hệ · Chủ bán · Chủ cho thuê · Người mua · Người thuê · Lead, mục đang chọn
  khớp bộ lọc trên URL (`?type=`, `?status=`) và bảng lọc theo đó; mọi nhà của vỏ có cột thứ hai với ít nhất một mục, và
  thêm một nhà mà quên khai cột là lỗi biên dịch, không lặng lẽ rơi về mục của nhà khác.

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
- Known limits (máy ghi theo giám sát, L-0511-4): bước chấm khuôn của kit 2.37.0 báo «lệch: apps/web/src/app/(app)/contacts/page.tsx · khuôn Placeholder · nhóm trang-tam» — báo oan kit#485, luật 33; E10d đạt có giới hạn mã 1, E10e giữ mọi lệch khác đỏ. Bỏ khi kit vá.
- Known limits — chọn ở Cổng Bằng chứng 2026-11-05:
  - Ngoài-1: Khi mở hồ sơ một người cạnh bảng, dòng của người đó không còn được tô nên khó biết đang xem ai trong danh sách dài.
  - Ngoài-3: Nếu người dùng gập cột bên trái trên máy tính, họ không còn chỗ chọn loại liên hệ; trên điện thoại thì không lọc được riêng nhóm Lead.
  - Ngoài-4: Khi lọc Lead mà sàn không còn lead nào, màn nói «Chưa có liên hệ nào», dễ khiến người dùng tưởng sàn trống trong khi chỉ là bộ lọc không khớp.
  - Ngoài-5: Khi mạng chập chờn lúc bấm «Xem thêm», nút không có phản ứng và không báo lỗi, người dùng không biết vì sao.
  - Ngoài-6: Hiện người dùng không gặp lỗi gì.
  - Ngoài-7: Thẻ trình ký đang nói «máy đã xong» nhưng ảnh và kết quả kiểm là của bản màn Liên hệ trước lần sửa cuối.
  - Ngoài-8: Các ảnh trong trang bằng chứng chụp từ bản màn trước khi hồ sơ người được dời sang bố cục mới.
  - Ngoài-9: Khi mạng chập chờn lúc bấm «Thêm» để xem thêm liên hệ, người dùng không thấy gì xảy ra và cũng không có nút thử lại.
  - Ngoài-10: Khi một số điện thoại không mở được vì lỗi dữ liệu, người dùng thấy báo «chưa mở được» nhưng sổ ghi mở số và dòng thời gian của hồ sơ vẫn hiện như đã mở số.
  - Ngoài-11: Mỗi lần bấm «Hiện số» mà số hỏng vẫn để lại một dòng «đã mở số» trong nhật ký, dù người dùng không hề thấy số; bấm thử lại thì thêm dòng giả.
  - Ngoài-12: Nếu khoá mã hoá bị cấu hình sai, màn Liên hệ chỉ lặng lẽ hiện số bị che hoặc báo không mở được, không ai phía vận hành biết có sự cố.
  - Ngoài-13: Người dùng cuối không bị ảnh hưởng; chỉ là bài kiểm khuôn giao diện có thể bỏ sót nếu sau này ai đó xoá ngoại lệ của trang Liên hệ.
  - Ngoài-15: Nếu ai đó tự sửa đường dẫn tải tiếp của danh sách, hệ thống báo lỗi chung thay vì báo yêu cầu sai.
  - Ngoài-16: Với người có lead đã gọi, bị trả lại rồi gửi lại, bảng có thể ghi «Liên hệ» còn hồ sơ lại ghi «Lead».
  - Ngoài-17: Chỉ lớp dịch vụ đang chặn các vai không được dùng; nếu có đường gọi thẳng vào cơ sở dữ liệu thì vai khác trong cùng sàn có thể dò ra ai đang giữ một số điện thoại.
  - Ngoài-18: Bấm lại đúng dòng đang chọn, hoặc sửa số của người đang mở, làm hồ sơ quay mãi ở trạng thái đang tải và các số đã hiện bị che lại.
  - Ngoài-19: Gõ số chưa đủ hoặc sai khuôn thì màn báo «Chưa tải được — thử lại» như bị lỗi mạng, bấm thử lại bao nhiêu lần cũng vậy.
  - Ngoài-20: Tìm một số ra đúng người thì hồ sơ mở bên cạnh nhưng bảng bên trái lại ghi «Không tìm thấy».
  - Ngoài-21: Với người có lead cũ đã gọi rồi gửi lại, bộ lọc «Liên hệ» xếp họ vào Liên hệ nhưng hồ sơ lại ghi «Lead».
  - Ngoài-23: Phép kiểm dòng thời gian không lộ giá đáy chưa chứng minh được là nó bắt được lỗi, vì chưa có ca nào thật sự đưa giá đáy vào.
  - Ngoài-24: Chưa có ca thử hồ sơ dài hơn 50 sự kiện, nên nếu giới hạn 50 bị bỏ thì bộ kiểm vẫn xanh.
  - Ngoài-25: Bộ kiểm chưa đảm bảo các sự kiện trong dòng thời gian gán đúng mốc và đúng thứ tự, nên một sự kiện gán sai giờ vẫn có thể lọt.
  - Ngoài-26: Bộ kiểm chưa chắc từng cơ hội mang đúng giai đoạn của nó, nên giai đoạn bị gán lệch giữa các cơ hội vẫn có thể lọt.
  - Ngoài-27: Bộ kiểm chỉ thử người có một số, nên lỗi về nhãn hay thứ tự số chính và số phụ, hoặc lộ số phụ, có thể không bị bắt.
  - Ngoài-28: Bộ kiểm chưa có người chỉ là khách, nên chưa thử được việc đầu chủ không thấy họ còn trưởng nhóm thì thấy.
  - Ngoài-29: Phép thử chia trang chỉ dùng người không có số hay lead, nên chưa thử được ca một người hiện hai lần qua các trang khi có nhiều số.
