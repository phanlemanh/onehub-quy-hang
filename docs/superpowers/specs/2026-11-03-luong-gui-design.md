# Luồng Gửi (hàng 34) — thiết kế

Ngày: 2026-11-03 · Hạng T2 · Dãy L · Ô cơ hội: `_acceptance/luong-gui/opportunity.md` (build, 02/11).

Câu giao: Đầu khách chọn căn, xem trước đúng trang khách sẽ thấy, rồi mở bảng chia sẻ của điện thoại với link, ảnh và
tin soạn sẵn; người tự bấm gửi trong Zalo.

## Đứng trên gì

- **Hàng 32 (Bảng hàng dạng thẻ)** — `useChonCan` ở `inventory/cards/bang-the.tsx` đã chọn nhiều căn bằng giữ lâu, chỉ
  căn «Đang bán» chọn được; chú thích của nó chờ hàng 34 dựng thanh «n căn · Xem trước · Gửi».
- **Hàng 31 (luật ẩn)** — `banRaNgoai` của `@quy-hang/core/redaction` là đường duy nhất dựng dữ liệu ra ngoài; cửa
  `gui_link` và tiền tố `/shares/new` đã đăng ký; rào `timCuaRaThieuKiem` đòi trang dưới `/shares/new` có bài
  `*.ro-ri.test.tsx` gọi `canMoi(` và `timRoRi(`.
- **Hàng 86 (liên hệ khách)** — `POST /api/v1/shares` tạo một Lần gửi (khách riêng gắn một nhu cầu khách của chính đầu
  khách; nhóm môi giới không gắn), trả `code`. Chưa có route đọc danh sách nhu cầu khách.
- **Hàng 3 (bài thử Zalo)** — iPhone: ảnh + tin tới đủ; «link + tin» chỉ tới link → link đặt trong thân tin, không
  tách trường `url`. Zalo Web không có thẻ xem trước. Gọi lại bảng chia sẻ khi bảng cũ chưa đóng ném `InvalidStateError`.

## Luồng

1. **Bảng hàng (thẻ)**: chọn ≥1 căn → thanh dính đáy «n căn · Xem trước · Gửi» (khối thanh chọn của `wishlist-1`).
   Hai nút cùng dẫn tới `/shares/new?can=<id>,<id>…` (thứ tự chọn giữ nguyên); «Xem trước» mở thẳng ngăn xem trước.
2. **Màn Gửi** `/shares/new` (bố cục «Luồng nhiều bước», ADR-0024):
   - Bước **Gửi cho ai**: «Khách riêng» (chọn một khách đang mở của mình — danh sách từ `GET /api/v1/prospects`) hay
     «Nhóm môi giới». Chưa chọn người nhận thì không gửi được.
   - **Danh sách căn**: căn đã chọn theo thứ tự, bỏ được từng căn; căn quá 14 ngày chưa xác nhận mang nhắc «Gọi xác
     nhận trước» (Luật sản phẩm 25 — nhắc, không chặn); căn không còn «Đang bán» bị loại khỏi lần gửi kèm lý do.
   - **Tin soạn sẵn**: dựng từ bản ra (không từ dữ liệu nội bộ), sửa được trước khi gửi.
   - Thanh dính đáy «n căn · Xem trước · Gửi».
3. **Xem trước**: `Drawer` toàn màn dựng trang khách từ `banRaNgoai(can, {cua:"gui_link", nguoiNhan, today})` — đúng
   bản khách riêng (ẩn mã căn, hiện toà và nấc tầng khi có) hay nhóm môi giới (hiện mã). Thành phần trang khách đặt ở
   thư mục màn Gửi; hàng 35 dựng `/s/<mã>` trên cùng thành phần.
4. **Gửi**: cần mạng (Luật 25). Bấm Gửi → `POST /api/v1/shares` → link `<gốc>/s/<mã>` → mở bảng chia sẻ của máy
   (`navigator.share`) với tin (link nằm trong tin) và ảnh bìa các căn (ảnh ngăn gửi được, `anhRaNgoai`). Máy không
   gửi gì khác; người chọn Zalo và tự bấm gửi (bất biến 3). Máy không có bảng chia sẻ (máy tính) → «Chép tin» chép tin
   có link vào bộ nhớ tạm; không chép được thì hiện tin để chọn và chép tay (nếp hàng 29, `cot-ho-so-can`).

## Quyết định máy (căn cứ ở sổ quyết định)

- Lối vào là Bảng hàng thẻ, không có màn chọn căn riêng — `vo-va-ia.md` dòng «Luồng Gửi»; Luật sản phẩm 4 (căn đang
  chọn đi theo người sang Gửi).
- Dữ liệu xem trước, tin soạn sẵn và ảnh đều đi qua `banRaNgoai` / `anhRaNgoai` của lõi — bất biến 4, Luật 23.
- Link nằm trong thân tin — kết quả bài thử Zalo hàng 3.
- Thân lời gọi «Khách mới» (`thanKhachMoi`) và «Gửi» (`thanLanGui`) do lõi dựng (`packages/core/src/sharing/tin.ts`), qua
  `validateProspectInput` / `validateShareInput` của hàng 86 — màn Gửi và bài kiểm API dùng cùng một hàm.
- Bấm Gửi khoá nút tới khi lời tạo Lần gửi trả về — một lần bấm một Lần gửi.

## Đối chiếu ngành (ADR-0022)

| Năng lực | RESO | KW Command | BoldTrail | Ta làm | Ta cứng — họ cấu hình |
|---|---|---|---|---|---|
| Gửi bộ căn cho một khách | `ContactListings` (căn đã gửi cho liên hệ) | Collection tuyển tay, gửi khách ([nguồn](https://answers.kw.com/hc/en-us/articles/360057912834-Saved-Search-vs-Collection)) | Chọn listing rồi gửi email hay tin nhắn ([nguồn](https://help.insiderealestate.com/en/articles/3424538-boldtrail-how-to-email-listings-to-your-contacts)) | Lần gửi một link, người tự bấm gửi qua bảng chia sẻ | Không — hai bên cũng do người chọn căn |
| Xem trước điều khách thấy | `ConciergeYN` (thư chờ duyệt) | chưa kiểm | chưa kiểm | Ngăn xem trước dựng chính trang khách | Không |
| Tin kèm theo | — | chưa kiểm | Mẫu email/tin của người và sàn (chưa kiểm chi tiết) | Tin soạn sẵn từ bản ra, người sửa trước khi gửi | **Có** — mẫu tin mặc định viết ở lõi (Hỏi-3) |
| Ảnh kèm | — | chưa kiểm | chưa kiểm | Ảnh bìa mỗi căn, tối đa 10 tệp | **Có** — số ảnh giữ cứng (Hỏi-3) |
| Người nhận | `Prospecting` gắn một liên hệ | Liên hệ | Liên hệ, nhóm hashtag | Khách riêng (một nhu cầu khách) · Nhóm môi giới | **Có** — hai người nhận giữ cứng (Hỏi-4) |

## Hỏi chủ kho (Cổng Phạm vi)

- **Hỏi-1 — «gửi được căn» là gì trong số đo.** Khuyến nghị: một Lần gửi tạo lúc người bấm Gửi chính là sự kiện «gửi
  được căn» (`shares.created_at`, có người gửi, có nhu cầu khách), không thêm bảng hay migration. Lối khác: ghi thêm
  một sự kiện sau khi bảng chia sẻ trả về — cần migration và route mới (lên T3), mà vẫn không chứng được người đã bấm
  gửi trong Zalo (bảng chia sẻ chỉ báo đã chọn ứng dụng).
- **Hỏi-2 — Khách chưa có trong danh sách.** Khuyến nghị: bước «Gửi cho ai» có «Khách mới» (tên, số, Mua/Thuê) tạo
  nhu cầu khách bằng `POST /api/v1/prospects` của hàng 86 rồi chọn luôn — khách hỏi xong gửi ngay, đúng số đo «khách
  hỏi → gửi được căn». Lối khác: chỉ chọn khách đã có, tạo khách ở màn khác (chưa có màn nào) — đầu khách bị kẹt ở lần
  gửi đầu cho khách mới.
- **Hỏi-3 — Mẫu tin và ảnh kèm.** Khuyến nghị: mẫu tin mặc định, một ảnh bìa mỗi căn và trần 10 ảnh đặt ở một chỗ có tên trong lõi
  (`packages/core/src/sharing/tin.ts`), là mặc định dựng sẵn; sàn chỉnh khi có màn Cài đặt sàn (45–49, ngoài đợt).
  Lối khác: làm ngay thành cài đặt sàn (bảng `company_settings`, migration, lên T3) — chưa có màn để sàn chỉnh; hay
  nhiều ảnh mỗi căn (phòng khách, view, bếp) — gói chia sẻ nặng, Zalo dồn ảnh của nhiều căn lẫn nhau.
- **Hỏi-4 — Người nhận giữ cứng hai loại.** Khuyến nghị: giữ cứng Khách riêng · Nhóm môi giới — đó là hai nhánh của luật
  ẩn (Luật sản phẩm 24: khách riêng ẩn mã căn, nhóm môi giới hiện), lý do «quyền và an toàn» của ADR-0022. Lối khác: sàn
  tự đặt nhóm người nhận (như nhóm hashtag của BoldTrail) — mỗi nhóm phải neo vào một trong hai nhánh luật ẩn, cần bảng
  và màn Cài đặt sàn.
- **Hỏi-5 — Lối vào Gửi trước khi trang khách (35) gộp** (khó đảo: chạm người dùng thật). Gộp 34 trước 35 thì link gửi
  đi chưa mở được trang. Khuyến nghị: không thêm cờ — chưa có sàn thật dùng trước hai tuần thử, và 35 đi ngay sau 34
  trong đợt; ghi Known limits. Lối khác: giấu nút Gửi sau một cờ tới khi 35 gộp — thêm một tiêu chí và một lần gộp mở
  cờ.

## Ngoài vòng

- Trang khách `/s/<mã>` công khai và route đọc công khai (hàng 35, mang rào route — luật 39). Tới khi 35 gộp, link
  gửi đi chưa mở được trang; xem trước trong màn Gửi là bản dựng cùng thành phần.
- Đã gửi (hàng 36), lượt mở / quan tâm (hàng 35).
- Chọn căn trên bảng máy tính (lưới `BangCoHoSo`) — máy tính vào Gửi từ bảng thẻ hay link `?can=`.
- Che vùng ảnh trước khi gửi (hàng va-che-vung-anh), nấc tầng khi danh mục chưa có số tầng toà.

## Bất biến chạm

Bất biến 3 (người bấm gửi — chỉ mở bảng chia sẻ), bất biến 4 (phần nội bộ không ra — dựng từ luật ẩn của lõi, bài kiểm
rò rỉ cho trang xem trước, tin và gói chia sẻ). Bất biến 1, 2 không đổi: không bảng mới, đầu khách không đọc liên hệ.

## Đặc tả UX

<!-- UX-SPEC:START -->
### Khuôn IA đã chọn + căn cứ
Luồng nhiều bước trên một màn (bố cục «Luồng nhiều bước» của ADR-0024): người nhận → căn → tin → xem trước → chia sẻ;
thanh dính đáy giữ hành động chính. Căn cứ: dòng «Gửi» ở `docs/design/vo-va-ia.md` §2.

### Màn và trạng thái
| Trạng thái | Thấy gì |
|---|---|
| Chưa chọn người nhận | Nút Gửi mờ, chữ «Chọn người nhận» |
| Đủ | Thanh «n căn · Xem trước · Gửi» |
| Mất mạng | Gửi mờ, «Gửi cần mạng» |
| Căn quá 14 ngày | Nhãn «Gọi xác nhận trước» trên căn |
| Không còn căn | «Không còn căn gửi được — về Bảng hàng» |
| Đang tạo link | Nút Gửi quay |
| Tạo link lỗi | Báo lỗi tiếng Việt, giữ nguyên lựa chọn |
| Máy không có bảng chia sẻ | Nút «Chép tin», chép xong báo «Đã chép» |

### Thẻ việc
Đầu khách · điện thoại · vừa nghe khách hỏi → gửi được bộ căn trong một phút, khách thấy đúng điều được phép thấy.
<!-- UX-SPEC:END -->
