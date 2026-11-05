# Thiết kế — hàng 68: tác tử lập kế hoạch nhập («Xử lý bằng AI»)

Ngày 2026-11-05 · dãy G · hạng T3 · căn cứ: ADR-0011 quyết định 1–7, 10, 11; Kiến trúc «Nhập dữ liệu» §3–§9, §11;
ô cơ hội `_acceptance/nhap-tac-tu-ke-hoach/opportunity.md` (Cổng Đáng «build», Manh Phan 05/11).

## 1. Số nền trên file mẫu lạ — có gác hàng không

Bộ thử hàng 64 dựng từ chính các cách gọi mà từ điển tiêu đề đã biết, nên số nền của nó (ghép cột 98/99) không nói gì về
mẫu file máy chưa thấy. Hàng này dựng **bộ file mẫu lạ** (`thu/bo-la.ts`): bốn file từ hai file mẫu hàng 5, giữ nguyên dữ
liệu và đáp án, chỉ thay dòng tiêu đề bằng cách gọi khác — đồng nghĩa tiếng Việt, tiếng Anh, viết tắt. «Lạ» do máy định
nghĩa: **mọi tiêu đề nằm ngoài từ điển dựng sẵn** (`lookupHeader` trả null — lệnh ghi số tự kiểm).

| File | Ghép cột | Lỗi lọt | Hỏi người (ô) | Cột để người ghép tay | Rò nguồn |
| --- | --- | --- | --- | --- | --- |
| la-a-dong-nghia | 6/13 | 40/520 | 0 | 8/13 | 0 |
| la-a-tieng-anh | 6/13 | 40/520 | 0 | 8/13 | 0 |
| la-b-viet-tat | 7/16 | 0/600 | 0 | 10/16 | 0 |
| la-b-dong-nghia | 7/16 | 0/600 | 0 | 10/16 | 0 |
| **Cộng** | **26/58 = 44,8%** | **80/2240 = 3,6%** | 0 | **36/58** | 0 |

Số nền của chính bộ thử hàng 64 (`_acceptance/nhap-loi-tat-dinh/so-nen.json`), cùng ngưỡng:

| Bộ | Ghép cột (≥ 95%) | Lỗi được sửa (≥ 80%) | Lỗi lọt (≤ 0,5%) | Hỏi người (≤ 10%) | Rò nguồn (0) |
| --- | --- | --- | --- | --- | --- |
| Bộ thử hàng 64 (9 file) | 98/99 = 99,0% · riêng `ban-tieu-de` 11/12 = 91,7% | 116/116 = 100% | 0/3799 = 0% | 41/3960 = 1,0% | 0 |
| Bộ lạ của hàng này (4 file) | 26/58 = 44,8% | — (không cấy lỗi ô) | 80/2240 = 3,6% | 0 | 0 |

**Hai bộ nói khác nhau, và chọn bộ nào là câu của chủ kho (Hỏi-3).** Ô cơ hội đã ký ghi luật gác theo «nền 64»; tính
cộng cả bộ, nền 64 đạt mọi ngưỡng (chỉ một file `ban-tieu-de` hụt ghép cột khi tính riêng) — theo chữ ấy thì gác. Nhưng bộ
64 dựng từ chính các cách gọi mà từ điển đã biết, còn câu giao của hàng là **file mẫu lạ**; trên bộ lạ nền hụt hai ngưỡng
(ADR-0011 qđ 7: «nền hụt ngưỡng nào thì tác tử phải đưa đúng ngưỡng đó qua mà lỗi lọt không tăng»). Máy khuyên đo trên
bộ lạ, không gác; lối khác là gác hàng theo đúng chữ ô cơ hội. Máy đúng nhờ bộ dò
theo giá trị (mã căn, số điện thoại, trạng thái, phí, hướng); mọi cột còn lại về «Giữ làm ghi chú», độ tin thấp. «Hỏi
người» bằng 0 vì cột không ghép được không thành ô cần người mà thành ghi chú — phần việc tay nằm ở cột «để người ghép
tay» (62%). Lỗi lọt 40 ô ở hai file mẫu A là cột chủ nhà rơi vào ghi chú nội bộ. Số ghi ở `so-nen-la.json`.

## 2. Phạm vi một câu

Sàn đã bật «Xử lý bằng AI»: Đầu chủ thả file, máy ghép như cũ (mẫu đã nhớ → từ điển → bộ dò); **chỉ các cột còn chưa
ghép** được gửi — dưới dạng hồ sơ cột đã che — tới Claude qua API của Quỹ hàng; Claude trả đề xuất ghép kèm lý do; máy chủ
kiểm đề xuất, màn hiện mỗi đề xuất là «Máy đề xuất» kèm lý do, người duyệt rồi mới sang Xem trước. Tắt, hết trần, thiếu
khoá, nhà cung cấp lỗi → nhập như không có AI.

## 3. Đường đi của dữ liệu

```
trình duyệt                                         máy chủ (/api/v1/imports/ai/plan)              Anthropic
đọc file → bảng → phân loại → hồ sơ cột → kế hoạch nền
   └ cột chưa ghép? ─ không → như cũ
        └ có → gói đề xuất (core: dungGoiDeXuat) ──► kiểm khuôn chặt · vai nhập · thoả thuận ai_processing
                                                      · trần tháng · khoá API · quét lại dữ liệu cá nhân
                                                      ─ chặn → ghi ai_usage (không giá trị), trả «tất định»
                                                      ─ qua → một lần gọi ─────────────────────────► claude-opus-5-5
                                                      ◄─ đề xuất (khuôn đầu ra) ◄────────────────────
                                                      kiểm đề xuất (core: kiemDeXuat) · ghi ai_usage
   ◄─ { cheDo: "ai", deXuat[] } hay { cheDo: "tat-dinh", lyDo } ◄─
gộp đề xuất vào kế hoạch (core: gopDeXuat) → người duyệt → Xem trước → ghi (đường ghi hàng 65, không đổi)
```

**Gói đề xuất** (`packages/core/src/import/ai/goi.ts`, dựng trên trình duyệt, máy chủ dựng lại khuôn và quét lại):
- Mọi cột: chỉ số cột, tiêu đề, lớp tạm, hình dạng (`ColumnShape` — không giá trị nào).
- Cột đã ghép (mẫu, từ điển, bộ dò): thêm đích đã ghép — để Claude không ghép trùng; không giá trị.
- Cột chưa ghép thuộc lớp `catalog` hay `shareable_listing`: thêm các giá trị khác nhau đã qua bộ che của hồ sơ (≤ 300).
- Cột chưa ghép lớp `source`, `person_name`, `free_text`, `unknown`: chỉ tiêu đề và hình dạng (mặc định che, ADR qđ 2).

**Máy chủ quét lại** (chặn hai lần): mọi chuỗi trong gói qua đúng các bộ dò mà hồ sơ dùng để che — tiêu đề qua
`detectPersonal` (số điện thoại Việt Nam, email, số giấy tờ); giá trị qua `detectPersonal` và `looksLikePersonName`. Dáng
họ tên KHÔNG quét ở tiêu đề: tiêu đề viết hoa đầu («Unit Code», «Khối Tháp») trùng dáng họ tên, quét thì mọi gói của file
lạ bị chặn và tác tử không bao giờ chạy; tên người trong tiêu đề là việc của từ điển và bộ phân loại. Trúng một chuỗi là không
gửi, ghi một dòng `ai_usage` kết quả `blocked_pii` kèm loại trúng (không chuỗi nào), trả chế độ tất định. Giá trị gắn cho
cột không phải `catalog`/`shareable_listing` → 400 (khuôn), không gọi.

**Thoả thuận** `ai_processing` (Xử lý bằng AI): thêm vào `CONNECTION_KINDS` và ràng buộc `kind` của bảng `agreements`
(migration 035). Chiều ra, bên kia `anthropic`, chỉ `catalog` và `shareable_listing`. Mỗi cột mang giá trị đi qua
`mayFlow(thoả thuận, lớp, {kind: "ai_processing", direction: "outbound"})`; `source` bị chặn ở lõi và ở ràng buộc
`agreements_never_source` có sẵn. Không có hàng thoả thuận đang hiệu lực = tắt (mặc định mọi sàn).

**Gọi Claude** (`packages/api/src/imports/ai/claude.ts`): `fetch` tới Messages API (không thêm gói SDK — `package-lock.json`
ngoài ranh giới), `claude-opus-5-5` (ADR qđ 3), một lần gọi, đầu ra theo khuôn JSON (structured outputs), lời nhắc cố
định có đệm, trần 240 giây (ADR qđ 4). Khoá `ANTHROPIC_API_KEY` từ môi trường; vắng khoá = «AI chưa sẵn sàng», tất định.
Khách gọi tiêm được qua `deps` của `createApi` — CI và mọi test dùng khách giả, không gọi mạng.

**Kiểm đề xuất** (`packages/core/src/import/ai/kiem.ts`): khuôn chặt (khoá lạ bị từ chối); chỉ nhận đề xuất cho cột đã gửi
là chưa ghép; đích thuộc trường chuẩn hay «Giữ làm ghi chú»; `valueMap` chỉ cho cột đã gửi giá trị và chỉ với khoá là giá
trị đã gửi; phép biến đổi thuộc thực đơn đóng; lý do không rỗng; trùng đích với cột đã ghép hay với đề xuất khác → hạ về
«Giữ làm ghi chú», độ tin thấp, kèm câu hỏi. Sai ở một cột chỉ bỏ cột ấy, không bỏ cả đề xuất. Kết quả gộp vào kế hoạch
bằng `gopDeXuat`, lý do mang tiền tố hằng «Máy đề xuất» (cùng nếp «theo mẫu» của hàng 67), rồi qua `validatePlan` như mọi
kế hoạch.

**Trần chi phí**: bảng `ai_usage` (migration 035; luật theo dòng; chỉ thêm) — mỗi lần gọi một dòng: người, mô hình, token
vào / ra / đọc đệm, tiền (USD), thời gian, kết quả (`ok`, `blocked_pii`, `provider_error`, `timeout`, `invalid_output`).
Trước khi gọi: tổng tiền tháng (giờ Việt Nam) ≥ `ai.monthly_budget_usd` (sổ cấu hình mục 24, mặc định 10) → không gọi, báo
«Hết trần AI tháng này». Một lần gọi có thể vượt trần tối đa một lần gọi (≤ ~1,3 USD theo §7) — chấp nhận, ghi vào giới hạn.

**Ai được gì**: gọi đề xuất — Đầu chủ, Trưởng nhóm (cùng vai được nhập, ADR qđ 11); bật / tắt và xem đã dùng — Quản trị sàn.

**Nhập lại cùng mẫu**: đề xuất người đã duyệt là ghép của kế hoạch; ghi xong thì luồng nhớ mẫu của hàng 67 nhớ nó như mọi
ghép khác → lần sau cùng mẫu mọi cột khớp mẫu, không còn cột chưa ghép, không gọi AI (ADR qđ 6).

## 4. Đo

`thu/do-tac-tu.ts` chạy trên bộ lạ và bộ thử hàng 64: dựng gói như trình duyệt, cho gói qua `quetGoi` của máy chủ (gói
bị chặn là đỏ — đường thật sẽ không gọi Claude), nạp **đề xuất ghi sẵn** cho đúng gói ấy (băm gói khớp, không thì đỏ «gói
đổi — ghi lại đề xuất»), qua `kiemDeXuat` + `gopDeXuat` + `applyPlan`, coi người chấp nhận mọi đề xuất (ca xấu nhất cho lỗi
lọt), tính bốn số đo bằng `do.ts` của hàng 64. Có `ANTHROPIC_API_KEY` thì `--that` gọi API thật và ghi đề xuất, tiền, thời
gian. CI và bộ kiểm rò dùng khách giả.

**Đề xuất ghi sẵn không do người dựng tính năng viết** (bên làm khác bên chấm): `thu/lap-de-xuat.ts` in cho từng file đúng
hai thứ mà máy chủ sẽ gửi — lời nhắc cố định (hằng trong `claude.ts`) và JSON gói — rồi một tác tử **context sạch** (không
đọc kho, không thấy đáp án hay tiêu đề gốc) nhận đúng hai thứ ấy và trả JSON theo khuôn đầu ra; tệp đề xuất ghi băm lời
nhắc, băm gói và câu «lập bởi tác tử context sạch, ngày …». E1 so băm lời nhắc với hằng trong mã. Đây vẫn là cùng họ mô
hình ngoài API thật — số thật qua API là điều kiện của phiên nghiệm thu (Hỏi-1).

## 5. Đối chiếu ngành (ADR-0022)

| | Flatfile | OneSchema | Ivandt | Quỹ hàng (hàng này) |
| --- | --- | --- | --- | --- |
| Gợi ý ghép cột bằng AI | Có, học từ quyết định ghép trước | Có (AI-suggested mappings) | Có | Có, chỉ cho cột bộ nhớ và từ điển chưa biết |
| Gửi gì cho mô hình | Không công bố | Không công bố | Chỉ tiêu đề | Tiêu đề + hình dạng mọi cột; giá trị chỉ của cột mã căn, giá, phí, trạng thái chưa ghép |
| Người duyệt trước khi nhập | Bước xác nhận ghép | Có | Độ tin thấp về màn duyệt | Mọi đề xuất phải được duyệt |
| Nhớ ghép đã duyệt | Có | Có (lịch sử ghép) | — | Có (mẫu đã nhớ, hàng 67) |

RESO: đích ghép là trường chuẩn đã theo RESO Data Dictionary (`UnitNumber`, `BuildingName`, `LivingArea`…) — hàng này không
thêm trường. Nguồn tra 05/11: trang sản phẩm Flatfile (mapping), nhật ký thay đổi OneSchema (AI suggested mappings), tài
liệu Ivandt (import process).

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: Nhập Excel → thả file → «Máy đang đề xuất cách ghép…» → bước Ghép cột hiện các cột «Máy đề xuất» kèm lý do →
  người bấm «Đồng ý» từng cột hay «Đồng ý mọi đề xuất (N)» → Xem trước → ghi (điểm ra: bước Tóm tắt như hàng 65).
- Biên: sàn chưa bật AI hay file không có cột chưa ghép → không gọi, màn như hàng 65; mẫu đã nhớ khớp trọn → không gọi.
- Lỗi & quay lại: hết trần, thiếu khoá, nhà cung cấp lỗi, quá giờ, bị chặn vì dữ liệu cá nhân → một dòng báo trong bước
  Ghép cột nói lý do, cột chưa ghép để người ghép tay như hàng 65; người sửa một đề xuất bằng ô chọn đích như cũ.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
| --- | --- | --- |
| Nhập Excel — bước Ghép cột | Duyệt cách máy ghép từng cột | Tải tệp / Xem trước |
| Cài đặt › Sàn › Xử lý bằng AI (`/settings/ai`, mục mới cuối cột Sàn — Hỏi-2) | Quản trị sàn bật, tắt và xem đã dùng bao nhiêu | Cột Cài đặt / — |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
| --- | --- | --- | --- |
| ST-ghep-dang-de-xuat | Ghép cột | Dải «Máy đang đề xuất cách ghép…»; nút Tiếp khoá | Chờ (≤ 240 giây) |
| ST-ghep-cho-duyet | Ghép cột | Huy hiệu «Máy đề xuất» + lý do dưới từng cột; dải «Còn N cột máy đề xuất chưa duyệt» + nút «Đồng ý mọi đề xuất (N)»; Tiếp khoá | Đồng ý hay sửa |
| ST-ghep-da-duyet | Ghép cột | Huy hiệu «Đã đồng ý» thay «Máy đề xuất»; Tiếp mở | Sang Xem trước |
| ST-ghep-tat-dinh | Ghép cột | Dải một dòng: «Chưa dùng được AI: <lý do> — ghép tay các cột còn lại» | Ghép tay |
| ST-ai-tat | Cài đặt › Sàn | Công tắc «Xử lý bằng AI» tắt + một câu gửi gì, không gửi gì | Bật |
| ST-ai-bat | Cài đặt › Sàn | Công tắc bật; «Tháng này đã dùng X / Y USD» | Tắt |
| ST-ai-het-tran | Cài đặt › Sàn | Như bật + «Đã hết trần tháng này — nhập đang chạy không AI» | Nâng trần ở mục Trần (hàng sau) hay chờ tháng sau |
| ST-ai-loi | Cài đặt › Sàn | «Chưa đọc được trạng thái AI» + Thử lại | Thử lại |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Tiếp ở bước Ghép cột khoá khi còn đề xuất chưa duyệt — không có đường đi tắt từ đề xuất sang ghi.
- Đổi đích một cột máy đề xuất = người chọn (huy hiệu mất, lý do thành «người chọn ở bước ghép cột» như hàng 65).
- Khổ 1440 và 375: huy hiệu và lý do xuống dòng dưới tiêu đề cột, không cắt chữ.

### 5. Xuất xứ component

| Component | Nấc | Vì sao |
| --- | --- | --- |
| `BangGhepCot` (solution-crm-6, khuôn KhungNhap) | mở rộng | Thêm huy hiệu và dòng lý do cạnh ô chọn đích đã có |
| `Badge` biến thể `-light` | dùng | Huy hiệu trạng thái theo luật ReUI của kho |
| `Alert` | dùng | Dải báo cùng nếp «Có cột chưa ghép được» |
| `Switch` + khối cài đặt có sẵn | dùng | Công tắc theo nếp trang Cài đặt hợp nhất |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: wizard
Căn cứ: màn Nhập Excel đã là luồng nhiều bước (`bo_cuc: luong-nhieu-buoc`, `design/patterns/nhap-excel.md`); hàng này chỉ
thêm trạng thái vào bước Ghép cột, không thêm bước.

### 7. Thẻ việc

| Trường | Giá trị |
| --- | --- |
| Ai dùng | Đầu chủ, Trưởng nhóm (nhập); Quản trị sàn (bật / tắt) |
| Việc chính | Đưa bảng hàng cũ của sàn vào Quỹ hàng mà không ghép tay từng cột |
| Tần suất | hiếm |
| Số bản ghi | hàng trăm trở lên |
| Thiết bị | máy tính |
<!-- UX-SPEC-TEMPLATE>>> -->

## 6. Ranh giới mã (khai ở Cổng Phạm vi)

Lời giao: `packages/api/src/imports/ai/**`, `packages/core/src/agreements.ts`, `packages/db/migrations/035_*.sql`,
`apps/web/src/app/(app)/imports/**`, `packages/api/test-db/imports/**`, `_acceptance/nhap-tac-tu-ke-hoach/**`. Khai thêm:
`packages/core/src/import/ai/**` (gói, kiểm, gộp — dùng chung trình duyệt và máy chủ), `packages/core/src/agreements.test.ts`,
`packages/api/src/imports/routes.ts` (một dòng đăng ký), `packages/api/src/app.ts` (một khoá `deps`, luật 12 chỉ thêm),
`packages/db/tests/isolation.test.mjs` (ca cách ly `ai_usage`), `apps/web/src/lib/nhap/**` (gọi và gộp đề xuất),
`apps/web/src/components/khoi/solution-crm-6/**` (huy hiệu, lý do), `apps/web/src/app/(app)/settings/ai/**` (trang mục
mới dựng `MucCaiDat` — Hỏi-2), `apps/web/src/app/(app)/settings/cai-dat.ts` và `cai-dat.test.ts` (thêm mục thứ tám vào cột Sàn),
`apps/web/src/components/shell/second-column.tsx` (biểu tượng của mục), `docs/product/tham-chieu.md` (Sổ quyết định, danh sách mục §9 — luật 6 của đợt). Mục «Mẫu nhập» (`settings/templates`) là màn của hàng 50, dãy L — hàng
này không chạm (giám sát góp vào G-22).
