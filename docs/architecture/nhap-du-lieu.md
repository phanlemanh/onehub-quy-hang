# Nhập dữ liệu

> **Đã chốt 31/10** theo [ADR-0011](../adr/0011-nhap-du-lieu-tac-tu.md). Hàng lộ trình: đợt `nhap-du-lieu-3110`, hàng
> 64–71 ([bản phạm vi](../plan/pham-vi-nhap-du-lieu.md)).

Bản 31/10. Cửa vào thứ hai trong «Ba cửa vào, một đích» (Tham chiếu §3): đầu chủ hay quản trị sàn đưa bảng hàng cũ — file
Excel (xlsx, xls), csv, Google Sheets đã tải về — vào Quỹ hàng. Đây là lần đầu dữ liệu của một sàn chạm hệ thống: nhập
gọn thì bảng hàng sạch từ ngày đầu; nhập ẩu thì mọi màn sau gánh lỗi.

## 0. Một trang

- **Tác tử viết kế hoạch, mã thực thi.** Tác tử đọc hồ sơ cột, trả kế hoạch: ghép cột, từ điển giá trị, phép biến đổi
  chọn trong thực đơn đóng. Mã áp kế hoạch lên mọi dòng, kiểm, kiểm trùng; người xem trước rồi bấm ghi; ghi là lệnh API
  thành sự kiện.
- **Nguồn không rời công ty, kể cả sang nhà cung cấp AI.** Chủ nhà, số, giá đáy, tên người, chữ tự do không bao giờ có
  trong gói gửi đi; mã phân loại và che trước, máy chủ quét lại.
- **Không AI vẫn nhập được.** Bộ nhớ của sàn và từ điển dựng sẵn làm phần lớn việc từ lần thứ hai; tác tử lấp phần mới.
- **Đo trước khi dựng tác tử.** Bộ thử có đáp án đo chế độ tất định làm nền; tác tử phải vượt nền mới đáng tiền.

## 1. Ranh giới

| Việc | Ai làm | Vì sao |
| --- | --- | --- |
| Đọc file, tìm dòng tiêu đề (kể cả tiêu đề hai tầng, ô gộp), bỏ dòng trống và dòng tổng | Mã, trình duyệt | Tất định; file không rời máy người nhập |
| Phân loại cột: nguồn · tên người · chữ tự do · danh mục · hàng chia sẻ được · chưa rõ | Mã | Phải xong **trước** khi có gì gửi đi |
| Ghép cột chưa biết vào trường chuẩn (RESO-first, Tham chiếu §4, §7) | Tác tử, người duyệt | Tiêu đề viết đủ kiểu: «DT», «S thông thuỷ», «Diện tích (m²)» |
| Từ điển giá trị cột ít giá trị: `BP`, `bao sang tên`, `Đang GD`, `ĐN`, `2PN+1` | Tác tử, người duyệt | Mỗi sàn một cách gọi |
| Chọn phép biến đổi cho cột nhiều giá trị (giá, diện tích, mã căn, ngày) | Tác tử chọn trong thực đơn; mã chạy | Tác tử đoán đơn vị và kiểu, mã làm phép tính |
| Áp kế hoạch lên mọi dòng | Mã | Chạy lại ra cùng kết quả; không trả tiền theo dòng |
| Luật kiểm: giá kèm điều kiện phí (luật 7), mã có trong danh mục (hàng 9), trạng thái và bảng chuyển (ADR-0008), đổi giá quá 20% | Mã | Một bộ luật cho mọi cửa vào |
| Kiểm trùng trong file và với hàng đang mở (Tham chiếu §4, luật 20) | Mã, máy chủ | Đọc bảng hàng của sàn dưới luật theo dòng |
| Ô lạ còn lại sau thực đơn (≤ 300 ô một lần) | Tác tử đề xuất, người chọn | Chỉ ô thuộc lớp được mở; dấu «máy đề xuất» |
| Ghi | Lệnh API → sự kiện (ADR-0008) | Một đường ghi |
| Hoàn tác cả lần nhập, sổ chi phí, trần chi phí | Mã | Trách nhiệm, không phán đoán |

Tác tử không có công cụ ghi, không thấy dòng trọn vẹn, không đọc ghi chú. Mọi thứ nó trả là đề xuất có lý do, hiện trên
màn xem trước.

## 2. Luồng

```
Trình duyệt (luồng phụ)                              API /api/v1 (Vercel sin1)                 Claude API
─────────────────────────                            ─────────────────────────                 ──────────
file xlsx/xls/csv ──đọc──▶ lưới ô
                           │
                           ├─ tìm tiêu đề, bỏ dòng tổng
                           ├─ PHÂN LOẠI CỘT (mã) ──────────── cột nguồn / tên người / chữ tự do: chỉ hình dạng
                           ├─ áp bộ nhớ của sàn ◀──── GET mẫu file + từ điển giá trị (luật theo dòng)
                           │     mẫu khớp trọn? ──có──────────────────────────────▶ (bỏ qua tác tử)
                           ▼
                      HỒ SƠ CỘT (phần còn thiếu) ──POST /imports──▶ quét lại: số ĐT, email, giấy tờ
                                                                    ── trúng: dừng, ghi sự cố
                                                                    thoả thuận ai_processing đang bật?
                                                                    còn trần chi phí của sàn?
                                                                    ├──▶ tác tử lập kế hoạch ──▶ Opus 5.5
                                                                    │     công cụ chạy trên hồ sơ ◀──┘ (≤ 8 lượt)
                                                                    ├─ sổ chi phí
                      KẾ HOẠCH (đã kiểm khuôn) ◀────────────────────┘
                           │
                           ├─ ÁP KẾ HOẠCH lên mọi dòng (mã của packages/core)
                           ├─ luật kiểm ─── kiểm trùng ◀──── POST /imports/{id}/dedupe (mã căn → hàng đang mở)
                           ▼
                      XEM TRƯỚC: mỗi ô giữ nguyên · máy sửa · cần người · chặn
                           │ người sửa, chọn, bấm «Ghi N căn»
                           ▼
                      gói 200 dòng ──POST /imports/{id}/commit──▶ lệnh của lõi hàng (một đường ghi)
                                                                   + chủ nhà qua cửa chủ nhà (ADR-0010)
                                                                   sự kiện mang import_id
                      sửa của người ──────────────────────────────▶ ghi vào mẫu file + từ điển của sàn
```

File gốc không lên máy chủ. Thứ lên máy chủ: hồ sơ cột đã che (để gọi tác tử), mã căn (để kiểm trùng), rồi các dòng đã
chuẩn khi ghi — cùng đường mà ô nhận lead và sửa trên ô dùng.

## 3. Phân loại cột và hồ sơ cột

**Bộ phân loại** (`packages/core/src/import/classify.ts`, tất định, chạy cả trình duyệt lẫn máy chủ) gắn mỗi cột một lớp
tạm trước khi có ghép:

| Lớp tạm | Nhận ra bằng | Gửi tác tử |
| --- | --- | --- |
| Nguồn | Tiêu đề trong từ điển nguồn (`SĐT`, `Số ĐT chủ`, `Chủ nhà`, `Tên CN`, `Giá đáy`, `Giá chủ chốt`…) hoặc ≥ 30% ô trúng bộ dò số điện thoại Việt Nam (0 hoặc +84, chín chữ số, mọi kiểu ngăn) | Tiêu đề + hình dạng |
| Tên người | ≥ 50% ô có dáng họ tên tiếng Việt (2–5 chữ viết hoa đầu, không số) — gồm tên đầu chủ, nhân viên | Tiêu đề + hình dạng |
| Chữ tự do | Chữ dài trung bình > 25 ký tự hoặc tỉ lệ khác nhau cao mà không khớp kiểu nào | Tiêu đề + hình dạng |
| Danh mục | Tiêu đề hay giá trị khớp mã căn (cách đọc mã của dự án, hàng 9), toà, tầng, diện tích, phòng ngủ, hướng | Giá trị khác nhau, tối đa 300 |
| Hàng chia sẻ được | Giá, điều kiện phí, trạng thái, nội thất, pháp lý, tình trạng sử dụng | Giá trị khác nhau, tối đa 300 |
| Chưa rõ | Còn lại | Tiêu đề + hình dạng; tác tử xin giá trị qua công cụ, mã quyết |

Bộ dò chạy trên **mọi** cột, kể cả cột đã qua từ điển tiêu đề: cột «Ghi chú» có một ô «chủ [Tên] 0900 000 0xx» là đủ để
cả cột thành chữ tự do. Dò sai về phía che thì chỉ tốn một câu hỏi cho người; dò sai về phía gửi là sự cố — nên ngưỡng
đặt nghiêng về che.

**Hình dạng** của một cột che: số dòng, số ô trống, số giá trị khác nhau, độ dài, lớp ký tự («10 chữ số, 92% bắt đầu 09»,
«chữ, 3 từ, viết hoa đầu»). Không giá trị nào.

**Ví dụ thật — `mau-a.xlsx` (13 cột, 40 dòng)**: gửi giá trị của `Mã căn` (40), `Toà` (2), `DT` (6), `PN` (3), `Hướng`
(6), `Giá (tỷ)` (34), `Phí CN` (2: `BP`, `KBP`), `TT` (6, có `Đang GD`); chỉ hình dạng cho `Chủ nhà`, `SĐT chủ`,
`Đầu chủ`, `Ghi chú`; `Nhãn` một giá trị. Hồ sơ dạng JSON ~1.460 ký tự; `mau-b.xlsx` (16 cột) ~1.950 ký tự. Đo bằng
script ở phiên thiết kế, không gọi API.

## 4. Kế hoạch nhập và thực đơn phép biến đổi

Kế hoạch là dữ liệu, không phải mã. Khuôn viết tay ở lõi (cùng cách ADR-0008: khoá lạ bị từ chối):

```ts
interface ImportPlan {
  headerRow: number;                       // dòng tiêu đề (0-based), hay [n, n+1] khi hai tầng
  columns: Array<{
    column: string;                        // tiêu đề nguyên văn
    target: StandardField | `custom:${string}` | "keep_as_note" | "ignore_with_reason";
    transform?: Transform;                 // một phần tử của thực đơn, kèm tham số
    valueMap?: Record<string, string>;     // giá trị nguyên văn → giá trị chuẩn
    confidence: "high" | "medium" | "low"; // low → «cần người» trên màn
    reason: string;                        // một câu, hiện trên màn
  }>;
  questions: string[];                     // điều tác tử không tự quyết, đưa người
}
```

`ignore_with_reason` không được dùng cho cột có dữ liệu — luật 11 «không bỏ mất cột nào»: cột không ghép được thành ghi
chú nội bộ hoặc trường riêng (người chọn), không biến mất.

**Thực đơn** (`packages/core/src/import/transforms.ts`) — mỗi phép là hàm thuần có tham số, có test, trả giá trị chuẩn
hoặc lỗi có tên. Tác tử chỉ chọn phép và tham số; thêm phép mới là thêm mã có test, không phải sửa lời nhắc.

| Phép | Tham số | Lỗi thường gặp nó xử lý |
| --- | --- | --- |
| `price` | đơn vị (`ty`, `trieu`, `dong`, `auto`), dấu thập phân (`,` hay `.`) | «4,65» tỷ; «4.650» (nghìn hay thập phân — đoán theo độ lớn của cả cột, lệch thì hỏi); «4 tỷ 650»; «4650tr»; «4.65 BP» (tách điều kiện phí sang cột phí); «4.6–4.8» (dải → cần người); «TL», «thương lượng» (trống + cần người) |
| `fee_condition` | từ điển giá trị | `BP`, `KBP`, «bao sang tên», «chưa phí», «thu về 4.2» (giá về tay → cần người, luật 12) |
| `area` | loại (`thong_thuy`, `tim_tuong`, `unknown`) | «75m2», «75,0», «75 (TT)»; hai cột diện tích cùng lúc |
| `unit_code` | cách đọc mã của dự án (hàng 9) | «a1-03», «A 01 03», «A0103»; mã đọc được mà chưa có trong danh mục → «chưa có trong danh mục», không đoán |
| `floor` | — | «T12», «12A» (dự án bỏ tầng 13) |
| `bedrooms` | — | «2PN», «2N1WC», «2PN+1» (→ 2, ghi chú «+1») |
| `direction` | từ điển | «ĐN», «Đ-N», «TB»; hướng ban công khác hướng cửa |
| `status` | từ điển → sáu trạng thái chuẩn | «Đang GD», «cọc», «đã chốt» (Đã bán cần giá chốt → cần người) |
| `date` | định dạng (`dd/mm/yyyy`, `mm/dd/yyyy`, số ngày Excel) | «12/3» thiếu năm; ngày tháng lẫn chỗ (đoán theo cả cột: có ô > 12 ở vị trí nào); ngày trong tương lai |
| `phone` | — | Chạy trên trình duyệt, không qua tác tử: chuẩn 10 chữ số bắt đầu 0 như ADR-0010 |
| `text` | cắt khoảng trắng, chuẩn Unicode NFC | Dấu tiếng Việt tổ hợp và dựng sẵn lẫn nhau |

Bẩn ngoài ô, xử lý ở bước đọc: nhiều sheet (người chọn sheet; mặc định sheet nhiều dòng nhất), dòng tiêu đề không ở dòng
đầu, ô gộp, dòng tổng cuối bảng, cột ẩn, **màu ô và gạch ngang** (Sheet hay tô đỏ căn đã bán): bộ đọc trích màu nền và
gạch ngang thành một cột ảo «định dạng ô» để tác tử ghép như mọi cột (thư viện đọc phải đọc được kiểu ô — tiêu chí chọn
thư viện ở hàng dựng).

## 5. Tác tử lập kế hoạch

- **Mô hình**: `claude-opus-5-5`, `thinking: {type: "adaptive"}`, `output_config.effort: "medium"` (đo `low`, `high` ở
  bộ thử). Opus 5.5 không cho ép gọi công cụ (`tool_choice` `any`/`tool` trả 400): dùng `auto`, nói rõ trong lời nhắc,
  công cụ `strict: true`; kế hoạch cuối nộp qua công cụ `submit_plan` mà lõi kiểm lại bằng khuôn. Gọi qua SDK
  `@anthropic-ai/sdk` ở `packages/api` (gói mới — thêm ở hàng dựng, không ở phiên này), streaming để báo tiến độ.
  Mở `fallbacks: "default"` (máy tự chuyển mô hình khi một yêu cầu bị chặn nhầm) — theo mặc định khuyến nghị của
  Anthropic cho Opus 5.5.
- **Lời nhắc**: phần cố định đứng trước, có đệm (`cache_control`) — vai, từ điển trường chuẩn kèm nhãn Việt (CONTEXT.md,
  Tham chiếu §4), thực đơn phép biến đổi, khuôn kế hoạch, luật «không bỏ mất cột». Phần thay đổi đứng sau: hồ sơ cột,
  phần bộ nhớ đã khớp (để tác tử không ghép lại). Không giờ, không mã lần nhập trong phần cố định — đệm mới trúng.
- **Công cụ** (chạy trong hàm API, tất định, chỉ trên hồ sơ):

| Công cụ | Làm gì | Giới hạn do mã đặt |
| --- | --- | --- |
| `lookup_catalog` | Đọc mã căn mẫu bằng cách đọc mã của dự án, trả có / chưa có trong danh mục | Chỉ dự án sàn đang làm |
| `try_transform` | Áp một phép của thực đơn lên mọi giá trị khác nhau của một cột, trả số đọc được, ô lỗi | Chỉ cột có giá trị trong hồ sơ |
| `request_values` | Xin giá trị của một cột «chưa rõ» cho một trường đích | Mã cấp khi bộ dò không thấy dữ liệu cá nhân **và** trường đích thuộc lớp thoả thuận mở; còn lại trả «không cấp» |
| `submit_plan` | Nộp kế hoạch | Sai khuôn thì trả lỗi để sửa, tính một lượt |

- **Giới hạn**: tối đa 8 lượt, trần 240 giây (dưới 300 giây của Vercel Hobby). Chạm trần thì trả kế hoạch đến đâu dùng
  đến đó, cột còn lại về «cần người». Lỗi nhà cung cấp, hết trần chi phí, thoả thuận tắt → chế độ tất định.
- **Ô lạ còn lại**: sau khi áp kế hoạch, ô không đọc được của cột thuộc lớp được mở (≤ 300 ô) gửi một lần, mỗi ô kèm lý
  do mã từ chối; tác tử trả đề xuất cho từng ô, hiện là «máy đề xuất», người chọn. Đo ở bộ thử xem Haiku 5.5 có đủ cho việc
  này không.
- **So với một lần gọi**: bộ thử chạy cả hai — một lần gọi không công cụ (rẻ, nhanh) và vòng có công cụ (tự thử trên danh
  mục và thực đơn). Giữ bản rẻ hơn nếu đạt ngưỡng.

## 6. Xem trước, kiểm trùng, ghi, hoàn tác

- **Xem trước** (màn N2): lưới dữ liệu ReUI như Bảng hàng; mỗi ô một dấu — giữ nguyên · máy sửa (kèm «Hiểu là…» như luật
  7 và lý do) · cần người · chặn. Lọc theo dấu; «Chấp nhận mọi sửa của máy ở cột này» một chạm. Đầu trang nói đủ: «Ghi 37
  căn mới, cập nhật 2, bỏ 1 trùng; 4 ô cần bạn xem».
- **Kiểm trùng** (máy chủ, tất định): trong file — hai dòng cùng mã căn → gộp hay chọn một; với sàn — căn đã có hàng
  đang mở → theo luật 20, dòng thành **tin bổ sung** gửi đầu chủ giữ căn (vẫn cho «Bỏ dòng này», có ghi lại); chỉ khi
  người nhập chính là đầu chủ giữ căn thì dòng thành sự kiện cập nhật hàng đó. Chủ nhà cùng số → cùng một chủ nhà, theo
  luật đầu chủ giữ căn của ADR-0010.
- **Ai nhập, ai giữ căn, trạng thái từ file**: theo [ADR-0011](../adr/0011-nhap-du-lieu-tac-tu.md) quyết định 11 — hàng
  mới bắt đầu Chưa đủ để rao và đi theo bảng chuyển; dòng Đã bán, Ngừng của file cũ mặc định không nhập; cột «Đầu chủ»
  ghép với thành viên sàn trên trình duyệt khi trưởng nhóm nhập. Hàng của sàn mà người nhập không đọc được (hàng «Chỉ tôi» của người
  khác) trả «căn đã có hàng của người khác trong sàn», không lộ gì thêm.
- **Ghi**: gói 200 dòng, mỗi gói một giao dịch, mỗi dòng mang khoá `import_id + số dòng` nên gửi lại không nhân đôi. Mỗi
  dòng đi qua đúng lệnh của lõi hàng (`packages/api/src/listings/`) — không câu ghi nào khác vào bảng hàng, kiểm thử «một
  cửa» giữ. Chủ nhà đi qua cửa chủ nhà của ADR-0010; người nhập là đầu chủ thì giữ căn. Hàng mới vào «Chỉ tôi» (hàng 12),
  trạng thái theo file nhưng vào Đang bán vẫn phải qua điều kiện của ADR-0008 — thiếu thì về Chưa đủ để rao, ghi lý do.
- **Ngày xác nhận theo file** (luật 11): mọi sự kiện do lần nhập tạo mang `confirmedWithOwner: false` — nếu không, luật
  9 («sửa giá là xác nhận») sẽ đóng dấu mọi căn là vừa xác nhận hôm nay. Cột ngày của file thành một sự kiện
  `owner_confirmed` mang `confirmedAt` — không sau lúc ghi, không trước một mốc sàn đặt (mặc định 2 năm); khi gấp, độ tươi
  lấy `confirmedAt` nếu có. Không có cột ngày thì không tính là đã xác nhận.
- **Hoàn tác cả lần nhập**: hàng do lần nhập tạo nhận `voided` — cờ khi gấp, không phải trạng thái thứ bảy (ra khỏi bảng
  hàng, giữ lịch sử, gấp lại vẫn ra đúng); hàng có sẵn nhận sự kiện trả phần lần rao về giá trị trước lần nhập; đổi trạng
  thái mà bảng chuyển không có lối về thì không hoàn tác, liệt kê. Dòng đã có sự kiện không phải của lần nhập sau đó thì không hoàn
  tác, màn liệt kê. Hoàn tác là một sự kiện của lần nhập, ghi người, vai, lúc.

## 7. Chi phí

Giá Claude API (skill `claude-api`, bản đệm 06/10/2026): Opus 5.5 vào 4 USD, ra 20 USD, đọc đệm 0,20 USD mỗi triệu
token; Sonnet 5.5 2 / 10; Haiku 5.5 0,10 / 0,50. Ước bằng cỡ dữ liệu — **chưa đo token thật**:

| Lần nhập | Hồ sơ gửi | Vòng tác tử | Ô lạ | Ước tiền (Opus 5.5) |
| --- | --- | --- | --- | --- |
| Hai file mẫu (13–16 cột, 40 dòng) | ~1–2 nghìn token | 1–3 lượt | ~0 | ~0,05–0,15 USD |
| Bảng hàng thường (20 cột, 1–3 nghìn dòng), mẫu mới | ~8 nghìn | ~6 lượt, ~3 nghìn token ra mỗi lượt kể cả suy nghĩ | ~100 | ~0,4–0,6 USD |
| Bảng hàng bẩn (30 cột, 5 nghìn dòng), mẫu mới | ~30 nghìn (trần 300 giá trị/cột) | 8 lượt | 300 | ~1,0–1,3 USD |
| Nhập lại cùng mẫu | 0 (bộ nhớ khớp) đến vài trăm token (giá trị mới) | 0–1 | ít | ~0–0,05 USD |

Chi phí đi theo **số cột và số giá trị khác nhau**, không theo số dòng; phần lớn nằm ở token ra (suy nghĩ + kế hoạch) — đòn
bẩy là `effort` và số lượt, không phải cắt hồ sơ. Lối «tác tử đọc cả file» để so: 3.000 dòng × ~60 token ra mỗi dòng ≈ 180
nghìn token ra ≈ 3,6 USD chỉ phần ra.

**Trần**: sổ chi phí ghi token và tiền của từng lần gọi theo sàn, lần nhập, mô hình. Trần mặc định **10 USD/tháng/sàn**
(≈ 10–20 lần nhập mẫu mới), quản trị sàn chỉnh ở Cài đặt sàn; vượt thì chế độ tất định và báo. Trên nền tảng: trần chi tiêu
của không gian làm việc Anthropic dành riêng cho Quỹ hàng.

## 8. Mô hình dữ liệu

Mọi bảng mang `company_id`, bật và ép luật theo dòng, có ca trong bộ kiểm cách ly (bất biến 1). Tên chốt ở migration.

| Bảng | Giữ gì | Lớp | Ghi chú |
| --- | --- | --- | --- |
| `imports` | Một lần nhập: người, vai, tên file, băm file, sheet, kiểu file, mẫu đã dùng, kế hoạch (JSON), ai lập kế hoạch (bộ nhớ · mô hình nào · người), trạng thái `planned → committed → reverted`, đếm | `company_internal` | Kế hoạch chỉ chứa tiêu đề và giá trị của lớp được mở |
| `import_rows` | Số dòng → hành động (tạo · cập nhật · bỏ · trùng), `listing_id`, phiên bản hàng trước khi ghi | `company_internal` | Phục vụ hoàn tác và báo cáo; **không** giữ ô nguyên văn |
| `import_templates` | Dấu vân tay tiêu đề (danh sách tiêu đề đã chuẩn → băm), ghép cột, phép biến đổi, số lần dùng | `company_internal` | Hàng 21; màn S6 (hàng 50) sửa được |
| `company_value_aliases` | Trường chuẩn + giá trị nguyên văn → giá trị chuẩn, ai thêm, khi nào | `company_internal` | Dùng chung với cách gọi riêng (hàng 45); không nhận giá trị của trường lớp `source` |
| `ai_usage` | Mỗi lần gọi: lần nhập, mô hình, token vào / ra / đệm, tiền, thời gian, kết quả | `company_internal` | Sổ chỉ thêm; trần đọc từ đây |
| `listing_events` (đổi) | Thêm `import_id` (nullable), loại `voided`, `confirmedAt` trong sự kiện xác nhận | — | Đổi ADR-0008, migration mới |

Bản xem trước sống trong bộ nhớ trình duyệt, không lên máy chủ: đóng màn giữa chừng thì đọc lại file (bộ nhớ của sàn làm
lần thứ hai gần như tức thì, không gọi lại tác tử vì kế hoạch đã lưu ở `imports`).

## 9. Đo chất lượng

**Bộ thử** ở `packages/core/test/import/` (tên chốt ở hàng bộ thử), sinh tất định từ `du-lieu-mau.json` của hàng 5 — cùng
hạt giống ra cùng file, chỉ dữ liệu mẫu:

| File | Cấy gì |
| --- | --- |
| `mau-a.xlsx`, `mau-b.xlsx` (đã có) | Sạch; hai cách gọi |
| `ban-tieu-de` | Tiêu đề viết tắt lạ, tiêu đề hai tầng, ô gộp, dòng tiêu đề ở dòng 4, dòng tổng cuối |
| `ban-gia` | Giá đủ kiểu (§4), giá kèm phí trong một ô, dải giá, «TL», giá về tay |
| `ban-ma-can` | Mã căn viết đủ kiểu, mã chưa có trong danh mục, mã trùng trong file |
| `ban-ngay-trang-thai` | Ngày lẫn định dạng, số ngày Excel, thiếu năm; trạng thái chữ tự do; căn đã bán tô đỏ |
| `ban-nguon-giau` | Số chủ trong cột «Ghi chú», cột «Liên hệ» chứa số, tên chủ trong cột «Toà», số dạng +84 có dấu cách |
| `ban-csv` | Cùng dữ liệu, csv UTF-8 có BOM và csv Windows-1258 |

Mỗi lỗi cấy có nhãn đáp án (ô, giá trị đúng, hay «phải hỏi người»).

| Số đo | Cách tính | Ngưỡng đề xuất cho Cổng Đáng |
| --- | --- | --- |
| **Rò nguồn ra AI** | Số giá trị nguồn hay dữ liệu cá nhân trong mọi gói gửi đi (khách AI giả chặn gói trong test) | **0 — chặn**, kiểm bắt buộc mỗi PR chạm nhập |
| **Lỗi lọt** | Ô ghi sai mà không mang dấu «máy sửa» hay «cần người» / tổng ô ghi | ≤ 0,5% |
| **Độ đúng ghép cột** | Cột ghép đúng (kể cả «giữ làm ghi chú» đúng chỗ) / tổng cột | 100% trên hai file mẫu; ≥ 95% trên file bẩn |
| **Lỗi được sửa** | Lỗi cấy mà đầu ra sửa đúng hoặc đưa người đúng chỗ / tổng lỗi cấy | ≥ 80% |
| **Tỉ lệ hỏi người** | Ô «cần người» / tổng ô | ≤ 10% lần đầu; ≤ 2% lần nhập lại cùng mẫu |
| Chi phí, thời gian | Từ `ai_usage` | ≤ 1,5 USD và ≤ 120 giây một lần nhập mẫu mới |

Chạy hai chế độ trên cùng bộ: **tất định** (không AI — số nền) và **có tác tử** (mỗi mô hình, mỗi hình dạng ở §5). Tác tử
đáng dựng khi vượt nền ở «độ đúng ghép cột» và «tỉ lệ hỏi người» mà «lỗi lọt» không tăng. Chạy có tác tử tốn tiền (ước
< 2 USD một lượt cả bộ); bản chạy trong CI dùng khách AI giả trả kế hoạch ghi sẵn, chỉ kiểm khuôn và rò nguồn.

## 10. Google Sheets và định dạng file

- **Bản đầu**: xlsx, xls, csv tải lên từ máy. Google Sheets: màn hướng dẫn «Tệp → Tải xuống → Microsoft Excel». Không
  đọc link chia sẻ.
- **Sau** (hàng chờ điều kiện): Google Picker + `drive.file` — người chọn đúng một file, ứng dụng chỉ thấy file đó; đọc
  trên trình duyệt bằng mã truy cập ngắn hạn, file không qua máy chủ; nhớ mã file để «nhập lại» một chạm. Cần dự án
  Google Cloud, màn đồng ý OAuth, khoá Picker. Không dùng `spreadsheets.readonly` (nhạy cảm, mở mọi bảng tính).

## 11. An toàn và pháp lý

- **Gửi gì ra khỏi Quỹ hàng**: tiêu đề cột; giá trị khác nhau của cột lớp `catalog` và `shareable_listing`; hình dạng
  của mọi cột khác. Không file gốc, không dòng, không ô nguồn, không tên người, không ghi chú.
- **Nơi xử lý**: Anthropic, suy luận ở vùng toàn cầu hoặc Mỹ, lưu ở Mỹ, xoá trong 30 ngày theo chính sách thương mại; giữ
  tới 2 năm nếu bị gắn cờ an toàn; không dùng để huấn luyện. ZDR xin riêng.
- **Câu cho người pháp lý** (cùng đợt rà Kiến trúc §8, trước sàn đầu tiên ngoài đội):
  1. Hồ sơ cột như trên có còn là dữ liệu cá nhân theo Luật 91/2025/QH15 không (giá và mã căn của một căn cụ thể, khi
     tách khỏi tên và số chủ)?
  2. Nếu có: hồ sơ đánh giá tác động chuyển ra nước ngoài (Mỹ) — ai lập (sàn là bên kiểm soát, OneHub là bên xử lý), nộp
     khi nào.
  3. Điều khoản dịch vụ với sàn có cần khoản cho phép bên xử lý phụ (nhà cung cấp AI), và sàn tắt được không (có — thoả
     thuận `ai_processing`).
  4. Có cần xin Anthropic ZDR trước khi có dữ liệu thật.
- **Sự cố**: máy chủ chặn một gói vì dò thấy dữ liệu cá nhân → không gửi, ghi sự cố (không ghi giá trị), báo đội; bộ dò
  ở trình duyệt có lỗ thì sửa ở lõi, thêm ca vào bộ thử `ban-nguon-giau`.

## 12. Chuẩn hoá ở mọi cửa vào, không chỉ lúc nhập file

Câu của chủ kho 31/10: dữ liệu gõ tay hằng ngày cũng sai chính tả, viết tắt mỗi sàn một kiểu — chuẩn hoá có phải chỉ việc
của lần nhập? **Không.** Lần nhập file chỉ là cửa đổ nhiều nhất một lúc; ô nhận lead (hàng 24), sửa trên ô (15), sửa hàng
loạt (16), API cho công cụ của sàn đều đưa chữ tay vào mỗi ngày. Dọn sau thì tốn gấp nhiều lần và luôn chậm hơn chỗ bẩn
mới. Nên chuẩn hoá là **một lớp của lõi, mọi cửa vào gọi cùng một bộ**, và lần nhập là người dùng đầu tiên của nó.

**Mỗi loại trường một cách — phần lớn không cần AI:**

| Loại trường | Ví dụ | Cách chuẩn hoá | AI? |
| --- | --- | --- | --- |
| Lấy từ danh mục | Toà, tầng, diện tích, phòng ngủ, hướng | **Không cho gõ**: gõ mã căn là tự điền và khoá (hàng 9). Mã gõ kiểu nào cũng đọc được | Không |
| Tập đóng | Trạng thái, điều kiện phí, nội thất, pháp lý, tình trạng sử dụng | Chọn, không gõ chữ tự do. Gõ thì so với giá trị chuẩn + **từ điển của sàn** (cách gọi riêng, hàng 45): bỏ dấu, viết hoa, khoảng trắng, khoảng cách chữ nhỏ → «Ý bạn là "Đông Nam"?» | Không |
| Có cấu trúc | Giá, diện tích, ngày, số điện thoại | Bộ đọc của thực đơn §4 (cùng mã với lần nhập), luôn nói lại «Hiểu là…» (luật 7) | Không |
| Tên người (lớp nguồn) | Tên chủ nhà | Chỉ việc chắc: chuẩn Unicode, khoảng trắng, viết hoa đầu chữ; nhận ra cùng người bằng số điện thoại, không bằng tên | **Không bao giờ** |
| Chữ tự do | Ghi chú | Giữ nguyên văn. Tách nhãn từ ghi chú là «máy đọc chữ», đã cố ý để sau bản đầu; ghi chú hay chứa tên, số chủ nên đòi cùng lớp che như §3 | Sau, nếu đo thấy đáng |

**Vòng học của sàn** — bộ chuẩn hoá giỏi dần mà vẫn tất định:

1. Người gõ một giá trị lạ ở cửa nào cũng vậy → máy gợi giá trị chuẩn gần nhất; người chọn.
2. Lựa chọn ấy thành **đề xuất từ điển** của sàn (`company_value_aliases`, §8); quản trị sàn duyệt hàng loạt ở Cài đặt sàn
   (hoặc bật «tự nhận khi ba người cùng chọn»). Từ lần sau, giá trị đó chuẩn hoá thẳng, không hỏi.
3. **AI chỉ ở hai chỗ**: lập kế hoạch lần nhập (§5) và **dọn từ điển định kỳ** — gom các giá trị chưa khớp của tuần (chỉ
   lớp `catalog`, `shareable_listing`, đã qua bộ phân loại §3), đề xuất neo vào giá trị chuẩn kèm lý do; quản trị sàn duyệt.
   Việc này không ai ngồi chờ nên hợp Batch API (rẻ 50%); dữ liệu gửi không có gì cá nhân nên mức lưu 29 ngày của Batch
   không chạm bất biến.
4. **Sức khoẻ dữ liệu của sàn**: đếm giá trị nằm ngoài chuẩn theo trường; một chạm mở bảng hàng lọc đúng các căn ấy để sửa
   hàng loạt (hàng 16) — mỗi lần sửa là một sự kiện, hoàn tác được. Không có «dọn tự động» lặng lẽ: dữ liệu đã lưu chỉ đổi
   qua sự kiện có người.

**Giữa các sàn**: từ điển của sàn là cấu hình của sàn, ở lại trong sàn. Từ điển dựng sẵn của sản phẩm (`BP`, `KBP`, `ĐN`…)
do đội sản phẩm viết và mở rộng; học từ nhiều sàn chỉ khi có thoả thuận và chỉ ở dạng tổng hợp — quyết định riêng, sau.

## 13. Để cho người dựng

- Thư viện đọc file (SheetJS hay exceljs): chọn theo đọc được xls cũ, csv nhiều mã hoá, màu ô và gạch ngang, chạy trong
  luồng phụ, giấy phép.
- Ngưỡng của bộ phân loại (30%, 50%, 25 ký tự): đặt bằng bộ thử, ghi vào test.
- Câu chữ của màn N1, N2 theo canvas phác thảo và luật giao diện; khối ReUI theo `docs/design/vo-va-ia.md`.
- Lời nhắc của tác tử: viết ở hàng tác tử, đo bằng bộ thử; không có ví dụ nào chứa dữ liệu thật.
