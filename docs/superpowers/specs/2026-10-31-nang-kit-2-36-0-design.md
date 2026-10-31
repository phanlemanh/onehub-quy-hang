# Nâng kit nghiệm thu lên 2.36.0 và bật các nấc có căn cứ — thiết kế

Ngày 31/10 · hồ sơ `_acceptance/nang-kit-2-36-0/` · hạng T3 (rào của kho, AGENTS.md «Cổng nghiệm thu»).

## 1. Vì sao

Chủ kho đã cài kit 2.36.0 trên máy (kiểm bản cài `--may --ref v2.36.0`: ĐẠT 34 bản ghi; kiểm cách ly `--ref v2.36.0`:
ĐẠT 8/8). CI của kho còn lấy kit `v2.35.0`, nên máy dev và CI đang chấm theo hai bản. Đợt Điều phối kế (`nen-2`) mở bằng
kit 2.36.0, nên thay đổi này phải gộp trước khi mở đợt. Chủ kho muốn kho dùng mọi nấc kit mới hỗ trợ ở mức cao nhất có
căn cứ, và ràng buộc số một của chủ kho là ít lần gọi người (CLAUDE.md cá nhân: «Ràng buộc số 1 là TẦN SUẤT gọi người»).

## 2. Hiện trạng đo ngày 31/10

| Nấc kit cung cấp | Kho đang ở | Căn cứ đo |
| --- | --- | --- |
| CI chạy cổng từ bản kit ghim (GUIDE §5.3, đường mặc định) | Đã ở — job `gate` lấy kit theo `KIT_TAG`, không chép tệp kit | `.github/workflows/ci.yml` |
| Lớp chép CI (danh sách `GUIDE-CI-COPY-LIST`) | Không áp — kho không chép tệp nào của kit | không có `lib/`, `scripts/product-map.mjs` trong kho |
| Đường lệnh không số trong `config.yaml` | Đã ở — mọi lệnh kit đi qua `CLAUDE_PLUGIN_ROOT` hoặc `tim-kit.mjs` (đọc sổ cài) | grep: không đường `…/acceptance-gate/<số>/…` |
| `KIT_TAG` của CI | `v2.35.0` | ci.yml dòng 83 |
| `.gitattributes` tệp sinh (`GITATTR-TEP-SINH`) | Chưa có tệp `.gitattributes` | — |
| Lộ trình nấc 1–3 (cờ vàng, tệp lộ trình, tự nối) | Đã ở — gói `road-map` bật ở `.claude/settings.json`, `lo_trinh.tep` khai, 53 hàng | `docs/plan/lo-trinh.json` |
| Lộ trình nấc 4 (`lo_trinh.chan`) | Tắt | config.yaml |
| Tự áp chính sách lộ trình (`chinh_sach.tu_ap`) | Không áp được — lộ trình chưa có mốc phát hành nào | `moc: []` |
| Cửa tín hiệu (`tin_hieu`) | Tắt | — |
| `gap_probe` | `advisory` | config.yaml |
| Máy tự định tuyến mục ngoài hợp đồng (`feature_loop.ngoai_n_tu_dinh_tuyen`) | Tắt (khoá vắng) | — |
| `executors.design.floor` + sàn thiết kế | M1 (89 tệp khớp `surface_globs`); chưa khai `design_floor.tokens`/`registry` | `design-floor-bac.mjs` |
| `executors.design.static`/`gate` | Không có lệnh quét riêng của kho | — |
| `capture.ui` | Không khai | — |
| Bỏ job nặng cho PR không chạm vật (`--hang-pr`) | Không dùng | ci.yml |
| Khoá tinh chỉnh làn ghim lại (`repin_retry`, `repin_budget_min`, `repin_ci_blank_env`, `do_san_tren_nen`, `repin_parallel_suites`) | Không khai | — |
| Tri thức (`tri_thuc`), Điều phối (`dieu_phoi`), design-pass | Đã bật | config.yaml |

Thử trên cây `origin/main` với kit 2.36.0: `product-map.mjs --check` khớp cả hai tệp; lưới trước-gộp `--base origin/main`
sạch. Bật thử `gap_probe: required` và `lo_trinh.chan: true` rồi chạy lưới trên toàn lịch sử: không thêm vi phạm gap-probe
nào (10/10 hồ sơ T2/T3 đều có `gap-probe.md`); luật chặn lộ trình chỉ gọi tên `doi-ten-api-tieng-anh` — hồ sơ cũ, lưới
với base của PR không bao giờ chấm lại nó.

## 3. Cấu hình đích

**Bật trong PR này**

1. `KIT_TAG: v2.36.0` — CI chấm cùng bản với máy dev. Giá: không.
2. Hai dòng `GITATTR-TEP-SINH` vào `.gitattributes`, và lệnh `git config merge.tep-sinh.driver true` nối vào script
   `prepare` của `package.json` (chạy ở mỗi `npm install`), nên mọi bản clone tự có driver — không phải nhớ chạy tay.
   Căn cứ: hai tệp sinh là chỗ dừng gỡ tay lặp lại ở các kho tiêu thụ (CHANGELOG 2.36.0, TC3); kho này đang chạy đợt
   nhiều dãy gộp nối tiếp. Giá: không phút CI; GitHub web vẫn báo xung đột ở hai tệp (cố ý của kit), lần gộp đầu của PR
   cắt trước khi nhánh có hai dòng vẫn xung đột.
3. `gap_probe: required`. Căn cứ: 10/10 hồ sơ T2/T3 của kho đã có phản biện context sạch; GUIDE: «nâng `required` khi
   đội đã quen». Giá: PR có hồ sơ T2/T3 đã làm xong mà thiếu `gap-probe.md` (và không có dòng sổ «bỏ gap-probe») bị chặn
   gộp. Đường đảo: hạ về `advisory`.
4. `lo_trinh.chan: true` (nấc 4, ADR-0025 của kit). Căn cứ: kho đã cam kết lộ trình (gói `road-map` bật cho cả đội, 53
   hàng, đợt mở theo hàng); điều kiện bật của ADR-0025 — sau khi có nấc 1 và 3 vẫn còn ≥ 1 hồ sơ mới không nối hàng — đã
   đạt ở kho này (`doi-ten-api-tieng-anh`). Giá: mở hồ sơ mới ngoài lộ trình bị chặn lúc ghi và lúc gộp; mở vòng bằng câu
   mô tả thì feature-loop tự thêm hàng (không thêm lượt gọi người). Hồ sơ cũ không bị chấm. Đường đảo: `chan: false`.
5. `feature_loop.ngoai_n_tu_dinh_tuyen: true`. Căn cứ: ràng buộc số một của chủ kho là ít lần gọi người; trong 57 lần chủ
   kho định tuyến mục ngoài hợp đồng ở Cổng Bằng chứng, 50 là «ghi Known limits», 3 «chấp nhận», 4 «mở hợp đồng mới» —
   cùng hướng với đề xuất của máy (81 known-limits · 8 wont-fix · 5 new-contract trong các báo cáo). Máy chỉ tự ghi cho
   hồ sơ T2 · PASS · 0 UNCERTAIN, chỉ mục chính nó đề xuất known-limits/wont-fix; T3 và «mở hợp đồng mới» vẫn của người.
   Giá: chủ kho không còn được hỏi từng mục đó ở T2 — đảo bằng lệnh in sẵn ở thẻ.
6. Thêm `.gitattributes` vào `risk_tiers.t3_paths`. *(Bản đầu thêm cả `_acceptance/config.yaml`; lượt chấm 1 cho thấy lưới
   gộp bỏ qua mọi tệp hồ sơ trước khi đối chiếu nên dòng ấy không chặn gì, còn hầu hết vòng đều thêm lệnh kiểm vào tệp
   ấy nên sẽ bị suy T3 và mất định tuyến máy — chủ kho chọn bỏ dòng ở Cổng Bằng chứng, Ngoài-1. Đổi cấu hình nghiệm thu
   chỉ được canh bằng việc chủ kho duyệt PR — giới hạn đã biết.)* Lý do ban đầu: Căn cứ: AGENTS.md xếp rào của kho vào
   T3, nhưng hôm nay máy suy T2 cho chính việc đổi rào này; khi máy tự định tuyến (mục 5) chỉ chạm hồ sơ T2, một việc
   đổi rào bị suy T2 sẽ lọt qua mà chủ kho không được hỏi (phản biện P1). Giá: việc đổi cấu hình nghiệm thu sau này đi
   T3 — thêm một lần duyệt kế hoạch.
7. Vẽ lại `PRODUCT-MAP.md` và `LO-TRINH.html` bằng kit 2.36.0; thêm một hàng lộ trình cho chính việc này (luật chặn vừa
   bật đòi hồ sơ mới thuộc một hàng).

**Không bật — lý do**

- Cửa tín hiệu (`tin_hieu`): chưa có người gửi nào ngoài chủ kho và đợt (yêu cầu của thợ đã đi qua hộp thư của đợt); chưa
  có nút «Gửi tín hiệu» trong sản phẩm. Bật khi có người dùng thử gửi ý.
- Tự áp chính sách lộ trình: cần mốc phát hành có ngày — đó là quyết sản phẩm, không phải cấu hình kit.
- Sàn thiết kế M2 (`design_floor.tokens` + `registry`): cần dựng tệp token và danh mục thành phần từ bộ chuẩn — là việc
  dựng, không phải bật khoá. Ở M1 S4 đã chặn mã màu thô.
- `--hang-pr`: mỗi lượt CI khoảng 4 phút máy, 11/19 PR đã gộp chạm vật; muốn bỏ job phải đổi job `ci-ok` nhận «bỏ qua» —
  thêm rủi ro cho check bắt buộc duy nhất mà không có áp lực phút đo được.
- `capture.ui`, `executors.design.static`/`gate`: ảnh giao diện đã do eval ui-check chụp; kho không có lệnh quét riêng.
- Khoá tinh chỉnh làn ghim lại: chỉ bật khi có số đo (ca chập chờn, lượt vượt trần) — kho chưa có.

## 4. Phạm vi thay đổi

`.github/workflows/ci.yml` (một dòng) · `.gitattributes` (mới) · `package.json` (`prepare`) · `_acceptance/config.yaml`
(ba khoá + một executor cho bài đo của vòng) · `docs/plan/lo-trinh.json` (một hàng) · `PRODUCT-MAP.md`, `LO-TRINH.html`
(vẽ lại) · `AGENTS.md` (mục «Rào của kho») · `docs/product/tham-chieu.md` §12 · hồ sơ và bài đo
`_acceptance/nang-kit-2-36-0/thu/`.

Không chạm mã sản phẩm, cơ sở dữ liệu hay bất biến nào của AGENTS.md.

## 5. Đo thế nào

Một tệp bài đo `_acceptance/nang-kit-2-36-0/thu/nac.test.mjs` (node:test), mỗi nấc một cặp hai chiều trên cùng dựng thử:

- tệp sinh: kho git tạm chép `.gitattributes` của kho; hai nhánh sửa khác nhau `PRODUCT-MAP.md`; có driver → gộp không
  xung đột; bỏ cấu hình driver → gộp dừng ở `PRODUCT-MAP.md`.
- gap-probe bắt buộc: worktree tạm ở HEAD, xoá `gap-probe.md` của hồ sơ này → lưới trước-gộp in `VIOLATION
  [nang-kit-2-36-0]` về phản biện; HEAD nguyên → không dòng đó.
- chặn lộ trình: worktree tạm, thêm hồ sơ thử không nối hàng → luật chặn gọi tên nó; hồ sơ thử ghi `lo_trinh_ma` của một
  hàng có thật → sạch; hồ sơ của vòng này → sạch.
- định tuyến máy: bên ghi `dinh-tuyen-may.cjs --check` đọc khoá là bật; bản sao config đặt `false` → «tắt».

Kit lấy từ `CLAUDE_PLUGIN_ROOT`, vắng thì từ sổ cài qua `packages/ui-lint/tim-kit.mjs` (cùng cách `san_m1`).

## 6. Rủi ro

- PR này đổi luật chặn trong khi đợt `nen-dau` còn chạy: chỉ gộp sau khi giám sát báo đợt đã đóng (đã đóng 31/10), sau
  PR #21, trước PR #15 (gói `nen-2`). Gói `nen-2` mở hồ sơ từ các hàng có trong lộ trình. **Đo 31/10** — gộp nhánh PR #15
  (`bce8d1d`) vào bản sao tạm của nhánh này: `PRODUCT-MAP.md` và `LO-TRINH.html` gộp không dừng (driver chạy đúng); tệp lộ
  trình xung đột vì cả hai nhánh cùng thêm hàng vào cuối — gỡ bằng cách giữ hàng của cả hai. Sau gộp: luật chặn lộ trình
  thoát 0, năm hồ sơ của `nen-2` đều nối hàng; lưới trước-gộp không gọi tên hồ sơ nào của `nen-2`.
- `prepare` đổi cấu hình git của bản clone: chỉ thêm một khoá driver, đảo bằng `git config --unset merge.tep-sinh.driver`.
