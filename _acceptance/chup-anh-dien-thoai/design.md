# Chụp ảnh khi đi xem nhà trên điện thoại — thiết kế

Hàng 41 `chup-anh-dien-thoai` (dãy H, đợt `dau-khach-nhap`), T2. Ô cơ hội: `opportunity.md` (chủ kho «build» 05/11, ngưỡng
đề xuất: ảnh vào đúng ngăn của căn; mất mạng thì ảnh chờ và tự tải khi có mạng, không mất ảnh nào; ảnh sổ đỏ vào lớp nguồn,
không bao giờ ra trang khách). Nguồn: trang tri thức `wiki/dot/ban-dau-2910.md` mã P3, màn P1 (M5). Đứng trên hồ sơ căn
điện thoại `ho-so-dien-thoai-product-detail-5` (khối đích `product-detail-5`, dòng «Hồ sơ căn, điện thoại · M3 · 33, 40–41»
ở `docs/design/vo-va-ia.md` §2).

## 1. Cái đã có, cái còn thiếu

- **Mục Ảnh** (hàng 18, `apps/web/src/app/(app)/units/photos/`): ba thẻ Gửi được · Tự có từ mã · Nội bộ; kéo thả hay dán
  ảnh trên máy tính, «Chọn ảnh» mở ô tệp; `chuanBiTep` kiểm tệp bằng luật lõi, đọc ngày chụp, vẽ bản nhẹ; `nguonApi` gửi
  lên `/api/v1/units/photos` (bản Storage: xin link ký → PUT bản gốc → xác nhận bằng mã ảnh; bản Postgres: bản gốc trong
  thân). Che vùng (hàng 19). Quyền thêm ảnh và ẩn ngăn Nội bộ do API và luật theo dòng quyết (`suaDuoc`, `noiBo`).
- **Quyết định đang đúng chặn đường mất mạng**: «thêm ảnh cần mạng (Hỏi-5)» và «ngăn Nội bộ … không lưu trên máy» (Tham
  chiếu §12, 01/11); `guiLuot` bỏ cả lượt khi mất mạng. Ngưỡng của hàng này đòi ngược lại → **Hỏi-1**.
- **Hồ sơ điện thoại** (`units/ho-so/dien-thoai/`): ảnh lớn đầu màn (`anh-lon.tsx`) đọc danh sách một lần khi mở —
  Ngoài-3 của hồ sơ trước: tải ảnh xong khung lớn không tự cập nhật. Hàng này chạm đúng chỗ ấy.
- **Bộ đồng bộ** (`apps/web/src/lib/sync/`): hàng đợi thao tác JSON trên IndexedDB, nhịp thử mạng 15/30 giây
  (`taoNhip`, `mang.ts`), xoá kho khi đăng xuất hay máy bị báo mất (`may-bi-bao.ts`). Ảnh không đi qua bộ đồng bộ (luật
  khuôn KH-hs-anh-noi-bo) — hàng chờ ảnh là kho riêng, chỉ mượn nhịp thử mạng và chỗ xoá kho.
- **API ảnh**: chống trùng chỉ có ở bản Storage (mã ảnh máy chủ cấp, xác nhận lần hai trả 409). Bản Postgres tự sinh mã →
  gửi lại sau khi mất phản hồi sinh ảnh thứ hai. Thiếu: mã ảnh do máy khách tạo lúc chụp, nhận ở cả hai bản kho.
- **Thiếu**: nút chụp trên điện thoại, chọn ngăn trước khi chụp, hàng chờ ảnh giữ qua mất mạng và đóng app, tải ở nền, trạng
  thái từng ảnh, ảnh lớn cập nhật sau khi tải.

## 2. Luồng

Đầu chủ giữ căn (hay trưởng nhóm) đứng ở căn, mở hồ sơ căn trên điện thoại:

1. Ảnh lớn đầu màn có nút «Chụp ảnh» (chỉ khi API cho sửa ảnh của căn; căn chưa có mã thì không có).
2. Chạm → ngăn nổi từ đáy «Chụp ảnh · <mã>»: chọn ngăn **Gửi được** hay **Nội bộ** (sổ, hợp đồng, giấy tờ — chỉ
   người giữ căn và trưởng nhóm xem) → «Mở máy ảnh» mở máy ảnh của máy. Ngăn mặc định khi mở ngăn theo Hỏi-2 (máy khuyên:
   không mặc định, «Mở máy ảnh» chỉ bật sau khi chạm chọn).
3. Chụp xong, ảnh hiện ngay trong «Ảnh vừa chụp» với trạng thái; người chụp tiếp hay đóng ngăn đi việc khác — máy tải ở
   nền theo thứ tự chụp, kể cả khi đã rời hồ sơ.
4. Mất mạng: ảnh mang «Chờ mạng — tự tải khi có mạng», ngăn báo «Mất mạng»; nút «Chụp ảnh» mang số ảnh đang chờ. Có mạng lại
   (sự kiện mạng hoặc nhịp thử 15 giây) máy tự tải; đóng app rồi mở lại thì hàng chờ vẫn còn và tải tiếp.
5. Tải xong: «Đã tải lên»; ảnh lớn đầu hồ sơ và mục Ảnh đọc lại danh sách, có ảnh mới. Ảnh Nội bộ chờ trên máy xoá khỏi máy
   ngay khi máy chủ xác nhận.

## 3. Phạm vi mã

- Mới: `apps/web/src/app/(app)/units/photos/hang-cho-anh.ts` (hàng chờ thuần), `.../photos/kho-anh-cho.ts` (IndexedDB riêng
  của người, bước dựng), `.../units/ho-so/dien-thoai/chup-anh.tsx` (nút + ngăn chụp), bài kiểm cạnh mỗi tệp.
- Sửa: `.../units/ho-so/dien-thoai/anh-lon.tsx` (đọc lại khi có ảnh mới tải lên), `than-dien-thoai.tsx` (gắn nút);
  `.../units/photos/muc-anh.tsx` (đọc lại khi hàng chờ tải xong một ảnh của căn); `apps/web/src/lib/sync/may-bi-bao.ts` và
  chỗ đăng xuất (xoá kho ảnh chờ cùng kho đồng bộ); `packages/api/src/photos/{routes,store}.ts` (nhận mã ảnh của máy khách,
  không migration — `unit_photos.id` đã là khoá chính); `design/patterns/ho-so-can.md` (sửa luật KH-hs-anh-noi-bo theo
  Hỏi-1); `packages/ui-lint/tests/ban-do-khuon.test.mjs` (bảng viết trước của nhóm, luật đợt 51); `docs/product/tham-chieu.md`
  (§12, luật đợt 6).
- Ranh giới của hàng ở `hang-viec.json` còn ghi vùng cũ `apps/web/src/app/units/mobile/photos/**` — không tồn tại. Vùng thật
  ở trên xin `cham-tep` ở Cổng Phạm vi (luật đợt 5).
- Không chạm `packages/db/**`, `packages/core/src/data-classes.ts`, thoả thuận, `packages/connect` → T2. Ngăn Nội bộ vẫn là lớp
  `source` (`COMPARTMENT_CLASS` của lõi); ẩn ở lõi, API và luật theo dòng — màn chỉ trình điều API trả (bất biến 2, 4).

## 4. Lựa chọn máy đã quyết

Ghi ở `decisions.jsonl` (dòng S1):
- Nút trên ảnh lớn + ngăn nổi trong hồ sơ, không màn thứ hai; khuôn sẵn `ho-so-can`, ngăn nổi qua `NganNoi` (luật
  `no-direct-sheet`), danh sách ảnh chờ ghép theo ví dụ ReUI `c-progress-5` (Item + trạng thái) — thang dùng lại bậc 4.
- Quyền chụp = cờ `suaDuoc` của API ảnh (đầu chủ giữ căn, trưởng nhóm — Hỏi-4 hàng 18); ngăn Nội bộ chỉ khi API trả
  `noiBo: "thay"`.
- Tải đúng đường của mục Ảnh (`nguonApi`), không đường API mới.
- Chọn ngăn trước khi chụp; ngăn gắn vào ảnh lúc chụp, đổi ngăn sau không đổi ảnh đã chụp. Ngăn mặc định khi mở ngăn là Hỏi-2 (chỉ người).
- Mở máy ảnh của máy (`<input capture="environment">`), không tự dựng máy ảnh trong app.
- Ngày chụp: EXIF, vắng thì ngày lúc chụp trên máy — không phải ngày tải lên.
- Gửi lại không trùng: mã ảnh tạo lúc chụp, API nhận mã của máy khách ở cả hai bản kho; 409 thì đối chiếu danh sách.
- «Tải ở nền» = trong lúc app mở, ở mọi màn; đóng hẳn app thì dừng và mở lại tự tải tiếp (Safari iOS không có Background Sync).

Câu chỉ người có (lên thẻ Cổng Phạm vi): **Hỏi-1** — cho ảnh chụp lúc mất mạng chờ trên máy, kể cả ảnh Nội bộ (lùi một phần
Hỏi-5 hàng 18 và «Nội bộ không lưu trên máy»). Máy khuyên: cho chờ, ảnh Nội bộ nằm trong kho chờ riêng của người chụp, xoá
ngay khi máy chủ xác nhận, xoá khi đăng xuất hay máy bị báo mất, không vào kho đồng bộ.
**Hỏi-2** — ngăn mặc định khi mở ngăn chụp (Gửi được · không mặc định · Nội bộ · nhớ lần trước). Máy khuyên: không mặc
định — «Mở máy ảnh» chỉ bật sau khi người chạm chọn ngăn, để ảnh sổ không tự tải vào Gửi được vì quên chọn.

## 5. Đối chiếu ngành

- **RESO Data Dictionary — Media**: mỗi ảnh là một bản ghi `Media` gắn `ResourceRecordKey` (ở đây: toà + mã căn,
  `BuildingName` + `UnitNumber`), `MediaCategory` (Photo · Document…), `Order`, `PreferredPhotoYN`, `ImageOf`,
  `Permission` (công khai hay riêng), `MediaModificationTimestamp`. Quỹ hàng: ngăn Gửi được ≈ `MediaCategory = Photo` +
  `Permission` công khai, ngăn Nội bộ ≈ `MediaCategory = Document` + riêng (lớp `source`); thứ tự = `Order`, bìa =
  `PreferredPhotoYN`; ngày chụp là đặc trưng riêng (`takenAt`) cho nhãn «Ảnh thật · ngày». Hàng này không thêm trường RESO
  mới — chỉ thêm lối vào.
- **Sản phẩm**: (1) app di động của nền tảng môi giới lớn (KW Command, Zillow cho người đăng tin) cho thêm ảnh tin từ máy ảnh
  của máy ngay trong tin, ảnh vào bộ ảnh của đúng tin, chọn ảnh bìa sau — Quỹ hàng giữ cùng thứ tự (chụp → vào đúng căn →
  sắp sau ở mục Ảnh) và thêm bước chọn ngăn vì có ngăn giấy tờ riêng. (2) App nhắn tin và lưu ảnh (WhatsApp, Zalo, Google
  Photos) cho tin hay ảnh vào hàng chờ khi mất mạng, hiện dấu «đang chờ» trên từng mục và tự gửi khi có mạng, không bắt người
  gửi lại — Quỹ hàng dùng đúng khuôn trạng thái từng ảnh ấy. (3) App đăng tin Batdongsan.com.vn: chụp hay chọn ảnh khi đăng
  tin nhưng tải ngay, mất mạng thì báo lỗi — đây là chỗ Quỹ hàng làm hơn sàn điểm vì đầu chủ hay ở hầm, nhà chủ sóng yếu.

## 6. Đặc tả UX

<!-- ux-spec:start -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: hồ sơ căn điện thoại → «Chụp ảnh» trên ảnh lớn → chọn ngăn → «Mở máy ảnh» → chụp → ảnh vào «Ảnh vừa chụp», tải ở
  nền → «Đã tải lên», ảnh lớn có ảnh mới (điểm ra: đóng ngăn, hồ sơ).
- Biên: người không giữ căn (không nút) · căn chưa có mã (không nút; mục Ảnh nhắc gắn mã) · ngăn Nội bộ chỉ khi API cho ·
  tệp không phải ảnh hay quá 10 MB (không vào hàng chờ, báo tên tệp) · chụp nhiều ảnh liền · đóng app khi còn ảnh chờ.
- Lỗi & quay lại: mất mạng → ảnh «Chờ mạng», tự tải khi có mạng; máy chủ không nhận (hết quyền, căn đổi người giữ) →
  «Không tải được — thử lại» kèm «Thử lại»; hết phiên (401) → ảnh giữ chờ, tải tiếp khi chính người ấy đăng nhập lại (AC-4);
  đăng xuất chủ động hay máy bị báo mất → xoá hàng chờ (AC-6).

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Hồ sơ căn, điện thoại — ngăn «Chụp ảnh» | Chụp ảnh cho căn đang đứng và đưa vào đúng ngăn | Nút «Chụp ảnh» trên ảnh lớn / máy ảnh của máy, hồ sơ |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-chup-chon-ngan | Ngăn «Chụp ảnh» | Hai nút ngăn «Gửi được» · «Nội bộ» (ổ khoá), lời của ngăn đang chọn, «Mở máy ảnh» dính đáy (mặc định theo Hỏi-2) | chọn ngăn, mở máy ảnh |
| ST-chup-trong | Ngăn «Chụp ảnh» | «Chưa chụp ảnh nào cho căn này.» | mở máy ảnh |
| ST-chup-dang-tai | Ngăn «Chụp ảnh» | Bản nhẹ + ngăn + «Đang tải lên…» | chụp tiếp, đóng ngăn |
| ST-chup-cho-mang | Ngăn «Chụp ảnh» | Khối «Mất mạng — Ảnh chờ trên máy và tự tải lên khi có mạng»; mỗi ảnh «Chờ mạng — tự tải khi có mạng»; nút «Chụp ảnh» mang số ảnh chờ | chụp tiếp, đi việc khác |
| ST-chup-da-tai | Ngăn «Chụp ảnh» | «Đã tải lên»; ảnh lớn và mục Ảnh có ảnh mới | đóng ngăn |
| ST-chup-loi | Ngăn «Chụp ảnh» | «Không tải được — thử lại» + nút «Thử lại» | thử lại |
| ST-chup-tep-hong | Ngăn «Chụp ảnh» | Tên tệp + «Không phải ảnh» / «Ảnh quá 10 MB», không vào hàng chờ | chụp lại |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Chỉ có trên thân điện thoại (dưới 768 px, `chonThan`); máy tính giữ kéo thả, dán ở mục Ảnh.
- Ngăn gắn vào ảnh lúc chụp; ngăn mặc định mỗi lần mở ngăn theo Hỏi-2 (máy khuyên: chưa chọn ngăn nào, «Mở máy ảnh» mờ tới khi chạm chọn).
- Hết phiên (401): ảnh giữ «Chờ», tải tiếp khi chính người ấy đăng nhập lại; chỉ đăng xuất chủ động hay máy bị báo mất mới xoá hàng chờ.
- Thứ tự tải = thứ tự chụp; một ảnh lỗi không chặn ảnh sau; mất mạng thì dừng cả lô, giữ nguyên hàng chờ.
- Nút chạm từ 44 px («Mở máy ảnh» cao 44 px, kín bề ngang ở chân ngăn).

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `NganNoi` (sheet-9 đã chuyển thể) | dùng | Chỗ duy nhất mở ngăn từ đáy trên điện thoại (`no-direct-sheet`) |
| Ví dụ ReUI `c-progress-5` (Item + trạng thái) | ghép | Danh sách tệp tải lên kèm trạng thái — `item`, `badge` đã cài |
| `ToggleGroup`, `Button`, `Badge`, `TrangThai`, `Input` | dùng | Thành phần đã cài; báo mất mạng qua khuôn trạng thái |
| `AnhLon`, `KhungHoSoCan`, `chuanBiTep`, `nguonApi` | dùng | Khối và đường của hồ sơ, mục Ảnh sẵn có |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: một-cột-cuộn
Căn cứ: việc chụp là một chế độ trong hồ sơ một căn (Tham chiếu: «một căn một hồ sơ — … ảnh … là phần hay chế độ của hồ sơ,
không có trang thứ hai»); hồ sơ điện thoại đã là một cột cuộn, ngăn nổi từ đáy giữ người trong hồ sơ. Luồng hiển nhiên, không
tra thêm.

### 7. Thẻ việc

| Trường | Giá trị |
|---|---|
| Ai dùng | Đầu chủ giữ căn, trưởng nhóm |
| Việc chính | Đứng ở căn, chụp ảnh và đưa ảnh vào đúng ngăn của căn mà không phải chờ tải |
| Tần suất | mỗi ngày |
| Số bản ghi | một |
| Thiết bị | điện thoại |
<!-- ux-spec:end -->
