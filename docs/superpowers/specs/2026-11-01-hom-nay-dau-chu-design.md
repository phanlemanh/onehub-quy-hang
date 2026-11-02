# Hôm nay của đầu chủ — thiết kế

Hàng 22 `hom-nay-dau-chu` (dãy G, D10 · phác thảo 1). Căn cứ: Tham chiếu §8 luật 18, 20, §10 (mở app vào Hôm nay, hàng
đợi của đầu chủ); `docs/architecture/so-diem-bien-thien.md` #4, #5, K8; ADR-0019 (màn đầu nhóm mới → trang ba lối),
ADR-0020 (bốn nấc lead), ADR-0021 (liên hệ, «Lên bảng» là dữ kiện). Ô cơ hội: Cổng Đáng build (Manh Phan 31/10). Đứng
trên 15 (bảng hàng), 17 (cột hồ sơ căn).

## 1. Vấn đề

Đầu chủ mở app vào `/today` nhưng chỉ thấy chỗ tạm. Việc của họ — nhận và gọi lead mới, gọi lại căn chưa xác nhận, gọi ép
giá, bổ sung thông tin — nằm rải trong bảng hàng (cột Xác nhận lọc &lt;14) và chưa có chỗ nào cho lead được giao: API chỉ trả
lead mình nhập, không trả lead giao cho mình; nút Nhận · Đã gọi · Trả lại có ở API mà không có màn.

## 2. Đối chiếu ngành (luật thường trực 01/11)

| Đối tượng ở Quỹ hàng | RESO DD 2.0 | Ngành môi giới | Ghi chú |
| --- | --- | --- | --- |
| Đầu chủ giữ căn | Property `ListAgentKey` / Member | Listing agent (KW: listing specialist) | Bảng `listing_agent_assignments`; API trả thêm `listAgentKey` |
| Căn đang bán | Property `StandardStatus` = Active | Active listing | Khớp |
| Mốc đổi giá | Property `PriceChangeTimestamp` | Price reduction | Trường mới của bản xem, tính từ sự kiện `price_changed` |
| Mốc đổi trạng thái | Property `StatusChangeTimestamp` | — | Tính từ `status_changed` |
| Xác nhận với chủ nhà | (không có) — gần `ModificationTimestamp` | KW «listing check-in» | Đặc trưng Việt Nam: `lastConfirmedAt` (đã có) |
| Lead giao cho tôi | Contacts `ContactType` = Seller, `OwnerMemberKey` | KW opportunity · seller lead | ADR-0021: lead gắn liên hệ |
| Gọi ép giá | (không có) | KW «price adjustment conversation» | Đặc trưng nghề; mốc tính là câu hỏi (Hỏi-1) |

Không lệch với `CONTEXT.md` ngoài chỗ «ép giá» chưa có định nghĩa mốc tính — đưa thành Hỏi-1.

### Sản phẩm cùng loại làm thế nào (luật S1 mở rộng 01/11)

| Sản phẩm | Hàng đợi là gì | Ai định nghĩa | Điều kiện | Ta khác ở đâu |
| --- | --- | --- | --- | --- |
| Follow Up Boss | **Smart List** — danh sách «gọi ai» tự cập nhật | Bộ mặc định cho tài khoản mới; người tự tạo; danh sách chung cho đội | Giai đoạn, thẻ, trường riêng, lần liên hệ / gọi cuối | Danh sách chồng nhau; ta giữ mỗi căn một nhóm (luật 18) |
| KW Command | **SmartView** — bộ lọc đã lưu, đặt làm mặc định | Mỗi người | Mọi trường liên hệ | Việc sinh từ SmartPlans (kịch bản) — ta chưa làm |
| Lofty | Danh sách dựng sẵn (Today's New Leads, Not Contacted…) + **Segment** tự ghép | Hãng (không sửa) + người dùng | Bộ lọc nhiều tầng, lối gõ câu (AI) | AI chấm ưu tiên — ta chưa làm (luật 14) |
| REDX | Danh sách gọi theo **nguồn** (hết hạn, chủ tự bán, …) + bộ quay số | Theo nguồn dữ liệu | Nguồn, trạng thái gọi | Ta lấy nguồn là lead đã nhập; nguồn ngoài chưa có |

**Chỗ ta đang viết chết mà họ để cấu hình:** danh sách nhóm, điều kiện từng nhóm, thứ tự, tên, bật/tắt, ngưỡng theo loại
hình. → Chủ kho chọn 01/11: **hàng đợi là dữ liệu của sàn** (§3.1). Ta giữ khác biệt có chủ đích: đối tượng là **căn**
(mỗi căn đúng một nhóm) chứ không phải người; không kịch bản tự gửi (bất biến 3), không AI đề xuất (luật 14).

## 3. Cách làm

### 3.1 Hàng đợi là dữ liệu của sàn (lõi thuần, `packages/core/src/today/`)

**Bộ máy.** Một **nhóm** là dữ liệu: `{ code, label, subject: "listing" | "lead", enabled, conditions[], actions[] }`; một **bộ nhóm**
là mảng có thứ tự. Căn đi qua bộ nhóm theo thứ tự, vào **nhóm bật đầu tiên** mà mọi điều kiện của nhóm đều đúng — nên
mỗi căn đúng một nhóm (luật 18) và thứ tự là thứ tự thắng. Lead đi riêng qua nhóm `doiTuong: "lead"`.

**Điều kiện — bộ từ vựng đóng** (không biểu thức tự do; khoá lạ thì định nghĩa hỏng):

| Điều kiện | Nghĩa | RESO |
| --- | --- | --- |
| `{ kind: "status_in", in: [...] }` | nấc của căn thuộc danh sách | `StandardStatus` |
| `{ kind: "days_since", anchor, days }` | đã quá `days` ngày kể từ mốc; `anchor` ∈ `price` (lần đổi giá gần nhất, chưa đổi thì lúc lên Đang bán) · `confirmed` · `active_since` · `price_or_confirmed` (lần muộn hơn của `price` và `confirmed`); mốc chưa có → tính là quá | `PriceChangeTimestamp`, `StatusChangeTimestamp` |
| `{ kind: "missing_info" }` | mức đủ chưa đủ | — |
| `{ kind: "changed_by_other", since: "yesterday" \| "today" }` | người khác mình đổi giá hay trạng thái từ 0 giờ hôm qua / hôm nay (giờ Việt Nam, UTC+7 cố định) | — |
| `{ kind: "property_sub_type_in", in: [...] }` | loại hình của căn trong danh mục thuộc danh sách — giá trị là mã RESO `PropertySubType` mà danh mục dùng (`Condominium`, `Townhouse`, …, tập đóng ở lõi); loại hình lấy qua ghép danh mục sẵn có của Bảng hàng (`ghep-danh-muc.ts`) trên máy; căn ngoài danh mục → sai | `PropertySubType` |
| `{ kind: "lead_stage_in", in: [...] }` | (nhóm lead) nấc của lead thuộc danh sách | — |

**Hành động một chạm — thực đơn đóng:** `owner_confirmed` (sự kiện `owner_confirmed`), `open_record` (cột hồ sơ căn), và cho lead
`accept`, `first_call`, `return`.

**Bộ mặc định** (`BO_NHOM_MAC_DINH` ở `packages/core/src/today/mac-dinh.ts`, comment «mặc định của sàn») — đúng năm nhóm
đã phác: Lead mới (`lead_stage_in` Đã gửi, Đã nhận) · Nên gọi ép giá (`status_in` Đang bán + `days_since doi-price_or_confirmed
10`, Hỏi-1) · Cần gọi lại (`days_since xac-nhan 14`) · Thiếu thông tin · Mới đổi (`changed_by_other hom-qua`). Mọi nhóm căn
ngầm thêm hai điều kiện không tắt được: căn mình giữ, nấc khác Đã bán và Ngừng bán. Nhóm lead ngầm thêm: lead giao cho
mình, chưa trả lại, chưa bỏ (trả lại và bỏ là nấc riêng của `leadStage`, ADR-0020, nên `lead_stage_in` Đã gửi · Đã nhận đã loại
chúng; điều kiện ngầm giữ chắc cả khi sàn ghi nấc khác).

**Mã và tên.** Mã nhóm, khoá điều kiện, hành động là tiếng Anh (luật «code, API tiếng Anh» của kho): nhóm mặc định
`new_lead` · `price_adjustment` · `call_back` · `missing_info` · `recent_change`; hành động `owner_confirmed`,
`open_record`, `accept`, `first_call`, `return`. **Tên nhóm (`label`) là dữ liệu của sàn** — nhãn mặc định tiếng Việt đặt ở
một chỗ có tên trong `packages/core/src/today/mac-dinh.ts` (Hỏi-5 chốt nhãn mặc định của `price_adjustment`); tên do sàn
đặt qua bộ kiểm chung của nhãn: ≤ 40 ký tự, qua bộ dò số điện thoại / email (ADR-0011), lớp `company_internal`. Đây là
đúng khuôn «Từ vựng của sàn» (ADR-0022 nguyên tắc, ADR-0023 thiết kế, hàng 90 dựng sổ từ vựng — giám sát xếp 01/11); khi
hàng 90 xong, nhãn mặc định dời vào sổ từ vựng.

**Sàn ghi đè** (ADR-0018): khoá `queue.groups` trong `company_settings` mang trọn bộ nhóm của sàn (bật/tắt, đổi tên, đổi
thứ tự, đổi ngưỡng, nhóm mới ghép từ điều kiện, nhóm theo loại hình). Vắng khoá → bộ mặc định, với ngưỡng đọc từ hai khoá
đã khai ở `so-diem-bien-thien.md` #4, #5 (giữ đường cũ). Khi đã có `queue.groups` thì hai khoá cũ hết tác dụng
(bộ của sàn là trọn bộ); khi bộ của sàn hỏng thì dùng bộ mặc định với ngưỡng từ hai khoá cũ nếu hợp lệ. Đọc bằng bộ kiểm
chặt: khoá lạ, điều kiện ngoài từ vựng, ngày ngoài khoảng (Hỏi-4), hành động ngoài thực đơn, loại hình ngoài tập mã, tên nhóm quá 40 ký tự hay chứa số điện thoại / email, hai
nhóm trùng mã, không nhóm lead, **lệch đối tượng** (nhóm căn mang `lead_stage_in` hay hành động lead; nhóm lead mang điều kiện
hay hành động của căn), nhóm căn đặt `status_in` chỉ gồm Đã bán / Ngừng bán (luôn rỗng) → **cả bộ của sàn bị bỏ, dùng bộ
mặc định**, lỗi gọi tên chỗ sai (không áp nửa bộ).

**Khoảng ngày (Hỏi-4).** Khuyên: giữ khoảng đã chốt cho hai nhóm mặc định — nhóm mã `price_adjustment` 7–14 (luật 18), `call_back`
7–30 (`so-diem-bien-thien.md` #4) — và 1–90 cho điều kiện `days_since` của nhóm sàn tự tạo. Lối khác: một khoảng 1–365 cho
mọi nhóm, sửa luật 18 trong cùng PR.

**Bộ nhóm trên máy.** Lần đọc bộ nhóm thành công được lưu trong kho trên máy theo sàn; mất mạng hay lỗi đọc thì màn chia
nhóm theo bộ đã lưu và nói «bộ nhóm lưu lúc <giờ>»; chưa từng đọc được thì dùng bộ mặc định và nói rõ «đang dùng bộ mặc
định — chưa tải được bộ nhóm của sàn». Màn sửa bộ nhóm là hàng 48; hàng này có lối ghi API cho quản trị sàn (kiểm cùng bộ kiểm,
sai → 400 nêu chỗ sai) như cấu hình chia lead.

### 3.2 API (`packages/api`)

- `GET /api/v1/listings` thêm vào bản xem: `listAgentKey` (người giữ, `null` khi chưa ai giữ), `priceChangeTimestamp`,
  `statusChangeTimestamp` (ISO, từ sự kiện; `null` khi chưa có) và hai bản ghi lần đổi cuối `lastPriceChange`,
  `lastStatusChange` = `{ at, byUserId, byRoles, from, to }` (giá cũ → mới, nấc cũ → mới; vai lấy từ `actorRoles` của sự
  kiện). Mới đổi xét riêng từng bản ghi, nên hai người đổi hai thứ thì mỗi lần đổi được xét. Không cột mới, không
  migration: tính khi đọc từ bảng sự kiện và bảng gán người giữ. Bộ đồng bộ kéo về giữ nguyên các trường ấy vào kho trên
  máy, lưới chặn nguồn vẫn chạy trên toàn thân.
- `GET /api/v1/leads/assigned` — lead giao cho mình đang ở hàng đợi Lead mới: toà, căn, nhu cầu, giá đọc thành câu, giờ
  nhập, nấc, hạn nhận và hạn gọi (từ cài đặt chia lead). Không có số chủ.
- `GET /api/v1/company/settings/queue` — bộ nhóm đang áp (`nguon: mac-dinh | san`, kèm lỗi nếu bộ của sàn hỏng);
  `PUT` cùng đường — quản trị sàn ghi bộ nhóm, kiểm bằng cùng bộ kiểm của lõi.

### 3.3 Màn `/today` cho vai Đầu chủ

- Trang theo vai: telesales giữ vùng Lead đã nhập (hàng 27); người có vai Đầu chủ thấy Hôm nay của đầu chủ; vai khác giữ
  chỗ tạm. Người vừa telesales vừa đầu chủ thấy cả hai, đầu chủ trước.
- Căn đọc từ kho trên máy (bộ đồng bộ, nhanh tức thì); lead và ngưỡng đọc qua API.
- Nhóm theo bộ nhóm đang áp của sàn (mặc định: Lead mới · Nên gọi ép giá · Cần gọi lại · Thiếu thông tin · Mới đổi), đúng
  tên và thứ tự sàn đặt, mỗi nhóm đếm số; nhóm rỗng hay tắt không hiện; nút của dòng theo hành động của nhóm. Mỗi dòng: mã căn (hay toà, căn của lead), lý do vào hàng đợi bằng chữ («Chưa xác nhận 16 ngày», «Giá giữ 12
  ngày», «Thiếu: pháp lý, tài chính», «Giá 3,10 → 2,95 tỷ — Trưởng nhóm, hôm qua»), giá kèm điều kiện phí.
- **Kết quả gọi một chạm** — dòng căn: «Còn · giữ giá» (sự kiện `owner_confirmed` ghi trên máy trước, căn rời hàng đợi
  ngay; không hoàn tác — như bảng hàng); «Đổi giá, trạng thái…» mở cột hồ sơ căn (hàng 17). Dòng lead: «Nhận» (khi chưa
  nhận), «Đã gọi», «Trả lại · Số không liên lạc được».
- Trống: «Hôm nay không còn việc» kèm một hành động (mở Bảng hàng). Đang tải: `Skeleton` đúng bố cục. Lỗi: thử lại. Trống,
  lỗi qua `TrangThai`.
- Khối, bố cục: theo lối được duyệt ở trang ba lối (§4).

### 3.4 Bản đồ khuôn

Nhóm mới `hom-nay-dau-chu` ở `design/patterns/` với khuôn của lối đã duyệt, màn mẫu `/today` (đăng nhập Đầu chủ), trạng
thái mặc định · trống · đang tải · lỗi. `today/page.tsx` rời ngoại lệ chỗ tạm của `trang-tam`; ngoại lệ của `lead-cua-toi`
sửa câu lý do (vai khác giờ là Hôm nay của đầu chủ).

## 4. Ba lối (ADR-0019 — màn đầu của nhóm mới)

Bản mẫu ở `/proto/hom-nay-dau-chu?loi=…` (chỉ máy dev, không lối vào), cùng bộ dữ liệu mẫu ca nhiều việc:

- **Trong kho** — khuôn `KhungLeadCuaToi` (`list-11` đã chuyển thể): Frame stacked, mỗi hàng đợi một khối danh sách.
- **ReUI** — `data-grid-grouping-1` (khối đích ở `vo-va-ia.md` §2): bảng nhóm theo hàng đợi, dòng gập được, nút làm ngay ở
  cuối dòng; thành phần `data-grid` đã cài.
- **Vẽ mới** — ghép `Tabs` (một tab một hàng đợi kèm số) + `Item` hai dòng + nút.

Trang `_acceptance/hom-nay-dau-chu/ba-loi/index.html` dựng bằng `doi-chieu.mjs --dung-ba-loi`, gửi kèm thẻ Cổng Phạm vi.

## 5. Ngoài phạm vi

- Mở số của lead cho đầu chủ (Hỏi-3) — API chưa có lối đọc số lead cho người được giao.
- «Chưa gọi được» (không nghe máy) — chưa có sự kiện; căn ở lại hàng đợi.
- Màn sửa bộ nhóm (hàng 48); nhóm riêng của từng người (góc nhìn cá nhân như SmartView); kịch bản nhiều bước (SmartPlans,
  Action Plans); AI chấm ưu tiên; điều kiện theo nguồn ngoài (REDX).
- Hàng đợi Xin dẫn xem (chờ điều kiện ở lộ trình), Hôm nay của đầu chủ trên điện thoại (hàng riêng, M1), màn sửa ngưỡng
  (hàng 48), đổi đầu chủ hàng loạt (hàng 89), vá đường lỗi hoàn tác (hàng 88).
- Tạo hàng từ lead (đã có API; màn ở hàng khác).

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: mở app → `/today` (Đầu chủ) → đọc nhóm đầu có việc → gọi chủ nhà ngoài app → bấm «Còn · giữ giá» (căn rời
  hàng đợi) hay mở hồ sơ để đổi giá, trạng thái (điểm ra: hàng đợi ngắn đi; hết việc thì trống).
- Biên: không căn nào mình giữ và không lead → trống; căn ở hai điều kiện → chỉ hiện ở nhóm thắng; người vừa telesales
  vừa đầu chủ → hai vùng.
- Lỗi & quay lại: tải lead lỗi hay mất mạng → nhóm Lead mới báo nguyên nhân, nút thử lại; căn vẫn đọc từ kho trên máy;
  Nhận / Đã gọi / Trả lại lỗi (409) → dòng báo nguyên nhân, dòng giữ nguyên.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Hôm nay (đầu chủ) | Cho biết giờ gọi ai, vì sao, và ghi kết quả một chạm | Mở app / cột hồ sơ căn, Bảng hàng |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-today-mac-dinh | Hôm nay | Năm nhóm có số, dòng có lý do bằng chữ, giá kèm phí, nút | Còn · giữ giá; mở hồ sơ; Nhận / Đã gọi / Trả lại |
| ST-today-trong | Hôm nay | «Hôm nay không còn việc» | Mở Bảng hàng |
| ST-today-dang-tai | Hôm nay | Skeleton đúng bố cục nhóm | Chờ |
| ST-today-loi | Hôm nay | Lỗi tải lead hay ngưỡng, nói nguyên nhân | Thử lại |
| ST-today-mat-mang | Hôm nay | Căn từ kho trên máy; nhóm Lead mới «cần mạng» | «Còn · giữ giá» vẫn ghi trên máy |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Bấm «Còn · giữ giá» thì dòng rời nhóm ngay, số nhóm giảm; không hoàn tác (như bảng hàng — sự kiện không đảo được).
- 1440 là khổ chính; 375 một cột, nút xuống dưới dòng.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| Lối được duyệt ở trang ba lối | dùng | ADR-0019: chủ sản phẩm chọn ở Cổng Phạm vi |
| `TrangThai`, `Skeleton`, `Badge`, `Button` | dùng | Thành phần nền đã cài |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: hàng đợi việc nhóm theo loại, mở chi tiết ở cột hồ sơ căn (hàng 17) — khuôn của khối đích `data-grid-grouping-1`
(§2); luồng hiển nhiên, không tra thêm.
<!-- UX-SPEC-TEMPLATE>>> -->
