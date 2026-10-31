# Thẻ Cổng Đáng — 19 hàng đợt dau-chu-dong-vao

**Chờ quyết** — mở 31/10. Một lần ngồi, 19 quyết định: mỗi hàng có đáng dựng không. Cột «Quyết» chép đúng chữ người gõ
— máy không tự điền. Mỗi hàng nhận một trong bốn chữ: `build` (dựng) · `iterate` (làm lại ý trước khi dựng) · `park`
(gác, chưa làm) · `kill` (bỏ).

Hàng T3 (18, 24, 62, 10) vẫn cần chữ ký riêng ở Cổng Phạm vi và Cổng Bằng chứng về sau; hàng T2 cần chữ ký ở hai
cổng ấy như mọi hàng. Giờ máy là dự báo của kit (`du-bao.json` từng ô). Chưa có ngày đích: hai tuần thử chưa có ngày.

Hàng 20 và 21 (nhập Excel) không có trong thẻ: chúng chờ phiên thiết kế kiến trúc nhập dữ liệu chủ kho mở 31/10
(lý do ở `README.md`).

Hàng không `build` thì không vào đợt, và hàng đứng sau nó cũng không chạy được (cột «Đứng trên»). Gói không cần sửa sau
khi quyết: bộ phát lịch chỉ giao hàng có ô `build`.

## Khuyến nghị: dựng cả 19

Căn cứ đã kiểm 31/10:

- **Mọi hàng các hàng này đứng trên mà nằm ngoài đợt đều đã ký** trên `main` — 1, 5, 9, 11, 12, 13, 53, 58, 59 đều
  `signed-off`. Không hàng nào phải chờ việc ngoài đợt.
- **Các hàng 14–30 của thẻ đều nằm trong «Bản đầu — Có»** của Tham chiếu §11, và chín hàng là màn P0 của §10 (14, 15,
  17, 18, 22, 24, 27, 28, 29) — P0 là phần «đủ để chạy hai tuần thử». Gác một hàng là gác cả chuỗi sau nó: gác 22 thì 26, 28, 29, 30
  không chạy; gác 24 thì cả nhóm Dòng vào dừng.
- **61, 62, 63 là chữ của chính chủ kho** ở các cổng đợt nen-2 («mở hợp đồng mới», «tách sang hàng sau, xong trước dữ
  liệu thật»); lượt cắt chỉ đưa chúng thành hàng.
- **Tải chia đều năm dãy**: H, L, G mỗi dãy một hàng T3, B mở đầu đường găng; đợt dài bằng đường găng năm hàng
  (14 → 15 → 22 → 26 → 30). Lý do số dãy ở `README.md`.

| # | Người dùng được gì | Đứng trên | Dãy | Hạng · giờ máy | Khuyến nghị — căn cứ | Quyết |
|---|---|---|---|---|---|---|
| 14 | Đầu chủ mở Bảng hàng trên máy tính và thấy hàng của sàn dày như Sheet: lọc mọi cột, nhóm theo toà rồi loại căn, lưu góc nhìn | 1, 53, 5, 13, 58, 59 | B | T2 · 1,29–5,09 h | `build` — P0 (Bảng kiểu Sheet, §10); mở khoá 15, 17 → đường găng; lưới đã chọn ở ADR-0004 | ___ |
| 15 | Đầu chủ sửa giá, phí, trạng thái ngay trên ô; giá luôn kèm điều kiện phí, máy nói lại «Hiểu là…», sửa là vừa xác nhận với chủ nhà, hoàn tác được | 14 | B | T2 · 1,29–5,09 h | `build` — P0 (2b, §10); giữ tươi §11; 16, 20, 22 đứng trên nó | ___ |
| 16 | Đầu chủ chọn nhiều căn rồi đổi trạng thái, đổi đầu chủ hay đánh dấu đã gọi cho tất cả trong một lần | 15 | B | T2 · 1,29–5,09 h | `build` — Bản đầu §11 «Giữ tươi: sửa hàng loạt»; không hàng nào chờ nó — xếp sau 15 trong dãy B | ___ |
| 17 | Đầu chủ chọn một căn và thấy cột hồ sơ cạnh bảng: thuộc tính tự điền, lần rao, lịch sử giá và trạng thái ai sửa khi nào; thấy thuộc tính sai thì bấm… | 14 | H | T2 · 1,29–5,09 h | `build` — P0 (cột hồ sơ, §10); mở khoá 18, 22 | ___ |
| 18 | Đầu chủ kéo hoặc dán ảnh từ Zalo trên máy tính vào hồ sơ căn và xếp vào ba ngăn; ngăn nội bộ không bao giờ ra ngoài, không lưu trên máy | 11, 17 | H | T3 · 3,84–12,47 h | `build` — P0 (M5 ảnh, §10); 19, 23 đứng trên; T3 — chạm ngăn nội bộ (luật 20) | ___ |
| 19 | Đầu chủ che một vùng trên ảnh trước khi gửi; ra ngoài là bản nhẹ, bản gốc giữ lại | 18 | B | T2 · 1,29–5,09 h | `build` — Bản đầu §11; luật 29 che vùng trước khi ảnh ra ngoài — cần trước luồng Gửi (34) của đợt kế | ___ |
| 22 | Đầu chủ mở app vào Hôm nay và thấy các hàng đợi của mình — lead mới, cần gọi lại, nên gọi ép giá, thiếu thông tin, mới đổi — mỗi căn ở đúng một hàng… | 15, 17 | G | T2 · 1,29–5,09 h | `build` — P0 (Hôm nay, §10); trên đường găng, 26 và 28 chờ nó | ___ |
| 23 | Đầu chủ bấm «Sẵn sàng bán» và căn lên bảng hàng chung ngay khi máy kiểm đủ giá về tay, ảnh thật, pháp lý, tình trạng sử dụng; thiếu thì chỉ đúng chỗ… | 12, 18 | H | T2 · 1,29–5,09 h | `build` — Bản đầu §11 «Sẵn sàng bán một chạm»; bảng hàng thẻ của đầu khách (32) đứng trên nó | ___ |
| 24 | Telesales nhập lead đủ năm mục trên máy tính và thấy ngay kết quả kiểm trùng: không trùng, đã có đầu chủ, hay căn đã có hàng mở | 5, 9, 11, 53 | L | T3 · 3,84–12,47 h | `build` — P0 (L1–L3, §10); mở chuỗi lead 25 → 26/27/28; T3 — kiểm trùng | ___ |
| 25 | Lead không trùng được chia theo luật của sàn trong một phút; quá 15 phút chưa nhận hay 30 phút chưa gọi thì trưởng nhóm được báo | 24 | L | T2 · 1,29–5,09 h | `build` — Bản đầu §11 «chia lead theo toà kèm thông báo»; 26, 27 đứng trên | ___ |
| 26 | Đầu chủ nhận thông báo lead trên điện thoại và máy tính, chạm vào thì mở đúng mục ở Hôm nay | 22, 25 | L | T2 · 1,29–5,09 h | `build` — Bản đầu §11; 30 và đợt kế (38 tab Tôi) đứng trên; cần chủ kho thử trên điện thoại (luật 16) | ___ |
| 27 | Telesales theo dõi lead đã nhập qua bốn nấc Đã gửi → Đã nhận → Đã gọi → Lên bảng, thấy lead bị trả lại kèm «Sửa số và gửi lại»; không thấy hàng | 25 | L | T2 · 1,29–5,09 h | `build` — P0 (L1 cột phải, L5, §10) | ___ |
| 28 | Đầu chủ mở chế độ cuộc gọi của một lead trên máy tính: thẻ lead so giá với toà, danh sách hỏi chọn bằng phím, tính giá bao phí ↔ về tay; ghi xong thì… | 22, 24 | G | T2 · 1,29–5,09 h | `build` — P0 (KD1, §10); 29, 30 đứng trên | ___ |
| 29 | Đầu chủ gọi ép giá đợt hai trên máy tính: thấy lịch sử trả giá và giá đáy nội bộ, ghi kết quả bằng phím, hạ giá theo đúng luật sửa giá | 28 | G | T2 · 1,29–5,09 h | `build` — P0 (KD2, §10); số đo «căn gọi ép giá đợt hai» của §11 | ___ |
| 30 | Đầu chủ bấm Gọi trên máy tính thì chế độ cuộc gọi mở và điện thoại của mình quay số chủ nhà | 26, 28 | L | T2 · 1,29–5,09 h | `build` — Mức tối thiểu đã chốt 29/10 (tổng đài để sau); cần chủ kho thử quay số trên máy thật | ___ |
| 61 | Đầu chủ sửa căn lúc máy chủ trục trặc ngắn hay hết phiên thì thay đổi tự gửi lại khi máy chủ trả lời được, chỉ báo đồng bộ nói đúng vì sao chưa gửi,… | 13 | H | T2 · 1,29–5,09 h | `build` — Chủ kho chọn «mở hợp đồng mới» ở Cổng Bằng chứng hàng 13 và đặt điều kiện xong trước hai tuần thử | ___ |
| 62 | Số điện thoại chủ nhà nằm trong cơ sở dữ liệu ở dạng mã hoá; chỉ cửa «Mở số» giải ra số cho người được thấy, đọc thẳng bảng hay bản sao lưu không ra… | 11 | G | T3 · 3,84–12,47 h | `build` — Chủ kho đặt điều kiện «xong trước dữ liệu thật» ở Cổng Phạm vi hàng 11; T3 — chạm lớp source | ___ |
| 63 | Đầu chủ gõ mã căn trùng ở hai toà cùng dự án thì thấy cả hai căn kèm tên toà để chọn, không bị điền lặng lẽ thuộc tính của căn toà khác | 9 | D | T2 · 1,29–5,09 h | `build` — Chủ kho chọn «mở hợp đồng mới» ở Cổng Bằng chứng hàng 9; rẻ (6 tiêu chí), gỡ bẫy trước mọi đường danh mục thật | ___ |
| 10 | Gói danh mục Invest đẩy sang theo khuôn phiên bản 1 được nhận vào vùng danh mục dùng chung khi thoả thuận đang bật; gói sai khuôn hay thoả thuận tắt… | 9 | D | T3 · 7–10 h | `build` (mở lại) — xem mục riêng dưới bảng | ___ |

Thứ tự trong bảng là thứ tự số hàng; thứ tự ưu tiên khi các dãy tranh lượt chấm ở `README.md` (đường găng trước).

## Hàng 10 — có nên mở lại không

Hàng 10 (nhận danh mục Invest) đã quyết `park` ngày 30/10. **Khuyến nghị: mở lại, `build`, ở dãy D sau hàng 63**, với
phạm vi chốt ở Cổng Phạm vi là phần danh mục (dự án → toà → căn) của khuôn phiên bản 1.

Điều đổi từ lúc gác:

- **Hai tuần thử giờ đứng sau hàng 10.** Sổ quyết định của Tham chiếu (§12, dòng 31/10 khi ký hàng 9) ghi: bản thật dùng
  danh mục mẫu tới khi nạp danh mục thật ở hàng 10, nên hai tuần thử đứng sau hàng 10. Lộ trình không có hàng nào khác
  ghi việc nạp danh mục thật (hàng 20 nhập bảng hàng của sàn, và đang chờ thiết kế nhập).
- **Khuôn nhận đã có sẵn phần danh mục.** Khuôn phiên bản 0 ở `packages/connect` đã có dự án → toà → căn, tên trường RESO,
  mọi tầng chặn khoá lạ. Ghi chú của khuôn đặt điều kiện lên phiên bản 1 là «có số thị trường và tin rao đã khớp căn» —
  gắn với hai phần ấy, không gắn với phần danh mục.
- **Mở thêm không làm chậm đợt.** Không hàng nào của đợt chờ hàng 10; nó chạy ở dãy D riêng, ngoài đường găng.

Cái giá: một hàng T3 nữa — hai lần ký (Phạm vi, Bằng chứng) và 7–10 giờ máy; nếu phía Invest chọn khuôn khác thì phải
sửa khuôn nhận (khuôn có số phiên bản nên sửa được, không phá dữ liệu đã nhận). Phần không nằm trong kho: phía Invest
đẩy gói thật theo khuôn — hàng 10 xong mà Invest chưa đẩy thì hai tuần thử vẫn chờ, nhưng chờ ở phía Invest chứ không
chờ đợt sau của kho này.

Vẫn gác thì: dãy D làm xong 63 là hết việc; hai tuần thử chờ ít nhất tới đợt sau dựng hàng 10.

## Trả lời

Một dòng, chép rồi thay `___`:

```text
14 ___ · 15 ___ · 16 ___ · 17 ___ · 18 ___ · 19 ___ · 22 ___ · 23 ___ · 24 ___ · 25 ___ · 26 ___ · 27 ___ · 28 ___ · 29 ___ · 30 ___ · 61 ___ · 62 ___ · 63 ___ · 10 ___
```

Mọi hàng cùng một chữ thì viết gọn được: `tất cả ___`, kèm hàng khác chữ nếu có (ví dụ `tất cả ___ · 10 ___`).

Máy chép đúng chữ người gõ vào ô cơ hội của từng hàng (`decision`, `decided_by`, `decided_at`, `stage: decided`), như đã
làm với hai đợt trước; chữ mới của hàng 10 thay quyết định `park` cũ; lời cũ còn trong lịch sử git của ô.
