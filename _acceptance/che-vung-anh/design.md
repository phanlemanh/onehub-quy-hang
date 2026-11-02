# Che vùng ảnh — thiết kế

Hàng 19 của đợt «Đầu chủ động vào» (dãy B). Câu giao: đầu chủ che một vùng trên ảnh trước khi gửi; ra ngoài là bản nhẹ,
bản gốc giữ lại (luật 29). Đứng trên hàng 18 (ảnh căn ba ngăn) và va-anh-ban-that (kho ảnh thật).

## Vấn đề

Ảnh căn đầu chủ chụp hay lẫn thứ không nên ra ngoài: số nhà, biển số xe, mặt người, giấy tờ trên bàn, đồ riêng của chủ
nhà. Hôm nay muốn gửi thì phải sửa ảnh ở ứng dụng khác rồi tải lại; bản chưa che vẫn nằm ở ngăn «Gửi được».

## Đã có

- Ảnh thuộc căn, hai ngăn trong kho (Gửi được · Nội bộ); ngăn Nội bộ không bao giờ ra ngoài, chặn ở cơ sở dữ liệu
  (ADR-0014). Byte ảnh không sửa được; kho có hai biến thể `original`, `thumb` (migration 012).
- Tải ảnh: link PUT ký 60 giây cho bản gốc, bản nhỏ vẽ trên trình duyệt bằng OffscreenCanvas (`photos/tai-len.ts`).
- Máy chủ không xử lý ảnh. Chưa có đường gửi hay trang khách — gửi là hàng riêng.

## Cách giải

- Menu của mỗi ảnh ở ngăn **Gửi được** (người sửa được ảnh: đầu chủ giữ căn, trưởng nhóm) thêm **«Che vùng…»** — ảnh Nội bộ
  không có mục này và hàm lưu từ chối nguồn Nội bộ: bản che của ảnh sổ sẽ đưa phần còn lại của nó ra ngoài (bất biến 2), mở trình che toàn màn trên ảnh
  gốc. Kéo chuột vẽ các khung chữ nhật; danh sách khung, «Bỏ khung cuối», «Bỏ hết». Toạ độ khung tính theo điểm ảnh của
  ảnh gốc đã xoay theo hướng EXIF (ảnh dọc chụp điện thoại), đổi từ toạ độ màn bằng hàm thuần, nên phóng thu màn không lệch
  vùng; khung vẽ dùng ảnh đã xoay (`createImageBitmap` với hướng từ ảnh) cho cả màn lẫn bản che.
- **«Lưu bản che»**: trên trình duyệt, vẽ ảnh gốc, tô kín màu đặc từng khung, thu về bản nhẹ (cạnh dài ≤ 1600 điểm ảnh,
  giữ tỉ lệ, webp 0,82 — mặc định của sàn, Hỏi-2), rồi tải lên như một ảnh mới ở ngăn Gửi được qua đường tải sẵn có; ngày
  chụp chép từ ảnh gốc. Lưu qua canvas nên siêu dữ liệu EXIF (vị trí, máy chụp) không theo sang.
- Tải xong thì bản gốc sang ngăn Nội bộ (Hỏi-1) — bản chưa che không còn đường ra ngoài. Tải lỗi thì không chuyển gì, báo lỗi,
  khung vẫn giữ để thử lại.
- Logic thuần ở `redact/vung.ts` (toạ độ, tô kín trên mảng điểm ảnh, cỡ bản nhẹ); trình che ở `redact/trinh-che.tsx`; móc
  vào `photos/muc-anh.tsx` một mục menu.

## Đối chiếu ngành

| Năng lực | RESO | Sản phẩm 1 | Sản phẩm 2 | Ta định làm | Ta cứng — họ cấu hình |
|---|---|---|---|---|---|
| Che vùng trên ảnh | `Media` không có trường che; quyền theo ảnh `Permission` ([dd.reso.org](https://dd.reso.org/DD2.0/Media/)) | Autoenhance: tự nhận diện và làm mờ mặt, biển số, bật ở tài khoản ([help.autoenhance.ai](https://help.autoenhance.ai/en/articles/7856090-privacy-blur-license-plates-and-people)) | Zalo: không có công cụ che trong khung gửi ảnh — chưa kiểm được nguồn chính chủ | Người kéo khung, tô kín màu đặc | Không: tự nhận diện là ngoài phạm vi (cần AI) |
| Ảnh gửi đi nhẹ | — | Zalo: nén ảnh gửi còn vài trăm KB, người dùng bật «Ghi nhớ chất lượng ảnh» ([cellphones.com.vn](https://cellphones.com.vn/sforum/meo-gui-anh-tren-zalo-chat-luong-cao)) | Autoenhance: cỡ xuất chọn theo đơn — chưa kiểm | Bản che cạnh dài 1600, webp 0,82 | **Có** — Hỏi-2 |
| Kiểu che | — | Autoenhance: làm mờ (không tô kín), bật ở tài khoản — kiểu che có chỉnh được không: chưa kiểm | Canva: làm mờ bằng cọ tay ([blur.me tổng hợp](https://www.blur.me/blog/real-estate-listing-photo-blur/), bên thứ ba) | Tô kín màu đặc | **Có** — Hỏi-3 (đề xuất giữ cứng: quyền và an toàn) |
| Bản gốc giữ lại | `Media` có `Permission` Agent Only cho ảnh chỉ nội bộ | Follow Up Boss, Lofty: không quản kho ảnh (Đối chiếu ngành §7) — chưa kiểm | Meey CRM: quỹ hàng có ảnh — giữ bản gốc thế nào chưa kiểm | Bản gốc sang ngăn Nội bộ | Không (ngăn là bất biến) |

## Đặc tả UX

<!-- ux-spec:start -->
| Trạng thái | Thấy gì |
|---|---|
| Menu ảnh ngăn Gửi được (người sửa được) | thêm «Che vùng…»; ảnh Nội bộ và người không sửa được không thấy |
| Mở trình che | ảnh vừa khung, hướng dẫn «Kéo để vẽ vùng che», chưa khung nào: nút Lưu tắt |
| Đã vẽ khung | khung tô đen trên ảnh; «Bỏ khung cuối», «Bỏ hết»; «Lưu bản che» bật |
| Đang lưu | nút «Đang lưu…» tắt, không đóng được |
| Lưu xong | đóng trình che; ngăn Gửi được có ảnh mới (bản che), bản gốc ở Nội bộ; thông báo «Đã lưu bản che · bản gốc ở Nội bộ» |
| Lưu lỗi | lời báo lỗi trong trình che, khung giữ nguyên, bản gốc không đổi ngăn |
| Ảnh không đọc được | lời báo «Không mở được ảnh này», không vẽ được |

Khuôn IA: giữ khuôn hồ sơ căn của hàng 18 (mục ảnh trong cột hồ sơ); trình che là Dialog toàn màn, không màn mới.
<!-- ux-spec:end -->

## Quyết định

Sổ `decisions.jsonl` d-…-2 tới d-…-9. Chỉ người quyết:

- **Hỏi-1** (d-…-5): lưu bản che xong thì bản gốc tự sang ngăn Nội bộ? Nháp theo khuyến nghị: có. Lối khác: bản gốc ở yên,
  đầu chủ tự chuyển.
- **Hỏi-2** (d-…-6): cỡ bản nhẹ là mặc định của sàn khai một chỗ ở lõi (sàn chỉnh sau) hay khoá cứng? Nháp theo khuyến
  nghị: mặc định của sàn.
- **Hỏi-3** (d-…-13): kiểu che giữ cứng tô kín màu đặc (lý do quyền và an toàn) hay để sàn chọn (làm mờ, vỡ hạt)? Nháp theo
  khuyến nghị: giữ cứng.

## Ngoài phạm vi

Tự nhận diện mặt, biển số · đường gửi và trang khách (bản nhẹ cho mọi ảnh gửi đi) · sửa lại khung của bản che đã lưu ·
che trên điện thoại (cảm ứng) · nối bản che với bản gốc trong dữ liệu.
