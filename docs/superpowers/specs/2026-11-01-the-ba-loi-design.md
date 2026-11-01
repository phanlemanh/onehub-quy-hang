# Trang ba lối — thiết kế

Hàng 84 `the-ba-loi` (dãy G, CK1 của bản phạm vi cổng chọn khối). Căn cứ: ADR-0019 quyết định 1, 2, 5 và «Hệ quả»
(«Bộ đối chiếu có thêm chế độ ba lối»); ô cơ hội `_acceptance/the-ba-loi/opportunity.md` (Cổng Đáng: build, Manh Phan).
Đứng trên hàng 83 (danh mục khối, «Chỗ hở» đủ năm ô). Vật thử: trang ba lối dựng tay của hàng 17
(`_acceptance/cot-ho-so-can/ba-loi/`) và hàng 27 (`_acceptance/lead-bon-nac/ba-loi/`).

## 1. Vấn đề

- Hai vòng đầu đi trang ba lối (17, 27) dựng trang bằng tay: mỗi vòng tự viết HTML, tự đặt tên ảnh, tự chọn chỗ ghim lời
  khuyên. Không gì bảo đảm ba cột đủ, ảnh cùng khổ, cột rỗng ghi «không có» kèm điều đã tra.
- Không bài nào nói một vòng **phải** có trang ba lối: `design-pass.md` ghi `divergence: skipped` ở màn đầu nhóm mới vẫn
  xanh — đúng chỗ hở ADR-0019 đóng.
- Luật «ô chưa có khuôn» và khoá `divergence: opened` mới nằm trong ADR, chưa ở luật giao diện, skill hay `vo-va-ia.md`.

## 2. Cách làm

### 2.1 Chế độ ba lối của bộ đối chiếu

Thêm vào `packages/ui-lint/doi-chieu.mjs` (lõi đọc/kiểm/dựng ở `packages/ui-lint/lib/ba-loi.mjs`, dùng chung với kiểm
chuẩn):

- `--ba-loi --slug <slug>` — kế hoạch: in sáu ảnh phải chụp, `<lối>-<khổ>.png` trong `_acceptance/<slug>/ba-loi/`, lối
  theo thứ tự cố định `trong-kho` · `reui` · `ve-moi`, khổ 1440 và 375 (`KHO` sẵn có). Chưa có `ba-loi.json` thì ghi
  khung trống; có rồi thì không đè.
- `ba-loi.json` — chữ của trang:
  `{ "man": "<tên màn>", "khuyen": { "loi": "<lối>", "ly_do": "<một câu>" }, "loi": { "<lối>": { "nhan": "<khối hay
  khuôn>", "dong_co": "<một câu>", "danh_doi": "<một câu>" } | { "khong_co": true, "da_tra": "<điều đã tra>" } } }`.
- `--dung-ba-loi <slug>` — kiểm rồi ghép `ba-loi/index.html`. Đỏ (mã 1, không ghi trang) với mỗi dòng
  `ba lối «<lối>»: <điều sai>` khi: lối vắng; lối có ứng viên mà thiếu `nhan`/`dong_co`/`danh_doi` hay thiếu ảnh; ảnh
  không phải PNG hay rộng khác khổ của nó (đọc IHDR); lối «không có» mà thiếu `da_tra`; `khuyen.loi` không phải một trong
  ba lối, trỏ lối «không có», hay `ly_do` rỗng; `man` rỗng. `ba-loi.json` vắng hay không đọc được → mã 2.
- Trang: tiêu đề «Ba lối · <màn>»; lời khuyên ghim đầu trang (`data-khuyen`); ba `section[data-loi]` đúng thứ tự, cột
  khuyên đánh dấu; mỗi cột có ứng viên: nhãn, ảnh 1440 + 375, động cơ, đánh đổi; cột «không có»: chữ «không có» và «Đã
  tra: …», không ảnh. Ảnh nhúng base64 như trang đối chiếu — trang tự chứa, gửi một tệp kèm thẻ. Token sáng/tối, khổ
  điện thoại một cột. Dựng tất định: cùng đầu vào cho cùng chuỗi.

### 2.2 Bài «ô chưa có khuôn»

`doi-chieu.mjs --kiem-ba-loi --base <ref> --slug <slug> [--den <ref>]` (vắng `--den` thì so cây làm việc). Vòng chạm ô
chưa có khuôn (ADR-0019 quyết định 2) khi so `<ref>`:

1. **nhóm mới** — một tệp `design/patterns/<nhóm>.md` có ở đầu mà không có ở `<ref>`;
2. **đổi khối đích** — một dòng của bảng §2 `vo-va-ia.md` (cùng ô «Màn») đổi ô «Khối đích»;
3. **chỗ hở mới** — một dòng bảng §3 «Chỗ hở» có «Chỗ» không có ở `<ref>` (đổi cột, sửa chữ của dòng cũ không tính).

Không có điều nào → in «ba lối: vòng không chạm ô chưa có khuôn — không cần trang», mã 0, bất kể `design-pass.md` ghi
gì. Có → in mỗi điều một dòng `ô chưa có khuôn: <loại> <tên>`, rồi đỏ (mã 1) khi `design-pass.md` của hồ sơ vắng, hay
khoá `divergence:` không mở đầu bằng `opened`, hay trang ba lối không qua bài kiểm 2.1, hay `ba-loi/index.html` khác bản
dựng lại từ `ba-loi.json` (sửa tay sau khi dựng).

Bài chạy ở bước chấm của vòng giao diện, cạnh `ban-do-khuon.mjs --base` — giống bộ đối chiếu, không ở CI mỗi PR (căn cứ
ADR-0019 «Hệ quả»).

### 2.3 Răng trên cây (bước cuối `npm run lint`)

`kiem-chuan.mjs` thêm `kiemBaLoi`: mọi hồ sơ có `design-pass.md` khai `divergence: opened` phải có `ba-loi/index.html`;
hồ sơ có `ba-loi/ba-loi.json` thì trang phải qua bài 2.1, và — khi hồ sơ chưa ký — khớp bản dựng lại. Hồ sơ `signed-off` /
`machine-cleared` không bị so bản dựng lại: đổi mẫu trang về sau không làm đỏ hồ sơ đã ký mà kit cấm sửa. Hai trang dựng tay của 17 và 27 (không
`ba-loi.json`) qua vế một, không bị vế hai đòi. Dòng đầu ra `ba lối: <n> trang · <k> dựng bằng lệnh`.

### 2.4 Luật cho người và tác tử

- `.claude/rules/giao-dien.md` và `vo-va-ia.md` §2: định nghĩa «ô chưa có khuôn» (ba điều 2.2), khi đó bước phân kỳ
  `design-pass` mở (`divergence: opened`) với ba lối tên cố định, trang ba lối gửi kèm thẻ Cổng Phạm vi; màn đi khuôn sẵn
  thì `skipped` hợp lệ; khối đích §2 là khuyến nghị đầu vào cho lối ReUI.
- Skill `quy-hang-ui` «Vòng giao diện qua bản đồ khuôn»: bước thiết kế dựng trang bằng `--ba-loi` → chụp → điền
  `ba-loi.json` → `--dung-ba-loi`; bước chấm chạy `--kiem-ba-loi`.

### 2.5 Trang mẫu

S3 dựng trang mẫu từ ảnh và chữ của trang tay hàng 17 vào `_acceptance/the-ba-loi/evidence/ba-loi-mau.html` — vật để
chấm ui-check (1440 và 375, sáng và tối) và để người ký mở ở Cổng Bằng chứng.

## 3. Ngoài phạm vi

- Nhu cầu trích từ câu giao, thước chấm chung, dữ liệu ca xấu nhất (CK5) — mục chờ H17.
- Ảnh trạng thái thêm (trống, đang tải, lỗi) trên trang ba lối — hàng 27 dựng thêm bằng tay; trang của lệnh chỉ trạng thái
  mặc định.
- Chạy bài «ô chưa có khuôn» ở CI mỗi PR.
- Dựng lại hai trang tay của 17 và 27 bằng lệnh — hồ sơ đã ký, không sửa.
- Đổi khối đích ngoài bảng §2 (ví dụ chỉ sửa mã) — bài không thấy.

## Đặc tả UX

Bỏ — hàng không chạm màn của `apps/web`; trang ba lối là tệp tài liệu gửi kèm thẻ, chấm bằng eval judgment trên trang mẫu.
