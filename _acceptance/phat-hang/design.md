# Thiết kế — Xuất bảng hàng (hàng 43, `phat-hang`)

Câu giao: «Đầu chủ phát góc nhìn đang lọc ra ảnh, PDF hay Excel theo mẫu, kèm bài chép theo kênh; không cột nội bộ nào
ra ngoài». Vai: Đầu chủ, trưởng nhóm, trên máy tính (Tham chiếu §9: điện thoại không có Xuất bảng hàng). Khối đích
`dialog-5` — hộp thoại nhiều bước (vo-va-ia §2, chủ kho chốt 02/11). Đứng trên hàng 14 (bảng hàng, góc nhìn) và 31
(luật ẩn, cửa `phat_hang`).

## 1. Cái đã có, cái còn thiếu

| Có | Ở đâu |
| --- | --- |
| Cửa ra `phat_hang`, hai người nhận `khach_rieng` · `nhom_moi_gioi`, `banRaNgoai`, tập trường ra `TRUONG_RA` | `packages/core/src/redaction/` |
| Bộ kiểm rò rỉ bằng bản mồi (`canMoi`, `timRoRi`), rào «mỗi trang cửa ra có bài kiểm riêng» phủ `/exports` | `packages/core/src/redaction/` |
| Cách xem của bảng hàng (lọc, cột, sắp, nhóm) và căn đang tích — state trong `BangHang` | `apps/web/src/app/(app)/inventory/` |
| Nút «Xuất bảng hàng» trong menu Tạo (đầu chủ, trưởng nhóm, chỉ máy tính) trỏ `/exports/new` — hiện là trang chỗ giữ | `packages/core/src/navigation.ts`, `components/shell/menu-tao.tsx` |
| Mã số đo `sheet_publishes` mang «chưa có sự kiện» chờ hàng này | `packages/core/src/metrics/danh-sach.ts` |
| Bộ ghi `.xlsx` tự viết không thư viện (một sheet, zip không nén) | `packages/db/seed/xlsx.mjs` |

Thiếu: hộp thoại, mẫu bài, bộ dựng ảnh và PDF, nơi ghi «lần xuất», đường tính số đo. Không có thư viện PDF hay ảnh
trong kho. Bộ ghi `.xlsx` của dữ liệu mẫu được tự viết vì thêm thư viện là ngoài ranh giới hàng 5 — đó là ranh giới của
hàng ấy, không phải luật kho; hàng này thêm thư viện hay không là Hỏi-3.

## 2. Mở từ đâu

Hộp thoại mở TRÊN bảng hàng, đọc thẳng cách xem đang dùng — không chuyền bộ lọc qua URL hay kho tạm (Tham chiếu §8 luật
4: bộ lọc và căn đang chọn đi theo người sang Xuất bảng hàng; vo-va-ia: «lấy lựa chọn từ bảng hàng»).

- Thanh trên của bảng hàng (máy tính) có nút «Xuất bảng hàng». Có căn đang tích → xuất các căn ấy; không tích → xuất mọi
  căn đang hiện theo bộ lọc. Không căn nào → nút tắt kèm lời «Không có căn nào để xuất».
- Menu Tạo giữ địa chỉ `/exports/new`: trang ấy chuyển về `/inventory?phat-hang=1`, bảng hàng mở hộp thoại với cách xem
  mặc định của người (góc nhìn mặc định khi chưa đổi gì).
- Điện thoại: không có nút (§9).

## 3. Bốn bước của hộp thoại

1. **Mẫu** — năm thẻ: Bài Zalo · Bài Facebook · Excel · Ảnh · PDF. Mẫu dựng sẵn ở lõi; sàn tự chỉnh mẫu ở Cài đặt sàn
   (mục 50, hàng sau).
2. **Người nhận** — Nhóm môi giới (mặc định) · Khách riêng (Hỏi-1). Người nhận quyết trường được ra qua `banRaNgoai`.
3. **Xem trước** — đúng nội dung sẽ ra: bài chép (chữ), bảng (Excel/ảnh/PDF). Dòng «Cột không ra ngoài: …» liệt các cột
   của góc nhìn bị bỏ vì luật ẩn (chủ nhà, giá đáy, ghi chú nội bộ, trường riêng của sàn…).
4. **Chép bài / Tải file** — bài: «Chép bài» vào bộ nhớ tạm, người tự dán và bấm gửi (bất biến 3); file: tải về máy.
   Mỗi lần chép hay tải là một «lần xuất» ghi ở máy chủ (§5).

## 4. Dữ liệu ra

- Cột ra = cột đang hiện của góc nhìn, theo thứ tự góc nhìn, giao với tập trường luật ẩn cho người nhận; dòng sắp theo
  góc nhìn. Cột không có trường ra tương ứng (`closePrice`, `holder…`, trường riêng…) bị bỏ và liệt ở bước 3.
- Mọi đầu ra đi qua MỘT hàm của lõi: `phatHang(can: CanNoiBo[], mau, nguoiNhan, cot) → BanPhat` gọi `banRaNgoai` từng căn
  rồi dựng bài hay bảng từ bản đã ẩn. Trang web chuyển dòng bảng hàng sang `CanNoiBo` (trường không có thì rỗng) và chỉ
  vẽ `BanPhat` — không đọc trường nào khác (bất biến 4: ẩn ở lõi, không ẩn ở giao diện).
- Trường riêng của sàn không kèm ở bản đầu (Hỏi-2).
- Bài theo kênh (Hỏi-4): Zalo — một dòng một căn; Facebook — mỗi căn một khối, cách dòng, dòng đầu là tên sàn. Cả hai
  không biểu tượng cảm xúc, không định dạng đậm (Zalo, Facebook đều không nhận).
- Ảnh và PDF (Hỏi-3, theo khuyến nghị): dựng bảng thành ảnh bằng canvas của trình duyệt; PDF là các trang ảnh JPEG
  trong một tệp PDF tối giản tự viết — không thêm thư viện. Ảnh tối đa 30 căn (bằng `MAX_SHARE_LISTINGS`); bài tối đa 30 căn; quá thì bước 1
  khoá hai mẫu ấy kèm lời «Quá 30 căn — dùng Excel hay PDF». Excel, PDF không giới hạn.
- Excel (Hỏi-3, theo khuyến nghị): một sheet, dòng đầu là nhãn cột, giá đã định dạng như bảng hàng; bộ ghi chuyển từ
  `packages/db/seed/xlsx.mjs` sang lõi (chạy được trong trình duyệt: crc32 tự tính, không `node:zlib`); đọc lại để
  kiểm bằng bộ đọc độc lập `packages/db/seed/doc-xlsx.py` (thư viện chuẩn Python).

## 5. Lần xuất và số đo

- Bảng mới `exports` (migration 030): `company_id`, `user_id`, `format` (`post_zalo` · `post_facebook` · `xlsx` · `png` ·
  `pdf`), `recipient` (`khach_rieng` · `nhom_moi_gioi`), `listing_count`, `created_at`. Luật cách ly theo dòng, vai API
  chỉ `insert` và `select`, không sửa, không xoá. Không lưu nội dung đã xuất, không lưu danh sách căn (đủ cho số đo §11;
  thêm khi có hàng cần).
- API `POST /api/v1/exports` (trong sàn, cần phiên, vai đầu chủ hay trưởng nhóm) ghi một dòng. Không route nào ra ngoài
  sàn (luật đợt 39 không áp).
- Số đo `sheet_publishes` (luật đợt 35, cùng tên hằng hàng 52 đã khai): lõi đếm lần xuất trong kỳ; bỏ dòng «chưa có sự
  kiện» của mã ấy.
- Ghi hỏng (mất mạng) không chặn việc chép hay tải: người vẫn có bài, file; lần xuất ấy không được đếm và hộp thoại nói
  một dòng «Chưa ghi được lần xuất». Không xếp hàng đợi gửi lại ở bản đầu.

## 6. Lựa chọn máy đã quyết

| Lựa chọn | Căn cứ |
| --- | --- |
| Hộp thoại mở trên bảng hàng, không trang riêng | vo-va-ia §2 dòng Phát hàng (nay «Xuất bảng hàng»): «lấy lựa chọn từ bảng hàng»; Tham chiếu §8 luật 4 |
| Mẫu dựng sẵn ở lõi, sàn chỉnh ở hàng sau | Tham chiếu §7: con số và lựa chọn là mặc định dựng sẵn, sàn chỉnh ở Cài đặt sàn; ADR-0018 bảng mẫu riêng |
| Mọi đầu ra qua một hàm lõi gọi `banRaNgoai` | Tham chiếu §6 «Luật ẩn một chỗ cho mọi cửa ra»; bất biến 4 |
| Bảng `exports` riêng, chỉ thêm | Một lối: không bảng sự kiện nào hiện có mang lần xuất (`listing_events` là của một căn) |
| Không lưu nội dung đã xuất | Một lối: số đo §11 chỉ cần đếm; lưu nội dung là thêm một kho dữ liệu ra ngoài phải ẩn lại |

## 7. Câu chỉ người quyết (hợp đồng viết theo khuyến nghị)

| | Câu | Máy khuyên | Lối khác — giá |
| --- | --- | --- | --- |
| Hỏi-1 | Xuất bảng hàng cho chọn người nhận Khách riêng không, mặc định là ai? | Cho chọn, mặc định Nhóm môi giới — xuất hàng chủ yếu cho đội và sàn bạn; khách riêng thì ẩn mã căn như trang khách | Chỉ Nhóm môi giới — gọn hơn một bước, nhưng ai phát cho khách sẽ phải chép tay và dễ lộ mã căn |
| Hỏi-2 | Bản đầu có kèm trường riêng của sàn khi xuất không? | Không kèm; bật từng trường để hàng sau (Tham chiếu §7 «kèm khi xuất bảng hàng cho đội khác thì bật từng trường») | Kèm ngay — thêm một bước chọn trường và một nhánh luật ẩn mới, hàng to thêm khoảng một phần ba |
| Hỏi-3 | Excel, ảnh, PDF tự viết ở lõi không thêm thư viện (PDF là trang ảnh: chữ không chọn, không tìm được)? Thêm thư viện là được phép — kho không có luật cấm | Tự viết — đủ để gửi Zalo, in; không thêm phụ thuộc vào package-lock; ảnh tối đa 30 căn | Thêm thư viện (Excel, PDF có chữ thật) — PDF tìm được chữ, Excel đủ định dạng; giá: sửa package-lock.json, phụ thuộc lớn, phải nhúng phông tiếng Việt cho PDF |
| Hỏi-4 | Bài Zalo một dòng một căn, bài Facebook mỗi căn một khối có dòng đầu tên sàn, không biểu tượng cảm xúc? | Có — vừa khổ tin Zalo, Facebook không nhận định dạng đậm | Một kiểu bài chung cho mọi kênh — ít mẫu hơn, nhưng bài Facebook dài khó đọc |

## 8. Đối chiếu ngành (ADR-0022)

RESO không có đối tượng «xuất bảng hàng»; gần nhất là `ContactListings` (căn đã gửi cho liên hệ). Matrix và Flexmls có
xuất CSV/Excel theo mẫu xuất do người hay MLS định nghĩa, in báo cáo PDF theo mẫu; KW Command có tờ rơi, bài mạng xã hội
sinh từ căn. Quỹ hàng đi cùng hướng «mẫu chọn trong tập trường được phép», khác ở chỗ: không đăng thay người (bất biến 3),
và tập trường do luật ẩn ở lõi quyết, không do mẫu.

## 9. Đặc tả UX

<!-- ux-spec:start -->
- **Khuôn IA đã chọn + căn cứ:** hộp thoại nhiều bước (wizard) — khối đích `dialog-5` chủ kho chốt 02/11; luồng tuyến tính
  bốn bước, quay lại được, không lưu nháp.
- **Màn và trạng thái:**
  | Chỗ | Trạng thái |
  | --- | --- |
  | Nút «Xuất bảng hàng» trên thanh bảng hàng | sẵn sàng (n căn) · tắt (0 căn) |
  | Bước 1 Mẫu | năm thẻ · thẻ ảnh/bài khoá khi quá 30 căn |
  | Bước 2 Người nhận | hai lựa chọn, mặc định Nhóm môi giới |
  | Bước 3 Xem trước | đang dựng · xong · dòng «Cột không ra ngoài» · lỗi dựng (thử lại) |
  | Bước 4 | «Đã chép bài» · «Đã tải <tên tệp>» · «Chưa ghi được lần xuất» |
- **Thẻ việc:** đầu chủ đưa danh sách căn đang lọc ra nhóm môi giới hay khách bằng bài hay file, trong vài bấm.
- **Chữ:** nhãn lấy từ `CONTEXT.md` («Xuất bảng hàng», «Bảng hàng», «Đầu chủ»); tên tệp `bang-hang-<ngày>.<đuôi>`.
- **Khổ:** chỉ máy tính (≥ md); hộp thoại rộng theo khối, không tự đặt.
<!-- ux-spec:end -->
