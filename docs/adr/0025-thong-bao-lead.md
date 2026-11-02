# ADR-0025: Thông báo lead — Web Push, nội dung không lớp nguồn, khoá không ai cầm, hộp thư đi

Ngày: 2026-11-02 · Trạng thái: **accepted** (Manh Phan duyệt Cổng Phạm vi hồ sơ `thong-bao-lead` 02/11, Hỏi-1..4 theo
khuyến nghị; duyệt kế hoạch 02/11) · Liên quan: Kiến trúc §5, §7; Tham chiếu §11; ADR-0013 (mã hoá số chủ), ADR-0017
(chia lead và hạn, quyết định 9 / Hỏi-6), ADR-0020 (lead bốn nấc); hàng 22, 25, 26 của lộ trình

## Bối cảnh

Lead về đầu chủ bằng nhịp chia, trưởng nhóm giao, hay lúc nhập (khớp đầu chủ giữ chủ nhà hay căn), nhưng đầu chủ chỉ biết
khi mở Hôm nay. Hạn nhận 15 phút (ADR-0017) cần một tiếng chuông. Kiến trúc §5 chọn Web Push: máy tính, Android, và
iPhone khi web đã cài lên màn hình chính; §7 hẹn hướng dẫn cài cho iPhone. Thông báo hiện trên màn hình khoá và đi qua
dịch vụ đẩy của Apple, Google — ra khỏi công ty.

## Quyết định

1. **Web Push, bật trên từng thiết bị.** Dải «Bật thông báo lead» đầu khung Hôm nay cho đầu chủ và trưởng nhóm (Hỏi-3),
   kể cả khi trưởng nhóm đang thấy trang giữ chỗ. Bấm → trình duyệt xin quyền → service worker (`/sw.js`) đăng ký bằng
   khoá công khai VAPID → `POST /api/v1/me/push-subscriptions`. Đăng ký gắn người và sàn; một người nhiều thiết bị;
   `DELETE` cùng đường gỡ; đăng xuất gửi kèm endpoint của thiết bị để máy chủ gỡ trước khi xoá phiên. iPhone Safari chưa
   cài lên màn hình chính thấy hướng dẫn cài (Chia sẻ → Thêm vào MH chính) thay nút bật. Web có manifest, biểu tượng.
2. **Nội dung không mang lớp nguồn** (Hỏi-2, bất biến 2): đúng bốn khoá `title`, `body`, `url`, `tag` dựng ở lõi
   (`packages/core/src/push`) — «Lead mới» · «<Toà> · <nhu cầu>» · `/today?lead=<id>`. Không số, không tên chủ, không
   giá, không mã căn. Cơ sở dữ liệu chặn thêm: hộp thư đi chỉ nhận nội dung đúng bốn khoá.
3. **Trưởng nhóm nhận đẩy cho lời báo mới** (Hỏi-1, nới ADR-0017 Hỏi-6): `unrouted`, `accept_overdue`,
   `first_call_overdue` — loại lời báo + toà, mở `/today` (màn lời báo là hàng 42). Lời báo đã có không gửi lại.
4. **Hộp thư đi.** Mỗi lối giao lead ghi dòng «cần báo» (`push_outbox`) trong CÙNG giao dịch giao — quay lui thì dòng mất;
   sau khi giao dịch ghi xong, lối ấy gửi các dòng mới của sàn; nhịp chia mỗi phút gửi lại dòng lỗi tạm, tối đa ba lần
   trong 15 phút (`PUSH_RETRY`, mặc định của sàn). Tự nhận từ kho chung không báo. Lỗi gửi không làm hỏng việc giao. Dịch
   vụ đẩy trả 404/410 → xoá đăng ký; lỗi khác giữ đăng ký, ghi lần hỏng. `sent_at` là mốc gửi cho số đo lead → cuộc gọi
   đầu (Tham chiếu §11; ngưỡng Hỏi-4: trung vị ≤ 5 phút trong hai tuần thử).
5. **Khoá VAPID — không ai cầm khoá.** Máy chủ tự sinh cặp khoá P-256 ở lần dùng đầu, lưu ở bảng hệ thống `push_vapid`
   (một dòng, không thuộc sàn nào, luật theo dòng không luật nào, vai API không được cấp — chỉ qua hai hàm security
   definer). Khoá công khai lưu thường; khoá riêng lưu bản mã AES-256-GCM bằng khoá con HKDF của `OWNER_PHONE_KEY` (nhãn
   `quy-hang/push-vapid/v1`, cùng cách ADR-0013 suy khoá con cho dấu vết số). Không thêm biến môi trường; không ai sinh,
   đọc, chép hay chuyển khoá bằng tay. Hai lần dùng đầu song song: ràng buộc một dòng giữ một cặp. Xoay khoá = xoá dòng
   bằng vai chủ; thiết bị đăng ký lại ở lần mở kế. Gửi bằng thư viện `web-push` (aes128gcm, RFC 8291) — không tự viết mã
   hoá.
6. **Đăng ký chỉ người chủ của nó chạm.** `push_subscriptions` theo sàn và người: người đọc, thêm, sửa khoá, xoá đăng ký
   của chính mình trong sàn đang làm; người khác (kể cả trưởng nhóm) không đọc được. Lối gửi đọc đăng ký qua hàm hộp thư đi
   (`app.push_outbox_claim`); hàm lấy đăng ký thô (`app.push_targets`) không cấp cho vai API.

## Hệ quả

- Thử trên điện thoại thật (iPhone đã cài, Android) là việc của phiên nghiệm thu, không phải bài chấm máy.
- Một trình duyệt dùng chung bởi hai người: người trước không đăng xuất thì thiết bị vẫn nhận thông báo của người ấy
  tới khi đăng xuất hay gỡ.
- Đăng xuất chỉ gỡ đăng ký ở sàn đang làm; người nhiều sàn bật ở sàn khác thì gỡ ở sàn ấy.
- Ngoài phạm vi: tab «Tôi» trên điện thoại, thông báo cho đầu khách / telesales / quản trị, nhắc hạn cho chính đầu chủ,
  chuông trong app, Zalo OA (Kiến trúc §8).
