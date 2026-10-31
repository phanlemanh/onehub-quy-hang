# ADR-0011: Nhập dữ liệu — tác tử lập kế hoạch, mã thực thi, nguồn không rời công ty

Ngày: 2026-10-31 · Trạng thái: **đề xuất** (chờ chủ kho; phiên thiết kế, chưa có mã) · Liên quan: Tham chiếu §3 «Ba cửa
vào, một đích», §4, §6, §7, luật 11; Kiến trúc §5 «Nhập Excel», §8; bất biến 2; ADR-0008 (một đường ghi, sự kiện chỉ
thêm), ADR-0009 (Vercel, Supabase Singapore), ADR-0010 (lớp nguồn); hàng 5, 9, 20, 21, 45, 50 của lộ trình. Chi tiết:
[Nhập dữ liệu](../architecture/nhap-du-lieu.md) · đề xuất hàng: [Bản phạm vi nhập dữ liệu](../plan/pham-vi-nhap-du-lieu.md)

## Bối cảnh

Chủ kho muốn nâng nhập dữ liệu thành giai đoạn trọng tâm: đây là chỗ quyết định dữ liệu của sàn gọn, sạch, sửa được các
lỗi thường gặp; đề xuất dùng tác tử AI với một mô hình mạnh. Đã có: luật 11 (ghép cả cột lẫn giá trị, nhớ mẫu, xem trước,
không bỏ mất cột, hoàn tác cả lần nhập, ngày xác nhận theo file); Kiến trúc §5 «đọc file ngay trên trình duyệt»; hai file
mẫu sạch ở `packages/db/seed/mau/` (40 dòng, 13 và 16 cột); bộ đọc mã căn theo dự án (hàng 9); lõi hàng chỉ thêm
(ADR-0008); lớp nguồn có trần `never_leaves_company` (ADR-0010).

Đã kiểm ngày 31/10 (nguồn ở cuối):

- **Anthropic API**: không dùng dữ liệu để huấn luyện; trang chính sách thương mại ghi tự xoá đầu vào, đầu ra «trong vòng
  30 ngày», giữ tới 2 năm nếu bị hệ thống an toàn gắn cờ. Không lưu (ZDR) là thoả thuận xin riêng; Batch API giữ 29 ngày
  và không thuộc ZDR. Vùng suy luận chỉ có `global` hoặc `us` (giá ×1,1); nơi lưu chỉ có `us` — **không có vùng châu Á**.
- **Luật Bảo vệ dữ liệu cá nhân 91/2025/QH15** (hiệu lực 1/1/2026): chuyển dữ liệu cá nhân ra nước ngoài phải lập hồ sơ
  đánh giá tác động và nộp trong 60 ngày (các bản bình luận luật lệch nhau về mốc tính); phạt tới 5% doanh thu năm trước.
- **Vercel Hobby**: hàm chạy tối đa 300 giây; Pro mặc định 300, nâng được 800. Gói Hobby là dùng phi thương mại.
- **Google**: `drive.file` không nhạy cảm, đi cùng Google Picker; `spreadsheets.readonly` nhạy cảm, phải qua xét duyệt
  ứng dụng và mở mọi bảng tính của người dùng.

## Quyết định đề xuất

1. **Tác tử viết kế hoạch, mã thực thi.** Tác tử (Claude, gọi từ máy chủ) chỉ đọc **hồ sơ cột** — tiêu đề, kiểu, số dòng,
   các giá trị khác nhau của những cột được phép — rồi trả **kế hoạch nhập**: ghép cột vào trường chuẩn, từ điển giá trị
   (`KBP` → không bao phí), và chọn phép biến đổi trong một **thực đơn đóng** của lõi (đơn vị giá, cách đọc diện tích,
   cách đọc mã căn của dự án, định dạng ngày). Mã ở `packages/core` áp kế hoạch lên **mọi dòng**, kiểm, rồi mới cho xem
   trước. Tác tử không viết ô nào vào bảng hàng, không gọi lệnh ghi, không thấy dòng nào trọn vẹn.
   - **Tất định trong mã, không thoả thuận**: phân loại cột trước khi gửi, che dữ liệu cá nhân, mọi luật kiểm (giá kèm
     điều kiện phí, mã có trong danh mục, bảng chuyển trạng thái, đổi giá quá 20%), kiểm trùng trong file và với hàng
     đang mở, ghi qua lệnh API thành sự kiện (một đường ghi, ADR-0008), hoàn tác cả lần nhập, sổ chi phí AI.
   - **Người luôn xem trước rồi mới ghi**: mỗi ô mang một trong bốn dấu — giữ nguyên · máy sửa (kèm lý do) · cần người ·
     chặn. Không có đường «nhập thẳng».
   - **Không có tác tử vẫn nhập được**: bộ ghép tất định (từ điển tiêu đề chuẩn + bộ nhớ của sàn) là chế độ nền; tác tử
     chỉ lấp phần bộ nhớ chưa biết. Sàn tắt AI, hết trần chi phí hay nhà cung cấp lỗi thì nhập vẫn chạy, người ghép tay
     phần còn lại.
2. **Nguồn và dữ liệu cá nhân không bao giờ tới nhà cung cấp AI** — đọc bất biến 2 theo nghĩa đen, không dựa vào điều
   khoản xử lý của bên kia.
   - Cột được **phân loại trước khi gửi** bằng mã: từ điển tiêu đề (`SĐT`, `Chủ nhà`, `Giá đáy`…), bộ dò giá trị (số điện
     thoại Việt Nam mọi kiểu viết, email, số giấy tờ 9/12 chữ số, cột trông như họ tên). Cột nguồn, cột tên người (cả tên
     nhân viên ở cột «Đầu chủ») và **mọi cột chữ tự do** (ghi chú) chỉ gửi tiêu đề và hình dạng («10 chữ số, đầu 09»),
     không gửi giá trị. Cột chưa rõ cũng chỉ gửi hình dạng — **mặc định che**.
   - Giá trị chỉ gửi cho cột thuộc lớp `catalog` (mã căn, toà, tầng, diện tích, hướng) và `shareable_listing` (giá chào,
     điều kiện phí, trạng thái, nội thất, pháp lý).
   - **Chặn hai lần**: hồ sơ dựng ở trình duyệt; máy chủ quét lại trước khi gửi (mẫu số điện thoại, email, số giấy tờ) —
     trúng là không gửi, ghi sự cố. Không so với băm số chủ đã lưu: băm số 10 chữ số đảo ngược được, tức là thêm một chỗ
     giữ dữ liệu nguồn. **Bộ kiểm rò nguồn ra AI** là kiểm bắt buộc như
     bộ kiểm cách ly.
   - **Cửa ra AI là một thoả thuận**: loại kết nối mới `ai_processing` (Xử lý bằng AI), chiều đi ra, bên kia
     `anthropic`, chỉ mở `catalog` và `shareable_listing`; quản trị sàn bật / tắt; trần `source` chặn ở lõi và cơ sở dữ
     liệu như mọi thoả thuận.
   - **Cần người pháp lý rà** (trước sàn đầu tiên ngoài đội, cùng đợt rà Kiến trúc §8): (a) hồ sơ cột đã che có còn là
     dữ liệu cá nhân không — nếu không, việc gửi không phải chuyển dữ liệu cá nhân ra nước ngoài; (b) nếu có, lập hồ sơ
     đánh giá chuyển sang Mỹ; (c) điều khoản với sàn có cho dùng nhà cung cấp AI làm bên xử lý không; (d) có cần xin ZDR.
3. **Mô hình**: Claude Opus 5.5 (`claude-opus-5-5`, 4 / 20 USD mỗi triệu token vào / ra) qua Claude API trực tiếp,
   `inference_geo: "global"` (vùng Mỹ chỉ thêm 10% giá, không gần Việt Nam hơn). Đầu ra cuối bằng structured outputs; các
   công cụ của tác tử `strict: true`; bộ đệm lời nhắc cho phần hệ thống và công cụ. Sonnet 5.5 (2 / 10) và Haiku 5.5
   (0,10 / 0,50) chỉ thay khi bộ thử cho thấy giữ được ngưỡng — không hạ mô hình vì giá trước khi đo.
4. **Hình dạng tác tử**: một tác tử lập kế hoạch với bốn công cụ tất định chạy trên hồ sơ — tra danh mục, thử phép biến đổi
   trên các giá trị khác nhau của một cột, xin giá trị của cột chưa rõ (mã quyết, chỉ cấp khi không dò thấy dữ liệu cá
   nhân và trường đích thuộc lớp được mở), nộp kế hoạch — tối đa 8 lượt, trần 240 giây. Bộ thử (quyết định 7) so nó với
   một lần gọi không công cụ; bản rẻ hơn thắng nếu giữ được ngưỡng.
5. **Chạy ở đâu**: đọc file, dựng hồ sơ, áp kế hoạch, xem trước — **trên trình duyệt** (luồng phụ để không đứng màn); file
   gốc không lên máy chủ. Gọi tác tử — **qua API của mình** (`/api/v1/imports/…`, giữ khoá, trần chi phí, cửa chặn), một
   hàm Vercel sin1 dưới 300 giây, trả tiến độ dần. Ghi — trình duyệt gửi từng gói 200 dòng, mỗi gói một giao dịch, gửi lại
   không trùng. **Không việc nền, không Batch API** ở bản đầu: kích thước hồ sơ có trần nên thời gian gọi không tăng theo số
   dòng.
6. **Học theo sàn**: bộ nhớ ở cơ sở dữ liệu của sàn (luật theo dòng, lớp `company_internal`) — **mẫu file** (dấu vân tay
   tiêu đề → ghép cột, phép biến đổi) và **từ điển giá trị của sàn** (dùng chung với cách gọi riêng, hàng 45). Thứ tự áp:
   mẫu khớp trọn → không gọi AI; khớp một phần → chỉ gửi cột và giá trị mới; mọi sửa của người ở màn xem trước ghi lại vào
   bộ nhớ khi lần nhập thành công. Bộ nhớ không bao giờ chứa giá trị của cột nguồn hay cột tên người.
7. **Đo trước khi dựng tác tử**: bộ thử trong kho — hai file mẫu hàng 5 và các file bẩn sinh có chủ ý từ cùng dữ liệu, mỗi
   lỗi cấy có nhãn đáp án. Số đo: độ đúng ghép cột, lỗi được sửa, lỗi lọt, số giá trị nguồn trong mọi gói gửi AI, tỉ lệ ô
   hỏi người, chi phí và thời gian mỗi lần. Đo **chế độ tất định trước** làm nền. Nền đã đạt mọi ngưỡng thì **không dựng
   tác tử** (ND5, ND6 chuyển sang chờ điều kiện); nền hụt ngưỡng nào thì tác tử phải đưa đúng ngưỡng đó qua mà «lỗi lọt»
   không tăng. Ngưỡng đề xuất ở [Nhập dữ liệu §9](../architecture/nhap-du-lieu.md#9-đo-chất-lượng).
8. **Hoàn tác cả lần nhập bằng sự kiện bù** (giữ chỉ thêm): hàng do lần nhập tạo nhận loại sự kiện mới `voided` — một cờ
   khi gấp (hàng ra khỏi bảng hàng, giữ lịch sử), **không phải trạng thái thứ bảy**, không đi qua bảng chuyển. Hàng có sẵn
   mà lần nhập chỉ đổi phần lần rao (giá, nội thất…) nhận sự kiện trả giá trị cũ; đổi trạng thái do lần nhập không hoàn
   tác được khi bảng chuyển không có lối về (về Chưa đủ để rao, ra khỏi Đã bán, Ngừng hẳn) — liệt kê cho người. Dòng đã có
   người sửa sau lần nhập thì không hoàn tác, báo rõ.
   **Ngày xác nhận theo file**: mọi sự kiện do lần nhập tạo mang `confirmedWithOwner: false` (tắt mặc định «sửa giá là
   xác nhận» của luật 9, vì người nhập không vừa gọi chủ); cột ngày của file thành một sự kiện `owner_confirmed` mang
   `confirmedAt` (không sau lúc ghi), `occurredAt` vẫn là giờ máy chủ; khi gấp, độ tươi lấy `confirmedAt` nếu có. Không
   cột ngày thì hàng nhập vào chưa xác nhận. Ba thay đổi — `voided`, `confirmedAt`, `import_id` trên sự kiện — đổi khuôn
   của ADR-0008, T3.
9. **Google Sheets ở bản đầu: chỉ nhận file tải về** (xlsx hoặc csv). Không đọc qua link chia sẻ công khai (bắt sàn mở
   bảng có số chủ cho bất kỳ ai có link). Đọc qua Google Picker + `drive.file` là hàng sau, mở khi người dùng thử thấy bước
   tải về là vướng.
10. **Trần chi phí**: sổ chi phí AI theo sàn, theo lần nhập (token, tiền, mô hình); trần mặc định 10 USD/tháng/sàn (Cài đặt
    sàn chỉnh), hết trần thì về chế độ tất định và báo quản trị sàn; thêm trần chi tiêu ở không gian làm việc Anthropic cho
    toàn nền tảng.
11. **Lần nhập theo luật của lõi, không đi đường tắt**:
    - **Ai nhập** (chờ chủ kho — Tham chiếu §10 ghi «Đầu chủ, quản trị»): khuyến nghị **Đầu chủ và Trưởng nhóm**; Quản
      trị sàn chỉ quản mẫu file (S6). Căn cứ: ADR-0010 — quản trị sàn không thấy nguồn, nên không ghi được cột chủ nhà; hàng
      do quản trị nhập rơi vào «Chỉ tôi» của quản trị, không ai khác đọc được (hàng 12).
    - **Ai giữ căn**: người nhập là đầu chủ thì giữ căn. Trưởng nhóm nhập thì cột «Đầu chủ» của file được ghép tất định
      với tên thành viên sàn ngay trên trình duyệt (không gửi đi), rồi gán qua lối gán của ADR-0010; tên không khớp → cần
      người.
    - **Trạng thái trong file**: hàng mới luôn bắt đầu Chưa đủ để rao và đi theo bảng chuyển. «Đang bán» chỉ vào được khi
      đủ điều kiện (thiếu thì ở Chưa đủ để rao, ghi lý do); «Đang giao dịch» đi qua Đang bán. Dòng «Đã bán», «Ngừng» của
      file cũ mặc định **không nhập** (liệt kê trong báo cáo lần nhập; file cũ hiếm khi có giá chốt), người bật được từng
      dòng. Không có lối nhập riêng vượt bảng chuyển.
    - **Trùng với hàng đang mở** theo luật 20: dòng thành **tin bổ sung** cho đầu chủ giữ căn, không ghi đè; chỉ khi người
      nhập chính là đầu chủ giữ căn thì dòng thành sự kiện cập nhật của hàng đó.
    - **Nhập file không phải một kết nối**: người trong sàn đưa dữ liệu của sàn vào, như gõ tay — không cần thoả thuận.
      Loại kết nối `spreadsheet` có sẵn dành cho bảng tính nối sống (Kiến trúc §0) và hàng Google Sheets sau.
      `ai_processing` thêm vào `CONNECTION_KINDS` **và** ràng buộc `kind` của bảng thoả thuận (migration mới).
12. **Chuẩn hoá là một lớp của lõi cho mọi cửa vào, không riêng lần nhập** (chủ kho hỏi 31/10 về lỗi chính tả, viết tắt
    khi gõ tay): trường danh mục không cho gõ (tự điền từ mã căn); trường tập đóng chọn hoặc so với giá trị chuẩn và từ điển
    của sàn; trường có cấu trúc qua cùng bộ đọc của lần nhập. Lựa chọn của người thành đề xuất từ điển, quản trị sàn duyệt.
    AI chỉ thêm ở việc dọn từ điển định kỳ (Batch API, chỉ lớp được mở). Dữ liệu đã lưu chỉ đổi qua sự kiện có người — không
    dọn tự động lặng lẽ. Chi tiết: [Nhập dữ liệu §12](../architecture/nhap-du-lieu.md#12-chuẩn-hoá-ở-mọi-cửa-vào-không-chỉ-lúc-nhập-file).

## Các lối đã so

| Câu | Lối | Được | Mất | Giá (ước) |
| --- | --- | --- | --- | --- |
| Ranh giới | A. Tác tử đọc cả file, trả dòng sạch | Bắt mọi kiểu bẩn | Gửi nguồn ra ngoài (trái bất biến 2); chi phí tăng theo dòng; mỗi lần một khác; khó soát | ~2–6 USD/lần cho 3.000 dòng; dễ chạm 300 giây |
| | **B. Tác tử viết kế hoạch, mã áp** — chọn | Nguồn ở lại; chi phí theo số giá trị khác nhau, không theo dòng; nhập lại ra cùng kết quả; soát được | Ô lạ ngoài thực đơn phải về người | ~0,2–1,3 USD lần đầu một mẫu; ~0 lần sau |
| | C. Không AI: từ điển + luật + người | Rẻ, tất định | Tiêu đề, giá trị lạ đều hỏi người lần đầu | 0 |
| Gửi gì ra | A. Gửi đủ, tin điều khoản xử lý | Tác tử thấy nhiều nhất | Trái chữ bất biến 2; chuyển dữ liệu cá nhân sang Mỹ (chỉ có vùng Mỹ) → hồ sơ đánh giá, rủi ro phạt | Pháp lý + hồ sơ |
| | B. Thay token cho ô nguồn, gửi phần còn lại | Tác tử thấy cấu trúc dòng | Cột ghi chú, tên nhân viên vẫn lọt; token vẫn là dữ liệu đã bí danh hoá | Như A, nhẹ hơn |
| | **C. Chỉ hồ sơ cột, cột người và chữ tự do chỉ gửi hình dạng** — chọn | Không dữ liệu cá nhân nào ra; rẻ nhất | Tác tử không đọc được ghi chú (đã là «cố ý không làm ở bản đầu»: máy đọc chữ) | 0 thêm |
| Google Sheets | **A. File tải về** — chọn | Không quyền, không xét duyệt | Thêm một bước tải | 0 |
| | B. Link chia sẻ «ai có link» | Một bước | Đẩy sàn mở bảng có số chủ ra công khai | 0, rủi ro lớn |
| | C. Picker + `drive.file` | Chọn file ngay, nhập lại theo file | Dự án Google Cloud, màn đồng ý, giữ khoá Picker | Vài ngày dựng + xét duyệt nhẹ |
| | D. `spreadsheets.readonly` | Đọc mọi bảng | Phạm vi nhạy cảm, mở mọi bảng tính, xét duyệt nặng | Tuần |
| Chạy ở đâu | **A. Trình duyệt + một hàm API cho tác tử** — chọn | File không lên máy chủ; khớp Kiến trúc §5 | Màn đóng giữa chừng thì làm lại phần xem trước | 0 thêm |
| | B. Tải file lên, việc nền xử lý | Làm tiếp được khi đóng màn | Hàng đợi việc, lịch Hobby chỉ một lần/ngày; file có số chủ nằm trên máy chủ | Cần Pro |
| | C. Batch API | Rẻ 50% | Tới 24 giờ; giữ 29 ngày, không ZDR | Không hợp xem trước |
| Học theo sàn | **A. Mẫu + từ điển ở cơ sở dữ liệu của sàn** — chọn | Tất định, rẻ dần, đi theo sàn trên mọi máy | Thêm hai bảng có luật theo dòng | Migration |
| | B. Đưa lần nhập cũ vào lời nhắc | Không bảng mới | Mỗi lần trả tiền đọc lại; không tất định | Tăng theo thời gian |
| | C. Lưu trên máy người nhập | Không đụng máy chủ | Người khác trong sàn không dùng được; mất khi đăng xuất | 0 |
| Chuẩn hoá chữ gõ tay hằng ngày | A. Tác tử AI soát mỗi lần sửa | Bắt được nhiều kiểu | Chậm từng ô (trái «nhanh tức thì»), tốn tiền theo lần gõ, không tất định | Theo lần gõ |
| | **B. Một bộ chuẩn hoá ở lõi + từ điển của sàn học từ lựa chọn của người; AI chỉ dọn từ điển định kỳ** — chọn | Tức thì, tất định, rẻ; sàn giỏi dần | Giá trị lạ lần đầu phải hỏi người | ~0; Batch rẻ 50% |
| | C. Dọn định kỳ trên dữ liệu đã lưu | Không đụng màn gõ | Bẩn vào trước rồi mới dọn; sửa lặng lẽ trái sự kiện có người | Theo lần dọn |
| Hoàn tác | **A. Sự kiện bù + `voided`** — chọn | Chỉ thêm, hoàn tác cả sau khi ghi | Đổi khuôn sự kiện (T3) | Một hàng T3 |
| | B. Chỉ huỷ trước khi chốt | Không đổi lõi | Sai phát hiện sau khi nhập thì không gỡ được — trái luật 11 | 0 |
| | C. Xoá hàng | Gọn | Trái ADR-0008 (trigger chặn xoá) | — |

Chi phí ước bằng cỡ dữ liệu, chưa đo token thật (máy phiên này không có khoá API): xem
[Nhập dữ liệu §7](../architecture/nhap-du-lieu.md#7-chi-phí). Phép đo thật thuộc hàng bộ thử.

## Hệ quả

- Lộ trình: hàng 20, 21 tách thành sáu hàng (bản phạm vi kèm theo); bộ thử và chế độ tất định đi trước tác tử.
- Lõi: thực đơn phép biến đổi nhập, bộ phân loại cột, bộ dựng hồ sơ cột ở `packages/core/src/import/` — dùng chung trình
  duyệt và máy chủ. `CONNECTION_KINDS` thêm `ai_processing`.
- ADR-0008 đổi: thêm `voided`, `confirmedAt` theo file, mỗi sự kiện mang `import_id` khi do lần nhập tạo.
- Bảng mới (luật theo dòng): lần nhập, kết quả từng dòng, mẫu file, từ điển giá trị, sổ chi phí AI.
- Kiểm bắt buộc mới: bộ kiểm rò nguồn ra AI (gói gửi đi không chứa giá trị nguồn hay dữ liệu cá nhân).
- Vận hành (việc của người, ngoài kho): tài khoản Claude API của OneHub, khoá trong Vercel, trần chi tiêu; người pháp lý rà
  bốn câu ở quyết định 2; nâng Vercel Pro trước sàn trả tiền (điều khoản Hobby).

## Nguồn đã kiểm (31/10/2026)

- Anthropic — [API and data retention](https://platform.claude.com/docs/en/manage-claude/api-and-data-retention),
  [chính sách lưu dữ liệu thương mại](https://privacy.claude.com/en/articles/7996866-how-long-do-you-store-my-organization-s-data),
  [Data residency](https://platform.claude.com/docs/en/manage-claude/data-residency); bảng giá mô hình theo skill
  `claude-api` (bản đệm 06/10/2026).
- Luật 91/2025/QH15 — bình luận của [Tilleke & Gibbins](https://tilleke.com/insights/vietnams-new-personal-data-protection-law-a-closer-look),
  [Allen & Gledhill](https://www.allenandgledhill.com/vn/publication/articles/31075/upcoming-changes-to-vietnam-s-personal-data-protection-regime);
  chưa đọc văn bản luật và nghị định hướng dẫn — việc của người pháp lý.
- Vercel — [Functions limitations](https://vercel.com/docs/functions/limitations).
- Google — [Sheets API scopes](https://developers.google.com/workspace/sheets/api/scopes),
  [Drive API scopes](https://developers.google.com/workspace/drive/api/guides/api-specific-auth).
