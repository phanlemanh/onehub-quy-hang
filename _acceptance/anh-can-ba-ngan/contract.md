---
schema_version: 1
feature: Đầu chủ kéo hoặc dán ảnh từ Zalo trên máy tính vào hồ sơ căn và xếp vào ba ngăn; ngăn nội bộ không bao giờ ra ngoài, không lưu trên máy
slug: anh-can-ba-ngan
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [ui, api, db]
status: implemented
design_doc: docs/superpowers/specs/2026-11-01-anh-can-ba-ngan-design.md
approved_by: Manh Phan
approved_at: 2026-11-01
---

# Acceptance Contract: anh-can-ba-ngan

## Context

Hàng 18 của lộ trình (dãy H, đợt `dau-chu-dong-vao`), mã phạm vi D6, màn P0 M5. Đứng trên hàng 11 (đầu chủ giữ căn,
lớp nguồn) và hàng 17 (cột hồ sơ căn). T3: migration `012_anh_can.sql` (giữ chỗ lúc mở đợt) và ADR-0014. Ngăn nội bộ
mang lớp `source` (trần `never_leaves_company`, bất biến 2) và không ra trang khách (bất biến 4) — chặn ở lõi và luật
theo dòng, không ở giao diện (luật đợt 20). Nơi giữ byte là câu hỏi cho chủ kho (Hỏi-1); hợp đồng viết theo khuyến
nghị: Supabase Storage riêng tư sau giao diện `KhoAnh`, khoá S3 chỉ trong một mô-đun máy chủ; máy dev, CI và lượt chấm
chạy bản Postgres của `KhoAnh`.

## Criteria

- AC-1: Given đầu chủ giữ căn A mở hồ sơ A (cột phải của Bảng hàng hay `/units/<mã>`), When kéo thả một hay nhiều tệp
  JPEG/PNG/WebP vào mục Ảnh, hoặc nhấn ⌘/Ctrl+V khi con trỏ không ở ô nhập chữ và bộ nhớ tạm có ảnh, Then mỗi ảnh hiện
  một ô chờ có tên tệp, tải lên, rồi thành bản nhẹ trong ngăn của thẻ đang mở (thả lên tên thẻ «Nội bộ» thì vào ngăn
  nội bộ); máy chủ giữ bản gốc nguyên byte và một bản nhẹ cạnh dài ≤ 480 px; tải lại trang thì ảnh vẫn đó, đúng ngăn,
  đúng thứ tự thả.
- AC-2: Given đầu chủ thêm ảnh, When một tệp không phải JPEG/PNG/WebP (xét byte đầu tệp, không xét đuôi tên), quá
  10 MB, hoặc máy đang mất mạng, Then tệp ấy không được ghi, ô của nó báo đúng lý do («Không phải ảnh», «Ảnh quá 10 MB»,
  «Cần mạng để thêm ảnh») và các ảnh khác cùng lượt vẫn vào; API nhận tệp sai loại hay quá cỡ gửi thẳng (bỏ qua giao
  diện) cũng từ chối 400 và không ghi dòng nào; ảnh lỗi hay ảnh thả khi mất mạng không được giữ lại trên máy để gửi sau (Hỏi-5).
- AC-3: Given ngăn Gửi được của căn A có ảnh, When đầu chủ kéo đổi thứ tự, chọn «Đặt làm ảnh bìa», hay bật/tắt «Ảnh
  mẫu», Then thứ tự, ảnh bìa (đúng một ảnh, ảnh đầu tiên khi chưa ai chọn) và nhãn được lưu và còn sau khi tải lại;
  mỗi ảnh mang nhãn «Ảnh mẫu» hoặc «Ảnh thật · <ngày>» — ngày chụp đọc từ EXIF của tệp khi có, vắng thì ngày thêm (Hỏi-3).
- AC-4: Given căn A có ảnh, When đầu chủ chuyển một ảnh Gửi được ↔ Nội bộ, hay «Xoá khỏi căn» rồi xác nhận, Then ảnh
  sang đúng ngăn (chuyển vào Nội bộ thì mất bìa và nhãn «Ảnh mẫu») hay rời mọi ngăn — xoá thì byte bản gốc và bản nhẹ
  bị xoá hẳn khỏi cơ sở dữ liệu, dòng ảnh giữ dấu đã xoá (ai, lúc) (Hỏi-6); mỗi lệnh thêm, đổi ngăn, đổi thứ
  tự, đặt bìa, đặt ảnh mẫu, xoá ghi đúng một sự kiện chỉ thêm (loại, ảnh, người, lúc) — sự kiện không sửa, không xoá
  được kể cả bằng vai chủ bảng.
- AC-5: Given căn A có ảnh ở cả hai ngăn, When người xem là đầu chủ giữ lần rao mới nhất của A hay trưởng nhóm (bất kỳ trưởng nhóm nào của sàn, như luật nguồn
  hàng 11), Then thấy và sửa cả hai
  ngăn; When là thành viên khác cùng sàn (đầu chủ khác, đầu khách, telesales, quản trị sàn), Then thấy ngăn Gửi được
  (chỉ xem — không vùng thả, không menu sửa; Hỏi-4), thẻ «Nội bộ» khoá với chữ «Chỉ người giữ căn và trưởng nhóm xem»,
  không nhận dòng, số đếm hay byte nào của ngăn nội bộ — API trả như ảnh không có, và chính luật theo dòng của cơ sở dữ
  liệu chặn khi truy vấn thẳng bằng vai `quy_hang_app`; đổi người giữ căn thì quyền đi theo người
  mới; căn chưa có lần rao nào thì chỉ trưởng nhóm thấy ngăn nội bộ.
- AC-6: Given người xem được ngăn nội bộ, When mở ảnh nội bộ, Then phản hồi mang `Cache-Control: private, no-store`,
  không qua bộ đồng bộ, không ghi vào IndexedDB hay hàng đợi ghi của máy; không có đường dẫn nào mở được ảnh khi không có
  phiên đăng nhập của sàn — link tới kho ảnh chỉ do API ký sau khi đọc được dòng ảnh dưới luật theo dòng, sống 60 giây,
  đường đối tượng mang mã sàn; khoá của kho ảnh chỉ một mô-đun máy chủ đọc được; danh sách ảnh (cả hai ngăn) cũng không
  vào kho trên máy.
- AC-7: Given một căn có ảnh ở hai ngăn, When một cửa ra (trang khách, gửi ảnh + tin, phát hàng — hàng sau) chọn ảnh qua
  hàm lõi `anhRaNgoai`, Then chỉ ảnh ngăn Gửi được ra, đúng thứ tự, ảnh bìa đầu, ảnh mẫu giữ nhãn; ảnh ngăn nội bộ mang
  lớp `source` và không bao giờ ra, kể cả khi cửa ra truyền cờ hay thoả thuận nào.
- AC-8: Given căn A, When mở thẻ «Tự có từ mã», Then thẻ hiện ảnh danh mục của đúng toà và mã khi danh mục có; danh mục
  hiện chưa mang trường ảnh nên thẻ nói «Danh mục chưa có mặt bằng, ảnh view cho căn này» — không lỗi, không ô trống
  không lời.
- AC-9: Given hai sàn X, Y cùng có căn trùng toà và mã, When người của Y đọc, thêm, sửa ảnh, byte hay sự kiện ảnh của X
  (kể cả biết `id`), Then không thấy và không ghi được gì; bộ kiểm cách ly có ca mới cho ba bảng ảnh và hàm
  `can_see_unit_internal`, bảng ca giống hệt bảng ca của luật lõi `canSeeUnitInternal`.
- AC-10: Given cột hồ sơ trên bản chạy thật với dữ liệu mẫu, When đầu chủ đi luồng chính (thả ba ảnh, đổi thứ tự, đặt
  bìa, thả ảnh sổ lên «Nội bộ») ở khổ máy tính và khổ hẹp, rồi đăng nhập bằng người khác cùng sàn, Then mắt thấy đúng
  từng bước và thẻ nội bộ khoá; khuôn nhóm `ho-so-can` ghi ngoại lệ có tên cho mục Ảnh (không lưu trên máy) và luật
  ngăn nội bộ, lint khuôn xanh.

## Coverage

Quét theo khuôn entity-feature của `morphological-scan`, đối tượng = một ảnh của một căn:

- Trục A — đường vào: kéo thả · dán · nút «Chọn ảnh» · gửi API thẳng.
- Trục B — ngăn: Gửi được · Nội bộ · Tự có từ mã.
- Trục C — thao tác: thêm · đổi thứ tự · đặt bìa · đặt ảnh mẫu · đổi ngăn · xoá · xem bản lớn.
- Trục D — người: đầu chủ giữ căn · trưởng nhóm · thành viên khác cùng sàn · người sàn khác · không phiên.
- Trục E — điều kiện: tệp đúng · sai loại · quá cỡ · mất mạng · nhiều tệp một lượt có tệp hỏng.
- Trục F — cửa ra: giao diện · bộ nhớ máy (IndexedDB, đệm trình duyệt) · cửa ra ngoài sàn.

Core → AC: (A × E) AC-1, AC-2 · (B Gửi được × C) AC-3 · (C đổi ngăn, xoá, sự kiện) AC-4 · (B Nội bộ × D) AC-5 ·
(B Nội bộ × F máy) AC-6 · (B × F ngoài sàn) AC-7 · (B Tự có từ mã) AC-8 · (D sàn khác) AC-9 · mặt người nhìn AC-10.
Later/Never: lần rao chọn ảnh, che vùng, chụp trên điện thoại, ảnh danh mục từ Invest, xem ảnh khi mất mạng — Out of scope.
Thước CE: mỗi ô (B × D) và (B × F) có ít nhất một ca trong evals [CE chưa kiểm chứng bằng đếm ô máy].

## Đường đo

- Tỉ lệ căn ở mức đủ cao nhất (opportunity.md, Tham chiếu §11) — ảnh tính vào mức đủ là hàng 23; vòng này bảo đảm ảnh
  thật có chỗ ở và đếm được: AC-1 (ảnh ghi ở máy chủ, gắn căn) và AC-3 (nhãn ảnh thật / ảnh mẫu). Đếm thật là việc của
  phiên nghiệm thu.

## Out of scope

- Lần rao chọn ảnh hiện; ảnh tính vào mức đủ và «Sẵn sàng bán» — hàng 23, 32.
- Che một vùng trên ảnh, bản nhẹ để gửi ra — hàng 19.
- Gửi ảnh + tin, trang khách có ảnh — hàng 32, 33.
- Chụp ảnh trong app trên điện thoại, nhận ảnh chia sẻ từ Zalo điện thoại — hàng sau của nhóm điện thoại.
- Ảnh mặt bằng, view từ danh mục Invest — đổi khuôn `packages/connect` (hàng 10); vòng này chỉ dựng thẻ và hàm đọc.
- Xem ảnh khi mất mạng; Supabase Storage — theo ADR-0014 khi dung lượng vượt hoặc Hỏi-1 chọn lối khác.

## Notes

- Việc của chủ kho (ngoài phạm vi máy — máy không ghi `.env*`): đặt giá trị `STORAGE_S3_ACCESS_KEY`,
  `STORAGE_S3_SECRET_KEY`, `STORAGE_S3_ENDPOINT` ở Vercel và thêm ba dòng tên vào `.env.example`; tên và chú thích ở
  ADR-0014 mục Vận hành. Bản thật thiếu khoá thì API báo lỗi rõ và không dựng mục ảnh.
