# ADR-0019: Cổng chọn khối — ba lối trình ở Cổng Phạm vi

Ngày: 2026-11-01 · Trạng thái: **đề xuất** (Manh Phan 01/11 chốt hướng: «Chốt A + C + B gộp»; accepted khi PR gộp) ·
Liên quan: ADR-0002 (thang dùng lại, khối đích theo lô), ADR-0004, `docs/design/vo-va-ia.md` §2–§3, bản đồ khuôn
(hàng 58–60), nghi thức `design-pass` của kit (bước phân kỳ) · hiện trạng:
[Cổng chọn khối — hiện trạng](../design/cong-chon-khoi-hien-trang.md) · đề xuất hàng:
[Bản phạm vi cổng chọn khối](../plan/pham-vi-cong-chon-khoi.md)

## Bối cảnh

Chủ kho, 1/11: khi một màn cần khối, nên có ba lựa chọn — **trong kho của repo, chọn trên ReUI, vẽ mới** — được đề xuất,
chứng là nhất quán về UX/UI, rồi mới phê duyệt; khối lấy từ ReUI về thì vào kho để lần sau là lối «trong kho».

Khảo sát 1/11 (bản hiện trạng, số và nguồn ở đó):

- Ba lối có sẵn trong thang bảy bậc (bậc 2 trong kho · 3–5 ReUI · 6–7 ghép, tự viết) nhưng thang là luật cho tác tử. Người
  chỉ so lối **một lần theo lô** — 30/10, 21 màn (ADR-0002).
- Bước phân kỳ của `design-pass` có sẵn mà cả hai màn đã qua đều ghi `divergence: skipped` vì khối đích đã chốt.
- Ảnh đối chiếu so màn mới với màn mẫu cùng nhóm; màn đầu của nhóm mới so với **chính nó** — đúng lúc chọn khối thì ảnh
  không chứng gì.
- Rơi xuống ghép không thành quyết định nào: hàng 24 ghép «khi có khoá ReUI», sổ quyết định không có dòng; bốn chỗ tạm
  như vậy vẫn chờ khi khoá đã có.
- Bản đồ khuôn giữ nhất quán theo **nhóm màn**; không có chỗ tra theo **khối** (đã dùng ở đâu, cho archetype nào, ai
  duyệt). `catalog.md` «Khối đã chuyển thể» có một dòng trên main.

Ràng buộc số 1 của chủ kho là tần suất gọi người: cổng không được thêm lượt.

## Quyết định

1. **Không thêm cổng.** Chọn khối được trình ở **Cổng Phạm vi** sẵn có của vòng, cùng thẻ và ảnh đối chiếu.
2. **Thẻ ba lối chỉ bật cho ô chưa có khuôn.** Một vòng chạm ô chưa có khuôn khi: màn đầu của nhóm mới; đổi khối đích của
   một màn; hay định dựng một ô bằng ghép hoặc tự viết (bậc 6–7). Khi đó bước phân kỳ của `design-pass` **phải mở**
   (`divergence: opened`) với ba hướng có tên cố định:
   - **Trong kho** — khối đã chuyển thể hay khuôn gần nhất, tra ở danh mục khối (quyết định 4);
   - **ReUI** — một hoặc hai khối tra bằng MCP `reui`, ảnh xem trước cùng khổ;
   - **Vẽ mới** — ghép từ thành phần, phác ở độ nét đủ cho quyết định.
   Mỗi hướng một ảnh cùng khổ, một câu động cơ, một câu đánh đổi; lời khuyên của máy ghim trên trang. Trang ba lối gửi
   kèm thẻ Cổng Phạm vi trước khi ký. Một lối không có ứng viên thì trang ghi «không có» kèm điều đã tra — không bỏ cột.
   Màn đi khuôn sẵn của nhóm thì không bật; `divergence: skipped` vẫn hợp lệ.
3. **Vẽ mới có luật.** Mỗi chỗ dựng bằng ghép hay tự viết — dòng «Chỗ hở» ở `vo-va-ia.md` §3 — ghi đủ ba thứ: đã tra gì
   trên ReUI (truy vấn và ứng viên gần nhất), vì sao không đứng, và **hạn xem lại** (một điều kiện hay một ngày). Rơi bậc
   trong một vòng là một dòng `decisions.jsonl` của hồ sơ. Bài kiểm của kho đỏ khi dòng «Chỗ hở» thiếu một trong ba.
4. **«Trong kho» là danh mục khối đã có, không phải sổ mới.** Bảng «Khối đã chuyển thể» của
   `.agents/skills/quy-hang-ui/catalog.md` thêm cột: archetype, nhóm đang dùng, ảnh chuẩn, phiên bản ReUI, ngày và người
   duyệt. Kiểm chuẩn đỏ khi một khối đã cài và chuyển thể mà thiếu dòng. Bậc 2 của thang dùng lại tra bảng này.
5. **Người duyệt khối là chủ sản phẩm ở Cổng Phạm vi.** Ký Cổng Phạm vi của vòng có trang ba lối là duyệt lối được khuyên
   (hay lối người chọn thay). Cài khối Pro vẫn là việc kỹ thuật giám sát tự quyết, sau khi lối đã duyệt.

## Hệ quả

- Màn đầu của mỗi nhóm còn lại trên lộ trình (hồ sơ căn, Hôm nay, lead của tôi, bảng thẻ điện thoại, Gửi…) đi qua trang
  ba lối. Giờ máy tăng ở các vòng ấy (dựng hai, ba bản nháp); màn sau của nhóm không đổi.
- Bộ đối chiếu (`packages/ui-lint/doi-chieu.mjs`) có thêm chế độ ba lối; ảnh lối «Trong kho» và «ReUI» lấy từ ảnh chuẩn
  của danh mục và ảnh xem trước của ReUI.
- Bốn chỗ ghép tạm đang chờ khối Pro (đăng nhập, ô nhận lead, trống · lỗi · báo, người dùng) phải ghi hạn xem lại khi
  luật 3 vào; hạn của cả bốn đã tới — trả từng chỗ là hàng riêng theo màn, mở sau khi luật có răng.
- Khối đích theo lô ở `vo-va-ia.md` §2 vẫn là **khuyến nghị đầu vào** cho lối «ReUI» của trang ba lối, không còn là lời
  chốt cuối khi màn đến lượt.
- Kit: in ảnh lên thẻ Cổng Phạm vi vẫn là mục chờ của kit (KH2, KH3); tới lúc đó trang ba lối là tệp gửi kèm thẻ, như
  ảnh đối chiếu hôm nay.

## Phương án đã cân

- **Bảng chọn khối theo đợt** — rẻ cho người, nhưng chọn trước khi có dữ liệu thật, lặp lại chỗ hở của lần chọn theo lô.
- **Cổng chọn khối riêng** trước Cổng Phạm vi — thêm một lượt gọi người mỗi hàng giao diện; trái ràng buộc số 1.
- **Sổ khối riêng** cạnh bản đồ khuôn — trùng phần lớn với `catalog.md`; thêm một sổ phải giữ.
