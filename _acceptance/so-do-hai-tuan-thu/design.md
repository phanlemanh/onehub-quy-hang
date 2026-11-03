# Số đo hai tuần thử — thiết kế (hàng 52)

**Câu giao:** Số đo của hai tuần thử đọc được từ sự kiện của sàn thử: tỉ lệ xác nhận, mức đủ, mã tự điền, lead đến cuộc
gọi đầu, lần phát, lượt mở, thao tác theo thiết bị và vai, lần mất mạng trên điện thoại.
**Bật khi:** mỗi số đo ở Tham chiếu §11, trừ «số ngày Sheet cũ không được sửa», ra từ một truy vấn trên sự kiện, chạy trên
dữ liệu mẫu. **Vùng:** `packages/core/src/metrics/**` (dãy D). **Hạng:** T2. Ngưỡng không đặt ở hàng này (luật đợt 24).

## 1. Một câu

Một hàm thuần của lõi nhận sự kiện của hàng, dữ kiện của lead và danh mục của một kỳ đo, trả **bảng số đo §11**: mỗi dòng
§11 (trừ Sheet cũ) ra một hay nhiều số, hoặc ra «chưa có sự kiện» kèm tên sự kiện còn thiếu — không bao giờ ra số 0 thay
cho «chưa đo được».

## 2. Vì sao lõi thuần, không API, không màn

- Ranh giới hàng chỉ mở `packages/core/src/metrics/**`. Đường đọc sự kiện từ cơ sở dữ liệu và màn số liệu là hàng sau
  (hồ sơ `goi-ep-gia-dot-hai` §4: «đếm là việc của màn số liệu hàng sau»).
- «Truy vấn trên sự kiện» = một lần gấp sự kiện bằng luật đã có của lõi (`foldListing`, `completeness`, `freshness`,
  `nhomCuaCan`, `lookupUnit`, `leadStage`), không chép lại luật nào. Số đo vì thế không lệch với màn: căn «đã xác nhận»
  của số đo là căn mà Hôm nay không đưa vào «Cần gọi lại».
- Lõi không đọc đồng hồ: kỳ đo `[tu, den)` truyền vào (như `freshness`, `nhomCuaCan`).

## 3. Đầu vào

| Khoá | Là gì | Nguồn khi có đường đọc |
| --- | --- | --- |
| `tu`, `den` | ISO 8601 — kỳ đo nửa mở `[tu, den)` | người chạy |
| `hang[]` | `{ id, events: ListingEvent[] }` — dãy sự kiện đủ của từng hàng | `listing_events` |
| `lead[]` | `LeadStageFacts` + `id`, `createdAt`, `unitNumber` — kết quả kiểm trùng là cột `leads.outcome` (ghi một lần lúc nhập, mọi lead kể cả lead trùng đều thành dòng — migration 007) | cột của `leads` + `app.lead_board_dates` |
| `danhMuc` | `CatalogData` | danh mục của sàn |
| `soNgayXacNhan` | N của «xác nhận trong N ngày»; vắng = 14 (`CALL_BACK_AFTER_DAYS`, luật 18) | người đặt ngưỡng |
| `nguongDieuChinhGia` | ngưỡng ngày của nhóm «Nên gọi điều chỉnh giá»; vắng = 10 (`QUEUE_DEFAULT_DAYS`) | cài đặt sàn |

Không khoá nào mang thông tin chủ nhà (lớp `source`): sự kiện của hàng có khuôn chặt từ chối khoá chủ nhà, dữ kiện lead
không có cột số. Đầu ra chỉ có số đếm, tỉ lệ và thời lượng.

## 4. Bảng số đo

Mỗi dòng có `ma` (tiếng Anh, không đổi), `dongThamChieu` (chữ nguyên văn ô «Số đo» của §11) và `traLoi` (câu hỏi §11).
«Hàng mở» = `OPEN_STATUSES` của lõi (Chưa đủ, Đang bán, Đã cọc, Tạm giữ), tính tại `den` bằng gấp các sự kiện trước `den`.
Mọi tỉ lệ kèm bảng theo trạng thái để người đặt ngưỡng chọn mẫu số khác mà không phải đo lại.

| `ma` | Dòng §11 | Cách tính | Trạng thái |
| --- | --- | --- | --- |
| `confirmed_within_n_days` | Tỉ lệ căn xác nhận trong N ngày | hàng mở có `freshness(lastConfirmedAt, ngày của den)` đã xác nhận và `ageDays < N` / hàng mở | đo được |
| `top_completeness` | Tỉ lệ căn ở mức đủ cao nhất | hàng mở có `completeness().filled === total` / hàng mở | đo được |
| `unit_code_autofill` | Tỉ lệ mã căn tự điền được | mã căn gõ trong kỳ ở hai cửa (`created.unitNumber`, `unit_number_assigned`, mã căn của lead) tra `lookupUnit` không kèm toà — như ô nhận lead — ra `found` / mã đã gõ; «nhiều căn» là hụt (hàng 63 Hỏi-2, đã ký) | đo được |
| `inquiry_to_send` | Thời gian khách hỏi → gửi được căn | — | chưa có sự kiện: khách hỏi (hàng 86) và lần Gửi (hàng 34) |
| `lead_to_first_call` | Thời gian lead → cuộc gọi đầu | phút `firstCalledAt − createdAt` của lead nhập trong kỳ, không phải căn trùng, chưa bỏ (gồm cả lead chưa chia, lead đã trả lại); trung vị + dãy đã xếp; số chưa gọi tới `den` tách chưa chia · đã chia · đã trả lại | đo được |
| `lead_to_ready` | Số ngày lead → Sẵn sàng bán | ngày `boardAt − createdAt` (cùng tập lead); trung vị + dãy; số chưa lên bảng | đo được |
| `duplicate_leads_blocked` | Số lead trùng bị chặn | lead nhập trong kỳ có kết quả kiểm trùng khác `new`; tách «căn trùng» và «chủ trùng» | đo được |
| `price_adjustment_calls` | Số căn gọi điều chỉnh giá đợt hai | căn có `price_changed` hay `owner_confirmed` trong kỳ mà ngay trước sự kiện căn ở nhóm `price_adjustment` (bộ mặc định, `nhomCuaCan`, người giữ = người ghi) | đo được |
| `sheet_publishes` | Số lần phát bảng hàng | — | chưa có sự kiện: lần phát (hàng 43) |
| `customer_link_opens` | số link khách mở | — | chưa có sự kiện: lượt mở trang khách (hàng 35) |
| `customer_interest` | số lượt quan tâm | — | chưa có sự kiện: lượt quan tâm trên trang khách (hàng 35) |
| `actions_by_device_role` | Tỉ lệ thao tác trên máy tính / điện thoại theo vai | — | chưa có sự kiện: sự kiện có vai người làm nhưng không có thiết bị |
| `mobile_offline` | Số lần mất mạng và thao tác lúc mất mạng trên điện thoại | — | chưa có sự kiện: bộ đồng bộ trên máy biết lượt mất mạng nhưng không gửi về máy chủ |

Ba dòng §11 tách thành nhiều `ma` vì ô «Số đo» của §11 gộp nhiều số (dòng lead, dòng phát). Dòng «Số ngày Sheet cũ
không được sửa» ngoài phạm vi (câu bật của hàng).

### 4.1 Kiểu kết quả

```ts
type DongSoDo = { ma; dongThamChieu; traLoi } & (
  | { trangThai: "do-duoc"; kieu: "ti-le"; tu: number; mau: number; phanTram: number | null; theoTrangThai: Record<StandardStatus, { tu; mau }> }
  | { trangThai: "do-duoc"; kieu: "dem"; so: number; chiTiet: Record<string, number> }
  | { trangThai: "do-duoc"; kieu: "thoi-luong"; donVi: "phut" | "ngay"; n: number; trungVi: number | null; giaTri: number[]; chua: number; chiTiet: { chuaChia; daChia; traLai } }
  | { trangThai: "chua-co-su-kien"; thieu: string }
);
```

`phanTram` làm tròn một chữ số; mẫu 0 thì `null` (không chia cho 0, không giả 0%). Trung vị của dãy chẵn là trung bình hai
số giữa; dãy rỗng là `null`.

### 4.2 Số căn gọi điều chỉnh giá đợt hai

Theo đường đo của `goi-ep-gia-dot-hai`: căn có `price_changed` hay `owner_confirmed` ghi lúc căn ở nhóm «Nên gọi điều
chỉnh giá». Với mỗi sự kiện ấy trong kỳ: gấp các sự kiện trước nó ra trạng thái, dựng dữ kiện hàng đợi (`DuKienCan`: trạng
thái, `lastConfirmedAt`, mốc đổi giá cuối, lần đổi trạng thái cuối, phần thiếu), người giữ = người ghi, rồi
`nhomCuaCan(boMacDinh(nguong), …, occurredAt)`. Đếm căn (không đếm lần): một căn gọi ba lần là một căn.

## 5. Dữ liệu mẫu

Ca kiểm dùng bộ mẫu của hàng 5 (`packages/db/seed/mau/du-lieu-mau.json`, luật đợt 4) qua một bộ chuyển ở
`metrics/mau.fixture.ts`: mỗi hàng mẫu thành đúng chuỗi lệnh mà bộ nạp bản thật ghi (`nap-ban-that.ts`: tạo → giá →
Ngừng bán, hay chi tiết → Đang bán → Đã bán / trạng thái đích), lead mẫu thành dữ kiện lead với kết quả kiểm trùng tính bằng
`decideOutcome` của lõi. Mốc giờ cố định (bộ nạp dùng giờ lúc nạp). Ca biên thêm sự kiện lên hàng mẫu, không dựng bộ riêng.
Số chủ của lead mẫu chỉ dùng trong bộ chuyển để tính kết quả kiểm trùng, không vào đầu vào số đo.

Trên bộ mẫu, kỳ `[2026-11-03, 2026-11-17)`: 30 hàng mở; mức đủ cao nhất 0/30 (hàng mẫu có giá, pháp lý, người ở — thiếu
nội thất và tài chính); xác nhận trong 14 ngày 0/30 tại `den` (mọi lần xác nhận lúc nạp, đúng 14 ngày trước), 30/30 khi
`den` là ngày hôm sau; mã tự điền 47/47 (40 hàng, 7 lead); lead trùng bị chặn 2 (1 căn trùng, 1 chủ trùng); 11 lead cần gọi (10 chưa chia, 1 đã chia), chưa lead nào được gọi; đợt hai 0.

Bộ nạp ghi qua Postgres nên ca lõi không gọi được nó; một ca gác so thứ tự loại lệnh của bộ chuyển với các lời gọi `lenh`
trong `nap-ban-that.ts`. Giới hạn: bộ nạp đổi payload mà giữ loại và thứ tự lệnh thì ca gác không bắt.

## 6. Giới hạn đã biết (luật đợt 24)

Sáu số đo chưa có sự kiện: khách hỏi → gửi, lần phát bảng hàng, lượt mở link khách, lượt quan tâm, thiết bị của thao tác,
lần mất mạng trên điện thoại. Hàng này không thêm sự kiện; bảng số đo nói rõ thiếu gì. Câu SỐNG của ô cơ hội đọc
nguyên văn thì 6/13 chưa đạt — nhận đóng hàng với 7/13 là Hỏi-1 của sổ quyết định. Gửi một yêu cầu `can-nguoi` cho
chủ kho: hàng nào ghi sự kiện còn thiếu (34, 35, 43, 86 tự sinh sự kiện của mình; thiết bị và mất mạng chưa thuộc hàng nào).

## 7. Đối chiếu ngành (ADR-0022)

RESO Data Dictionary không có tài nguyên số đo vận hành; dùng tên RESO cho trường của hàng (`StandardStatus`,
`UnitNumber`). Lofty và kvCORE có bảng hoạt động môi giới đếm theo người và loại việc (chưa kiểm — trí nhớ, không tra lại
ở vòng này); số đo ở đây bám câu hỏi §11, không bám danh mục của sản phẩm nào.

## 8. Ngoài phạm vi

Đường đọc từ cơ sở dữ liệu, API, màn số liệu; ngưỡng; dòng Sheet cũ; thêm sự kiện mới; xuất báo cáo.

<!-- Đặc tả UX: bỏ — hàng không chạm giao diện (sổ quyết định). -->
