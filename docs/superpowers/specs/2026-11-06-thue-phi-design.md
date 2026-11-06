# Thuế phí của sàn — thiết kế (hàng 49, `thue-phi`)

Hàng 49 của lộ trình (dãy Q, đợt `dau-khach-nhap`), mã phạm vi P12; Cổng Đáng ký 05/11 (build). Gốc: luật 12 và 13 của
Tham chiếu §8 («So giá luôn quy về giá chủ nhận về tay»; «Mỗi giá bao phí mang kèm định nghĩa bao phí của sàn lúc tính;
đổi tỉ lệ chỉ áp cho lần tính mới»), sổ điểm biến thiên #8–#11 (`docs/architecture/so-diem-bien-thien.md`, cột màn = 49).

## Điều đã có — vòng này đứng trên

- Sổ điểm ở mã (`packages/core/src/config/so.ts`, hàng 81): `fee.inclusion` (tập con khác rỗng của ba khoản, mặc định cả
  ba), `fee.brokerage_pct` (0–5 %, mặc định 1), `fee.personal_income_tax_pct` (2–2), `fee.registration_fee_pct` (0,5–0,5).
- Lối chung `GET/PATCH /api/v1/company/settings` (hàng 82): đọc mọi điểm đã mở, đổi nguyên khối, vai theo `aiDoi`, mỗi khoá
  một sự kiện nhật ký (trigger migration 026). Bảng `company_settings` đã cách ly theo dòng (migration 011).
- Lõi giá (`packages/core/src/pricing/ve-tay.ts`, hàng 28): `tinhVeTay`, `giaBaoPhiTuVeTay`, tỉ lệ bằng phần vạn, mặc định
  `TI_LE_BAO_PHI_MAC_DINH` đọc từ sổ.
- Khuôn màn Cài đặt sàn (`design/patterns/cai-dat-san.md`) và màn mẫu gần nhất: «Luật chia lead» (hàng 48,
  `apps/web/src/app/(app)/settings/lead-routing/`) — `MucCaiDat khoi` + khối settings-3 đã chuyển thể, chân Hoàn lại · Lưu.
- Mục «Thuế phí» đã có trong cột Cài đặt (`settings/cai-dat.ts`, `MUC_SAN`) và đang trỏ trang tạm.

## Kiểm lại văn bản (sổ #10, #11 ghi «kiểm lại ở hàng 49»)

Tra 06/11/2026: thuế thu nhập cá nhân khi chuyển nhượng bất động sản của cá nhân cư trú là 2% trên giá chuyển nhượng
(Điều 14 Luật Thuế thu nhập cá nhân 2025, hiệu lực 01/7/2026 — không đổi so với Thông tư 111/2013); lệ phí trước bạ nhà,
đất là 0,5% (Điều 8 Nghị định 10/2022/NĐ-CP, sửa đổi bởi Nghị định 175/2025/NĐ-CP — không đổi mức). Hai số mặc định của
sổ đúng văn bản hiện hành. Lệ phí trước bạ tính trên giá tính lệ phí (bảng giá đất), không trên giá chuyển nhượng — lõi
hiện tính trên giá; giữ nguyên, ghi Later.

## Phương án

1. **Màn «Thuế phí»** ở `/settings/fees`, dựng như màn 48: `MucCaiDat khoi`, ba dòng khoản (Thuế thu nhập cá nhân · Lệ phí
   trước bạ · Môi giới), mỗi dòng có công tắc «Tính vào giá bao phí» (định nghĩa `fee.inclusion`) và tỉ lệ. Môi giới sửa được
   (0–5 %, bước 0,1); thuế và lệ phí hiện «2% · theo luật», «0,5% · theo luật», không có ô sửa (Hỏi-1). Nguồn từng dòng
   «Mặc định» hay «Đã đổi · <người> · <ngày>» như màn 48. Một câu dưới tiêu đề: «Áp cho giá ghi từ bây giờ — giá đã lưu giữ
   định nghĩa lúc tính». Lưu một lần qua lối chung, chỉ gửi khoá đã đổi; tắt cả ba khoản thì không lưu được, báo ngay dưới
   công tắc. Ví dụ sống dưới bảng: «Giá bao phí 3 tỷ → về tay …» tính bằng lõi với định nghĩa đang sửa.
2. **Dấu định nghĩa ở cơ sở dữ liệu** (migration 050): bảng `listing_price_fee_basis` — một dòng cho mỗi sự kiện
   `price_changed` có `feeInclusion = included`, khoá `(company_id, listing_id, seq)` trỏ sự kiện, cột `included_items
   text[]`, `rates jsonb` (ba khoản, phần vạn), `computed_at timestamptz` (= `occurred_at` của sự kiện — giờ máy chủ lúc ghi, kể cả sự kiện làm lúc mất mạng đẩy lên
   sau; định nghĩa là định nghĩa đang áp lúc giá vào máy chủ). Trigger AFTER
   INSERT trên `listing_events` ghi dòng từ `company_settings` của chính sàn (vắng khoá → mặc định sản phẩm viết trong
   hàm SQL). Vì đóng ở cơ sở dữ liệu nên mọi lối ghi giá — sửa trên ô, màn cuộc gọi, nhập file, đồng bộ trên máy, hoàn tác —
   đều mang dấu; không lối nào phải nhớ. Bảng bật luật theo dòng theo `app.current_company_id()`, vai API chỉ `select`;
   chỉ hàm của trigger (security definer, chủ bảng) ghi. Sự kiện giá cũ (trước hàng này) được điền một dòng mang mặc định
   sản phẩm và `computed_at = occurred_at` (Hỏi-3: khuyến nghị điền mặc định — «bao phí» gồm cả ba khoản đã chốt 29/10 và
   chưa sàn nào đổi được qua màn; lối khác: giá cũ mang dấu «trước 06/11, không ghi định nghĩa»). Phần trăm môi giới đầu
   chủ sửa trên máy tính cuộc gọi là một lần tính không lưu (hàng 28) và không vào dấu.
3. **Định nghĩa đang áp ở lõi** (`packages/core/src/fees/`): `dinhNghiaBaoPhi(cauHinh)` → `{ khoan: MaKhoan[]; tiLe }`
   từ cấu hình đã giải; `tinhVeTay` nhận thêm tập khoản — khoản ngoài định nghĩa không trừ. Hằng mặc định SQL và lõi so
   bằng một bài hai chiều.
4. **Đọc dấu**: lối `GET /api/v1/listings/{id}/fee-basis` (`packages/api/src/fees/`) trả dấu của giá hiện hành (sự kiện
   `price_changed` cuối), `null` khi giá không bao phí hay chưa có giá. Đọc qua luật theo dòng — ai không đọc được căn thì
   không đọc được dấu.
5. **Hiện cho người xem**: hồ sơ căn, dòng giá bao phí thêm một dòng nhỏ «Tính theo định nghĩa ngày dd/mm/yyyy: thuế
   TNCN 2% · trước bạ 0,5% · môi giới 1% — về tay X» — về tay tính bằng dấu, không bằng tỉ lệ hiện hành. Màn cuộc gọi: máy
   tính bao phí ↔ về tay và so giá toà đọc định nghĩa hiện hành của sàn (không còn hằng mặc định).

## Đối chiếu ngành (ADR-0022)

| Năng lực | RESO | Sản phẩm khác | Ta làm | Ta viết cứng — họ cho cấu hình |
|---|---|---|---|---|
| Giá niêm yết kèm điều kiện phí | `ListPrice` không mang điều kiện phí; điều kiện phí là đặc trưng Việt Nam, đặt tên riêng (`feeInclusion`) | Follow Up Boss, KW Command: hoa hồng theo giao dịch (deal), không có «giá bao phí» — **chưa kiểm** chi tiết cấu hình; sản phẩm Việt Nam (Meey CRM, Landsoft Agency) không công bố ([doi-chieu-nganh.md](../../product/doi-chieu-nganh.md) §Sản phẩm Việt Nam) | điều kiện phí trên mỗi giá (đã có), định nghĩa bao phí là dữ liệu của sàn | — |
| Tỉ lệ thuế và lệ phí | không có trường | **chưa kiểm** | đúng số luật, sàn không sửa | **Hỏi-1**: giữ cứng (lý do: nghĩa chuẩn theo luật) hay mở khoảng cho sàn |
| Danh sách khoản trong bao phí | không có trường | **chưa kiểm** | ba khoản của lõi, sàn bật/tắt từng khoản | **Hỏi-2**: ba khoản cố định (lý do: nghĩa chuẩn để quy về tay) hay sàn thêm khoản riêng (vd phí công chứng) |
| Phí môi giới | `BuyerAgencyCompensation` (bên mua, khác nghĩa) | Follow Up Boss, KW Command: phần trăm hoa hồng theo giao dịch — **chưa kiểm** | điểm của sàn 0–5 % | — |

## Đặc tả UX

<!-- ux-spec:begin -->
### Màn và luồng
- Cài đặt › Sàn [Tên] › Thuế phí (`/settings/fees`), máy tính; quản trị sàn. Vai khác bị chuyển về Cá nhân kèm câu báo
  «Mục này chỉ quản trị sàn mở được» (luật chặn mục sàn đã có).
- Hồ sơ căn (bảng có hồ sơ và toàn màn): dòng giá thêm một dòng phụ khi giá bao phí.
- Màn cuộc gọi khai thác: máy tính và so giá đổi nguồn tỉ lệ, không đổi bố cục.

### Khuôn IA đã chọn + căn cứ
- Khuôn `cai-dat-san` (bản đồ `design/patterns/cai-dat-san.md`), màn mẫu «Luật chia lead»: một cột dòng cài đặt, chân Hoàn
  lại · Lưu. Một khuôn khả dĩ duy nhất — không tra mẫu.

### Thẻ việc
- Việc: đặt tỉ lệ thuế phí và định nghĩa bao phí của sàn. Nhận việc của nhóm `cai-dat-san`: chỉnh một nhóm điểm cấu hình
  của sàn rồi lưu một lần.

### Trạng thái
| Trạng thái | Màn Thuế phí | Hồ sơ căn |
|---|---|---|
| Đang tải | khung xương của khối | như hiện có |
| Mặc định | ba dòng «Mặc định», cả ba khoản bật | dòng phụ ghi ngày tính |
| Đã đổi | dòng đổi mang «Đã đổi · người · ngày» | dòng phụ theo dấu |
| Lỗi tải | báo kèm «Thử lại» (như màn 48) | dòng phụ vắng, giá vẫn hiện |
| Lỗi lưu | lý do gắn vào dòng theo khoá | — |
| Không bao phí / chưa giá | — | không dòng phụ |

### Chữ trên màn
- Tiêu đề «Thuế phí»; mô tả «Tỉ lệ trừ khỏi giá bao phí và khoản nào tính là bao phí».
- Toast «Đã lưu · áp cho giá ghi từ bây giờ».
<!-- ux-spec:end -->

## Quét không gian (preset entity-feature)

Trục: **ca người** (quản trị sàn · vai khác · sàn khác) × **lối ghi giá** (sửa trên ô · màn cuộc gọi · nhập file · đồng bộ
trên máy · hoàn tác · giá cũ trước hàng) × **điều kiện giá** (bao phí · không bao phí · chưa giá) × **chỗ xem** (Cài đặt ·
hồ sơ căn · màn cuộc gọi · Bảng hàng · trang khách). Thước CE: luật 12, 13; sổ #8–#11; các lối ghi `price_changed` đang có.

- Core: màn đặt (AC-1, AC-2) · chặn vai (AC-3) · dấu ở mọi lối, cũ giữ nguyên (AC-4) · giá cũ được điền (AC-5) · sàn khác
  (AC-6) · hồ sơ căn hiện ngày tính (AC-7) · màn cuộc gọi đọc định nghĩa sàn (AC-8) · lõi theo tập khoản, mặc định khớp (AC-9).
- Later: Bảng hàng hiện ngày tính (vùng hàng 46) · so giá toà quy về tay bằng dấu của từng căn thay định nghĩa hiện hành ·
  giá chủ muốn của lead mang dấu · đầu chủ đặt môi giới riêng từng căn (`ghiDe` của #9) · ngưỡng hỏi lại khi đổi giá (#7,
  màn 49) — người đọc ở Bảng hàng thuộc vùng hàng 46 · lệ phí trước bạ trên bảng giá đất · hoàn tác giá sau khi đổi định
  nghĩa mang dấu mới (lần tính mới), không mang lại dấu cũ.
- Never: tỉ lệ hay định nghĩa ra trang khách (lớp `company_internal`; trang khách chỉ «đã / chưa gồm phí chuyển nhượng») ·
  sửa dấu đã đóng.
